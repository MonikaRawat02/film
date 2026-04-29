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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [initialSearchApplied, setInitialSearchApplied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0); // Force refresh trigger
  const [showCompleteOnly, setShowCompleteOnly] = useState(false); // Filter toggle

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (search && !initialSearchApplied) {
      setSearchQuery(search);
      setInitialSearchApplied(true);
    }
  }, [search, initialSearchApplied]);

  // Memoized fetch function to prevent recreation
  const fetchData = async (page = 1, query = "") => {
    setLoading(true);
    try {
      // Add timestamp to force fresh data - bypasses all caching layers
      const timestamp = Date.now();
      const res = await fetch(`/api/public/box-office?limit=10&page=${page}&sortBy=roi&q=${encodeURIComponent(query)}&_t=${timestamp}`, {
        // Aggressive cache prevention
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setTotalPages(json.pagination.pages);
        setTotalItems(json.pagination.total);
        setCurrentPage(json.pagination.page);
      }
    } catch (error) {
      console.error("Error fetching box office data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch on mount
  useEffect(() => {
    if (mounted) {
      fetchData(1, searchQuery);
    }
  }, [mounted]);

  // Fetch when search query changes (with debounce)
  useEffect(() => {
    if (!mounted) return;
    
    const delayDebounceFn = setTimeout(() => {
      fetchData(1, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, mounted]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchData(newPage, searchQuery);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const stats = useMemo(() => {
    return {
      total: totalItems,
      topVerdict: totalItems > 0 ? "Analyzed" : "N/A",
      blockbusters: "Dynamic",
      avgRoi: "Live"
    };
  }, [totalItems]);

  // Filter data based on completeness toggle
  const filteredData = useMemo(() => {
    if (!showCompleteOnly) return data;
    // Only show movies with complete data (4/4 fields filled)
    return data.filter(m => m.dataCompleteness === 4);
  }, [data, showCompleteOnly]);

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
  
      <div key={`box-office-${totalItems}`} className="font-sans mx-auto max-w-[1500px] px-4 lg:px-10 pt-12 pb-20 overflow-x-hidden">
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
                  {mounted && (
                    <span className="ml-4 text-[10px] bg-green-500 text-black px-2 py-0.5 rounded-full align-middle font-black">LIVE</span>
                  )}
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

          {/* Data Quality Filter Toggle - Client-side only to prevent hydration mismatch */}
          {mounted && (
            <button
              onClick={() => setShowCompleteOnly(!showCompleteOnly)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                showCompleteOnly 
                  ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                  : 'bg-zinc-950/60 border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
              }`}
            >
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full ${
                      showCompleteOnly ? 'bg-green-500' : 'bg-zinc-600'
                    }`} 
                  />
                ))}
              </div>
              {showCompleteOnly ? 'Complete Data' : 'All Data'}
            </button>
          )}
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
                          <div className="flex flex-col gap-1">
                            <span className="text-[15px] font-sans font-black text-white group-hover:text-green-400 transition-colors leading-tight">
                              {m.movieName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] opacity-60">
                                Theatrical Release
                              </span>
                              {/* Data Quality Indicator */}
                              {m.dataCompleteness && m.dataCompleteness < 4 && (
                                <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-500 border border-zinc-700/50">
                                  <span className="flex gap-0.5">
                                    {[...Array(4)].map((_, i) => (
                                      <span 
                                        key={i} 
                                        className={`w-1 h-1 rounded-full ${
                                          i < m.dataCompleteness ? 'bg-green-500' : 'bg-zinc-700'
                                        }`} 
                                      />
                                    ))}
                                  </span>
                                  <span className="ml-0.5">{m.dataCompleteness}/4</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-zinc-400 text-[12px] font-bold">
                            <Wallet className="w-3 h-3 text-zinc-800" />
                            {m.budget === "N/A" ? (
                              <span className="text-zinc-600 italic">Not disclosed</span>
                            ) : (
                              m.budget
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-zinc-100 text-[12px] font-black">
                            <DollarSign className="w-3 h-3 text-green-500" />
                            {m.collection === "N/A" ? (
                              <span className="text-zinc-600 italic">Not available</span>
                            ) : (
                              m.collection
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 font-black text-[13px] tracking-tight ${
                            m.roi === "N/A" ? 'text-zinc-600' : 
                            m.verdict === 'FLOP' ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {m.roi === "N/A" ? (
                              <span className="text-zinc-600 italic">Insufficient data</span>
                            ) : (
                              <>
                                <TrendingUp className={`w-3.5 h-3.5 ${m.verdict === 'FLOP' ? 'rotate-180' : ''}`} />
                                {m.roi}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {m.verdict === "N/A" ? (
                            <span className="inline-block px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border bg-zinc-800/50 text-zinc-600 border-zinc-700/50">
                              Pending
                            </span>
                          ) : (
                            <span className={`inline-block px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border ${statusClasses(m.verdict)}`}>
                              {m.verdict}
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Link 
                            href={m.analysisLink || "/"} 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-white/5 text-zinc-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:border-green-500 hover:text-white transition-all duration-300 shadow-lg cursor-pointer"
                          >
                            Details
                            <ExternalLink className="w-3 h-3" />
                          </Link>
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

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                currentPage === 1 
                  ? 'bg-zinc-900/50 text-zinc-700 border-white/5 cursor-not-allowed' 
                  : 'bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-green-500/50'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show a few page numbers if there are many
                if (
                  totalPages <= 7 ||
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border ${
                        currentPage === pageNum
                          ? 'bg-green-500 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                          : 'bg-zinc-950 border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="text-zinc-700" style={{ display: 'inline-block', width: '20px', textAlign: 'center' }}>...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                currentPage === totalPages 
                  ? 'bg-zinc-900/50 text-zinc-700 border-white/5 cursor-not-allowed' 
                  : 'bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-green-500/50'
              }`}
            >
              Next
            </button>
          </div>
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
                Database: {totalItems}
              </span>
              <span className="hidden md:block w-1.5 h-1.5 bg-zinc-900 rounded-full" />
              <span>Page {currentPage} of {totalPages}</span>
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
