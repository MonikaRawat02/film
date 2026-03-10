"use client";
import Link from "next/link";
import { TrendingUp, CheckCircle } from "lucide-react";

export default function ProfileHeroSection({ celebrity }) {
  // Static data - will be replaced by API
  const data = celebrity || {
    name: "Shah Rukh Khan",
    slug: "shah-rukh-khan",
    image: "/uploads/ShahRukhKhan.jpeg",
    netWorth: "$780 Million",
    profession: "Actor, Producer, Entrepreneur",
    primaryIncome: "Films, Endorsements, IPL Team",
    activeSince: "1988",
    verified: true,
  };

  const trustBadges = [
    { text: "Multi-Source Verified" },
    { text: "Updated Monthly" },
    { text: "Public Data Based" },
  ];

  return (
    <section className="relative min-h-[600px] bg-[#0a0c14]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c14] via-[#0f1220] to-[#0a0c14]" />
      
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 pt-6 pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 sm:mb-12">
          <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
            <span>🏠</span>
            <span>Home</span>
          </Link>
          <span className="text-gray-600">&gt;</span>
          <Link href="/celebrities" className="hover:text-white transition-colors cursor-pointer">
            Celebrities
          </Link>
          <span className="text-gray-600">&gt;</span>
          <span className="text-yellow-500">{data.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Title */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                  {data.name}
                </span>
                <br />
                <span className="text-white">Net Worth, Biography,</span>
                <br />
                <span className="text-white">Income &amp; Assets (2025)</span>
              </h1>
            </div>

            {/* AI Quick Summary Card */}
            <div className="relative w-full bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 ring-1 ring-amber-500/20 p-5 sm:p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-100"> Quick Summary</span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-start">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Net Worth</p>
                  <p className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
                    {data.netWorth}
                  </p>
                  <p className="text-xs text-slate-500">(Estimated)</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Profession</p>
                  <p className="text-lg font-semibold text-white">{data.profession}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Primary Income</p>
                  <p className="text-base font-semibold text-white">{data.primaryIncome}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Active Since</p>
                  <p className="text-lg font-semibold text-white">{data.activeSince}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-white/5 pt-3">
                <p className="text-xs text-slate-500 italic">
                  * AI-generated summary based on public data. Figures are estimates and may vary.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5"
                >
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-slate-300">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5 w-full">
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src={data.image}
                alt={data.name}
                className="w-full h-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {data.verified && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
