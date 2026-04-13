
const axios = require('axios');

async function triggerEnrichment() {
  try {
    console.log(`🚀 Triggering bulk enrichment for celebrities...`);
    
    const response = await axios.post('http://localhost:3000/api/admin/automation/enrich-celebrity', {
      limit: 20 // Enriches 20 celebrities per run
    }, {
      headers: {
        'x-cron-secret': 'filmyfire_automation_secret_2026'
      }
    });
    
    console.log("✅ Enrichment Result:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Enrichment Failed:", error.response?.data || error.message);
  }
}

triggerEnrichment();
