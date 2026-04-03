"use client";

import { Flame, Film, BarChart3, Tv, Users, TrendingUp } from "lucide-react";

export default function HollywoodFilterBar({ activeFilter, setActiveFilter }) {
  const filters = [
    { id: "All", label: "All Hollywood", icon: Flame },
    { id: "Explained", label: "Movie Explainers", icon: Film },
    { id: "BoxOffice", label: "Box Office Analysis", icon: BarChart3 },
    { id: "OTT", label: "OTT Performance", icon: Tv },
    { id: "Celebrity", label: "Celebrity Intelligence", icon: Users },
    { id: "Industry", label: "Industry Insights", icon: TrendingUp },
  ];

  return (
    <section className="sticky top-16 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`group relative px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 ${
                  isActive
                    ? "text-white bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 shadow-lg shadow-purple-500/30"
                    : "text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900/50"
                }`} >
                <Icon className="w-4 h-4" />
                <span className="relative z-10">{filter.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
