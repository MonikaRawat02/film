import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import Subscriber from "../../../../model/subscriber";
import jwt from "jsonwebtoken";
import mailHelper from "../../../../lib/mail";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await dbConnect();

    const { heroSection } = req.body || {};
    if (!heroSection || !heroSection.slug || !heroSection.name) {
      return res.status(400).json({ message: "Missing heroSection.name or heroSection.slug" });
    }

    const existing = await Celebrity.findOne({ "heroSection.slug": heroSection.slug });
    if (existing) {
      return res.status(409).json({ message: "Slug already exists" });
    }

    const doc = await Celebrity.create(req.body);

    // Notify subscribers (non-blocking)
    try {
      const activeSubscribers = await Subscriber.find({ active: true });
      if (activeSubscribers.length > 0) {
        mailHelper.sendNotification(activeSubscribers, {
          title: `New Celebrity Profile: ${doc.heroSection.name}`,
          description: `Read the latest intelligence on ${doc.heroSection.name}'s career and net worth.`,
          link: `/celebrity/${doc.heroSection.slug}/profile`,
          category: "Celebrity Intelligence"
        }).catch(e => console.error("Notification error:", e));
      }
    } catch (notificationError) {
      console.error("Failed to send celebrity notification:", notificationError);
    }

    return res.status(201).json({ message: "Celebrity created", id: doc._id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
