 "use client";
 import Head from "next/head";
 import AdminLayout from "@/components/AdminLayout";
 import { Star } from "lucide-react";
 
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
 
           <div className="rounded-2xl border border-gray-800 bg-black/30 p-6">
             <p className="text-sm text-gray-400">Celebrity module UI will be implemented later.</p>
           </div>
         </div>
       </AdminLayout>
     </>
   );
 }
