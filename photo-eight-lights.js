(() => {
  'use strict';
  const engine = window.EightEightEffects;
  if (!engine) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.topbar');
  const clamp = value => Math.max(0, Math.min(1, value));
  // Eight soft reflection bands travel across each stationary photograph.
  // Their positions are derived only from scroll progress, so reverse scrolling
  // retraces exactly the same lighting without an autonomous animation clock.
  const sources = [
    {name: 'diffuse-1', angle: 108, delay: 0, strength: .18},
    {name: 'diffuse-2', angle: 100, delay: 15, strength: .15},
    {name: 'diffuse-3', angle: 115, delay: 30, strength: .17},
    {name: 'diffuse-4', angle: 96, delay: 45, strength: .14},
    {name: 'diffuse-5', angle: 112, delay: 60, strength: .18},
    {name: 'diffuse-6', angle: 104, delay: 75, strength: .15},
    {name: 'diffuse-7', angle: 118, delay: 90, strength: .16},
    {name: 'diffuse-8', angle: 98, delay: 105, strength: .14}
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
      const texture = document.createElement('span');
      texture.className = 'photo-reflection-texture';
      texture.style.backgroundImage = `url("${base.getAttribute('src')}")`;
      layer.append(texture);
      // A feathered strip, not a visible light disc. The texture is fixed;
      // only this mask passes over it, as the previous left/centre/right light did.
      const mask = `linear-gradient(${source.angle}deg,
        transparent calc(50% - 28%),
        rgba(0,0,0,.18) calc(50% - 18%),
        rgba(0,0,0,.68) calc(50% - 8%),
        #000 50%,
        rgba(0,0,0,.68) calc(50% + 8%),
        rgba(0,0,0,.18) calc(50% + 18%),
        transparent calc(50% + 28%))`;
      layer.style.maskImage = mask;
      layer.style.webkitMaskImage = mask;
      frame.append(layer);
      return {layer, texture, source, index};
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
      for (const {layer, texture, source} of item.lights) {
        // Eight staggered, continuous passes from left through centre to right.
        // A complete scroll moves every band into and out of the picture.
        const position = -40 + progress * 285 - source.delay;
        const shift = position - 50;
        // Fixed raster masks are moved by the compositor. Counter-translate
        // the texture so every photographed detail remains exactly stationary.
        layer.style.transform = `translate3d(${shift.toFixed(4)}%, 0, 0)`;
        texture.style.transform = `translate3d(${(-shift).toFixed(4)}%, 0, 0)`;
        layer.style.opacity = source.strength.toFixed(4);
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
