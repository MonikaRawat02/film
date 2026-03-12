import dbConnect from "@/lib/mongodb";
import TrendingIntelligence from "@/model/trendingIntelligence";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const item = await TrendingIntelligence.findById(id);
        if (!item) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, data: item });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    case "PUT":
      try {
        const item = await TrendingIntelligence.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!item) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, data: item });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    case "DELETE":
      try {
        const deletedItem = await TrendingIntelligence.findByIdAndDelete(id);
        if (!deletedItem) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: "Method not allowed" });
      break;
  }
}
