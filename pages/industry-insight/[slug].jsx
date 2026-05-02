import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, useScroll, useSpring, useTransform, AnimatePresence, useInView } from "framer-motion";
import { slugify } from "../../lib/slugify";
import { 
  ArrowLeft, 
  Clock, 
  ChevronRight, 
  Play,
  Film,
  Layers,
  Sparkles,
  ArrowUp,
  ChevronDown
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


// --- New Feature: Minimal Navigation ---
function MinimalNav({ content, hasFaqs, activeIndex }) {
  const navItems = [...content];
  if (hasFaqs) {
    navItems.push({ heading: "Discussion & FAQs", id: "faqs" });
  }

  return (
    <div className="fixed left-10 top-1/2 -translate-y-1/2 z-[100] hidden xl:flex flex-col gap-6">
      {navItems.map((section, idx) => {
        const id = section.id || slugify(section.heading);
        return (
          <div key={idx} className="relative flex items-center group">
            <motion.a
              href={`#${id}`}
              className="w-2 h-2 rounded-full border border-zinc-700 bg-zinc-950 transition-colors"
              animate={{
                scale: activeIndex === idx ? 1.5 : 1,
                backgroundColor: activeIndex === idx ? "#f59e0b" : "transparent",
                borderColor: activeIndex === idx ? "#f59e0b" : "#3f3f46"
              }}
            />
            <span className={`absolute left-6 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 ${
              activeIndex === idx ? 'opacity-100 translate-x-0 text-amber-500' : 'opacity-0 -translate-x-2 text-zinc-500 group-hover:opacity-50'
            }`}>
              {section.heading}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// --- New Feature: Storyboard Section ---
function StoryboardSection({ section, index, total, onInView }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (isInView) onInView(index);
  }, [isInView, index, onInView]);

  return (
    <section 
      ref={ref}
      id={slugify(section.heading)}
      className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-20 relative pt-12"
    >
      <div className="lg:w-1/4 lg:sticky lg:top-40 h-fit">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-amber-500 font-medium text-lg tracking-tight">Scene {index + 1}</span>
            <div className="h-[1px] flex-1 bg-amber-500/20" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 leading-tight tracking-tight">
            {section.heading}
          </h2>
        </motion.div>
      </div>

      <div className="lg:w-3/4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <p className="text-lg md:text-xl text-zinc-400 font-normal leading-relaxed mb-8">
            {section.content}
          </p>

          {/* Quick Jump Link */}
          <div className="flex justify-end">
            <a 
              href={index === total - 1 ? "#faqs" : `#${slugify(insight_content_ref[index + 1]?.heading || "")}`}
              className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-amber-500 transition-colors"
            >
              {index === total - 1 ? "Jump to FAQs" : "Next Scene"}
              <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
let insight_content_ref = []; // Global ref for helper

export default function IndustryInsightPage({ insight }) {
  const router = useRouter();
  const [activeScene, setActiveScene] = useState(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [showScrollTop, setShowScrollTop] = useState(false);

  insight_content_ref = insight.content;

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 1000);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqRef = useRef(null);
  const isFaqInView = useInView(faqRef, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (isFaqInView) setActiveScene(insight.content.length);
  }, [isFaqInView, insight.content.length]);

  return (
    <>
      <Head>
        <title>{`${insight.title} | FilmyFire Cinema Intelligence`}</title>
        <meta name="description" content={insight.description} />
      </Head>

      {/* Floating Back to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-10 right-10 z-[100] w-12 h-12 bg-amber-500 text-black rounded-full flex items-center justify-center shadow-2xl hover:bg-white transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30 font-sans overflow-x-hidden">
        
        {/* Background Light Leaks - More Subtle */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-amber-500/[0.02] blur-[150px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/[0.01] blur-[120px] rounded-full" />
        </div>

        {/* Global Progress Line */}
        <motion.div 
          className="fixed top-0 left-0 right-0 h-[2px] bg-amber-500 z-[200] origin-left"
          style={{ scaleX }}
        />

        <MinimalNav 
          content={insight.content} 
          hasFaqs={insight.faqs && insight.faqs.length > 0} 
          activeIndex={activeScene} 
        />

        <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-24 pb-24 relative z-10">
          
          {/* Back Button & Metadata - Compact */}
          <div className="flex items-center justify-between gap-8 mb-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-amber-500" />
                {insight.readTime}
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-3 h-3 text-amber-500" />
                {new Date(insight.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Cinematic Hero - Refined */}
          <header className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Film className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500/70">Industry Intelligence</span>
                <div className="h-[1px] flex-1 bg-zinc-800/30" />
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-8">
                {insight.title}
              </h1>

              <div className="grid md:grid-cols-[1fr_200px] gap-8 items-start">
                <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-3xl">
                  {insight.description}
                </p>
                
                <div className="flex flex-col items-end gap-1 border-r border-amber-500/50 pr-4">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Author</span>
                  <span className="text-base font-semibold text-zinc-300">{insight.author}</span>
                </div>
              </div>
            </motion.div>
          </header>

          {/* Storyboard Content - Compact */}
          <div className="space-y-20">
            {insight.content && insight.content.map((section, index) => (
              <StoryboardSection 
                key={index} 
                section={section} 
                index={index} 
                total={insight.content.length}
                onInView={setActiveScene}
              />
            ))}
          </div>

          {/* Related Intelligence Grid - Minimal */}
          {insight.relatedTopics && (
            <div className="mt-32 pt-16 border-t border-zinc-900">
              <div className="flex items-center gap-3 mb-8">
                <Layers className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Related Insights</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {insight.relatedTopics.map((topic, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02, color: "#f59e0b" }}
                    className="px-4 py-2 border border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-500 cursor-default transition-colors"
                  >
                    {topic}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* After-Credits FAQs - Clean */}
          {insight.faqs && insight.faqs.length > 0 && (
            <div 
              ref={faqRef}
              id="faqs" 
              className="mt-32 bg-zinc-950/30 border border-zinc-900 rounded-3xl p-10 md:p-16 relative overflow-hidden scroll-mt-24"
            >
              <div className="max-w-3xl">
                <h3 className="text-2xl md:text-4xl font-bold text-zinc-100 mb-12">
                  Analysis <span className="text-amber-500">Q&A</span>
                </h3>
                
                <div className="space-y-10 mb-12">
                  {insight.faqs.map((faq, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <span className="text-amber-500 font-bold text-lg">Q.</span>
                      <div>
                        <h4 className="text-lg font-bold text-zinc-200 mb-3">
                          {faq.question}
                        </h4>
                        <p className="text-base text-zinc-500 font-normal leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Back to Top Link inside FAQ */}
                <div className="flex justify-start border-t border-zinc-900 pt-8">
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-amber-500 transition-colors"
                  >
                    <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
                    Back to Top
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Cinematic Footer - Professional */}
        <footer className="bg-zinc-950 py-24 mt-32 border-t border-zinc-900 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h4 className="text-4xl font-bold text-zinc-800 mb-8 select-none tracking-widest uppercase">
              FILMYFIRE
            </h4>
            <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.4em] mb-10">
              Intelligence Protocol Alpha
            </p>
            <Link 
              href="/category/bollywood"
              className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 text-black font-bold uppercase tracking-widest text-[10px] rounded hover:bg-white transition-all"
            >
              Continue Exploration <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </footer>

      </div>
    </>
  );
}
