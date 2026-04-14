import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { slugify } from "@/lib/slugify";

/**
 * API Endpoint: Get movies by OTT platform
 * Method: GET
 * Supports: Exact platform name matches OR slugified platform names
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

    // Known platform mappings (slug -> display name)
    const platformNames = {
      netflix: 'Netflix',
      'amazon-prime': 'Amazon Prime Video',
      'amazon-prime-video': 'Amazon Prime Video',
      'disney-plus-hotstar': 'Disney+ Hotstar',
      jiocinema: 'JioCinema',
      sonyliv: 'SonyLIV',
      zee5: 'Zee5',
    };

    // First try exact mapping
    let displayName = platformNames[platform.toLowerCase()];
    
    // If not found, treat platform param as a slug and search for any platform containing it
    if (!displayName) {
      // Query database to find ANY article with a platform that matches this slug pattern
      const sampleArticles = await Article.find(
        { 'ott.platform': { $exists: true, $ne: null } },
        { 'ott.platform': 1 }
      ).limit(1000).lean();

      // Find a platform that when slugified matches the input
      const matchedPlatform = sampleArticles.find(doc => 
        doc.ott?.platform && slugify(doc.ott.platform) === platform.toLowerCase()
      );

      if (matchedPlatform) {
        displayName = matchedPlatform.ott.platform;
      } else {
        // Fallback: use the platform slug as-is and hope for partial matches
        displayName = platform;
      }
    }

    // Find all movies available on this platform (case-insensitive, flexible matching)
    const movies = await Article.find({
      contentType: 'movie',
      status: 'published',
      'ott.platform': { $regex: new RegExp(`^${displayName}$|${displayName.split(':')[0]}`, 'i') }
    })
    .select('movieTitle slug releaseYear coverImage summary genres category ott stats rating')
    .sort({ 'stats.rating': -1, publishedAt: -1 })
    .lean();

    // Platform-specific metadata
    const platformInfo = {
      displayName,
      slug: platform.toLowerCase(),
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
