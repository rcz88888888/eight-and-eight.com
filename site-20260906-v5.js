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

// Wallpaper: 37.5% of normal scrolling speed.
// Logo travel is calculated from the page and viewport dimensions so its
// visible lower edge leaves the viewport exactly at the bottom of the page.
let parallaxFrame = 0;
const parallaxLogo = document.querySelector(".parallax-logo");
const logoScale = 1.15;

const getLogoExitTravel = () => {
  if (!parallaxLogo) return 0;

  const styles = window.getComputedStyle(parallaxLogo);
  const top = Number.parseFloat(styles.top) || 0;
  const boxWidth = parallaxLogo.offsetWidth;
  const boxHeight = parallaxLogo.offsetHeight;

  // Source size and alpha-content lower edge of Eight&Eight-logo.png.
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
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(1, scrollY / scrollRange) : 0;
  document.documentElement.style.setProperty("--background-shift", `${(scrollY * -.375).toFixed(1)}px`);
  document.documentElement.style.setProperty("--logo-shift", `${(-progress * getLogoExitTravel()).toFixed(1)}px`);
  document.documentElement.style.setProperty("--logo-rotation", `${(progress * 360).toFixed(2)}deg`);
  parallaxFrame = 0;
};

const requestParallaxUpdate = () => {
  if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateParallax);
};

updateParallax();
window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
window.addEventListener("resize", requestParallaxUpdate, { passive: true });
