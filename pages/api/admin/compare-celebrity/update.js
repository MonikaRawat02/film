import dbConnect from "@/lib/mongodb";
import Celebrity from "@/model/celebrity";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
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
    
    // CompareCelebrity model is missing from the project.
    // This API seems to be a placeholder or incomplete.
    
    return res.status(501).json({ message: "Not implemented: CompareCelebrity model missing" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
