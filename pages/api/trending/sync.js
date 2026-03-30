import dbConnect from "../../../lib/mongodb";
import { TrendingTopic, TrendingMovie, TrendingActor } from "../../../model/trending";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";
import axios from "axios";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    console.log("🚀 Starting Trending Data Sync...");

    // 0. Decay existing trending scores (reduce by 20% every sync to let old trends fade)
    await Article.updateMany({ trendingScore: { $gt: 0 } }, { $mul: { trendingScore: 0.8 } });
    await Celebrity.updateMany({ trendingScore: { $gt: 0 } }, { $mul: { trendingScore: 0.8 } });

    const trends = [];

    // 1. Fetch Google Trends (Daily Trends RSS - India)
    try {
      const googleTrendsRes = await axios.get("https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN");
      const rssText = googleTrendsRes.data;
      
      const titles = rssText.match(/<title>(.*?)<\/title>/g) || [];
      const traffic = rssText.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/g) || [];
      
      titles.slice(1).forEach((tag, i) => { 
        const title = tag.replace(/<\/?title>/g, '');
        const volumeStr = traffic[i] ? traffic[i].replace(/<\/?ht:approx_traffic>/g, '').replace(/,/g, '').replace('+', '') : "1000";
        trends.push({
          title,
          score: parseInt(volumeStr),
          source: 'google'
        });
      });
    } catch (err) {
      console.error("❌ Google Trends Sync Failed:", err.message);
    }

    // 2. Fetch YouTube Trending (Movies/Entertainment)
    const YT_API_KEY = process.env.YOUTUBE_API_KEY;
    if (YT_API_KEY) {
      try {
        const ytRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
          params: {
            part: 'snippet,statistics',
            chart: 'mostPopular',
            regionCode: 'IN',
            videoCategoryId: '24', // Entertainment
            maxResults: 10,
            key: YT_API_KEY
          }
        });

        ytRes.data.items.forEach(item => {
          trends.push({
            title: item.snippet.title,
            score: parseInt(item.statistics.viewCount) / 1000, // Normalize score
            source: 'youtube'
          });
        });
      } catch (err) {
        console.error("❌ YouTube Trends Sync Failed:", err.message);
      }
    }

    // 3. Process & Classify Trends with TMDB
    console.log(`🧹 Processing ${trends.length} raw trend signals...`);
    const TMDB_API_KEY = process.env.TMDB_API_KEY;

    for (const trend of trends) {
      const cleanTitle = trend.title
        .replace(/Official Trailer|Teaser|Full Movie|HD|202[0-9]/gi, '')
        .trim();

      if (cleanTitle.length < 2) continue;

      // STORE Topic
      await TrendingTopic.findOneAndUpdate(
        { title: cleanTitle },
        { 
          $set: { source: trend.source, region: 'IN' },
          $inc: { score: trend.score }
        },
        { upsert: true }
      );

      // CLASSIFY & ENRICH with TMDB
      if (TMDB_API_KEY) {
        try {
          // Search Movie
          const movieSearch = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
            params: { api_key: TMDB_API_KEY, query: cleanTitle }
          });

          if (movieSearch.data.results?.length > 0) {
            const movie = movieSearch.data.results[0];
            if (movie.popularity > 10) { 
              // Update TrendingMovie Collection
              await TrendingMovie.findOneAndUpdate(
                { tmdbId: movie.id },
                {
                  $set: {
                    title: movie.title,
                    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    backdrop: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
                    releaseDate: movie.release_date,
                    rating: movie.vote_average
                  },
                  $inc: { trendingScore: trend.score }
                },
                { upsert: true }
              );
              
              // --- NEW: Update Main Article Database ---
              // Try to find the movie in our main database by title or TMDB ID
              await Article.findOneAndUpdate(
                { 
                  $or: [
                    { tmdbId: movie.id },
                    { movieTitle: { $regex: new RegExp(`^${movie.title}$`, 'i') } }
                  ]
                },
                { 
                  $inc: { trendingScore: trend.score },
                  $set: { lastTrendingSync: new Date() }
                }
              );

              await TrendingTopic.updateOne({ title: cleanTitle }, { type: 'movie' });
            }
          }

          // Search Actor/Person
          const personSearch = await axios.get(`https://api.themoviedb.org/3/search/person`, {
            params: { api_key: TMDB_API_KEY, query: cleanTitle }
          });

          if (personSearch.data.results?.length > 0) {
            const person = personSearch.data.results[0];
            if (person.popularity > 5) {
              // Update TrendingActor Collection
              await TrendingActor.findOneAndUpdate(
                { tmdbId: person.id },
                {
                  $set: {
                    name: person.name,
                    image: `https://image.tmdb.org/t/p/w185${person.profile_path}`,
                    profession: [person.known_for_department]
                  },
                  $inc: { trendingScore: trend.score }
                },
                { upsert: true }
              );

              // --- NEW: Update Main Celebrity Database ---
              await Celebrity.findOneAndUpdate(
                { 
                  $or: [
                    { 'heroSection.tmdbId': person.id },
                    { 'heroSection.name': { $regex: new RegExp(`^${person.name}$`, 'i') } }
                  ]
                },
                { 
                  $inc: { trendingScore: trend.score },
                  $set: { lastTrendingSync: new Date() }
                }
              );

              await TrendingTopic.updateOne({ title: cleanTitle }, { type: 'actor' });
            }
          }
        } catch (enrichErr) {
          // console.warn(`Enrichment failed for ${cleanTitle}`);
        }
      }
    }

    console.log("✅ Trending Data Sync Completed!");
    return res.status(200).json({ success: true, message: "Trending data synced and enriched." });

  } catch (error) {
    console.error("CRITICAL Trending Sync Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
