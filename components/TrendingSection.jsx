export default function TrendingSection() {
  return (
    <section id="box-office" className="relative py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050505] via-gray-950/30 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex items-center justify-between gap-6 mb-10">
          <div className="space-y-3">
            <div className="inline-block px-4 py-2 bg-red-600/10 border border-red-600/30 rounded-full">
              <span className="text-red-500 font-semibold text-sm uppercase tracking-wider">
                Trending Now
              </span>
            </div>
            <h2 className="text-5xl font-serif font-bold text-white">
              Trending Intelligence Pages
            </h2>
            <p className="text-gray-400 text-xl">Deep explanations, not breaking news</p>
          </div>
          <a
            href="#"
            className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-gray-800 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            View All Intelligence
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-black/30"
            >
              <div className="relative">
                <div className="aspect-[4/5] w-full bg-gray-800/60 rounded-t-2xl" />
                {/* category badge placeholder (left), omit right-side time/views */}
                <div className="absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-white/10 bg-white/10 backdrop-blur">
                  <span className="inline-block h-3 w-12 rounded bg-white/40" />
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-t-2xl bg-gradient-to-b from-transparent via-black/20 to-black/60" />
              </div>

              <div className="p-5">
                <div className="h-6 w-3/4 rounded bg-white/15 mb-3" />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors"
                >
                  Read Full Intelligence
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
