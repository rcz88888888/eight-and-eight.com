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
  const bg = background?.getContext('2d');
  const ink = logos?.getContext('2d');
  const layers = [...document.querySelectorAll('.main-logo-layer')].map(node => ({
    scale: parseFloat(node.style.getPropertyValue('--layer-scale')) || 1,
    opacity: parseFloat(node.style.opacity) || .08,
    depth: Number(node.dataset.depth),
    idleAngle: 0, settleAngle: 0, handoffAngle: 0, scrollAngle: 0,
    speed: .92 ** Number(node.dataset.depth)
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
  let mainSprites = [], mainBorderSprites = [], mainSolidSprites = [];
  let mainPatternFadeEnd = 1, mainFillStart = Infinity, mainFillEnd = Infinity;
  let wallpaperData = '', mainWallpaperKey = '', mainWallpaperRequest = 0;
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
  const scrollRotationOrder = [...layers].sort((a,b)=>b.depth-a.depth);
  const scrollRotationDelay = 80;
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
  const spinDuration = 58;
  const spinCruiseSpeed = 45/60;
  const spinPeakSpeed = 8;
  const spinCruiseDuration = spinDuration*.88;
  const spinStartupDuration = .8;
  const spinPeakRampDuration = 2.08;
  let spinCursor = 0, spinTotalTurns = 0;
  // 51.04s at exactly 45rpm, after a gentle startup. The peak has no hold:
  // it immediately runs down to rest. These durations total 64 whole turns,
  // so every delayed logo ends upright without an angle correction or jump.
  const spinSegments = [
    [spinStartupDuration,0,spinCruiseSpeed],
    [spinCruiseDuration,spinCruiseSpeed,spinCruiseSpeed],
    [spinPeakRampDuration,spinCruiseSpeed,spinPeakSpeed],
    [spinDuration-spinStartupDuration-spinCruiseDuration-spinPeakRampDuration,spinPeakSpeed,0]
  ].map(([duration,from,to])=>{
    const segment={start:spinCursor,end:spinCursor+duration,duration,from,to,turns:spinTotalTurns};
    spinCursor=segment.end;spinTotalTurns+=duration*(from+to)/2;
    return segment;
  });
  function spinPhase(seconds) {
    if(seconds<=0 || seconds>=spinDuration)return 0;
    for(const segment of spinSegments){
      if(seconds>=segment.end)continue;
      const x=(seconds-segment.start)/segment.duration;
      return TAU*(segment.turns+segment.duration*(segment.from*x+
        (segment.to-segment.from)*smoothIntegral(x)));
    }
    return 0;
  }
  function spinSpeed(seconds) {
    if(seconds<=0 || seconds>=spinDuration)return 0;
    for(const segment of spinSegments){
      if(seconds>=segment.end)continue;
      const x=(seconds-segment.start)/segment.duration;
      return TAU*(segment.from+(segment.to-segment.from)*smoothEnd(x));
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
        // The front main logo follows the wallpaper logo by 0.08s;
        // each deeper main logo waits another 0.08s.
        layers.forEach(layer=>layer.idleAngle=spinPhase(elapsed-(layer.depth+1)*.08));
        const lastFinish=spinDuration+Math.max(0,...layers.map(layer=>layer.depth+1))*.08;
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
  const mainBorderSpriteFor = pixels => mainBorderSprites.find(sprite => sprite.width >= pixels) || mainBorderSprites[mainBorderSprites.length - 1];
  const mainPatternVisibility = scroll => 1-smoothEnd(Math.max(0,Math.min(1,scroll/mainPatternFadeEnd)));
  const mainSolidSpriteFor = pixels => mainSolidSprites.find(sprite=>sprite.width>=pixels) || mainSolidSprites[mainSolidSprites.length-1];
  const mainFillVisibility = scroll => Number.isFinite(mainFillEnd) ? smoothEnd(Math.max(0,Math.min(1,(scroll-mainFillStart)/Math.max(1,mainFillEnd-mainFillStart)))) : 0;
  const mainLayerOpacity = layer => layer.opacity;
  function cacheMainWallpaperSprites() {
    if(!sprites.length || !wallpaperData || !openingLogo)return;
    const scale=Math.min(openingLogo.clientWidth/922,openingLogo.clientHeight/1368);
    if(!(scale>0))return;
    const pattern=openingLogo.querySelector('#hero-paper-pattern');
    const border=openingLogo.querySelector('.hero-paper-border');
    if(!pattern || !border)return;
    const borderWidth=parseFloat(getComputedStyle(border).strokeWidth) || 1.5;
    const key=[pattern.getAttribute('width'),pattern.getAttribute('height'),
      pattern.getAttribute('x'),borderWidth/scale,border.getAttribute('stroke')].join(':');
    if(key===mainWallpaperKey)return;
    mainWallpaperKey=key;
    // Use the opening SVG itself: the same shape, ornament alpha, placement
    // and colour. Only rebuild after geometry changes, never during scrolling.
    const copy=openingLogo.cloneNode(true);
    copy.removeAttribute('class');copy.removeAttribute('style');
    copy.setAttribute('width','922');copy.setAttribute('height','1368');
    copy.querySelector('#hero-paper-pattern image').setAttribute('href',wallpaperData);
    copy.querySelector('.hero-paper-border').setAttribute('stroke-width',borderWidth/scale);
    for(const node of copy.querySelectorAll('[vector-effect]'))node.removeAttribute('vector-effect');
    const borderCopy=copy.cloneNode(true);
    borderCopy.querySelector('g[mask="url(#hero-paper-shape)"]').remove();
    borderCopy.querySelector('defs').remove();
    const solidCopy=borderCopy.cloneNode(true);
    const solidShape=solidCopy.querySelector('.hero-paper-border');
    solidShape.setAttribute('fill',border.getAttribute('stroke'));
    solidShape.setAttribute('stroke','none');
    copy.querySelector('.hero-paper-border').remove();
    const request=++mainWallpaperRequest;
    const wallpaper=new Image(), outline=new Image(), solid=new Image();
    let loaded=0;
    const cacheImage=image=>sprites.map(source=>{
      const canvas=document.createElement('canvas');
      canvas.width=source.width;canvas.height=source.height;
      const ctx=canvas.getContext('2d');ctx.imageSmoothingQuality='high';
      ctx.drawImage(image,0,0,canvas.width,canvas.height);
      return canvas;
    });
    const ready=()=>{
      if(request!==mainWallpaperRequest || ++loaded!==3)return;
      // Swap both caches together. The outline is always painted at the
      // layer's original opacity; only the separate interior pattern fades.
      mainSprites=cacheImage(wallpaper);mainBorderSprites=cacheImage(outline);mainSolidSprites=cacheImage(solid);
      lastMainPaint=lastFeedPaint='';cacheSpriteChoices();schedule();
    };
    for(const image of [wallpaper,outline,solid]){
      image.addEventListener('load',ready,{once:true});
      image.addEventListener('error',()=>{
        if(request===mainWallpaperRequest)mainWallpaperKey='';
      },{once:true});
    }
    const serialise=svg=>'data:image/svg+xml;charset=utf-8,'+
      encodeURIComponent(new XMLSerializer().serializeToString(svg));
    wallpaper.src=serialise(copy);outline.src=serialise(borderCopy);solid.src=serialise(solidCopy);
  }

  function cacheSpriteChoices() {
    if (!sprites.length || !mainBox) return;
    const scale = Math.min(mainBox.width / 922, mainBox.height / 1368) * openingScaleFactor;
    for (const layer of layers) {
      const pixels=922*scale*layer.scale*inkRatio;
      layer.sprite=mainSpriteFor(pixels);layer.borderSprite=mainBorderSpriteFor(pixels);layer.solidSprite=mainSolidSpriteFor(pixels);
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
    const response=1-Math.exp(-dt/42);
    const catchUp=1-Math.exp(-dt/900);
    let unsettled=time-scrollLastInputTime<scrollRotationMaxDelay || logoAnimating;
    for(const layer of scrollRotationOrder){
      const delayed=time-layer.depth*scrollRotationDelay;
      while(cursor+1<scrollRotationHistory.length &&
        scrollRotationHistory[cursor+1].time<=delayed)cursor++;
      const from=scrollRotationHistory[cursor];
      const to=scrollRotationHistory[Math.min(cursor+1,scrollRotationHistory.length-1)];
      const blend=to.time===from.time?0:Math.max(0,Math.min(1,(delayed-from.time)/(to.time-from.time)));
      const delayedAngle=from.angle+(to.angle-from.angle)*blend;
      layer.scrollTarget+=(delayedAngle-layer.scrollDelayedAngle)*layer.speed;
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
  function measure(width, height) {
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
    const positioning=services?.querySelector('.service-grid article');
    if(services && positioning && header){
      const gap=Math.max(16,Math.min(24,width*40/706));
      const offset=scrollPosition()-header.getBoundingClientRect().bottom-gap;
      mainFillStart=Math.max(mainPatternFadeEnd,services.getBoundingClientRect().top+offset);
      mainFillEnd=Math.max(mainFillStart+1,positioning.getBoundingClientRect().top+offset);
    }
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
    cacheMainWallpaperSprites();
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
    const mainPaintKey=`${sceneKey}:${width}:${height}:${openingScaleFactor}:${easedProgress}:${scrollStackBlend}:${patternVisibility}:${fillVisibility}:${layers.map(layer=>`${layer.scrollAngle}:${layer.idleAngle}`).join(',')}`;
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
      const opacity=mainLayerOpacity(layer);
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
