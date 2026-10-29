(() => {
  'use strict';
  const engine = window.EightEightEffects;
  if (!engine) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const items = [...document.querySelectorAll('.content-scroll .gold-text-light')]
    .filter(owner => !owner.parentElement?.closest('.gold-text-light') &&
      owner.textContent.trim() && !owner.closest('[aria-hidden="true"], .topbar, .site-nav'))
    .map(owner => {
      owner.setAttribute('data-text-reveal', '');
      return {owner, top: Infinity, progress: 0, offset: 0, done: false};
    });
  let previousScroll = window.scrollY;
  let initialized = false;
  let lastState = {scroll: previousScroll, height: innerHeight};
  function update(item, progress) {
    item.progress = Math.max(item.progress, progress);
    const p = item.progress;
    const offset = 32 * (1 - p * p * (3 - 2 * p));
    if (offset !== item.offset) {
      item.owner.style.setProperty('--text-reveal-y', `${offset.toFixed(4)}px`);
      item.offset = offset;
    }
    if (p === 1) item.done = true;
  }
  function paint(state) {
    lastState = state;
    const down = state.scroll > previousScroll;
    for (const item of items) {
      if (item.done) continue;
      if (reduced.matches) { update(item, 1); continue; }
      if (!initialized || down) {
        const distance = Math.min(200, Math.max(80, state.height * .28));
        const progress = clamp((state.scroll + state.height - item.top) / distance);
        update(item, progress);
      }
    }
    previousScroll = state.scroll;
    initialized = true;
  }
  function measure() {
    // Remove the current visual offset mathematically, without a write/read
    // layout cycle. Resize/font changes never reset the one-way progress.
    const scroll = window.scrollY;
    for (const item of items) {
      if (!item.done) item.top = item.owner.getBoundingClientRect().top + scroll - item.offset;
    }
    paint({scroll, height: innerHeight});
  }
  engine.subscribe({measure, paint});
  reduced.addEventListener('change', () => { paint(lastState); engine.invalidate(); });
  document.fonts?.ready.then(engine.invalidate);
})();
