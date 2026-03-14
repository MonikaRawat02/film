import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { 
  FileText, 
  Clock, 
  User, 
  ChevronRight, 
  Share2, 
  ThumbsUp, 
  Eye, 
  ArrowLeft,
  Quote,
  CheckCircle,
  Clapperboard,
  Film,
  Tv,
  PlaySquare,
  TrendingUp,
  Users
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export async function getServerSideProps(context) {
  const { category, slug } = context.params;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/${slug}`);
    const data = await res.json();

    if (!res.ok || !data.data) {
      return { notFound: true };
    }

    return {
      props: {
        article: data.data,
        category,
      },
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return { notFound: true };
  }
}

const categoryIcons = {
  Bollywood: Clapperboard,
  Hollywood: Film,
  WebSeries: Tv,
  OTT: PlaySquare,
  BoxOffice: TrendingUp,
  Celebrities: Users,
};

export default function ArticleDetailPage({ article, category }) {
  const Icon = categoryIcons[category] || FileText;

  if (!article) return null;

  return (
    <>
      <Head>
        <title>{article.title} | Filmy Intelligence</title>
        <meta name="description" content={article.summary} />
        {article.seo?.metaTitle && <title>{article.seo.metaTitle}</title>}
        {article.seo?.metaDescription && <meta name="description" content={article.seo.metaDescription} />}
      </Head>

      <div className="bg-[#050505] text-white pb-20">
        {/* Article Hero */}
        <div className="relative h-[600px] flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10" />
          {article.coverImage ? (
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-900" />
          )}
          
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12 relative z-20 pb-20 w-full">
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 font-semibold uppercase tracking-widest">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href={`/category/${category}`} className="hover:text-white transition-colors">Articles</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-red-500">{category}</span>
            </nav>

            <div className="max-w-4xl space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  {article.contentType || 'FEATURE ANALYSIS'}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                    <User className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Written By</p>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">{article.author?.name || "Filmy Intelligence Team"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">{article.stats?.views || 0} Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">{article.stats?.likes || 0} Likes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 pt-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Summary Box */}
            <div className="p-8 bg-gray-900/40 border-l-4 border-red-600 rounded-r-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="h-24 w-24 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Icon className="h-5 w-5 text-red-500" />
                Intelligence Brief
              </h2>
              <p className="text-lg text-gray-300 italic leading-relaxed">
                {article.summary}
              </p>
            </div>

            {/* Content Sections */}
            {(article.sections || []).map((section, idx) => (
              <div key={idx} className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white flex items-center gap-4">
                  <span className="text-red-500/20 text-6xl font-black">0{idx + 1}</span>
                  {section.heading}
                </h2>
                <div className="text-gray-400 text-lg leading-relaxed space-y-4 whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            ))}

            {/* Verdict Box */}
            {article.verdict && (
              <div className="p-10 bg-gradient-to-br from-red-600/10 to-transparent border border-red-600/20 rounded-3xl space-y-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3 uppercase tracking-widest">
                  <CheckCircle className="h-6 w-6 text-red-500" />
                  Final Verdict
                </h3>
                <p className="text-xl text-gray-300 leading-relaxed font-serif italic">
                  &quot;{article.verdict}&quot;
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-3 pt-8 border-t border-gray-900">
              {(article.tags || []).map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest hover:border-red-500/50 hover:text-red-500 cursor-pointer transition-all">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ArticleDetailPage.noPadding = true;
