import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
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
        let query = { contentType: "movie" };
        if (q) {
          query.$or = [
            { title: { $regex: q, $options: "i" } },
            { movieTitle: { $regex: q, $options: "i" } }
          ];
        }
        
        // Fetch movies from Article collection
        const movies = await Article.find(query).sort({ createdAt: -1 }).lean();
        
        // Map Article model to the expected BoxOffice UI format
        const data = movies.map(movie => {
          let budgetStr = movie.budget || "N/A";
          let collectionStr = movie.boxOffice?.worldwide || "N/A";
          let roi = movie.boxOffice?.roi || null;
          let verdict = movie.verdict || null;

          // Helper to parse currency strings like "₹275 crore" or "$400M"
          const parseCurrency = (str) => {
            if (!str || typeof str !== 'string' || str.toLowerCase() === 'n/a') return 0;
            const numStr = str.replace(/[^0-9.]/g, '');
            let num = parseFloat(numStr);
            if (isNaN(num)) return 0;

            if (str.toLowerCase().includes('crore')) num *= 10000000;
            else if (str.toLowerCase().includes('lakh')) num *= 100000;
            else if (str.toLowerCase().includes('b')) num *= 1000000000;
            else if (str.toLowerCase().includes('m')) num *= 1000000;
            
            return num;
          };

          // If verdict or ROI is missing, calculate it on the fly
          if (!verdict || !roi) {
            const budgetNum = parseCurrency(budgetStr);
            const collectionNum = parseCurrency(collectionStr);

            if (budgetNum > 1000 && collectionNum > 0) {
              const roiPercentage = ((collectionNum - budgetNum) / budgetNum);
              if (!roi) {
                roi = `${(roiPercentage * 100).toFixed(0)}%`;
              }
              if (!verdict) {
                if (roiPercentage > 3) verdict = "BLOCKBUSTER";
                else if (roiPercentage > 1.5) verdict = "SUPER HIT";
                else if (roiPercentage > 0.5) verdict = "HIT";
                else if (roiPercentage >= -0.1) verdict = "AVERAGE"; // Allow for small losses
                else verdict = "FLOP";
              }
            }
          }

          return {
            _id: movie._id,
            movieName: movie.movieTitle || movie.title,
            budget: budgetStr,
            collection: collectionStr,
            roi: roi || "N/A",
            verdict: verdict || "AVERAGE",
            analysisLink: movie.boxOffice?.analysisLink || "",
            movieDNA: movie.boxOffice?.movieDNA || {
              emotionalIntensity: 0,
              violenceLevel: 0,
              psychologicalDepth: 0,
              familyFriendliness: 0,
              complexityLevel: 0,
            }
          };
        });

        return res.status(200).json({ success: true, data });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    case "PUT":
      if (!isAdmin(token)) return res.status(401).json({ message: "Unauthorized" });
      try {
        const { id } = req.query;
        const { movieName, budget, collection, roi, verdict, analysisLink, movieDNA } = req.body;
        
        // Update the Article collection
        const updateData = {
          movieTitle: movieName,
          budget,
          "boxOffice.worldwide": collection,
          "boxOffice.roi": roi,
          verdict,
          "boxOffice.analysisLink": analysisLink,
          "boxOffice.movieDNA": {
            emotionalIntensity: movieDNA?.emotionalIntensity || 0,
            violenceLevel: movieDNA?.violenceLevel || 0,
            psychologicalDepth: movieDNA?.psychologicalDepth || 0,
            familyFriendliness: movieDNA?.familyFriendliness || 0,
            complexityLevel: movieDNA?.complexityLevel || 0,
          },
        };

        const updatedItem = await Article.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (!updatedItem) return res.status(404).json({ message: "Not found" });
        
        // Send notification for major updates (optional)
        return res.status(200).json({ success: true, data: updatedItem });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    case "DELETE":
      if (!isAdmin(token)) return res.status(401).json({ message: "Unauthorized" });
      try {
        const { id } = req.query;
        // Instead of deleting the article, we reset its box office analysis data
        const resetData = {
          "boxOffice.roi": "N/A",
          "boxOffice.analysisLink": "",
          "boxOffice.movieDNA": {
            emotionalIntensity: 0,
            violenceLevel: 0,
            psychologicalDepth: 0,
            familyFriendliness: 0,
            complexityLevel: 0,
          }
        };
        await Article.findByIdAndUpdate(id, { $set: resetData });
        return res.status(200).json({ success: true, message: "Box office analysis reset" });
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
