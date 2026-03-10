import { XCircle, CheckCircle2, Shield } from "lucide-react";

export default function OurCommitment() {
  const items = [
    {
      title: "No Breaking News",
      type: "negative",
      icon: <XCircle className="h-8 w-8" />,
    },
    {
      title: "No Gossip",
      type: "negative",
      icon: <XCircle className="h-8 w-8" />,
    },
    {
      title: "No Piracy",
      type: "negative",
      icon: <XCircle className="h-8 w-8" />,
    },
    {
      title: "Only Explained, Verified & Evergreen Content",
      type: "positive",
      icon: <CheckCircle2 className="h-8 w-8" />,
    },
  ];

  return (
    <section className="relative py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0f0015] via-fuchsia-900/10 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="text-center space-y-4 mb-12">
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-gray-800 bg-black/40 text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-400">
            Our Commitment
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
            Why FilmyFire Is Different
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {items.map((it, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-2xl p-8 text-center transition-all duration-300 bg-[#0b0b10] border ${
                it.type === "positive"
                  ? "border-emerald-700/40 hover:border-emerald-500/60"
                  : "border-rose-800/40 hover:border-rose-600/60"
              }`}
            >
              <div
                className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border ${
                  it.type === "positive"
                    ? "text-emerald-300 border-emerald-700/40 bg-emerald-500/10"
                    : "text-rose-300 border-rose-800/40 bg-rose-500/10"
                }`}
              >
                {it.icon}
              </div>
              <p className="text-base md:text-lg font-semibold text-white leading-snug">
                {it.title}
              </p>
              <div
                className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity ${
                  it.type === "positive"
                    ? "bg-gradient-to-br from-emerald-500 to-green-600"
                    : "bg-gradient-to-br from-rose-600 to-pink-600"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="relative rounded-3xl border border-gray-800 bg-[#0b0b10] px-6 py-10 sm:px-10 lg:px-14 lg:py-12 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top_left,rgba(236,72,153,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.25),transparent_50%)]" />
          <div className="relative flex items-start gap-4 md:gap-6">
            <div className="mt-1 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl border border-pink-700/40 bg-pink-600/10 text-pink-300 flex-shrink-0">
              <Shield className="h-7 w-7 md:h-8 md:w-8" />
            </div>
            <p className="text-base md:text-xl leading-relaxed text-gray-200">
              FilmyFire is a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-300 to-yellow-300 font-semibold">
                reference platform
              </span>{" "}
              for serious movie & web series enthusiasts who seek{" "}
              <span className="text-white font-semibold">intelligence</span>, not just{" "}
              <span className="text-white font-semibold">information</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
