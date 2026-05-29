/* ══════════════════════════════════════════
   YTGT — script.js  |  Lightweight
══════════════════════════════════════════ */

// ── Fixed header — add 'scrolled' class after hero ──
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

document.querySelectorAll('.hamburger').forEach(btn => {
  btn.addEventListener('click', openDrawer);
});
drawerClose.addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);

// ── Theme toggle ──
const html      = document.documentElement;
const themeBtn  = document.getElementById('themeBtn');
const iconMoon  = themeBtn.querySelector('.icon-moon');
const iconSun   = themeBtn.querySelector('.icon-sun');
let dark = true;

themeBtn.addEventListener('click', () => {
  dark = !dark;
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  iconMoon.style.display = dark ? 'block' : 'none';
  iconSun.style.display  = dark ? 'none'  : 'block';
});

// ── Rotating hero text ──
const words = document.querySelectorAll('.tw');
let wIdx = 0;

function cycleWord() {
  // Current word falls down
  words[wIdx].classList.remove('active');

  // Next word rises up (slight delay so fall starts first)
  wIdx = (wIdx + 1) % words.length;
  setTimeout(() => words[wIdx].classList.add('active'), 120);
}

// Start after hero animations finish
setTimeout(() => setInterval(cycleWord, 2800), 1600);

// ── Lightweight Canvas ──
const canvas = document.getElementById('heroCanvas');
const ctx    = canvas.getContext('2d');
let W, H, pts;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = canvas.parentElement.offsetHeight;
}

// Simple particle — no connection lines (keeps it O(n) not O(n²))
class Dot {
  constructor() { this.r(); }
  r() {
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
    if (this.x < -4 || this.x > W+4 || this.y < -4 || this.y > H+4) this.r();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.sz, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(96,165,250,${this.a})`;
    ctx.fill();
  }
}

function drawGrid() {
  const s = 68;
  ctx.lineWidth   = .5;
  ctx.strokeStyle = 'rgba(59,130,246,.07)';
  for (let x = 0; x <= W; x += s) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += s) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  // Dot intersections
  ctx.fillStyle = 'rgba(96,165,250,.11)';
  for (let x = 0; x <= W; x += s)
    for (let y = 0; y <= H; y += s) {
      ctx.beginPath(); ctx.arc(x, y, 1.1, 0, Math.PI*2); ctx.fill();
    }
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  drawGrid();
  pts.forEach(p => p.tick());
  requestAnimationFrame(loop);
}

function initCanvas() {
  resize();
  // Only 55 particles — fast and clean
  pts = Array.from({ length: 55 }, () => new Dot());
  loop();
}

window.addEventListener('resize', resize, { passive: true });
initCanvas();

// ── Success Modal ──
function showSuccessModal(msg) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0);
    z-index:9999;display:flex;align-items:flex-end;
    justify-content:center;padding-bottom:2rem;
    transition:background .35s ease;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background:var(--card);
    border:1px solid var(--border);
    border-radius:24px;
    padding:2.5rem 2rem;
    text-align:center;
    max-width:380px;
    width:90%;
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    box-shadow:0 -8px 40px rgba(59,130,246,0.15);
    transform:translateY(120%);
    opacity:0;
    transition:transform .55s cubic-bezier(.16,1,.3,1), opacity .4s ease;
  `;

  modal.innerHTML = `
    <div style="font-size:2.8rem;margin-bottom:1rem;">✅</div>
    <h3 style="font-family:var(--ft);font-size:1.2rem;font-weight:700;color:var(--text);margin-bottom:.6rem;">${msg || 'Message Sent!'}</h3>
    <p style="font-size:.85rem;color:var(--muted);margin-bottom:1.5rem;">Thank you! We'll get back to you soon.</p>
    <button id="closeSuccessModal" style="background:var(--blue);color:#fff;border:none;padding:.6rem 1.8rem;border-radius:100px;font-size:.88rem;font-weight:600;cursor:pointer;transition:opacity .2s;">Got it</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.background = "rgba(0,0,0,0.5)";
      modal.style.transform = "translateY(0)";
      modal.style.opacity = "1";
    });
  });

  function closeModal() {
    overlay.style.background = "rgba(0,0,0,0)";
    modal.style.transform = "translateY(120%)";
    modal.style.opacity = "0";
    setTimeout(() => overlay.remove(), 500);
  }

  document.getElementById("closeSuccessModal").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
}

// ── Contact Form (Web3Forms) ──
const contactForm = document.getElementById('heroContactForm');
if (contactForm) {
  contactForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = contactForm.querySelector("button[type='submit']");
    const orig = btn ? btn.innerHTML : '';
    if (btn) { btn.innerHTML = 'Sending...'; btn.disabled = true; }
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(contactForm)
      });
      const data = await res.json();
      if (data.success) {
        showSuccessModal("Message Sent!");
        contactForm.reset();
      } else {
        showSuccessModal("Failed to send. Please try again.");
      }
    } catch {
      showSuccessModal("Network error. Please email us directly.");
    } finally {
      if (btn) { btn.innerHTML = orig; btn.disabled = false; }
    }
  });
}

// ── How We Work Tabs ──
const hwwTabs = document.querySelectorAll('.hww-tab');
let hwwCurrent = 0;
let hwwInterval;

function setHwwTab(index) {
  hwwTabs.forEach(t => {
    t.classList.remove('active');
    t.style.animation = '';
  });
  
  const activeTab = hwwTabs[index];
  activeTab.classList.add('active');
  
  // Pop-bounce effect on the active tab
  activeTab.style.animation = 'hwwPop .45s cubic-bezier(.16,1,.3,1)';
  setTimeout(() => {
    activeTab.style.animation = '';
  }, 450);
  
  hwwCurrent = index;
}

// Click to control
hwwTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const idx = parseInt(tab.dataset.tab);
    setHwwTab(idx);
    resetHwwAuto();
  });
});

// Auto-scroll tabs every 3s
function startHwwAuto() {
  hwwInterval = setInterval(() => {
    hwwCurrent = (hwwCurrent + 1) % hwwTabs.length;
    setHwwTab(hwwCurrent);
  }, 3000);
}

function resetHwwAuto() {
  clearInterval(hwwInterval);
  startHwwAuto();
}

if (hwwTabs.length) startHwwAuto();
