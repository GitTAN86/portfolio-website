import { useState, useEffect, useRef } from "react";

export default function About({ data, locale }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [displayedIndex, setDisplayedIndex] = useState(0);
    const [isTransitioningText, setIsTransitioningText] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);
    const hasDragged = useRef(false);

    const rawSlides = data?.aboutSlides && data.aboutSlides.length > 0 ? data.aboutSlides : [
        {
            image: data?.gallery?.[0] || "/images/pic1.jpg",
            title: {
                en: "Technology Leadership",
                fa: "رهبری فنی و فناوری",
                de: "Technologieführung",
                ms: "Kepimpinan Teknologi"
            },
            text: data?.aboutText || {
                en: "<p>I am an experienced Technology Leader and Senior Frontend Engineer with a proven track record of designing scalable cloud-native architectures and leading cross-functional engineering squads.</p>",
                fa: "<p>من یک رهبر با تجربه فناوری و مهندس ارشد فرانت‌اند با سابقه اثبات‌شده در طراحی معماری‌های مقیاس‌پذیر ابری و هدایت تیم‌های مهندسی چندوظیفه‌ای هستم.</p>",
                de: "<p>Ich bin ein erfahrener Technologieführer und Senior Frontend Engineer mit einer nachgewiesenen Erfolgsbilanz bei der Entwicklung skalierbarer Cloud-native Architekturen und der Leitung funktionsübergreifender Engineering-Teams.</p>",
                ms: "<p>Saya merupakan seorang Pemimpin Teknologi dan Jurutera Kanan Frontend yang berpengalaman dengan rekod prestasi terbukti dalam merancang seni bina awan berskala besar serta memimpin pasukan kejuruteraan pelbagai fungsi.</p>"
            }
        },
        {
            image: data?.gallery?.[1] || "/images/pic2.jpg",
            title: {
                en: "Frontend Engineering Excellence",
                fa: "سرآمدی مهندسی فرانت‌اند",
                de: "Frontend-Engineering-Exzellenz",
                ms: "Kecemerlangan Kejuruteraan Frontend"
            },
            text: {
                en: "<p>I specialize in building high-fidelity, interactive, and beautifully animated web interfaces using modern frameworks. Performance, accessibility under WCAG guidelines, and fluid responsiveness are at the core of my development philosophy.</p>",
                fa: "<p>من در ساخت واسط‌های کاربری بسیار تعاملی، با وفاداری بالا و انیمیشن‌های زیبا با استفاده از فریم‌ورک‌های مدرن تخصص دارم. عملکرد، دسترسی‌پذیری تحت استانداردهای WCAG و پاسخ‌گویی روان در هسته فلسفه توسعه من قرار دارند.</p>",
                de: "<p>Ich bin spezialisiert auf die Erstellung hochpräziser, interaktiver und ansprechend animierter Web-Schnittstellen mit modernen Frameworks. Leistung, Barrierefreiheit nach WCAG-Richtlinien und flüssige Reaktionsfähigkeit stehen im Mittelpunkt meiner Entwicklungsphilosophie.</p>",
                ms: "<p>Saya pakar dalam membina antara muka web yang berkejituan tinggi, interaktif dan beranimasi indah menggunakan rangka kerja moden. Prestasi, kebolehcapaian di bawah garis panduan WCAG, dan tindak balas lancar adalah teras falsafah pembangunan saya.</p>"
            }
        },
        {
            image: data?.gallery?.[2] || "/images/pic3.jpg",
            title: {
                en: "Scalable Architecture & Integration",
                fa: "معماری مقیاس‌پذیر و یکپارچه‌سازی",
                de: "Skalierbare Architektur & Integration",
                ms: "Seni Bina & Integrasi Berskala"
            },
            text: {
                en: "<p>Bridging the gap between operational excellence and solid backend foundations. Designing secure, auto-scaling cloud deployments, CI/CD automated release pipelines, and robust real-time system integrations that grow with your business.</p>",
                fa: "<p>ایجاد پل میان تعالی عملیاتی و پایه‌های محکم بک‌اند. طراحی استقرارهای ابری امن با مقیاس‌پذیری خودکار، پایپ‌لاین‌های انتشار خودکار CI/CD و یکپارچه‌سازی‌های مستحکم بلادرنگ سیستم‌ها متناسب با رشد کسب‌وکار شما.</p>",
                de: "<p>Die Lücke zwischen operativer Exzellenz und soliden Backend-Fundamenten schließen. Entwurf sicherer, automatisch skalierbarer Cloud-Bereitstellungen, automatisierter CI/CD-Release-Pipelines und robuster Echtzeit-Systemintegrationen, die mit Ihrem Unternehmen wachsen.</p>",
                ms: "<p>Merapatkan jurang antara kecemerlangan operasi dan asas backend yang kukuh. Merancang penyebaran awan yang selamat dengan skala automatik, talian paip pelepasan automatik CI/CD, dan integrasi sistem masa nyata yang mantap yang berkembang bersama perniagaan anda.</p>"
            }
        }
    ];

    const slides = rawSlides.map(slide => {
        const resolve = (val) => {
            if (!val) return "";
            if (typeof val === "string") return val;
            return val[locale] || val["en"] || "";
        };
        return {
            image: slide.image,
            title: resolve(slide.title),
            text: resolve(slide.text)
        };
    });

    // Synced Text panel fade-out then fade-in transition
    useEffect(() => {
        setIsTransitioningText(true);
        const timer = setTimeout(() => {
            setDisplayedIndex(activeIndex);
            setIsTransitioningText(false);
        }, 220); // Syncs with fade-out speed

        return () => clearTimeout(timer);
    }, [activeIndex]);

    // Infinite loop coverflow positioning calculation
    const getOffset = (idx) => {
        let diff = idx - activeIndex;
        const total = slides.length;
        while (diff < -total / 2) diff += total;
        while (diff > total / 2) diff -= total;
        return diff;
    };

    // Swiping / Dragging handlers
    const handleDragStart = (clientX) => {
        setIsDragging(true);
        dragStartX.current = clientX;
        hasDragged.current = false;
    };

    const handleDragMove = (clientX) => {
        if (!isDragging) return;
        const diff = clientX - dragStartX.current;
        if (Math.abs(diff) > 10) {
            hasDragged.current = true;
        }
        if (diff > 60) {
            setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
            setIsDragging(false);
        } else if (diff < -60) {
            setActiveIndex((prev) => (prev + 1) % slides.length);
            setIsDragging(false);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const showCarousel = data?.sectionVisibility?.aboutCarousel !== false;
    const showTextPanel = data?.sectionVisibility?.aboutTextPanel !== false;

    return (
        <section id="about" className="about section-padding scroll-section">
            <h2 className="section-title">{locale === "fa" ? "درباره من" : locale === "de" ? "Über mich" : locale === "ms" ? "Tentang Saya" : "About Me"}</h2>
            <div
                className="about-grid"
                style={{
                    gridTemplateColumns: (!showCarousel || !showTextPanel) ? "1fr" : undefined
                }}
            >
                {/* ── Left Side: 3D Coverflow Carousel (Swapped & Bigger) ── */}
                {showCarousel && (
                    <div
                        className="coverflow-carousel-section"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                            overflow: "hidden",
                            order: 1
                        }}
                    >
                        <div
                            className="coverflow-container"
                            onMouseDown={(e) => handleDragStart(e.clientX)}
                            onMouseMove={(e) => handleDragMove(e.clientX)}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                            onTouchEnd={handleDragEnd}
                        >
                            {/* Left Navigation Arrow */}
                            <button 
                                className="coverflow-nav-btn prev"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                aria-label="Previous Slide"
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>

                            <div className="coverflow-track">
                                {slides.map((slide, index) => {
                                    const offset = getOffset(index);
                                    const isActive = offset === 0;
                                    const isLeft = offset === -1;
                                    const isRight = offset === 1;

                                    let slideClass = "coverflow-slide";
                                    if (isActive) slideClass += " active";
                                    else if (isLeft) slideClass += " left";
                                    else if (isRight) slideClass += " right";

                                    return (
                                        <div
                                            key={index}
                                            className={slideClass}
                                            style={{
                                                pointerEvents: "auto",
                                                cursor: isActive ? "grab" : "pointer"
                                            }}
                                            onClick={() => {
                                                if (hasDragged.current) {
                                                    hasDragged.current = false;
                                                    return;
                                                }
                                                if (!isActive) {
                                                    setActiveIndex(index);
                                                }
                                            }}
                                        >
                                            <img
                                                src={slide.image || null}
                                                alt={slide.title}
                                                draggable={false}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Navigation Arrow */}
                            <button 
                                className="coverflow-nav-btn next"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveIndex((prev) => (prev + 1) % slides.length);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                aria-label="Next Slide"
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>

                        {/* Navigation Dots */}
                        <div
                            className="coverflow-dots"
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "1.5rem"
                            }}
                        >
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    style={{
                                        width: activeIndex === index ? "24px" : "8px",
                                        height: "8px",
                                        borderRadius: "4px",
                                        backgroundColor: activeIndex === index ? "var(--color-primary)" : "var(--color-text-muted)",
                                        border: "none",
                                        outline: "none",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease"
                                    }}
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Right Side: Synced Text Panel (Swapped & Height Fixed) ── */}
                {showTextPanel && (
                    <div
                        className="about-text-container glass-card"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            order: 2
                        }}
                    >
                        <div className={`about-text-slide ${isTransitioningText ? "fade-out" : ""}`}>
                            <h3
                                style={{
                                    fontSize: "1.6rem",
                                    color: "var(--color-primary)",
                                    marginBottom: "1.2rem",
                                    fontWeight: "600"
                                }}
                            >
                                {slides[displayedIndex]?.title || ""}
                            </h3>
                            <div
                                className="about-paragraph"
                                style={{
                                    textAlign: data?.aboutTextAlign || "justify",
                                    fontFamily: data?.aboutFontFamily || "inherit"
                                }}
                                dangerouslySetInnerHTML={{ __html: slides[displayedIndex]?.text || "" }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
