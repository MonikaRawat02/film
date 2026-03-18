 "use client";
 import { useEffect, useState } from "react";
 import { useRouter } from "next/router";
 import Link from "next/link";
 import { Menu, LogOut, LayoutDashboard, Star, BarChart, Tv, FileText, Lightbulb } from "lucide-react";
 
 export default function AdminLayout({ children }) {
   const router = useRouter();
   const [openMobile, setOpenMobile] = useState(false);
 
   useEffect(() => {
     const t = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
     if (!t) {
       router.replace("/admin/login");
     }
   }, [router]);
 
   const nav = [
     { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
     { name: "Celebrity", href: "/admin/celebrity", icon: Star },
     { name: "Trending Intelligence", href: "/admin/trending-intelligence", icon: BarChart },
     { name: "Box Office", href: "/admin/box-office", icon: BarChart },
     { name: "OTT Analysis", href: "/admin/ott-intelligence", icon: Tv },
     { name: "Articles", href: "/admin/articles", icon: FileText },
     { name: "Popular Topics", href: "/admin/popular-topics", icon: Lightbulb },
   ];
 
   const isActive = (href) => router.pathname === href;
 
   const handleLogout = () => {
     localStorage.removeItem("adminToken");
     router.replace("/admin/login");
   };
 
 
 
   return (
     <div className="min-h-screen bg-gray-950 text-gray-100 flex">
       <aside className="hidden lg:flex lg:w-64 bg-black/40 border-r border-gray-800 flex-col">
         <div className="h-16 flex items-center px-6 font-semibold">
           <div className="h-9 w-9 rounded-xl bg-red-600 grid place-items-center text-white">F</div>
           <span className="ml-3">FilmFire Admin</span>
         </div>
         <nav className="flex-1 px-3 py-2 space-y-1">
           {nav.map((item) => {
             const Icon = item.icon;
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 className={
                   "flex items-center gap-3 px-3 py-2 rounded-lg transition " +
                   (isActive(item.href)
                     ? "bg-red-600 text-white"
                     : "hover:bg-gray-900 text-gray-300")
                 }
               >
                 <Icon className="h-5 w-5" />
                 <span className="text-sm">{item.name}</span>
               </Link>
             );
           })}
         </nav>
         <div className="border-t border-gray-800 p-3">
           <button
             onClick={handleLogout}
             className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-200"
           >
             <LogOut className="h-5 w-5" />
             <span className="text-sm">Logout</span>
           </button>
         </div>
       </aside>
 
       <div className="flex-1 flex flex-col h-screen overflow-hidden">
         <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-800 bg-black/30 flex-shrink-0">
           <div className="flex items-center gap-3">
             <button
               aria-label="Open menu"
               className="lg:hidden inline-flex items-center justify-center rounded-lg p-2.5 hover:bg-gray-900"
               onClick={() => setOpenMobile(true)}
             >
               <Menu className="h-5 w-5" />
             </button>
             <span className="font-semibold">Dashboard</span>
           </div>
         </header>
 
         <main className="flex-1 overflow-y-auto custom-scrollbar">{children}</main>
       </div>
 
       {openMobile && (
         <div className="lg:hidden fixed inset-0 z-50">
           <div
             className="absolute inset-0 bg-black/50"
             onClick={() => setOpenMobile(false)}
           />
           <div className="absolute left-0 top-0 bottom-0 w-72 bg-gray-950 border-r border-gray-800 flex flex-col">
             <div className="h-16 flex items-center px-4 font-semibold">
               <div className="h-9 w-9 rounded-xl bg-red-600 grid place-items-center text-white">F</div>
               <span className="ml-3">FilmFire Admin</span>
             </div>
             <nav className="flex-1 px-3 py-2 space-y-1">
               {nav.map((item) => {
                 const Icon = item.icon;
                 return (
                   <Link
                     key={item.href}
                     href={item.href}
                     className={
                       "flex items-center gap-3 px-3 py-2 rounded-lg transition " +
                       (isActive(item.href)
                         ? "bg-red-600 text-white"
                         : "hover:bg-gray-900 text-gray-300")
                     }
                     onClick={() => setOpenMobile(false)}
                   >
                     <Icon className="h-5 w-5" />
                     <span className="text-sm">{item.name}</span>
                   </Link>
                 );
               })}
             </nav>
             <div className="border-t border-gray-800 p-3">
               <button
                 onClick={() => {
                   setOpenMobile(false);
                   handleLogout();
                 }}
                 className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-200"
               >
                 <LogOut className="h-5 w-5" />
                 <span className="text-sm">Logout</span>
               </button>
             </div>
           </div>
         </div>
       )}
       <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar {
           width: 6px;
         }
         .custom-scrollbar::-webkit-scrollbar-track {
           background: transparent;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb {
           background: #333;
           border-radius: 10px;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
           background: #444;
         }
       `}</style>
     </div>
   );
 }
