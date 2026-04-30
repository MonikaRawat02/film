import dbConnect from "../../../../lib/mongodb";
import OTTPlatform from "../../../../model/OTTPlatform";

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    await dbConnect();
    const platform = await OTTPlatform.findByIdAndDelete(id);
    if (!platform) {
      return res.status(404).json({ success: false, message: 'Platform not found' });
    }
    return res.status(200).json({ success: true, message: 'Platform deleted successfully' });
  } catch (error) {
    console.error("Admin OTT Delete Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}