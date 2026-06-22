/* ============================================================
   MI SMART POS — Premium Three.js + GSAP Page Loader
   Particle effects, volumetric lighting, logo reveal,
   character-by-character text, progress indicator.
   ============================================================ */

(function () {
    'use strict';

    /* ---------- Configuration ---------- */
    var CONFIG = {
        particleCount: 800,
        particleCountLow: 250,
        logoRevealDuration: 1.2,
        textRevealDuration: 0.6,
        progressDuration: 3.5,
        exitTransitionDuration: 1.4,
        cameraOrbitSpeed: 0.00015,
        statusText: 'Connecting You to Servers Of Malik Irteza',
    };

    /* ---------- DOM refs ---------- */
    var preloader = document.getElementById('preloader');
    var canvas = document.getElementById('loader-canvas');
    var logoWrap = document.getElementById('loader-logo');
    var logoImg = document.querySelector('.preloader-logo');
    var titleEl = document.getElementById('loader-title');
    var subEl = document.getElementById('loader-sub');
    var trackEl = document.getElementById('loader-track');
    var fillEl = document.getElementById('loader-fill');
    var statusEl = document.getElementById('loader-status');

    /* ---------- Reduced-motion detection ---------- */
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Low-end device detection ---------- */
    var isLowEnd = (navigator.hardwareConcurrency || 8) < 4;
    var particleCount = isLowEnd ? CONFIG.particleCountLow : CONFIG.particleCount;
    if (prefersReducedMotion) particleCount = Math.min(particleCount, 100);

    /* ---------- Three.js scene ---------- */
    var scene, camera, renderer, particles;
    var particleSystem;
    var animFrameId;

    function initThree() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060c1a);

        /* Camera */
        var aspect = canvas.clientWidth / canvas.clientHeight || window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
        camera.position.set(0, 0, 160);

        /* Renderer */
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: false,
            antialias: !isLowEnd,
        });
        var dpr = Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        /* Lights */
        var ambient = new THREE.AmbientLight(0x4466ff, 0.5);
        scene.add(ambient);

        var pointLight1 = new THREE.PointLight(0x4f6ef7, 1.2, 300);
        pointLight1.position.set(60, 60, 100);
        scene.add(pointLight1);

        var pointLight2 = new THREE.PointLight(0xa855f7, 0.8, 300);
        pointLight2.position.set(-60, -40, 80);
        scene.add(pointLight2);

        /* Particles */
        createParticles();

        /* Resize handler */
        window.addEventListener('resize', onResize);
    }

    function createParticles() {
        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array(particleCount * 3);
        var colors = new Float32Array(particleCount * 3);
        var sizes = new Float32Array(particleCount);

        var color1 = new THREE.Color(0x4f6ef7);
        var color2 = new THREE.Color(0xa855f7);
        var color3 = new THREE.Color(0xffffff);

        for (var i = 0; i < particleCount; i++) {
            var radius = 80 + Math.random() * 120;
            var theta = Math.random() * Math.PI * 2;
            var phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            var col;
            var r = Math.random();
            if (r < 0.5) col = color1;
            else if (r < 0.85) col = color2;
            else col = color3;

            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;

            sizes[i] = Math.random() * 2.5 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        var material = new THREE.PointsMaterial({
            size: 0.6,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);
    }

    function onResize() {
        if (!camera || !renderer) return;
        var w = canvas.clientWidth;
        var h = canvas.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    }

    /* ---------- Animation loop ---------- */
    var clock = new THREE.Clock();

    function animate() {
        animFrameId = requestAnimationFrame(animate);

        if (particleSystem) {
            particleSystem.rotation.y += CONFIG.cameraOrbitSpeed;
            particleSystem.rotation.x += CONFIG.cameraOrbitSpeed * 0.3;
        }

        renderer.render(scene, camera);
    }

    /* ---------- GSAP Timeline ---------- */
    var masterTL;
    var loadingComplete = false;

    function buildTimeline() {
        if (prefersReducedMotion) {
            /* Skip animations, show everything instantly */
            if (logoImg) { logoImg.style.opacity = 1; logoImg.style.transform = 'scale(1)'; }
            if (titleEl) { titleEl.style.opacity = 1; titleEl.style.transform = 'translateY(0)'; }
            if (subEl) { subEl.style.opacity = 1; }
            if (trackEl) { trackEl.style.opacity = 1; }
            if (statusEl) { statusEl.style.opacity = 1; statusEl.textContent = CONFIG.statusText; }
            simulateProgress();
            return;
        }

        masterTL = new gsap.timeline();

        /* Logo reveal */
        masterTL.to(logoImg, {
            opacity: 1,
            scale: 1,
            duration: CONFIG.logoRevealDuration,
            ease: 'back.out(1.7)',
        }, 0.3);

        /* Ring pulse enhancement */
        masterTL.to('.preloader-logo-ring', {
            borderColor: 'rgba(168,85,247,0.5)',
            boxShadow: '0 0 60px rgba(79,110,247,0.3), inset 0 0 60px rgba(79,110,247,0.1)',
            duration: 1.2,
            ease: 'sine.inOut',
        }, 0);

        /* Title reveal */
        masterTL.to(titleEl, {
            opacity: 1,
            y: 0,
            duration: CONFIG.textRevealDuration,
            ease: 'power3.out',
        }, 0.8);

        /* Subtitle reveal */
        masterTL.to(subEl, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
        }, 1.0);

        /* Progress track fade in */
        masterTL.to(trackEl, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
        }, 1.2);

        /* Status text fade in */
        masterTL.to(statusEl, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: revealStatusText,
        }, 1.4);

        /* Start progress simulation */
        masterTL.call(simulateProgress, [], null, 1.6);
    }

    /* ---------- Character-by-character status text reveal ---------- */
    function revealStatusText() {
        if (prefersReducedMotion) return;
        var text = CONFIG.statusText;
        statusEl.textContent = '';
        var chars = text.split('');

        var tl = new gsap.timeline();
        chars.forEach(function (ch, i) {
            var span = document.createElement('span');
            span.className = 'char';
            span.textContent = ch === ' ' ? '\u00A0' : ch;
            statusEl.appendChild(span);
            tl.to(span, {
                opacity: 1,
                duration: 0.03,
                ease: 'none',
            }, i * 0.025);
        });
    }

    /* ---------- Progress simulation ---------- */
    function simulateProgress() {
        var prog = 0;
        var startTime = performance.now();
        var duration = CONFIG.progressDuration * 1000;

        function step(now) {
            var elapsed = now - startTime;
            var p = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var current = Math.floor(eased * 100);

            if (fillEl) fillEl.style.width = current + '%';

            if (p >= 1) {
                onProgressComplete();
                return;
            }
            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ---------- Progress complete → exit transition ---------- */
    function onProgressComplete() {
        if (loadingComplete) return;
        loadingComplete = true;

        /* Set fill to 100% */
        if (fillEl) {
            fillEl.style.width = '100%';
            fillEl.style.background = 'linear-gradient(90deg, #25d366, #20b858)';
            fillEl.style.boxShadow = '0 0 20px rgba(37,211,102,0.5)';
        }

        if (prefersReducedMotion) {
            exitLoader();
            return;
        }

        /* GSAP exit timeline */
        var exitTL = gsap.timeline({
            onComplete: exitLoader,
        });

        /* Camera pull-back effect */
        exitTL.to(camera.position, {
            z: 200,
            duration: CONFIG.exitTransitionDuration,
            ease: 'power2.inOut',
        }, 0);

        /* Particle fade */
        if (particleSystem) {
            exitTL.to(particleSystem.material, {
                opacity: 0,
                duration: CONFIG.exitTransitionDuration * 0.6,
                ease: 'power2.out',
            }, 0);
        }

        /* Logo shrink and fade */
        exitTL.to(logoImg, {
            opacity: 0,
            scale: 0.4,
            duration: CONFIG.exitTransitionDuration * 0.5,
            ease: 'power2.in',
        }, CONFIG.exitTransitionDuration * 0.15);

        /* Ring fade */
        exitTL.to('.preloader-logo-ring', {
            opacity: 0,
            duration: CONFIG.exitTransitionDuration * 0.4,
            ease: 'power2.out',
        }, CONFIG.exitTransitionDuration * 0.2);

        /* Title and subtitle fade up */
        exitTL.to([titleEl, subEl], {
            opacity: 0,
            y: -30,
            duration: CONFIG.exitTransitionDuration * 0.5,
            ease: 'power2.in',
        }, CONFIG.exitTransitionDuration * 0.2);

        /* Progress and status fade */
        exitTL.to([trackEl, statusEl], {
            opacity: 0,
            duration: CONFIG.exitTransitionDuration * 0.4,
            ease: 'power2.out',
        }, CONFIG.exitTransitionDuration * 0.3);

        /* Preloader overlay fade */
        exitTL.to(preloader, {
            opacity: 0,
            duration: CONFIG.exitTransitionDuration * 0.4,
            ease: 'power2.out',
        }, CONFIG.exitTransitionDuration * 0.6);
    }

    /* ---------- Exit loader ---------- */
    function exitLoader() {
        disposeThree();
        if (preloader && preloader.parentNode) {
            preloader.parentNode.removeChild(preloader);
        }
        document.body.classList.remove('no-scroll');

        /* Dispatch completion event for main script */
        window.dispatchEvent(new CustomEvent('loaderComplete'));
    }

    /* ---------- Dispose Three.js resources ---------- */
    function disposeThree() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        window.removeEventListener('resize', onResize);

        if (renderer) {
            renderer.dispose();
            renderer.forceContextLoss();
        }
        if (scene) {
            scene.traverse(function (obj) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(function (m) { m.dispose(); });
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        }
        scene = null;
        camera = null;
        renderer = null;
        particleSystem = null;
    }

    /* ---------- Kick off ---------- */
    function init() {
        document.body.classList.add('no-scroll');
        initThree();
        animate();
        buildTimeline();
    }

    if (canvas) {
        init();
    } else {
        /* Fallback: if canvas doesn't exist, just remove preloader and continue */
        document.body.classList.remove('no-scroll');
        window.dispatchEvent(new CustomEvent('loaderComplete'));
    }

})();
