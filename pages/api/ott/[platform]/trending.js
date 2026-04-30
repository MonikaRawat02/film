import dbConnect from "../../../../lib/mongodb";
import OTTPlatform from "../../../../model/OTTPlatform";
import OTTTitle from "../../../../model/OTTTitle";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { platform: slug } = req.query;

  try {
    await dbConnect();
    const platform = await OTTPlatform.findOne({ slug });

    if (!platform) {
      return res.status(404).json({ success: false, message: 'Platform not found' });
    }

    const trending = await OTTTitle.find({ platformId: platform._id }).sort({ trendScore: -1 }).limit(10);

    return res.status(200).json({
      success: true,
      data: trending
    });
  } catch (error) {
    console.error("OTT Trending API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
