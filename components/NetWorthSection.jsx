"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, CheckCircle2, RefreshCw, AlertTriangle, Clock, Info, User, Briefcase, Calendar, TrendingUp, Film, Building2, BarChart3 } from "lucide-react";

export default function NetWorthSection({ celebrity }) {
  const [currency, setCurrency] = useState("USD");
  const [expandedCalculation, setExpandedCalculation] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [allCelebrities, setAllCelebrities] = useState([]);
  const [dynamicTimeline, setTimelineData] = useState([]);
  const [dynamicMilestones, setMilestones] = useState([]);
  const [dynamicFaqs, setFaqs] = useState([]);
  const [activeSection, setActiveSection] = useState("net-worth-estimate");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [showTop5Modal, setShowTop5Modal] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Fetch specialized timeline and milestones data
  useEffect(() => {
    if (!celebrity?.heroSection?.slug) return;
    
    const fetchTimelineData = async () => {
      try {
        const res = await fetch(`/api/celebrity/timeline?slug=${celebrity.heroSection.slug}`);
        const result = await res.json();
        if (result.success) {
          setTimelineData(result.data.timeline || []);
          setMilestones(result.data.keyMilestones || []);
          setFaqs(result.data.faqs || []);
        }
      } catch (error) {
        console.error("Error fetching timeline data from API:", error);
      }
    };
    
    fetchTimelineData();
  }, [celebrity?.heroSection?.slug]);

  // Fetch all celebrities for comparisons
  useEffect(() => {
    const fetchAllCelebrities = async () => {
      try {
        const res = await fetch("/api/admin/celebrity/getCelebrity?limit=100");
        const data = await res.json();
        if (data.success) {
          setAllCelebrities(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching all celebrities for comparison:", error);
      }
    };
    fetchAllCelebrities();
  }, []);

  // Process celebrity data from API
  const processedCelebrity = celebrity ? {
    name: celebrity.heroSection?.name || "Unknown",
    slug: celebrity.heroSection?.slug || "",
    image: celebrity.heroSection?.profileImage || "/placeholder.jpg",
    tags: Array.isArray(celebrity.heroSection?.profession) 
      ? celebrity.heroSection.profession 
      : ["Professional"],
    careerStatus: celebrity.heroSection?.careerStage || "Active",
    age: celebrity.quickFacts?.age || null,
    profession: Array.isArray(celebrity.heroSection?.profession) 
      ? celebrity.heroSection.profession.join(", ") 
      : celebrity.heroSection?.profession || "N/A",
    activeSince: celebrity.quickFacts?.activeSince || null,
    netWorth: {
      usd: { 
        min: celebrity.netWorth?.netWorthUSD?.min || 0, 
        max: celebrity.netWorth?.netWorthUSD?.max || 0 
      },
      inr: { 
        min: celebrity.netWorth?.netWorthINR?.min || 0, 
        max: celebrity.netWorth?.netWorthINR?.max || 0 
      },
    },
    lastUpdated: celebrity.netWorth?.lastUpdated 
      ? new Date(celebrity.netWorth.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : "Recently",
    description: celebrity.netWorth?.analysisSummary || celebrity.netWorth?.description || "",
  } : null;

  const incomeBreakdown = [
    {
      icon: "🎬",
      title: "Film Production & Acting",
      percentage: 45,
      description:
        "Box office earnings, profit shares, and production ventures through Red Chillies Entertainment",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: "🏢",
      title: "Brand Endorsements",
      percentage: 30,
      description: "Premium endorsement deals with global and Indian brands",
      color: "from-green-500 to-yellow-500",
    },
    {
      icon: "🏏",
      title: "IPL & Sports Ventures",
      percentage: 15,
      description:
        "Kolkata Knight Riders ownership and sports-related investments",
      color: "from-green-500 to-green-400",
    },
    {
      icon: "🏠",
      title: "Real Estate & Investments",
      percentage: 10,
      description:
        "Properties in Mumbai, Dubai, London, and strategic business investments",
      color: "from-red-500 to-red-400",
    },
  ];

  const parseNetWorthString = (str) => {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    // Remove symbols and handle M/Cr
    const clean = str.replace(/[₹$,]/g, "").toUpperCase();
    let val = parseFloat(clean);
    if (clean.includes("M")) val = val; // Assuming base is M
    else if (clean.includes("CR")) val = val * 0.12; // Very rough conversion for scale, but let's just use numeric values
    return isNaN(val) ? 0 : val;
  };

  const timelineData = dynamicTimeline.length > 0
    ? dynamicTimeline.map(item => ({
        year: item.year,
        value: parseNetWorthString(item.netWorth),
        displayValue: item.netWorth
      })).sort((a, b) => a.year - b.year)
    : celebrity?.netWorthTimeline?.timeline && celebrity.netWorthTimeline.timeline.length > 0
    ? celebrity.netWorthTimeline.timeline.map(item => ({
        year: item.year,
        value: parseNetWorthString(item.netWorth),
        displayValue: item.netWorth
      })).sort((a, b) => a.year - b.year)
    : [
        { year: 2000, value: 50 },
        { year: 2005, value: 150 },
        { year: 2010, value: 280 },
        { year: 2015, value: 480 },
        { year: 2018, value: 600 },
        { year: 2020, value: 650 },
        { year: 2023, value: 720 },
        { year: 2025, value: 780 },
      ];

  const milestones = dynamicMilestones.length > 0
    ? dynamicMilestones.map((m, index) => ({
        year: m.year,
        text: m.milestone,
        color: index % 2 === 0 ? "bg-yellow-500" : "bg-red-500"
      }))
    : celebrity?.netWorthTimeline?.keyMilestones && celebrity.netWorthTimeline.keyMilestones.length > 0
    ? celebrity.netWorthTimeline.keyMilestones.map((m, index) => ({
        year: m.year,
        text: m.milestone,
        color: index % 2 === 0 ? "bg-yellow-500" : "bg-red-500"
      }))
    : [
        { year: 2005, text: "DDLJ becomes longest running film", color: "bg-yellow-500" },
        { year: 2010, text: "My Name Is Khan global success", color: "bg-red-500" },
        { year: 2015, text: "Dilwale breaks records", color: "bg-yellow-500" },
        { year: 2018, text: "KKR IPL championship win", color: "bg-red-500" },
        { year: 2023, text: "Pathaan breaks all-time records", color: "bg-yellow-500" },
        { year: 2025, text: "Continued global expansion", color: "bg-red-500" },
      ];

  // Dynamically generate comparisons from fetched celebrities
  const comparisons = allCelebrities
    .filter(c => c.heroSection?.slug !== processedCelebrity?.slug) // Don't compare with self
    .map(c => ({
      name: c.heroSection?.name || "Unknown",
      slug: c.heroSection?.slug || "",
      image: c.heroSection?.profileImage || "/placeholder.jpg",
      netWorth: c.netWorth?.netWorthUSD?.display || `$${c.netWorth?.netWorthUSD?.min}M`,
      status: c.heroSection?.careerStage || "Active",
      statusColor: c.heroSection?.careerStage === "Peak" ? "text-cyan-400" : "text-green-400",
    }))
    .slice(0, 3); // Show 3 to leave room for Top 5 Richest card

  const top5Richest = [...allCelebrities]
    .sort((a, b) => {
      const aVal = a.netWorth?.netWorthUSD?.max || 0;
      const bVal = b.netWorth?.netWorthUSD?.max || 0;
      return bVal - aVal;
    })
    .slice(0, 5);

  const relatedIntelligence = [
    {
      icon: Film,
      iconBg: "bg-red-500/20",
      title: "Shah Rukh Khan Movies Intelligence",
      description:
        "Complete filmography analysis, box office performance, and career timeline",
    },
    {
      icon: Building2,
      iconBg: "bg-cyan-500/20",
      title: "Shah Rukh Khan Business Empire",
      description:
        "Red Chillies Entertainment, KKR ownership, and investment portfolio breakdown",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-yellow-500/20",
      title: "Why SRK is India's Richest Actor",
      description:
        "Strategic analysis of business decisions and wealth accumulation strategies",
      highlight: true,
    },
    {
      icon: BarChart3,
      iconBg: "bg-blue-500/20",
      title: "SRK Career Impact Score",
      description:
        "Quantified analysis of cultural impact, industry influence, and legacy metrics",
    },
  ];

  const faqs = dynamicFaqs.length > 0
    ? dynamicFaqs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))
    : celebrity?.faqs && celebrity.faqs.length > 0
    ? celebrity.faqs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))
    : [
        {
          question: "Is Shah Rukh Khan the richest actor in India?",
          answer:
            "Yes, Shah Rukh Khan is currently estimated to be the richest actor in India with a net worth of approximately $770-780 million. This places him significantly ahead of other Bollywood actors. His wealth comes from a combination of film earnings, production ventures, brand endorsements, and business investments including his stake in the Kolkata Knight Riders IPL team.",
        },
        {
          question: "Does this estimate include his IPL team ownership?",
          answer:
            "Yes, the estimate includes the value of his stake in Kolkata Knight Riders, which is estimated to be worth around $150-200 million based on current IPL team valuations.",
        },
        {
          question: "How accurate are these net worth estimates?",
          answer:
            "Our estimates are calculated using publicly available data including film earnings, brand endorsements, business investments, and asset valuations. We cross-reference multiple industry sources and financial reports to provide the most accurate range possible.",
        },
        {
          question: "How does SRK's net worth compare globally?",
          answer:
            "Shah Rukh Khan ranks among the top 10 richest actors in the world, competing with Hollywood stars. His diversified portfolio and business acumen have helped him build wealth comparable to international A-list celebrities.",
        },
      ];

  const sections = [
    { id: "net-worth-estimate", label: "Net Worth Estimate" },
    { id: "calculation-breakdown", label: "Calculation Breakdown" },
    { id: "wealth-timeline", label: "Wealth Timeline" },
    { id: "celebrity-comparisons", label: "Celebrity Comparisons" },
    { id: "related-intelligence", label: "Related Intelligence" },
    { id: "faqs", label: "FAQs" },
  ];

  const currencyConfig =
    currency === "USD"
      ? { symbol: "$", unit: "million", format: (n) => new Intl.NumberFormat("en-US").format(n) }
      : { symbol: "₹", unit: "crore", format: (n) => new Intl.NumberFormat("en-IN").format(n) };

  return (
    <section className="min-h-screen bg-[#0a0a0f]">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors cursor-pointer">
            Home
          </Link>
          <span className="text-gray-600">&gt;</span>
          <Link href="/celebrities" className="hover:text-white transition-colors cursor-pointer">
            Celebrities
          </Link>
          <span className="text-gray-600">&gt;</span>
          <span className="text-white">{processedCelebrity?.name || "Celebrity"}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Profile Header */}
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700">
                  <img
                    src={processedCelebrity?.image || "/placeholder.jpg"}
                    alt={processedCelebrity?.name || "Celebrity"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0a0a0f]" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-white">{processedCelebrity?.name || "Unknown Celebrity"}</h1>
                <div className="flex flex-wrap gap-2">
                  {processedCelebrity?.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-full border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                  <span className="text-cyan-400">📈</span>
                  <span className="text-cyan-400 text-sm font-medium">
                    Career: {processedCelebrity?.careerStatus || "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Worth Section */}
            <div
              id="net-worth-estimate"
              className="relative overflow-hidden rounded-3xl border border-gray-800 bg-[#1A1A24] shadow-[0_10px_40px_rgba(0,0,0,0.35)] p-8 md:p-10"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
              <div className="relative flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl md:text-4xl font-semibold text-slate-200">
                    {processedCelebrity?.name || "Celebrity"} Net Worth
                  </h2>
                  <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium text-[#00D9FF] bg-[#00D9FF1F]">
                    2025
                  </span>
                </div>
                <div className="flex rounded-xl overflow-hidden border border-gray-700 bg-black/20">
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold rounded-md transition-all cursor-pointer ${
                      currency === "USD"
                        ? "bg-[#00D9FF] text-[#0A0A0F]"
                        : "bg-transparent text-[#A1A1A8] hover:text-[#E5E7EB]"
                    }`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setCurrency("INR")}
                    className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold rounded-md transition-all cursor-pointer ${
                      currency === "INR"
                        ? "bg-[#00D9FF] text-[#0A0A0F]"
                        : "bg-transparent text-[#A1A1A8] hover:text-[#E5E7EB]"
                    }`}
                  >
                    INR
                  </button>
                </div>
              </div>
              <p className="relative text-[#6E6E73] text-sm mb-6">
                Real-time estimated wealth analysis
              </p>
            
              <div className="relative mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl leading-none font-semibold tracking-tight bg-gradient-to-r from-[#00D9FF] to-[#1AD1FF] bg-clip-text text-transparent">
                    {currencyConfig.symbol}
                    {currencyConfig.format(
                      currency === "USD" ? processedCelebrity?.netWorth.usd.min : processedCelebrity?.netWorth.inr.min
                    )}{' '}
                    {currencyConfig.unit}
                  </span>
                  <span className="text-2xl md:text-3xl text-gray-400">
                    – {currencyConfig.symbol}
                    {currencyConfig.format(
                      currency === "USD" ? processedCelebrity?.netWorth.usd.max : processedCelebrity?.netWorth.inr.max
                    )}{' '}
                    {currencyConfig.unit}
                  </span>
                </div>
                <p className="text-gray-500 mt-2">Estimated net worth</p>
              </div>
            
              <div className="relative flex items-center gap-6 text-xs md:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {processedCelebrity?.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Range based on verified sources</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-[#A1A1A8] leading-relaxed">{processedCelebrity?.description}</p>

            {/* How Net Worth is Calculated */}
            <div
              id="calculation-breakdown"
              className="bg-[#121218] rounded-2xl border border-gray-800 overflow-hidden mb-10"
            >
              <button
                onClick={() => setExpandedCalculation(!expandedCalculation)}
                className="w-full flex items-center justify-between p-5 bg-[#1A1A24] border border-gray-800 rounded-xl hover:bg-[#0F0F14] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#00D9FF1F] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#00D9FF]" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-[#F5F5F7] mb-0.5">
                      How This Net Worth is Calculated
                    </h3>
                    <p className="text-sm text-[#6E6E73]">
                      Comprehensive breakdown of income sources
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform ${
                    expandedCalculation ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandedCalculation && (
                <div className="mt-4 px-6 pb-6 space-y-6 bg-[#121218] border border-gray-800 rounded-xl">
                  {incomeBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-[#00D9FF1F] grid place-items-center">
                            <span className="text-[#00D9FF] text-sm">{item.icon}</span>
                          </div>
                          <span className="text-sm text-[#F5F5F7] font-semibold">{item.title}</span>
                        </div>
                        <span className="text-sm text-[#FFB800] font-semibold">{item.percentage}%</span>
                      </div>
                      <div className="relative h-2 rounded-full overflow-hidden bg-[#1f2733]">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#00D9FF] to-[#FF3B30]"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#6E6E73] pl-6">{item.description}</p>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="text-sm text-[#F5F5F7] font-semibold mb-2">Our Methodology</h4>
                    <p className="text-sm text-[#6E6E73]">
                      Net worth estimates are calculated using publicly available data
                      including film earnings, brand endorsements, business investments,
                      and asset valuations. We cross-reference multiple industry sources
                      and financial reports to provide the most accurate range possible.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Net Worth Timeline */}
            <div
              id="wealth-timeline"
              className="bg-[#1A1A24] rounded-xl border border-gray-800 p-6 mb-10"
            >
              <h3 className="text-xl font-bold text-white mb-2">Net Worth Timeline</h3>
              <p className="text-gray-500 text-sm mb-8">
                Historical wealth growth with key milestones
              </p>

              {/* Chart */}
              <div className="relative h-64 mb-8" suppressHydrationWarning>
                {mounted ? (() => {
                  const maxVal = Math.max(...timelineData.map(d => d.value), 800);
                  const minYear = Math.min(...timelineData.map(d => d.year));
                  const maxYear = Math.max(...timelineData.map(d => d.year));
                  const yearRange = maxYear - minYear || 1;
                  
                  const getX = (year) => ((year - minYear) / yearRange) * 800;
                  const getY = (value) => 200 - (value / maxVal) * 200;
                  
                  const pathData = timelineData.map((d, i) => 
                    `${i === 0 ? 'M' : 'L'} ${getX(d.year)},${getY(d.value)}`
                  ).join(' ');

                  return (
                    <>
                      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-[#6E6E73]">
                        <span>${maxVal}M</span>
                        <span>${Math.round(maxVal * 0.75)}M</span>
                        <span>${Math.round(maxVal * 0.5)}M</span>
                        <span>${Math.round(maxVal * 0.25)}M</span>
                        <span>$0M</span>
                      </div>
                      <svg
                        className="w-full h-full pl-12"
                        viewBox="0 0 800 200"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00D9FF" />
                            <stop offset="100%" stopColor="#FF3B30" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                          <line
                            key={i}
                            x1="0"
                            y1={p * 200}
                            x2="800"
                            y2={p * 200}
                            stroke="#1f2733"
                            strokeDasharray="4"
                          />
                        ))}
                        {/* Line chart */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                        />
                        {/* Data points */}
                        {timelineData.map((point, index) => {
                          const hasMilestone = milestones.some(m => m.year === point.year);
                          const cx = getX(point.year);
                          const cy = getY(point.value);
                          
                          return (
                            <g key={index} className="group/point">
                              {hasMilestone && (
                                <>
                                  <circle cx={cx} cy={cy} r="10" fill="transparent" stroke="#ffffff" strokeOpacity="0.5" />
                                  <circle cx={cx} cy={cy} r="6" fill="#0a0a0f" stroke="#ef4444" strokeWidth="2" />
                                </>
                              )}
                              <circle
                                cx={cx}
                                cy={cy}
                                r="6"
                                fill={hasMilestone ? "transparent" : (index < timelineData.length / 2 ? "#eab308" : "#ef4444")}
                                className="cursor-pointer group-hover/point:r-8 transition-all"
                              />
                              <title>{point.year}: {point.displayValue || `$${point.value}M`}</title>
                            </g>
                          );
                        })}
                      </svg>
                      <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-gray-500">
                        {timelineData.map((point) => (
                          <span key={point.year}>{point.year}</span>
                        ))}
                      </div>
                    </>
                  );
                })() : (
                  <div className="absolute inset-0 rounded-lg bg-black/20 border border-gray-800 animate-pulse" />
                )}
              </div>

              {/* Key Milestones */}
              <div>
                <h4 className="text-sm text-gray-500 mb-4">Key Milestones</h4>
                <div className="grid grid-cols-2 gap-3">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${milestone.color}`} />
                      <span className="text-sm text-gray-400">
                        {milestone.year}: {milestone.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Celebrity Comparisons */}
            <div id="celebrity-comparisons">
              <h3 className="text-xl font-bold text-white mb-2">
                How {celebrity.name} Compares
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Explore net worth intelligence for similar celebrities
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {comparisons.map((celeb, index) => (
                  <Link
                    key={index}
                    href={`/celebrity/${celeb.slug}/profile`}
                    className={`group relative rounded-2xl overflow-hidden border bg-[var(--ff-dark-elevated)] transition-all duration-300 cursor-pointer hover:border-[var(--ff-cinema-red)] hover:shadow-[0_0_0_1px_var(--ff-cinema-red-glow)] ${
                      celeb.highlight
                        ? "border-cyan-600/50"
                        : "border-[var(--ff-border)]"
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden border border-[var(--ff-border-subtle)] relative">
                      <img
                        src={celeb.image}
                        alt={celeb.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[var(--ff-deep-dark)]/80 backdrop-blur-sm border border-[var(--ff-border)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-right w-4 h-4 text-[var(--ff-cinema-red)]"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4
                        className={`text-base mb-2 font-semibold transition-colors ${
                          celeb.highlight
                            ? "text-[var(--ff-text-primary)] group-hover:text-[var(--ff-cinema-red)]"
                            : "text-[var(--ff-text-primary)] group-hover:text-[var(--ff-cinema-red)]"
                        }`}
                      >
                        {celeb.name}
                      </h4>
                      <p className="text-lg text-[var(--ff-electric-blue)] mb-3">{celeb.netWorth}</p>
                      <span
                        className={[
                          "inline-flex items-center justify-center rounded-md px-2 py-0.5 w-fit whitespace-nowrap shrink-0 gap-1 text-xs font-medium border",
                          celeb.status === "Peak"
                            ? "text-[var(--ff-amber)] border-[var(--ff-amber)] bg-[var(--ff-amber-muted)]"
                            : celeb.status === "Rising"
                            ? "text-[var(--ff-electric-blue)] border-[var(--ff-electric-blue)] bg-[rgba(0,217,255,0.12)]"
                            : "text-[var(--ff-neutral-text)] border-[var(--ff-neutral-border)] bg-[var(--ff-neutral-bg)]"
                        ].join(" ")}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {celeb.status}
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Top 5 Richest Card */}
                <div 
                  onClick={() => setShowTop5Modal(true)}
                  className="group relative rounded-2xl overflow-hidden border border-[var(--ff-border)] bg-[var(--ff-dark-elevated)] hover:border-[var(--ff-cinema-red)] hover:shadow-[0_0_0_1px_var(--ff-cinema-red-glow)] transition-all duration-300 cursor-pointer"
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden border border-[var(--ff-border-subtle)] relative">
                    <img
                      src={top5Richest[0]?.heroSection?.profileImage || "/placeholder.jpg"}
                      alt="Top 5 Richest"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[var(--ff-deep-dark)]/80 backdrop-blur-sm border border-[var(--ff-border)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-4 h-4 text-[var(--ff-cinema-red)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 18l6-6-6-6"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-white">Top 5 Richest</h4>
                    <p className="text-cyan-400 font-bold">View List</p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-400">Rising</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Intelligence */}
            <div id="related-intelligence">
              <h3 className="text-xl font-bold text-white mb-2">Related Intelligence</h3>
              <p className="text-gray-500 text-sm mb-6">
                Deep dive into {celebrity.name}&apos;s career, business, and impact
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedIntelligence.map((item, index) => (
                  <div
                    key={index}
                    className={[
                      "group p-5 rounded-xl border transition-all cursor-pointer",
                      "bg-[var(--ff-dark-elevated)] border-[var(--ff-border)] hover:border-[var(--ff-electric-blue)] hover:shadow-[var(--ff-electric-blue-glow)]"
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${item.highlight ? "bg-[var(--ff-amber-muted)] text-[var(--ff-amber)]" : item.iconBg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}
                      >
                        {item.icon ? <item.icon className="w-6 h-6" /> : null}
                      </div>
                      <div>
                        <h4
                          className={[
                            "font-semibold mb-1 transition-colors",
                            "text-[var(--ff-text-primary)] group-hover:text-[var(--ff-electric-blue)]"
                          ].join(" ")}
                        >
                          {item.title}
                        </h4>
                        <p className="text-sm leading-relaxed text-[#6E6E73] group-hover:text-[#6E6E73]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div id="faqs">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl">❓</span>
                <h3 className="text-xl font-bold text-white">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? -1 : index)}
                      className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span className="text-white font-medium text-left">
                        {faq.question}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          expandedFaq === index ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {expandedFaq === index && (
                      <div className="px-5 pb-5">
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-[#12121a] p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-10 w-10 md:h-12 md:w-12 grid place-items-center rounded-xl border border-cyan-700/40 bg-cyan-600/10 text-cyan-300 flex-shrink-0">
                  <Shield className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    About Our Net Worth Estimates
                  </h3>
                  <p className="mt-2 text-sm md:text-base text-gray-400">
                    FilmyFire provides estimated net worth information based on publicly available data and industry analysis. Our estimates are meant for informational purposes only.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-6">
                <div className="rounded-xl border border-gray-800 bg-black/30 p-4">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-semibold">Multi-Source Verification</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400">
                    Cross‑referenced from industry reports and public records
                  </p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-black/30 p-4">
                  <div className="flex items-center gap-2 text-cyan-400 mb-2">
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-sm font-semibold">Regular Updates</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400">
                    Periodically updated to reflect latest information
                  </p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-black/30 p-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm font-semibold">Estimated Range</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400">
                    Actual net worth may vary from our estimates
                  </p>
                </div>
              </div>

              <div className="my-6 h-px bg-gray-800" />
              <p className="text-xs md:text-sm text-gray-500">
                Net worth calculations include estimated earnings from films, brand endorsements, business ventures, and known investments. These figures are not officially confirmed by the celebrities and should be considered as educated estimates based on available public information.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="lg:sticky lg:top-28 space-y-6">
              {/* Quick Facts */}
              <div className="bg-[#1A1A24] rounded-xl border border-gray-800 p-5">
                <h3 className="text-sm font-semibold text-[#F5F5F7] mb-4">Quick Facts</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-[#00D9FF]" />
                    <div>
                      <p className="text-xs text-[#6E6E73]">Age</p>
                      <p className="text-sm text-[#F5F5F7]">{processedCelebrity?.age ? `${processedCelebrity.age} years` : "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-[#00D9FF]" />
                    <div>
                      <p className="text-xs text-[#6E6E73]">Profession</p>
                      <p className="text-sm text-[#F5F5F7]">{processedCelebrity?.profession || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#00D9FF]" />
                    <div>
                      <p className="text-xs text-[#6E6E73]">Active Since</p>
                      <p className="text-sm text-[#F5F5F7]">{processedCelebrity?.activeSince || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jump to Section */}
              <div className="bg-[#1A1A24] rounded-xl border border-gray-800 p-5">
                <h3 className="text-sm font-semibold text-[#F5F5F7] mb-4">Jump to Section</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(section.id);
                        const el = typeof window !== "undefined" ? document.getElementById(section.id) : null;
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={[
                        "w-full text-left text-sm transition-colors py-1.5 px-2 rounded",
                        activeSection === section.id
                          ? "bg-[#0F0F14] text-[#FF3B30]"
                          : "text-[#A1A1A8] hover:text-[#FF3B30] hover:bg-[#0F0F14]"
                      ].join(" ")}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* View Full Profile CTA */}
              <Link
                href={processedCelebrity?.slug ? `/celebrity/${processedCelebrity.slug}/profile` : "#"}
                className="flex items-center justify-between bg-gradient-to-br from-[#FF2D2D] to-[#E01414] rounded-2xl p-4 md:p-5 cursor-pointer hover:from-[#FF3B30] hover:to-[#FF2D2D] transition-all duration-300 group"
              >
                <div>
                  <p className="text-sm text-white mb-1">View Full Profile</p>
                  <p className="text-xs text-white/80">
                    Complete {processedCelebrity?.name || "Celebrity"} intelligence
                  </p>
                </div>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white border border-white/20 group-hover:bg-white/20 transition">
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Richest Modal */}
      {showTop5Modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1A24] border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#0F0F14]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Top 5 Richest</h3>
                  <p className="text-xs text-gray-500">Global net worth rankings</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTop5Modal(false)}
                className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {top5Richest.map((celeb, index) => (
                <Link
                  key={celeb._id}
                  href={`/celebrity/${celeb.heroSection.slug}/profile`}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-[#0F0F14] border border-gray-800 hover:border-cyan-500/50 hover:bg-[#12121a] transition-all group cursor-pointer"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={celeb.heroSection.profileImage || "/placeholder.jpg"} 
                      alt={celeb.heroSection.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-white/10">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold truncate group-hover:text-cyan-400 transition-colors">
                      {celeb.heroSection.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {Array.isArray(celeb.heroSection.profession) 
                        ? celeb.heroSection.profession[0] 
                        : celeb.heroSection.profession}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-bold">
                      {celeb.netWorth?.netWorthUSD?.display || `$${celeb.netWorth?.netWorthUSD?.max}M`}
                    </p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">Net Worth</p>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="p-6 bg-[#0F0F14] border-t border-gray-800">
              <Link 
                href="/celebrities/top-10-richest"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-center font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-900/20"
              >
                View Full Top 10 Ranking
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
