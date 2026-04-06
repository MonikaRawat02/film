// Manual script to trigger trend sync
// Run with: node scripts/manual-trend-sync.js

import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const NEXT_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

async function syncTrends() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 Manual Trend Sync Trigger");
  console.log("=".repeat(70));
  console.log(`\n📍 Target: ${NEXT_URL}/api/trending/sync`);

  try {
    console.log("\n⏳ Sending sync request...");

    const response = await fetch(`${NEXT_URL}/api/trending/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": CRON_SECRET
      },
      timeout: 300000 // 5 minutes
    });

    const data = await response.json();

    if (response.ok) {
      console.log("\n✅ Sync Successful!\n");
      console.log("📊 Statistics:");
      console.log(`   Total Processed: ${data.stats.processed}`);
      console.log(`   Validated: ${data.stats.validated}`);
      console.log(`   Rejected: ${data.stats.rejected}`);
      console.log(`   Breakdown:`);
      console.log(`      🎬 Movies: ${data.stats.movies}`);
      console.log(`      👤 Actors: ${data.stats.actors}`);
      console.log(`      📊 Topics: ${data.stats.topics}`);
      console.log(`   Saved: ${data.stats.saved}`);

      console.log("\n✨ You can now fetch trending data from /api/trending");
    } else {
      console.log("\n❌ Sync Failed!");
      console.log(`Status: ${response.status}`);
      console.log(`Message: ${data.message}`);
      if (data.error) console.log(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(70) + "\n");
  process.exit(0);
}

syncTrends();
