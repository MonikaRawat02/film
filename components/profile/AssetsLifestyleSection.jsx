"use client";

export default function AssetsLifestyleSection({ celebrity }) {
  // Static data - will be replaced by API
  const assets = [
    {
      image: "/uploads/s.avif",
      icon: "🏠",
      iconBg: "bg-blue-500",
      title: "Mannat Bungalow",
      location: "Mumbai, India",
      value: "$30M",
      description:
        "Iconic 6-story sea-facing mansion in Bandra, one of Mumbai's most valuable properties",
    },
    {
      image: "/uploads/s.avif",
      icon: "🚗",
      iconBg: "bg-purple-500",
      title: "Luxury Car Collection",
      location: "Mumbai & Dubai",
      value: "$5M+",
      description:
        "Rolls Royce Phantom, Bugatti Veyron, BMW i8, Bentley Continental GT, and more",
    },
    {
      image: "/uploads/s.avif",
      icon: "✈️",
      iconBg: "bg-orange-500",
      title: "Private Aircraft",
      location: "International",
      value: "$8M",
      description: "Private jet for international travel and business trips",
    },
    {
      image: "/uploads/s.avif",
      icon: "💎",
      iconBg: "bg-pink-500",
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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <span className="text-white">Assets & </span>
            <span className="text-yellow-400">Lifestyle</span>
          </h2>
          <p className="text-gray-500 mt-2">
            Luxury properties, vehicles, and premium investments
          </p>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {assets.map((asset, index) => (
            <div
              key={index}
              className="bg-[#141824] rounded-xl border border-gray-800 overflow-hidden hover:border-gray-600 transition-all duration-300 cursor-pointer group"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={asset.image}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Icon Badge */}
                <div
                  className={`absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${asset.iconBg} flex items-center justify-center`}
                >
                  <span className="text-lg sm:text-xl">{asset.icon}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {asset.title}
                    </h3>
                    <p className="text-xs text-gray-500">{asset.location}</p>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-cyan-400">
                    {asset.value}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">
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
