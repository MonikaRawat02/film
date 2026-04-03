"use client";
import { Home, Car, Plane, Gem } from "lucide-react";

export default function AssetsLifestyleSection({ celebrity }) {
  if (!celebrity) return null;

  const assetsData = celebrity.assets || [];
  const icons = [Home, Car, Plane, Gem];
  const colors = ["from-blue-500 to-blue-600", "from-yellow-500 to-yellow-600", "from-cyan-500 to-cyan-600", "from-pink-500 to-pink-600"];

  const assets = assetsData.map((asset, index) => ({
    image: asset.image ? asset.image.replace(/`/g, '').trim() : "/placeholder.jpg",
    Icon: icons[index % icons.length],
    iconBg: colors[index % colors.length],
    glowGradient: index === 0 ? "from-blue-500 to-blue-600" : 
                  index === 1 ? "from-purple-500 to-purple-600" : 
                  index === 2 ? "from-cyan-500 to-cyan-600" : 
                  "from-pink-500 to-pink-600",
    title: asset.name,
    location: asset.location,
    value: asset.value,
    description: asset.description
  }));

  return (
    <section className="bg-[#0a0c14] py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-left">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="text-white">Assets & </span>
            <span className="text-transparent bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text">Lifestyle</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Luxury properties, vehicles, and premium investments
          </p>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {assets.map((asset, index) => (
            <div
              key={index}
              className="group relative h-full"
            >
              {/* Glow Background Effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${asset.glowGradient} rounded-[2rem] blur-xl opacity-0 group-hover:opacity-40 transition duration-500`} />
              
              <div className="relative h-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-[1.5rem] border border-white/10 overflow-hidden hover:border-white/30 transition-all duration-300 cursor-pointer backdrop-blur-xl">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={asset.image}
                    alt={asset.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  {/* Icon Badge */}
                  <div
                    className={`absolute top-4 right-4 w-10 h-10 rounded-xl bg-gradient-to-br ${asset.iconBg} flex items-center justify-center ring-1 ring-white/10 shadow-lg`}
                  >
                    {(() => {
                      const Icon = asset.Icon;
                      return <Icon className="h-5 w-5 text-white" />;
                    })()}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {asset.title}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium">{asset.location}</p>
                    </div>
                    <span className="text-xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
                      {asset.value}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {asset.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
