(() => {
  'use strict';
  const stage = document.querySelector('.site-shell main > .logo-stage');
  const logo = stage?.querySelector('.hero-static-logo');
  const engine = window.EightEightEffects;
  if (!logo || !engine) return;
  const pattern = logo.querySelector('#hero-paper-pattern');
  const tileImage = pattern.querySelector('image');
  const header = document.querySelector('.topbar');
  engine.subscribe({measure() {
    const stageBox = stage.getBoundingClientRect();
    const box = {width: Math.max(0, stageBox.width - 16), height: Math.max(0, stageBox.height - 16)};
    logo.style.left = `${stageBox.left + 8}px`;
    logo.style.top = `${stageBox.top + engine.scrollPosition() + 8}px`;
    logo.style.width = `${box.width}px`;
    logo.style.height = `${box.height}px`;
    const border = parseFloat(getComputedStyle(header).borderBottomWidth) ||
      (matchMedia('(orientation: landscape)').matches ? .8 : 1.5);
    logo.style.setProperty('--hero-border-width', `${border}px`);
    const scale = Math.min(box.width / 922, box.height / 1368);
    if (!(scale > 0)) return;
    const style = getComputedStyle(header, '::before');
    const pixels = parseFloat(style.maskSize || style.webkitMaskSize) || 260;
    const tile = pixels / scale;
    for (const node of [pattern, tileImage]) {
      node.setAttribute('width', tile); node.setAttribute('height', tile);
    }
    pattern.setAttribute('x', (922 - tile) / 2);
  }});
})();
