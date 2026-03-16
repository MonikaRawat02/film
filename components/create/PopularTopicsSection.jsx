 "use client";
 import { Lightbulb, TrendingUp, Eye, Users, Clock, ArrowRight, Loader2 } from "lucide-react";
 import { useState, useEffect } from "react";
 import Link from "next/link";
 
 function TopicCard({ t }) {
   return (
     <div className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-black/30 to-black/10 p-6 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-yellow-500/10 h-full flex flex-col">
       <div className={`pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${t.trending ? "from-yellow-500/15 via-orange-500/10 to-transparent" : "from-white/0 via-white/0 to-white/0"}`} />
       <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
           <div className="h-10 w-10 grid place-items-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
             <Lightbulb className="w-5 h-5" />
           </div>
           {t.trending && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
               <TrendingUp className="w-3.5 h-3.5" />
               <span>Trending</span>
             </div>
           )}
         </div>
 
        <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300 text-white">
          {t.title}
        </h3>
        <p className="text-sm text-zinc-400 mb-5 line-clamp-3 leading-relaxed flex-grow">{t.description}</p>
 
         <div className="flex items-center gap-5 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-5">
           <div className="inline-flex items-center gap-1.5">
             <Eye className="w-3.5 h-3.5" />
             <span>{t.views}</span>
           </div>
           <div className="inline-flex items-center gap-1.5">
             <Clock className="w-3.5 h-3.5" />
             <span>{t.readTime}</span>
           </div>
           <div className="inline-flex items-center gap-1.5">
             <Users className="w-3.5 h-3.5" />
             <span>analysis</span>
           </div>
         </div>
 
        <Link 
          href={`/intelligence/${t.slug}`}
          className="group/btn relative w-full inline-flex items-center justify-between gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          <span className="relative z-10">Read Intelligence</span>
          <span className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-xl border border-white/15 bg-white/10 transition-all group-hover/btn:translate-x-0.5">
             <ArrowRight className="w-4 h-4" />
           </span>
         </Link>
       </div>
     </div>
   );
 }
 
 export default function PopularTopicsSection() {
   const [topics, setTopics] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchTopics = async () => {
       try {
         const res = await fetch("/api/public/popular-topics");
         const data = await res.json();
         if (data.success) setTopics(data.data);
       } catch (error) {
         console.error("Error fetching topics:", error);
       } finally {
         setLoading(false);
       }
     };
     fetchTopics();
   }, []);

   return (
     <section className="py-24">
       <div className="mb-12 flex items-center gap-5">
         <div className="h-14 w-14 grid place-items-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 shadow-xl shadow-yellow-500/5">
           <Lightbulb className="w-7 h-7" />
         </div>
         <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Popular Intelligence Topics</h2>
           <p className="text-gray-400 mt-1 font-medium">Deep insights into cinema trends and patterns</p>
         </div>
       </div>
 
       {loading ? (
         <div className="flex items-center justify-center py-20">
           <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
         </div>
       ) : (
         <>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {topics.map((t) => (
               <TopicCard key={t._id} t={t} />
             ))}
           </div>

           <div className="mt-16 flex justify-center">
             <Link
               href="/intelligence/all-topics"
               className="inline-flex items-center gap-3 px-8 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm font-bold text-white transition-all uppercase tracking-widest active:scale-95"
             >
               Explore All Topics
             </Link>
           </div>
         </>
       )}
     </section>
   );
 }
