import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from film/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function runTest() {
  // Use dynamic imports to ensure dotenv is loaded first
  const { scrapeWikipediaMovie, getMoviesByYear } = await import("../lib/scrapers/wikipedia.js");
  const { default: dbConnect } = await import("../lib/mongodb.js");
  const { default: Article } = await import("../model/article.js");
  const { slugify } = await import("../lib/slugify.js");

  console.log("🚀 Starting Wikipedia Scraper & Database Injection...");

  try {
    // 1. Connect to Database
    console.log("\n--- Step 1: Connecting to MongoDB ---");
    await dbConnect();
    console.log("✅ Database connected successfully.");

    const year = 2026;
    const categories = ["Bollywood", "Hollywood"];

    for (const category of categories) {
      console.log(`\n--- Processing ${category} movies for ${year} ---`);
      
      // 2. Fetch movie list
      const movieUrls = await getMoviesByYear(year, category);
      console.log(`✅ Found ${movieUrls.length} ${category} movies for ${year}.`);
      
      // Limit to 5 for better coverage
      const moviesToScrape = movieUrls.slice(0, 5);
      console.log(`🔍 Scraping and injecting ${moviesToScrape.length} movies...`);

      for (const movieInfo of moviesToScrape) {
        try {
          console.log(`\nScraping: ${movieInfo.title}...`);
          const scrapedData = await scrapeWikipediaMovie(movieInfo.url);
          
          if (!scrapedData) {
            console.warn(`⚠️ No data found for ${movieInfo.title}`);
            continue;
          }

          console.log(`📝 Sections found: ${scrapedData.sections?.length || 0}`);
          if (scrapedData.sections?.length > 0) {
            scrapedData.sections.forEach(s => console.log(`   - ${s.heading}`));
          }

          const movieSlug = slugify(scrapedData.title);
          
          const articleData = {
            title: `${scrapedData.title} (${scrapedData.releaseYear}) – Full Analysis, Box Office & OTT Details`,
            slug: movieSlug,
            coverImage: scrapedData.poster || "",
            category: category,
            contentType: "movie",
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
            highlights: scrapedData.highlights || [],
            status: "draft",
            tags: [category, scrapedData.releaseYear?.toString(), "Movie Analysis", ...scrapedData.genres].filter(Boolean),
            meta: {
              title: `${scrapedData.title} (${scrapedData.releaseYear}) - Box Office, Cast & Review`,
              description: `Explore the full analysis of ${scrapedData.title} (${scrapedData.releaseYear}). Includes box office collection, budget, cast, and ending explained.`,
              canonical: `/movie/${movieSlug}`,
            }
          };

          // Upsert to database
          await Article.findOneAndUpdate(
            { slug: movieSlug },
            { $set: articleData },
            { upsert: true, new: true }
          );

          console.log(`✅ Successfully injected: ${scrapedData.title}`);
        } catch (err) {
          console.error(`❌ Failed to process ${movieInfo.title}:`, err.message);
        }
      }
    }

    console.log("\n🚀 All tasks completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    process.exit(1);
  }
}

runTest();
