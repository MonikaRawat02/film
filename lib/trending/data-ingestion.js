import axios from "axios";
import googleTrends from "google-trends-api";
import * as cheerio from "cheerio";

const CONFIG = {
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  YOUTUBE_API_URL: "https://www.googleapis.com/youtube/v3/videos",
  GOOGLE_TRENDS_RSS: "https://trends.google.com/trending/rss",
  TMDB_API_KEY: process.env.TMDB_API_KEY,
  TMDB_API_URL: "https://api.themoviedb.org/3",
};

function parseFormattedTraffic(str) {
  if (!str || typeof str !== "string") return 0;
  const s = str.replace(/\+/g, "").trim().toUpperCase();
  const num = parseFloat(s.replace(/[KM]/g, "").replace(/,/g, "")) || 0;
  if (s.endsWith("M")) return Math.round(num * 1_000_000);
  if (s.endsWith("K")) return Math.round(num * 1_000);
  return Math.round(num);
}

/**
 * Clean title for better matching
 */
function cleanTitle(title) {
  if (!title) return "";
  let clean = String(title);

  // Remove common noise
  const noisePatterns = [
    /official\s+(trailer|teaser|video|lyrical)/gi,
    /\|\s*(official|trailer|teaser|movie|film|4k|hd)/gi,
    /\-\s*(official|trailer|teaser|movie|film)/gi,
    /\([^\)]*(trailer|teaser|4k|hd|202[0-9])\)/gi,
    /trailer|teaser|official|full movie|movie clip|scene|reaction|review/gi,
    /(4k|hd|1080p|720p|bluray|dvd)/gi,
    /(lyrical|video song|audio|juke box)/gi,
    /(first look|poster|teaser launch)/gi,
    /[\(\)\[\]\{\}]/g,
  ];

  for (const pattern of noisePatterns) {
    clean = clean.replace(pattern, ' ');
  }

  // Split by separators and take first meaningful part
  const separators = ['|', '-', ':', '–', '—', '•', '★', '☆'];
  for (const sep of separators) {
    if (clean.includes(sep)) {
      const parts = clean.split(sep);
      const validParts = parts.filter(p => p.trim().length > 3);
      if (validParts.length > 0) {
        clean = validParts[0];
        break;
      }
    }
  }

  clean = clean.replace(/\s+/g, ' ').trim();

  // Limit length
  if (clean.length > 100) {
    clean = clean.substring(0, 100);
  }

  return clean;
}

/**
 * Enhanced region-based filtering
 */
function filterByRegion(trends, region) {
  return trends.filter(trend => {
    const title = trend.title?.toLowerCase() || '';
    const cleanTitle_str = cleanTitle(title).toLowerCase();

    if (region === "US") {
      // Hollywood content indicators
      const hollywoodKeywords = [
        'hollywood', 'netflix', 'amazon prime', 'disney+', 'hbo', 'apple tv+',
        'paramount+', 'peacock', 'hulu', 'marvel', 'dc', 'pixar', 'dreamworks',
        'universal', 'warner bros', 'paramount', 'sony pictures', '20th century'
      ];

      // Indian content to exclude
      const indianKeywords = [
        'bollywood', 'tollywood', 'kollywood', 'mollywood', 'sandalwood',
        'hindi', 'tamil', 'telugu', 'malayalam', 'kannada', 'bhojpuri',
        'punjabi', 'marathi', 'gujarati', 'bengali', 'dharma', 'yrf', 'rajshri'
      ];

      // Check if it's Hollywood content
      const isHollywood = hollywoodKeywords.some(keyword =>
        title.includes(keyword) || cleanTitle_str.includes(keyword)
      );

      // Check if it's Indian content
      const isIndian = indianKeywords.some(keyword =>
        title.includes(keyword) || cleanTitle_str.includes(keyword)
      );

      // Check if title has non-ASCII characters (likely non-English)
      const hasNonASCII = /[^\x00-\x7F]/.test(title);

      // Keep if: Hollywood related OR (English AND not Indian)
      return isHollywood || (!hasNonASCII && !isIndian);

    } else {
      // Bollywood/Indian content indicators
      const indianKeywords = [
        'bollywood', 'tollywood', 'kollywood', 'mollywood', 'sandalwood',
        'hindi', 'tamil', 'telugu', 'malayalam', 'kannada', 'bhojpuri',
        'punjabi', 'marathi', 'gujarati', 'bengali', 'dharma', 'yrf', 'rajshri',
        'prabhas', 'allu arjun', 'vijay', 'rajinikanth', 'amitabh', 'shah rukh'
      ];

      // Hollywood keywords to exclude
      const hollywoodKeywords = [
        'hollywood', 'netflix original', 'hbo max', 'disney+', 'marvel', 'dc'
      ];

      const isIndian = indianKeywords.some(keyword =>
        title.includes(keyword) || cleanTitle_str.includes(keyword)
      );

      const isHollywood = hollywoodKeywords.some(keyword =>
        title.includes(keyword) || cleanTitle_str.includes(keyword)
      );

      const hasNonASCII = /[^\x00-\x7F]/.test(title);

      // Keep if: Indian related OR (has non-ASCII chars AND not Hollywood)
      return isIndian || (hasNonASCII && !isHollywood);
    }
  });
}

/**
 * Fetch TMDB trending for Hollywood content
 */
async function fetchTMDBTrending(region = "US") {
  if (!CONFIG.TMDB_API_KEY || CONFIG.TMDB_API_KEY === "your_tmdb_api_key_here") {
    console.warn("⚠️ TMDB API key is missing. Skipping TMDB Trends.");
    return [];
  }

  try {
    const [movies, people] = await Promise.allSettled([
      axios.get(`${CONFIG.TMDB_API_URL}/trending/movie/day`, {
        params: { api_key: CONFIG.TMDB_API_KEY },
        timeout: 10000
      }),
      axios.get(`${CONFIG.TMDB_API_URL}/trending/person/day`, {
        params: { api_key: CONFIG.TMDB_API_KEY },
        timeout: 10000
      })
    ]);

    const trendingItems = [];

    // Add trending movies
    if (movies.status === 'fulfilled' && movies.value.data?.results) {
      movies.value.data.results.forEach(movie => {
        // For US: English movies only
        // For IN: Indian language movies or high popularity English movies
        const shouldInclude = region === "US"
          ? movie.original_language === "en"
          : ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'pa'].includes(movie.original_language) || movie.popularity > 100;

        if (shouldInclude) {
          trendingItems.push({
            title: cleanTitle(movie.title || movie.name),
            originalTitle: movie.original_title || movie.title,
            source: "tmdb",
            timestamp: new Date().toISOString(),
            traffic: Math.round(movie.popularity * 1000),
            viewCount: Math.round(movie.popularity * 10000),
            type: "trending_movies",
            region: region,
            metadata: {
              tmdbId: movie.id,
              mediaType: "movie",
              popularity: movie.popularity,
              voteAverage: movie.vote_average,
              voteCount: movie.vote_count,
              posterPath: movie.poster_path,
              backdropPath: movie.backdrop_path,
              originalLanguage: movie.original_language,
              releaseDate: movie.release_date,
              overview: movie.overview
            }
          });
        }
      });
    }

    // Add trending people (actors/directors)
    if (people.status === 'fulfilled' && people.value.data?.results) {
      people.value.data.results.forEach(person => {
        // Only include if they're actors/actresses
        if (person.known_for_department === 'Acting') {
          trendingItems.push({
            title: cleanTitle(person.name),
            source: "tmdb",
            timestamp: new Date().toISOString(),
            traffic: Math.round(person.popularity * 1000),
            viewCount: Math.round(person.popularity * 10000),
            type: "trending_actors",
            region: region,
            metadata: {
              tmdbId: person.id,
              mediaType: "person",
              popularity: person.popularity,
              knownForDepartment: person.known_for_department,
              profilePath: person.profile_path,
              knownFor: person.known_for?.slice(0, 3).map(film => ({
                title: film.title || film.name,
                mediaType: film.media_type,
                year: film.release_date || film.first_air_date
              }))
            }
          });
        }
      });
    }

    console.log(`   ✅ Fetched ${trendingItems.length} TMDB trends for ${region}`);
    return trendingItems;

  } catch (error) {
    console.error("❌ TMDB fetch error:", error.message);
    return [];
  }
}

/**
 * Fetch trending topics from Google Trends with region support
 */
export async function fetchGoogleTrends(region = "IN", options = {}) {
  try {
    const timeoutMs = 15000;
    const withTimeout = (p) =>
      Promise.race([
        p,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Google Trends request timed out")), timeoutMs)
        ),
      ]);

    const safeParse = (jsonStr, context = "") => {
      if (!jsonStr || typeof jsonStr !== 'string') return null;
      if (jsonStr.startsWith('<!doctype') || jsonStr.startsWith('<html')) {
        console.warn(`⚠️ Google Trends ${context} returned HTML instead of JSON`);
        return null;
      }
      try {
        const cleaned = jsonStr.startsWith(")]}'") ? jsonStr.substring(5) : jsonStr;
        return JSON.parse(cleaned);
      } catch (e) {
        console.error(`❌ JSON Parse Error for Google Trends ${context}:`, e.message);
        return null;
      }
    };

    let dailyTrends = [];
    try {
      const dailyJson = await withTimeout(googleTrends.dailyTrends({
        geo: region,
        hl: 'en-US'
      }));
      const daily = safeParse(dailyJson, "dailyTrends");
      const days = daily?.default?.trendingSearchesDays || [];
      const searches = days.flatMap((d) => d.trendingSearches || []);

      dailyTrends = searches
        .map((item) => {
          const title = item?.title?.query || "";
          if (!title || title.length < 3) return null;
          const traffic = parseFormattedTraffic(item?.formattedTraffic || "");
          const relatedQueries = (item?.relatedQueries || [])
            .map((rq) => rq?.query)
            .filter(Boolean);
          const image = item?.image?.imageUrl || item?.image?.newsUrl || null;
          return {
            title: cleanTitle(title),
            originalTitle: title,
            source: "google",
            timestamp: new Date().toISOString(),
            traffic: Number.isFinite(traffic) && traffic > 0 ? traffic : 1000,
            relatedQueries,
            image,
            type: detectContentType(title)
          };
        })
        .filter(Boolean);
    } catch (dailyErr) {
      console.warn("⚠️ Google Trends dailyTrends fetch error:", dailyErr.message);
    }

    let realTimeTrends = [];
    if (options.realTime || dailyTrends.length === 0) {
      try {
        const rtJson = await withTimeout(
          googleTrends.realTimeTrends({ geo: region, category: "all", hl: 'en-US' })
        );
        const rt = safeParse(rtJson, "realTimeTrends");
        const stories = rt?.storySummaries?.trendingStories || [];
        realTimeTrends = stories
          .map((s) => {
            const title = s?.title || s?.entityNames?.[0] || "";
            if (!title || title.length < 3) return null;
            const image = s?.image?.imgUrl || s?.image?.newsUrl || null;
            return {
              title: cleanTitle(title),
              originalTitle: title,
              source: "google",
              timestamp: new Date().toISOString(),
              traffic: 1000,
              relatedQueries: [],
              image,
              type: detectContentType(title)
            };
          })
          .filter(Boolean);
      } catch (rtErr) {
        console.warn("⚠️ Google Trends real-time fetch error:", rtErr.message);
      }
    }

    if (dailyTrends.length === 0 && realTimeTrends.length === 0) {
      console.log("🔄 Falling back to RSS feed...");
      try {
        const response = await axios.get(CONFIG.GOOGLE_TRENDS_RSS, {
          params: { geo: region },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });

        const $ = cheerio.load(response.data, { xmlMode: true });
        $("item").each((_, el) => {
          const title = $(el).find("title").text();
          const trafficStr = $(el).find("ht\\:approx_traffic, approx_traffic").text();
          const traffic = parseFormattedTraffic(trafficStr);

          if (title && title.length > 3) {
            dailyTrends.push({
              title: cleanTitle(title),
              originalTitle: title,
              source: "google",
              timestamp: new Date().toISOString(),
              traffic: traffic > 0 ? traffic : 1000,
              relatedQueries: [],
              image: null,
              type: detectContentType(title)
            });
          }
        });
      } catch (rssErr) {
        console.error("❌ Google Trends RSS fallback failed:", rssErr.message);
      }
    }

    const combined = [...dailyTrends, ...realTimeTrends];
    const uniqueTrends = Array.from(
      new Map(combined.map((t) => [t.title.toLowerCase(), t])).values()
    );

    return uniqueTrends;
  } catch (error) {
    console.error("❌ Global Google Trends fetch error:", error.message);
    return [];
  }
}

/**
 * Detect content type from title
 */
function detectContentType(title) {
  const lowerTitle = title.toLowerCase();

  // Movie indicators
  const movieKeywords = [
    'trailer', 'teaser', 'movie', 'film', 'review', 'reaction', 'explained',
    'breakdown', 'ending explained', 'post credit scene', 'box office',
    'collection', 'hit', 'flop', 'blockbuster'
  ];

  // Actor/celebrity indicators
  const actorKeywords = [
    'interview', 'talks about', 'opens up', 'reveals', 'speaks', 'responds',
    'reacts', 'joins', 'signs', 'confirmed', 'announced', 'actor', 'actress'
  ];

  if (movieKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return "trending_movies";
  }

  if (actorKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return "trending_actors";
  }

  return "viral_topics";
}

/**
 * Fetch YouTube trending videos
 */
export async function fetchYouTubeTrending(category = null, region = "IN") {
  if (!CONFIG.YOUTUBE_API_KEY) {
    console.warn("⚠️ YouTube API key is missing. Skipping YouTube Trends.");
    return [];
  }

  try {
    const params = {
      part: "snippet,statistics",
      chart: "mostPopular",
      regionCode: region,
      maxResults: 25,
      key: CONFIG.YOUTUBE_API_KEY
    };

    if (category) {
      const categoryId = getYouTubeCategoryID(category);
      if (categoryId) params.videoCategoryId = categoryId;
    }

    const response = await axios.get(CONFIG.YOUTUBE_API_URL, {
      params,
      timeout: 10000
    });

    if (!response.data || !response.data.items) {
      return [];
    }

    const trends = response.data.items.map(video => ({
      title: cleanTitle(video.snippet.title),
      originalTitle: video.snippet.title,
      source: "youtube",
      timestamp: video.snippet.publishedAt,
      videoId: video.id,
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
      viewCount: parseInt(video.statistics.viewCount) || 0,
      likeCount: parseInt(video.statistics.likeCount) || 0,
      thumbnail: video.snippet.thumbnails?.high?.url || "",
      type: detectYouTubeContentType(video.snippet.title)
    }));

    return trends;
  } catch (error) {
    console.error(`❌ YouTube Trends fetch error:`, error.message);
    return [];
  }
}

function detectYouTubeContentType(title) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('trailer') || lowerTitle.includes('teaser') ||
    lowerTitle.includes('movie clip') || lowerTitle.includes('film scene') ||
    lowerTitle.includes('review') || lowerTitle.includes('reaction')) {
    return "trending_movies";
  }

  if (lowerTitle.includes('interview') || lowerTitle.includes('talks about') ||
    lowerTitle.includes('opens up') || lowerTitle.includes('reveals') ||
    lowerTitle.includes('responds')) {
    return "trending_actors";
  }

  return "viral_topics";
}

function getYouTubeCategoryID(categoryName) {
  const categoryMap = {
    "Film & Animation": "1",
    "Entertainment": "24",
    "Movies": "30"
  };
  return categoryMap[categoryName] || "24";
}

/**
 * Normalize trend data
 */
export function normalizeTrend(trend) {
  return {
    title: trend.title?.trim() || "",
    originalTitle: trend.originalTitle || trend.title,
    source: trend.source || "unknown",
    timestamp: trend.timestamp || new Date().toISOString(),
    traffic: trend.traffic || 0,
    viewCount: trend.viewCount || 0,
    type: trend.type || detectContentType(trend.title),
    entityType: trend.entityType || "topic",
    classificationConfidence: 0.7,
    keywords: trend.relatedQueries || [],
    metadata: {
      relatedQueries: trend.relatedQueries || [],
      image: trend.image || trend.thumbnail || null,
      videoId: trend.videoId || null,
      channelId: trend.channelId || null,
      channelTitle: trend.channelTitle || null,
      tmdbId: trend.metadata?.tmdbId || null,
      popularity: trend.metadata?.popularity || null,
      posterPath: trend.metadata?.posterPath || null,
      overview: trend.metadata?.overview || null
    }
  };
}

/**
 * Fetch trends from all sources with region support
 */
export async function fetchAllTrends(region = "IN") {
  console.log(`\n📊 Fetching ${region === "US" ? "Hollywood" : "Bollywood"} trends...`);
  console.log(`📍 Region: ${region}`);

  const results = await Promise.allSettled([
    fetchGoogleTrends(region, { realTime: true }),
    fetchYouTubeTrending("Film & Animation", region),
    fetchYouTubeTrending("Entertainment", region),
    fetchYouTubeTrending(null, region),
    fetchTMDBTrending(region)
  ]);

  const googleTrends = results[0].status === 'fulfilled' ? results[0].value : [];
  const ytFilmTrends = results[1].status === 'fulfilled' ? results[1].value : [];
  const ytEntTrends = results[2].status === 'fulfilled' ? results[2].value : [];
  const ytGeneralTrends = results[3].status === 'fulfilled' ? results[3].value : [];
  const tmdbTrends = results[4].status === 'fulfilled' ? results[4].value : [];

  const youtubeTrends = [...ytFilmTrends, ...ytEntTrends, ...ytGeneralTrends];

  console.log(`✅ Raw fetch results:`);
  console.log(`   Google Trends: ${googleTrends.length}`);
  console.log(`   YouTube Trends: ${youtubeTrends.length}`);
  console.log(`   TMDB Trends: ${tmdbTrends.length}`);

  // Combine all trends
  let allTrends = [...googleTrends, ...youtubeTrends, ...tmdbTrends];

  // Apply region filtering
  const beforeFilter = allTrends.length;
  allTrends = filterByRegion(allTrends, region);
  console.log(`   After region filter: ${allTrends.length} (removed ${beforeFilter - allTrends.length})`);

  // Log sample of filtered trends for debugging
  if (allTrends.length > 0) {
    console.log(`   Sample trends:`, allTrends.slice(0, 3).map(t => ({
      title: t.title.substring(0, 50),
      source: t.source,
      type: t.type
    })));
  }

  // Normalize and deduplicate
  const normalizedTrends = allTrends
    .map(normalizeTrend)
    .filter(trend => trend.title && trend.title.length > 3);

  const uniqueTrends = Array.from(
    new Map(normalizedTrends.map(t => [t.title.toLowerCase(), t])).values()
  );

  console.log(`🎯 Final unique trends: ${uniqueTrends.length}\n`);

  return uniqueTrends;
}

export default {
  fetchGoogleTrends,
  fetchYouTubeTrending,
  normalizeTrend,
  fetchAllTrends,
  cleanTitle,
  filterByRegion
};