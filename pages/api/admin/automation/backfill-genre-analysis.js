import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import { generateMovieContent } from "../../../../lib/ai-generator";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  
  // Security check (only POST allowed)
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    
    // Find articles that are missing genreAnalysis
    const articles = await Article.find({
      $or: [
        { genreAnalysis: { $exists: false } },
        { genreAnalysis: "" },
        { genreAnalysis: null }
      ],
      contentType: "movie"
    }).limit(10); // Process in small batches to avoid timeouts

    if (articles.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "No more articles require genre analysis backfilling.",
        processed: 0 
      });
    }

    let updatedCount = 0;
    const results = [];

    for (const article of articles) {
      try {
        console.log(`🤖 Generating Genre Analysis for: ${article.movieTitle || article.title}`);
        
        const aiResult = await generateMovieContent({
          movieTitle: article.movieTitle || article.title,
          releaseYear: article.releaseYear,
          genres: article.genres || []
        }, "genre-analysis");

        if (aiResult && aiResult.content) {
          await Article.findByIdAndUpdate(article._id, {
            $set: { genreAnalysis: aiResult.content }
          });
          updatedCount++;
          results.push({ title: article.title, status: "success" });
        } else {
          results.push({ title: article.title, status: "failed_ai" });
        }
      } catch (err) {
        console.error(`❌ Error backfilling genre for ${article.title}:`, err.message);
        results.push({ title: article.title, status: "error", error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully backfilled genre analysis for ${updatedCount} articles.`,
      results
    });

  } catch (error) {
    console.error("Genre backfill error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
