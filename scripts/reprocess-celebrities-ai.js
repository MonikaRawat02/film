// Script to re-extract celebrity data with AI
import mongoose from "mongoose";
import Celebrity from "../model/celebrity.js";
import dotenv from "dotenv";

dotenv.config();

async function reprocessCelebrityData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const celebrities = await Celebrity.find({});
    console.log(`📊 Found ${celebrities.length} celebrities to process\n`);

    const protocol = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    for (const celebrity of celebrities) {
      const name = celebrity.heroSection?.name;
      const slug = celebrity.heroSection?.slug;

      if (!slug) {
        console.log(`⏭️  Skipping - No slug: ${name}`);
        continue;
      }

      console.log(`\n🎬 Processing: ${name}`);

      try {
        const response = await fetch(`${protocol}/api/celebrity/extract-details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, refresh: true })
        });

        const result = await response.json();

        if (result.success) {
          console.log(`✅ Extracted: Age=${result.data.age}, NetWorth=${result.data.netWorth?.displayUSD || 'N/A'}, Industry=${result.data.industry}`);
        } else {
          console.log(`❌ Failed: ${result.message}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("\n✅ Reprocessing complete!");
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

reprocessCelebrityData();
