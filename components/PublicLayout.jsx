"use client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function PublicLayout({ children, noPadding = false }) {
  return (
    <div className="min-h-screen bg-black text-gray-100 overflow-x-hidden">
      <SiteHeader />
      <main className={noPadding ? "" : "pt-14 md:pt-16"}>{children}</main>
      <SiteFooter />
    </div>
  );
}
