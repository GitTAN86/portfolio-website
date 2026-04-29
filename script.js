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
    
    // Mouse tracking for interactive galaxy
    let mouse = {
        x: null,
        y: null
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            // Original starting anchor points
            this.defaultX = Math.random() * width;
            this.defaultY = Math.random() * height;
            
            // Current center of orbit (starts at default)
            this.centerX = this.defaultX;
            this.centerY = this.defaultY;
            
            // Orbit properties
            this.angle = Math.random() * Math.PI * 2;
            this.radius = Math.random() * 250 + 50; // How far it orbits from the center
            this.velocity = (Math.random() - 0.5) * 0.03; // Speed and direction of orbit
            
            // Visuals
            this.size = Math.random() * 10 + 4; // Length of the dash
            this.width = Math.random() * 2.5 + 1; // Width
            
            // Antigravity Google colors
            const colors = ['rgba(66, 133, 244, 0.8)', 'rgba(177, 0, 255, 0.8)', 'rgba(234, 67, 53, 0.8)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            // Easing factor for the "milky/smooth" transition to the mouse
            this.easing = Math.random() * 0.03 + 0.01; 
        }

        update() {
            this.angle += this.velocity;
            
            // Target is the mouse, or its default floating point if mouse is away
            let targetX = mouse.x !== null ? mouse.x : this.defaultX;
            let targetY = mouse.y !== null ? mouse.y : this.defaultY;

            // Fluidly ease the center of the orbit towards the target
            this.centerX += (targetX - this.centerX) * this.easing;
            this.centerY += (targetY - this.centerY) * this.easing;

            // Dynamic "breathing" radius
            let currentRadius = this.radius + Math.sin(this.angle * 4) * 20;
            
            // Calculate final X and Y based on the orbit
            this.x = this.centerX + Math.cos(this.angle) * currentRadius;
            this.y = this.centerY + Math.sin(this.angle) * currentRadius;

            // If mouse is inactive, let the default anchor slowly drift around screen
            if (mouse.x === null) {
                this.defaultX += Math.cos(this.angle) * 0.5;
                this.defaultY += Math.sin(this.angle) * 0.5;
                
                if (this.defaultX < -100) this.defaultX = width + 100;
                if (this.defaultX > width + 100) this.defaultX = -100;
                if (this.defaultY < -100) this.defaultY = height + 100;
                if (this.defaultY > height + 100) this.defaultY = -100;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Rotate the dash so it always points along its circular orbit
            ctx.rotate(this.angle + Math.PI / 2);
            
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 12; // Milky glowing aura
            ctx.shadowColor = this.color;
            
            // Draw rounded dashes for a smoother look
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(-this.width / 2, -this.size / 2, this.width, this.size, 5);
            } else {
                ctx.fillRect(-this.width / 2, -this.size / 2, this.width, this.size);
            }
            ctx.fill();
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
