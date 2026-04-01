import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { limit = 100, checkExternal = false } = req.query;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;

    console.log('🔍 Starting broken link check...');

    const results = {
      totalArticles: 0,
      articlesWithBrokenLinks: 0,
      brokenInternalLinks: [],
      brokenExternalLinks: [],
      missingRelatedMovies: [],
      missingImages: [],
    };

    // Get all published articles
    const articles = await Article.find({ status: 'published' })
      .limit(parseInt(limit))
      .select('slug movieTitle title category coverImage backdropImage relatedMovies ott')
      .lean();

    results.totalArticles = articles.length;

    // Create a set of all valid slugs for internal link checking
    const validSlugs = new Set(articles.map(a => a.slug));

    for (const article of articles) {
      let hasIssues = false;

      // Check relatedMovies links
      if (article.relatedMovies && article.relatedMovies.length > 0) {
        for (const related of article.relatedMovies) {
          if (related.slug && !validSlugs.has(related.slug)) {
            results.brokenInternalLinks.push({
              sourceSlug: article.slug,
              sourceTitle: article.movieTitle || article.title,
              brokenLink: `/category/${article.category?.toLowerCase()}/${related.slug}`,
              type: 'relatedMovie',
              relatedTitle: related.movieTitle,
            });
            hasIssues = true;
          }
        }
      }

      // Check for missing images
      if (!article.coverImage || article.coverImage === '') {
        results.missingImages.push({
          slug: article.slug,
          title: article.movieTitle || article.title,
          imageType: 'coverImage',
        });
        hasIssues = true;
      }

      // Check OTT links (if external checking is enabled)
      if (checkExternal === 'true' && article.ott?.link) {
        try {
          const response = await fetch(article.ott.link, {
            method: 'HEAD',
            timeout: 5000,
          });
          if (!response.ok) {
            results.brokenExternalLinks.push({
              sourceSlug: article.slug,
              sourceTitle: article.movieTitle || article.title,
              brokenLink: article.ott.link,
              type: 'ottLink',
              statusCode: response.status,
            });
            hasIssues = true;
          }
        } catch (error) {
          results.brokenExternalLinks.push({
            sourceSlug: article.slug,
            sourceTitle: article.movieTitle || article.title,
            brokenLink: article.ott.link,
            type: 'ottLink',
            error: error.message,
          });
          hasIssues = true;
        }
      }

      if (hasIssues) {
        results.articlesWithBrokenLinks++;
      }
    }

    // Summary
    const summary = {
      healthScore: Math.round(((results.totalArticles - results.articlesWithBrokenLinks) / results.totalArticles) * 100),
      totalBrokenLinks: results.brokenInternalLinks.length + results.brokenExternalLinks.length,
      totalMissingImages: results.missingImages.length,
    };

    console.log(`✅ Link check complete: ${summary.healthScore}% health score`);

    return res.status(200).json({
      success: true,
      summary,
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Broken Link Check Error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
