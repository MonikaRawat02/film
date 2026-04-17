import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "react-toastify";
import { Plus, Trash2, Edit, Save, X, BarChart, Search as SearchIcon, Loader2, Film, DollarSign, TrendingUp, Award, Dna, SlidersHorizontal, Heart, Target, Brain, Users, Sparkles } from "lucide-react";

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
    collection: "",
    boxOffice: {
      openingWeekend: "",
      india: "",
      worldwide: "",
      analysisLink: "",
    },
    subPages: {
      endingExplained: false,
      boxOffice: false,
      budget: false,
      ottRelease: false,
      cast: false,
      reviewAnalysis: false,
      hitOrFlop: false,
    },
    roi: "",
    verdict: "HIT",
    analysisLink: "",
    movieDNA: { ...initialDNA },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Only add query parameter if searchQuery is not empty
      const queryParams = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/admin/box-office${queryParams}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        toast.error(`Failed to fetch movies: ${errorData.message || 'Unknown error'}`);
        setItems([]);
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      } else {
        console.error("API returned success: false");
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Network error while fetching movies");
      setItems([]);
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
          collection: "", 
          boxOffice: {
            openingWeekend: "",
            india: "",
            worldwide: "",
            analysisLink: "",
          },
          subPages: {
            endingExplained: false,
            boxOffice: false,
            budget: false,
            ottRelease: false,
            cast: false,
            reviewAnalysis: false,
            hitOrFlop: false,
          },
          roi: "", 
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
    // Merge item with default DNA and subPages to handle old records
    setFormData({
      ...item,
      boxOffice: item.boxOffice || {
        openingWeekend: "",
        india: "",
        worldwide: item.collection || "",
        analysisLink: "",
      },
      subPages: item.subPages || {
        endingExplained: false,
        boxOffice: false,
        budget: false,
        ottRelease: false,
        cast: false,
        reviewAnalysis: false,
        hitOrFlop: false,
      },
      movieDNA: item.movieDNA ? { ...item.movieDNA } : { ...initialDNA }
    });
    setIsModalOpen(true);
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
        <div className="flex flex-col gap-2">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Dashboard</p>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart className="text-red-600" /> Box Office Truth
            </h1>
            <button
              onClick={() => {
              setEditingItem(null);
              setFormData({ 
                movieName: "", 
                budget: "", 
                collection: "", 
                boxOffice: {
                  openingWeekend: "",
                  india: "",
                  worldwide: "",
                  analysisLink: "",
                },
                subPages: {
                  endingExplained: false,
                  boxOffice: false,
                  budget: false,
                  ottRelease: false,
                  cast: false,
                  reviewAnalysis: false,
                  hitOrFlop: false,
                },
                roi: "", 
                verdict: "HIT", 
                analysisLink: "",
                movieDNA: { ...initialDNA }
              });
              setIsModalOpen(true);
            }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 font-bold shadow-lg shadow-red-600/20"
            >
              <Plus size={18} /> Add Movie
            </button>
          </div>
        </div>

        <div className="bg-[#0c0c14] rounded-2xl border border-zinc-800/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-6 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Edit className="h-3.5 w-3.5 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-zinc-300">Update Existing Movie</h3>
          </div>
          
          <div className="relative group mb-8">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search movie by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-zinc-950/50 border border-zinc-800/80 pl-12 pr-4 py-4 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
              <Loader2 className="h-8 w-8 animate-spin text-red-500 mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">Scanning Intelligence Database...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="group bg-zinc-950/40 border border-zinc-800/50 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-zinc-900/40 transition-all border-l-2 border-l-transparent hover:border-l-red-500/50 shadow-sm">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col mb-4">
                      <h3 className="font-black text-xl text-white group-hover:text-red-400 transition-colors tracking-tight">{item.movieName}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800/50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Budget:</span>
                        <span className="text-xs font-bold text-zinc-200">{item.budget || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800/50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">WW:</span>
                        <span className="text-xs font-bold text-zinc-100">{item.boxOffice?.worldwide || item.collection || 'N/A'}</span>
                      </div>
                      
                      {item.boxOffice?.openingWeekend && item.boxOffice.openingWeekend !== 'N/A' && (
                        <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800/50">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">OW:</span>
                          <span className="text-xs font-bold text-orange-400">{item.boxOffice.openingWeekend}</span>
                        </div>
                      )}

                      {item.boxOffice?.india && item.boxOffice.india !== 'N/A' && (
                        <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800/50">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">India:</span>
                          <span className="text-xs font-bold text-blue-400">{item.boxOffice.india}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800/50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">ROI:</span>
                        <span className={`text-xs font-black ${
                          item.roi && item.roi.includes('-') ? 'text-red-400' : 'text-green-400'
                        }`}>{item.roi || 'N/A'}</span>
                      </div>

                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                        item.verdict === "BLOCKBUSTER" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        item.verdict === "SUPER HIT" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        item.verdict === "HIT" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        item.verdict === "AVERAGE" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {item.verdict}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 self-end sm:self-center shrink-0">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="h-10 w-10 flex items-center justify-center bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all border border-blue-500/20"
                      title="Edit Movie"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)} 
                      className="h-10 w-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                      title="Delete Movie"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-900/20 border border-dashed border-gray-800 rounded-xl">
              {searchQuery ? (
                <>
                  <SearchIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500">No movies found matching "{searchQuery}"</p>
                </>
              ) : (
                <>
                  <Film className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 mb-2">No movies in the database yet</p>
                  <p className="text-sm text-gray-600">Click "Add Movie" to create your first entry</p>
                </>
              )}
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
                          <DollarSign className="h-4 w-4 text-green-500" />
                          Worldwide Collection
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="$2.3B"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                          value={formData.boxOffice?.worldwide || formData.collection}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            collection: e.target.value,
                            boxOffice: { ...formData.boxOffice, worldwide: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-orange-500" />
                          Opening Weekend
                        </label>
                        <input
                          type="text"
                          placeholder="₹150 crore"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                          value={formData.boxOffice?.openingWeekend || ""}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            boxOffice: { ...formData.boxOffice, openingWeekend: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          India Collection
                        </label>
                        <input
                          type="text"
                          placeholder="₹500 crore"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                          value={formData.boxOffice?.india || ""}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            boxOffice: { ...formData.boxOffice, india: e.target.value }
                          })}
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

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-red-500" />
                        Analysis Page Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://filmyfire.com/bollywood/box-office/movie-slug"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                        value={formData.boxOffice?.analysisLink || formData.analysisLink || ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          analysisLink: e.target.value,
                          boxOffice: { ...formData.boxOffice, analysisLink: e.target.value }
                        })}
                      />
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

                  {/* Page Configuration Section */}
                  <div className="bg-gray-800/20 rounded-2xl border border-gray-800 p-5 space-y-4 col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-blue-400 flex items-center gap-2 uppercase tracking-widest">
                      <SlidersHorizontal className="h-4 w-4" />
                      Page Configuration (Sub-pages)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Object.keys(formData.subPages || {}).map((page) => (
                        <label key={page} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-red-600 focus:ring-red-500 transition-all"
                            checked={formData.subPages?.[page] || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              subPages: {
                                ...formData.subPages,
                                [page]: e.target.checked
                              }
                            })}
                          />
                          <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors capitalize">
                            {page.replace(/([A-Z])/g, ' $1')}
                          </span>
                        </label>
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