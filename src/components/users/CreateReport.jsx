"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, MapPin, AlignLeft, Tag, Info, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function CreateReportSection() {
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategoriId: '',
    lokasi: '',
    isAnonymous: false,
    lat: -6.200000,
    lng: 106.816666,
  });
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Mengambil lokasi...');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/category', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
          if (data.data.length > 0) {
            setFormData(prev => ({ ...prev, kategoriId: data.data[0].id }));
          }
        }
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
      }
    };
    fetchCategories();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
          setLocationStatus('Lokasi berhasil didapatkan.');
        },
        (error) => {
          console.warn("Gagal mendapatkan lokasi:", error);
          setLocationStatus('Akses lokasi ditolak. Menggunakan lokasi default (Jakarta).');
        }
      );
    } else {
      setLocationStatus('Browser tidak mendukung lokasi.');
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB!");
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
    if (!file) {
      alert("Harap lampirkan foto bukti kejadian!");
      return;
    }
    if (!formData.kategoriId) {
      alert("Kategori laporan wajib dipilih!");
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
      payload.append('attachment', file);

      const res = await fetch('/api/reports', {
        method: 'POST',
        credentials: 'include',
        body: payload
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert("Laporan berhasil dikirim!");
        setFormData({
          judul: '',
          deskripsi: '',
          kategoriId: categories.length > 0 ? categories[0].id : '',
          lokasi: '',
          isAnonymous: false,
          lat: formData.lat,
          lng: formData.lng
        });
        removeFile();
      } else {
        alert(data.message || "Gagal mengirim laporan.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengirim laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 relative px-4" id="laporan">
      <div className="absolute inset-0 bg-blue-500/5 transform -skew-y-2 z-0"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-[#111827] tracking-tight">
            Sampaikan Laporan Anda
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">
            Tuliskan keluhan, saran, atau aspirasi Anda dengan jelas dan lengkap. Lampirkan foto bukti yang relevan agar laporan dapat segera ditindaklanjuti.
          </p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl shadow-blue-500/10 border border-blue-500/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Judul Laporan */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Tag size={16} className="text-blue-500" />
                Judul Laporan
              </label>
              <input 
                type="text" 
                required
                value={formData.judul}
                onChange={(e) => setFormData({...formData, judul: e.target.value})}
                placeholder="Ketik judul laporan Anda (misal: Jalan Berlubang di Jl. Sudirman)" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Kategori dan Lokasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" />
                  Kategori
                </label>
                <select 
                  required
                  value={formData.kategoriId}
                  onChange={(e) => setFormData({...formData, kategoriId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.namaKategori}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500" />
                  Lokasi Kejadian
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.lokasi}
                  onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
                  placeholder="Sebutkan patokan jalan atau gedung terdekat..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                <p className="text-[10px] text-gray-400 font-medium ml-1">
                  {locationStatus}
                </p>
              </div>
            </div>

            {/* Isi Laporan */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <AlignLeft size={16} className="text-blue-500" />
                Deskripsi Lengkap
              </label>
              <textarea 
                required
                rows={5}
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                placeholder="Jelaskan secara detail apa yang terjadi, kapan, dan informasi penting lainnya..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-y"
              />
            </div>

            {/* Upload Foto */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} className="text-blue-500" />
                Lampiran Foto Bukti <span className="text-red-500">*</span>
              </label>
              
              {!preview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-blue-500/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-700">Klik untuk mengunggah foto</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Maks. 5MB)</p>
                </div>
              ) : (
                <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview Lampiran" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={removeFile}
                      className="bg-white text-red-500 rounded-xl px-4 py-2 text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-red-50 transition"
                    >
                      <X size={16} /> Hapus Foto
                    </button>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />
            </div>

            {/* Opsi Anonim & Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 mt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 transition-all cursor-pointer peer appearance-none checked:bg-blue-600 checked:border-transparent"
                  />
                  <svg className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Kirim sebagai Anonim</span>
                  <p className="text-[11px] text-gray-500 font-medium">Identitas Anda tidak akan ditampilkan ke publik.</p>
                </div>
              </label>

              <Button 
                type="submit" 
                disabled={isSubmitting || !file}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-xl text-base shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Kirim Laporan
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