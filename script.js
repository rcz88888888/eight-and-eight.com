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

// The content uses native scrolling. Only the second background layer moves:
// from a fully visible logo at the top to its lower half at the page end.
const setLogoParallax = () => {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 0;
  document.documentElement.style.setProperty("--logo-shift", `${progress * -25}vh`);
  document.documentElement.style.setProperty("--logo-opacity", String(.20 * (1 - progress)));
};

setLogoParallax();
window.addEventListener("scroll", setLogoParallax, { passive: true });
window.addEventListener("resize", setLogoParallax, { passive: true });
