import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  let { slug } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Decode URL-encoded characters and convert spaces to hyphens
  if (slug) {
    try {
      slug = decodeURIComponent(slug);
      slug = slug.toLowerCase().trim().replace(/\s+/g, '-');
    } catch (e) {
      console.error("Slug decode error:", e);
    }
  }

  const cacheKey = `article:${slug}`;

  try {
    const article = await cacheManager(cacheKey, 3600, async () => {
      await dbConnect();

      // 1. Try direct match
      let foundArticle = await Article.findOne({ slug });

      if (!foundArticle) {
        // 2. Try stripping suffixes (backward compatibility for old suffix-style URLs)
        // New URLs use path-style: /movie/:slug/:type
        const suffixes = [
          "-explained", "-ending-explained", "-box-office", "-budget", 
          "-ott", "-ott-release", "-analysis", "-reviews", "-review-analysis", 
          "-critics", "-cast", "-hit-or-flop", "hit", "flop"
        ];
        for (const suffix of suffixes) {
          if (slug.endsWith(suffix)) {
            const baseSlug = slug.substring(0, slug.length - suffix.length);
            foundArticle = await Article.findOne({ slug: baseSlug });
            if (foundArticle) break;
          }
        }
      }

      if (!foundArticle) {
        // 3. Fallback: Try removing numbered suffixes (e.g., "-2", "-3")
        const numberedSuffixMatch = slug.match(/^(.+?)-\d+(-.*)?$/);
        if (numberedSuffixMatch) {
          const baseSlug = numberedSuffixMatch[1];
          foundArticle = await Article.findOne({ slug: baseSlug });
        }
      }

      if (!foundArticle) {
        // 4. Last resort: Find by movie title match (not slug)
        // Extract potential movie title from slug
        const possibleTitle = slug.replace(/-/g, ' ').replace(/\d+$/, '').trim();
        if (possibleTitle.length > 3) {
          foundArticle = await Article.findOne({
            movieTitle: new RegExp(possibleTitle, 'i')
          });
        }
      }

      return foundArticle;
    });

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    // --- Increment View Count ---
    try {
      await Article.updateOne(
        { _id: article._id },
        { $inc: { "stats.views": 1 } }
      );
    } catch (viewError) {
      console.error("Failed to increment view count:", viewError);
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
