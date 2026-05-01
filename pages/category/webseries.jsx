"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import CategoryHeroSection from "../../components/category/CategoryHeroSection";
import WebSeriesFilterBar from "../../components/category/webseries/WebSeriesFilterBar";
import CategoryArticlesGrid from "../../components/category/CategoryArticlesGrid";
import WebSeriesSeasonBreakdown from "../../components/category/webseries/WebSeriesSeasonBreakdown";
import WebSeriesPlatformAnalytics from "../../components/category/webseries/WebSeriesPlatformAnalytics";
import WebSeriesViewershipTrends from "../../components/category/webseries/WebSeriesViewershipTrends";
import WebSeriesRenewalStatus from "../../components/category/webseries/WebSeriesRenewalStatus";
import WebSeriesIndustryInsights from "../../components/category/webseries/WebSeriesIndustryInsights";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=WebSeries&limit=20`);
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

export default function WebSeriesPage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/articles/list?category=WebSeries&limit=20");
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

  // Map quick tags from hero section to filter tab IDs
  const tagToFilterMap = {
    "season breakdown": "SeasonBreakdown",
    "platform analytics": "PlatformAnalytics",
    "viewership trends": "ViewershipTrends",
    "renewal status": "RenewalStatus",
  };

  const scrollToContent = () => {
    const el = document.getElementById("webseries-content");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleQuickTagClick = (tag) => {
    const filterId = tagToFilterMap[tag.toLowerCase()];
    if (filterId) {
      setActiveFilter(filterId);
      scrollToContent();
    }
  };

  const handlePrimaryBtnClick = () => {
    setActiveFilter("All");
    scrollToContent();
  };

  const handleSecondaryBtnClick = () => {
    router.push("/trending-webseries");
  };

  return (
    <>
      <Head>
        <title>Web Series Intelligence Hub | FilmyFire</title>
        <meta name="description" content="In-depth breakdown of episodic content across platforms including performance metrics and audience engagement." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <CategoryHeroSection
          category="WebSeries"
          onQuickTagClick={handleQuickTagClick}
          onPrimaryBtnClick={handlePrimaryBtnClick}
          onSecondaryBtnClick={handleSecondaryBtnClick}
        />
        <div id="webseries-content">
          <WebSeriesFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} loading={loading} />

          {activeFilter === "All" && (
            <CategoryArticlesGrid category="WebSeries" articles={filteredArticles} loading={loading} />
          )}

          {activeFilter === "SeasonBreakdown" && (
            <WebSeriesSeasonBreakdown />
          )}

          {activeFilter === "PlatformAnalytics" && (
            <WebSeriesPlatformAnalytics />
          )}

          {activeFilter === "ViewershipTrends" && (
            <WebSeriesViewershipTrends />
          )}

          {activeFilter === "RenewalStatus" && (
            <WebSeriesRenewalStatus />
          )}

          {activeFilter === "Industry" && (
            <WebSeriesIndustryInsights />
          )}
        </div>
      </div>
    </>
  );
}

WebSeriesPage.noPadding = true;
