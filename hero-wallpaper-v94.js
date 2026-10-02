(() => {
  'use strict';
  const stage = document.querySelector('.site-shell main > .logo-stage');
  const logo = stage?.querySelector('.hero-static-logo');
  const engine = window.EightEightEffects;
  if (!logo || !engine) return;
  const ns = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, parent) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, value));
    parent.appendChild(node); return node;
  };
  const pattern = logo.querySelector('#hero-paper-pattern');
  const tileImage = pattern.querySelector('image');
  const header = document.querySelector('.topbar');
  engine.subscribe({measure() {
    const box = logo.getBoundingClientRect();
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
  const gradient = make('linearGradient', {id:'hero-paper-light', gradientUnits:'userSpaceOnUse',
    x1:-260,y1:0,x2:260,y2:0}, logo.querySelector('defs'));
  [[0,0],[.2,.06],[.38,.35],[.5,1],[.62,.35],[.8,.06],[1,0]].forEach(([offset,opacity]) =>
    make('stop', {offset,'stop-color':'#fff7e6','stop-opacity':opacity}, gradient));
  const reflection = make('g', {class:'hero-paper-reflection',mask:'url(#hero-paper-shape)',
    visibility:'hidden','pointer-events':'none'},logo);
  const beam = make('rect', {x:-260,y:-2000,width:520,height:4000,
    fill:'url(#hero-paper-light)'},reflection);
  const period = 18000, duration = 8000, angle = 58;
  const radians = angle * Math.PI / 180;
  const extent = Math.cos(radians)*461 + Math.sin(radians)*684 + 260;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true, frame = 0, timer = 0;
  function tick(time) {
    frame = timer = 0;
    if (!visible || document.hidden || reduced.matches) {
      reflection.setAttribute('visibility','hidden'); return;
    }
    const phase = time % period;
    if (phase < duration) {
      const progress = (1 - Math.cos(Math.PI * phase / duration)) / 2;
      beam.setAttribute('transform', `translate(461 684) rotate(${angle}) translate(${-extent + 2*extent*progress} 0)`);
      reflection.setAttribute('visibility','visible');
      frame = requestAnimationFrame(tick);
    } else {
      reflection.setAttribute('visibility','hidden');
      timer = setTimeout(() => tick(performance.now()), period-phase+1);
    }
  }
  function sync() {
    cancelAnimationFrame(frame); clearTimeout(timer); frame = timer = 0;
    tick(performance.now());
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {visible=entries[0].isIntersecting;sync();}).observe(stage);
  }
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  sync();
})();
