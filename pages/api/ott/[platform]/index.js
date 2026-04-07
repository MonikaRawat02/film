import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import { slugify } from "../../../../lib/slugify";

/**
 * GET /api/ott/[platform]
 * Returns specific OTT platform details
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
    
    // If not found, find platform by slug match
    if (!displayName) {
      const sampleArticles = await Article.find(
        { 'ott.platform': { $exists: true, $ne: null } },
        { 'ott.platform': 1 }
      ).limit(1000).lean();

      const matchedPlatform = sampleArticles.find(doc => 
        doc.ott?.platform && slugify(doc.ott.platform) === platform.toLowerCase()
      );

      if (matchedPlatform) {
        displayName = matchedPlatform.ott.platform;
      } else {
        displayName = platform;
      }
    }

    // Get movie count for this platform
    const movieCount = await Article.countDocuments({
      contentType: 'movie',
      status: 'published',
      'ott.platform': { $regex: new RegExp(`^${displayName}$|${displayName.split(':')[0]}`, 'i') }
    });

    // Platform info
    const platformInfo = {
      name: displayName,
      slug: platform.toLowerCase(),
      movieCount: movieCount,
      displayUrl: `/ott/${platform.toLowerCase()}`,
      metaTitle: `Best Movies on ${displayName} | FilmyFire Intelligence`,
      metaDescription: `Explore the comprehensive list of movies streaming on ${displayName}. Get deep analysis, box office reports, and ending explanations for all ${displayName} content.`,
      heroTitle: `Movies Streaming on ${displayName}`,
      description: `Explore our comprehensive collection of movies available on ${displayName}. From blockbusters to hidden gems, find detailed analysis and expert reviews.`
    };

    return res.status(200).json({
      success: true,
      data: {
        platform: platformInfo
      }
    });
  } catch (error) {
    console.error("OTT Platform Detail API Error:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
