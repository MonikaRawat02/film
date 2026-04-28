import dbConnect from "../../../lib/mongodb";
import Celebrity from "../../../model/celebrity";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Cache for 30 minutes
    const cacheKey = `celebrities:top-10-richest`;
    
    const celebrities = await cacheManager(cacheKey, 1800, async () => {
      await dbConnect();

      const data = await Celebrity.find({})
        .sort({ "netWorth.netWorthUSD.max": -1 })
        .limit(10)
        .lean();
      
      return data;
    });

    res.status(200).json({ success: true, data: celebrities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
