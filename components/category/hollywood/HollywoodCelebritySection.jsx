"use client";

import { Star, TrendingUp, Film, Trophy, DollarSign, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HollywoodCelebritySection() {
  const celebrities = [
    {
      name: "Leonardo DiCaprio",
      rating: 98,
      award: "Oscar Winner • 6x Nominations",
      latest: "Latest: Killers of the Flower Moon",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
    },
    {
      name: "Margot Robbie",
      rating: 96,
      award: "Producer • 3x Oscar Nominations",
      latest: "Latest: Barbie",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
    },
    {
      name: "Timothée Chalamet",
      rating: 94,
      award: "Rising Star • Oscar Nominee",
      latest: "Latest: Wonka",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    },
    {
      name: "Zendaya",
      rating: 97,
      award: "Emmy Winner • Fashion Icon",
      latest: "Latest: Dune: Part Two",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1974&auto=format&fit=crop",
    },
  ];

  return (
    <section className="bg-[#0B0F1A] text-white py-16 md:py-24 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Heading */}
        <div className="flex items-center gap-3 mb-12">
          <Star className="w-8 h-8 text-orange-400" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Hollywood Actors & Celebrity Profiles
          </h2>
        </div>

        {/* Celebrity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {celebrities.map((celeb, i) => (
            <div
              key={i}
              className="group rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02] bg-[#121826] backdrop-blur-[10px] cursor-pointer"
            >
              {/* Image Area */}
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={celeb.image}
                  alt={celeb.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/90 text-white font-semibold text-[10px]">
                  <TrendingUp className="w-3 h-3" />
                  {celeb.rating}
                </div>

                {/* Award Badge Container */}
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center justify-center w-full rounded-md px-2 py-1 text-[11px] font-semibold bg-purple-500 text-white border border-transparent whitespace-nowrap backdrop-blur-sm shadow-lg">
                    <Trophy className="w-3 h-3 mr-1.5 opacity-80" />
                    {celeb.award}
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  {celeb.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4 font-medium">{celeb.latest}</p>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-y-4">
                  <div className="flex items-center gap-2 text-[10px] text-gray-300 font-bold hover:text-orange-300 transition-colors">
                    <Film className="w-3.5 h-3.5 text-orange-400" />
                    Filmography
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-300 font-bold hover:text-orange-300 transition-colors">
                    <Trophy className="w-3.5 h-3.5 text-orange-400" />
                    Awards
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-300 font-bold hover:text-orange-300 transition-colors">
                    <DollarSign className="w-3.5 h-3.5 text-orange-400" />
                    Net Worth Analysis
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-300 font-bold hover:text-orange-300 transition-colors">
                    <Activity className="w-3.5 h-3.5 text-orange-400" />
                    Trending Movies
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mb-8">
          <Link
            href="/celebrities"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-orange-500/50 text-orange-300 hover:bg-orange-500/10 transition-all text-sm font-bold shadow-lg shadow-orange-500/5 group"
          >
            View All 5,000+ Celebrity Profiles
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* SEO URL Structure Banner */}
        <div className="mt-8 p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 text-center">
          <p className="text-orange-300 text-sm font-medium tracking-wide">
            <span className="font-bold">SEO URL Structure:</span> /hollywood/actors/[name] • Includes filmography, awards, net worth & trending movies
          </p>
        </div>

      </div>
    </section>
  );
}
