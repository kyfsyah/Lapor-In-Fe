"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, AlertTriangle, Edit2, Trash2 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import NavbarUser from "@/components/users/NavbarUser";
import CommentSection from "@/components/landing/CommentSection";

export default function LaporanDetail() {
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
        const res = await fetch(`/api/reports/${id}`);
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
      } else {
        alert(result.message || "Gagal mengirim tanggapan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat mengirim tanggapan.");
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
      } else {
        alert(result.message || "Gagal memperbarui tanggapan.");
      }
    } catch (error) {
      console.error("Gagal mengupdate tanggapan:", error);
      alert("Terjadi kesalahan jaringan saat mengupdate tanggapan.");
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
      } else {
        alert(result.message || "Gagal menghapus tanggapan.");
      }
    } catch (error) {
      console.error("Gagal menghapus tanggapan:", error);
      alert("Terjadi kesalahan jaringan saat menghapus tanggapan.");
    }
  };

  // ── Navbar helper ─────────────────────────────────────────
  const NavbarWrapper = () => (
    <div className="bg-white border-b border-gray-100 shadow-sm z-10">
      <div className="max-w-7xl mx-auto w-full">
        {isLoggedIn ? <NavbarUser /> : <Navbar />}
      </div>
    </div>
  );

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
        <NavbarWrapper />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
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
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      <NavbarWrapper />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-20 pb-6 sm:pt-24 sm:pb-8">
        <div className="w-full">

          {/* ── Postingan Laporan ── */}
          <article className="bg-white sm:rounded-xl border-gray-100 sm:border shadow-sm overflow-hidden mb-6">
            {/* Header */}
            <div className="p-3 sm:p-4 flex items-center gap-3 text-xs border-b border-gray-50/50">
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-black transition-colors shrink-0 p-1 rounded-full hover:bg-gray-100"
                title="Kembali"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold uppercase shrink-0">
                {report.users?.username?.charAt(0) || "?"}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap text-gray-500">
                <span className="font-bold text-[#1c1c1c] hover:underline cursor-pointer">
                  {report.kategori_laporan?.namaKategori || "Lainnya"}
                </span>
                <span className="text-[10px]">•</span>
                <span>
                  Diposting oleh{" "}
                  <span className="hover:underline cursor-pointer">{maskName(report.users?.username)}</span>
                </span>
                <span className="text-[10px]">•</span>
                <span>
                  {new Date(report.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    report.status === "selesai"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {report.status}
                </span>
              </div>
            </div>

            {/* Judul */}
            <div className="px-3 sm:px-4 pb-2">
              <h1 className="text-xl md:text-[22px] font-medium text-[#1c1c1c] mb-1 leading-snug">
                {report.judul}
              </h1>
            </div>

            {/* Gambar */}
            {report.mediaUrls && report.mediaUrls.length > 0 && (
              <div className="w-full relative bg-gray-100 flex justify-center mb-3 border-t border-b border-gray-100">
                <img
                  src={report.mediaUrls[0]}
                  alt={report.judul}
                  className="w-full h-[250px] sm:h-[350px] md:h-[400px] object-cover"
                />
              </div>
            )}

            {/* Deskripsi */}
            <div className="px-3 sm:px-4 pb-4">
              <div className="prose prose-sm max-w-none text-[#1c1c1c] whitespace-pre-wrap leading-relaxed font-sans">
                {report.deskripsi || "Tidak ada rincian deskripsi untuk laporan ini."}
              </div>
            </div>
          </article>

          {/* ── Tanggapan Resmi (X / Quote Style) ── */}
          {report.tanggapan && report.tanggapan.length > 0 && (
            <div className="mb-8 space-y-6 pt-4">
              <h3 className="font-black text-xl text-gray-900 border-b border-gray-100 pb-3">
                Tanggapan Resmi
              </h3>

              {report.tanggapan.map((tgp) => (
                <div key={tgp.id} className="flex items-start gap-3 sm:gap-4 px-1 sm:px-2 group">

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
                      <ShieldCheck size={15} className="text-blue-600" />
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
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[80px]"
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
                            className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
                        <img
                          src={tgp.mediaUrls[0]}
                          alt="Lampiran Tanggapan"
                          className="rounded-2xl max-h-[200px] w-auto object-cover border border-gray-200 shadow-sm"
                        />
                      </div>
                    )}

                    {/* Embed Laporan (Twitter/X Quote Style) */}

<div
  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  className="mt-3 border border-gray-200 rounded-2xl p-3 hover:bg-gray-50 transition cursor-pointer"
>
  <div className="flex gap-3">


{/* Thumbnail */}
{report.mediaUrls?.length > 0 && (
  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-200">
    <img
      src={report.mediaUrls[0]}
      alt={report.judul}
      className="w-full h-full object-cover"
    />
  </div>
)}

{/* Content */}
<div className="flex-1 min-w-0">

  <div className="flex items-center gap-2 mb-1">
    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase">
      {report.users?.username?.charAt(0) || "?"}
    </div>

    <span className="text-xs font-semibold text-gray-900 truncate">
      {maskName(report.users?.username)}
    </span>

    <span className="text-xs text-gray-500">
      @{maskName(report.users?.username)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}
    </span>
  </div>

  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
    {report.judul}
  </h4>

  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
    {report.deskripsi}
  </p>
</div>


  </div>



                      
                    </div>

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
            ) : (
              <div className="bg-white border border-gray-200 shadow-sm sm:rounded-xl p-4 sm:p-5 mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600" />
                  Berikan Tanggapan Resmi
                </h3>
                <form onSubmit={handlePostTanggapan} className="space-y-3">
                  <textarea
                    value={newTanggapan}
                    onChange={(e) => setNewTanggapan(e.target.value)}
                    placeholder="Tulis tanggapan atau tindak lanjut resmi di sini..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px] transition-all resize-y"
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setTanggapanFile(e.target.files[0])}
                      className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600/10 file:text-blue-600 hover:file:bg-blue-600/20 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={submittingTanggapan || !newTanggapan.trim()}
                      className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
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
            <CommentSection laporanId={report.id} />
          </div>

        </div>
      </main>
    </div>
  );
}