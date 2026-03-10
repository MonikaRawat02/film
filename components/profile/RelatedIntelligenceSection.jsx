"use client";

export default function RelatedIntelligenceSection({ celebrity }) {
  // Static data - will be replaced by API
  const articles = [
    {
      icon: "💰",
      iconBg: "bg-blue-500",
      tag: "Earnings",
      tagColor: "bg-red-500",
      title: "SRK Income Per Movie",
      description: "How much Shah Rukh Khan charges per film in 2025",
    },
    {
      icon: "🏠",
      iconBg: "bg-gray-600",
      tag: "Real Estate",
      tagColor: "bg-cyan-500",
      title: "Mannat House Details",
      description: "Inside Shah Rukh Khan's iconic Rs 200 crore mansion",
    },
    {
      icon: "📈",
      iconBg: "bg-green-500",
      tag: "Rankings",
      tagColor: "bg-green-500",
      title: "Richest Actors in India",
      description: "Complete list of India's wealthiest actors in 2025",
      highlight: true,
    },
    {
      icon: "👤",
      iconBg: "bg-orange-500",
      tag: "Industry",
      tagColor: "bg-orange-500",
      title: "Bollywood Highest Paid",
      description: "Top 10 highest-paid Bollywood actors and their fees",
    },
    {
      icon: "🏢",
      iconBg: "bg-blue-500",
      tag: "Business",
      tagColor: "bg-red-500",
      title: "SRK Business Ventures",
      description: "All of Shah Rukh Khan's business investments explained",
    },
    {
      icon: "⭐",
      iconBg: "bg-yellow-500",
      tag: "Endorsements",
      tagColor: "bg-cyan-500",
      title: "SRK Brand Endorsements",
      description: "Complete list of brands endorsed by Shah Rukh Khan",
    },
    {
      icon: "🏏",
      iconBg: "bg-purple-500",
      tag: "IPL",
      tagColor: "bg-purple-500",
      title: "KKR Team Net Worth",
      description: "Kolkata Knight Riders valuation and earnings breakdown",
    },
    {
      icon: "🎬",
      iconBg: "bg-orange-500",
      tag: "Projects",
      tagColor: "bg-green-500",
      title: "SRK Upcoming Movies",
      description: "All upcoming Shah Rukh Khan films and expected earnings",
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <span className="text-white">Related </span>
            <span className="text-green-400">Intelligence</span>
          </h2>
          <p className="text-gray-500 mt-2">
            Explore more celebrity wealth insights and analysis
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.map((article, index) => (
            <div
              key={index}
              className={`bg-[#0d1017] rounded-xl border p-5 transition-all duration-300 cursor-pointer group hover:border-gray-600 ${
                article.highlight ? "border-green-500/50" : "border-gray-800"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl ${article.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <span className="text-xl">{article.icon}</span>
              </div>

              {/* Tag */}
              <span
                className={`inline-block px-2 py-1 text-xs font-medium ${article.tagColor} text-white rounded mb-3`}
              >
                {article.tag}
              </span>

              {/* Title & Description */}
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{article.description}</p>

              {/* Link */}
              <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer">
                Read Article
                <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
