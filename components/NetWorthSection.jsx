"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, CheckCircle2, RefreshCw, AlertTriangle, Clock, Info, User, Briefcase, Calendar, TrendingUp } from "lucide-react";

export default function NetWorthSection({ celebrity }) {
  const [currency, setCurrency] = useState("USD");
  const [expandedCalculation, setExpandedCalculation] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [allCelebrities, setAllCelebrities] = useState([]);

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

  const timelineData = [
    { year: 2000, value: 50 },
    { year: 2005, value: 150 },
    { year: 2010, value: 280 },
    { year: 2015, value: 480 },
    { year: 2018, value: 600 },
    { year: 2020, value: 650 },
    { year: 2023, value: 720 },
    { year: 2025, value: 780 },
  ];

  const milestones = [
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
    .slice(0, 4); // Show top 4 for now

  const relatedIntelligence = [
    {
      icon: "🎬",
      iconBg: "bg-red-500/20",
      title: "Shah Rukh Khan Movies Intelligence",
      description:
        "Complete filmography analysis, box office performance, and career timeline",
    },
    {
      icon: "🏢",
      iconBg: "bg-green-500/20",
      title: "Shah Rukh Khan Business Empire",
      description:
        "Red Chillies Entertainment, KKR ownership, and investment portfolio breakdown",
    },
    {
      icon: "📈",
      iconBg: "bg-yellow-500/20",
      title: "Why SRK is India's Richest Actor",
      description:
        "Strategic analysis of business decisions and wealth accumulation strategies",
      highlight: true,
    },
    {
      icon: "📊",
      iconBg: "bg-purple-500/20",
      title: "SRK Career Impact Score",
      description:
        "Quantified analysis of cultural impact, industry influence, and legacy metrics",
    },
  ];

  const faqs = [
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

  const [activeSection, setActiveSection] = useState("net-worth-estimate");

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
              <div className="relative h-64 mb-8">
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-[#6E6E73]">
                  <span>$800M</span>
                  <span>$600M</span>
                  <span>$400M</span>
                  <span>$200M</span>
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
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 50}
                      x2="800"
                      y2={i * 50}
                      stroke="#1f2733"
                      strokeDasharray="4"
                    />
                  ))}
                  {/* Guide line at 2020 */}
                  <line x1="500" y1="0" x2="500" y2="200" stroke="#9ca3af" strokeOpacity="0.5" />
                  {/* Line chart */}
                  <path
                    d="M 0,175 L 100,162 L 200,130 L 300,88 L 400,50 L 500,37 L 600,25 L 700,10"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                  />
                  {/* Data points */}
                  {timelineData.map((point, index) => (
                    <circle
                      key={index}
                      cx={index * 100}
                      cy={200 - (point.value / 800) * 200}
                      r="6"
                      fill={index < 5 ? "#eab308" : "#ef4444"}
                      className="cursor-pointer hover:r-8 transition-all"
                    />
                  ))}
                  {/* Highlight ring at 2020 */}
                  <circle cx="500" cy={200 - (650 / 800) * 200} r="7.5" fill="transparent" stroke="#ffffff" strokeOpacity="0.9" />
                  <circle cx="500" cy={200 - (650 / 800) * 200} r="5" fill="#0a0a0f" stroke="#FF3B30" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-gray-500">
                  {timelineData.map((point) => (
                    <span key={point.year}>{point.year}</span>
                  ))}
                </div>
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
                    href={`/celebrity/${processedCelebrity?.slug}/compare?with=${celeb.slug}`}
                    className={`group relative rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                      celeb.highlight
                        ? "border-cyan-500 bg-[#12121a]"
                        : "border-gray-800 bg-[#12121a] hover:border-gray-600"
                    }`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={celeb.image}
                        alt={celeb.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4
                        className={`font-semibold ${
                          celeb.highlight ? "text-cyan-400" : "text-white"
                        }`}
                      >
                        {celeb.name}
                      </h4>
                      <p className="text-cyan-400 font-bold">{celeb.netWorth}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs ${celeb.statusColor}`}>📈</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${
                            celeb.status === "Peak"
                              ? "border-cyan-500/30 text-cyan-400"
                              : celeb.status === "Rising"
                              ? "border-green-500/30 text-green-400"
                              : "border-gray-600 text-gray-400"
                          }`}
                        >
                          {celeb.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
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
                    className={`group p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                      item.highlight
                        ? "border-yellow-500/50 bg-[#12121a] hover:border-yellow-500"
                        : "border-gray-800 bg-[#12121a] hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-xl">{item.icon}</span>
                      </div>
                      <div>
                        <h4
                          className={`font-semibold mb-1 ${
                            item.highlight ? "text-yellow-400" : "text-white"
                          }`}
                        >
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500">{item.description}</p>
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
    </section>
  );
}
