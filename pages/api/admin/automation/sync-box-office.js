import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// Initialize Gemini (Paid Tier as requested earlier)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Movie ID is required" });
  }

  try {
    await dbConnect();
    const movie = await Article.findById(id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const movieTitle = movie.movieTitle || movie.title;
    const releaseYear = movie.releaseYear || new Date(movie.releaseDate).getFullYear();

    console.log(`🔍 Syncing Box Office Intelligence for: ${movieTitle} (${releaseYear})...`);

    let intelligence = {
      budget: movie.budget || "N/A",
      openingWeekend: movie.boxOffice?.openingWeekend || "N/A",
      worldwide: movie.boxOffice?.worldwide || "N/A",
      roi: movie.boxOffice?.roi || "N/A",
      profit: movie.boxOffice?.profit || "N/A",
      verdict: movie.verdict || "AVERAGE",
    };

    // 1. Try Gemini for the latest intelligence (Sacnilk/BollyHungama accuracy)
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Provide the latest and most accurate box office intelligence for the movie "${movieTitle}" (${releaseYear}). 
        I need specifically:
        1. Budget (in Crores or Dollars)
        2. Opening Weekend Collection (in Crores or Dollars)
        3. Worldwide Collection (in Crores or Dollars)
        4. Profit or Net Profit (in Crores or Dollars)
        5. ROI (Return on Investment percentage)
        6. Verdict (Strictly one of: BLOCKBUSTER, SUPER HIT, HIT, AVERAGE, FLOP)

        Return the data in this exact JSON format:
        {
          "budget": "string",
          "opening_weekend": "string",
          "worldwide": "string",
          "profit": "string",
          "roi": "string",
          "verdict": "string"
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        
        if (jsonMatch) {
          const geminiData = JSON.parse(jsonMatch[0]);
          intelligence = {
            budget: geminiData.budget || intelligence.budget,
            openingWeekend: geminiData.opening_weekend || intelligence.openingWeekend,
            worldwide: geminiData.worldwide || intelligence.worldwide,
            profit: geminiData.profit || intelligence.profit,
            roi: geminiData.roi || intelligence.roi,
            verdict: geminiData.verdict?.toUpperCase() || intelligence.verdict,
          };
          console.log(`✅ Gemini Intelligence Success for ${movieTitle}`);
        }
      } catch (geminiErr) {
        console.error("❌ Gemini Intelligence Failed:", geminiErr.message);
      }
    }

    // 2. Fallback/Enrich with TMDB if Gemini failed or to verify
    if (TMDB_API_KEY && (intelligence.budget === "N/A" || intelligence.worldwide === "N/A")) {
      try {
        const searchRes = await axios.get(`${BASE_URL}/search/movie`, {
          params: { api_key: TMDB_API_KEY, query: movieTitle.split('(')[0].trim(), year: releaseYear }
        });

        const tmdbMovie = searchRes.data.results?.[0];
        if (tmdbMovie) {
          const detailsRes = await axios.get(`${BASE_URL}/movie/${tmdbMovie.id}`, {
            params: { api_key: TMDB_API_KEY }
          });
          const details = detailsRes.data;

          if (details.budget > 0 && intelligence.budget === "N/A") {
            intelligence.budget = `$${(details.budget / 1000000).toFixed(1)}M`;
          }
          if (details.revenue > 0 && intelligence.worldwide === "N/A") {
            intelligence.worldwide = `$${(details.revenue / 1000000).toFixed(1)}M`;
          }
        }
      } catch (tmdbErr) {
        console.error("❌ TMDB Intelligence Failed:", tmdbErr.message);
      }
    }

    // 3. Update the database
    const updatedMovie = await Article.findByIdAndUpdate(
      id,
      {
        $set: {
          budget: intelligence.budget,
          "boxOffice.openingWeekend": intelligence.openingWeekend,
          "boxOffice.worldwide": intelligence.worldwide,
          "boxOffice.roi": intelligence.roi,
          "boxOffice.profit": intelligence.profit,
          verdict: intelligence.verdict,
          lastBackfillAttempt: new Date(),
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Box Office Intelligence Synced",
      data: {
        movieName: updatedMovie.movieTitle || updatedMovie.title,
        budget: updatedMovie.budget,
        openingWeekend: updatedMovie.boxOffice?.openingWeekend,
        collection: updatedMovie.boxOffice?.worldwide,
        roi: updatedMovie.boxOffice?.roi,
        profit: updatedMovie.boxOffice?.profit,
        verdict: updatedMovie.verdict,
      },
    });

  } catch (error) {
    console.error("CRITICAL Sync Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
