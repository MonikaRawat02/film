import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const articleCount = await Article.countDocuments();
    const celebrityCount = await Celebrity.countDocuments();

    // You can add more stats here as needed
    // For example, total views across all articles
    const totalViews = await Article.aggregate([
      { $group: { _id: null, total: { $sum: "$stats.views" } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        articles: articleCount,
        celebrities: celebrityCount,
        totalViews: totalViews[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
