   import dbConnect from "../../lib/mongodb";
import Article from "../../model/article";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Fetch trending web series articles
    const wsFilter = {
      status: "published",
      $or: [
        { category: "WebSeries" },
        { contentType: "webseries" },
      ],
    };

    // Get top rated series
    const topRated = await Article.find(wsFilter)
      .select("title slug movieTitle coverImage genres rating ott releaseYear stats summary")
      .sort({ "stats.rating": -1, publishedAt: -1 })
      .limit(20)
      .lean();

    // Get most viewed series
    const mostViewed = await Article.find(wsFilter)
      .select("title slug movieTitle coverImage genres rating ott releaseYear stats summary")
      .sort({ "stats.views": -1 })
      .limit(10)
      .lean();

    // Platform trend aggregation
    const platformTrends = await Article.aggregate([
      { $match: wsFilter },
      { $group: {
          _id: "$ott.platform",
          totalArticles: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          totalViews: { $sum: "$stats.views" },
          seriesCount: { $addToSet: "$title" },
        }
      },
      { $sort: { totalViews: -1 } },
      { $limit: 10 }
    ]);

    // Genre distribution
    const genreDistribution = await Article.aggregate([
      { $match: wsFilter },
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Recently updated series
    const recentlyUpdated = await Article.find(wsFilter)
      .select("title slug movieTitle coverImage genres rating ott releaseYear stats summary updatedAt")
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Calculate trending score (combination of views and rating)
    const calculateTrendScore = (views, rating) => {
      const viewScore = Math.min(views / 1000, 50);
      const ratingScore = (rating / 10) * 50;
      return Math.round(viewScore + ratingScore);
    };

    const trending = topRated.map(article => ({
      _id: article._id,
      title: article.title,
      slug: article.slug,
      movieTitle: article.movieTitle,
      coverImage: article.coverImage,
      genres: article.genres,
      rating: article.rating,
      ott: article.ott,
      releaseYear: article.releaseYear,
      summary: article.summary,
      stats: {
        views: article.stats?.views || 0,
        trendScore: calculateTrendScore(
          article.stats?.views || 0,
          article.rating || 0
        )
      }
    })).sort((a, b) => b.stats.trendScore - a.stats.trendScore).slice(0, 20);

    return res.status(200).json({
      success: true,
      data: {
        trending,
        topRated: topRated.slice(0, 10),
        mostViewed,
        platformTrends: platformTrends.map(p => ({
          name: p._id || "Unknown",
          totalArticles: p.totalArticles,
          avgRating: p.avgRating?.toFixed(1) || "N/A",
          totalViews: p.totalViews || 0,
          seriesCount: p.seriesCount?.length || 0,
        })),
        genreDistribution,
        recentlyUpdated,
        stats: {
          totalTracked: await Article.countDocuments(wsFilter),
          avgRating: (await Article.aggregate([
            { $match: wsFilter },
            { $group: { _id: null, avg: { $avg: "$rating" } } }
          ]))[0]?.avg?.toFixed(1) || "N/A",
        }
      }
    });
  } catch (error) {
    console.error("Trending WebSeries API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
