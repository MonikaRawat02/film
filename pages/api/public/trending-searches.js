import dbConnect from "../../../lib/mongodb";
import SearchAnalytics from "../../../model/searchAnalytics";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { category = "Bollywood", limit = 12 } = req.query;
    const cacheKey = `public:trending-searches:${category}:${limit}`;

    const searches = await cacheManager(cacheKey, 600, async () => {
      await dbConnect();
      return await SearchAnalytics.find({ category })
        .sort({ count: -1 })
        .limit(parseInt(limit))
        .lean();
    });

    return res.status(200).json({ success: true, data: searches });
  } catch (error) {
    console.error("Error fetching trending searches:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
