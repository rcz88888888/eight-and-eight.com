(() => {
  'use strict';
  const stage = document.querySelector('.site-shell main > .logo-stage');
  const logo = stage?.querySelector('.hero-static-logo');
  const engine = window.EightEightEffects;
  if (!logo || !engine) return;
  // Preserve the transparent wallpaper gaps on every device and orientation.
  for (const surface of logo.querySelectorAll('rect[mask="url(#hero-paper-ornament)"]'))
    surface.setAttribute('mask', 'url(#hero-paper-ornament)');
  const pattern = logo.querySelector('#hero-paper-pattern');
  const tileImage = pattern.querySelector('image');
  const header = document.querySelector('.topbar');
  const ring = logo.querySelector('.hero-strobe-ring');
  engine.subscribe({measure() {
    const border = parseFloat(getComputedStyle(header).borderBottomWidth) ||
      (matchMedia('(orientation: landscape)').matches ? .8 : 1.5);
    logo.style.setProperty('--hero-border-width', `${border}px`);
    const scale = Math.min(logo.clientWidth / 922, logo.clientHeight / 1368);
    if (!(scale > 0)) return;
    if (ring) {
      // Preserve a true circle and the vector's exact point spacing. The
      // nearest points clear the visible logo by 1/16 of its full height,
      // including its non-scaling outline at the current responsive scale.
      const outline = border / scale;
      const extent = Number(ring.dataset.logoExtent) + outline;
      const radius = Number(ring.dataset.logoRadius) + outline / 2;
      const ringScale = (radius + extent / 16) / 559.65;
      const size = 1280 * ringScale;
      ring.setAttribute('x', 461 - size / 2);
      ring.setAttribute('y', 684 - size / 2);
      ring.setAttribute('width', size);
      ring.setAttribute('height', size);
    }
    const style = getComputedStyle(header, '::before');
    const pixels = parseFloat(style.maskSize || style.webkitMaskSize) || 260;
    const tile = pixels / scale;
    for (const node of [pattern, tileImage]) {
      node.setAttribute('width', tile); node.setAttribute('height', tile);
    }
    pattern.setAttribute('x', (922 - tile) / 2);
  }});
})();
