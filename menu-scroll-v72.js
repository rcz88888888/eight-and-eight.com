(() => {
  // Velocity starts at 18% of its peak, rises smoothly, then reaches zero.
  // Integrating that curve gives the normalized position used for scrolling.
  const startSpeed = 0.18;
  const acceleration = 2 - startSpeed + 2 * Math.sqrt(1 - startSpeed);
  const area = startSpeed / 2 + acceleration / 6;
  const ease = t => (startSpeed * t + (acceleration - startSpeed) * t * t / 2
    - acceleration * t * t * t / 3) / area;
  const root = document.scrollingElement || document.documentElement;
  const scrollPosition = () => window.scrollY;
  const scrollTo = options => window.scrollTo(options);
  let active = null;
  let destinationDirty = true;
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => { destinationDirty = true; });
    observer.observe(document.querySelector('.site-shell'));
  }
  window.addEventListener('resize', () => { destinationDirty = true; }, {passive: true});

  const cancel = () => {
    if (!active) return;
    if(active.frame)cancelAnimationFrame(active.frame);
    active.stopDriver?.();
    if (active.previousBehavior) {
      root.style.setProperty('scroll-behavior', active.previousBehavior, active.previousPriority);
    } else {
      root.style.removeProperty('scroll-behavior');
    }
    active = null;
  };

  const destinationFor = target => {
    if (target.id === 'top') return 0;
    const header = document.querySelector('.topbar');
    const position = header ? getComputedStyle(header).position : '';
    const headerHeight = header && (position === 'sticky' || position === 'fixed')
      ? header.getBoundingClientRect().height : 0;
    const margin = Math.max(headerHeight + 16, parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
    const limit = Math.max(0, root.scrollHeight - window.innerHeight);
    return Math.min(limit, Math.max(0, scrollPosition() + target.getBoundingClientRect().top - margin));
  };

  const finish = (target, hash) => {
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    const hadTabindex = target.hasAttribute('tabindex');
    if (!hadTabindex) target.setAttribute('tabindex', '-1');
    // Focus the destination for navigation without outlining its entire panel.
    target.setAttribute('data-navigation-destination', '');
    target.focus({ preventScroll: true });
    if (!hadTabindex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    cancel();
  };

  // All in-page navigation: menu entries, the header wordmark and Back to top.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
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
      const session = active;
      let startTime=null,start=0,destination=0,duration=0;
      const engine=window.EightEightEffects;
      const step=now=>{
        if(active!==session)return;
        if(startTime===null){
          startTime=now;start=scrollPosition();destination=destinationFor(target);
          destinationDirty=false;
          const distance=destination-start;
          if(Math.abs(distance)<1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches){
            scrollTo({top:destination,behavior:'auto'});finish(target,hash);return;
          }
          duration=Math.min(8000,2400+Math.abs(distance)*.45);
        }
        const progress=Math.min(1,Math.max(0,(now-startTime)/duration));
        if(destinationDirty){destination=destinationFor(target);destinationDirty=false;}
        scrollTo({top:start+(destination-start)*ease(progress),behavior:'auto'});
        if(progress===1)finish(target,hash);
        else if(!session.stopDriver)session.frame=requestAnimationFrame(step);
      };
      if(engine?.addFrameDriver)session.stopDriver=engine.addFrameDriver(step);
      else session.frame=requestAnimationFrame(step);
    });
  });

  // A new gesture or navigation immediately returns control to the visitor.
  for (const type of ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'popstate', 'hashchange']) {
    window.addEventListener(type, cancel, { passive: true, capture: true });
  }
  window.addEventListener('keydown', event => {
    if (event.target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName || '')) return;
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) cancel();
  });
})();
