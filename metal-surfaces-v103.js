(() => {
  'use strict';
  const engine = window.EightEightEffects;
  const root = document.documentElement;
  const logo = document.querySelector('.hero-wallpaper-logo');
  const movingGradient = logo?.querySelector('#figure-eight-light');
  const openingGradient = logo?.querySelector('#opening-paper-light');
  const centralGradient = logo?.querySelector('#central-paper-light');
  const specularGradient = logo?.querySelector('#specular-paper-light');
  const header = document.querySelector('.topbar');
  const firstHeading = document.querySelector('#about h2');
  if (!engine || !logo || !movingGradient || !openingGradient || !centralGradient || !specularGradient) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Read geometry only during the existing layout pass. Never move content or scroll.
  const nodes = [...document.querySelectorAll('.gold-light-target, .topbar, .wallpaper-end, .site-nav, .site-nav a')].filter(node => !node.closest('.wordmark, .menu-toggle'));
  let surfaces = [], logoBox, openingField, width = innerWidth, height = innerHeight;
  let scroll = engine.scrollPosition(), raf = 0, elapsed = 0, previousTime;
  let logoVisible = false, lastPaint = -Infinity;
  const slow = 0, fast = 88;
  const duration = 18;
  const average = (slow + fast) / 2, amplitude = (fast - slow) / 2;
  // The speed curve integrates to exactly 792 complete eights per 18-second loop.
  // Peak speed is 88 eights per SECOND; drawing remains display-rate limited.
  // Its value and derivative agree at both ends, avoiding a positional jump.
  function figurePosition(seconds) {
    const t = seconds % duration;
    const angle = 2 * Math.PI * t / duration;
    const cycles = average * t - amplitude * duration / (2 * Math.PI) * Math.sin(angle);
    const phase = -.813 + cycles * 2 * Math.PI;
    return {x: 521 + 130 * Math.sin(2 * phase), y: 684 + 438 * Math.sin(phase)};
  }
  // Unchanged opening geometry must not invalidate every masked SVG each tick.
  const values = new WeakMap();
  function cached(element, key, value, write) {
    let cache = values.get(element);
    if (!cache) { cache = new Map(); values.set(element, cache); }
    if (cache.get(key) === value) return;
    cache.set(key, value); write();
  }
  const property = (element, key, value) => cached(element, key, value, () => element.style.setProperty(key, value));
  const attribute = (element, key, value) => cached(element, key, value, () => element.setAttribute(key, value));
  function drawOpening() {
    const opening = Math.max(0, 1 - Math.max(0, scroll) / 88);
    property(root, '--opening-light-opacity', opening.toFixed(4));
    for (const item of surfaces) {
      const top = item.top - (item.fixed ? 0 : scroll);
      if (top > height || top + item.height < 0) continue;
      property(item.node, '--opening-x', `${(openingField.x - item.left).toFixed(2)}px`);
      property(item.node, '--opening-y', `${(openingField.y - scroll - top).toFixed(2)}px`);
      property(item.node, '--opening-radius', `${openingField.radius.toFixed(2)}px`);
      property(item.node, '--opening-core-rx', `${openingField.coreRx.toFixed(2)}px`);
      property(item.node, '--opening-core-ry', `${openingField.coreRy.toFixed(2)}px`);
      property(item.node, '--opening-specular-rx', `${openingField.specularRx.toFixed(2)}px`);
    }
    if (logoBox?.scale > 0) {
      const ox = (openingField.x - logoBox.left) / logoBox.scale;
      const oy = (openingField.y - logoBox.top) / logoBox.scale;
      const radius = openingField.radius / logoBox.scale;
      // Uniform scale: a circle in SVG space is the same circle in CSS pixels.
      attribute(openingGradient, 'gradientTransform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${radius.toFixed(2)})`);
      attribute(centralGradient, 'gradientTransform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${(openingField.coreRx / logoBox.scale).toFixed(2)} ${(openingField.coreRy / logoBox.scale).toFixed(2)})`);
      attribute(specularGradient, 'gradientTransform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${(openingField.specularRx / logoBox.scale).toFixed(2)} ${(openingField.coreRy / logoBox.scale).toFixed(2)})`);
    }
  }
  function drawFigure() {
    const point = figurePosition(elapsed);
    // Only this small SVG field moves automatically; no viewport-wide lighting writes.
    attribute(movingGradient, 'gradientTransform', `translate(${point.x.toFixed(3)} ${point.y.toFixed(3)}) scale(920)`);
  }
  const canAnimate = () => logoVisible && !document.hidden && !reduced.matches;
  function syncAnimation() {
    if (!canAnimate()) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0; previousTime = undefined; return;
    }
    if (!raf) { previousTime = undefined; raf = requestAnimationFrame(tick); }
  }
  engine.subscribe({measure() {
    width = innerWidth; height = innerHeight; scroll = engine.scrollPosition();
    surfaces = nodes.map(node => {
      const box = node.getBoundingClientRect();
      const fixed = node.matches('.topbar, .site-nav') || !!node.closest('.topbar, .site-nav');
      return {node, fixed, left: box.left, top: box.top + (fixed ? 0 : scroll), height: box.height};
    });
    const box = logo.getBoundingClientRect();
    const scale = Math.min(box.width / 922, box.height / 1368);
    logoBox = {scale, left: box.left + (box.width - 922 * scale) / 2,
      top: box.top + scroll + (box.height - 1368 * scale) / 2};
    // The opening circle falls off before the marked corners. A taller,
    // narrower specular reflection reaches from the banner through the middle.
    // Document anchors keep both fields stable when browser bars resize.
    const top = -(header?.getBoundingClientRect().height || 88) * .27;
    const heading = firstHeading?.getBoundingClientRect();
    const bottom = heading ? heading.bottom + scroll + 64 : logoBox.top + 1368 * scale + 160;
    openingField = {x: width / 2, y: (top + bottom) / 2,
      radius: Math.max((bottom - top) / 2, width / 2) * 1.15,
      coreRx: Math.max(44, width * .18), specularRx: Math.max(12, width * .035), coreRy: (bottom - top) * 1.2};
  }, paint(state) {
    scroll = state.scroll;
    const top = logoBox.top - scroll;
    logoVisible = logoBox.scale > 0 && top < height && top + 1368 * logoBox.scale > 0;
    drawOpening(); drawFigure(); syncAnimation();
  }});
  function tick(time) {
    raf = 0;
    if (!canAnimate()) { previousTime = undefined; return; }
    if (previousTime !== undefined) elapsed = (elapsed + Math.min(100, Math.max(0, time - previousTime)) / 1000) % duration;
    previousTime = time;
    if (time - lastPaint >= 1000 / 60 - .5) { drawFigure(); lastPaint = time; }
    raf = requestAnimationFrame(tick);
  }
  function resume() {
    previousTime = undefined; syncAnimation(); engine.schedule();
  }
  document.addEventListener('visibilitychange', resume);
  reduced.addEventListener('change', resume);
  resume();
})();
