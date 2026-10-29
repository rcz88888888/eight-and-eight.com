(() => {
  'use strict';
  const root = document.documentElement;
  const scrollPosition = () => window.scrollY;
  const contentShell = document.querySelector('.site-shell');
  // Measure actual content, never the animation layer which follows the viewport.
  const scrollHeight = () => contentShell
    ? Math.max(root.clientHeight, contentShell.offsetTop + contentShell.offsetHeight)
    : (document.scrollingElement || root).scrollHeight;
  const background = document.querySelector('.background-layers');
  const logos = document.querySelector('.main-logo-canvas');
  const main = document.querySelector('.parallax-logo');
  const openingLogo = document.querySelector('.hero-static-logo');
  const openingStage = openingLogo?.closest('.logo-stage');
  let lastHeroAngle;
  const bannerMask = document.querySelector('.banner-content-mask');
  const bannerFeed = document.querySelector('.banner-logo-feed');
  const feed = bannerFeed?.getContext('2d');
  let feedHeight = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const subscribers = [];
  const frameDrivers = new Set();
  const image = new Image();
  const wallpaperImage = new Image();
  const ringImage = new Image();
  const bg = background?.getContext('2d');
  const ink = logos?.getContext('2d');
  // iOS clips fixed composited layers above its translucent browser controls.
  // Document-positioned canvases can paint in the same region as page rules.
  const documentSurface = CSS.supports('-webkit-touch-callout', 'none');
  let documentSurfaceLayer;
  if (documentSurface) {
    root.classList.add('ios-document-animation');
    documentSurfaceLayer = document.createElement('div');
    documentSurfaceLayer.className = 'ios-animation-document-layer';
    documentSurfaceLayer.setAttribute('aria-hidden', 'true');
    document.body.prepend(documentSurfaceLayer);
    for (const canvas of [background, logos]) if (canvas) documentSurfaceLayer.append(canvas);
  }
  let surfaceScroll = NaN;
  function syncSurfacePosition(scroll) {
    if (!documentSurface || scroll === surfaceScroll) return;
    surfaceScroll = scroll;
    for (const canvas of [background, logos]) {
      if (canvas) canvas.style.transform = `translateY(${scroll}px)`;
    }
  }
  const layers = [...document.querySelectorAll('.main-logo-layer')].map(node => ({
    node,
    scale: parseFloat(node.style.getPropertyValue('--layer-scale')) || 1,
    opacity: parseFloat(node.style.opacity) || .08,
    depth: Number(node.dataset.depth),
    idleAngle: 0, idleVisibility: .7, settleAngle: 0, handoffAngle: 0, scrollAngle: 0,
    speed: .92 ** Number(node.dataset.depth)
  }));
  // Restore the original radial progression and original layer assignment.
  const ringInnerRadius = 559.65, ringOuterRadius = 593.15;
  const ringRows = [
    {count: 171, radius: 563, dot: 3.35, phase: 0},
    {count: 177, radius: 572, dot: 3.35, phase: .5},
    {count: 182, radius: 581, dot: 3.85, phase: 0},
    {count: 188, radius: 590, dot: 3.15, phase: .5}
  ];
  const pointClearance = ringRows.slice(1).reduce((sum, row, index) => {
    const previous = ringRows[index];
    return sum + row.radius - row.dot - previous.radius - previous.dot;
  }, 0) / (ringRows.length - 1);
  const ringEdgeOverlap = .75;
  const innerRingOrder = [...layers].sort((a, b) => a.depth - b.depth);
  for (const layer of layers) layer.ringScale = 1;
  for (let index = Math.min(2, innerRingOrder.length - 2); index >= 0; index--) {
    const layer = innerRingOrder[index], next = innerRingOrder[index + 1];
    const nextScale = next.scale * next.ringScale;
    const ringScale = (nextScale * ringInnerRadius + ringEdgeOverlap) / ringOuterRadius;
    layer.ringScale = Math.max(1, ringScale / layer.scale);
  }
  const frontRingLayer = innerRingOrder[0];
  const inwardStart = frontRingLayer.scale * frontRingLayer.ringScale * ringInnerRadius / 1280;
  let inwardBoundary = inwardStart;
  const innerRings = innerRingOrder.slice(1, 8).map(source => {
    const innerRatio = inwardStart * frontRingLayer.scale / source.scale;
    const outerRatio = inwardBoundary + frontRingLayer.scale * ringEdgeOverlap / 1280;
    inwardBoundary = innerRatio;
    return {source, innerRatio, outerRatio};
  });
  const outerRings = innerRingOrder.map(source => ({source,
    innerRatio: source.scale * source.ringScale * ringInnerRadius / 1280,
    outerRatio: source.scale * source.ringScale * ringOuterRadius / 1280}));
  const ringBands = [...innerRings].reverse().concat(outerRings);
  const ringGap = pointClearance * frontRingLayer.scale / 1280;
  // Keep every ORIGINAL band's centre radius fixed. Solve only the band
  // half-widths, so the requested tiny gaps cannot move or reorder the fan.
  let sign = 1, intercept = 0, lower = 0, upper = Infinity;
  ringBands.forEach((ring, index) => {
    ring.centerRatio = (ring.innerRatio + ring.outerRatio) / 2;
    ring.originalHalfWidth = (ring.outerRatio - ring.innerRatio) / 2;
    if (index) {
      sign = -sign;
      intercept = ring.centerRatio - ringBands[index - 1].centerRatio - ringGap - intercept;
    }
    ring.widthSign = sign; ring.widthIntercept = intercept;
    if (sign > 0) lower = Math.max(lower, -intercept);
    else upper = Math.min(upper, intercept);
  });
  const preferredWidth = ringBands.reduce((sum, ring) => sum +
    ring.widthSign * (ring.originalHalfWidth - ring.widthIntercept), 0) / ringBands.length;
  const firstWidth = Math.max(lower + 1e-9, Math.min(upper - 1e-9, preferredWidth));
  for (const ring of ringBands) {
    const halfWidth = ring.widthSign * firstWidth + ring.widthIntercept;
    ring.innerRatio = ring.centerRatio - halfWidth;
    ring.outerRatio = ring.centerRatio + halfWidth;
    ring.diameterFactor = 2 * ring.outerRatio * 640 / ringOuterRadius;
    ring.sprite = null; ring.size = 0;
  }
  const ringPaintOrder = [...outerRings].reverse().concat(innerRings);
  function cacheInnerRingSprites(diameter, ratio) {
    for (const ring of ringBands) {
      const size = Math.max(32, Math.min(2048, Math.ceil(diameter * ring.diameterFactor * ratio)));
      if (ring.sprite && ring.size === size) continue;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const context = canvas.getContext('2d');
      const unit = size / (ring.diameterFactor);
      context.setTransform(unit, 0, 0, unit, size / 2, size / 2);
      context.fillStyle = '#c2b594';
      const radialScale = (ring.outerRatio - ring.innerRatio) / (ringOuterRadius - ringInnerRadius);
      for (const row of ringRows) {
        const radius = ring.innerRatio + (row.radius - ringInnerRadius) * radialScale;
        const dot = row.dot * radialScale;
        context.beginPath();
        for (let point = 0; point < row.count; point++) {
          const angle = (point + row.phase) * Math.PI * 2 / row.count;
          const x = Math.sin(angle) * radius, y = -Math.cos(angle) * radius;
          context.moveTo(x + dot, y);
          context.arc(x, y, dot, 0, Math.PI * 2);
        }
        context.fill();
      }
      ring.sprite = canvas; ring.size = size;
    }
    if (logos) logos.dataset.innerRingCount = String(innerRings.length);
  }
  let raf = 0;
  let layoutDirty = true;
  let viewportDirty = true;
  let lastWidth = 0;
  let pageHeight = 0;
  let sceneKey = '';
  let sceneViewportHeight = 0;
  let surfaceHeight = 0;
  let rain = [], rainWidth = 0, rainHeight = 0, rainMaxWidth = 0;
  let rainTime = 0, lastRainTime;
  let lastMainPaint = '', lastLogoScene;
  let lastFeedPaint = '';
  let sprites = [];
  let mainSprites = [], mainBorderSprites = [], mainSolidSprites = [];
  let outlinePath, outlineWidth = 1.5, outlineColor = '#c2b594';
  let outlineMatrix = {a:1,b:0,c:0,d:1,e:0,f:0};
  let ringSprites = [], mainRingWidth = 0;
  let mainPatternFadeEnd = 1, mainFillStart = Infinity, mainFillEnd = Infinity;
  let scrollFanReturnStart = Infinity, scrollFanReturnEnd = Infinity;
  let wallpaperData = '', mainWallpaperKey = '', mainWallpaperRequest = 0;
  let mainBox;
  let openingScaleFactor=1;
  const rainViewport = document.createElement('span');
  rainViewport.className = 'rain-size-reference';
  rainViewport.setAttribute('aria-hidden', 'true');
  document.body.append(rainViewport);
  // Safari's visible height excludes toolbar space even while page content is
  // composited beneath it. Measure the large viewport for drawing only.
  const surfaceViewport = document.createElement('span');
  surfaceViewport.className = 'animation-surface-reference';
  surfaceViewport.setAttribute('aria-hidden', 'true');
  document.body.append(surfaceViewport);
  const touchViewport = matchMedia('(hover: none) and (pointer: coarse)');
  let openingViewport, openingViewportLocked = false;
  const lockOpeningViewport = event => {
    if (event.type !== 'scroll' || scrollPosition() > 0) openingViewportLocked = true;
  };
  for (const type of ['touchstart', 'pointerdown', 'wheel', 'keydown', 'scroll'])
    window.addEventListener(type, lockOpeningViewport, {passive: true});
  let openingCenter;
  let bgRatio = 1;
  let inkRatio = 1;
  let logoProgress;
  let logoAnimating = false;
  const scrollRotationOrder = [...layers].sort((a,b)=>b.depth-a.depth);
  const scrollRotationDelay = 80;
  const scrollRotationFinalDelay = .8; // milliseconds: 0.0008 seconds per layer
  const scrollRotationMaxDelay = Math.max(0,...layers.map(layer=>layer.depth))*scrollRotationDelay;
  const scrollRotationHistory = [];
  let scrollRotationStart = 0, scrollRotationFrameTime;
  let scrollInput = NaN, scrollLastInputTime = -Infinity;
  let scrollStackBlend = 1;
  let scrollRotationPending = false;
  let lastLogoTime;
  let lastBackgroundPaint = '';
  let lastSubscriberState = '';
  let mainGeometryKey = '';
  // One frame clock for idle rotation, scroll handoff and the return wobble.
  const TAU = Math.PI * 2;
  let idleMode = 'waiting', idleSince, spinSince, idleLastTime;
  let mainIdleAngle = 0, heroIdleAngle = 0, heroSpeed = 0;
  let idlePreviousScroll = 0, settleSince, settleHero = 0, settleMain = 0;
  let handoffSince, handoffMain = 0, handoffActive = false;
  let startScrollReturn = null, startScrollReleased = false;
  let touchScrollY = null, touchScrollConsumed = false;
  const shortestAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
  const smoothEnd = x => x*x*x*(10+x*(-15+6*x));
  const smoothDerivative = x => 30*x*x*(1-x)*(1-x);
  const smoothIntegral = x => x*x*x*x*(2.5+x*(-3+x));
  const spinTransitionDuration = 2.8;
  const spinStageDuration = 8;
  const startPassStaggers = [.18, 0, .08, .16, .24, .32, .40, .48];
  const lastStartLayer = Math.max(0, ...layers.map(layer => layer.depth + 1));
  let spinCursor = 0, spinTotalTurns = 0;
  const spinSegments=[], spinMotionWindows=[];
  function appendSpin(duration,fromRpm,toRpm=fromRpm,curve='smooth',correction=0) {
    const from=fromRpm/60, to=toRpm/60;
    const segment={start:spinCursor,end:spinCursor+duration,duration,from,to,
      turns:spinTotalTurns,curve,correction};
    spinCursor=segment.end;spinTotalTurns+=duration*(from+to)/2+correction;
    spinSegments.push(segment);
    return segment;
  }
  // Only the first pass uses the revised exact tempo plateaus.
  const firstSlowRpm = 8.8888888, firstMiddleRpm = 33.333333;
  appendSpin(spinTransitionDuration,0,firstSlowRpm);
  appendSpin(spinStageDuration-spinTransitionDuration,firstSlowRpm);
  appendSpin(spinTransitionDuration,firstSlowRpm,firstMiddleRpm);
  appendSpin(spinStageDuration-spinTransitionDuration,firstMiddleRpm);
  appendSpin(spinTransitionDuration,firstMiddleRpm,45);
  appendSpin(spinStageDuration-spinTransitionDuration-1.8,45);
  // Align the final acceleration with a whole revolution before the stop.
  // The small phase correction has zero slope at both ends, retaining the
  // 1.8-second duration and the exact 45/888-rpm endpoint speeds, without a snap.
  const finalTurns = spinTotalTurns + 1.8*(45+888)/120;
  appendSpin(1.8,45,888,'linear',Math.round(finalTurns)-finalTurns);
  // Each of the eight passes has its own stagger. A full eight-second
  // common rest begins only after the last delayed layer has stopped.
  function finishSpinPass(start, pass) {
    const end = spinCursor, stagger = startPassStaggers[pass];
    spinMotionWindows.push({start, end, stagger});
    appendSpin(lastStartLayer * stagger + 8, 0);
  }
  finishSpinPass(0, 0);
  for (let pass = 1; pass < startPassStaggers.length; pass++) {
    const turn = appendSpin(60 / firstSlowRpm, firstSlowRpm);
    finishSpinPass(turn.start, pass);
  }
  const spinDuration = spinCursor;
  function spinTimeForLayer(seconds, depth) {
    for (const pass of spinMotionWindows) {
      if (seconds < pass.start) break;
      if (seconds < pass.end + lastStartLayer * pass.stagger) {
        return Math.max(pass.start, Math.min(pass.end,
          seconds - (depth + 1) * pass.stagger));
      }
    }
    return seconds;
  }
  function spinPhase(seconds) {
    if(seconds<=0)return 0;
    if(seconds>=spinDuration)return TAU*spinTotalTurns;
    for(const segment of spinSegments){
      if(seconds>=segment.end)continue;
      const x=(seconds-segment.start)/segment.duration;
      return TAU*(segment.turns+segment.duration*(segment.from*x+
        (segment.to-segment.from)*(segment.curve==='linear'?x*x/2:smoothIntegral(x)))+
        segment.correction*smoothEnd(x));
    }
    return 0;
  }
  function spinSpeed(seconds) {
    if(seconds<=0 || seconds>=spinDuration)return 0;
    for(const segment of spinSegments){
      if(seconds>=segment.end)continue;
      const x=(seconds-segment.start)/segment.duration;
      return TAU*(segment.from+(segment.to-segment.from)*
        (segment.curve==='linear'?x:smoothEnd(x))+
        segment.correction*smoothDerivative(x)/segment.duration);
    }
    return 0;
  }
  function beginStartScrollReturn(nativeScroll = false) {
    if (startScrollReleased || (!nativeScroll && scrollPosition() > .5) || frameDrivers.size ||
        document.querySelector('.site-nav.open') ||
        (idleMode !== 'running' && idleMode !== 'settling')) return false;
    const hero = shortestAngle(heroIdleAngle);
    const mainAngle = shortestAngle(mainIdleAngle);
    const angles = layers.map(layer => shortestAngle(layer.idleAngle + layer.scrollAngle));
    const maximum = Math.max(Math.abs(hero), Math.abs(mainAngle), ...angles.map(Math.abs));
    if (maximum < .0001) return false;
    startScrollReturn = {hero, mainAngle, progress: 0, distance: 0,
      span: Math.max(48, maximum / Math.PI * 180)};
    layers.forEach((layer, index) => {
      layer.returnAngle = angles[index];
      layer.returnVisibility = layer.idleVisibility;
      layer.idleAngle = angles[index];
      layer.scrollAngle = layer.scrollTarget = layer.scrollDelayedAngle = 0;
    });
    heroIdleAngle = hero; mainIdleAngle = mainAngle; heroSpeed = 0;
    handoffActive = false; handoffSince = undefined;
    scrollRotationHistory.length = 0;
    scrollRotationPending = false;
    logoProgress = 0; logoAnimating = false;
    idleMode = 'scroll-return'; idleSince = undefined;
    return true;
  }
  function consumeStartScroll(delta, event) {
    if (reduced.matches || document.querySelector('.site-nav.open') || !event.cancelable ||
        !Number.isFinite(delta) || Math.abs(delta) < .01)
      return false;
    if (!startScrollReturn && !beginStartScrollReturn()) return false;
    event.preventDefault();
    advanceStartScrollReturn(delta);
    return true;
  }
  function advanceStartScrollReturn(delta) {
    startScrollReturn.distance = Math.min(startScrollReturn.span,
      startScrollReturn.distance + Math.abs(delta));
    startScrollReturn.progress = startScrollReturn.distance / startScrollReturn.span;
    schedule();
  }
  function captureNativeStartScroll() {
    const distance = scrollPosition();
    if (reduced.matches || frameDrivers.size || distance <= .5) return;
    // Scrollbar/accessibility input, or a browser event that was not cancelable,
    // follows the same return phase before the frame can move the page content.
    if (startScrollReturn || (idlePreviousScroll <= .5 && beginStartScrollReturn(true))) {
      advanceStartScrollReturn(distance);
      window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    }
  }
  function finishStartScrollReturn(time) {
    startScrollReturn = null; startScrollReleased = true;
    heroIdleAngle = mainIdleAngle = heroSpeed = 0;
    layers.forEach(layer => {
      layer.idleAngle = layer.scrollAngle = layer.scrollTarget = layer.scrollDelayedAngle = 0;
    });
    scrollRotationHistory.length = 0;
    scrollRotationPending = false; scrollRotationFrameTime = undefined;
    scrollInput = NaN; logoProgress = 0; logoAnimating = false;
    handoffActive = false; handoffSince = undefined;
    idleMode = 'waiting'; idleSince = time;
  }
  // At the start, scroll distance first returns every emblem to its home angle.
  // Page navigation resumes only after a complete home-position frame is drawn.
  function updateIdleRotation(time, scroll) {
    const dt = idleLastTime === undefined ? 0 : Math.min(.064, Math.max(0, (time-idleLastTime)/1000));
    idleLastTime = time;
    const moved = Math.abs(scroll-idlePreviousScroll) > .25;
    idlePreviousScroll = scroll;
    const atTop = scroll <= .5;
    if (reduced.matches) {
      if (startScrollReturn) finishStartScrollReturn(time);
      idleMode='waiting';idleSince=time;
      handoffSince=undefined;handoffActive=false;
      mainIdleAngle=heroIdleAngle=heroSpeed=0;
      layers.forEach(layer=>layer.idleAngle=0);
    } else if (startScrollReturn) {
      const remaining = 1 - smoothEnd(startScrollReturn.progress);
      heroIdleAngle = startScrollReturn.hero * remaining;
      mainIdleAngle = startScrollReturn.mainAngle * remaining;
      layers.forEach(layer => { layer.idleAngle = layer.returnAngle * remaining; });
    } else if (!atTop || moved) {
      // Remove the idle offsets along each logo's shortest path. The
      // original scroll angle keeps updating underneath this 600ms handoff.
      if(idleMode!=='scrolling' || handoffSince===undefined){
        handoffSince=time;handoffMain=shortestAngle(mainIdleAngle);
        layers.forEach(layer=>layer.handoffAngle=shortestAngle(layer.idleAngle));
      }
      idleMode='scrolling';idleSince=undefined;
      const handoffProgress=Math.min(1,Math.max(0,(time-handoffSince)/600));
      const remaining=1-smoothEnd(handoffProgress);
      mainIdleAngle=handoffMain*remaining;
      layers.forEach(layer=>layer.idleAngle=layer.handoffAngle*remaining);
      handoffActive=handoffProgress<1 && layers.some(layer=>Math.abs(layer.idleAngle)>.000001);
      heroIdleAngle += heroSpeed * .22 * (1-Math.exp(-dt/.22));
      heroSpeed *= Math.exp(-dt/.22);
      if (heroSpeed < .001) heroSpeed=0;
    } else {
      handoffActive=false;handoffSince=undefined;
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
        // The shared eight-second pause begins after the delayed scroll
        // rotations have also reached their starting orientations.
        if(scrollRotationPending)idleSince=time;
        if(idleSince===undefined)idleSince=time;
        if(time-idleSince>=8000){idleMode='running';spinSince=time;startScrollReleased=false;}
      }
      if(idleMode==='running') {
        const elapsed=Math.max(0,(time-spinSince)/1000);
        heroSpeed=spinSpeed(elapsed);
        mainIdleAngle=heroIdleAngle=spinPhase(elapsed);
        // The assigned ring bands inherit this exact per-pass layer phase.
        layers.forEach(layer => layer.idleAngle = spinPhase(spinTimeForLayer(elapsed, layer.depth)));
        if(elapsed >= spinDuration){
          // Begin the shared pause only once all nine logos have arrived.
          mainIdleAngle=heroIdleAngle=heroSpeed=0;
          layers.forEach(layer=>layer.idleAngle=0);
          idleMode='waiting';idleSince=time-8000;
        }
      }
    }
    for(const layer of layers){
      const elapsed=idleMode==='running'?spinTimeForLayer((time-spinSince)/1000,layer.depth):-1;
      layer.idleVisibility=startScrollReturn
        ? layer.returnVisibility+(.7-layer.returnVisibility)*smoothEnd(startScrollReturn.progress)
        : idleRotationVisibility(elapsed);
    }
    const wrappedHeroAngle = shortestAngle(heroIdleAngle);
    const heroAngle = Math.abs(wrappedHeroAngle)<1e-10 ? 0 : wrappedHeroAngle;
    if (openingLogo && heroAngle !== lastHeroAngle) {
      openingLogo.style.setProperty('--hero-idle-angle', `${heroAngle}rad`);
      lastHeroAngle = heroAngle;
    }
  }
  const spriteFor = pixels => sprites.find(sprite => sprite.width >= pixels) || sprites[sprites.length - 1];
  const ringSpriteFor = pixels => ringSprites.find(sprite => sprite.width >= pixels) || ringSprites[ringSprites.length - 1];
  const mainBorderSpriteFor = pixels => mainBorderSprites.find(sprite => sprite.width >= pixels) || mainBorderSprites[mainBorderSprites.length - 1];
  const mainPatternVisibility = scroll => 1-smoothEnd(Math.max(0,Math.min(1,scroll/mainPatternFadeEnd)));
  const mainSolidSpriteFor = pixels => mainSolidSprites.find(sprite=>sprite.width>=pixels) || mainSolidSprites[mainSolidSprites.length-1];
  const mainFillVisibility = scroll => Number.isFinite(mainFillEnd) ? smoothEnd(Math.max(0,Math.min(1,(scroll-mainFillStart)/Math.max(1,mainFillEnd-mainFillStart)))) : 0;
  const idleRotationVisibility = elapsed => {
    const motion=spinMotionWindows.find(window=>elapsed>=window.start && elapsed<window.end);
    if(!motion)return .7;
    const fadeIn=smoothEnd(Math.max(0,Math.min(1,(elapsed-motion.start)/1.8)));
    const fadeOut=smoothEnd(Math.max(0,Math.min(1,(motion.end-elapsed)/1.8)));
    return .7+.3*fadeIn*fadeOut;
  };
  const mainLayerOpacity = (layer,patternVisibility,fillVisibility) =>
    layer.opacity*(1-.38*fillVisibility)*(1-(1-layer.idleVisibility)*patternVisibility);
  function openingMainScaleFactor() {
    if (!openingLogo || !mainBox || !matchMedia('(orientation: landscape)').matches) return 1;
    const openingScale = Math.min(openingLogo.clientWidth / 922, openingLogo.clientHeight / 1368);
    const canvasScale = Math.min(mainBox.width / 922, mainBox.height / 1368);
    const frontScale = layers.find(layer => layer.depth === 0)?.scale || 1;
    // Match the nearest background logo to the foreground artwork itself.
    // The other seven retain their existing size progression and rings.
    return openingScale > 0 && canvasScale > 0 ? openingScale / (canvasScale * frontScale) : 1;
  }
  function syncMainWallpaperGeometry() {
    if (!mainBox) return;
    const scale = Math.min(mainBox.width / 922, mainBox.height / 1368) * openingScaleFactor;
    if (!(scale > 0)) return;
    const pixels = parseFloat(getComputedStyle(root).getPropertyValue('--wallpaper-tile-size')) || 220;
    const key = `${scale}:${pixels}`;
    if (key === mainGeometryKey) return;
    mainGeometryKey = key;
    for (const layer of layers) {
      // Also keep the native SVG fallback correct before canvas is ready.
      layer.node.style.setProperty('--layer-scale', layer.scale * openingScaleFactor);
      const pattern = layer.node.querySelector('pattern');
      const image = pattern?.querySelector('image');
      if (!pattern || !image) continue;
      const tile = pixels / (scale * layer.scale);
      for (const node of [pattern, image]) {
        node.setAttribute('width', tile); node.setAttribute('height', tile);
      }
      pattern.setAttribute('x', (922 - tile) / 2);
    }
  }
  function cacheMainWallpaperSprites() {
    if (!sprites.length || !wallpaperData || !openingLogo || !mainBox) return;
    const openingScale = Math.min(openingLogo.clientWidth / 922, openingLogo.clientHeight / 1368);
    const scale = Math.min(mainBox.width / 922, mainBox.height / 1368) * openingScaleFactor;
    if (!(openingScale > 0) || !(scale > 0)) return;
    const pattern = openingLogo.querySelector('#hero-paper-pattern');
    const border = openingLogo.querySelector('.hero-paper-border');
    if (!pattern || !border) return;
    const pixels = parseFloat(getComputedStyle(root).getPropertyValue('--wallpaper-tile-size')) || 220;
    const borderWidth = parseFloat(getComputedStyle(border).strokeWidth) || 1.5;
    const key = [pixels, scale, inkRatio, borderWidth / openingScale, border.getAttribute('stroke'),
      ...layers.map(layer => layer.scale)].join(':');
    if (key === mainWallpaperKey) return;
    mainWallpaperKey = key;
    cacheVectorOutline(border, borderWidth / openingScale);
    const copy = openingLogo.cloneNode(true);
    copy.querySelector('.hero-strobe-ring')?.remove();
    copy.removeAttribute('class'); copy.removeAttribute('style');
    copy.setAttribute('width', '922'); copy.setAttribute('height', '1368');
    copy.querySelector('#hero-paper-pattern image').setAttribute('href', wallpaperData);
    copy.querySelector('.hero-paper-border').setAttribute('stroke-width', borderWidth / openingScale);
    for (const node of copy.querySelectorAll('[vector-effect]')) node.removeAttribute('vector-effect');
    const borderCopy = copy.cloneNode(true);
    borderCopy.querySelector('g[mask="url(#hero-paper-shape)"]').remove();
    borderCopy.querySelector('defs').remove();
    const solidCopy = borderCopy.cloneNode(true);
    const solidShape = solidCopy.querySelector('.hero-paper-border');
    solidShape.setAttribute('fill', border.getAttribute('stroke'));
    solidShape.setAttribute('stroke', 'none');
    copy.querySelector('.hero-paper-border').remove();
    const serialise = svg => 'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(new XMLSerializer().serializeToString(svg));
    const wallpaperSources = layers.map(layer => {
      const svg = copy.cloneNode(true);
      // Counteract this layer's complete draw scale, so every repeat stays
      // 220 CSS pixels even though the eight silhouettes differ in size.
      const tile = pixels / (scale * layer.scale);
      for (const node of [svg.querySelector('#hero-paper-pattern'), svg.querySelector('#hero-paper-pattern image')]) {
        node.setAttribute('width', tile); node.setAttribute('height', tile);
      }
      svg.querySelector('#hero-paper-pattern').setAttribute('x', (922 - tile) / 2);
      return serialise(svg);
    });
    const request = ++mainWallpaperRequest;
    const wallpapers = wallpaperSources.map(() => new Image());
    const outline = new Image(), solid = new Image();
    const images = [...wallpapers, outline, solid];
    let loaded = 0;
    const rasterise = (image, width, height) => {
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'); ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, 0, 0, width, height);
      return canvas;
    };
    const cacheEdges = image => sprites.map(source => rasterise(image, source.width, source.height));
    const ready = () => {
      if (request !== mainWallpaperRequest || ++loaded !== images.length) return;
      // Cache one correctly sized pattern per layer, only on resize/load.
      // Bound raster sizes and reuse them in every scroll/animation frame.
      mainSprites = wallpapers.map((image, index) => {
        const width = Math.max(8, Math.min(1536, Math.ceil(922 * scale * layers[index].scale * inkRatio)));
        return rasterise(image, width, Math.round(width * 1368 / 922));
      });
      mainBorderSprites = outlinePath ? [] : cacheEdges(outline);
      mainSolidSprites = cacheEdges(solid);
      lastMainPaint = lastFeedPaint = ''; cacheSpriteChoices(); schedule();
    };
    for (const image of images) {
      image.addEventListener('load', ready, {once: true});
      image.addEventListener('error', () => {
        if (request === mainWallpaperRequest) mainWallpaperKey = '';
      }, {once: true});
    }
    wallpapers.forEach((image, index) => { image.src = wallpaperSources[index]; });
    outline.src = serialise(borderCopy); solid.src = serialise(solidCopy);
  }
  function cacheVectorOutline(border, width) {
    outlineWidth = width; outlineColor = border.getAttribute('stroke') || '#c2b594';
    if (outlinePath || typeof Path2D !== 'function') return;
    try {
      const combined = new Path2D();
      for (const node of border.children) {
        const path = new Path2D();
        if (node.localName === 'path') path.addPath(new Path2D(node.getAttribute('d')));
        else if (node.localName === 'ellipse') path.ellipse(
          Number(node.getAttribute('cx')),Number(node.getAttribute('cy')),
          Number(node.getAttribute('rx')),Number(node.getAttribute('ry')),0,0,TAU);
        else continue;
        const transforms = node.transform?.baseVal;
        if (transforms?.numberOfItems) combined.addPath(path, transforms.getItem(0).matrix);
        else combined.addPath(path);
      }
      const transforms = openingLogo.querySelector('.logo-centered-artwork')?.transform?.baseVal;
      if (transforms?.numberOfItems) {
        const matrix = transforms.getItem(0).matrix;
        outlineMatrix = {a:matrix.a,b:matrix.b,c:matrix.c,d:matrix.d,e:matrix.e,f:matrix.f};
      }
      outlinePath = combined;
    } catch { outlinePath = null; }
  }

  function cacheSpriteChoices() {
    if (!sprites.length || !mainBox) return;
    const scale = Math.min(mainBox.width / 922, mainBox.height / 1368) * openingScaleFactor;
    const ringGeometry = openingLogo?.querySelector('.hero-strobe-ring');
    const originalRingWidth = Number(ringGeometry?.getAttribute('width')) || 0;
    const logoRadius = Number(ringGeometry?.getAttribute('data-logo-radius')) || 0;
    const logoExtent = Number(ringGeometry?.getAttribute('data-logo-extent')) || 0;
    const largestLogoScale = Math.max(...layers.map(layer => layer.scale));
    const innermostRingScale = Math.min(...layers.map(layer => layer.scale * layer.ringScale));
    // Enlarge the complete ring stack uniformly. Its innermost point edge sits
    // outside the largest logo's rotation envelope, with 1/64 logo-size clearance.
    // Keep the existing local ring fits, shared motion and logo sizes intact.
    const requiredInnerRadius = (logoRadius + logoExtent / 64) * largestLogoScale;
    const ringEnlargement = matchMedia('(orientation: landscape)').matches ? 2 : 1;
    mainRingWidth = Math.max(originalRingWidth,
      requiredInnerRadius * 1280 / (ringInnerRadius * innermostRingScale)) * ringEnlargement;
    for (const [index, layer] of layers.entries()) {
      const pixels=922*scale*layer.scale*inkRatio;
      layer.sprite=mainSprites[index];layer.borderSprite=mainBorderSpriteFor(pixels);layer.solidSprite=mainSolidSpriteFor(pixels);
      layer.ringSprite=ringSpriteFor(mainRingWidth*scale*layer.scale*layer.ringScale*inkRatio);
    }
    cacheInnerRingSprites(mainRingWidth * scale, inkRatio);
    for (const mark of rain) mark.sprite = spriteFor(mark.width * bgRatio);
  }
  function easeLogoProgress(target, time, reset) {
    if (reset || logoProgress === undefined || reduced.matches) {
      logoProgress = target;
    } else {
      // Time-based damping fills the gaps between touch-scroll events. Only
      // the eight-logo drawing is eased; document scrolling and masks stay native.
      const dt = lastLogoTime !== undefined ? Math.max(0, Math.min(64, time - lastLogoTime)) : 1000 / 60;
      logoProgress += (target - logoProgress) * (1 - Math.exp(-dt / 42));
    }
    lastLogoTime = time;
    logoAnimating = Math.abs(target - logoProgress) > .00001;
    if (!logoAnimating) logoProgress = target;
    return logoProgress;
  }
  function scrollFanTiming(scroll) {
    // First screenshot: About's top edge just below the banner.
    // Second screenshot: Concept Architecture reaches its measured endpoint.
    const span = mainFillEnd - mainPatternFadeEnd;
    const closing = Number.isFinite(span) && span > 0
      ? Math.max(0, Math.min(1, (scroll - mainPatternFadeEnd) / span)) : 0;
    // From Contact's photographed position, restore the original fan timing
    // linearly with scroll distance; reach it exactly at the bottom of the page.
    const returnSpan = scrollFanReturnEnd - scrollFanReturnStart;
    const returning = Number.isFinite(returnSpan) && returnSpan > 0
      ? Math.max(0, Math.min(1, (scroll - scrollFanReturnStart) / returnSpan)) : 0;
    const blend = closing * (1 - returning);
    return {
      blend,
      delay: scrollRotationDelay + (scrollRotationFinalDelay - scrollRotationDelay) * blend,
      response: 42 + (scrollRotationFinalDelay - 42) * blend,
      catchUp: 900 + (scrollRotationFinalDelay - 900) * blend
    };
  }
  function updateScrollRotations(progress,time,reset,inputScroll) {
    const angle=(.5-.5*Math.cos(Math.PI*progress))*Math.PI*16;
    const dt=scrollRotationFrameTime===undefined?0:Math.max(0,Math.min(64,time-scrollRotationFrameTime));
    scrollRotationFrameTime=time;
    if(reset || reduced.matches || !scrollRotationHistory.length){
      scrollRotationHistory.length=0;
      scrollRotationHistory.push({time:time-scrollRotationMaxDelay-64,angle},{time,angle});
      scrollRotationStart=0;scrollLastInputTime=time;scrollInput=inputScroll;
      scrollStackBlend=1;scrollRotationPending=false;
      layers.forEach(layer=>{
        layer.scrollAngle=layer.scrollTarget=layer.scrollDelayedAngle=angle;
        layer.scrollSampleTime=time-layer.depth*scrollRotationDelay;
      });
      return;
    }
    if(Math.abs(inputScroll-scrollInput)>.01){
      scrollInput=inputScroll;scrollLastInputTime=time;
    }
    const last=scrollRotationHistory[scrollRotationHistory.length-1];
    if(time>last.time)scrollRotationHistory.push({time,angle});
    else last.angle=angle;
    const cutoff=time-scrollRotationMaxDelay-64;
    while(scrollRotationStart+1<scrollRotationHistory.length &&
      scrollRotationHistory[scrollRotationStart+1].time<cutoff)scrollRotationStart++;
    if(scrollRotationStart>512){
      scrollRotationHistory.splice(0,scrollRotationStart);scrollRotationStart=0;
    }
    // Use one continuous delayed follower during movement AND after release.
    // There is no stop detector, new easing phase or extra wait on release.
    let cursor=scrollRotationStart;
    const fan = scrollFanTiming(inputScroll);
    // Contract both the delay and the older follower lag, so the visible fan
    // actually closes as the per-layer interval reaches 0.8 milliseconds.
    const response=1-Math.exp(-dt/fan.response);
    const catchUp=1-Math.exp(-dt/fan.catchUp);
    const activeMaxDelay=Math.max(0,...layers.map(layer=>layer.depth))*fan.delay;
    let unsettled=time-scrollLastInputTime<activeMaxDelay || logoAnimating;
    for(const layer of scrollRotationOrder){
      // Expanding the fan may increase its delay. Freeze a sample briefly
      // rather than moving backwards through the history of a forward scroll.
      const delayed=Math.max(layer.scrollSampleTime ?? -Infinity,time-layer.depth*fan.delay);
      layer.scrollSampleTime=delayed;
      while(cursor+1<scrollRotationHistory.length &&
        scrollRotationHistory[cursor+1].time<=delayed)cursor++;
      const from=scrollRotationHistory[cursor];
      const to=scrollRotationHistory[Math.min(cursor+1,scrollRotationHistory.length-1)];
      const blend=to.time===from.time?0:Math.max(0,Math.min(1,(delayed-from.time)/(to.time-from.time)));
      const delayedAngle=from.angle+(to.angle-from.angle)*blend;
      const speed=layer.speed+(1-layer.speed)*fan.blend;
      layer.scrollTarget+=(delayedAngle-layer.scrollDelayedAngle)*speed;
      layer.scrollDelayedAngle=delayedAngle;
      // Keep scroll phases unwrapped. Choosing a shortest-angle branch here
      // reverses a follower abruptly whenever its lag crosses half a turn.
      layer.scrollTarget+=(delayedAngle-layer.scrollTarget)*catchUp;
      layer.scrollAngle=layer.depth===0?angle:
        layer.scrollAngle+(layer.scrollTarget-layer.scrollAngle)*response;
      if(Math.abs(angle-layer.scrollAngle)>.00001 ||
        Math.abs(angle-layer.scrollTarget)>.00001)unsettled=true;
    }
    if(!unsettled)layers.forEach(layer=>layer.scrollAngle=layer.scrollTarget=angle);
    scrollRotationPending=unsettled;
  }
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
  function syncOpeningViewport(width, height) {
    const probe = rainViewport.getBoundingClientRect();
    const viewportWidth = probe.width || width;
    const viewportHeight = probe.height || height;
    if (!(width > 0) || !(viewportHeight > 0)) return false;
    const widthChanged = openingViewport && openingViewport.width !== width;
    const landscape = matchMedia('(orientation: landscape)').matches;
    const orientationChanged = openingViewport && openingViewport.landscape !== landscape;
    // Let an embedded browser finish its initial layout before the first
    // gesture. After that, height-only toolbar/zoom resizes keep logo sizes fixed.
    if (widthChanged || orientationChanged) openingViewportLocked = false;
    const canResizeHeight = !touchViewport.matches || !openingViewportLocked;
    if (openingViewport && !widthChanged && !orientationChanged &&
        (!canResizeHeight || openingViewport.height === viewportHeight)) return false;
    openingViewport = {width, viewportWidth, height: viewportHeight, landscape};
    root.style.setProperty('--opening-viewport-height', `${viewportHeight}px`);
    return true;
  }
  function rainReferenceWidth(width, height) {
    // Always use the existing landscape sizing, even on a portrait viewport.
    // This reference is independent of the foreground/main-logo enlargement.
    const longSide = Math.max(width, height);
    const shortSide = Math.min(width, height);
    const header = longSide <= 560 ? 90.44 : longSide <= 900 ? 104 : 120;
    const boxWidth = longSide <= 560 ? Math.min(.72 * longSide, 460) : Math.min(.52 * longSide, 560);
    const inset = Math.max(56, Math.min(96, .08 * shortSide));
    const boxHeight = Math.max(0, Math.min(820, shortSide - header - inset));
    return Math.min(boxWidth, boxHeight * 922 / 1368) * 1.15;
  }
  function measure(width, height) {
    // Pin the CSS and canvas geometry to the same viewport before measuring.
    if (syncOpeningViewport(width, height)) layoutDirty = true;
    const nextBgRatio = Math.min(devicePixelRatio || 1, 1.25);
    const nextInkRatio = Math.min(devicePixelRatio || 1, 1.5);
    if (bgRatio !== nextBgRatio || inkRatio !== nextInkRatio) layoutDirty = true;
    // All layout reads happen before the scroll frame's paints.
    pageHeight = Math.max(scrollHeight(), height);
    if (documentSurfaceLayer) documentSurfaceLayer.style.height = `${pageHeight}px`;
    surfaceHeight = Math.ceil(Math.max(height, root.clientHeight,
      surfaceViewport.getBoundingClientRect().height,
      (window.visualViewport?.height || 0) + (window.visualViewport?.offsetTop || 0)));
    const header = document.querySelector('.topbar');
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    // Keep logo sizes pinned, but centre their shared axis in the actual
    // visible area below the banner as mobile browser controls expand/retract.
    // Pinch zoom retains the layout centre rather than following zoom panning.
    const visual = window.visualViewport;
    const useVisual = visual && Math.abs((visual.scale || 1)-1)<.01 && visual.height>0;
    const visibleTop = useVisual ? visual.offsetTop : 0;
    const visibleBottom = useVisual ? visibleTop+visual.height : height;
    const contentTop = Math.min(visibleBottom,Math.max(visibleTop,headerBottom));
    if (main) {
      const box = main.getBoundingClientRect();
      mainBox = {width: box.width, height: box.height,
        left: (width - box.width) / 2,
        top: (contentTop + visibleBottom - box.height) / 2};
    }
    const about=document.querySelector('#about');
    if(about && header){
      // Screenshot endpoint: About's top edge just beneath the banner.
      const gap=Math.max(16,Math.min(24,width*40/706));
      mainPatternFadeEnd=Math.max(1,about.getBoundingClientRect().top+
        scrollPosition()-header.getBoundingClientRect().bottom-gap);
    }
    const services=document.querySelector('#services');
    const concept=services?.querySelector('h2.subheading');
    if(services && concept && header){
      const gap=Math.max(16,Math.min(24,width*40/706));
      const offset=scrollPosition()-header.getBoundingClientRect().bottom-gap;
      mainFillStart=Math.max(mainPatternFadeEnd,services.getBoundingClientRect().top+offset);
      // Second screenshot: Concept Architecture begins 70 image pixels
      // beneath the banner, scaled to the current CSS viewport width.
      const conceptGap=Math.max(28,Math.min(48,width*70/706));
      mainFillEnd=Math.max(mainFillStart+1,concept.getBoundingClientRect().top+
        scrollPosition()-header.getBoundingClientRect().bottom-conceptGap);
    }
    const contact = document.querySelector('#contact');
    if (contact && header) {
      // Screenshot: Contact's upper border is 56px below the banner at 706px width.
      const contactGap = Math.max(16, Math.min(48, width * 56 / 706));
      scrollFanReturnStart = Math.max(mainFillEnd, contact.getBoundingClientRect().top +
        scrollPosition() - header.getBoundingClientRect().bottom - contactGap);
      scrollFanReturnEnd = Math.max(scrollFanReturnStart + 1, pageHeight - height);
    }
    if (layoutDirty) subscribers.forEach(item => item.measure?.());
    if (openingLogo) {
      // Measure the unrotated layout container, never a rotating SVG's bounds.
      const box = openingStage.getBoundingClientRect();
      openingScaleFactor = openingMainScaleFactor();
      openingCenter = {x: box.left + box.width / 2,
        y: box.top + scrollPosition() + box.height / 2};
    }
    bgRatio = nextBgRatio;
    inkRatio = nextInkRatio;
    // Toolbar/visual-viewport motion only changes the canvas centre and crop.
    // Reuse logo/ring textures and leave hidden SVG geometry untouched.
    if (layoutDirty) {
      syncMainWallpaperGeometry();
      cacheMainWallpaperSprites();
      cacheSpriteChoices();
    }
    if (feed && bannerMask) {
      feedHeight = Math.max(0, Math.min(height, bannerMask.getBoundingClientRect().height));
      resizeSurface(bannerFeed, feed, width, feedHeight, Math.min(devicePixelRatio || 1, 1.5));
    }
    if (!bg || !ink || !mainBox) return;
    resizeSurface(background, bg, width, surfaceHeight, bgRatio);
    resizeSurface(logos, ink, width, surfaceHeight, inkRatio);
    background.style.width = logos.style.width = `${width}px`;
    background.style.height = logos.style.height = `${surfaceHeight}px`;
    // Rain uses the same pinned viewport, with the landscape size reference.
    const rainSizeWidth = rainReferenceWidth(openingViewport.viewportWidth, openingViewport.height);
    const portrait = matchMedia('(orientation: portrait)').matches;
    const key = `${width}:${Math.round(pageHeight)}:${portrait}:${rainSizeWidth.toFixed(1)}`;
    if (key === sceneKey) { rainWidth=width;rainHeight=height; return; }
    sceneKey = key;
    const count = portrait ? 2222 : 8888;
    // Keep tiny marks and opacity; halve the maximum rain-logo dimensions.
    // Browser toolbar height changes do not rebuild this scene.
    if (!sceneViewportHeight || width !== lastWidth) sceneViewportHeight = height;
    const stableHeight = sceneViewportHeight;
    // The active rain pool below is the only rain geometry needed. The old
    // 2,222/8,888-object preparation array was never drawn on either canvas.
    rainWidth=width;rainHeight=height;rainMaxWidth=rainSizeWidth;
    const previousPoolSize=Math.max(24,Math.min(portrait?160:256,Math.round(count*stableHeight/pageHeight)));
    const baselinePoolSize=portrait?Math.round(previousPoolSize/3):previousPoolSize;
    const poolSize=Math.ceil(baselinePoolSize*1.1);
    rain=Array.from({length:poolSize},()=>spawnRain(true));
    lastRainTime=undefined;
    background.dataset.logoCount = String(poolSize);
    cacheSpriteChoices();
  }
  function spawnRain(initial=false) {
    const width=rainMaxWidth*(.004+.216*Math.random()**2.6);
    // Two seconds is the fastest traversal (previously one). Retain the
    // existing slowest traversal of eight seconds and randomise in between.
    const duration=2+6*Math.random();
    return {x:Math.random()*rainWidth-width/2,width,height:width*1368/922,
      opacity:(.08+Math.random()*.24)*.2206456,duration,
      progress:initial?Math.random():0,sprite:spriteFor(width*bgRatio)};
  }
  function advanceRain(time,width,height) {
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
    // Browser-toolbar height changes must not rotate otherwise stationary logos.
    const referenceHeight = openingViewport?.height || height;
    const progress = scroll >= pageHeight-height-1 ? 1 :
      Math.min(1, scroll / Math.max(1, pageHeight-referenceHeight));
    const motion = reduced.matches ? 0 : progress;
    const travel = reduced.matches ? 0 : scroll / Math.max(1, height);
    return {width, height, scroll, progress, travel,
      motionScroll: reduced.matches ? 0 : scroll, motionProgress: motion};
  }
  function paintCanvas(state, easedProgress, time, resetMotion) {
    if (!bg || !ink || !mainBox || !sprites.length || !mainSprites.length ||
        (!outlinePath && !mainBorderSprites.length) || !mainSolidSprites.length) return;
    const {width, height} = state;
    const backgroundKey = `${sceneKey}:${width}:${height}:${surfaceHeight}:${rainTime}`;
    if (backgroundKey !== lastBackgroundPaint) {
      bg.clearRect(0, 0, width, surfaceHeight);
      const count=String(drawRain(bg,width,surfaceHeight));
      if (background.dataset.visibleLogos !== count) background.dataset.visibleLogos = count;
      lastBackgroundPaint = backgroundKey;
    }
    const patternVisibility=mainPatternVisibility(state.scroll);
    const fillVisibility=mainFillVisibility(state.scroll);
    const center = commonLogoCenter(patternVisibility);
    const {x:centerX, y:centerY} = center;
    const mainPaintKey=`${sceneKey}:${width}:${height}:${surfaceHeight}:${openingScaleFactor}:${mainRingWidth}:${centerX}:${centerY}:${easedProgress}:${scrollStackBlend}:${patternVisibility}:${fillVisibility}:${layers.map(layer=>`${layer.scrollAngle}:${layer.idleAngle}:${layer.idleVisibility}`).join(',')}`;
    if(mainPaintKey===lastMainPaint)return;
    lastMainPaint=mainPaintKey;
    // Eight unlit logos share one canvas; native document scrolling is untouched.
    ink.clearRect(0, 0, width, surfaceHeight);
    const scale = Math.min(mainBox.width / 922, mainBox.height / 1368) * openingScaleFactor;
    const w = 922 * scale;
    const h = 1368 * scale;
    const ringDiameter = mainRingWidth * scale;
    window.EightEightEffects.logoFrame = {
      rotation: (layers[layers.length-1]?.scrollAngle || 0) + (layers[layers.length-1]?.idleAngle || 0),
      x: centerX, y: centerY,
      ringRotations: layers.map(layer => layer.scrollAngle + layer.idleAngle)
    };
    lastLogoScene={centerX,centerY,w,h,scale,ringDiameter,patternVisibility,fillVisibility};
    drawLogoLayers(ink,lastLogoScene,width,surfaceHeight);
    if (!root.classList.contains('canvas-logos-ready')) {
      root.classList.add('logo-rain-ready', 'canvas-logos-ready');
    }
  }
  function drawLogoLayers(context,scene,width,surfaceHeight) {
    const {centerX,centerY,w,h,scale,ringDiameter,patternVisibility,fillVisibility}=scene;
    for (const layer of layers) {
      context.save();
      context.translate(centerX, centerY);
      context.rotate(layer.scrollAngle + layer.idleAngle);
      context.scale(layer.scale, layer.scale);
      const opacity=mainLayerOpacity(layer,patternVisibility,fillVisibility);
      if(patternVisibility>0){
        context.globalAlpha=opacity*patternVisibility;
        context.drawImage(layer.sprite,-w/2,-h/2,w,h);
      }
      if(fillVisibility>0){
        context.globalAlpha=opacity*fillVisibility;
        context.drawImage(layer.solidSprite,-w/2,-h/2,w,h);
      }
      context.globalAlpha=opacity;
      if (outlinePath) {
        // Stroke the cached vector directly instead of compositing a huge,
        // mostly transparent outline bitmap at eight rotations every frame.
        context.save();
        context.scale(scale,scale);
        context.translate(-461,-684);
        const matrix=outlineMatrix;
        context.transform(matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f);
        context.lineWidth=outlineWidth;context.strokeStyle=outlineColor;
        context.lineCap=context.lineJoin='round';
        context.stroke(outlinePath);
        context.restore();
      } else context.drawImage(layer.borderSprite,-w/2,-h/2,w,h);
      context.restore();
    }
    for (const ring of ringPaintOrder) {
      if (!ring.sprite || !(ringDiameter > 0) || !ringIntersectsViewport(centerX,centerY,
        ring.innerRatio*ringDiameter,ring.outerRatio*ringDiameter,width,surfaceHeight)) continue;
      const diameter = ringDiameter * ring.diameterFactor;
      context.save();
      context.translate(centerX, centerY);
      context.rotate(ring.source.scrollAngle + ring.source.idleAngle);
      context.globalAlpha = mainLayerOpacity(ring.source, patternVisibility, fillVisibility);
      context.drawImage(ring.sprite, -diameter / 2, -diameter / 2, diameter, diameter);
      context.restore();
    }
  }
  function drawRain(context,width,clipHeight) {
    let visible=0;
    for (const mark of rain) {
      const top=-mark.height+mark.progress*(surfaceHeight+mark.height);
      if(top+mark.height<0 || top>clipHeight || mark.x+mark.width<0 || mark.x>width || !mark.sprite)continue;
      context.globalAlpha=mark.opacity;
      context.drawImage(mark.sprite,mark.x,top,mark.width,mark.height);
      visible++;
    }
    context.globalAlpha=1;
    return visible;
  }
  function commonLogoCenter(patternVisibility) {
    const x = mainBox.left + mainBox.width / 2;
    const y = mainBox.top + mainBox.height / 2;
    // Only the opening wallpaper fade moves the common pivot from the start
    // emblem to the visible content centre. There is no later page-long drift.
    return {x: x+((openingCenter?.x ?? x)-x)*patternVisibility,
      y: y+((openingCenter?.y ?? y)-y)*patternVisibility};
  }
  function ringIntersectsViewport(x,y,innerRadius,outerRadius,width,height) {
    // A large ring may surround the entire viewport without a single visible
    // dot. Avoid compositing its transparent square, while keeping edge AA.
    const nearX=Math.max(0,-x,x-width),nearY=Math.max(0,-y,y-height);
    const farX=Math.max(Math.abs(x),Math.abs(width-x));
    const farY=Math.max(Math.abs(y),Math.abs(height-y));
    return nearX*nearX+nearY*nearY<=(outerRadius+1)**2 &&
      farX*farX+farY*farY>=Math.max(0,innerRadius-1)**2;
  }
  // Render the same scene into the shallow banner crop. Copying a changing
  // full-size canvas into a second canvas forces expensive rendering flushes.
  // Both crops share every position, angle, texture and the same frame clock.
  function paintBannerFeed(width,height) {
    if(!feed || !lastLogoScene || !feedHeight || !width || !height)return;
    const feedKey=`${lastBackgroundPaint}:${lastMainPaint}:${width}:${height}:${feedHeight}`;
    if(feedKey===lastFeedPaint)return;
    lastFeedPaint=feedKey;
    feed.clearRect(0,0,width,feedHeight);
    drawRain(feed,width,feedHeight);
    drawLogoLayers(feed,lastLogoScene,width,feedHeight);
  }
  function render(time = performance.now()) {
    raf = 0;
    if (document.hidden) return;
    const controlledScroll=frameDrivers.size>0;
    // Explicit menu navigation remains available during a partial return.
    if (controlledScroll && startScrollReturn) finishStartScrollReturn(time);
    for(const driver of [...frameDrivers])driver(time);
    captureNativeStartScroll();
    syncSurfacePosition(scrollPosition());
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
    const easedProgress = easeLogoProgress(state.motionProgress, time, resetMotion || controlledScroll);
    updateScrollRotations(easedProgress,time,resetMotion,state.scroll);
    updateIdleRotation(time,state.scroll);
    advanceRain(time,width,height);
    paintCanvas(state, easedProgress, time, resetMotion);
    paintBannerFeed(width, height);
    if (startScrollReturn?.progress === 1) finishStartScrollReturn(time);
    const subscriberState = `${width}:${height}:${state.scroll}:${state.progress}:${state.motionProgress}`;
    if (geometryDirty || subscriberState !== lastSubscriberState) {
      subscribers.forEach(item => item.paint?.(state));
      lastSubscriberState = subscriberState;
    }
    if (startScrollReturn || (!reduced.matches && (state.scroll <= .5 || heroSpeed > 0)) || handoffActive || frameDrivers.size || logoAnimating || scrollRotationPending || (!reduced.matches && rain.length && sprites.length)) schedule();
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
    invalidate();
  }, {once: true});
  ringImage.addEventListener('load',()=>{
    // Rasterise the vector only once at a few resolutions. Scroll frames
    // reuse these transparent textures for all eight logo layers.
    ringSprites=[256,512,1024,2048].map(size=>{
      const canvas=document.createElement('canvas');
      canvas.width=canvas.height=size;
      const context=canvas.getContext('2d');
      context.imageSmoothingQuality='high';
      context.drawImage(ringImage,0,0,size,size);
      return canvas;
    });
    lastMainPaint=lastFeedPaint='';cacheSpriteChoices();schedule();
  },{once:true});
  ringImage.src=openingLogo?.querySelector('.hero-strobe-ring')?.getAttribute('href') ||
    'stroboskopring-sandgold.svg?v=20261017-points-gap16';
  wallpaperImage.addEventListener('load',()=>{
    const canvas=document.createElement('canvas');
    canvas.width=wallpaperImage.naturalWidth;canvas.height=wallpaperImage.naturalHeight;
    canvas.getContext('2d').drawImage(wallpaperImage,0,0);
    wallpaperData=canvas.toDataURL('image/png');
    invalidate();
  },{once:true});
  wallpaperImage.src='wallpaper-ornament-mask-v45.png';
  image.src = 'eight-and-eight-logo-dark-v18.png';
  window.addEventListener('scroll', schedule, {passive: true});
  const editingScrollTarget = target => target?.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || '');
  window.addEventListener('wheel', event => {
    if (event.ctrlKey || editingScrollTarget(event.target)) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    consumeStartScroll(event.deltaY * unit, event);
  }, {passive: false, capture: true});
  window.addEventListener('touchstart', event => {
    touchScrollY = event.touches.length === 1 ? event.touches[0].clientY : null;
    touchScrollConsumed = false;
  }, {passive: true, capture: true});
  window.addEventListener('touchmove', event => {
    if (event.touches.length !== 1 || editingScrollTarget(event.target)) {
      touchScrollY = null; return;
    }
    const y = event.touches[0].clientY;
    const delta = touchScrollY === null ? 0 : touchScrollY - y;
    touchScrollY = y;
    if (consumeStartScroll(delta, event)) touchScrollConsumed = true;
    else if (touchScrollConsumed && event.cancelable) {
      // Safari does not restart native scrolling halfway through a prevented
      // touch gesture. Continue that same swipe after all home angles are drawn.
      event.preventDefault();
      window.scrollBy({top: delta, left: 0, behavior: 'instant'});
    }
  }, {passive: false, capture: true});
  for (const type of ['touchend', 'touchcancel']) window.addEventListener(type, () => {
    touchScrollY = null; touchScrollConsumed = false;
  }, {passive: true, capture: true});
  window.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || editingScrollTarget(event.target)) return;
    if (event.key === ' ' && event.target?.closest?.('a,button,[role="button"]')) return;
    const distances = {ArrowDown: 40, ArrowUp: -40, PageDown: innerHeight*.85,
      PageUp: -innerHeight*.85, End: innerHeight, Home: -innerHeight,
      ' ': innerHeight*.85*(event.shiftKey ? -1 : 1)};
    if (consumeStartScroll(distances[event.key], event)) event.stopImmediatePropagation();
  }, {capture: true});
  const resize = () => {
    if (root.clientWidth !== lastWidth) layoutDirty = true;
    viewportDirty = true;
    schedule();
  };
  addEventListener('resize', resize, {passive: true});
  window.visualViewport?.addEventListener('resize', resize, {passive: true});
  window.visualViewport?.addEventListener('scroll', resize, {passive: true});
  addEventListener('orientationchange', () => {
    openingViewportLocked=false;invalidate();
  }, {passive: true});
  addEventListener('load', invalidate, {once: true});
  addEventListener('pageshow', invalidate, {passive: true});
  document.addEventListener('visibilitychange', () => { lastRainTime=undefined;lastLogoTime=undefined;idleLastTime=undefined;idleSince=undefined;handoffSince=undefined;if(idleMode==='running')idleMode='scrolling';schedule(); });
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
