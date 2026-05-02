import dbConnect from "../../../lib/mongodb";
import IndustryInsight from "../../../model/industryInsight";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    // Cache for 1 hour
    const cacheKey = `industry-insight:${slug}`;
    
    const insight = await cacheManager(cacheKey, 3600, async () => {
      await dbConnect();
      return await IndustryInsight.findOne({ slug }).lean();
    });
    
    if (!insight) {
      return res.status(404).json({ message: "Industry insight not found" });
    }

    return res.status(200).json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error("Error fetching industry insight:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}
