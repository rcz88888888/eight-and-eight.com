(() => {
  'use strict';
  // Run before body parsing: restored section hashes must not override a fresh start.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  let interacted = false, finished = false;
  const stop = () => { interacted = true; };
  const gestures = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
  for (const type of gestures) addEventListener(type, stop, {passive: true, capture: true});
  const top = () => window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  top();
  function finish() {
    if (finished) return;
    finished = true;
    if (!interacted) top();
    for (const type of gestures) removeEventListener(type, stop, {capture: true});
  }
  addEventListener('pageshow', finish, {once: true});
  // Loading fallback is bounded and cannot pull an active visitor back upwards.
  addEventListener('load', () => requestAnimationFrame(finish), {once: true});
})();
