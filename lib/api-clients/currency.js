import axios from 'axios';

const API_URL = 'https://open.er-api.com/v6/latest/USD';

/**
 * Fetches the latest USD to INR exchange rate.
 * @returns {Promise<number | null>} The current USD to INR exchange rate or null if it fails.
 */
export async function getUsdToInrRate() {
  try {
    const response = await axios.get(API_URL, { timeout: 5000 });
    if (response.data && response.data.rates && response.data.rates.INR) {
      const rate = parseFloat(response.data.rates.INR.toFixed(2));
      console.log(`✅ Successfully fetched live USD to INR rate: ${rate}`);
      return rate;
    }
    console.warn('⚠️ Currency API returned invalid data format.');
    return null;
  } catch (error) {
    console.error(`❌ Failed to fetch live currency exchange rate: ${error.message}`);
    return null;
  }
}
