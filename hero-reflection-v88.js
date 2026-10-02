(() => {
  'use strict';
  const stage = document.querySelector('.site-shell main > .logo-stage');
  const logo = stage?.querySelector('.hero-static-logo');
  const engine = window.EightEightEffects;
  if (!logo || !engine) return;
  const ns = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, parent) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    parent.appendChild(node);
    return node;
  };
  const defs = logo.querySelector('defs');
  const stops = [[0, '#ffffff', 1], [.125, '#ffffff', .968994], [.25, '#fffefc', .878906],
    [.375, '#fffdf4', .738525], [.5, '#fffbec', .5625], [.625, '#fff9e4', .371338],
    [.75, '#fff7dd', .191406], [.875, '#fff6d5', .054932], [1, '#fff4cd', 0]];
  const banner = make('g', {class: 'hero-banner-light', mask: 'url(#hero-gold-contours)'}, logo);
  const gradients = ['left', 'right'].map(side => {
    const id = `hero-banner-${side}`;
    const gradient = make('radialGradient', {id, gradientUnits: 'userSpaceOnUse', cx: 0, cy: 0, r: 1}, defs);
    stops.forEach(([offset, color, opacity]) => make('stop', {offset, 'stop-color': color, 'stop-opacity': opacity}, gradient));
    make('rect', {width: 922, height: 1368, fill: `url(#${id})`}, banner);
    return gradient;
  });
  let box = null;
  // Convert the exact banner light coordinates into the logo's SVG space.
  // No separate movement, phase or stretching is introduced for this light.
  engine.subscribe({
    measure() {
      const rect = logo.getBoundingClientRect();
      box = {left: rect.left, top: rect.top + engine.scrollPosition(), width: rect.width, height: rect.height};
    },
    paint(state) {
      if (!box) return;
      const scale = Math.min(box.width / 922, box.height / 1368);
      if (!(scale > 0)) return;
      const top = box.top - state.scroll + (box.height - 1368 * scale) / 2;
      if (top > state.height || top + 1368 * scale < 0) return;
      const left = box.left + (box.width - 922 * scale) / 2;
      const radius = state.reach / scale;
      gradients.forEach((gradient, i) => gradient.setAttribute('gradientTransform',
        `translate(${((i ? state.right : state.left) - left) / scale} ${(state.y - top) / scale}) scale(${radius})`));
    }
  });

  const halfBeam = 220;
  const gradient = make('linearGradient', {id: 'hero-random-reflection', gradientUnits: 'userSpaceOnUse',
    x1: -halfBeam, y1: 0, x2: halfBeam, y2: 0}, defs);
  [[0, 0], [.35, .44], [.5, 1], [.65, .44], [1, 0]].forEach(([offset, opacity]) =>
    make('stop', {offset, 'stop-color': '#fff4da', 'stop-opacity': opacity}, gradient));
  const reflection = make('g', {class: 'hero-directional-reflection', mask: 'url(#hero-gold-contours)',
    visibility: 'hidden', 'pointer-events': 'none'}, logo);
  const beam = make('rect', {x: -halfBeam, y: -2000, width: halfBeam * 2, height: 4000,
    fill: 'url(#hero-random-reflection)'}, reflection);
  const diagonal = Math.atan2(1368, 922) * 180 / Math.PI;
  const directions = [
    ['top', 90], ['bottom', -90], ['right', 180], ['left', 0],
    ['top-left', diagonal], ['top-right', 180 - diagonal],
    ['bottom-left', -diagonal], ['bottom-right', diagonal - 180]
  ];
  const period = 8000, duration = 800;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let previous = -1, lastCycle = -1, angle = 0, extent = 0;
  let frame = 0, timer = 0, visible = true;
  function choose(cycle) {
    let index = Math.floor(Math.random() * (previous < 0 ? 8 : 7));
    if (previous >= 0 && index >= previous) index++;
    previous = index; lastCycle = cycle;
    angle = directions[index][1];
    const radians = angle * Math.PI / 180;
    extent = Math.abs(Math.cos(radians)) * 461 + Math.abs(Math.sin(radians)) * 684 + halfBeam;
    logo.dataset.reflectionDirection = directions[index][0];
  }
  function tick(time) {
    frame = 0; timer = 0;
    if (!visible || document.hidden || reduced.matches) {
      reflection.setAttribute('visibility', 'hidden'); return;
    }
    const cycle = Math.floor(time / period), phase = time % period;
    if (phase < duration) {
      if (cycle !== lastCycle) choose(cycle);
      const offset = -extent + 2 * extent * phase / duration;
      beam.setAttribute('transform', `translate(461 684) rotate(${angle}) translate(${offset} 0)`);
      reflection.setAttribute('visibility', 'visible');
      frame = requestAnimationFrame(tick);
    } else {
      reflection.setAttribute('visibility', 'hidden');
      timer = setTimeout(() => tick(performance.now()), period - phase + 1);
    }
  }
  function sync() {
    cancelAnimationFrame(frame); clearTimeout(timer); frame = timer = 0;
    tick(performance.now());
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(stage);
  }
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  matchMedia('(orientation: landscape)').addEventListener('change', () => engine.invalidate());
  sync();
})();
