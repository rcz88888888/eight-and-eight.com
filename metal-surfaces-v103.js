(() => {
  'use strict';
  const engine = window.EightEightEffects;
  const root = document.documentElement;
  const logo = document.querySelector('.hero-wallpaper-logo');
  const ambient = document.querySelector('.ambient-eight-light');
  const steady = document.querySelector('.steady-soft-light');
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
  const duration = 16;
  function figureSpeed() { return 1 / duration; }
  function figurePosition(seconds) {
    const phase = -.813 + (seconds % duration) / duration * 2 * Math.PI;
    return {x:521 + 130*Math.sin(2*phase), y:684 + 438*Math.sin(phase)};
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
    const opening = .88;
    property(root, '--opening-light-opacity', opening.toFixed(4));
    for (const item of surfaces) {
      const top = item.top - (item.fixed ? 0 : scroll);
      if (top > height || top + item.height < 0) continue;
      property(item.node, '--opening-x', `${(openingField.x - item.left).toFixed(2)}px`);
      property(item.node, '--opening-y', `${(openingField.y - top).toFixed(2)}px`);
      property(item.node, '--opening-radius', `${openingField.radius.toFixed(2)}px`);
    }
    if (steady) {
      property(steady, '--opening-x', `${openingField.x.toFixed(2)}px`);
      property(steady, '--opening-y', `${openingField.y.toFixed(2)}px`);
      property(steady, '--opening-radius', `${openingField.radius.toFixed(2)}px`);
    }
    if (logoBox?.scale > 0) {
      const ox = (openingField.x - logoBox.left) / logoBox.scale;
      const oy = (openingField.y + scroll - logoBox.top) / logoBox.scale;
      const radius = openingField.radius / logoBox.scale;
      // Uniform scale: a circle in SVG space is the same circle in CSS pixels.
      attribute(openingGradient, 'gradientTransform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${radius.toFixed(2)})`);
    }
  }
  function drawFigure() {
    if (!(logoBox?.scale > 0)) return;
    const point = figurePosition(elapsed);
    // Center the figure-eight in the foremost logo's actual rendered frame.
    // Rotate its local offsets only with scrolling, never with its own phase.
    const radius = 3680 * logoBox.scale;
    const axis = engine.logoFrame;
    const angle = axis?.rotation || 0;
    const cx = axis?.x ?? logoBox.left + 521 * logoBox.scale;
    const cy = axis?.y ?? logoBox.top + 684 * logoBox.scale;
    const dx = (point.x - 521) * logoBox.scale;
    const dy = (point.y - 684) * logoBox.scale;
    const x = cx + dx * Math.cos(angle) - dy * Math.sin(angle);
    const y = cy + dx * Math.sin(angle) + dy * Math.cos(angle);
    // A single backlight above the base background and below every logo/frame.
    if (ambient) {
      property(ambient, '--eight-x', `${x.toFixed(3)}px`);
      property(ambient, '--eight-y', `${y.toFixed(3)}px`);
      property(ambient, '--eight-radius', `${radius.toFixed(3)}px`);
    }
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
    // A broad stationary viewport light keeps the complete marked start area lit.
    openingField = {x:width/2, y:height*.45, radius:Math.max(height,width)*1.4};
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
