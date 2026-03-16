import dbConnect from "../../../lib/mongodb";
import BoxOffice from "../../../model/boxOffice";
import Subscriber from "../../../model/subscriber";
import jwt from "jsonwebtoken";
import { sendNotification } from "../../../lib/mail";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  // Helper for admin auth
  const isAdmin = (token) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      return payload.role === "admin";
    } catch {
      return false;
    }
  };

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  switch (method) {
    case "GET":
      try {
        const { q } = req.query;
        let query = {};
        if (q) {
          query = { movieName: { $regex: q, $options: "i" } };
        }
        
        // Use lean() for better performance and to allow manual modification of fields
        const data = await BoxOffice.find(query).sort({ createdAt: -1 }).lean();
        
        // Ensure movieDNA is always present in the response for each item
        const dataWithDNA = data.map(item => ({
          ...item,
          movieDNA: item.movieDNA || {
            emotionalIntensity: 0,
            violenceLevel: 0,
            psychologicalDepth: 0,
            familyFriendliness: 0,
            complexityLevel: 0,
          }
        }));

        return res.status(200).json({ success: true, data: dataWithDNA });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    case "POST":
      if (!isAdmin(token)) return res.status(401).json({ message: "Unauthorized" });
      try {
        const { movieName, budget, collection, roi, verdict, analysisLink, movieDNA } = req.body;
        const newItemData = {
          movieName,
          budget,
          collection,
          roi,
          verdict,
          analysisLink,
          movieDNA: {
            emotionalIntensity: movieDNA?.emotionalIntensity || 0,
            violenceLevel: movieDNA?.violenceLevel || 0,
            psychologicalDepth: movieDNA?.psychologicalDepth || 0,
            familyFriendliness: movieDNA?.familyFriendliness || 0,
            complexityLevel: movieDNA?.complexityLevel || 0,
          },
        };

        const newItem = await BoxOffice.create(newItemData);

        // Send notification to all active subscribers (non-blocking)
        try {
          const activeSubscribers = await Subscriber.find({ active: true });
          if (activeSubscribers.length > 0) {
            await sendNotification(activeSubscribers, {
              title: `Box Office Update: ${newItem.movieName}`,
              description: `New box office analysis for ${newItem.movieName} is out. Check out the latest numbers and performance.`,
              link: `/box-office`,
              category: "Box Office"
            });
          }
        } catch (notificationError) {
          console.error("Failed to send box office notification:", notificationError);
        }

        return res.status(201).json({ success: true, data: newItem });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    case "PUT":
      if (!isAdmin(token)) return res.status(401).json({ message: "Unauthorized" });
      try {
        const { id } = req.query;
        const { movieName, budget, collection, roi, verdict, analysisLink, movieDNA } = req.body;
        const updateData = {
          movieName,
          budget,
          collection,
          roi,
          verdict,
          analysisLink,
          movieDNA: {
            emotionalIntensity: movieDNA?.emotionalIntensity || 0,
            violenceLevel: movieDNA?.violenceLevel || 0,
            psychologicalDepth: movieDNA?.psychologicalDepth || 0,
            familyFriendliness: movieDNA?.familyFriendliness || 0,
            complexityLevel: movieDNA?.complexityLevel || 0,
          },
        };

        const updatedItem = await BoxOffice.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedItem) return res.status(404).json({ message: "Not found" });
        return res.status(200).json({ success: true, data: updatedItem });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    case "DELETE":
      if (!isAdmin(token)) return res.status(401).json({ message: "Unauthorized" });
      try {
        const { id } = req.query;
        await BoxOffice.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Deleted" });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
