"use client";

import { Target, Heart, Sparkles, Zap, Users, Brain } from "lucide-react";

const filterCategories = [
  {
    id: "emotional",
    label: "Emotional Intensity",
    icon: <Heart className="w-5 h-5 text-amber-500" />,
    options: ["Light", "Moderate", "Deep", "Intense"]
  },
  {
    id: "romance",
    label: "Romance Level",
    icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    options: ["None", "Subtle", "Central", "Epic"]
  },
  {
    id: "action",
    label: "Action/Violence",
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    options: ["Minimal", "Moderate", "High", "Extreme"]
  },
  {
    id: "family",
    label: "Family Friendly",
    icon: <Users className="w-5 h-5 text-amber-500" />,
    options: ["Kids", "Teen+", "Adult", "Mature"]
  },
  {
    id: "psychological",
    label: "Psychological Complexity",
    icon: <Brain className="w-5 h-5 text-amber-500" />,
    options: ["Simple", "Medium", "Complex", "Mind-Bending"]
  }
];

export default function BollywoodMovieDiscovery() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <Target className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100">Bollywood Movie Discovery</h2>
      </div>
      
      <p className="text-zinc-400 mb-8">Discover films based on experience, not just genre</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filterCategories.map((category) => (
          <div key={category.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              {category.icon}
              <h3 className="text-zinc-100 font-semibold">{category.label}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.options.map((option) => (
                <button 
                  key={option}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-zinc-500 text-sm mb-1">Based on your preferences</p>
          <p className="text-zinc-100 font-medium">Select filters to discover movies</p>
        </div>
        <button className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors">
          Discover Movies
        </button>
      </div>
    </section>
  );
}
