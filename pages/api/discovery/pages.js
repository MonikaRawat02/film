// Discovery Pages API
// /api/discovery/pages - CRUD operations
// /best-thriller-movies, /movies-like-inception, /top-10-hollywood-movies, etc.

import dbConnect from "../../../lib/mongodb";
import DiscoveryPage from "../../../model/discoveryPage";
/**
 * POST - Create/Update discovery page
 */
async function handleCreate(req, res) {
  try {
    const {
      slug,
      pageType,
      title,
      description,
      keywords,
      intro,
      content,
      relatedMovies,
      category,
      filterCriteria,
      sortBy,
      isAIGenerated,
    } = req.body;

    if (!slug || !pageType || !title || !description || !intro || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate word count
    const wordCount = intro.split(/\s+/).length + 
      (content || []).reduce((sum, c) => sum + (c.content?.split(/\s+/).length || 0), 0);
    
    if (wordCount < 1200 || wordCount > 2000) {
      return res.status(400).json({
        success: false,
        message: "Discovery pages must be 1200-2000 words",
        currentWordCount: wordCount,
      });
    }

    const pageData = {
      slug: slug.toLowerCase(),
      pageType,
      title,
      description,
      keywords,
      intro,
      content,
      relatedMovies,
      category,
      filterCriteria,
      sortBy,
      isAIGenerated: isAIGenerated || false,
    };

    const page = await DiscoveryPage.findOneAndUpdate(
      { slug },
      pageData,
      {
        upsert: true,
        new: true,
        returnDocument: "after",
        runValidators: true,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Discovery page created/updated",
      data: page,
    });
  } catch (error) {
    console.error("Error creating discovery page:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET - Fetch discovery pages
 */
async function handleFetch(req, res) {
  try {
    const { slug, category, pageType, limit = 20 } = req.query;

    let query = { status: "published" };

    if (slug) {
      const page = await DiscoveryPage.getBySlug(slug);
      if (!page) {
        return res.status(404).json({
          success: false,
          message: "Page not found",
        });
      }
      page.stats.views += 1;
      await page.save();
      return res.status(200).json({ success: true, data: page });
    }

    if (category) {
      const pages = await DiscoveryPage.getByCategory(category, parseInt(limit));
      return res.status(200).json({
        success: true,
        count: pages.length,
        data: pages,
      });
    }

    if (pageType) {
      const pages = await DiscoveryPage.getByType(pageType, parseInt(limit));
      return res.status(200).json({
        success: true,
        count: pages.length,
        data: pages,
      });
    }

    // Get all published pages
    const pages = await DiscoveryPage.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: pages.length,
      data: pages,
    });
  } catch (error) {
    console.error("Error fetching discovery pages:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * PUT - Publish discovery page
 */
async function handlePublish(req, res) {
  try {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug required",
      });
    }

    const page = await DiscoveryPage.findOne({ slug });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    await page.publish();

    return res.status(200).json({
      success: true,
      message: "Page published",
      data: page,
    });
  } catch (error) {
    console.error("Error publishing discovery page:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * DELETE - Delete discovery page
 */
async function handleDelete(req, res) {
  try {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug required",
      });
    }

    const result = await DiscoveryPage.deleteOne({ slug });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Page deleted",
    });
  } catch (error) {
    console.error("Error deleting discovery page:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export default async function handler(req, res) {
  try {
    await dbConnect();
  } catch (error) {
    console.error("Database connection error:", error);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }

  switch (req.method) {
    case "POST":
      return handleCreate(req, res);
    case "GET":
      return handleFetch(req, res);
    case "PUT":
      return handlePublish(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
