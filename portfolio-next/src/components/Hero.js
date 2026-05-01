"use client";
import { useEffect, useRef } from "react";

export default function Hero({ data }) {
    const tiltRef = useRef(null);

    useEffect(() => {
        const card = tiltRef.current;
        if(!card) return;
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        };
        const handleMouseLeave = () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        };
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <section id="hero" className="hero scroll-section">
            <div className="hero-content glass-card tilt-card" ref={tiltRef}>
                <div className="profile-image-wrapper">
                    <img src="/images/pic1.jpg" alt={data?.heroName || "Bahman"} className="profile-img" />
                    <div className="img-glow"></div>
                </div>
                <h2 className="greeting">Hello, I am</h2>
                <h1 className="name">{data?.heroName || "Loading..."}</h1>
                <h3 className="tagline">{data?.heroTagline || ""}</h3>
                <p className="headline">{data?.heroHeadline || ""}</p>
                
            </div>
            
            <div className="scroll-indicator">
                <p>Scroll to Explore</p>
                <i className="fa-solid fa-chevron-down"></i>
            </div>
        </section>
    );
}
