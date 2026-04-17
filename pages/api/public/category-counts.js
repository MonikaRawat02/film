import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Get article counts grouped by category
    const articleCounts = await Article.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Get celebrity count (total)
    const celebrityCount = await Celebrity.countDocuments();

    // Debug logging
    console.log("Article counts by category:", articleCounts);

    // Map results to a cleaner format
    const countsMap = {
      Bollywood: 0,
      Hollywood: 0,
      WebSeries: 0,
      OTT: 0,
      BoxOffice: 0,
      Celebrities: celebrityCount
    };

    articleCounts.forEach(item => {
      if (countsMap.hasOwnProperty(item._id)) {
        countsMap[item._id] = item.count;
      }
    });

    console.log("Final counts map:", countsMap);

    return res.status(200).json({
      success: true,
      counts: countsMap
    });
  } catch (error) {
    console.error("Error fetching category counts:", error);
    return res.status(500).json({ message: error.message });
  }
}
