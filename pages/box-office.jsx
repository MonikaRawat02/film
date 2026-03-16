import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import PublicLayout from "@/components/PublicLayout";
import { BarChart3, ExternalLink, ArrowLeft, Search, X } from "lucide-react";
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
    if (L.includes("flop")) return "bg-red-600/10 text-red-500 border-red-500/30";
    if (L.includes("blockbuster") || L.includes("super hit") || L.includes("hit"))
      return "bg-green-500/10 text-green-500 border-green-500/30";
    return "bg-emerald-600/10 text-emerald-400 border-emerald-500/30";
  };

  return (
    <>
      <Head>
        <title>Box Office Truth Database | FilmyFire</title>
      </Head>
      
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pb-12 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 grid place-items-center rounded-2xl border border-emerald-700/40 bg-emerald-600/10 shadow-inner">
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-serif font-black text-white leading-none">Box Office Truth</h1>
                <p className="text-gray-500 mt-2 font-medium">Real numbers, real verdicts.</p>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-green-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search movies or verdicts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
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
              <div key={i} className="h-72 rounded-[2rem] border border-gray-800 bg-gray-900/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((m) => (
              <div key={m._id} className="group flex flex-col p-8 bg-[#0A0A0A] border border-gray-800/50 rounded-[2rem] transition-all duration-500 hover:border-green-500/30 hover:bg-[#0F0F0F] relative overflow-hidden">
                {/* Subtle Background Glow */}
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-green-500/5 blur-[80px] group-hover:bg-green-500/10 transition-all duration-700" />
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <h3 className="text-white font-black text-2xl flex-1 leading-tight tracking-tight pr-4">{m.movieName}</h3>
                  <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border shadow-sm shrink-0 ${statusClasses(m.verdict)}`}>
                    {m.verdict}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-10 relative z-10">
                  <div className="space-y-1">
                    <div className="text-gray-600 text-[10px] uppercase tracking-widest font-black">Budget</div>
                    <div className="text-xl font-black text-white tracking-tight">{m.budget}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-600 text-[10px] uppercase tracking-widest font-black">Collection</div>
                    <div className="text-xl font-black text-white tracking-tight">{m.collection}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-600 text-[10px] uppercase tracking-widest font-black">ROI</div>
                    <div className={`text-xl font-black tracking-tight ${m.verdict === 'FLOP' ? 'text-red-500' : 'text-green-500'}`}>{m.roi}</div>
                  </div>
                </div>
                
                <a 
                  href={m.analysisLink || "#"} 
                  className="mt-auto w-full py-4 bg-gray-900 border border-gray-800 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-[0.15em] inline-flex items-center justify-center gap-2 group-hover:bg-green-600 group-hover:border-green-500 group-hover:text-white transition-all duration-300 relative z-10 shadow-lg"
                >
                  Full Analysis
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
            <p className="text-gray-600 max-w-xs">We couldn't find any records matching "{searchQuery}". Try a different search term.</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-6 text-green-500 font-bold text-sm hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </>
  );
}

BoxOfficePage.noPadding = true;
