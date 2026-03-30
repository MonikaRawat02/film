import dbConnect from "../../lib/mongodb";
import Article from "../../model/article";
import Celebrity from "../../model/celebrity";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // 1. Fetch all movies
    const movies = await Article.find({ contentType: "movie" }).select("slug movieTitle releaseYear cast genres");
    
    // 2. Fetch all celebrities
    const celebrities = await Celebrity.find({}).select("heroSection.slug heroSection.name");

    const sitemapEntries = [];

    // Base URLs
    sitemapEntries.push({ url: "/", changefreq: "daily", priority: 1.0 });
    sitemapEntries.push({ url: "/celebrities", changefreq: "daily", priority: 0.9 });
    sitemapEntries.push({ url: "/box-office", changefreq: "daily", priority: 0.9 });

    // 3. Movie URLs & pSEO Sub-pages
    for (const movie of movies) {
      const baseSlug = movie.slug;
      
      // Overview
      sitemapEntries.push({ url: `/movie/${baseSlug}`, changefreq: "weekly", priority: 0.8 });
      
      // pSEO Sub-pages (Generated dynamically by the system)
      const subPages = [
        "-ending-explained",
        "-box-office",
        "-budget",
        "-ott-release",
        "-cast",
        "-review-analysis",
        "-hit-or-flop"
      ];

      for (const suffix of subPages) {
        sitemapEntries.push({ url: `/movie/${baseSlug}${suffix}`, changefreq: "monthly", priority: 0.6 });
      }
    }

    // 4. Celebrity URLs
    for (const celeb of celebrities) {
      sitemapEntries.push({ url: `/celebrity/${celeb.heroSection.slug}`, changefreq: "weekly", priority: 0.7 });
    }

    // 5. Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries.map(entry => `
  <url>
    <loc>https://filmyfire.com${entry.url}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('')}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(xml);

  } catch (error) {
    console.error("Sitemap Generation Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
