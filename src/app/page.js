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
import WorldMapSVG from "@/components/WorldMapSVG";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── "Hello" word cloud — 70 world languages ──────────────────
// Words appear one by one on page load, then float gently.
// On first scroll they zoom out as the profile photo zooms in.
// rotate: 0grees — GSAP owns the full transform (centering + rotation + float)
const HELLO_CLOUD = [
  // ── Centre — black, upright ────────────────────────────────────────────────────
  { text: "درود", x: 50, y: 50, size: 5.6, font: "'Noto Nastaliq Urdu', sans-serif", color: "#fe0303ff", opacity: 1.00, floatAmt: 11, rotate: 0 }, // 25 Farsi
  // ── Inner ring (top 10 spoken) ────────────────────────────────────────────────
  { text: "Hello", x: 28, y: 34, size: 3.0, font: "'Arial', sans-serif", color: "#1A237E", opacity: 0.92, floatAmt: 7, rotate: 0 }, // 2  English
  { text: "नमस्ते", x: 68, y: 30, size: 2.8, font: "'Arial', sans-serif", color: "#880E4F", opacity: 0.90, floatAmt: 8, rotate: 0 }, // 3  Hindi
  { text: "سلام", x: 16, y: 75, size: 3.8, font: "'Georgia', serif", color: "#a80909ff", opacity: 1.00, floatAmt: 6, rotate: 0 }, // 1  center
  { text: "Hola", x: 63, y: 63, size: 2.7, font: "'Trebuchet MS', sans-serif", color: "#1B5E20", opacity: 0.88, floatAmt: 9, rotate: 0 }, // 4  Spanish
  { text: "Bonjour", x: 24, y: 65, size: 2.6, font: "'Palatino', serif", color: "#4A148C", opacity: 0.87, floatAmt: 8, rotate: 0 }, // 5  French
  { text: "مرحبا", x: 47, y: 78, size: 2.4, font: "'Arial', sans-serif", color: "#006064", opacity: 0.85, floatAmt: 10, rotate: 0 }, // 6  Arabic
  { text: "হ্যালো", x: 79, y: 58, size: 2.3, font: "'Arial', sans-serif", color: "#BF360C", opacity: 0.83, floatAmt: 9, rotate: 0 }, // 7  Bengali
  { text: "Olá", x: 83, y: 20, size: 2.3, font: "'Times New Roman', serif", color: "#01579B", opacity: 0.82, floatAmt: 10, rotate: 0 }, // 8  Portuguese
  { text: "Halo", x: 35, y: 20, size: 2.1, font: "'Arial', sans-serif", color: "#33691E", opacity: 0.82, floatAmt: 11, rotate: 0 }, // 9  Indonesian
  { text: "你好", x: 12, y: 50, size: 2.3, font: "'Arial', sans-serif", color: "#311B92", opacity: 0.82, floatAmt: 9, rotate: 0 }, // 10 Mandarin/Urdu
  // ── Mid ring ──────────────────────────────────────────────────────────────────
  { text: "Привет", x: 10, y: 65, size: 2.0, font: "'Georgia', serif", color: "#37474F", opacity: 0.78, floatAmt: 11, rotate: 0 }, // 11 Russian
  { text: "Hallo", x: 74, y: 75, size: 2.0, font: "'Verdana', sans-serif", color: "#6A1B9A", opacity: 0.78, floatAmt: 10, rotate: 0 }, // 12 German
  { text: "こんにちは", x: 50, y: 22, size: 1.9, font: "'Arial', sans-serif", color: "#0D47A1", opacity: 0.78, floatAmt: 11, rotate: 0 }, // 13 Japanese
  { text: "नमस्कार", x: 88, y: 40, size: 1.8, font: "'Arial', sans-serif", color: "#4E342E", opacity: 0.76, floatAmt: 10, rotate: 0 }, // 14 Marathi
  { text: "Xin chào", x: 32, y: 83, size: 1.8, font: "'Arial', sans-serif", color: "#1B4F72", opacity: 0.76, floatAmt: 12, rotate: 0 }, // 15 Vietnamese
  { text: "నమస్కారం", x: 65, y: 12, size: 1.7, font: "'Arial', sans-serif", color: "#7B0000", opacity: 0.74, floatAmt: 12, rotate: 0 }, // 16 Telugu
  { text: "Habari", x: 6, y: 22, size: 1.7, font: "'Verdana', sans-serif", color: "#1A237E", opacity: 0.72, floatAmt: 13, rotate: 0 }, // 17 Swahili
  { text: "Sannu", x: 92, y: 65, size: 1.7, font: "'Arial', sans-serif", color: "#004D40", opacity: 0.72, floatAmt: 12, rotate: 0 }, // 18 Hausa
  { text: "Merhaba", x: 58, y: 88, size: 1.7, font: "'Verdana', sans-serif", color: "#880E4F", opacity: 0.72, floatAmt: 10, rotate: 0 }, // 19 Turkish
  // ── Outer ring ────────────────────────────────────────────────────────────────
  { text: "Kamusta", x: 78, y: 88, size: 1.6, font: "'Arial', sans-serif", color: "#4A148C", opacity: 0.70, floatAmt: 13, rotate: 0 }, // 21 Tagalog
  { text: "வணக்கம்", x: 38, y: 42, size: 1.6, font: "'Arial', sans-serif", color: "#1B5E20", opacity: 0.68, floatAmt: 11, rotate: 0 }, // 22 Tamil
  { text: "你好", x: 70, y: 40, size: 1.6, font: "'Arial', sans-serif", color: "#006064", opacity: 0.68, floatAmt: 10, rotate: 0 }, // 23 Cantonese
  { text: "侬好", x: 33, y: 60, size: 1.6, font: "'Arial', sans-serif", color: "#1A237E", opacity: 0.68, floatAmt: 12, rotate: 0 }, // 24 Wu
  { text: "안녕하세요", x: 55, y: 15, size: 1.6, font: "'Arial', sans-serif", color: "#7B0000", opacity: 0.68, floatAmt: 13, rotate: 0 }, // 26 Korean
  { text: "ሰላም", x: 90, y: 78, size: 1.4, font: "'Arial', sans-serif", color: "#0D47A1", opacity: 0.65, floatAmt: 13, rotate: 0 }, // 27 Amharic
  { text: "สวัสดี", x: 46, y: 93, size: 1.4, font: "'Arial', sans-serif", color: "#4A148C", opacity: 0.65, floatAmt: 14, rotate: 0 }, // 28 Thai
  { text: "Sugeng", x: 73, y: 48, size: 1.4, font: "'Arial', sans-serif", color: "#004D40", opacity: 0.65, floatAmt: 11, rotate: 0 }, // 29 Javanese
  { text: "Ciao", x: 22, y: 56, size: 1.6, font: "'Courier New', monospace", color: "#880E4F", opacity: 0.68, floatAmt: 9, rotate: 0 }, // 30 Italian
  { text: "નમસ્તે", x: 90, y: 10, size: 1.4, font: "'Arial', sans-serif", color: "#33691E", opacity: 0.62, floatAmt: 12, rotate: 0 }, // 31 Gujarati
  { text: "ನಮಸ್ಕಾರ", x: 5, y: 33, size: 1.4, font: "'Arial', sans-serif", color: "#BF360C", opacity: 0.62, floatAmt: 12, rotate: 0 }, // 32 Kannada
  { text: "Ẹ káàárọ̀", x: 18, y: 85, size: 1.25, font: "'Arial', sans-serif", color: "#1A237E", opacity: 0.60, floatAmt: 13, rotate: 0 }, // 33 Yoruba
  { text: "प्रणाम", x: 55, y: 38, size: 1.25, font: "'Arial', sans-serif", color: "#6A1B9A", opacity: 0.60, floatAmt: 10, rotate: 0 }, // 34 Bhojpuri
  { text: "Привіт", x: 8, y: 78, size: 1.4, font: "'Georgia', serif", color: "#37474F", opacity: 0.62, floatAmt: 12, rotate: 0 }, // 35 Ukrainian
  { text: "Cześć", x: 90, y: 30, size: 1.4, font: "'Verdana', sans-serif", color: "#01579B", opacity: 0.62, floatAmt: 11, rotate: 0 }, // 36 Polish
  { text: "Helo", x: 43, y: 70, size: 1.25, font: "'Arial', sans-serif", color: "#1B5E20", opacity: 0.60, floatAmt: 13, rotate: 0 }, // 37 Malay
  { text: "Akkam", x: 80, y: 6, size: 1.25, font: "'Arial', sans-serif", color: "#311B92", opacity: 0.58, floatAmt: 14, rotate: 0 }, // 38 Oromo
  { text: "Salut", x: 20, y: 22, size: 1.25, font: "'Trebuchet MS', sans-serif", color: "#7B0000", opacity: 0.58, floatAmt: 11, rotate: 0 }, // 39 Romanian
  { text: "Salam", x: 68, y: 82, size: 1.25, font: "'Arial', sans-serif", color: "#4E342E", opacity: 0.58, floatAmt: 12, rotate: 0 }, // 40 Azerbaijani
  // ── Wide periphery ────────────────────────────────────────────────────────────
  { text: "नमस्ते", x: 40, y: 25, size: 1.25, font: "'Arial', sans-serif", color: "#0D47A1", opacity: 0.56, floatAmt: 12, rotate: 0 }, // 41 Maithili
  { text: "നമസ്കാരം", x: 90, y: 88, size: 1.0, font: "'Arial', sans-serif", color: "#004D40", opacity: 0.48, floatAmt: 14, rotate: 0 }, // 53 Malayalam
  { text: "ନମସ୍କାର", x: 42, y: 88, size: 1.0, font: "'Arial', sans-serif", color: "#0D47A1", opacity: 0.48, floatAmt: 15, rotate: 0 }, // 54 Odia
  { text: "Hallo", x: 8, y: 15, size: 1.1, font: "'Arial', sans-serif", color: "#37474F", opacity: 0.52, floatAmt: 14, rotate: 0 }, // 58 Dutch
  { text: "ආයුබෝවන්", x: 70, y: 20, size: 1.0, font: "'Arial', sans-serif", color: "#004D40", opacity: 0.50, floatAmt: 12, rotate: 0 }, // 62 Sinhala
  { text: "Silav", x: 26, y: 77, size: 1.0, font: "'Arial', sans-serif", color: "#0D47A1", opacity: 0.48, floatAmt: 14, rotate: 0 }, // 64 Kurdish
  { text: "Сәлем", x: 87, y: 72, size: 1.0, font: "'Georgia', serif", color: "#1B5E20", opacity: 0.48, floatAmt: 13, rotate: 0 }, // 65 Kazakh
  { text: "Szia", x: 62, y: 25, size: 1.0, font: "'Arial', sans-serif", color: "#37474F", opacity: 0.50, floatAmt: 12, rotate: 0 }, // 68 Hungarian
  { text: "Hej", x: 5, y: 6, size: 1.0, font: "'Arial', sans-serif", color: "#4E342E", opacity: 0.44, floatAmt: 14, rotate: 0 }, // 69 Swedish
  { text: "Բարև", x: 95, y: 6, size: 1.0, font: "'Arial', sans-serif", color: "#1A237E", opacity: 0.44, floatAmt: 13, rotate: 0 }, // 70 Armenian
];

const DEFAULT_PROFILE_IMAGE = "/images/pic6.jpeg";

const DEFAULT_CMS_DATA = {
  heroName: "Bahman Noushabadi",
  heroTagline: {
    en: "Tech Leader & Senior Developer",
    fa: "رهبر فنی و توسعه‌دهنده ارشد",
    de: "Tech Leader & Senior Entwickler",
    ms: "Pemimpin Teknologi & Pembangun Kanan"
  },
  heroHeadline: {
    en: "Bridging the gap between operational excellence and technical innovation.",
    fa: "پل زدن میان تعالی عملیاتی و نوآوری‌های فنی.",
    de: "Die Lücke zwischen operativer Exzellenz und technischer Innovation schließen.",
    ms: "Merapatkan jurang antara kecemerlangan operasi dan inovasi teknikal."
  },
  aboutText: {
    en: "<p>I am an experienced Technology Leader and Senior Frontend Engineer with a proven track record of designing scalable cloud-native architectures and leading cross-functional engineering squads.</p>",
    fa: "<p>من یک رهبر با تجربه فناوری و مهندس ارشد فرانت‌اند با سابقه اثبات‌شده در طراحی معماری‌های مقیاس‌پذیر ابری و هدایت تیم‌های مهندسی چندوظیفه‌ای هستم.</p>",
    de: "<p>Ich bin ein erfahrener Technologieführer und Senior Frontend Engineer mit einer nachgewiesenen Erfolgsbilanz bei der Entwicklung skalierbarer Cloud-native Architekturen und der Leitung funktionsübergreifender Engineering-Teams.</p>",
    ms: "<p>Saya merupakan seorang Pemimpin Teknologi dan Jurutera Kanan Frontend yang berpengalaman dengan rekod prestasi terbukti dalam merancang seni bina awan berskala besar serta memimpin pasukan kejuruteraan pelbagai fungsi.</p>"
  },
  skills: [
    { 
      title: {
        en: "Frontend Engineering",
        fa: "مهندسی فرانت‌اند",
        de: "Frontend-Engineering",
        ms: "Kejuruteraan Frontend"
      }, 
      description: {
        en: "React 19, Next.js, and robust state management.",
        fa: "ری‌اکت ۱۹، نکست‌جی‌اس و مدیریت وضعیت قدرتمند.",
        de: "React 19, Next.js und robustes Zustandsmanagement.",
        ms: "React 19, Next.js, dan pengurusan keadaan yang mantap."
      }, 
      icon: "fa-solid fa-code" 
    },
    { 
      title: {
        en: "Cloud Architecture",
        fa: "معماری ابری",
        de: "Cloud-Architektur",
        ms: "Seni Bina Awan"
      }, 
      description: {
        en: "Secure, auto-scaling cloud deployments and CI/CD.",
        fa: "استقرار ابری ایمن و خودکار در کنار پایپ‌لاین‌های CI/CD.",
        de: "Sichere, automatisch skalierende Cloud-Bereitstellungen und CI/CD.",
        ms: "Penyebaran awan yang selamat, skala automatik dan CI/CD."
      }, 
      icon: "fa-solid fa-cloud" 
    },
    { 
      title: {
        en: "Team Leadership",
        fa: "رهبری تیم",
        de: "Teamleitung",
        ms: "Kepimpinan Pasukan"
      }, 
      description: {
        en: "Agile methodologies and cross-functional execution.",
        fa: "متدولوژی‌های چابک و اجرای هماهنگ چندوظیفه‌ای.",
        de: "Agile Methoden und funktionsübergreifende Ausführung.",
        ms: "Metodologi Agile dan pelaksanaan rentas fungsi."
      }, 
      icon: "fa-solid fa-people-group" 
    },
    { 
      title: {
        en: "System Integration",
        fa: "یکپارچه‌سازی سیستم",
        de: "یکپارچه‌سازی سیستم",
        de: "Systemintegration",
        ms: "Integrasi Sistem"
      }, 
      description: {
        en: "Real-time data syncs across microservice architectures.",
        fa: "همگام‌سازی بلادرنگ داده‌ها در میان معماری‌های میکروسرویس.",
        de: "Echtzeit-Datensynchronisierung über Microservice-Architekturen hinweg.",
        ms: "Penyegerakan data masa nyata merentasi seni bina mikroperkhidmatan."
      }, 
      icon: "fa-solid fa-network-wired" 
    },
  ],
  experience: [
    {
      title: {
        en: "Senior Engineering Manager / Tech Lead",
        fa: "مدیر ارشد مهندسی / لید فنی",
        de: "Senior Engineering Manager / Tech Lead",
        ms: "Pengurus Kejuruteraan Kanan / Ketua Teknikal"
      },
      company: {
        en: "Innovate Digital Solutions",
        fa: "راهکارهای دیجیتال اینوویت",
        de: "Innovate Digital Solutions",
        ms: "Innovate Digital Solutions"
      },
      date: "2023 - Present",
      bullets: [
        {
          en: "Led teams of 12+ developers building high-scale React applications.",
          fa: "رهبری تیم‌های متشکل از بیش از ۱۲ توسعه‌دهنده در ساخت برنامه‌های بزرگ ری‌اکت.",
          de: "Leitung von Teams mit mehr als 12 Entwicklern beim Aufbau hochskalierbarer React-Anwendungen.",
          ms: "Memimpin pasukan yang terdiri daripada 12+ pembangun membina aplikasi React berskala tinggi."
        },
        {
          en: "Migrated to Next.js App Router, improving initial loads by 40%.",
          fa: "مهاجرت به Next.js App Router و بهبود بارگذاری اولیه تا ۴۰ درصد.",
          de: "Migration zum Next.js App Router, wodurch die anfänglichen Ladezeiten um 40 % verbessert wurden.",
          ms: "Berhijrah ke Next.js App Router, meningkatkan bebanan permulaan sebanyak 40%."
        },
        {
          en: "Designed real-time event logging with serverless cloud functions.",
          fa: "طراحی ثبت لاگ‌های بلادرنگ رویدادها با استفاده از توابع بدون سرور ابری.",
          de: "Entwurf einer Echtzeit-Ereignisprotokollierung mit serverlosen Cloud-Funktionen.",
          ms: "Merancang pengelogan acara masa nyata dengan fungsi awan tanpa pelayan."
        }
      ],
    },
    {
      title: {
        en: "Lead Frontend Developer",
        fa: "توسعه‌دهنده ارشد فرانت‌اند",
        de: "Lead Frontend Developer",
        ms: "Ketua Pembangun Frontend"
      },
      company: {
        en: "CoreTech Systems",
        fa: "سیستم‌های کورتک",
        de: "CoreTech Systems",
        ms: "CoreTech Systems"
      },
      date: "2020 - 2023",
      bullets: [
        {
          en: "Authored accessible UI component library under WCAG guidelines.",
          fa: "نگارش کتابخانه اختصاصی کامپوننت‌های دسترسی‌پذیر UI منطبق بر WCAG.",
          de: "Erstellung einer barrierefreien UI-Komponentenbibliothek gemäß WCAG-Richtlinien.",
          ms: "Menghasilkan perpustakaan komponen UI yang boleh diakses di bawah garis panduan WCAG."
        },
        {
          en: "Integrated analytics pipelines, reducing load failures to <0.1%.",
          fa: "یکپارچه‌سازی پایپ‌لاین‌های تحلیلی و کاهش نرخ خطاهای بارگذاری به کمتر از ۰.۱ درصد.",
          de: "Integration von Analyse-Pipelines, wodurch Ladefehler auf < 0,1 % reduziert wurden.",
          ms: "Mengintegrasikan talian paip analitis, mengurangkan kegagalan beban kepada <0.1%."
        },
        {
          en: "Streamlined onboarding by 50% with maintainable documentation.",
          fa: "ساده‌سازی و تسریع جذب نیروهای جدید تا ۵۰ درصد با مستندسازی نگهداری‌پذیر.",
          de: "Optimierung des Onboardings um 50 % durch wartbare Dokumentation.",
          ms: "Mempermudah kemasukan pekerja baru sebanyak 50% dengan dokumentasi yang boleh diselenggara."
        }
      ],
    },
  ],
  profileImage: DEFAULT_PROFILE_IMAGE,
  gallery: ["/images/pic1.jpg", "/images/pic2.jpg", "/images/pic3.jpg"],
  linkedin: "#",
  email: "bahman@example.com",
  whatsapp: "1234567890",
  cvUrl: "#",
  aboutSlides: [],
  nationality: "ir",
  overrideTheme: "dynamic",
  aboutFontFamily: "'Space Grotesk', sans-serif",
  aboutTextAlign: "justify",
  heroFontFamily: "'Space Grotesk', sans-serif",
  heroTextAlign: "center",
  skillsFontFamily: "'Outfit', sans-serif",
  skillsTextAlign: "left",
  experienceFontFamily: "'Outfit', sans-serif",
  experienceTextAlign: "left",
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

const parseLocalized = (field, defaultObj) => {
  if (!field) return defaultObj;
  if (typeof field === "string") {
    return {
      en: field,
      fa: field,
      de: field,
      ms: field
    };
  }
  return {
    en: field.en || defaultObj.en || "",
    fa: field.fa || field.en || defaultObj.fa || "",
    de: field.de || field.en || defaultObj.de || "",
    ms: field.ms || field.en || defaultObj.ms || ""
  };
};

const parseSkills = (arr, defaultSkills) => {
  if (!arr || !Array.isArray(arr)) return defaultSkills;
  return arr.map((item, idx) => {
    const defItem = defaultSkills[idx] || {};
    return {
      title: parseLocalized(item.title, defItem.title || { en: "" }),
      description: parseLocalized(item.description, defItem.description || { en: "" }),
      icon: item.icon || defItem.icon || "fa-solid fa-star"
    };
  });
};

const parseExperience = (arr, defaultExp) => {
  if (!arr || !Array.isArray(arr)) return defaultExp;
  return arr.map((item, idx) => {
    const defItem = defaultExp[idx] || {};
    return {
      title: parseLocalized(item.title, defItem.title || { en: "" }),
      company: parseLocalized(item.company, defItem.company || { en: "" }),
      date: item.date || defItem.date || "",
      bullets: Array.isArray(item.bullets)
        ? item.bullets.map(b => parseLocalized(b, { en: "" }))
        : (defItem.bullets || [])
    };
  });
};

const parseAboutSlides = (arr) => {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map(slide => ({
    image: slide.image || "",
    title: parseLocalized(slide.title, { en: "" }),
    text: parseLocalized(slide.text, { en: "" })
  }));
};

export default function Home() {
  const [data, setData] = useState(DEFAULT_CMS_DATA);
  const [isMobile, setIsMobile] = useState(false);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (locale === "fa") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "fa";
      document.body.style.fontFamily = "'Vazirmatn', 'Space Grotesk', sans-serif";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = locale;
      document.body.style.fontFamily = "";
    }
  }, [locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkMobile = () => {
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia("(pointer: coarse)").matches;
      const isSmallScreen = window.matchMedia("(max-width: 1024px)").matches;
      setIsMobile(isSmallScreen || isTouch);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Hero refs ─────────────────────────────────────────────────
  const containerRef = useRef(null);
  const pinRef = useRef(null);
  const imgRef = useRef(null);
  const textRef = useRef(null);
  const indicRef = useRef(null);
  const wordCloudRef = useRef(null);
  const worldMapRef = useRef(null);
  const heroRevealPlayed = useRef(false);
  const heroTimelineRef = useRef(null);

  // ── Skills refs ───────────────────────────────────────────────
  const skillsContainerRef = useRef(null);
  const skillsPinRef = useRef(null);
  const skillsTitleRef = useRef(null);

  // ── Experience refs ───────────────────────────────────────────
  const expWrapperRef = useRef(null);

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
          if (v.booleanValue !== undefined) return v.booleanValue;
          if (v.integerValue !== undefined) return parseInt(v.integerValue, 10);
          if (v.doubleValue !== undefined) return parseFloat(v.doubleValue);
          if (v.arrayValue) return (v.arrayValue.values || []).map(ex);
          if (v.mapValue) {
            const m = {};
            for (const k in v.mapValue.fields) m[k] = ex(v.mapValue.fields[k]);
            return m;
          }
          return null;
        };
        const parsedHeroTagline = parseLocalized(ex(f.heroTagline), DEFAULT_CMS_DATA.heroTagline);
        const parsedHeroHeadline = parseLocalized(ex(f.heroHeadline), DEFAULT_CMS_DATA.heroHeadline);
        const parsedAboutText = parseLocalized(ex(f.aboutText), DEFAULT_CMS_DATA.aboutText);
        const parsedSkills = parseSkills(ex(f.skills), DEFAULT_CMS_DATA.skills);
        const parsedExperience = parseExperience(ex(f.experience), DEFAULT_CMS_DATA.experience);
        const parsedAboutSlides = parseAboutSlides(ex(f.aboutSlides));

        setData({
          heroName: ex(f.heroName) || DEFAULT_CMS_DATA.heroName,
          heroTagline: parsedHeroTagline,
          heroHeadline: parsedHeroHeadline,
          aboutText: parsedAboutText,
          skills: parsedSkills,
          experience: parsedExperience,
          profileImage: ex(f.profileImage) || DEFAULT_CMS_DATA.profileImage,
          gallery: ex(f.gallery) || DEFAULT_CMS_DATA.gallery,
          linkedin: ex(f.linkedin) || DEFAULT_CMS_DATA.linkedin,
          email: ex(f.email) || DEFAULT_CMS_DATA.email,
          whatsapp: ex(f.whatsapp) || DEFAULT_CMS_DATA.whatsapp,
          cvUrl: ex(f.cvUrl) || DEFAULT_CMS_DATA.cvUrl,
          aboutSlides: parsedAboutSlides,
          sectionVisibility: ex(f.sectionVisibility) || {},
          themes: ex(f.themes) || {},
          nationality: ex(f.nationality) || DEFAULT_CMS_DATA.nationality,
          overrideTheme: ex(f.overrideTheme) || DEFAULT_CMS_DATA.overrideTheme,
          aboutFontFamily: ex(f.aboutFontFamily) || DEFAULT_CMS_DATA.aboutFontFamily,
          aboutTextAlign: ex(f.aboutTextAlign) || DEFAULT_CMS_DATA.aboutTextAlign,
          heroFontFamily: ex(f.heroFontFamily) || DEFAULT_CMS_DATA.heroFontFamily,
          heroTextAlign: ex(f.heroTextAlign) || DEFAULT_CMS_DATA.heroTextAlign,
          skillsFontFamily: ex(f.skillsFontFamily) || DEFAULT_CMS_DATA.skillsFontFamily,
          skillsTextAlign: ex(f.skillsTextAlign) || DEFAULT_CMS_DATA.skillsTextAlign,
          experienceFontFamily: ex(f.experienceFontFamily) || DEFAULT_CMS_DATA.experienceFontFamily,
          experienceTextAlign: ex(f.experienceTextAlign) || DEFAULT_CMS_DATA.experienceTextAlign,
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
    const worldMap = worldMapRef.current;
    if (!cloud || !worldMap) return;

    const spans = Array.from(cloud.querySelectorAll(".hello-word"));
    if (spans.length === 0) return;

    // Immediately hide all spans so they are not visible before shooting out
    gsap.set(spans, { opacity: 0 });

    // 1. Fade the map in quickly at the start so the country becomes visible first
    gsap.set(worldMap, { opacity: 0 });
    gsap.to(worldMap, {
      opacity: 1,
      duration: 1.0,
      delay: 0.1,
      ease: "power2.out",
    });

    // 2. Set the glowing border on the active country immediately so the starting point is fully visible
    const activePaths = worldMap.querySelectorAll(".active-nationality, .active-nationality path");
    if (activePaths.length > 0) {
      gsap.set(activePaths, {
        stroke: "#ffcc00",
        strokeWidth: 1.5,
        filter: "drop-shadow(0 0 8px rgba(255, 204, 0, 0.6))"
      });
    }

    // 3. Run the radiating words animation after the map is highly visible (1.0s delay)
    const timer = setTimeout(() => {
      const cloudRect = cloud.getBoundingClientRect();
      const activeEl = worldMap.querySelector(".active-nationality");

      let originPixelX = cloudRect.width / 2;
      let originPixelY = cloudRect.height / 2;

      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        originPixelX = rect.left + rect.width / 2 - cloudRect.left;
        originPixelY = rect.top + rect.height / 2 - cloudRect.top;
      }

      // Slower, majestic stagger and glide duration
      const staggerVal = 0.075; // 75ms stagger between words (graceful majestic launch)
      const durationVal = 2.4;  // 2.4s glide duration (luxurious organic flow)

      spans.forEach((span, i) => {
        const spanRect = span.getBoundingClientRect();
        // Calculate the span center relative to cloud container
        const spanCenterX = spanRect.left + spanRect.width / 2 - cloudRect.left;
        const spanCenterY = spanRect.top + spanRect.height / 2 - cloudRect.top;

        // Start coordinate offset relative to final position
        const startX = originPixelX - spanCenterX;
        const startY = originPixelY - spanCenterY;

        // Target opacity for this specific word
        const targetOpacity = HELLO_CLOUD[i]?.opacity ?? 0.8;

        // Entrance animation shooting out from the perfectly visible glowing country center
        gsap.fromTo(span,
          {
            x: startX,
            y: startY,
            scale: 0.05,
            opacity: 0,
            xPercent: -50,
            yPercent: -50,
            rotation: 0
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: targetOpacity,
            duration: durationVal,
            delay: i * staggerVal,
            ease: "power2.out", // smooth deceleration
            onComplete: () => {
              // Immediately start its gentle floating loop
              const amt = HELLO_CLOUD[i]?.floatAmt ?? 10;
              const dur = 2.5 + (i % 5) * 0.5;
              gsap.to(span, {
                y: -amt,
                duration: dur,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              });
            }
          }
        );
      });

      // 4. Once all greetings have launched, transition the country to its final flat flag gradient fill!
      const totalLaunchTime = (spans.length - 1) * staggerVal + 0.5;
      gsap.delayedCall(totalLaunchTime, () => {
        const activeElements = worldMap.querySelectorAll(".active-nationality");
        activeElements.forEach(el => {
          el.classList.add("flag-active");
        });
        gsap.set(activePaths, { clearProps: "stroke,strokeWidth,filter" });
      });

    }, 1000); // 1.0 second delay (exactly when the map is fully visible)

    return () => {
      clearTimeout(timer);
      gsap.killTweensOf(spans);
      if (worldMap) gsap.killTweensOf(worldMap);
    };
  }, [data.nationality]);

  // ── Hero Timeline (scroll-driven scrub + auto-reveal) ────────
  useEffect(() => {
    const container = containerRef.current;
    const pin = pinRef.current;
    const img = imgRef.current;
    const text = textRef.current;
    const indic = indicRef.current;
    const cloud = wordCloudRef.current;

    if (!container || !pin || !img || !text || !indic) return;

    gsap.killTweensOf([img, text, indic, cloud].filter(Boolean));
    gsap.set(img, { scale: 0, opacity: 0 });
    gsap.set(text, { opacity: 0 });
    gsap.set(indic, { opacity: 0, y: 0 });
    if (cloud) gsap.set(cloud, { scale: 1, opacity: 1 });

    const words = Array.from(text.querySelectorAll("[data-word]"));
    if (words.length > 0) {
      gsap.set(words, { opacity: 0.1, filter: "blur(8px)", y: 16 });
    }

    const playHeroReveal = () => {
      if (heroRevealPlayed.current) return;
      heroRevealPlayed.current = true;

      if (heroTimelineRef.current) {
        heroTimelineRef.current.kill();
      }

      const revealTl = gsap.timeline();
      heroTimelineRef.current = revealTl;

      revealTl.to(img, {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "back.out(1.2)"
      });

      revealTl.to(text, {
        opacity: 1,
        duration: 0.4
      }, "-=0.4");

      if (words.length > 0) {
        revealTl.to(words, {
          opacity: 1,
          filter: "none",
          y: 0,
          stagger: 0.045,
          duration: 1.2,
          ease: "power2.out"
        }, "-=0.2");
      }

      revealTl.to(indic, {
        opacity: 1,
        y: 0,
        duration: 0.5
      });
    };

    const resetHeroReveal = () => {
      if (!heroRevealPlayed.current) return;
      heroRevealPlayed.current = false;

      if (heroTimelineRef.current) {
        heroTimelineRef.current.kill();
      }

      gsap.to(img, { scale: 0, opacity: 0, duration: 0.4 });
      gsap.to(text, { opacity: 0, duration: 0.4 });
      if (words.length > 0) {
        gsap.set(words, { opacity: 0.1, filter: "blur(8px)", y: 16 });
      }
      gsap.to(indic, { opacity: 0, y: 20, duration: 0.4 });
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress >= 0.5) {
            playHeroReveal();
          } else if (self.progress < 0.1) {
            resetHeroReveal();
          }
        }
      },
    });

    // Cloud zooms out and disappears in first 50% progress
    if (cloud) {
      tl.to(cloud, {
        scale: 1.65,
        opacity: 0,
        ease: "power2.inOut",
        duration: 0.5
      }, 0);
    }

    // Dummy tween to fill out the remaining 50% of pinned space
    tl.to({}, { duration: 0.5 }, 0.5);

    ScrollTrigger.refresh();

    return () => {
      tl.scrollTrigger?.kill();
      if (heroTimelineRef.current) {
        heroTimelineRef.current.kill();
      }
      heroRevealPlayed.current = false;
      gsap.killTweensOf([img, text, indic, cloud, ...words].filter(Boolean));
    };
  }, [data]);

  // ── Skills Timeline (step-by-step card reveal) ─────────────
  useEffect(() => {
    const container = skillsContainerRef.current;
    const pin = skillsPinRef.current;
    const titleEl = skillsTitleRef.current;

    if (!container || !pin || !data.skills?.length) return;

    const cards = Array.from(pin.querySelectorAll(".skill-card"));
    if (cards.length === 0) return;

    gsap.killTweensOf([titleEl, ...cards]);
    if (titleEl) gsap.set(titleEl, { opacity: 0, y: 30 });
    gsap.set(cards, { opacity: 0, x: -70, scale: 0.88 });

    if (isMobile) {
      // Mobile / Touch screens: Stagger-fade in on first scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      if (titleEl) {
        tl.to(titleEl, { opacity: 1, y: 0, ease: "power2.out", duration: 0.6 });
      }
      tl.to(cards, {
        opacity: 1,
        x: 0,
        scale: 1,
        ease: "power3.out",
        stagger: 0.15,
        duration: 0.8,
      }, "-=0.4");

      ScrollTrigger.refresh();

      return () => {
        tl.scrollTrigger?.kill();
        if (titleEl) gsap.killTweensOf(titleEl);
        gsap.killTweensOf(cards);
      };
    } else {
      // Desktop: Pinned step-by-step card reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });

      // Step 0: Title and Card 1 fade in together (from 0.0 to 1.0)
      if (titleEl) {
        tl.to(titleEl, { opacity: 1, y: 0, ease: "power2.out", duration: 1.0 }, 0);
      }
      tl.to(cards[0], { opacity: 1, x: 0, scale: 1, ease: "power3.out", duration: 1.0 }, 0);

      // Step 1..N-1: Each subsequent card gets its own scroll step (duration 1.0 each)
      for (let i = 1; i < cards.length; i++) {
        tl.to(cards[i], {
          opacity: 1,
          x: 0,
          scale: 1,
          ease: "power3.out",
          duration: 1.0,
        }, i);
      }

      ScrollTrigger.refresh();

      return () => {
        tl.scrollTrigger?.kill();
        if (titleEl) gsap.killTweensOf(titleEl);
        gsap.killTweensOf(cards);
      };
    }
  }, [data.skills, isMobile]);

  // ── Experience Timeline (per-item reveal on scroll) ────────
  useEffect(() => {
    const expWrapper = expWrapperRef.current;
    if (!expWrapper || !data.experience?.length) return;

    const items = Array.from(expWrapper.querySelectorAll(".timeline-item"));
    if (items.length === 0) return;

    const triggers = [];

    items.forEach((item) => {
      // Set initial state immediately
      gsap.set(item, { opacity: 0, y: 50 });

      const st = ScrollTrigger.create({
        trigger: item,
        start: "top 85%",
        onEnter: () => {
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto"
          });
        },
        onLeaveBack: () => {
          gsap.to(item, {
            opacity: 0,
            y: 50,
            duration: 0.6,
            ease: "power2.in",
            overwrite: "auto"
          });
        }
      });
      triggers.push(st);
    });

    ScrollTrigger.refresh();

    return () => {
      triggers.forEach(t => t.kill());
      gsap.killTweensOf(items);
    };
  }, [data.experience]);

  const themes = data.themes || {
    theme1: { bg: "#F9F9FB", text: "#202124", textMuted: "#5f6368", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" },
    theme2: { bg: "#D4DFEB", text: "#202124", textMuted: "#5f6368", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" },
    theme3: { bg: "#2C3E50", text: "#F9F9FB", textMuted: "#B0BEC5", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" },
    theme4: { bg: "#05050A", text: "#ffffff", textMuted: "#a0a0a0", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" }
  };

  return (
    <>
      <ScrollThemeManager overrideTheme={data.overrideTheme} />
      {<ParticleBackground />}

      {/* Floating Language Switcher Dropdown */}
      {(!data.enabledLanguages || data.enabledLanguages.length > 1) && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 100,
            direction: "ltr"
          }}
        >
          <select
            value={locale}
            onChange={e => setLocale(e.target.value)}
            className="lang-switcher-select"
          >
            {(!data.enabledLanguages || data.enabledLanguages.includes("en")) && <option value="en">🇬🇧  English</option>}
            {(!data.enabledLanguages || data.enabledLanguages.includes("fa")) && <option value="fa">🇮🇷  فارسی</option>}
            {(!data.enabledLanguages || data.enabledLanguages.includes("de")) && <option value="de">🇩🇪  Deutsch</option>}
            {(!data.enabledLanguages || data.enabledLanguages.includes("ms")) && <option value="ms">🇲🇾  Melayu</option>}
          </select>
        </div>
      )}

      {/* Dynamic Theme Colors Injection */}
      <style>{`
        body.theme-1 {
          --color-bg: ${themes.theme1?.bg || "#F9F9FB"};
          --color-text: ${themes.theme1?.text || "#202124"};
          --color-text-muted: ${themes.theme1?.textMuted || "#5f6368"};
          --color-primary: ${themes.theme1?.primary || "#4285F4"};
          --color-secondary: ${themes.theme1?.secondary || "#EA4335"};
          --color-tertiary: ${themes.theme1?.tertiary || "#b100ff"};
        }
        body.theme-2 {
          --color-bg: ${themes.theme2?.bg || "#D4DFEB"};
          --color-text: ${themes.theme2?.text || "#202124"};
          --color-text-muted: ${themes.theme2?.textMuted || "#5f6368"};
          --color-primary: ${themes.theme2?.primary || "#4285F4"};
          --color-secondary: ${themes.theme2?.secondary || "#EA4335"};
          --color-tertiary: ${themes.theme2?.tertiary || "#b100ff"};
        }
        body.theme-3 {
          --color-bg: ${themes.theme3?.bg || "#2C3E50"};
          --color-text: ${themes.theme3?.text || "#F9F9FB"};
          --color-text-muted: ${themes.theme3?.textMuted || "#B0BEC5"};
          --color-primary: ${themes.theme3?.primary || "#4285F4"};
          --color-secondary: ${themes.theme3?.secondary || "#EA4335"};
          --color-tertiary: ${themes.theme3?.tertiary || "#b100ff"};
        }
        body.theme-4 {
          --color-bg: ${themes.theme4?.bg || "#05050A"};
          --color-text: ${themes.theme4?.text || "#ffffff"};
          --color-text-muted: ${themes.theme4?.textMuted || "#a0a0a0"};
          --color-primary: ${themes.theme4?.primary || "#4285F4"};
          --color-secondary: ${themes.theme4?.secondary || "#EA4335"};
          --color-tertiary: ${themes.theme4?.tertiary || "#b100ff"};
        }
      `}</style>

      {/* ── HERO SECTION ── */}
      {data.sectionVisibility?.hero !== false && (
        <section
          ref={containerRef}
          id="hero"
          className="scroll-section"
          style={{
            position: "relative",
            width: "100%",
            height: "200vh",
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
            {data.sectionVisibility?.heroWordCloud !== false && (
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
                {/* World map — fades in after last word appears, zooms out with cloud on scroll */}
                {data.sectionVisibility?.heroMap !== false && (
                  <div
                    ref={worldMapRef}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,                 // GSAP animates this 0→1 in sync with words
                      pointerEvents: "none",
                      userSelect: "none",
                      willChange: "opacity",
                    }}
                  >
                    <WorldMapSVG highlight={data.nationality || "ir"} />
                  </div>
                )}
                {HELLO_CLOUD.map((word, i) => (
                  <span
                    key={i}
                    className="hello-word"
                    style={{
                      position: "absolute",
                      left: `${word.x}%`,
                      top: `${word.y}%`,
                      // transform is fully owned by GSAP (xPercent/yPercent + rotation)
                      fontSize: `clamp(0.75rem, ${word.size}vw, ${word.size}rem)`,
                      fontFamily: word.font,
                      color: word.color,
                      whiteSpace: "nowrap",
                      userSelect: "none",
                      willChange: "transform, opacity",
                      // Removed textShadow for performance (70 spans with drop-shadow kills GPU)
                    }}
                  >
                    {word.text}
                  </span>
                ))}
              </div>
            )}

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
              <img
                src={data.profileImage}
                alt={data.heroName}
                className="profile-img"
                draggable={false}
                fetchPriority="high"
                decoding="async"
              />
              <div className="img-glow" />
            </div>

            {/* ── Text Block ── */}
            <div
              ref={textRef}
              style={{
                textAlign: data?.heroTextAlign || "center",
                fontFamily: data?.heroFontFamily || "inherit",
                maxWidth: "820px",
                padding: "0 24px",
                userSelect: "none",
                opacity: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: data?.heroTextAlign === "left" ? "flex-start" : data?.heroTextAlign === "right" ? "flex-end" : "center",
                gap: "0.3rem",
                position: "relative",
                zIndex: 2,
              }}
            >
              <span className="greeting" style={{ display: "block" }}>
                <WordSplit text={locale === "fa" ? "سلام، من" : locale === "de" ? "Hallo, ich bin" : locale === "ms" ? "Helo, saya" : "Hello, I am"} />
              </span>
              <h1 className="name"><WordSplit text={data.heroName} /></h1>
              <h3 className="tagline"><WordSplit text={data.heroTagline?.[locale] || data.heroTagline?.["en"] || ""} /></h3>
              <p className="headline"><WordSplit text={data.heroHeadline?.[locale] || data.heroHeadline?.["en"] || ""} /></p>
            </div>

            {/* ── Scroll Indicator (Hidden) ── */}
            <div
              ref={indicRef}
              style={{ display: "none" }}
            />
          </div>
        </section>
      )}

      {/* ── ABOUT ME ── */}
      {data.sectionVisibility?.about !== false && (
        <div className="content-wrapper">
          <About data={data} locale={locale} />
        </div>
      )}

      {/* ── SKILLS SECTION (pinned, step-by-step card reveal) ── */}
      {data.sectionVisibility?.skills !== false && (
        <section
          ref={skillsContainerRef}
          id="skills"
          className="scroll-section"
          style={{
            position: "relative",
            width: "100%",
            height: isMobile ? "auto" : (data.skills?.length ? `${data.skills.length * 100}vh` : "400vh"),
            padding: isMobile ? "5rem 0" : "0",
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
              position: isMobile ? "relative" : "sticky",
              top: 0,
              width: "100%",
              height: isMobile ? "auto" : "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: isMobile ? "flex-start" : "center",
              overflow: "hidden",
              padding: isMobile ? "0 1.5rem" : "0 2rem",
            }}
          >
            <h2
              ref={skillsTitleRef}
              className="section-title"
              style={{
                marginBottom: "2.5rem",
                willChange: "transform, opacity",
                fontFamily: data?.skillsFontFamily || "inherit"
              }}
            >
              {locale === "fa" ? "شایستگی‌های کلیدی" : locale === "de" ? "Kernkompetenzen" : locale === "ms" ? "Kecekapan Teras" : "Core Competencies"}
            </h2>
            {data.sectionVisibility?.skillsGrid !== false && (
              <div className="skills-grid" style={{ width: "100%", maxWidth: "1200px" }}>
                {data.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="glass-card skill-card"
                    style={{
                      willChange: "transform, opacity",
                      fontFamily: data?.skillsFontFamily || "inherit",
                      textAlign: data?.skillsTextAlign || "left"
                    }}
                  >
                    <i className={`${skill.icon || "fa-solid fa-star"} skill-icon`}></i>
                    <h3 style={{ fontFamily: data?.skillsFontFamily || "inherit" }}>{skill.title?.[locale] || skill.title?.["en"] || ""}</h3>
                    <p
                      style={{
                        fontFamily: data?.skillsFontFamily || "inherit",
                        textAlign: data?.skillsTextAlign || "left"
                      }}
                    >
                      {skill.description?.[locale] || skill.description?.["en"] || ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── DOWNSTREAM CONTENT ── */}
      <main ref={expWrapperRef} className="content-wrapper">
        {data.sectionVisibility?.experience !== false && <Experience data={data} locale={locale} />}
        <div style={{ height: "2rem" }} />
        <Footer data={data} />
      </main>

      <FeedbackModal />
      <AdminLink />
    </>
  );
}
