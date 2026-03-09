 "use client";
 import Head from "next/head";
 import AdminLayout from "@/components/AdminLayout";
 import { Gauge } from "lucide-react";
 
 export default function Dashboard() {
   return (
     <>
       <Head>
         <title>Admin Dashboard | FilmFire</title>
       </Head>
       <AdminLayout>
         <div className="space-y-6">
           <section className="rounded-2xl border border-gray-800 bg-black/30 p-6">
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
               <div>
                 <h1 className="text-xl md:text-2xl font-semibold">Welcome</h1>
                 <p className="text-sm text-gray-400">Manage content and modules from one place</p>
               </div>
 
             </div>
           </section>
 
           <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
 
             <div className="rounded-2xl border border-gray-800 bg-black/30 p-5">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-400">Movies</span>
                 <Gauge className="h-4 w-4 text-gray-400" />
               </div>
               <div className="mt-3 h-8 rounded bg-gray-900 animate-pulse" />
             </div>
             <div className="rounded-2xl border border-gray-800 bg-black/30 p-5">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-400">Articles</span>
                 <Gauge className="h-4 w-4 text-gray-400" />
               </div>
               <div className="mt-3 h-8 rounded bg-gray-900 animate-pulse" />
             </div>
             <div className="rounded-2xl border border-gray-800 bg-black/30 p-5">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-400">Traffic</span>
                 <Gauge className="h-4 w-4 text-gray-400" />
               </div>
               <div className="mt-3 h-8 rounded bg-gray-900 animate-pulse" />
             </div>
           </section>
 
           <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 
             <div className="rounded-2xl border border-gray-800 bg-black/30 p-6">
               <h2 className="text-lg font-semibold">Notes</h2>
               <p className="mt-2 text-sm text-gray-400">Everything here is UI only.</p>
             </div>
           </section>
         </div>
       </AdminLayout>
     </>
   );
 }
