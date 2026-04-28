"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Flame, Menu, X, Shield, LogIn } from "lucide-react";

const SiteHeader = () => {
  const [openMobile, setOpenMobile] = useState(false);
  const router = useRouter();

  const nav = [
    { name: "Explained", href: "/#explained" },
    { name: "Box Office", href: "/#box-office" },
    { name: "OTT Analysis", href: "/#ott-intelligence" },
    { name: "Celebrities", href: "/#celebrities" },
    { name: "Categories", href: "/#categories" },
  ];

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Handle scroll on initial load or route change if hash exists
    if (router.pathname === "/" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      // Give it a small timeout to ensure content is rendered
      const timer = setTimeout(() => handleScroll(id), 100);
      return () => clearTimeout(timer);
    }
  }, [router.asPath]);

  const scrollToSection = (e, href) => {
    if (href.startsWith("/#")) {
      const sectionId = href.split("#")[1];

      if (router.pathname !== "/") {
        // If not on home, let normal navigation happen
        setOpenMobile(false);
        return;
      }

      // If on home, handle smooth scroll
      e.preventDefault();
      setOpenMobile(false);
      handleScroll(sectionId);
      window.history.pushState(null, null, href);
    }
  };

  return (
     <>
       <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-800/50 bg-black/80 backdrop-blur">
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
                   key={item.name}
                   href={item.href}
                   onClick={(e) => scrollToSection(e, item.href)}
                   className="relative text-[15px] text-gray-400 hover:text-white transition-colors font-medium group"
                 >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300" />
                 </Link>
               ))}
             </nav>
 
             <div className="flex items-center gap-2">
              {/* Admin Login Button */}

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
         <div className="lg:hidden fixed inset-0 z-[9999]">
           <div
             className="absolute inset-0 bg-black/95 backdrop-blur-md"
             onClick={() => setOpenMobile(false)}
           />
           <div className="relative w-[85%] max-w-[320px] h-full bg-gray-950 shadow-2xl overflow-y-auto border-r border-gray-800">
             <div className="sticky top-0 z-10 flex h-16 items-center justify-between px-4 border-b border-gray-800 bg-gray-950">
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
           
             <nav className="px-4 py-2 space-y-2">
               {nav.map((item) => (
                 <Link
                   key={item.href}
                   href={item.href}
                   onClick={(e) => scrollToSection(e, item.href)}
                   className="block w-full text-left rounded-lg px-4 py-3 text-base font-medium text-gray-300 transition-all duration-200 hover:bg-gray-900 hover:text-white"
                 >
                   {item.name}
                 </Link>
               ))}
               
               {/* Mobile Admin Login Button */}
               <div className="pt-4 mt-4 border-t border-gray-800">
                 <Link
                   href="/admin/login"
                   onClick={() => setOpenMobile(false)}
                   className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-base font-semibold transition-all duration-300"
                 >
                   <Shield className="w-5 h-5" />
                   Admin Login
                 </Link>
               </div>
             </nav>
           </div>
         </div>
       )}
     </>
   );
};

export default SiteHeader

