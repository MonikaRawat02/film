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

    // Create a new record for every single visit (not unique)
    await Visitor.create({ 
      ip, 
      lastVisit: new Date() 
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error recording visit:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
