import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  TrendingUp, Film, BarChart3, Tv, Star, Eye, Clock,
  Zap, ArrowRight, Play, ChevronRight, Activity,
  Globe, ArrowUpRight, Youtube, Flame
} from "lucide-react";

// ─── NORMALISE title for dedup ──────────────────────────────────────────────
const normTitle = (t = "") =>
  t.toLowerCase()
    .replace(/\bprofile\b/g, "")
    .replace(/\bintelligence\b/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ─── HEAT BAR ─────────────────────────────────────────────────────────────────
const HeatBar = ({ score = 70, color = "#ef4444" }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${score}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg,${color}44,${color})` }}
      />
    </div>
    <span className="text-[9px] font-black tabular-nums w-5 text-right" style={{ color }}>{score}</span>
  </div>
);

// ─── RANKED ROW ───────────────────────────────────────────────────────────────
const RankedRow = ({ item, rank, isActive, onClick }) => {
  const barColors = {
    Explained: "#60a5fa", "Box Office": "#34d399",
    OTT: "#c084fc", Celebrity: "#fbbf24", default: "#71717a"
  };
  const score = item.trendScore
    ? Math.min(99, item.trendScore)
    : item.searchCount
    ? Math.min(99, 40 + item.searchCount * 3)
    : Math.floor(52 + rank * 4.2);

  return (
    <motion.button onClick={onClick} whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 400 }}
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group border ${
        isActive ? "bg-white/[0.07] border-white/[0.12]" : "border-transparent hover:bg-white/[0.04]"
      }`}>
      <span className={`text-xl font-black leading-none tabular-nums w-7 shrink-0 ${isActive ? "text-white" : "text-white/20"}`}>
        {String(rank).padStart(2, "0")}
      </span>
      <div className="w-9 h-12 rounded-lg overflow-hidden shrink-0 bg-white/[0.05]">
        <img src={item.image || "/placeholder.jpg"} alt=""
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white/80 font-semibold leading-snug line-clamp-2 mb-1">{item.title}</p>
        <HeatBar score={score} color={barColors[item.category] || barColors.default} />
      </div>
      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-opacity ${isActive ? "text-white/60 opacity-100" : "text-white/20 opacity-0 group-hover:opacity-100"}`} />
    </motion.button>
  );
};

// ─── FEATURED SPOTLIGHT ───────────────────────────────────────────────────────
const FeaturedSpotlight = ({ item, rank }) => {
  if (!item) return null;
  const catGrad = {
    Explained: "from-blue-600 to-cyan-500", "Box Office": "from-emerald-600 to-green-400",
    OTT: "from-violet-600 to-purple-400", Celebrity: "from-amber-500 to-orange-400",
    default: "from-red-600 to-pink-500"
  };
  const grad = catGrad[item.category] || catGrad.default;
  const href = item.slug ? (item.category === "Celebrity" ? `/celebrity/${item.slug}` : `/intelligence/${item.slug}`) : "#";

  return (
    <motion.div key={item._id || rank} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4 }}
      className="relative h-full min-h-[520px] rounded-3xl overflow-hidden group cursor-default">
      <div className="absolute inset-0">
        <img src={item.image || "/placeholder.jpg"} alt={item.title}
          className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[2500ms]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
        <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-[0.17]`} />
      </div>
      <div className="absolute top-5 left-6 z-10 select-none pointer-events-none">
        <span className="text-[88px] font-black text-white/[0.06] leading-none">{String(rank).padStart(2, "0")}</span>
      </div>
      <div className="absolute top-5 right-5 z-10 flex items-center gap-2 bg-black/55 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-black text-white tracking-widest uppercase">Live</span>
      </div>
      {/* Source badge */}
      {item.source && item.source !== "intelligence" && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {item.source === "google" ? <Globe className="w-3 h-3 text-blue-400" /> : <Youtube className="w-3 h-3 text-red-400" />}
          <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">{item.source}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
        <div className={`inline-block mb-3.5 px-4 py-1.5 rounded-full bg-gradient-to-r ${grad} text-white text-[9px] font-black uppercase tracking-[0.25em]`}>
          {item.category || "Trending"}
        </div>
        <h2 className="text-3xl md:text-[2.2rem] font-black text-white leading-tight mb-2.5 line-clamp-2">{item.title}</h2>
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-5">
          {item.description || "Deep intelligence analysis and insights."}
        </p>
        <div className="flex items-center gap-4">
          <Link href={href}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${grad} text-white font-bold text-sm shadow-2xl hover:scale-105 active:scale-95 transition-transform`}>
            <Play className="w-3.5 h-3.5 fill-white" /> Read Now
          </Link>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.views || "2.1K"}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.readTime || "6 min"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── EDITORIAL CARD ───────────────────────────────────────────────────────────
const EditorialCard = ({ item, rank, flip = false }) => {
  const catConfig = {
    Explained: { accent: "#3b82f6", icon: Film },
    "Box Office": { accent: "#10b981", icon: BarChart3 },
    OTT: { accent: "#a855f7", icon: Tv },
    Celebrity: { accent: "#f59e0b", icon: Star },
    default: { accent: "#ef4444", icon: TrendingUp }
  };
  const cfg = catConfig[item.category] || catConfig.default;
  const CatIcon = cfg.icon;
  const href = item.slug ? (item.category === "Celebrity" ? `/celebrity/${item.slug}` : `/intelligence/${item.slug}`) : "#";

  return (
    <motion.div initial={{ opacity: 0, x: flip ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative flex overflow-hidden rounded-2xl border border-white/[0.05] hover:border-white/[0.10] bg-white/[0.015] hover:bg-white/[0.03] transition-all duration-300"
      style={{ borderLeft: `3px solid ${cfg.accent}` }}>
      <div className={`absolute inset-y-0 flex items-center pointer-events-none select-none ${flip ? "right-0" : "left-0"}`}>
        <span className="text-[90px] font-black leading-none opacity-[0.03] text-white px-2">{String(rank).padStart(2, "0")}</span>
      </div>
      {!flip && (
        <div className="w-36 md:w-48 shrink-0 relative overflow-hidden">
          <img src={item.image || "/placeholder.jpg"} alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        </div>
      )}
      <div className="flex-1 p-5 md:p-7 relative z-10">
        <div className="flex items-center gap-2 mb-2.5">
          <CatIcon className="w-3 h-3" style={{ color: cfg.accent }} />
          <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: cfg.accent }}>{item.category || "Trending"}</span>
          <span className="text-zinc-700 mx-1">·</span>
          <span className="text-[9px] text-zinc-600">{item.readTime || "5 min"}</span>
          {item.source && item.source !== "intelligence" && (
            <>
              <span className="text-zinc-700 mx-1">·</span>
              <span className="text-[9px] text-zinc-600 flex items-center gap-0.5">
                {item.source === "google" ? <Globe className="w-2.5 h-2.5" /> : <Youtube className="w-2.5 h-2.5" />}
                {item.source}
              </span>
            </>
          )}
        </div>
        <h3 className="text-lg md:text-xl font-black text-white leading-tight mb-2 group-hover:text-red-400 transition-colors line-clamp-2">{item.title}</h3>
        <p className="text-zinc-600 text-xs leading-relaxed line-clamp-2 mb-4">{item.description || "Deep intelligence analysis."}</p>
        <Link href={href} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group/lnk" style={{ color: cfg.accent }}>
          Decode This <ArrowRight className="w-3 h-3 transition-transform group-hover/lnk:translate-x-1.5" />
        </Link>
      </div>
      {flip && (
        <div className="w-36 md:w-48 shrink-0 relative overflow-hidden">
          <img src={item.image || "/placeholder.jpg"} alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20" />
        </div>
      )}
    </motion.div>
  );
};

// ─── MOSAIC STRIP ─────────────────────────────────────────────────────────────
const MosaicStrip = ({ items }) => {
  if (!items?.length) return null;
  const accentMap = { Explained: "#3b82f6", "Box Office": "#10b981", OTT: "#a855f7", Celebrity: "#f59e0b" };
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.slice(0, 4).map((item, i) => {
        const accent = accentMap[item.category] || "#ef4444";
        const href = item.slug ? (item.category === "Celebrity" ? `/celebrity/${item.slug}` : `/intelligence/${item.slug}`) : "#";
        return (
          <motion.div key={item._id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden">
            <img src={item.image || "/placeholder.jpg"} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
            <motion.div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }}
              initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.3 }} />
            <div className="absolute bottom-0 p-4">
              <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: accent }}>{item.category}</p>
              <h4 className="text-white text-xs font-bold leading-tight line-clamp-2 mb-2.5">{item.title}</h4>
              <Link href={href} className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                Read <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── TICKER TAPE ──────────────────────────────────────────────────────────────
const TickerTape = ({ items }) => {
  if (!items?.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden bg-red-600 py-2.5">
      <div className="flex ticker-scroll">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-3 px-6 shrink-0">
            <Zap className="w-3 h-3 text-white/50 shrink-0" />
            <span className="text-white text-[11px] font-black uppercase tracking-wider whitespace-nowrap">{item.title}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── CATEGORY HEAT MAP ────────────────────────────────────────────────────────
const CategoryHeatMap = ({ items }) => {
  const cats = ["Explained", "Box Office", "OTT", "Celebrity"];
  const cfgs = {
    Explained: { color: "#3b82f6", icon: Film, desc: "Story deep-dives" },
    "Box Office": { color: "#10b981", icon: BarChart3, desc: "Financial intel" },
    OTT: { color: "#a855f7", icon: Tv, desc: "Streaming analysis" },
    Celebrity: { color: "#f59e0b", icon: Star, desc: "Star profiles" }
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cats.map((cat, i) => {
        const count = items.filter(x => x.category === cat).length;
        const cfg = cfgs[cat]; const CatIcon = cfg.icon;
        const pct = Math.min(100, count * 22 + 25);
        return (
          <motion.div key={cat} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.12 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.05] p-6"
            style={{ background: `radial-gradient(circle at top left,${cfg.color}10,transparent 65%)` }}>
            <CatIcon className="absolute -bottom-3 -right-3 w-20 h-20 opacity-[0.03] text-white" />
            <CatIcon className="w-5 h-5 mb-3" style={{ color: cfg.color }} />
            <p className="text-2xl font-black text-white mb-0.5">{count || "–"}</p>
            <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: cfg.color }}>{cat}</p>
            <p className="text-[11px] text-zinc-600 mb-4">{cfg.desc}</p>
            <div className="h-px bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.12 + 0.3 }}
                className="h-full" style={{ backgroundColor: cfg.color }} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── VELOCITY TRACKER ─────────────────────────────────────────────────────────
const VelocityTracker = ({ items }) => {
  if (!items?.length) return null;
  const buckets = [
    { label: "Rising Fast", emoji: "🚀", color: "#10b981", border: "border-emerald-500/20", bg: "#10b98108", slice: [0, 4] },
    { label: "At Peak",     emoji: "🔥", color: "#f59e0b", border: "border-amber-500/20",   bg: "#f59e0b08", slice: [4, 8] },
    { label: "Cooling",     emoji: "📉", color: "#6b7280", border: "border-zinc-600/20",    bg: "#6b728008", slice: [8, 12] },
  ];
  const accentMap = { Explained: "#3b82f6", "Box Office": "#10b981", OTT: "#a855f7", Celebrity: "#f59e0b" };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {buckets.map((bucket, bi) => {
        const bucketItems = items.slice(...bucket.slice);
        return (
          <motion.div key={bucket.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: bi * 0.15 }}
            className={`rounded-2xl border ${bucket.border} p-5`} style={{ background: bucket.bg }}>
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-black text-white">{bucket.emoji} {bucket.label}</span>
              <span className="text-[9px] text-zinc-600 font-bold">{bucketItems.length} items</span>
            </div>
            <div className="space-y-3">
              {bucketItems.map((item, i) => {
                const href = item.slug ? (item.category === "Celebrity" ? `/celebrity/${item.slug}` : `/intelligence/${item.slug}`) : "#";
                const accent = accentMap[item.category] || bucket.color;
                return (
                  <motion.div key={item._id || i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: bi * 0.15 + i * 0.06 }}>
                    <Link href={href} className="flex items-start gap-3 group">
                      <span className="text-lg font-black leading-tight tabular-nums text-white/15 w-6 shrink-0 group-hover:text-white/40 transition-colors">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 font-semibold leading-tight line-clamp-2 group-hover:text-white transition-colors">{item.title}</p>
                        <span className="text-[9px] font-black uppercase tracking-widest mt-0.5 inline-block" style={{ color: accent }}>{item.category}</span>
                      </div>
                      <ArrowUpRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity mt-0.5" style={{ color: bucket.color }} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── FILM STRIP ───────────────────────────────────────────────────────────────
const FilmStripScroll = ({ items }) => {
  if (!items?.length) return null;
  const accentMap = { Explained: "#3b82f6", "Box Office": "#10b981", OTT: "#a855f7", Celebrity: "#f59e0b" };
  return (
    <div className="relative">
      <div className="flex gap-3 px-4 mb-2 overflow-hidden opacity-[0.12]">
        {[...Array(32)].map((_, i) => <div key={i} className="w-5 h-3 rounded-sm border border-zinc-500 shrink-0" />)}
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-4 px-2 pb-2" style={{ width: "max-content" }}>
          {items.map((item, i) => {
            const accent = accentMap[item.category] || "#ef4444";
            const href = item.slug ? (item.category === "Celebrity" ? `/celebrity/${item.slug}` : `/intelligence/${item.slug}`) : "#";
            return (
              <motion.div key={item._id || i} initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="group relative w-[155px] shrink-0 rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.14] transition-colors">
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img src={item.image || "/placeholder.jpg"} alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: accent }} />
                </div>
                <div className="p-3">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: accent }}>{item.category}</p>
                  <h4 className="text-white text-[11px] font-bold leading-tight line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">{item.title}</h4>
                  <Link href={href} className="text-[9px] text-zinc-600 hover:text-white flex items-center gap-1 transition-colors font-bold">
                    View <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3 px-4 mt-2 overflow-hidden opacity-[0.12]">
        {[...Array(32)].map((_, i) => <div key={i} className="w-5 h-3 rounded-sm border border-zinc-500 shrink-0" />)}
      </div>
    </div>
  );
};

// ─── GOOGLE vs YOUTUBE PANEL ──────────────────────────────────────────────────
const SourcePanel = ({ googleItems, youtubeItems }) => {
  const accentMap = { Explained: "#3b82f6", "Box Office": "#10b981", OTT: "#a855f7", Celebrity: "#f59e0b" };

  const PanelCol = ({ items, icon: Icon, label, color, bg, dir }) => (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.55 }}
      className="rounded-2xl overflow-hidden border border-white/[0.05]">
      <div className="flex items-center gap-3 px-6 py-4" style={{ background: bg }}>
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-black text-white">{label}</span>
        <span className="ml-auto text-[9px] font-black uppercase tracking-widest" style={{ color }}>{items.length} signals</span>
      </div>
      <div className="divide-y divide-white/[0.03]">
        {items.map((item, i) => {
          const href = item.slug ? (item.category === "Celebrity" ? `/celebrity/${item.slug}` : `/intelligence/${item.slug}`) : "#";
          const accent = accentMap[item.category] || color;
          return (
            <motion.div key={item._id || i} initial={{ opacity: 0, x: dir === "l" ? -12 : 12 }}
              whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Link href={href} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.03] transition-colors group">
                <span className="text-xs font-black tabular-nums" style={{ color: `${color}50` }}>{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80 font-semibold leading-tight line-clamp-1 group-hover:text-white transition-colors">{item.title}</p>
                  <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: accent }}>{item.category}</span>
                  {item.traffic > 0 && (
                    <span className="text-[8px] text-zinc-700 ml-2">{(item.traffic / 1000).toFixed(0)}K searches</span>
                  )}
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" style={{ color }} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  if (!googleItems.length && !youtubeItems.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {googleItems.length > 0 && (
        <PanelCol items={googleItems.slice(0, 6)} icon={Globe} label="Google Trends"
          color="#4285f4" bg="rgba(66,133,244,0.07)" dir="l" />
      )}
      {youtubeItems.length > 0 && (
        <PanelCol items={youtubeItems.slice(0, 6)} icon={Youtube} label="YouTube Trends"
          color="#ff0000" bg="rgba(255,0,0,0.06)" dir="r" />
      )}
    </div>
  );
};

// ─── KEYWORD PULSE ────────────────────────────────────────────────────────────
const KeywordPulse = ({ items }) => {
  if (!items?.length) return null;
  const stopWords = new Set(["this","that","with","from","into","over","than","have","been","will","were","they","them","their","what","when","where","which","while","your","more","also","film","movie","actor","profile"]);
  const counts = {};
  items.forEach(item => {
    (item.title?.split(/[\s\-:,]+/) || []).forEach(word => {
      const w = word.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (w.length > 3 && !stopWords.has(w)) counts[w] = (counts[w] || 0) + 1;
    });
    (item.keywords || []).forEach(kw => {
      const w = (kw || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
      if (w.length > 2) counts[w] = (counts[w] || 0) + 2;
    });
  });
  const keywords = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 28).map(([word, count]) => ({ word, count }));
  const colors = ["#ef4444","#3b82f6","#10b981","#a855f7","#f59e0b","#ec4899","#14b8a6","#f97316","#8b5cf6","#06b6d4"];

  return (
    <div className="flex flex-wrap gap-2.5 justify-center">
      {keywords.map(({ word, count }, i) => {
        const size = count >= 4 ? "text-xl" : count >= 3 ? "text-base" : count === 2 ? "text-sm" : "text-xs";
        const color = colors[i % colors.length];
        return (
          <motion.span key={word} initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.03 }} whileHover={{ scale: 1.18 }}
            className={`${size} font-black uppercase tracking-wider cursor-default px-3 py-1.5 rounded-full border transition-all`}
            style={{ color, borderColor: `${color}20`, background: `${color}07` }}>
            {word}
          </motion.span>
        );
      })}
    </div>
  );
};

// ─── TRENDING NOW MARQUEE ROW ─────────────────────────────────────────────────
const MarqueeRow = ({ items, reverse = false }) => {
  if (!items?.length) return null;
  const doubled = [...items, ...items];
  const accentMap = { Explained: "#3b82f6", "Box Office": "#10b981", OTT: "#a855f7", Celebrity: "#f59e0b" };
  return (
    <div className="overflow-hidden">
      <div className={`flex gap-3 ${reverse ? "marquee-reverse" : "marquee-fwd"}`}>
        {doubled.map((item, i) => {
          const accent = accentMap[item.category] || "#ef4444";
          return (
            <div key={i} className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] shrink-0 hover:border-white/[0.12] transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              <span className="text-[11px] font-semibold text-white/70 whitespace-nowrap">{item.title}</span>
              <span className="text-[9px] font-black uppercase tracking-widest shrink-0" style={{ color: accent }}>{item.category}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function TrendingExplainersPage() {
  const [trendingData, setTrendingData] = useState([]);  // from /api/trending-intelligence
  const [celebData, setCelebData] = useState([]);         // from /api/trending-celebrities
  const [rawTrending, setRawTrending] = useState([]);     // from /api/trending (google+youtube)
  const [loading, setLoading] = useState(true);
  const [activeRank, setActiveRank] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");
  const pageRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: pageRef });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    Promise.all([
      fetch("/api/trending-intelligence").then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch("/api/trending-celebrities").then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch("/api/trending?limit=30").then(r => r.json()).catch(() => ({ success: false, data: {} })),
    ]).then(([intel, celeb, raw]) => {
      const intelData = (intel.success ? intel.data : []).map(x => ({ ...x, source: x.source || "intelligence" }));

      const celebItems = (celeb.success ? celeb.data : []).map(x => ({ ...x, category: "Celebrity", source: "intelligence" }));

      // Convert raw trending (google/youtube) into uniform format
      const rawMovies = (raw.success ? raw.data?.trending_movies || [] : []).map(t => ({
        _id: t._id, title: t.title, category: "Explained",
        image: t.metadata?.coverImage || t.metadata?.thumbnail || "/placeholder.jpg",
        description: (t.keywords || []).join(" · ") || "",
        slug: t.slug, source: t.source || "google",
        traffic: t.traffic || 0, viewCount: t.viewCount || 0, trendScore: t.score || 0,
        views: t.viewCount > 0 ? `${(t.viewCount / 1000).toFixed(1)}K` : t.traffic > 0 ? `${(t.traffic / 1000).toFixed(0)}K` : "—",
        readTime: "4 min", keywords: t.keywords || []
      }));
      const rawActors = (raw.success ? raw.data?.trending_actors || [] : []).map(t => ({
        _id: t._id, title: t.title, category: "Celebrity",
        image: t.metadata?.profileImage || t.metadata?.thumbnail || "/placeholder.jpg",
        description: (t.keywords || []).join(" · ") || "",
        slug: t.slug, source: t.source || "google",
        traffic: t.traffic || 0, viewCount: t.viewCount || 0, trendScore: t.score || 0,
        views: t.traffic > 0 ? `${(t.traffic / 1000).toFixed(0)}K` : "—",
        readTime: "3 min", keywords: t.keywords || []
      }));
      const rawTopics = (raw.success ? raw.data?.viral_topics || [] : []).map(t => ({
        _id: t._id, title: t.title, category: "OTT",
        image: t.metadata?.thumbnail || "/placeholder.jpg",
        description: (t.keywords || []).join(" · ") || "",
        slug: t.slug, source: t.source || "youtube",
        traffic: t.traffic || 0, viewCount: t.viewCount || 0, trendScore: t.score || 0,
        views: t.viewCount > 0 ? `${(t.viewCount / 1000).toFixed(1)}K` : "—",
        readTime: "4 min", keywords: t.keywords || []
      }));

      // ─── GLOBAL DEDUP by normalised title ──────────────────
      const seen = new Set();
      const dedup = (arr) => arr.filter(item => {
        const key = normTitle(item.title);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Priority order: intelligence articles → celebs → raw trending
      const all = dedup([...intelData, ...celebItems, ...rawMovies, ...rawActors, ...rawTopics]);

      const googleSrc = [...rawMovies, ...rawActors, ...rawTopics].filter(x => x.source === "google");
      const youtubeSrc = [...rawMovies, ...rawActors, ...rawTopics].filter(x => x.source === "youtube");

      setTrendingData(all);
      setCelebData(dedup([...celebItems, ...rawActors]));
      setRawTrending({ google: googleSrc, youtube: youtubeSrc });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const allItems = trendingData.slice(0, 28);

  const filtered = activeFilter === "All"
    ? allItems
    : allItems.filter(x => x.category === activeFilter);

  const featured = filtered[activeRank] || filtered[0];
  const rankList = filtered.slice(0, 10);

  // Non-overlapping section pools
  const mosaicItems   = allItems.slice(0, 4);
  const filmItems     = allItems.slice(4, 18);   // different from mosaic
  const velocityItems = allItems.slice(0, 12);
  const editorialItems = allItems.slice(3, 13);   // 10 deep-dive cards

  const filterTabs = ["All", "Explained", "Box Office", "OTT", "Celebrity"];

  const SectionDivider = ({ label, sub }) => (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="flex items-center gap-4 mb-8">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.07]" />
      <div className="text-center">
        <span className="text-[9px] font-black uppercase tracking-[0.45em] text-zinc-600">{label}</span>
        {sub && <p className="text-[8px] text-zinc-800 mt-0.5">{sub}</p>}
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.07]" />
    </motion.div>
  );

  return (
    <>
      <Head>
        <title>Trending Explainers — FilmyFire</title>
        <meta name="description" content="The most trending movie explainers, box office analysis and celebrity intelligence right now." />
      </Head>

      <motion.div className="fixed top-0 left-0 h-[2px] z-[999] bg-gradient-to-r from-red-600 via-purple-500 to-blue-500"
        style={{ width: progressWidth }} />

      <div ref={pageRef} className="min-h-screen" style={{ background: "#080808" }}>

        {/* ── TICKER ─────────────────────────────────────────── */}
        <TickerTape items={allItems.slice(0, 12)} />

        {/* ── TOP BAR ─────────────────────────────────────────── */}
        <div className="border-b border-white/[0.04] px-4 sm:px-8 lg:px-16 py-3.5">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Live Trending Index</span>
              <span className="text-zinc-700 mx-1">·</span>
              <span className="text-[10px] text-zinc-600">{allItems.length} unique items</span>
              {rawTrending.google?.length > 0 && (
                <><span className="text-zinc-700 mx-1">·</span>
                <Globe className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] text-zinc-600">{rawTrending.google.length} Google</span></>
              )}
              {rawTrending.youtube?.length > 0 && (
                <><span className="text-zinc-700 mx-1">·</span>
                <Youtube className="w-3 h-3 text-red-500" />
                <span className="text-[10px] text-zinc-600">{rawTrending.youtube.length} YouTube</span></>
              )}
            </div>
            <Link href="/" className="text-[10px] text-zinc-700 hover:text-white transition-colors">← Home</Link>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16">

          {/* ═══ 1. COMMAND CENTER ══════════════════════════════ */}
          <div className="pt-10 pb-14">
            <SectionDivider label="Command Center" sub="Click a rank to preview" />
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 animate-pulse">
                <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/[0.04]" />)}</div>
                <div className="min-h-[520px] rounded-3xl bg-white/[0.04]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                <motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }} className="space-y-0.5">
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {filterTabs.map(tab => (
                      <button key={tab} onClick={() => { setActiveFilter(tab); setActiveRank(0); }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          activeFilter === tab ? "bg-white text-black" : "text-zinc-500 hover:text-white hover:bg-white/[0.08]"
                        }`}>{tab}</button>
                    ))}
                  </div>
                  <div className="space-y-0.5">
                    {rankList.map((item, i) => (
                      <RankedRow key={item._id || i} item={item} rank={i + 1}
                        isActive={activeRank === i} onClick={() => setActiveRank(i)} />
                    ))}
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
                  <AnimatePresence mode="wait">
                    <FeaturedSpotlight key={featured?._id || activeRank} item={featured} rank={activeRank + 1} />
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </div>

          {/* ═══ 2. MARQUEE ROWS ════════════════════════════════ */}
          {!loading && allItems.length > 6 && (
            <section className="py-10 border-t border-white/[0.04] space-y-3 overflow-hidden">
              <MarqueeRow items={allItems.slice(0, 10)} />
              <MarqueeRow items={allItems.slice(5, 15)} reverse />
            </section>
          )}

          {/* ═══ 3. CATEGORY HEAT MAP ═══════════════════════════ */}
          <section className="py-14 border-t border-white/[0.04]">
            <SectionDivider label="Category Heat Map" />
            <CategoryHeatMap items={allItems} />
          </section>

          {/* ═══ 4. FILM STRIP ────────────────────────────────── */}
          {!loading && filmItems.length > 0 && (
            <section className="py-14 border-t border-white/[0.04]">
              <SectionDivider label="Film Strip" sub="Scroll horizontally →" />
              <FilmStripScroll items={filmItems} />
            </section>
          )}

          {/* ═══ 5. VELOCITY TRACKER ════════════════════════════ */}
          {!loading && velocityItems.length > 0 && (
            <section className="py-14 border-t border-white/[0.04]">
              <SectionDivider label="Trending Velocity" />
              <VelocityTracker items={velocityItems} />
            </section>
          )}

          {/* ═══ 6. MOSAIC ───────────────────────────────────── */}
          {!loading && mosaicItems.length > 0 && (
            <section className="py-14 border-t border-white/[0.04]">
              <SectionDivider label="Quick Glance" />
              <MosaicStrip items={mosaicItems} />
            </section>
          )}

          {/* ═══ 7. EDITORIAL ═══════════════════════════════════ */}
          {!loading && editorialItems.length > 0 && (
            <section className="py-14 border-t border-white/[0.04]">
              <SectionDivider label="Deep Intelligence" />
              <div className="space-y-4">
                {editorialItems.map((item, i) => (
                  <EditorialCard key={item._id || i} item={item} rank={i + 4} flip={i % 2 !== 0} />
                ))}
              </div>
            </section>
          )}

          {/* ═══ 8. GOOGLE vs YOUTUBE ════════════════════════════ */}
          {!loading && (rawTrending.google?.length > 0 || rawTrending.youtube?.length > 0) && (
            <section className="py-14 border-t border-white/[0.04]">
              <SectionDivider label="Google vs YouTube Trends" sub="Live signal comparison" />
              <SourcePanel googleItems={rawTrending.google || []} youtubeItems={rawTrending.youtube || []} />
            </section>
          )}

          {/* ═══ 9. KEYWORD PULSE ════════════════════════════════ */}
          {!loading && allItems.length > 0 && (
            <section className="py-14 border-t border-white/[0.04]">
              <SectionDivider label="Trending Keywords" sub="Size = frequency" />
              <KeywordPulse items={allItems} />
            </section>
          )}

          {/* ═══ 10. CTA ════════════════════════════════════════ */}
          <section className="py-16 border-t border-white/[0.04]">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden px-8 md:px-16 py-14 text-center"
              style={{ background: "linear-gradient(135deg,#0e0e0e 0%,#160404 50%,#0e0e0e 100%)", border: "1px solid rgba(239,68,68,0.09)" }}>
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-red-600/20 rounded-tl-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-red-600/20 rounded-br-3xl pointer-events-none" />
              <Flame className="w-8 h-8 text-red-600/40 mx-auto mb-4" />
              <p className="text-[9px] font-black uppercase tracking-[0.45em] text-red-600 mb-3">All Intelligence</p>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">More to Explore</h2>
              <p className="text-zinc-600 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                Thousands of verified explainers, box office breakdowns, and celebrity deep-dives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm transition-all hover:scale-105 shadow-2xl shadow-red-600/20">
                  Explore All <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/celebrities"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/[0.08] text-white font-black text-sm hover:bg-white/[0.04] transition-all">
                  Celebrity Intel <Star className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </section>

        </div>
      </div>

      <style jsx>{`
        .ticker-scroll { display:flex; animation:ticker 30s linear infinite; width:max-content; }
        .ticker-scroll:hover { animation-play-state:paused; }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .marquee-fwd { display:flex; animation:marquee-f 35s linear infinite; width:max-content; }
        .marquee-fwd:hover { animation-play-state:paused; }
        .marquee-reverse { display:flex; animation:marquee-r 38s linear infinite; width:max-content; }
        .marquee-reverse:hover { animation-play-state:paused; }
        @keyframes marquee-f { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes marquee-r { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
      `}</style>
    </>
  );
}

TrendingExplainersPage.noPadding = true;
