"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CircleArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterCard() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan registrasi");
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('../../assets/Tb.jpg')" }}
    >
      <div className="absolute inset-0 bg-white backdrop-blur-sm"></div>

      <div className="relative bg-white/90 shadow-2xl rounded-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden z-10 backdrop-blur-md">

        <div className="w-full md:w-1/2 p-10">
          <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
            Daftar Akun
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-indigo-800 font-semibold mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-2 border border-indigo-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-indigo-800 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email"
                className="w-full px-4 py-2 border border-indigo-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-indigo-800 font-semibold mb-2">
                Nomor Telepon
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Masukkan nomor telepon"
                className="w-full px-4 py-2 border border-indigo-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
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
                value={formData.password}
                onChange={handleChange}
                placeholder="Buat kata sandi"
                className="w-full px-4 py-2 border border-indigo-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold shadow-md disabled:opacity-50"
            >
              {loading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>

            <p className="text-center text-sm text-gray-700 mt-3">
              Sudah punya akun?{" "}
              <a href="/login" className="text-indigo-600 font-medium hover:underline">
                Masuk di sini
              </a>
            </p>
          </form>
        </div>

        <div
          className="hidden md:block md:w-1/2 relative bg-cover bg-center"
          style={{ backgroundImage: "" }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <Link
            href="/"
            className="absolute top-4 left-4 z-[999] bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-white transition">
            <CircleArrowLeft className="text-indigo-600" size={26} />
          </Link>

          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <h2 className="text-white text-3xl font-semibold drop-shadow-xl">
              Buat Akun Baru & Buat Laporan Anda
            </h2>
          </div>
        </div>

      </div>
    </div>
  );
}