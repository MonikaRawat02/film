"use client";

import Link from "next/link";
import { Flame, Sparkles, Film, Clock, Eye, ArrowRight } from "lucide-react";

export default function CategoryArticlesGrid({ category, articles, loading }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <Flame className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl font-bold text-white">Trending {category || "Content"} Intelligence</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-pulse">
              <div className="aspect-video bg-zinc-800 rounded-xl mb-4" />
              <div className="h-4 bg-zinc-800 rounded mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl">
          <Sparkles className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No intelligence available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article._id}
              href={category?.toLowerCase() === 'ott' ? `/ott/${article.slug}` : `/category/${category}/${article.slug}`}
              className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video relative overflow-hidden">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <Film className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-lg">
                    {article.contentType}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-amber-500 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.stats?.views || 0}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
