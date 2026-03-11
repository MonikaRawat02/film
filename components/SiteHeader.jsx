 "use client";
 import { useState } from "react";
 import Link from "next/link";
 import { Flame, Menu, Search, X } from "lucide-react";
 
 export default function SiteHeader() {
   const [openMobile, setOpenMobile] = useState(false);
   const [openSearch, setOpenSearch] = useState(false);
   const [query, setQuery] = useState("");
 
   const nav = [
    { name: "Explained", href: "/explained" },
    { name: "Box Office", href: "/#box-office" },
    { name: "OTT Analysis", href: "/#ott-intelligence" },
    { name: "Celebrities", href: "/#celebrities" },
    { name: "Categories", href: "/#categories" },
  ];
 
   return (
     <>
       <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-800 bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
           <div className="flex h-16 items-center justify-between">
             <div className="flex items-center gap-3">
               <button
                 aria-label="Open menu"
                 className="inline-flex md:hidden items-center justify-center rounded-lg p-2.5 hover:bg-gray-900"
                 onClick={() => setOpenMobile(true)}
               >
                 <Menu className="h-5 w-5 text-gray-300" />
               </button>
               <Link href="/" className="group inline-flex items-center gap-2">
                 <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 text-white shadow-sm transition group-hover:bg-red-500">
                   <Flame className="h-5 w-5" />
                 </span>
                <div className="leading-tight">
                  <span className="block text-base md:text-lg font-semibold text-gray-100">FilmyFire</span>
                   <span className="block text-[10px] tracking-wider text-gray-400">
                     INTELLIGENCE PLATFORM
                   </span>
                 </div>
               </Link>
             </div>
 
            <nav className="hidden md:flex items-center gap-8">
               {nav.map((item) => (
                 <Link
                   key={item.href}
                   href={item.href}
                  className="text-sm md:text-base text-gray-300 transition hover:text-red-500"
                 >
                   {item.name}
                 </Link>
               ))}
             </nav>
 
             <div className="flex items-center gap-2">
               <button
                 aria-label="Search"
                 className="inline-flex items-center justify-center rounded-lg p-2.5 hover:bg-gray-900"
                 onClick={() => setOpenSearch((v) => !v)}
               >
                 <Search className="h-5 w-5 text-gray-300" />
               </button>
             </div>
           </div>
         </div>
 
         {openSearch && (
           <div className="border-t border-gray-800 bg-black/30">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10 py-3">
               <div className="relative">
                 <input
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   placeholder="Search movies, box office, celebrities…"
                  className="w-full rounded-xl bg-black/40 border border-gray-800 px-4 py-3 text-base text-gray-200 placeholder-gray-400 outline-none transition focus:border-red-600"
                 />
               </div>
             </div>
           </div>
         )}
       </header>
 
       {openMobile && (
         <div className="md:hidden fixed inset-0 z-50">
           <div
             className="absolute inset-0 bg-black/60"
             onClick={() => setOpenMobile(false)}
           />
           <div className="absolute left-0 top-0 bottom-0 w-80 bg-gray-950 border-r border-gray-800">
             <div className="flex h-16 items-center justify-between px-4">
               <div className="inline-flex items-center gap-2">
                 <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 text-white">
                   <Flame className="h-5 w-5" />
                 </span>
                 <span className="font-semibold">FilmyFire</span>
               </div>
               <button
                 aria-label="Close menu"
                 className="rounded-lg p-2.5 hover:bg-gray-900"
                 onClick={() => setOpenMobile(false)}
               >
                 <X className="h-5 w-5 text-gray-300" />
               </button>
             </div>
 
             <div className="px-4 py-3 border-t border-gray-800">
               <div className="relative">
                 <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                 <input
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   placeholder="Search…"
                   className="w-full rounded-lg bg-black/40 border border-gray-800 pl-9 pr-3 py-2.5 text-sm text-gray-200 placeholder-gray-400 outline-none transition focus:border-red-600"
                 />
               </div>
             </div>
 
             <nav className="px-2 py-2 space-y-1">
               {nav.map((item) => (
                 <Link
                   key={item.href}
                   href={item.href}
                   className="block rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-gray-900 hover:text-white"
                   onClick={() => setOpenMobile(false)}
                 >
                   {item.name}
                 </Link>
               ))}
             </nav>
           </div>
         </div>
       )}
     </>
   );
 }
