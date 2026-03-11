// //pages/admin/box-office.jsx
// import { useState, useEffect } from "react";
// import Head from "next/head";
// import AdminLayout from "@/components/AdminLayout";
// import { Plus, Trash2, Edit, Save, X, BarChart } from "lucide-react";

// export default function BoxOfficeAdmin() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
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

//   const fetchData = async () => {
//     try {
//       const res = await fetch("/api/admin/box-office");
//       const data = await res.json();
//       if (data.success) setItems(data.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

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

//         {loading ? (
//           <div className="text-center py-10">Loading...</div>
//         ) : (
//           <div className="grid gap-4">
//             {items.map((item) => (
//               <div key={item._id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
//                 <div>
//                   <h3 className="font-bold text-lg">{item.movieName}</h3>
//                   <div className="flex gap-4 text-sm text-gray-400">
//                     <span>Budget: <span className="text-white">{item.budget}</span></span>
//                     <span>Collection: <span className="text-white">{item.collection}</span></span>
//                     <span>ROI: <span className="text-green-500">{item.roi}</span></span>
//                     <span className="bg-gray-800 px-2 rounded text-xs text-green-400">{item.verdict}</span>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-800 rounded-lg text-blue-400"><Edit size={18} /></button>
//                   <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-gray-800 rounded-lg text-red-400"><Trash2 size={18} /></button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {isModalOpen && (
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-gray-950 border border-gray-800 w-full max-w-md rounded-2xl p-6 relative">
//               <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
//               <h2 className="text-xl font-bold mb-6">{editingItem ? "Edit Movie" : "Add New Movie"}</h2>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-400 mb-1">Movie Name</label>
//                   <input
//                     type="text"
//                     required
//                     className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none"
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
//                       className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none"
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
//                       className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none"
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
//                       className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none"
//                       value={formData.roi}
//                       onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-400 mb-1">Verdict</label>
//                     <select
//                       className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none"
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
//                 <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
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
import { useState, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Trash2, Edit, Save, X, BarChart } from "lucide-react";

export default function BoxOfficeAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/box-office");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Movie
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item._id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                  <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-800 rounded-lg text-blue-400 transition-colors">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-gray-800 rounded-lg text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-950 border border-gray-800 w-full max-w-md rounded-2xl p-6 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-6">{editingItem ? "Edit Movie" : "Add New Movie"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Movie Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Avatar: The Way of Water"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
                    value={formData.movieName}
                    onChange={(e) => setFormData({ ...formData, movieName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Budget</label>
                    <input
                      type="text"
                      required
                      placeholder="$350M"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Collection</label>
                    <input
                      type="text"
                      required
                      placeholder="$2.3B"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
                      value={formData.collection}
                      onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">ROI</label>
                    <input
                      type="text"
                      required
                      placeholder="+562%"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
                      value={formData.roi}
                      onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Verdict</label>
                    <select
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
                      value={formData.verdict}
                      onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                    >
                      <option value="BLOCKBUSTER">BLOCKBUSTER</option>
                      <option value="SUPER HIT">SUPER HIT</option>
                      <option value="HIT">HIT</option>
                      <option value="AVERAGE">AVERAGE</option>
                      <option value="FLOP">FLOP</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                  <Save size={18} /> {editingItem ? "Update Movie" : "Save Movie"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}