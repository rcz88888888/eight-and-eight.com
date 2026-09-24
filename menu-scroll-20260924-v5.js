(() => {
  // Velocity starts at 18% of its peak, rises smoothly, then reaches zero.
  // Integrating that curve gives the normalized position used for scrolling.
  const startSpeed = 0.18;
  const acceleration = 2 - startSpeed + 2 * Math.sqrt(1 - startSpeed);
  const area = startSpeed / 2 + acceleration / 6;
  const ease = t => (startSpeed * t + (acceleration - startSpeed) * t * t / 2
    - acceleration * t * t * t / 3) / area;
  const root = document.documentElement;
  let active = null;

  const cancel = () => {
    if (!active) return;
    cancelAnimationFrame(active.frame);
    if (active.previousBehavior) {
      root.style.setProperty('scroll-behavior', active.previousBehavior, active.previousPriority);
    } else {
      root.style.removeProperty('scroll-behavior');
    }
    active = null;
  };

  const destinationFor = target => {
    const header = document.querySelector('.topbar');
    const position = header ? getComputedStyle(header).position : '';
    const headerHeight = header && (position === 'sticky' || position === 'fixed')
      ? header.getBoundingClientRect().height : 0;
    const margin = Math.max(headerHeight + 16, parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
    const limit = Math.max(0, root.scrollHeight - window.innerHeight);
    return Math.min(limit, Math.max(0, window.scrollY + target.getBoundingClientRect().top - margin));
  };

  const finish = (target, hash) => {
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    const hadTabindex = target.hasAttribute('tabindex');
    if (!hadTabindex) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (!hadTabindex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    cancel();
  };

  document.querySelectorAll('.site-nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = link.getAttribute('href');
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      cancel();
      document.querySelector('.site-nav')?.classList.remove('open');
      const toggle = document.querySelector('.menu-toggle');
      toggle?.setAttribute('aria-expanded', 'false');
      toggle?.setAttribute('aria-label', 'Open navigation');
      active = {
        frame: 0,
        previousBehavior: root.style.getPropertyValue('scroll-behavior'),
        previousPriority: root.style.getPropertyPriority('scroll-behavior')
      };
      // Avoid the browser applying a second easing to every animation frame.
      root.style.setProperty('scroll-behavior', 'auto', 'important');
      active.frame = requestAnimationFrame(startTime => {
        const start = window.scrollY;
        const distance = destinationFor(target) - start;
        if (Math.abs(distance) < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          window.scrollTo({ top: destinationFor(target), behavior: 'auto' });
          finish(target, hash);
          return;
        }
        const duration = Math.min(8000, 2400 + Math.abs(distance) * 0.45);
        const step = now => {
          const progress = Math.min(1, Math.max(0, (now - startTime) / duration));
          // Re-measure after menu closure and while lazy images finish loading.
          const destination = destinationFor(target);
          window.scrollTo({ top: start + (destination - start) * ease(progress), behavior: 'auto' });
          if (progress < 1) active.frame = requestAnimationFrame(step);
          else finish(target, hash);
        };
        step(startTime);
      });
    });
  });

  // A new gesture or navigation immediately returns control to the visitor.
  for (const type of ['wheel', 'touchstart', 'pointerdown', 'popstate', 'hashchange']) {
    window.addEventListener(type, cancel, { passive: true });
  }
  window.addEventListener('keydown', event => {
    if (event.target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName || '')) return;
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) cancel();
  });
})();
