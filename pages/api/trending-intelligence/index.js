import dbConnect from "@/lib/mongodb";
import SearchAnalytics from "@/model/searchAnalytics";
import Article from "@/model/article";
import Celebrity from "@/model/celebrity";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // ONLY build list from searches to ensure automation
    const searchStats = await SearchAnalytics.find({})
      .sort({ count: -1 })
      .limit(12)
      .lean();

    const dynamicItems = [];
    for (const search of searchStats) {
      // Look for matching Article or Celebrity
      const [matchingArticle, matchingCelebrity] = await Promise.all([
        Article.findOne({ 
          $or: [
            { movieTitle: new RegExp(search.query, 'i') },
            { title: new RegExp(search.query, 'i') }
          ]
        }).lean(),
        Celebrity.findOne({ 
          "heroSection.name": new RegExp(search.query, 'i') 
        }).lean()
      ]);

      if (matchingArticle) {
        // Calculate read time based on section content
        const totalWords = (matchingArticle.sections || []).reduce((acc, s) => acc + (s.content?.split(/\s+/).length || 0), 0);
        const dynamicReadTime = `${Math.max(4, Math.ceil(totalWords / 200))} min`;
        
        // Use real rating if available, otherwise generate a pseudo-dynamic one
        const dynamicRating = matchingArticle.rating || (Math.random() * (9.7 - 8.2) + 8.2).toFixed(1);

        dynamicItems.push({
          _id: `dynamic-${matchingArticle._id}`,
          title: matchingArticle.title,
          movieName: matchingArticle.movieTitle || matchingArticle.title,
          image: matchingArticle.coverImage || "/placeholder.jpg",
          category: matchingArticle.category === "Celebrities" ? "Celebrity" : (matchingArticle.category === "OTT" ? "OTT" : "Explained"),
          slug: matchingArticle.slug,
          description: matchingArticle.summary,
          readTime: dynamicReadTime,
          views: `${(search.count * 150 + 800).toLocaleString()} views`,
          rating: dynamicRating,
          searchCount: search.count,
          isDynamic: true
        });
      } else if (matchingCelebrity) {
        // Calculate read time for profiles
        const profileWords = matchingCelebrity.netWorth?.analysisSummary?.split(/\s+/).length || 0;
        const dynamicReadTime = `${Math.max(3, Math.ceil(profileWords / 150) + 2)} min`;
        
        // For celebrities, use growth percentage or dynamic rating
        const dynamicRating = matchingCelebrity.heroSection?.growthPercentage 
          ? (matchingCelebrity.heroSection.growthPercentage / 10 + 7).toFixed(1)
          : (Math.random() * (9.8 - 8.5) + 8.5).toFixed(1);

        dynamicItems.push({
          _id: `dynamic-${matchingCelebrity._id}`,
          title: `${matchingCelebrity.heroSection.name} Profile`,
          movieName: matchingCelebrity.heroSection.name,
          image: matchingCelebrity.heroSection.profileImage || "/placeholder.jpg",
          category: "Celebrity",
          slug: matchingCelebrity.heroSection.slug,
          description: matchingCelebrity.netWorth?.analysisSummary || `Deep intelligence analysis of ${matchingCelebrity.heroSection.name}.`,
          readTime: dynamicReadTime,
          views: `${(search.count * 120 + 500).toLocaleString()} views`,
          rating: dynamicRating,
          searchCount: search.count,
          isDynamic: true
        });
      }
    }

    // Return only automated items, sorted by search popularity
    const combined = dynamicItems
      .sort((a, b) => (b.searchCount || 0) - (a.searchCount || 0));

    res.status(200).json({ success: true, data: combined });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
