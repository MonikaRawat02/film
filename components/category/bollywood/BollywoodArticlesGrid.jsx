"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TrendingUp, Sparkles, Film, ChevronRight, Search, Loader2, X } from "lucide-react";

export default function BollywoodArticlesGrid({ initialArticles = [], activeFilter = "All" }) {
  const [allArticles, setAllArticles] = useState(initialArticles);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const fetchArticles = useCallback(async (search = "", pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/list?category=Bollywood&limit=12&page=${pageNum}&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      
      if (data.success) {
        if (append) {
          setAllArticles(prev => [...prev, ...data.data]);
        } else {
          setAllArticles(data.data);
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

  const filteredArticles = activeFilter === "All" 
    ? allArticles 
    : allArticles.filter(article => article.category === activeFilter);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-amber-500" />
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Bollywood Intelligence</h2>
        </div>

        <div className="relative group w-full md:w-[400px]">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchTerm ? 'text-amber-500' : 'text-zinc-500'}`} />
          <input
            type="text"
            placeholder="Search Hindi cinema intelligence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-zinc-600 text-white"
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
              <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Results Info */}
      {searchTerm && !loading && (
        <p className="text-zinc-500 text-sm mb-8 animate-in fade-in slide-in-from-left-4 duration-300">
          Found {filteredArticles.length} reports for <span className="text-amber-400 font-bold">&ldquo;{searchTerm}&rdquo;</span>
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <Link
              key={article._id}
              href={`/category/bollywood/${article.slug}`}
              className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <Film className="w-10 h-10 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90" />
                
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl">
                    {article.contentType || "Intelligence"}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col">
                <h3 className="text-xl font-black text-white mb-3 line-clamp-2 group-hover:text-amber-500 transition-colors leading-tight">
                  {article.title}
                </h3>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-8 leading-relaxed font-medium">
                  {article.summary || (article.sections && article.sections[0]?.content) || "Deep intelligence report on this Bollywood feature."}
                </p>
                
                <div className="mt-auto flex items-center text-amber-500 text-xs font-black uppercase tracking-[0.2em] group/btn">
                  <span>Explore Intel</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))
        ) : !loading && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <Sparkles className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 font-black uppercase tracking-widest">No Intelligence Found</p>
          </div>
        )}
      </div>

      {/* Loading State for Grid */}
      {loading && allArticles.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 animate-pulse">
              <div className="aspect-[3/4] bg-zinc-800/50 rounded-xl mb-6" />
              <div className="h-5 bg-zinc-800/50 rounded-lg mb-3 w-3/4" />
              <div className="h-4 bg-zinc-800/50 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-20 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-12 py-4 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-2xl text-xs font-black uppercase tracking-[0.3em] text-white transition-all disabled:opacity-50 group"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Processing...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                Load More Reports <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-500" />
              </span>
            )}
          </button>
        </div>
      )}

      <div className="mt-24 text-center">
        <div className="inline-block w-full max-w-4xl p-4 rounded-xl border border-dashed border-amber-500/20 bg-amber-500/5">
          <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.4em]">
            Scanning {allArticles.length} verified intelligence reports
          </p>
        </div>
      </div>
    </section>
  );
}

