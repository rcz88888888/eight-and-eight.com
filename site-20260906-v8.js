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

// Eight background planes move at progressively different slow parallax rates.
// The logo moves slightly faster than the rear planes.
let parallaxFrame = 0;

const updateParallax = () => {
  const scrollY = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(1, scrollY / scrollRange) : 0;
  const fade = progress < .86 ? 1 : Math.max(0, (1 - progress) / .14);
  const logoOpacity = .156 * fade;
  const rates = [.018, .026, .034, .042, .050, .058, .066, .074];
  rates.forEach((rate, index) => {
    document.documentElement.style.setProperty(`--bg-shift-${index + 1}`, `${(scrollY * -rate).toFixed(1)}px`);
  });
  document.documentElement.style.setProperty("--logo-shift", `${(scrollY * -.12).toFixed(1)}px`);
  document.documentElement.style.setProperty("--logo-layer-opacity", logoOpacity.toFixed(3));
  parallaxFrame = 0;
};

const requestParallaxUpdate = () => {
  if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateParallax);
};

updateParallax();
window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
window.addEventListener("resize", requestParallaxUpdate, { passive: true });
