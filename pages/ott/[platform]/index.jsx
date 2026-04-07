"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, PlaySquare, Film, ChevronRight } from "lucide-react";

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
  return (
    <>
      <Head>
        <title>{platform.metaTitle}</title>
        <meta name="description" content={platform.metaDescription} />
      </Head>

      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-rose-600/30 font-sans pt-32 pb-24">
        <nav className="fixed top-16 left-0 right-0 z-[40] bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4">
          <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
            <Link href="/ott" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-xs font-bold group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline uppercase tracking-widest">Back to OTT Hub</span>
            </Link>
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] hidden md:block">
              Platform Intelligence: {platform.name}
            </h2>
            <span className="px-3 py-1 rounded-lg bg-rose-600/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest border border-rose-500/20">
              {movies.length} Titles
            </span>
          </div>
        </nav>

        <div className="max-w-[1440px] mx-auto px-6 mb-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                <PlaySquare className="w-3 h-3" />
                OTT Platform
              </span>
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">Streaming Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              {platform.heroTitle}
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl">
              {platform.description}
            </p>
          </div>
        </div>

        <main className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {movies.map((movie, idx) => (
              <div key={idx} className="group relative bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden hover:border-rose-600/50 transition-all duration-500 hover:-translate-y-2">
                <Link href={`/ott/${platform.slug}/${movie.slug}`} className="block">
                  <div className="aspect-[2/3] overflow-hidden relative">
                    {movie.coverImage ? (
                      <img src={movie.coverImage} alt={movie.movieTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Film className="w-12 h-12 text-zinc-700" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">{movie.releaseYear || "TBA"}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{movie.category}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Intelligence Report</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-rose-500 transition-colors line-clamp-2 mb-3">
                      {movie.movieTitle || movie.title} {movie.releaseYear ? `(${movie.releaseYear})` : ""}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-6">{movie.summary}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Explore Analysis</span>
                      <ChevronRight className="w-4 h-4 text-rose-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

PlatformMoviesPage.noPadding = true;
