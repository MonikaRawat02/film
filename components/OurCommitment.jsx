import { XCircle, CheckCircle2, Shield } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

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
    <section className="relative py-32 bg-[#050505]">
      <div className="absolute inset-0 -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-600/5 to-green-600/5 rounded-full blur-3xl -z-10" />
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12 relative text-center">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-block px-4 py-2 bg-white/5 border border-gray-800 rounded-full mb-10 uppercase text-gray-400 text-sm font-semibold tracking-wider">
            OUR COMMITMENT
          </div>
          <h2
            className="text-white mb-2"
            style={{
              ...playfair.style,
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: "48px",
              lineHeight: "60px",
              fontWeight: 800,
            }}
          >
            Why FilmyFire Is Different
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {items.map((it, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-3xl p-10 text-center transition-all duration-300 ${
                it.type === "positive"
                  ? "bg-gradient-to-br from-green-950/20 to-transparent border-2 border-green-900/30"
                  : "bg-gradient-to-br from-red-950/20 to-transparent border-2 border-red-900/30"
              }`}
            >
              <div
                className={`w-16 h-16 ${
                  it.type === "positive" ? "bg-green-600/20" : "bg-red-600/20"
                } rounded-2xl flex items-center justify-center mx-auto mb-6`}
              >
                {it.type === "positive" ? (
                  <CheckCircle2 className="w-9 h-9 text-green-500" />
                ) : (
                  <XCircle className="w-9 h-9 text-red-500" />
                )}
              </div>
              <p className="text-white text-xl font-bold leading-relaxed">
                {it.title}
              </p>
            </div>
          ))}
        </div>

        <div className="relative rounded-3xl border border-gray-800 bg-[#0b0b10] px-6 py-10 sm:px-10 lg:px-14 lg:py-12 overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-orange-600/5" />
          <div className="relative flex flex-col items-center gap-4 md:gap-6">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-8" />
            <p className="text-white text-3xl font-bold leading-relaxed max-w-4xl mx-auto">
              FilmyFire is a{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                reference platform
              </span>{" "}
              for serious movie &amp; web series enthusiasts who seek{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                intelligence, not just information.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
