// Category Pages API
// /api/category/pages - CRUD operations
// /hollywood/movies, /bollywood/action-movies, /movies-2024, etc.

import dbConnect from "../../../lib/mongodb";
import CategoryPage from "../../../model/CategoryPage";

/**
 * POST - Create/Update category page
 */
async function handleCreate(req, res) {
  try {
    const {
      slug,
      parentCategory,
      subCategory,
      title,
      description,
      keywords,
      intro,
      content,
      items,
      filterCriteria,
      sortBy,
      isAIGenerated,
    } = req.body;

    if (!slug || !parentCategory || !title || !description || !intro) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate word count (1200-2000 words)
    const wordCount = intro.split(/\s+/).length + 
      (content || []).reduce((sum, c) => sum + (c.content?.split(/\s+/).length || 0), 0);
    
    if (wordCount < 1200 || wordCount > 2000) {
      return res.status(400).json({
        success: false,
        message: "Category pages must be 1200-2000 words",
        currentWordCount: wordCount,
      });
    }

    const pageData = {
      slug: slug.toLowerCase(),
      parentCategory,
      subCategory,
      title,
      description,
      keywords,
      intro,
      content,
      items,
      filterCriteria,
      sortBy,
      isAIGenerated: isAIGenerated || false,
    };

    const page = await CategoryPage.findOneAndUpdate(
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
      message: "Category page created/updated",
      data: page,
    });
  } catch (error) {
    console.error("Error creating category page:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET - Fetch category pages
 */
async function handleFetch(req, res) {
  try {
    const { slug, parentCategory, limit = 20 } = req.query;

    if (slug) {
      const page = await CategoryPage.getBySlug(slug);
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

    if (parentCategory) {
      const pages = await CategoryPage.getByParentCategory(parentCategory, parseInt(limit));
      return res.status(200).json({
        success: true,
        count: pages.length,
        data: pages,
      });
    }

    // Get all published pages
    const pages = await CategoryPage.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: pages.length,
      data: pages,
    });
  } catch (error) {
    console.error("Error fetching category pages:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * PUT - Publish category page
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

    const page = await CategoryPage.findOne({ slug });
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
    console.error("Error publishing category page:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * DELETE - Delete category page
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

    const result = await CategoryPage.deleteOne({ slug });

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
    console.error("Error deleting category page:", error);
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
