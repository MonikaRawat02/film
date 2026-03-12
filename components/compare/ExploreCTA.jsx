"use client";
import { useRouter } from "next/router";

export default function ExploreCTA({ aSlug, bSlug, aName = "Celebrity A", bName = "Celebrity B" }) {
  const router = useRouter();
  const go = (href) => () => router.push(href);
  return (
    <section className="lg:px-8 py-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#DC2626] to-[#991B1B] rounded-xl p-8 text-center">
          <h3 className="text-2xl mb-4 text-white">Explore Full Intelligence</h3>
          <p className="text-white/90 mb-6">
            Get deeper insights into careers, movies, and complete financial breakdowns
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {aSlug ? (
              <button
                type="button"
                onClick={go(`/celebrity/${aSlug}/profile`)}
                className="bg-white text-[#DC2626] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                View {aName}&apos;s Full Profile
              </button>
            ) : null}
            {bSlug ? (
              <button
                type="button"
                onClick={go(`/celebrity/${bSlug}/profile`)}
                className="bg-white text-[#DC2626] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                View {bName}&apos;s Full Profile
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
