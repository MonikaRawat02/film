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
import { BarChart3, Trophy, TrendingUp, Zap, Loader2 } from 'lucide-react';

export default function BollywoodBoxOfficeDashboard() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("/api/public/box-office?limit=20");
        const data = await res.json();
        if (data.success) {
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
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Bollywood Box Office Dashboard</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 h-[450px] animate-pulse" />
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-64 animate-pulse" />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-40 animate-pulse" />
          </div>
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Card */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white">Top Grossing Films 2023-2024</h3>
              <p className="text-sm text-zinc-400 mt-2">Box office collection in crores (₹)</p>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" strokeOpacity={0.5} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#71717a" 
                    fontSize={13}
                    fontWeight={500}
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={13}
                    fontWeight={500}
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f59e0b', opacity: 0.1 }}
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                      fontSize: '14px',
                      padding: '12px 16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ color: '#f59e0b', fontWeight: '600', marginTop: '4px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: '700', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="collection" 
                    radius={[8, 8, 0, 0]}
                    barSize={60}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#f59e0b" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Top Performers Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-white">Top Performers</h3>
              </div>
              
              <div className="space-y-5">
                {topPerformers.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-600 font-bold text-lg w-8">#{idx + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors leading-tight">{item.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">₹{item.collection}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 text-sm font-bold">
                      <TrendingUp className="w-4 h-4" />
                      <span>{item.growth}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-5">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Biggest Opening</p>
                  <p className="text-2xl font-bold text-amber-500">{quickStats.biggestOpening}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{quickStats.biggestOpeningName}</p>
                </div>
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400 mb-1">Highest ROI</p>
                  <p className="text-2xl font-bold text-amber-500">{quickStats.mostProfitable}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{quickStats.mostProfitableName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 italic">No box office data available yet.</p>
        </div>
      )}
    </section>
  );
}
