import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "react-toastify";
import { Plus, Trash2, Edit, Save, X, BarChart, Search as SearchIcon, Loader2, Film, DollarSign, TrendingUp, Award, Dna, SlidersHorizontal, Heart, Target, Brain, Users, Sparkles, RefreshCw } from "lucide-react";

export default function BoxOfficeAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialDNA = {
    emotionalIntensity: 0,
    violenceLevel: 0,
    psychologicalDepth: 0,
    familyFriendliness: 0,
    complexityLevel: 0,
  };

  const [formData, setFormData] = useState({
    movieName: "",
    budget: "",
    openingWeekend: "",
    collection: "",
    roi: "",
    profit: "",
    verdict: "HIT",
    analysisLink: "",
    movieDNA: { ...initialDNA },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/box-office?q=${searchQuery}`);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/admin/box-office?id=${editingItem._id}` : "/api/admin/box-office";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ 
          movieName: "", 
          budget: "", 
          openingWeekend: "",
          collection: "", 
          roi: "", 
          profit: "",
          verdict: "HIT", 
          analysisLink: "", 
          movieDNA: { ...initialDNA } 
        });
        fetchData();
        toast.success(`Movie ${editingItem ? "updated" : "added"} successfully!`);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save movie");
      }
    } catch (error) {
      toast.error("Error submitting form");
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    // Merge item with default DNA to handle old records
    setFormData({
      ...item,
      movieDNA: item.movieDNA ? { ...item.movieDNA } : { ...initialDNA }
    });
    setIsModalOpen(true);
  };

  const handleSync = async (id) => {
    try {
      toast.info("Syncing Box Office Intelligence...");
      const res = await fetch("/api/admin/automation/sync-box-office", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Synced: ${data.data.movieName} is now marked as ${data.data.verdict}!`);
        fetchData();
      } else {
        toast.error("Sync Failed: " + data.message);
      }
    } catch (err) {
      toast.error("Sync Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/box-office?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        toast.success("Movie deleted successfully!");
      } else {
        toast.error("Failed to delete movie");
      }
    } catch (error) {
      toast.error("Error deleting item");
      console.error("Error deleting item:", error);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Box Office Management | Admin</title>
      </Head>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart className="text-red-600" /> Box Office Truth
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-white/5">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span>Syncing from Articles Database</span>
          </div>
        </div>

        <div className="bg-gray-900/20 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
            <div className="h-6 w-6 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Edit className="h-3.5 w-3.5 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300">Update Existing Movie</h3>
          </div>
          
          <div className="relative group mb-6">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search movie by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-gray-900/50 border border-gray-800 pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-red-500 mb-2" />
              <p className="text-sm">Searching movies...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item._id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-700 transition-all">
                  <div className="flex-1 pr-6 w-full">
                    <h3 className="font-bold text-lg mb-2">{item.movieName}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                      <span className="bg-gray-800/50 px-2 py-1 rounded">Budget: <span className="text-white font-medium">{item.budget}</span></span>
                      <span className="bg-gray-800/50 px-2 py-1 rounded">Opening: <span className="text-white font-medium">{item.openingWeekend}</span></span>
                      <span className="bg-gray-800/50 px-2 py-1 rounded">Collection: <span className="text-white font-medium">{item.collection}</span></span>
                      <span className="bg-gray-800/50 px-2 py-1 rounded">Profit: <span className="text-blue-500 font-medium">{item.profit}</span></span>
                      <span className="bg-gray-800/50 px-2 py-1 rounded">ROI: <span className="text-green-500 font-medium">{item.roi}</span></span>
                      <span className={`px-3 py-1 rounded text-xs font-bold ${
                        item.verdict === "BLOCKBUSTER" ? "bg-purple-900/50 text-purple-400" :
                        item.verdict === "SUPER HIT" ? "bg-blue-900/50 text-blue-400" :
                        item.verdict === "HIT" ? "bg-green-900/50 text-green-400" :
                        item.verdict === "AVERAGE" ? "bg-yellow-900/50 text-yellow-400" :
                        "bg-red-900/50 text-red-400"
                      }`}>
                        {item.verdict}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => handleSync(item._id)} 
                      title="Sync AI Intelligence"
                      className="p-2 hover:bg-gray-800 rounded-lg text-yellow-400 transition-all hover:scale-110"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-800 rounded-lg text-blue-400 transition-all hover:scale-110">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-gray-800 rounded-lg text-red-400 transition-all hover:scale-110">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-900/20 border border-dashed border-gray-800 rounded-xl">
              <SearchIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500">No movies found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 w-full max-w-2xl rounded-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
              {/* Modal Header with Gradient */}
              <div className="bg-gradient-to-r from-red-600/20 to-transparent p-6 pb-4 border-b border-gray-800 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center">
                      {editingItem ? (
                        <Edit className="h-5 w-5 text-red-500" />
                      ) : (
                        <Film className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {editingItem ? "Edit Movie" : "Add New Movie"}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {editingItem ? "Update movie details below" : "Enter the box office details"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="text-gray-400 hover:text-white transition-all hover:scale-110 bg-gray-800/50 hover:bg-gray-800 p-2 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body - Scrollable */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info Section */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Film className="h-4 w-4 text-red-500" />
                        Movie Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Avatar: The Way of Water"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                        value={formData.movieName}
                        onChange={(e) => setFormData({ ...formData, movieName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-red-500" />
                          Budget
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="$350M"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-orange-500" />
                          Opening Weekend
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="$50M"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                          value={formData.openingWeekend}
                          onChange={(e) => setFormData({ ...formData, openingWeekend: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          Worldwide Collection
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="$2.3B"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                          value={formData.collection}
                          onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          Profit
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="$500M"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                          value={formData.profit}
                          onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          ROI
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="+562%"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                          value={formData.roi}
                          onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          Verdict
                        </label>
                        <select
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                          value={formData.verdict}
                          onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                        >
                          <option value="BLOCKBUSTER" className="bg-gray-900">BLOCKBUSTER</option>
                          <option value="SUPER HIT" className="bg-gray-900">SUPER HIT</option>
                          <option value="HIT" className="bg-gray-900">HIT</option>
                          <option value="AVERAGE" className="bg-gray-900">AVERAGE</option>
                          <option value="FLOP" className="bg-gray-900">FLOP</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Movie DNA Section */}
                  <div className="bg-gray-800/20 rounded-2xl border border-gray-800 p-5 space-y-4">
                    <label className="block text-sm font-bold text-purple-400 flex items-center gap-2 uppercase tracking-widest">
                      <Dna className="h-4 w-4" />
                      Movie DNA Parameters
                    </label>
                    
                    <div className="space-y-5">
                      {[{ key: 'emotionalIntensity', label: 'Emotional Intensity', color: 'bg-pink-500', icon: Heart },
                        { key: 'violenceLevel', label: 'Violence Level', color: 'bg-orange-500', icon: Target },
                        { key: 'psychologicalDepth', label: 'Psychological Depth', color: 'bg-indigo-500', icon: Brain },
                        { key: 'familyFriendliness', label: 'Family Friendliness', color: 'bg-teal-500', icon: Users },
                        { key: 'complexityLevel', label: 'Complexity Level', color: 'bg-amber-500', icon: Sparkles }
                      ].map((dna) => (
                        <div key={dna.key} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center">
                                <dna.icon className="h-3 w-3 text-gray-400" />
                              </div>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{dna.label}</span>
                            </div>
                            <span className="text-[10px] font-black text-white bg-gray-900 px-2 py-0.5 rounded border border-gray-800 shadow-inner">
                              {formData.movieDNA?.[dna.key] || 0}%
                            </span>
                          </div>
                          <div className="relative h-6 flex items-center group/slider">
                            {/* Track */}
                            <div className="absolute inset-0 h-1.5 my-auto w-full bg-gray-900/80 border border-gray-800 rounded-full" />
                            
                            {/* Filled */}
                            <div
                              className={`absolute left-0 h-1.5 my-auto rounded-full ${dna.color} shadow-lg shadow-purple-500/10`}
                              style={{ width: `${formData.movieDNA?.[dna.key] || 0}%` }}
                            />

                            {/* Sliders Icon Thumb */}
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform"
                              style={{ left: `${formData.movieDNA?.[dna.key] || 0}%` }}
                            >
                              <div className="h-7 w-7 rounded-xl bg-gray-950 border border-gray-700 shadow-2xl flex items-center justify-center text-purple-400 group-hover/slider:scale-110 group-hover/slider:border-purple-500/50 transition-all">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                              </div>
                            </div>

                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={formData.movieDNA?.[dna.key] || 0}
                              onChange={(e) => setFormData({
                                ...formData,
                                movieDNA: {
                                  ...formData.movieDNA,
                                  [dna.key]: parseInt(e.target.value)
                                }
                              })}
                              className="relative z-10 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20"
                  >
                    <Save size={18} /> {editingItem ? "Update Movie" : "Save Movie"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}