// Trending Data Ingestion Service
// Fetches trends from Google Trends (RSS), YouTube, and other sources
//lib/trending/data-ingestion.js
import axios from "axios";

const CONFIG = {
  // Using the RSS feed which is more stable and less prone to 404/security blocks
  GOOGLE_TRENDS_RSS: "https://trends.google.com/trends/trendingsearches/daily/rss",
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  YOUTUBE_API_URL: "https://www.googleapis.com/youtube/v3/videos",
};

/**
 * Fetch trending topics from Google Trends (via RSS feed)
 */
export async function fetchGoogleTrends(region = "IN") {
  try {
    const response = await axios.get(CONFIG.GOOGLE_TRENDS_RSS, {
      params: { geo: region },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const rssText = response.data;
    const trends = [];
    
    // Parse titles and traffic from RSS using regex
    const titles = rssText.match(/<title>(.*?)<\/title>/g) || [];
    const traffic = rssText.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/g) || [];
    
    // The first <title> is usually the feed title, so we skip it
    titles.slice(1).forEach((tag, i) => { 
      const title = tag.replace(/<\/?title>/g, '');
      const volumeStr = traffic[i] 
        ? traffic[i].replace(/<\/?ht:approx_traffic>/g, '').replace(/,/g, '').replace('+', '') 
        : "1000";

      if (title && title.length > 2) {
        trends.push({
          title: title.trim(),
          source: "google",
          timestamp: new Date().toISOString(),
          traffic: parseInt(volumeStr) || 1000,
          relatedQueries: [], // RSS doesn't provide easy access to related queries
          image: null
        });
      }
    });

    return trends;
  } catch (error) {
    console.error("❌ Google Trends (RSS) fetch error:", error.message);
    return [];
  }
}

/**
 * Fetch trending videos from YouTube
 */
export async function fetchYouTubeTrending(category = "Film & Animation", region = "IN") {
  if (!CONFIG.YOUTUBE_API_KEY || CONFIG.YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY") {
    console.warn("⚠️ YouTube API key is missing or set to placeholder. Skipping YouTube Trends.");
    return [];
  }

  try {
    const response = await axios.get(CONFIG.YOUTUBE_API_URL, {
      params: {
        part: "snippet,statistics",
        chart: "mostPopular",
        videoCategoryId: getYouTubeCategoryID(category),
        regionCode: region,
        maxResults: 25,
        key: CONFIG.YOUTUBE_API_KEY
      },
      timeout: 10000
    });

    if (!response.data || !response.data.items) {
      return [];
    }

    const trends = response.data.items.map(video => ({
      title: video.snippet.title,
      source: "youtube",
      timestamp: video.snippet.publishedAt,
      videoId: video.id,
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
      viewCount: parseInt(video.statistics.viewCount) || 0,
      likeCount: parseInt(video.statistics.likeCount) || 0,
      thumbnail: video.snippet.thumbnails?.high?.url || ""
    }));

    return trends;
  } catch (error) {
    console.error("❌ YouTube Trends fetch error:", error.message);
    if (error.response?.data?.error?.message) {
      console.error("   Reason:", error.response.data.error.message);
    }
    return [];
  }
}

/**
 * Get YouTube category ID by name
 */
function getYouTubeCategoryID(categoryName) {
  const categoryMap = {
    "Film & Animation": "1",
    "Entertainment": "24",
    "Movies": "30"
  };

  return categoryMap[categoryName] || "24"; // Default to Entertainment
}

/**
 * Normalize response into common format
 */
export function normalizeTrend(trend) {
  return {
    title: trend.title?.trim() || "",
    source: trend.source || "unknown",
    timestamp: trend.timestamp || new Date().toISOString(),
    traffic: trend.traffic || 0,
    viewCount: trend.viewCount || 0,
    metadata: {
      relatedQueries: trend.relatedQueries || [],
      image: trend.image || trend.thumbnail || null,
      videoId: trend.videoId || null,
      channelId: trend.channelId || null,
      channelTitle: trend.channelTitle || null
    }
  };
}

/**
 * Fetch trends from all sources
 */
export async function fetchAllTrends(region = "IN") {
  console.log("📊 Fetching trends from all sources...");

  const [googleTrends, ytFilmTrends, ytEntTrends, ytMovieTrends] = await Promise.all([
    fetchGoogleTrends(region),
    fetchYouTubeTrending("Film & Animation", region),
    fetchYouTubeTrending("Entertainment", region),
    fetchYouTubeTrending("Movies", region)
  ]);

  const youtubeTrends = [...ytFilmTrends, ...ytEntTrends, ...ytMovieTrends];

  console.log(`✅ Fetched ${googleTrends.length} from Google, ${youtubeTrends.length} from YouTube (across 3 categories)`);

  // Combine and normalize
  const allTrends = [...googleTrends, ...youtubeTrends]
    .map(normalizeTrend)
    .filter(trend => trend.title.length > 2);

  // Remove duplicates by title
  const uniqueTrends = Array.from(new Map(allTrends.map(t => [t.title.toLowerCase(), t])).values());

  return uniqueTrends;
}

export default {
  fetchGoogleTrends,
  fetchYouTubeTrending,
  normalizeTrend,
  fetchAllTrends
};
