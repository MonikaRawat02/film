import Link from "next/link";

export default function CelebritySection() {
  const celebrities = [
    { slug: "shah-rukh-khan", name: "Shah Rukh Khan" },
    { slug: "salman-khan", name: "Salman Khan" },
    { slug: "aamir-khan", name: "Aamir Khan" },
    { slug: "akshay-kumar", name: "Akshay Kumar" },
  ];

  return (
    <section className="relative py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0f0015] via-fuchsia-900/20 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex items-center justify-between gap-6 mb-10">
          <div className="space-y-3">
            <div className="inline-block px-4 py-2 bg-purple-600/10 border border-purple-600/30 rounded-full">
              <span className="text-purple-500 font-semibold text-sm uppercase tracking-wider">
                VERIFIED PROFILES
              </span>
            </div>
            <h2 className="text-5xl font-serif font-bold text-white mb-4">
              Celebrity Intelligence
            </h2>
            <p className="text-gray-400 text-xl">
              Comprehensive career analytics &amp; verified data
            </p>
          </div>
          <a
            href="#"
            className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-gray-800 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            All Celebrity Profiles
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {celebrities.map((celeb, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-black/30 p-4 pb-5 hover:border-gray-600 transition-all duration-300"
            >
              <div className="rounded-xl overflow-hidden">
                <div className="aspect-[16/9] w-full bg-gray-800/60" />
                <div className="absolute right-6 top-6 inline-flex items-center rounded-full bg-emerald-600/15 text-emerald-300 border border-emerald-700/30 px-2 py-1 text-xs font-semibold backdrop-blur">
                  {/* placeholder badge */}
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50" />
              </div>

              <div className="mt-5 space-y-4">
                <div className="h-6 w-2/3 rounded bg-white/10" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/40 border border-gray-800 p-3">
                    <div className="h-4 w-1/3 rounded bg-white/10 mb-2" />
                    <div className="h-4 w-1/2 rounded bg-white/20" />
                  </div>
                  <div className="rounded-xl bg-black/40 border border-gray-800 p-3">
                    <div className="h-4 w-1/3 rounded bg-white/10 mb-2" />
                    <div className="h-4 w-1/4 rounded bg-white/20" />
                  </div>
                </div>

                <Link
                  href={`/celebrity/${celeb.slug}/networth`}
                  className="block w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-fuchsia-500 hover:to-pink-500 active:scale-95 text-center cursor-pointer"
                >
                  View Complete Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
