 "use client";
 import { Dna, Heart, Brain, Users, Target, Sparkles, Star } from "lucide-react";
 
 export default function MovieDNADiscovery() {
   const metrics = [
     { label: "Emotional Intensity", value: 50, color: "from-pink-500 to-rose-500", icon: Heart },
     { label: "Violence Level", value: 30, color: "from-amber-400 to-orange-500", icon: Target },
     { label: "Psychological Depth", value: 60, color: "from-indigo-500 to-violet-500", icon: Brain },
     { label: "Family Friendliness", value: 70, color: "from-teal-500 to-emerald-500", icon: Users },
     { label: "Complexity Level", value: 40, color: "from-orange-500 to-yellow-500", icon: Sparkles },
   ];
 
   const best = [
     { title: "Inception", score: 94 },
     { title: "The Prestige", score: 89 },
     { title: "Interstellar", score: 87 },
   ];
 
   return (
     <section className="py-16">
       <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b0b12] via-[#141728] to-[#0b0b12] shadow-2xl">
         <div className="absolute -inset-40 pointer-events-none rounded-[2rem] bg-[radial-gradient(100%_60%_at_30%_0%,rgba(255,0,128,.15),transparent_60%),radial-gradient(80%_50%_at_90%_40%,rgba(88,28,135,.15),transparent_60%)]" />
         <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 md:p-12">
           <div>
            <div className="flex items-center gap-3 mb-6">
               <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
                 <Dna className="w-6 h-6" />
               </div>
              <div>
                <h2 className="text-4xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent font-medium tracking-tight">
                  Movie DNA Discovery
                </h2>
                <p className="text-sm text-zinc-400 mt-1">Discover movies based on emotional experience and content DNA</p>
               </div>
             </div>
 
            <div className="space-y-4">
               {metrics.map((m, i) => (
                 <div key={i} className="space-y-2">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                         <m.icon className="w-3.5 h-3.5 text-white/80" />
                       </div>
                      <span className="text-zinc-300">{m.label}</span>
                     </div>
                    <span className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${m.color} shadow-lg text-white text-xs font-semibold`}>
                      {m.value}%
                    </span>
                   </div>
                  <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
                     <div
                       className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                       style={{ width: `${m.value}%` }}
                     />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      defaultValue={m.value}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      readOnly
                      aria-label={m.label}
                    />
                   </div>
                 </div>
               ))}
             </div>
 
            <div className="mt-6">
              <button className="group relative w-full flex items-center justify-center gap-2 px-6 py-5 rounded-2xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-80" />
                <span className="relative z-10 text-lg">Find Matching Movies</span>
                <Sparkles className="relative z-10 w-5 h-5 opacity-90" />
              </button>
            </div>
 
             <div className="mt-6 p-5 rounded-2xl bg-black/30 border border-white/10">
               <div className="flex items-center gap-2 mb-4">
                 <div className="h-8 w-8 grid place-items-center rounded-xl bg-yellow-500/15 border border-yellow-500/30">
                   <Star className="w-4 h-4 text-yellow-400" />
                 </div>
                 <span className="text-sm font-semibold text-zinc-300">Best Matches</span>
               </div>
               <div className="space-y-2">
                 {best.map((b, i) => (
                   <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 bg-white/5 border border-white/10">
                     <span className="text-white">{b.title}</span>
                     <span className="text-emerald-400 font-semibold">{b.score}%</span>
                   </div>
                 ))}
               </div>
             </div>
           </div>
 
          <div className="relative">
            <div className="relative w-full aspect-square rounded-[1.75rem] bg-gradient-to-b from-black/30 to-black/10 border border-white/10 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-2xl animate-pulse" />
               <div className="absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,0,128,.15),transparent_60%),radial-gradient(50%_40%_at_70%_70%,rgba(80,0,255,.15),transparent_60%)]" />
               <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-spin" style={{ animationDuration: "20s" }} />
               <div className="absolute inset-0 flex items-center justify-center">
                 <svg viewBox="0 0 300 300" className="w-[85%] h-[85%]">
                   <defs>
                     <linearGradient id="g1" x1="0" x2="1" y1="0.2" y2="1">
                       <stop offset="0" stopColor="#ff1ea8" />
                       <stop offset="1" stopColor="#6f4cfe" />
                     </linearGradient>
                     <radialGradient id="g2">
                       <stop offset="0" stopColor="rgba(255,0,128,0.6)" />
                       <stop offset="1" stopColor="rgba(111,76,254,0.2)" />
                     </radialGradient>
                   </defs>
                   <g opacity="0.5">
                     <circle cx="150" cy="150" r="40" fill="none" stroke="url(#g1)" strokeWidth="1" />
                     <circle cx="150" cy="150" r="80" fill="none" stroke="url(#g1)" strokeWidth="1" />
                     <circle cx="150" cy="150" r="120" fill="none" stroke="url(#g1)" strokeWidth="1" />
                   </g>
                   <g stroke="url(#g1)" strokeWidth="1" opacity="0.3">
                     <line x1="150" y1="30" x2="150" y2="270" />
                     <line x1="30" y1="150" x2="270" y2="150" />
                     <line x1="60" y1="60" x2="240" y2="240" />
                     <line x1="240" y1="60" x2="60" y2="240" />
                   </g>
                   <polygon
                     points="150,70 210,140 180,200 120,220 90,160"
                     fill="url(#g2)"
                     stroke="url(#g1)"
                     strokeWidth="2"
                   />
                   <g fill="#fff">
                     <circle cx="150" cy="70" r="5" />
                     <circle cx="210" cy="140" r="5" />
                     <circle cx="180" cy="200" r="5" />
                     <circle cx="120" cy="220" r="5" />
                     <circle cx="90" cy="160" r="5" />
                   </g>
                 </svg>
               </div>
               <div className="absolute left-6 top-6 h-8 w-8 grid place-items-center rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300">
                 <Heart className="w-4 h-4" />
               </div>
               <div className="absolute right-6 top-12 h-8 w-8 grid place-items-center rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300">
                 <Target className="w-4 h-4" />
               </div>
               <div className="absolute left-10 bottom-10 h-8 w-8 grid place-items-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                 <Users className="w-4 h-4" />
               </div>
               <div className="absolute right-8 bottom-12 h-8 w-8 grid place-items-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                 <Brain className="w-4 h-4" />
               </div>
             </div>
           </div>
         </div>
       </div>
     </section>
   );
 }
