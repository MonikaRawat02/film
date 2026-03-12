// import { useState, useEffect, useCallback } from "react";
// import Head from "next/head";
// import AdminLayout from "@/components/AdminLayout";
// import { Plus, Trash2, Edit, Save, X, BarChart, Search as SearchIcon, Loader2 } from "lucide-react";

// export default function BoxOfficeAdmin() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [editingItem, setEditingItem] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     movieName: "",
//     budget: "",
//     collection: "",
//     roi: "",
//     verdict: "HIT",
//     analysisLink: ""
//   });

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/admin/box-office?q=${searchQuery}`);
//       const data = await res.json();
//       if (data.success) setItems(data.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [searchQuery]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchData();
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [fetchData]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem("adminToken");
//     const method = editingItem ? "PUT" : "POST";
//     const url = editingItem ? `/api/admin/box-office?id=${editingItem._id}` : "/api/admin/box-office";

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(formData)
//       });
//       if (res.ok) {
//         setIsModalOpen(false);
//         setEditingItem(null);
//         setFormData({ movieName: "", budget: "", collection: "", roi: "", verdict: "HIT", analysisLink: "" });
//         fetchData();
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//     }
//   };

//   const handleEdit = (item) => {
//     setEditingItem(item);
//     setFormData(item);
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure?")) return;
//     const token = localStorage.getItem("adminToken");
//     try {
//       const res = await fetch(`/api/admin/box-office?id=${id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.ok) fetchData();
//     } catch (error) {
//       console.error("Error deleting item:", error);
//     }
//   };

//   return (
//     <AdminLayout>
//       <Head>
//         <title>Box Office Management | Admin</title>
//       </Head>
//       <div className="space-y-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <BarChart className="text-red-600" /> Box Office Truth
//           </h1>
//           <button
//             onClick={() => {
//               setEditingItem(null);
//               setFormData({ movieName: "", budget: "", collection: "", roi: "", verdict: "HIT", analysisLink: "" });
//               setIsModalOpen(true);
//             }}
//             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//           >
//             <Plus size={18} /> Add Movie
//           </button>
//         </div>

//         <div className="bg-gray-900/20 rounded-xl border border-gray-800 p-5">
//           <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
//             <div className="h-6 w-6 rounded-lg bg-red-500/10 flex items-center justify-center">
//               <Edit className="h-3.5 w-3.5 text-red-500" />
//             </div>
//             <h3 className="text-sm font-semibold text-gray-300">Update Existing Movie</h3>
//           </div>
          
//           <div className="relative group mb-6">
//             <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
//               <SearchIcon className="h-4 w-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search movie by name..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full rounded-lg bg-gray-900/50 border border-gray-800 pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700"
//             />
//           </div>

//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-12 text-gray-500">
//               <Loader2 className="h-8 w-8 animate-spin text-red-500 mb-2" />
//               <p className="text-sm">Searching movies...</p>
//             </div>
//           ) : items.length > 0 ? (
//             <div className="grid gap-4">
//               {items.map((item) => (
//                 <div key={item._id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                   <div className="flex-1 pr-6 w-full">
//                     <h3 className="font-bold text-lg mb-2">{item.movieName}</h3>
//                     <div className="flex flex-wrap gap-3 text-sm text-gray-400">
//                       <span className="bg-gray-800/50 px-2 py-1 rounded">Budget: <span className="text-white font-medium">{item.budget}</span></span>
//                       <span className="bg-gray-800/50 px-2 py-1 rounded">Collection: <span className="text-white font-medium">{item.collection}</span></span>
//                       <span className="bg-gray-800/50 px-2 py-1 rounded">ROI: <span className="text-green-500 font-medium">{item.roi}</span></span>
//                       <span className={`px-3 py-1 rounded text-xs font-bold ${
//                         item.verdict === "BLOCKBUSTER" ? "bg-purple-900/50 text-purple-400" :
//                         item.verdict === "SUPER HIT" ? "bg-blue-900/50 text-blue-400" :
//                         item.verdict === "HIT" ? "bg-green-900/50 text-green-400" :
//                         item.verdict === "AVERAGE" ? "bg-yellow-900/50 text-yellow-400" :
//                         "bg-red-900/50 text-red-400"
//                       }`}>
//                         {item.verdict}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex gap-2 self-end sm:self-center">
//                     <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-800 rounded-lg text-blue-400 transition-colors">
//                       <Edit size={18} />
//                     </button>
//                     <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-gray-800 rounded-lg text-red-400 transition-colors">
//                       <Trash2 size={18} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12 bg-gray-900/20 border border-dashed border-gray-800 rounded-xl">
//               <SearchIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
//               <p className="text-gray-500">No movies found matching "{searchQuery}"</p>
//             </div>
//           )}
//         </div>

//         {isModalOpen && (
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-gray-950 border border-gray-800 w-full max-w-md rounded-2xl p-6 relative">
//               <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
//                 <X size={20} />
//               </button>
//               <h2 className="text-xl font-bold mb-6">{editingItem ? "Edit Movie" : "Add New Movie"}</h2>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-400 mb-1">Movie Name</label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="e.g., Avatar: The Way of Water"
//                     className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
//                     value={formData.movieName}
//                     onChange={(e) => setFormData({ ...formData, movieName: e.target.value })}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-400 mb-1">Budget</label>
//                     <input
//                       type="text"
//                       required
//                       placeholder="$350M"
//                       className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
//                       value={formData.budget}
//                       onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-400 mb-1">Collection</label>
//                     <input
//                       type="text"
//                       required
//                       placeholder="$2.3B"
//                       className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
//                       value={formData.collection}
//                       onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-400 mb-1">ROI</label>
//                     <input
//                       type="text"
//                       required
//                       placeholder="+562%"
//                       className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
//                       value={formData.roi}
//                       onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-400 mb-1">Verdict</label>
//                     <select
//                       className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
//                       value={formData.verdict}
//                       onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
//                     >
//                       <option value="BLOCKBUSTER">BLOCKBUSTER</option>
//                       <option value="SUPER HIT">SUPER HIT</option>
//                       <option value="HIT">HIT</option>
//                       <option value="AVERAGE">AVERAGE</option>
//                       <option value="FLOP">FLOP</option>
//                     </select>
//                   </div>
//                 </div>
//                 <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
//                   <Save size={18} /> {editingItem ? "Update Movie" : "Save Movie"}
//                 </button>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Trash2, Edit, Save, X, BarChart, Search as SearchIcon, Loader2, Film, DollarSign, TrendingUp, Award } from "lucide-react";

export default function BoxOfficeAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    movieName: "",
    budget: "",
    collection: "",
    roi: "",
    verdict: "HIT",
    analysisLink: ""
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
        setFormData({ movieName: "", budget: "", collection: "", roi: "", verdict: "HIT", analysisLink: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
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
      if (res.ok) fetchData();
    } catch (error) {
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
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({ movieName: "", budget: "", collection: "", roi: "", verdict: "HIT", analysisLink: "" });
              setIsModalOpen(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Add Movie
          </button>
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
                      <span className="bg-gray-800/50 px-2 py-1 rounded">Collection: <span className="text-white font-medium">{item.collection}</span></span>
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

        {/* Redesigned Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 w-full max-w-md rounded-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
              {/* Modal Header with Gradient */}
              <div className="bg-gradient-to-r from-red-600/20 to-transparent p-6 pb-4 border-b border-gray-800">
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

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Movie Name Field */}
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

                {/* Budget and Collection Row */}
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
                      Collection
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
                </div>

                {/* ROI and Verdict Row */}
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

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
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
                    <Save size={18} /> {editingItem ? "Update" : "Save"}
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