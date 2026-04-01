import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { 
  ArrowLeft, Target, ChevronRight, TrendingUp, 
  Film, Play, Star, Calendar, ChevronDown
} from "lucide-react";
import dbConnect from "../lib/mongodb";
import DiscoveryPage from "../model/discoveryPage";

export async function getServerSideProps(context) {
  const { slug } = context.params;

  try {
    await dbConnect();

    const page = await DiscoveryPage.findOne({ 
      slug,
      status: "published" 
    }).lean();

    if (!page) {
      return { notFound: true };
    }

    // Increment view count
    await DiscoveryPage.updateOne(
      { slug },
      { 
        $inc: { "stats.views": 1 },
        $set: { "stats.lastViewed": new Date() }
      }
    );

    return {
      props: {
        page: JSON.parse(JSON.stringify(page)),
      },
    };
  } catch (error) {
    console.error("Discovery Page Error:", error);
    return { notFound: true };
  }
}

// FAQ Accordion Component
function FAQItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-blue-500/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left group"
      >
        <span className="flex items-center gap-4 flex-grow">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm">
            Q{index + 1}
          </span>
          <span className="text-base md:text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
            {question}
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 text-zinc-500 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 pt-2">
          <div className="pl-12 border-l-2 border-blue-500/30">
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoveryPageView({ page }) {
  if (!page) return null;

  // JSON-LD Schema
  const structuredSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://filmyfire.com" },
          { "@type": "ListItem", "position": 2, "name": "Discover", "item": "https://filmyfire.com/discover" },
          { "@type": "ListItem", "position": 3, "name": page.title, "item": `https://filmyfire.com/${page.slug}` }
        ]
      },
      {
        "@type": "CollectionPage",
        "name": page.title,
        "description": page.description,
        "url": `https://filmyfire.com/${page.slug}`,
        "numberOfItems": page.movies?.length || 0
      },
      page.faq && page.faq.length > 0 ? {
        "@type": "FAQPage",
        "mainEntity": page.faq.map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": { "@type": "Answer", "text": f.answer }
        }))
      } : null
    ].filter(Boolean)
  };

  return (
    <>
      <Head>
        <title>{`${page.seo?.metaTitle || page.title} | FilmyFire Intelligence`}</title>
        <meta name="description" content={page.seo?.metaDescription || page.description} />
        <link rel="canonical" href={`https://filmyfire.com/${page.slug}`} />
        {page.seo?.ogImage && <meta property="og:image" content={page.seo.ogImage} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-red-600/30 font-sans pt-32 pb-24">
        
        {/* Navigation Header */}
        <nav className="fixed top-16 left-0 right-0 z-[40] bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4">
          <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-xs font-bold group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline uppercase tracking-widest">Back to Hub</span>
            </Link>
            
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] hidden md:block">
              {page.pageType.replace(/-/g, " ")} Discovery
            </h2>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-red-600/10 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                {page.movies?.length || 0} Movies
              </span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-[1440px] mx-auto px-6 mb-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                <Target className="w-3 h-3" />
                Discovery Engine
              </span>
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                {page.category} • {page.pageType.replace(/-/g, " ")}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              {page.title}
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl">
              {page.description}
            </p>
          </div>
        </div>

        {/* Movie Grid */}
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {page.movies?.map((movie, idx) => (
              <Link
                key={movie._id || idx}
                href={`/category/${page.category?.toLowerCase() || 'hollywood'}/${movie.slug}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-blue-500/30 transition-all duration-300 shadow-lg">
                  {movie.coverImage ? (
                    <img
                      src={movie.coverImage}
                      alt={movie.movieTitle}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-12 h-12 text-zinc-700" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center text-white font-black text-sm border border-white/10">
                    {idx + 1}
                  </div>
                  
                  {/* Rating Badge */}
                  {movie.rating && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-yellow-400 text-xs font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      {(parseFloat(movie.rating) * 10).toFixed(0)}%
                    </div>
                  )}
                  
                  {/* Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-6 h-6 text-white fill-current ml-1" />
                    </div>
                  </div>
                </div>
                
                {/* Movie Info */}
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {movie.movieTitle}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {movie.releaseYear}
                    </span>
                    {movie.genres?.[0] && (
                      <>
                        <span className="text-zinc-700">•</span>
                        <span className="text-xs text-zinc-500">{movie.genres[0]}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {page.sections && page.sections.length > 0 && (
          <div className="max-w-4xl mx-auto px-6 mt-24">
            {page.sections.map((section, idx) => (
              <div key={idx} className="mb-16">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6 uppercase tracking-tight">
                  {section.heading}
                </h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* FAQ Section */}
        {page.faq && page.faq.length > 0 && (
          <div className="max-w-4xl mx-auto px-6 mt-24">
            <h2 className="text-3xl font-black text-white mb-12 uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {page.faq.map((faq, idx) => (
                <FAQItem 
                  key={idx} 
                  question={faq.question} 
                  answer={faq.answer} 
                  index={idx} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Related Discovery Pages */}
        <div className="max-w-[1440px] mx-auto px-6 mt-24">
          <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tight">
            Explore More
          </h2>
          <div className="flex flex-wrap gap-3">
            {page.pageType === "best-genre" && (
              <>
                <Link href="/best-action-movies" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  Action Movies
                </Link>
                <Link href="/best-thriller-movies" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  Thriller Movies
                </Link>
                <Link href="/best-horror-movies" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  Horror Movies
                </Link>
              </>
            )}
            <Link href="/top-netflix-movies" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
              Top Netflix Movies
            </Link>
            <Link href="/trending-movies-this-week" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
              Trending Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

DiscoveryPageView.noPadding = true;
