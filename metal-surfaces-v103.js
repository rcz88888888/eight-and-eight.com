(() => {
  'use strict';
  const engine = window.EightEightEffects;
  const root = document.documentElement;
  const logo = document.querySelector('.hero-wallpaper-logo');
  const gradient = logo?.querySelector('#random-metal-light');
  if (!engine || !logo || !gradient) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Read geometry only during the existing layout pass. Never move content or scroll.
  const nodes = [...document.querySelectorAll('.gold-light-target, .topbar, .wallpaper-end, .site-nav, .site-nav a')].filter(node => !node.closest('.wordmark, .menu-toggle'));
  let surfaces = [], logoBox, width = innerWidth, height = innerHeight;
  let scroll = engine.scrollPosition(), raf = 0, lastFrame = -Infinity, elapsed = 0, previousTime;
  const between = (a, b) => a + Math.random() * (b - a);
  const choose = () => ({x: between(-.15, 1.15), y: between(-.15, 1.15),
    opacity: between(.12, .86), rx: between(.22, .65), ry: between(.25, .9)});
  let from = choose(), to = choose(), duration = between(4000, 14000);
  const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);
  const interpolate = (a, b, t) => a + (b - a) * t;
  const property = (element, key, value) => element.style.setProperty(key, value);
  function draw() {
    const t = smooth(Math.min(1, elapsed / duration));
    const light = Object.fromEntries(Object.keys(from).map(key => [key, interpolate(from[key], to[key], t)]));
    const opening = .88 * Math.max(0, 1 - Math.max(0, scroll) / 88);
    property(root, '--opening-light-opacity', opening.toFixed(4));
    property(root, '--random-metal-opacity', light.opacity.toFixed(4));
    const x = light.x * width, y = light.y * height;
    const rx = light.rx * width, ry = light.ry * height;
    for (const item of surfaces) {
      const top = item.top - (item.fixed ? 0 : scroll);
      if (top > height + ry || top + item.height < -ry) continue;
      property(item.node, '--metal-x', `${(x - item.left).toFixed(2)}px`);
      property(item.node, '--metal-y', `${(y - top).toFixed(2)}px`);
      property(item.node, '--metal-rx', `${rx.toFixed(2)}px`);
      property(item.node, '--metal-ry', `${ry.toFixed(2)}px`);
      property(item.node, '--opening-x', `${(width * .5 - item.left).toFixed(2)}px`);
      property(item.node, '--opening-y', `${(height * .82 - top).toFixed(2)}px`);
      property(item.node, '--opening-rx', `${width * .75}px`);
      property(item.node, '--opening-ry', `${height * .42}px`);
    }
    if (logoBox?.scale > 0) {
      const lx = (x - logoBox.left) / logoBox.scale;
      const ly = (y - logoBox.top + scroll) / logoBox.scale;
      gradient.setAttribute('gradientTransform', `translate(${lx.toFixed(2)} ${ly.toFixed(2)}) scale(${(rx / logoBox.scale).toFixed(2)} ${(ry / logoBox.scale).toFixed(2)})`);
    }
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
  }, paint(state) { scroll = state.scroll; draw(); }});
  function tick(time) {
    raf = 0;
    if (document.hidden || reduced.matches) { previousTime = undefined; return; }
    if (time - lastFrame >= 1000 / 30) {
      if (previousTime !== undefined) elapsed += Math.min(100, time - previousTime);
      previousTime = time; lastFrame = time;
      if (elapsed >= duration) { from = to; to = choose(); elapsed = 0; duration = between(4000, 14000); }
      draw();
    }
    raf = requestAnimationFrame(tick);
  }
  function resume() {
    previousTime = undefined;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (!document.hidden && !reduced.matches) raf = requestAnimationFrame(tick);
    engine.schedule();
  }
  document.addEventListener('visibilitychange', resume);
  reduced.addEventListener('change', resume);
  resume();
})();
