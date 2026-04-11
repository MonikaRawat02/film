import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780"; // Upgraded from w300 for higher resolution banners

/**
 * Robust axios wrapper with retry logic for TMDB requests
 */
async function tmdbFetch(url, params = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { 
        params,
        timeout: 10000, // 10s timeout
        headers: { 'Accept-Encoding': 'identity' } // Avoid compression issues that can cause ECONNRESET
      });
    } catch (err) {
      const isRetryable = err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.status === 429 || err.status >= 500;
      if (i === retries - 1 || !isRetryable) throw err;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      console.log(`⚠️ TMDB Fetch Error (${err.code || err.status}). Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${retries})`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

/**
 * Searches for a movie on TMDB and enriches it with cast and image data.
 * @param {string} movieTitle The title of the movie.
 * @param {number} releaseYear The release year of the movie.
 * @returns {Promise<object|null>} Enriched movie data or null.
 */
export async function enrichMovieWithTMDB(movieTitle, releaseYear) {
  if (!TMDB_API_KEY) {
    console.warn("TMDB_API_KEY is not set. Skipping enrichment.");
    return null;
  }

  try {
    // 1. Clean title for better matching (remove year if present in title string)
    const cleanTitle = movieTitle.split('(')[0].trim();

    // 2. Search for the movie
    let searchResponse = await tmdbFetch(`${BASE_URL}/search/movie`, {
      api_key: TMDB_API_KEY,
      query: cleanTitle,
      year: releaseYear,
    });

    let movieResult = searchResponse.data.results?.[0];
    
    // Fallback: If no match found with year, try searching without year
    if (!movieResult) {
      console.log(`🟡 No match for ${cleanTitle} with year ${releaseYear}. Retrying without year...`);
      searchResponse = await tmdbFetch(`${BASE_URL}/search/movie`, {
        api_key: TMDB_API_KEY,
        query: cleanTitle,
      });
      movieResult = searchResponse.data.results?.[0];
    }

    if (!movieResult) {
      console.log(`❌ No TMDB match found for ${cleanTitle}`);
      return null;
    }

    // 3. Get movie details, including credits, release_dates, and recommendations
    const movieDetailsResponse = await tmdbFetch(`${BASE_URL}/movie/${movieResult.id}`, {
      api_key: TMDB_API_KEY,
      append_to_response: "credits,release_dates,recommendations",
    });

    const movie = movieDetailsResponse.data;
    
    // Find certification (e.g., PG, U/A, etc.)
    const indiaRelease = movie.release_dates?.results?.find(r => r.iso_3166_1 === "IN") || 
                        movie.release_dates?.results?.find(r => r.iso_3166_1 === "US");
    const certification = indiaRelease?.release_dates?.[0]?.certification || "";

    const enrichedData = {
      tmdbId: movie.id,
      imdbId: movie.imdb_id, // Add IMDB ID for Watchmode support
      rating: (movie.vote_average !== undefined && movie.vote_average !== null) ? movie.vote_average.toFixed(1) : null,
      coverImage: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "",
      backdropImage: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : "",
      tagline: movie.tagline || "",
      runtime: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "",
      releaseDate: movie.release_date || "",
      certification: certification,
      budget: movie.budget || 0,
      revenue: movie.revenue || 0,
      cast: movie.credits.cast
        .slice(0, 15) // Limit to top 15 cast members
        .map(person => ({
          name: person.name,
          role: person.character,
          profileImage: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : "",
          slug: person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        })),
      crew: movie.credits.crew
        .filter(p => ["Director", "Writer", "Producer", "Screenplay"].includes(p.job))
        .map(person => ({
          name: person.name,
          job: person.job,
          department: person.department,
          profileImage: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : "",
          slug: person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        })),
      recommendations: movie.recommendations?.results?.slice(0, 8).map(rec => ({
        tmdbId: rec.id,
        title: rec.title,
        releaseYear: rec.release_date ? new Date(rec.release_date).getFullYear() : null,
        rating: (rec.vote_average !== undefined && rec.vote_average !== null) ? rec.vote_average.toFixed(1) : null,
        coverImage: rec.poster_path ? `${IMAGE_BASE_URL}${rec.poster_path}` : "",
        backdropImage: rec.backdrop_path ? `https://image.tmdb.org/t/p/w780${rec.backdrop_path}` : "",
        slug: rec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      })),
    };

    console.log(`✅ Successfully enriched ${cleanTitle} with TMDB data.`);
    return enrichedData;

  } catch (error) {
    console.error(`❌ Error enriching movie with TMDB: ${error.message}`);
    return null;
  }
}

/**
 * Searches for a movie on TMDB with popularity threshold.
 * @param {string} title The title of the movie.
 * @returns {Promise<object|null>} Movie data or null.
 */
export async function searchTMDBMovie(title) {
  if (!TMDB_API_KEY) return null;

  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title,
        include_adult: false,
      },
    });

    const results = response.data.results || [];
    // Popularity threshold: 2.0 (can be adjusted)
    const movie = results.find(m => m.popularity > 2.0) || results[0];

    if (!movie || movie.popularity < 1.0) return null;

    return {
      id: movie.id,
      title: movie.title,
      type: "trending_movies",
      image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
      releaseDate: movie.release_date,
      overview: movie.overview,
      rating: movie.vote_average,
      popularity: movie.popularity,
    };
  } catch (error) {
    console.error(`❌ TMDB Movie search error for ${title}:`, error.message);
    return null;
  }
}

/**
 * Searches for a person on TMDB with popularity threshold.
 * @param {string} name The name of the person.
 * @returns {Promise<object|null>} Person data or null.
 */
export async function searchTMDBPerson(name) {
  if (!TMDB_API_KEY) return null;

  try {
    const response = await axios.get(`${BASE_URL}/search/person`, {
      params: {
        api_key: TMDB_API_KEY,
        query: name,
        include_adult: false,
      },
    });

    const results = response.data.results || [];
    // Popularity threshold: 1.5 (can be adjusted)
    const person = results.find(p => p.popularity > 1.5) || results[0];

    if (!person || person.popularity < 1.0) return null;

    return {
      id: person.id,
      title: person.name,
      type: "trending_actors",
      image: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : null,
      knownFor: person.known_for?.map(m => m.title || m.name).filter(Boolean).slice(0, 3) || [],
      popularity: person.popularity,
    };
  } catch (error) {
    console.error(`❌ TMDB Person search error for ${name}:`, error.message);
    return null;
  }
}

/**
 * @deprecated Use Wikipedia scraping for celebrity data instead.
 * Fetches detailed celebrity data from TMDB.
 */
export async function fetchCelebrityFromTMDB(personName) {
  if (!TMDB_API_KEY) return null;

  try {
    // 1. Search for person
    const searchRes = await axios.get(`${BASE_URL}/search/person`, {
      params: { api_key: TMDB_API_KEY, query: personName }
    });

    const person = searchRes.data.results?.[0];
    if (!person) return null;

    // 2. Get full details
    const detailsRes = await axios.get(`${BASE_URL}/person/${person.id}`, {
      params: { api_key: TMDB_API_KEY, append_to_response: "movie_credits" }
    });

    const data = detailsRes.data;
    return {
      name: data.name,
      tmdbId: data.id,
      profileImage: data.profile_path ? `https://image.tmdb.org/t/p/h632${data.profile_path}` : "",
      biography: data.biography,
      birthday: data.birthday,
      placeOfBirth: data.place_of_birth,
      profession: data.known_for_department ? [data.known_for_department] : [],
      filmsCount: data.movie_credits?.cast?.length || 0,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      gender: data.gender === 1 ? "Female" : "Male",
    };
  } catch (error) {
    console.error(`❌ Error fetching celebrity ${personName}:`, error.message);
    return null;
  }
}
