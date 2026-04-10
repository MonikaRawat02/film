"use client";

import Link from "next/link";
import { Flame, Sparkles, Film, Clock, Eye, ArrowRight, Star, Users, DollarSign, Tv } from "lucide-react";

export default function CategoryArticlesGrid({ category, articles, loading, filterType }) {
  const renderItem = (item) => {
    // Handle Celebrity data
    if (item.filterType === "Celebrity" || item.profession) {
      return (
        <Link
          key={item._id}
          href={`/celebrity/${item.slug}/profile`}
          className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="aspect-video relative overflow-hidden">
            {item.profileImage ? (
              <img
                src={item.profileImage}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <Users className="w-8 h-8 text-zinc-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider rounded-lg">
                Celebrity
              </span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
              {item.name}
            </h3>
            <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
              {item.profession?.join(", ") || "Entertainment Professional"}
            </p>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>View Profile</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      );
    }

    // Handle Box Office data
    if (item.filterType === "BoxOffice" && item.movieName) {
      return (
        <Link
          key={item._id}
          href={`/box-office?search=${encodeURIComponent(item.movieName)}`}
          className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-lg">
                Box Office
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-amber-500 transition-colors">
              {item.movieName}
            </h3>
            <div className="space-y-2 mb-4">
              {item.collection && (
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-500">Collection:</span> {item.collection}
                </p>
              )}
              {item.verdict && (
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-500">Verdict:</span> {item.verdict}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Box Office Data</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      );
    }

    // Handle OTT Intelligence data
    if (item.filterType === "OTT" && item.platformName) {
      return (
        <Link
          key={item._id}
          href={`/ott-insights`}
          className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <Tv className="w-5 h-5 text-rose-500" />
              </div>
              <span className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-lg">
                OTT Platform
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-rose-400 transition-colors">
              {item.platformName}
            </h3>
            <div className="space-y-2 mb-4">
              {item.marketShare && (
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-500">Market Share:</span> {item.marketShare}%
                </p>
              )}
              {item.statusLabel && (
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-500">Status:</span> {item.statusLabel}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Platform Intelligence</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      );
    }

    // Handle Article data (Explained, Industry, or default)
    return (
      <Link
        key={item._id}
        href={item.category?.toLowerCase() === 'ott' ? `/ott/${item.slug}` : `/category/${item.category?.toLowerCase() || 'bollywood'}/${item.slug}`}
        className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="aspect-video relative overflow-hidden">
          {item.coverImage ? (
            <img
              src={item.coverImage}
              alt={item.title || item.movieTitle}
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
              {item.filterType || item.contentType || item.category}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-amber-500 transition-colors">
            {item.title || item.movieTitle}
          </h3>
          <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
            {item.summary}
          </p>
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {item.stats?.views || 0}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <Flame className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl font-bold text-white">
          {filterType === "Explained" && "Movie Explainers"}
          {filterType === "BoxOffice" && "Box Office Analysis"}
          {filterType === "OTT" && "OTT Performance"}
          {filterType === "Celebrity" && "Celebrity Intelligence"}
          {filterType === "Industry" && "Industry Insights"}
          {!filterType && `Trending ${category || "Content"} Intelligence`}
        </h2>
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
          {articles.map((article) => {
            // Handle Box Office model data (not articles)
            if (article.movieName && !article.title) {
              return (
                <Link
                  key={article._id}
                  href={`/box-office?search=${encodeURIComponent(article.movieName)}`}
                  className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <DollarSign className="w-5 h-5 text-amber-500" />
                      </div>
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-lg">
                        Box Office
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-amber-500 transition-colors">
                      {article.movieName}
                    </h3>
                    <div className="space-y-2 mb-4">
                      {article.collection && (
                        <p className="text-sm text-zinc-400">
                          <span className="text-zinc-500">Collection:</span> {article.collection}
                        </p>
                      )}
                      {article.verdict && (
                        <p className="text-sm text-zinc-400">
                          <span className="text-zinc-500">Verdict:</span> {article.verdict}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Box Office Data</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            }

            // Handle OTT Intelligence model data (not articles)
            if (article.platformName && !article.title) {
              return (
                <Link
                  key={article._id}
                  href={`/ott-insights`}
                  className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-rose-500/10 rounded-lg">
                        <Tv className="w-5 h-5 text-rose-500" />
                      </div>
                      <span className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-lg">
                        OTT Platform
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-rose-400 transition-colors">
                      {article.platformName}
                    </h3>
                    <div className="space-y-2 mb-4">
                      {article.marketShare && (
                        <p className="text-sm text-zinc-400">
                          <span className="text-zinc-500">Market Share:</span> {article.marketShare}%
                        </p>
                      )}
                      {article.statusLabel && (
                        <p className="text-sm text-zinc-400">
                          <span className="text-zinc-500">Status:</span> {article.statusLabel}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Platform Intelligence</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            }

            // Handle Celebrity data
            if (article.profession && !article.title) {
              return (
                <Link
                  key={article._id}
                  href={`/celebrity/${article.slug}/profile`}
                  className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-video relative overflow-hidden">
                    {article.profileImage ? (
                      <img
                        src={article.profileImage}
                        alt={article.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <Users className="w-8 h-8 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider rounded-lg">
                        Celebrity
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {article.name}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                      {article.profession?.join(", ") || "Entertainment Professional"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>View Profile</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            }

            // Handle Article data (standard articles)
            const categorySlug = article.category?.toLowerCase() || 'bollywood';
            const isOTTCategory = categorySlug === 'ott';
            const articleLink = isOTTCategory 
              ? `/ott/${article.slug}` 
              : `/category/${categorySlug}/${article.slug}`;

            return (
              <Link
                key={article._id}
                href={articleLink}
                className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video relative overflow-hidden">
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title || article.movieTitle}
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
                      {article.contentType || article.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-amber-500 transition-colors">
                    {article.title || article.movieTitle}
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
            );
          })}
        </div>
      )}
    </section>
  );
}
