document.addEventListener('DOMContentLoaded', () => {
    // 1. Current Year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 2. Diagnostics information
    const domainEl = document.getElementById('diag-domain');
    const protocolEl = document.getElementById('diag-protocol');
    const browserEl = document.getElementById('diag-browser');
    const pingEl = document.getElementById('diag-ping');
    const sslStatusEl = document.getElementById('ssl-status');

    const currentHostname = window.location.hostname || '3state.vc';
    domainEl.textContent = currentHostname === 'localhost' || currentHostname === '127.0.0.1' ? `${currentHostname} (Local Test)` : currentHostname;

    const protocol = window.location.protocol.replace(':', '').toUpperCase();
    protocolEl.textContent = protocol === 'HTTPS' ? 'HTTPS (Sécurisé)' : protocol === 'HTTP' ? 'HTTP' : 'Fichier Local';
    if (protocol !== 'HTTPS' && protocol !== 'FILE') {
        sslStatusEl.textContent = '⚠️';
        sslStatusEl.style.color = '#f59e0b';
    }

    // Detect browser
    const userAgent = navigator.userAgent;
    let browserName = 'Navigateur standard';
    if (userAgent.includes('Firefox')) browserName = 'Mozilla Firefox';
    else if (userAgent.includes('Edg')) browserName = 'Microsoft Edge';
    else if (userAgent.includes('Chrome')) browserName = 'Google Chrome';
    else if (userAgent.includes('Safari')) browserName = 'Apple Safari';
    browserEl.textContent = browserName;

    // Simulate / measure latency
    const startPing = performance.now();
    setTimeout(() => {
        const pingTime = Math.round(performance.now() - startPing + (Math.random() * 8 + 4));
        pingEl.textContent = `${pingTime} ms`;
    }, 250);

    // 3. Email Form handling
    const notifyForm = document.getElementById('notify-form');
    const emailInput = document.getElementById('email-input');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-btn');

    if (notifyForm) {
        notifyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();

            if (!email) return;

            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Envoi...</span>`;

            setTimeout(() => {
                // Save to localStorage for demo/offline test
                const savedEmails = JSON.parse(localStorage.getItem('3state_leads') || '[]');
                savedEmails.push({ email, timestamp: new Date().toISOString() });
                localStorage.setItem('3state_leads', JSON.stringify(savedEmails));

                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Inscrit !</span> ✓`;
                formFeedback.className = 'form-feedback success';
                formFeedback.textContent = `Merci ! ${email} a été enregistré avec succès.`;
                emailInput.value = '';

                setTimeout(() => {
                    submitBtn.innerHTML = `<span>M'avertir</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
                }, 4000);
            }, 600);
        });
    }

    // 4. Subtle Particle / Constellation Canvas Animation
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 45);

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(165, 180, 252, ${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        particles.forEach((p) => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
});
