"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import CategoryHeroSection from "../../components/category/CategoryHeroSection";
import CategoryFilterBar from "../../components/category/CategoryFilterBar";
import { 
  OTTExplainerCard, 
  OTTBoxOfficeCard, 
  OTTPerformanceCard, 
  OTTCelebrityCard 
} from "../../components/category/ott/OTTSpecializedCards";
import { Sparkles, Loader2 } from "lucide-react";

export async function getServerSideProps(context) {
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.BASE_URL;
  const baseUrl = isDevelopment ? 'http://localhost:3000' : process.env.BASE_URL;

  try {
    const res = await fetch(`${baseUrl}/api/public/ott-category-unified`);
    const data = await res.json();

    return {
      props: {
        initialData: data.data || {
          explainers: [],
          boxOffice: [],
          ottPerformance: [],
          celebrities: []
        },
      },
    };
  } catch (error) {
    console.error("Error fetching OTT data:", error);
    return {
      props: {
        initialData: {
          explainers: [],
          boxOffice: [],
          ottPerformance: [],
          celebrities: []
        },
      },
    };
  }
}

export default function OTTPage({ initialData }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/public/ott-category-unified");
        const json = await res.json();
        if (json.data) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Error fetching OTT data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Syncing Intelligence...</p>
        </div>
      );
    }

    switch(activeFilter) {
      case "Explained":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.explainers.length > 0 ? (
              data.explainers.map(movie => <OTTExplainerCard key={movie._id} movie={movie} />)
            ) : (
              <div className="col-span-full py-20 text-center text-zinc-500 italic">No explainers available yet.</div>
            )}
          </div>
        );
      case "BoxOffice":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.boxOffice.length > 0 ? (
              data.boxOffice.map(movie => <OTTBoxOfficeCard key={movie._id} movie={movie} />)
            ) : (
              <div className="col-span-full py-20 text-center text-zinc-500 italic">No box office analytics available yet.</div>
            )}
          </div>
        );
      case "OTT":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {data.ottPerformance.length > 0 ? (
              data.ottPerformance.map(title => <OTTPerformanceCard key={title._id} title={title} />)
            ) : (
              <div className="col-span-full py-20 text-center text-zinc-500 italic">No streaming performance data available yet.</div>
            )}
          </div>
        );
      case "Celebrity":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.celebrities.length > 0 ? (
              data.celebrities.map(celeb => <OTTCelebrityCard key={celeb._id} celeb={celeb} />)
            ) : (
              <div className="col-span-full py-20 text-center text-zinc-500 italic">No celebrity intelligence available yet.</div>
            )}
          </div>
        );
      case "Industry":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.industry && data.industry.length > 0 ? (
              data.industry.map(movie => <OTTExplainerCard key={movie._id} movie={movie} />)
            ) : (
              <div className="col-span-full py-20 text-center text-zinc-500 italic">No industry reports available yet.</div>
            )}
          </div>
        );
      case "All":
      default:
        return (
          <div className="space-y-24">
            {/* Show mix of all content */}
            <section>
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-10 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-rose-500 rounded-full" />
                Latest Explainers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.explainers.slice(0, 3).map(movie => <OTTExplainerCard key={movie._id} movie={movie} />)}
              </div>
            </section>

            {data.industry && data.industry.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-white uppercase tracking-wider mb-10 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  Industry Reports
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {data.industry.slice(0, 3).map(movie => <OTTExplainerCard key={movie._id} movie={movie} />)}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-10 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                Box Office Trends
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.boxOffice.slice(0, 3).map(movie => <OTTBoxOfficeCard key={movie._id} movie={movie} />)}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-500 rounded-full" />
                Trending on OTT
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {data.ottPerformance.slice(0, 4).map(title => <OTTPerformanceCard key={title._id} title={title} />)}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-fuchsia-500 rounded-full" />
                Star Intelligence
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.celebrities.slice(0, 4).map(celeb => <OTTCelebrityCard key={celeb._id} celeb={celeb} />)}
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>OTT Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Streaming platform analytics, content strategy breakdowns, and subscriber growth intelligence." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
        <CategoryHeroSection category="OTT" />
        <CategoryFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} category="OTT" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {renderContent()}
          
          {!loading && Object.values(data).every(arr => arr.length === 0) && (
            <div className="text-center py-32 border-2 border-dashed border-zinc-900 rounded-[3rem]">
              <Sparkles className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-zinc-700 uppercase tracking-tighter">No intelligence detected</h3>
              <p className="text-zinc-600 font-medium">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

OTTPage.noPadding = true;
