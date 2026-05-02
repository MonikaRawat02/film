import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { slugify } from "../../lib/slugify";
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  Monitor, 
  Users, 
  ChevronRight, 
  Calendar,
  User,
  Hash,
  MessageCircle,
  Share2,
  Bookmark,
  Shield,
  Zap,
  Activity,
  Cpu,
  Target,
  BarChart3
} from "lucide-react";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/industry-insights/get-by-slug?slug=${encodeURIComponent(slug)}`);
    
    if (!res.ok) {
      return { notFound: true };
    }

    const data = await res.json();

    if (!data || !data.data) {
      return { notFound: true };
    }

    const insight = data.data;

    return {
      props: {
        insight,
      },
    };
  } catch (error) {
    console.error("Error fetching industry insight:", error);
    return { notFound: true };
  }
}

const IconMap = {
  AlertCircle,
  RefreshCw,
  Monitor,
  Users
};

// --- New Feature: HUD Progress Component ---
function HUDProgress() {
  const { scrollYProgress } = useScroll();
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useTransform(scrollYProgress, [0, 1], [circumference, 0]);

  return (
    <div className="fixed bottom-10 right-10 z-[100] hidden md:block">
      <div className="relative w-20 h-20 bg-zinc-950/80 backdrop-blur-xl rounded-full border border-amber-500/20 flex items-center justify-center shadow-2xl shadow-amber-500/10">
        <svg className="w-full h-full rotate-[-90deg]">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-800"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="2"
            className="text-amber-500"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-[10px] font-black text-amber-500">
            {useTransform(scrollYProgress, (v) => `${Math.round(v * 100)}%`)}
          </motion.span>
          <span className="text-[6px] uppercase tracking-widest text-zinc-500">Sync</span>
        </div>
      </div>
    </div>
  );
}

// --- New Feature: Dossier Card Component ---
function DossierCard({ section, index }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      id={slugify(section.heading)}
      className="relative group mb-12"
    >
      {/* Corner Markers */}
      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/30 group-hover:border-amber-500 transition-colors" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/30 group-hover:border-amber-500 transition-colors" />

      <div className="bg-[#121826]/40 backdrop-blur-sm border border-white/5 p-8 md:p-10 transition-all duration-500 group-hover:bg-[#121826]/60 group-hover:border-amber-500/20">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <span className="text-amber-500 text-xs font-black font-mono">[{String(index + 1).padStart(2, '0')}]</span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{section.heading}</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-600">
            <Activity className="w-3 h-3 text-amber-500/50" />
            <span>DATA_STREAMS_ACTIVE</span>
          </div>
        </div>
        
        <p className="text-zinc-400 leading-relaxed font-light text-lg whitespace-pre-wrap group-hover:text-zinc-200 transition-colors">
          {section.content}
        </p>

        {/* Footer Meta */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-600 tracking-tighter">
          <span>SOURCE: FILMYFIRE_INTEL_DB</span>
          <span>STAMP: {new Date().toISOString().split('T')[0]}</span>
        </div>
      </div>
    </motion.section>
  );
}

function FAQItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-zinc-950/40 border border-white/5 mb-4 overflow-hidden group transition-all duration-300 hover:border-amber-500/20"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between gap-4 text-left"
      >
        <span className="flex items-center gap-4">
          <Cpu className={`w-4 h-4 transition-colors ${isOpen ? 'text-amber-500' : 'text-zinc-700'}`} />
          <span className={`text-sm font-bold tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
            {question}
          </span>
        </span>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-amber-500' : 'text-zinc-600'}`}>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-0 border-t border-white/5">
              <p className="text-zinc-500 text-sm leading-relaxed mt-4 font-mono uppercase text-[11px]">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DecodingText({ text }) {
  const [displayText, setDisplayText] = useState("");
  const chars = "!@#$%^&*()_+{}:<>?|ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text.split("")
          .map((char, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
}

export default function IndustryInsightPage({ insight }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const IconComponent = IconMap[insight.icon] || AlertCircle;

  return (
    <>
      <Head>
        <title>{`${insight.title} | FilmyFire Intelligence`}</title>
        <meta name="description" content={insight.description} />
      </Head>

      <HUDProgress />

      <div ref={containerRef} className="min-h-screen bg-[#07090F] text-white selection:bg-amber-500/30 font-sans relative overflow-x-hidden">
        
        {/* Immersive HUD Header Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(245,158,11,0.15),transparent_60%)]" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent animate-pulse" />
          
          {/* HUD Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-32 pb-24 relative z-10">
          
          {/* HUD Status Bar */}
          <div className="flex items-center justify-between mb-16 px-4 py-3 bg-zinc-950/50 backdrop-blur-md border-x border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Secure_Intel_Link</span>
              </div>
              <div className="h-4 w-px bg-zinc-800" />
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-zinc-500" />
                <span className="text-[10px] font-mono text-zinc-500">REF: {insight.slug.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-amber-500/70 animate-pulse">● LIVE_ENCRYPTION_ACTIVE</span>
              <button 
                onClick={() => router.back()}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
              >
                [ EXIT_DOUCMENT ]
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-16">
            
            <main>
              {/* Dossier Hero */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-24"
              >
                <div className="relative p-10 md:p-16 bg-gradient-to-br from-[#121826]/80 to-transparent border border-white/5 rounded-[2rem] overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <Zap className="w-12 h-12 text-amber-500/20" />
                  </div>

                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100px" }}
                    className="h-1 bg-amber-500 mb-8"
                  />
                  
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-8 tracking-tighter">
                    <DecodingText text={insight.title} />
                  </h1>

                  <div className="flex flex-wrap gap-8 mb-12">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Category</span>
                      <span className="text-amber-500 font-bold text-sm tracking-tight">{insight.category}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Read_Time</span>
                      <span className="text-zinc-200 font-bold text-sm tracking-tight">{insight.readTime}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Author_ID</span>
                      <span className="text-zinc-200 font-bold text-sm tracking-tight">{insight.author}</span>
                    </div>
                  </div>

                  <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed max-w-4xl italic border-l-2 border-amber-500/30 pl-8">
                    {insight.description}
                  </p>
                </div>
              </motion.div>

              {/* Dossier Content Blocks */}
              <div className="space-y-4">
                {insight.content && insight.content.map((section, index) => (
                  <DossierCard key={index} section={section} index={index} />
                ))}
              </div>
            </main>

            <aside>
              <div className="sticky top-32 space-y-10">
                
                {/* HUD Navigation Panel */}
                <div className="p-8 bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/20 group-hover:bg-amber-500 transition-colors" />
                  
                  <div className="flex items-center gap-3 mb-8">
                    <BarChart3 className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Analysis_Tree</h3>
                  </div>

                  <nav className="flex flex-col gap-3">
                    {insight.content && insight.content.map((section, idx) => (
                      <a 
                        key={idx}
                        href={`#${slugify(section.heading)}`}
                        className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-amber-500/20 hover:bg-amber-500/5 transition-all group/nav"
                      >
                        <span className="text-xs font-bold text-zinc-500 group-hover/nav:text-amber-500 transition-colors truncate pr-4">
                          {section.heading}
                        </span>
                        <ChevronRight className="w-3 h-3 text-zinc-800 group-hover/nav:text-amber-500 transition-all" />
                      </a>
                    ))}
                  </nav>
                </div>

                {/* FAQ HUD */}
                {insight.faqs && insight.faqs.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-4">
                      <MessageCircle className="w-5 h-5 text-amber-500" />
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Query_Resolution</h3>
                    </div>
                    <div>
                      {insight.faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Intelligence Tags */}
                <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Bookmark className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Keywords</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insight.relatedTopics && insight.relatedTopics.map((topic, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-zinc-950 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-all cursor-default"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </aside>
          </div>
        </div>

        {/* Global HUD Footer */}
        <footer className="border-t border-white/5 py-20 bg-[#05070A] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(245,158,11,0.05),transparent_50%)]" />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <Cpu className="w-12 h-12 text-amber-500/30 mx-auto mb-8" />
            <h4 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500 mb-6">FilmyFire_Intelligence_Network</h4>
            <div className="flex items-center justify-center gap-8 text-[10px] font-mono text-zinc-700">
              <span>SYSTEM_STATUS: NOMINAL</span>
              <span>UPLINK: STABLE</span>
              <span>DATA_VERIFIED: TRUE</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

