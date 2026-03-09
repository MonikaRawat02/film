 "use client";
 import Head from "next/head";
 import Link from "next/link";
 import AdminLayout from "@/components/AdminLayout";
 import { Star, Plus, ArrowRight, Gauge } from "lucide-react";
 
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
               <Link
                 href="/admin/celebrity"
                 className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
               >
                 <Star className="h-5 w-5" />
                 <span>Go to Celebrity</span>
                 <ArrowRight className="h-4 w-4" />
               </Link>
             </div>
           </section>
 
           <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
             <div className="rounded-2xl border border-gray-800 bg-black/30 p-5">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-400">Celebrities</span>
                 <Star className="h-4 w-4 text-gray-400" />
               </div>
               <div className="mt-3 h-8 rounded bg-gray-900 animate-pulse" />
             </div>
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
             <div className="lg:col-span-2 rounded-2xl border border-gray-800 bg-black/30 p-6">
               <div className="flex items-center justify-between">
                 <h2 className="text-lg font-semibold">Quick Actions</h2>
               </div>
               <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <Link
                   href="/admin/celebrity"
                   className="inline-flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-gray-200 hover:bg-gray-800"
                 >
                   <div className="flex items-center gap-2">
                     <Plus className="h-5 w-5 text-red-500" />
                     <span>Create Celebrity</span>
                   </div>
                   <ArrowRight className="h-4 w-4 text-gray-400" />
                 </Link>
               </div>
             </div>
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
