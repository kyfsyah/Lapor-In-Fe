"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, AlertTriangle, Edit2, Trash2, X, MapPin, AlignLeft, Tag, Info, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import NavbarUser from "@/components/users/NavbarUser";
import NavbarAdmin from "@/components/dashboard/admin/NavbarAdmin";
import Footer from "@/components/layout/Footer";
import CommentSection from "@/components/landing/CommentSection";
import toast from 'react-hot-toast';

export default function DetailLaporan() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Tanggapan State (Khusus Admin/Petugas)
  const [newTanggapan, setNewTanggapan] = useState("");
  const [tanggapanFile, setTanggapanFile] = useState(null);
  const [submittingTanggapan, setSubmittingTanggapan] = useState(false);

  const [editingTanggapanId, setEditingTanggapanId] = useState(null);
  const [editTanggapanText, setEditTanggapanText] = useState("");
  const [isUpdatingTanggapan, setIsUpdatingTanggapan] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [alasanHapus, setAlasanHapus] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const session = sessionStorage.getItem("user_session");
      if (session) {
        setIsLoggedIn(true);
        setUser(JSON.parse(session));
      }
    };
    checkLogin();

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${id}`, { cache: 'no-store' });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setReport(result.data);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil detail laporan:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReport();
  }, [id]);

  // ── Helpers ──────────────────────────────────────────────
  const maskName = (name) => {
    if (!name) return "Anonim";
    if (name.length <= 2) return name[0] + "*";
    return name.substring(0, 2) + "*".repeat(name.length - 2);
  };

  const handleTanggapanFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validasi ukuran (Maks 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB!");
        e.target.value = '';
        return;
      }
      
      // Validasi ekstensi
      const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/x-matroska'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Format file tidak didukung! Harap unggah PNG, JPG, MP4, atau MKV.");
        e.target.value = '';
        return;
      }
      setTanggapanFile(selectedFile);
    } else {
      setTanggapanFile(null);
    }
  };

  const isVideo = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|mkv|webm)($|\?)/i);
  };

  // ── Handlers ─────────────────────────────────────────────
  const handlePostTanggapan = async (e) => {
    e.preventDefault();
    if (!newTanggapan.trim()) return;
    setSubmittingTanggapan(true);
    try {
      const formData = new FormData();
      formData.append("isi_tanggapan", newTanggapan);
      if (tanggapanFile) formData.append("attachment", tanggapanFile);

      const res = await fetch(`/api/reports/${id}/tanggapan`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setReport({ ...report, tanggapan: [...(report.tanggapan || []), result.data] });
        setNewTanggapan("");
        setTanggapanFile(null);
        toast.success("Tanggapan berhasil dikirim!");
      } else {
        toast.error(result.message || "Gagal mengirim tanggapan.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem saat mengirim tanggapan.");
    } finally {
      setSubmittingTanggapan(false);
    }
  };

  const handleUpdateTanggapan = async (tanggapanId) => {
    if (!editTanggapanText.trim()) return;
    setIsUpdatingTanggapan(true);
    try {
      const formData = new FormData();
      formData.append("isi_tanggapan", editTanggapanText);

      const res = await fetch(`/api/reports/${id}/tanggapan/${tanggapanId}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setReport({ ...report, tanggapan: report.tanggapan.map((t) => (t.id === tanggapanId ? result.data : t)) });
        setEditingTanggapanId(null);
        setEditTanggapanText("");
        toast.success("Tanggapan berhasil diperbarui!");
      } else {
        toast.error(result.message || "Gagal memperbarui tanggapan.");
      }
    } catch (error) {
      console.error("Gagal mengupdate tanggapan:", error);
      toast.error("Terjadi kesalahan jaringan saat mengupdate tanggapan.");
    } finally {
      setIsUpdatingTanggapan(false);
    }
  };

  const handleDeleteTanggapan = async (tanggapanId) => {
    if (!confirm("Yakin ingin menghapus tanggapan resmi ini?")) return;
    try {
      const res = await fetch(`/api/reports/${id}/tanggapan/${tanggapanId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setReport({ ...report, tanggapan: report.tanggapan.filter((t) => t.id !== tanggapanId) });
        toast.success("Tanggapan berhasil dihapus!");
      } else {
        toast.error(result.message || "Gagal menghapus tanggapan.");
      }
    } catch (error) {
      console.error("Gagal menghapus tanggapan:", error);
      toast.error("Terjadi kesalahan jaringan saat menghapus tanggapan.");
    }
  };

  const handleDeleteReport = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Laporan berhasil dihapus dari database!");
        setIsDeleteModalOpen(false);
        router.push(user?.role === 'user' ? '/users/history' : '/dashboard');
      } else {
        toast.error(data.message || "Gagal menghapus laporan.");
      }
    } catch (error) {
      console.error("Gagal menghapus laporan:", error);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Navbar helper ─────────────────────────────────────────
  const NavbarWrapper = () => (
    <div className="relative z-50">
      <div className="max-w-7xl mx-auto w-full">
        {isLoggedIn ? (
          user?.role === "admin" || user?.role === "petugas" ? (
            <NavbarAdmin />
          ) : (
            <NavbarUser />
          )
        ) : (
          <Navbar />
        )}
      </div>
    </div>
  );

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
        <NavbarWrapper />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  // ── Not found state ───────────────────────────────────────
  if (!report) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
        <NavbarWrapper />
        <div className="flex-1 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold text-gray-700">Laporan tidak ditemukan</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Kembali
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      <NavbarWrapper />

      <main className="pt-24 pb-12 relative px-4 bg-[#FAFAFA] min-h-screen flex-1">
        <div className="absolute inset-0 bg-indigo-600/5 transform -skew-y-2 z-0 h-96"></div>

        <div className="max-w-4xl mx-auto relative z-10 w-full">

          {/* Tombol Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-6 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm w-fit"
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          {/* ── Postingan Laporan ── */}
          <article className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl shadow-indigo-600/10 border border-indigo-600/20 mb-8">
            
            {/* Header: User, Tanggal, Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold uppercase shadow-sm border border-gray-200/50">
                  {report.users?.username?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {maskName(report.users?.username)}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-2">
                    <span>{new Date(report.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="font-mono text-gray-400">{report.nomorResi || report.id.substring(0, 8)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm ${
                    report.status === "selesai"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : report.status === "ditolak"
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : report.status === "diproses"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}
                >
                  {report.status}
                </span>

                {/* Aksi User/Admin */}
                {user && (
                  <div className="flex items-center gap-2">
                    {user.id === report.userId && report.status === 'pending' && (
                      <button
                        onClick={() => router.push(`/users/edit/${report.id}`)}
                        className="text-indigo-500 hover:text-indigo-700 transition-colors p-2 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100"
                        title="Edit Laporan"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}

                    {(user.role === 'admin' || (user.id === report.userId && report.status === 'pending')) && (
                      <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100"
                        title="Hapus Laporan"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Judul Laporan */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-snug tracking-tight">
                {report.judul}
              </h1>
            </div>

            {/* Grid Informasi (Kategori & Lokasi) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Info size={16} className="text-indigo-600" />
                  Kategori Laporan
                </label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900">
                  {report.kategori_laporan?.namaKategori || "Lainnya"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin size={16} className="text-indigo-600" />
                  Lokasi Kejadian (Patokan)
                </label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900">
                  {report.alamat || "Lokasi tidak disebutkan secara spesifik."}
                </div>
              </div>
            </div>

            {/* Deskripsi Lengkap */}
            <div className="space-y-2 mb-8">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <AlignLeft size={16} className="text-indigo-600" />
                Deskripsi Lengkap
              </label>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[120px]">
                {report.deskripsi || "Tidak ada rincian deskripsi untuk laporan ini."}
              </div>
            </div>

            {/* Lampiran Foto/Video */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                <ImageIcon size={16} className="text-indigo-600" />
                Lampiran Bukti Kejadian
              </label>
              
              {report.mediaUrls && report.mediaUrls.length > 0 ? (
                <div className="relative w-full h-auto max-h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-black flex justify-center">
                  {isVideo(report.mediaUrls[0]) ? (
                    <video
                      src={report.mediaUrls[0]}
                      controls
                      className="w-full h-full max-h-[500px] object-contain"
                    />
                  ) : (
                    <img
                      src={report.mediaUrls[0]}
                      alt={report.judul}
                      className="w-full h-full max-h-[500px] object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-500">Tidak ada lampiran yang ditambahkan</p>
                </div>
              )}
            </div>

          </article>

          {/* ── Tanggapan Resmi (X / Quote Style) ── */}
          {report.tanggapan && report.tanggapan.length > 0 && (
            <div className="mb-8 bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-indigo-600/5 border border-gray-100 space-y-6">
              <h3 className="font-black text-xl text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <ShieldCheck size={24} className="text-indigo-600" />
                Tanggapan Resmi
              </h3>

              {report.tanggapan.map((tgp) => (
                <div key={tgp.id} className="flex items-start gap-3 sm:gap-4 group">

                  {/* Avatar Admin */}
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shrink-0 shadow-sm mt-1">
                    <ShieldCheck size={20} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">

                    {/* Header */}
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 mb-1 relative">
                      <p className="text-[15px] font-bold text-gray-900 hover:underline cursor-pointer">
                        {tgp.users?.username || "Admin Petugas"}
                      </p>
                      <ShieldCheck size={15} className="text-indigo-600" />
                      <p className="text-sm text-gray-500 hover:underline cursor-pointer">
                        {new Date(tgp.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>

                      {/* Tombol Edit / Delete */}
                      {user && (user.id === tgp.petugasId || user.role === "admin") && (
                        <div className="absolute right-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingTanggapanId(tgp.id);
                              setEditTanggapanText(tgp.isi_tanggapan);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                            title="Edit Tanggapan"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTanggapan(tgp.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            title="Hapus Tanggapan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Isi / Form Edit */}
                    {editingTanggapanId === tgp.id ? (
                      <div className="mb-3">
                        <textarea
                          value={editTanggapanText}
                          onChange={(e) => setEditTanggapanText(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[80px]"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setEditingTanggapanId(null)}
                            className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleUpdateTanggapan(tgp.id)}
                            disabled={isUpdatingTanggapan || !editTanggapanText.trim()}
                            className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                          >
                            {isUpdatingTanggapan ? "Menyimpan..." : "Simpan"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[15px] text-gray-900 leading-snug whitespace-pre-wrap font-sans mb-3">
                        {tgp.isi_tanggapan}
                      </div>
                    )}

                    {/* Lampiran Admin */}
                    {tgp.mediaUrls && tgp.mediaUrls.length > 0 && (
                      <div className="mb-3">
                        {isVideo(tgp.mediaUrls[0]) ? (
                          <video
                            src={tgp.mediaUrls[0]}
                            controls
                            className="rounded-2xl max-h-[300px] w-auto object-contain border border-gray-200 shadow-sm bg-black"
                          />
                        ) : (
                          <img
                            src={tgp.mediaUrls[0]}
                            alt="Lampiran Tanggapan"
                            className="rounded-2xl max-h-[200px] w-auto object-cover border border-gray-200 shadow-sm"
                          />
                        )}
                      </div>
                    )}


                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Form Tanggapan (Admin/Petugas) ── */}
          {user && (user.role === "admin" || user.role === "petugas") && (
            report.status === "pending" ? (
              <div className="bg-amber-50 border border-amber-200 sm:rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
                <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  Anda tidak dapat memberikan tanggapan resmi karena laporan ini masih berstatus{" "}
                  <b>Pending</b>. Silakan ubah status laporan menjadi "Diproses" terlebih dahulu di
                  Dashboard.
                </p>
              </div>
            ) : report.status === "ditolak" ? (
              <div className="bg-red-50 border border-red-200 sm:rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
                <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800">
                  Laporan ini telah <b>Ditolak</b>. Laporan telah dikunci dan Anda tidak dapat menambahkan tanggapan resmi lagi.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 shadow-sm sm:rounded-xl p-4 sm:p-5 mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  Berikan Tanggapan Resmi
                </h3>
                <form onSubmit={handlePostTanggapan} className="space-y-3">
                  <textarea
                    value={newTanggapan}
                    onChange={(e) => setNewTanggapan(e.target.value)}
                    placeholder="Tulis tanggapan atau tindak lanjut resmi di sini..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[100px] transition-all resize-y"
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, video/mp4, video/x-matroska"
                      onChange={handleTanggapanFileChange}
                      className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-600/10 file:text-indigo-600 hover:file:bg-indigo-600/20 transition-colors max-w-[200px] sm:max-w-xs"
                      title="PNG, JPG, MP4, MKV (Maks 10MB)"
                    />
                    <button
                      type="submit"
                      disabled={submittingTanggapan || !newTanggapan.trim()}
                      className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {submittingTanggapan ? "Mengirim..." : "Kirim Tanggapan"}
                    </button>
                  </div>
                </form>
              </div>
            )
          )}

          {/* ── Komentar Publik ── */}
          <div className="bg-white sm:rounded-[4px] border-gray-300 sm:border overflow-hidden">
            <CommentSection laporanId={report.id} status={report.status} />
          </div>

        </div>
      </main>

      {/* Modal Hapus Laporan */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-red-50/50">
              <h3 className="font-bold text-red-700 flex items-center gap-2">
                <Trash2 size={18} />
                Hapus Laporan
              </h3>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Judul Laporan</p>
                <p className="text-sm font-semibold text-gray-800">{report.judul}</p>
              </div>
              
              <div className="animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-gray-600">Apakah Anda yakin ingin membatalkan dan menghapus laporan ini secara permanen?</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-50 flex justify-end gap-2 bg-gray-50/30">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteReport}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}