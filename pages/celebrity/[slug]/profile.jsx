import PublicLayout from "@/components/PublicLayout";
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

export default function CelebrityProfile() {
  // In future, fetch celebrity data based on slug
  // const { slug } = router.query;
  
  return (
    <PublicLayout>
      <ProfileHeroSection />
      <QuickStatsSection />
      <WealthBreakdownSection />
      <BiographyTimelineSection />
      <IncomeSourcesSection />
      <AssetsLifestyleSection />
      <CompareNetWorthSection />
      <RelatedIntelligenceSection />
      <FAQSection />
      <EditorialTrustSection />
      <ExploreCTASection />
    </PublicLayout>
  );
}
