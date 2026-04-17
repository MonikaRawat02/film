"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import CategoryHeroSection from "../../components/category/CategoryHeroSection";
import CategoryFilterBar from "../../components/category/CategoryFilterBar";
import CategoryArticlesGrid from "../../components/category/CategoryArticlesGrid";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    // Fetch all data sources in parallel
    const [articlesRes, celebritiesRes, ottRes] = await Promise.all([
      fetch(`${baseUrl}/api/articles/list?category=BoxOffice&limit=20`),
      fetch(`${baseUrl}/api/public/celebrities?limit=10`),
      fetch(`${baseUrl}/api/public/ott-intelligence?limit=10`)
    ]);

    const articlesData = await articlesRes.json();
    const celebritiesData = await celebritiesRes.json();
    const ottData = await ottRes.json();

    console.log("Box Office Page - SSR Data fetched:", {
      articles: articlesData.data?.length || 0,
      celebrities: celebritiesData.data?.length || 0,
      ott: ottData.data?.length || 0,
      sampleCelebrity: celebritiesData.data?.[0]
    });

    // Combine all data with filterType for proper rendering
    const allData = [
      ...(articlesData.data || []).map(item => ({ ...item, filterType: "BoxOffice" })),
      ...(celebritiesData.data || []).map(item => ({ ...item, filterType: "Celebrity" })),
      ...(ottData.data || []).map(item => ({ ...item, filterType: "OTT" }))
    ];

    return {
      props: {
        initialArticles: allData,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        initialArticles: [],
      },
    };
  }
}

export default function BoxOfficePage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data sources in parallel
        const [articlesRes, celebritiesRes, ottRes] = await Promise.all([
          fetch("/api/articles/list?category=BoxOffice&limit=20"),
          fetch("/api/public/celebrities?limit=10"),
          fetch("/api/public/ott-intelligence?limit=10")
        ]);

        const articlesData = await articlesRes.json();
        const celebritiesData = await celebritiesRes.json();
        const ottData = await ottRes.json();

        console.log("Box Office client fetch:", {
          articles: articlesData.data?.length || 0,
          celebrities: celebritiesData.data?.length || 0,
          ott: ottData.data?.length || 0,
          sampleCelebrity: celebritiesData.data?.[0],
          sampleOTT: ottData.data?.[0]
        });

        // Combine all data with filterType
        const allData = [
          ...(articlesData.data || []).map(item => ({ ...item, filterType: "BoxOffice" })),
          ...(celebritiesData.data || []).map(item => ({ ...item, filterType: "Celebrity" })),
          ...(ottData.data || []).map(item => ({ ...item, filterType: "OTT" }))
        ];

        console.log("Combined data sample:", {
          total: allData.length,
          firstItem: allData[0],
          types: allData.map(d => d.filterType)
        });

        setArticles(allData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const filteredArticles = activeFilter === "All" 
    ? articles 
    : articles.filter(article => article.filterType === activeFilter);

  return (
    <>
      <Head>
        <title>Box Office Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Real-time box office tracking, verdict analysis, and theatrical performance metrics." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <CategoryHeroSection category="BoxOffice" />
        <CategoryFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} category="BoxOffice" />
        <CategoryArticlesGrid category="BoxOffice" articles={filteredArticles} loading={loading} />
      </div>
    </>
  );
}

BoxOfficePage.noPadding = true;
