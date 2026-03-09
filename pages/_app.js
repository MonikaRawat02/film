 import "@/styles/globals.css";
 import { useRouter } from "next/router";
 import PublicLayout from "@/components/PublicLayout";
 
 export default function App({ Component, pageProps }) {
   const router = useRouter();
   const isAdmin = router.pathname.startsWith("/admin");
 
   const content = <Component {...pageProps} />;
 
   return (
     <div className="font-sans">
       {isAdmin ? content : <PublicLayout>{content}</PublicLayout>}
     </div>
   );
 }
