const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Define Minimal Schema
const ArticleSchema = new mongoose.Schema({
  title: String,
  movieTitle: String,
  releaseYear: Number,
  genres: [String],
  genreAnalysis: String,
  contentType: String
});

const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);

// Initialize Gemini (PRIMARY - FREE)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runFullBackfill() {
  try {
    console.log("🚀 Starting Full Genre Analysis Backfill (Gemini Only)...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const articles = await Article.find({
      contentType: "movie",
      $or: [
        { genreAnalysis: { $exists: false } },
        { genreAnalysis: "" },
        { genreAnalysis: null }
      ]
    });

    console.log(`🔍 Found ${articles.length} articles needing update.`);

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`[${i + 1}/${articles.length}] Processing: ${article.movieTitle || article.title}`);

      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const prompt = `Analyze the genre and cinematic style of "${article.movieTitle || article.title}" (${article.releaseYear}). 
          Provide a concise, 2-3 sentence structured analysis that explains exactly what type of movie it is.
          Focus on blending genres (e.g., "A supernatural horror comedy that balances genuine scares with sharp social satire").
          Output ONLY the analysis text, no headings or formatting.`;

          let analysis = "";
          let success = false;

          // Use Google Gemini (FREE)
          if (genAI) {
            try {
              console.log(`🤖 Using Google Gemini (FREE) for ${article.title}...`);
              const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
              const result = await model.generateContent(prompt);
              const response = await result.response;
              analysis = response.text().trim();
              success = true;
            } catch (geminiErr) {
              if (geminiErr.message?.includes('429')) {
                console.warn(`⚠️ Gemini 429: Rate limit hit. Waiting 60 seconds...`);
                await sleep(60000);
                retryCount++;
                continue;
              } else {
                console.error(`❌ Google Gemini failed: ${geminiErr.message}`);
              }
            }
          }

          if (success && analysis) {
            await Article.findByIdAndUpdate(article._id, { $set: { genreAnalysis: analysis } });
            console.log(`✅ Updated.`);
            // Add a small delay between requests to avoid hitting rate limits
            await sleep(12000); // 12 seconds per request (5 RPM)
          }
          break; // Exit the retry loop on success or non-retryable failure
        } catch (err) {
          console.error(`❌ Error: ${err.message}`);
          break;
        }
      }
    }

    console.log("🏁 Backfill complete.");
    process.exit(0);
  } catch (error) {
    console.error("FATAL ERROR:", error);
    process.exit(1);
  }
}

runFullBackfill();
