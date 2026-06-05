import { History } from "@/components/users/History";
import NavbarUser from "@/components/users/NavbarUser";

export const metadata = {
  title: "Riwayat Pengaduan | LaporIn",
  description: "Pantau daftar dan status laporan yang pernah Anda kirimkan.",
};

export default function HistoryLaporanPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <NavbarUser />
      <main className="pt-20 sm:pt-24 pb-12">
        <History />
      </main>
    </div>
  );
}