import { useState, useEffect } from "react";
import { BarChart, TrendingUp, ExternalLink, Target } from "lucide-react";
import Link from "next/link";

export default function InsightsDuoSection() {
  const [boxOfficeData, setBoxOfficeData] = useState([]);
  const [ottData, setOttData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boRes, ottRes] = await Promise.all([
          fetch("/api/public/box-office?limit=3"),
          fetch("/api/public/ott-intelligence?limit=3")
        ]);
        
        // Check if responses are ok
        if (!boRes.ok || !ottRes.ok) {
          console.warn("API returned non-ok status, using fallback data");
          setBoxOfficeData(getFallbackBoxOffice());
          setOttData(getFallbackOTT());
          setLoading(false);
          return;
        }
        
        const boJson = await boRes.json();
        const ottJson = await ottRes.json();
        
        // Use API data if available, otherwise use fallback
        if (boJson.success && boJson.data && boJson.data.length > 0) {
          setBoxOfficeData(boJson.data.slice(0, 3));
        } else {
          setBoxOfficeData(getFallbackBoxOffice());
        }
        
        if (ottJson.success && ottJson.data && ottJson.data.length > 0) {
          setOttData(ottJson.data.slice(0, 3));
        } else {
          setOttData(getFallbackOTT());
        }
      } catch (error) {
        console.error("Error fetching homepage insights:", error);
        // Use fallback data on error
        setBoxOfficeData(getFallbackBoxOffice());
        setOttData(getFallbackOTT());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fallback data functions
  const getFallbackBoxOffice = () => [
    { _id: 1, movieName: "Sample Movie 1", budget: "₹200 Cr", collection: "₹500 Cr", roi: "+150%", verdict: "HIT", analysisLink: "/box-office" },
    { _id: 2, movieName: "Sample Movie 2", budget: "₹150 Cr", collection: "₹300 Cr", roi: "+100%", verdict: "HIT", analysisLink: "/box-office" },
    { _id: 3, movieName: "Sample Movie 3", budget: "₹100 Cr", collection: "₹80 Cr", roi: "-20%", verdict: "FLOP", analysisLink: "/box-office" }
  ];

  const getFallbackOTT = () => [
    { _id: 1, platformName: "Netflix", averageDealValue: "$20M–$50M", marketShare: 35, statusLabel: "Most Active", detailsLink: "/ott" },
    { _id: 2, platformName: "Amazon Prime", averageDealValue: "$15M–$40M", marketShare: 28, statusLabel: "Growing", detailsLink: "/ott" },
    { _id: 3, platformName: "Disney+ Hotstar", averageDealValue: "$10M–$30M", marketShare: 20, statusLabel: "Most Active", detailsLink: "/ott" }
  ];

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

  const activityIcon = (text = "") => {
    const t = String(text).toLowerCase();
    if (t.includes("most active") || t.includes("growing")) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (t.includes("regional")) return <Target className="w-4 h-4 text-yellow-400" />;
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const getOttBarColor = (name) => {
    const n = name.toLowerCase();
    if (n.includes("netflix")) return "bg-red-500";
    if (n.includes("amazon")) return "bg-blue-600";
    if (n.includes("disney") || n.includes("hotstar")) return "bg-purple-500";
    return "bg-red-600";
  };

  return (
    <section id="box-office" className="relative py-16 bg-[#050505]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Box Office Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 grid place-items-center rounded-xl border border-emerald-700/40 bg-emerald-600/10">
                <BarChart className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-5xl font-serif font-bold text-white mb-1">Box Office Truth</h2>
                <p className="text-sm text-gray-400">Real numbers, real verdicts</p>
              </div>
            </div>
            <div className="space-y-5">
              {boxOfficeData.length > 0 ? (
                boxOfficeData.map((m, i) => (
                  <div key={m._id || i} className="group p-6 bg-gradient-to-br from-white/5 to-transparent border border-gray-800 rounded-2xl transition-all duration-500 hover:border-gray-700">
                    <div className="flex items-start justify-between">
                      <h3 className="text-white font-serif font-bold text-xl flex-1 group-hover:text-green-400 transition-colors">{m.movieName}</h3>
                      <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border ${statusClasses(m.verdict)}`}>
                        {m.verdict}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Budget</div>
                        <div className="text-sm font-bold text-white">{m.budget}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Collection</div>
                        <div className="text-sm font-bold text-white">{m.collection}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">ROI</div>
                        <div className={`text-sm font-bold ${m.verdict === 'FLOP' ? 'text-red-400' : 'text-emerald-400'}`}>{m.roi}</div>
                      </div>
                    </div>
                    
                    <a 
                      href={m.analysisLink || "#"} 
                      className="mt-4 w-full py-3 bg-white/5 border border-gray-800 text-gray-300 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-white/10 hover:border-gray-700 hover:text-white transition-all"
                    >
                      View Complete Analysis
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              ) : !loading && (
                <div className="p-10 text-center border border-gray-800 rounded-2xl text-gray-500">
                  No box office data available.
                </div>
              )}
              <Link 
                href="/box-office"
                className="w-full py-5 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-2 border-emerald-600/30 text-green-500 rounded-2xl hover:from-green-600/20 hover:to-emerald-600/20 transition-all font-bold text-lg inline-flex items-center justify-center"
              >
                Explore Full Box Office Database →
              </Link>
            </div>
          </div>

          {/* OTT Intelligence Section */}
          <div id="ott-intelligence" className="scroll-mt-24">
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
              {ottData.length > 0 ? (
                ottData.map((p, i) => (
                  <div key={p._id || i} className="group p-6 bg-gradient-to-br from-white/5 to-transparent border border-gray-800 rounded-2xl transition-all duration-500 hover:border-gray-700">
                    <div className="flex items-start justify-between">
                      <h3 className="text-white font-semibold">{p.platformName}</h3>
                      <div className="flex items-center gap-2">
                        {activityIcon(p.statusLabel)}
                        <span className={`text-sm font-semibold ${activityColor(p.statusLabel)}`}>{p.statusLabel}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-3 mt-1">
                      Average deal value:{" "}
                      <span className="text-white font-semibold">{p.averageDealValue}</span>{" "}
                      <span className="text-gray-500">per title</span>
                    </div>
                    <div className="mt-2 relative">
                      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-3 rounded-full ${getOttBarColor(p.platformName)}`} 
                          style={{ width: `${p.marketShare}%` }} 
                        />
                      </div>
                      <div className="absolute -top-8 right-0 text-white font-bold text-sm">{p.marketShare}%</div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <span className="text-gray-500 text-sm">Market Share</span>
                      <a 
                        href={p.detailsLink || "#"} 
                        className="text-sm text-gray-400 hover:text-white transition-colors font-semibold inline-flex items-center gap-1"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))
              ) : !loading && (
                <div className="p-10 text-center border border-gray-800 rounded-2xl text-gray-500">
                  No OTT intelligence data available.
                </div>
              )}
              <Link 
                href="/ott-insights"
                className="w-full py-5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-2 border-blue-600/30 text-blue-500 rounded-2xl hover:from-blue-600/20 hover:to-purple-600/20 transition-all font-bold text-lg inline-flex items-center justify-center"
              >
                Explore OTT Platform Insights →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
