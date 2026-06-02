"use client";

import { MapPin, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center pt-16 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/30"
    >
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-20">

          {/* Left: Description */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 rounded-full px-3.5 py-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
                Platform Pengaduan Lingkungan Warga
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-white">
              Sampaikan Keluhan Anda di{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                LaporIn
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-md">
              Sampaikan keluhan dan laporan terkait fasilitas lingkungan dengan mudah, cepat, dan transparan. Bersama kita bangun lingkungan yang lebih baik.
            </p>

            {/* Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="/login"
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 px-12 text-sm font-semibold text-white transition-colors shadow-lg shadow-indigo-200 dark:shadow-none leading-relaxed"
              >
                Buat Laporan
              </a>
            </div>
          </div>

          {/* Right: Lottie */}
          <div className="flex flex-col items-center justify-center relative">
            {/* Glow blob */}
            <div className="absolute w-72 h-72 rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-3xl pointer-events-none" />

            {/* Floating card — top */}
            <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-indigo-100 dark:border-zinc-700 rounded-2xl px-4 py-2.5 shadow-lg text-sm animate-bounce">
              <div className="flex flex-row items-center gap-1 text-zinc-400 text-xs">
                <MapPin size={12} className="text-indigo-500" /> Lokasi Anda
              </div>
              <p className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">Poskamling RT 01</p>
            </div>

            {/* Lottie player */}
            <div
              className="relative z-0 w-full max-w-sm flex justify-center"
              dangerouslySetInnerHTML={{
                __html: `<lottie-player autoplay loop mode="normal" src="/lottie/reporting.json" style="width: 100%; height: 360px; max-width: 360px;"></lottie-player>`,
              }}
            />

            {/* Floating card — bottom */}
            <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-indigo-100 dark:border-zinc-700 rounded-2xl px-4 py-2.5 shadow-lg text-sm">
              <div className="flex flex-row items-center gap-2 text-zinc-400 text-xs">
                <CheckCircle size={12} className="text-emerald-500" /> Status
              </div>
              <p className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">Laporan Selesai</p>
              <p className="text-xs mt-0.5 text-zinc-500">10 menit yang lalu</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}