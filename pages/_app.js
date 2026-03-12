 import "@/styles/globals.css";
 import { Inter } from "next/font/google";
 import { useRouter } from "next/router";
 import PublicLayout from "@/components/PublicLayout";
 
 const inter = Inter({ subsets: ["latin"] });
 
 export default function App({ Component, pageProps }) {
   const router = useRouter();
   const isAdmin = router.pathname.startsWith("/admin");
 
   const content = <Component {...pageProps} />;
 
   return (
     <div className={`${inter.className} font-sans`}>
       {isAdmin ? content : <PublicLayout>{content}</PublicLayout>}
     </div>
   );
 }
