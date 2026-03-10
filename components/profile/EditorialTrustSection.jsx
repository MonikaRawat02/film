"use client";

export default function EditorialTrustSection() {
  const trustInfo = [
    {
      icon: "👤",
      iconBg: "bg-green-500",
      label: "Author",
      value: "FilmyFire Research Team",
      subtext: "Celebrity Intelligence Specialists",
    },
    {
      icon: "📊",
      iconBg: "bg-purple-500",
      label: "Financial Reviewer",
      value: "Industry Expert Panel",
      subtext: "Certified Financial Analysts",
    },
    {
      icon: "📅",
      iconBg: "bg-green-500",
      label: "Last Updated",
      value: "February 23, 2025",
      subtext: "Updated Monthly",
    },
    {
      icon: "📚",
      iconBg: "bg-orange-500",
      label: "Sources",
      value: "25+ Verified Sources",
      subtext: "Public Records & Reports",
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        {/* Trust Card */}
        <div className="bg-[#0d1017] rounded-2xl border border-gray-800 p-6 sm:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">✓</span>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-green-400">
                Editorial Standards & Trust
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Commitment to accuracy and transparency
              </p>
            </div>
          </div>

          {/* Trust Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {trustInfo.map((info, index) => (
              <div key={index} className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg ${info.iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-lg">{info.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{info.label}</p>
                  <p className="text-sm sm:text-base font-semibold text-white">{info.value}</p>
                  <p className="text-xs text-gray-500">{info.subtext}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Methodology Link */}
          <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6 cursor-pointer">
            <span>📖</span>
            <span className="text-sm font-medium">Read Our Research Methodology</span>
          </button>

          {/* Disclaimer */}
          <div className="bg-[#0a0c14] rounded-xl border border-gray-800 p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold text-gray-400">Disclaimer:</span> All net worth figures are estimates based on publicly available information from credible sources including Forbes, Celebrity Net Worth, industry reports, and official statements. Actual net worth may vary. FilmyFire makes reasonable efforts to ensure accuracy but cannot guarantee completeness. This content is for informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
