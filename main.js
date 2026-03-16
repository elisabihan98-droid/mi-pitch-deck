/* ============================================================
   EASY BRAND — main.js
   GSAP + ScrollTrigger driven presentation logic
   ============================================================ */

// ── Data ──────────────────────────────────────────────────
const DATA_URL = '../../data/easy.json';

// ── Init on DOM ready ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Load data
  let data = {};
  try {
    const res = await fetch(DATA_URL);
    data = await res.json();
  } catch (e) {
    console.warn('Could not load data JSON, using inline fallback');
    data = window.__EASY_DATA__ || {};
  }

  // Render dynamic content
  renderZones(data.zones || []);
  renderKPIs(data.kpis || []);

  // GSAP
  gsap.registerPlugin(ScrollTrigger);

  // Init utilities
  initProgressBar();
  initNavScroll();
  initVideoAutoplay();

  // Animations
  initHeroAnimation();
  initScrollAnimations();
  initKPICounters(data.kpis || []);
  initChart(data.growthData);
  initZoneDetail(data.zones || []);
  initNavDots();
});

// ── Progress Bar ───────────────────────────────────────────
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

// ── Nav scroll ────────────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── Video autoplay ────────────────────────────────────────
function initVideoAutoplay() {
  document.querySelectorAll('video[data-autoplay]').forEach(v => {
    v.muted = true; v.playsInline = true;
    const io = new IntersectionObserver(([e]) => {
      e.isIntersecting ? v.play().catch(() => {}) : v.pause();
    }, { threshold: 0.4 });
    io.observe(v);
  });
}

// ── Nav Dots ──────────────────────────────────────────────
function initNavDots() {
  const sections = document.querySelectorAll('.section[id]');
  const dots = document.querySelectorAll('.nav__dot');
  if (!dots.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = Array.from(sections).indexOf(e.target);
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => sections[i]?.scrollIntoView({ behavior: 'smooth' }));
  });
}

// ── Hero animation ────────────────────────────────────────
function initHeroAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero__eyebrow', { opacity: 0, y: 20, duration: 0.8 })
    .from('.hero__title .line', {
      yPercent: 110,
      duration: 1,
      stagger: 0.12,
    }, '-=0.4')
    .from('.hero__subtitle', { opacity: 0, y: 24, duration: 0.8 }, '-=0.5')
    .from('.hero__meta', { opacity: 0, y: 16, duration: 0.6 }, '-=0.4')
    .from('.hero__scroll-hint', { opacity: 0, duration: 0.6 }, '-=0.2');
}

// ── Scroll animations ─────────────────────────────────────
function initScrollAnimations() {
  // Generic fade-up elements
  gsap.utils.toArray('[data-fade]').forEach(el => {
    const delay = parseFloat(el.dataset.delay || 0);
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      delay,
      ease: 'power3.out',
    });
  });

  // Section headers
  gsap.utils.toArray('.section-header').forEach(header => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });
    tl.from(header.querySelector('.label, .chip'), { opacity: 0, x: -20, duration: 0.6 })
      .from(header.querySelector('.display-lg, .display-md'), {
        opacity: 0, y: 30, duration: 0.8
      }, '-=0.3')
      .from(header.querySelector('.body-lg'), {
        opacity: 0, y: 20, duration: 0.6
      }, '-=0.4');
  });

  // Zone cards stagger
  ScrollTrigger.create({
    trigger: '.zones-grid',
    start: 'top 75%',
    onEnter: () => {
      gsap.from('.zone-card', {
        opacity: 0,
        y: 50,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power3.out',
      });
    },
  });

  // Trends stagger
  ScrollTrigger.create({
    trigger: '.trends-row',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.trend-pill', {
        opacity: 0,
        x: -30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }
  });

  // KPI cards stagger
  ScrollTrigger.create({
    trigger: '.kpi-grid',
    start: 'top 75%',
    onEnter: () => {
      gsap.from('.kpi-card', {
        opacity: 0,
        y: 40,
        scale: 0.96,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }
  });

  // Floorplan reveal
  const fp = document.querySelector('.floorplan-wrap');
  if (fp) {
    gsap.from(fp, {
      scrollTrigger: { trigger: fp, start: 'top 75%' },
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: 'power3.out',
    });
    // Animate floorplan zones one by one
    gsap.utils.toArray('.fp-zone').forEach((zone, i) => {
      gsap.from(zone, {
        scrollTrigger: { trigger: fp, start: 'top 70%' },
        opacity: 0,
        duration: 0.5,
        delay: i * 0.12,
        ease: 'power2.out',
      });
    });
  }

  // Outro pinned section
  const outro = document.querySelector('.outro-section');
  if (outro) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: outro,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      }
    });
    tl.from('.outro__brand', { opacity: 0, y: 60, duration: 1, ease: 'power3.out' })
      .from('.outro__tagline', { opacity: 0, duration: 0.6 }, '-=0.3')
      .from('.outro__cta', { opacity: 0, y: 20, duration: 0.6 }, '-=0.2')
      .from('.outro__logos', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3');
  }
}

// ── Render Zones ──────────────────────────────────────────
function renderZones(zones) {
  const grid = document.getElementById('zones-grid');
  if (!grid || !zones.length) return;

  grid.innerHTML = zones.map(z => `
    <div class="zone-card" style="--card-color: ${z.color}" data-zone-id="${z.id}" data-fade>
      <span class="zone-card__trend">${z.trend}</span>
      <div class="zone-card__number">${String(z.id).padStart(2,'0')}</div>
      <div class="zone-card__icon">${z.icon}</div>
      <div class="zone-card__name">${z.name}</div>
      <div class="zone-card__subtitle">${z.subtitle}</div>
      <ul class="zone-card__highlights">
        ${z.highlights.map(h => `<li class="zone-card__highlight">${h}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// ── Render KPIs ───────────────────────────────────────────
function renderKPIs(kpis) {
  const grid = document.getElementById('kpi-grid');
  if (!grid || !kpis.length) return;

  grid.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-value">
        <span class="kpi-number" data-target="${k.value}">${k.value}</span>
        <span class="suffix">${k.suffix}</span>
      </div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-desc">${k.description}</div>
    </div>
  `).join('');
}

// ── KPI Animated Counters ─────────────────────────────────
function initKPICounters(kpis) {
  ScrollTrigger.create({
    trigger: '#kpi-grid',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      document.querySelectorAll('.kpi-number').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const isInt = Number.isInteger(target);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2.2,
          ease: 'power2.out',
          snap: { val: isInt ? 1 : 0.1 },
          onUpdate: () => {
            el.textContent = isInt ? Math.round(obj.val) : obj.val.toFixed(1);
          }
        });
      });
    }
  });
}

// ── Zone Detail Modal ─────────────────────────────────────
function initZoneDetail(zones) {
  const modal = document.getElementById('zone-detail');
  if (!modal) return;

  document.addEventListener('click', e => {
    const card = e.target.closest('.zone-card');
    if (card) {
      const id = parseInt(card.dataset.zoneId);
      const zone = zones.find(z => z.id === id);
      if (zone) openZoneDetail(zone, modal);
    }
    if (e.target === modal || e.target.closest('.zone-detail__close')) {
      closeZoneDetail(modal);
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeZoneDetail(modal);
  });
}

function openZoneDetail(zone, modal) {
  modal.querySelector('.zone-detail__inner').innerHTML = `
    <button class="zone-detail__close" aria-label="Cerrar">✕</button>
    <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
      <span style="font-family:var(--font-display);font-size:3rem;color:${zone.color};">${String(zone.id).padStart(2,'0')}</span>
      <div>
        <div style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:0.25rem;">${zone.trend}</div>
        <div style="font-family:var(--font-display);font-size:2rem;color:var(--text-primary);">${zone.name}</div>
        <div style="font-family:var(--font-body);font-size:0.85rem;color:var(--text-secondary);">${zone.subtitle}</div>
      </div>
    </div>
    <div style="font-family:var(--font-body);font-size:0.95rem;color:var(--text-secondary);line-height:1.7;padding:1.2rem;background:var(--bg-3);border-radius:12px;border-left:3px solid ${zone.color};margin-bottom:1.5rem;">
      ${zone.objective}
    </div>
    <div style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:0.75rem;">Highlights</div>
    <ul style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
      ${zone.highlights.map(h => `
        <li style="display:flex;align-items:center;gap:0.5rem;font-family:var(--font-body);font-size:0.85rem;color:var(--text-secondary);">
          <span style="width:6px;height:6px;border-radius:50%;background:${zone.color};flex-shrink:0;"></span>${h}
        </li>`).join('')}
    </ul>
  `;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeZoneDetail(modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Growth Chart ──────────────────────────────────────────
function initChart(growthData) {
  const canvas = document.getElementById('growth-chart');
  if (!canvas || !growthData) return;

  let chartCreated = false;
  ScrollTrigger.create({
    trigger: canvas,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      if (chartCreated) return;
      chartCreated = true;

      new Chart(canvas, {
        type: 'line',
        data: {
          labels: growthData.labels,
          datasets: [
            {
              label: 'Tienda Flagship',
              data: growthData.flagship,
              borderColor: '#E8A020',
              backgroundColor: 'rgba(232,160,32,0.08)',
              borderWidth: 2.5,
              pointBackgroundColor: '#E8A020',
              pointRadius: 5,
              pointHoverRadius: 8,
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Modelo Tradicional',
              data: growthData.traditional,
              borderColor: 'rgba(240,237,232,0.25)',
              backgroundColor: 'rgba(240,237,232,0.03)',
              borderWidth: 1.5,
              pointBackgroundColor: 'rgba(240,237,232,0.4)',
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true,
              tension: 0.4,
              borderDash: [6, 4],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          animation: {
            duration: 1800,
            easing: 'easeInOutQuart',
          },
          plugins: {
            legend: {
              labels: {
                color: 'rgba(240,237,232,0.55)',
                font: { family: 'DM Sans', size: 13 },
                padding: 24,
                usePointStyle: true,
                pointStyleWidth: 12,
              },
            },
            tooltip: {
              backgroundColor: '#1C2535',
              borderColor: 'rgba(232,160,32,0.3)',
              borderWidth: 1,
              titleColor: '#F0EDE8',
              bodyColor: 'rgba(240,237,232,0.6)',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} (índice base 100)`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.04)' },
              ticks: { color: 'rgba(240,237,232,0.4)', font: { family: 'DM Mono', size: 11 } },
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.04)' },
              ticks: { color: 'rgba(240,237,232,0.4)', font: { family: 'DM Mono', size: 11 } },
            },
          },
        },
      });
    },
  });
}
