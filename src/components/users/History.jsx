"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Tag, MessageCircle, ChevronLeft, ChevronRight, FileText, Hash, ArrowLeft, Edit2, Trash2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function History() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState("semua");

  // State untuk Hapus Laporan
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      let url = `/api/reports/me?limit=6&sort=desc&page=${page}`;
      if (statusFilter !== "semua") {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url, {
        credentials: 'include'
      });

      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setReports(result.data);
          setMeta(result.meta);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat laporan:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [page, statusFilter, router]);

  const handleDelete = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reports/${reportToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Laporan berhasil dihapus!');
        setDeleteModalOpen(false);
        setReportToDelete(null);
        fetchMyReports(); // Refresh data
      } else {
        toast.error(data.message || 'Gagal menghapus laporan.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterChange = (status) => {
    if (statusFilter !== status) {
      setStatusFilter(status);
      setPage(1);
    }
  };

  const filterOptions = [
    { value: 'semua', label: 'Semua' },
    { value: 'pending', label: 'Pending' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'ditolak', label: 'Ditolak' }
  ];

  // Fungsi Helper Warna Status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'diproses': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'selesai': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ditolak': return 'bg-red-100 text-red-700 border-red-200';
      case 'dihapus': return 'bg-gray-800 text-white border-gray-900';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (initialLoad) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Memuat riwayat Anda...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 relative min-h-[70vh]">

      {/* Loading Overlay saat pindah halaman */}
      {loading && !initialLoad && (
        <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Riwayat Pengaduan</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium mb-4 md:mb-0">Pantau daftar dan status laporan yang pernah Anda kirimkan.</p>
          </div>
        </div>

        {/* Filter Status (Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${statusFilter === opt.value
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-indigo-600 hover:text-indigo-600"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {reports.length === 0 && page === 1 ? (
        <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
            <FileText size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada laporan</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            {statusFilter === 'semua'
              ? "Anda belum pernah membuat laporan pengaduan apapun. Mulai suarakan aspirasi Anda sekarang!"
              : `Tidak ditemukan laporan dengan status "${filterOptions.find(o => o.value === statusFilter)?.label}".`}
          </p>
          {statusFilter === 'semua' ? (
            <Link href="/dashboard/lapor">
              <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/30">
                Buat Laporan Baru
              </button>
            </Link>
          ) : (
            <button
              onClick={() => handleFilterChange('semua')}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm"
            >
              Lihat Semua Laporan
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report, index) => {
            const isDeleted = report.status === 'ditolak' && report.tanggapan?.[0]?.isi_tanggapan?.startsWith('[LAPORAN DIHAPUS]');
            const displayStatus = isDeleted ? 'dihapus' : report.status;
            const alasanHapus = isDeleted ? report.tanggapan[0].isi_tanggapan.replace('[LAPORAN DIHAPUS]:', '').trim() : null;

            return (
              <Link href={`/laporan/${report.id}`} key={report.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:border-indigo-600 hover:shadow-md transition-all flex flex-col sm:flex-row w-full min-h-[120px]"
                >
                  {/* Thumbnail Image */}
                  <div className="w-full sm:w-40 h-32 sm:h-auto shrink-0 bg-gray-50 relative overflow-hidden">
                    {report.mediaUrls && report.mediaUrls.length > 0 ? (
                      <img
                        src={report.mediaUrls[0]}
                        alt={report.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 p-2 text-center text-xs font-medium">
                        Tanpa Foto
                      </div>
                    )}
                    {/* Status Badge Over Image (Mobile) */}
                    <div className="absolute top-2 right-2 sm:hidden">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getStatusColor(displayStatus)}`}>
                        {displayStatus}
                      </span>
                    </div>
                  </div>

                  {/* Konten Text */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      {/* Header: Resi & Status */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-400 tracking-wider">
                          <Hash size={12} />
                          {report.nomorResi}
                        </div>
                        <div className="hidden sm:block shrink-0">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(displayStatus)}`}>
                            {displayStatus}
                          </span>
                        </div>
                      </div>

                      {/* Judul */}
                      <h3 className={`font-bold text-base sm:text-lg line-clamp-1 mb-1 transition-colors ${isDeleted ? 'text-gray-400 line-through' : 'text-[#1c1c1c] group-hover:text-indigo-600'}`}>
                        {report.judul}
                      </h3>

                      {isDeleted && (
                        <div className="mt-1 mb-2 p-2.5 bg-red-50/80 border border-red-100 rounded-lg text-xs text-red-800">
                          <span className="font-bold block mb-0.5">Alasan Penghapusan:</span>
                          {alasanHapus}
                        </div>
                      )}
                    </div>

                    {/* Meta Info Bawah */}
                    <div className="flex items-center gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-50 flex-wrap">
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                        <Tag size={14} className="text-gray-400" />
                        <span>{report.kategori_laporan?.namaKategori || 'Lainnya'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-xs font-bold ml-auto">
                        <MessageCircle size={14} className="text-gray-400" />
                        <span>{report._count?.comments || 0}</span>
                      </div>
                    </div>

                    {/* Actions Row (Edit & Delete for Pending) */}
                    {displayStatus === 'pending' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/users/edit/${report.id}`);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setReportToDelete(report);
                            setDeleteModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    )}

                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-8 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!meta.hasPrevPage || loading}
            className="p-2.5 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all"
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
            className="p-2.5 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteModalOpen && reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteModalOpen(false)}
          ></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-6 md:p-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6 mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>

              <h3 className="text-xl font-black text-gray-900 text-center mb-2">
                Hapus Laporan?
              </h3>

              <p className="text-center text-gray-500 text-sm mb-6">
                Apakah Anda yakin ingin membatalkan dan menghapus laporan "<span className="font-bold text-gray-700">{reportToDelete.judul}</span>"? Aksi ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <><Loader2 size={16} className="animate-spin" /> Menghapus...</>
                  ) : (
                    <><Trash2 size={16} /> Ya, Hapus</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}