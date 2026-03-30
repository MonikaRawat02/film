import axios from "axios";

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const WATCHMODE_BASE_URL = "https://api.watchmode.com/v1";

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
    const response = await axios.get(`${WATCHMODE_BASE_URL}/title/${imdbId}/sources/`, {
      params: {
        apiKey: WATCHMODE_API_KEY,
        regions: "US,IN", // Focus on India and US markets
      },
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
