const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

menuToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".site-nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

// Move the second logo slowly while the text scrolls normally. Near the end of
// the page it fades completely, so it is no longer visible at the bottom.
const setLogoParallax = () => {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 0;
  document.documentElement.style.setProperty("--parallax-progress", progress.toFixed(4));
};

setLogoParallax();
window.addEventListener("scroll", setLogoParallax, { passive: true });
window.addEventListener("resize", setLogoParallax, { passive: true });
