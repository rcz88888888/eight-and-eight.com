(() => {
  // Velocity starts at 18% of its peak, rises smoothly, then reaches zero.
  // Integrating that curve gives the normalized position used for scrolling.
  const startSpeed = 0.18;
  const acceleration = 2 - startSpeed + 2 * Math.sqrt(1 - startSpeed);
  const area = startSpeed / 2 + acceleration / 6;
  const ease = t => (startSpeed * t + (acceleration - startSpeed) * t * t / 2
    - acceleration * t * t * t / 3) / area;
  // Menu journeys follow the same eight-turn scroll curve as the logo engine.
  // Ramp from 8 rpm over half a second, cruise at 33/45 rpm, then ease to rest.
  const scrollTurns = (position, limit) =>
    4 * (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, position / limit))));
  const positionForTurns = (turns, limit) =>
    Math.acos(Math.min(1, Math.max(-1, 1 - turns / 4))) / Math.PI * limit;
  function menuJourney(start, destination, limit) {
    const from = scrollTurns(start, limit), to = scrollTurns(destination, limit);
    const direction = Math.sign(to - from), distance = Math.abs(to - from);
    const rpm = destination > start ? 33 : 45;
    const ramp = .5, brake = .3, initialFraction = 8 / rpm;
    const rampArea = ramp * (1 + initialFraction) / 2;
    const brakeArea = brake / 2;
    const peak = Math.min(rpm / 60, distance / (rampArea + brakeArea));
    const cruise = peak > 0 ? Math.max(0, distance / peak - rampArea - brakeArea) : 0;
    const duration = ramp + cruise + brake;
    const integral = t => t * t * t - t * t * t * t / 2;
    return {
      duration: duration * 1000,
      position(elapsed) {
        const time = Math.min(duration, Math.max(0, elapsed / 1000));
        let area;
        if (time < ramp) {
          const t = time / ramp;
          area = ramp * (initialFraction * t + (1 - initialFraction) * integral(t));
        } else if (time < ramp + cruise) {
          area = rampArea + time - ramp;
        } else {
          const t = (time - ramp - cruise) / brake;
          area = rampArea + cruise + brake * (t - integral(t));
        }
        if (time >= duration) return destination;
        return positionForTurns(from + direction * Math.min(distance, peak * area), limit);
      }
    };
  }
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
      const menuNavigation = Boolean(link.closest('.site-nav'));
      let journey;
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
          if(menuNavigation){
            journey=menuJourney(start,destination,Math.max(1,root.scrollHeight-window.innerHeight));
            duration=journey.duration;
          }
        }
        if(destinationDirty){
          destination=destinationFor(target);destinationDirty=false;
          if(menuNavigation){
            start=scrollPosition();startTime=now;
            journey=menuJourney(start,destination,Math.max(1,root.scrollHeight-window.innerHeight));
            duration=journey.duration;
          }
        }
        const progress=Math.min(1,Math.max(0,(now-startTime)/duration));
        const top=journey ? journey.position(now-startTime) : start+(destination-start)*ease(progress);
        scrollTo({top,behavior:'auto'});
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
