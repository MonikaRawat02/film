import { Youtube, Twitter, Instagram, Mail, MailOpen } from "lucide-react";

export default function JoinCommunity() {
  const socials = [
    { name: "YouTube", icon: Youtube, bg: "bg-white/10 hover:bg-white/20" },
    { name: "Twitter", icon: Twitter, bg: "bg-sky-500 hover:bg-sky-400 text-white" },
    { name: "Instagram", icon: Instagram, bg: "bg-white/10 hover:bg-white/20" },
    { name: "Email", icon: Mail, bg: "bg-white/10 hover:bg-white/20" },
  ];

  return (
    <section className="relative py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,0,0,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.6),transparent_60%)]" />
      <div className="mx-auto max-w-[1000px] px-6">
        <div className="text-center space-y-4 mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-800 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-300">
            Join Our Community
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
            Join Serious Movie Intelligence
            <br className="hidden md:block" /> Readers
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get exclusive explainers, box office insights &amp; celebrity profiles delivered to your inbox
          </p>
        </div>

        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <div className="flex-1 rounded-2xl border border-red-800/50 bg-black/30 px-4 py-3 flex items-center gap-3">
            <MailOpen className="w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email for weekly intelligence"
              className="flex-1 bg-transparent outline-none text-gray-200 placeholder:text-gray-500 text-sm"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(255,59,48,0.25)] hover:from-red-500 hover:to-red-400 transition-all"
          >
            Subscribe
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            No spam. Only quality film intelligence. 50,000+ subscribers
          </span>
        </p>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400 mb-4">Follow FilmyFire Across Platforms</p>
          <div className="flex items-center justify-center gap-4">
            {socials.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={i}
                  className={`h-12 w-12 rounded-xl border border-gray-800 grid place-items-center text-gray-200 transition ${s.bg}`}
                  aria-label={s.name}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
