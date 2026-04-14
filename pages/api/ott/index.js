import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { slugify } from "@/lib/slugify";

/**
 * GET /api/ott
 * Returns all available OTT platforms and their movie counts
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get all unique OTT platforms from published movies
    const platforms = await Article.aggregate([
      { $match: { status: 'published', 'ott.platform': { $exists: true, $ne: null } } },
      { $group: { _id: '$ott.platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Format response with slugs
    const formattedPlatforms = platforms.map(p => ({
      name: p._id,
      slug: slugify(p._id),
      movieCount: p.count,
      displayUrl: `/ott/${slugify(p._id)}`
    }));

    return res.status(200).json({
      success: true,
      data: {
        platforms: formattedPlatforms,
        totalPlatforms: formattedPlatforms.length,
        totalMovies: formattedPlatforms.reduce((sum, p) => sum + p.movieCount, 0)
      }
    });
  } catch (error) {
    console.error("OTT API Error:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
