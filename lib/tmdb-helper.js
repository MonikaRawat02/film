/**
 * TMDB API Integration for OTT Intelligence
 * Fetches movie/series data, posters, and trending content
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper function to make TMDB API calls
async function tmdbFetch(endpoint, params = {}) {
  try {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    url.searchParams.append('language', 'en-US');
    
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('TMDB API Error:', error);
    return null;
  }
}

// Get trending movies/shows
export async function getTrending(mediaType = 'movie', timeWindow = 'week') {
  return tmdbFetch(`/trending/${mediaType}/${timeWindow}`);
}

// Get movie/TV show details
export async function getDetails(mediaType, id) {
  return tmdbFetch(`/${mediaType}/${id}`, {
    append_to_response: 'credits,videos,images'
  });
}

// Search for movies/shows
export async function search(query, mediaType = 'multi') {
  return tmdbFetch(`/search/${mediaType}`, { query });
}

// Get popular content
export async function getPopular(mediaType = 'movie', page = 1) {
  return tmdbFetch(`/${mediaType}/popular`, { page: page.toString() });
}

// Get top rated content
export async function getTopRated(mediaType = 'movie', page = 1) {
  return tmdbFetch(`/${mediaType}/top_rated`, { page: page.toString() });
}

// Get poster/image URL
export function getImageUrl(path, size = 'w500') {
  if (!path) return '/placeholder.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Fetch OTT titles with TMDB data
export async function fetchOTTContent(platformName, limit = 20) {
  try {
    // Search for popular content that might be on this platform
    const trending = await getTrending('movie', 'week');
    const popular = await getPopular('movie', 1);
    
    const allContent = [...(trending?.results || []), ...(popular?.results || [])];
    
    // Remove duplicates and limit
    const unique = allContent
      .filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      )
      .slice(0, limit);

    // Enrich with full details
    const enriched = await Promise.all(
      unique.map(async (item) => {
        const details = await getDetails('movie', item.id);
        return {
          id: item.id,
          title: item.title || item.name,
          type: item.media_type || 'movie',
          rating: item.vote_average,
          popularity: item.popularity,
          poster: getImageUrl(item.poster_path),
          backdrop: getImageUrl(item.backdrop_path, 'w1280'),
          overview: item.overview,
          releaseDate: item.release_date || item.first_air_date,
          genres: details?.genres?.map(g => g.name) || [],
          voteCount: item.vote_count,
          tmdbId: item.id
        };
      })
    );

    return enriched;
  } catch (error) {
    console.error('Error fetching OTT content:', error);
    return [];
  }
}

// Get trending actors
export async function getTrendingActors() {
  const data = await tmdbFetch('/trending/person/week');
  return data?.results?.slice(0, 10) || [];
}

export default {
  getTrending,
  getDetails,
  search,
  getPopular,
  getTopRated,
  getImageUrl,
  fetchOTTContent,
  getTrendingActors
};
