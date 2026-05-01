"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Eye, Globe, Zap, Award, Loader2, Users, Calendar, Tv, Star } from "lucide-react";

export default function WebSeriesIndustryInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/webseries/dashboard?section=industryInsights");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error("IndustryInsights fetch error:", err);
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
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-zinc-400">Loading industry data...</span>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl">
          <TrendingUp className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No industry data available yet.</p>
        </div>
      </section>
    );
  }

  const { kpis, genreDistribution, platforms, topDirectors, topActors, yearDistribution } = data;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-7 h-7 text-emerald-500" />
          <h2 className="text-3xl font-bold text-white">Industry Intelligence</h2>
        </div>
        <p className="text-zinc-400 text-lg">Real data from your articles & celebrities database</p>
      </div>

      {/* Market Overview KPIs */}
      <div className="bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-cyan-900/20 border border-emerald-800/30 rounded-2xl p-8 mb-12">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-500" />
          Content Landscape
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              {kpis.totalArticles}
            </div>
            <p className="text-zinc-400 text-sm">Total Articles</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              {kpis.totalCelebrities}
            </div>
            <p className="text-zinc-400 text-sm">Celebrities Tracked</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              {kpis.totalPlatforms}
            </div>
            <p className="text-zinc-400 text-sm">Platforms Covered</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              {kpis.totalGenres}
            </div>
            <p className="text-zinc-400 text-sm">Genre Categories</p>
          </div>
        </div>
      </div>

      {/* Platform Content Distribution */}
      {platforms?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Tv className="w-5 h-5 text-emerald-500" />
            Platform Content Distribution
          </h3>
          <div className="space-y-4">
            {platforms.map((platform, idx) => (
              <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Tv className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{platform.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span>{platform.totalArticles} articles</span>
                      <span>{platform.seriesCount} series</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-emerald-400 font-bold">{platform.avgRating}</p>
                    <p className="text-zinc-500 text-[10px]">Avg Rating</p>
                  </div>
                  <div>
                    <p className="text-teal-400 font-bold">{platform.viewsShare}%</p>
                    <p className="text-zinc-500 text-[10px]">Views Share</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Genre Analysis */}
      {genreDistribution?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            Genre Analysis
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {genreDistribution.map((genre, idx) => (
              <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm">{genre._id}</h4>
                  <span className="text-emerald-400 text-sm font-bold">{genre.count}</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                    style={{ width: `${Math.min((genre.count / (genreDistribution[0]?.count || 1)) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  {genre.avgRating > 0 && <span>★ {genre.avgRating.toFixed(1)} avg</span>}
                  {genre.totalViews > 0 && <span>{genre.totalViews.toLocaleString()} views</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Directors */}
      {topDirectors?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            Top Directors
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topDirectors.map((director, idx) => (
              <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    {director._id?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{director._id}</h4>
                    <p className="text-zinc-500 text-xs">{director.count} project{director.count > 1 ? "s" : ""}</p>
                  </div>
                </div>
                {director.avgRating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span className="text-white">{director.avgRating.toFixed(1)}</span>
                    <span className="text-zinc-500 text-xs">avg rating</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Actors */}
      {topActors?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Top Actors
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topActors.map((actor, idx) => (
              <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                    {actor._id?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{actor._id}</h4>
                    <p className="text-zinc-500 text-xs">{actor.appearances} appearance{actor.appearances > 1 ? "s" : ""}</p>
                  </div>
                </div>
                {actor.avgRating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span className="text-white">{actor.avgRating.toFixed(1)}</span>
                    <span className="text-zinc-500 text-xs">avg rating</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Year Distribution */}
      {yearDistribution?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            Release Year Distribution
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {yearDistribution.map((year, idx) => (
              <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center hover:border-emerald-500/30 transition-colors">
                <p className="text-2xl font-bold text-white mb-1">{year._id}</p>
                <p className="text-emerald-400 font-semibold">{year.count} articles</p>
                {year.avgRating > 0 && (
                  <p className="text-zinc-500 text-xs mt-1">★ {year.avgRating.toFixed(1)} avg</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
