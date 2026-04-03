"use client";

import { useState } from "react";
import { TrendingUp, Users, Bell, ArrowRight } from "lucide-react";
import RichestActorsModal from "./RichestActorsModal";

export default function ExploreCTASection({ celebrity }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!celebrity) return null;
  const premium = celebrity.premiumIntelligence || {};
  
  const stats = [
    { 
      value: premium.stats?.celebrityProfiles || "500+", 
      label: "Celebrity Profiles", 
      gradient: "from-blue-400 to-blue-600" 
    },
    { 
      value: premium.stats?.monthlyReaders || "50K+", 
      label: "Monthly Readers", 
      gradient: "from-purple-400 to-purple-600" 
    },
    { 
      value: premium.stats?.accuracyRate ? `${premium.stats.accuracyRate}%` : "95%", 
      label: "Accuracy Rate", 
      gradient: "from-amber-400 to-amber-600" 
    },
  ];

  return (
    <>
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-16 text-center">
            {/* Background Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-amber-600/20" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-xl" />
            
            {/* Decorative Glowing Circles */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">Premium Celebrity Intelligence</span>
              </div>

              {/* Heading */}
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                {premium.title || "Explore More Celebrity"}
                <br />
                <span className="text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text">
                  Net Worth Intelligence
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                {premium.description || "Discover comprehensive wealth analysis, income breakdowns, and lifestyle insights for your favorite celebrities and industry leaders."}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 cursor-pointer shadow-lg shadow-purple-500/20 w-full sm:w-auto h-14"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>{premium.primaryCTA?.label || "View Richest Actors"}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 cursor-pointer w-full sm:w-auto h-14">
                  <Users className="w-5 h-5 text-white" />
                  Browse by Industry
                </button>
                
                <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 cursor-pointer w-full sm:w-auto h-14">
                  <Bell className="w-5 h-5 text-white" />
                  Get Updates
                </button>
              </div>

              {/* Divider Line */}
              <div className="w-full max-w-2xl mx-auto h-px bg-white/5 mb-12" />

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-24">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className={`text-3xl font-bold text-transparent bg-gradient-to-r ${stat.gradient} bg-clip-text mb-1`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <RichestActorsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
