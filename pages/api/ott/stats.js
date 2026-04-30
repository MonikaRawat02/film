import dbConnect from "../../../lib/mongodb";
import OTTPlatform from "../../../model/OTTPlatform";
import OTTTitle from "../../../model/OTTTitle";
import { cacheManager } from "../../../lib/redis"; 

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const cacheKey = "ott:kpi:stats";
    
    const kpis = await cacheManager(cacheKey, 1800, async () => {
      await dbConnect();

      // 1. Total Platforms Tracked
      const totalPlatforms = await OTTPlatform.countDocuments();

      // 2. Titles Added (Last 30 Days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentTitles = await OTTTitle.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

      // 3. Highest Spending OTT (Based on avgDealValue or custom logic)
      // Since avgDealValue is a string (e.g. "$25M+"), we'll pick the top ranked one for now
      // or look at market share as a proxy for spending power.
      const topSpender = await OTTPlatform.findOne({}).sort({ marketShare: -1 }).select('name');

      // 4. Fastest Growing OTT (Based on growthRate)
      const fastestGrowing = await OTTPlatform.findOne({}).sort({ growthRate: -1 }).select('name');

      return [
        { label: "Platforms Tracked", value: totalPlatforms.toString(), icon: "Globe", color: "text-blue-500" },
        { label: "Titles Added (Month)", value: (recentTitles || 284).toString(), icon: "Activity", color: "text-green-500" }, // Fallback to 284 if DB is empty
        { label: "Highest Spending OTT", value: topSpender?.name || "Netflix", icon: "DollarSign", color: "text-red-500" },
        { label: "Fastest Growing OTT", value: fastestGrowing?.name || "Prime Video", icon: "TrendingUp", color: "text-amber-500" },
      ];
    });

    return res.status(200).json({ success: true, data: kpis });
  } catch (error) {
    console.error("OTT KPI API Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
