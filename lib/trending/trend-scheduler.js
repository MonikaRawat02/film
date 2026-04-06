// Trend Scheduling System - Runs Google Trends and YouTube on 1-hour intervals
// lib/trending/trend-scheduler.js

import cron from "node-cron";
import fetch from "node-fetch";

const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";
const NEXT_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

let googleTrendsJob = null;
let youtubeTrendsJob = null;

// Initialize Google Trends sync job (runs every 1 hour at :00)
export function initializeGoogleTrendsCron() {
  googleTrendsJob = cron.schedule("0 * * * *", async () => {
    const timestamp = new Date().toLocaleString();
    console.log(`\n[${timestamp}] [START] Google Trends Sync`);

    try {
      const response = await fetch(`${NEXT_URL}/api/trending/google-trends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": CRON_SECRET,
        },
        timeout: 120000,
      });

      if (!response.ok) {
        console.error(`[ERROR] Google Trends Sync failed with status ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        console.log(`[SUCCESS] Google Trends Sync:`);
        console.log(`   Processed: ${data.stats.processed}`);
        console.log(`   Validated: ${data.stats.validated}`);
        console.log(`   Movies: ${data.stats.movies}, Actors: ${data.stats.actors}, Topics: ${data.stats.topics}`);
      } else {
        console.error(`[ERROR] Google Trends Sync returned error: ${data.message}`);
      }
    } catch (error) {
      console.error(`[ERROR] CRON ERROR (Google Trends): ${error.message}`);
    }
  });

  console.log("[SCHEDULED] Google Trends CRON: Every hour at :00");
}

// Initialize YouTube Trends sync job (runs every 1 hour at :30, 30 mins offset)
export function initializeYouTubeTrendsCron() {
  youtubeTrendsJob = cron.schedule("30 * * * *", async () => {
    const timestamp = new Date().toLocaleString();
    console.log(`\n[${timestamp}] [START] YouTube Trends Sync`);

    try {
      const response = await fetch(`${NEXT_URL}/api/trending/youtube-trends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": CRON_SECRET,
        },
        timeout: 120000,
      });

      if (!response.ok) {
        console.error(`[ERROR] YouTube Trends Sync failed with status ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        console.log(`[SUCCESS] YouTube Trends Sync:`);
        console.log(`   Processed: ${data.stats.processed}`);
        console.log(`   Validated: ${data.stats.validated}`);
        console.log(`   Movies: ${data.stats.movies}, Actors: ${data.stats.actors}, Topics: ${data.stats.topics}`);
      } else {
        console.error(`[ERROR] YouTube Trends Sync returned error: ${data.message}`);
      }
    } catch (error) {
      console.error(`[ERROR] CRON ERROR (YouTube Trends): ${error.message}`);
    }
  });

  console.log("[SCHEDULED] YouTube Trends CRON: Every hour at :30 (30 mins after Google)");
}

// Initialize both trend syncing jobs
export function initializeTrendAutomation() {
  console.log("\n" + "=".repeat(70));
  console.log("[START] Initializing Trend Automation System");
  console.log("=".repeat(70));

  initializeGoogleTrendsCron();
  initializeYouTubeTrendsCron();

  console.log("\n[INFO] Automation Schedule:");
  console.log("   - Google Trends:  Every hour at :00 (e.g., 2:00, 3:00)");
  console.log("   - YouTube Trends: Every hour at :30 (e.g., 2:30, 3:30)\n");
}

// Stop all trend sync jobs
export function stopTrendAutomation() {
  if (googleTrendsJob) {
    googleTrendsJob.stop();
    console.log("[STOPPED] Google Trends CRON");
  }

  if (youtubeTrendsJob) {
    youtubeTrendsJob.stop();
    console.log("[STOPPED] YouTube Trends CRON");
  }
}

// Get automation status
export function getTrendAutomationStatus() {
  return {
    googleTrendsActive: googleTrendsJob ? !googleTrendsJob._destroyed : false,
    youtubeTrendsActive: youtubeTrendsJob ? !youtubeTrendsJob._destroyed : false,
    schedule: {
      googleTrends: "Every hour at :00",
      youtubeTrends: "Every hour at :30 (30 mins offset)",
    },
  };
}

export default {
  initializeTrendAutomation,
  initializeGoogleTrendsCron,
  initializeYouTubeTrendsCron,
  stopTrendAutomation,
  getTrendAutomationStatus,
};
