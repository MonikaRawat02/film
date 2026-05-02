import dbConnect from "../../../../lib/mongodb.js";
import OTTAcquisition from "../../../../model/OTTAcquisition.js";
import OTTPlatform from "../../../../model/OTTPlatform.js";

export default async function handler(req, res) {
  await dbConnect();

  const { platform } = req.query;

  if (req.method === "GET") {
    try {
      // Get platform to get its ID
      const platformData = await OTTPlatform.findOne({ slug: platform });
      if (!platformData) {
        return res.status(404).json({ success: false, message: "Platform not found" });
      }

      const deals = await OTTAcquisition.find({ platformId: platformData._id })
        .sort({ date: -1 })
        .limit(50);

      res.status(200).json({ success: true, data: deals });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const platformData = await OTTPlatform.findOne({ slug: platform });
      if (!platformData) {
        return res.status(404).json({ success: false, message: "Platform not found" });
      }

      const dealData = {
        ...req.body,
        platformId: platformData._id
      };

      const newDeal = await OTTAcquisition.create(dealData);
      res.status(201).json({ success: true, data: newDeal });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const { dealId } = req.body;
      const updateData = req.body;
      delete updateData.dealId;

      const updated = await OTTAcquisition.findByIdAndUpdate(
        dealId,
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
      const { dealId } = req.body;
      await OTTAcquisition.findByIdAndDelete(dealId);
      res.status(200).json({ success: true, message: "Deal deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
