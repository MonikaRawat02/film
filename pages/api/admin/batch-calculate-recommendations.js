import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { batchCalculateSimilarities } from "../../../lib/recommendation-engine";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { slugs, limitPerMovie = 8 } = req.body;

    if (!slugs || !Array.isArray(slugs)) {
      return res.status(400).json({ 
        success: false,
        message: 'Array of movie slugs is required' 
      });
    }

    console.log(`🎯 Batch calculating similar movies for ${slugs.length} movies...`);

    // Process in batches to avoid memory issues
    const BATCH_SIZE = 10;
    const results = {};
    let processedCount = 0;

    for (let i = 0; i < slugs.length; i += BATCH_SIZE) {
      const batch = slugs.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(slugs.length/BATCH_SIZE)}...`);

      const batchResults = await batchCalculateSimilarities(batch, limitPerMovie);
      Object.assign(results, batchResults);
      
      processedCount += batch.length;
      console.log(`✅ Processed ${processedCount}/${slugs.length} movies`);
    }

    // Update each movie with its related movies
    const updatePromises = slugs.map(async (slug) => {
      const similarMovies = results[slug] || [];
      
      if (similarMovies.length > 0) {
        await Article.updateOne(
          { slug },
          {
            $set: {
              relatedMovies: similarMovies.map(movie => ({
                _id: movie._id,
                slug: movie.slug,
                movieTitle: movie.movieTitle || movie.title,
                releaseYear: movie.releaseYear,
                coverImage: movie.coverImage,
                similarityScore: movie.similarityScore,
                matchLevel: movie.matchLevel
              })),
              lastRecommendationUpdate: new Date()
            }
          }
        );
      }
    });

    await Promise.all(updatePromises);

    console.log(`✅ Successfully updated ${slugs.length} movies with recommendations`);

    return res.status(200).json({
      success: true,
      message: `Updated ${slugs.length} movies with recommendations`,
      count: slugs.length,
      totalRecommendations: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    });

  } catch (error) {
    console.error('Batch Calculate Similar Movies Error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
