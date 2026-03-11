"use client";

export default function RelatedIntelligenceSection({ celebrity }) {
  if (!celebrity) return null;

  const relatedData = celebrity.relatedIntelligence || [];
  const icons = ["💰", "🏠", "📈", "👤", "🏢", "⭐", "🏏", "🎬"];
  const iconBgs = ["bg-blue-500", "bg-gray-600", "bg-green-500", "bg-orange-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500", "bg-orange-500"];
  const tagColors = ["bg-red-500", "bg-cyan-500", "bg-green-500", "bg-orange-500", "bg-red-500", "bg-cyan-500", "bg-purple-500", "bg-green-500"];

  const articles = relatedData.map((item, index) => ({
    icon: icons[index % icons.length],
    iconBg: iconBgs[index % iconBgs.length],
    tag: item.category,
    tagColor: tagColors[index % tagColors.length],
    title: item.title,
    description: item.description,
    highlight: index === 2
  }));

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
