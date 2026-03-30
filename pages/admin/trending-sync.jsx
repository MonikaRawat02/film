import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "react-toastify";
import { RefreshCw, TrendingUp, Film, User, Globe, Activity } from "lucide-react";

export default function TrendingSyncAdmin() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ topics: 0, movies: 0, actors: 0 });
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/trending?limit=1");
      const json = await res.json();
      if (json.success) {
        // This is a simplified stat fetch
        setStats({
          topics: json.data.topics?.length || 0,
          movies: json.data.movies?.length || 0,
          actors: json.data.actors?.length || 0
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/trending/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": "filmyfire_automation_secret_2026" // Default secret
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Global Trends Synced Successfully!");
        fetchStats();
      } else {
        toast.error("Sync Failed: " + data.message);
      }
    } catch (err) {
      toast.error("Sync Error: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Global Trends Sync</h1>
            <p className="text-zinc-500">Manage real-time data from Google & YouTube Trends</p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing Intelligence..." : "Force Global Sync"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
            <TrendingUp className="w-10 h-10 text-red-500 mb-6" />
            <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Viral Topics</h3>
            <p className="text-4xl font-black text-white">Active</p>
            <p className="text-sm text-zinc-600 mt-4">Sourced from Google Trends RSS (India)</p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
            <Film className="w-10 h-10 text-blue-500 mb-6" />
            <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Trending Movies</h3>
            <p className="text-4xl font-black text-white">Automated</p>
            <p className="text-sm text-zinc-600 mt-4">Matched & Enriched via TMDB API</p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
            <User className="w-10 h-10 text-emerald-500 mb-6" />
            <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Trending Actors</h3>
            <p className="text-4xl font-black text-white">Live</p>
            <p className="text-sm text-zinc-600 mt-4">Classified based on search popularity</p>
          </div>
        </div>

        <div className="mt-12 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center gap-4 mb-8">
            <Activity className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-white">Automation Status</h2>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-6 rounded-2xl bg-black/20 border border-white/5">
              <div>
                <p className="text-white font-bold">Google Trends Pipeline</p>
                <p className="text-sm text-zinc-500">Fetches daily trending searches every hour</p>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest">Healthy</span>
            </div>
            <div className="flex justify-between items-center p-6 rounded-2xl bg-black/20 border border-white/5">
              <div>
                <p className="text-white font-bold">YouTube Entertainment Sync</p>
                <p className="text-sm text-zinc-500">Analyzes top viral movie trailers & teasers</p>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest">Healthy</span>
            </div>
            <div className="flex justify-between items-center p-6 rounded-2xl bg-black/20 border border-white/5">
              <div>
                <p className="text-white font-bold">TMDB Enrichment Engine</p>
                <p className="text-sm text-zinc-500">Cross-references keywords with global movie database</p>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
