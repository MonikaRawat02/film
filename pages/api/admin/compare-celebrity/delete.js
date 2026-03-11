import dbConnect from "../../../../lib/mongodb";
import CompareCelebrity from "../../../../model/compareCelebrity";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
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
    const { id } = req.query;

    const deletedItem = await CompareCelebrity.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
