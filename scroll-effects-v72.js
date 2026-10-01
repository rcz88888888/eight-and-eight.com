(() => {
  'use strict';
  const root = document.documentElement;
  const background = document.querySelector('.background-layers');
  const logos = document.querySelector('.main-logo-canvas');
  const main = document.querySelector('.parallax-logo');
  const hero = document.querySelector('.hero-static-logo');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const subscribers = [];
  const lightPasses = 8;
  const lightVisibility = .58;
  const image = new Image();
  const bg = background?.getContext('2d');
  const ink = logos?.getContext('2d');
  const lightSurface = document.createElement('canvas');
  const light = lightSurface.getContext('2d');
  const layers = [...document.querySelectorAll('.main-logo-layer')].map(node => ({
    scale: parseFloat(node.style.getPropertyValue('--layer-scale')) || 1,
    opacity: parseFloat(node.style.opacity) || .08,
    speed: .72 ** Number(node.dataset.depth)
  }));
  let raf = 0;
  let layoutDirty = true;
  let viewportDirty = true;
  let lastWidth = 0;
  let pageHeight = 0;
  let sceneKey = '';
  let sceneViewportHeight = 0;
  let particles = [];
  let sprites = [];
  let mainBox;
  let heroBox;
  let bgRatio = 1;
  let inkRatio = 1;
  const stops = [
    [0, 'rgba(255,255,255,1)'], [.125, 'rgba(255,255,255,.969)'],
    [.25, 'rgba(255,254,252,.879)'], [.375, 'rgba(255,253,244,.739)'],
    [.5, 'rgba(255,251,236,.5625)'], [.625, 'rgba(255,249,228,.3713)'],
    [.75, 'rgba(255,247,221,.1914)'], [.875, 'rgba(255,246,213,.0549)'],
    [1, 'rgba(255,244,205,0)']
  ];
  const randomFrom = seed => () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const schedule = () => {
    if (!raf && !document.hidden) raf = requestAnimationFrame(render);
  };
  const invalidate = () => { layoutDirty = true; viewportDirty = true; schedule(); };
  window.EightEightEffects = {
    subscribe(callbacks) { subscribers.push(callbacks); invalidate(); },
    invalidate,
    schedule
  };
  function resizeSurface(canvas, context, width, height, ratio) {
    const w = Math.round(width * ratio);
    const h = Math.round(height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'low';
    }
  }
  function measure(width, height) {
    // All layout reads happen before the scroll frame's paints.
    pageHeight = Math.max(root.scrollHeight, height);
    mainBox = main?.getBoundingClientRect();
    if (hero) {
      const box = hero.getBoundingClientRect();
      heroBox = {left: box.left, top: box.top + scrollY, width: box.width, height: box.height};
    }
    if (layoutDirty) subscribers.forEach(item => item.measure?.());
    if (!bg || !ink || !light || !mainBox) return;
    bgRatio = Math.min(devicePixelRatio || 1, 1.25);
    inkRatio = Math.min(devicePixelRatio || 1, 1.5);
    resizeSurface(background, bg, width, height, bgRatio);
    resizeSurface(logos, ink, width, height, inkRatio);
    resizeSurface(lightSurface, light, width, height, inkRatio);
    background.style.width = logos.style.width = `${width}px`;
    background.style.height = logos.style.height = `${height}px`;
    const mainWidth = Math.min(mainBox.width, mainBox.height * 922 / 1368) * 1.15;
    const portrait = matchMedia('(orientation: portrait)').matches;
    const key = `${width}:${Math.round(pageHeight)}:${portrait}:${mainWidth.toFixed(1)}`;
    if (key === sceneKey) return;
    sceneKey = key;
    const rand = randomFrom(88888888);
    const count = portrait ? 2222 : 8888;
    // Preserve the seeded density, sizes, opacity and individual speeds.
    // Browser toolbar height changes do not rebuild this scene.
    if (!sceneViewportHeight || width !== lastWidth) sceneViewportHeight = height;
    const stableHeight = sceneViewportHeight;
    particles = Array.from({length: count}, (_, i) => {
      const fraction = i === 0 ? 0 : i === count - 1 ? 1 : rand() ** 2.6;
      const w = mainWidth * (.008 + .872 * fraction);
      return {
        x: rand() * (width + mainWidth) - mainWidth / 2 - w / 2,
        y: rand() * (pageHeight + stableHeight) - stableHeight / 2,
        width: w, height: w * 1368 / 922,
        opacity: (.08 + rand() * .24) * .2206456,
        speed: .16 + rand() * .56
      };
    });
    background.dataset.logoCount = String(count);
  }
  function field(width, height, scroll) {
    const progress = Math.min(1, scroll / Math.max(1, pageHeight - height));
    const reach = width * .6;
    const openingHeight = heroBox ? Math.min(heroBox.width / 922, heroBox.height / 1368) * 1368 : 0;
    const openingY = heroBox
      ? heroBox.top + (heroBox.height - openingHeight) / 2 + openingHeight * .475 : height * .475;
    const cycle = height + 2 * reach;
    const start = height + reach;
    const offset = Math.max(0, start - openingY);
    const motion = reduced.matches ? 0 : progress;
    const travel = reduced.matches ? 0 : scroll / Math.max(1, height);
    const left = width * (.22 + .1 * Math.sin(travel * .65));
    return {width, height, scroll, progress, reach, travel,
      motionScroll: reduced.matches ? 0 : scroll, motionProgress: motion,
      left, right: width - left,
      y: start - ((offset + motion * lightPasses * cycle) % cycle),
      extraY: start - ((offset + motion * lightPasses * cycle) % cycle),
      extraLeft: left, extraRight: width - left};
  }
  function paintCanvas(state) {
    if (!bg || !ink || !light || !mainBox || !sprites.length) return;
    const {width, height, motionScroll, motionProgress, left, right, y, reach} = state;
    bg.clearRect(0, 0, width, height);
    let visible = 0;
    for (const mark of particles) {
      const top = mark.y - motionScroll * (1 - mark.speed);
      if (top + mark.height < 0 || top > height || mark.x + mark.width < 0 || mark.x > width) continue;
      const sprite = sprites.find(item => item.width >= mark.width * bgRatio) || sprites[sprites.length - 1];
      bg.globalAlpha = mark.opacity;
      bg.drawImage(sprite, mark.x, top, mark.width, mark.height);
      visible++;
    }
    bg.globalAlpha = 1;
    // Eight logos share one composited light surface: no per-logo SVG masks,
    // gradient cloning, getScreenCTM or hundreds of DOM writes on scroll.
    ink.clearRect(0, 0, width, height);
    const scale = Math.min(mainBox.width / 922, mainBox.height / 1368);
    const w = 922 * scale;
    const h = 1368 * scale;
    const cx = mainBox.left + mainBox.width / 2;
    const cy = mainBox.top + mainBox.height / 2;
    const travel = (.5 - motionProgress) * Math.min(height, mainBox.height);
    const rotation = (.5 - .5 * Math.cos(Math.PI * motionProgress)) * Math.PI * 16;
    for (const layer of layers) {
      ink.save();
      ink.translate(cx, cy + travel * layer.speed);
      ink.rotate(rotation);
      ink.scale(layer.scale, layer.scale);
      ink.globalAlpha = layer.opacity;
      ink.drawImage(image, -w / 2, -h / 2, w, h);
      ink.restore();
    }
    if (y + reach > 0 && y - reach < height) {
      light.clearRect(0, 0, width, height);
      for (const x of [left, right]) {
        const gradient = light.createRadialGradient(x, y, 0, x, y, reach);
        stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
        light.fillStyle = gradient;
        light.fillRect(0, 0, width, height);
      }
      ink.globalCompositeOperation = 'source-atop';
      ink.globalAlpha = .3 * lightVisibility;
      ink.drawImage(lightSurface, 0, 0, width, height);
      ink.globalAlpha = 1;
      ink.globalCompositeOperation = 'source-over';
    }
    const count = String(visible);
    if (background.dataset.visibleLogos !== count) background.dataset.visibleLogos = count;
    if (!root.classList.contains('canvas-logos-ready')) {
      root.classList.add('logo-rain-ready', 'canvas-logos-ready');
    }
  }
  function render() {
    raf = 0;
    if (document.hidden) return;
    const width = root.clientWidth;
    const height = innerHeight;
    if (layoutDirty || viewportDirty) {
      measure(width, height);
      layoutDirty = viewportDirty = false;
      lastWidth = width;
    }
    const state = field(width, height, Math.max(0, scrollY));
    paintCanvas(state);
    subscribers.forEach(item => item.paint?.(state));
  }
  image.addEventListener('load', () => {
    sprites = [8, 16, 32, 64, 128, 256, 512, 922].map(width => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.round(width * 1368 / 922);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    });
    invalidate();
  }, {once: true});
  image.src = 'eight-and-eight-logo-dark-v18.png';
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', () => {
    if (root.clientWidth !== lastWidth) layoutDirty = true;
    viewportDirty = true;
    schedule();
  }, {passive: true});
  addEventListener('load', invalidate, {once: true});
  addEventListener('pageshow', invalidate, {passive: true});
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', invalidate);
  document.fonts?.ready.then(invalidate);
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (root.scrollHeight !== pageHeight) invalidate();
    }).observe(document.querySelector('.site-shell'));
  }
  schedule();
})();
