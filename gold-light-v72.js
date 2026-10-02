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
  const hollowMaskSupported = CSS.supports('mask-composite', 'exclude') ||
    CSS.supports('-webkit-mask-composite', 'xor');
  if (header && hollowMaskSupported) {
    const edge = document.createElement('span');
    edge.className = 'gold-header-edge';
    edge.setAttribute('aria-hidden', 'true');
    header.appendChild(edge);
  }
  let geometry = [];
  let viewportWidth = 0;
  let viewportHeight = 0;
  let headerDocumentTop = 0;
  let textMaskEdge = 0;
  let shimmersObserved = false;
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
    if (contentLayer) paint(contentLayer, '--content-start', `${head?.height || 0}px`);
    viewportWidth = document.documentElement.clientWidth;
    viewportHeight = innerHeight;
    const offset = engine.scrollPosition();
    const menuOpen = header?.classList.contains('menu-expanded');
    const bannerHeight = (head?.height || 0) +
      (menuOpen ? nav?.getBoundingClientRect().height || 0 : 0);
    // The cream occluder retains the fixed edge, 1px below the v88 edge.
    const pixelRatio = Math.max(1, devicePixelRatio || 1);
    textMaskEdge = Math.max(0, Math.ceil(bannerHeight * pixelRatio) / pixelRatio - 3);
    headerDocumentTop = contentLayer ? head?.top || 0 :
      (header?.parentElement.getBoundingClientRect().top || 0) + offset;
    geometry = targets.map(element => {
      const box = element.getBoundingClientRect();
      const root = bannerRoots.get(element);
      return {element, root, left: box.left, width: box.width, height: box.height,
        top: root === header && head ? box.top - head.top : box.top + offset};
    });
    const reach = `${(viewportWidth * 3 / 5).toFixed(1)}px`;
    lightTargets.forEach(element => paint(element, '--gold-reach', reach));
    if (contentLayer) paint(contentLayer, '--content-cut', `${textMaskEdge}px`);
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

  function update(state) {
    const {scroll, reach, left: leftSource, right: rightSource,
      y: lightY, extraY: extraLightY, width, height} = state;
    viewportWidth = width;
    viewportHeight = height;
    const headerTop = contentLayer ? headerDocumentTop : Math.max(0, headerDocumentTop - scroll);
    for (const item of geometry) {
      const {element, root, left, width, height} = item;
      const top = root === header ? headerTop + item.top : item.top - scroll;
      if (!lightTargets.has(element) || !width || !height || top + height < 0 || top > viewportHeight) continue;
      const extra = element.matches('.wordmark, .wordmark-logo, .menu-toggle span');
      paint(element, '--gold-left-x', `${((extra ? state.extraLeft : leftSource) - left).toFixed(1)}px`);
      paint(element, '--gold-right-x', `${((extra ? state.extraRight : rightSource) - left).toFixed(1)}px`);
      paint(element, '--gold-light-y', `${((extra ? extraLightY : lightY) - top).toFixed(1)}px`);
    }
  }


  function observeShimmers() {
    const lineOwners = [...new Set([...frames,
      ...document.querySelectorAll('.site-nav a, .topbar .menu-toggle > span, .topbar .wordmark')])];
    const visibleLines = new Set();
    function setLineVisible(node, visible) {
      if (visible) {
        visibleLines.add(node);
        node.style.setProperty('--line-shimmer-delay', `${-(performance.now() % 18000)}ms`);
      } else visibleLines.delete(node);
      node.style.setProperty('--line-shimmer-name', visible ? 'line-shimmer' : 'none');
    }
    if ('IntersectionObserver' in window) {
      const lineObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => setLineVisible(entry.target, entry.isIntersecting));
      });
      lineOwners.forEach(node => lineObserver.observe(node));
    } else lineOwners.forEach(node => setLineVisible(node, true));

    function visibility() {
      document.documentElement.classList.toggle('text-shimmer-paused', document.hidden);
      if (!document.hidden) {
        visibleLines.forEach(node => setLineVisible(node, true));
      }
    }
    document.addEventListener('visibilitychange', visibility);
    visibility();
  }

  const engine = window.EightEightEffects;
  if (!engine) return;
  engine.subscribe({
    measure() {
      measureEdges(); cacheGeometry();
      if (!shimmersObserved) {
        observeShimmers();
        shimmersObserved = true;
      }
    },
    paint: update
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
