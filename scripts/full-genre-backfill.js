const mongoose = require('mongoose');
const OpenAI = require('openai');
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

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runFullBackfill() {
  try {
    console.log("🚀 Starting Full Genre Analysis Backfill (OpenAI Only)...");
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

          if (openai) {
            console.log(`🤖 Using OpenAI (${MODEL}) for ${article.title}...`);
            const completion = await openai.chat.completions.create({
              model: MODEL,
              messages: [{ role: "user", content: prompt }],
              max_tokens: 200,
              temperature: 0.7
            });

            const analysis = completion.choices[0]?.message?.content?.trim();

            if (analysis) {
              await Article.findByIdAndUpdate(article._id, { $set: { genreAnalysis: analysis } });
              console.log(`✅ Updated.`);
              // Small delay for OpenAI rate limits
              await sleep(1000);
              break; 
            }
          }
        } catch (err) {
          retryCount++;
          console.warn(`⚠️ Error on try ${retryCount}: ${err.message}`);
          await sleep(2000 * retryCount);
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
