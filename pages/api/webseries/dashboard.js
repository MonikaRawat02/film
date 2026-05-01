import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { section } = req.query;
    const cacheKey = `webseries:dashboard:v2:${section || "all"}`;

    const data = await cacheManager(cacheKey, 600, async () => {
      await dbConnect();

      const wsFilter = {
        status: "published",
        $or: [
          { category: "WebSeries" },
          { contentType: "webseries" },
          { category: "OTT" },
        ],
      };

      if (section === "seasonBreakdown") {
        const articles = await Article.find(wsFilter)
          .select("title slug movieTitle coverImage genres rating ott releaseYear stats tags sections summary")
          .sort({ "stats.rating": -1, publishedAt: -1 })
          .limit(30)
          .lean();

        const series = articles.map(article => {
          const fullText = article.sections?.map(s => s.content || "").join(" ") || "";
          const seasonRegex = /season\s*(\d+)/gi;
          const seasonsFound = new Set();
          let match;
          while ((match = seasonRegex.exec(fullText)) !== null) {
            seasonsFound.add(parseInt(match[1]));
          }

          return {
            _id: article._id,
            title: article.movieTitle || article.title,
            slug: article.slug,
            coverImage: article.coverImage,
            platform: article.ott?.platform || "Unknown",
            genres: article.genres || [],
            rating: article.stats?.rating || article.rating || 0,
            releaseYear: article.releaseYear,
            ottLink: article.ott?.link,
            seasonsFound: seasonsFound.size > 0 ? [...seasonsFound].map(s => ({ season: s })) : null,
            summary: article.summary,
            views: article.stats?.views || 0,
            readTime: article.stats?.readTime,
          };
        });

        return { series, total: series.length };
      }

      if (section === "platformAnalytics") {
        // Build platform data entirely from Article aggregation
        const [
          platformAgg,
          genreAgg,
          topArticles,
          totalArticles,
        ] = await Promise.all([
          // Platform distribution from articles
          Article.aggregate([
            { $match: { ...wsFilter, "ott.platform": { $exists: true, $ne: "" } } },
            { $group: {
              _id: "$ott.platform",
              totalArticles: { $sum: 1 },
              avgRating: { $avg: "$stats.rating" },
              totalViews: { $sum: "$stats.views" },
              seriesCount: { $sum: { $cond: [{ $eq: ["$contentType", "webseries"] }, 1, 0] } },
              movieCount: { $sum: { $cond: [{ $eq: ["$contentType", "movie"] }, 1, 0] } },
              latestArticle: { $max: "$publishedAt" },
            }},
            { $sort: { totalArticles: -1 } },
          ]),
          // Genre distribution per platform
          Article.aggregate([
            { $match: { ...wsFilter, "ott.platform": { $exists: true, $ne: "" } } },
            { $unwind: "$genres" },
            { $group: {
              _id: { platform: "$ott.platform", genre: "$genres" },
              count: { $sum: 1 },
            }},
            { $sort: { count: -1 } },
          ]),
          // Top rated articles per platform
          Article.find({ ...wsFilter, "ott.platform": { $exists: true, $ne: "" } })
            .select("ott.platform movieTitle title slug stats.rating coverImage genres contentType summary")
            .sort({ "stats.rating": -1 })
            .limit(50)
            .lean(),
          // Total count
          Article.countDocuments(wsFilter),
        ]);

        // Group genres by platform
        const genresByPlatform = {};
        genreAgg.forEach(g => {
          if (!genresByPlatform[g._id.platform]) genresByPlatform[g._id.platform] = [];
          genresByPlatform[g._id.platform].push({ genre: g._id.genre, count: g.count });
        });

        // Group top articles by platform
        const articlesByPlatform = {};
        topArticles.forEach(a => {
          const pName = a.ott?.platform;
          if (!pName) return;
          if (!articlesByPlatform[pName]) articlesByPlatform[pName] = [];
          if (articlesByPlatform[pName].length < 5) {
            articlesByPlatform[pName].push(a);
          }
        });

        // Calculate total views across all platforms for share calculation
        const totalViews = platformAgg.reduce((s, p) => s + (p.totalViews || 0), 0);

        const platforms = platformAgg.map((p, idx) => ({
          _id: `plat_${idx}`,
          name: p._id,
          slug: p._id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          rank: idx + 1,
          totalArticles: p.totalArticles,
          seriesCount: p.seriesCount,
          movieCount: p.movieCount,
          avgRating: p.avgRating?.toFixed(1) || "N/A",
          totalViews: p.totalViews || 0,
          viewsShare: totalViews > 0 ? ((p.totalViews / totalViews) * 100).toFixed(1) : 0,
          latestActivity: p.latestArticle,
          genreStrength: (genresByPlatform[p._id] || []).slice(0, 5),
          topArticles: articlesByPlatform[p._id] || [],
        }));

        return {
          kpis: {
            totalPlatforms: platformAgg.length,
            totalArticles,
            totalViews,
            totalSeries: platformAgg.reduce((s, p) => s + p.seriesCount, 0),
          },
          platforms,
        };
      }

      if (section === "viewershipTrends") {
        // Build all trend data from Article model
        const [
          genreDistribution,
          platformTrendAgg,
          topRated,
          recentPublishes,
          totalSeries,
          categoryBreakdown,
        ] = await Promise.all([
          // Genre distribution
          Article.aggregate([
            { $match: wsFilter },
            { $unwind: "$genres" },
            { $group: { _id: "$genres", count: { $sum: 1 }, avgRating: { $avg: "$stats.rating" }, totalViews: { $sum: "$stats.views" } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ]),
          // Platform trend data (views as popularity proxy)
          Article.aggregate([
            { $match: { ...wsFilter, "ott.platform": { $exists: true, $ne: "" } } },
            { $group: {
              _id: "$ott.platform",
              totalArticles: { $sum: 1 },
              avgRating: { $avg: "$stats.rating" },
              totalViews: { $sum: "$stats.views" },
              seriesCount: { $sum: { $cond: [{ $eq: ["$contentType", "webseries"] }, 1, 0] } },
            }},
            { $sort: { totalViews: -1 } },
          ]),
          // Top rated series
          Article.find(wsFilter)
            .select("movieTitle title slug stats.rating stats.views coverImage genres ott.platform contentType")
            .sort({ "stats.rating": -1 })
            .limit(16)
            .lean(),
          // Recently published
          Article.find(wsFilter)
            .select("movieTitle title slug publishedAt stats.views stats.rating coverImage genres ott.platform")
            .sort({ publishedAt: -1 })
            .limit(10)
            .lean(),
          // Total count
          Article.countDocuments(wsFilter),
          // Category breakdown
          Article.aggregate([
            { $match: { status: "published" } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
        ]);

        return {
          kpis: {
            totalSeriesTracked: totalSeries,
            totalGenres: genreDistribution.length,
            totalPlatforms: platformTrendAgg.length,
            totalViews: topRated.reduce((s, a) => s + (a.stats?.views || 0), 0),
          },
          genreDistribution,
          platformTrends: platformTrendAgg.map(p => ({
            name: p._id,
            totalArticles: p.totalArticles,
            avgRating: p.avgRating?.toFixed(1) || "N/A",
            totalViews: p.totalViews || 0,
            seriesCount: p.seriesCount,
          })),
          topRated,
          recentPublishes,
          categoryBreakdown,
        };
      }

      if (section === "renewalStatus") {
        const articles = await Article.find(wsFilter)
          .select("title slug movieTitle coverImage genres rating ott releaseYear stats sections tags summary publishedAt")
          .sort({ publishedAt: -1 })
          .lean();

        const renewed = [];
        const pending = [];
        const ended = [];

        articles.forEach(article => {
          const fullText = (article.sections?.map(s => s.content || "").join(" ") || "").toLowerCase();
          const tags = (article.tags || []).join(" ").toLowerCase();

          const hasRenewalHint = /renewed|season\s*2|season\s*3|new season|upcoming season/i.test(fullText) || tags.includes("renewed");
          const hasEndingHint = /cancelled|final season|ended|concluded|wrapped/i.test(fullText) || tags.includes("cancelled");
          const hasPendingHint = /awaiting|pending renewal|yet to be renewed/i.test(fullText) || tags.includes("pending");

          const entry = {
            _id: article._id,
            title: article.movieTitle || article.title,
            slug: article.slug,
            coverImage: article.coverImage,
            platform: article.ott?.platform || "Unknown",
            genres: article.genres || [],
            rating: article.stats?.rating || article.rating || 0,
            releaseYear: article.releaseYear,
            summary: article.summary,
            publishedAt: article.publishedAt,
          };

          if (hasEndingHint) ended.push(entry);
          else if (hasPendingHint) pending.push(entry);
          else renewed.push(entry);
        });

        return { renewed, pending, ended, total: articles.length };
      }

      if (section === "industryInsights") {
        // Build entirely from Article + Celebrity models
        const [
          genreDistribution,
          platformDistribution,
          topDirectors,
          topActors,
          yearDistribution,
          totalArticles,
          totalCelebrities,
        ] = await Promise.all([
          // Genre distribution
          Article.aggregate([
            { $match: wsFilter },
            { $unwind: "$genres" },
            { $group: { _id: "$genres", count: { $sum: 1 }, avgRating: { $avg: "$stats.rating" }, totalViews: { $sum: "$stats.views" } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ]),
          // Platform distribution
          Article.aggregate([
            { $match: { ...wsFilter, "ott.platform": { $exists: true, $ne: "" } } },
            { $group: {
              _id: "$ott.platform",
              totalArticles: { $sum: 1 },
              avgRating: { $avg: "$stats.rating" },
              totalViews: { $sum: "$stats.views" },
              seriesCount: { $sum: { $cond: [{ $eq: ["$contentType", "webseries"] }, 1, 0] } },
            }},
            { $sort: { totalArticles: -1 } },
          ]),
          // Top directors from articles
          Article.aggregate([
            { $match: wsFilter },
            { $unwind: "$director" },
            { $group: { _id: "$director", count: { $sum: 1 }, avgRating: { $avg: "$stats.rating" } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
          ]),
          // Top actors from cast
          Article.aggregate([
            { $match: wsFilter },
            { $unwind: "$cast" },
            { $group: { _id: "$cast.name", appearances: { $sum: 1 }, avgRating: { $avg: "$stats.rating" }, roles: { $push: "$cast.role" } } },
            { $sort: { appearances: -1 } },
            { $limit: 8 },
          ]),
          // Year distribution
          Article.aggregate([
            { $match: { ...wsFilter, releaseYear: { $exists: true, $ne: null } } },
            { $group: { _id: "$releaseYear", count: { $sum: 1 }, avgRating: { $avg: "$stats.rating" } } },
            { $sort: { _id: -1 } },
            { $limit: 10 },
          ]),
          Article.countDocuments(wsFilter),
          Celebrity.countDocuments({}),
        ]);

        const totalViews = platformDistribution.reduce((s, p) => s + (p.totalViews || 0), 0);

        return {
          kpis: {
            totalArticles,
            totalCelebrities,
            totalPlatforms: platformDistribution.length,
            totalGenres: genreDistribution.length,
            totalViews,
          },
          genreDistribution,
          platforms: platformDistribution.map((p, idx) => ({
            name: p._id,
            totalArticles: p.totalArticles,
            avgRating: p.avgRating?.toFixed(1) || "N/A",
            totalViews: p.totalViews || 0,
            viewsShare: totalViews > 0 ? ((p.totalViews / totalViews) * 100).toFixed(1) : 0,
            seriesCount: p.seriesCount,
          })),
          topDirectors,
          topActors,
          yearDistribution,
        };
      }

      // Default overview
      const totalArticles = await Article.countDocuments(wsFilter);
      return { overview: { totalSeriesArticles: totalArticles } };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("WebSeries Dashboard API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
