import dbConnect from "@/lib/mongodb";
import TrendingIntelligence from "@/model/trendingIntelligence";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const items = await TrendingIntelligence.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: items });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    case "POST":
      try {
        const item = await TrendingIntelligence.create(req.body);
        res.status(201).json({ success: true, data: item });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: "Method not allowed" });
      break;
  }
}
