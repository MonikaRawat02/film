import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CompareTopSection from "@/components/compare/CompareTopSection";
import CompareNetWorthSection from "@/components/compare/CompareNetWorthSection";
import NetWorthGrowthTimeline from "@/components/compare/NetWorthGrowthTimeline";
import IncomeSourceAnalysis from "@/components/compare/IncomeSourceAnalysis";
import ComparisonStats from "@/components/compare/ComparisonStats";
import RelatedIntelligence from "@/components/compare/RelatedIntelligence";
import CompareFAQ from "@/components/compare/CompareFAQ";
import ExploreCTA from "@/components/compare/ExploreCTA";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const { with: compareWith } = context.query;
  const { req } = context;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  try {
    const res = await fetch(`${baseUrl}/api/celebrity/profile?slug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!res.ok || !data?.data) {
      return { notFound: true };
    }

    let compareCelebrity = null;
    if (compareWith) {
      const compareRes = await fetch(`${baseUrl}/api/celebrity/profile?slug=${encodeURIComponent(compareWith)}`);
      const compareData = await compareRes.json();
      if (compareRes.ok && compareData?.data) {
        compareCelebrity = compareData.data;
      }
    }

    return {
      props: {
        initialCelebrityA: data.data,
        initialCelebrityB: compareCelebrity,
      },
    };
  } catch {
    return { notFound: true };
  }
}

export default function ComparePage({ initialCelebrityA, initialCelebrityB }) {
  const router = useRouter();
  const [celebrityA, setCelebrityA] = useState(initialCelebrityA);
  const [celebrityB, setCelebrityB] = useState(initialCelebrityB);

  const formatNetWorthData = (celeb) => {
    if (!celeb) return null;
    return {
      name: celeb.heroSection?.name,
      image: celeb.heroSection?.profileImage,
      profession: Array.isArray(celeb.heroSection?.profession)
        ? celeb.heroSection.profession.join(", ")
        : celeb.heroSection?.profession,
      netWorth: celeb.netWorth?.netWorthUSD?.display || `$${celeb.netWorth?.netWorthUSD?.min}M`,
      slug: celeb.heroSection?.slug,
    };
  };

  const formatTimelineData = (celeb) => {
    if (!celeb?.netWorthTimeline?.timeline) return [];
    return celeb.netWorthTimeline.timeline.map(item => ({
      year: item.year,
      value: item.netWorth
    })).sort((a, b) => a.year - b.year);
  };

  const formatIncomeData = (celeb) => {
    if (!celeb?.netWorthCalculation?.incomeSources) return [];
    return celeb.netWorthCalculation.incomeSources.map(item => ({
      label: item.sourceName,
      value: item.percentage // Component seems to expect percentage as value based on tooltip
    }));
  };

  const aNetWorth = formatNetWorthData(celebrityA);
  const bNetWorth = formatNetWorthData(celebrityB) || {
    name: "Select Celebrity",
    image: "/placeholder.jpg",
    profession: "Comparison Target",
    netWorth: "N/A"
  };

  const aTimeline = formatTimelineData(celebrityA);
  const bTimeline = formatTimelineData(celebrityB);

  // Combine years for graph
  const allYears = Array.from(new Set([...aTimeline.map(p => p.year), ...bTimeline.map(p => p.year)])).sort();
  
  // Ensure both have points for all years or at least match the structure
  const normalizeTimeline = (timeline, years) => {
    if (timeline.length === 0) return years.map(y => ({ year: y, value: 0 }));
    return years.map(y => {
      const found = timeline.find(p => p.year === y);
      return found ? found : { year: y, value: 0 };
    });
  };

  const finalATimeline = normalizeTimeline(aTimeline, allYears);
  const finalBTimeline = normalizeTimeline(bTimeline, allYears);

  const aIncome = formatIncomeData(celebrityA);
  const bIncome = formatIncomeData(celebrityB);

  const handleSelectA = async (slug) => {
    // If we change A, we should probably update the URL path
    router.push(`/celebrity/${slug}/compare${celebrityB ? `?with=${celebrityB.heroSection?.slug}` : ""}`, undefined, { shallow: true });
    try {
      const res = await fetch(`/api/celebrity/profile?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.success) setCelebrityA(data.data);
    } catch (e) {
      console.error("Failed to fetch celebrity A", e);
    }
  };

  const handleSelectB = async (slug) => {
    // Update URL query param
    router.push(`/celebrity/${celebrityA.heroSection?.slug}/compare?with=${slug}`, undefined, { shallow: true });
    try {
      const res = await fetch(`/api/celebrity/profile?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.success) setCelebrityB(data.data);
    } catch (e) {
      console.error("Failed to fetch celebrity B", e);
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <CompareTopSection 
        celebrityA={celebrityA} 
        celebrityB={celebrityB} 
        onSelectA={handleSelectA}
        onSelectB={handleSelectB}
      />
      
      <CompareNetWorthSection 
        celebrityA={aNetWorth}
        celebrityB={bNetWorth}
        currency="USD"
      />

      <NetWorthGrowthTimeline
        seriesA={{
          name: aNetWorth?.name || "Celebrity A",
          color: "#ef4444",
          points: finalATimeline,
        }}
        seriesB={{
          name: bNetWorth?.name || "Celebrity B",
          color: "#3b82f6",
          points: finalBTimeline,
        }}
        maxY={Math.max(...[...finalATimeline, ...finalBTimeline].map(p => p.value), 800) * 1.1}
      />

      <IncomeSourceAnalysis
        a={{
          name: aNetWorth?.name || "Celebrity A",
          data: aIncome,
        }}
        b={{
          name: bNetWorth?.name || "Celebrity B",
          data: bIncome,
        }}
      />
      <ComparisonStats />
      <RelatedIntelligence />
      <CompareFAQ />
      <ExploreCTA
        aSlug={celebrityA?.heroSection?.slug}
        bSlug={celebrityB?.heroSection?.slug}
        aName={aNetWorth?.name}
        bName={bNetWorth?.name}
      />
    </div>
  );
}
