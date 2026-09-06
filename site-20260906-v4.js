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

// Wallpaper: 4.5% of normal scrolling speed.
// Logo: 12% of normal scrolling speed, so it moves slightly faster while both
// remain behind the normally scrolling page content.
let parallaxFrame = 0;

const updateParallax = () => {
  const scrollY = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(1, scrollY / scrollRange) : 0;
  const fade = progress < .86 ? 1 : Math.max(0, (1 - progress) / .14);
  const logoOpacity = .08 * fade;
  document.documentElement.style.setProperty("--background-shift", `${(scrollY * -.045).toFixed(1)}px`);
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
