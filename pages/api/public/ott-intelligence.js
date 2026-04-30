import dbConnect from "../../../lib/mongodb";
import OTTPlatform from "../../../model/OTTPlatform";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { limit = 10 } = req.query;
    const cacheKey = `public:ott-intelligence:v2:${limit}`;

    const data = await cacheManager(cacheKey, 300, async () => {
      await dbConnect();
      const platforms = await OTTPlatform.find({})
        .sort({ rank: 1 })
        .limit(Number(limit))
        .lean();
      
      // Map new model to old format for backward compatibility
      return platforms.map(p => ({
        _id: p._id,
        platformName: p.name,
        averageDealValue: p.avgDealValue || "N/A",
        marketShare: p.marketShare || 0,
        statusLabel: p.growthRate > 10 ? "Growing" : "Most Active",
        detailsLink: `/ott/${p.slug}`,
        slug: p.slug
      }));
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Public OTT Intelligence API Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
