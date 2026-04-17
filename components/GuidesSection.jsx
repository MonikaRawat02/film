import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Star, Users, ArrowRight } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

export default function GuidesSection() {
  const [guides, setGuides] = useState([]);
  const [expandedGuides, setExpandedGuides] = useState({});

  const toggleExpand = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedGuides((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await fetch("/api/public/recent-guides");
        const data = await res.json();
        if (data.success) {
          setGuides(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch recent guides:", error);
      }
    };
    fetchGuides();
  }, []);

  const formatReaders = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M readers`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K readers`;
    return `${views} readers`;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-[#050505] via-red-950/5 to-[#050505] relative">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600/20 to-orange-600/10 border border-red-600/30 rounded-full">
            <BookOpen className="w-4 h-4 text-red-500" />
            <span className="text-red-500 text-sm font-bold uppercase tracking-wider">
              Premium Authority Content
            </span>
          </div>
          <h2
            className="text-white mb-6"
            style={{
              ...playfair.style,
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: "48px",
              lineHeight: "60px",
              fontWeight: 800,
            }}
          >
            Ultimate Movie & Series Guides
          </h2>
          <p className="text-gray-400 text-xl leading-relaxed max-w-3xl mx-auto">
            Evergreen reference content crafted for serious film enthusiasts and researchers
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {guides.map((g, i) => (
            <Link
              key={i}
              href={`/category/${g.category.toLowerCase()}/${g.slug}`}
              className="group block relative rounded-2xl border border-red-800/30 bg-[#121112] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none bg-gradient-to-l from-red-900/10 to-transparent" />
              <div className="relative p-8 md:p-10 pl-12">
                <div className="flex items-center gap-4 flex-wrap text-xs">
                  <span className="px-3 py-1 rounded-lg bg-red-600/10 border border-red-600/30 text-red-400 font-bold tracking-wide uppercase">
                    {g.category}
                  </span>
                  {/* <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{g.stats?.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4" />
                    <span>{g.stats?.rating}</span>
                  </div> */}
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{formatReaders(g.stats?.views || 0)}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl text-white font-bold leading-tight mb-4 transition-colors group-hover:text-red-500">
                      {g.title?.replace(" (null)", "").replace("(null)", "")}
                    </h3>
                    <p className="mt-0 text-gray-400 text-lg leading-relaxed max-w-3xl">
                      {expandedGuides[i] || (g.summary?.length || 0) <= 200
                        ? g.summary
                        : `${g.summary.slice(0, 200)}...`}
                      {(g.summary?.length || 0) > 200 && (
                        <button
                          onClick={(e) => toggleExpand(e, i)}
                          className="ml-2 text-red-500 hover:text-red-400 text-sm font-medium transition-colors focus:outline-none"
                        >
                          {expandedGuides[i] ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg hover:from-red-700 hover:to-red-800 transition-colors">
                      Read Complete Guide
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:hidden">
                  <div className="w-full group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg hover:from-red-700 hover:to-red-800 transition-colors">
                    Read Complete Guide
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 left-0 w-[4px] bg-red-600/40" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
