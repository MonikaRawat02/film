import dbConnect from "../../lib/mongodb";
import Subscriber from "../../model/subscriber";
import mailHelper from "../../lib/mail";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { email } = req.body;

  // Validate email
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address." });
  }

  try {
    await dbConnect();

    const existingSubscriber = await Subscriber.findOne({ email: trimmedEmail });

    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return res.status(400).json({ success: false, message: "You are already subscribed!" });
      } else {
        existingSubscriber.active = true;
        await existingSubscriber.save();
        
        // Trigger welcome email (non-blocking)
        try {
          await mailHelper.sendWelcomeEmail(trimmedEmail);
        } catch (e) {
          console.error("Failed to send welcome email:", e);
        }
        
        return res.status(200).json({ success: true, message: "Subscription reactivated successfully!" });
      }
    }

    const newSubscriber = await Subscriber.create({ email: trimmedEmail });
    
    // Trigger welcome email (non-blocking)
    try {
      await mailHelper.sendWelcomeEmail(trimmedEmail);
    } catch (e) {
      console.error("Failed to send welcome email:", e);
    }
    
    return res.status(201).json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
}
