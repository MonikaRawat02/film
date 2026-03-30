import dbConnect from "../../../lib/mongodb";
import OTTIntelligence from "../../../model/ottIntelligence";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { limit = 10 } = req.query;

    const data = await OTTIntelligence.find({})
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Public OTT Intelligence API Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
