import { useState, useEffect, useRef } from "react";

export default function About({ data }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [displayedIndex, setDisplayedIndex] = useState(0);
    const [isTransitioningText, setIsTransitioningText] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);

    const slides = data?.aboutSlides && data.aboutSlides.length > 0 ? data.aboutSlides : [
        {
            image: data?.gallery?.[0] || "/images/pic1.jpg",
            title: "Technology Leadership",
            text: data?.aboutText || "<p>I am an experienced Technology Leader and Senior Frontend Engineer with a proven track record of designing scalable cloud-native architectures and leading cross-functional engineering squads.</p>"
        },
        {
            image: data?.gallery?.[1] || "/images/pic2.jpg",
            title: "Frontend Engineering Excellence",
            text: "<p>I specialize in building high-fidelity, interactive, and beautifully animated web interfaces using modern frameworks. Performance, accessibility under WCAG guidelines, and fluid responsiveness are at the core of my development philosophy.</p>"
        },
        {
            image: data?.gallery?.[2] || "/images/pic3.jpg",
            title: "Scalable Architecture & Integration",
            text: "<p>Bridging the gap between operational excellence and solid backend foundations. Designing secure, auto-scaling cloud deployments, CI/CD automated release pipelines, and robust real-time system integrations that grow with your business.</p>"
        }
    ];

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
    };

    const handleDragMove = (clientX) => {
        if (!isDragging) return;
        const diff = clientX - dragStartX.current;
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
            <h2 className="section-title">About Me</h2>
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
                                                pointerEvents: isActive ? "auto" : "none",
                                                cursor: isActive ? "grab" : "pointer"
                                            }}
                                            onClick={() => {
                                                if (!isActive) {
                                                    setActiveIndex(index);
                                                }
                                            }}
                                        >
                                            <img 
                                                src={slide.image} 
                                                alt={slide.title} 
                                                draggable={false} 
                                            />
                                        </div>
                                    );
                                })}
                            </div>
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
                                style={{ textAlign: "justify" }}
                                dangerouslySetInnerHTML={{ __html: slides[displayedIndex]?.text || "" }} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
