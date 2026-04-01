import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { validateContentQuality } from "../../../lib/content-validator";

/**
 * API Endpoint: Validate content quality
 * Method: POST
 * Usage: Check if generated content meets quality standards before publishing
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { slug, sections, pageType = 'overview' } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ message: 'Content sections are required' });
    }

    // Fetch movie data for context-aware validation
    const movie = await Article.findOne({ slug }).lean();
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    console.log(`📊 Validating content quality for ${movie.movieTitle} (${pageType})...`);

    // Determine minimum word count based on page type
    const minWords = pageType === 'overview' ? 1800 : 1200;

    // Run comprehensive validation
    const validationReport = await validateContentQuality(sections, movie, {
      minWords,
      maxWords: 2500,
      targetKeywords: [movie.movieTitle, movie.releaseYear, ...(movie.genres || [])].filter(Boolean),
      requireFAQ: true,
      requireInternalLinks: true,
      checkDuplicates: false
    });

    // Log detailed results
    console.log('Validation Results:', {
      qualityScore: validationReport.qualityScore,
      passedChecks: `${validationReport.passedChecks}/${validationReport.totalChecks}`,
      issues: validationReport.issues.length,
      recommendations: validationReport.recommendations.length
    });

    // Determine if content should be rejected
    const shouldReject = validationReport.qualityScore < 50;
    const needsImprovement = validationReport.qualityScore >= 50 && validationReport.qualityScore < 70;
    const isApproved = validationReport.qualityScore >= 70;

    return res.status(200).json({
      success: true,
      isValid: !shouldReject,
      qualityScore: validationReport.qualityScore,
      status: shouldReject ? 'rejected' : needsImprovement ? 'needs_improvement' : 'approved',
      report: {
        wordCount: validationReport.wordCount,
        passedChecks: validationReport.passedChecks,
        totalChecks: validationReport.totalChecks,
        issues: validationReport.issues,
        recommendations: validationReport.recommendations,
        headingStructure: validationReport.headingStructure,
        hasFAQ: validationReport.hasFAQ,
        internalLinks: validationReport.internalLinks
      },
      actionRequired: shouldReject 
        ? 'Content must be regenerated or significantly improved'
        : needsImprovement
          ? 'Content is acceptable but could be improved'
          : 'Content meets quality standards'
    });

  } catch (error) {
    console.error('Content Quality Validation Error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
