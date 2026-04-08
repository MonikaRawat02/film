import axios from "axios";
import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import { getMoviesByYear, scrapeWikipediaMovie } from "../../../../lib/scrapers/wikipedia";
import { slugify } from "../../../../lib/slugify";

export default async function handler(req, res) {
  // Security check for production
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { year, category, limit = 50 } = req.body;

  if (!year || !category) {
    return res.status(400).json({ message: "Year and Category are required" });
  }

  try {
    await dbConnect();

    const movieUrls = await getMoviesByYear(year, category);
    const results = {
      totalFound: movieUrls.length,
      synced: 0,
      failed: 0,
      movies: []
    };

    // Limit the number of movies to scrape per request to avoid timeouts
    const moviesToScrape = movieUrls.slice(0, limit);

    for (const movieInfo of moviesToScrape) {
      try {
        const scrapedData = await scrapeWikipediaMovie(movieInfo.url);
        if (!scrapedData) {
          results.failed++;
          continue;
        }

        const movieSlug = slugify(scrapedData.title);
        
        const articleData = {
          title: `${scrapedData.title} (${scrapedData.releaseYear}) – Full Analysis, Box Office & OTT Details`,
          slug: movieSlug,
          coverImage: scrapedData.poster,
          category: category,
          contentType: category.toLowerCase() === 'webseries' ? "webseries" : "movie",
          movieTitle: scrapedData.title,
          releaseYear: scrapedData.releaseYear,
          summary: scrapedData.summary,
          budget: scrapedData.budget,
          boxOffice: {
            worldwide: scrapedData.boxOffice.worldwide,
          },
          cast: scrapedData.cast,
          director: scrapedData.director,
          producer: scrapedData.producer,
          writer: scrapedData.writer,
          genres: scrapedData.genres,
          criticalResponse: scrapedData.criticalResponse,
          sections: scrapedData.sections || [],
          ott: {
            platform: scrapedData.ottPlatform || "",
            releaseDate: scrapedData.releaseYear ? new Date(scrapedData.releaseYear, 0, 1) : null,
          },
          status: "published",
          publishedAt: new Date(),
          tags: [category, scrapedData.releaseYear?.toString(), "Movie Analysis", ...scrapedData.genres].filter(Boolean),
          meta: {
            title: `${scrapedData.title} (${scrapedData.releaseYear}) - Box Office, Cast & Review`,
            description: `Explore the full analysis of ${scrapedData.title} (${scrapedData.releaseYear}). Includes box office collection, budget, cast, and ending explained.`,
            canonical: `/movie/${movieSlug}`,
          }
        };

        // Update if exists, otherwise create
        const updatedArticle = await Article.findOneAndUpdate(
          { slug: movieSlug },
          { $set: articleData },
          { upsert: true, new: true }
        );

        // --- NEW: Trigger AI Content Generation in background ---
        (async () => {
          try {
            console.log(`🤖 Starting background AI Content Generation for ${movieSlug}...`);
            const protocol = req.headers["x-forwarded-proto"] || "http";
            const host = req.headers.host;
            const baseUrl = `${protocol}://${host}`;
            const headers = { 
              "Content-Type": "application/json",
              "x-cron-secret": cronSecret
            };
            
            const subPages = [
              "overview",
              "ending-explained",
              "box-office",
              "budget",
              "ott-release",
              "cast",
              "review-analysis",
              "hit-or-flop"
            ];

            for (const pageType of subPages) {
              try {
                console.log(`⏳ Generating ${pageType} for ${movieSlug}...`);
                await axios.post(`${baseUrl}/api/admin/automation/generate-ai-content`, {
                  slug: movieSlug,
                  pageType
                }, { headers, timeout: 120000 });
              } catch (subErr) {
                console.error(`❌ Failed to generate ${pageType} for ${movieSlug}:`, subErr.message);
              }
            }
            console.log(`✅ Finished AI generation for ${movieSlug}`);
          } catch (aiTriggerErr) {
            console.error(`❌ AI Content Background Task Failed for ${movieSlug}:`, aiTriggerErr.message);
          }
        })();

        results.synced++;
        results.movies.push(scrapedData.title);
      } catch (err) {
        console.error(`Failed to sync ${movieInfo.title}:`, err.message);
        results.failed++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully synced ${results.synced} movies for ${year}`,
      data: results
    });

  } catch (error) {
    console.error("Scraping automation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
