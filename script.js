/* ============================================================
   MI SMART POS — Main JavaScript
   Professional SaaS Landing Page
   Loader, Particles, Scroll Animations, Tilt, Modal, etc.
   ============================================================ */

(function () {
    'use strict';

    /* ========== PAGE LOADER (runs first, always) ========== */
    document.body.classList.add('no-scroll');
    var loader = document.getElementById('page-loader');
    var progBar = document.getElementById('loader-progress');
    var progText = document.getElementById('loader-percent');
    var prog = 0;

    var tick = setInterval(function () {
        prog += Math.random() * 2.5 + 0.5;
        if (prog >= 100) prog = 100;
        if (progBar) progBar.style.width = prog + '%';
        if (progText) progText.textContent = Math.floor(prog) + '%';
        if (prog >= 100) {
            clearInterval(tick);
            if (progText) {
                progText.textContent = '100% - SYSTEM READY';
                progText.style.color = '#25d366';
                progText.style.textShadow = '0 0 15px rgba(37,211,102,0.6)';
            }
            if (progBar) {
                progBar.style.background = '#25d366';
                progBar.style.boxShadow = '0 0 15px #25d366';
            }
            setTimeout(function () {
                if (loader) loader.classList.add('done');
                document.body.classList.remove('no-scroll');
                triggerAnimations();
            }, 1000);
        }
    }, 50);

    /* ========== THEME TOGGLE ========== */
    var themeBtn = document.getElementById('theme-toggle');
    var savedTheme = localStorage.getItem('mi-pos-theme');
    if (savedTheme === 'light') document.body.classList.add('light');

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            document.body.classList.toggle('light');
            var isLight = document.body.classList.contains('light');
            localStorage.setItem('mi-pos-theme', isLight ? 'light' : 'dark');
        });
    }

    /* ========== CINEMATIC MOVING STARS BACKGROUND ========== */
    const cvs = document.getElementById('bg-canvas');
    const ctx = cvs.getContext('2d');
    let stars = [];
    
    function resize() { cvs.width = innerWidth; cvs.height = innerHeight; }
    resize();
    addEventListener('resize', resize);
    
    class Star {
        constructor() { this.init(); }
        init() {
            this.x = (Math.random() - 0.5) * cvs.width * 2;
            this.y = (Math.random() - 0.5) * cvs.height * 2;
            this.z = Math.random() * 1500; 
            this.size = Math.random() * 1.5 + 0.5;
            this.hue = Math.random() > 0.6 ? 225 : (Math.random() > 0.5 ? 280 : 0); // Blue, purple, and few white
            this.speed = Math.random() * 3 + 1;
        }
        update() {
            this.z -= this.speed;
            if (this.z <= 0) {
                this.x = (Math.random() - 0.5) * cvs.width * 2;
                this.y = (Math.random() - 0.5) * cvs.height * 2;
                this.z = 1500;
                this.speed = Math.random() * 3 + 1;
            }
        }
        draw() {
            const perspective = 400;
            const xProjected = (this.x * perspective) / this.z + cvs.width / 2;
            const yProjected = (this.y * perspective) / this.z + cvs.height / 2;
            const sizeProjected = Math.max(0, this.size * (perspective / this.z));
            
            if (xProjected < 0 || xProjected > cvs.width || yProjected < 0 || yProjected > cvs.height) return;
            
            const alpha = Math.min(1, Math.max(0, 1 - (this.z / 1500)));
            
            ctx.beginPath();
            ctx.arc(xProjected, yProjected, sizeProjected, 0, Math.PI * 2);
            if (this.hue === 0) {
                ctx.fillStyle = `hsla(0, 0%, 100%, ${alpha})`;
            } else {
                ctx.fillStyle = `hsla(${this.hue}, 80%, 75%, ${alpha})`;
            }
            ctx.fill();
        }
    }
    
    function initStars() {
        const count = Math.min(Math.floor((cvs.width * cvs.height) / 1000), 2000);
        stars = [];
        for (let i = 0; i < count; i++) stars.push(new Star());
    }
    initStars();
    
    (function loop() {
        // Trailing background effect for lightspeed motion
        const isLight = document.body.classList.contains('light');
        if (isLight) {
            ctx.fillStyle = "rgba(245, 247, 251, 0.4)";
        } else {
            ctx.fillStyle = "rgba(11, 15, 26, 0.4)";
        }
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        
        stars.forEach(s => { s.update(); s.draw(); });
        requestAnimationFrame(loop);
    })();

    /* ========== SCROLL REVEAL ========== */
    function triggerAnimations() {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
            });
        }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });

        document.querySelectorAll('.anim').forEach((el, i) => {
            el.style.transitionDelay = `${(i % 8) * .07}s`;
            io.observe(el);
        });
    }

    /* ========== COUNTER ANIMATION ========== */
    const countObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                document.querySelectorAll('.count[data-target]').forEach(c => {
                    const target = +c.dataset.target;
                    const dur = 2000;
                    const t0 = performance.now();
                    (function step(now) {
                        const p = Math.min((now - t0) / dur, 1);
                        const ease = 1 - Math.pow(1 - p, 3);
                        c.textContent = Math.floor(ease * target);
                        if (p < 1) requestAnimationFrame(step);
                    })(t0);
                });
                countObserver.disconnect();
            }
        });
    }, { threshold: .5 });
    const trustEl = document.querySelector('.hero-trust');
    if (trustEl) countObserver.observe(trustEl);

    /* ========== NAVBAR ========== */
    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');

    addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', scrollY > 50);
        activeNav();
    });

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        menu.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(l => {
        l.addEventListener('click', () => {
            toggle.classList.remove('open');
            menu.classList.remove('open');
        });
    });

    function activeNav() {
        let cur = '';
        document.querySelectorAll('section[id]').forEach(s => {
            if (scrollY >= s.offsetTop - 200) cur = s.id;
        });
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + cur);
        });
    }

    /* ========== 3D TILT EFFECT ========== */
    document.querySelectorAll('.tilt').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const cx = r.width / 2, cy = r.height / 2;
            const x = e.clientX - r.left, y = e.clientY - r.top;
            const rx = ((y - cy) / cy) * -5;
            const ry = ((x - cx) / cx) * 5;
            card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    /* ========== SCREENSHOT MODAL ========== */
    const ssFilesFound = [
        "Screenshot 2026-04-16 064733.png",
        "Screenshot 2026-04-16 064748.png",
        "Screenshot 2026-04-16 064802.png",
        "Screenshot 2026-04-16 064814.png",
        "Screenshot 2026-04-16 064822.png",
        "Screenshot 2026-04-16 064830.png",
        "Screenshot 2026-04-16 064838.png",
        "Screenshot 2026-04-16 065025.png",
        "Screenshot 2026-04-20 124959.png",
        "Screenshot 2026-04-20 125053.png",
        "Screenshot 2026-04-20 125119.png",
        "Screenshot 2026-04-20 125141.png",
        "Screenshot.png"
    ];

    function loadSS() {
        const grid = document.getElementById('modal-grid');
        const empty = document.getElementById('modal-empty');

        if (ssFilesFound.length > 0) {
            empty.style.display = 'none';
            ssFilesFound.forEach((n, i) => {
                const img = document.createElement('img');
                img.src = `screenshots/${n}`;
                img.alt = `Screenshot ${i + 1}`;
                img.loading = 'lazy';
                img.onclick = () => openLB(img.src);
                grid.appendChild(img);
            });
        }
    }
    loadSS();

    window.openModal = () => {
        document.getElementById('ss-modal').classList.add('open');
        document.body.classList.add('no-scroll');
    };
    window.closeModal = () => {
        document.getElementById('ss-modal').classList.remove('open');
        document.body.classList.remove('no-scroll');
    };
    window.openLB = (src) => {
        document.getElementById('lb-img').src = src;
        document.getElementById('lightbox').classList.add('open');
    };
    window.closeLB = () => {
        document.getElementById('lightbox').classList.remove('open');
    };

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeLB(); closeModal(); }
    });
    document.getElementById('ss-modal').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('lightbox').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeLB();
    });

    /* ========== PARALLAX ORBS ========== */
    addEventListener('scroll', () => {
        const s = scrollY;
        const o1 = document.querySelector('.orb-1');
        const o2 = document.querySelector('.orb-2');
        if (o1) o1.style.transform = `translate(${s * .02}px,${s * .04}px)`;
        if (o2) o2.style.transform = `translate(-${s * .03}px,-${s * .03}px)`;
    });

})();
