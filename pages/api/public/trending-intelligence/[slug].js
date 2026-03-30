import dbConnect from "@/lib/mongodb";
import Article from "@/model/article";
import Celebrity from "@/model/celebrity";

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;

  await dbConnect();

  if (method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // Look for matching Article or Celebrity by slug
    const [matchingArticle, matchingCelebrity] = await Promise.all([
      Article.findOne({ slug }).lean(),
      Celebrity.findOne({ "heroSection.slug": slug }).lean()
    ]);

    let data = null;

    if (matchingArticle) {
      data = {
        _id: matchingArticle._id,
        title: matchingArticle.title,
        movieName: matchingArticle.movieTitle || matchingArticle.title,
        image: matchingArticle.coverImage || "/placeholder.jpg",
        category: matchingArticle.category === "Celebrities" ? "Celebrity" : (matchingArticle.category === "OTT" ? "OTT" : "Explained"),
        slug: matchingArticle.slug,
        description: matchingArticle.summary,
        readTime: matchingArticle.stats?.readTime || "5 min",
        views: `${matchingArticle.stats?.views || 0} views`,
        isDynamic: true,
        sections: matchingArticle.sections || []
      };
    } else if (matchingCelebrity) {
      data = {
        _id: matchingCelebrity._id,
        title: `${matchingCelebrity.heroSection.name} Profile`,
        movieName: matchingCelebrity.heroSection.name,
        image: matchingCelebrity.heroSection.profileImage || "/placeholder.jpg",
        category: "Celebrity",
        slug: matchingCelebrity.heroSection.slug,
        description: matchingCelebrity.netWorth?.analysisSummary || `Deep intelligence analysis of ${matchingCelebrity.heroSection.name}.`,
        readTime: "4 min",
        views: "Dynamic",
        isDynamic: true,
        sections: [
          { heading: "Biography", content: matchingCelebrity.biographyTimeline?.map(b => b.description).join("\n\n") || "" },
          { heading: "Net Worth Analysis", content: matchingCelebrity.netWorth?.description || "" }
        ]
      };
    }

    if (!data) {
      return res.status(404).json({ success: false, message: "Intelligence not found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Detail Intelligence API Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
