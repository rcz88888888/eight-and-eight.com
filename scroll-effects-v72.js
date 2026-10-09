(() => {
  'use strict';
  const root = document.documentElement;
  const scrollPosition = () => window.scrollY;
  const scrollHeight = () => (document.scrollingElement || root).scrollHeight;
  const background = document.querySelector('.background-layers');
  const logos = document.querySelector('.main-logo-canvas');
  const main = document.querySelector('.parallax-logo');
  const openingLogo = document.querySelector('.hero-static-logo');
  const bannerMask = document.querySelector('.banner-content-mask');
  const bannerFeed = document.querySelector('.banner-logo-feed');
  const feed = bannerFeed?.getContext('2d');
  let feedHeight = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const subscribers = [];
  const frameDrivers = new Set();
  const image = new Image();
  const bg = background?.getContext('2d');
  const ink = logos?.getContext('2d');
  const layers = [...document.querySelectorAll('.main-logo-layer')].map(node => ({
    scale: parseFloat(node.style.getPropertyValue('--layer-scale')) || 1,
    opacity: parseFloat(node.style.opacity) || .08,
    depth: Number(node.dataset.depth),
    idleAngle: 0, settleAngle: 0,
    speed: .72 ** Number(node.dataset.depth)
  }));
  let raf = 0;
  let layoutDirty = true;
  let viewportDirty = true;
  let lastWidth = 0;
  let pageHeight = 0;
  let sceneKey = '';
  let sceneViewportHeight = 0;
  let particles = [];
  let rain = [], rainWidth = 0, rainHeight = 0, rainMaxWidth = 0;
  let rainTime = 0, lastRainTime;
  let lastMainPaint = '';
  let lastFeedPaint = '';
  let sprites = [];
  let mainSprites = [];
  let mainBox;
  let openingScaleFactor=1;
  const reference=document.createElement('span');
  reference.className='landscape-logo-reference';
  reference.setAttribute('aria-hidden','true');
  openingLogo?.parentElement.append(reference);
  let openingCenter;
  let bgRatio = 1;
  let inkRatio = 1;
  let logoProgress;
  let logoAnimating = false;
  let lastLogoTime;
  let lastBackgroundPaint = '';
  let lastSubscriberState = '';
  // One frame clock for idle rotation, scroll handoff and the return wobble.
  const TAU = Math.PI * 2;
  let idleMode = 'waiting', idleSince, spinSince, idleLastTime;
  let mainIdleAngle = 0, heroIdleAngle = 0, heroSpeed = 0;
  let idlePreviousScroll = 0, settleSince, settleHero = 0, settleMain = 0;
  const shortestAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
  // 88% of the cycle is at or below 48% speed; the central 12% forms
  // a smooth peak. The analytic integral avoids numerical/frame-rate drift.
  function cycleSpeed(u) {
    if(u<.44){const x=u/.44;return .48*(3*x*x-2*x*x*x);}
    if(u<=.56)return .48+.52*Math.sin(Math.PI*(u-.44)/.12)**2;
    const x=(1-u)/.44;return .48*(3*x*x-2*x*x*x);
  }
  function cycleIntegral(u) {
    const low=x=>.48*(x**3/.44**2-.5*x**4/.44**3);
    if(u<.44)return low(u);
    if(u<=.56){const v=u-.44;return .1056+.74*v-.52*.12/(4*Math.PI)*Math.sin(2*Math.PI*v/.12);}
    return .3-low(1-u);
  }
  const smoothEnd = x => x*x*x*(10+x*(-15+6*x));
  function spinPhase(seconds) {
    if(seconds<=0 || seconds>=58)return 0;
    const u=seconds/58;
    // Finish on 139 whole turns rather than 139.2. A small correction
    // in the final ten seconds preserves the central 8 turns/s peak.
    const x=Math.max(0,Math.min(1,(seconds-48)/10));
    return TAU*(8*58*cycleIntegral(u)-.2*smoothEnd(x));
  }
  function spinSpeed(seconds) {
    if(seconds<=0 || seconds>=58)return 0;
    const x=Math.max(0,Math.min(1,(seconds-48)/10));
    return TAU*(8*cycleSpeed(seconds/58)-.2/10*30*x*x*(1-x)*(1-x));
  }
  function updateIdleRotation(time, scroll) {
    const dt = idleLastTime === undefined ? 0 : Math.min(.064, Math.max(0, (time-idleLastTime)/1000));
    idleLastTime = time;
    const moved = Math.abs(scroll-idlePreviousScroll) > .25;
    idlePreviousScroll = scroll;
    const atTop = scroll <= .5;
    if (reduced.matches) {
      idleMode='waiting';idleSince=time;
      mainIdleAngle=heroIdleAngle=heroSpeed=0;
      layers.forEach(layer=>layer.idleAngle=0);
    } else if (!atTop || moved) {
      // Freeze the main logos' automatic angle. The original scroll rotation
      // continues from it; the front emblem alone coasts to a stop.
      idleMode='scrolling';idleSince=undefined;
      heroIdleAngle += heroSpeed * .22 * (1-Math.exp(-dt/.22));
      heroSpeed *= Math.exp(-dt/.22);
      if (heroSpeed < .001) heroSpeed=0;
    } else {
      if (idleMode==='scrolling') {
        idleMode='settling';settleSince=time;
        settleHero=shortestAngle(heroIdleAngle);
        settleMain=shortestAngle(mainIdleAngle);
        layers.forEach(layer=>layer.settleAngle=shortestAngle(layer.idleAngle));
        heroSpeed=0;
      }
      if (idleMode==='settling') {
        const t=Math.min(1,(time-settleSince)/1100);
        const envelope=(1-t)**3;
        // Continuous return followed by a small, damped wobble.
        const wobble=Math.sin(t*Math.PI*6)*.035*Math.sin(Math.PI*t)*envelope;
        heroIdleAngle=settleHero*envelope+wobble;
        mainIdleAngle=settleMain*envelope;
        layers.forEach(layer=>layer.idleAngle=layer.settleAngle*envelope);
        if(t===1){heroIdleAngle=mainIdleAngle=0;idleMode='waiting';idleSince=time;}
      }
      if(idleMode==='waiting') {
        if(idleSince===undefined)idleSince=time;
        if(time-idleSince>=8000){idleMode='running';spinSince=time;}
      }
      if(idleMode==='running') {
        const elapsed=Math.max(0,(time-spinSince)/1000);
        heroSpeed=spinSpeed(elapsed);
        mainIdleAngle=heroIdleAngle=spinPhase(elapsed);
        // Frontmost depth zero starts first; each deeper layer waits 0.8s.
        layers.forEach(layer=>layer.idleAngle=spinPhase(elapsed-layer.depth*.8));
        const lastFinish=58+Math.max(0,...layers.map(layer=>layer.depth))*.8;
        if(elapsed>=lastFinish){
          // Begin the shared pause only once all nine logos have arrived.
          mainIdleAngle=heroIdleAngle=heroSpeed=0;
          layers.forEach(layer=>layer.idleAngle=0);
          idleMode='waiting';idleSince=time;
        }
      }
    }
    if(openingLogo)openingLogo.style.setProperty('--hero-idle-angle',`${shortestAngle(heroIdleAngle)}rad`);
  }
  const spriteFor = pixels => sprites.find(sprite => sprite.width >= pixels) || sprites[sprites.length - 1];
  const mainSpriteFor = pixels => mainSprites.find(sprite => sprite.width >= pixels) || mainSprites[mainSprites.length - 1];
  function cacheSpriteChoices() {
    if (!sprites.length || !mainBox) return;
    const scale = Math.min(mainBox.width / 922, mainBox.height / 1368) * openingScaleFactor;
    for (const layer of layers) layer.sprite = mainSpriteFor(922 * scale * layer.scale * inkRatio);
    for (const mark of [...particles, ...rain]) mark.sprite = spriteFor(mark.width * bgRatio);
  }
  function easeLogoProgress(target, time, reset) {
    if (reset || logoProgress === undefined || reduced.matches) {
      logoProgress = target;
    } else {
      // Time-based damping fills the gaps between touch-scroll events. Only
      // the eight-logo drawing is eased; document scrolling and masks stay native.
      const dt = logoAnimating && lastLogoTime !== undefined ? Math.max(0, Math.min(64, time - lastLogoTime)) : 1000 / 60;
      logoProgress += (target - logoProgress) * (1 - Math.exp(-dt / 42));
    }
    lastLogoTime = time;
    logoAnimating = Math.abs(target - logoProgress) > .00001;
    if (!logoAnimating) logoProgress = target;
    return logoProgress;
  }
  const randomFrom = seed => () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const schedule = () => {
    if (!raf && !document.hidden) raf = requestAnimationFrame(render);
  };
  const invalidate = () => { layoutDirty = true; viewportDirty = true; schedule(); };
  window.EightEightEffects = {
    subscribe(callbacks) { subscribers.push(callbacks); invalidate(); },
    // Navigation advances first, then all canvases and lights use the same
    // resulting scroll position in this frame (no second animation clock).
    addFrameDriver(callback) {
      frameDrivers.add(callback);schedule();
      return () => frameDrivers.delete(callback);
    },
    invalidate,
    schedule,
    scrollPosition
  };
  function resizeSurface(canvas, context, width, height, ratio) {
    const w = Math.round(width * ratio);
    const h = Math.round(height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      lastBackgroundPaint = '';
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'low';
    }
  }
  function measure(width, height) {
    // All layout reads happen before the scroll frame's paints.
    pageHeight = Math.max(scrollHeight(), height);
    mainBox = main?.getBoundingClientRect();
    if (layoutDirty) subscribers.forEach(item => item.measure?.());
    if (openingLogo) {
      const box = openingLogo.getBoundingClientRect();
      openingScaleFactor=1;
      if(matchMedia('(orientation: landscape)').matches) {
        const oldBox=reference.getBoundingClientRect();
        const before=Math.min(oldBox.width/922,oldBox.height/1368);
        const after=Math.min(openingLogo.clientWidth/922,openingLogo.clientHeight/1368);
        if(before>0)openingScaleFactor=after/before;
      }
      openingCenter = {x: box.left + box.width / 2,
        y: box.top + scrollPosition() + box.height / 2};
    }
    cacheSpriteChoices();
    if (feed && bannerMask) {
      feedHeight = Math.max(0, Math.min(height, bannerMask.getBoundingClientRect().height));
      resizeSurface(bannerFeed, feed, width, feedHeight, Math.min(devicePixelRatio || 1, 1.5));
    }
    if (!bg || !ink || !mainBox) return;
    bgRatio = Math.min(devicePixelRatio || 1, 1.25);
    inkRatio = Math.min(devicePixelRatio || 1, 1.5);
    resizeSurface(background, bg, width, height, bgRatio);
    resizeSurface(logos, ink, width, height, inkRatio);
    background.style.width = logos.style.width = `${width}px`;
    background.style.height = logos.style.height = `${height}px`;
    const mainWidth = Math.min(mainBox.width, mainBox.height * 922 / 1368) * 1.15;
    const portrait = matchMedia('(orientation: portrait)').matches;
    const key = `${width}:${Math.round(pageHeight)}:${portrait}:${mainWidth.toFixed(1)}`;
    if (key === sceneKey) { rainWidth=width;rainHeight=height;cacheSpriteChoices(); return; }
    sceneKey = key;
    const rand = randomFrom(88888888);
    const count = portrait ? 2222 : 8888;
    // Preserve the seeded density, sizes, opacity and individual speeds.
    // Browser toolbar height changes do not rebuild this scene.
    if (!sceneViewportHeight || width !== lastWidth) sceneViewportHeight = height;
    const stableHeight = sceneViewportHeight;
    particles = Array.from({length: count}, (_, i) => {
      const fraction = i === 0 ? 0 : i === count - 1 ? 1 : rand() ** 2.6;
      const w = mainWidth * (.004 + .436 * fraction);
      return {
        x: rand() * (width + mainWidth) - mainWidth / 2 - w / 2,
        y: rand() * (pageHeight + stableHeight) - stableHeight / 2,
        width: w, height: w * 1368 / 922,
        opacity: (.08 + rand() * .24) * .2206456,
        speed: .16 + rand() * .56
      };
    });
    rainWidth=width;rainHeight=height;rainMaxWidth=mainWidth;
    const previousPoolSize=Math.max(24,Math.min(portrait?160:256,Math.round(count*stableHeight/pageHeight)));
    const poolSize=portrait?Math.round(previousPoolSize/3):previousPoolSize;
    rain=Array.from({length:poolSize},()=>spawnRain(true));
    lastRainTime=undefined;
    background.dataset.logoCount = String(poolSize);
    cacheSpriteChoices();
  }
  function spawnRain(initial=false) {
    const width=rainMaxWidth*(.004+.436*Math.random()**2.6);
    const duration=1+7*Math.random();
    return {x:Math.random()*rainWidth-width/2,width,height:width*1368/922,
      opacity:(.08+Math.random()*.24)*.2206456,duration,
      progress:initial?Math.random():0,sprite:spriteFor(width*bgRatio)};
  }
  function advanceRain(time,width,height) {
    if(lastRainTime!==undefined && time-lastRainTime<1000/60-.5)return;
    const dt=lastRainTime===undefined?0:Math.min(.1,Math.max(0,(time-lastRainTime)/1000));
    lastRainTime=time;
    if(reduced.matches)return;
    rainTime+=dt;
    for(let i=0;i<rain.length;i++) {
      const mark=rain[i];mark.progress+=dt/mark.duration;
      if(mark.progress>=1)rain[i]=spawnRain();
    }
  }
  function field(width, height, scroll) {
    const progress = Math.min(1, scroll / Math.max(1, pageHeight - height));
    const motion = reduced.matches ? 0 : progress;
    const travel = reduced.matches ? 0 : scroll / Math.max(1, height);
    return {width, height, scroll, progress, travel,
      motionScroll: reduced.matches ? 0 : scroll, motionProgress: motion};
  }
  function paintCanvas(state, easedProgress) {
    if (!bg || !ink || !mainBox || !sprites.length) return;
    const {width, height, motionScroll} = state;
    const motionProgress = easedProgress;
    const backgroundKey = `${sceneKey}:${width}:${height}:${rainTime}`;
    if (backgroundKey !== lastBackgroundPaint) {
      bg.clearRect(0, 0, width, height);
      let visible = 0;
      for (const mark of rain) {
        const top = -mark.height + mark.progress * (height + mark.height);
        if (top + mark.height < 0 || top > height || mark.x + mark.width < 0 || mark.x > width) continue;
        const sprite = mark.sprite;
        bg.globalAlpha = mark.opacity;
        bg.drawImage(sprite, mark.x, top, mark.width, mark.height);
        visible++;
      }
      bg.globalAlpha = 1;
      const count = String(visible);
      if (background.dataset.visibleLogos !== count) background.dataset.visibleLogos = count;
      lastBackgroundPaint = backgroundKey;
    }
    const mainPaintKey=`${sceneKey}:${width}:${height}:${openingScaleFactor}:${easedProgress}:${layers.map(layer=>layer.idleAngle).join(',')}`;
    if(mainPaintKey===lastMainPaint)return;
    lastMainPaint=mainPaintKey;
    // Eight unlit logos share one canvas; native document scrolling is untouched.
    ink.clearRect(0, 0, width, height);
    const scale = Math.min(mainBox.width / 922, mainBox.height / 1368) * openingScaleFactor;
    const w = 922 * scale;
    const h = 1368 * scale;
    const cx = mainBox.left + mainBox.width / 2;
    const cy = mainBox.top + mainBox.height / 2;
    const travel = (.5 - motionProgress) * Math.min(height, mainBox.height);
    const rotation = (.5 - .5 * Math.cos(Math.PI * motionProgress)) * Math.PI * 16;
    // All eight centers coincide with the opening emblem at scroll zero.
    // Fade this correction smoothly during the first quarter of the page,
    // retaining the established depth-dependent movement further down.
    const startPhase = Math.min(1, Math.max(0, motionProgress * 4));
    const openingBlend = 1 - startPhase ** 3 * (startPhase * (startPhase * 6 - 15) + 10);
    const startX = openingCenter?.x ?? cx;
    const startY = openingCenter?.y ?? cy;
    const openingTravel = .5 * Math.min(height, mainBox.height);
    window.EightEightEffects.logoFrame = {
      rotation: rotation + (layers[layers.length-1]?.idleAngle || 0),
      x: cx + (startX - cx) * openingBlend,
      y: cy + travel * (layers[layers.length - 1]?.speed ?? 1) +
        (startY - cy - openingTravel * (layers[layers.length - 1]?.speed ?? 1)) * openingBlend
    };
    for (const layer of layers) {
      ink.save();
      ink.translate(cx + (startX - cx) * openingBlend,
        cy + travel * layer.speed + (startY - cy - openingTravel * layer.speed) * openingBlend);
      ink.rotate(rotation + layer.idleAngle);
      ink.scale(layer.scale, layer.scale);
      ink.globalAlpha = layer.opacity;
      ink.drawImage(layer.sprite, -w / 2, -h / 2, w, h);
      ink.restore();
    }
    if (!root.classList.contains('canvas-logos-ready')) {
      root.classList.add('logo-rain-ready', 'canvas-logos-ready');
    }
  }
  // Copy the same rendered frame, cropped to the banner. Do not create or
  // animate another set of logos: position, rotation and opacity match.
  function paintBannerFeed(width, height) {
    if (!feed || !bg || !ink || !feedHeight || !width || !height) return;
    const feedKey=`${lastBackgroundPaint}:${lastMainPaint}:${width}:${height}:${feedHeight}`;
    if(feedKey===lastFeedPaint)return;
    lastFeedPaint=feedKey;
    feed.clearRect(0, 0, width, feedHeight);
    for (const source of [background, logos]) {
      if (!source.width || !source.height) continue;
      feed.drawImage(source, 0, 0, source.width, source.height * feedHeight / height,
        0, 0, width, feedHeight);
    }
  }
  function render(time = performance.now()) {
    raf = 0;
    if (document.hidden) return;
    const controlledScroll=frameDrivers.size>0;
    for(const driver of [...frameDrivers])driver(time);
    const width = root.clientWidth;
    const height = innerHeight;
    const geometryDirty = layoutDirty || viewportDirty;
    const resetMotion = width !== lastWidth;
    if (geometryDirty) {
      measure(width, height);
      layoutDirty = viewportDirty = false;
      lastWidth = width;
    }
    const state = field(width, height, Math.max(0, scrollPosition()));
    updateIdleRotation(time,state.scroll);
    const easedProgress = easeLogoProgress(state.motionProgress, time, resetMotion || controlledScroll);
    advanceRain(time,width,height);
    paintCanvas(state, easedProgress);
    paintBannerFeed(width, height);
    const subscriberState = `${width}:${height}:${state.scroll}:${state.progress}:${state.motionProgress}`;
    if (geometryDirty || subscriberState !== lastSubscriberState) {
      subscribers.forEach(item => item.paint?.(state));
      lastSubscriberState = subscriberState;
    }
    if ((!reduced.matches && (state.scroll <= .5 || heroSpeed > 0)) || frameDrivers.size || logoAnimating || (!reduced.matches && rain.length && sprites.length)) schedule();
  }
  image.addEventListener('load', () => {
    sprites = [...new Set([8, 16, 32, 64, 128, 256, 384, 512, 768, Math.min(1536, image.naturalWidth || 922)])].sort((a, b) => a - b).map(width => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.round(width * 1368 / 922);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    });
    // Cache the wallpaper base colour once per sprite size. Preserve the
    // source silhouette and each layer's independent opacity during drawing.
    const baseColour=getComputedStyle(root).getPropertyValue('--wallpaper-sand-gold').trim() || '#c2b594';
    mainSprites=sprites.map(source=>{
      const canvas=document.createElement('canvas');
      canvas.width=source.width;canvas.height=source.height;
      const ctx=canvas.getContext('2d');
      ctx.drawImage(source,0,0);
      ctx.globalCompositeOperation='source-in';ctx.fillStyle=baseColour;
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.globalCompositeOperation='source-over';
      return canvas;
    });
    invalidate();
  }, {once: true});
  image.src = 'eight-and-eight-logo-dark-v18.png';
  window.addEventListener('scroll', schedule, {passive: true});
  const resize = () => {
    if (root.clientWidth !== lastWidth) layoutDirty = true;
    viewportDirty = true;
    schedule();
  };
  addEventListener('resize', resize, {passive: true});
  window.visualViewport?.addEventListener('resize', resize, {passive: true});
  addEventListener('load', invalidate, {once: true});
  addEventListener('pageshow', invalidate, {passive: true});
  document.addEventListener('visibilitychange', () => { lastRainTime=undefined;lastLogoTime=undefined;idleLastTime=undefined;idleSince=undefined;if(idleMode==='running')idleMode='scrolling';schedule(); });
  reduced.addEventListener('change', invalidate);
  document.fonts?.ready.then(invalidate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => {
      if (scrollHeight() !== pageHeight) invalidate();
    });
    observer.observe(document.querySelector('.site-shell'));
  }
  schedule();
})();
