// //pages/admin/ott-intelligence.jsx
// import { useState, useEffect } from "react";
// import Head from "next/head";
// import AdminLayout from "@/components/AdminLayout";
// import { Plus, Trash2, Edit, Save, X, Tv, TrendingUp } from "lucide-react";

// export default function OTTIntelligenceAdmin() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingItem, setEditingItem] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     platformName: "",
//     averageDealValue: "",
//     marketShare: 50,
//     statusLabel: "Growing",
//     detailsLink: ""
//   });

//   const fetchData = async () => {
//     try {
//       const res = await fetch("/api/admin/ott-intelligence");
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
//     const url = editingItem ? `/api/admin/ott-intelligence?id=${editingItem._id}` : "/api/admin/ott-intelligence";

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
//         setFormData({ platformName: "", averageDealValue: "", marketShare: 50, statusLabel: "Growing", detailsLink: "" });
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
//       const res = await fetch(`/api/admin/ott-intelligence?id=${id}`, {
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
//         <title>OTT Intelligence Management | Admin</title>
//       </Head>
//       <div className="space-y-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold flex items-center gap-2">
//             <Tv className="text-red-600" /> OTT Intelligence
//           </h1>
//           <button
//             onClick={() => {
//               setEditingItem(null);
//               setFormData({ platformName: "", averageDealValue: "", marketShare: 50, statusLabel: "Growing", detailsLink: "" });
//               setIsModalOpen(true);
//             }}
//             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//           >
//             <Plus size={18} /> Add Platform
//           </button>
//         </div>

//         {loading ? (
//           <div className="text-center py-10">Loading...</div>
//         ) : (
//           <div className="grid gap-4">
//             {items.map((item) => (
//               <div key={item._id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
//                 <div className="flex-1 pr-6">
//                   <div className="flex justify-between items-center mb-2">
//                     <h3 className="font-bold text-lg">{item.platformName}</h3>
//                     <span className="text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded flex items-center gap-1">
//                       <TrendingUp size={12} /> {item.statusLabel}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-400 mb-2">
//                     Avg deal value: <span className="text-white">{item.averageDealValue}</span> per title
//                   </p>
//                   <div className="flex items-center gap-3">
//                     <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
//                       <div className="h-full bg-red-600" style={{ width: `${item.marketShare}%` }}></div>
//                     </div>
//                     <span className="text-sm font-bold">{item.marketShare}%</span>
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
//               <h2 className="text-xl font-bold mb-6">{editingItem ? "Edit Platform" : "Add New Platform"}</h2>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-400 mb-1">Platform Name</label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="Netflix"
//                     className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none"
//                     value={formData.platformName}
//                     onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-400 mb-1">Average Deal Value</label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="$15M–$50M"
//                     className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none"
//                     value={formData.averageDealValue}
//                     onChange={(e) => setFormData({ ...formData, averageDealValue: e.target.value })}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-400 mb-1">Market Share (%)</label>
//                     <input
//                       type="number"
//                       required
//                       min="0"
//                       max="100"
//                       className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none"
//                       value={formData.marketShare}
//                       onChange={(e) => setFormData({ ...formData, marketShare: Number(e.target.value) })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-400 mb-1">Status Label</label>
//                     <input
//                       type="text"
//                       required
//                       placeholder="Most Active"
//                       className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none"
//                       value={formData.statusLabel}
//                       onChange={(e) => setFormData({ ...formData, statusLabel: e.target.value })}
//                     />
//                   </div>
//                 </div>
//                 <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
//                   <Save size={18} /> {editingItem ? "Update Platform" : "Save Platform"}
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
import { Plus, Trash2, Edit, Save, X, Tv, TrendingUp } from "lucide-react";

export default function OTTIntelligenceAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    platformName: "",
    averageDealValue: "",
    marketShare: 50,
    statusLabel: "Growing",
    detailsLink: ""
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/ott-intelligence");
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
    const url = editingItem ? `/api/admin/ott-intelligence?id=${editingItem._id}` : "/api/admin/ott-intelligence";

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
        setFormData({ platformName: "", averageDealValue: "", marketShare: 50, statusLabel: "Growing", detailsLink: "" });
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
      const res = await fetch(`/api/admin/ott-intelligence?id=${id}`, {
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
        <title>OTT Intelligence Management | Admin</title>
      </Head>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tv className="text-red-600" /> OTT Intelligence
          </h1>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({ platformName: "", averageDealValue: "", marketShare: 50, statusLabel: "Growing", detailsLink: "" });
              setIsModalOpen(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Platform
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item._id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 pr-6 w-full">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                    <h3 className="font-bold text-lg">{item.platformName}</h3>
                    <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded flex items-center gap-1">
                      <TrendingUp size={12} /> {item.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    Avg deal value: <span className="text-white font-medium">{item.averageDealValue}</span> per title
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600" style={{ width: `${item.marketShare}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-white">{item.marketShare}%</span>
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
              <h2 className="text-xl font-bold mb-6">{editingItem ? "Edit Platform" : "Add New Platform"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Platform Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Netflix"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
                    value={formData.platformName}
                    onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Average Deal Value</label>
                  <input
                    type="text"
                    required
                    placeholder="$15M–$50M"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
                    value={formData.averageDealValue}
                    onChange={(e) => setFormData({ ...formData, averageDealValue: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Market Share (%)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
                      value={formData.marketShare}
                      onChange={(e) => setFormData({ ...formData, marketShare: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Status Label</label>
                    <input
                      type="text"
                      required
                      placeholder="Most Active"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-red-600 outline-none transition-colors"
                      value={formData.statusLabel}
                      onChange={(e) => setFormData({ ...formData, statusLabel: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                  <Save size={18} /> {editingItem ? "Update Platform" : "Save Platform"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}