import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import PublicLayout from "@/components/PublicLayout";
import { BarChart3, ExternalLink, ArrowLeft, Search, X, TrendingUp, DollarSign, Wallet, Award, Film, PieChart, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";

export default function BoxOfficePage() {
  const router = useRouter();
  const { search } = router.query;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (search) {
      setSearchQuery(search);
    }
  }, [search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/box-office");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error("Error fetching box office data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!data.length) return null;
    
    const verdicts = data.reduce((acc, m) => {
      const v = m.verdict.toUpperCase();
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {});
    
    const topVerdict = Object.entries(verdicts).sort((a, b) => b[1] - a[1])[0][0];
    const blockbusters = data.filter(m => m.verdict.toUpperCase().includes('BLOCKBUSTER')).length;
    
    return {
      total: data.length,
      topVerdict,
      blockbusters,
      avgRoi: "Varies" // Hard to calculate precisely without standard units
    };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(m => 
      m.movieName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.verdict.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const statusClasses = (label = "") => {
    const L = String(label).toLowerCase();
    if (L.includes("flop")) return "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
    if (L.includes("blockbuster") || L.includes("super hit") || L.includes("hit"))
      return "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]";
    return "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <>
      <Head>
        <title>Box Office Truth Database | FilmyFire</title>
      </Head>
  
      <div className="font-sans mx-auto max-w-[1500px] px-4 lg:px-10 pb-20 overflow-x-hidden">
        {/* Header Section with Glass Effect */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-10"
        >
          <div className="space-y-4">
            <button 
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer" >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
              Back
            </button>
            <div className="flex items-center gap-6">
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="h-16 w-16 grid place-items-center rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-600/5 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
              >
                <BarChart3 className="w-8 h-8 text-green-400" />
              </motion.div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-sans font-black text-white tracking-tighter leading-none mb-2">
                  Box Office <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Truth</span>
                </h1>
                <p className="text-zinc-500 text-xs font-bold tracking-[0.1em] uppercase opacity-70">The ultimate financial database for Indian Cinema.</p>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-0 bg-green-500/10 blur-2xl group-focus-within:bg-green-500/20 transition-all duration-700 rounded-full" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search movies, verdicts, records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all shadow-2xl"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-3 h-3 text-zinc-500 hover:text-white" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Stats Highlights Grid */}
        {!loading && stats && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16" >
            {[
              { label: 'Total Database', value: stats.total, icon: Film, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Blockbusters', value: stats.blockbusters, icon: Award, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Top Verdict', value: stats.topVerdict, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Avg ROI', value: stats.avgRoi, icon: PieChart, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5 backdrop-blur-sm relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity`} />
                <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 w-full rounded-2xl bg-zinc-900/20 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/20 backdrop-blur-md shadow-2xl"
          >
            {/* Table wrapper for horizontal and vertical scroll */}
            <div className="overflow-auto no-scrollbar scroll-smooth max-h-[70vh]">
              <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px]">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-zinc-950/95 backdrop-blur-xl border-b border-white/10">
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/10">Movie Intelligence</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/10">Investment</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/10">Global Gross</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/10">ROI %</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/10">Verdict</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 text-right border-b border-white/10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  <AnimatePresence>
                    {filteredData.map((m, idx) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={m._id} 
                        className="group hover:bg-white/[0.02] transition-all duration-300"
                      >
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-[15px] font-sans font-black text-white group-hover:text-green-400 transition-colors leading-tight">
                              {m.movieName}
                            </span>
                            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1.5 opacity-60">
                              Theatrical Release
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-zinc-400 text-[12px] font-bold">
                            <Wallet className="w-3 h-3 text-zinc-800" />
                            {m.budget}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-zinc-100 text-[12px] font-black">
                            <DollarSign className="w-3 h-3 text-green-500" />
                            {m.collection}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 font-black text-[13px] tracking-tight ${m.verdict === 'FLOP' ? 'text-red-500' : 'text-green-500'}`}>
                            <TrendingUp className={`w-3.5 h-3.5 ${m.verdict === 'FLOP' ? 'rotate-180' : ''}`} />
                            {m.roi}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-block px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border ${statusClasses(m.verdict)}`}>
                            {m.verdict}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <motion.a 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={m.analysisLink || "#"} 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-white/5 text-zinc-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:border-green-500 hover:text-white transition-all duration-300 shadow-lg"
                          >
                            Details
                            <ExternalLink className="w-3 h-3" />
                          </motion.a>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-full bg-zinc-950 flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
                  <Search className="w-8 h-8 text-zinc-800" />
                </div>
                <h3 className="text-2xl font-sans font-black text-zinc-500 mb-2">No matches found</h3>
                <p className="text-zinc-600 text-[11px] font-medium max-w-xs mx-auto opacity-70">We couldn't find any movies matching your criteria.</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-8 px-8 py-3 bg-green-500/10 text-green-500 font-black text-[10px] uppercase tracking-[0.3em] rounded-xl hover:bg-green-500/20 transition-all border border-green-500/20 shadow-lg">
                  Clear Filters
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Footer info with animation */}
        {!loading && filteredData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex flex-col md:flex-row items-center justify-between text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 px-4"
          >
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Database: {filteredData.length}
              </span>
              <span className="hidden md:block w-1.5 h-1.5 bg-zinc-900 rounded-full" />
              <span>Updated: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="mt-6 md:mt-0 flex items-center gap-3">
              <span className="opacity-50 tracking-[0.2em]">FilmyFire Intelligence Hub</span>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
BoxOfficePage.noPadding = true;
