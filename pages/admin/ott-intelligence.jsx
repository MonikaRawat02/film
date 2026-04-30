import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "react-toastify";
import { Plus, Trash2, Edit, Search as SearchIcon, Loader2, Globe, BarChart3, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function OTTIntelligenceAdmin() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ott");
      const json = await res.json();
      if (json.success) {
        setPlatforms(json.data);
      }
    } catch (error) {
      console.error("Error fetching OTT platforms:", error);
      toast.error("Failed to fetch platforms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this platform? All associated data will be lost.")) return;
    
    try {
      const res = await fetch(`/api/admin/ott/delete/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
        toast.success("Platform deleted successfully!");
      } else {
        toast.error("Failed to delete platform");
      }
    } catch (error) {
      toast.error("Error deleting platform");
    }
  };

  const filteredPlatforms = platforms.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <Head>
        <title>OTT Intelligence Admin | FilmyFire</title>
      </Head>

      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">OTT Intelligence</h1>
            <p className="text-zinc-500">Manage streaming platforms, acquisitions, and rankings.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text"
                  placeholder="Search platforms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl pl-11 pr-6 py-3.5 text-sm text-white focus:outline-none focus:border-red-600/50 w-64 transition-all"
                />
             </div>
             <Link href="/admin/ott/add" className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-600/20">
               <Plus className="w-4 h-4" /> Add Platform
             </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Intelligence...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlatforms.map((platform) => (
              <div key={platform._id} className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 hover:border-zinc-700 transition-all group">
                <div className="flex items-center justify-between mb-8">
                   <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {platform.logo ? <img src={platform.logo} className="w-full h-full object-cover" /> : <span className="text-2xl font-black">{platform.name[0]}</span>}
                   </div>
                   <div className="flex items-center gap-2">
                      <Link href={`/admin/ott/edit/${platform._id}`} className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(platform._id)} className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                <h3 className="text-2xl font-black mb-1">{platform.name}</h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">{platform.tagline}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Market Share</p>
                      <p className="text-lg font-black text-white">{platform.marketShare}%</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Subscribers</p>
                      <p className="text-lg font-black text-white">{(platform.subscribers / 1000000).toFixed(0)}M</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                   <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-zinc-600" />
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Rank #{platform.rank}</span>
                   </div>
                   <Link href={`/ott/${platform.slug}`} target="_blank" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
                      Live View <ExternalLink className="w-3 h-3" />
                   </Link>
                </div>
              </div>
            ))}

            {filteredPlatforms.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
                 <Globe className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                 <h3 className="text-2xl font-black text-zinc-600 mb-2">No Platforms Found</h3>
                 <p className="text-zinc-500 mb-8">Try adjusting your search or add a new platform.</p>
                 <Link href="/admin/ott/add" className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-700 transition-all">
                    <Plus className="w-4 h-4" /> Add First Platform
                 </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
