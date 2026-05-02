"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Eye, BarChart3, Loader2, Tv, Star, Calendar, ArrowUpRight } from "lucide-react";

export default function WebSeriesViewershipTrends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/webseries/dashboard?section=viewershipTrends");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error("ViewershipTrends fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <span className="ml-3 text-zinc-400">Loading viewership data...</span>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl">
          <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No viewership data available yet.</p>
        </div>
      </section>
    );
  }

  const { kpis, genreDistribution, platformTrends, topRated, recentPublishes, categoryBreakdown } = data;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-7 h-7 text-cyan-500" />
          <h2 className="text-3xl font-bold text-white">Viewership Trends & Insights</h2>
        </div>
        <p className="text-zinc-400 text-lg">
          Content performance, genre trends & popularity from your articles
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-cyan-500" />
            <span className="text-zinc-400 text-sm">Series Tracked</span>
          </div>
          <p className="text-2xl font-bold text-white">{kpis?.totalSeriesTracked || 0}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-cyan-500" />
            <span className="text-zinc-400 text-sm">Genres</span>
          </div>
          <p className="text-2xl font-bold text-white">{kpis?.totalGenres || 0}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Tv className="w-5 h-5 text-cyan-500" />
            <span className="text-zinc-400 text-sm">Platforms</span>
          </div>
          <p className="text-2xl font-bold text-white">{kpis?.totalPlatforms || 0}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
            <span className="text-zinc-400 text-sm">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-white">{kpis?.totalViews?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Top Rated Content */}
      {topRated?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-cyan-500" />
            Top Rated Content
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topRated.slice(0, 16).map((item, idx) => (
              <a
                key={item._id || idx}
                href={`/category/webseries/${item.slug}`}
                className={`bg-zinc-800/50 border rounded-xl p-4 hover:border-cyan-500/30 transition-all block ${idx < 3 ? "border-cyan-500/50" : "border-zinc-700"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm line-clamp-2">{item.movieTitle || item.title}</h4>
                  <span className="text-cyan-400 font-bold text-sm ml-2 flex-shrink-0">
                    {item.stats?.rating || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                  {item.ott?.platform && (
                    <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">{item.ott.platform}</span>
                  )}
                  {item.contentType && (
                    <span className="text-zinc-500">{item.contentType}</span>
                  )}
                </div>
                {item.stats?.views > 0 && (
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Eye className="w-3 h-3" />
                    {item.stats.views.toLocaleString()} views
                  </div>
                )}
                {item.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.genres.slice(0, 2).map((g, gIdx) => (
                      <span key={gIdx} className="px-1.5 py-0.5 bg-zinc-700/50 text-zinc-400 rounded text-[10px]">{g}</span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Platform Trend Performance */}
      {platformTrends?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Tv className="w-5 h-5 text-cyan-500" />
            Platform Content Performance
          </h3>
          <div className="space-y-4">
            {platformTrends.map((pt, idx) => (
              <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                      <Tv className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{pt.name}</h4>
                      <p className="text-zinc-500 text-xs">{pt.totalArticles} articles • {pt.seriesCount} series</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">{pt.avgRating}</p>
                      <p className="text-zinc-500 text-[10px]">Avg Rating</p>
                    </div>
                    <div className="text-right">
                      <p className="text-teal-400 font-bold">{pt.totalViews?.toLocaleString() || 0}</p>
                      <p className="text-zinc-500 text-[10px]">Total Views</p>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((pt.totalViews / (platformTrends[0]?.totalViews || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Genre Distribution */}
      {genreDistribution?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-white mb-6">Genre Distribution Analysis</h3>
          <div className="space-y-4">
            {genreDistribution.map((genre, idx) => (
              <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{genre._id}</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400 text-sm">{genre.count} articles</span>
                    {genre.avgRating > 0 && (
                      <span className="text-cyan-400 text-sm flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {genre.avgRating.toFixed(1)} avg
                      </span>
                    )}
                    {genre.totalViews > 0 && (
                      <span className="text-zinc-500 text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {genre.totalViews.toLocaleString()} views
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((genre.count / (genreDistribution[0]?.count || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Published */}
      {recentPublishes?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-500" />
            Recently Published
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {recentPublishes.map((item, idx) => (
              <a
                key={item._id || idx}
                href={`/category/webseries/${item.slug}`}
                className="flex items-center gap-4 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-cyan-500/30 transition-colors"
              >
                {item.coverImage ? (
                  <img src={item.coverImage} alt="" className="w-12 h-16 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-16 bg-zinc-700 rounded flex items-center justify-center flex-shrink-0">
                    <Tv className="w-5 h-5 text-zinc-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm line-clamp-1">{item.movieTitle || item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    {item.ott?.platform && <span>{item.ott.platform}</span>}
                    {item.publishedAt && <span>{new Date(item.publishedAt).toLocaleDateString()}</span>}
                  </div>
                  {item.stats?.views > 0 && (
                    <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                      <Eye className="w-3 h-3" />
                      {item.stats.views.toLocaleString()} views
                    </div>
                  )}
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400" />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
