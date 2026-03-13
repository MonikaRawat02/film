import { Rocket, Calculator, TrendingUp, Video, CheckSquare, BarChart3 } from "lucide-react";

export default function InnovationRoadmap() {
  const items = [
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      iconBg: "from-purple-600 to-pink-600",
      title: "Movie Success Score",
      desc: "AI-powered prediction model analyzing cast, director, budget, genre & release timing",
      eta: "Q2 2026",
    },
    {
      icon: <Calculator className="w-6 h-6 text-white" />,
      iconBg: "from-emerald-600 to-green-600",
      title: "Hit / Flop Calculator",
      desc: "Real-time verdict calculator with budget recovery analysis & profit margins",
      eta: "Q3 2026",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      iconBg: "from-sky-600 to-blue-600",
      title: "OTT Performance Index",
      desc: "Platform-wise streaming metrics, viewership data & comparative analytics",
      eta: "Q4 2026",
    },
    {
      icon: <CheckSquare className="w-6 h-6 text-white" />,
      iconBg: "from-orange-600 to-amber-600",
      title: "Audience Verdict Polls",
      desc: "Community-driven ratings, predictions & real-time audience sentiment analysis",
      eta: "2027",
    },
    {
      icon: <Video className="w-6 h-6 text-white" />,
      iconBg: "from-violet-600 to-purple-600",
      title: "YouTube Explainers Integration",
      desc: "Video explanations synced with articles for visual and written intelligence",
      eta: "2027",
    },
    {
      icon: <Rocket className="w-6 h-6 text-white" />,
      iconBg: "from-pink-600 to-rose-600",
      title: "Innovation Sandbox",
      desc: "Experimental modules for predictive analytics and interactive data stories",
      eta: "2027",
    },
  ];

  return (
    <section className="relative py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-gray-900/20 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-600/30 bg-amber-500/10 text-amber-400 text-sm font-semibold uppercase tracking-wider">
            <Rocket className="w-4 h-4" />
            Innovation Roadmap
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
            What&apos;s Coming to FilmyFire
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            Cutting‑edge features in development to revolutionize film intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-gray-800 bg-[#0b0b10] p-6 transition-all duration-300 hover:border-amber-600/40 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br grid place-items-center text-white"
                     style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${it.iconBg} grid place-items-center`}>
                    {it.icon}
                  </div>
                </div>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-600/30">
                  Planned
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{it.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{it.desc}</p>
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span>Expected: {it.eta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-amber-700/40 bg-amber-500/10 px-6 py-5 text-amber-300 text-sm text-center">
          These features are actively in development. Stay subscribed to get early access and beta testing opportunities.
        </div>
      </div>
    </section>
  );
}
