import { useState, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Globe, BarChart3, Activity, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function EditOTTPlatform() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchPlatform = async () => {
        try {
          // We need an API that gets by ID, but we have get by slug.
          // Let's use the public one and find it, or create a specific admin get by ID.
          const res = await fetch(`/api/ott`);
          const json = await res.json();
          if (json.success) {
            const platform = json.data.find(p => p._id === id);
            if (platform) {
              setFormData(platform);
            } else {
              toast.error("Platform not found");
            }
          }
        } catch (error) {
          toast.error("Error fetching platform");
        } finally {
          setLoading(false);
        }
      };
      fetchPlatform();
    }
  }, [id]);

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
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/ott/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Platform updated successfully!");
        router.push("/admin/ott-intelligence");
      } else {
        toast.error(data.message || "Failed to update platform");
      }
    } catch (error) {
      toast.error("Error updating platform");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Platform Data...</p>
      </div>
    </AdminLayout>
  );

  if (!formData) return null;

  return (
    <AdminLayout>
      <Head>
        <title>Edit {formData.name} | FilmyFire Admin</title>
      </Head>

      <div className="p-8 max-w-[1200px] mx-auto pb-32">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
             <Link href="/admin/ott-intelligence" className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
             </Link>
             <div>
                <h1 className="text-4xl font-black text-white mb-1">Edit Platform</h1>
                <p className="text-zinc-500 font-medium">Updating {formData.name} intelligence profile.</p>
             </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
          >
            {saving ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
           {/* Form content same as add.jsx but with formData */}
           <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-zinc-800">
              <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-8 flex items-center gap-3">
                 <Globe className="w-5 h-5" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Platform Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Slug</label>
                    <input name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Tagline</label>
                    <input name="tagline" value={formData.tagline} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-4">Website URL</label>
                    <input name="website" value={formData.website} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50" />
                 </div>
              </div>
           </div>

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
           
           {/* Add more sections as needed or refer to add.jsx */}
        </form>
      </div>
    </AdminLayout>
  );
}
