import UserManagement from "@/components/dashboard/admin/UserManagement";

export const metadata = {
  title: "Data Pengguna - Admin Panel",
};

export default function PenggunaPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <UserManagement roleTarget="user" />
    </div>
  );
}
