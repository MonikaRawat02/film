import dbConnect from "../../../../../lib/mongodb";
import OTTPlatform from "../../../../../model/OTTPlatform";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { one, two } = req.query;

  if (!one || !two) {
    return res.status(400).json({ success: false, message: 'Two platforms required for comparison' });
  }

  try {
    await dbConnect();
    const platformOne = await OTTPlatform.findOne({ slug: one });
    const platformTwo = await OTTPlatform.findOne({ slug: two });

    if (!platformOne || !platformTwo) {
      return res.status(404).json({ success: false, message: 'One or both platforms not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        platformOne,
        platformTwo
      }
    });
  } catch (error) {
    console.error("OTT Compare API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
