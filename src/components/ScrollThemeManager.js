"use client";
import { useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ScrollThemeManager() {
    useEffect(() => {
        // Track visit securely
        const trackVisit = async () => {
            if(!db) return;
            try {
                // To avoid multiple logs on development hot-reloads
                if (sessionStorage.getItem("visitTracked")) return;
                
                await addDoc(collection(db, "visits"), {
                    userAgent: navigator.userAgent,
                    screenWidth: window.innerWidth,
                    language: navigator.language,
                    timestamp: serverTimestamp()
                });
                sessionStorage.setItem("visitTracked", "true");
            } catch (err) {
                console.error("Visit tracking error:", err);
            }
        };
        trackVisit();

        // Theme intersection observer logic
        const observerOptions = { root: null, rootMargin: '0px 0px -100px 0px', threshold: 0 };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    const id = entry.target.id;
                    const themeMap = {
                        'hero': 'theme-1',
                        'about': 'theme-2',
                        'skills': 'theme-3',
                        'experience': 'theme-4',
                        'contact': 'theme-4'
                    };
                    const themeClass = themeMap[id] || 'theme-1';
                    document.body.className = themeClass;
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, observerOptions);

        const initObserver = () => {
            const sections = document.querySelectorAll('.scroll-section');
            if(sections.length > 0) {
                sections.forEach(sec => observer.observe(sec));
            } else {
                setTimeout(initObserver, 100);
            }
        };
        initObserver();

        // Global mouse move for flashlight pattern
        const handleBodyMouseMove = (e) => {
            document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
            document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        };
        document.addEventListener('mousemove', handleBodyMouseMove);

        return () => {
            const sections = document.querySelectorAll('.scroll-section');
            sections.forEach(sec => observer.unobserve(sec));
            document.removeEventListener('mousemove', handleBodyMouseMove);
        };
    }, []);

    return null;
}
