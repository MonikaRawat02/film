import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";
import BoxOffice from "../../../model/boxOffice";
import OTTIntelligence from "../../../model/ottIntelligence";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const cacheKey = 'public:homepage-unified';
    
    // Cache for 5 minutes
    const data = await cacheManager(cacheKey, 300, async () => {
      await dbConnect();

      // Fetch all homepage data in parallel
      const [
        categoryCounts,
        celebrities,
        recentGuides,
        boxOfficeData,
        ottIntelligence
      ] = await Promise.all([
        // Category counts
        (async () => {
          const articleCounts = await Article.aggregate([
            { $match: { status: "published" } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
          ]);
          
          const celebrityCount = await Celebrity.countDocuments();
          const boxOfficeCount = await BoxOffice.countDocuments();
          
          const countsMap = {
            Bollywood: 0,
            Hollywood: 0,
            WebSeries: 0,
            OTT: 0,
            BoxOffice: boxOfficeCount,
            Celebrities: celebrityCount
          };

          articleCounts.forEach(item => {
            if (countsMap.hasOwnProperty(item._id)) {
              countsMap[item._id] = item.count;
            }
          });
          
          return countsMap;
        })(),

        // Celebrities
        Celebrity.find({})
          .select("heroSection.name heroSection.profileImage heroSection.slug heroSection.profession profession")
          .limit(10)
          .sort({ createdAt: -1 })
          .lean(),

        // Recent guides
        Article.find({ status: 'published' })
          .sort({ publishedAt: -1 })
          .limit(3)
          .select("title summary slug category stats")
          .lean(),

        // Box office
        BoxOffice.find({})
          .sort({ createdAt: -1 })
          .limit(3)
          .lean(),

        // OTT Intelligence
        OTTIntelligence.find({})
          .sort({ createdAt: -1 })
          .limit(3)
          .lean()
      ]);

      // Transform celebrities
      const transformedCelebrities = celebrities.map(celeb => ({
        _id: celeb._id,
        name: celeb.heroSection?.name || celeb.name,
        profileImage: celeb.heroSection?.profileImage || celeb.profileImage,
        slug: celeb.heroSection?.slug || celeb.slug,
        profession: celeb.heroSection?.profession || celeb.profession || ["Entertainment Professional"]
      }));

      return {
        categoryCounts,
        celebrities: transformedCelebrities,
        recentGuides,
        boxOffice: boxOfficeData,
        ottIntelligence
      };
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Unified Homepage API Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
