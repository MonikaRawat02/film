"use client";

import { useState, useEffect } from "react";
import { 
  Film, 
  Eye, 
  Play, 
  Target, 
  ChevronRight,
  Loader2,
  Tv,
  Globe,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { slugify } from "../../../lib/slugify";

export default function OTTMovieIntelligence() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("/api/articles/list?category=OTT&limit=4");
        const data = await res.json();
        if (data.success) {
          setMovies(data.data);
        }
      } catch (error) {
        console.error("Error fetching movies for OTT intelligence:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const getIntelligenceLinks = (movie) => {
    const platform = slugify(movie.ott?.platform || 'platform');
    const slug = movie.slug;
    return [
      { label: "Streaming Overview", icon: Tv, href: `/ott/${platform}/${slug}` },
      { label: "Ending Explained", icon: Eye, href: `/ott/${platform}/${slug}-ending-explained` },
      { label: "OTT Rights Analysis", icon: ShieldCheck, href: `/ott/${platform}/${slug}-ott-release` },
      { label: "Streaming Performance", icon: Zap, href: `/ott/${platform}/${slug}-hit-or-flop` },
      { label: "Global Reach", icon: Globe, href: `/ott/${platform}/${slug}-box-office` },
      { label: "Cast Intelligence", icon: Target, href: `/ott/${platform}/${slug}-cast` },
    ];
  };

  return (
    <section className="bg-zinc-900/50 border-y border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Play className="w-6 h-6 text-rose-500" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">OTT Content Intelligence</h2>
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
              <div key={movie._id || idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-rose-500/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-rose-400">{movie.movieTitle || movie.title}</h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold uppercase tracking-tighter">
                      Platform: {movie.ott?.platform || "OTT"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {getIntelligenceLinks(movie).map((link, lIdx) => (
                    <Link 
                      key={lIdx}
                      href={link.href}
                      className="flex items-center gap-2 p-3 rounded-lg text-sm text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/50 border border-transparent hover:border-rose-500/10 transition-all group/link"
                    >
                      <link.icon className="w-4 h-4 text-zinc-500 group-hover/link:text-rose-400 transition-colors" />
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
            <p className="text-zinc-500 italic">No OTT intelligence available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
