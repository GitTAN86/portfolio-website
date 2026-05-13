"use client";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import FeedbackModal from "@/components/FeedbackModal";
import AdminLink from "@/components/AdminLink";
import ScrollThemeManager from "@/components/ScrollThemeManager";
import ParticleBackground from "@/components/ParticleBackground";
export default function HomeClient({ initialData }) {
  return (
    <>
      <ScrollThemeManager />
      <ParticleBackground />
      <main className="content-wrapper">
        <Hero data={initialData} />
        <About data={initialData} />
        <Skills data={initialData} />
        <Experience data={initialData} />
        <Footer data={initialData} />
      </main>
      
      <FeedbackModal />
      <AdminLink />
    </>
  );
}
