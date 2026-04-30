import dbConnect from "../../../../lib/mongodb";
import OTTPlatform from "../../../../model/OTTPlatform";

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    await dbConnect();
    const platform = await OTTPlatform.findByIdAndUpdate(id, req.body, { new: true });
    if (!platform) {
      return res.status(404).json({ success: false, message: 'Platform not found' });
    }
    return res.status(200).json({ success: true, data: platform });
  } catch (error) {
    console.error("Admin OTT Update Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
