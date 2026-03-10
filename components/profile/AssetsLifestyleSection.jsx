"use client";
import { Home, Car, Plane, Gem } from "lucide-react";

export default function AssetsLifestyleSection({ celebrity }) {
  // Static data - will be replaced by API
  const assets = [
    {
      image: "/uploads/s.avif",
      Icon: Home,
      iconBg: "from-blue-500 to-blue-600",
      title: "Mannat Bungalow",
      location: "Mumbai, India",
      value: "$30M",
      description:
        "Iconic 6-story sea-facing mansion in Bandra, one of Mumbai's most valuable properties",
    },
    {
      image: "/uploads/s.avif",
      Icon: Car,
      iconBg: "from-yellow-500 to-yellow-600",
      title: "Luxury Car Collection",
      location: "Mumbai & Dubai",
      value: "$5M+",
      description:
        "Rolls Royce Phantom, Bugatti Veyron, BMW i8, Bentley Continental GT, and more",
    },
    {
      image: "/uploads/s.avif",
      Icon: Plane,
      iconBg: "from-cyan-500 to-cyan-600",
      title: "Private Aircraft",
      location: "International",
      value: "$8M",
      description: "Private jet for international travel and business trips",
    },
    {
      image: "/uploads/s.avif",
      Icon: Gem,
      iconBg: "from-pink-500 to-pink-600",
      title: "Luxury Investments",
      location: "Global",
      value: "$7M+",
      description:
        "High-end watches, art collection, and luxury lifestyle investments",
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            <span className="text-white">Assets & </span>
            <span className="text-transparent bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text">Lifestyle</span>
          </h2>
          <p className="text-slate-400">
            Luxury properties, vehicles, and premium investments
          </p>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {assets.map((asset, index) => (
            <div
              key={index}
              className="relative h-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer group backdrop-blur-xl"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={asset.image}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                
                {/* Icon Badge */}
                <div
                  className={`absolute top-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-br ${asset.iconBg} flex items-center justify-center ring-1 ring-white/10`}
                >
                  {(() => {
                    const Icon = asset.Icon;
                    return <Icon className="h-6 w-6 text-white" />;
                  })()}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {asset.title}
                    </h3>
                    <p className="text-sm text-slate-400">{asset.location}</p>
                  </div>
                  <span className="text-xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
                    {asset.value}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {asset.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
