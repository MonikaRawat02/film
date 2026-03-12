 "use client";
 import { Lightbulb, TrendingUp, Eye, Users, Clock, ArrowRight } from "lucide-react";
 
 const topics = [
   {
     title: "Why Big Bollywood Films Fail",
     desc: "Analyzing the disconnect between star power and audience expectations in modern blockbusters.",
     stats: { views: "45K", read: "8 min" },
     color: "from-gray-900/80 to-gray-900/40",
     trending: false,
   },
   {
     title: "Why OTT Movies Succeed",
     desc: "Understanding the unique advantages of streaming and how they reshape storytelling.",
     stats: { views: "38K", read: "6 min" },
     color: "from-violet-900/40 to-gray-900/40",
     trending: true,
   },
   {
     title: "How Actors Rebuild Careers",
     desc: "Case studies of comebacks from Akshay Kumar, Shah Rukh Khan and Hollywood stars.",
     stats: { views: "52K", read: "10 min" },
     color: "from-gray-900/80 to-gray-900/40",
     trending: false,
   },
   {
     title: "Why Audiences Reject Remakes",
     desc: "The psychology behind remake fatigue and what makes original content resonate today.",
     stats: { views: "41K", read: "7 min" },
     color: "from-gray-900/80 to-gray-900/40",
     trending: false,
   },
   {
     title: "The Rise of Pan-India Cinema",
     desc: "How regional films are breaking language barriers and creating nationwide phenomena.",
     stats: { views: "67K", read: "9 min" },
     color: "from-amber-900/40 to-gray-900/40",
     trending: true,
   },
   {
     title: "Streaming Wars Impact on Content",
     desc: "How competition among platforms is driving quality and diversity in storytelling.",
     stats: { views: "44K", read: "8 min" },
     color: "from-gray-900/80 to-gray-900/40",
     trending: false,
   },
 ];
 
 function TopicCard({ t }) {
   return (
     <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-black/30 to-black/10 p-6 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-yellow-500/10">
       <div className={`pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${t.trending ? "from-yellow-500/15 via-orange-500/10 to-transparent" : "from-white/0 via-white/0 to-white/0"}`} />
       <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
           <div className="h-10 w-10 grid place-items-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
             <Lightbulb className="w-5 h-5" />
           </div>
           {t.trending && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-xs text-white shadow-lg">
               <TrendingUp className="w-3.5 h-3.5" />
               <span>Trending</span>
             </div>
           )}
         </div>
 
        <h3 className="text-xl mb-3 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300">
          {t.title}
        </h3>
        <p className="text-sm text-zinc-400 mb-5 line-clamp-3 leading-relaxed">{t.desc}</p>
 
         <div className="flex items-center gap-5 text-gray-500 text-xs mb-5">
           <div className="inline-flex items-center gap-1">
             <Eye className="w-4 h-4" />
             <span>{t.stats.views}</span>
           </div>
           <div className="inline-flex items-center gap-1">
             <Clock className="w-4 h-4" />
             <span>{t.stats.read}</span>
           </div>
           <div className="inline-flex items-center gap-1">
             <Users className="w-4 h-4" />
             <span>analysis</span>
           </div>
         </div>
 
        <button className="group/btn relative w-full inline-flex items-center justify-between gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm text-white transition-all overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          <span className="relative z-10">Read Intelligence</span>
          <span className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-xl border border-white/15 bg-white/10 transition-all group-hover/btn:translate-x-0.5">
             <ArrowRight className="w-4 h-4" />
           </span>
         </button>
       </div>
     </div>
   );
 }
 
 export default function PopularTopicsSection() {
   return (
     <section className="py-16">
       <div className="flex items-center gap-4 mb-8">
         <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30">
           <Lightbulb className="w-7 h-7" />
         </div>
         <div>
           <h2 className="text-4xl text-white">Popular Intelligence Topics</h2>
           <p className="text-sm text-zinc-400">Deep insights into cinema trends and patterns</p>
         </div>
       </div>
 
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {topics.map((t, i) => (
           <TopicCard key={i} t={t} />
         ))}
       </div>
 
       <div className="mt-10 flex justify-center">
         <button className="px-6 py-3 rounded-2xl border border-white/10 bg-black/40 text-white font-semibold hover:bg-white/10 transition-all">
           Explore All Topics
         </button>
       </div>
     </section>
   );
 }
