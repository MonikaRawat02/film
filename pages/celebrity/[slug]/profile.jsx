import ProfileHeroSection from "@/components/profile/ProfileHeroSection";
import QuickStatsSection from "@/components/profile/QuickStatsSection";
import WealthBreakdownSection from "@/components/profile/WealthBreakdownSection";
import BiographyTimelineSection from "@/components/profile/BiographyTimelineSection";
import IncomeSourcesSection from "@/components/profile/IncomeSourcesSection";
import AssetsLifestyleSection from "@/components/profile/AssetsLifestyleSection";
import CompareNetWorthSection from "@/components/profile/CompareNetWorthSection";
import RelatedIntelligenceSection from "@/components/profile/RelatedIntelligenceSection";
import FAQSection from "@/components/profile/FAQSection";
import EditorialTrustSection from "@/components/profile/EditorialTrustSection";
import ExploreCTASection from "@/components/profile/ExploreCTASection";
import ErrorState from "@/components/common/ErrorState";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const { req } = context;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  
  try {
    // Fetch celebrity profile from public API
    const res = await fetch(`${baseUrl}/api/celebrity/profile?slug=${encodeURIComponent(slug)}`);
    const data = await res.json();

    if (!res.ok || !data.data) {
      return { 
        props: { 
          celebrity: null 
        } 
      };
    }

    return {
      props: {
        celebrity: data.data,
      },
    };
  } catch (error) {
    console.error("Error fetching celebrity data:", error);
    return { 
      props: { 
        celebrity: null 
      } 
    };
  }
}

export default function CelebrityProfile({ celebrity }) {
  if (!celebrity) {
    return (
      <ErrorState 
        type="celebrity" 
        title="Celebrity Profile Not Found" 
        description="This celebrity profile is currently being enriched with financial and career intelligence. Check back shortly for the full report."
      />
    );
  }

  return (
    <>
      <ProfileHeroSection celebrity={celebrity} />
      <QuickStatsSection celebrity={celebrity} />
      <WealthBreakdownSection celebrity={celebrity} />
      <BiographyTimelineSection celebrity={celebrity} />
      <IncomeSourcesSection celebrity={celebrity} />
      <AssetsLifestyleSection celebrity={celebrity} />
      <CompareNetWorthSection celebrity={celebrity} />
      <RelatedIntelligenceSection celebrity={celebrity} />
      <FAQSection celebrity={celebrity} />
      <EditorialTrustSection celebrity={celebrity} />
      <ExploreCTASection celebrity={celebrity} />
    </>
  );
}

CelebrityProfile.noPadding = true;
