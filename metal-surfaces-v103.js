(() => {
  'use strict';
  const engine = window.EightEightEffects;
  const root = document.documentElement;
  const logo = document.querySelector('.hero-wallpaper-logo');
  const ambient = document.querySelector('.ambient-eight-light');
  const front = document.querySelector('.front-eight-light');
  const movingGradient = logo?.querySelector('#figure-eight-light');
  const secondGradient = logo?.querySelector('#figure-eight-light-2');
  let routes = [];
  const openingGradient = logo?.querySelector('#opening-paper-light');
  const centralGradient = logo?.querySelector('#central-paper-light');
  const specularGradient = logo?.querySelector('#specular-paper-light');
  const header = document.querySelector('.topbar');
  const firstHeading = document.querySelector('#about h2');
  if (!engine || !logo || !movingGradient || !openingGradient || !centralGradient || !specularGradient) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Read geometry only during the existing layout pass. Never move content or scroll.
  const nodes = [...document.querySelectorAll('.gold-light-target, .topbar, .wallpaper-end, .site-nav, .site-nav a')].filter(node => !node.closest('.wordmark, .menu-toggle'));
  let surfaces = [], logoBox, openingField, width = innerWidth, height = innerHeight;
  let scroll = engine.scrollPosition(), raf = 0, elapsed = 0, previousTime;
  let lightVisible = false, lastPaint = -Infinity;
  const duration = 28, slow = 1 / 8, fast = 1 / .8;
  const average = (slow + fast) / 2, amplitude = (fast - slow) / 2;
  function orbitSpeed(seconds) {
    return average - amplitude * Math.cos(2 * Math.PI * seconds / duration);
  }
  function orbitCycles(seconds) {
    return average * seconds - amplitude * duration / (2*Math.PI) * Math.sin(2*Math.PI*seconds/duration);
  }
  function prepareRoutes() {
    // Sample the two actual large bass-clef outlines only on layout passes.
    const paths = [...logo.querySelectorAll('#hero-paper-shape path')]
      .map(path => ({path, length:path.getTotalLength(), box:path.getBBox()}))
      .sort((a,b)=>b.length-a.length).slice(0,2)
      .sort((a,b)=>(a.box.y+a.box.height/2)-(b.box.y+b.box.height/2));
    routes = paths.map(({path,length}) => {
      const points = Array.from({length:512},(_,i)=>path.getPointAtLength(length*i/512));
      const area=points.reduce((sum,a,i)=>{const b=points[(i+1)%512];return sum+a.x*b.y-b.x*a.y;},0);
      if(area<0) points.reverse(); // Matching winding makes opposite phases counterrotate.
      const closest = points.reduce((best,p,i)=>Math.hypot(p.x-461,p.y-684)<Math.hypot(points[best].x-461,points[best].y-684)?i:best,0);
      return points.map((_,i)=>points[(i+closest)%512]);
    });
  }
  function orbitPoints(seconds) {
    const phase = ((orbitCycles(seconds)%1)+1)%1;
    return routes.map((route,index)=> {
      const q = index ? (1-phase)%1 : phase;
      const cursor=q*route.length, i=Math.floor(cursor), blend=cursor-i;
      const a=route[i], b=route[(i+1)%route.length];
      const distance=Math.min(phase,1-phase);
      const u=Math.min(1,distance/.06), join=u*u*(3-2*u);
      // Both contour routes meet at exactly the same center once per round.
      return {x:461+((a.x+(b.x-a.x)*blend)-461)*join,
              y:684+((a.y+(b.y-a.y)*blend)-684)*join};
    });
  }
  // Unchanged opening geometry must not invalidate every masked SVG each tick.
  const values = new WeakMap();
  function cached(element, key, value, write) {
    let cache = values.get(element);
    if (!cache) { cache = new Map(); values.set(element, cache); }
    if (cache.get(key) === value) return;
    cache.set(key, value); write();
  }
  const property = (element, key, value) => cached(element, key, value, () => element.style.setProperty(key, value));
  const attribute = (element, key, value) => cached(element, key, value, () => element.setAttribute(key, value));
  function drawOpening() {
    const opening = .88 * Math.max(0, 1 - Math.max(0, scroll) / 88);
    property(root, '--opening-light-opacity', opening.toFixed(4));
    for (const item of surfaces) {
      const top = item.top - (item.fixed ? 0 : scroll);
      if (top > height || top + item.height < 0) continue;
      property(item.node, '--opening-x', `${(openingField.x - item.left).toFixed(2)}px`);
      property(item.node, '--opening-y', `${(openingField.y - scroll - top).toFixed(2)}px`);
      property(item.node, '--opening-radius', `${openingField.radius.toFixed(2)}px`);
      property(item.node, '--opening-core-rx', `${openingField.coreRx.toFixed(2)}px`);
      property(item.node, '--opening-core-ry', `${openingField.coreRy.toFixed(2)}px`);
      property(item.node, '--opening-specular-rx', `${openingField.specularRx.toFixed(2)}px`);
    }
    if (logoBox?.scale > 0) {
      const ox = (openingField.x - logoBox.left) / logoBox.scale;
      const oy = (openingField.y - logoBox.top) / logoBox.scale;
      const radius = openingField.radius / logoBox.scale;
      // Uniform scale: a circle in SVG space is the same circle in CSS pixels.
      attribute(openingGradient, 'gradientTransform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${radius.toFixed(2)})`);
      attribute(centralGradient, 'gradientTransform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${(openingField.coreRx / logoBox.scale).toFixed(2)} ${(openingField.coreRy / logoBox.scale).toFixed(2)})`);
      attribute(specularGradient, 'gradientTransform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${(openingField.specularRx / logoBox.scale).toFixed(2)} ${(openingField.coreRy / logoBox.scale).toFixed(2)})`);
    }
  }
  function drawFigure() {
    if (!(logoBox?.scale > 0) || routes.length !== 2) return;
    const points=orbitPoints(elapsed);
    const radius=460*logoBox.scale; // Half of the former diameter/falloff.
    const axis=engine.logoFrame, angle=axis?.rotation || 0;
    const cx=axis?.x ?? width/2, cy=axis?.y ?? height/2;
    points.forEach((point,index)=> {
      const suffix=index ? '-2' : '';
      const x=logoBox.left+point.x*logoBox.scale;
      const y=logoBox.top+point.y*logoBox.scale;
      const dx=x-cx, dy=y-cy;
      const rearX=cx+dx*Math.cos(angle)-dy*Math.sin(angle);
      const rearY=cy+dx*Math.sin(angle)+dy*Math.cos(angle);
      for (const [plane,px,py] of [[ambient,rearX,rearY],[front,x,y]]) {
        if (!plane) continue;
        property(plane, '--eight-x'+suffix, `${px.toFixed(3)}px`);
        property(plane, '--eight-y'+suffix, `${py.toFixed(3)}px`);
        property(plane, '--eight-radius'+suffix, `${radius.toFixed(3)}px`);
      }
      for (const item of surfaces) {
        const top=item.top-(item.fixed?0:scroll);
        if(top>height || top+item.height<0) continue;
        property(item.node,'--eight-x'+suffix,`${(x-item.left).toFixed(3)}px`);
        property(item.node,'--eight-y'+suffix,`${(y-top).toFixed(3)}px`);
        property(item.node,'--eight-radius'+suffix,`${radius.toFixed(3)}px`);
        if (!item.banner) continue;
        property(item.node,'--banner-rear-x'+suffix,`${(rearX-item.left).toFixed(3)}px`);
        property(item.node,'--banner-rear-y'+suffix,`${(rearY-top).toFixed(3)}px`);
        property(item.node,'--banner-rear-radius'+suffix,`${radius.toFixed(3)}px`);
      }
      const gradient=index?secondGradient:movingGradient;
      if(gradient) attribute(gradient,'gradientTransform',`translate(${point.x.toFixed(3)} ${(point.y+scroll/logoBox.scale).toFixed(3)}) scale(460)`);
    });
  }
  const canAnimate = () => lightVisible && !document.hidden && !reduced.matches;
  function syncAnimation() {
    if (!canAnimate()) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0; previousTime = undefined; return;
    }
    if (!raf) { previousTime = undefined; raf = requestAnimationFrame(tick); }
  }
  engine.subscribe({measure() {
    width = innerWidth; height = innerHeight; scroll = engine.scrollPosition();
    prepareRoutes();
    surfaces = nodes.map(node => {
      const box = node.getBoundingClientRect();
      const fixed = node.matches('.topbar, .site-nav') || !!node.closest('.topbar, .site-nav');
      return {node, fixed, banner: node.matches('.topbar, .wallpaper-end, .site-nav'), left: box.left, top: box.top + (fixed ? 0 : scroll), height: box.height};
    });
    const box = logo.getBoundingClientRect();
    const scale = Math.min(box.width / 922, box.height / 1368);
    logoBox = {scale, left: box.left + (box.width - 922 * scale) / 2,
      top: box.top + scroll + (box.height - 1368 * scale) / 2};
    // The opening circle falls off before the marked corners. A taller,
    // narrower specular reflection reaches from the banner through the middle.
    // Document anchors keep both fields stable when browser bars resize.
    const top = -(header?.getBoundingClientRect().height || 88) * .27;
    const heading = firstHeading?.getBoundingClientRect();
    const bottom = heading ? heading.bottom + scroll + 64 : logoBox.top + 1368 * scale + 160;
    openingField = {x: width / 2, y: (top + bottom) / 2,
      radius: Math.max((bottom - top) / 2, width / 2) * 1.15,
      coreRx: Math.max(44, width * .18), specularRx: Math.max(12, width * .035), coreRy: (bottom - top) * 1.2};
  }, paint(state) {
    scroll = state.scroll;
    lightVisible = logoBox.scale > 0 && surfaces.some(item => {
      const top = item.top - (item.fixed ? 0 : scroll);
      return top < height && top + item.height > 0;
    });
    drawOpening(); drawFigure(); syncAnimation();
  }});
  function tick(time) {
    raf = 0;
    if (!canAnimate()) { previousTime = undefined; return; }
    if (previousTime !== undefined) elapsed += Math.min(100, Math.max(0, time - previousTime)) / 1000;
    previousTime = time;
    if (time - lastPaint >= 1000 / 60 - .5) { drawFigure(); lastPaint = time; }
    raf = requestAnimationFrame(tick);
  }
  function resume() {
    previousTime = undefined; syncAnimation(); engine.schedule();
  }
  document.addEventListener('visibilitychange', resume);
  reduced.addEventListener('change', resume);
  resume();
})();
