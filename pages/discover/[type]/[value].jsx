import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clapperboard, Film, ArrowLeft, Target, 
  ChevronRight, Tv, PlaySquare, Star,
  Calendar, Zap, Sparkles, Filter,
  ArrowRight
} from "lucide-react";

export async function getServerSideProps(context) {
  const { type, value } = context.query;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/discover/get-discovery-data?type=${type}&value=${value}`);
    const data = await res.json();

    if (!res.ok || !data.data) {
      return { notFound: true };
    }

    return {
      props: {
        movies: data.data,
        meta: data.meta,
        discoveryType: type,
        discoveryValue: value,
      },
    };
  } catch (error) {
    console.error("Discovery Page Error:", error);
    return { notFound: true };
  }
}

export default function DiscoveryPage({ movies, meta, discoveryType, discoveryValue }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>{meta.title} | FilmyFire Intelligence</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`https://filmyfire.com/discover/${discoveryType}/${discoveryValue}`} />
      </Head>

      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-red-600/30 font-sans pb-24">
        
        {/* Sub-Header Navigation */}
        <div className="sticky top-16 z-40 w-full bg-black/60 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Intelligence Hub
            </Link>
            
            <div className="hidden md:flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                {discoveryType.replace("-", " ")}: {discoveryValue.replace(/-/g, " ")}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <span className="text-white">{movies.length}</span> Results
              </span>
            </div>
          </div>
        </div>

        {/* Hero Section with Glassmorphism */}
        <div className="relative pt-16 pb-20 overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-red-600/10 blur-[120px] rounded-full -z-10" />
          
          <div className="max-w-[1440px] mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Discovery Engine</span>
                </div>
                <div className="h-px w-12 bg-white/10" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">AI-Powered Recommendations</span>
              </div>

              <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
                {meta.title.split(" - ")[0]}
              </h1>
              
              <div className="relative group max-w-3xl">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-red-600 rounded-full" />
                <p className="text-lg md:text-xl text-zinc-400 leading-relaxed pl-6 italic">
                  "{meta.description}"
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Discovery Grid */}
        <main className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {movies.filter(movie => movie.slug).map((movie, idx) => (
                <motion.div 
                  key={movie.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  layout
                  className="group relative flex flex-col bg-zinc-900/20 rounded-[2rem] border border-white/5 overflow-hidden hover:border-red-600/30 transition-all duration-500"
                >
                  <Link href={`/movie/${movie.slug}`} className="flex flex-col h-full">
                    {/* Visual Container */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                      {movie.coverImage ? (
                        <img 
                          src={movie.coverImage} 
                          alt={movie.movieTitle}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                          <Film className="w-12 h-12 text-zinc-800" />
                        </div>
                      )}
                      
                      {/* Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                        <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-red-500" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{movie.releaseYear}</span>
                        </div>
                        
                        {movie.rating && (
                          <div className="px-3 py-1.5 rounded-xl bg-red-600 backdrop-blur-md border border-red-500/50 flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-white fill-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{movie.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded-md bg-red-600/20 border border-red-500/20 text-[9px] font-black text-red-500 uppercase tracking-widest">
                            {movie.category}
                          </span>
                          {movie.genres?.[0] && (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                              {movie.genres[0]}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-white leading-tight group-hover:text-red-500 transition-colors line-clamp-2">
                          {movie.movieTitle}
                        </h3>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed mb-6 font-medium">
                        {movie.summary}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between group/btn">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-red-600/10 group-hover:border-red-500/20 transition-all duration-300">
                            <Zap className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-500 transition-colors" />
                          </div>
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                            Deep Analysis
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:translate-x-1 transition-all duration-300">
                          <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
