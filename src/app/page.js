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

// ── "Hello" word cloud — 70 world languages ──────────────────
// Words appear one by one on page load, then float gently.
// On first scroll they zoom out as the profile photo zooms in.
const HELLO_CLOUD = [
  // ── Centre ────────────────────────────────────────────────────
  { text: "سلام",        x: 50, y: 50, size: 3.6, font: "'Georgia', serif",           color: "#070606ff", opacity: 1.00, floatAmt: 6  }, // 1 English
  // ── Inner ring (top 10 spoken) ────────────────────────────────
  { text: "Hello",          x: 28, y: 34, size: 2.4, font: "'Arial', sans-serif",        color: "#00E5FF", opacity: 0.92, floatAmt: 7  }, // 2 Mandarin
  { text: "नमस्ते",       x: 68, y: 30, size: 2.2, font: "'Arial', sans-serif",        color: "#FFD700", opacity: 0.90, floatAmt: 8  }, // 3 Hindi
  { text: "Hola",         x: 63, y: 63, size: 2.1, font: "'Trebuchet MS', sans-serif", color: "#FF6B9D", opacity: 0.88, floatAmt: 9  }, // 4 Spanish
  { text: "Bonjour",      x: 24, y: 65, size: 2.0, font: "'Palatino', serif",          color: "#C084FC", opacity: 0.87, floatAmt: 8  }, // 5 French
  { text: "مرحبا",        x: 47, y: 78, size: 1.9, font: "'Arial', sans-serif",        color: "#34D399", opacity: 0.85, floatAmt: 10 }, // 6 Arabic
  { text: "হ্যালো",       x: 79, y: 58, size: 1.8, font: "'Arial', sans-serif",        color: "#FB923C", opacity: 0.83, floatAmt: 9  }, // 7 Bengali
  { text: "Olá",          x: 83, y: 20, size: 1.8, font: "'Times New Roman', serif",   color: "#FDE68A", opacity: 0.82, floatAmt: 10 }, // 8 Portuguese
  { text: "Halo",         x: 35, y: 20, size: 1.7, font: "'Arial', sans-serif",        color: "#67E8F9", opacity: 0.82, floatAmt: 11 }, // 9 Indonesian
  { text: "你好",         x: 12, y: 50, size: 1.8, font: "'Arial', sans-serif",        color: "#F9A8D4", opacity: 0.82, floatAmt: 9  }, // 10 Urdu
  // ── Mid ring ──────────────────────────────────────────────────
  { text: "Привет",       x: 10, y: 65, size: 1.6, font: "'Georgia', serif",           color: "#FDA4AF", opacity: 0.78, floatAmt: 11 }, // 11 Russian
  { text: "Hallo",        x: 74, y: 75, size: 1.6, font: "'Verdana', sans-serif",      color: "#D8B4FE", opacity: 0.78, floatAmt: 10 }, // 12 German
  { text: "こんにちは",   x: 50, y: 22, size: 1.5, font: "'Arial', sans-serif",        color: "#6EE7B7", opacity: 0.78, floatAmt: 11 }, // 13 Japanese
  { text: "नमस्कार",      x: 88, y: 40, size: 1.4, font: "'Arial', sans-serif",        color: "#7DD3FC", opacity: 0.76, floatAmt: 10 }, // 14 Marathi
  { text: "Xin chào",     x: 32, y: 83, size: 1.4, font: "'Arial', sans-serif",        color: "#86EFAC", opacity: 0.76, floatAmt: 12 }, // 15 Vietnamese
  { text: "నమస్కారం",    x: 65, y: 12, size: 1.3, font: "'Arial', sans-serif",        color: "#FCA5A5", opacity: 0.74, floatAmt: 12 }, // 16 Telugu
  { text: "Habari",       x: 6,  y: 22, size: 1.3, font: "'Verdana', sans-serif",      color: "#5EEAD4", opacity: 0.72, floatAmt: 13 }, // 17 Swahili
  { text: "Sannu",        x: 92, y: 65, size: 1.3, font: "'Arial', sans-serif",        color: "#FDBA74", opacity: 0.72, floatAmt: 12 }, // 18 Hausa
  { text: "Merhaba",      x: 58, y: 88, size: 1.3, font: "'Verdana', sans-serif",      color: "#A3E635", opacity: 0.72, floatAmt: 10 }, // 19 Turkish
  { text: "سلام",         x: 18, y: 38, size: 1.3, font: "'Arial', sans-serif",        color: "#38BDF8", opacity: 0.70, floatAmt: 11 }, // 20 W. Punjabi
  // ── Outer ring ────────────────────────────────────────────────
  { text: "Kamusta",      x: 78, y: 88, size: 1.2, font: "'Arial', sans-serif",        color: "#A78BFA", opacity: 0.70, floatAmt: 13 }, // 21 Tagalog
  { text: "வணக்கம்",     x: 38, y: 42, size: 1.2, font: "'Arial', sans-serif",        color: "#F472B6", opacity: 0.68, floatAmt: 11 }, // 22 Tamil
  { text: "你好",          x: 60, y: 40, size: 1.2, font: "'Arial', sans-serif",        color: "#4ADE80", opacity: 0.68, floatAmt: 10 }, // 23 Cantonese
  { text: "侬好",          x: 33, y: 60, size: 1.2, font: "'Arial', sans-serif",        color: "#FCD34D", opacity: 0.68, floatAmt: 12 }, // 24 Wu/Shanghainese
  { text: "درود",         x: 16, y: 75, size: 1.2, font: "'Arial', sans-serif",        color: "#E879F9", opacity: 0.68, floatAmt: 11 }, // 25 Farsi
  { text: "안녕하세요",   x: 55, y: 15, size: 1.2, font: "'Arial', sans-serif",        color: "#F87171", opacity: 0.68, floatAmt: 13 }, // 26 Korean
  { text: "ሰላም",          x: 90, y: 78, size: 1.1, font: "'Arial', sans-serif",        color: "#86EFAC", opacity: 0.65, floatAmt: 13 }, // 27 Amharic
  { text: "สวัสดี",       x: 46, y: 93, size: 1.1, font: "'Arial', sans-serif",        color: "#BAE6FD", opacity: 0.65, floatAmt: 14 }, // 28 Thai
  { text: "Sugeng",       x: 73, y: 48, size: 1.1, font: "'Arial', sans-serif",        color: "#DDD6FE", opacity: 0.65, floatAmt: 11 }, // 29 Javanese
  { text: "Ciao",         x: 22, y: 56, size: 1.2, font: "'Courier New', monospace",   color: "#FDBA74", opacity: 0.68, floatAmt: 9  }, // 30 Italian
  { text: "નમસ્તે",       x: 90, y: 10, size: 1.1, font: "'Arial', sans-serif",        color: "#FDE68A", opacity: 0.62, floatAmt: 12 }, // 31 Gujarati
  { text: "ನಮಸ್ಕಾರ",     x: 5,  y: 33, size: 1.1, font: "'Arial', sans-serif",        color: "#67E8F9", opacity: 0.62, floatAmt: 12 }, // 32 Kannada
  { text: "Ẹ káàárọ̀",   x: 18, y: 85, size: 1.0, font: "'Arial', sans-serif",        color: "#A3E635", opacity: 0.60, floatAmt: 13 }, // 33 Yoruba
  { text: "प्रणाम",       x: 55, y: 38, size: 1.0, font: "'Arial', sans-serif",        color: "#C084FC", opacity: 0.60, floatAmt: 10 }, // 34 Bhojpuri
  { text: "Привіт",       x: 8,  y: 78, size: 1.1, font: "'Georgia', serif",           color: "#FB923C", opacity: 0.62, floatAmt: 12 }, // 35 Ukrainian
  { text: "Cześć",        x: 90, y: 30, size: 1.1, font: "'Verdana', sans-serif",      color: "#7DD3FC", opacity: 0.62, floatAmt: 11 }, // 36 Polish
  { text: "Helo",         x: 43, y: 70, size: 1.0, font: "'Arial', sans-serif",        color: "#86EFAC", opacity: 0.60, floatAmt: 13 }, // 37 Malay
  { text: "Akkam",        x: 80, y: 6,  size: 1.0, font: "'Arial', sans-serif",        color: "#F9A8D4", opacity: 0.58, floatAmt: 14 }, // 38 Oromo
  { text: "Salut",        x: 20, y: 22, size: 1.0, font: "'Trebuchet MS', sans-serif", color: "#5EEAD4", opacity: 0.58, floatAmt: 11 }, // 39 Romanian
  { text: "Salam",        x: 68, y: 82, size: 1.0, font: "'Arial', sans-serif",        color: "#FCA5A5", opacity: 0.58, floatAmt: 12 }, // 40 Azerbaijani
  // ── Wide periphery ────────────────────────────────────────────
  { text: "नमस्ते",       x: 40, y: 25, size: 1.0, font: "'Arial', sans-serif",        color: "#6EE7B7", opacity: 0.56, floatAmt: 12 }, // 41 Maithili
  { text: "မင်္ဂလာပါ",   x: 92, y: 48, size: 1.0, font: "'Arial', sans-serif",        color: "#D8B4FE", opacity: 0.58, floatAmt: 13 }, // 42 Burmese
  { text: "ਸਤ ਸ੍ਰੀ",     x: 6,  y: 8,  size: 1.0, font: "'Arial', sans-serif",        color: "#FDE68A", opacity: 0.52, floatAmt: 15 }, // 43 E. Punjabi
  { text: "नमस्ते",       x: 62, y: 55, size: 1.0, font: "'Arial', sans-serif",        color: "#38BDF8", opacity: 0.56, floatAmt: 10 }, // 44 Awadhi
  { text: "Salom",        x: 47, y: 10, size: 1.0, font: "'Arial', sans-serif",        color: "#FDA4AF", opacity: 0.55, floatAmt: 14 }, // 45 Uzbek
  { text: "Manahoana",    x: 25, y: 92, size: 0.95,font: "'Arial', sans-serif",        color: "#A78BFA", opacity: 0.50, floatAmt: 15 }, // 46 Malagasy
  { text: "Wilujeng",     x: 76, y: 63, size: 0.95,font: "'Arial', sans-serif",        color: "#4ADE80", opacity: 0.52, floatAmt: 12 }, // 47 Sundanese
  { text: "你好",          x: 32, y: 47, size: 0.95,font: "'Arial', sans-serif",        color: "#FCD34D", opacity: 0.52, floatAmt: 11 }, // 48 Xiang
  { text: "你好",          x: 85, y: 50, size: 0.9, font: "'Arial', sans-serif",        color: "#F472B6", opacity: 0.50, floatAmt: 13 }, // 49 Gan
  { text: "哩好",          x: 67, y: 70, size: 0.95,font: "'Arial', sans-serif",        color: "#5EEAD4", opacity: 0.52, floatAmt: 12 }, // 50 Min Nan
  { text: "你好",          x: 15, y: 58, size: 0.9, font: "'Arial', sans-serif",        color: "#FBBF24", opacity: 0.50, floatAmt: 13 }, // 51 Hakka
  { text: "سلام",         x: 6,  y: 92, size: 0.9, font: "'Arial', sans-serif",        color: "#FB7185", opacity: 0.48, floatAmt: 15 }, // 52 Pashto
  { text: "നമസ്കാരം",    x: 90, y: 88, size: 0.9, font: "'Arial', sans-serif",        color: "#86EFAC", opacity: 0.48, floatAmt: 14 }, // 53 Malayalam
  { text: "ନମସ୍କାର",     x: 42, y: 88, size: 0.9, font: "'Arial', sans-serif",        color: "#7DD3FC", opacity: 0.48, floatAmt: 15 }, // 54 Odia
  { text: "Zdravo",       x: 22, y: 46, size: 0.95,font: "'Verdana', sans-serif",      color: "#E879F9", opacity: 0.52, floatAmt: 12 }, // 55 Serbo-Croatian
  { text: "Nabad",        x: 78, y: 38, size: 0.9, font: "'Arial', sans-serif",        color: "#FCA5A5", opacity: 0.50, floatAmt: 13 }, // 56 Somali
  { text: "Nnọọ",         x: 36, y: 70, size: 0.9, font: "'Arial', sans-serif",        color: "#BAE6FD", opacity: 0.50, floatAmt: 13 }, // 57 Igbo
  { text: "Hallo",        x: 8,  y: 15, size: 0.95,font: "'Arial', sans-serif",        color: "#C7D2FE", opacity: 0.52, floatAmt: 14 }, // 58 Dutch
  { text: "سلام",         x: 95, y: 18, size: 0.9, font: "'Arial', sans-serif",        color: "#FDE68A", opacity: 0.48, floatAmt: 14 }, // 59 Sindhi
  { text: "Salaam",       x: 96, y: 56, size: 0.9, font: "'Arial', sans-serif",        color: "#6EE7B7", opacity: 0.46, floatAmt: 14 }, // 60 Fula
  { text: "जय जोहार",    x: 56, y: 70, size: 0.9, font: "'Arial', sans-serif",        color: "#D8B4FE", opacity: 0.48, floatAmt: 13 }, // 61 Chhattisgarhi
  { text: "ආයුබෝවන්",    x: 70, y: 20, size: 0.9, font: "'Arial', sans-serif",        color: "#67E8F9", opacity: 0.50, floatAmt: 12 }, // 62 Sinhala
  { text: "নমস্কাৰ",     x: 50, y: 65, size: 0.9, font: "'Arial', sans-serif",        color: "#FB923C", opacity: 0.48, floatAmt: 12 }, // 63 Assamese
  { text: "Silav",        x: 26, y: 77, size: 0.9, font: "'Arial', sans-serif",        color: "#F9A8D4", opacity: 0.48, floatAmt: 14 }, // 64 Kurdish
  { text: "Сәлем",        x: 87, y: 72, size: 0.9, font: "'Georgia', serif",           color: "#A3E635", opacity: 0.48, floatAmt: 13 }, // 65 Kazakh
  { text: "Ahoj",         x: 32, y: 12, size: 0.9, font: "'Verdana', sans-serif",      color: "#5EEAD4", opacity: 0.48, floatAmt: 14 }, // 66 Czech
  { text: "Γεια σας",    x: 14, y: 42, size: 0.95,font: "'Times New Roman', serif",   color: "#E879F9", opacity: 0.52, floatAmt: 11 }, // 67 Greek
  { text: "Szia",         x: 62, y: 25, size: 0.9, font: "'Arial', sans-serif",        color: "#FCA5A5", opacity: 0.50, floatAmt: 12 }, // 68 Hungarian
  { text: "Hej",          x: 5,  y: 6,  size: 0.9, font: "'Arial', sans-serif",        color: "#84FFFF", opacity: 0.44, floatAmt: 14 }, // 69 Swedish
  { text: "Բարև",         x: 95, y: 6,  size: 0.9, font: "'Arial', sans-serif",        color: "#FFCC80", opacity: 0.44, floatAmt: 13 }, // 70 Armenian
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
      duration: 2.65,
      stagger: 0.35,          // one new word every 0.35 s
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
