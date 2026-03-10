 "use client";
 import Link from "next/link";
 import { Flame } from "lucide-react";
 
 export default function SiteFooter() {
 
   const about = [
     { name: "About FilmyFire", href: "/about" },
     { name: "Editorial Policy", href: "/editorial-policy" },
     { name: "Contact Us", href: "/contact" },
     { name: "Advertise", href: "/advertise" },
     { name: "Careers", href: "/careers" },
   ];
 
   const categories = [
     { name: "Bollywood", href: "/categories/bollywood" },
     { name: "Hollywood", href: "/categories/hollywood" },
     { name: "Web Series", href: "/categories/web-series" },
     { name: "OTT Platforms", href: "/categories/ott-platforms" },
     { name: "Box Office", href: "/box-office" },
     { name: "Celebrities", href: "/celebrities" },
   ];
 
   const legal = [
     { name: "Privacy Policy", href: "/privacy-policy" },
     { name: "Terms of Service", href: "/terms" },
     { name: "DMCA", href: "/dmca" },
     { name: "Disclaimer", href: "/disclaimer" },
     { name: "Cookie Policy", href: "/cookies" },
   ];
 
   return (
     <footer className="border-t border-gray-800 bg-black/30">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 xl:gap-16 py-12">
           <div>
             <div className="inline-flex items-center gap-2">
               <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 text-white">
                 <Flame className="h-5 w-5" />
               </span>
               <div className="leading-tight">
                 <span className="block font-semibold text-gray-100">FilmyFire</span>
                 <span className="block text-[10px] tracking-wider text-gray-400">
                   INTELLIGENCE PLATFORM
                 </span>
               </div>
             </div>
            <p className="mt-5 text-sm md:text-base text-gray-400">
               Movie & Web Series Intelligence Platform. Deep analysis beyond breaking news.
             </p>
             <div className="mt-4 flex flex-wrap gap-2">
               <span className="rounded-full bg-emerald-600/20 text-emerald-400 px-3 py-1 text-xs">
                 No Piracy
               </span>
               <span className="rounded-full bg-blue-600/20 text-blue-400 px-3 py-1 text-xs">
                 Verified
               </span>
               <span className="rounded-full bg-violet-600/20 text-violet-400 px-3 py-1 text-xs">
                 Evergreen
               </span>
             </div>
           </div>
 
          <div>
            <h4 className="font-semibold text-gray-100 text-base md:text-lg">About</h4>
            <ul className="mt-4 space-y-3 md:space-y-4 text-sm md:text-base text-gray-400">
               {about.map((a) => (
                 <li key={a.name}>
                   <Link href={a.href} className="hover:text-white">
                     {a.name}
                   </Link>
                 </li>
               ))}
             </ul>
           </div>
 
           <div>
            <h4 className="font-semibold text-gray-100 text-base md:text-lg">Categories</h4>
            <ul className="mt-4 space-y-3 md:space-y-4 text-sm md:text-base text-gray-400">
               {categories.map((c) => (
                 <li key={c.name}>
                   <Link href={c.href} className="hover:text-white">
                     {c.name}
                   </Link>
                 </li>
               ))}
             </ul>
           </div>
 
           <div>
            <h4 className="font-semibold text-gray-100 text-base md:text-lg">Legal & Policies</h4>
            <ul className="mt-4 space-y-3 md:space-y-4 text-sm md:text-base text-gray-400">
               {legal.map((l) => (
                 <li key={l.name}>
                   <Link href={l.href} className="hover:text-white">
                     {l.name}
                   </Link>
                 </li>
               ))}
             </ul>
           </div>
         </div>
 
        <div className="border-t border-gray-800 py-8 text-sm md:text-base text-gray-400 flex items-center justify-between">
           <span>© 2025 FilmyFire. Educational & entertainment purposes only.</span>
           <span className="flex items-center gap-3">
             <span className="inline-flex items-center gap-1">
               <span className="h-2 w-2 rounded-full bg-red-500" />
               No Piracy
             </span>
             <span className="inline-flex items-center gap-1">
               <span className="h-2 w-2 rounded-full bg-amber-500" />
               No Gossip
             </span>
             <span className="inline-flex items-center gap-1">
               <span className="h-2 w-2 rounded-full bg-blue-500" />
               Only Intelligence
             </span>
           </span>
         </div>
       </div>
     </footer>
   );
 }
