/**
 * Recommendation Engine - Movie Similarity Calculator
 * Calculates similarity scores between movies for "More Like This" recommendations
 * 
 * Factors:
 * - Genre Overlap (40% weight)
 * - Cast Overlap (30% weight)
 * - Director Match (20% weight)
 * - Release Year Proximity (10% weight)
 */

import dbConnect from "./mongodb";
import Article from "../model/article";

/**
 * Calculate genre similarity using Jaccard Index
 */
export function calculateGenreSimilarity(genres1, genres2) {
  if (!genres1 || !genres2 || genres1.length === 0 || genres2.length === 0) {
    return 0;
  }

  const set1 = new Set(genres1.map(g => g.toLowerCase().trim()));
  const set2 = new Set(genres2.map(g => g.toLowerCase().trim()));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Calculate cast similarity
 */
export function calculateCastSimilarity(cast1, cast2) {
  if (!cast1 || !cast2 || cast1.length === 0 || cast2.length === 0) {
    return 0;
  }

  const names1 = new Set(cast1.map(c => c.name?.toLowerCase().trim()).filter(Boolean));
  const names2 = new Set(cast2.map(c => c.name?.toLowerCase().trim()).filter(Boolean));

  const intersection = new Set([...names1].filter(x => names2.has(x)));
  const union = new Set([...names1, ...names2]);

  return intersection.size / union.size;
}

/**
 * Calculate director similarity
 */
export function calculateDirectorSimilarity(director1, director2) {
  if (!director1 || !director2) {
    return 0;
  }

  const directors1 = new Set(director1.map(d => d.toLowerCase().trim()));
  const directors2 = new Set(director2.map(d => d.toLowerCase().trim()));

  const intersection = new Set([...directors1].filter(x => directors2.has(x)));

  return intersection.size > 0 ? 1 : 0;
}

/**
 * Calculate release year proximity
 */
export function calculateYearSimilarity(year1, year2) {
  if (!year1 || !year2) {
    return 0;
  }

  const diff = Math.abs(year1 - year2);

  if (diff === 0) return 1;
  if (diff <= 2) return 0.7;
  if (diff <= 5) return 0.4;
  if (diff <= 10) return 0.2;
  return 0.1;
}

/**
 * Calculate overall similarity score
 */
export function calculateSimilarity(movie1, movie2) {
  let totalScore = 0;
  const breakdown = {};

  // Factor 1: Genre Overlap (40% weight)
  const genreScore = calculateGenreSimilarity(movie1.genres || [], movie2.genres || []);
  breakdown.genre = genreScore;
  totalScore += genreScore * 0.40;

  // Factor 2: Cast Overlap (30% weight)
  const castScore = calculateCastSimilarity(movie1.cast || [], movie2.cast || []);
  breakdown.cast = castScore;
  totalScore += castScore * 0.30;

  // Factor 3: Director Match (20% weight)
  const directorScore = calculateDirectorSimilarity(movie1.director || [], movie2.director || []);
  breakdown.director = directorScore;
  totalScore += directorScore * 0.20;

  // Factor 4: Release Year Proximity (10% weight)
  const yearScore = calculateYearSimilarity(movie1.releaseYear, movie2.releaseYear);
  breakdown.year = yearScore;
  totalScore += yearScore * 0.10;

  return {
    score: Math.round(totalScore * 100),
    breakdown,
    matchLevel: getMatchLevel(totalScore)
  };
}

/**
 * Get match level based on score
 */
function getMatchLevel(score) {
  if (score >= 0.8) return 'Excellent Match';
  if (score >= 0.6) return 'Great Match';
  if (score >= 0.4) return 'Good Match';
  if (score >= 0.2) return 'Fair Match';
  return 'Weak Match';
}

/**
 * Find similar movies for a given movie
 */
export async function findSimilarMovies(movieSlug, limit = 8) {
  try {
    await dbConnect();

    // Get the target movie
    const targetMovie = await Article.findOne({ slug: movieSlug }).lean();
    if (!targetMovie) {
      throw new Error(`Movie not found: ${movieSlug}`);
    }

    // Get all movies from the same category or fallback to all movies
    const allMovies = await Article.find({
      slug: { $ne: movieSlug },
      isAIContent: true // Only consider AI-generated content
    }).lean();

    // Calculate similarity for each movie
    const scoredMovies = allMovies.map(movie => {
      const similarity = calculateSimilarity(targetMovie, movie);
      return {
        ...movie,
        similarityScore: similarity.score,
        matchLevel: similarity.matchLevel,
        similarityBreakdown: similarity.breakdown
      };
    });

    // Sort by similarity score (descending)
    scoredMovies.sort((a, b) => b.similarityScore - a.similarityScore);

    // Return top N results
    return scoredMovies.slice(0, limit);

  } catch (error) {
    console.error('Error finding similar movies:', error);
    return [];
  }
}

/**
 * Batch calculate similarities for multiple movies
 */
export async function batchCalculateSimilarities(movieSlugs, limitPerMovie = 8) {
  try {
    await dbConnect();

    const results = {};

    for (const slug of movieSlugs) {
      try {
        const similarMovies = await findSimilarMovies(slug, limitPerMovie);
        results[slug] = similarMovies;
      } catch (error) {
        console.error(`Error calculating similarities for ${slug}:`, error.message);
        results[slug] = [];
      }
    }

    return results;
  } catch (error) {
    console.error('Batch calculation error:', error);
    return {};
  }
}

/**
 * Get personalized recommendations based on user preferences
 */
export async function getPersonalizedRecommendations(preferences, limit = 10) {
  try {
    await dbConnect();

    const query = { isAIContent: true };

    // Filter by preferred genres
    if (preferences.genres && preferences.genres.length > 0) {
      query.genres = { $in: preferences.genres };
    }

    // Filter by preferred OTT platform
    if (preferences.platform) {
      query['ott.platform'] = { $regex: new RegExp(preferences.platform, 'i') };
    }

    // Filter by minimum rating
    if (preferences.minRating) {
      query.rating = { $gte: preferences.minRating };
    }

    const candidates = await Article.find(query).lean();

    // Score by preferences
    const scored = candidates.map(movie => {
      let score = 0;

      // Genre match bonus
      if (preferences.genres) {
        const genreMatches = movie.genres?.filter(g =>
          preferences.genres.includes(g)
        ).length || 0;
        score += genreMatches * 20;
      }

      // Rating bonus
      score += (movie.rating || 0) * 10;

      // Recent release bonus
      if (movie.releaseYear >= 2023) score += 10;

      return { ...movie, recommendationScore: score };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scored.slice(0, limit);

  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
}
