import { Film, Building2, TrendingUp, BarChart3, Users, Briefcase, Globe, Star } from "lucide-react";

export default function RelatedIntelligenceSection({ celebrity }) {
  if (!celebrity) return null;

  const relatedData = celebrity.relatedIntelligence || [];
  const celebName = celebrity.heroSection?.name || "";

  const getIcon = (category, title) => {
    const text = (category + " " + title).toLowerCase();
    if (text.includes("movie") || text.includes("film")) return Film;
    if (text.includes("business") || text.includes("empire") || text.includes("company")) return Building2;
    if (text.includes("richest") || text.includes("wealth") || text.includes("money")) return TrendingUp;
    if (text.includes("impact") || text.includes("score") || text.includes("rank")) return BarChart3;
    if (text.includes("career") || text.includes("timeline")) return Briefcase;
    if (text.includes("global") || text.includes("world")) return Globe;
    if (text.includes("star") || text.includes("celebrity")) return Star;
    return Users;
  };

  const getIconBg = (index) => {
    const bgs = ["bg-red-500/10 text-red-500", "bg-cyan-500/10 text-cyan-500", "bg-yellow-500/10 text-yellow-500", "bg-blue-500/10 text-blue-500"];
    return bgs[index % bgs.length];
  };

  return (
    <section className="bg-[#050505] py-20 border-t border-gray-900">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Related Intelligence
          </h2>
          <p className="text-gray-500 text-lg font-light">
            Deep dive into {celebName}&apos;s career, business, and impact
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatedData.map((item, index) => {
            const Icon = getIcon(item.category, item.title);
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-800 bg-[#0d0d12] hover:border-gray-700 hover:bg-[#121218] transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-6">
                  {/* Icon Box */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${getIconBg(index)}`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
