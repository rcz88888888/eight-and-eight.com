(() => {
  'use strict';
  const engine = window.EightEightEffects;
  if (!engine) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.topbar');
  const clamp = value => Math.max(0, Math.min(1, value));
  // Four native-resolution illumination fields, each calculated from surface
  // normals, photographic microtexture and the same eight diffuse area lights.
  // These fields contain light only. Combine two fields normally, then blend
  // that ONE light surface with the untouched original image. No live canvas,
  // custom GPU context, per-pixel scroll work or additional animation clock.
  const width = 1536, height = 1024, gutter = 2;
  const tileWidth = width + 2 * gutter, tileHeight = height + 2 * gutter;
  const positions = Array.from({length: 4}, (_, index) =>
    `${100 * (gutter + index % 2 * tileWidth) / (2 * tileWidth - width)}% ` +
    `${100 * (gutter + Math.floor(index / 2) * tileHeight) / (2 * tileHeight - height)}%`);
  let headerHeight = 0;
  let lastState = {scroll: window.scrollY, height: innerHeight};
  const items = [...document.querySelectorAll('figure[data-photo-light-atlas]')].map(figure => {
    const base = figure.querySelector('img');
    const surface = document.createElement('div');
    surface.className = 'photo-scroll-relight'; surface.setAttribute('aria-hidden', 'true');
    const poses = [0, 1].map(index => {
      const pose = document.createElement('span');
      pose.className = `photo-light-pose photo-light-pose-${index}`;
      pose.style.backgroundPosition = positions[index];
      surface.append(pose); return pose;
    });
    figure.append(surface); figure.dataset.lightCount = '8';
    return {figure, base, surface, poses, atlas: null, ready: false, pending: false,
      top: Infinity, height: 0, progress: NaN, segment: -1};
  });
  const decoded = image => {
    if (typeof image.decode === 'function') return image.decode();
    if (image.complete && image.naturalWidth) return Promise.resolve();
    return new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, {once: true});
      image.addEventListener('error', reject, {once: true});
    });
  };
  async function prepare(item) {
    if (item.pending || item.ready || reduced.matches) return;
    item.pending = true;
    try {
      item.base.loading = 'eager';
      const atlas = item.atlas || new Image();
      if (!item.atlas) {
        atlas.decoding = 'async'; atlas.fetchPriority = 'low';
        atlas.src = item.figure.dataset.photoLightAtlas; item.atlas = atlas;
      }
      await Promise.all([decoded(item.base), decoded(atlas)]);
      // Duplicated gutters prevent neighbouring fields bleeding at corners.
      item.surface.style.setProperty('--photo-light-atlas', `url("${item.figure.dataset.photoLightAtlas}")`);
      item.ready = true; item.progress = NaN;
      item.figure.dataset.lightRenderer = 'material-fields';
      paint(lastState);
    } catch {
      item.figure.removeAttribute('data-light-ready');
      item.figure.dataset.lightRenderer = 'original';
    } finally { item.pending = false; }
  }
  const queued = new Set();
  let preparing = false;
  const idle = callback => 'requestIdleCallback' in window
    ? requestIdleCallback(callback, {timeout: 1800}) : setTimeout(callback, 32);
  function pumpPreparation() {
    if (preparing || !queued.size || reduced.matches) return;
    preparing = true;
    idle(async () => {
      const item = queued.values().next().value; queued.delete(item);
      await prepare(item); preparing = false; pumpPreparation();
    });
  }
  function queuePreparation(item) {
    if (!item.ready && !item.pending) queued.add(item);
    pumpPreparation();
  }
  function paint(state) {
    lastState = state;
    for (const item of items) {
      if (reduced.matches) {
        item.figure.removeAttribute('data-light-ready'); item.progress = NaN; continue;
      }
      if (!(item.height > 0) || !item.ready) continue;
      const top = item.top - state.scroll;
      if (top >= state.height || top + item.height <= headerHeight) continue;
      const progress = clamp((state.scroll + state.height - item.top) /
        Math.max(1, state.height - headerHeight + item.height));
      if (progress === item.progress) continue;
      const phase = progress * 3, segment = Math.min(2, Math.floor(phase));
      if (segment !== item.segment) {
        item.poses[0].style.backgroundPosition = positions[segment];
        item.poses[1].style.backgroundPosition = positions[segment + 1];
        item.segment = segment;
      }
      // Opaque fields first combine inside their own surface. Blending only
      // the result with the photo avoids doubled exposure or mid-fade dimming.
      item.poses[1].style.opacity = (phase - segment).toFixed(6);
      item.progress = progress;
      item.figure.setAttribute('data-light-ready', '');
    }
  }
  function measure() {
    headerHeight = header?.getBoundingClientRect().bottom || 0;
    const scroll = window.scrollY;
    for (const item of items) {
      const box = item.figure.getBoundingClientRect();
      item.top = box.top + scroll; item.height = box.height; item.progress = NaN;
    }
    paint({scroll, height: innerHeight});
  }
  engine.subscribe({measure, paint});
  // Decode once, sequentially in idle time before the photos are reached.
  for (const item of items) queuePreparation(item);
  reduced.addEventListener('change', () => {
    for (const item of items) { item.progress = NaN; queuePreparation(item); }
    paint(lastState);
  });
})();
