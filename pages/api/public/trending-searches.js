import dbConnect from "../../../lib/mongodb";
import SearchAnalytics from "../../../model/searchAnalytics";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { category = "Bollywood", limit = 12 } = req.query;

    const searches = await SearchAnalytics.find({ category })
      .sort({ count: -1 })
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({ success: true, data: searches });
  } catch (error) {
    console.error("Error fetching trending searches:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
