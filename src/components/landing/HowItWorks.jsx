import { Edit3, ShieldCheck, Wrench, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <Edit3 size={28} className="text-indigo-500" />,
    title: "Tulis Laporan",
    description:
      "Laporkan masalah infrastruktur atau fasilitas publik dengan detail lokasi dan foto pendukung.",
  },
  {
    icon: <ShieldCheck size={28} className="text-blue-500" />,
    title: "Verifikasi Admin",
    description:
      "Laporan Anda akan diverifikasi oleh admin untuk memastikan validitas dan kejelasan masalah.",
  },
  {
    icon: <Wrench size={28} className="text-amber-500" />,
    title: "Tindak Lanjut",
    description:
      "Instansi terkait akan segera memproses dan menindaklanjuti laporan yang telah disetujui.",
  },
  {
    icon: <CheckCircle size={28} className="text-blue-500" />,
    title: "Masalah Selesai",
    description:
      "Fasilitas kembali berfungsi dengan baik dan Anda akan mendapatkan notifikasi penyelesaian.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="py-24 bg-white dark:bg-zinc-950 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-3">
            Cara Kerja
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white">
            4 Langkah Mudah Membangun Lingkungan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {/* Connection Line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-zinc-100 dark:bg-zinc-800 -z-10">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-blue-500 w-0 group-hover:w-full transition-all duration-700 ease-out" />
                </div>
              )}

              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  {step.icon}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-sm font-bold shadow-sm">
                    {i + 1}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                  {step.title}
                </h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}