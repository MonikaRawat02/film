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

      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f] text-white pt-20 pb-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-red-600/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        </div>

        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 relative z-10">
          
          {/* Section A: Dynamic Hero with Animated Stats */}
          <div className="mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-6">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">Live Streaming Intelligence</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent tracking-tight">
                OTT Intelligence
              </h1>
              <p className="text-xl text-zinc-300 max-w-3xl mx-auto font-medium leading-relaxed">
                Streaming wars, acquisitions & audience trends. The definitive database for the streaming market.
              </p>
            </motion.div>

            {/* Animated Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-zinc-900/50 animate-pulse" />
                ))
              ) : (
                activeKpis.map((kpi, i) => {
                  const Icon = ICON_MAP[kpi.icon];
                  const gradients = [
                    'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
                    'from-green-500/20 to-emerald-500/20 border-green-500/30',
                    'from-red-500/20 to-orange-500/20 border-red-500/30',
                    'from-purple-500/20 to-pink-500/20 border-purple-500/30'
                  ];
                  const iconColors = ['text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400'];
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className={`p-6 rounded-2xl bg-gradient-to-br ${gradients[i]} border backdrop-blur-sm group hover:scale-105 transition-all duration-300`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-zinc-900/50 ${iconColors[i]}`}>
                          {Icon && <Icon className="w-5 h-5" />}
                        </div>
                      </div>
                      <p className="text-xs uppercase font-bold tracking-wider text-zinc-300 mb-2">{kpi.label}</p>
                      <p className="text-3xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-200 group-hover:bg-clip-text transition-all">{kpi.value}</p>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section B: Vibrant Platform Cards with Glow Effects */}
          <div className="mb-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-10"
            >
              <h2 className="text-3xl font-black text-white">Platform Intelligence</h2>
              <div className="h-1 flex-1 bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-transparent mx-6 rounded-full" />
            </motion.div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 rounded-2xl bg-zinc-900/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms.map((platform, index) => {
                  const glowColors = [
                    'hover:shadow-purple-500/20',
                    'hover:shadow-blue-500/20',
                    'hover:shadow-red-500/20',
                    'hover:shadow-cyan-500/20',
                    'hover:shadow-green-500/20',
                    'hover:shadow-orange-500/20'
                  ];
                  const borderColors = [
                    'hover:border-purple-500/50',
                    'hover:border-blue-500/50',
                    'hover:border-red-500/50',
                    'hover:border-cyan-500/50',
                    'hover:border-green-500/50',
                    'hover:border-orange-500/50'
                  ];
                  
                  return (
                    <motion.div
                      key={platform._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/ott/${platform.slug}`} className="group block h-full">
                        <div className={`h-full p-8 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 ${borderColors[index]} ${glowColors[index]} hover:shadow-2xl transition-all duration-500 relative overflow-hidden group`}>                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          {/* Animated chart icon */}
                          <motion.div 
                            className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-opacity"
                            animate={{ rotate: [0, 5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <BarChart3 className="w-28 h-28" />
                          </motion.div>
                          
                          <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-6">
                              <motion.div 
                                className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-700 group-hover:border-zinc-600 transition-all shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                              >
                                {platform.logo ? (
                                  <img src={platform.logo} alt={platform.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="text-3xl font-black bg-gradient-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent">{platform.name[0]}</div>
                                )}
                              </motion.div>
                              <div>
                                <h3 className="text-2xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-blue-300 group-hover:bg-clip-text transition-all">{platform.name}</h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">{platform.tagline || 'Premium Streaming Leader'}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-8">
                              <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/50">
                                <p className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider mb-1">Subscribers</p>
                                <p className="text-xl font-black text-white">{(platform.subscribers / 1000000).toFixed(0)}M</p>
                              </div>
                              <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/50">
                                <p className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider mb-1">India Rank</p>
                                <p className="text-xl font-black text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">#{platform.indiaRank || 'N/A'}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/50">
                                <p className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider mb-1">Avg Deal Size</p>
                                <p className="text-xl font-black text-green-400">{platform.avgDealValue || 'N/A'}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/50">
                                <p className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider mb-1">Market Share</p>
                                <p className="text-xl font-black text-blue-400">{platform.marketShare}%</p>
                              </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-700/50">
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                 <span className="text-xs font-bold text-green-400">+{platform.growthRate}% Growth</span>
                              </div>
                              <span className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-zinc-300 group-hover:text-purple-400 transition-colors">
                                Explore <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section C: Rankings Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-black text-white">Top OTT This Week</h2>
               <div className="h-1 flex-1 bg-gradient-to-r from-blue-500/50 to-transparent mx-6 rounded-full" />
             </div>
             <div className="rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-900/30 border border-zinc-800 overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-zinc-700/50 text-xs uppercase font-black text-zinc-300 tracking-wider bg-zinc-900/50">
                       <th className="px-8 py-5">Rank</th>
                       <th className="px-8 py-5">Platform</th>
                       <th className="px-8 py-5">Market Share</th>
                       <th className="px-8 py-5">Subscribers</th>
                     </tr>
                  </thead>
                  <tbody>
                     {rankings.map((rank, i) => (
                       <motion.tr 
                         key={rank._id} 
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.1 }}
                         className="border-b border-zinc-800/50 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all group"
                       >
                         <td className="px-8 py-5 text-2xl font-black text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">#{rank.rank}</td>
                         <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-sm font-black border border-zinc-700 group-hover:border-purple-500/50 transition-all">
                               {rank.name[0]}
                             </div>
                             <span className="font-black text-lg text-white">{rank.name}</span>
                           </div>
                         </td>
                         <td className="px-8 py-5 font-black text-xl text-blue-400">{rank.marketShare}%</td>
                         <td className="px-8 py-5 font-black text-xl text-zinc-200">{(rank.subscribers / 1000000).toFixed(0)}M</td>
                       </motion.tr>
                     ))}
                  </tbody>
                </table>
             </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
