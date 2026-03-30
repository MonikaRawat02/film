"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { TrendingUp, DollarSign, Film, Award, Loader2, Star, Users, ArrowUpRight } from "lucide-react";
import CategoryHeroSection from "../../components/category/CategoryHeroSection";

export default function CelebritiesPage() {
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCelebrities = async () => {
      try {
        setLoading(true);
        // Using the same API used in the hub preview but with a larger limit
        const res = await fetch("/api/admin/celebrity/celebrityIntelligence?page=1&limit=50");
        const data = await res.json();
        if (data.data) {
          setCelebrities(data.data);
        } else {
          throw new Error("Failed to load celebrity data");
        }
      } catch (err) {
        console.error("Error fetching celebrities:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCelebrities();
  }, []);

  return (
    <>
      <Head>
        <title>Celebrity Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Deep career analytics, net worth breakdowns, and filmography intelligence for your favorite stars." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
        <CategoryHeroSection category="Celebrities" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex items-center gap-3 mb-10 border-b border-zinc-800 pb-6">
            <Users className="w-8 h-8 text-fuchsia-500" />
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Verified Star Profiles</h2>
              <p className="text-zinc-500 text-sm mt-1">Authorized career intelligence and financial breakdowns</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin" />
              <p className="text-zinc-500 animate-pulse">Scanning celebrity database...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          ) : celebrities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {celebrities.map((celeb, idx) => (
                <Link 
                  href={`/celebrity/${celeb.slug}/profile`}
                  key={celeb.slug || idx}
                  className="group relative h-[450px] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-fuchsia-500/10"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={celeb.profileImage || "/placeholder.jpg"} 
                      alt={celeb.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                    <div className="flex flex-col gap-2">
                      <span className="bg-fuchsia-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        Verified
                      </span>
                    </div>
                    {celeb.trendingPercentage && (
                      <div className="flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">+{celeb.trendingPercentage}%</span>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="absolute inset-x-0 bottom-0 p-6 z-10 flex flex-col justify-end">
                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-fuchsia-400 transition-colors leading-tight">
                      {celeb.name}
                    </h3>
                    
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-4 flex items-center gap-2 truncate">
                      <Star className="w-3 h-3 text-fuchsia-500 flex-shrink-0" />
                      <span className="truncate">{celeb.profession}</span>
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter mb-1">Net Worth</p>
                        <p className="text-sm font-bold text-white flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                          {celeb.netWorth || "N/A"}
                        </p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter mb-1">Filmography</p>
                        <p className="text-sm font-bold text-white flex items-center gap-1">
                          <Film className="w-3 h-3 text-blue-400" />
                          {celeb.filmsCount || 0}+ Films
                        </p>
                      </div>
                    </div>

                    {/* View Intelligence Link */}
                    <div className="flex items-center justify-between text-xs font-bold text-fuchsia-500 uppercase tracking-widest group/link">
                      <span>Career Intelligence</span>
                      <div className="w-8 h-8 rounded-full bg-fuchsia-500/10 flex items-center justify-center group-hover/link:bg-fuchsia-500 group-hover/link:text-white transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
              <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 italic text-lg">No celebrity intelligence profiles found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

CelebritiesPage.noPadding = true;

