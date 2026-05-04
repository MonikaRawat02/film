import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import WhyFilmyFire from "@/components/WhyFilmyFire";
import CelebritySection from "@/components/CelebritySection";
import CategoryHubSection from "@/components/CategoryHubSection";
import GuidesSection from "@/components/GuidesSection";
import OurCommitment from "@/components/OurCommitment";
import InnovationRoadmap from "@/components/InnovationRoadmap";
import JoinCommunity from "@/components/JoinCommunity";
import InsightsDuoSection from "@/components/InsightsDuoSection";
import dbConnect from "@/lib/mongodb";
import Article from "@/model/article";
import Celebrity from "@/model/celebrity";
import BoxOffice from "@/model/boxOffice";
import OTTIntelligence from "@/model/ottIntelligence";

export async function getStaticProps() {
  try {
    // Direct database connection - no API call needed during build
    await dbConnect();

    // Fetch all homepage data in parallel (same logic as API)
    const [
      categoryCounts,
      celebrities,
      recentGuides,
      boxOfficeData,
      ottIntelligence
    ] = await Promise.all([
      // Category counts
      (async () => {
        const articleCounts = await Article.aggregate([
          { $match: { status: "published" } },
          { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        
        const celebrityCount = await Celebrity.countDocuments();
        const boxOfficeCount = await BoxOffice.countDocuments();
        
        const countsMap = {
          Bollywood: 0,
          Hollywood: 0,
          WebSeries: 0,
          OTT: 0,
          BoxOffice: boxOfficeCount,
          Celebrities: celebrityCount
        };

        articleCounts.forEach(item => {
          if (countsMap.hasOwnProperty(item._id)) {
            countsMap[item._id] = item.count;
          }
        });
        
        return countsMap;
      })(),

      // Celebrities
      Celebrity.find({})
        .select("heroSection.name heroSection.profileImage heroSection.slug heroSection.profession profession")
        .limit(10)
        .sort({ createdAt: -1 })
        .lean(),

      // Recent guides
      Article.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(3)
        .select("title summary slug category stats")
        .lean(),

      // Box office
      BoxOffice.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),

      // OTT Intelligence
      OTTIntelligence.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .lean()
    ]);

    // Transform celebrities
    const transformedCelebrities = celebrities.map(celeb => ({
      _id: celeb._id,
      name: celeb.heroSection?.name || celeb.name,
      profileImage: celeb.heroSection?.profileImage || celeb.profileImage,
      slug: celeb.heroSection?.slug || celeb.slug,
      profession: celeb.heroSection?.profession || celeb.profession || ["Entertainment Professional"]
    }));

    const unifiedData = {
      categoryCounts,
      celebrities: transformedCelebrities,
      recentGuides,
      boxOffice: boxOfficeData,
      ottIntelligence
    };

    return {
      props: {
        unifiedData: JSON.parse(JSON.stringify(unifiedData)), // Serialize for Next.js
      },
      revalidate: 60, // Revalidate every 60 seconds (ISR)
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      props: {
        unifiedData: null,
      },
      revalidate: 60,
    };
  }
}

export default function Home({ unifiedData }) {
  useEffect(() => {
    // Record unique visit
    fetch("/api/public/record-visit", { method: "POST" }).catch(err => console.error("Visit recording failed", err));
  }, []);

  return (
    <>
      <HeroSection />
      <WhyFilmyFire />
      <CategoryHubSection unifiedData={unifiedData} />
      <GuidesSection unifiedData={unifiedData} />
      <InsightsDuoSection unifiedData={unifiedData} />
      <CelebritySection unifiedData={unifiedData} />
      <OurCommitment />
      <InnovationRoadmap />
      <JoinCommunity />
    </>
  );
}

Home.noPadding = true;
