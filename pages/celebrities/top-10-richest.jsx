import { ExternalLink, ArrowLeft, Search, TrendingUp, DollarSign, Award, Info, Users, Shield, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export async function getServerSideProps(context) {
  const { req } = context;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/celebrities/top-10-richest`);
    const data = await res.json();

    if (!data.success) {
      return { props: { celebrities: [] } };
    }

    return {
      props: { celebrities: data.data },
    };
  } catch (error) {
    console.error("Failed to fetch top 10 richest celebrities:", error);
    return { props: { celebrities: [] } };
  }
}

export default function Top10RichestPage({ celebrities }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCelebrities = celebrities.filter((celebrity) =>
    celebrity.heroSection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredCelebrities.slice(0, 3);
  const others = filteredCelebrities.slice(3);

  if (!mounted) return null;

  return (
   
      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-red-600/30 font-sans pb-24 pt-20">
        {/* Navigation Header */}
        <nav className="sticky top-0 z-[60] bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4">
          <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
            <Link 
              href="/celebrities"
              className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-xs font-bold group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline uppercase tracking-widest">Back to Celebrities</span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                Elite Wealth Intelligence
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-red-600/10 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                {filteredCelebrities.length} Verified Records
              </span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative pt-20 pb-12 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-red-600/10 via-transparent to-transparent blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Real-time Wealth Rankings 2024</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Top 10 Richest <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-red-500">Celebrities</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-zinc-400 leading-relaxed mb-10">
              A definitive analysis of the industry&apos;s most influential financial empires.  
              Powered by real-time data and multi-source verification. 
            </p>

            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                placeholder="Search elite profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-500 rounded-2xl pl-14 pr-6 py-5 text-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all backdrop-blur-md"
              />
            </div>
          </div>
        </div>

        {/* Top 3 Spotlight */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {topThree.map((celebrity, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              return (
                <Link
                  key={celebrity._id}
                  href={`/celebrity/${celebrity.heroSection.slug}/profile`}
                  className={`group relative rounded-[2.5rem] overflow-hidden border transition-all duration-500 ${
                    isFirst 
                    ? "md:order-2 border-amber-500/30 bg-amber-500/[0.03] scale-105 shadow-[0_0_50px_rgba(245,158,11,0.1)]" 
                    : rank === 2 ? "md:order-1 border-white/10 bg-white/[0.02]" : "md:order-3 border-white/10 bg-white/[0.02]"
                  }`} >
                  <div className={`relative aspect-[4/5] overflow-hidden ${isFirst ? 'md:aspect-[4/6]' : ''}`}>
                    <img
                      src={celebrity.heroSection.profileImage || "/placeholder.jpg"}
                      alt={celebrity.heroSection.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                    
                    {/* Rank Badge */}
                    <div className={`absolute top-6 left-6 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border backdrop-blur-xl z-20 ${
                      isFirst ? "bg-amber-500 border-amber-400 text-black shadow-lg" : "bg-black/50 border-white/20 text-white"
                    }`}>
                      #{rank}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-90" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 pt-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                          isFirst ? "bg-amber-500/20 text-amber-500" : "bg-white/10 text-zinc-400"
                        }`}>
                          {celebrity.heroSection.careerStage || "Elite"}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors tracking-tight">
                        {celebrity.heroSection.name}
                      </h3>
                      <p className={`text-2xl font-black ${isFirst ? "text-amber-500" : "text-zinc-400"}`}>
                        {celebrity.netWorth.netWorthUSD.display || `$${celebrity.netWorth.netWorthUSD.max}M`}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Others List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-8 h-[2px] bg-red-600 rounded-full" />
              Wealth Ranking <span className="text-zinc-500 text-sm font-medium">#4 - #10</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {others.map((celebrity, index) => (
              <Link
                key={celebrity._id}
                href={`/celebrity/${celebrity.heroSection.slug}/profile`}
                className="group bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden hover:border-red-500/50 hover:bg-white/[0.02] transition-all duration-300 relative" >
                <div className="relative aspect-[5/4] overflow-hidden">
                  <img
                    src={celebrity.heroSection.profileImage || "/placeholder.jpg"}
                    alt={celebrity.heroSection.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/10 z-10">
                    #{index + 4}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors truncate tracking-tight">
                      {celebrity.heroSection.name}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-[0.1em] mb-1">Estimated Net Worth</p>
                      <p className="text-xl font-black text-amber-500 tracking-tight">
                        {celebrity.netWorth.netWorthUSD.display || `$${celebrity.netWorth.netWorthUSD.max}M`}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-red-600 group-hover:border-red-500 transition-all">
                      <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white rotate-180 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredCelebrities.length === 0 && (
            <div className="text-center py-32 bg-white/[0.02] rounded-[3rem] border border-white/5 border-dashed">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Records Found</h3>
              <p className="text-zinc-500 max-w-sm mx-auto">
                No celebrities match your search criteria. Please try a different name.
              </p>
            </div>
          )}
        </div>

        {/* Wealth Methodology Info */}
        <div className="max-w-4xl mx-auto px-4 mt-32">
          <div className="p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900 to-black border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] group-hover:bg-red-600/10 transition-all" />            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-500/20">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Our Elite Valuation Protocol</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="flex gap-4">
                  <Briefcase className="w-5 h-5 text-zinc-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Multi-Asset Analysis</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">Calculations include equity holdings, real estate portfolios, and private business ventures.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Users className="w-5 h-5 text-zinc-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Market Verification</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">Cross-referenced with verified financial reports and public disclosure records.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Calendar className="w-5 h-5 text-zinc-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Dynamic Updates</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">Data is adjusted periodically based on current market valuations and exchange rates.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Info className="w-5 h-5 text-zinc-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Estimated Ranges</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">Figures are conservative estimates intended for informational purposes.</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 text-[10px] uppercase font-bold text-zinc-600 tracking-[0.2em] text-center">
                Strictly Confidential Intelligence &copy; 2024 FilmyFire Platform
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
Top10RichestPage.noPadding = true;
