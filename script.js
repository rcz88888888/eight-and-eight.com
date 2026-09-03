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

// The content uses native scrolling. The full-page background image follows
// at eight percent of the regular scroll distance for a subtle parallax effect.
const setLogoParallax = () => {
  document.documentElement.style.setProperty("--logo-shift", `${window.scrollY * .08}px`);
};

setLogoParallax();
window.addEventListener("scroll", setLogoParallax, { passive: true });
window.addEventListener("resize", setLogoParallax, { passive: true });
