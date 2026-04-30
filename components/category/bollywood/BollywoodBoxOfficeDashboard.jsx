"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChart3, Trophy, TrendingUp, Zap, Loader2, DollarSign, Globe, MapPin } from 'lucide-react';

export default function BollywoodBoxOfficeDashboard() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const timestamp = Date.now();
        const res = await fetch(`/api/public/box-office?limit=20&industry=Bollywood&t=${timestamp}&cache=no-store`, {
          cache: 'no-store'
        });
        const data = await res.json();
        
        // DEBUG: Log what we got from API
        console.log(' Box Office API Response:', data);
        if (data.data && data.data.length > 0) {
          console.log('🎬 First movie:', data.data[0]);
        }
        
        if (data.success && data.data.length > 0) {
          setMovies(data.data);
        }
      } catch (error) {
        console.error("Error fetching box office data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Move getVerdictColor outside render to prevent recreation
  const getVerdictColor = (verdict) => {
    switch(verdict?.toUpperCase()) {
      case 'BLOCKBUSTER': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'SUPER HIT': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'HIT': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'AVERAGE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'FLOP': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  // Show top 20 movies for faster rendering
  const displayMovies = movies.slice(0, 20);

  // Helper function to normalize collection strings to a common numerical value
  const parseCollectionValue = (valStr) => {
    if (!valStr) return 0;
    const str = String(valStr).toUpperCase().trim();
    // Extract numerical part
    const num = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    
    // Convert to a base unit (Millions)
    if (str.includes('B') || str.includes('BILLION')) return num * 1000;
    if (str.includes('CR') || str.includes('CRORE')) return num * 0.12; // 1 Crore approx 0.12M USD (for relative scale)
    if (str.includes('K') || str.includes('THOUSAND')) return num / 1000;
    return num; // Default to Millions
  };

  // Format monetary values consistently
  const formatMoney = (value) => {
    if (!value || value === 'N/A') return 'N/A';
    
    const str = String(value).trim();
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    
    if (isNaN(num)) return str;
    
    // If already has currency/unit, return as-is
    if (str.includes('$') || str.includes('₹') || str.includes('crore') || str.includes('CR') || 
        str.includes('billion') || str.includes('B') || str.includes('million') || str.includes('M')) {
      return str;
    }
    
    // Add appropriate formatting based on value size
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}B`;
    } else if (num >= 100) {
      return `$${num.toFixed(0)}M`;
    } else if (num >= 1) {
      return `$${num.toFixed(0)}M`;
    } else {
      return `$${num.toFixed(2)}M`;
    }
  };

  // Format data for Recharts
  const chartData = useMemo(() => {
    return movies.slice(0, 6).map(m => ({
      name: m.movieName,
      collection: parseCollectionValue(m.collection)
    }));
  }, [movies]);

  // Format data for Top Performers based on ROI
  const topPerformers = useMemo(() => {
    return [...movies]
      .sort((a, b) => {
        const roiA = parseFloat(String(a.roi).replace(/[^0-9.-]/g, '')) || 0;
        const roiB = parseFloat(String(b.roi).replace(/[^0-9.-]/g, '')) || 0;
        return roiB - roiA;
      })
      .slice(0, 4)
      .map((m, idx) => {
        const roiValue = String(m.roi);
        const displayROI = roiValue.includes('%') || roiValue.startsWith('+') || roiValue.startsWith('-') 
          ? roiValue 
          : `+${roiValue}%`;
          
        return {
          rank: `#${idx + 1}`,
          name: m.movieName,
          collection: m.collection,
          growth: displayROI,
          slug: m.slug,
          image: m.image
        };
      });
  }, [movies]);

  // Calculate Quick Stats
  const quickStats = useMemo(() => {
    if (movies.length === 0) return { biggestOpening: "N/A", mostProfitable: "N/A" };
    
    // For "Top Collection", use smart parsing to compare Billion vs Million vs Crore
    const topCollection = movies.reduce((prev, current) => {
      const prevVal = parseCollectionValue(prev.collection);
      const currVal = parseCollectionValue(current.collection);
      return (currVal > prevVal) ? current : prev;
    });

    // For "Most Profitable", we'll use ROI
    const topROI = movies.reduce((prev, current) => {
      const prevVal = parseFloat(String(prev.roi).replace(/[^0-9.-]/g, '')) || 0;
      const currVal = parseFloat(String(current.roi).replace(/[^0-9.-]/g, '')) || 0;
      return (currVal > prevVal) ? current : prev;
    });

    return {
      biggestOpening: topCollection.collection,
      biggestOpeningName: topCollection.movieName,
      mostProfitable: topROI.roi.toString().includes('%') ? topROI.roi : `+${topROI.roi}%`,
      mostProfitableName: topROI.movieName
    };
  }, [movies]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Box Office Analysis</h2>
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
      ) : movies.length > 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-xl font-bold text-white">Bollywood Box Office Data</h3>
            <p className="text-sm text-zinc-400 mt-1">Complete financial performance metrics</p>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider px-6 py-4">Movie</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider px-6 py-4">Budget</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider px-6 py-4">India Collection</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider px-6 py-4">Worldwide Collection</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider px-6 py-4">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {displayMovies.map((movie, idx) => {
                  
                  return (
                    <tr key={movie._id || idx} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-600 font-bold text-lg w-8">#{idx + 1}</span>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">
                              {movie.movieName}
                            </p>
                            {movie.roi && (
                              <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                ROI: {movie.roi}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <DollarSign className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold text-white">{formatMoney(movie.budget)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span className="font-semibold text-white">{formatMoney(movie.collection)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Globe className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-white">{formatMoney(movie.worldwideCollection || movie.collection)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getVerdictColor(movie.verdict)}`}>
                          {movie.verdict || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
          <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 italic">No box office data available yet.</p>
        </div>
      )}
    </section>
  );
}
