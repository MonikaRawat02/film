import dbConnect from "../../../lib/mongodb";
import Visitor from "../../../model/visitor";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get IP address from request
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // Find a visitor by IP and update their last visit, or create a new one
    await Visitor.findOneAndUpdate(
      { ip }, // find a document with this filter
      { $set: { lastVisit: new Date() } }, // document to insert when nothing was found
      { upsert: true, new: true, setDefaultsOnInsert: true } // options
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error recording visit:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
