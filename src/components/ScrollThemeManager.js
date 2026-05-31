"use client";
import { useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ScrollThemeManager({ overrideTheme }) {
    useEffect(() => {
        // Track visit securely
        const trackVisit = async () => {
            if(!db) return;
            try {
                // To avoid multiple logs on development hot-reloads
                if (sessionStorage.getItem("visitTracked")) return;
                
                let geoData = {};
                // Try Primary Geo Service (ip-api.com)
                try {
                    const response = await fetch('http://ip-api.com/json/');
                    const data = await response.json();
                    if (data && data.status === 'success') {
                        geoData = {
                            ip: data.query,
                            city: data.city,
                            region: data.regionName,
                            country_name: data.country
                        };
                    } else {
                        // Try Secondary (ipapi.co)
                        const response2 = await fetch('https://ipapi.co/json/');
                        geoData = await response2.json();
                    }
                } catch (e) {
                    console.warn("Primary geo fetch failed, trying backup...", e);
                    try {
                        const responseBackup = await fetch('https://ipapi.co/json/');
                        geoData = await responseBackup.json();
                    } catch (e2) {
                        console.error("All geo services failed", e2);
                    }
                }

                await addDoc(collection(db, "visits"), {
                    userAgent: navigator.userAgent,
                    screenWidth: window.innerWidth,
                    language: navigator.language,
                    ip: geoData.ip || 'Hidden/VPN',
                    city: geoData.city || 'Unknown',
                    region: geoData.region || geoData.region_name || 'Unknown',
                    country: geoData.country_name || geoData.country || 'Unknown',
                    timestamp: serverTimestamp()
                });
                sessionStorage.setItem("visitTracked", "true");
            } catch (err) {
                console.error("Visit tracking error:", err);
            }
        };
        trackVisit();

        // If theme override is active, force the targeted theme class and skip scroll theme switching
        if (overrideTheme && overrideTheme !== "dynamic") {
            const themeMap = {
                'theme1': 'theme-1',
                'theme2': 'theme-2',
                'theme3': 'theme-3',
                'theme4': 'theme-4'
            };
            const targetClass = themeMap[overrideTheme] || 'theme-1';
            document.body.className = targetClass;

            // Still register visibility triggers for animations, but without changing the body class
            const observerOptions = { root: null, rootMargin: '0px 0px -100px 0px', threshold: 0 };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
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

            return () => {
                const sections = document.querySelectorAll('.scroll-section');
                sections.forEach(sec => observer.unobserve(sec));
            };
        }

        // Theme intersection observer logic for dynamic scrolling mode
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

        return () => {
            const sections = document.querySelectorAll('.scroll-section');
            sections.forEach(sec => observer.unobserve(sec));
        };
    }, [overrideTheme]);

    return null;
}
