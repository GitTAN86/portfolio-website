"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollThemeManager from "@/components/ScrollThemeManager";
import ParticleBackground from "@/components/ParticleBackground";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import FeedbackModal from "@/components/FeedbackModal";
import AdminLink from "@/components/AdminLink";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── "Hello" word cloud ────────────────────────────────────────
// Words appear one by one every 0.25 s on page load, then float gently.
// On first scroll they zoom out together as the profile photo zooms in.
const HELLO_CLOUD = [
  // Center – biggest, white
  { text: "سلام",      x: 50, y: 50, size: 4.6, font: "'Georgia', serif",          color: "#040101f1", opacity: 1.00, floatAmt: 15  },
  // Inner ring – vibrant accent colours
  { text: "Hello",       x: 30, y: 36, size: 4.1, font: "'Arial', sans-serif",        color: "#00ff04ff", opacity: 0.90, floatAmt: 8  },
  { text: "你好",        x: 72, y: 33, size: 3.4, font: "'Arial', sans-serif",        color: "#00E5FF", opacity: 0.90, floatAmt: 7  },
  { text: "Hola",       x: 67, y: 65, size: 3.0, font: "'Trebuchet MS', sans-serif", color: "#FF6B9D", opacity: 0.88, floatAmt: 9  },
  { text: "Bonjour",    x: 27, y: 66, size: 2.9, font: "'Palatino', serif",          color: "#C084FC", opacity: 0.85, floatAmt: 8  },
  { text: "مرحبا",      x: 50, y: 78, size: 2.8, font: "'Arial', sans-serif",        color: "#34D399", opacity: 0.82, floatAmt: 10 },
  // Outer ring – lighter pastels
  { text: "नमस्ते",     x: 14, y: 23, size: 2.5, font: "'Arial', sans-serif",        color: "#FB923C", opacity: 0.75, floatAmt: 12 },
  { text: "こんにちは",  x: 84, y: 49, size: 2.4, font: "'Arial', sans-serif",        color: "#67E8F9", opacity: 0.72, floatAmt: 11 },
  { text: "Ciao",       x: 18, y: 80, size: 2.6, font: "'Courier New', monospace",   color: "#FCD34D", opacity: 0.75, floatAmt: 9  },
  { text: "Hallo",      x: 80, y: 80, size: 2.5, font: "'Verdana', sans-serif",      color: "#D8B4FE", opacity: 0.72, floatAmt: 10 },
  { text: "안녕하세요",  x: 50, y: 12, size: 2.3, font: "'Arial', sans-serif",        color: "#6EE7B7", opacity: 0.70, floatAmt: 13 },
  { text: "Привет",     x: 9,  y: 55, size: 2.5, font: "'Georgia', serif",           color: "#FDA4AF", opacity: 0.72, floatAmt: 11 },
  { text: "Olá",        x: 86, y: 18, size: 2.4, font: "'Times New Roman', serif",   color: "#463a08ff", opacity: 0.70, floatAmt: 10 },
  { text: "שלום",       x: 35, y: 88, size: 2.5, font: "'Arial', sans-serif",        color: "#7DD3FC", opacity: 0.70, floatAmt: 12 },
  { text: "Γεια",       x: 13, y: 43, size: 2.4, font: "'Times New Roman', serif",   color: "#E879F9", opacity: 0.68, floatAmt: 11 },
  { text: "Merhaba",    x: 64, y: 88, size: 2.3, font: "'Verdana', sans-serif",      color: "#A3E635", opacity: 0.68, floatAmt: 10 },
  // Far edges – subtle
  { text: "Hej",        x: 5,  y: 8,  size: 1.1, font: "'Arial', sans-serif",        color: "#5EEAD4", opacity: 0.50, floatAmt: 14 },
  { text: "Aloha",      x: 93, y: 7,  size: 1.2, font: "'Georgia', serif",           color: "#FDBA74", opacity: 0.48, floatAmt: 13 },
  { text: "Salut",      x: 5,  y: 92, size: 1.1, font: "'Trebuchet MS', sans-serif", color: "#44a4d7ff", opacity: 0.45, floatAmt: 15 },
  { text: "Ahoj",       x: 91, y: 92, size: 1.1, font: "'Verdana', sans-serif",      color: "#4363e2ff", opacity: 0.45, floatAmt: 14 },
];

const DEFAULT_PROFILE_IMAGE = "/images/bahman.jpg";

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
  gallery: ["/images/pic1.jpg", "/images/pic2.jpg", "/images/pic3.jpg"],
  linkedin: "#",
  email: "bahman@example.com",
  whatsapp: "1234567890",
  cvUrl: "#",
};

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

  // ── Hero refs ─────────────────────────────────────────────────
  const containerRef = useRef(null);
  const pinRef       = useRef(null);
  const imgRef       = useRef(null);
  const textRef      = useRef(null);
  const indicRef     = useRef(null);
  const wordCloudRef = useRef(null);

  // ── Skills refs ───────────────────────────────────────────────
  const skillsContainerRef = useRef(null);
  const skillsPinRef       = useRef(null);
  const skillsTitleRef     = useRef(null);

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

  // ── Word Cloud: auto appear + float (time-based, not scroll-driven) ──
  useEffect(() => {
    const cloud = wordCloudRef.current;
    if (!cloud) return;

    const spans = Array.from(cloud.querySelectorAll(".hello-word"));
    if (spans.length === 0) return;

    // 1. All words start invisible, slightly blurred and scaled down
    gsap.set(spans, { opacity: 0, scale: 0.5, filter: "blur(6px)", y: 15 });

    // 2. Each word pops in every 0.25 s with a spring entrance
    //    Use function-based opacity so each word lands at its own target opacity
    gsap.to(spans, {
      opacity: (i) => HELLO_CLOUD[i].opacity,
      scale: 1,
      filter: "blur(0px)",
      y: 0,
      duration: 0.65,
      stagger: 0.25,          // one new word every 0.25 s
      ease: "back.out(1.4)",
    });

    // 3. After all words are visible, each bobs gently at its own pace
    const allVisibleAt = (spans.length - 1) * 0.25 + 0.65;
    spans.forEach((span, i) => {
      const amt   = HELLO_CLOUD[i]?.floatAmt ?? 10;
      const dur   = 2.0 + (i % 5) * 0.45;
      const delay = allVisibleAt + (i % 7) * 0.38;
      gsap.to(span, {
        y: -amt,
        duration: dur,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay,
      });
    });

    return () => gsap.killTweensOf(spans);
  }, []);

  // ── Hero Timeline (scroll-driven scrub) ──────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const pin       = pinRef.current;
    const img       = imgRef.current;
    const text      = textRef.current;
    const indic     = indicRef.current;
    const cloud     = wordCloudRef.current;

    if (!container || !pin || !img || !text || !indic) return;

    gsap.killTweensOf([img, text, indic, cloud].filter(Boolean));
    gsap.set(img,   { scale: 0, opacity: 0 });
    gsap.set(text,  { opacity: 0 });
    gsap.set(indic, { opacity: 0, y: 0 });
    // Cloud container stays visible (spans control their own opacity via cloud useEffect)
    if (cloud) gsap.set(cloud, { scale: 1, opacity: 1 });

    const words = Array.from(text.querySelectorAll("[data-word]"));
    if (words.length > 0) {
      gsap.set(words, { opacity: 0.1, filter: "blur(8px)", y: 16 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 2.2,
        invalidateOnRefresh: true,
      },
    });

    // ── Stage 1: Cloud zooms out & disappears (pos 0 → 0.8) ──────
    if (cloud) {
      tl.to(cloud, { scale: 1.65, opacity: 0, ease: "power2.in", duration: 1 }, 0);
    }

    // ── Gap of 1.5 scroll-units (cloud finishes at 0.8, image starts at 2.3) ──
    // This creates the "1.5 second feel" of empty space before the photo arrives.

    // ── Stage 2: Profile photo + indicator fade in (pos 2.3) ────
    tl.to(img,   { scale: 1, opacity: 1, ease: "power3.out", duration: 1.2 }, 1.5);
    tl.to(indic, { opacity: 1, duration: 0.3 }, 2.4);

    // ── Stage 3: Indicator fades, text + words reveal (pos ~3.8) ─
    tl.to(indic, { opacity: 0, y: 20, duration: 0.3 }, 3.6);
    tl.to(text,  { opacity: 1, duration: 0.4, ease: "none" }, 3.8);

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
      tl.scrollTrigger?.kill();
      gsap.killTweensOf([img, text, indic, cloud, ...words].filter(Boolean));
    };
  }, [data]);

  // ── Skills Timeline (left-to-right card reveal) ─────────────
  useEffect(() => {
    const container = skillsContainerRef.current;
    const pin       = skillsPinRef.current;
    const titleEl   = skillsTitleRef.current;

    if (!container || !pin || !data.skills?.length) return;

    const cards = Array.from(pin.querySelectorAll(".skill-card"));
    if (cards.length === 0) return;

    gsap.killTweensOf([titleEl, ...cards]);
    if (titleEl) gsap.set(titleEl, { opacity: 0, y: 30 });
    gsap.set(cards, { opacity: 0, x: -70, scale: 0.88 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });

    if (titleEl) {
      tl.to(titleEl, { opacity: 1, y: 0, ease: "power2.out", duration: 0.6 }, 0);
    }
    cards.forEach((card, i) => {
      tl.to(card, {
        opacity: 1, x: 0, scale: 1,
        ease: "power3.out",
        duration: 1.2,
      }, 0.4 + i * 0.9);
    });
    tl.to({}, { duration: 1.5 });

    ScrollTrigger.refresh();

    return () => {
      tl.scrollTrigger?.kill();
      if (titleEl) gsap.killTweensOf(titleEl);
      gsap.killTweensOf(cards);
    };
  }, [data.skills]);

  return (
    <>
      <ScrollThemeManager />
      { <ParticleBackground /> }

      {/* ── HERO SECTION ── */}
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
            overflow: "hidden",
          }}
        >
          {/* ── Hello Word Cloud ── */}
          <div
            ref={wordCloudRef}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              willChange: "transform, opacity",
              transformOrigin: "center center",
              zIndex: 1,
            }}
          >
            {HELLO_CLOUD.map((word, i) => (
              <span
                key={i}
                className="hello-word"
                style={{
                  position: "absolute",
                  left: `${word.x}%`,
                  top: `${word.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: `clamp(0.75rem, ${word.size}vw, ${word.size}rem)`,
                  fontFamily: word.font,
                  color: word.color,
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  willChange: "transform, opacity, filter",
                  // soft drop shadow matching word colour for depth
                  textShadow: `0 2px 12px ${word.color}55`,
                }}
              >
                {word.text}
              </span>
            ))}
          </div>

          {/* ── Profile Image ── */}
          <div
            ref={imgRef}
            className="profile-image-wrapper"
            style={{
              transformOrigin: "center center",
              marginBottom: "2rem",
              pointerEvents: "none",
              opacity: 0,
              position: "relative",
              zIndex: 2,
            }}
          >
            <img src={data.profileImage} alt={data.heroName} className="profile-img" draggable={false} />
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
              position: "relative",
              zIndex: 2,
            }}
          >
            <span className="greeting" style={{ display: "block" }}>
              <WordSplit text="Hello, I am" />
            </span>
            <h1 className="name"><WordSplit text={data.heroName} /></h1>
            <h3 className="tagline"><WordSplit text={data.heroTagline} /></h3>
            <p className="headline"><WordSplit text={data.heroHeadline} /></p>
          </div>

          {/* ── Scroll Indicator ── */}
          <div
            ref={indicRef}
            className="scroll-indicator"
            style={{ pointerEvents: "none", position: "relative", zIndex: 2 }}
          >
            <div className="mouse" />
          </div>
        </div>
      </section>

      {/* ── ABOUT ME ── */}
      <div className="content-wrapper">
        <About data={data} />
      </div>

      {/* ── SKILLS SECTION (pinned, left-to-right card reveal) ── */}
      <section
        ref={skillsContainerRef}
        id="skills"
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
        <div
          ref={skillsPinRef}
          className="skills-pin"
          style={{
            position: "sticky",
            top: 0,
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "0 2rem",
          }}
        >
          <h2
            ref={skillsTitleRef}
            className="section-title"
            style={{ marginBottom: "2.5rem", willChange: "transform, opacity" }}
          >
            Core Competencies
          </h2>
          <div className="skills-grid" style={{ width: "100%", maxWidth: "1200px" }}>
            {data.skills.map((skill, index) => (
              <div key={index} className="glass-card skill-card" style={{ willChange: "transform, opacity" }}>
                <i className={`${skill.icon || "fa-solid fa-star"} skill-icon`}></i>
                <h3>{skill.title}</h3>
                <p>{skill.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOWNSTREAM CONTENT ── */}
      <main className="content-wrapper">
        <Experience data={data} />
        <Footer data={data} />
      </main>

      <FeedbackModal />
      <AdminLink />
    </>
  );
}
