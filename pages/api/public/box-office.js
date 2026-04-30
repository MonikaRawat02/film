import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // Enable browser/CDN caching for 5 minutes
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  try {
    const { industry, limit = 20, page = 1, sortBy = "roi", q = "", _t } = req.query;
    
    await dbConnect();
    
    let query = { status: "published" };
    
    if (industry && industry !== 'all') {
      query.category = industry;
    }

    if (q) {
      const searchRegex = { $regex: q, $options: "i" };
      query.$or = [
        { title: searchRegex },
        { movieTitle: searchRegex },
        { slug: searchRegex }
      ];
    }

    const articles = await Article.find(query)
      .select('movieTitle title slug category budget boxOffice verdict sections')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(100)
      .lean();

    const parseCurrency = (str) => {
      if (!str || typeof str !== 'string' || str.toLowerCase() === 'n/a') return 0;
      const match = str.match(/(\d+(\.\d+)?)/);
      if (!match) return 0;
      let num = parseFloat(match[0]);
      const lowerStr = str.toLowerCase();
      if (lowerStr.includes('crore') || lowerStr.includes('cr')) num *= 10000000;
      else if (lowerStr.includes('lakh')) num *= 100000;
      else if (lowerStr.includes('billion') || lowerStr.includes(' b')) num *= 1000000000;
      else if (lowerStr.includes('million') || lowerStr.includes(' m')) num *= 1000000;
      return num;
    };

    let processedData = articles.map(movie => {
      const budgetStr = movie.budget || "N/A";
      const collectionStr = movie.boxOffice?.worldwide || movie.boxOffice?.india || "N/A";
      const budgetNum = parseCurrency(budgetStr);
      const collectionNum = parseCurrency(collectionStr);
      let roiPercentage = 0;
      if (budgetNum > 0) {
        roiPercentage = (collectionNum - budgetNum) / budgetNum;
      }

      let verdict = movie.verdict;
      if (!verdict && budgetNum > 0 && collectionNum > 0) {
        if (roiPercentage > 3) verdict = "BLOCKBUSTER";
        else if (roiPercentage > 1.5) verdict = "SUPER HIT";
        else if (roiPercentage > 0.5) verdict = "HIT";
        else if (roiPercentage >= -0.1) verdict = "AVERAGE";
        else verdict = "FLOP";
      }

      return {
        _id: movie._id,
        movieName: movie.movieTitle || movie.title,
        slug: movie.slug,
        category: movie.category,
        budget: budgetStr,
        collection: collectionStr,
        roi: movie.boxOffice?.roi || (roiPercentage !== 0 ? `${(roiPercentage * 100).toFixed(0)}%` : "N/A"),
        roiNum: roiPercentage,
        budgetNum,
        collectionNum,
        verdict: verdict || "N/A",
        analysisLink: `/movie/${movie.slug}-box-office`
      };
    });

    processedData = processedData.filter(m => m.movieName);

    // Calculate data completeness score for each movie
    // This helps prioritize movies with more complete financial data
    processedData = processedData.map(movie => {
      let completenessScore = 0;
      if (movie.budget !== "N/A") completenessScore += 1;
      if (movie.collection !== "N/A") completenessScore += 1;
      if (movie.roi !== "N/A") completenessScore += 1;
      if (movie.verdict !== "N/A") completenessScore += 1;
      
      return {
        ...movie,
        dataCompleteness: completenessScore // 0-4 score
      };
    });

    // Filter out movies with ZERO financial data (all fields are N/A)
    // Keep movies that have at least SOME data
    processedData = processedData.filter(m => m.dataCompleteness > 0);

    // Sort by data completeness first (complete data shows first)
    // Then by ROI for movies with same completeness
    processedData.sort((a, b) => {
      // First sort by completeness (higher = more complete)
      if (b.dataCompleteness !== a.dataCompleteness) {
        return b.dataCompleteness - a.dataCompleteness;
      }
      // Then sort by ROI for movies with same completeness level
      return b.roiNum - a.roiNum;
    });

    const total = processedData.length;
    const lim = Number(limit);
    const pg = Number(page);
    const start = (pg - 1) * lim;
    const paginatedData = processedData.slice(start, start + lim);

    const result = {
      success: true, 
      data: paginatedData,
      pagination: {
        total,
        page: pg,
        limit: lim,
        pages: Math.ceil(total / lim) || 1
      }
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Public Box Office API Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
