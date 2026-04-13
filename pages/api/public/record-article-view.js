
import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ success: false, message: 'Slug is required' });
  }

  try {
    await dbConnect();

    const article = await Article.findOneAndUpdate(
      { slug },
      { $inc: { "stats.views": 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.status(200).json({ 
      success: true, 
      views: article.stats?.views || 0 
    });
  } catch (error) {
    console.error("Error recording article view:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
