import { useState } from "react";
import Head from "next/head";
import PublicLayout from "@/components/PublicLayout";
import { 
  ArrowLeft, Globe, TrendingUp, Users, DollarSign, 
  BarChart3, ShieldCheck, Activity, Star, Info,
  ExternalLink, ChevronRight, AlertTriangle, Lightbulb
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export async function getServerSideProps(context) {
  const { platform: platformSlug } = context.params;
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.BASE_URL;
  const baseUrl = isDevelopment ? 'http://localhost:3000' : process.env.BASE_URL;

  try {
    const [pRes, tRes, aRes] = await Promise.all([
      fetch(`${baseUrl}/api/ott/${platformSlug}`),
      fetch(`${baseUrl}/api/ott/${platformSlug}/trending`),
      fetch(`${baseUrl}/api/ott/${platformSlug}/acquisitions`)
    ]);

    const [pJson, tJson, aJson] = await Promise.all([pRes.json(), tRes.json(), aRes.json()]);

    if (!pJson.success) {
      return { notFound: true };
    }

    return {
      props: {
        platform: pJson.data,
        trending: tJson.data || [],
        acquisitions: aJson.data || [],
        platformSlug
      }
    };
  } catch (error) {
    console.error("OTT Platform Detail Error:", error);
    return { notFound: true };
  }
}

export default function OTTPlatformDetail({ platform, trending, acquisitions, platformSlug }) {
  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];

  return (
    <PublicLayout noPadding={true}>
      <Head>
        <title>{platform.name} Intelligence | FilmyFire OTT Analysis</title>
        <meta name="description" content={`Deep analysis of ${platform.name}. Subscribers, pricing, trending titles, and market share.`} />
      </Head>

      <div className="min-h-screen bg-[#050505] text-white pt-20 pb-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          
          <Link href="/ott" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Intelligence
          </Link>

          {/* Section 1: Hero Banner */}
          <div className="mb-12 p-10 rounded-[3rem] bg-zinc-900/40 border border-zinc-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5">
                <BarChart3 className="w-64 h-64" />
             </div>
             
             <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="w-32 h-32 rounded-[2rem] bg-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl">
                   {platform.logo ? (
                     <img src={platform.logo} alt={platform.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="text-4xl font-black">{platform.name[0]}</div>
                   )}
                </div>
                <div className="flex-1 text-center md:text-left">
                   <h1 className="text-5xl lg:text-7xl font-black mb-2 tracking-tight">{platform.name}</h1>
                   <p className="text-xl text-zinc-500 font-medium mb-6 uppercase tracking-widest">{platform.tagline || 'Premium Global Streaming Leader'}</p>
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <a href={platform.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">
                        Visit Website <ExternalLink className="w-4 h-4" />
                      </a>
                      <Link href={`/ott/compare?one=${platformSlug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 transition-colors">
                        Compare Platform
                      </Link>
                   </div>
                </div>
             </div>
          </div>

          {/* Section 2: Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
             {[
               { label: "Subscribers", value: `${(platform.subscribers / 1000000).toFixed(0)}M`, icon: Users },
               { label: "Countries", value: platform.countries, icon: Globe },
               { label: "Launch Year", value: platform.launchYear, icon: Activity },
               { label: "Monthly Visits", value: `${(platform.monthlyVisits / 1000000000).toFixed(1)}B`, icon: TrendingUp },
               { label: "App Rating", value: platform.appRating, icon: Star },
               { label: "Global Rank", value: `#${platform.rank}`, icon: ShieldCheck },
             ].map((stat, i) => (
               <div key={i} className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center flex flex-col items-center gap-2">
                  <stat.icon className="w-5 h-5 text-zinc-600 mb-1" />
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black tracking-tight">{stat.value}</p>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
             {/* Section 3: Pricing Plans */}
             <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-zinc-800">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-8">Pricing Plans</h2>
                <div className="space-y-4">
                   {platform.pricing?.map((plan, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                        <span className="font-bold text-zinc-400 uppercase tracking-widest text-xs">{plan.plan}</span>
                        <span className="text-xl font-black">{plan.price}</span>
                     </div>
                   ))}
                </div>
             </div>

             {/* Section 4: Content Library Intelligence */}
             <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-zinc-800 lg:col-span-2">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-8">Library Intelligence</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {[
                     { label: "Movies", value: platform.contentLibrary?.movies, color: "text-red-500" },
                     { label: "Series", value: platform.contentLibrary?.series, color: "text-blue-500" },
                     { label: "Anime", value: platform.contentLibrary?.anime, color: "text-purple-500" },
                     { label: "Docs", value: platform.contentLibrary?.docs, color: "text-green-500" },
                     { label: "Indian Titles", value: platform.contentLibrary?.indianTitles, color: "text-amber-500" },
                   ].map((item, i) => (
                     <div key={i} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center gap-1">
                        <span className={`text-2xl font-black ${item.color}`}>{item.value}</span>
                        <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">{item.label}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Section 5: Trending Titles */}
          <div className="mb-12">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500">Trending Titles</h2>
                <div className="h-px flex-1 bg-zinc-800 mx-8" />
             </div>
             <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                {trending.map((title) => (
                  <div key={title._id} className="min-w-[240px] group">
                     <div className="aspect-[2/3] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-4 relative">
                        {title.poster ? (
                          <img src={title.poster} alt={title.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700 font-black">NO IMAGE</div>
                        )}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-xs font-black border border-white/10">
                          {title.rating}
                        </div>
                     </div>
                     <h4 className="text-lg font-black truncate">{title.title}</h4>
                     <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Popularity Score</span>
                        <span className="text-xs font-black text-green-500">+{title.watchTrend}%</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
             {/* Section 6: Genre Strength */}
             <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-zinc-800">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-8">Genre Strength</h2>
                <div className="space-y-6">
                   {platform.genreStrength?.map((genre, i) => (
                     <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{genre.genre}</span>
                           <span className="text-xs font-black">{genre.score}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             whileInView={{ width: `${genre.score}%` }}
                             transition={{ duration: 1, ease: "easeOut" }}
                             className="h-full bg-red-600 rounded-full" 
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Section 7: Regional Performance */}
             <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-zinc-800">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-8">Regional Performance</h2>
                <div className="rounded-3xl border border-zinc-800 overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-zinc-800/30 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                         <tr>
                            <th className="px-6 py-4">Region</th>
                            <th className="px-6 py-4">Market Strength</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                         {platform.regions?.map((region, i) => (
                           <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4 font-bold">{region.region}</td>
                              <td className="px-6 py-4">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                   region.strength === 'High' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                   region.strength === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                   'bg-red-500/10 text-red-500 border border-red-500/20'
                                 }`}>
                                    {region.strength}
                                 </span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

          {/* Section 8: Acquisition Activity */}
          <div className="mb-12">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500">Acquisition Activity</h2>
                <div className="h-px flex-1 bg-zinc-800 mx-8" />
             </div>
             <div className="rounded-[2.5rem] bg-zinc-900/30 border border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-zinc-800/30 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <tr>
                         <th className="px-8 py-5">Title</th>
                         <th className="px-8 py-5">Language</th>
                         <th className="px-8 py-5">Deal Value</th>
                         <th className="px-8 py-5">Date</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-800">
                      {acquisitions.map((item) => (
                        <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                           <td className="px-8 py-5 font-bold text-lg">{item.title}</td>
                           <td className="px-8 py-5 font-black uppercase tracking-widest text-xs text-zinc-500">{item.language}</td>
                           <td className="px-8 py-5 font-black text-white">{item.dealValue}</td>
                           <td className="px-8 py-5 text-zinc-600 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
             {/* Section 9: Revenue Intelligence */}
             <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-zinc-800">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-8">Revenue Intelligence</h2>
                <div className="grid grid-cols-3 gap-4 mb-10">
                   <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center">
                      <p className="text-[9px] uppercase font-black text-zinc-500 tracking-widest mb-2">Monthly Rev</p>
                      <p className="text-xl font-black">{platform.revenue?.monthly}</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center">
                      <p className="text-[9px] uppercase font-black text-zinc-500 tracking-widest mb-2">ARPU</p>
                      <p className="text-xl font-black">{platform.revenue?.arpu}</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center">
                      <p className="text-[9px] uppercase font-black text-zinc-500 tracking-widest mb-2">Growth YoY</p>
                      <p className="text-xl font-black text-green-500">{platform.revenue?.growthYoY}</p>
                   </div>
                </div>
                <div className="h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Q1', rev: 3.1 },
                        { name: 'Q2', rev: 3.2 },
                        { name: 'Q3', rev: 3.4 },
                        { name: 'Q4', rev: 3.5 },
                      ]}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                         <XAxis dataKey="name" stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
                         <YAxis stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
                         <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                         <Bar dataKey="rev" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Section 10: Audience Demographics */}
             <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-zinc-800">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-8">Audience Demographics</h2>
                <div className="h-[300px] flex items-center">
                   <div className="flex-1 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                              data={platform.demographics}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="share"
                              nameKey="group"
                            >
                               {platform.demographics?.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                               ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                         </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="flex-1 space-y-4">
                      {platform.demographics?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                           <span className="text-xs font-bold text-zinc-400">{item.group}</span>
                           <span className="text-sm font-black ml-auto">{item.share}%</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Section 11: Producer Opportunity Insights */}
             <div className="p-10 rounded-[3rem] bg-green-900/10 border border-green-500/20">
                <h2 className="text-xl font-black uppercase tracking-widest text-green-500 mb-8 flex items-center gap-3">
                   <Lightbulb className="w-6 h-6" /> Producer Opportunity
                </h2>
                <div className="space-y-4">
                   {platform.producerInsights?.map((insight, i) => (
                     <div key={i} className="flex items-start gap-4 p-5 rounded-3xl bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-black font-black text-[10px] shrink-0">✔</div>
                        <p className="font-bold text-green-100">{insight}</p>
                     </div>
                   ))}
                </div>
             </div>

             {/* Section 12: Risks */}
             <div className="p-10 rounded-[3rem] bg-red-900/10 border border-red-500/20">
                <h2 className="text-xl font-black uppercase tracking-widest text-red-500 mb-8 flex items-center gap-3">
                   <AlertTriangle className="w-6 h-6" /> Strategic Risks
                </h2>
                <div className="space-y-4">
                   {platform.risks?.map((risk, i) => (
                     <div key={i} className="flex items-start gap-4 p-5 rounded-3xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-black font-black text-[10px] shrink-0">⚠</div>
                        <p className="font-bold text-red-100">{risk}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Section 13: Competitor Compare CTA */}
          <div className="mt-20 p-12 rounded-[4rem] bg-gradient-to-br from-zinc-800 to-black border border-white/5 text-center">
             <h2 className="text-4xl font-black mb-4">Market Position Comparison</h2>
             <p className="text-zinc-500 mb-10 max-w-xl mx-auto">
               Compare {platform.name}'s originals, pricing, and reach against other major streaming players.
             </p>
             <div className="flex flex-wrap justify-center gap-4">
                <Link href={`/ott/compare?one=${platformSlug}&two=prime-video`} className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-2xl">
                   Compare vs Prime Video
                </Link>
                <Link href={`/ott/compare?one=${platformSlug}&two=disney-plus`} className="px-8 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-zinc-700 hover:bg-zinc-700 transition-colors">
                   Compare vs Disney+
                </Link>
             </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
