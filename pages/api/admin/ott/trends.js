import dbConnect from "../../../../lib/mongodb.js";
import OTTTrend from "../../../../model/OTTTrend.js";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const { week } = req.query;
      
      if (week) {
        const trend = await OTTTrend.findOne({ week }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: trend });
      }

      const trends = await OTTTrend.find().sort({ week: -1 }).limit(12);
      res.status(200).json({ success: true, data: trends });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const newTrend = await OTTTrend.create(req.body);
      res.status(201).json({ success: true, data: newTrend });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const { trendId } = req.body;
      const updateData = req.body;
      delete updateData.trendId;

      const updated = await OTTTrend.findByIdAndUpdate(
        trendId,
        updateData,
        { new: true }
      );

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { trendId } = req.body;
      await OTTTrend.findByIdAndDelete(trendId);
      res.status(200).json({ success: true, message: "Trend deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
