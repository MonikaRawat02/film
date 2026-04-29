import dbConnect from "@/lib/mongodb";
import PopularTopic from "@/model/popularTopic";
import { cacheManager } from "@/lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Cache for 1 hour
    const cacheKey = `public:popular-topics`;
    
    const topics = await cacheManager(cacheKey, 3600, async () => {
      await dbConnect();
      return await PopularTopic.find({}).sort({ order: 1, createdAt: -1 }).lean();
    });
    
    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
