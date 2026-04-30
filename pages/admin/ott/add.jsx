import { useState } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Globe, BarChart3, Users, DollarSign, Activity, Star, ShieldCheck, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function AddOTTPlatform() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo: "",
    tagline: "",
    description: "",
    website: "",
    launchYear: 2024,
    countries: 1,
    rank: 10,
    subscribers: 0,
    monthlyVisits: 0,
    marketShare: 0,
    growthRate: 0,
    avgDealValue: "",
    indiaRank: 10,
    appRating: 4.0,
    pricing: [{ plan: "", price: "" }],
    contentLibrary: {
      movies: 0,
      series: 0,
      anime: 0,
      docs: 0,
      indianTitles: 0,
    },
    genreStrength: [{ genre: "", score: 0 }],
    regions: [{ region: "", strength: "Medium" }],
    revenue: {
      monthly: "",
      arpu: "",
      growthYoY: "",
    },
    demographics: [{ group: "", share: 0 }],
    producerInsights: [""],
    risks: [""],
    comparisonStats: {
      originals: 5,
      movies: 5,
      price: 5,
      indiaReach: 5,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
       const [obj, key] = name.split('.');
       setFormData(prev => ({
         ...prev,
         [obj]: { ...prev[obj], [key]: value }
       }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (index, field, value, arrayName) => {
    const newArray = [...formData[arrayName]];
    newArray[index][field] = value;
    setFormData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const addArrayItem = (arrayName, item) => {
    setFormData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], item] }));
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = [...formData[arrayName]];
    newArray.splice(index, 1);
    setFormData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ott/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Platform created successfully!");
        router.push("/admin/ott-intelligence");
      } else {
        toast.error(data.message || "Failed to create platform");
      }
    } catch (error) {
      toast.error("Error creating platform");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Add OTT Platform | FilmyFire Admin</title>
      </Head>

      <div className="p-8 max-w-[1200px] mx-auto pb-32">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
             <Link href="/admin/ott-intelligence" className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
             </Link>
             <div>
                <h1 className="text-4xl font-black text-white mb-1">Add Platform</h1>
                <p className="text-zinc-500 font-medium">Create a new premium OTT intelligence profile.</p>
             </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
          >
            {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Platform
          </button>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
           {/* Basic Info */}
           <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-zinc-800">
              <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-8 flex items-center gap-3">
                 <Globe className="w-5 h-5" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Platform Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Netflix" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Slug</label>
                    <input name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. netflix" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Tagline</label>
                    <input name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Premium Global Streaming Leader" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Website URL</label>
                    <input name="website" value={formData.website} onChange={handleChange} placeholder="https://netflix.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
              </div>
           </div>

           {/* Stats */}
           <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-zinc-800">
              <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-8 flex items-center gap-3">
                 <BarChart3 className="w-5 h-5" /> Market Intelligence Stats
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Subscribers</label>
                    <input type="number" name="subscribers" value={formData.subscribers} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Market Share (%)</label>
                    <input type="number" name="marketShare" value={formData.marketShare} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">India Rank</label>
                    <input type="number" name="indiaRank" value={formData.indiaRank} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Global Rank</label>
                    <input type="number" name="rank" value={formData.rank} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
              </div>
           </div>

           {/* Dynamic Sections (Pricing, Genre, etc.) - Simplified for now */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-zinc-800">
                 <h2 className="text-lg font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center justify-between">
                    Pricing Plans
                    <button type="button" onClick={() => addArrayItem('pricing', { plan: '', price: '' })} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all">
                       <Plus className="w-4 h-4 text-zinc-400" />
                    </button>
                 </h2>
                 <div className="space-y-4">
                    {formData.pricing.map((p, i) => (
                       <div key={i} className="flex gap-4">
                          <input value={p.plan} onChange={(e) => handleArrayChange(i, 'plan', e.target.value, 'pricing')} placeholder="Plan Name" className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" />
                          <input value={p.price} onChange={(e) => handleArrayChange(i, 'price', e.target.value, 'pricing')} placeholder="Price" className="w-32 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" />
                          <button type="button" onClick={() => removeArrayItem('pricing', i)} className="p-3 rounded-xl bg-red-500/10 text-red-500"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-zinc-800">
                 <h2 className="text-lg font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center justify-between">
                    Genre Strength
                    <button type="button" onClick={() => addArrayItem('genreStrength', { genre: '', score: 0 })} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all">
                       <Plus className="w-4 h-4 text-zinc-400" />
                    </button>
                 </h2>
                 <div className="space-y-4">
                    {formData.genreStrength.map((g, i) => (
                       <div key={i} className="flex gap-4">
                          <input value={g.genre} onChange={(e) => handleArrayChange(i, 'genre', e.target.value, 'genreStrength')} placeholder="Genre" className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" />
                          <input type="number" value={g.score} onChange={(e) => handleArrayChange(i, 'score', e.target.value, 'genreStrength')} placeholder="Score" className="w-32 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" />
                          <button type="button" onClick={() => removeArrayItem('genreStrength', i)} className="p-3 rounded-xl bg-red-500/10 text-red-500"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </form>
      </div>
    </AdminLayout>
  );
}
