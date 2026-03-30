import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";
import Visitor from "../../../model/visitor";
import BoxOffice from "../../../model/boxOffice";
import OTTIntelligence from "../../../model/ottIntelligence";
import SearchAnalytics from "../../../model/searchAnalytics";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const articleCount = await Article.countDocuments();
    const celebrityCount = await Celebrity.countDocuments();
    const activeUsers = await Visitor.countDocuments();
    const boxOfficeCount = await BoxOffice.countDocuments();
    const ottCount = await OTTIntelligence.countDocuments();

    // Search analytics for trending status
    const topSearches = await SearchAnalytics.find({}).sort({ count: -1 }).limit(10).lean();
    const trendingCount = topSearches.length;

    // You can add more stats here as needed
    // For example, total views across all articles
    const totalViewsData = await Article.aggregate([
      { $group: { _id: null, total: { $sum: "$stats.views" } } }
    ]);

    // Fetch recent activity from search analytics (this replaces manual trending activity)
    const recentSearches = await SearchAnalytics.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const combinedActivity = recentSearches.map(s => ({
      type: "Trending Search",
      title: s.query,
      count: s.count,
      time: s.updatedAt || s.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        articles: articleCount,
        celebrities: celebrityCount,
        activeUsers: activeUsers,
        boxOffice: boxOfficeCount,
        ott: ottCount,
        trending: trendingCount,
        totalViews: totalViewsData[0]?.total || 0,
        recentActivity: combinedActivity
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
