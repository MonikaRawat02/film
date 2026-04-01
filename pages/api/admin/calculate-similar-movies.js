import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { findSimilarMovies } from "../../../lib/recommendation-engine";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { slug, limit = 8 } = req.query;

    if (!slug) {
      return res.status(400).json({ 
        success: false,
        message: 'Movie slug is required' 
      });
    }

    console.log(`🎯 Finding similar movies for "${slug}"...`);

    const similarMovies = await findSimilarMovies(slug, parseInt(limit));

    if (similarMovies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No similar movies found'
      });
    }

    // Format response
    const formattedResults = similarMovies.map(movie => ({
      _id: movie._id,
      slug: movie.slug,
      movieTitle: movie.movieTitle || movie.title,
      releaseYear: movie.releaseYear,
      coverImage: movie.coverImage,
      backdropImage: movie.backdropImage,
      rating: movie.rating,
      genres: movie.genres,
      similarityScore: movie.similarityScore,
      matchLevel: movie.matchLevel,
      similarityBreakdown: movie.similarityBreakdown
    }));

    console.log(`✅ Found ${formattedResults.length} similar movies for "${slug}"`);

    return res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });

  } catch (error) {
    console.error('Similar Movies API Error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
