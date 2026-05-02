import dbConnect from "../../../../../lib/mongodb";
import OTTPlatform from "../../../../../model/OTTPlatform"; 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const platform = await OTTPlatform.create(req.body);
    return res.status(201).json({ success: true, data: platform });
  } catch (error) {
    console.error("Admin OTT Create Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
