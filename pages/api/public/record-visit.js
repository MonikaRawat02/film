import dbConnect from "@/lib/mongodb";
import Visitor from "@/model/visitor";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get IP address from request
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // Update existing visitor or create a new one (Unique by IP)
    await Visitor.findOneAndUpdate(
      { ip },
      { lastVisit: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error recording visit:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
