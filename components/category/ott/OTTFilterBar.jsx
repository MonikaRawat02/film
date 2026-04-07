"use client";

import { Flame, PlaySquare, BarChart3, Tv, Globe, ShieldCheck } from "lucide-react";

export default function OTTFilterBar({ activeFilter, setActiveFilter }) {
  const filters = [
    { id: "All", label: "All OTT Intel", icon: Flame },
    { id: "Platform", label: "Platform Analysis", icon: PlaySquare },
    { id: "Rights", label: "Digital Rights", icon: ShieldCheck },
    { id: "Streaming", label: "Streaming Performance", icon: Tv },
    { id: "Global", label: "Global Reach", icon: Globe },
    { id: "Deals", label: "Content Deals", icon: BarChart3 },
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
                    ? "text-white bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 shadow-lg shadow-rose-500/30"
                    : "text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="relative z-10">{filter.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-red-500 to-rose-500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
