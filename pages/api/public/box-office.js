import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { industry, limit = 10, page = 1, sortBy = "roi", q = "" } = req.query;
    
    // Create a unique cache key based on query parameters
    const cacheKey = `public:box-office:v2:${industry || 'all'}:${limit}:${page}:${sortBy}:${q || 'no-q'}`;

    const result = await cacheManager(cacheKey, 300, async () => {
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
        .sort({ publishedAt: -1, createdAt: -1 })
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
      processedData = processedData.map(movie => {
        let completenessScore = 0;
        if (movie.budget !== "N/A") completenessScore += 1;
        if (movie.collection !== "N/A") completenessScore += 1;
        if (movie.roi !== "N/A") completenessScore += 1;
        if (movie.verdict !== "N/A") completenessScore += 1;
        
        return {
          ...movie,
          dataCompleteness: completenessScore 
        };
      });

      processedData = processedData.filter(m => m.dataCompleteness > 0);

      processedData.sort((a, b) => {
        if (b.dataCompleteness !== a.dataCompleteness) {
          return b.dataCompleteness - a.dataCompleteness;
        }
        return b.roiNum - a.roiNum;
      });

      const total = processedData.length;
      const lim = Number(limit);
      const pg = Number(page);
      const start = (pg - 1) * lim;
      const paginatedData = processedData.slice(start, start + lim);

      return {
        paginatedData,
        total,
        limit: lim,
        page: pg,
        pages: Math.ceil(total / lim) || 1
      };
    });

    return res.status(200).json({ 
      success: true, 
      data: result.paginatedData,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (error) {
    console.error("Public Box Office API Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
