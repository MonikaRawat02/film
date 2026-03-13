import { LayoutGrid, DollarSign, Brain, User } from "lucide-react";

export default function WhyFilmyFire() {
  return (
    <section id="ott-analysis" className="relative py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#005005]/30 via-sky-900/20 to-transparent" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gray-800/60" />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <span className="inline-block px-4 py-2 rounded-full border border-gray-800 bg-black/40 text-sm font-semibold uppercase tracking-wider text-gray-400">
            CORE INTELLIGENCE
          </span>
          <h2 className="text-5xl font-serif font-bold text-white mb-6">
            Why FilmyFire
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Intelligence-driven content backed by research, not clickbait news
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-black/30 p-7">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-600 to-pink-600 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-300">
              <LayoutGrid className="h-7 w-7" />
            </div>
            <h3 className="relative text-xl font-bold text-white mb-4">Story & Ending Explained</h3>
            <p className="relative text-base leading-relaxed text-gray-400">
              Deep dives into plot, symbolism, hidden meanings & cinematic techniques
            </p>
            <div className="mt-6 h-1 w-0 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 group-hover:w-full transition-all duration-500" />
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-black/30 p-7">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-600 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
              <DollarSign className="h-7 w-7" />
            </div>
            <h3 className="relative text-xl font-bold text-white mb-4">Box Office & OTT Analysis</h3>
            <p className="relative text-base leading-relaxed text-gray-400">
              Real numbers, budget vs collection, verdict logic & streaming deals
            </p>
            <div className="mt-6 h-1 w-0 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 group-hover:w-full transition-all duration-500" />
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-black/30 p-7">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
              <Brain className="h-7 w-7" />
            </div>
            <h3 className="relative text-xl font-bold text-white mb-4">Character Psychology</h3>
            <p className="relative text-base leading-relaxed text-gray-400">
              Motivations, character arcs & in‑depth analysis of cinematic storytelling
            </p>
            <div className="mt-6 h-1 w-0 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 group-hover:w-full transition-all duration-500" />
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-black/30 p-7">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-600 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300">
              <User className="h-7 w-7" />
            </div>
            <h3 className="relative text-xl font-bold text-white mb-4">Celebrity Intelligence</h3>
            <p className="relative text-base leading-relaxed text-gray-400">
              Net worth, career timelines, filmography & verified celebrity profiles
            </p>
            <div className="mt-6 h-1 w-0 rounded-full bg-gradient-to-r from-orange-600 to-red-600 group-hover:w-full transition-all duration-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
