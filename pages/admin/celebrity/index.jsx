 "use client";
 import Head from "next/head";
 import AdminLayout from "@/components/AdminLayout";
 import { Star, PencilLine } from "lucide-react";
 
 export default function CelebrityModule() {
   return (
     <>
       <Head>
         <title>Celebrity | FilmFire Admin</title>
       </Head>
       <AdminLayout>
         <div className="space-y-6">
           <div className="flex items-start justify-between">
             <div>
               <h1 className="text-2xl font-semibold">Celebrity</h1>
               <p className="text-sm text-gray-400">Create and update celebrity profiles</p>
             </div>
             <Star className="h-6 w-6 text-red-500" />
           </div>
 
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="rounded-2xl border border-gray-800 bg-black/30 p-6">
               <div className="flex items-center gap-2">
                 <PencilLine className="h-5 w-5 text-red-500" />
                 <h2 className="text-lg font-semibold">Create Celebrity</h2>
               </div>
               <div className="mt-4 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <input className="w-full rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-sm" placeholder="Name" />
                   <input className="w-full rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-sm" placeholder="Slug" />
                 </div>
                 <textarea className="w-full rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-sm h-24" placeholder="Short bio" />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <input className="w-full rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-sm" placeholder="Profession" />
                   <input className="w-full rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-sm" placeholder="Country" />
                   <input className="w-full rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-sm" placeholder="Net worth" />
                 </div>
                 <button disabled className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-gray-300">
                   <PencilLine className="h-4 w-4" />
                   <span>Save (UI only)</span>
                 </button>
               </div>
             </div>
 
             <div className="rounded-2xl border border-gray-800 bg-black/30 p-6">
               <div className="flex items-center gap-2">
                 <PencilLine className="h-5 w-5 text-red-500" />
                 <h2 className="text-lg font-semibold">Update Celebrity</h2>
               </div>
               <div className="mt-4 space-y-4">
                 <input className="w-full rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-sm" placeholder="Search by name" />
                 <div className="h-32 rounded-lg bg-gray-900 border border-gray-800 grid place-items-center text-sm text-gray-500">
                   No data loaded. UI only.
                 </div>
               </div>
             </div>
           </div>
         </div>
       </AdminLayout>
     </>
   );
 }
