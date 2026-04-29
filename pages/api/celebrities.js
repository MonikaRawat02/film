import dbConnect from "../../lib/mongodb";
import Celebrity from "../../model/celebrity";
import { cacheManager } from "../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Cache for 15 minutes
    const cacheKey = `celebrities:list:latest`;
    
    const data = await cacheManager(cacheKey, 900, async () => {
    await dbConnect();

    const docs = await Celebrity.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    const data = docs.map((c) => ({
      name: c.heroSection?.name || "Unknown",
      image: c.heroSection?.profileImage || "/placeholder.jpg",
      score: c.heroSection?.growthPercentage || 0,
      status: c.heroSection?.careerStage || "Peak",
      trending: `Top ${Math.floor(Math.random() * 10) + 1} Trending`,
      recentProjects: c.heroSection?.profession || [],
      slug: c.heroSection?.slug
    }));
    
    return data;
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
