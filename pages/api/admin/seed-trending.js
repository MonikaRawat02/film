import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Get all published articles (movies)
    const articles = await Article.find({ status: "published" }).select("movieTitle slug _id coverImage").lean();
    
    // Get all celebrities
    const celebrities = await Celebrity.find({}).select("heroSection.name heroSection.slug _id heroSection.profileImage").lean();

    console.log(`Found ${articles.length} movies and ${celebrities.length} celebrities`);

    const now = new Date();
    const trendingRecords = [];

    // Add trending movies
    for (let i = 0; i < Math.min(articles.length, 5); i++) {
      const article = articles[i];
      trendingRecords.push({
        title: article.movieTitle,
        originalTitle: article.movieTitle,
        type: "trending_movies",
        entityType: "movie",
        referenceId: article._id.toString(),
        referenceModel: "Article",
        slug: article.slug,
        source: "manual",
        traffic: 1000000 - i * 200000,
        viewCount: 5000000 - i * 1000000,
        keywords: [article.movieTitle.toLowerCase().split(" ")[0], "movie", "trending"],
        classificationConfidence: 0.95,
        status: "active",
        region: "IN",
        regionName: "Bollywood",
        contentType: "bollywood",
        trendTimestamp: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        metadata: {
          movieTitle: article.movieTitle,
          coverImage: article.coverImage,
        },
        score: 100 - i * 20,
        updatedAt: now,
        isValidated: true
      });
    }

    // Add trending celebrities
    for (let i = 0; i < Math.min(celebrities.length, 5); i++) {
      const celeb = celebrities[i];
      trendingRecords.push({
        title: celeb.heroSection.name,
        originalTitle: celeb.heroSection.name,
        type: "trending_actors",
        entityType: "actor",
        referenceId: celeb._id.toString(),
        referenceModel: "Celebrity",
        slug: celeb.heroSection.slug,
        source: "manual",
        traffic: 2000000 - i * 400000,
        viewCount: 10000000 - i * 2000000,
        keywords: [celeb.heroSection.name.toLowerCase().split(" ")[0], "actor", "celebrity"],
        classificationConfidence: 0.95,
        status: "active",
        region: "IN",
        regionName: "Bollywood",
        contentType: "bollywood",
        trendTimestamp: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        metadata: {
          actorName: celeb.heroSection.name,
          profileImage: celeb.heroSection.profileImage,
        },
        score: 100 - i * 20,
        updatedAt: now,
        isValidated: true
      });
    }

    // Add a few US/Hollywood celebrities too
    const usCelebrities = celebrities.filter(c => c.heroSection.industry === "Hollywood").slice(0, 3);
    for (let i = 0; i < usCelebrities.length; i++) {
      const celeb = usCelebrities[i];
      trendingRecords.push({
        title: celeb.heroSection.name,
        originalTitle: celeb.heroSection.name,
        type: "trending_actors",
        entityType: "actor",
        referenceId: celeb._id.toString(),
        referenceModel: "Celebrity",
        slug: celeb.heroSection.slug,
        source: "manual",
        traffic: 1500000 - i * 300000,
        viewCount: 7500000 - i * 1500000,
        keywords: [celeb.heroSection.name.toLowerCase().split(" ")[0], "actor", "celebrity", "hollywood"],
        classificationConfidence: 0.95,
        status: "active",
        region: "US",
        regionName: "Hollywood",
        contentType: "hollywood",
        trendTimestamp: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        metadata: {
          actorName: celeb.heroSection.name,
          profileImage: celeb.heroSection.profileImage,
        },
        score: 100 - i * 20,
        updatedAt: now,
        isValidated: true
      });
    }

    // Clear existing trending data first
    await Trending.deleteMany({});

    // Bulk insert the new trending records
    if (trendingRecords.length > 0) {
      const result = await Trending.insertMany(trendingRecords);
      console.log(`Inserted ${result.length} trending records`);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully seeded ${trendingRecords.length} trending records!`,
      data: trendingRecords
    });
  } catch (error) {
    console.error("Error seeding trending data:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
