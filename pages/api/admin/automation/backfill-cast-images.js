import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import { enrichMovieWithTMDB } from "../../../../lib/api-clients/tmdb";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret && req.query.secret !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await dbConnect();
    
    // Find movies that have cast but no profile images, or haven't been backfilled yet
    const movies = await Article.find({
      contentType: "movie",
      $or: [
        { "cast.profileImage": "" },
        { "cast.profileImage": { $exists: false } },
        { lastBackfillAttempt: { $exists: false } }
      ]
    }).limit(10); // Batch process 10 movies at a time to avoid rate limits

    if (movies.length === 0) {
      return res.status(200).json({ success: true, message: "All movies already have profile images or are fully enriched." });
    }

    const results = [];

    for (const movie of movies) {
      console.log(`🎬 Backfilling cast images for ${movie.movieTitle}...`);
      const tmdbData = await enrichMovieWithTMDB(movie.movieTitle, movie.releaseYear);

      if (tmdbData && tmdbData.cast) {
        await Article.updateOne(
          { _id: movie._id },
          { 
            $set: { 
              cast: tmdbData.cast, 
              crew: tmdbData.crew,
              lastBackfillAttempt: new Date()
            } 
          }
        );
        results.push({ slug: movie.slug, status: "Success", castCount: tmdbData.cast.length });
      } else {
        await Article.updateOne(
          { _id: movie._id },
          { $set: { lastBackfillAttempt: new Date() } }
        );
        results.push({ slug: movie.slug, status: "No TMDB Data Found" });
      }
    }

    return res.status(200).json({
      success: true,
      processedCount: movies.length,
      results
    });

  } catch (error) {
    console.error("Backfill error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
