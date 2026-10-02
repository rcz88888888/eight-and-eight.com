(() => {
  'use strict';
  const stage = document.querySelector('.site-shell > main > .logo-stage');
  const logo = stage?.querySelector('.hero-static-logo');
  if (!logo) return;
  const ns = 'http://www.w3.org/2000/svg';
  const make = (name, attributes, parent) => {
    const node = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    parent.appendChild(node);
    return node;
  };
  const gradient = make('radialGradient', {id: 'hero-eight-spotlight'}, logo.querySelector('defs'));
  for (const [offset, color, opacity] of [
    [0, '#ffffff', 1], [.16, '#fffdf0', .95], [.44, '#fff1c5', .58],
    [.72, '#e8cf91', .16], [1, '#e8cf91', 0]
  ]) make('stop', {offset, 'stop-color': color, 'stop-opacity': opacity}, gradient);
  // Ambient pools and short trails reveal each route even between logo strokes.
  // The stronger light is restricted to the existing transparent contour mask.
  const ambient = make('g', {'class': 'hero-eight-ambient', 'pointer-events': 'none'}, logo);
  const contours = make('g', {'class': 'hero-eight-contours',
    mask: 'url(#hero-gold-contours)', 'pointer-events': 'none'}, logo);
  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const lights = Array.from({length: 8}, (_, index) => {
    const ax = random(65, 115), ay = random(100, 145);
    const angle = random(-.22, .22), radius = random(78, 112);
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const extentX = Math.abs(ax * cos) + Math.abs(ay * sin) + radius + 8;
    const extentY = Math.abs(ax * sin) + Math.abs(ay * cos) + radius + 8;
    // Jittered cells distribute eight distinct loops across the opening image.
    const cx = clamp((index % 2 + .5) * 461 + random(-70, 70), extentX, 922 - extentX);
    const cy = clamp((Math.floor(index / 2) + .5) * 342 + random(-45, 45), extentY, 1368 - extentY);
    const pool = make('g', {'data-spotlight': index + 1}, ambient);
    const highlight = make('circle', {r: radius, fill: 'url(#hero-eight-spotlight)', opacity: .95}, contours);
    const trail = Array.from({length: 6}, (_, tail) => make('circle', {
      r: radius * (tail === 0 ? 1 : .68), fill: 'url(#hero-eight-spotlight)',
      opacity: tail === 0 ? .19 : .11 * (1 - tail / 6)
    }, pool));
    return {ax, ay, cos, sin, cx, cy, highlight, trail,
      phase: random(0, Math.PI * 2), direction: Math.random() < .5 ? -1 : 1};
  });
  logo.dataset.spotlightCount = String(lights.length);
  logo.style.overflow = 'hidden';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, visible = true;
  function point(light, theta) {
    // An upright figure eight with a real central crossover and two loops.
    const x = light.ax * Math.sin(2 * theta), y = light.ay * Math.sin(theta);
    return [light.cx + x * light.cos - y * light.sin,
      light.cy + x * light.sin + y * light.cos];
  }
  function position(node, xy) {
    node.setAttribute('cx', xy[0].toFixed(2));
    node.setAttribute('cy', xy[1].toFixed(2));
  }
  function paint(time) {
    const progress = reduced.matches ? 0 : (time % 8000) / 8000 * Math.PI * 2;
    for (const light of lights) {
      const theta = light.phase + light.direction * progress;
      position(light.highlight, point(light, theta));
      light.trail.forEach((node, tail) => position(node,
        point(light, theta - light.direction * tail * .09)));
    }
  }
  function tick(time) {
    frame = 0;
    if (document.hidden || !visible) return;
    paint(time);
    if (!reduced.matches) frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0;
    if (document.hidden || !visible) return;
    paint(performance.now());
    if (!reduced.matches) frame = requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }).observe(stage);
  }
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  sync();
})();
