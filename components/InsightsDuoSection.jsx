import { ChartColumn, TrendingUp, ExternalLink } from "lucide-react";
export default function InsightsDuoSection() {
  const statusClasses = (label = "") => {
    const L = String(label).toLowerCase();
    if (L.includes("flop")) return "bg-red-600/10 text-red-500 border-red-500/30";
    if (L.includes("blockbuster") || L.includes("super hit") || L.includes("hit"))
      return "bg-green-500/10 text-green-500 border-green-500/30";
    if (L.includes("regional") || L.includes("focus")) return "bg-yellow-600/10 text-yellow-400 border-yellow-500/30";
    return "bg-emerald-600/10 text-emerald-400 border-emerald-500/30";
  };
  const activityColor = (text = "") => {
    const t = String(text).toLowerCase();
    if (t.includes("most active") || t.includes("growing")) return "text-green-500";
    if (t.includes("regional")) return "text-yellow-400";
    return "text-gray-400";
  };
  const boxOffice = [
    {
      title: "Avatar: The Way of Water",
      tag: { label: "BLOCKBUSTER", color: "text-emerald-400 border-emerald-500/30 bg-emerald-600/10" },
      stats: [
        { label: "Budget", value: "$350M" },
        { label: "Collection", value: "$2.3B" },
        { label: "ROI", value: "+562%", color: "text-emerald-400" }
      ]
    },
    {
      title: "Oppenheimer",
      tag: { label: "SUPER HIT", color: "text-emerald-400 border-emerald-500/30 bg-emerald-600/10" },
      stats: [
        { label: "Budget", value: "$100M" },
        { label: "Collection", value: "$952M" },
        { label: "ROI", value: "+852%", color: "text-emerald-400" }
      ]
    },
    {
      title: "The Flash",
      tag: { label: "FLOP", color: "text-red-400 border-red-500/30 bg-red-600/10" },
      stats: [
        { label: "Budget", value: "$220M" },
        { label: "Collection", value: "$271M" },
        { label: "ROI", value: "+23%", color: "text-red-400" }
      ]
    }
  ];
  const ott = [
    {
      name: "Netflix",
      label: { text: "Most Active", color: "text-emerald-400 border-emerald-500/30 bg-emerald-600/10" },
      avg: "Average deal value: $15M–$50M per title",
      percent: 85,
      bar: "bg-red-500"
    },
    {
      name: "Amazon Prime",
      label: { text: "Growing", color: "text-emerald-400 border-emerald-500/30 bg-emerald-600/10" },
      avg: "Average deal value: $10M–$40M per title",
      percent: 70,
      bar: "bg-blue-600"
    },
    {
      name: "Disney+ Hotstar",
      label: { text: "Regional Focus", color: "text-yellow-400 border-yellow-500/30 bg-yellow-600/10" },
      avg: "Average deal value: $8M–$25M per title",
      percent: 60,
      bar: "bg-purple-500"
    }
  ];
  return (
    <section id="box-office" className="relative py-32 bg-[#050505]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 grid place-items-center rounded-xl border border-emerald-700/40 bg-emerald-600/10">
                <ChartColumn className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-5xl font-serif font-bold text-white mb-1">Box Office Truth</h2>
                <p className="text-sm text-gray-400">Real numbers, real verdicts</p>
              </div>
            </div>
            <div className="space-y-5">
              {boxOffice.map((m, i) => (
                <div key={i} className="group p-6 bg-gradient-to-br from-white/5 to-transparent border border-gray-800 rounded-2xl transition-all duration-500 hover:border-gray-700">
                  <div className="flex items-start justify-between">
                    <h3 className="text-white font-bold text-lg flex-1">{m.title}</h3>
                    <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg border ${statusClasses(m.tag?.label)}`}>
                      {m.tag.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {m.stats.map((s, j) => (
                      <div key={j}>
                        <div className="text-gray-500 text-xs mb-1">{s.label}</div>
                        <div className={`text-sm font-bold ${s.color || "text-white"}`}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="mt-4 w-full py-3 bg-white/5 border border-gray-800 text-gray-300 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-white/10 hover:border-gray-700 hover:text-white transition-all">
                    View Complete Analysis
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button className="w-full py-5 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-2 border-emerald-600/30 text-green-500 rounded-2xl hover:from-green-600/20 hover:to-emerald-600/20 transition-all font-bold text-lg">
                Explore Full Box Office Database →
              </button>
            </div>
          </div>
          <div id="ott-intelligence">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 grid place-items-center rounded-xl border border-blue-700/40 bg-blue-600/10">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-5xl font-serif font-bold text-white mb-1">OTT Intelligence</h2>
                <p className="text-sm text-gray-400">Streaming deals & trends</p>
              </div>
            </div>
            <div className="space-y-5">
              {ott.map((p, i) => {
                const rangeMatch = p.avg.match(/Average deal value:\s*(.*?)\s*per title/i);
                const rangeText = rangeMatch ? rangeMatch[1] : null;
                return (
                <div key={i} className="group p-6 bg-gradient-to-br from-white/5 to-transparent border border-gray-800 rounded-2xl transition-all duration-500 hover:border-gray-700">
                  <div className="flex items-start justify-between">
                    <h3 className="text-white font-semibold">{p.name}</h3>
                    <div className={`flex items-center gap-2 ${activityColor(p.label?.text)}`}>
                      <TrendingUp className={`w-4 h-4 ${activityColor(p.label?.text)}`} />
                      <span className={`text-sm font-semibold ${activityColor(p.label?.text)}`}>{p.label.text}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-3 mt-1">
                    Average deal value:{" "}
                    {rangeText ? (
                      <>
                        <span className="text-white font-semibold">{rangeText}</span>{" "}
                        <span className="text-gray-500">per title</span>
                      </>
                    ) : (
                      <span className="text-white font-semibold">{p.avg}</span>
                    )}
                  </div>
                  <div className="mt-2 relative">
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-3 rounded-full ${p.bar}`} style={{ width: `${p.percent}%` }} />
                    </div>
                    <div className="absolute -top-8 right-0 text-white font-bold text-sm">{p.percent}%</div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <span className="text-gray-500 text-sm">Market Share</span>
                    <button className="text-sm text-gray-400 hover:text-white transition-colors font-semibold inline-flex items-center gap-1">
                      View Details <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                );
              })}
              <button className="w-full py-5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-2 border-blue-600/30 text-blue-500 rounded-2xl hover:from-blue-600/20 hover:to-purple-600/20 transition-all font-bold text-lg">
                Explore OTT Platform Insights →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
