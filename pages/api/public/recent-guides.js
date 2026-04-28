import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const cacheKey = 'public:recent-guides';
    
    const recentGuides = await cacheManager(cacheKey, 300, async () => {
      await dbConnect();
      return await Article.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(3)
        .select("title summary slug category stats")
        .lean();
    });

    res.status(200).json({
      success: true,
      data: recentGuides,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
