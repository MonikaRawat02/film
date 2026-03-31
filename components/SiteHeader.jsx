 "use client";
 import { useState } from "react";
 import Link from "next/link";
 import { Flame, Menu, X } from "lucide-react";
 
 export default function SiteHeader() {
   const [openMobile, setOpenMobile] = useState(false);
 
   const nav = [
    { name: "Explained", href: "/#hero" },
    { name: "Box Office", href: "/#ott-intelligence" },
    { name: "OTT Analysis", href: "/#ott-intelligence" },
    { name: "Celebrities", href: "/#celebrities" },
    { name: "Categories", href: "/#categories" },
  ];
 
   return (
     <>
       <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
           <div className="flex h-16 items-center justify-between">
             <div className="flex items-center gap-3">

               <Link href="/" className="group inline-flex items-center gap-3">
                 <div className="relative">
                   <Flame className="h-8 w-8 text-red-600" strokeWidth={2.5} />
                   <div className="absolute inset-0 -z-10 bg-red-600/30 blur-lg" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-2xl font-bold tracking-tight text-white">FilmyFire</span>
                   <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500 -mt-1">
                     Intelligence Platform
                   </div>
                 </div>
               </Link>
             </div>
 
            <nav className="hidden lg:flex items-center gap-10">
               {nav.map((item) => (
                 <Link
                   key={item.href}
                   href={item.href}
                  className="relative text-[15px] text-gray-400 hover:text-white transition-colors font-medium group"
                 >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300" />
                 </Link>
               ))}
             </nav>
 
             <div className="flex items-center gap-2">
              <button
                aria-label="Open menu"
                className="inline-flex lg:hidden items-center justify-center rounded-lg p-2.5 hover:bg-gray-900"
                onClick={() => setOpenMobile(true)}
              >
                <Menu className="h-5 w-5 text-gray-300" />
              </button>
             </div>
           </div>
         </div>
 

       </header>
 
       {openMobile && (
         <div className="lg:hidden fixed inset-0 z-50">
           <div
             className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             onClick={() => setOpenMobile(false)}
           />
           <div className="absolute left-0 top-0 bottom-0 w-80 bg-gray-950 border-r border-gray-800 shadow-2xl">
             <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
              <Link href="/" className="group inline-flex items-center gap-3">
                 <div className="relative">
                   <Flame className="h-8 w-8 text-red-600" strokeWidth={2.5} />
                   <div className="absolute inset-0 -z-10 bg-red-600/30 blur-lg" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-2xl font-bold tracking-tight text-white">FilmyFire</span>
                   <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500 -mt-1">
                     Intelligence Platform
                   </div>
                 </div>
               </Link>
               <button
                 aria-label="Close menu"
                 className="rounded-lg p-2.5 hover:bg-gray-900"
                 onClick={() => setOpenMobile(false)}
               >
                 <X className="h-5 w-5 text-gray-300" />
               </button>
             </div>
           
             <nav className="px-2 py-4 space-y-1">
               {nav.map((item) => (
                 <Link
                   key={item.href}
                   href={item.href}
                   className="block rounded-lg px-3 py-2 text-base text-gray-300 transition hover:bg-gray-900 hover:text-white"
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
