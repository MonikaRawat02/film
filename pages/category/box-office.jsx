import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import { TrendingUp, Award, Film, Activity, PieChart, Wallet, DollarSign, ExternalLink, Search, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/admin/box-office`);
    const data = await res.json();

    return {
      props: {
        initialData: data.data || [],
      },
    };
  } catch (error) {
    console.error("Error fetching box office data:", error);
    return {
      props: {
        initialData: [],
      },
    };
  }
}

export default function BoxOfficePage({ initialData }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/box-office");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Error fetching box office data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (initialData.length === 0) {
      fetchData();
    }
  }, [initialData]);

  const stats = useMemo(() => {
    if (!data.length) return null;
    
    const verdicts = data.reduce((acc, m) => {
      const v = m.verdict?.toUpperCase() || "N/A";
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {});
    
    const topVerdict = Object.entries(verdicts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const blockbusters = data.filter(m => m.verdict?.toUpperCase().includes('BLOCKBUSTER')).length;
    
    return {
      total: data.length,
      topVerdict,
      blockbusters,
      avgRoi: "Varies"
    };
  }, [data]);

  const filteredData = useMemo(() => {
    let currentData = data;
    if (searchQuery.trim()) {
      currentData = currentData.filter(m => 
        m.movieName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.verdict?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter === "All") return currentData;
    return currentData.filter(item => {
      const verdict = item.verdict?.toUpperCase() || "";
      if (activeFilter === "Blockbusters") return verdict.includes("BLOCKBUSTER");
      if (activeFilter === "Hits") return verdict.includes("HIT");
      if (activeFilter === "Average") return verdict.includes("AVERAGE");
      if (activeFilter === "Flops") return verdict.includes("FLOP");
      return true;
    });
  }, [data, activeFilter, searchQuery]);

  return (
    <>
      <Head>
        <title>Box Office Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Real-time box office tracking, verdict analysis, and theatrical performance metrics." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-zinc-950 to-zinc-950" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-500 font-medium">Premium Intelligence Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 bg-clip-text text-transparent mb-6">
                Box Office Intelligence Hub
              </h1>

              <p className="text-lg sm:text-xl text-zinc-400 mb-10 leading-relaxed">
                Real-time box office tracking, verdict analysis, and theatrical performance metrics.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto mb-8">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search box office collections, verdicts, records, or theatrical data"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-12 py-4 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all shadow-2xl"
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 p-1 hover:bg-zinc-800 rounded-full transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-zinc-500 hover:text-white" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {["daily collections", "verdict analysis", "all-time records", "territory breakdown"].map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(tag)}
                    className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="#" className="px-8 py-4 bg-amber-500 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center justify-center gap-2">
                  Explore Box Office Data
                </Link>
                <Link href="#" className="px-8 py-4 bg-zinc-800 text-zinc-200 font-bold rounded-xl shadow-lg shadow-zinc-800/20 hover:bg-zinc-700 transition-all flex items-center justify-center gap-2">
                  Current Theatrical Trends
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {[
                { label: 'Total Movies', value: stats.total, icon: Film, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Blockbusters', value: stats.blockbusters, icon: Award, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Top Verdict', value: stats.topVerdict, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Avg ROI', value: stats.avgRoi, icon: PieChart, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-xl group hover:border-zinc-700 transition-all flex items-center gap-4"
                >
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</p>
                    <p className="text-xl font-black text-white">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {["All", "Blockbusters", "Hits", "Average", "Flops"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter 
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Movies List - Refined Card Design */}
          <div className="grid gap-4 mb-20">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Activity className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Loading Intelligence...</p>
              </div>
            ) : filteredData.length > 0 ? (
              filteredData.map((m, idx) => {
                const movieUrl = `/movie/${m.slug}`;
                return (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-zinc-900/50 transition-all border-l-4 border-l-transparent hover:border-l-amber-500 shadow-sm"
                >
                  <div className="flex flex-1 items-center gap-6">
                    {/* Movie Poster */}
                    <Link href={movieUrl} className="shrink-0 block overflow-hidden rounded-lg border border-zinc-800 group-hover:border-amber-500/50 transition-all shadow-xl">
                      <div className="relative h-24 w-16 bg-zinc-800">
                        {m.image ? (
                          <img 
                            src={m.image} 
                            alt={m.movieName} 
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Film className="w-6 h-6 text-zinc-700" />
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1">
                      <Link href={movieUrl} className="block group/title">
                        <h3 className="font-bold text-lg text-white group-hover/title:text-amber-400 transition-colors tracking-tight mb-1">
                          {m.movieName}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Wallet className="w-3 h-3 text-zinc-500" />
                          Budget: <span className="text-white font-medium">{m.budget || 'N/A'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          Collection: <span className="text-white font-medium">{m.collection || 'N/A'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className={`w-3 h-3 ${m.roi?.includes('-') ? 'text-red-500' : 'text-green-500'}`} />
                          ROI: <span className={`font-medium ${m.roi?.includes('-') ? 'text-red-400' : 'text-green-400'}`}>{m.roi || 'N/A'}</span>
                        </span>
                        <span className={`px-3 py-1 rounded text-xs font-bold ${
                          m.verdict === "BLOCKBUSTER" ? "bg-purple-900/50 text-purple-400" :
                          m.verdict === "SUPER HIT" ? "bg-blue-900/50 text-blue-400" :
                          m.verdict === "HIT" ? "bg-green-900/50 text-green-400" :
                          m.verdict === "AVERAGE" ? "bg-yellow-900/50 text-yellow-400" :
                          "bg-red-900/50 text-red-400"
                        }`}>
                          {m.verdict}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={movieUrl}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-amber-500 hover:border-amber-400 hover:text-black transition-all shadow-sm"
                  >
                    More Details
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </motion.div>
                );
              })
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800 shadow-2xl">
                  <Film className="w-8 h-8 text-zinc-800" />
                </div>
                <h3 className="text-2xl font-black text-zinc-500 mb-2">No intelligence found</h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">We couldn't find any data matching your filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

BoxOfficePage.noPadding = true;
