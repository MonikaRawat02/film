 import "@/styles/globals.css";
 import { useRouter } from "next/router";
 import PublicLayout from "@/components/PublicLayout";
 import dynamic from 'next/dynamic';
 import 'react-toastify/dist/ReactToastify.css';

 const ToastContainer = dynamic(() => import('react-toastify').then(mod => mod.ToastContainer), { ssr: false });
 
 export default function App({ Component, pageProps }) {
   const router = useRouter();
   const isAdmin = router.pathname.startsWith("/admin");
 
   const content = <Component {...pageProps} />;
 
   return (
     <div className="font-sans">
       {isAdmin ? content : <PublicLayout noPadding={Component.noPadding}>{content}</PublicLayout>}
       <ToastContainer
         position="bottom-right"
         autoClose={5000}
         hideProgressBar={false}
         newestOnTop={false}
         closeOnClick
         rtl={false}
         pauseOnFocusLoss
         draggable
         pauseOnHover
         theme="dark"
       />
     </div>
   );
 }
