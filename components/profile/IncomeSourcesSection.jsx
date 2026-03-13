"use client";
import { Film, Megaphone, IndianRupee, Building2 } from "lucide-react";

export default function IncomeSourcesSection({ celebrity }) {
  if (!celebrity) return null;

  const incomeSourcesData = celebrity.netWorthCalculation?.incomeSources || [];
  const icons = [Film, Megaphone, IndianRupee, Building2];
  const colors = ["from-blue-500 to-blue-600", "from-violet-500 to-violet-600", "from-emerald-500 to-emerald-600", "from-cyan-500 to-cyan-600"];

  const incomeSources = incomeSourcesData.map((source, index) => ({
    Icon: icons[index % icons.length],
    iconBg: colors[index % colors.length],
    title: source.sourceName,
    amount: `${source.percentage}% contribution`,
    description: source.description
  }));

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16 bg-gradient-to-b from-slate-950/0 to-slate-900/10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            <span className="text-white">Income Sources </span>
            <span className="text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">Deep Dive</span>
          </h2>
          <p className="text-slate-400">
            Detailed breakdown of revenue streams and earnings
          </p>
        </div>

        {/* Income Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {incomeSources.map((source, index) => (
            <div
              key={index}
              className={`relative h-full min-h-[220px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 lg:p-8 shadow-lg hover:border-white/20 transition-all duration-300 cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br ${source.iconBg} flex items-center justify-center flex-shrink-0 ring-1 ring-white/10 group-hover:scale-110 transition-transform`}>
                  {(() => {
                    const Icon = source.Icon;
                    return <Icon className="h-6 w-6 text-white" />;
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {source.title}
                  </h3>
                  <p className="text-lg text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text font-bold">
                    {source.amount}
                  </p>
                </div>
              </div>
              <p className="text-slate-400 mb-10 leading-relaxed">
                {source.description}
              </p>
              <span className="absolute bottom-6 right-6 inline-flex items-center gap-1 group-hover:gap-2 transition-all text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                Read detailed analysis
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
