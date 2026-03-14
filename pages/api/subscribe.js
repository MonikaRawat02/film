import dbConnect from "@/lib/mongodb";
import Subscriber from "@/model/subscriber";
import { sendWelcomeEmail } from "@/lib/mail";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }

  await dbConnect();

  try {
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return res.status(400).json({ message: "You are already subscribed!" });
      } else {
        existingSubscriber.active = true;
        await existingSubscriber.save();
        
        // Trigger welcome email (non-blocking)
        try {
          await sendWelcomeEmail(email);
        } catch (e) {
          console.error("Failed to send welcome email:", e);
        }
        
        return res.status(200).json({ message: "Subscription reactivated successfully!" });
      }
    }

    const newSubscriber = await Subscriber.create({ email });
    
    // Trigger welcome email (non-blocking)
    try {
      await sendWelcomeEmail(email);
    } catch (e) {
      console.error("Failed to send welcome email:", e);
    }
    
    return res.status(201).json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
}
