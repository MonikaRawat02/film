import { useState, useEffect } from "react";
import Head from "next/head";
import { TrendingUp, Users, DollarSign, Activity, ChevronRight, BarChart3, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const ICON_MAP = {
  Globe: Globe,
  Activity: Activity,
  DollarSign: DollarSign,
  TrendingUp: TrendingUp,
};

export default function OTTIntelligenceHome() {
  const [platforms, setPlatforms] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes, sRes] = await Promise.all([
          fetch("/api/ott"),
          fetch("/api/ott/rankings"),
          fetch("/api/ott/stats")
        ]);
        const [pJson, rJson, sJson] = await Promise.all([
          pRes.json(), 
          rRes.json(),
          sRes.json()
        ]);
        
        if (pJson.success) setPlatforms(pJson.data);
        if (rJson.success) setRankings(rJson.data);
        if (sJson.success) setKpis(sJson.data);
      } catch (error) {
        console.error("Error fetching OTT data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fallbackKpis = [
    { label: "Platforms Tracked", value: "15", icon: "Globe", color: "text-blue-500" },
    { label: "Titles Added (Month)", value: "284", icon: "Activity", color: "text-green-500" },
    { label: "Highest Spending OTT", value: "Netflix", icon: "DollarSign", color: "text-red-500" },
    { label: "Fastest Growing OTT", value: "Prime Video", icon: "TrendingUp", color: "text-amber-500" },
  ];

  const activeKpis = kpis.length > 0 ? kpis : fallbackKpis;

  return (
    <>
      <Head>
        <title>OTT Intelligence | FilmyFire streaming wars, acquisitions & trends</title>
        <meta name="description" content="Deep insights into OTT streaming platforms like Netflix, Prime Video, Disney+, and more. Subscribers, deals, and market trends." />
      </Head>

      <div className="min-h-screen bg-[#050505] text-white pt-20 pb-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          
          {/* Section A: Hero Header */}
          <div className="mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div>
                <h1 className="text-5xl lg:text-7xl font-black mb-4 tracking-tight">OTT Intelligence</h1>
                <p className="text-xl text-zinc-500 max-w-2xl font-medium">
                  Streaming wars, acquisitions & audience trends. The definitive database for the streaming market.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {loading ? (
                   [...Array(4)].map((_, i) => (
                    <div key={i} className="w-40 h-24 rounded-2xl bg-zinc-900/50 animate-pulse" />
                   ))
                ) : (
                  activeKpis.map((kpi, i) => {
                    const Icon = ICON_MAP[kpi.icon];
                    return (
                      <div key={i} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-2">
                        {Icon && <Icon className={`w-5 h-5 ${kpi.color}`} />}
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{kpi.label}</p>
                        <p className="text-xl font-black">{kpi.value}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Section B: OTT Platform Cards Grid */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-400">Platform Intelligence</h2>
              <div className="h-px flex-1 bg-zinc-800 mx-8" />
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 rounded-3xl bg-zinc-900/50 border border-zinc-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms.map((platform) => (
                  <Link href={`/ott/${platform.slug}`} key={platform._id} className="group">
                    <div className="h-full p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 relative overflow-hidden flex flex-col">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                         <BarChart3 className="w-24 h-24" />
                      </div>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden">
                          {platform.logo ? (
                            <img src={platform.logo} alt={platform.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-2xl font-black">{platform.name[0]}</div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black">{platform.name}</h3>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{platform.tagline || 'Premium Streaming Leader'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 mb-8">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Subscribers</p>
                          <p className="text-lg font-black">{(platform.subscribers / 1000000).toFixed(0)}M</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">India Rank</p>
                          <p className="text-lg font-black">#{platform.indiaRank || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Avg Deal Size</p>
                          <p className="text-lg font-black">{platform.avgDealValue || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Market Share</p>
                          <p className="text-lg font-black">{platform.marketShare}%</p>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                           <span className="text-xs font-bold text-green-500">Growth: +{platform.growthRate}%</span>
                        </div>
                        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                          View Details <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Section C: Weekly Rankings & Section D: Compare CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
               <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-400 mb-8">Top OTT This Week</h2>
               <div className="rounded-3xl bg-zinc-900/30 border border-zinc-800 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-zinc-800 text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em]">
                         <th className="px-8 py-5">Rank</th>
                         <th className="px-8 py-5">Platform</th>
                         <th className="px-8 py-5">Market Share</th>
                         <th className="px-8 py-5">Subscribers</th>
                       </tr>
                    </thead>
                    <tbody>
                       {rankings.map((rank, i) => (
                         <tr key={rank._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                           <td className="px-8 py-5 text-xl font-black text-zinc-600">#{rank.rank}</td>
                           <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-black">
                                 {rank.name[0]}
                               </div>
                               <span className="font-bold">{rank.name}</span>
                             </div>
                           </td>
                           <td className="px-8 py-5 font-black">{rank.marketShare}%</td>
                           <td className="px-8 py-5 font-black text-zinc-400">{(rank.subscribers / 1000000).toFixed(0)}M</td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>

            <div className="flex flex-col gap-6">
               <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-400 mb-2">Platform Battle</h2>
               <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-900 border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                     <Activity className="w-32 h-32" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 relative z-10">Compare Platforms</h3>
                  <p className="text-blue-100 mb-8 relative z-10 font-medium">
                    Head-to-head analysis of pricing, content library, and market reach.
                  </p>
                  <Link href="/ott/compare" className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform relative z-10 shadow-xl shadow-black/20">
                    Compare Now
                  </Link>
               </div>

               <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    Market Report
                  </h3>
                  <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                    Download the latest streaming market movement report (Q1 2026).
                  </p>
                  <button className="w-full py-4 rounded-2xl border border-zinc-700 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                    Download Intelligence
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
