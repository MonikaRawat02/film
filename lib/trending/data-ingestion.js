// Trending Data Ingestion Service
// Fetches trends from Google Trends, YouTube, and other sources
import axios from "axios";

const CONFIG = {
  GOOGLE_TRENDS_API: process.env.GOOGLE_TRENDS_API_URL || "https://trends.google.com/trends/api/dailytrends",
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  YOUTUBE_API_URL: "https://www.googleapis.com/youtube/v3/videos",
  CACHE_DURATION: 1800000, // 30 minutes
};

/**
 * Fetch trending topics from Google Trends
 */
export async function fetchGoogleTrends(region = "IN") {
  try {
    const response = await axios.get(CONFIG.GOOGLE_TRENDS_API, {
      params: {
        geo: region,
        hl: "en-US"
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      timeout: 10000
    });

    // Parse Google Trends response
    const trends = [];
    
    if (response.data && response.data.default) {
      const trendingItems = response.data.default.trendingSearchesDays?.[0]?.trendingSearches || [];
      
      trendingItems.forEach(item => {
        trends.push({
          title: item.title?.query || "",
          source: "google",
          timestamp: new Date().toISOString(),
          traffic: parseInt(item.formattedTraffic?.replace(/,/g, '').replace('+', '')) || 1000,
          relatedQueries: item.relatedQueries?.map(q => q.query) || [],
          image: item.image?.newsUrl || null
        });
      });
    }

    return trends;
  } catch (error) {
    console.error("Google Trends fetch error:", error.message);
    return [];
  }
}

/**
 * Fetch trending videos from YouTube
 */
export async function fetchYouTubeTrending(category = "Film & Animation", region = "IN") {
  if (!CONFIG.YOUTUBE_API_KEY) {
    console.warn("YouTube API key not configured");
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
    console.error("YouTube Trends fetch error:", error.message);
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
 * Normalize response into common format (User's requirement #1)
 */
export function normalizeTrend(trend) {
  return {
    title: trend.title?.trim() || "",
    source: trend.source || "unknown",
    timestamp: trend.timestamp || new Date().toISOString(),
    // Additional metrics for Ranking Engine (User's requirement #6)
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

  const [googleTrends, youtubeTrends] = await Promise.all([
    fetchGoogleTrends(region),
    fetchYouTubeTrending("Film & Animation", region)
  ]);

  console.log(`✅ Fetched ${googleTrends.length} from Google, ${youtubeTrends.length} from YouTube`);

  // Combine and normalize
  const allTrends = [...googleTrends, ...youtubeTrends]
    .map(normalizeTrend)
    .filter(trend => trend.title.length > 2); // Filter out very short titles

  return allTrends;
}

export default {
  fetchGoogleTrends,
  fetchYouTubeTrending,
  normalizeTrend,
  fetchAllTrends
};
