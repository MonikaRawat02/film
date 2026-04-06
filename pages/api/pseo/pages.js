// pSEO Page Management API
// pages/api/pseo/pages.js
// Handles CRUD operations for dynamic pSEO sub-pages

import dbConnect from "../../../lib/mongodb";
import pSEOPage from "../../../model/pSEOPage";
import Article from "../../../model/article";

/**
 * POST - Create or update a pSEO page
 * Body: { articleId, slug, pageType, customPageType, content, seo, schemaMarkup }
 */
async function handleCreate(req, res) {
  try {
    const { articleId, slug, pageType, customPageType, content, seo, schemaMarkup, isAIGenerated } = req.body;

    // Validate required fields
    if (!articleId || !slug || !pageType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: articleId, slug, pageType",
      });
    }

    if (!content || !Array.isArray(content) || content.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Content must be a non-empty array of sections",
      });
    }

    if (!seo || !seo.title || !seo.description) {
      return res.status(400).json({
        success: false,
        message: "SEO metadata must include title and description",
      });
    }

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Create or update page
    const pageData = {
      articleId,
      slug: slug.toLowerCase(),
      pageType: pageType === "custom" ? pageType : pageType,
      customPageType,
      content,
      seo,
      schemaMarkup,
      isAIGenerated: isAIGenerated || false,
    };

    const page = await pSEOPage.createOrUpdatePage(articleId, pageData);

    return res.status(201).json({
      success: true,
      message: "pSEO page created/updated successfully",
      data: page,
    });
  } catch (error) {
    console.error("Error creating pSEO page:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create pSEO page",
      error: error.message,
    });
  }
}

/**
 * GET - Fetch pSEO page by article and slug
 * Query: articleId, slug
 */
async function handleFetch(req, res) {
  try {
    const { articleId, slug } = req.query;

    if (!articleId || !slug) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameters: articleId, slug",
      });
    }

    const page = await pSEOPage.getByArticleSlug(articleId, slug);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "pSEO page not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("Error fetching pSEO page:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pSEO page",
      error: error.message,
    });
  }
}

/**
 * GET - Fetch all pSEO pages for an article
 * Query: articleId, status (optional)
 */
async function handleFetchAll(req, res) {
  try {
    const { articleId, status } = req.query;

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameter: articleId",
      });
    }

    const pages = await pSEOPage.getByArticle(articleId, status);

    return res.status(200).json({
      success: true,
      count: pages.length,
      data: pages,
    });
  } catch (error) {
    console.error("Error fetching pSEO pages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pSEO pages",
      error: error.message,
    });
  }
}

/**
 * PUT - Publish a pSEO page
 * Body: { articleId, slug }
 */
async function handlePublish(req, res) {
  try {
    const { articleId, slug } = req.body;

    if (!articleId || !slug) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: articleId, slug",
      });
    }

    const page = await pSEOPage.findOne({ articleId, slug });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "pSEO page not found",
      });
    }

    await page.publish();

    return res.status(200).json({
      success: true,
      message: "pSEO page published successfully",
      data: page,
    });
  } catch (error) {
    console.error("Error publishing pSEO page:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to publish pSEO page",
      error: error.message,
    });
  }
}

/**
 * DELETE - Delete a pSEO page
 * Body: { articleId, slug }
 */
async function handleDelete(req, res) {
  try {
    const { articleId, slug } = req.body;

    if (!articleId || !slug) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: articleId, slug",
      });
    }

    const result = await pSEOPage.deleteOne({ articleId, slug });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "pSEO page not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "pSEO page deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pSEO page:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete pSEO page",
      error: error.message,
    });
  }
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case "POST":
      return handleCreate(req, res);
    case "GET":
      // Determine if fetching single or multiple pages
      return req.query.slug ? handleFetch(req, res) : handleFetchAll(req, res);
    case "PUT":
      return handlePublish(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
  }
}
