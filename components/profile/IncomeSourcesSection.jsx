"use client";
import { Film, Megaphone, IndianRupee, Building2 } from "lucide-react";

export default function IncomeSourcesSection({ celebrity }) {
  // Static data - will be replaced by API
  const incomeSources = [
    {
      Icon: Film,
      iconBg: "from-blue-500 to-blue-600",
      title: "Movies Income",
      amount: "$40-60M per film",
      description:
        "One of the highest-paid actors globally, earning from acting fees, profit sharing, and backend deals.",
    },
    {
      Icon: Megaphone,
      iconBg: "from-violet-500 to-violet-600",
      title: "Brand Endorsements",
      amount: "$3-5M per brand",
      description:
        "Endorses 20+ major brands including Hyundai, Tag Heuer, and Dubai Tourism.",
    },
    {
      Icon: IndianRupee,
      iconBg: "from-emerald-500 to-emerald-600",
      title: "IPL Earnings",
      amount: "$15-20M annually",
      description:
        "Co-owner of Kolkata Knight Riders, one of the most valuable IPL franchises.",
    },
    {
      Icon: Building2,
      iconBg: "from-cyan-500 to-cyan-600",
      title: "Business Ventures",
      amount: "$10-15M annually",
      description:
        "Red Chillies Entertainment, VFX studio, and various production investments.",
    },
    {
      Icon: Building2,
      iconBg: "from-pink-500 to-pink-600",
      title: "Real Estate",
      amount: "$50M portfolio",
      description:
        "Luxury properties including iconic Mannat bungalow and international real estate.",
      fullWidth: true,
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16 bg-gradient-to-b from-slate-950/0 to-slate-900/10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
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
