"use client";

import { useState, useEffect } from "react";
import { Tv, Star, Globe, Play, Loader2, TrendingUp, FileText, Eye } from "lucide-react";

export default function WebSeriesPlatformAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/webseries/dashboard?section=platformAnalytics");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error("PlatformAnalytics fetch error:", err);
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
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <span className="ml-3 text-zinc-400">Loading platform data...</span>
        </div>
      </section>
    );
  }

  if (!data || !data.platforms || data.platforms.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl">
          <Tv className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No platform data available yet.</p>
          <p className="text-zinc-600 text-sm mt-1">Platform data appears when articles have OTT platform info.</p>
        </div>
      </section>
    );
  }

  const { kpis, platforms } = data;

  const getColor = (idx) => {
    const colors = [
      "from-red-600 to-red-800", "from-blue-600 to-blue-800",
      "from-indigo-600 to-indigo-800", "from-slate-600 to-slate-800",
      "from-violet-600 to-violet-800", "from-green-600 to-green-800",
      "from-orange-600 to-orange-800",
    ];
    return colors[idx % colors.length];
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Tv className="w-7 h-7 text-teal-500" />
          <h2 className="text-3xl font-bold text-white">Platform Performance Analytics</h2>
        </div>
        <p className="text-zinc-400 text-lg">
          Platform data from your articles — content distribution, ratings & views
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-teal-500" />
          Content Overview
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              {kpis.totalPlatforms}
            </div>
            <p className="text-zinc-400 text-sm">Platforms Found</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              {kpis.totalArticles}
            </div>
            <p className="text-zinc-400 text-sm">Total Articles</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              {kpis.totalSeries}
            </div>
            <p className="text-zinc-400 text-sm">Web Series</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              {kpis.totalViews?.toLocaleString() || 0}
            </div>
            <p className="text-zinc-400 text-sm">Total Views</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {platforms.map((platform, idx) => (
          <div
            key={platform._id || idx}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all duration-300"
          >
            <div className={`bg-gradient-to-r ${getColor(idx)} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">{platform.name}</h3>
                <span className="bg-white/20 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                  #{platform.rank}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-white/70 text-xs mb-1">Articles</p>
                  <p className="text-white font-bold text-lg">{platform.totalArticles}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs mb-1">Avg Rating</p>
                  <p className="text-white font-bold text-lg">{platform.avgRating}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs mb-1">Views Share</p>
                  <p className="text-white font-bold text-lg">{platform.viewsShare}%</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Content breakdown */}
              <div className="flex items-center gap-4 mb-4 bg-zinc-800/50 rounded-lg p-3">
                <Tv className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-zinc-400">Web Series:</span>
                <span className="text-teal-400 font-semibold">{platform.seriesCount}</span>
                <span className="text-zinc-600">|</span>
                <span className="text-sm text-zinc-400">Movies:</span>
                <span className="text-teal-400 font-semibold">{platform.movieCount}</span>
                {platform.totalViews > 0 && (
                  <>
                    <span className="text-zinc-600">|</span>
                    <span className="text-sm text-zinc-400">Views:</span>
                    <span className="text-teal-400 font-semibold">{platform.totalViews.toLocaleString()}</span>
                  </>
                )}
              </div>

              {/* Genre strength */}
              {platform.genreStrength?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Genre Strength</h4>
                  <div className="flex flex-wrap gap-2">
                    {platform.genreStrength.map((gs, gsIdx) => (
                      <span key={gsIdx} className="px-2 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded text-xs">
                        {gs.genre} ({gs.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top articles */}
              {platform.topArticles?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Top Content</h4>
                  <div className="space-y-2">
                    {platform.topArticles.map((article, aIdx) => (
                      <a
                        key={aIdx}
                        href={`/category/webseries/${article.slug}`}
                        className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3 hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {article.coverImage ? (
                            <img src={article.coverImage} alt="" className="w-8 h-10 rounded object-cover" />
                          ) : (
                            <FileText className="w-4 h-4 text-teal-500" />
                          )}
                          <div>
                            <p className="text-white font-medium text-sm">{article.movieTitle || article.title}</p>
                            {article.genres?.length > 0 && (
                              <p className="text-zinc-500 text-xs">{article.genres.slice(0, 2).join(", ")}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {article.stats?.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500" />
                              <span className="text-white text-sm font-semibold">{article.stats.rating}</span>
                            </div>
                          )}
                          {article.stats?.views > 0 && (
                            <div className="flex items-center gap-1 text-zinc-500 text-xs">
                              <Eye className="w-3 h-3" />
                              {article.stats.views.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
