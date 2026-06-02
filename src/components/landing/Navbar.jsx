"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);

      const sections = ["home", "cara-kerja", "berita", "menu"];
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
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          {["Home", "Cara Kerja", "Berita", "Menu"].map((item) => {
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

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-semibold px-4 py-2 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
          >
            Daftar
          </Link>
        </div>
      </div>
    </nav>
  );
}