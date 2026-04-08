import NetWorthSection from "@/components/NetWorthSection";
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

export default function CelebrityNetWorth({ celebrity }) {
  if (!celebrity) {
    return (
      <ErrorState 
        type="celebrity" 
        title="Net Worth Intelligence Unavailable" 
        description="We are currently auditing the financial assets and income streams for this profile. Detailed net worth analysis will be available soon."
      />
    );
  }

  return (
    <NetWorthSection celebrity={celebrity} />
  );
}

CelebrityNetWorth.noPadding = true;
