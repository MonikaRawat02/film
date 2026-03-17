"use client";

import Link from "next/link";
import { TrendingUp, Sparkles, Film, Clock, Eye, ChevronRight } from "lucide-react";

export default function BollywoodArticlesGrid({ articles, loading }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="w-5 h-5 text-amber-500" />
        <h2 className="text-2xl font-bold text-white tracking-tight">Trending Bollywood Intelligence</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
              <div className="aspect-[3/4] bg-zinc-800 rounded-lg mb-4" />
              <div className="h-4 bg-zinc-800 rounded mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
          <Sparkles className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No Bollywood intelligence available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/category/bollywood/${article.slug}`}
              className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <Film className="w-10 h-10 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
                
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                    {article.contentType || "Intelligence"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-amber-500 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-6 leading-relaxed">
                  {article.summary || (article.sections && article.sections[0]?.content) || "Explore the deep intelligence and analysis of this Bollywood feature."}
                </p>
                
                <div className="flex items-center text-amber-500 text-sm font-bold group/btn">
                  <span>Read Intelligence</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
