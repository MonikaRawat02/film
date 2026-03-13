import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  FileText, 
  Clock, 
  User, 
  ArrowRight, 
  ChevronRight, 
  Search, 
  Loader2,
  Clapperboard,
  Film,
  Tv,
  PlaySquare,
  TrendingUp,
  Users
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export async function getServerSideProps(context) {
  const { category } = context.params;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=${category}&limit=20`);
    const data = await res.json();

    return {
      props: {
        initialArticles: data.data || [],
        category,
        pagination: data.pagination || null,
      },
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      props: {
        initialArticles: [],
        category,
        pagination: null,
      },
    };
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

const categoryLabels = {
  Bollywood: "Bollywood Intelligence",
  Hollywood: "Hollywood Insights",
  WebSeries: "Web Series Analysis",
  OTT: "OTT Platform Intelligence",
  BoxOffice: "Box Office Analysis",
  Celebrities: "Celebrity Profiles",
};

export default function ArticleCategoryPage({ initialArticles, category, pagination }) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const Icon = categoryIcons[category] || FileText;

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.movieTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>{categoryLabels[category] || category} | Filmy Intelligence</title>
      </Head>

      <div className="bg-[#050505] text-white pb-20">
        {/* Header Section */}
        <div className="relative pb-2 pt-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-transparent to-transparent" />
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12 relative z-10">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-300">Articles</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-red-500 font-medium">{category}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full">
                  <Icon className="h-5 w-5 text-red-500" />
                  <span className="text-red-500 text-sm font-bold uppercase tracking-widest">
                    {category} PORTAL
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight">
                  {categoryLabels[category] || category}
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                  In-depth analysis, psychological profiles, and industry intelligence for {category}.
                </p>
              </div>

              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-gray-200 focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
              <p className="text-gray-500 font-medium">Loading intelligence...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl">
              <FileText className="h-12 w-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No articles found</h3>
              <p className="text-gray-600 mt-2">We haven't published any articles in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <Link 
                  href={`/articles/${category}/${article.slug}`} 
                  key={article._id}
                  className="group relative flex flex-col bg-gray-900/30 border border-gray-800 rounded-3xl overflow-hidden hover:border-gray-700 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-red-900/10"
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    {article.coverImage ? (
                      <img 
                        src={article.coverImage} 
                        alt={article.title} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-700" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                        {article.contentType || 'FEATURE'}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-semibold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="h-1 w-1 bg-gray-700 rounded-full" />
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>{article.author?.name || "Filmy Team"}</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-500 transition-colors line-clamp-2 leading-tight">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm line-clamp-3 mb-8 leading-relaxed">
                      {article.summary}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-800/50">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-white transition-colors flex items-center gap-2">
                        READ FULL ANALYSIS
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                        <span>{article.stats?.views || 0} VIEWS</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

ArticleCategoryPage.noPadding = true;
