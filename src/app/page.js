"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollThemeManager from "@/components/ScrollThemeManager";
import ParticleBackground from "@/components/ParticleBackground";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import FeedbackModal from "@/components/FeedbackModal";
import AdminLink from "@/components/AdminLink";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── CONFIGURABLE PLACEHOLDERS ────────────────────────────────
// Swap DEFAULT_PROFILE_IMAGE with your real URL.
// CMS data will override these automatically once loaded.
const DEFAULT_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=600";

const DEFAULT_CMS_DATA = {
  heroName: "Bahman Noushabadi",
  heroTagline: "Tech Leader & Senior Developer",
  heroHeadline:
    "Bridging the gap between operational excellence and technical innovation.",
  aboutText:
    "<p>I am an experienced Technology Leader and Senior Frontend Engineer with a proven track record of designing scalable cloud-native architectures and leading cross-functional engineering squads.</p>",
  skills: [
    { title: "Frontend Engineering", description: "React 19, Next.js, and robust state management.", icon: "fa-solid fa-code" },
    { title: "Cloud Architecture", description: "Secure, auto-scaling cloud deployments and CI/CD.", icon: "fa-solid fa-cloud" },
    { title: "Team Leadership", description: "Agile methodologies and cross-functional execution.", icon: "fa-solid fa-people-group" },
    { title: "System Integration", description: "Real-time data syncs across microservice architectures.", icon: "fa-solid fa-network-wired" },
  ],
  experience: [
    {
      title: "Senior Engineering Manager / Tech Lead",
      company: "Innovate Digital Solutions",
      date: "2023 - Present",
      bullets: [
        "Led teams of 12+ developers building high-scale React applications.",
        "Migrated to Next.js App Router, improving initial loads by 40%.",
        "Designed real-time event logging with serverless cloud functions.",
      ],
    },
    {
      title: "Lead Frontend Developer",
      company: "CoreTech Systems",
      date: "2020 - 2023",
      bullets: [
        "Authored accessible UI component library under WCAG guidelines.",
        "Integrated analytics pipelines, reducing load failures to <0.1%.",
        "Streamlined onboarding by 50% with maintainable documentation.",
      ],
    },
  ],
  profileImage: DEFAULT_PROFILE_IMAGE,
  gallery: [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600&h=400",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600&h=400",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600&h=400",
  ],
  linkedin: "#",
  email: "bahman@example.com",
  whatsapp: "1234567890",
  cvUrl: "#",
};

// ── WordSplit: renders each word as a GSAP-targetable span ───
function WordSplit({ text }) {
  if (!text) return null;
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          data-word="true"
          style={{ display: "inline-block", marginRight: "0.25em", whiteSpace: "nowrap" }}
        >
          {word}
        </span>
      ))}
    </>
  );
}

export default function Home() {
  const [data, setData] = useState(DEFAULT_CMS_DATA);

  const containerRef = useRef(null); // tall scroll-spacer (ScrollTrigger trigger)
  const pinRef       = useRef(null); // 100vh panel that gets pinned
  const imgRef       = useRef(null); // profile image wrapper
  const textRef      = useRef(null); // text block
  const indicRef     = useRef(null); // scroll-down indicator

  // ── CMS Fetch ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          "https://firestore.googleapis.com/v1/projects/portfolio-6c69f/databases/(default)/documents/content/main"
        );
        if (!res.ok) return;
        const json = await res.json();
        const f = json.fields || {};
        const ex = (v) => {
          if (!v) return null;
          if (v.stringValue !== undefined) return v.stringValue;
          if (v.arrayValue) return (v.arrayValue.values || []).map(ex);
          if (v.mapValue) {
            const m = {};
            for (const k in v.mapValue.fields) m[k] = ex(v.mapValue.fields[k]);
            return m;
          }
          return null;
        };
        setData({
          heroName:     ex(f.heroName)     || DEFAULT_CMS_DATA.heroName,
          heroTagline:  ex(f.heroTagline)  || DEFAULT_CMS_DATA.heroTagline,
          heroHeadline: ex(f.heroHeadline) || DEFAULT_CMS_DATA.heroHeadline,
          aboutText:    ex(f.aboutText)    || DEFAULT_CMS_DATA.aboutText,
          skills:       ex(f.skills)       || DEFAULT_CMS_DATA.skills,
          experience:   ex(f.experience)   || DEFAULT_CMS_DATA.experience,
          profileImage: ex(f.profileImage) || DEFAULT_CMS_DATA.profileImage,
          gallery:      ex(f.gallery)      || DEFAULT_CMS_DATA.gallery,
          linkedin:     ex(f.linkedin)     || DEFAULT_CMS_DATA.linkedin,
          email:        ex(f.email)        || DEFAULT_CMS_DATA.email,
          whatsapp:     ex(f.whatsapp)     || DEFAULT_CMS_DATA.whatsapp,
          cvUrl:        ex(f.cvUrl)        || DEFAULT_CMS_DATA.cvUrl,
        });
      } catch (e) {
        console.warn("CMS fetch failed, using defaults:", e);
      }
    };
    load();
  }, []);

  // ── GSAP Scroll Timeline ──────────────────────────────────────
  // Using plain useEffect (not useGSAP) for maximum ScrollTrigger control.
  useEffect(() => {
    const container = containerRef.current;
    const pin       = pinRef.current;
    const img       = imgRef.current;
    const text      = textRef.current;
    const indic     = indicRef.current;

    if (!container || !pin || !img || !text || !indic) return;

    // Kill only the hero's own previous ScrollTrigger (not the section components')
    gsap.killTweensOf([img, text, indic]);

    // ── Set initial invisible states (gsap.set is synchronous & immediate) ──
    gsap.set(img,   { scale: 0, opacity: 0 });
    gsap.set(text,  { opacity: 0 });
    gsap.set(indic, { opacity: 1, y: 0 });

    const words = Array.from(text.querySelectorAll("[data-word]"));
    if (words.length > 0) {
      gsap.set(words, { opacity: 0.1, filter: "blur(8px)", y: 16 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });

    tl.to(indic, { opacity: 0, y: 20, duration: 0.4 }, 0);
    tl.to(img,   { scale: 1, opacity: 1, ease: "power3.out", duration: 1.2 }, 0);

    tl.to(text, { opacity: 1, duration: 0.4, ease: "none" }, "+=0.25");

    if (words.length > 0) {
      tl.to(words, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        stagger: { each: 0.055 },
        ease: "power2.out",
        duration: 3.5,
      }, "-=0.2");
    }

    ScrollTrigger.refresh();

    return () => {
      // Only kill the hero timeline's ScrollTrigger — section components manage their own
      tl.scrollTrigger?.kill();
      gsap.killTweensOf([img, text, indic, ...words]);
    };
  }, [data]);

  return (
    <>
      <ScrollThemeManager />
      <ParticleBackground />

      <section
        ref={containerRef}
        id="hero"
        className="scroll-section"
        style={{
          position: "relative",
          width: "100%",
          height: "250vh",
          backgroundColor: "transparent",
          opacity: 1,
          transform: "none",
          transition: "none",
        }}
      >
        {/* ── Sticky 100vh viewport: stays on screen for the full 250vh scroll ── */}
        <div
          ref={pinRef}
          style={{
            position: "sticky",
            top: 0,
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          {/* ── Profile Image ── */}
          <div
            ref={imgRef}
            className="profile-image-wrapper"
            style={{
              transformOrigin: "center center",
              marginBottom: "2rem",
              pointerEvents: "none",
              opacity: 0,
            }}
          >
            <img
              src={data.profileImage}
              alt={data.heroName}
              className="profile-img"
              draggable={false}
            />
            <div className="img-glow" />
          </div>

          {/* ── Text Block ── */}
          <div
            ref={textRef}
            style={{
              textAlign: "center",
              maxWidth: "820px",
              padding: "0 24px",
              userSelect: "none",
              opacity: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <span className="greeting" style={{ display: "block" }}>
              <WordSplit text="Hello, I am" />
            </span>
            <h1 className="name">
              <WordSplit text={data.heroName} />
            </h1>
            <h3 className="tagline">
              <WordSplit text={data.heroTagline} />
            </h3>
            <p className="headline">
              <WordSplit text={data.heroHeadline} />
            </p>
          </div>

          {/* ── Scroll Indicator ── */}
          <div
            ref={indicRef}
            className="scroll-indicator"
            style={{ pointerEvents: "none" }}
          >
            <div className="mouse" />
          </div>
        </div>
      </section>

      {/* Downstream content */}
      <main className="content-wrapper">
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
