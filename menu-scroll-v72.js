(() => {
  const rampSeconds = 0.88888888;
  const maxRingSpeed = 33.333333 * 2 * Math.PI / 60;
  const maxFrameSeconds = .05;
  const rampSpeed = t => t * t * (3 - 2 * t);
  // Integral of smoothstep velocity, with zero acceleration at both ends.
  const rampTravel = t => t ** 3 * (1 - t / 2);

  function createTrip(start, end, velocity) {
    const distance = Math.abs(end - start);
    const direction = Math.sign(end - start);
    const startSpeed = velocity * direction;
    const speed = Math.min(maxRingSpeed, Math.max(startSpeed, distance / rampSeconds - startSpeed / 2));
    const accelerationSeconds = speed > startSpeed ? rampSeconds : 0;
    const accelerationDistance = (startSpeed + speed) * accelerationSeconds / 2;
    // A moved anchor can leave less than a full ramp's stopping distance.
    const brakeSeconds = accelerationSeconds ? rampSeconds : Math.min(rampSeconds, 2 * distance / speed);
    const cruiseDistance = Math.max(0, distance - accelerationDistance - speed * brakeSeconds / 2);
    const duration = accelerationSeconds + cruiseDistance / speed + brakeSeconds;
    return {
      duration,
      sample(seconds) {
        if (seconds < accelerationSeconds) {
          const progress = seconds / accelerationSeconds;
          const speedChange = speed - startSpeed;
          return {
            angle: start + direction * (startSpeed * seconds + speedChange * accelerationSeconds * rampTravel(progress)),
            velocity: direction * (startSpeed + speedChange * rampSpeed(progress))
          };
        }
        const remaining = duration - seconds;
        if (remaining <= brakeSeconds) {
          const progress = Math.max(0, remaining) / brakeSeconds;
          return {
            angle: end - direction * speed * brakeSeconds * rampTravel(progress),
            velocity: direction * speed * rampSpeed(progress)
          };
        }
        return {
          angle: start + direction * (accelerationDistance + speed * (seconds - accelerationSeconds)),
          velocity: direction * speed
        };
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
      let lastFrameTime;
      let elapsed = 0;
      let velocity = 0;
      let destination;
      let trip;
      const engine = window.EightEightEffects;
      let mapping;
      const step = now => {
        if (active !== session) return;
        // After a delayed frame, continue with a short step so the page
        // cannot skip a visible part of the route to catch up with the clock.
        const frameSeconds = lastFrameTime === undefined ? 0 :
          Math.min(maxFrameSeconds, Math.max(0, (now - lastFrameTime) / 1000));
        lastFrameTime = now;
        if (!trip || destinationDirty) {
          const nextDestination = destinationFor(target);
          destinationDirty = false;
          if (!trip || Math.abs(nextDestination - destination) > 1) {
            destination = nextDestination;
            const scrollRange = Math.max(1, root.scrollHeight - window.innerHeight);
            mapping = engine?.createRingScrollMapping?.() ?? {
              angleAtScroll: scroll => scroll / scrollRange * 16 * Math.PI,
              scrollAtAngle: angle => angle / (16 * Math.PI) * scrollRange
            };
            const start = scrollPosition();
            const startAngle = mapping.angleAtScroll(start);
            const endAngle = mapping.angleAtScroll(destination);
            if (Math.abs(destination - start) < 1 || Math.abs(endAngle - startAngle) < 1e-9 ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              scrollTo({top: destination, behavior: 'auto'});
              finish(target, hash);
              return;
            }
            // Use the current speed when a layout change moves the anchor.
            trip = createTrip(startAngle, endAngle, velocity);
            elapsed = 0;
          }
        }
        elapsed += frameSeconds;
        if (elapsed >= trip.duration) {
          scrollTo({top: destinationFor(target), behavior: 'instant'});
          finish(target, hash);
        } else {
          const sample = trip.sample(elapsed);
          velocity = sample.velocity;
          scrollTo({top: mapping.scrollAtAngle(sample.angle), behavior: 'instant'});
          if (!session.stopDriver) session.frame = requestAnimationFrame(step);
        }
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
