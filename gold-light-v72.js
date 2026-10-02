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
  // Isolate text owned by bordered boxes before adding glyph-only clipping.
  // Do not clip the owner: that would also hide its frame or images.
  const framedText = [];
  const frameWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (frameWalker.nextNode()) {
    const node = frameWalker.currentNode;
    if (node.textContent.trim() && node.parentElement?.matches(frameSelector) &&
        !node.parentElement.closest('.topbar, .site-nav, .wallpaper-end')) framedText.push(node);
  }
  for (const node of framedText) {
    const glyphs = document.createElement('span');
    glyphs.className = 'banner-text-glyphs';
    node.replaceWith(glyphs);
    glyphs.appendChild(node);
  }

  const textNodes = [...document.querySelectorAll(
    'h1,h2,h3,h4,h5,h6,p,li,a,button,label,small,strong,em,blockquote,figcaption,dt,dd,th,td'
  )].filter(element => !element.closest('.wordmark, .menu-toggle') && !element.matches(frameSelector));
  // Include EVERY real text owner, not just a list of semantic tags.
  // This also captures section-label divs, process/principle spans and footer.
  const textOwners = new Set(textNodes);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const owner = node.parentElement;
    if (!node.textContent.trim() || !owner ||
        owner.closest('script, style, noscript, template, svg, .wordmark, .menu-toggle, [hidden], [aria-hidden="true"]')) continue;
    if (!textOwners.has(owner)) {
      // Newly covered labels keep their existing dimensions and frame geometry.
      owner.classList.add('gold-text-coverage');
      textOwners.add(owner);
      textNodes.push(owner);
    }
  }
  const portfolioLogos = [...document.querySelectorAll('.partner-slot img')];
  const lightTargets = new Set([
    ...frames,
    ...document.querySelectorAll('.site-nav a, .menu-toggle span, .wordmark-logo, .wordmark')
  ]);
  const targets = [...lightTargets];
  const contentLayer = document.querySelector('.content-scroll');
  const nav = document.querySelector('.site-nav');
  const header = document.querySelector('.topbar');
  const hollowMaskSupported = CSS.supports('mask-composite', 'exclude') ||
    CSS.supports('-webkit-mask-composite', 'xor');
  if (header && hollowMaskSupported) {
    const edge = document.createElement('span');
    edge.className = 'gold-header-edge';
    edge.setAttribute('aria-hidden', 'true');
    header.appendChild(edge);
  }
  const lastPaint = new WeakMap();
  function paint(element, name, value) {
    let previous = lastPaint.get(element);
    if (!previous) { previous = {}; lastPaint.set(element, previous); }
    if (previous[name] === value) return;
    previous[name] = value;
    element.style.setProperty(name, value);
  }
  function cacheGeometry() {
    const head = header?.getBoundingClientRect();
    const menuOpen = header?.classList.contains('menu-expanded');
    const height = (head?.height || 0) + (menuOpen ? nav?.getBoundingClientRect().height || 0 : 0);
    const ratio = Math.max(1, devicePixelRatio || 1);
    if (contentLayer) {
      paint(contentLayer, '--content-start', `${head?.height || 0}px`);
      paint(contentLayer, '--content-cut', `${Math.max(0, Math.ceil(height * ratio) / ratio - 3)}px`);
    }
  }

  lightTargets.forEach(element => element.classList.add('gold-light-target'));
  textNodes.forEach(element => {
    element.classList.add('gold-text-light');
    if (!element.matches(frameSelector) && !element.closest('.topbar, .site-nav, .wallpaper-end')) {
      element.classList.add('banner-occluded-text');
    }
  });
  portfolioLogos.forEach(element => element.classList.add('banner-occluded-logo'));

  function measureEdges() {
    // Read first, then write, to avoid repeatedly forcing page layout.
    const metrics = frames.map(element => {
      const style = getComputedStyle(element);
      return {
        element,
        widths: edges.map(edge => parseFloat(style[`border${edge}Width`]) || 0),
        position: style.position
      };
    });
    for (const {element, widths, position} of metrics) {
      const active = widths.some(width => width > 0);
      const useMask = active && hollowMaskSupported;
      element.classList.toggle('gold-frame-light', useMask);
      if (useMask && position === 'static') element.classList.add('gold-frame-relative');
      edges.forEach((edge, index) => {
        element.style.setProperty(`--gold-edge-${edge.toLowerCase()}`, `${widths[index]}px`);
        if (useMask) element.style.setProperty(`border-${edge.toLowerCase()}-color`, 'transparent', 'important');
        else element.style.removeProperty(`border-${edge.toLowerCase()}-color`);
      });
    }
  }

  const engine = window.EightEightEffects;
  if (!engine) return;
  engine.subscribe({
    measure() {
      measureEdges(); cacheGeometry();
    }
  });
  // Lazy-loaded portfolio images can change their height after initial layout.
  portfolioLogos.forEach(element => {
    if (!element.complete) element.addEventListener('load', engine.invalidate, {once: true});
  });
  if (nav) {
    let wasOpen = nav.classList.contains('open');
    new MutationObserver(() => {
      const open = nav.classList.contains('open');
      if (open !== wasOpen) { wasOpen = open; engine.invalidate(); }
    }).observe(nav, {attributes: true, attributeFilter: ['class']});
    nav.addEventListener('scroll', engine.invalidate, {passive: true});
  }
})();
