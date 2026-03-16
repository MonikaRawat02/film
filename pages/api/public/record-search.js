import dbConnect from "../../../lib/mongodb";
import SearchAnalytics from "../../../model/searchAnalytics";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { query, category = "Bollywood" } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: "Invalid query" });
    }

    // Securely update or create search record using atomic increment
    const updated = await SearchAnalytics.findOneAndUpdate(
      { query: query.toLowerCase().trim(), category },
      { $inc: { count: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error recording search:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
