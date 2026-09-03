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

// The content uses native scrolling. The full background logo keeps one scale
// and travels only a small distance, creating a slower parallax movement.
const setLogoParallax = () => {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 0;
  document.documentElement.style.setProperty("--logo-shift", `${progress * -10}vh`);
};

setLogoParallax();
window.addEventListener("scroll", setLogoParallax, { passive: true });
window.addEventListener("resize", setLogoParallax, { passive: true });
