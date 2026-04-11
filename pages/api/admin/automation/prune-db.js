
import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { secret } = req.body;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await dbConnect();
    const categories = ["Bollywood", "Hollywood", "WebSeries", "BoxOffice"];
    const LIMIT = 8;
    const results = [];

    for (const category of categories) {
      const allArticles = await Article.find({
        category: { $regex: new RegExp(`^${category}$`, 'i') }
      }).sort({ createdAt: -1 });

      // Identify AI articles: isAIContent is true OR has many sections
      const aiArticles = allArticles.filter(a => a.isAIContent === true || (a.sections && a.sections.length > 5));
      
      let keptCount = 0;
      let deletedCount = 0;

      if (aiArticles.length > 0) {
        const toKeep = aiArticles.slice(0, LIMIT).map(a => a._id);
        const deleteRes = await Article.deleteMany({
          category: { $regex: new RegExp(`^${category}$`, 'i') },
          _id: { $nin: toKeep }
        });
        keptCount = toKeep.length;
        deletedCount = deleteRes.deletedCount;
      } else if (allArticles.length > 0) {
        const toKeep = allArticles.slice(0, LIMIT).map(a => a._id);
        const deleteRes = await Article.deleteMany({
          category: { $regex: new RegExp(`^${category}$`, 'i') },
          _id: { $nin: toKeep }
        });
        keptCount = toKeep.length;
        deletedCount = deleteRes.deletedCount;
      }

      results.push({ category, kept: keptCount, deleted: deletedCount });
    }

    const finalTotal = await Article.countDocuments({});

    return res.status(200).json({
      success: true,
      results,
      finalTotal
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
