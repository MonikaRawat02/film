"use client";

import { ShieldCheck, User, FileCheck, Calendar, Database, BookOpen } from "lucide-react";

export default function EditorialTrustSection({ celebrity }) {
  const lastUpdated = celebrity?.netWorth?.lastUpdated 
    ? new Date(celebrity.netWorth.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : "February 23, 2025";

  const trustInfo = [
    {
      icon: <User className="w-5 h-5 text-blue-400" />,
      iconBg: "bg-blue-500/10",
      label: "Author",
      value: "FilmyFire Research Team",
      subtext: "Celebrity Intelligence Specialists",
    },
    {
      icon: <FileCheck className="w-5 h-5 text-purple-400" />,
      iconBg: "bg-purple-500/10",
      label: "Financial Reviewer",
      value: "Industry Expert Panel",
      subtext: "Certified Financial Analysts",
    },
    {
      icon: <Calendar className="w-5 h-5 text-green-400" />,
      iconBg: "bg-green-500/10",
      label: "Last Updated",
      value: lastUpdated,
      subtext: "Updated Monthly",
    },
    {
      icon: <Database className="w-5 h-5 text-yellow-400" />,
      iconBg: "bg-yellow-500/10",
      label: "Sources",
      value: "25+ Verified Sources",
      subtext: "Public Records & Reports",
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-5xl mx-auto group">
          {/* Glowing Background Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
          
          {/* Trust Card */}
          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-10">
            {/* Header */}
            <div className="flex items-center gap-5 mb-10 pb-6 border-b border-white/10">
              <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Editorial Standards & Trust
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Commitment to accuracy and transparency
                </p>
              </div>
            </div>

            {/* Trust Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 mb-10">
              {trustInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${info.iconBg} flex items-center justify-center flex-shrink-0 border border-white/5`}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{info.label}</p>
                    <p className="text-sm font-medium text-slate-400 leading-tight mb-0.5">{info.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{info.subtext}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Methodology Link */}
            <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-all mb-8 group/link">
              <BookOpen className="w-4 h-4" />
              <span className="font-medium tracking-wide">Read Our Research Methodology</span>
            </button>

            {/* Disclaimer */}
            <div className="bg-slate-950/50 rounded-2xl border border-white/5 p-5">
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-300 mr-1.5">Disclaimer:</span> 
                All net worth figures are estimates based on publicly available information from credible sources including Forbes, Celebrity Net Worth, industry reports, and official statements. Actual net worth may vary. FilmyFire makes reasonable efforts to ensure accuracy but cannot guarantee completeness. This content is for informational purposes only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
