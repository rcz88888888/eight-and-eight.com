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
  const wallpaperImage = new Image();
  const ringImage = new Image();
  const bg = background?.getContext('2d');
  const ink = logos?.getContext('2d');
  const layers = [...document.querySelectorAll('.main-logo-layer')].map(node => ({
    node,
    scale: parseFloat(node.style.getPropertyValue('--layer-scale')) || 1,
    opacity: parseFloat(node.style.opacity) || .08,
    depth: Number(node.dataset.depth),
    idleAngle: 0, idleVisibility: .7, settleAngle: 0, handoffAngle: 0, scrollAngle: 0,
    speed: .92 ** Number(node.dataset.depth)
  }));
  // Adjust only the three innermost ring bands before the logo group scale.
  // SVG radii, including point edges: 563 - 3.35 and 590 + 3.15.
  // Work inward from the unchanged fourth ring; slight overlap prevents seams.
  const ringInnerRadius = 559.65, ringOuterRadius = 593.15;
  const ringEdgeOverlap = .75;
  const innerRingOrder = [...layers].sort((a, b) => a.depth - b.depth);
  for (const layer of layers) layer.ringScale = 1;
  for (let index = Math.min(2, innerRingOrder.length - 2); index >= 0; index--) {
    const layer = innerRingOrder[index], next = innerRingOrder[index + 1];
    const nextScale = next.scale * next.ringScale;
    const ringScale = (nextScale * ringInnerRadius + ringEdgeOverlap) / ringOuterRadius;
    layer.ringScale = Math.max(1, ringScale / layer.scale);
  }
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
  let mainSprites = [], mainBorderSprites = [], mainSolidSprites = [];
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
  // One frame clock for idle rotation, scroll handoff and the return wobble.
  const TAU = Math.PI * 2;
  let idleMode = 'waiting', idleSince, spinSince, idleLastTime;
  let mainIdleAngle = 0, heroIdleAngle = 0, heroSpeed = 0;
  let idlePreviousScroll = 0, settleSince, settleHero = 0, settleMain = 0;
  let handoffSince, handoffMain = 0, handoffActive = false;
  const shortestAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
  const smoothEnd = x => x*x*x*(10+x*(-15+6*x));
  const smoothIntegral = x => x*x*x*x*(2.5+x*(-3+x));
  const spinTransitionDuration = 2.8;
  const spinStageDuration = 8;
  const startRotationStagger = .18;
  let spinCursor = 0, spinTotalTurns = 0;
  const spinSegments=[], spinMotionWindows=[];
  function appendSpin(duration,fromRpm,toRpm=fromRpm,curve='smooth') {
    const from=fromRpm/60, to=toRpm/60;
    const segment={start:spinCursor,end:spinCursor+duration,duration,from,to,
      turns:spinTotalTurns,curve};
    spinCursor=segment.end;spinTotalTurns+=duration*(from+to)/2;
    spinSegments.push(segment);
    return segment;
  }
  // Eight-second tempo stages retain the existing 2.8-second transitions.
  appendSpin(spinTransitionDuration,0,8);
  appendSpin(spinStageDuration-spinTransitionDuration,8);
  appendSpin(spinTransitionDuration,8,33);
  appendSpin(spinStageDuration-spinTransitionDuration,33);
  appendSpin(spinTransitionDuration,33,45);
  appendSpin(spinStageDuration-spinTransitionDuration-1.8,45);
  // The final 1.8 seconds of the 45-rpm stage accelerate linearly.
  appendSpin(1.8,45,888,'linear');
  const stopSegment=appendSpin(spinTransitionDuration,888,0,'stop');
  // Keep the 2.8s stop monotonic, but shape its easing so the logo ends
  // on a whole turn. No angle correction or extra rotation after stopping.
  const stoppedTurns=Math.ceil(spinTotalTurns);
  const stopTurns=stoppedTurns-stopSegment.turns;
  const stopArea=q=>1-10/(3*q+1)+15/(4*q+1)-6/(5*q+1);
  let stopLow=1,stopHigh=16;
  for(let i=0;i<60;i++){
    const q=(stopLow+stopHigh)/2;
    if(stopArea(q)*stopSegment.from*stopSegment.duration<stopTurns)stopLow=q;
    else stopHigh=q;
  }
  const stopPower=(stopLow+stopHigh)/2;
  spinTotalTurns=stoppedTurns;
  spinMotionWindows.push({start:0,end:spinCursor});
  appendSpin(8,0);
  // One revolution at 8 rpm is exactly 7.5 seconds. Each is followed by
  // eight seconds at rest, including the seventh before the sequence repeats.
  for(let round=0;round<7;round++) {
    const turn=appendSpin(60/8,8);
    spinMotionWindows.push({start:turn.start,end:turn.end});
    appendSpin(8,0);
  }
  const spinDuration=spinCursor;
  function spinPhase(seconds) {
    if(seconds<=0 || seconds>=spinDuration)return 0;
    for(const segment of spinSegments){
      if(seconds>=segment.end)continue;
      const x=(seconds-segment.start)/segment.duration;
      if(segment===stopSegment){
        const q=stopPower;
        const integral=x-10*x**(3*q+1)/(3*q+1)+15*x**(4*q+1)/(4*q+1)-6*x**(5*q+1)/(5*q+1);
        return TAU*(segment.turns+segment.duration*segment.from*integral);
      }
      return TAU*(segment.turns+segment.duration*(segment.from*x+
        (segment.to-segment.from)*(segment.curve==='linear'?x*x/2:smoothIntegral(x))));
    }
    return 0;
  }
  function spinSpeed(seconds) {
    if(seconds<=0 || seconds>=spinDuration)return 0;
    for(const segment of spinSegments){
      if(seconds>=segment.end)continue;
      const x=(seconds-segment.start)/segment.duration;
      if(segment===stopSegment)return TAU*segment.from*(1-smoothEnd(x**stopPower));
      return TAU*(segment.from+(segment.to-segment.from)*
        (segment.curve==='linear'?x:smoothEnd(x)));
    }
    return 0;
  }
  // A downward gesture at the rotating start first reassembles all nine
  // logos. Keep document position at zero until that short phase completes.
  const rejoinDuration = 800;
  let rejoinSince, rejoinHero = 0, rejoinMain = 0;
  function needsStartRejoin() {
    return !reduced.matches && (idleMode==='running' || idleMode==='settling') &&
      (Math.abs(shortestAngle(heroIdleAngle))>.000001 || heroSpeed>.000001 ||
        layers.some(layer=>Math.abs(shortestAngle(layer.idleAngle))>.000001));
  }
  function beginStartRejoin(time) {
    if(idleMode==='rejoining' || !needsStartRejoin())return false;
    rejoinSince=time;
    rejoinHero=shortestAngle(heroIdleAngle);rejoinMain=shortestAngle(mainIdleAngle);
    layers.forEach(layer=>layer.rejoinAngle=shortestAngle(layer.idleAngle));
    heroSpeed=0;handoffActive=false;handoffSince=undefined;idleSince=undefined;
    idleMode='rejoining';idlePreviousScroll=0;
    schedule();return true;
  }
  function advanceStartRejoin(time) {
    const t=Math.min(1,Math.max(0,(time-rejoinSince)/rejoinDuration));
    const remaining=1-smoothEnd(t);
    heroIdleAngle=rejoinHero*remaining;mainIdleAngle=rejoinMain*remaining;
    layers.forEach(layer=>layer.idleAngle=layer.rejoinAngle*remaining);
    if(t===1){
      heroIdleAngle=mainIdleAngle=heroSpeed=0;
      layers.forEach(layer=>layer.idleAngle=0);
      idleMode='waiting';idleSince=time;idlePreviousScroll=0;
    }
  }
  const inLocalControl = target => target?.closest?.(
    '.site-nav, input, textarea, select, [contenteditable="true"]');
  function consumeStartScroll(downward,time) {
    if(idleMode==='rejoining')advanceStartRejoin(time);
    if(idleMode==='rejoining')return true;
    return downward && scrollPosition()<=.5 && beginStartRejoin(time);
  }
  window.addEventListener('wheel',event=>{
    if(event.ctrlKey || inLocalControl(event.target) || !event.cancelable)return;
    if(consumeStartScroll(event.deltaY>0,performance.now()))event.preventDefault();
  },{passive:false,capture:true});
  let touchY, touchSuppressed=false, touchLocal=false;
  window.addEventListener('touchstart',event=>{
    touchY=event.touches.length===1?event.touches[0].clientY:undefined;
    touchSuppressed=false;touchLocal=!!inLocalControl(event.target);
  },{passive:true,capture:true});
  window.addEventListener('touchmove',event=>{
    if(event.touches.length!==1){touchY=undefined;touchSuppressed=false;return;}
    const y=event.touches[0].clientY;
    const delta=touchY===undefined?0:touchY-y;touchY=y;
    if(touchLocal || !event.cancelable)return;
    if(consumeStartScroll(delta>0,performance.now())){
      event.preventDefault();touchSuppressed=true;
    } else if(touchSuppressed){
      // Once a touch gesture has been cancelled, iOS will not resume native
      // scrolling mid-gesture. Apply only its subsequent deltas until release.
      event.preventDefault();
      window.scrollBy({top:delta,behavior:'auto'});
    }
  },{passive:false,capture:true});
  for(const type of ['touchend','touchcancel'])window.addEventListener(type,()=>{
    touchY=undefined;touchSuppressed=false;touchLocal=false;
  },{passive:true,capture:true});
  window.addEventListener('keydown',event=>{
    if(inLocalControl(event.target) || event.target?.closest?.('a,button') ||
      event.ctrlKey || event.altKey || event.metaKey)return;
    const down=event.key==='ArrowDown' || event.key==='PageDown' ||
      event.key==='End' || (event.key===' ' && !event.shiftKey);
    const scrollKey=down || ['ArrowUp','PageUp','Home',' '].includes(event.key);
    if(scrollKey && consumeStartScroll(down,performance.now()))event.preventDefault();
  },{capture:true});
  window.addEventListener('scroll',()=>{
    // Covers scrollbar drags and non-cancellable momentum events. Explicit
    // menu navigation retains its existing shared animation driver.
    if(!frameDrivers.size && idlePreviousScroll<=.5 && scrollPosition()>.5)
      beginStartRejoin(performance.now());
    if(idleMode==='rejoining' && !frameDrivers.size && scrollPosition()!==0)
      window.scrollTo({top:0,behavior:'auto'});
    schedule();
  },{passive:true});
  function updateIdleRotation(time, scroll) {
    const dt = idleLastTime === undefined ? 0 : Math.min(.064, Math.max(0, (time-idleLastTime)/1000));
    idleLastTime = time;
    const moved = Math.abs(scroll-idlePreviousScroll) > .25;
    idlePreviousScroll = scroll;
    const atTop = scroll <= .5;
    if (reduced.matches) {
      idleMode='waiting';idleSince=time;
      handoffSince=undefined;handoffActive=false;
      mainIdleAngle=heroIdleAngle=heroSpeed=0;
      layers.forEach(layer=>layer.idleAngle=0);
    } else if(idleMode==='rejoining'){
      advanceStartRejoin(time);
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
        if(time-idleSince>=8000){idleMode='running';spinSince=time;}
      }
      if(idleMode==='running') {
        const elapsed=Math.max(0,(time-spinSince)/1000);
        heroSpeed=spinSpeed(elapsed);
        mainIdleAngle=heroIdleAngle=spinPhase(elapsed);
        // Start-only 0.18s stagger; scroll fanning follows its separate scroll interval.
        layers.forEach(layer=>layer.idleAngle=spinPhase(elapsed-(layer.depth+1)*startRotationStagger));
        const lastFinish=spinDuration+Math.max(0,...layers.map(layer=>layer.depth+1))*startRotationStagger;
        if(elapsed>=lastFinish){
          // Begin the shared pause only once all nine logos have arrived.
          mainIdleAngle=heroIdleAngle=heroSpeed=0;
          layers.forEach(layer=>layer.idleAngle=0);
          idleMode='waiting';idleSince=time-8000;
        }
      }
    }
    for(const layer of layers){
      const elapsed=idleMode==='running'?(time-spinSince)/1000-(layer.depth+1)*startRotationStagger:-1;
      layer.idleVisibility=idleRotationVisibility(elapsed);
    }
    if(openingLogo)openingLogo.style.setProperty('--hero-idle-angle',`${shortestAngle(heroIdleAngle)}rad`);
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
      mainBorderSprites = cacheEdges(outline); mainSolidSprites = cacheEdges(solid);
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
    mainRingWidth = Math.max(originalRingWidth,
      requiredInnerRadius * 1280 / (ringInnerRadius * innermostRingScale));
    for (const [index, layer] of layers.entries()) {
      const pixels=922*scale*layer.scale*inkRatio;
      layer.sprite=mainSprites[index];layer.borderSprite=mainBorderSpriteFor(pixels);layer.solidSprite=mainSolidSpriteFor(pixels);
      layer.ringSprite=ringSpriteFor(mainRingWidth*scale*layer.scale*layer.ringScale*inkRatio);
    }
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
      const delayed=time-layer.depth*fan.delay;
      while(cursor+1<scrollRotationHistory.length &&
        scrollRotationHistory[cursor+1].time<=delayed)cursor++;
      const from=scrollRotationHistory[cursor];
      const to=scrollRotationHistory[Math.min(cursor+1,scrollRotationHistory.length-1)];
      const blend=to.time===from.time?0:Math.max(0,Math.min(1,(delayed-from.time)/(to.time-from.time)));
      const delayedAngle=from.angle+(to.angle-from.angle)*blend;
      const speed=layer.speed+(1-layer.speed)*fan.blend;
      layer.scrollTarget+=(delayedAngle-layer.scrollDelayedAngle)*speed;
      layer.scrollDelayedAngle=delayedAngle;
      layer.scrollTarget+=shortestAngle(delayedAngle-layer.scrollTarget)*catchUp;
      layer.scrollAngle=layer.depth===0?angle:
        layer.scrollAngle+shortestAngle(layer.scrollTarget-layer.scrollAngle)*response;
      if(Math.abs(shortestAngle(angle-layer.scrollAngle))>.00001 ||
        Math.abs(shortestAngle(angle-layer.scrollTarget))>.00001)unsettled=true;
    }
    if(!unsettled)layers.forEach(layer=>layer.scrollAngle=layer.scrollTarget=angle);
    scrollRotationPending=unsettled;
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
  function syncOpeningViewport(width, height) {
    const probe = rainViewport.getBoundingClientRect();
    const viewportWidth = probe.width || width;
    const viewportHeight = probe.height || height;
    if (!(width > 0) || !(viewportHeight > 0)) return false;
    const widthChanged = openingViewport && openingViewport.width !== width;
    // Let an embedded browser finish its initial layout before the first
    // gesture. After that, height-only toolbar/zoom resizes keep logo sizes fixed.
    if (widthChanged) openingViewportLocked = false;
    const canResizeHeight = !touchViewport.matches || !openingViewportLocked;
    if (openingViewport && !widthChanged &&
        (!canResizeHeight || openingViewport.height === viewportHeight)) return false;
    openingViewport = {width, viewportWidth, height: viewportHeight};
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
    // All layout reads happen before the scroll frame's paints.
    pageHeight = Math.max(scrollHeight(), height);
    mainBox = main?.getBoundingClientRect();
    const about=document.querySelector('#about');
    const header=document.querySelector('.topbar');
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
      const box = openingLogo.getBoundingClientRect();
      openingScaleFactor = openingMainScaleFactor();
      openingCenter = {x: box.left + box.width / 2,
        y: box.top + scrollPosition() + box.height / 2};
    }
    bgRatio = Math.min(devicePixelRatio || 1, 1.25);
    inkRatio = Math.min(devicePixelRatio || 1, 1.5);
    syncMainWallpaperGeometry();
    cacheMainWallpaperSprites();
    cacheSpriteChoices();
    if (feed && bannerMask) {
      feedHeight = Math.max(0, Math.min(height, bannerMask.getBoundingClientRect().height));
      resizeSurface(bannerFeed, feed, width, feedHeight, Math.min(devicePixelRatio || 1, 1.5));
    }
    if (!bg || !ink || !mainBox) return;
    resizeSurface(background, bg, width, height, bgRatio);
    resizeSurface(logos, ink, width, height, inkRatio);
    background.style.width = logos.style.width = `${width}px`;
    background.style.height = logos.style.height = `${height}px`;
    // Rain uses the same pinned viewport, with the landscape size reference.
    const rainSizeWidth = rainReferenceWidth(openingViewport.viewportWidth, openingViewport.height);
    const portrait = matchMedia('(orientation: portrait)').matches;
    const key = `${width}:${Math.round(pageHeight)}:${portrait}:${rainSizeWidth.toFixed(1)}`;
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
      const w = rainSizeWidth * (.004 + .436 * fraction);
      return {
        x: rand() * (width + rainSizeWidth) - rainSizeWidth / 2 - w / 2,
        y: rand() * (pageHeight + stableHeight) - stableHeight / 2,
        width: w, height: w * 1368 / 922,
        opacity: (.08 + rand() * .24) * .2206456,
        speed: .16 + rand() * .56
      };
    });
    rainWidth=width;rainHeight=height;rainMaxWidth=rainSizeWidth;
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
    if (!bg || !ink || !mainBox || !sprites.length || !mainSprites.length || !mainBorderSprites.length || !mainSolidSprites.length) return;
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
    const patternVisibility=mainPatternVisibility(state.scroll);
    const fillVisibility=mainFillVisibility(state.scroll);
    const mainPaintKey=`${sceneKey}:${width}:${height}:${openingScaleFactor}:${mainRingWidth}:${easedProgress}:${scrollStackBlend}:${patternVisibility}:${fillVisibility}:${layers.map(layer=>`${layer.scrollAngle}:${layer.idleAngle}:${layer.idleVisibility}`).join(',')}`;
    if(mainPaintKey===lastMainPaint)return;
    lastMainPaint=mainPaintKey;
    // Eight unlit logos share one canvas; native document scrolling is untouched.
    ink.clearRect(0, 0, width, height);
    const scale = Math.min(mainBox.width / 922, mainBox.height / 1368) * openingScaleFactor;
    const w = 922 * scale;
    const h = 1368 * scale;
    const ringDiameter = mainRingWidth * scale;
    const cx = mainBox.left + mainBox.width / 2;
    const cy = mainBox.top + mainBox.height / 2;
    const travel = (.5 - motionProgress) * Math.min(height, mainBox.height);
    // All eight centers coincide with the opening emblem at scroll zero.
    // Fade this correction smoothly during the first quarter of the page,
    // retaining the established depth-dependent movement further down.
    const startPhase = Math.min(1, Math.max(0, motionProgress * 4));
    const openingBlend = 1 - startPhase ** 3 * (startPhase * (startPhase * 6 - 15) + 10);
    const startX = openingCenter?.x ?? cx;
    const startY = openingCenter?.y ?? cy;
    const openingTravel = .5 * Math.min(height, mainBox.height);
    window.EightEightEffects.logoFrame = {
      rotation: (layers[layers.length-1]?.scrollAngle || 0) + (layers[layers.length-1]?.idleAngle || 0),
      x: cx + (startX - cx) * openingBlend,
      y: cy + travel * (layers[layers.length - 1]?.speed ?? 1) +
        (startY - cy - openingTravel * (layers[layers.length - 1]?.speed ?? 1)) * openingBlend
    };
    for (const layer of layers) {
      ink.save();
      const speed=layer.speed+(1-layer.speed)*scrollStackBlend;
      ink.translate(cx + (startX - cx) * openingBlend,
        cy + travel * speed + (startY - cy - openingTravel * speed) * openingBlend);
      ink.rotate(layer.scrollAngle + layer.idleAngle);
      ink.scale(layer.scale, layer.scale);
      const opacity=mainLayerOpacity(layer,patternVisibility,fillVisibility);
      if(patternVisibility>0){
        ink.globalAlpha=opacity*patternVisibility;
        ink.drawImage(layer.sprite,-w/2,-h/2,w,h);
      }
      if(fillVisibility>0){
        ink.globalAlpha=opacity*fillVisibility;
        ink.drawImage(layer.solidSprite,-w/2,-h/2,w,h);
      }
      ink.globalAlpha=opacity;
      ink.drawImage(layer.borderSprite,-w/2,-h/2,w,h);
      if(layer.ringSprite && ringDiameter>0) {
        // Local ring size is independent of the logo silhouette. The enclosing
        // group still supplies their shared centre, rotation, motion and opacity.
        const diameter = ringDiameter * layer.ringScale;
        ink.drawImage(layer.ringSprite,-diameter/2,-diameter/2,diameter,diameter);
      }
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
    if(controlledScroll && idleMode==='rejoining'){
      advanceStartRejoin(rejoinSince+rejoinDuration);idleSince=time;
    }
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
    const easedProgress = easeLogoProgress(state.motionProgress, time, resetMotion || controlledScroll);
    updateScrollRotations(easedProgress,time,resetMotion,state.scroll);
    updateIdleRotation(time,state.scroll);
    advanceRain(time,width,height);
    paintCanvas(state, easedProgress);
    paintBannerFeed(width, height);
    const subscriberState = `${width}:${height}:${state.scroll}:${state.progress}:${state.motionProgress}`;
    if (geometryDirty || subscriberState !== lastSubscriberState) {
      subscribers.forEach(item => item.paint?.(state));
      lastSubscriberState = subscriberState;
    }
    if ((!reduced.matches && (state.scroll <= .5 || heroSpeed > 0)) || handoffActive || frameDrivers.size || logoAnimating || scrollRotationPending || (!reduced.matches && rain.length && sprites.length)) schedule();
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
  const resize = () => {
    if (root.clientWidth !== lastWidth) layoutDirty = true;
    viewportDirty = true;
    schedule();
  };
  addEventListener('resize', resize, {passive: true});
  window.visualViewport?.addEventListener('resize', resize, {passive: true});
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
