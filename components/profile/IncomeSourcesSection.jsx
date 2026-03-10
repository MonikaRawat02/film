"use client";

export default function IncomeSourcesSection({ celebrity }) {
  // Static data - will be replaced by API
  const incomeSources = [
    {
      icon: "🎬",
      iconBg: "bg-blue-500",
      title: "Movies Income",
      amount: "$40-60M per film",
      description:
        "One of the highest-paid actors globally, earning from acting fees, profit sharing, and backend deals.",
    },
    {
      icon: "📢",
      iconBg: "bg-purple-500",
      title: "Brand Endorsements",
      amount: "$3-5M per brand",
      description:
        "Endorses 20+ major brands including Hyundai, Tag Heuer, and Dubai Tourism.",
    },
    {
      icon: "🏏",
      iconBg: "bg-orange-500",
      title: "IPL Earnings",
      amount: "$15-20M annually",
      description:
        "Co-owner of Kolkata Knight Riders, one of the most valuable IPL franchises.",
    },
    {
      icon: "💼",
      iconBg: "bg-green-500",
      title: "Business Ventures",
      amount: "$10-15M annually",
      description:
        "Red Chillies Entertainment, VFX studio, and various production investments.",
    },
    {
      icon: "🏠",
      iconBg: "bg-pink-500",
      title: "Real Estate",
      amount: "$50M portfolio",
      description:
        "Luxury properties including iconic Mannat bungalow and international real estate.",
      fullWidth: true,
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <span className="text-white">Income Sources </span>
            <span className="text-green-400">Deep Dive</span>
          </h2>
          <p className="text-gray-500 mt-2">
            Detailed breakdown of revenue streams and earnings
          </p>
        </div>

        {/* Income Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomeSources.map((source, index) => (
            <div
              key={index}
              className={`bg-[#141824] rounded-xl border border-gray-800 p-5 sm:p-6 hover:border-gray-600 transition-all duration-300 cursor-pointer group ${
                source.fullWidth ? "md:col-span-1" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${source.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-xl sm:text-2xl">{source.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    {source.title}
                  </h3>
                  <p className="text-cyan-400 font-bold text-sm sm:text-base mt-1">
                    {source.amount}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                {source.description}
              </p>
              <button className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer">
                Read detailed analysis
                <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
