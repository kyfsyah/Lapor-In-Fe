import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar";

export const metadata = {
  title: 'Admin Panel - Zona Lapor',
  description: 'Panel administrasi untuk mengelola laporan dan data pengguna Zona Lapor.',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col lg:flex-row">
      {/* Admin Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
