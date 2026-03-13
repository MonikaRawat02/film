import { useState, useEffect } from "react";
import { Clock, Eye, ArrowRight } from "lucide-react";

export default function TrendingSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/trending-intelligence");
        const data = await res.json();
        if (data.success) {
          setItems(data.data.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to fetch trending intelligence:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Explained": return "bg-purple-600";
      case "Box Office": return "bg-emerald-600";
      case "OTT": return "bg-blue-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <section id="trending-intelligence" className="relative py-28 bg-[#050505]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-600/10 bg-red-600/10 px-5 py-2.5 text-xs md:text-sm">
              <span className="block w-2 h-2 bg-red-600 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-red-500 font-semibold text-sm uppercase tracking-wide">
                Trending Now
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
              Trending Intelligence Pages
            </h2>
            <p className="mx-auto max-w-4xl text-lg md:text-xl font-light text-gray-300">
              Deep explanations, not breaking news
            </p>
          </div>
          <a
            href="/intelligence"
            className="group inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 shadow-sm transition active:scale-95 hover:from-red-500 hover:to-red-600"
          >
            View All Intelligence
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl bg-gray-900 animate-pulse border border-gray-800" />
            ))
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-800/50 bg-[#0F0F14] transition-all hover:border-red-500/30 card-hover"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14] via-transparent to-transparent opacity-90" />
                  
                  {/* Category Badge */}
                  <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-xl ${getCategoryColor(item.category)} text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20`}>
                    {item.category}
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                    <h3 className="text-2xl font-bold text-white leading-tight group-hover:text-red-400 transition-colors">
                      {item.title}
                    </h3>
                    <a
                      href={`/intelligence/${item.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-400 transition-all group/link"
                    >
                      Read Full Intelligence
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
