(() => {
  'use strict';
  const engine = window.EightEightEffects;
  if (!engine) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => value * value * (3 - 2 * value);
  const items = [...document.querySelectorAll('.content-scroll .gold-text-light')]
    .filter(owner => !owner.parentElement?.closest('.gold-text-light') &&
      owner.textContent.trim() && !owner.closest('[aria-hidden="true"]'))
    .map(owner => {
      // Keep the site's existing font, tracking and baseline transform intact.
      const rest = getComputedStyle(owner).transform;
      owner.style.setProperty('--text-rest-transform', rest === 'none' ? 'scaleY(1)' : rest);
      owner.style.setProperty('--scroll-text-stretch', '1');
      owner.setAttribute('data-scroll-text', '');
      return {owner, center: Infinity, factor: 1};
    });
  let lastState = {scroll: window.scrollY, height: innerHeight};
  function measure() {
    // Read resting geometry only during layout changes. Scaling never reflows text.
    for (const item of items) item.owner.style.setProperty('--scroll-text-stretch', '1');
    for (const item of items) {
      const box = item.owner.getBoundingClientRect();
      item.center = box.top + box.height / 2 + window.scrollY;
      item.factor = NaN;
    }
    paint({scroll: window.scrollY, height: innerHeight});
  }
  function paint(state) {
    lastState = state;
    for (const item of items) {
      const center = item.center - state.scroll;
      const progress = clamp((state.height - center) / Math.max(1, state.height / 2));
      const factor = reduced.matches ? 1 : 1 + .08 * (1 - smooth(progress));
      if (factor === item.factor) continue;
      item.owner.style.setProperty('--scroll-text-stretch', factor.toFixed(5));
      item.factor = factor;
    }
  }
  engine.subscribe({measure, paint});
  reduced.addEventListener('change', () => { paint(lastState); engine.invalidate(); });
  document.fonts?.ready.then(engine.invalidate);
})();
