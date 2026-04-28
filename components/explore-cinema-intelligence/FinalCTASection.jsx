"use client";
import { Sparkles, ChevronRight } from "lucide-react";
 
 export default function FinalCTASection() {
  const dots = {
    backgroundImage:
      "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 50%)",
    backgroundSize: "100px 100px",
  };
 
   return (
     <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0" style={dots} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-black" />
       <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-fuchsia-600/20 via-purple-600/10 to-transparent blur-3xl" />
       <div className="absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-gradient-to-bl from-indigo-600/20 via-blue-600/10 to-transparent blur-3xl" />
 
       <div className="relative max-w-4xl mx-auto text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs tracking-wide text-purple-400">
             Powered by Deep Learning &amp; Cinema Analytics
           </span>
         </div>
 
        <h2 className="text-6xl md:text-7xl leading-tight mb-4 font-semibold tracking-tight">
          <span className="block bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Understand Cinema
          </span>
          <span className="block bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
             Beyond Reviews
           </span>
         </h2>
 
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
           Join thousands of cinema enthusiasts exploring deeper narratives, patterns, and
           intelligence behind entertainment.
         </p>
 
        <button className="group relative px-10 py-5 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-red-500 hover:via-purple-500 hover:to-blue-500 rounded-2xl text-lg transition-all shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 inline-flex items-center gap-3">
          <span className="relative z-10">Explore More Intelligence</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
         </button>
       </div>
     </section>
   );
 }
