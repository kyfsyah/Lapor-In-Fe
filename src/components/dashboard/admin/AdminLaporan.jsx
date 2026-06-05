"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Search, Clock, CheckCircle2, Activity,
  AlertCircle, Eye, MessageSquare, ChevronLeft,
  ChevronRight, MoreHorizontal, SlidersHorizontal,
  ArrowUpDown, MapPin, Calendar, User, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminLaporan() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('semua');
  const [activeCategory, setActiveCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, totalItems: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const filters = [
    { key: 'semua', label: 'Semua' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'diproses', label: 'Diproses' },
    { key: 'selesai', label: 'Selesai' },
    { key: 'ditolak', label: 'Ditolak' },
  ];

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/reports?page=${currentPage}&limit=10`;
      if (activeFilter !== 'semua') url += `&status=${activeFilter}`;
      if (activeCategory) url += `&kategoriId=${activeCategory}`;
      
      // Catatan: Jika ingin mencari berdasarkan resi, kita akan panggil search, tapi 
      // kita gunakan query biasa dulu jika backend searchByNomorResi khusus /search
      if (searchQuery) url = `/api/reports/search?resi=${searchQuery}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
        if (data.meta) setMeta(data.meta);
        else setMeta({ totalPages: 1, totalItems: data.data.length });
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Gagal memuat laporan", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilter, activeCategory, searchQuery]);

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

  useEffect(() => {
    const timer = setTimeout(() => fetchReports(), 500);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  const openModal = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !newStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchReports(); // Refresh data
      } else {
        alert(data.message || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat mengupdate status.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
          <Clock size={11} className="shrink-0" />
          Menunggu
        </span>
      ),
      diproses: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
          <Activity size={11} className="shrink-0 animate-pulse" />
          Diproses
        </span>
      ),
      selesai: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 size={11} className="shrink-0" />
          Selesai
        </span>
      ),
      ditolak: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">
          <AlertCircle size={11} className="shrink-0" />
          Ditolak
        </span>
      ),
    };
    return badges[status] || null;
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 relative">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Kelola Laporan
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Tinjau, proses, dan tanggapi semua laporan pengaduan masyarakat.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Cari berdasarkan nomor resi..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition"
            />
          </div>
          <div className="relative shrink-0 w-full md:w-auto">
            <SlidersHorizontal size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={activeCategory}
              onChange={(e) => { setActiveCategory(e.target.value); setCurrentPage(1); }}
              className="w-full md:w-48 pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.namaKategori}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => { setActiveFilter(filter.key); setCurrentPage(1); }}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200
                ${activeFilter === filter.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-200'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100">
          <div className="col-span-5 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Laporan</span>
            <ArrowUpDown size={10} className="text-gray-300" />
          </div>
          <div className="col-span-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pelapor</span>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</span>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
          </div>
          <div className="col-span-1 text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aksi</span>
          </div>
        </div>

        {/* Report Rows */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-semibold text-gray-500">Memuat laporan...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Tidak ada laporan ditemukan</p>
              <p className="text-xs text-gray-400 mt-0.5">Coba ubah filter atau kata kunci pencarian Anda.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => router.push(`/laporan/${report.id}`)}
                className="md:grid md:grid-cols-12 md:gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer group"
              >
                {/* Laporan Info */}
                <div className="col-span-5 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider font-mono">{report.nomorResi || report.id.substring(0,8)}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{report.kategori_laporan?.namaKategori || '-'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {report.judul}
                  </h3>
                  {report.lokasi && (
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">{report.lokasi}</span>
                    </div>
                  )}
                </div>

                {/* Pelapor */}
                <div className="col-span-2 flex items-center mt-2 md:mt-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200/50 shrink-0">
                      <User size={13} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 truncate">{report.users?.username || 'Anonim'}</p>
                      {report._count?.komentar > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-medium">
                          <MessageSquare size={9} />
                          {report._count.komentar} komentar
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tanggal */}
                <div className="col-span-2 flex items-center mt-2 md:mt-0">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Calendar size={12} className="text-gray-400 shrink-0" />
                    {new Date(report.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center mt-2 md:mt-0">
                  {getStatusBadge(report.status)}
                </div>

                {/* Aksi */}
                <div className="col-span-1 flex items-center justify-end mt-2 md:mt-0">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                    <Eye size={15} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openModal(report); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-600/10 transition"
                    title="Ubah Status"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500 font-medium">
            Total Laporan: <span className="font-bold text-gray-700">{meta.totalItems || 0}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 border border-transparent hover:border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs font-bold text-gray-700 px-2">
              Halaman {currentPage} dari {meta.totalPages || 1}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta.totalPages))}
              disabled={currentPage === meta.totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 border border-transparent hover:border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Ubah Status */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Update Status Laporan</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Judul Laporan</p>
                <p className="text-sm font-semibold text-gray-800">{selectedReport.judul}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Status Baru</p>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition"
                >
                  <option value="pending">Menunggu</option>
                  <option value="diproses">Diproses</option>
                  <option value="selesai">Selesai</option>
                  <option value="ditolak">Ditolak</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-2">
                  Mengubah status ke <b>Diproses</b> berarti laporan mulai ditindaklanjuti.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-50 flex justify-end gap-2 bg-gray-50/30">
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Batal
              </Button>
              <Button 
                onClick={handleUpdateStatus}
                disabled={updating || selectedReport.status === newStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm"
              >
                {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
