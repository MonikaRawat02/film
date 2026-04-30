import dbConnect from "../../../lib/mongodb";
import OTTPlatform from "../../../model/OTTPlatform";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const rankings = await OTTPlatform.find({}).sort({ rank: 1 }).select('name slug rank subscribers marketShare logo');

    return res.status(200).json({
      success: true,
      data: rankings
    });
  } catch (error) {
    console.error("OTT Rankings API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
