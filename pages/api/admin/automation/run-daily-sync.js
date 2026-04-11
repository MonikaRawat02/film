import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import { getMoviesByYear, scrapeWikipediaMovie } from "../../../../lib/scrapers/wikipedia";
import { slugify } from "../../../../lib/slugify";
import axios from "axios";

export default async function handler(req, res) {
  // Security check for production
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { limit = 10, forceRefresh = false } = req.body; // Set default limit to 10

  try {
    await dbConnect();
    const currentYear = new Date().getFullYear();
    const categories = req.body.categories || ["Hollywood", "Bollywood"];
    const results = {
      totalSynced: 0,
      totalFailed: 0,
      details: []
    };

    const MAX_PER_CATEGORY = Math.ceil(limit / categories.length);

    for (const category of categories) {
      // Map WebSeries and BoxOffice to appropriate source categories if needed
      const sourceCategory = (category === "WebSeries" || category === "OTT") ? "WebSeries" : 
                            (category === "BoxOffice") ? "Bollywood" : category;
      
      const movieUrls = await getMoviesByYear(currentYear, sourceCategory);
      let syncedInCategory = 0;

      // Scan the entire list until we find MAX_PER_CATEGORY new movies
      for (const movieInfo of movieUrls) {
        if (syncedInCategory >= MAX_PER_CATEGORY) break;

        try {
          const movieSlug = slugify(movieInfo.title);
          const existing = await Article.findOne({ slug: movieSlug });
          
          // If not forcing refresh and movie exists, skip
          if (existing && !forceRefresh) {
            continue; 
          }

          // If movie exists but we are refreshing, check age (Requirement: 24h)
          if (existing && forceRefresh) {
            const lastUpdated = new Date(existing.updatedAt || existing.createdAt);
            const hoursSinceUpdate = (new Date() - lastUpdated) / (1000 * 60 * 60);
            if (hoursSinceUpdate < 24) {
              continue; // Skip if updated in the last 24 hours
            }
          }

          console.log(`🔍 Scraping new movie: ${movieInfo.title}...`);
          const scrapedData = await scrapeWikipediaMovie(movieInfo.url);
          if (!scrapedData) {
            console.warn(`⚠️ Failed to scrape: ${movieInfo.title}`);
            continue;
          }

          const finalSlug = slugify(scrapedData.title);
          const articleData = {
            title: `${scrapedData.title} (${scrapedData.releaseYear}) – Full Analysis`,
            slug: finalSlug,
            category: category,
            contentType: "movie",
            movieTitle: scrapedData.title,
            releaseYear: scrapedData.releaseYear,
            summary: scrapedData.summary,
            budget: scrapedData.budget,
            boxOffice: { worldwide: scrapedData.boxOffice.worldwide },
            cast: scrapedData.cast,
            director: scrapedData.director,
            producer: scrapedData.producer,
            writer: scrapedData.writer,
            genres: scrapedData.genres,
            criticalResponse: scrapedData.criticalResponse,
            status: "draft",
            tags: [category, scrapedData.releaseYear?.toString(), ...scrapedData.genres].filter(Boolean),
            
            // Initialize pSEO Content fields as empty arrays
            pSEO_Content_overview: [],
            pSEO_Content_ending_explained: [],
            pSEO_Content_box_office: [],
            pSEO_Content_budget: [],
            pSEO_Content_ott_release: [],
            pSEO_Content_cast: [],
            pSEO_Content_review_analysis: [],
            pSEO_Content_hit_or_flop: [],

            meta: {
              title: `${scrapedData.title} (${scrapedData.releaseYear}) - Box Office, Cast & Review`,
              description: `Explore the full analysis of ${scrapedData.title}. Includes box office, budget, cast, and more.`,
              canonical: `/movie/${finalSlug}`,
            }
          };

          const newArticle = await Article.findOneAndUpdate(
            { slug: finalSlug },
            { $set: articleData },
            { upsert: true, returnDocument: 'after' }
          );
          console.log(`✅ Saved/Updated article: ${newArticle.title} (${newArticle._id})`);

          syncedInCategory++;
        } catch (err) {
          console.error(`Failed to sync ${movieInfo.title}:`, err.message);
        }
      }
      results.totalSynced += syncedInCategory;
      results.details.push(`${category}: ${syncedInCategory} new movies synced.`);
    }

    // After all movies are synced, trigger a background process to enrich and generate content
    (async () => {
      try {
        const baseUrl = `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;
        const headers = { 'x-cron-secret': cronSecret };
        
        // Find movies that were just added or are missing enrichment
        const pendingMovies = await Article.find({
          contentType: "movie",
          isAIContent: { $ne: true } // Key indicator that AI content hasn't been generated
        }).limit(limit); // Limit to the same number of movies we synced

        console.log(`🤖 Starting background enrichment for ${pendingMovies.length} movies...`);

        for (const movie of pendingMovies) {
          try {
            // 1. First, enrich the data with TMDB
            await axios.post(`${baseUrl}/api/admin/automation/enrich-movie-data`, {
              slug: movie.slug
            }, { headers });

            // 2. Then, generate all sub-pages
            await axios.post(`${baseUrl}/api/admin/automation/generate-sub-pages`, {
              slug: movie.slug
            }, { headers });

            // 3. IF content generation fails or is incomplete, delete the movie to keep database clean
            const updatedMovie = await Article.findOne({ _id: movie._id });
            const hasAIContent = updatedMovie.isAIContent === true;
            
            if (!hasAIContent) {
              console.warn(`🗑️ Deleting ${movie.slug} because AI content generation failed.`);
              await Article.deleteOne({ _id: movie._id });
            } else {
              console.log(`✅ Successfully processed and KEPT ${movie.slug}`);
            }
          } catch (err) {
            console.error(`❌ Background processing failed for ${movie.slug}:`, err.message);
            // On failure, delete to maintain "only keep generated content" rule
            await Article.deleteOne({ _id: movie._id });
          }
        }
      } catch (bgErr) {
        console.error(`❌ Background task orchestrator failed:`, bgErr.message);
      }
    })();

    return res.status(200).json({
      success: true,
      message: `Daily sync completed. Total new movies synced: ${results.totalSynced}. Background enrichment triggered.`,
      data: results.details
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}