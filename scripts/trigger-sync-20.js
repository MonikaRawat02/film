
const axios = require('axios');

async function triggerSync() {
  try {
    console.log("🚀 Triggering sync for 20 movies...");
    const response = await axios.post('http://localhost:3000/api/admin/automation/run-daily-sync', {
      limit: 20,
      forceRefresh: false
    }, {
      headers: {
        'x-cron-secret': 'filmyfire_automation_secret_2026'
      }
    });
    
    console.log("✅ Sync Triggered Successfully!");
    console.log("📊 Result:", JSON.stringify(response.data, null, 2));
    console.log("\n🤖 Background enrichment and AI generation will now continue for several minutes...");
  } catch (error) {
    console.error("❌ Sync Failed:", error.response?.data || error.message);
  }
}

triggerSync();
