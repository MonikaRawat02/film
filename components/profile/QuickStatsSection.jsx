"use client";
import { useState } from "react";
import { DollarSign, Calendar, Ruler, CalendarDays, MapPin, Briefcase } from "lucide-react";

export default function QuickStatsSection({ celebrity }) {
  if (!celebrity) return null;

  const stats = [
    {
      Icon: DollarSign,
      color: "#f59e0b", // Amber
      label: "Net Worth",
      value: celebrity.netWorth?.netWorthUSD?.display || celebrity.netWorth?.netWorthINR?.display || "N/A",
    },
    {
      Icon: Calendar,
      color: "#3b82f6", // Blue
      label: "Age",
      value: celebrity.quickFacts?.age ? `${celebrity.quickFacts.age} Years` : "N/A",
    },
    {
      Icon: Ruler,
      color: "#8b5cf6", // Purple
      label: "Height",
      value: celebrity.heroSection?.height || "N/A",
    },
    {
      Icon: CalendarDays,
      color: "#10b981", // Green
      label: "Birth Date",
      value: celebrity.quickFacts?.birthDate ? new Date(celebrity.quickFacts.birthDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A",
    },
    {
      Icon: MapPin,
      color: "#f97316", // Orange
      label: "Nationality",
      value: celebrity.heroSection?.nationality || "N/A",
    },
    {
      Icon: Briefcase,
      color: "#ec4899", // Pink
      label: "Industry",
      value: celebrity.heroSection?.industry || "N/A",
    },
  ];

  const [hoverIndex, setHoverIndex] = useState(-1);

  return (
    <section className="bg-[#0a0c14] py-10 sm:py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(-1)}
              style={{
                borderColor: hoverIndex === index ? stat.color : "rgba(255,255,255,0.05)",
                boxShadow: hoverIndex === index ? `0 0 25px ${stat.color}66` : "none",
                transform: hoverIndex === index ? "translateY(-4px)" : "none",
              }}
              className="relative bg-[#0d111c] rounded-2xl border p-5 transition-all duration-300 cursor-pointer group"
            >
              <div 
                style={{ backgroundColor: stat.color }}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-black/20"
              >
                {(() => {
                  const Icon = stat.Icon;
                  return <Icon className="h-5 w-5 text-white" />;
                })()}
              </div>
              <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-white tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
