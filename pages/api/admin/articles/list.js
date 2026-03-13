import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "").trim();
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error: JWT_SECRET is missing" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token", error: err.message });
    }

    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await dbConnect();

    const { q, page = 1, limit = 20, category } = req.query;
    const lim = Math.min(Number(limit) || 20, 100);
    const pg = Math.max(Number(page) || 1, 1);

    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { movieTitle: { $regex: q, $options: "i" } },
      ];
    }
    if (category) {
      filter.category = category;
    }

    const total = await Article.countDocuments(filter);
    const data = await Article.find(filter)
      .skip((pg - 1) * lim)
      .limit(lim)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pg,
        limit: lim,
        total,
        pages: Math.ceil(total / lim) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
