"use client";

import { Flame, Search, Play, TrendingUp } from "lucide-react";

export default function BollywoodHeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-zinc-950 to-zinc-950" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500 font-medium">Premium Intelligence Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-6">
            Bollywood Intelligence Hub
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-zinc-400 mb-10 leading-relaxed">
            Deep analysis of Hindi cinema including movie explanations, box office truth, OTT insights, and celebrity career intelligence.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search Bollywood movies, actors, box office, or story explanations"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["movie ending explained", "box office collection", "OTT release details", "actor career analysis"].map((tag, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-sm text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40">
              <Play className="w-5 h-5" />
              Explore Bollywood Intelligence
            </button>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 text-zinc-300 hover:text-amber-500 px-8 py-4 rounded-xl font-semibold transition-all">
              <TrendingUp className="w-5 h-5" />
              Trending Bollywood Explainers
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
