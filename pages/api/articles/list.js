import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { category, limit = 20, page = 1 } = req.query;
    
    const filter = { status: "published" };
    if (category) {
      filter.category = category;
    }

    const lim = Math.min(Number(limit) || 20, 50);
    const pg = Math.max(Number(page) || 1, 1);

    const total = await Article.countDocuments(filter);
    const data = await Article.find(filter)
      .skip((pg - 1) * lim)
      .limit(lim)
      .sort({ publishedAt: -1, createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      data,
      pagination: {
        page: pg,
        limit: lim,
        total,
        pages: Math.ceil(total / lim) || 1
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
