"use client";

import Link from "next/link";
import { TrendingUp, Film } from "lucide-react";

const placeholderArticles = [
  { _id: 1, title: "Oppenheimer", year: "2023", genres: "Biography / Drama", image: "/placeholder/oppenheimer.jpg", tags: [{ name: "$976M", color: "green" }, { name: "Cinematic", color: "purple" }] },
  { _id: 2, title: "Dune: Part Two", year: "2024", genres: "Sci-Fi / Adventure", image: "/placeholder/dune2.jpg", tags: [{ name: "$711M", color: "green" }, { name: "IMAX", color: "blue" }] },
  { _id: 3, title: "Avatar: The Way of Water", year: "2022", genres: "Sci-Fi / Action", image: "/placeholder/avatar2.jpg", tags: [{ name: "$2.3B", color: "green" }, { name: "VFX", color: "teal" }] },
  { _id: 4, title: "Inception", year: "2010", genres: "Sci-Fi / Thriller", image: "/placeholder/inception.jpg", tags: [{ name: "$837M", color: "green" }, { name: "Thriller", color: "red" }] },
  { _id: 5, title: "The Dark Knight", year: "2008", genres: "Action / Crime", image: "/placeholder/darkknight.jpg", tags: [{ name: "$1.0B", color: "green" }, { name: "Action", color: "orange" }] },
  { _id: 6, title: "Interstellar", year: "2014", genres: "Sci-Fi / Adventure", image: "/placeholder/interstellar.jpg", tags: [{ name: "$731M", color: "green" }, { name: "Cinematic", color: "purple" }] },
];

const tagColors = {
  green: "bg-green-500/10 border-green-500/30 text-green-400",
  purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  teal: "bg-teal-500/10 border-teal-500/30 text-teal-400",
  red: "bg-red-500/10 border-red-500/30 text-red-400",
  orange: "bg-orange-500/10 border-orange-500/30 text-orange-400",
};

export default function HollywoodArticlesGrid({ articles, loading }) {
  const displayArticles = loading ? placeholderArticles : (articles.length > 0 ? articles : placeholderArticles);

  return (
    <section className="bg-[#0B0F1A] text-white py-16 sm:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-12">
          <TrendingUp className="w-7 h-7 text-orange-500" />
          <h2 className="text-3xl font-bold tracking-tight">Trending Hollywood Movies</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {displayArticles.map((article, index) => (
            <Link
              key={article._id || index}
              href={article.slug ? `/category/hollywood/${article.slug}` : '#'}
              className={`group block bg-[#121826] rounded-2xl border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-pink-500/50 backdrop-blur-[10px] ${loading ? 'animate-pulse' : ''}`}
            >
              <div className="relative overflow-hidden rounded-t-2xl aspect-[2/3]">
                {article.coverImage || article.image ? (
                  <img
                    src={article.coverImage || article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <Film className="w-12 h-12 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-5 w-full">
                  <div className="flex items-center gap-2 mb-3">
                    {(article.tags || []).map((tag, i) => (
                      <span key={i} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${tagColors[tag.color] || tagColors.purple}`}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight leading-tight transition-colors text-white group-hover:text-pink-400">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 font-medium">
                    {article.year ? `${article.year} - ${article.genres}` : (article.summary || ' ')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block w-full max-w-4xl p-3 rounded-lg border border-dashed border-orange-500/30 bg-orange-500/5">
            <p className="text-xs text-orange-300/80">
              Automated Updates: This section updates daily via API integration - SEO URL: /hollywood/movies/[movie-name]
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
