import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { detectDuplicateContent } from "../../../lib/content-validator";

/**
 * API Endpoint: Check for duplicate content before generation
 * Method: POST
 * Usage: Prevent generating content for movies that already have similar content
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { slug, sections, similarityThreshold = 0.7 } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ message: 'Content sections are required' });
    }

    // Fetch all published articles except current one
    const existingArticles = await Article.find({
      contentType: 'movie',
      status: 'published',
      slug: { $ne: slug }
    })
    .select('slug movieTitle sections')
    .lean();

    console.log(`🔍 Checking for duplicates among ${existingArticles.length} articles...`);

    // Run duplicate detection
    const duplicateCheck = await detectDuplicateContent(
      sections, 
      existingArticles, 
      similarityThreshold
    );

    // If duplicates found, fetch full details
    if (duplicateCheck.isDuplicate) {
      const detailedMatches = await Promise.all(
        duplicateCheck.similarArticles.map(async (match) => {
          const article = await Article.findOne({ slug: match.slug })
            .select('movieTitle slug releaseYear coverImage createdAt')
            .lean();
          
          return {
            ...match,
            details: article
          };
        })
      );

      return res.status(200).json({
        success: true,
        isDuplicate: true,
        message: `Found ${detailedMatches.length} potentially duplicate articles`,
        similarArticles: detailedMatches,
        recommendation: detailedMatches.length > 0 
          ? 'Consider rewriting content to reduce similarity or verify this is not the same movie'
          : 'Review manually'
      });
    }

    return res.status(200).json({
      success: true,
      isDuplicate: false,
      message: 'No duplicate content detected',
      checkedArticles: existingArticles.length,
      recommendation: 'Safe to proceed with content generation'
    });

  } catch (error) {
    console.error('Duplicate Check Error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
