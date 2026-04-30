import dbConnect from "../../../lib/mongodb";
import OTTPlatform from "../../../model/OTTPlatform";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { platforms } = req.body;

  if (!Array.isArray(platforms)) {
    return res.status(400).json({ success: false, message: 'Invalid data format' });
  }

  try {
    await dbConnect();
    const result = await OTTPlatform.insertMany(platforms);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("Admin OTT Import Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
