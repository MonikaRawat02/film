"use client";
import Link from "next/link";

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
    { icon: "✓", text: "Multi-Source Verified", color: "text-cyan-400 border-cyan-400/30" },
    { icon: "✓", text: "Updated Monthly", color: "text-yellow-400 border-yellow-400/30" },
    { icon: "✓", text: "Public Data Based", color: "text-green-400 border-green-400/30" },
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

        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="flex-1 space-y-6 sm:space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold italic">
                <span className="text-cyan-400">{data.name}</span>
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
                <span className="text-yellow-500">Net Worth,</span>
              </h2>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                <span className="text-yellow-500">Biography,</span>
              </h2>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                <span className="text-cyan-400">Income & Assets</span>
              </h2>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                <span className="text-cyan-400">(2025)</span>
              </h2>
            </div>

            {/* AI Quick Summary Card */}
            <div className="bg-[#141824] rounded-2xl border border-gray-800 p-4 sm:p-6 max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm">~</span>
                </div>
                <span className="font-semibold text-white">AI Quick Summary</span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Net Worth</p>
                  <p className="text-lg sm:text-xl font-bold text-red-500">{data.netWorth}</p>
                  <p className="text-xs text-gray-500">(Estimated)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Profession</p>
                  <p className="text-sm sm:text-base font-semibold text-white">{data.profession}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Primary Income</p>
                  <p className="text-sm sm:text-base font-semibold text-white">{data.primaryIncome}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Active Since</p>
                  <p className="text-sm sm:text-base font-semibold text-white">{data.activeSince}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4 italic">
                * AI-generated summary based on public data. Figures are estimates and may vary.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border ${badge.color} bg-black/30`}
                >
                  <span className={badge.color.split(" ")[0]}>{badge.icon}</span>
                  <span className={`text-xs sm:text-sm ${badge.color.split(" ")[0]}`}>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-auto lg:flex-shrink-0">
            <div className="relative w-full sm:w-[400px] lg:w-[450px] aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src={data.image}
                alt={data.name}
                className="w-full h-full object-cover grayscale"
              />
              {data.verified && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-500 rounded-full">
                  <span className="text-white text-sm">✓</span>
                  <span className="text-white text-sm font-medium">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
