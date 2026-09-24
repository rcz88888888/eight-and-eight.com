const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

menuToggle?.addEventListener("click", () => {
  const open = nav?.classList.toggle("open") ?? false;
  menuToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".site-nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const backgroundStack = document.querySelector(".background-layers");
const parallaxLogo = document.querySelector(".parallax-logo");
const logoScale = 1.15;
let parallaxFrame = 0;
let backgroundLogos = [];

// Seeded pseudo-random generator: random-looking layout, stable between reloads.
const mulberry32 = seed => () => {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const buildBackground = () => {
  if (!backgroundStack) return;
  const rand = mulberry32(88888888);
  const pageHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
  backgroundStack.style.height = `${pageHeight}px`;
  backgroundStack.replaceChildren();

  // 64 logos on 64 separate layers. Size is randomly within -8% / +8%
  // of the original small background-logo size. Opacity and scroll factor vary independently.
  for (let i = 0; i < 64; i += 1) {
    const layer = document.createElement("div");
    layer.className = "background-layer";
    layer.style.zIndex = String(i + 1);

    const logo = document.createElement("span");
    logo.className = "background-logo";
    const x = 3 + rand() * 94;
    const y = rand() * Math.max(window.innerHeight, pageHeight - 180);
    const size = 0.92 + rand() * 0.16;        // -8% ... +8%
    const opacity = 0.08 + rand() * 0.56;     // 8% ... 64%
    const speed = 0.008 + rand() * 0.072;     // individual slow mouse/scroll factor
    const direction = rand() < 0.18 ? -1 : 1;

    logo.style.setProperty("--x", `${x.toFixed(3)}%`);
    logo.style.setProperty("--y", `${y.toFixed(1)}px`);
    logo.style.setProperty("--size", size.toFixed(4));
    logo.style.setProperty("--opacity", opacity.toFixed(4));
    logo.dataset.speed = String(speed * direction);
    layer.appendChild(logo);
    backgroundStack.appendChild(layer);
  }
  backgroundLogos = [...backgroundStack.querySelectorAll(".background-logo")];
};

const getLogoExitTravel = () => {
  if (!parallaxLogo) return 0;
  const styles = window.getComputedStyle(parallaxLogo);
  const top = Number.parseFloat(styles.top) || 0;
  const boxWidth = parallaxLogo.offsetWidth;
  const boxHeight = parallaxLogo.offsetHeight;
  const sourceWidth = 922;
  const sourceHeight = 1368;
  const visibleContentBottom = 1223;
  const scale = Math.min(boxWidth / sourceWidth, boxHeight / sourceHeight);
  const centeredOffsetY = (boxHeight - sourceHeight * scale) / 2;
  const visibleBottom = centeredOffsetY + visibleContentBottom * scale;
  const scaledVisibleBottom = boxHeight / 2 + (visibleBottom - boxHeight / 2) * logoScale;
  return top + scaledVisibleBottom + 1;
};

const updateParallax = () => {
  const scrollY = window.scrollY;
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, scrollY / scrollRange));
  const delayedLogoProgress = progress ** 6;
  const rotationProgress = 0.5 - 0.5 * Math.cos(Math.PI * progress);

  backgroundLogos.forEach(logo => {
    const speed = Number.parseFloat(logo.dataset.speed || "0");
    logo.style.setProperty("--parallax-y", `${(-scrollY * speed).toFixed(2)}px`);
  });

  document.documentElement.style.setProperty("--logo-shift", `${(-delayedLogoProgress * getLogoExitTravel()).toFixed(1)}px`);
  document.documentElement.style.setProperty("--logo-rotation", `${(rotationProgress * 360).toFixed(2)}deg`);
  parallaxFrame = 0;
};

const requestParallaxUpdate = () => {
  if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateParallax);
};

buildBackground();
updateParallax();
window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
window.addEventListener("resize", () => {
  buildBackground();
  requestParallaxUpdate();
}, { passive: true });
