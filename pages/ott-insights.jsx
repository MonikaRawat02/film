import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import PublicLayout from "@/components/PublicLayout";
import { TrendingUp, ExternalLink, ArrowLeft, Target, Search, X } from "lucide-react";
import Link from "next/link";

export default function OTTInsightsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/ott-intelligence");
        const json = await res.json();
        if (json.success) setData(json.data);
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
      
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pb-12 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Home
            </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-[2rem] border border-gray-800 bg-gray-900/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((p) => (
              <div key={p._id} className="group flex flex-col p-8 bg-[#0A0A0A] border border-gray-800/50 rounded-[2rem] transition-all duration-500 hover:border-blue-500/30 hover:bg-[#0F0F0F] relative overflow-hidden">
                {/* Subtle Background Glow */}
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/5 blur-[80px] group-hover:bg-blue-500/10 transition-all duration-700" />
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <h3 className="text-white font-black text-3xl tracking-tight leading-none">{p.platformName}</h3>
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-800 shadow-sm">
                    {activityIcon(p.statusLabel)}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${activityColor(p.statusLabel)}`}>
                      {p.statusLabel}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm font-medium text-gray-500 mb-10 relative z-10">
                  Average deal value:{" "}
                  <span className="text-white font-black">{p.averageDealValue}</span>{" "}
                  <span className="text-gray-600 font-bold">per title</span>
                </div>

                <div className="mb-10 relative z-10">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-600">Market Share</span>
                    <span className="text-2xl font-black text-white leading-none">{p.marketShare}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-900 border border-gray-800/50 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${getOttBarColor(p.platformName)}`} 
                      style={{ width: `${p.marketShare}%` }} 
                    />
                  </div>
                </div>
                
                <a 
                  href={p.detailsLink || "#"} 
                  className="mt-auto w-full py-4 bg-gray-900 border border-gray-800 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-[0.15em] inline-flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white transition-all duration-300 relative z-10 shadow-lg"
                >
                  Explore Insights
                  <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-gray-800 rounded-[2rem] bg-gray-900/10">
            <Search className="w-12 h-12 text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-1">No matches found</h3>
            <p className="text-gray-600 max-w-xs">We couldn't find any platforms matching "{searchQuery}". Try a different search term.</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-6 text-blue-500 font-bold text-sm hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </>
  );
}
