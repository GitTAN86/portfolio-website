"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import FeedbackModal from "@/components/FeedbackModal";
import AdminLink from "@/components/AdminLink";
import ScrollThemeManager from "@/components/ScrollThemeManager";
import ParticleBackground from "@/components/ParticleBackground";
import GhostPaperCV from "@/components/GhostPaperCV";

export default function HomeClient({ initialData }) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <ScrollThemeManager />
      <ParticleBackground />
      <main className="content-wrapper">
        <Hero data={initialData} />
        <About data={initialData} />
        
        {!isMobile && <GhostPaperCV data={initialData} />}

        {isMobile && (
          <>
            <Skills data={initialData} />
            <Experience data={initialData} />
          </>
        )}
        
        <Footer data={initialData} />
      </main>
      
      <FeedbackModal />
      <AdminLink />
    </>
  );
}
