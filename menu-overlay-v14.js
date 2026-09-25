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
    const rect = header.getBoundingClientRect();
    const top = Math.max(0, Math.min(innerHeight, rect.bottom));
    const style = getComputedStyle(header);
    const wallpaper = getComputedStyle(header, '::before');
    nav.style.setProperty('--menu-left', `${rect.left}px`);
    nav.style.setProperty('--menu-width', `${rect.width}px`);
    nav.style.setProperty('--menu-banner-height', `${rect.height}px`);
    nav.style.setProperty('--menu-ground', style.backgroundColor);
    nav.style.setProperty('--menu-opacity', style.opacity);
    nav.style.setProperty('--menu-blur', style.backdropFilter || 'none');
    nav.style.setProperty('--menu-wallpaper-opacity', wallpaper.opacity);
    nav.style.setProperty('--menu-wallpaper-blend', wallpaper.mixBlendMode);
    nav.style.setProperty('--menu-top', `${top}px`);
    header.style.setProperty('--expanded-menu-height', `${nav.classList.contains('open') ? nav.getBoundingClientRect().height : 0}px`);
    header.style.setProperty('--expanded-menu-ground', style.backgroundColor);
  };
  const place = () => {
    close();
    // Outside the masked header, the fixed menu cannot expand its height
    // or alter the document's scroll range and parallax calculations.
    const parent = mobile.matches ? document.body : header;
    if (nav.parentNode !== parent) parent.appendChild(nav);
    position();
  };
  const syncOpen = () => {
    header.classList.toggle('menu-expanded', mobile.matches && nav.classList.contains('open'));
    position();
  };
  new MutationObserver(syncOpen).observe(nav, { attributes: true, attributeFilter: ['class'] });
  new ResizeObserver(position).observe(nav);
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
