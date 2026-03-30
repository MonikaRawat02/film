import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const cacheKey = `article:${slug}`;

  try {
    const article = await cacheManager(cacheKey, 3600, async () => {
      await dbConnect();

      // 1. Try direct match
      let foundArticle = await Article.findOne({ slug });

      if (!foundArticle) {
        // 2. Try stripping suffixes
        const suffixes = [
          "-explained", "-ending-explained", "-box-office", "-budget", 
          "-ott", "-ott-release", "-analysis", "-reviews", "-review-analysis", 
          "-critics", "-cast", "-hit-or-flop"
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
        // 3. Fallback: search for articles that start with the slug
        const allArticles = await Article.find({ contentType: "movie" });
        foundArticle = allArticles.find(a => slug.startsWith(a.slug));
      }
      return foundArticle;
    });

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
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
