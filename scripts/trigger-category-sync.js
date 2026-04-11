
const axios = require('axios');

async function triggerCategorySync() {
  try {
    const categoriesToSync = ["BoxOffice", "WebSeries", "OTT"];
    console.log(`🚀 Triggering sync for ${categoriesToSync.join(", ")} (10 each)...`);
    
    const response = await axios.post('http://localhost:3000/api/admin/automation/run-daily-sync', {
      limit: 30, // 10 per category
      categories: categoriesToSync,
      forceRefresh: false
    }, {
      headers: {
        'x-cron-secret': 'filmyfire_automation_secret_2026'
      }
    });
    
    console.log("✅ Category Sync Triggered Successfully!");
    console.log("📊 Result:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Category Sync Failed:", error.response?.data || error.message);
  }
}

triggerCategorySync();
