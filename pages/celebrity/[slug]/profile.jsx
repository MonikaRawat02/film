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

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    // We need a token for some APIs, but getCelebrity for profile might be public or use a different auth.
    // Based on previous edits, getCelebrity required a token.
    // However, for public profiles, we should probably have a public version.
    // For now, let's try fetching it.
    const res = await fetch(`${baseUrl}/api/admin/celebrity/getCelebrity?slug=${encodeURIComponent(slug)}`, {
      headers: {
        // If the API requires admin token, we might need to pass it here from a secure place or make the API public.
        // For now, I'll assume we might need a token if the user's API still has the check.
        // Actually, the user's API has a check for "admin" role.
        // This is a bit problematic for a public profile page.
        // But I will follow the user's lead.
      }
    });
    const data = await res.json();

    if (!res.ok || !data.data) {
      return { notFound: true };
    }

    return {
      props: {
        celebrity: data.data,
      },
    };
  } catch (error) {
    console.error("Error fetching celebrity data:", error);
    return { notFound: true };
  }
}

export default function CelebrityProfile({ celebrity }) {
  if (!celebrity) return null;

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
