import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import Celebrity from "../../../../model/celebrity";
import { enrichMovieWithTMDB, fetchCelebrityFromTMDB } from "../../../../lib/api-clients/tmdb";
import { getOTTAvailability } from "../../../../lib/api-clients/watchmode";
import { generateMovieContent } from "../../../../lib/ai-generator";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ message: "Movie slug is required" });
  }

  try {
    await dbConnect();
    const movie = await Article.findOne({ slug });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    console.log(`🎬 Enriching ${movie.movieTitle} with TMDB data...`);
    const tmdbData = await enrichMovieWithTMDB(movie.movieTitle, movie.releaseYear);

    if (!tmdbData) {
      return res.status(200).json({ 
        success: true, 
        message: `No TMDB data found for ${movie.movieTitle}. Skipping update.` 
      });
    }

    // --- OTT Availability (Watchmode) ---
    let ottData = null;
    if (tmdbData.imdbId) {
      console.log(`📡 Fetching OTT availability for ${movie.movieTitle} (${tmdbData.imdbId})...`);
      ottData = await getOTTAvailability(tmdbData.imdbId);
    }
    // --- End OTT Availability ---

    // --- Genre Analysis Automation ---
    let genreAnalysis = "";
    try {
      console.log(`🤖 Generating Genre Analysis for ${movie.movieTitle}...`);
      const aiResult = await generateMovieContent({
        movieTitle: movie.movieTitle,
        releaseYear: movie.releaseYear,
        genres: tmdbData.genres
      }, "genre-analysis");
      if (aiResult && aiResult.content) {
        genreAnalysis = aiResult.content;
      }
    } catch (genreErr) {
      console.error(`❌ Genre Analysis failed for ${movie.movieTitle}:`, genreErr.message);
    }
    // --- End Genre Analysis Automation ---

    await Article.updateOne(
      { _id: movie._id },
      {
        $set: {
          cast: tmdbData.cast,
          crew: tmdbData.crew,
          coverImage: movie.coverImage || tmdbData.coverImage,
          backdropImage: movie.backdropImage || tmdbData.backdropImage,
          tagline: tmdbData.tagline || movie.tagline,
          certification: tmdbData.certification || movie.certification,
          runtime: tmdbData.runtime || movie.runtime,
          releaseDate: tmdbData.releaseDate || movie.releaseDate,
          tmdbId: tmdbData.tmdbId,
          imdbId: tmdbData.imdbId,
          rating: tmdbData.rating ?? movie.rating,
          recommendations: tmdbData.recommendations || movie.recommendations,
          genreAnalysis: genreAnalysis || movie.genreAnalysis,
          ottPlatforms: ottData ? ottData.allSources : movie.ottPlatforms,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `Successfully enriched ${movie.movieTitle} with TMDB and Watchmode data.`,
    });

  } catch (error) {
    console.error(`Error in movie enrichment API for ${slug}:`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
