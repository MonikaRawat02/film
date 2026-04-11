import axios from "axios";

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const WATCHMODE_BASE_URL = "https://api.watchmode.com/v1";

/**
 * Robust fetch wrapper for Watchmode with retry logic for 429 errors
 */
async function watchmodeFetch(url, params = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { 
        params,
        timeout: 10000 
      });
    } catch (err) {
      const isRateLimit = err.response?.status === 429;
      const isRetryable = isRateLimit || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.response?.status >= 500;
      
      if (i === retries - 1 || !isRetryable) throw err;
      
      // Exponential backoff: 2s, 4s, 8s... + jitter
      const delay = Math.pow(2, i + 1) * 1000 + Math.random() * 1000;
      console.log(`⚠️ Watchmode API Error (${err.response?.status || err.code}). Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${retries})`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

/**
 * Get OTT availability for a movie using its IMDB ID
 */
export async function getOTTAvailability(imdbId) {
  if (!WATCHMODE_API_KEY) {
    console.warn("WATCHMODE_API_KEY is not set in environment variables.");
    return null;
  }

  if (!imdbId) return null;

  try {
    const response = await watchmodeFetch(`${WATCHMODE_BASE_URL}/title/${imdbId}/sources/`, {
      apiKey: WATCHMODE_API_KEY,
      regions: "US,IN", // Focus on India and US markets
    });

    const sources = response.data;
    
    // Filter for subscription-based platforms (Netflix, Prime, etc.)
    const subSources = sources.filter(s => s.type === "sub");
    
    if (subSources.length === 0) return null;

    // Return the first available platform or a summary
    return {
      platform: subSources[0].name,
      link: subSources[0].web_url,
      region: subSources[0].region,
      allSources: subSources.map(s => ({
        name: s.name,
        link: s.web_url,
        region: s.region
      }))
    };
  } catch (error) {
    console.error(`Error getting OTT sources from Watchmode (${imdbId}):`, error.message);
    return null;
  }
}
