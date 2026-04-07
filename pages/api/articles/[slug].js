import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    // List of common pSEO suffixes (backward compatibility for old suffix-style URLs)
    // New URLs use path-style: /movie/:slug/:type
    const suffixes = [
      "-explained", "-ending-explained", "-box-office", "-budget", 
      "-ott", "-ott-release", "-analysis", "-reviews", "-review-analysis", 
      "-critics", "-cast", "-hit-or-flop"
    ];

    let item = await Article.findOne({ slug });

    if (!item) {
      // If not found, try to find the base movie article by stripping suffixes
      for (const suffix of suffixes) {
        if (slug.endsWith(suffix)) {
          const baseSlug = slug.substring(0, slug.length - suffix.length);
          item = await Article.findOne({ slug: baseSlug });
          if (item) break;
        }
      }
    }

    if (!item) {
      // Final attempt: search for articles that start with the slug
      const allArticles = await Article.find({ contentType: "movie" });
      item = allArticles.find(a => slug.startsWith(a.slug));
    }

    if (!item) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Increment view count
    item.stats.views = (item.stats.views || 0) + 1;
    await item.save();

    return res.status(200).json({ 
      success: true,
      data: item 
    });
  } catch (error) {
    console.error("Error fetching article detail:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Internal server error" 
    });
  }
}
