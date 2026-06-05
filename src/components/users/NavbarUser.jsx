"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, ChevronDown, Clock } from "lucide-react";

export default function NavbarUser() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // Retrieve user data from sessionStorage (set during login)
      const session = sessionStorage.getItem("user_session");
      if (session) {
        try {
          setUserData(JSON.parse(session));
          return;
        } catch (e) {
          console.error("Failed to parse session", e);
        }
      }

      // If session not found in sessionStorage, fetch from backend API
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const result = await res.json();
          const userObj = result.user || result.data;
          if (result.success && userObj) {
            setUserData(userObj);
            sessionStorage.setItem("user_session", JSON.stringify(userObj));
          }
        }
      } catch (err) {
        console.error("Failed to fetch user session", err);
      }
    };

    fetchUserData();

    const onScroll = () => {
      setScrolled(window.scrollY > 16);

      const sections = ["home", "cara-kerja", "laporan", "berita"];
      let current = "home";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && el.getBoundingClientRect().top <= 150) {
          current = section;
        }
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      sessionStorage.removeItem("user_session");
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm border-b border-zinc-100 dark:border-zinc-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <polygon
                points="9,2 16,6 16,12 9,16 2,12 2,6"
                stroke="white"
                strokeWidth="1.8"
                fill="none"
              />
              <circle cx="9" cy="9" r="2.5" fill="white" />
            </svg>
          </div>
          <span className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
            LaporIn
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Home", "Cara Kerja", "Laporan", "Berita"].map((item) => {
            const sectionId = item.toLowerCase().replace(" ", "-");
            const isActive = activeSection === sectionId;
            return (
              <a
                key={item}
                href={`#${sectionId}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(sectionId);
                  const el = document.getElementById(sectionId);
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }}
                className={`text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 pb-0.5"
                    : "font-normal text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {item}
              </a>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* History Link */}
          <Link
            href="/users/history"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 border border-transparent text-sm font-medium"
            title="Riwayat Pengaduan"
          >
            <Clock size={16} />
            <span className="hidden sm:inline">Riwayat</span>
          </Link>

          {/* Divider */}
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              {userData?.username ? userData.username.charAt(0).toUpperCase() : <User size={16} />}
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hidden sm:block">
              {userData?.username || "Pengguna"}
            </span>
            <ChevronDown size={16} className={`text-zinc-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-800 py-2 z-50 overflow-hidden">
              <Link
                href="/users/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={16} />
                <span>Pengaturan</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
}
