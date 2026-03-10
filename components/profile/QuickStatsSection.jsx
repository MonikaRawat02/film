"use client";

export default function QuickStatsSection({ celebrity }) {
  // Static data - will be replaced by API
  const stats = [
    {
      icon: "💵",
      iconBg: "bg-green-500",
      label: "Net Worth",
      value: "$780M",
    },
    {
      icon: "📅",
      iconBg: "bg-blue-500",
      label: "Age",
      value: "59 Years",
    },
    {
      icon: "📏",
      iconBg: "bg-yellow-500",
      label: "Height",
      value: "5'8\" (173cm)",
    },
    {
      icon: "🎂",
      iconBg: "bg-orange-500",
      label: "Birth Date",
      value: "Nov 2, 1965",
    },
    {
      icon: "📍",
      iconBg: "bg-red-500",
      label: "Nationality",
      value: "Indian",
    },
    {
      icon: "🏢",
      iconBg: "bg-purple-500",
      label: "Industry",
      value: "Entertainment",
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-8 sm:py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#141824] rounded-xl border border-gray-800 p-4 sm:p-5 hover:border-gray-600 transition-all duration-300 cursor-pointer group"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <span className="text-lg sm:text-xl">{stat.icon}</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-sm sm:text-base font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
