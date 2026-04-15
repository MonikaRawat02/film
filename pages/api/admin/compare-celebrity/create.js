import dbConnect from "@/lib/mongodb";
import Celebrity from "@/model/celebrity";
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

    // The CompareCelebrity model doesn't exist, and the UI seems to use the regular Celebrity model
    // for comparisons. If this API is intended to manage comparison configurations, 
    // it needs a model. For now, I'll use the @/ path to at least resolve the build error
    // if we can find where it should point.
    // Given the build error, I will check if there's any other model that might be it.
    
    return res.status(501).json({ message: "Not implemented: CompareCelebrity model missing" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
