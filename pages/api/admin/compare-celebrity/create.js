import dbConnect from "../../../../lib/mongodb";
import CompareCelebrity from "../../../../model/compareCelebrity";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (payload.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    await dbConnect();
    const data = req.body;

    const newItem = await CompareCelebrity.create(data);
    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Slug already exists" });
    }
    return res.status(500).json({ message: error.message });
  }
}
