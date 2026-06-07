"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavbarUser from "@/components/users/NavbarUser";
import Footer from "@/components/layout/Footer";
import { User, Mail, Phone, Save, CheckCircle2, AlertCircle, Shield, ArrowLeft } from "lucide-react";

export default function UsersProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Edit state
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            setUsername(data.user.username || "");
            setEmail(data.user.email || "");
            setPhoneNumber(data.user.phoneNumber || "");
            sessionStorage.setItem("user_session", JSON.stringify(data.user));
          } else {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phoneNumber }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);

        sessionStorage.setItem(
          "user_session",
          JSON.stringify(data.user)
        );

        setSuccess("Profil berhasil diperbarui!");
        setIsEditing(false);

        setTimeout(() => {
          setSuccess("");
        }, 4000);
      } else {
        setError(data.message || "Gagal memperbarui profil.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        <NavbarUser />
        <div className="flex-1 flex justify-center items-center pt-20">
          <div className="animate-spin w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans">
      <NavbarUser />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-20 sm:pt-24 pb-8 sm:pb-12 flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">

        {/* Tombol Back Bulat di Samping */}
        <button
          onClick={() => router.back()}
          className="shrink-0 w-10 h-10 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-full text-gray-500 hover:text-white hover:bg-[#2563EB] hover:border-[#2563EB] transition-all hidden sm:flex mt-1"
          title="Kembali"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Container Utama Profil & Form */}
        <div className="flex-1 w-full">
          {/* Tombol Back Mobile (Hanya muncul di HP) */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#2563EB] transition-colors mb-4 sm:hidden"
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-xl px-4 py-3 mb-6 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              {success}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-xl px-4 py-3 mb-6 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Main Split Layout */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Profile Header Card (Left Side) */}
            <div className="w-full lg:w-1/3 shrink-0">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                {/* Banner Background */}
                <div className="h-32 bg-gradient-to-r from-[#2563EB] to-blue-400 relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm"></div>
                  <div className="absolute bottom-0 left-10 w-24 h-24 bg-white/20 rounded-full translate-y-1/2 blur-sm"></div>
                </div>

                <div className="px-6 pb-8 relative flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-28 h-28 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden relative z-10 -mt-14 mb-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=2563EB&color=fff&size=256&font-size=0.4`}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* User Info */}
                  <div className="space-y-1.5 w-full">
                    <h1 className="text-xl font-black text-gray-900 tracking-tight line-clamp-1">{user?.username}</h1>
                    <p className="text-gray-500 font-medium text-sm flex items-center justify-center gap-1.5 line-clamp-1">
                      <Mail size={14} className="text-gray-400 shrink-0" />
                      {user?.email}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-100 w-full flex flex-col gap-3 items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
                        <Shield size={14} className="text-blue-500" />
                        {user?.role === 'user' ? 'Masyarakat' : user?.role}
                      </span>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="w-full px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-sm active:scale-95 mt-2"
                        >
                          Edit Profil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form Card (Right Side) */}
            <div className="flex-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 relative overflow-hidden h-full">
                {/* Subtle background pattern/color for the form card */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-100 via-gray-50 to-white"></div>

                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  Informasi Pribadi
                </h2>

                <form onSubmit={handleSave} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Username
                      </label>

                      <div className="relative">
                        <User
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="text"
                          disabled={!isEditing}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition outline-none ${isEditing
                              ? "bg-white border-gray-200 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-gray-900"
                              : "bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Email
                      </label>

                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="email"
                          disabled={!isEditing}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition outline-none ${isEditing
                              ? "bg-white border-gray-200 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-gray-900"
                              : "bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Nomor Telepon
                      </label>

                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="tel"
                          disabled={!isEditing}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition outline-none ${isEditing
                              ? "bg-white border-gray-200 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-gray-900"
                              : "bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4 border-t border-gray-50">

                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-sm"
                      >
                        <Save size={16} />
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUsername(user?.username || "");
                          setEmail(user?.email || "");
                          setPhoneNumber(user?.phoneNumber || "");
                          setError("");
                          setSuccess("");
                          setIsEditing(false);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition"
                      >
                        Batal
                      </button>

                    </div>
                  )}

                </form>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}