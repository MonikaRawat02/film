import axios from "axios";
import googleTrends from "google-trends-api";
import * as cheerio from "cheerio";

const CONFIG = {
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  YOUTUBE_API_URL: "https://www.googleapis.com/youtube/v3/videos",
  GOOGLE_TRENDS_RSS: "https://trends.google.com/trending/rss",
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
 * Fetch trending topics from Google Trends using google-trends-api
 * Options (optional):
 * - realTime: boolean (fetch real-time trending stories)
 * - interestOverTime: { keyword: string, startTime?: Date, endTime?: Date }
 */
export async function fetchGoogleTrends(region = "IN", options = {}) {
  try {
    const timeoutMs = 15000; // Increased timeout
    const withTimeout = (p) =>
      Promise.race([
        p,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Google Trends request timed out")), timeoutMs)
        ),
      ]);

    // Helper to safely parse JSON from google-trends-api
    const safeParse = (jsonStr, context = "") => {
      if (!jsonStr || typeof jsonStr !== 'string') return null;
      if (jsonStr.startsWith('<!doctype') || jsonStr.startsWith('<html')) {
        console.warn(`⚠️ Google Trends ${context} returned HTML instead of JSON (404/Block)`);
        return null;
      }
      try {
        // google-trends-api often prefixes with )]}' 
        const cleaned = jsonStr.startsWith(")]}'") ? jsonStr.substring(5) : jsonStr;
        return JSON.parse(cleaned);
      } catch (e) {
        console.error(`❌ JSON Parse Error for Google Trends ${context}:`, e.message);
        return null;
      }
    };

    // 1. Try Daily Trending Searches (primary signal)
    let dailyTrends = [];
    try {
      const dailyJson = await withTimeout(googleTrends.dailyTrends({ 
        geo: region, 
        hl: 'en-US' // Language often helps avoid 404
      }));
      const daily = safeParse(dailyJson, "dailyTrends");
      const days = daily?.default?.trendingSearchesDays || [];
      const searches = days.flatMap((d) => d.trendingSearches || []);

      dailyTrends = searches
        .map((item) => {
          const title = item?.title?.query || "";
          if (!title || title.length < 2) return null;
          const traffic = parseFormattedTraffic(item?.formattedTraffic || "");
          const relatedQueries = (item?.relatedQueries || [])
            .map((rq) => rq?.query)
            .filter(Boolean);
          const image = item?.image?.imageUrl || item?.image?.newsUrl || null;
          return {
            title: title.trim(),
            source: "google",
            timestamp: new Date().toISOString(),
            traffic: Number.isFinite(traffic) && traffic > 0 ? traffic : 1000,
            relatedQueries,
            image,
          };
        })
        .filter(Boolean);
    } catch (dailyErr) {
      console.warn("⚠️ Google Trends dailyTrends fetch error:", dailyErr.message);
    }

    // 2. Optionally include real-time trending stories (or as fallback)
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
            if (!title || title.length < 2) return null;
            const image = s?.image?.imgUrl || s?.image?.newsUrl || null;
            return {
              title: title.trim(),
              source: "google",
              timestamp: new Date().toISOString(),
              traffic: 1000,
              relatedQueries: [],
              image,
            };
          })
          .filter(Boolean);
      } catch (rtErr) {
        console.warn("⚠️ Google Trends real-time fetch error:", rtErr.message);
      }
    }

    // 3. Last Resort Fallback: RSS Feed (Parsed with Cheerio - not regex)
    if (dailyTrends.length === 0 && realTimeTrends.length === 0) {
      console.log("🔄 All API methods failed. Falling back to RSS feed (Cheerio parsing)...");
      try {
        const response = await axios.get(CONFIG.GOOGLE_TRENDS_RSS, {
          params: { geo: region },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 10000
        });

        const $ = cheerio.load(response.data, { xmlMode: true });
        $("item").each((_, el) => {
          const title = $(el).find("title").text();
          const trafficStr = $(el).find("ht\\:approx_traffic, approx_traffic").text();
          const traffic = parseFormattedTraffic(trafficStr);
          
          if (title && title.length > 2) {
            dailyTrends.push({
              title: title.trim(),
              source: "google",
              timestamp: new Date().toISOString(),
              traffic: traffic > 0 ? traffic : 1000,
              relatedQueries: [],
              image: null
            });
          }
        });
      } catch (rssErr) {
        console.error("❌ Google Trends RSS fallback failed:", rssErr.message);
      }
    }

    // 4. Optionally include interest over time
    let iotTrends = [];
    if (options.interestOverTime?.keyword) {
      try {
        const { keyword, startTime, endTime } = options.interestOverTime;
        const iotJson = await withTimeout(
          googleTrends.interestOverTime({
            keyword,
            geo: region,
            startTime: startTime || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endTime: endTime || new Date(),
            hl: 'en-US'
          })
        );
        const iot = safeParse(iotJson, "interestOverTime");
        const points = iot?.default?.timelineData || [];
        const lastPoint = points[points.length - 1];
        const value = Array.isArray(lastPoint?.value) ? lastPoint.value[0] : 0;
        if (keyword && keyword.length > 1) {
          iotTrends.push({
            title: keyword.trim(),
            source: "google",
            timestamp: new Date().toISOString(),
            traffic: Number.isFinite(value) ? value * 1000 : 1000,
            relatedQueries: [],
            image: null,
          });
        }
      } catch (iotErr) {
        console.warn("⚠️ Google Trends interestOverTime fetch error:", iotErr.message);
      }
    }

    const combined = [...dailyTrends, ...realTimeTrends, ...iotTrends];

    // Deduplicate by title (case-insensitive)
    const uniqueTrends = Array.from(
      new Map(combined.map((t) => [t.title.toLowerCase(), t])).values()
    );

    return uniqueTrends;
  } catch (error) {
    console.error("❌ Global Google Trends fetch error:", error.message);
    return [];
  }
}

export async function fetchYouTubeTrending(category = null, region = "IN") {
  if (!CONFIG.YOUTUBE_API_KEY || CONFIG.YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY") {
    console.warn("⚠️ YouTube API key is missing or set to placeholder. Skipping YouTube Trends.");
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

    // Only add category if provided and valid
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
    // If a specific category fails, log it but don't crash the whole process
    console.error(`❌ YouTube Trends fetch error for category ${category || 'General'}:`, error.message);
    return [];
  }
}

function getYouTubeCategoryID(categoryName) {
  const categoryMap = {
    "Film & Animation": "1",
    "Entertainment": "24",
    "Movies": "30"
  };

  return categoryMap[categoryName] || "24"; // Default to Entertainment
}

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

  // Fetch multiple categories in parallel, but handle individual failures
  const results = await Promise.allSettled([
    fetchGoogleTrends(region),
    fetchYouTubeTrending("Film & Animation", region),
    fetchYouTubeTrending("Entertainment", region),
    fetchYouTubeTrending(null, region) // General trending
  ]);

  const googleTrends = results[0].status === 'fulfilled' ? results[0].value : [];
  const ytFilmTrends = results[1].status === 'fulfilled' ? results[1].value : [];
  const ytEntTrends = results[2].status === 'fulfilled' ? results[2].value : [];
  const ytGeneralTrends = results[3].status === 'fulfilled' ? results[3].value : [];

  const youtubeTrends = [...ytFilmTrends, ...ytEntTrends, ...ytGeneralTrends];

  console.log(`✅ Fetched ${googleTrends.length} from Google, ${youtubeTrends.length} from YouTube`);

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
