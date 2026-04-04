"use client";
import Link from "next/link";

export default function CompareNetWorthSection({ celebrity }) {
  if (!celebrity) return null;
  const name = celebrity.heroSection?.name || "Unknown";
  const baseNetWorth = (celebrity.netWorth?.netWorthUSD?.max || celebrity.netWorth?.netWorthUSD?.min || 0) / 1000000; // in millions
  const slug = celebrity.heroSection?.slug || "";

  const comparisonsData = celebrity.celebrityComparisons?.comparisons || [];
  const comparisons = comparisonsData.map(comp => ({
    name: comp.name,
    netWorth: comp.netWorth / 1000000, // assume raw number in API is in USD
    trend: "down", // default trend
    display: comp.netWorthDisplay
  }));

  const getPercentage = (value) => Math.round((value / baseNetWorth) * 100);
  
  const getBarColor = () => "bg-gradient-to-r from-blue-500 to-purple-500";

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-4xl sm:text-5xl font-bold">
            <span className="text-white">Compare </span>
            <span className="text-purple-400">Net Worth</span>
          </h2>
          <p className="text-gray-500 mt-2">
            How {name}&apos;s wealth compares to other celebrities
          </p>
        </div>

        {/* Base Card: separate block (not nested) */}
        <div className="rounded-2xl border border-[var(--ff-border)] bg-[var(--ff-dark-elevated)] overflow-hidden">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-[var(--ff-border-subtle)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{name}</h3>
                <p className="text-sm text-slate-400">Base Comparison</p>
              </div>
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
                  ${baseNetWorth}M
                </p>
                <p className="text-xs text-slate-400">Net Worth (2025)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Rows: separate list */}
        <div className="space-y-3 mt-4">
            {comparisons.map((celeb, index) => {
              const percentage = getPercentage(celeb.netWorth);
              return (
                <div
                  key={index}
                  className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Name & Progress */}
                    <div className="flex-1">
                      <h4 className="text-base sm:text-lg font-bold text-white mb-3">
                        {celeb.name}
                      </h4>
                      {/* Progress Bar */}
                      <div className="relative h-8 bg-slate-800/50 rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${getBarColor()}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-white/10" />
                        </div>
                        <div className="absolute inset-0 flex items-center px-4">
                          <span className="text-sm font-semibold text-white">
                            {percentage}% of {name}&apos;s net worth
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Net Worth & Link */}
                    <div className="flex-shrink-0 sm:w-48 flex flex-col items-end justify-center gap-1">
                      <div className="flex items-center gap-1 leading-none">
                        <span className="text-xl font-bold text-white">${celeb.netWorth}M</span>
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-all mt-1 cursor-pointer">
                        View Profile
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-arrow-right w-4 h-4"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Compare CTA */}
        <div className="flex justify-center mt-8">
          <Link
            href={slug ? `/celebrity/${slug}/compare` : "#"}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-full hover:from-purple-500 hover:to-purple-400 transition-all duration-300 flex items-center gap-2"
          >
            <span>Compare with Any Celebrity</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
