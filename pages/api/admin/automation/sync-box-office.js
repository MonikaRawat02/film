import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import { generateContent } from "../../../../lib/openai-helper";
import axios from "axios";

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
      openingDay: movie.boxOffice?.openingDay || "N/A",
      openingWeekend: movie.boxOffice?.openingWeekend || "N/A",
      firstWeek: movie.boxOffice?.firstWeek || "N/A",
      worldwide: movie.boxOffice?.worldwide || "N/A",
      overseas: movie.boxOffice?.overseas || "N/A",
      india: movie.boxOffice?.india || "N/A",
      roi: movie.boxOffice?.roi || "N/A",
      profit: movie.boxOffice?.profit || "N/A",
      verdict: movie.verdict || "AVERAGE",
    };

    // 1. Try OpenAI for the latest intelligence (Sacnilk/BollyHungama accuracy)
    try {
      const prompt = `Provide the latest and most accurate box office intelligence for the movie "${movieTitle}" (${releaseYear}). 
      I need specifically:
      1. Budget (in Crores or Dollars)
      2. Opening Day Collection (in Crores or Dollars)
      3. Opening Weekend Collection (in Crores or Dollars)
      4. First Week Collection (in Crores or Dollars)
      5. Worldwide Collection (in Crores or Dollars)
      6. Overseas Collection (in Crores or Dollars)
      7. India Net Collection (in Crores or Dollars)
      8. Profit or Net Profit (in Crores or Dollars)
      9. ROI (Return on Investment percentage)
      10. Verdict (Strictly one of: ALL TIME BLOCKBUSTER, BLOCKBUSTER, SUPER HIT, HIT, SEMI HIT, AVERAGE, BELOW AVERAGE, FLOP, DISASTER)

      Return the data in this exact JSON format:
      {
        "budget": "string",
        "opening_day": "string",
        "opening_weekend": "string",
        "first_week": "string",
        "worldwide": "string",
        "overseas": "string",
        "india_net": "string",
        "profit": "string",
        "roi": "string",
        "verdict": "string"
      }`;

      const text = await generateContent(prompt);
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0]);
          intelligence = {
            budget: aiData.budget || intelligence.budget,
            openingDay: aiData.opening_day || intelligence.openingDay,
            openingWeekend: aiData.opening_weekend || intelligence.openingWeekend,
            firstWeek: aiData.first_week || intelligence.firstWeek,
            worldwide: aiData.worldwide || intelligence.worldwide,
            overseas: aiData.overseas || intelligence.overseas,
            india: aiData.india_net || intelligence.india,
            profit: aiData.profit || intelligence.profit,
            roi: aiData.roi || intelligence.roi,
            verdict: aiData.verdict?.toUpperCase() || intelligence.verdict,
          };
          console.log(`✅ OpenAI Intelligence Success for ${movieTitle}`);
        }
      }
    } catch (aiErr) {
      console.error(`❌ OpenAI Intelligence Failed:`, aiErr.message);
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
          verdict: intelligence.verdict,
          "boxOffice.openingDay": intelligence.openingDay,
          "boxOffice.openingWeekend": intelligence.openingWeekend,
          "boxOffice.firstWeek": intelligence.firstWeek,
          "boxOffice.worldwide": intelligence.worldwide,
          "boxOffice.overseas": intelligence.overseas,
          "boxOffice.india": intelligence.india,
          "boxOffice.roi": intelligence.roi,
          "boxOffice.profit": intelligence.profit,
          "boxOffice.verdict": intelligence.verdict,
          lastTrendingSync: new Date(),
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
