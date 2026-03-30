import dbConnect from "../../lib/mongodb";
import Article from "../../model/article";
import Celebrity from "../../model/celebrity";

const generateSitemap = (articles, celebrities) => {
  const baseUrl = "https://filmyfire.com";
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // 1. Static Main Pages
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/celebrities", priority: "0.9", changefreq: "daily" },
    { url: "/box-office", priority: "0.9", changefreq: "daily" },
    { url: "/ott-insights", priority: "0.9", changefreq: "daily" },
    { url: "/category/bollywood", priority: "0.8", changefreq: "daily" },
    { url: "/category/hollywood", priority: "0.8", changefreq: "daily" },
  ];

  staticPages.forEach(page => {
    xml += `
    <url>
      <loc>${baseUrl}${page.url}</loc>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`;
  });

  // 2. Movie Hubs & pSEO Sub-pages
  articles.forEach(article => {
    const movieCategory = article.category?.toLowerCase() || "bollywood";
    const movieBaseUrl = `${baseUrl}/category/${movieCategory}/${article.slug}`;
    
    // Main Hub Page
    xml += `
    <url>
      <loc>${movieBaseUrl}</loc>
      <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`;
    
    // pSEO Sub-pages (8-12 per movie)
    const subPageSuffixes = [
      "explained", "ending-explained", "box-office", "budget", 
      "ott-release", "cast", "review-analysis", "hit-or-flop"
    ];

    subPageSuffixes.forEach(suffix => {
      xml += `
    <url>
      <loc>${movieBaseUrl}-${suffix}</loc>
      <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`;
    });
  });

  // 3. Celebrity Intelligence Profiles
  celebrities.forEach(celeb => {
    xml += `
    <url>
      <loc>${baseUrl}/celebrity/${celeb.heroSection.slug}/profile</loc>
      <lastmod>${new Date(celeb.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
  });

  xml += `\n</urlset>`;
  return xml;
};

export default async function handler(req, res) {
  try {
    await dbConnect();
    
    // Fetch data for sitemap
    const [articles, celebrities] = await Promise.all([
      Article.find({ contentType: "movie" }).select("slug category updatedAt"),
      Celebrity.find({}).select("heroSection.slug updatedAt")
    ]);
    
    const sitemap = generateSitemap(articles, celebrities);

    res.setHeader("Content-Type", "application/xml");
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error("Sitemap Generation Error:", error);
    res.status(500).send("Error generating sitemap");
  }
}
