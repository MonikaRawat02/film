"use client";

import { Flame, Film, BarChart3, Tv, Users, TrendingUp } from "lucide-react";

const filters = [
  { id: "All", label: "All Content", icon: Flame },
  { id: "Explained", label: "Movie Explainers", icon: Film },
  { id: "BoxOffice", label: "Box Office Analysis", icon: BarChart3 },
  { id: "OTT", label: "OTT Performance", icon: Tv },
  { id: "Celebrity", label: "Celebrity Intelligence", icon: Users },
  { id: "Industry", label: "Industry Insights", icon: TrendingUp },
];

export default function CategoryFilterBar({ activeFilter, setActiveFilter, category }) {
  // Category-specific accent colors
  const getAccentColors = (cat) => {
    switch(cat) {
      case 'Hollywood': return { active: 'from-purple-600 via-pink-600 to-orange-600', shadow: 'shadow-purple-500/30', hover: 'hover:border-purple-500/30' };
      case 'Bollywood': return { active: 'from-amber-600 via-orange-600 to-amber-600', shadow: 'shadow-amber-500/30', hover: 'hover:border-amber-500/30' };
      case 'WebSeries': return { active: 'from-emerald-600 via-teal-600 to-cyan-600', shadow: 'shadow-emerald-500/30', hover: 'hover:border-emerald-500/30' };
      case 'OTT': return { active: 'from-rose-600 via-red-600 to-orange-600', shadow: 'shadow-rose-500/30', hover: 'hover:border-rose-500/30' };
      case 'BoxOffice': return { active: 'from-amber-600 via-orange-600 to-red-600', shadow: 'shadow-amber-500/30', hover: 'hover:border-amber-500/30' };
      case 'Celebrities': return { active: 'from-fuchsia-600 via-violet-600 to-purple-600', shadow: 'shadow-fuchsia-500/30', hover: 'hover:border-fuchsia-500/30' };
      default: return { active: 'from-amber-600 via-orange-600 to-amber-600', shadow: 'shadow-amber-500/30', hover: 'hover:border-amber-500/30' };
    }
  };

  const colors = getAccentColors(category);

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
                    ? `text-white bg-gradient-to-r ${colors.active} shadow-lg ${colors.shadow}`
                    : "text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="relative z-10">{filter.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
