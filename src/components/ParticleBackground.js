"use client";
import { useEffect, useRef } from "react";

export default function ParticleBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        let animationFrameId;

        const mouse = {
            x: null,
            y: null,
            isOverContent: false
        };

        const handleMouseMove = (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;

            // Particles ONLY release when hovering over specific content cards or interactive elements.
            // In gaps and general section backgrounds, they stay in "Vortex" mode.
            const target = event.target;
            mouse.isOverContent = !!target.closest('.glass-card') ||
                !!target.closest('button') ||
                !!target.closest('a') ||
                !!target.closest('.timeline-dot') ||
                !!target.closest('.profile-image-wrapper');
        };

        const handleTouchMove = (event) => {
            if (event.touches.length > 0) {
                mouse.x = event.touches[0].clientX;
                mouse.y = event.touches[0].clientY;
                const target = document.elementFromPoint(mouse.x, mouse.y);
                mouse.isOverContent = target ? (!!target.closest('.glass-card') || !!target.closest('button')) : false;
            }
        };

        const handleTouchEnd = () => {
            mouse.x = null;
            mouse.y = null;
            mouse.isOverContent = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();

        class Particle {
            constructor() {
                this.init();
            }

            init() {
                // Original starting anchor points
                this.defaultX = Math.random() * canvas.width;
                this.defaultY = Math.random() * canvas.height;

                // Current center of orbit (starts at default)
                this.centerX = this.defaultX;
                this.centerY = this.defaultY;

                // Orbit properties
                this.angle = Math.random() * Math.PI * 2;
                this.radius = Math.random() * 200 + 80; 
                this.speed = Math.random() * 0.008 + 0.08; // Original rotation speed
                
                // Visuals (Digital Dashes)
                this.size = Math.random() * 12 + 2; // Length of the dash
                this.thickness = Math.random() * 2 + 1; // Width of the dash
                
                const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#B100FF'];
                this.color = googleColors[Math.floor(Math.random() * googleColors.length)];
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                
                // Rotate based on orbit tangent
                const tangentAngle = this.angle + Math.PI / 2;
                ctx.rotate(tangentAngle);
                
                const isDark = document.body.classList.contains('theme-3') || document.body.classList.contains('theme-4');
                const opacity = isDark ? 0.7 : 0.4;

                ctx.beginPath();
                ctx.moveTo(-this.size / 2, 0);
                ctx.lineTo(this.size / 2, 0);
                
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.thickness;
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.restore();
            }

            update() {
                // Rotate the particle in its circle
                this.angle += this.speed;

                // Dynamic "breathing" radius
                let currentRadius = this.radius + Math.sin(this.angle * 2);
                
                // Calculate final position
                this.x = this.centerX + Math.cos(this.angle) * currentRadius;
                this.y = this.centerY + Math.sin(this.angle) * currentRadius;

                if (mouse.x === null || mouse.isOverContent) {
                    // Default Floating / Drift mode
                    this.defaultX += Math.cos(this.angle) * 2; // Original drift speed
                    this.defaultY += Math.sin(this.angle) * 2; // Original drift speed
                    
                    // Screen wrapping for the anchors
                    if (this.defaultX < -200) this.defaultX = canvas.width + 200;
                    if (this.defaultX > canvas.width + 200) this.defaultX = -200;
                    if (this.defaultY < -200) this.defaultY = canvas.height + 200;
                    if (this.defaultY > canvas.height + 200) this.defaultY = -200;

                    // Smoothly pull centerX/Y back to their default anchor points
                    this.centerX += (this.defaultX - this.centerX) * 0.05;
                    this.centerY += (this.defaultY - this.centerY) * 0.05;
                } else {
                    // Vortex / Swarm mode (Mouse is on Background)
                    // Original swarmStrength for "milky" smooth following
                    const swarmStrength = 0.04; 
                    this.centerX += (mouse.x - this.centerX) * swarmStrength;
                    this.centerY += (mouse.y - this.centerY) * swarmStrength;
                }
            }
        }

        function init() {
            particlesArray = [];
            let numberOfParticles = (canvas.height * canvas.width) / 10000;
            if (numberOfParticles < 70) numberOfParticles = 70;
            if (numberOfParticles > 130) numberOfParticles = 130;

            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        function animate() {
            // "Milky" trail effect: Instead of clearRect, we draw a faint rectangle to leave trails
            // However, the original code used clearRect and shadowBlur.
            // I'll stick to the original clearRect for maximum "Antigravity" crispness.
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            animationFrameId = requestAnimationFrame(animate);
        }

        init();
        animate();

        const handleResize = () => {
            setCanvasSize();
            init();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            cancelAnimationFrame(animationFrameId);
        }
    }, []);

    return (
        <>
            <div className="hidden-pattern"></div>
            <canvas id="bgCanvas" ref={canvasRef}></canvas>
        </>
    );
}
