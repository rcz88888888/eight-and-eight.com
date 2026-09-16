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

let parallaxFrame = 0;
const parallaxLogo = document.querySelector(".parallax-logo");
const logoScale = 1.15;

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

  document.documentElement.style.setProperty("--background-shift", `${(scrollY * -0.02).toFixed(2)}px`);
  document.documentElement.style.setProperty("--background-rotation", `${(progress * 45).toFixed(2)}deg`);
  document.documentElement.style.setProperty("--logo-shift", `${(-delayedLogoProgress * getLogoExitTravel()).toFixed(1)}px`);
  document.documentElement.style.setProperty("--logo-rotation", `${(rotationProgress * 360).toFixed(2)}deg`);
  parallaxFrame = 0;
};

const requestParallaxUpdate = () => {
  if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateParallax);
};

updateParallax();
window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
window.addEventListener("resize", requestParallaxUpdate, { passive: true });
