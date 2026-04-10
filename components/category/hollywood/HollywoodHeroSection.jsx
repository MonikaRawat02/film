"use client";

import { Film, Search, TrendingUp } from "lucide-react";

export default function HollywoodHeroSection() {
  return (
    <section className="relative overflow-hidden flex items-center bg-[#0b0f1a]">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-orange-900/20 pointer-events-none" />
      
      <div className="relative max-w-[1440px] mx-auto px-6 py-16 md:py-24 w-full pt-16">
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          
          {/* 2. FilmyFire Intelligence Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/5 backdrop-blur-sm">
            <Film className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              FilmyFire Intelligence Platform
            </span>
          </div>

          {/* 3. Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent leading-tight tracking-tight">
            Hollywood Movies, Actors, Box Office & OTT Intelligence
          </h1>

          {/* 4. Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl leading-relaxed">
            Explore thousands of Hollywood movies, celebrity profiles, streaming releases, and box office insights updated daily.
          </p>

          {/* 5. CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="inline-flex items-center justify-center gap-2 h-10 rounded-md px-6 text-sm font-medium transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25">
              <Search className="w-4 h-4" />
              Explore Hollywood Movies
            </button>
            <button className="inline-flex items-center justify-center gap-2 h-10 rounded-md px-6 text-sm font-medium transition-all bg-white text-[#f97316] hover:bg-gray-100 shadow-lg">
              <TrendingUp className="w-4 h-4" />
              View Trending Films
            </button>
          </div>

          {/* 1. Quick Tags at Top */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center opacity-60">
            {[
              "Hollywood movies",
              "Hollywood actors",
              "Hollywood box office",
              "Hollywood OTT releases",
              "Hollywood film analysis",
            ].map((tag, index) => (
              <span
                key={index}
                className="text-xs px-3 py-1 rounded-full border border-purple-500/30 text-purple-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 6. Description Box */}
          <div className="max-w-5xl mx-auto p-6 rounded-2xl border border-white/10 bg-[#121826]/80 backdrop-blur-[10px] text-gray-300 text-sm leading-relaxed text-center">
            <p>
              Hollywood cinema continues to dominate the global entertainment landscape, shaping cultural narratives and setting box office records worldwide. From blockbuster franchises to critically acclaimed independent films, the American film industry produces over 700 feature films annually, generating billions in revenue across theatrical releases and streaming platforms. FilmyFire provides comprehensive intelligence on Hollywood's evolving ecosystem, tracking everything from production trends and casting decisions to opening weekend performances and long-tail OTT streaming success. Our platform aggregates real-time data on thousands of movies, celebrity profiles, industry analysis, and viewing patterns to help enthusiasts, professionals, and investors understand the complex dynamics of modern Hollywood entertainment.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
