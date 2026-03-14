"use client";

import { Flame, Search, Play, TrendingUp } from "lucide-react";

export default function HollywoodHeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-pink-900/10 to-orange-900/20" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-6xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-6 py-3 rounded-full mb-8 backdrop-blur-sm">
            <Flame className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">FilmyFire Intelligence Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-purple-300 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-6 leading-tight">
            Hollywood Movies, Actors, Box Office & OTT Intelligence
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-zinc-400 mb-10 leading-relaxed max-w-3xl mx-auto">
            Explore thousands of Hollywood movies, celebrity profiles, streaming releases, and box office insights updated daily.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-3xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search Hollywood movies, actors, franchises, or box office data"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all"
            />
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {["Hollywood movies", "Hollywood actors", "Hollywood box office", "Hollywood OTT releases", "Hollywood film analysis"].map((tag, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-full text-sm text-zinc-300 hover:border-purple-500/50 hover:text-purple-300 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              <Play className="w-5 h-5" />
              Explore Hollywood Movies
            </button>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-800/50 border border-zinc-700 hover:border-purple-500/50 text-zinc-300 hover:text-purple-300 px-8 py-4 rounded-xl font-semibold transition-all backdrop-blur-sm">
              <TrendingUp className="w-5 h-5" />
              View Trending Films
            </button>
          </div>

          {/* Description Box */}
          <div className="max-w-4xl mx-auto bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
            <p className="text-sm text-zinc-400 leading-relaxed text-left">
              Hollywood cinema continues to dominate the global entertainment landscape, shaping cultural narratives and setting box office records worldwide. From blockbuster franchises to critically acclaimed independent films, the American film industry produces over 700 feature films annually, generating billions in revenue across theatrical releases and streaming platforms. FilmyFire provides comprehensive intelligence on Hollywood's evolving ecosystem, tracking everything from production trends and casting decisions to opening weekend performances and long-tail OTT streaming success. Our platform aggregates real-time data on thousands of movies, celebrity profiles, industry analysis, and viewing patterns to help enthusiasts, professionals, and investors understand the complex dynamics of modern Hollywood entertainment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
