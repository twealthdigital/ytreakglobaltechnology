/* ══════════════════════════════════════════
   YTGT — script.js  |  Lightweight
══════════════════════════════════════════ */

// ── Sticky header on scroll ──
const navInitial = document.getElementById('navInitial');
const navSticky  = document.getElementById('navSticky');

window.addEventListener('scroll', () => {
  navSticky.classList.toggle('show', window.scrollY > navInitial.offsetHeight);
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