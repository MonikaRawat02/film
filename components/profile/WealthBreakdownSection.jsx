"use client";
import { Film, Megaphone, Trophy, House } from "lucide-react";

export default function WealthBreakdownSection({ celebrity }) {
  if (!celebrity) return null;

  const name = celebrity.heroSection?.name || "Unknown";
  const incomeSources = celebrity.netWorthCalculation?.incomeSources || [];
  const totalNetWorth = celebrity.netWorth?.netWorthUSD?.max || celebrity.netWorth?.netWorthUSD?.min || 0;

  const icons = [Film, Megaphone, Trophy, House];
  const colors = ["from-blue-500 to-blue-600", "from-purple-500 to-purple-600", "from-green-500 to-green-600", "from-orange-500 to-orange-600"];
  const barColors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500"];

  const breakdownItems = incomeSources.map((source, index) => {
    const amountVal = totalNetWorth ? (totalNetWorth * (source.percentage / 100)) : 0;
    const amountDisplay = amountVal >= 1000000 
      ? `$${(amountVal / 1000000).toFixed(1)}M` 
      : amountVal >= 1000 
        ? `$${(amountVal / 1000).toFixed(1)}K`
        : `$${amountVal}`;

    return {
      Icon: icons[index % icons.length],
      iconBg: colors[index % colors.length],
      title: source.sourceName,
      percentage: source.percentage,
      amount: amountDisplay !== "$0" ? amountDisplay : `${source.percentage}%`,
      barColor: barColors[index % barColors.length],
      description: source.description
    };
  });

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            <span className="text-white">{name} </span>
            <span className="text-transparent bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text">
              Wealth Breakdown
            </span>
          </h2>
          <p className="text-slate-400">
            Comprehensive analysis of income sources and asset distribution
          </p>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-4">
          {breakdownItems.map((item, index) => (
            <div
              key={index}
              className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 lg:p-8 shadow-lg hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                {/* Icon & Title */}
                <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                  <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center flex-shrink-0 ring-1 ring-white/10 group-hover:scale-110 transition-transform`}>
                    {(() => {
                      const Icon = item.Icon;
                      return <Icon className="h-7 w-7 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <div className="w-full max-w-xl">
                      <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.barColor} rounded-full transition-all duration-700`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {item.percentage}% of total wealth
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount & Link */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                  <span className="text-2xl lg:text-3xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
                    {item.amount}
                  </span>
                  <span className="text-sm text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer">
                    Read detailed analysis <span>→</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
