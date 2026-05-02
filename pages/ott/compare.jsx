import { useState, useEffect } from "react";
import Head from "next/head";
import PublicLayout from "@/components/PublicLayout";
import { ArrowLeft, ChevronRight, BarChart3, Users, DollarSign, Activity, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function OTTComparePage() {
  const router = useRouter();
  const { one, two } = router.query;
  const [platformOne, setPlatformOne] = useState(null);
  const [platformTwo, setPlatformTwo] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const res = await fetch("/api/ott");
        const json = await res.json();
        if (json.success) setPlatforms(json.data);
      } catch (error) {
        console.error("Error fetching platforms:", error);
      }
    };
    fetchPlatforms();
  }, []);

  useEffect(() => {
    if (one && two) {
      const fetchComparison = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/ott/compare?one=${one}&two=${two}`);
          const json = await res.json();
          if (json.success) {
            setPlatformOne(json.data.platformOne);
            setPlatformTwo(json.data.platformTwo);
          }
        } catch (error) {
          console.error("Error fetching comparison:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchComparison();
    } else {
      setLoading(false);
    }
  }, [one, two]);

  const ComparisonRow = ({ label, val1, val2, suffix = "", highlight1, highlight2 }) => (
    <div className="grid grid-cols-3 border-b border-zinc-800 hover:bg-zinc-800/20 transition-colors">
       <div className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 border-r border-zinc-800 flex items-center">{label}</div>
       <div className={`px-8 py-6 text-xl font-black text-center border-r border-zinc-800 ${highlight1 ? 'text-green-400' : ''}`}>{val1}{suffix}</div>
       <div className={`px-8 py-6 text-xl font-black text-center ${highlight2 ? 'text-green-400' : ''}`}>{val2}{suffix}</div>
    </div>
  );

  const FeatureCheck = ({ label, feat1, feat2 }) => (
    <div className="grid grid-cols-3 border-b border-zinc-800 py-4">
       <div className="px-8 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center">{label}</div>
       <div className="px-8 text-center border-r border-zinc-800">
         {feat1 ? <span className="text-green-400 text-lg">✓</span> : <span className="text-red-400 text-lg">✗</span>}
       </div>
       <div className="px-8 text-center">
         {feat2 ? <span className="text-green-400 text-lg">✓</span> : <span className="text-red-400 text-lg">✗</span>}
       </div>
    </div>
  );

  const ScoreBar = ({ label, score1, score2 }) => (
    <div className="px-8 py-8 border-b border-zinc-800">
       <div className="text-center mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{label}</span>
       </div>
       <div className="flex items-center gap-12">
          <div className="flex-1 flex flex-col items-end gap-3">
             <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden rotate-180">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score1 * 10}%` }}
                  className="h-full bg-red-600" 
                />
             </div>
             <span className="text-2xl font-black text-red-500">{score1}/10</span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
             <Zap className="w-6 h-6 text-zinc-700" />
          </div>
          <div className="flex-1 flex flex-col items-start gap-3">
             <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score2 * 10}%` }}
                  className="h-full bg-blue-600" 
                />
             </div>
             <span className="text-2xl font-black text-blue-500">{score2}/10</span>
          </div>
       </div>
    </div>
  );

  return (
    <PublicLayout noPadding={true}>
      <Head>
        <title>Head-to-Head OTT Comparison | FilmyFire Intelligence</title>
      </Head>

      <div className="min-h-screen bg-[#050505] text-white pt-20 pb-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          
          <Link href="/ott" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Intelligence
          </Link>

          <div className="mb-16">
             <h1 className="text-5xl lg:text-7xl font-black mb-4 tracking-tight">Platform Battle</h1>
             <p className="text-xl text-zinc-500 font-medium max-w-2xl">
               Head-to-head analysis of pricing, content library strength, and regional dominance.
             </p>
          </div>

          {!one || !two ? (
             <div className="p-20 rounded-[4rem] bg-zinc-900/30 border border-zinc-800 border-dashed text-center">
                <BarChart3 className="w-20 h-20 text-zinc-700 mx-auto mb-8" />
                <h2 className="text-3xl font-black mb-4">Select Platforms to Compare</h2>
                <p className="text-zinc-500 mb-10 max-w-md mx-auto">Choose two streaming platforms to see their detailed intelligence comparison.</p>
                
                <div className="flex flex-wrap justify-center gap-4">
                   {platforms.slice(0, 6).map(p => (
                     <button 
                       key={p._id}
                       onClick={() => {
                         const currentOne = one || p.slug;
                         const currentTwo = one ? p.slug : 'prime-video';
                         router.push(`/ott/compare?one=${currentOne}&two=${currentTwo}`);
                       }}
                       className="px-6 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-xs font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                     >
                       {p.name}
                     </button>
                   ))}
                </div>
             </div>
          ) : loading ? (
             <div className="h-96 rounded-[4rem] bg-zinc-900/30 border border-zinc-800 animate-pulse flex items-center justify-center">
                <p className="text-zinc-500 font-bold uppercase tracking-[0.3em]">Gathering Intelligence...</p>
             </div>
          ) : (
             <div className="rounded-[4rem] bg-zinc-900/20 border border-zinc-800 overflow-hidden">
                <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-900/50">
                   <div className="p-12 border-r border-zinc-800 flex items-center justify-center">
                      <div className="text-6xl font-black text-zinc-800">VS</div>
                   </div>
                   <div className="p-12 border-r border-zinc-800 text-center">
                      <div className="w-24 h-24 rounded-3xl bg-zinc-800 mx-auto mb-6 flex items-center justify-center overflow-hidden">
                         {platformOne.logo ? <img src={platformOne.logo} className="w-full h-full object-cover" /> : <span className="text-3xl font-black">{platformOne.name[0]}</span>}
                      </div>
                      <h2 className="text-3xl font-black mb-2">{platformOne.name}</h2>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{platformOne.tagline}</p>
                   </div>
                   <div className="p-12 text-center">
                      <div className="w-24 h-24 rounded-3xl bg-zinc-800 mx-auto mb-6 flex items-center justify-center overflow-hidden">
                         {platformTwo.logo ? <img src={platformTwo.logo} className="w-full h-full object-cover" /> : <span className="text-3xl font-black">{platformTwo.name[0]}</span>}
                      </div>
                      <h2 className="text-3xl font-black mb-2">{platformTwo.name}</h2>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{platformTwo.tagline}</p>
                   </div>
                </div>

                <ComparisonRow label="Subscribers" val1={(platformOne.subscribers / 1000000).toFixed(0)} val2={(platformTwo.subscribers / 1000000).toFixed(0)} suffix="M" />
                <ComparisonRow label="Market Share" val1={platformOne.marketShare} val2={platformTwo.marketShare} suffix="%" />
                <ComparisonRow label="India Rank" val1={`#${platformOne.indiaRank}`} val2={`#${platformTwo.indiaRank}`} />
                <ComparisonRow label="Monthly Visits" val1={(platformOne.monthlyVisits / 1000000000).toFixed(1)} val2={(platformTwo.monthlyVisits / 1000000000).toFixed(1)} suffix="B" />
                <ComparisonRow label="Launch Year" val1={platformOne.launchYear} val2={platformTwo.launchYear} />
                <ComparisonRow label="Avg Deal Value" val1={platformOne.avgDealValue} val2={platformTwo.avgDealValue} />

                <div className="bg-zinc-900/30">
                   <ScoreBar label="Original Content Strength" score1={platformOne.comparisonStats?.originals} score2={platformTwo.comparisonStats?.originals} />
                   <ScoreBar label="Movie Library Strength" score1={platformOne.comparisonStats?.movies} score2={platformTwo.comparisonStats?.movies} />
                   <ScoreBar label="Pricing Competitive Index" score1={platformOne.comparisonStats?.price} score2={platformTwo.comparisonStats?.price} />
                   <ScoreBar label="India Reach Dominance" score1={platformOne.comparisonStats?.indiaReach} score2={platformTwo.comparisonStats?.indiaReach} />
                </div>

                <div className="grid grid-cols-3 p-12 bg-black/40">
                   <div className="flex items-center">
                      <h3 className="text-xl font-black uppercase tracking-widest text-zinc-600">Quick Comparison</h3>
                   </div>
                   <div className="px-8 space-y-4 border-r border-zinc-800">
                      {platformOne.producerInsights?.slice(0, 3).map((insight, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-600" /> {insight}
                        </div>
                      ))}
                   </div>
                   <div className="px-8 space-y-4">
                      {platformTwo.producerInsights?.slice(0, 3).map((insight, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> {insight}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {/* Enhanced Sections: Feature Matrix, Pricing, Content Library, Verdict */}
          {platformOne && platformTwo && (
            <>
              {/* Feature Matrix */}
              <div className="mt-12 mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-widest">Feature Matrix</h2>
                  <div className="h-px flex-1 bg-zinc-800 mx-8" />
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
                   <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-900/80">
                      <div className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-zinc-600 border-r border-zinc-800">Features</div>
                      <div className="px-8 py-6 text-xl font-black text-center border-r border-zinc-800">{platformOne.name}</div>
                      <div className="px-8 py-6 text-xl font-black text-center">{platformTwo.name}</div>
                   </div>
                   
                   <FeatureCheck label="4K Streaming" feat1={true} feat2={true} />
                   <FeatureCheck label="HDR Support" feat1={true} feat2={true} />
                   <FeatureCheck label="Dolby Atmos" feat1={true} feat2={platformTwo.name === "Netflix" ? false : true} />
                   <FeatureCheck label="Offline Downloads" feat1={true} feat2={true} />
                   <FeatureCheck label="Multiple Profiles" feat1={true} feat2={true} />
                   <FeatureCheck label="Parental Controls" feat1={true} feat2={true} />
                   <FeatureCheck label="Live Sports" feat1={platformOne.name === "Disney+ Hotstar"} feat2={platformTwo.name === "Disney+ Hotstar"} />
                   <FeatureCheck label="Regional Content" feat1={platformOne.name === "Amazon Prime Video"} feat2={platformTwo.name === "Amazon Prime Video"} />
                </div>
              </div>

              {/* Pricing Comparison */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-widest">Pricing Plans</h2>
                  <div className="h-px flex-1 bg-zinc-800 mx-8" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <h3 className="text-2xl font-black mb-6 text-center">{platformOne.name}</h3>
                    <div className="space-y-4">
                      {platformOne.pricing?.map((plan, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-zinc-800/50 rounded-xl">
                          <span className="font-semibold">{plan.plan}</span>
                          <span className="text-xl font-black text-green-400">{plan.price}</span>
                        </div>
                      ))}
                    </div>
                    {platformOne.revenue && (
                      <div className="mt-6 pt-6 border-t border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Average Revenue Per User</p>
                        <p className="text-2xl font-black">{platformOne.revenue.arpu}/month</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <h3 className="text-2xl font-black mb-6 text-center">{platformTwo.name}</h3>
                    <div className="space-y-4">
                      {platformTwo.pricing?.map((plan, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-zinc-800/50 rounded-xl">
                          <span className="font-semibold">{plan.plan}</span>
                          <span className="text-xl font-black text-green-400">{plan.price}</span>
                        </div>
                      ))}
                    </div>
                    {platformTwo.revenue && (
                      <div className="mt-6 pt-6 border-t border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Average Revenue Per User</p>
                        <p className="text-2xl font-black">{platformTwo.revenue.arpu}/month</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Library Comparison */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-widest">Content Library</h2>
                  <div className="h-px flex-1 bg-zinc-800 mx-8" />
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
                   <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-900/80">
                      <div className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-zinc-600 border-r border-zinc-800">Content Type</div>
                      <div className="px-8 py-6 text-xl font-black text-center border-r border-zinc-800">{platformOne.name}</div>
                      <div className="px-8 py-6 text-xl font-black text-center">{platformTwo.name}</div>
                   </div>
                   
                   {platformOne.contentLibrary && platformTwo.contentLibrary && (
                     <>
                       <ComparisonRow 
                         label="Total Movies" 
                         val1={platformOne.contentLibrary.movies?.toLocaleString()} 
                         val2={platformTwo.contentLibrary.movies?.toLocaleString()}
                         highlight1={platformOne.contentLibrary.movies > platformTwo.contentLibrary.movies}
                         highlight2={platformTwo.contentLibrary.movies > platformOne.contentLibrary.movies}
                       />
                       <ComparisonRow 
                         label="TV Series" 
                         val1={platformOne.contentLibrary.series?.toLocaleString()} 
                         val2={platformTwo.contentLibrary.series?.toLocaleString()}
                         highlight1={platformOne.contentLibrary.series > platformTwo.contentLibrary.series}
                         highlight2={platformTwo.contentLibrary.series > platformOne.contentLibrary.series}
                       />
                       <ComparisonRow 
                         label="Anime" 
                         val1={platformOne.contentLibrary.anime?.toLocaleString()} 
                         val2={platformTwo.contentLibrary.anime?.toLocaleString()}
                       />
                       <ComparisonRow 
                         label="Documentaries" 
                         val1={platformOne.contentLibrary.docs?.toLocaleString()} 
                         val2={platformTwo.contentLibrary.docs?.toLocaleString()}
                       />
                       <ComparisonRow 
                         label="Indian Titles" 
                         val1={platformOne.contentLibrary.indianTitles?.toLocaleString()} 
                         val2={platformTwo.contentLibrary.indianTitles?.toLocaleString()}
                         highlight1={platformOne.contentLibrary.indianTitles > platformTwo.contentLibrary.indianTitles}
                         highlight2={platformTwo.contentLibrary.indianTitles > platformOne.contentLibrary.indianTitles}
                       />
                     </>
                   )}
                </div>
              </div>

              {/* Final Verdict */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-widest">Final Verdict</h2>
                  <div className="h-px flex-1 bg-zinc-800 mx-8" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-red-900/20 to-zinc-900/50 border border-red-900/30 rounded-3xl p-8">
                    <h3 className="text-xl font-black mb-4">{platformOne.name}</h3>
                    <div className="space-y-3 text-sm">
                      <p className="text-green-400 font-semibold">✓ Best For: {platformOne.name === "Netflix" ? "Premium Originals & Global Content" : platformOne.name === "Amazon Prime Video" ? "Regional Content & Value" : "Sports & Family Entertainment"}</p>
                      <p className="text-green-400 font-semibold">✓ Strengths: {platformOne.genreStrength?.slice(0, 2).map(g => g.genre).join(", ") || "Originals"}</p>
                      <p className="text-red-400 font-semibold">⚠ Weaknesses: {platformOne.risks?.[0] || "High competition"}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/20 to-zinc-900/50 border border-blue-900/30 rounded-3xl p-8">
                    <h3 className="text-xl font-black mb-4">{platformTwo.name}</h3>
                    <div className="space-y-3 text-sm">
                      <p className="text-green-400 font-semibold">✓ Best For: {platformTwo.name === "Netflix" ? "Premium Originals & Global Content" : platformTwo.name === "Amazon Prime Video" ? "Regional Content & Value" : "Sports & Family Entertainment"}</p>
                      <p className="text-green-400 font-semibold">✓ Strengths: {platformTwo.genreStrength?.slice(0, 2).map(g => g.genre).join(", ") || "Originals"}</p>
                      <p className="text-red-400 font-semibold">⚠ Weaknesses: {platformTwo.risks?.[0] || "High competition"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-20 flex justify-center">
             <div className="flex items-center gap-8">
                {platforms.map(p => (
                  <button 
                    key={p._id}
                    onClick={() => {
                      if (one === p.slug) return;
                      router.push(`/ott/compare?one=${one || 'netflix'}&two=${p.slug}`);
                    }}
                    className={`w-12 h-12 rounded-xl bg-zinc-900 border transition-all flex items-center justify-center text-xs font-black ${
                      two === p.slug ? 'border-white scale-110 shadow-lg' : 'border-zinc-800 hover:border-zinc-600 text-zinc-500'
                    }`}
                  >
                    {p.name[0]}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
