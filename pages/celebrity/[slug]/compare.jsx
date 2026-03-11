import CompareTopSection from "@/components/compare/CompareTopSection";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
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
  return <CompareTopSection celebrity={celebrity} />;
}
