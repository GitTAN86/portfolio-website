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

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  const [data, setData] = useState({
    heroName: "Bahman Noushabadi",
    heroTagline: "Tech Leader & Developer",
    heroHeadline: "Bridging the Gap Between Operational Excellence and Technical Innovation.",
    aboutText: "Loading...",
    skills: [],
    experience: []
  });

  useEffect(() => {
    const fetchCMSData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "content", "main"));
        if (docSnap.exists()) {
          setData(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching CMS data:", error);
      }
    };
    
    if (db) fetchCMSData();
  }, []);

  return (
    <>
      <ScrollThemeManager />
      <ParticleBackground />
      <main className="content-wrapper">
        <Hero data={data} />
        <About data={data} />
        <Skills data={data} />
        <Experience data={data} />
        <Footer data={data} />
      </main>
      
      <FeedbackModal />
      <AdminLink />
    </>
  );
}
