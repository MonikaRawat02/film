import dbConnect from "@/lib/mongodb";
import TrendingIntelligence from "@/model/trendingIntelligence";
import Subscriber from "@/model/subscriber";
import { sendNewArticleNotification } from "@/lib/mail";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const items = await TrendingIntelligence.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: items });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    case "POST":
      try {
        const item = await TrendingIntelligence.create(req.body);
        
        // Send notification to all active subscribers (non-blocking)
        try {
          const activeSubscribers = await Subscriber.find({ active: true });
          if (activeSubscribers.length > 0) {
            await sendNewArticleNotification(activeSubscribers, item);
          }
        } catch (notificationError) {
          console.error("Failed to send trending intelligence notifications:", notificationError);
        }
        
        res.status(201).json({ success: true, data: item });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: "Method not allowed" });
      break;
  }
}
