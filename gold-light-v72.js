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
  )].filter(element => !element.closest('.wordmark, .menu-toggle'));
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
  const targets = [...new Set([
    ...frames, ...textNodes,
    ...document.querySelectorAll('.site-nav a, .menu-toggle span, .wordmark-logo, .wordmark')
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
  const hollowMaskSupported = CSS.supports('mask-composite', 'exclude') ||
    CSS.supports('-webkit-mask-composite', 'xor');
  const heroLeft = document.querySelector('#hero-gold-left');
  const heroRight = document.querySelector('#hero-gold-right');
  if (header && hollowMaskSupported) {
    const edge = document.createElement('span');
    edge.className = 'gold-header-edge';
    edge.setAttribute('aria-hidden', 'true');
    header.appendChild(edge);
  }
  let geometry = [];
  let heroGeometry = null;
  let viewportWidth = 0;
  let viewportHeight = 0;
  let headerDocumentTop = 0;
  let textMaskEdge = 0;
  const lastPaint = new WeakMap();
  function paint(element, name, value) {
    let previous = lastPaint.get(element);
    if (!previous) { previous = {}; lastPaint.set(element, previous); }
    if (previous[name] === value) return;
    previous[name] = value;
    element.style.setProperty(name, value);
  }
  function cacheGeometry() {
    viewportWidth = document.documentElement.clientWidth;
    viewportHeight = innerHeight;
    const offset = scrollY;
    const head = header?.getBoundingClientRect();
    const bannerHeight = (head?.height || 0) +
      (header?.classList.contains("menu-expanded") ? nav?.getBoundingClientRect().height || 0 : 0);
    const inset = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--text-mask-banner-inset')) || 16;
    // One viewport-anchored edge, safely inside the wallpaper. Recalculate
    // only for layout/menu changes, never from a scrolling text position.
    textMaskEdge = Math.max(0, bannerHeight - inset);
    const verticalScales = new Map();
    function verticalScale(element) {
      if (!element) return 1;
      if (verticalScales.has(element)) return verticalScales.get(element);
      const transform = getComputedStyle(element).transform;
      const own = transform === 'none' ? 1 : Math.abs(new DOMMatrixReadOnly(transform).m22);
      const scale = own * verticalScale(element.parentElement);
      verticalScales.set(element, scale);
      return scale || 1;
    }
    headerDocumentTop = (header?.parentElement.getBoundingClientRect().top || 0) + offset;
    geometry = targets.map(element => {
      const box = element.getBoundingClientRect();
      const root = bannerRoots.get(element);
      return {element, root, left: box.left, width: box.width, height: box.height,
        textScaleY: element.classList.contains('banner-occluded-text') ? verticalScale(element) : 1,
        top: root === header && head ? box.top - head.top : box.top + offset};
    });
    if (hero) {
      const box = hero.getBoundingClientRect();
      heroGeometry = {left: box.left, top: box.top + offset, width: box.width, height: box.height};
    }
    const reach = `${(viewportWidth * 3 / 5).toFixed(1)}px`;
    targets.forEach(element => paint(element, '--gold-reach', reach));
  }

  targets.forEach(element => element.classList.add('gold-light-target'));
  textNodes.forEach(element => {
    element.classList.add('gold-text-light');
    if (!element.matches(frameSelector) && !element.closest('.topbar, .site-nav, .wallpaper-end')) {
      element.classList.add('banner-occluded-text');
    }
  });

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
    const headerTop = Math.max(0, headerDocumentTop - scroll);
    for (const item of geometry) {
      const {element, root, left, width, height} = item;
      const top = root === header ? headerTop + item.top : item.top - scroll;
      if (element.classList.contains('banner-occluded-text')) {
        // Insets use local CSS pixels; the cached box uses viewport pixels.
        // Account for the 1.08 text stretch (including nested text), otherwise
        // the visible cut drifts down as each line crosses the banner.
        const hiddenHeight = Math.max(0, Math.min(height, textMaskEdge - top));
        const localInset = hiddenHeight / item.textScaleY;
        paint(element, '--text-banner-clip', `${localInset.toFixed(3)}px`);
      }
      if (!width || !height || top + height < 0 || top > viewportHeight) continue;
      const extra = element.matches('.wordmark, .wordmark-logo, .menu-toggle span');
      paint(element, '--gold-left-x', `${((extra ? state.extraLeft : leftSource) - left).toFixed(1)}px`);
      paint(element, '--gold-right-x', `${((extra ? state.extraRight : rightSource) - left).toFixed(1)}px`);
      paint(element, '--gold-light-y', `${((extra ? extraLightY : lightY) - top).toFixed(1)}px`);
    }
    if (heroGeometry && heroLeft && heroRight) {
      const box = heroGeometry;
      const topOnScreen = box.top - scroll;
      const scale = Math.min(box.width / 922, box.height / 1368);
      if (scale > 0 && topOnScreen + box.height >= 0 && topOnScreen <= viewportHeight) {
        const left = box.left + (box.width - 922 * scale) / 2;
        const top = topOnScreen + (box.height - 1368 * scale) / 2;
        const radius = reach / scale;
        const y = (lightY - top) / scale;
        // Soft elliptical opening light covers the requested vertical band.
        // Blend smoothly into the ordinary shared beam as scrolling starts.
        const openingBlend = Math.min(1, scroll / Math.max(1, viewportHeight * .35));
        const blend = openingBlend * openingBlend * (3 - 2 * openingBlend);
        const logoCenterX = left + 922 * scale / 2;
        for (const [gradient, source] of [[heroLeft, leftSource], [heroRight, rightSource]]) {
          const lateral = Math.min(.95, Math.abs(logoCenterX - source) / reach);
          const openingRadiusY = 1368 * .375 / Math.sqrt(1 - lateral * lateral);
          const radiusY = openingRadiusY + (radius - openingRadiusY) * blend;
          gradient.setAttribute('gradientTransform', `translate(${((source-left)/scale).toFixed(3)} ${y.toFixed(3)}) scale(${radius.toFixed(3)} ${radiusY.toFixed(3)})`);
        }
      }
    }
  }

  const engine = window.EightEightEffects;
  if (!engine) return;
  engine.subscribe({
    measure() { measureEdges(); cacheGeometry(); },
    paint: update
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
