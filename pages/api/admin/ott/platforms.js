import dbConnect from "../../../lib/mongodb.js";
import OTTPlatform from "../../../model/OTTPlatform.js";
import OTTTitle from "../../../model/OTTTitle.js";
import OTTAcquisition from "../../../model/OTTAcquisition.js";

export default async function handler(req, res) {
  await dbConnect();

  const { platform } = req.query;

  if (req.method === "GET") {
    try {
      const platformData = await OTTPlatform.findOne({ slug: platform });
      if (!platformData) {
        return res.status(404).json({ success: false, message: "Platform not found" });
      }

      res.status(200).json({ success: true, data: platformData });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const updateData = req.body;
      updateData.statsUpdatedAt = new Date();

      const updated = await OTTPlatform.findOneAndUpdate(
        { slug: platform },
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
      await OTTPlatform.findOneAndDelete({ slug: platform });
      await OTTTitle.deleteMany({ platformId: platform });
      await OTTAcquisition.deleteMany({ platformId: platform });

      res.status(200).json({ success: true, message: "Platform deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
