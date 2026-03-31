import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import PublicLayout from "@/components/PublicLayout";
import { BarChart3, ExternalLink, ArrowLeft, Search, X, TrendingUp, DollarSign, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

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

  const filteredData = useMemo(() => {
    return data.filter(m => 
      m.movieName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.verdict.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const statusClasses = (label = "") => {
    const L = String(label).toLowerCase();
    if (L.includes("flop")) return "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
    if (L.includes("blockbuster") || L.includes("super hit") || L.includes("hit"))
      return "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]";
    return "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]";
  };

  return (
    <>
      <Head>
        <title>Box Office Truth Database | FilmyFire</title>
      </Head>
      
      <div className="mx-auto max-w-[1500px] px-4 lg:px-10 pb-20 pt-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <button 
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer"
            >
              <ArrowLeft className="w-2.5 h-2.5 group-hover:-translate-x-1 transition-transform" /> 
              Back
            </button>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/5 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-sans font-black text-white tracking-tight">
                  Box Office <span className="text-green-500">Truth</span>
                </h1>
                <p className="text-zinc-500 text-[10px] font-medium tracking-wide">The ultimate financial database for Indian Cinema.</p>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-72 group">
            <div className="absolute inset-0 bg-green-500/5 blur-lg group-focus-within:bg-green-500/10 transition-all duration-500 rounded-full" />
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search movies, verdicts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-[11px] text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all shadow-lg"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 p-0.5 hover:bg-white/5 rounded transition-colors"
                >
                  <X className="w-2.5 h-2.5 text-zinc-500 hover:text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 w-full rounded-xl bg-zinc-900/20 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-sm shadow-xl">
            {/* Table wrapper for horizontal and vertical scroll */}
            <div className="overflow-auto no-scrollbar scroll-smooth max-h-[70vh]">
              <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5">Movie Intelligence</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5">Budget</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5">Worldwide</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5">ROI</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5">Verdict</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right border-b border-white/5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.01]">
                  {filteredData.map((m) => (
                    <tr key={m._id} className="group hover:bg-white/[0.01] transition-all duration-200">
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-sans font-bold text-white group-hover:text-green-400 transition-colors leading-tight">
                            {m.movieName}
                          </span>
                          <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">
                            Theatrical Release
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium">
                          <Wallet className="w-2.5 h-2.5 text-zinc-800" />
                          {m.budget}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-zinc-200 text-[11px] font-black">
                          <DollarSign className="w-2.5 h-2.5 text-green-500" />
                          {m.collection}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`inline-flex items-center gap-1 font-black text-[12px] tracking-tight ${m.verdict === 'FLOP' ? 'text-red-500' : 'text-green-500'}`}>
                          <TrendingUp className={`w-2.5 h-2.5 ${m.verdict === 'FLOP' ? 'rotate-180' : ''}`} />
                          {m.roi}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.15em] rounded border ${statusClasses(m.verdict)}`}>
                          {m.verdict}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a 
                          href={m.analysisLink || "#"} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-white/5 text-zinc-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-green-600 hover:border-green-500 hover:text-white transition-all duration-300"
                        >
                          Details
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-zinc-900/50 flex items-center justify-center mb-4 border border-white/5">
                  <Search className="w-6 h-6 text-zinc-700" />
                </div>
                <h3 className="text-xl font-sans font-bold text-zinc-400 mb-1">No matches found</h3>
                <p className="text-zinc-600 text-xs max-w-xs mx-auto">Try adjusting your search terms.</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-6 px-5 py-2.5 bg-green-500/10 text-green-500 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-green-500/20 transition-all border border-green-500/20"
                >
                  Reset search
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        {!loading && filteredData.length > 0 && (
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 px-2">
            <div className="flex items-center gap-4">
              <span>Records: {filteredData.length}</span>
              <span className="hidden md:block w-1 h-1 bg-zinc-800 rounded-full" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <span className="text-zinc-700 italic">FilmyFire Intelligence Hub</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

BoxOfficePage.noPadding = true;

