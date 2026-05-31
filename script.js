/* ══════════════════════════════════════════
   YTGT — script.js  |  Optimised for low-end mobile
══════════════════════════════════════════ */

// ── Fixed header ──
const navMain = document.getElementById('navMain');
window.addEventListener('scroll', () => {
  navMain.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Side Drawer ──
const overlay    = document.getElementById('overlay');
const drawer     = document.getElementById('drawer');
const drawerClose = document.getElementById('drawerClose');

function openDrawer() {
  overlay.classList.add('show');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  overlay.classList.remove('show');
  drawer.classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('.hamburger').forEach(btn => btn.addEventListener('click', openDrawer));
drawerClose.addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);

// ── Theme toggle ──
const html     = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const iconMoon = themeBtn.querySelector('.icon-moon');
const iconSun  = themeBtn.querySelector('.icon-sun');
let dark = true;

const themeColorMeta = document.getElementById('themeColor');

themeBtn.addEventListener('click', () => {
  dark = !dark;
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  iconMoon.style.display = dark ? 'block' : 'none';
  iconSun.style.display  = dark ? 'none'  : 'block';
  // Sync status bar color with theme
  themeColorMeta.setAttribute('content', dark ? '#0B0F1C' : '#EFF6FF');
});

// ── Rotating hero text ──
const words = document.querySelectorAll('.tw');
let wIdx = 0;

function cycleWord() {
  words[wIdx].classList.remove('active');
  wIdx = (wIdx + 1) % words.length;
  setTimeout(() => words[wIdx].classList.add('active'), 120);
}
setTimeout(() => setInterval(cycleWord, 2800), 1600);

// ── Canvas (hero background) ──
// Skip canvas entirely on low-end devices (saves the most battery/CPU)
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('heroCanvas');

if (!prefersReduced && canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  let W, H, pts, animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
  }

  // Fewer particles on small screens — 8 on mobile, 20 on desktop
  const PARTICLE_COUNT = window.innerWidth < 768 ? 8 : 20;

  class Dot {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - .5) * .4;
      this.vy = (Math.random() - .5) * .4;
      this.sz = Math.random() * 1.5 + .4;
      this.a  = Math.random() * .45 + .08;
    }
    tick() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -4 || this.x > W + 4 || this.y < -4 || this.y > H + 4) this.reset();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${this.a})`;
      ctx.fill();
    }
  }

  // Pre-build grid path once — don't recalculate every frame
  let gridPath = null;
  function buildGrid() {
    const s = 68;
    gridPath = new Path2D();
    for (let x = 0; x <= W; x += s) { gridPath.moveTo(x, 0); gridPath.lineTo(x, H); }
    for (let y = 0; y <= H; y += s) { gridPath.moveTo(0, y); gridPath.lineTo(W, y); }
  }

  function drawGrid() {
    ctx.lineWidth   = .5;
    ctx.strokeStyle = 'rgba(59,130,246,.07)';
    ctx.stroke(gridPath);
    // intersection dots
    const s = 68;
    ctx.fillStyle = 'rgba(96,165,250,.11)';
    for (let x = 0; x <= W; x += s)
      for (let y = 0; y <= H; y += s) {
        ctx.beginPath(); ctx.arc(x, y, 1.1, 0, Math.PI * 2); ctx.fill();
      }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    pts.forEach(p => p.tick());
    animId = requestAnimationFrame(loop);
  }

  function startLoop() { if (!animId) animId = requestAnimationFrame(loop); }
  function stopLoop()  { cancelAnimationFrame(animId); animId = null; }

  function init() {
    resize();
    buildGrid();
    pts = Array.from({ length: PARTICLE_COUNT }, () => new Dot());
    startLoop();
  }

  // Only pause when tab is hidden (switching apps etc.) — never on scroll
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopLoop() : startLoop();
  });

  // Debounce resize so it doesn't fire 60x per second while dragging
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); buildGrid(); }, 150);
  }, { passive: true });

  init();
} else if (canvas) {
  // Hide canvas if reduced-motion is preferred
  canvas.style.display = 'none';
}

// ── Success Modal ──
function showSuccessModal(msg) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding-bottom:2rem;transition:background .35s ease;';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:var(--card);border:1px solid var(--border);border-radius:24px;padding:2.5rem 2rem;text-align:center;max-width:380px;width:90%;box-shadow:0 -8px 40px rgba(59,130,246,0.15);transform:translateY(120%);opacity:0;transition:transform .55s cubic-bezier(.16,1,.3,1),opacity .4s ease;';
  modal.innerHTML = `
    <div style="font-size:2.8rem;margin-bottom:1rem;">✅</div>
    <h3 style="font-family:var(--ft);font-size:1.2rem;font-weight:700;color:var(--text);margin-bottom:.6rem;">${msg || 'Message Sent!'}</h3>
    <p style="font-size:.85rem;color:var(--muted);margin-bottom:1.5rem;">Thank you! We'll get back to you soon.</p>
    <button id="closeSuccessModal" style="background:var(--blue);color:#fff;border:none;padding:.6rem 1.8rem;border-radius:100px;font-size:.88rem;font-weight:600;cursor:pointer;">Got it</button>
  `;

  wrap.appendChild(modal);
  document.body.appendChild(wrap);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    wrap.style.background = 'rgba(0,0,0,0.5)';
    modal.style.transform = 'translateY(0)';
    modal.style.opacity   = '1';
  }));

  function closeModal() {
    wrap.style.background  = 'rgba(0,0,0,0)';
    modal.style.transform  = 'translateY(120%)';
    modal.style.opacity    = '0';
    setTimeout(() => wrap.remove(), 500);
  }
  document.getElementById('closeSuccessModal').addEventListener('click', closeModal);
  wrap.addEventListener('click', e => { if (e.target === wrap) closeModal(); });
}

// ── Contact Form ──
const contactForm = document.getElementById('heroContactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = contactForm.querySelector("button[type='submit']");
    const orig = btn ? btn.innerHTML : '';
    if (btn) { btn.innerHTML = 'Sending…'; btn.disabled = true; }
    try {
      const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(contactForm) });
      const data = await res.json();
      showSuccessModal(data.success ? 'Message Sent!' : 'Failed to send. Please try again.');
      if (data.success) contactForm.reset();
    } catch {
      showSuccessModal('Network error. Please email us directly.');
    } finally {
      if (btn) { btn.innerHTML = orig; btn.disabled = false; }
    }
  });
}

// ── How We Work Tabs — no auto-scroll, tab 0 starts active ──
const hwwTabs = document.querySelectorAll('.hww-tab');

function setHwwTab(index) {
  hwwTabs.forEach((t, i) => t.classList.toggle('active', i === index));
}

// Click to switch tab
hwwTabs.forEach(tab => {
  tab.addEventListener('click', () => setHwwTab(parseInt(tab.dataset.tab)));
});

// Tab 0 is active by default (already in HTML), nothing else needed

// ── Video: play 5 times then stop; hover/tap to play once more ──
(function() {
  const videos = [
    document.getElementById('svcVideo1'),
    document.getElementById('svcVideo2')
  ].filter(Boolean);

  videos.forEach(vid => {
    let playCount = 0;
    const MAX_PLAYS = 5;

    // Auto-start when video enters viewport
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && playCount < MAX_PLAYS) {
        vid.play().catch(() => {});
      }
    }, { threshold: 0.3 });
    observer.observe(vid);

    vid.addEventListener('ended', () => {
      playCount++;
      if (playCount < MAX_PLAYS) {
        vid.play().catch(() => {});
      }
      // After 5 plays: video stays paused on last frame
    });

    // Desktop: hover plays once (only if already done autoplay)
    vid.parentElement.addEventListener('mouseenter', () => {
      if (vid.paused) vid.play().catch(() => {});
    });
    vid.parentElement.addEventListener('mouseleave', () => {
      if (!vid.paused) vid.pause();
    });

    // Mobile: tap plays once
    vid.parentElement.addEventListener('touchstart', () => {
      if (vid.paused) vid.play().catch(() => {});
    }, { passive: true });
  });
})();


// ── Our Code Tabs — horizontal slide ──
(function() {
  const tabs   = document.querySelectorAll('.s-tab');
  const track  = document.getElementById('s-ourcode-track');
  const clip   = document.getElementById('s-ourcode-clip');
  const slides = track ? track.querySelectorAll('.s-slide') : [];
  if (!tabs.length || !track || !clip || !slides.length) return;

  let cur = 0;

  function setWidths() {
    const w = clip.clientWidth;
    slides.forEach(s => { s.style.width = w + 'px'; });
  }

  function goTo(i) {
    tabs[cur].classList.remove('s-tab-active');
    cur = i;
    tabs[cur].classList.add('s-tab-active');
    track.style.transform = 'translateX(-' + (i * clip.clientWidth) + 'px)';
  }

  // Use index-based click handler (works regardless of data attribute name)
  tabs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { setWidths(); goTo(cur); }, 150);
  }, { passive: true });

  // Init — setWidths first, then goTo(0) to properly render the first slide
  setWidths();
  goTo(0);
})();


// Prevents opacity:0 flash when scrolling back to hero on slow devices
(function() {
  const animated = document.querySelectorAll(
    '.hero-title, .hero-sub, .hero-card, .hero-stats'
  );
  animated.forEach(el => {
    el.addEventListener('animationend', () => {
      el.style.opacity  = '1';
      el.style.transform = 'translateY(0)';
      el.style.animation = 'none'; // stop the animation, lock the state
    }, { once: true }); // fires only once, then removes itself
  });
})();
