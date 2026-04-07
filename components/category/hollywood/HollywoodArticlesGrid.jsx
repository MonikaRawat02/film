"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TrendingUp, Film, Search, Loader2, ChevronRight, X } from "lucide-react";

const tagColors = {
  green: "bg-green-500/10 border-green-500/30 text-green-400",
  purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  teal: "bg-teal-500/10 border-teal-500/30 text-teal-400",
  red: "bg-red-500/10 border-red-500/30 text-red-400",
  orange: "bg-orange-500/10 border-orange-500/30 text-orange-400",
};

export default function HollywoodArticlesGrid({ initialArticles = [] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const fetchArticles = useCallback(async (search = "", pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/list?category=Hollywood&limit=12&page=${pageNum}&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      
      if (data.success) {
        if (append) {
          setArticles(prev => [...prev, ...data.data]);
        } else {
          setArticles(data.data);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, []);

  // Initial fetch if no props
  useEffect(() => {
    if (initialArticles.length === 0) {
      fetchArticles("", 1);
    }
  }, [initialArticles, fetchArticles]);

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2 || searchTerm === "") {
        setIsSearching(true);
        setPage(1);
        fetchArticles(searchTerm, 1, false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchArticles]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(searchTerm, nextPage, true);
  };

  return (
    <section className="bg-[#0B0F1A] text-white py-8 sm:py-10 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-blue-500" />
            <h2 className="text-3xl font-bold tracking-tight">Hollywood Intelligence Hub</h2>
          </div>

          <div className="relative group w-full md:w-[400px]">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchTerm ? 'text-blue-500' : 'text-zinc-500'}`} />
            <input
              type="text"
              placeholder="Search movies, cast, or plot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121826] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-600"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-zinc-400" />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Results Info */}
        {searchTerm && !loading && (
          <p className="text-zinc-500 text-sm mb-8 animate-in fade-in slide-in-from-left-4 duration-300">
            Found {articles.length} results for <span className="text-blue-400 font-bold">&ldquo;{searchTerm}&rdquo;</span>
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <Link
                key={article._id || index}
                href={`/movie/${article.slug}`}
                className="group block bg-[#121826] rounded-2xl border border-white/10 transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                      <Film className="w-12 h-12 text-zinc-800" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-90" />
                  
                  {/* Rating / Meta Info */}
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      {article.rating ? `${article.rating} Score` : 'Analyzing'}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-xl font-black tracking-tight leading-tight transition-colors text-white group-hover:text-blue-400 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest line-clamp-1">
                      {article.releaseYear} &bull; {article.genres?.join(" / ")}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : !loading && (
            <div className="col-span-full py-20 text-center bg-[#121826] rounded-3xl border border-dashed border-white/10">
              <Film className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest">No Intelligence Found</p>
            </div>
          )}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Load More Intelligence <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="inline-block w-full max-w-4xl p-3 rounded-lg border border-dashed border-blue-500/30 bg-blue-500/5">
            <p className="text-[10px] font-black text-blue-300/80 uppercase tracking-widest">
              Automated Updates: Scanning {articles.length} verified intelligence reports
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

