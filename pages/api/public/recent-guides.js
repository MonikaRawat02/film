import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const recentGuides = await Article.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select("title summary slug category stats");

    res.status(200).json({
      success: true,
      data: recentGuides,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
