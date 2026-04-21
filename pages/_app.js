//  import "@/styles/globals.css";
//  import { useRouter } from "next/router";
//  import { useState, useEffect } from "react";
//  import PublicLayout from "@/components/PublicLayout";
//  import dynamic from 'next/dynamic';
//  import 'react-toastify/dist/ReactToastify.css';

//  const ToastContainer = dynamic(() => import('react-toastify').then(mod => mod.ToastContainer), { ssr: false });
 
//  export default function App({ Component, pageProps }) {
//    const router = useRouter();
//    const [loading, setLoading] = useState(false);
//    const isAdmin = router.pathname.startsWith("/admin");

//    // Handle route change events
//    useEffect(() => {
//      const handleStart = (url) => {
//        setLoading(true);
//      };
     
//      const handleComplete = (url) => {
//        setLoading(false);
//      };
     
//      const handleError = (url) => {
//        setLoading(false);
//      };

//      router.events.on('routeChangeStart', handleStart);
//      router.events.on('routeChangeComplete', handleComplete);
//      router.events.on('routeChangeError', handleError);

//      return () => {
//        router.events.off('routeChangeStart', handleStart);
//        router.events.off('routeChangeComplete', handleComplete);
//        router.events.off('routeChangeError', handleError);
//      };
//    }, [router.events]);
 
//    const content = <Component {...pageProps} />;
 
//    return (
//      <div className="font-sans">
//        {/* Page Loading Overlay */}
//        {loading && (
//          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
//            <div className="flex flex-col items-center gap-4">
//              <div className="relative h-16 w-16">
//                <div className="absolute inset-0 rounded-full border-4 border-[#07689F]/20"></div>
//                <div className="absolute inset-0 rounded-full border-4 border-[#07689F] border-t-transparent animate-spin"></div>
//              </div>
//              <p className="text-sm font-medium text-[#1B2D4F] animate-pulse">Loading...</p>
//            </div>
//          </div>
//        )}
       
//        {isAdmin ? content : <PublicLayout noPadding={Component.noPadding}>{content}</PublicLayout>}
//        <ToastContainer
//          position="top-right"
//          autoClose={5000}
//          hideProgressBar={false}
//          newestOnTop={false}
//          closeOnClick
//          rtl={false}
//          pauseOnFocusLoss
//          draggable
//          pauseOnHover
//          theme="dark"
//        />
//      </div>
//    );
//  }


import "@/styles/globals.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import PublicLayout from "@/components/PublicLayout";
import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";

const ToastContainer = dynamic(
  () =>
    import("react-toastify").then(
      (mod) => mod.ToastContainer
    ),
  { ssr: false }
);

export default function App({
  Component,
  pageProps,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const isAdmin =
    router.pathname.startsWith("/admin");

  useEffect(() => {
    let timer;

    const handleStart = () => {
      timer = setTimeout(() => {
        setLoading(true);
      }, 120);
    };

    const handleComplete = () => {
      clearTimeout(timer);
      setLoading(false);
    };

    const handleError = () => {
      clearTimeout(timer);
      setLoading(false);
    };

    router.events.on(
      "routeChangeStart",
      handleStart
    );

    router.events.on(
      "routeChangeComplete",
      handleComplete
    );

    router.events.on(
      "routeChangeError",
      handleError
    );

    return () => {
      clearTimeout(timer);

      router.events.off(
        "routeChangeStart",
        handleStart
      );

      router.events.off(
        "routeChangeComplete",
        handleComplete
      );

      router.events.off(
        "routeChangeError",
        handleError
      );
    };
  }, [router.events]);

  const content = (
    <Component {...pageProps} />
  );

  return (
    <div className="font-sans">
      {/* PERFECT CENTER LOADER */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-screen z-[9999] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center -mt-8">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-4 border-[#07689F]/20"></div>

              <div className="absolute inset-0 rounded-full border-4 border-[#07689F] border-t-transparent animate-spin"></div>
            </div>

            <p className="mt-3 text-sm font-medium text-[#07689F]">
              Loading...
            </p>
          </div>
        </div>
      )}

      {isAdmin ? (
        content
      ) : (
        <PublicLayout
          noPadding={Component.noPadding}
        >
          {content}
        </PublicLayout>
      )}

      <ToastContainer
        position="top-right"
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