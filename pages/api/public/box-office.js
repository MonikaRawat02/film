import dbConnect from "../../../lib/mongodb";
import BoxOffice from "../../../model/boxOffice";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { industry, limit = 10 } = req.query;
    const cacheKey = `public:box-office:${industry || 'all'}:${limit}`;

    const data = await cacheManager(cacheKey, 300, async () => {
      await dbConnect();
      let query = {};
      const data = await BoxOffice.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();
      return data;
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Public Box Office API Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
