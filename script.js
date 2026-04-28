document.addEventListener("DOMContentLoaded", () => {
    // 1. Zero-Jitter Scroll Animations & Light-to-Dark Theme Observer
    const sections = Array.from(document.querySelectorAll('.scroll-section'));
    
    // Smooth Scroll Reveal Observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const index = sections.indexOf(entry.target);
            
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                entry.target.classList.remove('is-past');
            } else {
                // If it's not intersecting, determine if it went above (past) or below
                const rect = entry.target.getBoundingClientRect();
                if (rect.bottom < 0) {
                    // Scrolled completely past the top
                    entry.target.classList.remove('is-visible');
                    entry.target.classList.add('is-past');
                } else {
                    // Entering from bottom again, or sitting below screen
                    entry.target.classList.remove('is-visible');
                    entry.target.classList.remove('is-past');
                }
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    sections.forEach(section => revealObserver.observe(section));

    // Dynamic Theme Shifting (Light to Dark)
    const themeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove all theme classes first
                document.body.classList.remove('theme-1', 'theme-2', 'theme-3', 'theme-4');
                
                // Add the appropriate theme class based on the section
                const sectionId = entry.target.id;
                if (sectionId === 'hero') {
                    document.body.classList.add('theme-1');
                } else if (sectionId === 'about') {
                    document.body.classList.add('theme-2');
                } else if (sectionId === 'skills') {
                    document.body.classList.add('theme-3');
                } else if (sectionId === 'experience' || sectionId === 'contact') {
                    document.body.classList.add('theme-4');
                }
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(section => themeObserver.observe(section));

    // 2. Parallax Particle Background
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.baseX = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 6 + 4; // length of dash
            this.speedY = Math.random() * -0.5 - 0.2; // drifting slowly upwards
            this.width = Math.random() * 1.5 + 0.5; // width of dash
            
            // Harmonic motion properties
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = Math.random() * 0.015 + 0.005;
            this.amplitude = Math.random() * 30 + 15;
            
            // Antigravity Google colors
            const colors = ['rgba(66, 133, 244, 0.7)', 'rgba(177, 0, 255, 0.7)', 'rgba(234, 67, 53, 0.7)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.y += this.speedY;
            this.angle += this.angleSpeed;
            // Oscillate around baseX using a sine wave
            this.x = this.baseX + Math.sin(this.angle) * this.amplitude;

            // Wrap around edges smoothly
            if (this.y < -20) {
                this.y = height + 20;
                this.baseX = Math.random() * width;
            } else if (this.y > height + 20) {
                this.y = -20;
                this.baseX = Math.random() * width;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Elegant tilt based on horizontal velocity (cosine of angle)
            let tilt = Math.cos(this.angle) * this.angleSpeed * 15; 
            ctx.rotate(tilt);
            
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.size / 2, this.width, this.size);
            ctx.restore();
        }
    }

    function initParticles() {
        particles = [];
        // Calculate number of particles based on screen width for performance
        const particleCount = Math.min(Math.floor(window.innerWidth / 15), 80);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        // Disabled line connections for the Antigravity theme
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        connectParticles();
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    // 3. 3D Tilt Effect for Hero Card
    const tiltCard = document.getElementById('tiltCard');
    if (tiltCard) {
        tiltCard.addEventListener('mousemove', (e) => {
            const rect = tiltCard.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
            const rotateY = ((x - centerX) / centerX) * 10;
            
            tiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        tiltCard.addEventListener('mouseleave', () => {
            tiltCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    }

    // 4. (Removed old Image Gallery Carousel)
});
