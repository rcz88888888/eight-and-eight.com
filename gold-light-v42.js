(() => {
  'use strict';

  const edges = ['Top', 'Right', 'Bottom', 'Left'];
  const frameSelector = [
    '.hero-card', '.section', '.section-label', '.partner-grid', '.partner-slot',
    '.service-grid', '.service-grid article', '.principles', '.principles div',
    '.process', '.contact-panel', '.contact-box', '.footer', '.topbar',
    '.wallpaper-end', '.contact-links a', '.footer a', '.site-nav'
  ].join(',');
  const frames = [...document.querySelectorAll(frameSelector)];
  const targets = [...new Set([
    ...frames, ...document.querySelectorAll('.site-nav a, .menu-toggle span')
  ])];
  const hero = document.querySelector('.hero-static-logo');
  const nav = document.querySelector('.site-nav');
  const header = document.querySelector('.topbar');
  const bottomBanner = document.querySelector('.wallpaper-end');
  const bannerRoots = new Map();
  for (const element of targets) {
    const root = element === bottomBanner ? bottomBanner :
      (element === header || header?.contains(element) || element === nav || nav?.contains(element)) ? header : null;
    if (root) {
      bannerRoots.set(element, root);
      element.classList.add('gold-banner-light');
    }
  }
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hollowMaskSupported = CSS.supports('mask-composite', 'exclude') ||
    CSS.supports('-webkit-mask-composite', 'xor');
  const unitX = 3 / Math.sqrt(13);
  const unitY = 2 / Math.sqrt(13);
  let pendingFrame = 0;
  let needsMeasure = true;

  targets.forEach(element => element.classList.add('gold-light-target'));

  function measureEdges() {
    // Read first, then write, to avoid repeatedly forcing page layout.
    const metrics = frames.map(element => {
      const style = getComputedStyle(element);
      return {
        element,
        widths: edges.map(edge => parseFloat(style[`border${edge}Width`]) || 0),
        rounded: ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft']
          .some(corner => parseFloat(style[`border${corner}Radius`]) > 0),
        position: style.position
      };
    });
    for (const {element, widths, rounded, position} of metrics) {
      const active = widths.some(width => width > 0);
      const useMask = active && rounded && hollowMaskSupported;
      element.classList.toggle('gold-rounded-light', useMask);
      element.classList.toggle('gold-straight-light', active && !rounded);
      if (useMask && position === 'static') element.classList.add('gold-frame-relative');
      edges.forEach((edge, index) => {
        element.style.setProperty(`--gold-edge-${edge.toLowerCase()}`, `${widths[index]}px`);
        if (useMask) element.style.setProperty(`border-${edge.toLowerCase()}-color`, 'transparent', 'important');
        else element.style.removeProperty(`border-${edge.toLowerCase()}-color`);
      });
    }
  }

  function update() {
    pendingFrame = 0;
    if (needsMeasure) {
      needsMeasure = false;
      measureEdges();
    }
    const viewportHeight = innerHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const heroBox = hero?.getBoundingClientRect();
    const scale = heroBox ? Math.min(heroBox.width / 922, heroBox.height / 1368) : viewportWidth / 922;
    // The native SVG vector is now (-2970,-1980) → (2970,1980), exactly 3× v41.
    const bandSize = Math.hypot(5940, 3960) * scale;
    const diagonal = viewportWidth * unitX + viewportHeight * unitY;
    // A continuous back-and-forth sweep has no jump at section boundaries.
    // It responds to scrolling in either direction, with no timed animation.
    const phase = reducedMotion.matches ? .42 :
      .5 - .5 * Math.cos(.7 + Math.max(0, scrollY) / Math.max(1, viewportHeight) * 1.35);
    const projection = diagonal * (-.16 + 1.32 * phase);
    // Exactly eight complete bottom-to-top passes over the full scroll range.
    // At each wrap both ends of the band are plain gold, avoiding a flash.
    const scrollRange = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
    const pageProgress = Math.min(1, Math.max(0, scrollY / scrollRange));
    const bannerPhase = reducedMotion.matches ? .5 :
      (pageProgress === 1 ? 1 : (pageProgress * 8) % 1);
    const bannerBoxes = new Map();
    for (const root of new Set(bannerRoots.values())) {
      const box = root.getBoundingClientRect();
      const menuExtension = root === header ? parseFloat(header.style.getPropertyValue('--expanded-menu-height')) || 0 : 0;
      const height = box.height + menuExtension;
      bannerBoxes.set(root, {
        top: box.top,
        center: height + bandSize / 2 - bannerPhase * (height + bandSize)
      });
    }
    const visible = targets.map(element => ({element, box: element.getBoundingClientRect()}))
      .filter(({box}) => box.width && box.height && box.bottom >= 0 && box.top <= viewportHeight);
    for (const {element, box} of visible) {
      // Express one shared light field in each element's own coordinates.
      const banner = bannerBoxes.get(bannerRoots.get(element));
      const center = banner ? banner.top + banner.center - box.top :
        projection - box.left * unitX - box.top * unitY;
      element.style.setProperty('--gold-band-size', `${bandSize.toFixed(2)}px`);
      element.style.setProperty('--gold-band-center', `${center.toFixed(2)}px`);
    }
  }

  function schedule() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(update);
  }
  function remeasure() {
    needsMeasure = true;
    schedule();
  }
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', remeasure, {passive: true});
  addEventListener('load', remeasure, {once: true});
  addEventListener('pageshow', remeasure, {passive: true});
  window.visualViewport?.addEventListener('resize', remeasure, {passive: true});
  reducedMotion.addEventListener('change', schedule);
  document.fonts?.ready.then(remeasure);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.querySelector('.site-shell'));
  }
  if (nav) {
    let wasOpen = nav.classList.contains('open');
    new MutationObserver(() => {
      const open = nav.classList.contains('open');
      if (open !== wasOpen) { wasOpen = open; remeasure(); }
    }).observe(nav, {attributes: true, attributeFilter: ['class']});
  }
  schedule();
})();
