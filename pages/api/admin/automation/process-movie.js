import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import axios from 'axios';

/**
 * Master Automation Pipeline for a single movie.
 * This orchestrates the entire Scrape -> Enrich -> Generate sequence.
 */
export default async function handler(req, res) {
  // Security check for production
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ message: "Slug is required" });
  }

  try {
    await dbConnect();

    const article = await Article.findOne({ slug });
    if (!article) {
      return res.status(404).json({ message: `Article with slug '${slug}' not found.` });
    }

    const baseUrl = `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;
    const headers = { 'x-cron-secret': cronSecret };
    const results = {};

    // Step 1: Enrich with TMDB and Watchmode data
    try {
      const enrichRes = await axios.post(`${baseUrl}/api/admin/automation/enrich-movie-data`, { slug }, { headers });
      results.enrichment = enrichRes.data;
    } catch (err) {
      console.error(`Orchestration failed at enrichment for ${slug}:`, err.message);
      return res.status(500).json({ message: `Enrichment step failed for ${slug}`, error: err.message });
    }

    // Step 2: Generate AI Content
    try {
      const aiRes = await axios.post(`${baseUrl}/api/admin/automation/generate-ai-content`, { slug }, { headers });
      results.ai_content = aiRes.data;
    } catch (err) {
      console.error(`Orchestration failed at AI generation for ${slug}:`, err.message);
      return res.status(500).json({ message: `AI generation step failed for ${slug}`, error: err.message });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully processed movie: ${slug}`,
      data: results
    });

  } catch (error) {
    console.error("Master processing error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
