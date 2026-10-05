(() => {
  'use strict';
  const engine = window.EightEightEffects;
  const root = document.documentElement;
  const logo = document.querySelector('.hero-wallpaper-logo');
  const ambient = document.querySelector('.ambient-eight-light');
  const front = document.querySelector('.front-eight-light');
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
  let lightVisible = false, lastPaint = -Infinity;
  const duration = 48, fast = 8;
  // Smooth narrow peak: 88% of the loop stays below 28% of the maximum.
  // Blend two even sine powers to integrate to exactly 36 full eights.
  const mean70 = Array.from({length: 35}, (_, i) => (2*i+1)/(2*i+2)).reduce((a,b)=>a*b,1);
  const mean72 = mean70 * 71 / 72;
  const blend = (36 / (fast * duration) - mean72) / (mean70 - mean72);
  function figureSpeed(seconds) {
    const wave = Math.sin(Math.PI * (seconds % duration) / duration);
    return fast * (blend * wave ** 70 + (1-blend) * wave ** 72);
  }
  function figurePosition(seconds) {
    const x = Math.PI * (seconds % duration) / duration;
    const wave = Math.sin(x), cosine = Math.cos(x);
    let integral = x, integral70;
    for (let n=2; n<=72; n+=2) {
      integral = -(wave ** (n-1)) * cosine / n + (n-1) / n * integral;
      if (n === 70) integral70 = integral;
    }
    const cycles = fast * duration / Math.PI * (blend * integral70 + (1-blend) * integral);
    const phase = -.813 + cycles * 2 * Math.PI;
    return {x: 521 + 130 * Math.sin(2 * phase), y: 684 + 438 * Math.sin(phase), rotation: cycles * 2 * Math.PI};
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
    if (!(logoBox?.scale > 0)) return;
    const point = figurePosition(elapsed);
    // Gaussian shutter response reduces undersampled high-speed oscillation.
    // Timing/phase stay at 18 Hz; the fast reflection develops motion blur
    // instead of jumping sharply between unrelated display-frame positions.
    const frequency = figureSpeed(elapsed);
    const shutter = .018;
    point.x = 521 + (point.x - 521) * Math.exp(-.5 * (4 * Math.PI * frequency * shutter) ** 2);
    point.y = 684 + (point.y - 684) * Math.exp(-.5 * (2 * Math.PI * frequency * shutter) ** 2);
    // One field in viewport pixels, initially registered to the start logo.
    // Keep it on the display as content scrolls through its circle.
    const x = logoBox.left + point.x * logoBox.scale;
    const y = logoBox.top + point.y * logoBox.scale;
    const radius = 920 * logoBox.scale;
    const axis = engine.logoFrame;
    const angle = (axis?.rotation || 0) + point.rotation;
    const cx = axis?.x ?? width / 2, cy = axis?.y ?? height / 2;
    const dx = x - cx, dy = y - cy;
    const rearX = cx + dx * Math.cos(angle) - dy * Math.sin(angle);
    const rearY = cy + dx * Math.sin(angle) + dy * Math.cos(angle);
    for (const [plane, px, py] of [[ambient, rearX, rearY], [front, x, y]]) {
      if (!plane) continue;
      property(plane, '--eight-x', `${px.toFixed(3)}px`);
      property(plane, '--eight-y', `${py.toFixed(3)}px`);
      property(plane, '--eight-radius', `${radius.toFixed(3)}px`);
    }
    // Project both moving sources inside the existing ornament/edge masks.
    // Foreground text needs no rectangular cutouts: it is above the light plane.
    for (const item of surfaces) {
      const top = item.top - (item.fixed ? 0 : scroll);
      if (top > height || top + item.height < 0) continue;
      property(item.node, '--eight-x', `${(x - item.left).toFixed(3)}px`);
      property(item.node, '--eight-y', `${(y - top).toFixed(3)}px`);
      property(item.node, '--eight-radius', `${radius.toFixed(3)}px`);
      if (!item.banner) continue;
      property(item.node, '--banner-rear-x', `${(rearX - item.left).toFixed(3)}px`);
      property(item.node, '--banner-rear-y', `${(rearY - top).toFixed(3)}px`);
      property(item.node, '--banner-rear-radius', `${radius.toFixed(3)}px`);
    }
    // SVG gets the exact same display field, translated back to logo units.
    attribute(movingGradient, 'gradientTransform', `translate(${point.x.toFixed(3)} ${(point.y + scroll / logoBox.scale).toFixed(3)}) scale(920)`);
  }
  const canAnimate = () => lightVisible && !document.hidden && !reduced.matches;
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
      return {node, fixed, banner: node.matches('.topbar, .wallpaper-end, .site-nav'), left: box.left, top: box.top + (fixed ? 0 : scroll), height: box.height};
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
    lightVisible = logoBox.scale > 0 && surfaces.some(item => {
      const top = item.top - (item.fixed ? 0 : scroll);
      return top < height && top + item.height > 0;
    });
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
