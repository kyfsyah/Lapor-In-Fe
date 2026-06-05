export default function CTASection() {
  return (
    <section id="menu" className="w-full px-6 py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 px-8 py-16 md:px-16 flex flex-col items-center gap-8 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-4">
            Mari Berkontribusi
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight max-w-2xl">
            Jadilah Bagian dari Perubahan Lingkungan Anda
          </h2>
        </div>

        <p className="relative text-blue-100 text-lg leading-relaxed max-w-xl">
          Satu laporan Anda sangat berarti untuk membangun lingkungan yang lebih baik, aman, dan nyaman bagi semua warga.
        </p>

        <div className="relative flex flex-col sm:flex-row gap-4 pt-4">
          <a
            href="/register"
            className="flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all shadow-xl"
          >
            Lapor Sekarang →
          </a>
          <a
            href="#cara-kerja"
            className="flex h-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 hover:bg-white/20 px-8 text-base font-semibold text-white transition-all backdrop-blur-sm"
          >
            Pelajari Lebih Lanjut
          </a>
        </div>
      </div>
    </section>
  );
}