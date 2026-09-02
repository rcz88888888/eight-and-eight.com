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

// Subtle logo parallax: the content scrolls normally while the background logo
// follows at only a small fraction of the page movement.
const setLogoParallax = () => {
  const shift = Math.max(-42, Math.min(42, window.scrollY * 0.055));
  document.documentElement.style.setProperty("--logo-shift", `${shift}px`);
};

setLogoParallax();
window.addEventListener("scroll", setLogoParallax, { passive: true });
