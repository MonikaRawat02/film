// Internal Linking Management API
// /api/internal-links/manage
// Auto-generate and manage internal links for SEO ranking

import dbConnect from "../../../lib/mongodb";
import InternalLink from "../../../model/InternalLink";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";

/**
 * POST - Create internal link
 */
async function handleCreate(req, res) {
  try {
    const {
      sourceId,
      sourceType,
      sourceSlug,
      targetId,
      targetType,
      targetSlug,
      linkType,
      anchorText,
      section,
      seoWeight,
    } = req.body;

    if (!sourceId || !targetId || !linkType || !anchorText) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const linkData = {
      sourceId,
      sourceType,
      sourceSlug: sourceSlug?.toLowerCase(),
      targetId,
      targetType,
      targetSlug: targetSlug?.toLowerCase(),
      linkType,
      anchorText,
      section: section || "content",
      seoWeight: seoWeight || 50,
    };

    const link = await InternalLink.findOneAndUpdate(
      { sourceId, targetId, linkType },
      linkData,
      {
        upsert: true,
        new: true,
        returnDocument: "after",
      }
    );

    return res.status(201).json({
      success: true,
      message: "Internal link created",
      data: link,
    });
  } catch (error) {
    console.error("Error creating internal link:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET - Fetch links
 */
async function handleFetch(req, res) {
  try {
    const { sourceId, sourceType, targetId, targetType, linkType } = req.query;

    let query = { status: "active" };

    if (sourceId && sourceType) {
      const links = await InternalLink.getOutgoingLinks(sourceId, sourceType);
      return res.status(200).json({
        success: true,
        type: "outgoing",
        count: links.length,
        data: links,
      });
    }

    if (targetId && targetType) {
      const links = await InternalLink.getIncomingLinks(targetId, targetType);
      return res.status(200).json({
        success: true,
        type: "incoming",
        count: links.length,
        data: links,
      });
    }

    if (linkType) {
      const links = await InternalLink.getLinksByType(linkType);
      return res.status(200).json({
        success: true,
        count: links.length,
        data: links,
      });
    }

    const links = await InternalLink.find(query).limit(100);
    return res.status(200).json({
      success: true,
      count: links.length,
      data: links,
    });
  } catch (error) {
    console.error("Error fetching internal links:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * PUT - Update link or record click
 */
async function handleUpdate(req, res) {
  try {
    const { linkId, seoWeight, action } = req.body;

    if (!linkId) {
      return res.status(400).json({
        success: false,
        message: "Link ID required",
      });
    }

    const link = await InternalLink.findById(linkId);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    // Record click
    if (action === "click") {
      await link.recordClick();
      return res.status(200).json({
        success: true,
        message: "Click recorded",
        data: link,
      });
    }

    // Update weight
    if (seoWeight !== undefined) {
      link.seoWeight = seoWeight;
      await link.save();
      return res.status(200).json({
        success: true,
        message: "Link weight updated",
        data: link,
      });
    }

    return res.status(400).json({
      success: false,
      message: "No update action specified",
    });
  } catch (error) {
    console.error("Error updating internal link:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * DELETE - Delete link
 */
async function handleDelete(req, res) {
  try {
    const { linkId } = req.body;

    if (!linkId) {
      return res.status(400).json({
        success: false,
        message: "Link ID required",
      });
    }

    const result = await InternalLink.deleteOne({ _id: linkId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Link deleted",
    });
  } catch (error) {
    console.error("Error deleting internal link:", error);
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
      return handleUpdate(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
