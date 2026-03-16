"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import HollywoodHeroSection from "../../components/category/hollywood/HollywoodHeroSection";
import HollywoodArticlesGrid from "../../components/category/hollywood/HollywoodArticlesGrid";
import HollywoodDatabaseSection from "../../components/category/hollywood/HollywoodDatabaseSection";
import HollywoodCelebritySection from "../../components/category/hollywood/HollywoodCelebritySection";
import HollywoodOTTSection from "../../components/category/hollywood/HollywoodOTTSection";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=Hollywood&limit=6`);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    const data = await res.json();

    return {
      props: {
        initialArticles: data.data || [],
      },
    };
  } catch (error) {
    console.error("Error fetching articles in getServerSideProps:", error);
    return {
      props: {
        initialArticles: [],
      },
    };
  }
}

export default function HollywoodPage({ initialArticles }) {
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);

  useEffect(() => {
    if (initialArticles.length === 0) {
      const fetchArticles = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/articles/list?category=Hollywood&limit=6");
          const data = await res.json();
          if (data.data) {
            setArticles(data.data);
          }
        } catch (error) {
          console.error("Error fetching articles on client-side:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchArticles();
    }
  }, [initialArticles]);

  return (
    <>
      <Head>
        <title>Hollywood Movies, Actors, Box Office & OTT Intelligence | FilmyFire</title>
        <meta name="description" content="Explore thousands of Hollywood movies, celebrity profiles, streaming releases, and box office insights updated daily." />
      </Head>

      <div className="min-h-screen bg-[#0B0F1A] text-zinc-100">
        <HollywoodHeroSection />
        <HollywoodArticlesGrid articles={articles} loading={loading} />
        <HollywoodDatabaseSection />
        <HollywoodCelebritySection />
        <HollywoodOTTSection />
      </div>
    </>
  );
}

HollywoodPage.noPadding = true;
