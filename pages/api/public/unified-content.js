import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";
import BoxOffice from "../../../model/boxOffice";
import OTTIntelligence from "../../../model/ottIntelligence";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    
    const { filter, limit = 12 } = req.query;
    const lim = Math.min(Number(limit) || 12, 50);

    // If no filter specified, return all data
    if (!filter || filter === "All") {
      const [articles, celebrities, boxOfficeData, ottData] = await Promise.all([
        Article.find({ status: "published" })
          .sort({ publishedAt: -1, createdAt: -1 })
          .limit(lim)
          .lean(),
        Celebrity.find({})
          .sort({ createdAt: -1 })
          .limit(Math.floor(lim / 3))
          .lean(),
        BoxOffice.find({})
          .sort({ createdAt: -1 })
          .limit(Math.floor(lim / 3))
          .lean(),
        OTTIntelligence.find({})
          .sort({ createdAt: -1 })
          .limit(Math.floor(lim / 4))
          .lean()
      ]);

      return res.status(200).json({
        success: true,
        data: {
          articles: articles.map(a => ({
            ...a,
            filterType: "Explained"
          })),
          celebrities: celebrities.map(c => ({
            _id: c._id,
            name: c.heroSection?.name,
            slug: c.heroSection?.slug,
            profileImage: c.heroSection?.profileImage,
            profession: c.heroSection?.profession,
            category: "Celebrities",
            filterType: "Celebrity"
          })),
          boxOffice: boxOfficeData.map(b => ({
            ...b,
            filterType: "BoxOffice"
          })),
          ott: ottData.map(o => ({
            ...o,
            filterType: "OTT"
          }))
        }
      });
    }

    // Filter-specific data fetching
    switch (filter) {
      case "Explained":
        const explainedArticles = await Article.find({ 
          status: "published",
          $or: [
            { category: "Bollywood" },
            { category: "Hollywood" },
            { category: "WebSeries" }
          ]
        })
          .sort({ publishedAt: -1 })
          .limit(lim)
          .lean();
        
        return res.status(200).json({
          success: true,
          data: explainedArticles.map(a => ({ ...a, filterType: "Explained" }))
        });

      case "BoxOffice":
        const boxOfficeArticles = await Article.find({ 
          status: "published",
          "boxOffice.worldwide": { $exists: true, $ne: "" }
        })
          .sort({ "stats.views": -1 })
          .limit(lim)
          .lean();

        const boxOfficeData = await BoxOffice.find({})
          .sort({ createdAt: -1 })
          .limit(Math.floor(lim / 2))
          .lean();

        return res.status(200).json({
          success: true,
          data: [
            ...boxOfficeArticles.map(a => ({ ...a, filterType: "BoxOffice" })),
            ...boxOfficeData.map(b => ({ ...b, filterType: "BoxOffice" }))
          ]
        });

      case "OTT":
        const ottArticles = await Article.find({ 
          status: "published",
          "ott.platform": { $exists: true, $ne: "" }
        })
          .sort({ "ott.releaseDate": -1 })
          .limit(lim)
          .lean();

        const ottIntelligence = await OTTIntelligence.find({})
          .sort({ createdAt: -1 })
          .limit(Math.floor(lim / 3))
          .lean();

        return res.status(200).json({
          success: true,
          data: [
            ...ottArticles.map(a => ({ ...a, filterType: "OTT" })),
            ...ottIntelligence.map(o => ({ ...o, filterType: "OTT" }))
          ]
        });

      case "Celebrity":
        const celebrities = await Celebrity.find({})
          .sort({ createdAt: -1 })
          .limit(lim)
          .lean();

        return res.status(200).json({
          success: true,
          data: celebrities.map(c => ({
            _id: c._id,
            name: c.heroSection?.name,
            slug: c.heroSection?.slug,
            profileImage: c.heroSection?.profileImage,
            profession: c.heroSection?.profession,
            category: "Celebrities",
            filterType: "Celebrity"
          }))
        });

      case "Industry":
        const industryArticles = await Article.find({ 
          status: "published",
          category: "BoxOffice"
        })
          .sort({ publishedAt: -1 })
          .limit(lim)
          .lean();

        return res.status(200).json({
          success: true,
          data: industryArticles.map(a => ({ ...a, filterType: "Industry" }))
        });

      default:
        return res.status(400).json({ 
          success: false, 
          message: "Invalid filter type" 
        });
    }

  } catch (error) {
    console.error("Unified Content API Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}
