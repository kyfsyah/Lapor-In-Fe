"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Tag, MessageCircle, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

export default function RecentReportsSection() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState("semua"); // State filter status
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(""); // State filter kategori

  useEffect(() => {
    const fetchLatestReports = async () => {
      setLoading(true);
      try {
        let url = `/api/reports/news?limit=6&sort=desc&page=${page}`;
        if (statusFilter !== "semua") {
          url += `&status=${statusFilter}`;
        }
        if (categoryFilter) {
          url += `&kategoriId=${categoryFilter}`;
        }

        const res = await fetch(url, {
          credentials: 'include' // Kirim cookie token agar tidak diblokir backend
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setReports(result.data);
            setMeta(result.meta);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil laporan terbaru:", error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchLatestReports();
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/category', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (status) => {
    if (statusFilter !== status) {
      setStatusFilter(status);
      setPage(1); // Reset ke halaman pertama saat ganti filter
    }
  };

  const filterOptions = [
    { value: 'semua', label: 'Semua' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'selesai', label: 'Selesai' }
  ];

  if (initialLoad) {
    return (
      <div className="py-16 bg-[#FAFAFA] border-t border-gray-100 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (reports.length === 0 && page === 1 && statusFilter === "semua" && categoryFilter === "" && !loading && !initialLoad) {
    // Sembunyikan section HANYA JIKA website benar-benar belum punya laporan sama sekali
    // dan tidak ada filter aktif
    return null;
  }

  return (
    <div id ="berita" className="py-16 bg-[#FAFAFA] border-t border-gray-100 relative">
      {/* Loading Overlay saat pindah halaman */}
      {loading && !initialLoad && (
        <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#111827] flex items-center gap-2">
              Update <span className="text-blue-600">Terbaru</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              Laporan masyarakat yang sedang ditindaklanjuti.
            </p>

            {/* Filter Status (Pills) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFilterChange(opt.value)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                    statusFilter === opt.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-600 hover:text-blue-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full md:w-auto shrink-0 relative">
            <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full md:w-56 pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer shadow-sm"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.namaKategori}</option>
              ))}
            </select>
          </div>
        </div>        {/* List View (1 Kolom Full Width bergaya Manga/Wattpad) */}
        <div className="flex flex-col gap-3 min-h-[400px]">
          {reports.length === 0 && !loading && !initialLoad ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 space-y-3 bg-white rounded-lg border border-gray-100 shadow-sm h-full flex-1">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100">
                <FileText size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Belum ada laporan</p>
                <p className="text-xs text-gray-400 mt-0.5">Tidak ditemukan laporan untuk filter yang Anda pilih.</p>
              </div>
            </div>
          ) : (
            reports.map((report, index) => (
              <Link href={`/laporan/${report.id}`} key={report.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:border-blue-600 hover:shadow-md transition-all flex w-full h-24 sm:h-28"
                >
                  {/* Thumbnail Image (Kiri, lebih kecil) */}
                  <div className="w-24 sm:w-32 shrink-0 bg-gray-100 relative overflow-hidden">
                    {report.mediaUrls && report.mediaUrls.length > 0 ? (
                      <img
                        src={report.mediaUrls[0]}
                        alt={report.judul}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 p-2 text-center text-[10px]">
                        No Image
                      </div>
                    )}
                    {/* Status Badge Over Image (HP) */}
                    <div className="absolute top-1 left-1 sm:hidden">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        report.status === 'selesai' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-amber-500 text-white'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>

                  {/* Konten Text (Kanan, Memanjang) */}
                  <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0">
                    
                    {/* Bagian Atas: Judul & Deskripsi (Lebih padat) */}
                    <div>
                      <h3 className="text-[#111827] font-bold text-sm sm:text-base line-clamp-1 mb-0.5 group-hover:text-blue-600 transition-colors">
                        {report.judul}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2">
                        {report.deskripsi || "Tidak ada deskripsi."}
                      </p>
                    </div>

                    {/* Bagian Bawah: Meta Info */}
                    <div className="flex items-center justify-between mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-3 text-gray-400 text-[10px] sm:text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="shrink-0" />
                          <span className="truncate">{new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1">
                          <Tag size={12} className="shrink-0" />
                          <span>{report.kategori_laporan?.namaKategori || 'Lainnya'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 font-medium">
                          <MessageCircle size={12} className="shrink-0" />
                          <span>{report._count?.comments || 0}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge (Desktop) */}
                      <div className="hidden sm:block shrink-0">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          report.status === 'selesai' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-8">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!meta.hasPrevPage || loading}
              className="p-2.5 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-white hover:bg-blue-600 hover:border-blue-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">
                {meta.currentPage}
              </span>
              <span className="text-sm font-medium text-gray-400">
                / {meta.totalPages}
              </span>
            </div>

            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={!meta.hasNextPage || loading}
              className="p-2.5 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-white hover:bg-blue-600 hover:border-blue-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}