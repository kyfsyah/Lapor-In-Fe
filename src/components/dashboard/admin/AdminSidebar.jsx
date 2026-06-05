"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem('user_session');
    if (cached) {
      setUserData(JSON.parse(cached));
      setLoading(false);
    }

    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!res.ok) {
          sessionStorage.removeItem('user_session');
          router.push('/auth/login');
          return;
        }

        const data = await res.json();
        if (data.success) {
          if (data.user.role === 'user') {
            router.push('/users');
            return;
          }
          setUserData(data.user);
          sessionStorage.setItem('user_session', JSON.stringify(data.user));
        } else {
          sessionStorage.removeItem('user_session');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
        sessionStorage.removeItem('user_session');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      sessionStorage.removeItem('user_session');
    } catch (error) {
      console.error("Gagal logout:", error);
    }
    router.push('/login');
  };

  const getNavItems = () => {
    const basePath = userData?.role === 'admin' ? '/dashboard/admin' : '/dashboard/petugas';

    const items = [
      {
        label: 'OVERVIEW',
        items: [
          { name: 'Dashboard', href: basePath, icon: LayoutDashboard }
        ]
      },
      {
        label: 'KELOLA DATA',
        items: [
          { name: 'Semua Laporan', href: `${basePath}/laporan`, icon: FileText },
          { name: 'Data Pengguna', href: `${basePath}/pengguna`, icon: Users },
        ]
      }
    ];

    // Admin-only items
    if (userData?.role === 'admin') {
      items[1].items.push({ name: 'Data Petugas', href: `${basePath}/petugas`, icon: ShieldCheck });
      items.push({
        label: 'SISTEM',
        items: [
          { name: 'Pengaturan', href: `${basePath}/pengaturan`, icon: Settings },
        ]
      });
    }

    return items;
  };

  const navItems = getNavItems();

  const isActive = (href) => {
    const basePath = userData?.role === 'admin' ? '/dashboard/admin' : '/dashboard/petugas';
    if (href === basePath) {
      return pathname === basePath;
    }
    return pathname.startsWith(href);
  };



  const roleBadge = userData?.role === 'admin' ? (
    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md uppercase tracking-wider border border-amber-100">Admin</span>
  ) : userData?.role === 'petugas' ? (
    <span className="text-[10px] font-bold bg-sky-50 text-sky-600 px-2 py-0.5 rounded-md uppercase tracking-wider border border-sky-100">Petugas</span>
  ) : null;

  return (
    <>
      {/* MOBILE HEADER BAR */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold shadow-sm shadow-blue-600/20">
            <ShieldCheck size={16} />
          </span>
          <span className="text-lg font-black text-gray-900 tracking-tight">
            zona<span className="text-blue-600">lapor</span>
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition"
          aria-label="Toggle Sidebar"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR PANEL */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out overflow-y-auto
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* TOP CONTENT */}
        <div className="space-y-8">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between">
            <Link href={userData?.role === 'admin' ? '/dashboard/admin' : '/dashboard/petugas'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900 tracking-tight block leading-none">
                  zona<span className="text-blue-600">lapor</span>
                </span>
                <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Panel</span>
              </div>
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links - Grouped */}
          <nav className="space-y-6">
            {navItems.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">{group.label}</p>
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group/item
                        ${active
                          ? 'bg-gradient-to-r from-blue-600/10 to-blue-500/5 text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon className={`w-5 h-5 transition-transform group-hover/item:scale-110 duration-200 ${active ? 'text-blue-600' : 'text-gray-400 group-hover/item:text-gray-600'}`} />
                        {item.name}
                      </div>
                      {active && <ChevronRight size={14} className="text-blue-600/60" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* BOTTOM CONTENT */}
        <div className="space-y-4">


          {/* User Profile Card */}
          {loading ? (
            <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-100/50 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0"></div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-2 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-100/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-300 flex items-center justify-center text-white text-base font-bold shadow-sm shrink-0">
                {userData?.username ? userData.username.charAt(0).toUpperCase() : <User size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate leading-none">
                    {userData?.username || 'Admin'}
                  </p>
                  {roleBadge}
                </div>
                <p className="text-xs text-gray-400 truncate font-medium mt-1">
                  {userData?.email || 'admin@zonalapor.id'}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50/50 transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            Keluar Akun
          </Button>
        </div>
      </aside>
    </>
  );
}
