import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
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

    await dbConnect();

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Missing celebrity ID" });
    }

    const updated = await Celebrity.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    if (!updated) {
      return res.status(404).json({ message: "Celebrity not found" });
    }

    return res.status(200).json({ message: "Celebrity updated", data: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
