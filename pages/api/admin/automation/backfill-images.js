import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import { enrichMovieWithTMDB } from "../../../../lib/api-clients/tmdb";

export default async function handler(req, res) {
  // Use a secret token for security if needed, or check admin session
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    
    // 1. Find articles that NEED backfilling and haven't been attempted in the last 24 hours
    // This handles both new articles and those that failed previously
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const articles = await Article.find({
      $or: [
        { coverImage: { $exists: false } },
        { coverImage: "" },
        { coverImage: null },
        { coverImage: "/placeholder.jpg" },
        { rating: { $exists: false } },
        { rating: "" },
        { runtime: { $exists: false } },
        { runtime: "" },
        { backdropImage: { $exists: false } },
        { backdropImage: "" }
      ],
      contentType: "movie",
      $or: [
        { lastBackfillAttempt: { $exists: false } },
        { lastBackfillAttempt: { $lt: oneDayAgo } }
      ]
    }).limit(20);

    if (articles.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "No more articles require backfilling at this time.",
        processed: 0 
      });
    }

    let updatedCount = 0;
    const results = [];

    for (const article of articles) {
      try {
        console.log(`🎬 Backfilling: ${article.movieTitle || article.title}`);
        
        // Use TMDB to find the data
        const tmdbData = await enrichMovieWithTMDB(
          article.movieTitle || article.title.split('(')[0].trim(), 
          article.releaseYear
        );

        const updateData = {
          lastBackfillAttempt: new Date() // Always mark as attempted
        };

        if (tmdbData) {
          console.log(`⭐ Data found for ${article.title}: ${tmdbData.rating}, ${tmdbData.runtime}`);
          
          // Only update if TMDB has the data
          if (tmdbData.coverImage) updateData.coverImage = tmdbData.coverImage;
          if (tmdbData.backdropImage) updateData.backdropImage = tmdbData.backdropImage;
          if (tmdbData.tagline) updateData.tagline = tmdbData.tagline;
          if (tmdbData.certification) updateData.certification = tmdbData.certification;
          if (tmdbData.runtime) updateData.runtime = tmdbData.runtime;
          if (tmdbData.releaseDate) updateData.releaseDate = tmdbData.releaseDate;
          if (tmdbData.tmdbId) updateData.tmdbId = tmdbData.tmdbId;
          if (tmdbData.rating !== null && tmdbData.rating !== undefined) updateData.rating = tmdbData.rating;

          if (tmdbData.cast && tmdbData.cast.length > 0) updateData.cast = tmdbData.cast;
          if (tmdbData.crew && tmdbData.crew.length > 0) updateData.crew = tmdbData.crew;
        }

        // Perform single atomic update
        const updated = await Article.findByIdAndUpdate(
          article._id, 
          { $set: updateData },
          { new: true }
        );

        if (tmdbData) {
          updatedCount++;
          results.push({ id: article._id, title: article.title, status: "success" });
        } else {
          results.push({ id: article._id, title: article.title, status: "not_found_on_tmdb" });
        }
      } catch (err) {
        console.error(`❌ Error backfilling ${article.title}:`, err.message);
        results.push({ id: article._id, title: article.title, status: "error", error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${articles.length} articles. Updated ${updatedCount} images.`,
      processed: articles.length,
      updated: updatedCount,
      results
    });

  } catch (error) {
    console.error("Backfill images API error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
