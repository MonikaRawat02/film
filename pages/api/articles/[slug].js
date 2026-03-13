import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    const item = await Article.findOne({ slug, status: "published" });

    if (!item) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Increment view count
    item.stats.views = (item.stats.views || 0) + 1;
    await item.save();

    return res.status(200).json({ 
      success: true,
      data: item 
    });
  } catch (error) {
    console.error("Error fetching article detail:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Internal server error" 
    });
  }
}
