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
  const firstFieldLabel = document.querySelector('#about > .section-label');
  engine.subscribe({measure() {
    const border = parseFloat(getComputedStyle(header).borderBottomWidth) ||
      (matchMedia('(orientation: landscape)').matches ? .8 : 1.5);
    logo.style.setProperty('--hero-border-width', `${border}px`);
    if (firstFieldLabel && ring) {
      const stageBox = stage.getBoundingClientRect();
      const labelBox = firstFieldLabel.getBoundingClientRect();
      const labelBorder = parseFloat(getComputedStyle(firstFieldLabel).borderBottomWidth) || 0;
      const top = header.getBoundingClientRect().height;
      const bottom = labelBox.bottom + window.scrollY - labelBorder;
      const span = bottom - top;
      const extent = Number(ring.dataset.logoExtent);
      if (span > 0 && extent > 0) {
        // The yellow reference marks span 91.8% of the space between the
        // banner edge and the first field divider. Centre the visible shape,
        // independently of the transparent margins in the SVG viewBox.
        const fitScale = span * .918 / extent;
        const centerY = (top + bottom) / 2;
        logo.style.setProperty('--hero-fit-width', `${922 * fitScale}px`);
        logo.style.setProperty('--hero-fit-height', `${1368 * fitScale}px`);
        logo.style.setProperty('--hero-fit-top', `${centerY - stageBox.top - window.scrollY}px`);
        logo.dataset.fitScale = String(fitScale);
        logo.dataset.fitCenterY = String(centerY);
      }
    }
    const scale = Number(logo.dataset.fitScale) || Math.min(logo.clientWidth / 922, logo.clientHeight / 1368);
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
    const pixels = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--wallpaper-tile-size')) || 220;
    const tile = pixels / scale;
    for (const node of [pattern, tileImage]) {
      node.setAttribute('width', tile); node.setAttribute('height', tile);
    }
    pattern.setAttribute('x', (922 - tile) / 2);
  }});
})();
