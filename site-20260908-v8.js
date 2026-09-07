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

// Three visual speeds: normal document content, a slower logo, and the single
// rear background moving slowest. By the bottom of the page the logo has
// travelled completely above the viewport and is no longer visible.
let parallaxFrame = 0;

const updateParallax = () => {
  const scrollY = window.scrollY;
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, scrollY / scrollRange);

  // Keep the one tall background filling the full site while giving it a very
  // gentle parallax drift; the extra 220px overscan in CSS prevents an edge gap.
  const backgroundShift = -Math.min(200, scrollY * 0.035);

  // Move logo distinctly faster than the rear image but slower than content.
  // Add a progress-based travel component so it is guaranteed to be gone at bottom.
  const logoShift = -(scrollY * 0.16 + progress * window.innerHeight * 1.15);
  const logoOpacity = progress < 0.82 ? 0.18 : 0.18 * Math.max(0, (1 - progress) / 0.18);

  document.documentElement.style.setProperty("--background-shift", `${backgroundShift.toFixed(1)}px`);
  document.documentElement.style.setProperty("--logo-shift", `${logoShift.toFixed(1)}px`);
  document.documentElement.style.setProperty("--logo-opacity", logoOpacity.toFixed(3));
  parallaxFrame = 0;
};

const requestParallaxUpdate = () => {
  if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateParallax);
};

updateParallax();
window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
window.addEventListener("resize", requestParallaxUpdate, { passive: true });
