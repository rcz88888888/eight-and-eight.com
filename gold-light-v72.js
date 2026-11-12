(() => {
  'use strict';

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
  const glyphRuns = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const owner = node.parentElement;
    if (!node.textContent.trim() || !owner ||
        owner.closest('script, style, noscript, template, svg, .wordmark, .menu-toggle, [hidden], [aria-hidden="true"]')) continue;
    glyphRuns.push(node);
    if (!textOwners.has(owner)) {
      // Newly covered labels keep their existing dimensions and frame geometry.
      owner.classList.add('gold-text-coverage');
      textOwners.add(owner);
      textNodes.push(owner);
    }
  }
  // Round the ink alone. Frames, link affordances and the separate backdrop
  // layer stay on their original elements, as do text reveal and line metrics.
  for (const node of glyphRuns) {
    const glyphs = document.createElement('span');
    glyphs.className = 'rounded-glyphs';
    node.replaceWith(glyphs);
    glyphs.appendChild(node);
  }

  const glyphKernels = [...document.querySelectorAll('.glyph-rounding-filters feGaussianBlur')].map(blur => ({
    blur,
    alpha: blur.nextElementSibling.firstElementChild,
    deviation: Number(blur.getAttribute('stdDeviation'))
  }));
  function sizeGlyphKernels() {
    // The root type size is 16 times the layout unit in either orientation.
    const scale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
    for (const {blur, alpha, deviation} of glyphKernels) {
      const radius = scale * deviation;
      const contrast = Math.max(3.2, 2.65 * radius * window.devicePixelRatio);
      blur.setAttribute('stdDeviation', radius.toFixed(3));
      // Restore a crisp alpha edge after rounding while retaining thin strokes.
      alpha.setAttribute('slope', contrast.toFixed(3));
      alpha.setAttribute('intercept', (.5 - .47 * contrast).toFixed(3));
    }
  }
  sizeGlyphKernels();
  addEventListener('resize', sizeGlyphKernels, {passive: true});

  const portfolioLogos = [...document.querySelectorAll('.partner-slot img')];
  const lightTargets = new Set([
    ...frames,
    ...document.querySelectorAll('.site-nav a, .menu-toggle span, .wordmark-logo, .wordmark')
  ]);
  const targets = [...lightTargets];
  const contentLayer = document.querySelector('.content-scroll');
  const nav = document.querySelector('.site-nav');
  const header = document.querySelector('.topbar');
  const lastPaint = new WeakMap();
  function paint(element, name, value) {
    let previous = lastPaint.get(element);
    if (!previous) { previous = {}; lastPaint.set(element, previous); }
    if (previous[name] === value) return;
    previous[name] = value;
    element.style.setProperty(name, value);
  }
  function syncBrowserColor() {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--page-cream').trim() || '#fdfcfa';
    // Use the page ground, never the banner ornament's champagne/gold.
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      if (meta.getAttribute('content') !== color) meta.setAttribute('content', color);
    }
    for (const element of [document.documentElement, document.body]) {
      if (element.style.getPropertyValue('background-color') !== color)
        element.style.setProperty('background-color', color, 'important');
    }
  }
  function cacheGeometry() {
    const head = header?.getBoundingClientRect();
    const menuOpen = header?.classList.contains('menu-expanded');
    const menuBox = menuOpen ? nav?.getBoundingClientRect() : null;
    if (contentLayer) {
      paint(contentLayer, '--content-start', `${head?.height || 0}px`);
      // Share the banner's actual outer edge, including fractional CSS pixels.
      // A shortened mask exposes text/logos inside its border; rounding outward
      // instead paints a cream hairline below it. The same edge works for the
      // expanded menu without adding its height to the header a second time.
      const cut = Math.max(head?.bottom || 0, menuBox?.bottom || 0);
      paint(contentLayer, '--content-cut', `${Math.max(0, cut)}px`);
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

  // Static gold edges use native CSS borders. A separate hollow composite mask
  // per cell would duplicate those same edges and enlarge Safari's layer tree.
  const engine = window.EightEightEffects;
  if (!engine) return;
  engine.subscribe({
    measure() {
      syncBrowserColor(); cacheGeometry();
    }
  });
  // Native lazy image loading and the light renderer prepare nearby photos.
  if (nav) {
    let wasOpen = nav.classList.contains('open');
    new MutationObserver(() => {
      const open = nav.classList.contains('open');
      if (open !== wasOpen) { wasOpen = open; engine.invalidate(); }
    }).observe(nav, {attributes: true, attributeFilter: ['class']});
    nav.addEventListener('scroll', engine.invalidate, {passive: true});
  }
})();
