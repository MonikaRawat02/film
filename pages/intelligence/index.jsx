import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import PublicLayout from "@/components/PublicLayout";
import { BarChart, Search, X, ArrowLeft, Clock, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function IntelligenceListingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Explained", "Box Office", "OTT"];

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/trending-intelligence");
        const data = await res.json();
        if (data.success) {
          setItems(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch trending intelligence:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.movieName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, activeCategory]);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Explained": return "bg-purple-600";
      case "Box Office": return "bg-emerald-600";
      case "OTT": return "bg-blue-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <>
      <Head>
        <title>Trending Intelligence | FilmyFire</title>
      </Head>
      
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pb-24 pt-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-widest group"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Back to Home
            </Link>
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 grid place-items-center rounded-2xl border border-red-900/40 bg-red-600/10 shadow-inner">
                <BarChart className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-serif font-black text-white leading-tight tracking-tight">Trending Intelligence</h1>
                <p className="text-gray-400 mt-2 text-lg font-light">Deep explanations, not breaking news.</p>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search intelligence, movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl pl-11 pr-10 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
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

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                activeCategory === cat
                  ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20"
                  : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
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
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-gray-800/50 bg-[#0F0F14] transition-all duration-500 hover:border-red-500/30 card-hover shadow-2xl shadow-black/50"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14] via-[#0F0F14]/20 to-transparent opacity-95" />
                  
                  {/* Category Badge */}
                  <div className={`absolute top-8 left-8 px-5 py-2 rounded-2xl ${getCategoryColor(item.category)} text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/40 border border-white/10 backdrop-blur-sm`}>
                    {item.category}
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-10 space-y-5">
                    <div className="space-y-2">
                      <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">{item.movieName}</p>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-white leading-[1.1] group-hover:text-red-400 transition-colors tracking-tight">
                        {item.title}
                      </h3>
                    </div>
                    <Link
                      href={`/intelligence/${item.slug}`}
                      className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.15em] text-gray-400 group-hover:text-red-500 transition-all group/link"
                    >
                      Read Full Intelligence
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-2" />
                    </Link>
                  </div>
                </div>
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
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No intelligence found</h3>
            <p className="text-gray-600 max-w-sm font-light text-lg">
              We couldn't find any strategic deep-dives matching your criteria. Try adjusting your search or filters.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="mt-8 text-red-500 font-black text-sm uppercase tracking-widest hover:text-red-400 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
