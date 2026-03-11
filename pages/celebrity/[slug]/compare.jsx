import CompareTopSection from "@/components/compare/CompareTopSection";
import CompareNetWorthSection from "@/components/compare/CompareNetWorthSection";
import NetWorthGrowthTimeline from "@/components/compare/NetWorthGrowthTimeline";
import IncomeSourceAnalysis from "@/components/compare/IncomeSourceAnalysis";

export async function getServerSideProps(context) {
  const { slug } = context.params;
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
    return {
      props: {
        celebrity: data.data,
      },
    };
  } catch {
    return { notFound: true };
  }
}

export default function ComparePage({ celebrity }) {
  return (
    <>
      <CompareTopSection celebrity={celebrity} />
      <CompareNetWorthSection 
        celebrityA={{
          name: celebrity?.heroSection?.name,
          image: celebrity?.heroSection?.profileImage,
          profession: Array.isArray(celebrity?.heroSection?.profession) 
            ? celebrity.heroSection.profession.join(", ")
            : celebrity?.heroSection?.profession,
          netWorth: celebrity?.netWorth?.netWorthUSD?.display || "$730M"
        }}
        celebrityB={{
          name: "Tom Cruise",
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
          profession: "Actor, Producer",
          netWorth: "$620M"
        }}
        currency="USD"
      />
      <NetWorthGrowthTimeline
        seriesA={{
          name: celebrity?.heroSection?.name || "Celebrity A",
          color: "#ef4444",
          points: [
            { year: 2010, value: 200 },
            { year: 2014, value: 400 },
            { year: 2018, value: 600 },
            { year: 2022, value: 680 },
            { year: 2026, value: 720 },
          ],
        }}
        seriesB={{
          name: "Tom Cruise",
          color: "#3b82f6",
          points: [
            { year: 2010, value: 250 },
            { year: 2014, value: 380 },
            { year: 2018, value: 500 },
            { year: 2022, value: 570 },
            { year: 2026, value: 610 },
          ],
        }}
        maxY={800}
      />
      <IncomeSourceAnalysis
        a={{
          name: celebrity?.heroSection?.name || "Shah Rukh Khan",
          data: [],
        }}
        b={{
          name: "Tom Cruise",
          data: [],
        }}
      />
    </>
  );
}
