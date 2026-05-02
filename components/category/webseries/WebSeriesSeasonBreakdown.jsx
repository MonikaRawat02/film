"use client";

import { useState, useEffect } from "react";
import { Calendar, Tv, Star, Clock, TrendingUp, Play, Loader2 } from "lucide-react";
import Image from "next/image";

export default function WebSeriesSeasonBreakdown() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/webseries/dashboard?section=seasonBreakdown");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error("SeasonBreakdown fetch error:", err);
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
          <span className="ml-3 text-zinc-400">Loading series data...</span>
        </div>
      </section>
    );
  }

  if (!data || !data.series || data.series.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl">
          <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No web series data available yet.</p>
          <p className="text-zinc-600 text-sm mt-1">Content is being added regularly.</p>
        </div>
      </section>
    );
  }

  const series = data.series;
  const totalSeries = data.total;
  const totalSeasons = series.filter(s => s.seasonsFound && s.seasonsFound.length > 0).length;
  const avgRating = (series.reduce((sum, s) => sum + (s.rating || 0), 0) / series.length).toFixed(1);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-7 h-7 text-emerald-500" />
          <h2 className="text-3xl font-bold text-white">Season Breakdown Analysis</h2>
        </div>
        <p className="text-zinc-400 text-lg">
          Comprehensive season-by-season performance metrics for web series in our database
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Tv className="w-5 h-5 text-emerald-500" />
            <span className="text-zinc-400 text-sm">Total Series</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalSeries}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            <span className="text-zinc-400 text-sm">With Season Info</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalSeasons}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Play className="w-5 h-5 text-cyan-500" />
            <span className="text-zinc-400 text-sm">Platforms Covered</span>
          </div>
          <p className="text-2xl font-bold text-white">{new Set(series.map(s => s.platform)).size}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="text-zinc-400 text-sm">Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-white">{avgRating}</p>
        </div>
      </div>

      <div className="space-y-8">
        {series.map((item, idx) => (
          <div
            key={item._id || idx}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300"
          >
            <div className="grid md:grid-cols-3 gap-6 p-6">
              <div className="md:col-span-1">
                <div className="aspect-video bg-zinc-800 rounded-xl overflow-hidden mb-4">
                  {item.coverImage ? (
                    <Image 
                      src={item.coverImage} 
                      alt={item.title} 
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tv className="w-12 h-12 text-zinc-700" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <div className="space-y-1 text-sm text-zinc-400">
                  <p className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-teal-500" />
                    {item.platform}
                  </p>
                  {item.rating > 0 && (
                    <p className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      {item.rating}/10 Rating
                    </p>
                  )}
                  {item.releaseYear && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-500" />
                      {item.releaseYear}
                    </p>
                  )}
                  {item.genres?.length > 0 && (
                    <p className="text-zinc-500">{item.genres.join(", ")}</p>
                  )}
                  {item.views > 0 && (
                    <p className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      {item.views.toLocaleString()} views
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                {item.seasonsFound && item.seasonsFound.length > 0 ? (
                  <>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-500" />
                      Seasons Detected ({item.seasonsFound.length})
                    </h4>
                    <div className="grid gap-3">
                      {item.seasonsFound.map((season, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-emerald-500/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-sm font-semibold">
                                Season {season.season}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-500" />
                              <span className="text-white font-semibold">{item.rating || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-emerald-500" />
                      Series Overview
                    </h4>
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                      {item.summary ? (
                        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-4">{item.summary}</p>
                      ) : (
                        <p className="text-zinc-500 text-sm">Detailed season breakdown not yet available for this series.</p>
                      )}
                      {item.readTime && (
                        <p className="text-zinc-500 text-xs mt-3 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.readTime} analysis
                        </p>
                      )}
                    </div>
                  </>
                )}

                {item.ottLink && (
                  <a
                    href={item.ottLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Watch on {item.platform}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
