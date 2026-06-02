"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle, ArrowRight } from "lucide-react";

const FALLBACK_REPORTS = [
  {
    id: "1",
    judul: "Perbaikan Jalan Berlubang di Gang Manggis",
    deskripsi:
      "Jalan berlubang yang sempat membahayakan warga kini telah selesai dicor ulang oleh pengurus RT. Terima kasih atas laporan warga.",
    mediaUrls: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
    ],
    createdAt: new Date().toISOString(),
    kategori_laporan: { namaKategori: "Infrastruktur" },
    status: "selesai",
  },
  {
    id: "2",
    judul: "Lampu Penerangan Jalan Padam",
    deskripsi:
      "Lampu jalan di pertigaan RT 03 sudah diperbaiki dan menyala terang kembali. Keamanan warga kini kembali terjaga saat malam hari.",
    mediaUrls: [
      "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&q=80&w=800",
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    kategori_laporan: { namaKategori: "Fasilitas Umum" },
    status: "selesai",
  },
  {
    id: "3",
    judul: "Pembersihan Tumpukan Sampah",
    deskripsi:
      "Kerja bakti warga telah mengangkut tumpukan sampah liar di area selokan dan memasang papan larangan membuang sampah.",
    mediaUrls: [
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800",
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    kategori_laporan: { namaKategori: "Lingkungan" },
    status: "selesai",
  },
];

export default function NewsSection() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(
          "http://localhost:3000/api/reports?status=selesai&limit=3",
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        if (isMounted) {
          if (data.success && data.data?.length > 0) {
            setReports(data.data.slice(0, 3));
          } else {
            throw new Error("No data");
          }
        }
      } catch {
        if (isMounted) setReports(FALLBACK_REPORTS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReports();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section id="berita" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-3">
              Kabar Terbaru
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white max-w-2xl leading-tight">
              Aspirasi Warga yang Telah{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                Diselesaikan
              </span>
            </h3>
          </div>
          <a
            href="/register"
            className="group flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            Lihat Semua Berita{" "}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reports.map((report) => (
            <div
              key={report.id}
              className="group flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-none hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img
                  src={report.mediaUrls?.[0] ?? "https://via.placeholder.com/800x600?text=No+Image"}
                  alt={report.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-xs font-bold text-zinc-900 dark:text-white rounded-full shadow-sm">
                    {report.kategori_laporan?.namaKategori ?? "Umum"}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(report.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-full">
                    <CheckCircle size={12} />
                    Disetujui Admin
                  </div>
                </div>

                <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {report.judul}
                </h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 flex-grow">
                  {report.deskripsi || "Masalah telah berhasil diselesaikan oleh pihak berwenang. Terima kasih atas partisipasi Anda."}
                </p>

                <button className="mt-auto w-full py-2.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-xl transition-colors border border-zinc-100 dark:border-zinc-800">
                  Baca Selengkapnya
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}