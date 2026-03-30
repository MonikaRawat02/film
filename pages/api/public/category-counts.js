import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Get article counts grouped by category (Case-insensitive)
    const articleCounts = await Article.aggregate([
      // Consider both published and draft for counting if needed, 
      // but matching the UI request for "automated" data
      { $group: { _id: { $toLower: "$category" }, count: { $sum: 1 } } }
    ]);

    // Get celebrity count (total)
    const celebrityCount = await Celebrity.countDocuments();

    // Map results to a cleaner format
    const countsMap = {
      bollywood: 0,
      hollywood: 0,
      webseries: 0,
      ott: 0,
      boxoffice: 0,
      celebrities: celebrityCount
    };

    articleCounts.forEach(item => {
      const key = item._id ? item._id.toLowerCase() : null;
      if (key && countsMap.hasOwnProperty(key)) {
        countsMap[key] = item.count;
      }
    });

    // Return mapping for UI component
    const finalCounts = {
      Bollywood: countsMap.bollywood,
      Hollywood: countsMap.hollywood,
      WebSeries: countsMap.webseries,
      OTT: countsMap.ott,
      BoxOffice: countsMap.boxoffice,
      Celebrities: countsMap.celebrities
    };

    return res.status(200).json({
      success: true,
      counts: finalCounts
    });
  } catch (error) {
    console.error("Error fetching category counts:", error);
    return res.status(500).json({ message: error.message });
  }
}
