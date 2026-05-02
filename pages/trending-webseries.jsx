"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { TrendingUp, Eye, Star, Tv, BarChart3, ArrowUpRight, Calendar, Loader2, Flame } from "lucide-react";
import CategoryHeroSection from "../components/category/CategoryHeroSection";

export default function TrendingWebSeries() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/trending-webseries");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Trending webseries fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-zinc-400">Loading trending series...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="text-center py-40">
          <TrendingUp className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg text-zinc-400">No trending data available</h3>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Trending Web Series Analysis | FilmyFire</title>
        <meta name="description" content="Discover trending web series with in-depth analysis, viewership trends, and platform insights." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-zinc-950" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-6">
                <Flame className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-500 font-medium">Live Trending Data</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                Trending Series Analysis
              </h1>
              <p className="text-lg text-zinc-400 mb-8">
                Real-time insights into the hottest web series across all platforms
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tv className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Tracked</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{data.stats.totalTracked}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Avg Rating</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{data.stats.avgRating}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-cyan-500" />
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Trending</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{data.trending?.length || 0}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Platforms</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{data.platformTrends?.length || 0}</p>
                </div>
              </div>

              <Link
                href="/category/webseries"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-300 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
              >
                ← Back to Web Series Hub
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Series */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-8">
            <Flame className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold text-white">🔥 Top Trending Series</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.trending?.map((series, index) => (
              <Link
                key={series._id}
                href={`/category/webseries/${series.slug}`}
                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
              >
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-500">#{index + 1}</span>
                </div>

                {/* Cover Image */}
                <div className="aspect-[2/3] overflow-hidden">
                  {series.coverImage ? (
                    <img
                      src={series.coverImage}
                      alt={series.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 flex items-center justify-center">
                      <Tv className="w-12 h-12 text-zinc-700" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-emerald-500 transition-colors">
                    {series.title}
                  </h3>

                  {series.genres && series.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {series.genres.slice(0, 2).map((genre, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span>{series.rating || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{series.stats?.views?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  {series.ott?.platform && (
                    <div className="mt-2 pt-2 border-t border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Tv className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-zinc-400">{series.ott.platform}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Platform Analytics */}
        {data.platformTrends && data.platformTrends.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-800">
            <div className="flex items-center gap-3 mb-8">
              <Tv className="w-6 h-6 text-teal-500" />
              <h2 className="text-2xl font-bold text-white">Platform Performance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.platformTrends.slice(0, 6).map((platform, index) => (
                <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                      {platform.seriesCount} series
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Articles</span>
                      <span className="text-white font-semibold">{platform.totalArticles}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Avg Rating</span>
                      <span className="text-white font-semibold">{platform.avgRating}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Total Views</span>
                      <span className="text-white font-semibold">{platform.totalViews.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Most Viewed */}
        {data.mostViewed && data.mostViewed.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-800">
            <div className="flex items-center gap-3 mb-8">
              <Eye className="w-6 h-6 text-cyan-500" />
              <h2 className="text-2xl font-bold text-white">Most Viewed Series</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {data.mostViewed.map((series, index) => (
                <Link
                  key={series._id}
                  href={`/category/webseries/${series.slug}`}
                  className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-cyan-500/30 transition-all"
                >
                  <div className="aspect-video mb-3 overflow-hidden rounded-lg">
                    {series.coverImage ? (
                      <img
                        src={series.coverImage}
                        alt={series.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-900/30 to-teal-900/30 flex items-center justify-center">
                        <Tv className="w-8 h-8 text-zinc-700" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-white text-sm font-semibold mb-2 line-clamp-2 group-hover:text-cyan-500 transition-colors">
                    {series.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Eye className="w-3 h-3" />
                    <span>{series.stats?.views?.toLocaleString() || 0} views</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recently Updated */}
        {data.recentlyUpdated && data.recentlyUpdated.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-800">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-white">Recently Updated</h2>
            </div>

            <div className="space-y-3">
              {data.recentlyUpdated.slice(0, 5).map((series) => (
                <Link
                  key={series._id}
                  href={`/category/webseries/${series.slug}`}
                  className="group flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-purple-500/30 transition-all"
                >
                  <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    {series.coverImage ? (
                      <img
                        src={series.coverImage}
                        alt={series.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
                        <Tv className="w-6 h-6 text-zinc-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold mb-2 group-hover:text-purple-500 transition-colors line-clamp-1">
                      {series.title}
                    </h3>
                    {series.summary && (
                      <p className="text-sm text-zinc-500 line-clamp-2 mb-2">{series.summary}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      {series.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500" />
                          <span>{series.rating}</span>
                        </div>
                      )}
                      {series.ott?.platform && (
                        <div className="flex items-center gap-1">
                          <Tv className="w-3 h-3" />
                          <span>{series.ott.platform}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

TrendingWebSeries.noPadding = true;
