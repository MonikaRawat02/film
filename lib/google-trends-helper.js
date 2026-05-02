/**
 * Google Trends Integration for OTT Audience Analysis
 * Fetches trending search data for streaming platforms and content
 */

const GOOGLE_TRENDS_API_URL = process.env.GOOGLE_TRENDS_API_URL;

// Helper to fetch Google Trends data
async function fetchTrendsData(hl = 'en-US', tz = 360) {
  try {
    const url = new URL(GOOGLE_TRENDS_API_URL);
    url.searchParams.append('hl', hl);
    url.searchParams.append('tz', tz.toString());
    url.searchParams.append('geo', 'IN'); // India focus
    
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Trends API Error: ${response.status}`);
    }

    const text = await response.text();
    // Google Trends returns JSONP, extract JSON
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Google Trends Error:', error);
    return null;
  }
}

// Parse trending searches
export function parseTrendingSearches(data) {
  if (!data?.default?.trendingSearchesDays) {
    return [];
  }

  const searches = [];
  data.default.trendingSearchesDays.forEach(day => {
    if (day.trendingSearches) {
      day.trendingSearches.forEach(search => {
        searches.push({
          title: search.title?.query || 'Unknown',
          traffic: search.formattedTraffic || '0',
          relatedQueries: search.relatedQueries?.map(q => q.query) || [],
          image: search.image?.newsUrl || null,
          date: search.date
        });
      });
    }
  });

  return searches;
}

// Filter OTT-related trends
export function filterOTTSearches(searches) {
  const ottKeywords = [
    'netflix', 'prime video', 'hotstar', 'disney', 
    'amazon prime', 'ott', 'streaming', 'web series',
    'movie', 'film', 'series', 'show'
  ];

  return searches.filter(search => {
    const title = search.title.toLowerCase();
    return ottKeywords.some(keyword => title.includes(keyword));
  });
}

// Get trending OTT platforms
export async function getTrendingOTTPlatforms() {
  const data = await fetchTrendsData();
  const searches = parseTrendingSearches(data);
  const ottSearches = filterOTTSearches(searches);

  // Count platform mentions
  const platformCounts = {
    'Netflix': 0,
    'Amazon Prime Video': 0,
    'Disney+ Hotstar': 0,
    'Apple TV+': 0,
    'SonyLIV': 0,
    'Zee5': 0
  };

  ottSearches.forEach(search => {
    if (search.title.toLowerCase().includes('netflix')) platformCounts['Netflix']++;
    if (search.title.toLowerCase().includes('prime') || search.title.toLowerCase().includes('amazon')) {
      platformCounts['Amazon Prime Video']++;
    }
    if (search.title.toLowerCase().includes('hotstar') || search.title.toLowerCase().includes('disney')) {
      platformCounts['Disney+ Hotstar']++;
    }
  });

  return platformCounts;
}

// Get trending content keywords
export async function getTrendingContentKeywords() {
  const data = await fetchTrendsData();
  const searches = parseTrendingSearches(data);
  const ottSearches = filterOTTSearches(searches);

  return ottSearches.slice(0, 10).map(search => ({
    keyword: search.title,
    traffic: search.traffic,
    related: search.relatedQueries.slice(0, 3)
  }));
}

export default {
  fetchTrendsData,
  parseTrendingSearches,
  filterOTTSearches,
  getTrendingOTTPlatforms,
  getTrendingContentKeywords
};
