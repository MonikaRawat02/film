import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
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

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Missing article ID" });
    }

    const updated = await Article.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    if (!updated) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json({ message: "Article updated", data: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
