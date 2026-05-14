/* ============================================================
   PREMIUM JS · Elisa Federsel · Reiki
   GSAP 3 + ScrollTrigger + Lenis + Custom Cursor + Particles
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

// ── Lenis smooth scroll ──────────────────────────────────────
const lenis = new Lenis({
  duration: 1.45,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop(); // hold until preloader done

// ── Custom cursor ────────────────────────────────────────────
(function initCursor() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    gsap.to(dot, { x: mx, y: my, duration: 0.07, overwrite: true });
  }, { passive: true });

  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.10;
    ry += (my - ry) * 0.10;
    gsap.set(ring, { x: rx, y: ry });
  });

  const hoverEls = 'a, button, .card, .acc-btn, .magnetic';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
  });

  document.addEventListener('mouseleave', () => document.body.classList.add('cur-hidden'));
  document.addEventListener('mouseenter', () => document.body.classList.remove('cur-hidden'));
})();

// ── Magnetic buttons ─────────────────────────────────────────
function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.38;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.38;
      gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' });
    });
  });
}

// ── Canvas energy particles ───────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = [
    [200, 169, 110],
    [240, 215, 160],
    [255, 235, 190],
    [175, 140,  80],
    [255, 248, 210],
  ];

  class Orb {
    constructor(initial) {
      this.initial = initial;
      this.reset();
    }
    reset() {
      this.x      = Math.random() * canvas.width;
      this.y      = this.initial ? Math.random() * canvas.height : canvas.height + 20;
      this.r      = Math.random() * 4.2 + 1.0;
      this.vx     = (Math.random() - 0.5) * 0.42;
      this.vy     = -(Math.random() * 1.1 + 0.45);
      this.age    = this.initial ? Math.floor(Math.random() * 280) : 0;
      this.maxAge = Math.random() * 240 + 120;
      this.maxA   = Math.random() * 0.82 + 0.22;
      this.alpha  = 0;
      this.rgb    = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.wobble = Math.random() * Math.PI * 2;
    }
    tick() {
      this.wobble += 0.022;
      this.x += this.vx + Math.sin(this.wobble) * 0.22;
      this.y += this.vy;
      this.age++;
      const t = this.age / this.maxAge;
      this.alpha = t < 0.15
        ? (t / 0.15) * this.maxA
        : t > 0.72
          ? ((1 - t) / 0.28) * this.maxA
          : this.maxA;
      if (this.age > this.maxAge) { this.initial = false; this.reset(); }
    }
    draw() {
      const [r, g, b] = this.rgb;
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 7);
      grd.addColorStop(0,   `rgba(${r},${g},${b},${this.alpha})`);
      grd.addColorStop(0.3, `rgba(${r},${g},${b},${this.alpha * 0.55})`);
      grd.addColorStop(0.6, `rgba(${r},${g},${b},${this.alpha * 0.15})`);
      grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 7, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }
  }

  const orbs = Array.from({ length: 85 }, (_, i) => new Orb(i < 45));

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    orbs.forEach(o => { o.tick(); o.draw(); });
    requestAnimationFrame(loop);
  })();
}

// ── Hero entrance animations (post-preloader) ────────────────
function playHeroAnim() {
  const tl = gsap.timeline();
  tl
    .to('.hero-eyebrow',  { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    .to('.split-inner',   { y: '0%', duration: 1.15, ease: 'power4.out', stagger: 0.13 }, '-=0.45')
    .to('.hero-desc',     { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.65')
    .to('.btn-hero',      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.55')
    .to('.hero-scroll',   { opacity: 1, duration: 0.6 }, '-=0.3');
}

// ── Hero parallax ────────────────────────────────────────────
function initHeroParallax() {
  gsap.to('#hero-bg', {
    yPercent: 22,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });
}

// ── Scroll-triggered animations ──────────────────────────────
function initScrollAnims() {
  initHeroParallax();

  // Generic fade-up for [data-anim="fade-up"]
  gsap.utils.toArray('[data-anim="fade-up"]').forEach(el => {
    const delay = parseFloat(el.dataset.delay || 0);
    gsap.fromTo(el,
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'power3.out', delay,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }
    );
  });

  // Cards stagger
  gsap.utils.toArray('[data-anim="card"]').forEach(card => {
    const delay = parseFloat(card.dataset.delay || 0);
    gsap.fromTo(card,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.85, ease: 'power3.out', delay,
        scrollTrigger: { trigger: card, start: 'top 90%' },
      }
    );
  });

  // Banderolle
  gsap.fromTo('.banderolle',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 1.0, ease: 'power3.out',
      scrollTrigger: { trigger: '.banderolle', start: 'top 88%' } }
  );

  // Image wipe reveal (clip-path)
  const imgCol = document.querySelector('[data-anim="image-wipe"]');
  if (imgCol) {
    gsap.fromTo(imgCol.querySelector('.about-img-frame'),
      { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
      { clipPath: 'inset(0 0% 0 0)',   opacity: 1,
        duration: 1.3, ease: 'power4.out',
        scrollTrigger: { trigger: imgCol, start: 'top 80%' },
      }
    );
    gsap.fromTo(imgCol,
      { opacity: 0 },
      { opacity: 1, duration: 0.1,
        scrollTrigger: { trigger: imgCol, start: 'top 82%' } }
    );
  }

  // Steps slide from right
  gsap.utils.toArray('[data-anim="slide-right"]').forEach(el => {
    const delay = parseFloat(el.dataset.delay || 0);
    gsap.fromTo(el,
      { opacity: 0, x: 45 },
      {
        opacity: 1, x: 0,
        duration: 0.85, ease: 'power3.out', delay,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }
    );
  });

  // Price card scale-in
  const preisCard = document.querySelector('[data-anim="scale-in"]');
  if (preisCard) {
    gsap.fromTo(preisCard,
      { opacity: 0, scale: 0.92, y: 20 },
      { opacity: 1, scale: 1, y: 0,
        duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: preisCard, start: 'top 85%' } }
    );
  }

  // Price counter
  const counter = document.querySelector('[data-counter]');
  if (counter) {
    const target = parseInt(counter.dataset.counter, 10);
    ScrollTrigger.create({
      trigger: counter,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to({ v: 0 }, {
          v: target, duration: 1.8, ease: 'power2.out',
          onUpdate: function() { counter.textContent = Math.round(this.targets()[0].v); },
        });
      },
    });
  }

  // Accordion section
  gsap.fromTo('.accordion',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: '.accordion', start: 'top 88%' } }
  );

  // Kontakt title & desc
  gsap.fromTo('.kontakt-title',
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
      scrollTrigger: { trigger: '.kontakt-title', start: 'top 85%' } }
  );
  gsap.fromTo('.kontakt-desc',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.15,
      scrollTrigger: { trigger: '.kontakt-desc', start: 'top 85%' } }
  );
  gsap.fromTo('.btn-wa',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.25,
      scrollTrigger: { trigger: '.btn-wa', start: 'top 88%' } }
  );
}

// ── Navigation: hide on scroll down / show on scroll up ───────
function initNav() {
  const nav = document.getElementById('nav');
  let prevY = 0;

  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('scrolled', scroll > 20);
    if (scroll > prevY + 8 && scroll > 100) nav.classList.add('hidden');
    else if (scroll < prevY - 8 || scroll < 80) nav.classList.remove('hidden');
    prevY = scroll;
  });
}

// ── Mobile nav toggle ────────────────────────────────────────
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── FAQ accordion ─────────────────────────────────────────────
function initAccordion() {
  document.querySelectorAll('.acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const open  = btn.getAttribute('aria-expanded') === 'true';
      const panel = btn.nextElementSibling;
      const wrap  = btn.closest('.accordion');

      wrap.querySelectorAll('.acc-btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.style.maxHeight = null;
      });

      if (!open) {
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
}

// ── Preloader ─────────────────────────────────────────────────
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const line      = preloader.querySelector('.pre-line');
  const text      = preloader.querySelector('.pre-text');
  const wipe      = preloader.querySelector('.pre-wipe');
  const stopPreCanvas = initPreCanvas();

  gsap.timeline({
    onComplete() {
      if (stopPreCanvas) stopPreCanvas();
      document.body.classList.remove('is-loading');
      preloader.style.display = 'none';
      lenis.start();
      playHeroAnim();
      initParticles();
      initScrollAnims();
    }
  })
  .to(line, {
    width: '100%',
    duration: 0.85,
    ease: 'power3.inOut',
  })
  .to(text, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out',
  }, '-=0.15')
  .to([line, text], {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.in',
    delay: 0.75,
  })
  .to(preloader, {
    opacity: 0,
    scale: 1.04,
    duration: 1.1,
    ease: 'power2.inOut',
  }, '-=0.1');
}

// ── Preloader canvas orbs ────────────────────────────────────
function initPreCanvas() {
  const canvas = document.getElementById('pre-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }, { passive: true });

  const COLS = [[200,169,110],[240,215,160],[255,248,210],[220,185,130]];
  class Mote {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x      = canvas.width  * 0.3 + Math.random() * canvas.width  * 0.4;
      this.y      = initial ? Math.random() * canvas.height : canvas.height * 0.7 + Math.random() * canvas.height * 0.4;
      this.r      = Math.random() * 2.2 + 0.5;
      this.vx     = (Math.random() - 0.5) * 0.35;
      this.vy     = -(Math.random() * 0.9 + 0.3);
      this.age    = initial ? Math.floor(Math.random() * 200) : 0;
      this.maxAge = Math.random() * 200 + 120;
      this.maxA   = Math.random() * 0.7 + 0.2;
      this.alpha  = 0;
      this.rgb    = COLS[Math.floor(Math.random() * COLS.length)];
      this.w      = Math.random() * Math.PI * 2;
    }
    tick() {
      this.w += 0.02;
      this.x += this.vx + Math.sin(this.w) * 0.2;
      this.y += this.vy;
      this.age++;
      const t = this.age / this.maxAge;
      this.alpha = t < 0.15 ? (t/0.15)*this.maxA : t > 0.72 ? ((1-t)/0.28)*this.maxA : this.maxA;
      if (this.age > this.maxAge) this.reset(false);
    }
    draw() {
      const [r,g,b] = this.rgb;
      const grd = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*7);
      grd.addColorStop(0,   `rgba(${r},${g},${b},${this.alpha})`);
      grd.addColorStop(0.4, `rgba(${r},${g},${b},${this.alpha*0.4})`);
      grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.r*7,0,Math.PI*2);
      ctx.fillStyle = grd;
      ctx.fill();
    }
  }

  const motes = Array.from({ length: 48 }, () => new Mote());
  let running = true;
  (function loop() {
    if (!running) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    motes.forEach(m => { m.tick(); m.draw(); });
    requestAnimationFrame(loop);
  })();
  return () => { running = false; };
}

// ── Generic mini orbs (reusable) ─────────────────────────────
function initMiniOrbs(canvasId, count = 32) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = [
    [200, 169, 110],
    [240, 215, 160],
    [255, 248, 210],
    [175, 140,  80],
  ];

  class MiniOrb {
    constructor(initial) { this.initial = initial; this.reset(); }
    reset() {
      this.x      = Math.random() * canvas.width;
      this.y      = this.initial ? Math.random() * canvas.height : canvas.height + 10;
      this.r      = Math.random() * 1.8 + 0.4;
      this.vx     = (Math.random() - 0.5) * 0.28;
      this.vy     = -(Math.random() * 0.7 + 0.2);
      this.age    = this.initial ? Math.floor(Math.random() * 200) : 0;
      this.maxAge = Math.random() * 180 + 100;
      this.maxA   = Math.random() * 0.65 + 0.18;
      this.alpha  = 0;
      this.rgb    = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.wobble = Math.random() * Math.PI * 2;
    }
    tick() {
      this.wobble += 0.025;
      this.x += this.vx + Math.sin(this.wobble) * 0.15;
      this.y += this.vy;
      this.age++;
      const t = this.age / this.maxAge;
      this.alpha = t < 0.15
        ? (t / 0.15) * this.maxA
        : t > 0.72
          ? ((1 - t) / 0.28) * this.maxA
          : this.maxA;
      if (this.age > this.maxAge) { this.initial = false; this.reset(); }
    }
    draw() {
      const [r, g, b] = this.rgb;
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
      grd.addColorStop(0,   `rgba(${r},${g},${b},${this.alpha})`);
      grd.addColorStop(0.4, `rgba(${r},${g},${b},${this.alpha * 0.4})`);
      grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }
  }

  const half = Math.floor(count / 2);
  const orbs = Array.from({ length: count }, (_, i) => new MiniOrb(i < half));
  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    orbs.forEach(o => { o.tick(); o.draw(); });
    requestAnimationFrame(loop);
  })();
}

// ── Marquee JS ───────────────────────────────────────────────
function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const firstSpan = track.querySelector('span');
  let x = 0;
  let spanWidth = firstSpan.offsetWidth;
  window.addEventListener('resize', () => { spanWidth = firstSpan.offsetWidth; }, { passive: true });
  (function tick() {
    x -= 1.5;
    if (x <= -spanWidth) x = 0;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(tick);
  })();
}

// ── Bootstrap ─────────────────────────────────────────────────
initNav();
initMobileNav();
initAccordion();
initMagnetic();
initMarquee();
initMiniOrbs('preis-canvas', 32);
initMiniOrbs('about-canvas', 24);
initMiniOrbs('testimonial-canvas', 40);
initPreloader();
