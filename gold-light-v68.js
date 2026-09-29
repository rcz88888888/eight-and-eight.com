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
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hollowMaskSupported = CSS.supports('mask-composite', 'exclude') ||
    CSS.supports('-webkit-mask-composite', 'xor');
  const heroLeft = document.querySelector('#hero-gold-left');
  const heroRight = document.querySelector('#hero-gold-right');
  // Keep the rotating logo geometry, depth and opacity; illuminate its
  // silhouette in viewport coordinates so the light does not rotate with it.
  const ns = 'http://www.w3.org/2000/svg';
  const rotatingLights = [...document.querySelectorAll('svg.main-logo-layer')].map((svg, i) => {
    const make = (name, attributes) => {
      const node = document.createElementNS(ns, name);
      Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
      return node;
    };
    const defs = make('defs', {});
    const mask = make('mask', {id: 'rotating-mask-' + i, maskUnits: 'userSpaceOnUse',
      x: 0, y: 0, width: 922, height: 1368, style: 'mask-type:alpha'});
    mask.appendChild(make('image', {href: 'eight-and-eight-logo-dark-v18.png',
      width: 922, height: 1368}));
    defs.appendChild(mask);
    const gradients = [heroLeft, heroRight].map((source, side) => {
      const gradient = source.cloneNode(true);
      gradient.id = 'rotating-light-' + i + '-' + side;
      defs.appendChild(gradient);
      return gradient;
    });
    svg.appendChild(defs);
    const shape = make('g', {mask: 'url(#rotating-mask-' + i + ')'});
    [ 'var(--banner-logo-metal, #4b3a1f)', ...gradients.map(g => 'url(#' + g.id + ')') ].forEach(fill =>
      shape.appendChild(make('rect', {width: 922, height: 1368, fill})));
    svg.appendChild(shape);
    return {svg, gradients};
  });
  if (header && hollowMaskSupported) {
    const edge = document.createElement('span');
    edge.className = 'gold-header-edge';
    edge.setAttribute('aria-hidden', 'true');
    header.appendChild(edge);
  }
  let pendingFrame = 0;
  let needsMeasure = true;
  let geometry = [];
  let heroGeometry = null;
  let viewportWidth = 0;
  let viewportHeight = 0;
  let scrollRange = 1;
  let headerHeight = 0;
  let menuExtension = 0;
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
    scrollRange = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
    const offset = scrollY;
    const head = header?.getBoundingClientRect();
    headerHeight = head?.height || 0;
    menuExtension = parseFloat(header?.style.getPropertyValue('--expanded-menu-height')) || 0;
    geometry = targets.map(element => {
      const box = element.getBoundingClientRect();
      const root = bannerRoots.get(element);
      return {element, root, left: box.left, width: box.width, height: box.height,
        top: root === header && head ? box.top - head.top : box.top + offset};
    });
    if (hero) {
      const box = hero.getBoundingClientRect();
      heroGeometry = {left: box.left, top: box.top + offset, width: box.width, height: box.height};
    }
    const reach = `${(viewportWidth * 3 / 5).toFixed(2)}px`;
    targets.forEach(element => paint(element, '--gold-reach', reach));
  }

  targets.forEach(element => element.classList.add('gold-light-target'));
  textNodes.forEach(element => element.classList.add('gold-text-light'));

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

  function update() {
    pendingFrame = 0;
    if (document.hidden) return;
    if (needsMeasure) {
      needsMeasure = false;
      measureEdges();
      cacheGeometry();
    }
    const scroll = Math.max(0, scrollY);
    const reach = viewportWidth * 3 / 5;
    const travel = reducedMotion.matches ? 0 : scroll / Math.max(1, viewportHeight);
    const lightReach = viewportWidth * 3 / 5;
    const progress = Math.min(1, scroll / scrollRange);
    // Exactly 18 shared bottom-to-top light passes across the full page.
    // At the very top, place the reflection over the opening line logo rather
    // than below the viewport: its centre sits around 28% into the logo so
    // the upper three-fifths catch the strongest part of the light.
    const openingLightY = heroGeometry
      ? heroGeometry.top + heroGeometry.height * .28
      : viewportHeight * .28;
    // Start at the logo, then wrap only while the beam is fully outside the
    // viewport. This keeps every pass continuous instead of visibly jumping
    // from the top edge back to the logo; the broad radial falloff supplies
    // a natural fade-in and fade-out at both ends.
    const cycleLength = viewportHeight + 2 * lightReach;
    const cycleStart = viewportHeight + lightReach;
    const openingOffset = Math.max(0, cycleStart - openingLightY);
    const travelled = reducedMotion.matches ? openingOffset :
      openingOffset + progress * 18 * cycleLength;
    const wrappedDistance = travelled % cycleLength;
    const lightY = cycleStart - wrappedDistance;
    // Independent navigation light: repeated 8
    // times across the page, while retaining the same seamless off-screen
    // wrap as the primary 18-pass field.
    const extraTravelled = reducedMotion.matches ? openingOffset :
      openingOffset + progress * 8 * cycleLength;
    const extraWrappedDistance = extraTravelled % cycleLength;
    const extraLightY = cycleStart - extraWrappedDistance;
    // Bring the white reflection centres gently inward so they cross the gold.
    const leftSource = viewportWidth * (.22 + .1 * Math.sin(travel * .65));
    const rightSource = viewportWidth - leftSource;
    // Only the sticky header needs a live layout read during ordinary scrolling.
    const headerTop = header?.getBoundingClientRect().top || 0;
    for (const item of geometry) {
      const {element, root, left, width, height} = item;
      const top = root === header ? headerTop + item.top : item.top - scroll;
      if (!width || !height || top + height < 0 || top > viewportHeight) continue;
      let centerY = lightY - top;
      if (root) {
        centerY = lightY - top;
      }
      paint(element, '--gold-left-x', `${(leftSource - left).toFixed(2)}px`);
      paint(element, '--gold-right-x', `${(rightSource - left).toFixed(2)}px`);
      paint(element, '--gold-light-y', `${centerY.toFixed(2)}px`);
      if (element.matches('.wordmark, .wordmark-logo, .menu-toggle span')) {
        const extraCenterY = extraLightY - top;
        const extraLeftSource = viewportWidth * (.34 + .08 * Math.cos(travel * .43));
        const extraRightSource = viewportWidth - extraLeftSource;
        paint(element, '--gold-left-x', `${(extraLeftSource - left).toFixed(2)}px`);
        paint(element, '--gold-right-x', `${(extraRightSource - left).toFixed(2)}px`);
        paint(element, '--gold-light-y', `${extraCenterY.toFixed(2)}px`);
      }
    }
    for (const {svg, gradients} of rotatingLights) {
      const matrix = svg.getScreenCTM();
      if (!matrix) continue;
      const inverse = matrix.inverse();
      gradients.forEach((gradient, side) => {
        gradient.setAttribute('cx', side === 0 ? leftSource : rightSource);
        gradient.setAttribute('cy', lightY);
        gradient.setAttribute('r', reach);
        gradient.setAttribute('gradientTransform',
          `matrix(${inverse.a} ${inverse.b} ${inverse.c} ${inverse.d} ${inverse.e} ${inverse.f})`);
      });
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
        for (const [gradient, source] of [[heroLeft, leftSource], [heroRight, rightSource]]) {
          gradient.setAttribute('gradientTransform', `translate(${((source-left)/scale).toFixed(3)} ${y.toFixed(3)}) scale(${radius.toFixed(3)} ${radius.toFixed(3)})`);
        }
      }
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
  document.addEventListener('visibilitychange', schedule);
  nav?.addEventListener('scroll', remeasure, {passive: true});
  schedule();
})();
