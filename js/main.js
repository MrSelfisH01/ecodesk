(function () {
  // main.js - shared behavior and page-specific initialization
  function onLoad() {
    // Loader
    const loader = document.getElementById('loader');
    if (loader) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          loader.style.opacity = '0';
          setTimeout(() => (loader.style.display = 'none'), 500);
        }, 800);
      });
    }

    // Active nav link
    document.querySelectorAll('.nav-link').forEach((a) => {
      try {
        const href = a.getAttribute('href');
        const current = location.pathname.split('/').pop() || 'index.html';
        if (href && href.includes(current)) a.classList.add('active');
      } catch (e) {
        // ignore
      }
    });

    // Header scroll
    const header = document.querySelector('header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }

    // Custom cursor removed for performance — no listeners attached here.

    // Particles Background
    const canvas = document.querySelector('.particles-bg');
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext('2d');
      function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      setupCanvas();

      const particles = [];
      const particleCount = 100;

      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 2 + 1;
          this.speedX = Math.random() * 0.5 - 0.25;
          this.speedY = Math.random() * 0.5 - 0.25;
          this.isLeaf = Math.random() > 0.7;
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.x > canvas.width) this.x = 0;
          if (this.x < 0) this.x = canvas.width;
          if (this.y > canvas.height) this.y = 0;
          if (this.y < 0) this.y = canvas.height;
        }
        draw() {
          ctx.fillStyle = this.isLeaf ? 'rgba(0, 255, 136, 0.5)' : 'rgba(0, 200, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = 0; i < particleCount; i++) particles.push(new Particle());

      function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.update();
          p.draw();
        });
        requestAnimationFrame(animateParticles);
      }
      animateParticles();

      window.addEventListener('resize', setupCanvas);
    }

    // Button ripple
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255,255,255,0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Page specific
    const page = document.body.getAttribute('data-page') || '';

    // Mobile menu toggler
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    function closeMenu() {
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      if (mainNav) mainNav.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
    function openMenu() {
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
      if (mainNav) mainNav.classList.add('open');
      document.body.classList.add('menu-open');
    }
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        if (expanded) closeMenu();
        else openMenu();
      });

      // close when a nav link is clicked
      mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

      // ensure menu closes when resizing above mobile breakpoint
      window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeMenu();
      });
    }

    // Home: globe and counters and GSAP hero animations
    if (page === 'home') {
      // three.js globe (guarded)
      const globeContainer = document.getElementById('globe-container');
      if (globeContainer && window.THREE) {
        try {
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
          renderer.setSize(500, 500);
          globeContainer.appendChild(renderer.domElement);

          const geometry = new THREE.SphereGeometry(2, 32, 32);
          const material = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
          });
          const globe = new THREE.Mesh(geometry, material);
          scene.add(globe);

          const particlesGeometry = new THREE.BufferGeometry();
          const particlesCnt = 1000;
          const posArray = new Float32Array(particlesCnt * 3);
          for (let i = 0; i < particlesCnt * 3; i++) posArray[i] = (Math.random() - 0.5) * 5;
          particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
          const particlesMaterial = new THREE.PointsMaterial({ size: 0.02, color: 0x00ff88, transparent: true, opacity: 0.8 });
          const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
          scene.add(particlesMesh);

          camera.position.z = 5;
          (function animateGlobe() {
            requestAnimationFrame(animateGlobe);
            globe.rotation.y += 0.003;
            particlesMesh.rotation.y += 0.001;
            renderer.render(scene, camera);
          })();
        } catch (err) {
          console.warn('Globe init failed', err);
        }
      }

      // Counters
      const counters = document.querySelectorAll('.stat-number');
      if (counters.length) {
        const observer = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target, 10) || 0;
                let current = 0;
                const increment = Math.max(1, Math.floor(target / 100));
                const update = () => {
                  if (current < target) {
                    current += increment;
                    counter.textContent = Math.min(target, Math.ceil(current));
                    setTimeout(update, 20);
                  } else {
                    counter.textContent = target + (target === 99 ? '%' : '+');
                  }
                };
                update();
                obs.unobserve(counter);
              }
            });
          },
          { threshold: 0.5 }
        );
        counters.forEach((c) => observer.observe(c));
      }

      
      if (window.gsap && window.ScrollTrigger) {
        try {
          gsap.registerPlugin(ScrollTrigger);
          gsap.from('.hero h1', { duration: 1, y: -50, opacity: 0, ease: 'power3.out', delay: 0.6 });
          gsap.from('.hero p', { duration: 1, y: 30, opacity: 0, ease: 'power3.out', delay: 0.8 });
          gsap.from('.cta-buttons', { duration: 1, y: 30, opacity: 0, ease: 'power3.out', delay: 1 });
        } catch (e) {
          console.warn('GSAP animations failed', e);
        }
      }
    }

    // About page: timeline animations
    if (page === 'about' && window.gsap && window.ScrollTrigger) {
      try {
        gsap.from('.timeline-item', { scrollTrigger: { trigger: '.timeline', start: 'top center' }, duration: 1, x: (i) => (i % 2 === 0 ? -100 : 100), opacity: 0, stagger: 0.3 });
      } catch (e) {
        /* ignore */
      }
    }

    // Blog page animations
    if (page === 'blog' && window.gsap && window.ScrollTrigger) {
      try {
        gsap.from('.blog-card', { scrollTrigger: { trigger: '.blog-grid', start: 'top center' }, duration: 0.8, y: 50, opacity: 0, stagger: 0.15 });
      } catch (e) {}
    }

    // Contact: map animation and form handler
    if (page === 'contact') {
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        const mapCanvas = document.createElement('canvas');
        mapCanvas.width = mapContainer.offsetWidth;
        mapCanvas.height = mapContainer.offsetHeight;
        mapContainer.appendChild(mapCanvas);
        const mapCtx = mapCanvas.getContext('2d');
        const mapPoints = [];
        for (let i = 0; i < 50; i++) {
          mapPoints.push({ x: Math.random() * mapCanvas.width, y: Math.random() * mapCanvas.height, radius: Math.random() * 3 + 1, pulseSpeed: Math.random() * 0.02 + 0.01, pulse: 0 });
        }
        function drawMap() {
          mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
          mapCtx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
          mapCtx.lineWidth = 1;
          for (let i = 0; i < mapPoints.length; i++) {
            for (let j = i + 1; j < mapPoints.length; j++) {
              const dx = mapPoints[i].x - mapPoints[j].x;
              const dy = mapPoints[i].y - mapPoints[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 150) {
                mapCtx.beginPath();
                mapCtx.moveTo(mapPoints[i].x, mapPoints[i].y);
                mapCtx.lineTo(mapPoints[j].x, mapPoints[j].y);
                mapCtx.stroke();
              }
            }
          }
          mapPoints.forEach((point) => {
            point.pulse += point.pulseSpeed;
            const size = point.radius + Math.sin(point.pulse) * 2;
            mapCtx.fillStyle = 'rgba(0, 255, 136, 0.8)';
            mapCtx.beginPath();
            mapCtx.arc(point.x, point.y, size, 0, Math.PI * 2);
            mapCtx.fill();
            mapCtx.fillStyle = 'rgba(0, 255, 136, 0.3)';
            mapCtx.beginPath();
            mapCtx.arc(point.x, point.y, size + 3, 0, Math.PI * 2);
            mapCtx.fill();
          });
          requestAnimationFrame(drawMap);
        }
        drawMap();
      }

      const form = document.querySelector('.contact-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          alert('Thank you for your message! We will get back to you soon.');
          form.reset();
        });
      }
    }

    // Parallax: restore split-section parallax with safe clipping and responsive disabling
    // Wrap split-half contents in a .parallax-inner so transforms are clipped by the parent
    document.querySelectorAll('.split-half').forEach((half) => {
      if (!half.querySelector('.parallax-inner')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'parallax-inner';
        // move children into wrapper
        while (half.firstChild) wrapper.appendChild(half.firstChild);
        half.appendChild(wrapper);
      }
    });

    let parallaxTick = false;
    function applyParallax() {
      if (parallaxTick) return; // throttle
      parallaxTick = true;
      requestAnimationFrame(() => {
        // disable on small screens
        if (window.innerWidth <= 900) {
          document.querySelectorAll('.parallax-inner').forEach((el) => (el.style.transform = ''));
          parallaxTick = false;
          return;
        }

        const viewportCenter = window.innerHeight / 2;
        const maxShift = 24; // px
        document.querySelectorAll('.split-half').forEach((half, idx) => {
          const inner = half.querySelector('.parallax-inner');
          if (!inner) return;
          const rect = half.getBoundingClientRect();
          // only apply when element is at least partially visible
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const elementCenter = rect.top + rect.height / 2;
            // distance from viewport center, normalized
            const distance = viewportCenter - elementCenter;
            const factor = 0.05; // small multiplier
            let shift = Math.max(-maxShift, Math.min(maxShift, distance * factor));
            // alternate direction for left/right halves by index
            if (idx % 2 !== 0) shift = -shift;
            inner.style.transform = `translateY(${shift}px)`;
          } else {
            inner.style.transform = '';
          }
        });

        parallaxTick = false;
      });
    }

    window.addEventListener('scroll', applyParallax);
    window.addEventListener('resize', () => {
      // clear transforms on resize to avoid layout issues and re-run
      document.querySelectorAll('.parallax-inner').forEach((el) => (el.style.transform = ''));
      applyParallax();
    });

    // Smooth internal hash links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href') !== '#') {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onLoad);
  else onLoad();
})();
