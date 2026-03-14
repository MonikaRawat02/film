"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import BoxOfficeHeroSection from "../../components/category/boxoffice/BoxOfficeHeroSection";
import BoxOfficeFilterBar from "../../components/category/boxoffice/BoxOfficeFilterBar";
import BoxOfficeArticlesGrid from "../../components/category/boxoffice/BoxOfficeArticlesGrid";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=BoxOffice&limit=20`);
    const data = await res.json();

    return {
      props: {
        initialArticles: data.data || [],
      },
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
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
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/articles/list?category=BoxOffice&limit=20");
        const data = await res.json();
        if (data.data) {
          setArticles(data.data);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = activeFilter === "All" 
    ? articles 
    : articles.filter(article => article.category === activeFilter);

  return (
    <>
      <Head>
        <title>Box Office Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Real-time box office tracking, verdict analysis, and theatrical performance metrics." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <BoxOfficeHeroSection />
        <BoxOfficeFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <BoxOfficeArticlesGrid articles={filteredArticles} loading={loading} />
      </div>
    </>
  );
}

BoxOfficePage.noPadding = true;
