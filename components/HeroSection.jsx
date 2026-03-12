import Link from "next/link";

export default function HeroSection() {
   return (
   <section id="hero" className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 text-center">
      <div className="space-y-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-600/10 bg-red-600/10 px-5 py-2.5 text-xs md:text-sm">
          <span className="block w-2 h-2 bg-red-600 rounded-full animate-pulse flex-shrink-0"></span>
          <span className="text-red-500 font-semibold text-sm uppercase tracking-wide">NOT JUST NEWS — IT&apos;S INTELLIGENCE</span>
        </div>

        <div>
          <h1 className="max-w-5xl mx-auto leading-tight text-white text-5xl md:text-6xl xl:text-7xl font-serif font-extrabold tracking-tight">
            Movies &amp; Web Series —
          </h1>
          <h2 className="max-w-5xl mx-auto text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight font-serif">
            <span className="bg-gradient-to-r from-red-500 via-red-600 to-orange-600 bg-clip-text text-transparent">
              Explained Beyond News
            </span>
          </h2>
        </div>

        <p className="mx-auto max-w-4xl text-2xl leading-relaxed font-light text-gray-300">
          Deep story explanations, box office truth, OTT insights &amp; celebrity intelligence — all in
          one authoritative platform.
        </p>

        <div className="max-w-3xl mx-auto mt-12 mb-10 px-16">
          <div className="relative">
            <input
              placeholder="Search movies, web series, or actors..."
              className="w-full pl-16 pr-6 py-6 bg-white/5 backdrop-blur-md rounded-2xl border-2 border-gray-800 text-lg text-white placeholder-gray-500 transition-all hover:border-gray-700 hover:bg-white/10 focus:outline-none focus:border-red-600/50 focus:bg-white/10"
            />
            <p className="text-gray-500 text-sm mt-4">
              Try: &quot;Inception ending&quot; · &quot;Avatar box office&quot; · &quot;SRK net worth&quot;
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 mt-14 mb-10">
          <Link
            href="/create"
            className="group inline-flex items-center gap-2 rounded-2xl px-10 py-5 text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 shadow-sm transition active:scale-95 hover:from-red-500 hover:to-red-600"
          >
            Explore Intelligence Pages
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
          <a
            href="#"
            className="group inline-flex items-center gap-2 rounded-2xl border-2 border-gray-800 bg-white/5 backdrop-blur-md px-10 py-5 text-base font-semibold text-white transition hover:border-gray-700 hover:bg-white/10 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
            Trending Explainers
          </a>
        </div>

        <div className="mx-auto max-w-3xl mt-20 border-t border-gray-800/50 pt-20 grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">5,000+</div>
            <div className="text-sm text-gray-400">Intelligence Articles</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">2M+</div>
            <div className="text-sm text-gray-400">Monthly Readers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">100%</div>
            <div className="text-sm text-gray-400">Verified Content</div>
          </div>
        </div>
      </div>
    </section>
   );
 }
