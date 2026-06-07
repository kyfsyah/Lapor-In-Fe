"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, MapPin, AlignLeft, Tag, Info, Image as ImageIcon, Loader2, X, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function EditReportSection({ reportId }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategoriId: '',
    lokasi: '',
    lat: -6.200000,
    lng: 106.816666,
  });
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Kategori
        const catRes = await fetch('/api/category', { credentials: 'include' });
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.data);
        }

        // Fetch Report Detail
        const repRes = await fetch(`/api/reports/${reportId}`, { cache: 'no-store' });
        const repData = await repRes.json();
        
        if (repData.success) {
          const report = repData.data;
          
          if (report.status !== 'pending') {
            toast.error("Laporan sudah diproses dan tidak dapat diedit.");
            router.push('/users/history');
            return;
          }

          setFormData({
            judul: report.judul || '',
            deskripsi: report.deskripsi || '',
            kategoriId: report.kategoriId ? report.kategoriId.toString() : '',
            lokasi: report.alamat || '',
            lat: report.lat,
            lng: report.lng,
          });

          if (report.mediaUrls && report.mediaUrls.length > 0) {
            setPreview(report.mediaUrls[0]);
          }
        } else {
          toast.error("Laporan tidak ditemukan.");
          router.push('/users/history');
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        toast.error("Gagal memuat laporan.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [reportId, router]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB!");
        e.target.value = '';
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/x-matroska'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Format file tidak didukung! Harap unggah PNG, JPG, MP4, atau MKV.");
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preview) {
      toast.error("Harap lampirkan foto bukti kejadian!");
      return;
    }
    if (!formData.kategoriId) {
      toast.error("Kategori laporan wajib dipilih!");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = new FormData();
      payload.append('judul', formData.judul);
      payload.append('deskripsi', formData.deskripsi);
      payload.append('kategoriId', formData.kategoriId);
      payload.append('alamat', formData.lokasi);
      payload.append('lat', formData.lat);
      payload.append('lng', formData.lng);
      
      if (file) {
        payload.append('attachment', file);
      }

      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        credentials: 'include',
        body: payload
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success("Laporan berhasil diperbarui!");
        router.replace(`/laporan/${reportId}`);
      } else {
        toast.error(data.message || "Gagal memperbarui laporan.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat memperbarui laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLocation = () => {
    setLocationStatus('Mengambil lokasi terbaru...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
          setLocationStatus('Lokasi berhasil diperbarui.');
          toast.success("Lokasi berhasil diperbarui!");
        },
        (error) => {
          console.warn("Gagal mendapatkan lokasi:", error);
          setLocationStatus('Gagal mengambil lokasi.');
          toast.error("Gagal mengambil lokasi.");
        }
      );
    } else {
      setLocationStatus('Browser tidak mendukung lokasi.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-32 flex justify-center items-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <section className="pt-24 pb-12 relative px-4 bg-[#FAFAFA] min-h-screen">
      <div className="absolute inset-0 bg-indigo-600/5 transform -skew-y-2 z-0 h-96"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Tombol Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-6 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm w-fit"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="text-center mb-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-[#111827] tracking-tight">
            Edit Laporan Pending
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">
            Anda dapat mengubah detail laporan selama statusnya masih <span className="text-amber-500 font-bold">Pending</span>.
          </p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl shadow-indigo-600/10 border border-indigo-600/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Judul Laporan */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Tag size={16} className="text-indigo-600" />
                Judul Laporan
              </label>
              <input 
                type="text" 
                required
                value={formData.judul}
                onChange={(e) => setFormData({...formData, judul: e.target.value})}
                placeholder="Ketik judul laporan Anda" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 transition-all"
              />
            </div>

            {/* Kategori dan Lokasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Info size={16} className="text-indigo-600" />
                  Kategori
                </label>
                <select 
                  required
                  value={formData.kategoriId}
                  onChange={(e) => setFormData({...formData, kategoriId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 transition-all"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.namaKategori}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-600" />
                    Lokasi Kejadian
                  </label>
                  <button type="button" onClick={updateLocation} className="text-xs text-indigo-600 font-bold hover:underline">
                    Perbarui Titik Lokasi
                  </button>
                </div>
                <input 
                  type="text" 
                  required
                  value={formData.lokasi}
                  onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
                  placeholder="Sebutkan patokan jalan atau gedung terdekat..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 transition-all"
                />
                <p className="text-[10px] text-gray-400 font-medium ml-1">
                  {locationStatus}
                </p>
              </div>
            </div>

            {/* Isi Laporan */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <AlignLeft size={16} className="text-indigo-600" />
                Deskripsi Lengkap
              </label>
              <textarea 
                required
                rows={5}
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                placeholder="Jelaskan secara detail apa yang terjadi..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 transition-all resize-y"
              />
            </div>

            {/* Upload Foto */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} className="text-indigo-600" />
                Lampiran Foto Bukti <span className="text-red-500">*</span>
              </label>
              
              {!preview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-indigo-600/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-700">Klik untuk mengunggah bukti baru</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, MP4, MKV (Maks. 10MB)</p>
                </div>
              ) : (
                <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 group bg-black flex justify-center">
                  {preview.includes('.mp4') || preview.includes('.mkv') || file?.type?.startsWith('video/') ? (
                    <video src={preview} controls className="w-full h-full object-contain" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={preview} alt="Preview Lampiran" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="bg-white text-red-500 rounded-xl px-4 py-2 text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-red-50 transition pointer-events-auto"
                    >
                      <X size={16} /> Hapus / Ganti File
                    </button>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, video/mp4, video/x-matroska"
                className="hidden"
              />
              <p className="text-xs text-gray-400 mt-1">*Jika tidak ingin mengubah lampiran, biarkan saja foto yang sudah ada.</p>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end pt-4 border-t border-gray-100 mt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting || !preview}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-6 rounded-xl text-base shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}