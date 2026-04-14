import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780"; // Upgraded from w300 for higher resolution banners

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
    const searchResponse = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: cleanTitle,
        year: releaseYear,
      },
    });

    let movieResult = searchResponse.data.results?.[0];
    
    // Fallback: If no match found with year, try searching without year
    if (!movieResult) {
      console.log(`🟡 No match for ${cleanTitle} with year ${releaseYear}. Retrying without year...`);
      const retryResponse = await axios.get(`${BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: cleanTitle,
        },
      });
      movieResult = retryResponse.data.results?.[0];
    }

    if (!movieResult) {
      console.log(`❌ No TMDB match found for ${cleanTitle}`);
      return null;
    }

    // 3. Get movie details, including credits, release_dates, and recommendations
    const movieDetailsResponse = await axios.get(`${BASE_URL}/movie/${movieResult.id}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: "credits,release_dates,recommendations",
      },
    });

    const movie = movieDetailsResponse.data;
    
    // Find certification (e.g., PG, U/A, etc.)
    const indiaRelease = movie.release_dates?.results?.find(r => r.iso_3166_1 === "IN") || 
                        movie.release_dates?.results?.find(r => r.iso_3166_1 === "US");
    const certification = indiaRelease?.release_dates?.[0]?.certification || "";

    const enrichedData = {
      tmdbId: movie.id,
      rating: (movie.vote_average !== undefined && movie.vote_average !== null) ? movie.vote_average.toFixed(1) : null,
      coverImage: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "",
      backdropImage: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : "",
      tagline: movie.tagline || "",
      runtime: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "",
      releaseDate: movie.release_date || "",
      certification: certification,
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
 * Searches for a movie on TMDB and returns basic info.
 * @param {string} query The search query.
 * @returns {Promise<object|null>} Basic movie info or null.
 */
export async function searchTMDBMovie(query) {
  if (!TMDB_API_KEY) return null;

  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: { api_key: TMDB_API_KEY, query }
    });

    const result = response.data.results?.[0];
    if (!result) return null;

    return {
      id: result.id,
      title: result.title,
      release_date: result.release_date,
      overview: result.overview,
      poster_path: result.poster_path ? `${IMAGE_BASE_URL}${result.poster_path}` : null,
      backdrop_path: result.backdrop_path ? `https://image.tmdb.org/t/p/w780${result.backdrop_path}` : null,
      vote_average: result.vote_average,
      popularity: result.popularity
    };
  } catch (error) {
    console.error(`❌ Error searching TMDB movie ${query}:`, error.message);
    return null;
  }
}

/**
 * Searches for a person on TMDB and returns basic info.
 * @param {string} query The search query.
 * @returns {Promise<object|null>} Basic person info or null.
 */
export async function searchTMDBPerson(query) {
  if (!TMDB_API_KEY) return null;

  try {
    const response = await axios.get(`${BASE_URL}/search/person`, {
      params: { api_key: TMDB_API_KEY, query }
    });

    const result = response.data.results?.[0];
    if (!result) return null;

    return {
      id: result.id,
      title: result.name, // Mapping 'name' to 'title' for consistency in validation logic
      name: result.name,
      profile_path: result.profile_path ? `https://image.tmdb.org/t/p/w185${result.profile_path}` : null,
      known_for: result.known_for,
      known_for_department: result.known_for_department,
      popularity: result.popularity
    };
  } catch (error) {
    console.error(`❌ Error searching TMDB person ${query}:`, error.message);
    return null;
  }
}

/**
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
