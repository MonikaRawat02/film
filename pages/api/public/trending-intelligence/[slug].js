import dbConnect from "@/lib/mongodb";
import TrendingIntelligence from "@/model/trendingIntelligence";

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;

  await dbConnect();

  if (method === "GET") {
    try {
      const item = await TrendingIntelligence.findOne({ slug });
      if (!item) return res.status(404).json({ success: false, message: "Intelligence not found" });
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
