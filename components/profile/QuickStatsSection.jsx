"use client";
import { DollarSign, Calendar, Ruler, CalendarDays, MapPin, Briefcase } from "lucide-react";

export default function QuickStatsSection({ celebrity }) {
  if (!celebrity) return null;

  const stats = [
    {
      Icon: DollarSign,
      iconBg: "from-amber-500 to-amber-600",
      label: "Net Worth",
      value: celebrity.netWorth?.netWorthUSD?.display || celebrity.netWorth?.netWorthINR?.display || "N/A",
    },
    {
      Icon: Calendar,
      iconBg: "from-blue-500 to-blue-600",
      label: "Age",
      value: celebrity.quickFacts?.age ? `${celebrity.quickFacts.age} Years` : "N/A",
    },
    {
      Icon: Ruler,
      iconBg: "from-green-500 to-green-600",
      label: "Height",
      value: celebrity.heroSection?.height || "N/A",
    },
    {
      Icon: CalendarDays,
      iconBg: "from-purple-500 to-purple-600",
      label: "Birth Date",
      value: celebrity.quickFacts?.birthDate ? new Date(celebrity.quickFacts.birthDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A",
    },
    {
      Icon: MapPin,
      iconBg: "from-orange-500 to-orange-600",
      label: "Nationality",
      value: celebrity.heroSection?.nationality || "N/A",
    },
    {
      Icon: Briefcase,
      iconBg: "from-pink-500 to-pink-600",
      label: "Industry",
      value: celebrity.heroSection?.industry || "N/A",
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-10 sm:py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-6 shadow-lg hover:border-white/20 transition-all duration-300 cursor-pointer group"
            >
              <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ring-1 ring-white/10 shadow`}>
                {(() => {
                  const Icon = stat.Icon;
                  return <Icon className="h-5 w-5 text-white" />;
                })()}
              </div>
              <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
