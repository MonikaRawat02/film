"use client";

import { Flame, Tv, Calendar, BarChart3, TrendingUp, RefreshCw } from "lucide-react";

const filters = [
  { id: "All", label: "All Content", icon: Flame },
  { id: "SeasonBreakdown", label: "Season Breakdown", icon: Calendar },
  { id: "PlatformAnalytics", label: "Platform Analytics", icon: Tv },
  { id: "ViewershipTrends", label: "Viewership Trends", icon: BarChart3 },
  { id: "RenewalStatus", label: "Renewal Status", icon: RefreshCw },
  { id: "Industry", label: "Industry Insights", icon: TrendingUp },
];

export default function WebSeriesFilterBar({ activeFilter, setActiveFilter, loading }) {
  const colors = {
    active: 'from-emerald-600 via-teal-600 to-cyan-600',
    shadow: 'shadow-emerald-500/30',
  };

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
                disabled={loading}
                className={`group relative px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 ${
                  isActive
                    ? `text-white bg-gradient-to-r ${colors.active} shadow-lg ${colors.shadow}`
                    : "text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900/50"
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="relative z-10">{filter.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
