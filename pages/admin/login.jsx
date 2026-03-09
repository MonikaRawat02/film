"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { Lock, Mail, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import Head from "next/head";

export default function AdminLogin() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid login credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", data.token);

      router.push("/admin/dashboard");

    } catch (err) {

      setError("Something went wrong. Please try again.");

    } finally {

      setLoading(false);

    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | FilmFire Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">

        {/* Background Blur Effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative w-full max-w-md">

          {/* Logo / Header */}
          <div className="text-center mb-10">

            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              FilmFire Admin
            </h1>

            <p className="text-gray-400">
              Login to manage movies, celebrities & content
            </p>

          </div>


          {/* Login Card */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">

            <div className="p-8">

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email */}
                <div>

                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>

                  <div className="relative">

                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"/>

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none"
                      placeholder="admin@filmfire.com"
                    />

                  </div>

                </div>


                {/* Password */}
                <div>

                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>

                  <div className="relative">

                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"/>

                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e)=>setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none"
                      placeholder="Enter password"
                    />

                    <button
                      type="button"
                      onClick={()=>setShowPassword(!showPassword)}
                      className="absolute right-3 top-3"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400"/>
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400"/>
                      )}
                    </button>

                  </div>

                </div>


                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}


                {/* Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
                >

                  {loading ? "Signing In..." : "Login"}

                  {!loading && (
                    <ArrowRight className="ml-2 h-4 w-4"/>
                  )}

                </button>

              </form>

            </div>


            {/* Footer */}
            <div className="bg-black border-t border-gray-700 py-4 text-center text-xs text-gray-500">
              FilmFire CMS Dashboard
            </div>

          </div>


          <p className="text-center text-gray-500 text-sm mt-6">
            © {new Date().getFullYear()} FilmFire
          </p>

        </div>

      </div>
    </>
  );
}