import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";

/**
 * API Endpoint: Get movies by OTT platform
 * Method: GET
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { platform } = req.query;

  if (!platform) {
    return res.status(400).json({ message: 'Platform parameter is required' });
  }

  try {
    await dbConnect();

    // Map platform slugs to display names
    const platformNames = {
      netflix: 'Netflix',
      'amazon-prime': 'Amazon Prime Video',
      'disney-plus-hotstar': 'Disney+ Hotstar',
      jiocinema: 'JioCinema',
      sonyliv: 'SonyLIV',
      zee5: 'Zee5',
    };

    const displayName = platformNames[platform.toLowerCase()] || platform;

    // Find all movies available on this platform
    const movies = await Article.find({
      contentType: 'movie',
      status: 'published',
      'ott.platform': { $regex: new RegExp(displayName, 'i') }
    })
    .select('movieTitle slug releaseYear coverImage summary genres category ott stats rating')
    .sort({ 'stats.rating': -1, publishedAt: -1 })
    .lean();

    // Platform-specific metadata
    const platformInfo = {
      displayName,
      slug: platform,
      metaTitle: `Best Movies on ${displayName} - Watch & Stream | FilmyFire`,
      metaDescription: `Discover the top-rated movies available on ${displayName}. Complete analysis, box office reports, and streaming intelligence.`,
      heroTitle: `Movies Streaming on ${displayName}`,
      description: `Explore our comprehensive collection of movies available on ${displayName}. From blockbusters to hidden gems, find detailed analysis and expert reviews.`
    };

    return res.status(200).json({
      success: true,
      data: {
        movies,
        platformInfo,
        count: movies.length
      }
    });

  } catch (error) {
    console.error('OTT Platform API Error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
