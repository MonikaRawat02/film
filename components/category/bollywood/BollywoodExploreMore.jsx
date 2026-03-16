"use client";

import { Film, Trophy, Users, Calendar, ChevronRight } from "lucide-react";

const exploreCategories = [
  {
    title: "Bollywood Movie Explanations",
    count: "500+ Articles",
    icon: <Film className="w-6 h-6 text-amber-500" />
  },
  {
    title: "Bollywood Box Office Reports",
    count: "300+ Articles",
    icon: <Trophy className="w-6 h-6 text-amber-500" />
  },
  {
    title: "Bollywood Celebrity Intelligence",
    count: "200+ Articles",
    icon: <Users className="w-6 h-6 text-amber-500" />
  },
  {
    title: "Bollywood OTT Analysis",
    count: "150+ Articles",
    icon: <Calendar className="w-6 h-6 text-amber-500" />
  }
];

export default function BollywoodExploreMore() {
  return (
    <section className="bg-zinc-900/50 border-y border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 text-center mb-12 tracking-tight">
          Explore More Bollywood Intelligence
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exploreCategories.map((item, idx) => (
            <button
              key={idx}
              className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
            >
              <div className="mb-6">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold leading-tight mb-2 text-zinc-100 group-hover:text-amber-500 transition-colors">
                {item.title}
              </h3>
              <p className="text-zinc-500 text-sm mb-6">
                {item.count}
              </p>
              <ChevronRight className="w-5 h-5 text-amber-500/50 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
