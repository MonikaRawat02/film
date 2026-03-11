"use client";

export default function CompareNetWorthSection({ celebrity }) {
  if (!celebrity) return null;
  const name = celebrity.heroSection?.name || "Unknown";
  const baseNetWorth = (celebrity.netWorth?.netWorthUSD?.max || celebrity.netWorth?.netWorthUSD?.min || 0) / 1000000; // in millions

  const comparisonsData = celebrity.celebrityComparisons?.comparisons || [];
  const comparisons = comparisonsData.map(comp => ({
    name: comp.name,
    netWorth: comp.netWorth / 1000000, // assume raw number in API is in USD
    trend: "down", // default trend
    display: comp.netWorthDisplay
  }));

  const getPercentage = (value) => Math.round((value / baseNetWorth) * 100);
  
  const getBarColor = (percentage) => {
    if (percentage >= 100) return "bg-gradient-to-r from-green-500 to-emerald-400";
    if (percentage >= 70) return "bg-gradient-to-r from-purple-500 to-purple-400";
    if (percentage >= 50) return "bg-gradient-to-r from-purple-600 to-purple-500";
    if (percentage >= 40) return "bg-gradient-to-r from-blue-500 to-cyan-400";
    return "bg-gradient-to-r from-yellow-500 to-orange-400";
  };

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <span className="text-white">Compare </span>
            <span className="text-purple-400">Net Worth</span>
          </h2>
          <p className="text-gray-500 mt-2">
            How {name}&apos;s wealth compares to other celebrities
          </p>
        </div>

        {/* Comparison Container */}
        <div className="bg-[#0d1017] rounded-2xl border border-gray-800 overflow-hidden">
          {/* Base Celebrity */}
          <div className="p-4 sm:p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{name}</h3>
                <p className="text-sm text-orange-400">Base Comparison</p>
              </div>
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-bold text-cyan-400">${baseNetWorth}M</p>
                <p className="text-xs text-gray-500">Net Worth (2025)</p>
              </div>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-gray-800/50">
            {comparisons.map((celeb, index) => {
              const percentage = getPercentage(celeb.netWorth);
              return (
                <div
                  key={index}
                  className="p-4 sm:p-6 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Name & Progress */}
                    <div className="flex-1">
                      <h4 className="text-base sm:text-lg font-semibold text-white mb-3">
                        {celeb.name}
                      </h4>
                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="h-7 sm:h-8 bg-gray-800/50 rounded-lg overflow-hidden">
                          <div
                            className={`h-full ${getBarColor(percentage)} rounded-lg transition-all duration-700 flex items-center`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          >
                            <span className="text-xs font-medium text-white ml-3 whitespace-nowrap">
                              {percentage}% of SRK&apos;s net worth
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Net Worth & Link */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:w-32">
                      <div className="flex items-center gap-1">
                        <span className="text-lg sm:text-xl font-bold text-white">
                          ${celeb.netWorth}M
                        </span>
                        {celeb.trend === "up" ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                      </div>
                      <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer">
                        View Profile
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compare CTA */}
        <div className="flex justify-center mt-8">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-full hover:from-purple-500 hover:to-purple-400 transition-all duration-300 flex items-center gap-2 cursor-pointer">
            Compare with Any Celebrity
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
