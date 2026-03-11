import NetWorthSection from "@/components/NetWorthSection";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    // Fetch celebrity profile from public API
    const res = await fetch(`${baseUrl}/api/celebrity/profile?slug=${encodeURIComponent(slug)}`);
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

export default function CelebrityNetWorth({ celebrity }) {
  return (
    <NetWorthSection celebrity={celebrity} />
  );
}
