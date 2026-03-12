import dbConnect from "../../../lib/mongodb";
import OTTIntelligence from "../../../model/ottIntelligence";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  // Helper for admin auth
  const isAdmin = (token) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      return payload.role === "admin";
    } catch {
      return false;
    }
  };

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  switch (method) {
    case "GET":
      try {
        const { q } = req.query;
        let query = {};
        if (q) {
          query = { platformName: { $regex: q, $options: "i" } };
        }
        const data = await OTTIntelligence.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    case "POST":
      if (!isAdmin(token)) return res.status(401).json({ message: "Unauthorized" });
      try {
        const newItem = await OTTIntelligence.create(req.body);
        return res.status(201).json({ success: true, data: newItem });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    case "PUT":
      if (!isAdmin(token)) return res.status(401).json({ message: "Unauthorized" });
      try {
        const { id } = req.query;
        const updatedItem = await OTTIntelligence.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: "Not found" });
        return res.status(200).json({ success: true, data: updatedItem });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    case "DELETE":
      if (!isAdmin(token)) return res.status(401).json({ message: "Unauthorized" });
      try {
        const { id } = req.query;
        await OTTIntelligence.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Deleted" });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
