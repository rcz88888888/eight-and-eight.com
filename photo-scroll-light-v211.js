(() => {
  'use strict';
  const engine = window.EightEightEffects;
  if (!engine) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.topbar');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => value * value * (3 - 2 * value);
  // Over an opaque left-lit base, center first reaches opacity 1, then right
  // fades over center. This avoids dark seams and doubled/transparent exposure.
  function lightWeights(progress) {
    const t = clamp(progress) * 2;
    return {center: t < 1 ? smooth(t) : 1, right: t > 1 ? smooth(t - 1) : 0};
  }
  let headerHeight = 0;
  let lastState = {scroll: window.scrollY, height: innerHeight};
  const items = [...document.querySelectorAll('figure[data-light-center][data-light-right]')].map(figure => {
    const base = figure.querySelector('img');
    if (!base) return null;
    const frame = document.createElement('div');
    frame.className = 'photo-scroll-light';
    frame.style.aspectRatio = `${base.getAttribute('width') || 1536} / ${base.getAttribute('height') || 1024}`;
    base.replaceWith(frame);
    base.classList.add('photo-light-base');
    frame.append(base);
    const makeLayer = side => {
      const image = document.createElement('img');
      image.className = `photo-light-frame photo-light-${side}`;
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      image.decoding = 'async';
      image.draggable = false;
      frame.append(image);
      return image;
    };
    return {figure, frame, base, center: makeLayer('center'), right: makeLayer('right'),
      top: Infinity, height: 0, started: false, ready: false, live: false, progress: NaN};
  }).filter(Boolean);

  const decoded = image => {
    if (typeof image.decode === 'function') return image.decode();
    if (image.complete && image.naturalWidth) return Promise.resolve();
    return new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, {once: true});
      image.addEventListener('error', reject, {once: true});
    });
  };
  async function start(item) {
    if (item.started || reduced.matches) return;
    item.started = true;
    item.center.src = item.figure.dataset.lightCenter;
    item.right.src = item.figure.dataset.lightRight;
    try {
      await Promise.all([decoded(item.base), decoded(item.center), decoded(item.right)]);
      item.ready = true;
      item.progress = NaN;
      paint(lastState);
      engine.invalidate();
    } catch {
      // Keep the original photograph if a lighting asset cannot be loaded.
      item.center.style.opacity = item.right.style.opacity = '0';
    }
  }
  function measure() {
    headerHeight = header?.getBoundingClientRect().height || 0;
    const scroll = window.scrollY;
    for (const item of items) {
      const box = item.frame.getBoundingClientRect();
      item.top = box.top + scroll;
      item.height = box.height;
    }
    paint({scroll, height: innerHeight});
  }
  function paint(state) {
    lastState = state;
    for (const item of items) {
      if (!(item.height > 0)) continue;
      const top = item.top - state.scroll;
      const visible = top < state.height && top + item.height > headerHeight;
      if (visible && !item.started) start(item);
      const live = visible && item.ready && !reduced.matches;
      if (live !== item.live) {
        item.frame.toggleAttribute('data-live', live);
        item.live = live;
      }
      if (!item.ready) continue;
      const span = Math.max(1, state.height - headerHeight + item.height);
      const progress = reduced.matches ? 0 : clamp((state.scroll + state.height - item.top) / span);
      if (progress === item.progress) continue;
      const weights = lightWeights(progress);
      item.center.style.opacity = weights.center.toFixed(5);
      item.right.style.opacity = weights.right.toFixed(5);
      item.progress = progress;
    }
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const item = items.find(item => item.figure === entry.target);
        if (item) {
          start(item);
          if (item.started) observer.unobserve(item.figure);
        }
      }
    }, {rootMargin: '900px 0px'});
    for (const item of items) observer.observe(item.figure);
  }
  engine.subscribe({measure, paint});
  reduced.addEventListener('change', () => { paint(lastState); engine.invalidate(); });
})();
