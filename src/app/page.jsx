"use client";

import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import NewsSection from "@/components/landing/NewSection";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  useEffect(() => {
    import("@lottiefiles/lottie-player");
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30">
      <Navbar />
      <Hero />
      <HowItWorks />
      <NewsSection />
      <CTASection />
    </div>
  );
}