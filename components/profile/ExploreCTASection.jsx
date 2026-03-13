"use client";

export default function ExploreCTASection({ celebrity }) {
  if (!celebrity) return null;
  const premium = celebrity.premiumIntelligence || {};
  
  const stats = [
    { value: premium.stats?.celebrityProfiles || "500+", label: "Celebrity Profiles" },
    { value: premium.stats?.monthlyReaders || "50K+", label: "Monthly Readers" },
    { value: premium.stats?.accuracyRate ? `${premium.stats.accuracyRate}%` : "95%", label: "Accuracy Rate" },
  ];

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c14] via-purple-900/20 to-[#0a0c14]" />
      
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
          <span className="text-purple-400">📈</span>
          <span className="text-sm font-medium text-purple-400">Premium Celebrity Intelligence</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          {premium.title || "Explore More Celebrity"}
        </h2>
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-400 mb-6">
          Net Worth Intelligence
        </h3>

        {/* Description */}
        <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
          {premium.description || "Discover comprehensive wealth analysis, income breakdowns, and lifestyle insights for your favorite celebrities and industry leaders."}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white font-semibold rounded-full hover:from-cyan-400 hover:to-cyan-300 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
            <span>📈</span>
            {premium.primaryCTA?.label || "View Richest Actors"}
            <span>→</span>
          </button>
          <button className="w-full sm:w-auto px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-gray-700">
            <span>👥</span>
            Browse by Industry
          </button>
          <button className="w-full sm:w-auto px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-gray-700">
            <span>🔔</span>
            Get Updates
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className={`text-3xl sm:text-4xl font-bold ${
                index === 0 ? "text-purple-400" : index === 1 ? "text-cyan-400" : "text-yellow-400"
              }`}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
