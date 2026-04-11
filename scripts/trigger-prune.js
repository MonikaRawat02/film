
const axios = require('axios');

async function triggerPrune() {
  try {
    const response = await axios.post('http://localhost:3000/api/admin/automation/prune-db', {
      secret: 'filmyfire_automation_secret_2026'
    });
    console.log('✅ Prune Result:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Prune Failed:', error.response?.data || error.message);
  }
}

triggerPrune();
