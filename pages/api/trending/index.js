// Trending API Layer
// pages/api/trending/index.js
import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";

/**
 * API Endpoint for fetching trending content (User's requirement #8)
 * GET /api/trending
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();
    
    const limit = parseInt(req.query.limit) || 10;
    
    // Use the static method we defined in the model
    const trendingData = await Trending.getAllTrending(limit);

    return res.status(200).json({
      success: true,
      data: {
        trending_movies: trendingData.trending_movies,
        trending_actors: trendingData.trending_actors,
        viral_topics: trendingData.viral_topics
      }
    });

  } catch (error) {
    console.error("API Trending Error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch trending content",
      error: error.message 
    });
  }
}
