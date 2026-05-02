"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, Clock, Tv, Star, Loader2 } from "lucide-react";

export default function WebSeriesRenewalStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/webseries/dashboard?section=renewalStatus");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error("RenewalStatus fetch error:", err);
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
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          <span className="ml-3 text-zinc-400">Loading renewal data...</span>
        </div>
      </section>
    );
  }

  if (!data || data.total === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl">
          <RefreshCw className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No renewal status data available yet.</p>
        </div>
      </section>
    );
  }

  const { renewed, pending, ended, total } = data;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className="w-7 h-7 text-green-500" />
          <h2 className="text-3xl font-bold text-white">Series Status Tracker</h2>
        </div>
        <p className="text-zinc-400 text-lg">
          Track which web series are active, ended, or pending based on content analysis
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-zinc-900/50 border border-green-800/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-zinc-400 text-sm">Active / Renewed</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{renewed.length}</p>
        </div>
        <div className="bg-zinc-900/50 border border-red-800/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-zinc-400 text-sm">Ended / Concluded</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{ended.length}</p>
        </div>
        <div className="bg-zinc-900/50 border border-yellow-800/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-zinc-400 text-sm">Pending</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{pending.length}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Tv className="w-5 h-5 text-cyan-500" />
            <span className="text-zinc-400 text-sm">Total Tracked</span>
          </div>
          <p className="text-3xl font-bold text-white">{total}</p>
        </div>
      </div>

      {renewed.length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Active / Renewed Series
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renewed.map((show, idx) => (
              <a
                key={show._id || idx}
                href={`/category/webseries/${show.slug}`}
                className="bg-zinc-900/50 border border-green-800/30 rounded-2xl p-6 hover:border-green-500/50 transition-all block"
              >
                <div className="flex items-start gap-4 mb-3">
                  {show.coverImage ? (
                    <img src={show.coverImage} alt={show.title} className="w-14 h-20 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-20 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tv className="w-6 h-6 text-zinc-700" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white mb-1 line-clamp-1">{show.title}</h4>
                    <p className="text-green-400 text-sm">{show.platform}</p>
                  </div>
                  {show.rating > 0 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-white font-semibold">{show.rating}</span>
                    </div>
                  )}
                </div>
                {show.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {show.genres.slice(0, 3).map((g, gIdx) => (
                      <span key={gIdx} className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-[10px]">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-green-400 font-semibold text-sm">Active Series</p>
                  {show.releaseYear && (
                    <p className="text-zinc-400 text-xs mt-1">Released: {show.releaseYear}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {ended.length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-500" />
            Ended / Concluded Series
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ended.map((show, idx) => (
              <a
                key={show._id || idx}
                href={`/category/webseries/${show.slug}`}
                className="bg-zinc-900/50 border border-red-800/30 rounded-2xl p-6 hover:border-red-500/50 transition-all block"
              >
                <h4 className="text-lg font-bold text-white mb-1">{show.title}</h4>
                <p className="text-zinc-400 text-sm mb-3">{show.platform}</p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 font-semibold text-sm">Ended</span>
                    {show.releaseYear && (
                      <span className="text-zinc-400 text-xs">{show.releaseYear}</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-yellow-500" />
            Pending Renewal
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pending.map((show, idx) => (
              <a
                key={show._id || idx}
                href={`/category/webseries/${show.slug}`}
                className="bg-zinc-900/50 border border-yellow-800/30 rounded-2xl p-6 hover:border-yellow-500/50 transition-all block"
              >
                <h4 className="text-lg font-bold text-white mb-1">{show.title}</h4>
                <p className="text-zinc-400 text-sm mb-3">{show.platform}</p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <span className="text-yellow-400 font-semibold text-sm">Awaiting Decision</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
