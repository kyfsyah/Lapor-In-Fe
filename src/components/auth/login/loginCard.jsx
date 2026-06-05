"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CircleArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || result.message || 'Gagal login, periksa kembali email dan password Anda.');
      }

      if (result.success) {
        setSuccess(true);
        // Cookie sudah otomatis di-set oleh backend (httpOnly cookie)
        // Ambil data user untuk cek role, lalu redirect sesuai role
        try {
          const meRes = await fetch('/api/auth/me', { credentials: 'include' });
          const meData = await meRes.json();
          const userObj = meData?.user || meData?.data;
          const role = userObj?.role;
          console.log("meData user:", userObj);
          
          if (meData?.success && userObj) {
            sessionStorage.setItem('user_session', JSON.stringify(userObj));
          }

          setTimeout(() => {
            if (role === 'admin') {
              router.push('/dashboard/admin');
            } else if (role === 'petugas') {
              router.push('/dashboard/petugas');
            } else {
              router.push('/users');
            }
          }, 1000);
        } catch {
          // Fallback ke /users jika gagal fetch role
          setTimeout(() => {
            router.push('/users');
          }, 1000);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
<div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "" }}
    >
      <div className="absolute inset-0 bg-gray/40 "></div>
      <div className="relative bg-white/90 shadow-2xl rounded-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden z-10">
        <div className="w-full md:w-1/2 p-10">
          <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
            Masuk ke Akun
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-indigo-800 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Masukkan email"
                className="w-full px-4 py-2 border border-indigo-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-400 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-indigo-800 font-semibold mb-2">
                Kata Sandi
              </label>
              <input
                type="password"
                name="password"
                placeholder="Masukkan kata sandi"
                className="w-full px-4 py-2 border border-indigo-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-400 shadow-sm"
                required
              />
            </div>

            <div className="flex justify-end -mt-3">
              <a href="/forgot-password" className="text-indigo-600 text-sm font-medium hover:underline">
                Lupa password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-indigo-600 text-white py-2 -mt-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold shadow-md disabled:opacity-50"
            >
              {loading ? "Masuk..." : success ? "Masuk Berhasil" : "Masuk Sekarang"}
            </button>

            <p className="text-center text-sm text-gray-700 mt-3">
              Belum punya akun?{" "}
              <a href="/register" className="text-indigo-600 font-medium hover:underline">
                Daftar di sini
              </a>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="hidden md:block md:w-1/2 relative bg-cover bg-center"
          style={{ backgroundImage: "url('../../assets/LibraryBG.jpg')" }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

          <Link
            href="/"
            className="absolute top-4 left-4 z-[999] bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-white transition">
            <CircleArrowLeft className="text-indigo-600" size={26} />
          </Link>

          <div className="absolute inset-0 flex items-center justify-center text-center px-8">
            <h2 className="text-white text-3xl font-semibold drop-shadow-xl">
              Selamat Datang di Lapor-in
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}