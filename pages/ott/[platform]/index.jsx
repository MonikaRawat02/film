"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, PlaySquare, Film, ChevronRight, Activity, Sparkles, Globe, Star, TrendingUp, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export async function getServerSideProps(context) {
  const { platform } = context.params;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    // Fetch platform details and movies
    const [platformRes, moviesRes] = await Promise.all([
      fetch(`${baseUrl}/api/ott/${platform}`),
      fetch(`${baseUrl}/api/ott/${platform}/movies`)
    ]);

    const platformData = await platformRes.json();
    const moviesData = await moviesRes.json();

    if (!platformRes.ok || !platformData.success) {
      return { notFound: true };
    }

    return {
      props: {
        platform: platformData.data.platform,
        movies: moviesData.data.movies || [],
      },
    };
  } catch (error) {
    console.error("Error fetching platform movies:", error);
    return { notFound: true };
  }
}

export default function PlatformMoviesPage({ platform, movies }) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredMovies = movies.filter(m => 
    (m.movieTitle || m.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>{platform.metaTitle} | FilmyFire</title>
        <meta name="description" content={platform.metaDescription} />
      </Head>

      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-rose-600/30 font-sans pt-32 pb-32">
        <nav className="fixed top-16 left-0 right-0 z-[40] bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 py-4">
          <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
            <Link href="/ott" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-[10px] font-black group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-[0.2em]">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back to OTT Hub</span>
            </Link>
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] hidden md:block">
              Platform Intelligence: <span className="text-rose-600">{platform.name}</span>
            </h2>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 rounded-xl bg-rose-600/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                {movies.length} Verified Titles
              </span>
            </div>
          </div>
        </nav>

        {/* Cinematic Header */}
        <div className="max-w-[1440px] mx-auto px-6 mb-24">
          <div className="max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8">
              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-600/30">
                <Globe className="w-3 h-3" />
                {platform.name} Ecosystem
              </span>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.25em] bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                Streaming Analysis
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
              {platform.heroTitle || `Explore ${platform.name} Intelligence`}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-3xl font-medium"
            >
              {platform.description || `Comprehensive analytical deep-dives into the latest ${platform.name} originals, theatrical acquisitions, and global streaming trends.`}
            </motion.p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-[1440px] mx-auto px-6 mb-16">
          <div className="p-4 md:p-6 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-rose-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search platform intelligence..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-white text-sm font-bold placeholder:text-zinc-600 focus:outline-none focus:border-rose-600/50 transition-all uppercase tracking-widest"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-8 py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">
                Latest Reports
              </button>
              <button className="flex-1 md:flex-none px-8 py-5 rounded-2xl bg-white/5 border border-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Top Rated
              </button>
            </div>
          </div>
        </div>

        <main className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredMovies.map((movie, idx) => (
                <motion.div 
                  key={movie._id || idx}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative bg-white/[0.02] rounded-[40px] border border-white/5 overflow-hidden hover:border-rose-600/30 transition-all duration-700"
                >
                  <Link href={`/ott/${platform.slug}/${movie.slug}`} className="block">
                    <div className="aspect-[3/4] overflow-hidden relative">
                      {movie.coverImage ? (
                        <motion.img 
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          src={movie.coverImage} 
                          alt={movie.movieTitle} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                          <Film className="w-16 h-16 text-zinc-800" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
                      
                      <div className="absolute top-6 right-6">
                        <span className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest shadow-2xl">
                          {movie.releaseYear || "TBA"}
                        </span>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest justify-center shadow-xl shadow-rose-600/30">
                          <Activity className="w-3 h-3" /> View Analysis
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">{movie.category}</span>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="flex items-center gap-1.5 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                          <Star className="w-3 h-3 fill-yellow-500" /> {movie.rating || "8.5"}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-black text-white group-hover:text-rose-500 transition-colors line-clamp-2 mb-4 tracking-tight">
                        {movie.movieTitle || movie.title}
                      </h3>
                      
                      <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed mb-8 font-medium">
                        {movie.summary || `Detailed analytical report covering the ${movie.category} impact and performance of this ${movie.releaseYear} title.`}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-zinc-600" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Trending Now</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredMovies.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-8">
                <Search className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">No Reports Found</h3>
              <p className="text-zinc-500 font-medium">Try adjusting your search query for {platform.name} intelligence.</p>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}

PlatformMoviesPage.noPadding = true;
