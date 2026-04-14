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

  const { limit = 20 } = req.body; // Increased default from 10 to 20 per sync run

  try {
    await dbConnect();
    const currentYear = new Date().getFullYear();
    const categories = ["Hollywood", "Bollywood"];
    const results = {
      totalSynced: 0,
      totalFailed: 0,
      details: []
    };

    const MAX_PER_CATEGORY = Math.ceil(limit / categories.length);

    for (const category of categories) {
      const movieUrls = await getMoviesByYear(currentYear, category);
      let syncedInCategory = 0;

      // Scan the entire list until we find MAX_PER_CATEGORY new movies
      for (const movieInfo of movieUrls) {
        if (syncedInCategory >= MAX_PER_CATEGORY) break;

        try {
          const movieSlug = slugify(movieInfo.title);
          const existing = await Article.findOne({ slug: movieSlug });
          if (existing) {
            continue; 
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
            
            // Map pSEO Content fields from scraper
            pSEO_Content_overview: scrapedData.pSEO_Content_overview || [],
            pSEO_Content_ending_explained: scrapedData.pSEO_Content_ending_explained || [],
            pSEO_Content_box_office: scrapedData.pSEO_Content_box_office || [],
            pSEO_Content_budget: scrapedData.pSEO_Content_budget || [],
            pSEO_Content_ott_release: scrapedData.pSEO_Content_ott_release || [],
            pSEO_Content_cast: scrapedData.pSEO_Content_cast || [],
            pSEO_Content_review_analysis: scrapedData.pSEO_Content_review_analysis || [],
            pSEO_Content_hit_or_flop: scrapedData.pSEO_Content_hit_or_flop || [],

            meta: {
              title: `${scrapedData.title} (${scrapedData.releaseYear}) - Box Office, Cast & Review`,
              description: `Explore the full analysis of ${scrapedData.title}. Includes box office, budget, cast, and more.`,
              canonical: `/movie/${finalSlug}`,
            }
          };

          const newArticle = await Article.findOneAndUpdate(
            { slug: finalSlug },
            { $set: articleData },
            { upsert: true, new: true }
          );
          console.log(`✅ Saved/Updated article: ${newArticle.title} (${newArticle._id})`);

          // Trigger enrichment and sub-page generation
          (async () => {
            try {
              const baseUrl = `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;
              const headers = { 'x-cron-secret': cronSecret };
              
              // First, enrich the data with TMDB
              await axios.post(`${baseUrl}/api/admin/automation/enrich-movie-data`, {
                slug: finalSlug
              }, { headers });

              // Then, generate all sub-pages
              await axios.post(`${baseUrl}/api/admin/automation/generate-sub-pages`, {
                slug: finalSlug
              }, { headers });

              console.log(`✅ Triggered all post-processing for ${finalSlug}`);
            } catch (postProcessErr) {
              console.error(`❌ Post-processing trigger failed for ${finalSlug}:`, postProcessErr.message);
            }
          })();

          syncedInCategory++;
        } catch (err) {
          console.error(`Failed to sync ${movieInfo.title}:`, err.message);
        }
      }
      results.totalSynced += syncedInCategory;
      results.details.push(`${category}: ${syncedInCategory} new movies synced.`);
    }

    return res.status(200).json({
      success: true,
      message: `Daily sync completed. Total new movies: ${results.totalSynced}`,
      data: results.details
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
