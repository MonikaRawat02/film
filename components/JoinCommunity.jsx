import { Youtube, Twitter, Instagram, Mail, MailOpen, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function JoinCommunity() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const socials = [
    { name: "YouTube", icon: Youtube, bg: "bg-white/10 hover:bg-white/20" },
    { name: "Twitter", icon: Twitter, bg: "bg-white/10 hover:bg-white/20" },
    { name: "Instagram", icon: Instagram, bg: "bg-white/10 hover:bg-white/20" },
    { name: "Email", icon: Mail, bg: "bg-white/10 hover:bg-white/20" },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Successfully subscribed!");
        setEmail("");
      } else {
        toast.error(data.message || "Failed to subscribe.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-32 bg-[#050505] relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-red-600/5 to-purple-600/5 rounded-full blur-3xl" />
      </div>
      <div className="mx-auto max-w-[1000px] px-6">
        <div className="text-center space-y-4 mb-10">
          <span className="inline-block px-4 py-2 bg-white/5 border border-gray-800 rounded-full text-xs font-semibold uppercase tracking-wider text-gray-300 mb-10">
            Join Our Community
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
            Join Serious Movie Intelligence
            <br className="hidden md:block" /> Readers
          </h2>
          <p className="text-gray-400 text-xl mb-16 max-w-3xl mx-auto">
            Get exclusive explainers, box office insights &amp; celebrity profiles delivered to your inbox
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="mx-auto max-w-2xl relative flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${loading ? "text-red-500 animate-pulse" : "text-gray-500"}`} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for weekly intelligence"
              className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-600/50 focus:bg-white/10 transition-all"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-bold text-lg shadow-lg shadow-red-800/30 inline-flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Subscribe</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            No spam. Only quality film intelligence. 50,000+ subscribers
          </span>
        </p>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400 mb-4">Follow FilmyFire Across Platforms</p>
          <div className="flex items-center justify-center gap-6">
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
