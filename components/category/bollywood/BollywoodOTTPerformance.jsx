"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tv, TrendingUp, Calendar, Star, ChevronRight } from 'lucide-react';

export default function BollywoodOTTPerformance() {
  const [ottData, setOttData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOTTData = async () => {
      try {
        const timestamp = Date.now();
        const res = await fetch(`/api/public/ott-intelligence?limit=10&t=${timestamp}&cache=no-store`, {
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setOttData(data.data);
        }
      } catch (error) {
        console.error("Error fetching OTT data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOTTData();
  }, []);

  const getPlatformColor = (platform) => {
    const p = platform?.toLowerCase() || '';
    if (p.includes('netflix')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (p.includes('prime') || p.includes('amazon')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (p.includes('hotstar') || p.includes('disney')) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    if (p.includes('sonyliv')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (p.includes('zee5')) return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <Tv className="w-6 h-6 text-rose-500" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">OTT Performance</h2>
      </div>

      {loading ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-8 animate-pulse">
            <div className="h-8 bg-zinc-800 rounded mb-4" />
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-800 rounded" />
              ))}
            </div>
          </div>
        </div>
      ) : ottData.length > 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-xl font-bold text-white">Bollywood OTT Releases</h3>
            <p className="text-sm text-zinc-400 mt-1">Streaming platform performance and trending data</p>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider px-6 py-4">Movie/Series</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider px-6 py-4">Platform</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider px-6 py-4">Release Date</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider px-6 py-4">Trending Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {ottData.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-600 font-bold text-lg w-8">#{idx + 1}</span>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-rose-500 transition-colors">
                            {item.platformName || item.title || 'N/A'}
                          </p>
                          {item.marketShare && (
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Market Share: {item.marketShare}%
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getPlatformColor(item.platformName)}`}>
                        {item.platformName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold text-white">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.trendingRank ? (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-bold text-amber-500">#{item.trendingRank}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
          <Tv className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 italic">No OTT performance data available yet.</p>
        </div>
      )}
    </section>
  );
}
