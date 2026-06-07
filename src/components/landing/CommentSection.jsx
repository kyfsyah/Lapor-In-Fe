"use client";
import { useEffect, useState } from "react";
import { Send, UserCircle2, Edit2, Trash2, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

export default function CommentSection({ laporanId, status }) {
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  // Edit State
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    try {
      const sessionUser = sessionStorage.getItem("user_session");
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
    } catch (err) {
      console.error("Gagal membaca session user:", err);
    }
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      if (!laporanId) return;
      try {
        const res = await fetch(`/api/reports/${laporanId}/comments`);
        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            setComments(result.data);
          }
        }
      } catch (err) {
        console.error("Gagal memuat komentar:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [laporanId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${laporanId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ body: newComment }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setComments([...comments, result.data]);
        setNewComment("");
        toast.success("Komentar berhasil dikirim!");
      } else {
        toast.error(result.message || "Gagal mengirim komentar");
      }
    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- CRUD Functions ---

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;

    try {
      const res = await fetch(`/api/reports/${laporanId}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        toast.success("Komentar berhasil dihapus!");
      } else {
        const result = await res.json();
        toast.error(result.message || "Gagal menghapus komentar.");
      }
    } catch (err) {
      console.error("Gagal menghapus komentar:", err);
      toast.error("Terjadi kesalahan sistem saat menghapus komentar.");
    }
  };

  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.body);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/reports/${laporanId}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: editContent }),
      });

      if (res.ok) {
        const result = await res.json();
        setComments(comments.map(c => c.id === commentId ? { ...c, body: result.data.body } : c));
        cancelEdit();
        toast.success("Komentar berhasil diperbarui!");
      } else {
        const result = await res.json();
        toast.error(result.message || "Gagal mengedit komentar.");
      }
    } catch (err) {
      console.error("Gagal mengedit komentar:", err);
      toast.error("Terjadi kesalahan sistem saat mengedit komentar.");
    }
  };

  // --- UI Helpers ---

  const maskName = (name) => {
    if (!name) return "Anonim";
    if (name.length <= 2) return name[0] + "*";
    return name.substring(0, 2) + "*".repeat(name.length - 2);
  };

  return (
    <div className="bg-white">

      {/* Area Input Komentar (Di atas, ala Reddit) */}
      <div className="p-4 sm:p-5 border-b border-gray-100">
        <h3 className="text-[15px] font-medium text-[#1c1c1c] mb-3">
          Sort by: <span className="font-bold cursor-pointer">Terbaru</span>
        </h3>

        {user ? (
          status === 'ditolak' ? (
            <div className="flex items-center justify-between border border-red-200 rounded-xl p-3 bg-red-50 mb-3 animate-fade-in">
              <p className="text-sm text-red-700 font-medium">Laporan ini telah ditolak. Kolom komentar ditutup.</p>
            </div>
          ) : status === 'pending' && (user.role === 'admin' || user.role === 'petugas') ? (
            <div className="flex items-center justify-between border border-amber-200 rounded-xl p-3 bg-amber-50 mb-3 animate-fade-in">
              <p className="text-sm text-amber-700 font-medium">Ubah status laporan menjadi diproses terlebih dahulu untuk ikut berkomentar.</p>
            </div>
          ) : (
            <form onSubmit={handlePostComment} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Apa pendapat Anda?"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none min-h-[90px] transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment(e);
                    }
                  }}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-5 py-1.5 bg-[#2563EB] text-white text-sm font-bold rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Komentar
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="flex items-center justify-between border border-gray-100 rounded-xl p-3.5 bg-gray-50/50">
            <p className="text-sm text-gray-500 font-medium">Log in untuk berdiskusi</p>
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-1.5 border border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB]/10 text-sm font-bold rounded-full transition-colors"
            >
              Log In
            </button>
          </div>
        )}
      </div>

      {/* List Komentar */}
      <div className="p-4 sm:p-5">
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
            </div>
          ) : (
            comments.map((comment) => {
              // Cek apakah user sedang login dan merupakan pemilik komentar
              const isOwner = user && String(user.id) === String(comment.users?.id);
              const isEditing = editingCommentId === comment.id;

              return (
                <div key={comment.id} className="group flex gap-2.5 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  {/* Avatar */}
                  <div className="shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs uppercase mt-0.5">
                    {comment.users?.username?.charAt(0) || '?'}
                  </div>

                  {/* Isi Komentar */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[13px] text-[#1c1c1c] hover:underline cursor-pointer">
                          {maskName(comment.users?.username)}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[12px] text-gray-500 hover:underline cursor-pointer">
                          {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>

                      {/* Aksi CRUD (Edit & Delete) */}
                      {isOwner && !isEditing && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(comment)}
                            className="text-gray-400 hover:text-[#2563EB] transition-colors p-1"
                            title="Edit Komentar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Hapus Komentar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 flex flex-col gap-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[14px] text-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white resize-none min-h-[70px] transition-all"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit(comment.id);
                            }
                          }}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-gray-100 text-gray-655 text-xs font-bold rounded-full hover:bg-gray-200 transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={!editContent.trim()}
                            className="px-3 py-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[14px] text-[#1c1c1c] break-words whitespace-pre-wrap leading-relaxed">{comment.body}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}