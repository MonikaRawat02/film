import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const recentArticles = await Article.find({})
      .sort({ updatedAt: -1 })
      .limit(5) // Get the 5 most recently updated articles
      .select("title slug status category updatedAt");

    res.status(200).json({
      success: true,
      data: recentArticles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
