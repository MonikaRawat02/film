 "use client";
 import SiteHeader from "@/components/SiteHeader";
 import SiteFooter from "@/components/SiteFooter";
 
 export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <SiteHeader />
      <main className="pt-24">{children}</main>
      <SiteFooter />
    </div>
  );
 }
