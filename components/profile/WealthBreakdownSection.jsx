"use client";
import { useState, useEffect } from "react";
import { Film, Megaphone, Trophy, House, RefreshCw, Loader2 } from "lucide-react";

export default function WealthBreakdownSection({ celebrity }) {
  if (!celebrity) return null;

  const name = celebrity.heroSection?.name || "Unknown";
  const slug = celebrity.heroSection?.slug;
  const totalNetWorth = celebrity.netWorth?.netWorthUSD?.max || celebrity.netWorth?.netWorthUSD?.min || 0;

  const icons = [Film, Megaphone, Trophy, House];
  const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f97316"]; // Blue, Purple, Green, Orange
  const barColors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500"];

  const [incomeSources, setIncomeSources] = useState(celebrity.netWorthCalculation?.incomeSources || []);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("static");
  const [netWorthTotal, setNetWorthTotal] = useState(totalNetWorth);
  const [hoverIndex, setHoverIndex] = useState(-1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/celebrity/wealth-breakdown?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.incomeSources?.length > 0) {
          setIncomeSources(data.data.incomeSources);
          setSource(data.source);
          if (data.data.totalNetWorth) setNetWorthTotal(data.data.totalNetWorth);
        }
      })
      .catch((err) => console.error("Wealth breakdown fetch error:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleRefresh = () => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/celebrity/wealth-breakdown?slug=${encodeURIComponent(slug)}&refresh=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.incomeSources?.length > 0) {
          setIncomeSources(data.data.incomeSources);
          setSource(data.source);
          if (data.data.totalNetWorth) setNetWorthTotal(data.data.totalNetWorth);
        }
      })
      .catch((err) => console.error("Refresh error:", err))
      .finally(() => setLoading(false));
  };

  const breakdownItems = incomeSources.map((source, index) => {
    const amountVal = netWorthTotal ? (netWorthTotal * (source.percentage / 100)) : 0;
    const amountDisplay = amountVal >= 1000000
      ? `$${(amountVal / 1000000).toFixed(1)}M`
      : amountVal >= 1000
        ? `$${(amountVal / 1000).toFixed(1)}K`
        : `$${amountVal}`;

    return {
      Icon: icons[index % icons.length],
      color: colors[index % colors.length],
      title: source.sourceName,
      percentage: source.percentage,
      amount: amountDisplay !== "$0" ? amountDisplay : `${source.percentage}%`,
      barColor: barColors[index % barColors.length],
      description: source.description
    };
  });

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              <span className="text-white">{name} </span>
              <span className="text-transparent bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text">
                Wealth Breakdown
              </span>
            </h2>
            <p className="text-slate-400">
              Comprehensive analysis of income sources and asset distribution
            </p>
            {source === "ai-generated" && (
              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                ✦ AI-Generated from Wikipedia data
              </span>
            )}
            {source === "database" && (
              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                ✦ Verified Intelligence
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Re-generate with AI"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-blue-500/40 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {loading ? "Generating..." : "Refresh"}
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && incomeSources.length === 0 && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        )}

        {/* Breakdown Items */}
        {!loading || incomeSources.length > 0 ? (
        <div className={`space-y-4 transition-opacity duration-500 ${loading ? "opacity-50" : "opacity-100"}`}>
          {breakdownItems.map((item, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(-1)}
              style={{
                borderColor: hoverIndex === index ? item.color : "rgba(255,255,255,0.05)",
                boxShadow: hoverIndex === index ? `0 0 30px ${item.color}44` : "none",
                transform: hoverIndex === index ? "translateY(-2px)" : "none",
              }}
              className="relative bg-[#0d111c] rounded-2xl border p-6 lg:p-8 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                {/* Icon & Title */}
                <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                  <div 
                    style={{ backgroundColor: item.color }}
                    className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`} >
                    {(() => {
                      const Icon = item.Icon;
                      return <Icon className="h-7 w-7 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <div className="w-full max-w-xl">
                      <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.barColor} rounded-full transition-all duration-700`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {item.percentage}% of total wealth
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount & Link */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                  <span className="text-2xl lg:text-3xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
                    {item.amount}
                  </span>
                  <span className="text-sm text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer">
                    Read detailed analysis <span>→</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        ) : null}
      </div>
    </section>
  );
}