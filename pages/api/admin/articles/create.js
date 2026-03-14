import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import Subscriber from "../../../../model/subscriber";
import jwt from "jsonwebtoken";
import { sendNewArticleNotification } from "../../../../lib/mail";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "").trim();
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error: JWT_SECRET is missing" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token", error: err.message });
    }

    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await dbConnect();

    const { title, slug, category } = req.body || {};
    if (!title || !slug || !category) {
      return res.status(400).json({ message: "Missing title, slug or category" });
    }

    const existing = await Article.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: "Slug already exists" });
    }

    const doc = await Article.create(req.body);

    // Send notification to all active subscribers (non-blocking)
    try {
      const activeSubscribers = await Subscriber.find({ active: true });
      if (activeSubscribers.length > 0) {
        // We'll send them in batches or all at once depending on the size
        // For now, let's just trigger it
        await sendNewArticleNotification(activeSubscribers, doc);
      }
    } catch (notificationError) {
      console.error("Failed to send article notifications:", notificationError);
    }

    return res.status(201).json({ message: "Article created", data: doc });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
