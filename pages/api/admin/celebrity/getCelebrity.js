// /api/admin/celebrity/getCelebrity
import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { slug, q, page = 1, limit = 20 } = req.query;

    // If a slug is provided, this is a public request for a single profile.
    if (slug) {
      // Find a celebrity whose slug is either a case-insensitive match for the given slug
      // or a case-insensitive match for the slug with spaces instead of hyphens.
      const item = await Celebrity.findOne({
        $or: [
          { "heroSection.slug": new RegExp(`^${slug}$`, 'i') },
          { "heroSection.slug": new RegExp(`^${slug.replace(/-/g, ' ')}$`, 'i') },
        ]
      });
      if (!item) {
        return res.status(404).json({ message: "Not found" });
      }
      return res.status(200).json({ data: item });
    }

    // If no slug, it's an admin request to list celebrities. Proceed with auth.
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const lim = Math.min(Number(limit) || 20, 100);
    const pg = Math.max(Number(page) || 1, 1);
    
    const filter = {};
    if (q) {
      filter["heroSection.name"] = { $regex: q, $options: "i" };
    }

    const total = await Celebrity.countDocuments(filter);
    const data = await Celebrity.find(filter)
      .skip((pg - 1) * lim)
      .limit(lim)
      .sort({ createdAt: -1 });

    return res.status(200).json({
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
