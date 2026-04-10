import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import PublicLayout from "@/components/PublicLayout";
import { TrendingUp, ExternalLink, ArrowLeft, Target, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function OTTInsightsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [topPlatform, setTopPlatform] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/ott-intelligence");
        const json = await res.json();
        if (json.success) {
          const sortedData = [...json.data].sort((a, b) => b.marketShare - a.marketShare);
          setTopPlatform(sortedData[0] || null);
          setData(sortedData.slice(1));
        }
      } catch (error) {
        console.error("Error fetching OTT data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(p => 
      p.platformName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.statusLabel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const activityColor = (text = "") => {
    const t = String(text).toLowerCase();
    if (t.includes("most active") || t.includes("growing")) return "text-green-500";
    if (t.includes("regional")) return "text-yellow-400";
    return "text-gray-400";
  };

  const activityIcon = (text = "") => {
    const t = String(text).toLowerCase();
    if (t.includes("most active") || t.includes("growing")) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (t.includes("regional")) return <Target className="w-4 h-4 text-yellow-400" />;
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const getOttBarColor = (name) => {
    const n = name.toLowerCase();
    if (n.includes("netflix")) return "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
    if (n.includes("amazon")) return "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]";
    if (n.includes("disney") || n.includes("hotstar")) return "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]";
    return "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]";
  };

  return (
    <>
      <Head>
        <title>OTT Platform Insights | FilmyFire</title>
      </Head>
      <div className="font-sans mx-auto max-w-[1400px] px-6 lg:px-12 pt-12 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 grid place-items-center rounded-2xl border border-blue-700/40 bg-blue-600/10 shadow-inner">
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-serif font-black text-white leading-none">OTT Intelligence</h1>
                <p className="text-gray-500 mt-2 font-medium">Streaming deals, market trends, and analysis.</p>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search platforms or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-800 rounded-md transition-colors"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <div className="h-96 rounded-[2rem] border border-gray-800 bg-gray-900/20 animate-pulse" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl border border-gray-800 bg-gray-900/20 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 animate-fade-in-up">
              {topPlatform && (
                <div className="group flex flex-col p-8 bg-gradient-to-br from-[#0A0A0A] to-[#12121a] border border-blue-500/40 rounded-[2rem] transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,217,255,0.15)] relative overflow-hidden animate-float animate-shine">
                  {/* Glowing Orbs in Background */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 blur-[100px] group-hover:bg-blue-400/30 transition-all duration-700" />
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 blur-[100px] group-hover:bg-purple-400/20 transition-all duration-700" />
                  
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2 block">Market Leader</span>
                      <h3 className="text-white font-black text-4xl lg:text-5xl tracking-tight leading-none drop-shadow-lg">{topPlatform.platformName}</h3>
                    </div>
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
                      {activityIcon(topPlatform.statusLabel)}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${activityColor(topPlatform.statusLabel)}`}>
                        {topPlatform.statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-gray-400 mb-10 relative z-10">
                    Average deal value:{" "}
                    <span className="text-white font-black text-lg">{topPlatform.averageDealValue}</span>{" "}
                    <span className="text-gray-500 font-bold">per title</span>
                  </div>

                  <div className="mb-12 relative z-10">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500">Global Market Share</span>
                      <span className="text-4xl font-black text-white leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">{topPlatform.marketShare}%</span>
                    </div>
                    <div className="w-full h-4 bg-gray-950 border border-white/5 rounded-full overflow-hidden p-1 shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-[1500ms] ease-out relative ${getOttBarColor(topPlatform.platformName)}`} 
                        style={{ width: `${topPlatform.marketShare}%` }} 
                      >
                        {/* Animated pulse on the bar */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine_3s_infinite]" />
                      </div>
                    </div>
                  </div>

                  <a 
                    href={topPlatform.detailsLink || "#"} 
                    className="mt-auto w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] inline-flex items-center justify-center gap-3 transition-all duration-300 relative z-10 shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.5)] hover:-translate-y-1"
                  >
                    Analyze Performance
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
            <div className="lg:col-span-2 space-y-4">
              {filteredData.map((p, idx) => (
                <a 
                  href={p.detailsLink || "#"} 
                  key={p._id} 
                  style={{ animationDelay: `${idx * 100}ms` }}
                  className="group flex items-center justify-between p-6 bg-gradient-to-r from-transparent to-transparent hover:from-white/[0.03] border-t border-white/5 transition-all duration-500 hover:translate-x-3 animate-fade-in-up"
                >
                  <div className="flex-grow max-w-md">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-white font-black text-xl group-hover:text-blue-400 transition-colors duration-300">{p.platformName}</h4>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${activityColor(p.statusLabel)} border-current/20 bg-current/5 uppercase tracking-widest`}>
                        {p.statusLabel}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm font-bold tracking-wide mb-3">
                      <span className="text-gray-300">{p.averageDealValue}</span> deal avg
                    </p>
                    
                    {/* Compact Market Share Bar */}
                    <div className="w-full h-1.5 bg-gray-900 border border-white/5 rounded-full overflow-hidden p-[1px] group-hover:border-white/10 transition-colors">
                      <div 
                        className={`h-full rounded-full transition-all duration-[1200ms] ease-out ${getOttBarColor(p.platformName)}`} 
                        style={{ width: `${p.marketShare}%` }} 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className="text-gray-600 text-[9px] uppercase tracking-[0.2em] font-black mb-1">Share</p>
                      <p className="text-white font-black text-3xl tracking-tighter group-hover:scale-110 transition-transform duration-300">{p.marketShare}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400 transition-all duration-300 group-hover:rotate-12 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

        )}
      </div>
    </>
  );
}

OTTInsightsPage.noPadding = true;
