"use client";

import { useState, useEffect } from "react";
import { Star, TrendingUp, Film, Trophy, DollarSign, Activity, ChevronRight } from "lucide-react";

export default function HollywoodCelebritySection() {
  const [showAll, setShowAll] = useState(false);
  const [celebrities, setCelebrities] = useState([]);

  console.log(celebrities);

  useEffect(() => {
    const fetchCelebrities = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/admin/celebrity/getCelebrity");
        const data = await res.json();
        if (data.success) {
          const hollywoodCelebrities = data.data
            .filter(celeb => celeb.heroSection.industry === "Hollywood")
            .map(celeb => ({
              name: celeb.heroSection.name,
              rating: celeb.heroSection.growthPercentage,
              award: `${celeb.heroSection.awardsCount} Awards`,
              latest: `Latest: ${celeb.heroSection.filmsCount} Films`,
              image: `http://localhost:3000${celeb.heroSection.profileImage}`,
            }));
          setCelebrities(hollywoodCelebrities);
        }
      } catch (error) {
        console.error("Error fetching celebrities:", error);
      }
    };

    fetchCelebrities();
  }, []);

  const visibleCelebrities = showAll ? celebrities : celebrities.slice(0, 4);

  return (
    <section className="bg-[#0B0F1A] text-white py-8 md:py-10 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6">
        
        <div className="flex items-center gap-3 mb-12">
          <Star className="w-8 h-8 text-orange-400" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Hollywood Actors & Celebrity Profiles
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {visibleCelebrities.map((celeb, i) => (
            <div
              key={i}
              className="group rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02] bg-[#121826] backdrop-blur-[10px] cursor-pointer"
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={celeb.image}
                  alt={celeb.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/90 text-white font-semibold text-[10px]">
                  <TrendingUp className="w-3 h-3" />
                  {celeb.rating}
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center justify-center w-full rounded-md px-2 py-1 text-[11px] font-semibold bg-purple-500 text-white border border-transparent whitespace-nowrap backdrop-blur-sm shadow-lg">
                    <Trophy className="w-3 h-3 mr-1.5 opacity-80" />
                    {celeb.award}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  {celeb.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4 font-medium">{celeb.latest}</p>

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

        {!showAll && celebrities.length > 4 && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-orange-500/50 text-orange-300 hover:bg-orange-500/10 transition-all text-sm font-bold shadow-lg shadow-orange-500/5 group"
            >
              View All {celebrities.length}+ Celebrity Profiles
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        <div className="mt-8 p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 text-center">
          <p className="text-orange-300 text-sm font-medium tracking-wide">
            <span className="font-bold">SEO URL Structure:</span> /hollywood/actors/[name] • Includes filmography, awards, net worth & trending movies
          </p>
        </div>

      </div>
    </section>
  );
}
