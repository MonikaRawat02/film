import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Lightbulb, 
  ArrowRight, 
  Clock, 
  Users, 
  Search, 
  Sparkles,
  TrendingUp,
  Brain,
  Globe,
  Zap,
  ChevronRight,
  Filter,
  Eye,
  X,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PopularTopicsListingPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/public/popular-topics");
        const data = await res.json();
        if (data.success) {
          setItems(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch popular topics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.description.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [items, searchQuery]);

  return (
    <>
      <Head>
        <title>Popular Intelligence Topics | FilmyFire</title>
      </Head>
      
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pb-24 pt-20 min-h-screen bg-[#050505]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-6">
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-yellow-500 transition-colors text-xs font-bold uppercase tracking-widest group cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Back
            </button>
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 grid place-items-center rounded-2xl border border-yellow-900/40 bg-yellow-600/10 shadow-inner">
                <Lightbulb className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-serif font-black text-white leading-tight tracking-tight">Popular Topics</h1>
                <p className="text-gray-400 mt-2 text-lg font-light">Deep insights into cinema trends and patterns.</p>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl pl-11 pr-10 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
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

        {/* Grid Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-gray-900/40 animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((t) => (
              <div
                key={t._id}
                className="group relative flex flex-col rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0d0d12] to-black/30 p-8 transition-all duration-500 hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/5"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="h-12 w-12 grid place-items-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  {t.trending && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Trending</span>
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold mb-4 leading-tight text-white group-hover:text-yellow-400 transition-colors">
                  {t.title}
                </h3>
                <p className="text-gray-400 mb-8 line-clamp-4 leading-relaxed flex-grow">
                  {t.description}
                </p>

                <div className="flex items-center gap-6 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                  <div className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-500/50" />
                    <span>Intelligence Analysis</span>
                  </div>
                </div>

                <Link
                  href={`/intelligence/${t.slug}`}
                  className="w-full inline-flex items-center justify-between gap-2 px-6 py-4 bg-white/5 hover:bg-yellow-500 text-white hover:text-black border border-white/10 hover:border-yellow-500 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all group/link"
                >
                  Read Intelligence
                  <ArrowRight className="w-5 h-5 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div className="py-40 flex flex-col items-center justify-center text-center border border-dashed border-gray-800 rounded-[3rem] bg-gray-900/10">
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No topics found</h3>
            <p className="text-gray-600 max-w-sm font-light text-lg">
              We couldn't find any intelligence topics matching your criteria.
            </p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-8 text-yellow-500 font-black text-sm uppercase tracking-widest hover:text-yellow-400 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </>
  );
}

PopularTopicsListingPage.noPadding = true;
