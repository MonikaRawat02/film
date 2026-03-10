import { Film, Clapperboard, Tv, PlaySquare, TrendingUp, Users, ArrowUpRight } from "lucide-react";

export default function CategoryHubSection() {
  return (
    <section className="relative py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050505] via-gray-950/20 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-block px-4 py-2 bg-gray-800/40 border border-gray-700/60 rounded-full">
            <span className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
              Explore by Category
            </span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-white">
            Category Intelligence Hub
          </h2>
          <p className="text-xl text-gray-400">
            Navigate through organized content portals designed for deep exploration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Bollywood",
              subtitle: "Hindi cinema intelligence",
              count: "2,400+ Articles",
              icon: Clapperboard,
              iconBg: "from-red-600 via-orange-600 to-pink-600",
              border: "from-orange-500 via-amber-500 to-pink-600",
              textGrad: "from-orange-400 to-pink-500",
            },
            {
              title: "Hollywood",
              subtitle: "International films analyzed",
              count: "3,200+ Articles",
              icon: Film,
              iconBg: "from-blue-600 via-purple-600 to-pink-600",
              border: "from-blue-600 via-purple-600 to-pink-600",
              textGrad: "from-blue-400 to-pink-500",
            },
            {
              title: "Web Series",
              subtitle: "Episodic content breakdown",
              count: "1,800+ Articles",
              icon: Tv,
              iconBg: "from-emerald-600 via-teal-600 to-cyan-600",
              border: "from-emerald-500 via-teal-500 to-cyan-500",
              textGrad: "from-emerald-400 to-cyan-500",
            },
            {
              title: "OTT Platforms",
              subtitle: "Streaming intelligence",
              count: "900+ Articles",
              icon: PlaySquare,
              iconBg: "from-rose-600 via-red-600 to-orange-600",
              border: "from-rose-500 via-red-500 to-orange-500",
              textGrad: "from-rose-400 to-orange-500",
            },
            {
              title: "Box Office",
              subtitle: "Revenue & verdict analysis",
              count: "1,500+ Articles",
              icon: TrendingUp,
              iconBg: "from-amber-600 via-orange-600 to-red-600",
              border: "from-amber-500 via-orange-500 to-red-600",
              textGrad: "from-amber-400 to-red-500",
            },
            {
              title: "Celebrities",
              subtitle: "Verified star profiles",
              count: "2,000+ Profiles",
              icon: Users,
              iconBg: "from-fuchsia-600 via-violet-600 to-purple-600",
              border: "from-fuchsia-600 via-violet-600 to-purple-600",
              textGrad: "from-fuchsia-400 to-purple-500",
            },
          ].map((c, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl isolate cursor-pointer">
              <div className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${c.border} opacity-0 group-hover:opacity-10 transition-all duration-500`} />
              <div className={`pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${c.border} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />
              <div className="relative z-10 rounded-2xl border-2 border-gray-800 hover:border-gray-700 transition-all duration-500 bg-gradient-to-b from-gray-900/60 to-black/40 p-10">
                <div className={`mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${c.iconBg} shrink-0 transform-none transition-none group-hover:scale-100`}>
                  <c.icon className="h-8 w-8 text-white/85 transform-none group-hover:scale-100" />
                </div>
                <h3 className={`text-3xl font-bold text-white mb-3 group-hover:bg-gradient-to-r ${c.textGrad} group-hover:bg-clip-text group-hover:text-transparent`}>
                  {c.title}
                </h3>
                <p className="text-base text-gray-400 mb-2">{c.subtitle}</p>
                <p className="text-sm font-semibold text-gray-500">{c.count}</p>
                <a
                  href="#"
                  className="absolute bottom-10 right-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                  aria-label="Open"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
