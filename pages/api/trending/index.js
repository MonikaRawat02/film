// GET /api/trending
// Returns validated & enriched trending movies, actors, and viral topics
import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { type, limit = 200, region = "IN" } = req.query;

  try {
    await dbConnect();

    // Filter for active trends that haven't expired
    const baseFilter = {
      status: "active",
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } }
      ]
    };

    // If specific type requested
    if (type && ["trending_movies", "trending_actors", "viral_topics"].includes(type)) {
      const trends = await Trending.find({
        ...baseFilter,
        type
      })
        .sort({ score: -1, trendTimestamp: -1 })
        .limit(parseInt(limit))
        .populate({
          path: "referenceId",
          select: "movieTitle slug coverImage releaseYear director genres stats heroSection.name heroSection.slug heroSection.profileImage"
        })
        .lean();
      
      // Format response with all necessary fields
      const formatted = trends.map(trend => ({
        _id: trend._id,
        title: trend.title,
        type: trend.type,
        entityType: trend.entityType,
        referenceId: trend.referenceId?._id || trend.referenceId,
        slug: trend.slug,
        source: trend.source,
        score: trend.score,
        traffic: trend.traffic,
        viewCount: trend.viewCount,
        keywords: trend.keywords,
        classificationConfidence: trend.classificationConfidence,
        status: trend.status,
        metadata: trend.metadata,
        trendTimestamp: trend.trendTimestamp,
        createdAt: trend.createdAt
      }));

      return res.status(200).json({
        success: true,
        data: {
          [type]: formatted
        },
        count: formatted.length,
        region
      });
    }

    // Get all trending items grouped by type
    const [movies, actors, topics] = await Promise.all([
      Trending.find({
        ...baseFilter,
        type: "trending_movies"
      })
        .sort({ score: -1, trendTimestamp: -1 })
        .limit(parseInt(limit))
        .lean(),
      Trending.find({
        ...baseFilter,
        type: "trending_actors"
      })
        .sort({ score: -1, trendTimestamp: -1 })
        .limit(parseInt(limit))
        .lean(),
      Trending.find({
        ...baseFilter,
        type: "viral_topics"
      })
        .sort({ score: -1, trendTimestamp: -1 })
        .limit(parseInt(limit))
        .lean()
    ]);

    // Format responses
    const formatTrends = (trends) =>
      trends.map(trend => ({
        _id: trend._id,
        title: trend.title,
        type: trend.type,
        entityType: trend.entityType,
        referenceId: trend.referenceId,
        slug: trend.slug,
        source: trend.source,
        score: trend.score,
        traffic: trend.traffic,
        viewCount: trend.viewCount,
        keywords: trend.keywords,
        classificationConfidence: trend.classificationConfidence,
        status: trend.status,
        metadata: trend.metadata,
        trendTimestamp: trend.trendTimestamp,
        createdAt: trend.createdAt
      }));

    return res.status(200).json({
      success: true,
      data: {
        trending_movies: formatTrends(movies),
        trending_actors: formatTrends(actors),
        viral_topics: formatTrends(topics)
      },
      total: {
        movies: movies.length,
        actors: actors.length,
        topics: topics.length,
        all: movies.length + actors.length + topics.length
      },
      region
    });
  } catch (error) {
    console.error("Trending API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trending content",
      error: error.message
    });
  }
}
