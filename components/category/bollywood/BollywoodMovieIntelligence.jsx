"use client";

import { useState, useEffect } from "react";
import { 
  Film, 
  Eye, 
  Trophy, 
  BarChart3, 
  Play, 
  Target, 
  Users, 
  Star,
  ChevronRight,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function BollywoodMovieIntelligence() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("/api/admin/box-office");
        const data = await res.json();
        if (data.success) {
          // Take only the first 4 movies for the intelligence section
          setMovies(data.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching movies for intelligence:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const getIntelligenceLinks = (movie) => [
    { label: "Movie Overview", icon: Film, href: `/box-office?search=${encodeURIComponent(movie.movieName)}` },
    { label: "Ending Explained", icon: Eye, href: `/category/bollywood/${movie.movieName.toLowerCase().replace(/\s+/g, '-')}-explained` },
    { label: "Box Office Collection", icon: Trophy, href: `/box-office?search=${encodeURIComponent(movie.movieName)}` },
    { label: "Budget and Profit", icon: BarChart3, href: `/box-office?search=${encodeURIComponent(movie.movieName)}` },
    { label: "OTT Release Analysis", icon: Play, href: `/category/bollywood/${movie.movieName.toLowerCase().replace(/\s+/g, '-')}-ott` },
    { label: "Hidden Meaning", icon: Target, href: `/category/bollywood/${movie.movieName.toLowerCase().replace(/\s+/g, '-')}-analysis` },
    { label: "Audience Reaction", icon: Users, href: `/category/bollywood/${movie.movieName.toLowerCase().replace(/\s+/g, '-')}-reviews` },
    { label: "Critical Analysis", icon: Star, href: `/category/bollywood/${movie.movieName.toLowerCase().replace(/\s+/g, '-')}-critics` },
  ];

  return (
    <section className="bg-zinc-900/50 border-y border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Film className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Bollywood Movie Intelligence</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-64 animate-pulse" />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {movies.map((movie, idx) => (
              <div key={movie._id || idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-amber-500/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-amber-400">{movie.movieName}</h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold uppercase tracking-tighter">
                      ROI: {movie.roi}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-tighter ${
                      movie.verdict === "BLOCKBUSTER" ? "bg-purple-900/50 text-purple-400 border border-purple-800/50" :
                      movie.verdict === "HIT" ? "bg-green-900/50 text-green-400 border border-green-800/50" :
                      "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}>
                      {movie.verdict}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {getIntelligenceLinks(movie).map((link, lIdx) => (
                    <Link 
                      key={lIdx}
                      href={link.href}
                      className="flex items-center gap-2 p-3 rounded-lg text-sm text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/50 border border-transparent hover:border-amber-500/10 transition-all group/link"
                    >
                      <link.icon className="w-4 h-4 text-zinc-500 group-hover/link:text-amber-400 transition-colors" />
                      <span className="truncate">{link.label}</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500 italic">No movie intelligence available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
