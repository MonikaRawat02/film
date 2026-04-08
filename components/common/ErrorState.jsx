"use client";

import Link from "next/link";
import { AlertTriangle, Search, Home, Film, Users } from "lucide-react";

export default function ErrorState({ type = "movie", title, description }) {
  const isMovie = type === "movie";

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#050505] px-6 py-24">
      <div className="max-w-xl w-full text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {isMovie ? "Movie Not Available (Yet)" : "Celebrity Not Available (Yet)"}
        </h1>
        <p className="text-zinc-400 mb-8">
          {description ||
            `We couldn’t find this ${isMovie ? "movie" : "celebrity"} in our database right now. It may be added soon. In the meantime, explore our latest intelligence below.`}
        </p>

        <div className="flex items-center gap-3 justify-center mb-8">
          <Link
            href={isMovie ? "/ott" : "/celebrities"}
            className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-rose-500/40 text-zinc-200 px-5 py-3 rounded-xl text-sm font-bold transition-all"
          >
            {isMovie ? <Film className="w-4 h-4" /> : <Users className="w-4 h-4" />}{" "}
            {isMovie ? "Explore OTT Intelligence" : "Browse Celebrities"}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-rose-500/40 text-zinc-200 px-5 py-3 rounded-xl text-sm font-bold transition-all"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

