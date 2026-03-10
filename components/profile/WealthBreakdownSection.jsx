"use client";

export default function WealthBreakdownSection({ celebrity }) {
  const name = celebrity?.name || "Shah Rukh Khan";

  // Static data - will be replaced by API
  const breakdownItems = [
    {
      icon: "🎬",
      iconBg: "bg-blue-500",
      title: "Film Earnings",
      percentage: 41,
      amount: "$320M",
      barColor: "bg-blue-500",
    },
    {
      icon: "📢",
      iconBg: "bg-purple-500",
      title: "Brand Endorsements",
      percentage: 23,
      amount: "$180M",
      barColor: "bg-gradient-to-r from-blue-500 to-purple-500",
      highlight: true,
    },
    {
      icon: "💼",
      iconBg: "bg-green-500",
      title: "Business Ventures",
      percentage: 18,
      amount: "$140M",
      barColor: "bg-green-500",
    },
    {
      icon: "🏏",
      iconBg: "bg-orange-500",
      title: "IPL Team Ownership",
      percentage: 12,
      amount: "$90M",
      barColor: "bg-cyan-500",
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <span className="text-white">{name} </span>
            <span className="text-purple-400">Wealth Breakdown</span>
          </h2>
          <p className="text-gray-500 mt-2">
            Comprehensive analysis of income sources and asset distribution
          </p>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-4">
          {breakdownItems.map((item, index) => (
            <div
              key={index}
              className={`bg-[#141824] rounded-xl border p-4 sm:p-6 transition-all duration-300 cursor-pointer group ${
                item.highlight
                  ? "border-purple-500/50 hover:border-purple-500"
                  : "border-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icon & Title */}
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <span className="text-xl sm:text-2xl">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    {/* Progress Bar */}
                    <div className="w-full max-w-md">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.barColor} rounded-full transition-all duration-700`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.percentage}% of total wealth
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount & Link */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-cyan-400">
                    {item.amount}
                  </span>
                  <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer">
                    Read detailed analysis
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
