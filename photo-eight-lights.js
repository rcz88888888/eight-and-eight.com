(() => {
  'use strict';
  const engine = window.EightEightEffects;
  if (!engine) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.topbar');
  const clamp = value => Math.max(0, Math.min(1, value));
  // Eight broad area lights remain outside the photograph. Each reflection
  // uses the original full-resolution texture at exactly the same coordinates.
  // This retains the metal's fine detail instead of painting white shapes on it.
  const sources = [
    {name: 'upper-left', x: -30, y: -45, width: 135, height: 145, strength: .055},
    {name: 'upper-right', x: 130, y: -45, width: 135, height: 145, strength: .038},
    {name: 'left-strip', x: -55, y: 45, width: 130, height: 170, strength: .045},
    {name: 'right-strip', x: 155, y: 50, width: 130, height: 170, strength: .040},
    {name: 'overhead', x: 50, y: -65, width: 165, height: 140, strength: .050},
    {name: 'back-left', x: -30, y: 120, width: 140, height: 150, strength: .034},
    {name: 'back-right', x: 130, y: 125, width: 140, height: 150, strength: .036},
    {name: 'front-bounce', x: 50, y: 165, width: 170, height: 140, strength: .030}
  ];
  const items = [...document.querySelectorAll('figure[data-photo-lighting="eight-diffuse"]')].map(figure => {
    const base = figure.querySelector('img');
    const frame = document.createElement('div');
    frame.className = 'photo-scroll-light photo-eight-lights';
    frame.dataset.lightCount = String(sources.length);
    frame.style.aspectRatio = `${base.getAttribute('width')} / ${base.getAttribute('height')}`;
    base.replaceWith(frame);
    base.classList.add('photo-light-base');
    frame.append(base);
    const lights = sources.map((source, index) => {
      const layer = document.createElement('span');
      layer.className = 'photo-area-reflection';
      layer.dataset.lightSource = source.name;
      layer.setAttribute('aria-hidden', 'true');
      layer.style.backgroundImage = `url("${base.getAttribute('src')}")`;
      const mask = `radial-gradient(ellipse ${source.width}% ${source.height}% at ${source.x}% ${source.y}%, #000 0%, rgba(0,0,0,.72) 30%, transparent 78%)`;
      layer.style.maskImage = mask;
      layer.style.webkitMaskImage = mask;
      frame.append(layer);
      return {layer, source, index};
    });
    return {frame, lights, top: 0, height: 0, progress: NaN, live: false};
  });
  let headerHeight = 0;
  function paint(state) {
    for (const item of items) {
      const top = item.top - state.scroll;
      const visible = top < state.height && top + item.height > headerHeight;
      const live = visible && !reduced.matches;
      if (live !== item.live) {
        item.frame.toggleAttribute('data-live', live);
        item.live = live;
      }
      if (!live || !(item.height > 0)) continue;
      const progress = clamp((state.scroll + state.height - item.top) /
        Math.max(1, state.height - headerHeight + item.height));
      if (progress === item.progress) continue;
      for (const {layer, source, index} of item.lights) {
        // All eight lights contribute continuously; only their intensity varies.
        // No object movement, moving suns or independently ticking animation.
        const phase = progress * Math.PI * 2 - index * Math.PI / 4;
        const weight = .58 + .42 * Math.cos(phase);
        layer.style.opacity = (source.strength * weight).toFixed(5);
      }
      item.progress = progress;
    }
  }
  function measure() {
    headerHeight = header?.getBoundingClientRect().height || 0;
    for (const item of items) {
      const box = item.frame.getBoundingClientRect();
      item.top = box.top + window.scrollY;
      item.height = box.height;
      item.progress = NaN;
    }
    paint({scroll: window.scrollY, height: innerHeight});
  }
  engine.subscribe({measure, paint});
  reduced.addEventListener('change', () => {
    for (const item of items) item.progress = NaN;
    engine.invalidate();
  });
})();
