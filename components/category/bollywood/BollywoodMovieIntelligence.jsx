"use client";

import { 
  Film, 
  Eye, 
  Trophy, 
  BarChart3, 
  Play, 
  Target, 
  Users, 
  Star,
  ChevronRight
} from "lucide-react";

const movieIntelligence = [
  {
    title: "Jawan",
    links: [
      { label: "Movie Overview", icon: Film },
      { label: "Ending Explained", icon: Eye },
      { label: "Box Office Collection", icon: Trophy },
      { label: "Budget and Profit", icon: BarChart3 },
      { label: "OTT Release Analysis", icon: Play },
      { label: "Hidden Meaning", icon: Target },
      { label: "Audience Reaction", icon: Users },
      { label: "Critical Analysis", icon: Star },
    ]
  },
  {
    title: "Dunki",
    links: [
      { label: "Movie Overview", icon: Film },
      { label: "Ending Explained", icon: Eye },
      { label: "Box Office Collection", icon: Trophy },
      { label: "Budget and Profit", icon: BarChart3 },
      { label: "OTT Release Analysis", icon: Play },
      { label: "Hidden Meaning", icon: Target },
      { label: "Audience Reaction", icon: Users },
      { label: "Critical Analysis", icon: Star },
    ]
  },
  {
    title: "Tiger 3",
    links: [
      { label: "Movie Overview", icon: Film },
      { label: "Ending Explained", icon: Eye },
      { label: "Box Office Collection", icon: Trophy },
      { label: "Budget and Profit", icon: BarChart3 },
      { label: "OTT Release Analysis", icon: Play },
      { label: "Hidden Meaning", icon: Target },
      { label: "Audience Reaction", icon: Users },
      { label: "Critical Analysis", icon: Star },
    ]
  },
  {
    title: "Rocky Aur Rani",
    links: [
      { label: "Movie Overview", icon: Film },
      { label: "Ending Explained", icon: Eye },
      { label: "Box Office Collection", icon: Trophy },
      { label: "Budget and Profit", icon: BarChart3 },
      { label: "OTT Release Analysis", icon: Play },
      { label: "Hidden Meaning", icon: Target },
      { label: "Audience Reaction", icon: Users },
      { label: "Critical Analysis", icon: Star },
    ]
  }
];

export default function BollywoodMovieIntelligence() {
  return (
    <section className="bg-zinc-900/50 border-y border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Film className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Bollywood Movie Intelligence</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {movieIntelligence.map((movie, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-amber-400 mb-4">{movie.title}</h3>
              <div className="grid grid-cols-2 gap-3">
                {movie.links.map((link, lIdx) => (
                  <button 
                    key={lIdx}
                    className="flex items-center gap-2 p-3 rounded-lg text-sm text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors group"
                  >
                    <link.icon className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                    <span className="truncate">{link.label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
