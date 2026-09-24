(() => {
  const header = document.querySelector('.topbar');
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!header || !nav || !toggle) return;
  const mobile = window.matchMedia('(max-width: 900px)');
  const close = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  const position = () => {
    if (!mobile.matches) return;
    const top = Math.max(0, Math.min(innerHeight, header.getBoundingClientRect().bottom));
    nav.style.setProperty('--menu-top', `${top}px`);
  };
  const place = () => {
    close();
    // Outside the masked header, the fixed menu cannot expand its height
    // or alter the document's scroll range and parallax calculations.
    const parent = mobile.matches ? document.body : header;
    if (nav.parentNode !== parent) parent.appendChild(nav);
    position();
  };
  place();
  mobile.addEventListener('change', place);
  toggle.addEventListener('click', () => {
    position();
    if (!nav.classList.contains('open')) nav.scrollTop = 0;
  });
  window.addEventListener('resize', position, { passive: true });
  window.addEventListener('scroll', () => {
    if (nav.classList.contains('open')) position();
  }, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      close();
      toggle.focus({ preventScroll: true });
    }
  });
})();
