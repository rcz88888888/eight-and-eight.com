(() => {
  'use strict';
  const header = document.querySelector('.topbar');
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!header || !nav || !toggle) return;
  const mobile = matchMedia('(max-width: 900px)');
  let frame = 0;
  const set = (element, name, value) => {
    if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
  };
  function position() {
    frame = 0;
    if (!mobile.matches) return;
    const rect = header.getBoundingClientRect();
    const open = nav.classList.contains('open');
    const menuHeight = open ? nav.getBoundingClientRect().height : 0;
    // Read before writing; no computed-style queries in the scroll handler.
    set(nav, '--menu-left', `${rect.left}px`);
    set(nav, '--menu-width', `${rect.width}px`);
    set(nav, '--menu-banner-height', `${rect.height}px`);
    set(nav, '--menu-top', `${Math.max(0, Math.min(innerHeight, rect.bottom))}px`);
    set(header, '--expanded-menu-height', `${menuHeight}px`);
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(position); };
  function sync() {
    const open = nav.classList.contains('open');
    header.classList.toggle('menu-expanded', mobile.matches && open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    schedule();
    window.EightEightEffects?.invalidate();
  }
  function close() { nav.classList.remove('open'); sync(); }
  function place() {
    close();
    const parent = mobile.matches ? document.body : header;
    if (nav.parentNode !== parent) parent.appendChild(nav);
    schedule();
  }
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    if (nav.classList.contains('open')) nav.scrollTop = 0;
    sync();
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  new MutationObserver(sync).observe(nav, {attributes: true, attributeFilter: ['class']});
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(nav);
  mobile.addEventListener('change', place);
  addEventListener('resize', schedule, {passive: true});
  (document.querySelector('.content-scroll') || window).addEventListener('scroll',
    () => { if (nav.classList.contains('open')) schedule(); }, {passive: true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      close();
      toggle.focus({preventScroll: true});
    }
  });
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  place();
})();
