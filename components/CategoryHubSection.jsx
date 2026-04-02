import { useState, useEffect } from "react";
import { Film, Clapperboard, Tv, PlaySquare, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function CategoryHubSection() {
  const [counts, setCounts] = useState({
    Bollywood: 0,
    Hollywood: 0,
    WebSeries: 0,
    OTT: 0,
    BoxOffice: 0,
    Celebrities: 0,
  });
  const [celebrityPreview, setCelebrityPreview] = useState([]);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/public/category-counts");
        const data = await res.json();
        if (data.success) {
          setCounts(data.counts);
        }
      } catch (error) {
        console.error("Failed to fetch category counts", error);
      }
    }
    
    async function fetchCelebrityPreview() {
      try {
        const res = await fetch("/api/public/celebrities");
        const data = await res.json();
        if (data.success) {
          setCelebrityPreview(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch celebrity preview", error);
      }
    }

    fetchCounts();
    fetchCelebrityPreview();
  }, []);

  const categories = [
    {
      title: "Bollywood",
      subtitle: "Hindi cinema intelligence",
      count: `${counts.Bollywood.toLocaleString()}+ Articles`,
      icon: Clapperboard,
      iconBg: "from-red-600 via-orange-600 to-pink-600",
      border: "from-orange-500 via-amber-500 to-pink-600",
      textGrad: "from-orange-400 to-pink-500",
      category: "bollywood",
    },
    {
      title: "Hollywood",
      subtitle: "International films analyzed",
      count: `${counts.Hollywood.toLocaleString()}+ Articles`,
      icon: Film,
      iconBg: "from-blue-600 via-purple-600 to-pink-600",
      border: "from-blue-600 via-purple-600 to-pink-600",
      textGrad: "from-blue-400 to-pink-500",
      category: "hollywood",
    },
    {
      title: "Web Series",
      subtitle: "Episodic content breakdown",
      count: `${counts.WebSeries.toLocaleString()}+ Articles`,
      icon: Tv,
      iconBg: "from-emerald-600 via-teal-600 to-cyan-600",
      border: "from-emerald-500 via-teal-500 to-cyan-500",
      textGrad: "from-emerald-400 to-cyan-500",
      category: "webseries",
    },
    {
      title: "OTT Platforms",
      subtitle: "Streaming intelligence",
      count: `${counts.OTT.toLocaleString()}+ Articles`,
      icon: PlaySquare,
      iconBg: "from-rose-600 via-red-600 to-orange-600",
      border: "from-rose-500 via-red-500 to-orange-500",
      textGrad: "from-rose-400 to-orange-500",
      category: "ott",
    },
    {
      title: "Box Office",
      subtitle: "Revenue & verdict analysis",
      count: `${counts.BoxOffice.toLocaleString()}+ Articles`,
      icon: TrendingUp,
      iconBg: "from-amber-600 via-orange-600 to-red-600",
      border: "from-amber-500 via-orange-500 to-red-600",
      textGrad: "from-amber-400 to-red-500",
      category: "box-office",
    },
    {
      title: "Celebrities",
      subtitle: "Verified star profiles",
      count: `${counts.Celebrities.toLocaleString()}+ Profiles`,
      icon: Users,
      iconBg: "from-purple-600 via-indigo-600 to-blue-600",
      border: "from-purple-500 via-indigo-500 to-blue-500",
      textGrad: "from-purple-400 to-blue-500",
      category: "celebrity",
      preview: celebrityPreview.slice(0, 3).map(c => ({
        name: c.heroSection?.name,
        image: c.heroSection?.profileImage,
        slug: c.heroSection?.slug
      }))
    },
  ];

  return (
    <section id="categories" className="relative py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050505] via-gray-950/20 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-block px-4 py-2 bg-gray-800/40 border border-gray-700/60 rounded-full">
            <span className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
              Explore by Category
            </span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-white">
            Category Intelligence Hub
          </h2>
          <p className="text-xl text-gray-400">
            Navigate through organized content portals designed for deep exploration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((c, i) => (
            <Link href={`/category/${c.category}`} key={i} className="group relative overflow-hidden rounded-2xl isolate cursor-pointer">
              <div className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${c.border} opacity-0 group-hover:opacity-10 transition-all duration-500`} />
              <div className={`pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${c.border} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />
              <div className="relative z-10 rounded-2xl border-2 border-gray-800 hover:border-gray-700 transition-all duration-500 bg-gradient-to-b from-gray-900/60 to-black/40 p-10 h-full flex flex-col">
                <div className={`mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${c.iconBg} shrink-0 transform-none transition-none group-hover:scale-100`}>
                  <c.icon className="h-8 w-8 text-white/85 transform-none group-hover:scale-100" />
                </div>
                <h3 className={`text-3xl font-bold text-white mb-3 group-hover:bg-gradient-to-r ${c.textGrad} group-hover:bg-clip-text group-hover:text-transparent`}>
                  {c.title}
                </h3>
                <p className="text-base text-gray-400 mb-2">{c.subtitle}</p>
                <div className="mt-auto">
                  {c.preview && c.preview.length > 0 && (
                    <div className="flex -space-x-3 mb-4">
                      {c.preview.map((p, idx) => (
                        <div key={idx} className="h-10 w-10 rounded-full border-2 border-gray-900 overflow-hidden ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-500">{c.count}</p>
                </div>
                <div
                  className="absolute bottom-10 right-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

