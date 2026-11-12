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
  let logos = document.querySelector('.main-logo-canvas');
  const main = document.querySelector('.parallax-logo');
  const openingLogo = document.querySelector('.hero-static-logo');
  const openingStage = openingLogo?.closest('.logo-stage');
  const navigation = document.querySelector('.site-nav');
  let lastHeroAngle;
  const bannerMask = document.querySelector('.banner-content-mask');
  let bannerFeed = document.querySelector('.banner-logo-feed');
  let feedHeight = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const subscribers = [];
  const frameDrivers = new Set();
  const image = new Image();
  const wallpaperImage = new Image();
  const bg = background?.getContext('2d');
  let gpu = window.EightEightGpu?.create(logos, () => { if (gpu) fallbackToCanvas(); });
  if (gpu) logos = gpu.canvas;
  let ink = gpu ? null : logos?.getContext('2d');
  let bannerGpu = gpu && bannerFeed ? window.EightEightGpu.create(bannerFeed,
    () => { if (bannerGpu) fallbackBannerToCanvas(); }) : null;
  if (bannerGpu) bannerFeed = bannerGpu.canvas;
  let feed = bannerGpu ? null : bannerFeed?.getContext('2d');
  if (!gpu && logos) logos.dataset.renderer = 'canvas2d';
  function fallbackToCanvas() {
    const previous = gpu;
    gpu = null;
    const canvas = logos.cloneNode(false);
    logos.replaceWith(canvas); logos = canvas;
    ink = logos.getContext('2d');
    ink.setTransform(inkRatio,0,0,inkRatio,0,0);
    logos.dataset.renderer = 'canvas2d';
    cacheInnerRingPaths();
    previous?.dispose();
    lastMainPaint = lastFeedPaint = ''; invalidate();
  }
  function fallbackBannerToCanvas() {
    const previous = bannerGpu;
    bannerGpu = null;
    const canvas = bannerFeed.cloneNode(false);
    bannerFeed.replaceWith(canvas); bannerFeed = canvas;
    feed = canvas.getContext('2d');
    feed.setTransform(inkRatio,0,0,inkRatio,0,0);
    cacheInnerRingPaths();
    previous?.dispose();
    lastFeedPaint = ''; invalidate();
  }
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
  // One canonical eight-layer stack. Its metadata has no painted SVG copies;
  // both renderers and the clipped banner feed use these same ordered layers.
  const layers = JSON.parse(main.dataset.mainLogoLayers).map(({scale, opacity, depth}) => ({
    scale, opacity, depth,
    idleAngle: 0, idleVisibility: .7,
    settleAngle: 0, handoffAngle: 0, scrollAngle: 0,
    speed: .92 ** depth
  }));
  const frontRingLayer = layers.find(layer => layer.depth === 0);
  let ringRows = [];
  let ringLayout;
  let ringAssetPending = true;
  let ringPaintOrder = [];
  for (const layer of layers) {
    layer.ringStrobeSteps = new Float64Array(0);
    layer.ringRowAngles = new Float64Array(0);
  }
  function readRingSource(svgText) {
    const svg = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement;
    const [left, top, width, height] = (svg.getAttribute('viewBox') ?? '').trim().split(/\s+/).map(Number);
    const paths = [...svg.querySelectorAll('path')];
    if (!(width > 0) || !(height > 0) || !paths.length) throw new Error('Invalid Technics SVG');
    const centerX = left + width / 2, centerY = top + height / 2;
    let minRadius = Infinity, maxRadius = 0;
    // Each archived silhouette is a union of horizontal strips sampled from the photo.
    const marks = paths.map(path => {
      const data = path.getAttribute('d');
      const strips = [];
      for (const [, x, y, w, h] of data.matchAll(/M([\d.]+) ([\d.]+)h([\d.]+)v([\d.]+)h-[\d.]+z/g)) {
        const halfWidth = Number(w) / 2, halfHeight = Number(h) / 2;
        strips.push([Number(x) + halfWidth - centerX, Number(y) + halfHeight - centerY, halfWidth, halfHeight]);
      }
      if (!strips.length || strips.length !== data.split('M').length - 1) throw new Error('Invalid Technics silhouette');
      const area = strips.reduce((sum, [, , w, h]) => sum + w * h, 0);
      const x = strips.reduce((sum, [x, , w, h]) => sum + x * w * h, 0) / area;
      const y = strips.reduce((sum, [, y, w, h]) => sum + y * w * h, 0) / area;
      const radius = Math.hypot(x, y);
      const extent = Math.max(...strips.map(([sx, sy, w, h]) => Math.hypot(Math.abs(sx - x) + w, Math.abs(sy - y) + h)));
      minRadius = Math.min(minRadius, radius - extent);
      maxRadius = Math.max(maxRadius, radius + extent);
      return {x, y, radius, strips};
    });
    return {marks, minRadius, maxRadius};
  }
  function createRingLayout({marks, minRadius, maxRadius}) {
    // Keep the uploaded website's placement measurements, independently of the artwork.
    const diameter = 1280, ringInnerRadius = 559.65, ringOuterRadius = 593.15;
    const pointClearance = (2.3 + 1.8 + 2) / 3;
    const innerRingOrder = [...layers].sort((a, b) => a.depth - b.depth);
    for (const layer of layers) layer.ringScale = 1;
    for (let index = Math.min(2, innerRingOrder.length - 2); index >= 0; index--) {
      const layer = innerRingOrder[index], next = innerRingOrder[index + 1];
      const ringScale = (next.scale * next.ringScale * ringInnerRadius + .75) / ringOuterRadius;
      layer.ringScale = Math.max(1, ringScale / layer.scale);
    }
    const originalExtensions = 4, landscapeExtensions = 4, outwardExtensions = 7;
    const innerSources = innerRingOrder.slice(1);
    const lastSource = innerRingOrder.at(-1);
    innerSources.push(...Array(originalExtensions).fill(lastSource));
    const outerSources = innerRingOrder.concat(Array(outwardExtensions).fill(lastSource));
    const bandSources = [...innerSources].reverse().concat(outerSources);
    const gap = pointClearance * frontRingLayer.scale / diameter;
    const scaleStep = innerRingOrder[1].scale - frontRingLayer.scale;
    const widthUnit = frontRingLayer.ringScale * (ringOuterRadius - ringInnerRadius) / diameter;
    const anchor = frontRingLayer.scale * frontRingLayer.ringScale * ringInnerRadius / diameter;
    const smallestScale = frontRingLayer.scale - innerSources.length * scaleStep;
    const widths = bandSources.map((_, index) => widthUnit * (smallestScale + index * scaleStep));
    const portraitStart = anchor - widths.slice(0, innerSources.length)
      .reduce((sum, width) => sum + width + gap, 0);
    const visibilityGain = 1.10 ** 3;
    const peakOpacity = frontRingLayer.opacity * visibilityGain;
    const minOpacity = lastSource.opacity * .82 ** outwardExtensions * visibilityGain;
    const landscapeOpacity = (peakOpacity + landscapeExtensions * 4 *
      (peakOpacity - minOpacity) / (bandSources.length * 4 - 1)) * 1.15;
    function positionBands(sources, innerEdge, opacity) {
      return sources.map((source, index) => {
        const width = widthUnit * (smallestScale + index * scaleStep);
        const scale = width / (maxRadius - minRadius);
        const bandsFromOutside = sources.length - 1 - index;
        const strips = new Float32Array(stripCount * 5);
        let offset = 0;
        for (const mark of marks) {
          const depth = (maxRadius - mark.radius) / (maxRadius - minRadius);
          const radius = innerEdge + (mark.radius - minRadius) * scale;
          const x = mark.x * radius / mark.radius, y = mark.y * radius / mark.radius;
          const shade = Math.min(3, Math.floor(depth * 4));
          const alpha = opacity * .92 ** (bandsFromOutside + shade / 4);
          for (const [sx, sy, w, h] of mark.strips) {
            strips[offset++] = x + (sx - mark.x) * scale;
            strips[offset++] = y + (sy - mark.y) * scale;
            strips[offset++] = w * scale;
            strips[offset++] = h * scale;
            strips[offset++] = alpha;
          }
        }
        const band = {source, innerRadius: innerEdge, outerRadius: innerEdge + width, strips};
        innerEdge += width + gap;
        return band;
      });
    }
    const stripCount = marks.reduce((total, mark) => total + mark.strips.length, 0);
    return {
      diameter, ringInnerRadius, outerCount: outerSources.length,
      portrait: {innerCount: innerSources.length, extensionCount: originalExtensions,
        groups: groupRingBands(positionBands(bandSources, portraitStart, peakOpacity))},
      landscape: {innerCount: innerSources.length + landscapeExtensions,
        extensionCount: originalExtensions + landscapeExtensions,
        groups: groupRingBands(positionBands(Array(landscapeExtensions).fill(lastSource).concat(bandSources),
          portraitStart * .28, landscapeOpacity))}
    };
  }
  // Group rows by phase so each depth still uses one draw call.
  function groupRingBands(bands) {
    const groups = new Map();
    for (const band of bands) {
      const {source, innerRadius, outerRadius} = band;
      if (!groups.has(source)) groups.set(source, {source, bands: [], innerRadius: Infinity, outerRadius: 0});
      const group = groups.get(source);
      group.bands.push(band);
      group.innerRadius = Math.min(group.innerRadius, innerRadius);
      group.outerRadius = Math.max(group.outerRadius, outerRadius);
    }
    return [...groups.values()];
  }
  const immutableSprite = canvas => typeof createImageBitmap === 'function'
    ? createImageBitmap(canvas, {premultiplyAlpha: 'premultiply'}).catch(() => canvas) : Promise.resolve(canvas);
  function releaseSprites(items) { for (const sprite of items) sprite?.close?.(); }
  function cacheInnerRingPaths() {
    for (const group of ringPaintOrder) {
      for (const band of group.bands) {
        if (band.paths || typeof Path2D !== 'function') continue;
        const paths = new Map();
        const strips = band.strips;
        for (let index = 0; index < strips.length; index += 5) {
          const [x, y, w, h, alpha] = strips.subarray(index, index + 5);
          if (!paths.has(alpha)) paths.set(alpha, new Path2D());
          paths.get(alpha).rect(x - w, y - h, 2 * w, 2 * h);
        }
        band.paths = paths;
      }
    }
  }

  let raf = 0;
  let layoutDirty = true;
  let viewportDirty = true;
  let lastWidth = 0;
  let lastHeight = 0;
  let pageHeight = 0;
  let sceneKey = '';
  let sceneViewportHeight = 0;
  let surfaceHeight = 0;
  let rain = [], rainWidth = 0, rainHeight = 0, rainMaxWidth = 0;
  let rainTime = 0, lastRainTime;
  let rainScrollOrigin = null, rainScrollUnit = 1;
  function anchorRainToScroll(scroll) {
    if (rainScrollOrigin !== null) return;
    rainScrollOrigin = scroll;
    rainScrollUnit = Math.max(1, openingViewport?.height || innerHeight);
    rain.forEach(mark => { mark.scrollPhase = mark.progress; });
    lastRainTime = undefined;
    background.dataset.motion = 'scroll';
  }
  function resumeTimedRain() {
    // A new start-animation cycle must release the previous scroll anchor.
    // Keep current positions so resuming never snaps the rain to a new scene.
    rainScrollOrigin = null;
    lastRainTime = undefined;
    background.dataset.motion = 'time';
  }
  let lastMainPaint = '', lastLogoScene;
  let lastFeedPaint = '';
  let sprites = [];
  let mainSprites = [], mainBorderSprites = [], mainSolidSprites = [];
  let mainRingWidth = 0;
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
  // One frame clock for idle rotation, scroll handoff and the return wobble.
  const TAU = Math.PI * 2;
  let idleMode = 'waiting', idleSince, spinSince, idleLastTime;
  let previousRingElapsed;
  let startAssetsReady = false;
  let mainIdleAngle = 0, heroIdleAngle = 0, heroSpeed = 0;
  let idlePreviousScroll = 0, settleSince, settleHero = 0, settleMain = 0;
  let handoffSince, handoffMain = 0, handoffActive = false;
  let startScrollReturn = null, startScrollReleased = false;
  let touchScrollY = null, touchScrollConsumed = false;
  const shortestAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
  const wrapRingStep = steps => steps-Math.round(steps);
  const smoothEnd = x => x*x*x*(10+x*(-15+6*x));
  const smoothDerivative = x => 30*x*x*(1-x)*(1-x);
  const smoothIntegral = x => x*x*x*x*(2.5+x*(-3+x));
  const spinTransitionDuration = .8;
  const spinStageDuration = 8;
  const spinFinishDuration = 1.8;
  const startPassStaggers = [0, 0, .08, .16, .24, .32, .40, .48];
  const lastStartLayer = Math.max(0, ...layers.map(layer => layer.depth + 1));
  const finalPassStagger = startPassStaggers[startPassStaggers.length - 1];
  const passStarts = startPassStaggers.map((_, index) => index * spinStageDuration);
  const spinMotionEnd = passStarts.length * spinStageDuration;
  const spinDuration = spinMotionEnd + lastStartLayer * finalPassStagger + 8;
  const slowRpm = 8, fastRpm = 33.333333;
  const maxRingStepPerFrame = .4;
  function buildSpinTrack(starts, finalStart) {
    const segments = [];
    let cursor = 0, turns = 0, previousRpm = 0;
    function append(duration, fromRpm, toRpm = fromRpm, curve = 'smooth', correction = 0) {
      if (!(duration > 0)) return;
      const from = fromRpm / 60, to = toRpm / 60;
      segments.push({start: cursor, end: cursor + duration, duration, from, to, turns, curve, correction});
      cursor += duration;
      turns += duration * (from + to) / 2 + correction;
    }
    for (const [index, start] of starts.entries()) {
      const rpm = index % 2 === 0 ? slowRpm : fastRpm;
      append(start - cursor, previousRpm);
      append(spinTransitionDuration, previousRpm, rpm);
      previousRpm = rpm;
    }
    append(finalStart - cursor, previousRpm);
    // The closing acceleration ends on a whole turn for each logo and its rings.
    const finalTurns = turns + spinFinishDuration * (previousRpm + 888) / 120;
    append(spinFinishDuration, previousRpm, 888, 'linear', Math.round(finalTurns) - finalTurns);
    return {segments, start: starts[0], end: cursor, turns};
  }
  const heroMotion = buildSpinTrack(passStarts, spinMotionEnd - spinFinishDuration);
  for (const layer of layers) {
    const depth = layer.depth + 1;
    const starts = passStarts.map((start, index) => start + depth * startPassStaggers[index]);
    const finalStart = spinMotionEnd - spinFinishDuration + depth * finalPassStagger;
    const track = buildSpinTrack(starts, finalStart);
    layer.startMotion = {track, finalStart, starts, strobeWindows: []};
  }
  function attachStrobeWindows(layer, slowRingStrobeRates, fastRingStrobeRates) {
    const {starts, finalStart} = layer.startMotion;
    const accumulatedSteps = new Float64Array(ringRows.length);
    const strobeWindows = starts.map((start, index) => {
      const release = starts[index + 1] ?? finalStart;
      const rates = index % 2 === 0 ? slowRingStrobeRates : fastRingStrobeRates;
      const endSteps = rates.map((rate, row) => {
        const steps = rate * (release - start);
        // The photographic pattern repeats only after one complete turn.
        // Each tempo change retains the exact integrated phase.
        if (index === starts.length - 1) {
          const {count} = ringRows[row];
          return Math.round((accumulatedSteps[row] + steps) / count) * count - accumulatedSteps[row];
        }
        accumulatedSteps[row] += steps;
        return steps;
      });
      const corrections = endSteps.map((end, row) => end - rates[row] * (release - start));
      return {start, release, rates, corrections, endSteps};
    });
    layer.startMotion.strobeWindows = strobeWindows;
  }
  async function loadRingSource() {
    try {
      const href = openingLogo?.querySelector('.hero-strobe-ring')?.getAttribute('href');
      if (!href) throw new Error('Missing strobe SVG reference');
      const response = await fetch(href);
      if (!response.ok) throw new Error('Strobe SVG request failed: ' + response.status);
      const pattern = readRingSource(await response.text());
      ringLayout = createRingLayout(pattern);
      // The photographic rows are irregular. Apply one continuous virtual phase
      // to the complete motif, using mean density only to calibrate drift.
      const count = Math.round(pattern.marks.length / 4);
      const rows = [{index: 0, count, pitch: TAU / count}];
      const beatRate = Math.floor(slowRpm * count / 60) + 1;
      ringRows = rows;
      for (const layer of layers) {
        layer.ringStrobeSteps = new Float64Array(rows.length);
        layer.ringRowAngles = new Float64Array(rows.length);
        layer.ringOpticalSteps = new Float64Array(rows.length);
        layer.ringPhaseCarry = new Float64Array(rows.length);
        attachStrobeWindows(layer, [beatRate], [beatRate + 2 + (fastRpm - slowRpm) * count / 60]);
      }
    } catch (error) {
      console.warn('Could not load the strobe artwork.', error);
    } finally {
      ringAssetPending = false;
      lastMainPaint = lastFeedPaint = '';
      invalidate();
    }
  }
  function strobeAlignment(progress) {
    // Integrate a broad speed profile with zero slope at both ends.
    // Its peak derivative of 45/32 keeps the alignment from reversing the drift.
    const centered=2*progress-1;
    const fourth=centered**4;
    return .5+centered*(45-fourth*(18-5*fourth))/64;
  }
  // Keep an unwrapped optical phase until after calculating the frame delta.
  // Wrapping earlier makes a long frame look like a step in the other direction.
  function updateRingStrobeSteps(seconds,layer,previousSeconds) {
    const duration = spinTransitionDuration;
    const {ringStrobeSteps: steps, ringOpticalSteps: opticalSteps, ringPhaseCarry: carry} = layer;
    const {finalStart, strobeWindows} = layer.startMotion;
    if (!strobeWindows.length) return;
    if (previousSeconds === undefined || previousSeconds > seconds) carry.fill(0);
    steps.fill(0);
    for (const {start, release, rates, corrections, endSteps} of strobeWindows) {
      const elapsed = seconds - start, outgoing = seconds - release;
      if (elapsed <= 0) break;
      if (outgoing >= duration) {
        for (const {index} of ringRows) steps[index] += endSteps[index];
        continue;
      }
      const entry = elapsed < duration ? duration * smoothIntegral(elapsed / duration) : elapsed - duration / 2;
      const progress = Math.max(0, outgoing / duration);
      const activeTime = entry - duration * smoothIntegral(progress);
      const alignment = strobeAlignment(progress);
      for (const {index} of ringRows) steps[index] += rates[index] * activeTime + corrections[index] * alignment;
    }
    const hovering = previousSeconds !== undefined && previousSeconds <= seconds && seconds <= finalStart;
    const remaining = 1 - smoothEnd(Math.min(1, Math.max(0, (seconds - finalStart) / duration)));
    for (const {index, pitch, count} of ringRows) {
      const optical = layer.idleAngle / pitch - steps[index];
      if (hovering) {
        const advance = optical - opticalSteps[index];
        const bounded = Math.max(-maxRingStepPerFrame, Math.min(0, advance));
        carry[index] = wrapRingStep((carry[index] + advance - bounded) / count) * count;
      }
      opticalSteps[index] = optical;
      steps[index] = wrapRingStep((steps[index] + carry[index] * remaining) / count) * count;
    }
  }
  function scaleRingStrobeSteps(steps,initial,scale) {
    for (let index=0; index<steps.length; index++) {
      steps[index]=initial[index]*scale;
    }
  }
  function spinPhase(seconds, track) {
    if(seconds<=0)return 0;
    for(const segment of track.segments){
      if(seconds>=segment.end)continue;
      const x=(seconds-segment.start)/segment.duration;
      return TAU*(segment.turns+segment.duration*(segment.from*x+
        (segment.to-segment.from)*(segment.curve==='linear'?x*x/2:smoothIntegral(x)))+
        segment.correction*smoothEnd(x));
    }
    return TAU*track.turns;
  }
  function spinSpeed(seconds, track) {
    if(seconds<=0 || seconds>=track.end)return 0;
    for(const segment of track.segments){
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
        navigation?.classList.contains('open') ||
        (idleMode !== 'running' && idleMode !== 'settling')) return false;
    const hero = shortestAngle(heroIdleAngle);
    const mainAngle = shortestAngle(mainIdleAngle);
    const angles = layers.map(layer => shortestAngle(layer.idleAngle + layer.scrollAngle));
    const maximum = Math.max(Math.abs(hero), Math.abs(mainAngle), ...angles.map(Math.abs));
    if (maximum < .0001 && !layers.some(layer=>layer.ringStrobeSteps.some(step=>Math.abs(step)>.0001))) return false;
    startScrollReturn = {hero, mainAngle, progress: 0, target: 0, distance: 0,
      span: Math.max(48, maximum / Math.PI * 180)};
    layers.forEach((layer, index) => {
      layer.returnAngle = angles[index];
      layer.returnVisibility = layer.idleVisibility;
      layer.ringReturnStrobeSteps = layer.ringStrobeSteps.slice();
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
    if (reduced.matches || navigation?.classList.contains('open') || !event.cancelable ||
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
    startScrollReturn.target = startScrollReturn.distance / startScrollReturn.span;
    schedule();
  }
  function stepStartScrollReturn(dt) {
    const state = startScrollReturn;
    if (!state) return;
    const step=(state.target-state.progress)*(1-Math.exp(-dt/.07));
    state.progress += Math.min(step,dt/.45);
    if (state.target === 1 && 1 - state.progress < .0001) state.progress = 1;
  }
  function releaseStartScrollToNavigation() {
    // Keep the currently displayed angles. The ordinary scroll handoff fades
    // these offsets instead of forcing every layer straight to zero.
    startScrollReturn = null; startScrollReleased = true;
    anchorRainToScroll(scrollPosition());
    idleMode = 'scroll-return'; handoffSince = undefined;
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
    anchorRainToScroll(scrollPosition());
    heroIdleAngle = mainIdleAngle = heroSpeed = 0;
    layers.forEach(layer => {
      layer.idleAngle = layer.scrollAngle = layer.scrollTarget = layer.scrollDelayedAngle = 0;
      layer.ringStrobeSteps.fill(0);
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
      layers.forEach(layer=>{
        layer.idleAngle=0;
        layer.ringStrobeSteps.fill(0);
      });
    } else if (startScrollReturn) {
      stepStartScrollReturn(dt);
      const remaining = 1 - smoothEnd(startScrollReturn.progress);
      heroIdleAngle = startScrollReturn.hero * remaining;
      mainIdleAngle = startScrollReturn.mainAngle * remaining;
      layers.forEach(layer => {
        layer.idleAngle = layer.returnAngle * remaining;
        scaleRingStrobeSteps(layer.ringStrobeSteps,layer.ringReturnStrobeSteps,remaining);
      });
    } else if (!atTop || moved) {
      // Remove the idle offsets along each logo's shortest path. The
      // original scroll angle keeps updating underneath this 600ms handoff.
      if(idleMode!=='scrolling' || handoffSince===undefined){
        handoffSince=time;handoffMain=shortestAngle(mainIdleAngle);
        layers.forEach(layer=>{
          layer.handoffAngle=shortestAngle(layer.idleAngle);
          layer.ringHandoffStrobeSteps=layer.ringStrobeSteps.slice();
          layer.handoffVisibility=layer.idleVisibility;
        });
      }
      idleMode='scrolling';idleSince=undefined;
      const handoffProgress=Math.min(1,Math.max(0,(time-handoffSince)/600));
      const remaining=1-smoothEnd(handoffProgress);
      mainIdleAngle=handoffMain*remaining;
      layers.forEach(layer=>{
        layer.idleAngle=layer.handoffAngle*remaining;
        scaleRingStrobeSteps(layer.ringStrobeSteps,layer.ringHandoffStrobeSteps,remaining);
      });
      handoffActive=handoffProgress<1 && layers.some(layer=>Math.abs(layer.idleAngle)>.000001 ||
        layer.ringStrobeSteps.some(step=>Math.abs(step)>.000001) ||
        Math.abs(layer.handoffVisibility-.7)>.000001);
      heroIdleAngle += heroSpeed * .22 * (1-Math.exp(-dt/.22));
      heroSpeed *= Math.exp(-dt/.22);
      if (heroSpeed < .001) heroSpeed=0;
    } else {
      handoffActive=false;handoffSince=undefined;
      if (idleMode==='scrolling') {
        idleMode='settling';settleSince=time;
        settleHero=shortestAngle(heroIdleAngle);
        settleMain=shortestAngle(mainIdleAngle);
        layers.forEach(layer=>{
          layer.settleAngle=shortestAngle(layer.idleAngle);
          layer.ringSettleStrobeSteps=layer.ringStrobeSteps.slice();
          layer.settleVisibility=layer.idleVisibility;
        });
        heroSpeed=0;
      }
      if (idleMode==='settling') {
        const t=Math.min(1,(time-settleSince)/1100);
        const envelope=(1-t)**3;
        // Continuous return followed by a small, damped wobble.
        const wobble=Math.sin(t*Math.PI*6)*.035*Math.sin(Math.PI*t)*envelope;
        heroIdleAngle=settleHero*envelope+wobble;
        mainIdleAngle=settleMain*envelope;
        layers.forEach(layer=>{
          layer.idleAngle=layer.settleAngle*envelope;
          scaleRingStrobeSteps(layer.ringStrobeSteps,layer.ringSettleStrobeSteps,envelope);
        });
        if(t===1){heroIdleAngle=mainIdleAngle=0;idleMode='waiting';idleSince=time;}
      }
      if(idleMode==='waiting') {
        // The shared eight-second pause begins after the delayed scroll
        // rotations have also reached their starting orientations.
        const ready=!ringAssetPending && mainSprites.length===layers.length && mainBorderSprites.length===layers.length &&
          mainSolidSprites.length===layers.length && sprites.length>0;
        if(ready!==startAssetsReady){idleSince=time;startAssetsReady=ready;}
        if(scrollRotationPending || !ready)idleSince=time;
        if(idleSince===undefined)idleSince=time;
        if(ready && time-idleSince>=8000){
          idleMode='running';spinSince=idleSince+8000;startScrollReleased=false;
          previousRingElapsed=undefined;
          resumeTimedRain();
        }
      }
      if(idleMode==='running') {
        let elapsed=Math.max(0,(time-spinSince)/1000);
        if(elapsed>=spinDuration){
          const cycles=Math.floor(elapsed/spinDuration);
          spinSince+=cycles*spinDuration*1000;
          elapsed-=cycles*spinDuration;
          previousRingElapsed=undefined;
        }
        heroSpeed=spinSpeed(elapsed, heroMotion);
        mainIdleAngle=heroIdleAngle=spinPhase(elapsed, heroMotion);
        layers.forEach(layer => {
          layer.idleAngle = spinPhase(elapsed, layer.startMotion.track);
          updateRingStrobeSteps(elapsed,layer,previousRingElapsed);
        });
        previousRingElapsed=elapsed;
      }
    }
    const elapsed = idleMode === 'running' ? (time - spinSince) / 1000 : -1;
    for(const layer of layers){
      layer.idleVisibility=startScrollReturn
        ? layer.returnVisibility+(.7-layer.returnVisibility)*smoothEnd(startScrollReturn.progress)
        : transitionVisibility(layer,idleRotationVisibility(elapsed, layer.startMotion.track),time);
    }
    // Keep the CSS rotation on the nearest continuous turn across ±π.
    const heroAngle = lastHeroAngle === undefined ? heroIdleAngle :
      lastHeroAngle + shortestAngle(heroIdleAngle - lastHeroAngle);
    if (openingLogo && (lastHeroAngle === undefined || Math.abs(heroAngle-lastHeroAngle)>1e-8)) {
      openingLogo.style.setProperty('--hero-idle-angle', `${heroAngle}rad`);
      lastHeroAngle = heroAngle;
    }
  }
  function transitionVisibility(layer, value, time) {
    if (idleMode === 'scrolling' && handoffSince !== undefined) {
      const start = layer.handoffVisibility ?? value;
      return start + (.7-start)*smoothEnd(Math.min(1,Math.max(0,(time-handoffSince)/600)));
    }
    if (idleMode === 'settling' && settleSince !== undefined) {
      const start = layer.settleVisibility ?? value;
      return start + (.7-start)*smoothEnd(Math.min(1,Math.max(0,(time-settleSince)/1100)));
    }
    return value;
  }
  const spriteFor = pixels => sprites.find(sprite => sprite.width >= pixels) || sprites[sprites.length - 1];
  const mainPatternVisibility = scroll => 1-smoothEnd(Math.max(0,Math.min(1,scroll/mainPatternFadeEnd)));
  const mainFillVisibility = scroll => Number.isFinite(mainFillEnd) ? smoothEnd(Math.max(0,Math.min(1,(scroll-mainFillStart)/Math.max(1,mainFillEnd-mainFillStart)))) : 0;
  const idleRotationVisibility = (elapsed, track) => {
    if (elapsed < track.start || elapsed >= track.end) return .7;
    const fadeIn = smoothEnd(Math.min(1, (elapsed - track.start) / 1.8));
    const fadeOut = smoothEnd(Math.min(1, (track.end - elapsed) / 1.8));
    return .7 + .3 * fadeIn * fadeOut;
  };
  const mainLayerOpacity = (layer,patternVisibility,fillVisibility) =>
    layer.opacity*(1-.38*fillVisibility)*(1-(1-layer.idleVisibility)*patternVisibility);
  function openingLogoScale() {
    if (!openingLogo) return 0;
    const style = getComputedStyle(openingLogo);
    return Math.min((parseFloat(style.width) || openingLogo.clientWidth) / 922,
      (parseFloat(style.height) || openingLogo.clientHeight) / 1368);
  }
  function openingMainScaleFactor() {
    if (!openingLogo || !mainBox) return 1;
    const openingScale = openingLogoScale();
    const canvasScale = Math.min(mainBox.width / 922, mainBox.height / 1368);
    const frontScale = layers.find(layer => layer.depth === 0)?.scale || 1;
    // Match the nearest background logo to the foreground artwork itself.
    // The other seven retain their existing size progression and rings.
    return openingScale > 0 && canvasScale > 0 ? openingScale / (canvasScale * frontScale) : 1;
  }
  function cacheMainWallpaperSprites() {
    if (!sprites.length || !wallpaperData || !openingLogo || !mainBox) return;
    const openingScale = openingLogoScale();
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
    const ready = () => {
      if (request !== mainWallpaperRequest || ++loaded !== images.length) return;
      // Cache one correctly sized pattern per layer, only on resize/load.
      // Bound raster sizes and reuse them in every scroll/animation frame.
      const patterns = wallpapers.map((image, index) => {
        const width = Math.max(8, Math.min(1536, Math.ceil(922 * scale * layers[index].scale * inkRatio)));
        return rasterise(image, width, Math.round(width * 1368 / 922));
      });
      const borders = patterns.map(source => rasterise(outline, source.width, source.height));
      const solids = patterns.map(source => rasterise(solid, source.width, source.height));
      Promise.all([...patterns, ...borders, ...solids].map(immutableSprite)).then(prepared => {
        if (request !== mainWallpaperRequest) { releaseSprites(prepared); return; }
        const previous = [...mainSprites, ...mainBorderSprites, ...mainSolidSprites];
        mainSprites = prepared.slice(0, layers.length);
        mainBorderSprites = prepared.slice(layers.length, layers.length * 2);
        mainSolidSprites = prepared.slice(layers.length * 2);
        gpu?.retainSprites(prepared);
        bannerGpu?.retainSprites([...prepared, ...sprites]);
        lastMainPaint = lastFeedPaint = ''; cacheSpriteChoices(); schedule();
        releaseSprites(previous);
      });
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
    if (ringLayout) {
      const ringGeometry = openingLogo?.querySelector('.hero-strobe-ring');
      const originalRingWidth = Number(ringGeometry?.getAttribute('width')) || 0;
      const logoRadius = Number(ringGeometry?.getAttribute('data-logo-radius')) || 0;
      const logoExtent = Number(ringGeometry?.getAttribute('data-logo-extent')) || 0;
      const largestLogoScale = Math.max(...layers.map(layer => layer.scale));
      const innermostRingScale = Math.min(...layers.map(layer => layer.scale * layer.ringScale));
      // Use the established logo clearance as the ring stack's reference scale.
      // The inward extensions are positioned relative to that scale.
      const requiredInnerRadius = (logoRadius + logoExtent / 64) * largestLogoScale;
      const landscape = matchMedia('(orientation: landscape)').matches;
      const variant = landscape ? ringLayout.landscape : ringLayout.portrait;
      ringPaintOrder = variant.groups;
      mainRingWidth = Math.max(originalRingWidth,
        requiredInnerRadius * ringLayout.diameter / (ringLayout.ringInnerRadius * innermostRingScale)) * (landscape ? 2 : 1);
      if (!gpu || !bannerGpu) cacheInnerRingPaths();
      logos.dataset.innerRingCount = String(variant.innerCount);
      logos.dataset.outerRingCount = String(ringLayout.outerCount);
      logos.dataset.innerRowCount = String(variant.innerCount * 4);
      logos.dataset.additionalInnerRowCount = String(variant.extensionCount * 4);
    }
    for (const [index, layer] of layers.entries()) {
      layer.sprite=mainSprites[index];layer.borderSprite=mainBorderSprites[index];layer.solidSprite=mainSolidSprites[index];
    }
    for (const mark of rain) mark.sprite = spriteFor(mark.width * bgRatio);
  }
  function easeLogoProgress(target, time, reset) {
    if (reset || logoProgress === undefined || reduced.matches) {
      logoProgress = target;
    } else {
      // Time-based damping fills the gaps between touch-scroll events. Only
      // the eight-logo drawing is eased; document scrolling and masks stay native.
      const dt = lastLogoTime !== undefined ? Math.max(0, Math.min(64, time - lastLogoTime)) : 1000 / 60;
      const previousAngle = (.5-.5*Math.cos(Math.PI*logoProgress))*Math.PI*16;
      logoProgress += (target - logoProgress) * (1 - Math.exp(-dt / 42));
      const nextAngle = (.5-.5*Math.cos(Math.PI*logoProgress))*Math.PI*16;
      // A large wheel/keyboard impulse must not skip multiple turns in one
      // frame. Follow the same eight-turn path, catching up continuously.
      const maxStep = TAU*2*dt/1000;
      if (Math.abs(nextAngle-previousAngle)>maxStep) {
        const angle=previousAngle+Math.sign(nextAngle-previousAngle)*maxStep;
        logoProgress=Math.acos(Math.max(-1,Math.min(1,1-angle/(Math.PI*8))))/Math.PI;
      }
    }
    lastLogoTime = time;
    logoAnimating = Math.abs(target - logoProgress) > .000001;
    if (!logoAnimating) logoProgress = target;
    return logoProgress;
  }
  let visualLogoScroll, visualLogoTime, visualLogoMoving = false;
  function easeLogoScroll(target, time) {
    const dt = visualLogoTime === undefined ? 0 : Math.max(0, Math.min(64,time-visualLogoTime));
    visualLogoTime = time;
    if (visualLogoScroll === undefined || reduced.matches) visualLogoScroll = target;
    else {
      const step=(target-visualLogoScroll)*(1-Math.exp(-dt/42));
      const limit=Math.max(1,openingViewport?.height || innerHeight)*dt/180;
      visualLogoScroll += Math.max(-limit,Math.min(limit,step));
    }
    visualLogoMoving = Math.abs(target-visualLogoScroll) > .01;
    if (!visualLogoMoving) visualLogoScroll = target;
    return visualLogoScroll;
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
    const settleTolerance = .1 / Math.max(1, rainWidth, rainHeight);
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
      if(Math.abs(angle-layer.scrollAngle)>settleTolerance ||
        Math.abs(angle-layer.scrollTarget)>settleTolerance)unsettled=true;
    }
    if(!unsettled)layers.forEach(layer=>layer.scrollAngle=layer.scrollTarget=angle);
    scrollRotationPending=unsettled;
  }
  const schedule = () => {
    if (!raf && !document.hidden) raf = requestAnimationFrame(render);
  };
  const invalidate = () => { layoutDirty = true; viewportDirty = true; schedule(); };
  window.EightEightEffects = {
    openingLogoScale,
    subscribe(callbacks) { subscribers.push(callbacks); invalidate(); },
    // Navigation advances first, then all canvases and lights use the same
    // resulting scroll position in this frame (no second animation clock).
    addFrameDriver(callback) {
      frameDrivers.add(callback);schedule();
      return () => frameDrivers.delete(callback);
    },
    invalidate,
    schedule,
    requestPaint() { lastSubscriberState = ''; schedule(); },
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
    const referenceWidth = landscape ? 896 : 393;
    const referenceHeight = landscape ? 414 : 852;
    const layoutScale = Math.min(viewportWidth / referenceWidth, viewportHeight / referenceHeight);
    openingViewport = {width, viewportWidth, height: viewportHeight, landscape, layoutScale};
    root.dataset.layoutMode = landscape ? 'landscape' : 'portrait';
    root.style.setProperty('--layout-scale', layoutScale);
    root.style.setProperty('--layout-unit', `${layoutScale}px`);
    root.style.setProperty('--wallpaper-tile-size', `${220 * layoutScale}px`);
    root.style.setProperty('--opening-viewport-height', `${referenceHeight * layoutScale}px`);
    return true;
  }
  function rainReferenceWidth(width, height) {
    // Always use the existing landscape sizing, even on a portrait viewport.
    // This reference is independent of the foreground/main-logo enlargement.
    const longSide = openingViewport?.landscape ? 896 : 852;
    const shortSide = openingViewport?.landscape ? 414 : 393;
    const header = longSide <= 560 ? 90.44 : longSide <= 900 ? 104 : 120;
    const boxWidth = longSide <= 560 ? Math.min(.72 * longSide, 460) : Math.min(.52 * longSide, 560);
    const inset = Math.max(56, Math.min(96, .08 * shortSide));
    const boxHeight = Math.max(0, Math.min(820, shortSide - header - inset));
    return Math.min(boxWidth, boxHeight * 922 / 1368) * 1.15 * (openingViewport?.layoutScale || 1);
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
      cacheMainWallpaperSprites();
      cacheSpriteChoices();
    }
    if ((feed || bannerGpu) && bannerMask) {
      feedHeight = Math.max(0, Math.min(height, bannerMask.getBoundingClientRect().height));
      if (bannerGpu) bannerGpu.resize(width,feedHeight,inkRatio);
      else resizeSurface(bannerFeed, feed, width, feedHeight, inkRatio);
    }
    if (!bg || (!ink && !gpu) || !mainBox) return;
    resizeSurface(background, bg, width, surfaceHeight, bgRatio);
    if (gpu) gpu.resize(width, surfaceHeight, inkRatio);
    else resizeSurface(logos, ink, width, surfaceHeight, inkRatio);
    background.style.width = logos.style.width = `${width}px`;
    background.style.height = logos.style.height = `${surfaceHeight}px`;
    // Rain uses the same pinned viewport, with the landscape size reference.
    const rainSizeWidth = rainReferenceWidth(openingViewport.viewportWidth, openingViewport.height);
    const portrait = matchMedia('(orientation: portrait)').matches;
    const key = `${width}:${Math.round(pageHeight)}:${portrait}:${rainSizeWidth.toFixed(1)}`;
    if (key === sceneKey) { rainWidth=width;rainHeight=height; return; }
    sceneKey = key;
    // Match the 282 visible marks of the 1600 × 900 reference in every mode.
    // Keep their random phases and relative positions through layout changes.
    const oldWidth = rainWidth, oldMaxWidth = rainMaxWidth;
    rainWidth=width;rainHeight=height;rainMaxWidth=rainSizeWidth;
    const poolSize=282;
    if (rain.length) {
      for (const mark of rain) {
        const factor = oldMaxWidth > 0 ? rainMaxWidth / oldMaxWidth : 1;
        mark.x = (mark.x + mark.width / 2) / Math.max(1, oldWidth) * width - mark.width * factor / 2;
        mark.width *= factor; mark.height *= factor;
      }
    } else {
      rain=Array.from({length:poolSize},()=>spawnRain(true));
    }
    lastRainTime=undefined;
    background.dataset.logoCount = String(poolSize);
    cacheSpriteChoices();
  }
  function spawnRain(initial=false) {
    const width=rainMaxWidth*(.004+.216*Math.random()**2.6);
    // Half the previous speed for every mark: fastest traversal 4 s, slowest 16 s.
    // In scroll mode these durations represent viewport distances, not a clock.
    const duration=4+12*Math.random();
    return {x:Math.random()*rainWidth-width/2,width,height:width*1368/922,
      opacity:(.08+Math.random()*.24)*.2206456,duration,
      progress:initial?Math.random():0,sprite:spriteFor(width*bgRatio)};
  }
  function advanceRain(time,width,height,scroll) {
    if (rainScrollOrigin === null && scroll > .5 && !startScrollReturn)
      anchorRainToScroll(0);
    if(reduced.matches){lastRainTime=undefined;return;}
    if (rainScrollOrigin !== null) {
      const travel=(scroll-rainScrollOrigin)/rainScrollUnit;
      // A pure position function: no respawning, accumulated delta, or elapsed
      // time. Returning to a scroll position restores the exact same scene.
      for (const mark of rain) {
        const phase=(mark.scrollPhase ?? mark.progress)+travel/mark.duration;
        mark.progress=((phase%1)+1)%1;
      }
      rainTime=travel;
      lastRainTime=undefined;
      return;
    }
    const dt=lastRainTime===undefined?0:Math.min(.1,Math.max(0,(time-lastRainTime)/1000));
    lastRainTime=time;
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
  function updateRingRowAngles() {
    for (const layer of layers) {
      const angle=layer.scrollAngle+layer.idleAngle;
      // Both renderers and the banner use the same angle of the complete photo pattern.
      for (const {index,pitch} of ringRows) {
        layer.ringRowAngles[index]=wrapRingStep((angle-layer.ringStrobeSteps[index]*pitch)/TAU)*TAU;
      }
    }
  }
  function paintCanvas(state, easedProgress, time, resetMotion) {
    if (!bg || (!ink && !gpu) || !mainBox || !sprites.length || !mainSprites.length ||
        !mainBorderSprites.length || !mainSolidSprites.length) return;
    const {width, height} = state;
    const backgroundKey = `${sceneKey}:${width}:${height}:${surfaceHeight}:${rainTime}`;
    if (backgroundKey !== lastBackgroundPaint) {
      bg.clearRect(0, 0, width, surfaceHeight);
      const count=String(drawRain(bg,width,surfaceHeight));
      if (background.dataset.visibleLogos !== count) background.dataset.visibleLogos = count;
      lastBackgroundPaint = backgroundKey;
    }
    const sceneScroll = easeLogoScroll(state.scroll,time);
    const patternVisibility=mainPatternVisibility(sceneScroll);
    const fillVisibility=mainFillVisibility(sceneScroll);
    const center = commonLogoCenter(patternVisibility);
    const {x:centerX, y:centerY} = center;
    const mainPaintKey=`${sceneKey}:${width}:${height}:${surfaceHeight}:${openingScaleFactor}:${mainRingWidth}:${centerX}:${centerY}:${easedProgress}:${scrollStackBlend}:${patternVisibility}:${fillVisibility}:${layers.map(layer=>`${layer.scrollAngle}:${layer.idleAngle}:${layer.idleVisibility}:${layer.ringStrobeSteps}`).join(',')}`;
    if(mainPaintKey===lastMainPaint)return;
    lastMainPaint=mainPaintKey;
    updateRingRowAngles();
    // Eight unlit logos share one canvas; native document scrolling is untouched.
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
    if (gpu) {
      const ringOpacity = mainLayerOpacity(frontRingLayer, patternVisibility, fillVisibility) / frontRingLayer.opacity;
      let painted = false;
      try {
        painted = gpu.draw(lastLogoScene, layers, ringPaintOrder, mainLayerOpacity, ringOpacity);
      } catch { /* The prepared 2D renderer remains available on every device. */ }
      if (!painted) fallbackToCanvas();
    }
    if (!gpu) {
      ink.clearRect(0, 0, width, surfaceHeight);
      drawLogoLayers(ink,lastLogoScene,width,surfaceHeight);
    }
    if (!root.classList.contains('canvas-logos-ready')) {
      root.classList.add('logo-rain-ready', 'canvas-logos-ready');
    }
  }
  function drawLogoLayers(context,scene,width,surfaceHeight) {
    const {centerX,centerY,w,h,scale,ringDiameter,patternVisibility,fillVisibility}=scene;
    drawTimecodeRings(context,scene,width,surfaceHeight,ringPaintOrder);
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
      context.drawImage(layer.borderSprite,-w/2,-h/2,w,h);
      context.restore();
    }
  }
  function drawTimecodeRings(context,scene,width,surfaceHeight,rings) {
    const {centerX,centerY,ringDiameter,patternVisibility,fillVisibility}=scene;
    // A shared animation fade preserves the equal differences between rows.
    const visibility = mainLayerOpacity(frontRingLayer, patternVisibility, fillVisibility) / frontRingLayer.opacity;
    context.fillStyle='#c2b594';
    for (const group of rings) {
      if (!(ringDiameter > 0) || !ringIntersectsViewport(centerX, centerY, group.innerRadius * ringDiameter,
        group.outerRadius * ringDiameter, width, surfaceHeight)) continue;
      context.save();
      context.translate(centerX, centerY);
      context.rotate(group.source.ringRowAngles[0]);
      context.scale(ringDiameter, ringDiameter);
      for (const band of group.bands) {
        if (!ringIntersectsViewport(centerX, centerY, band.innerRadius * ringDiameter,
          band.outerRadius * ringDiameter, width, surfaceHeight)) continue;
        if (band.paths) {
          for (const [alpha, path] of band.paths) {
            context.globalAlpha = visibility * alpha;
            context.fill(path);
          }
        } else {
          const strips = band.strips;
          for (let index = 0; index < strips.length; index += 5) {
            const [x, y, w, h, alpha] = strips.subarray(index, index + 5);
            context.globalAlpha = visibility * alpha;
            context.fillRect(x - w, y - h, 2 * w, 2 * h);
          }
        }
      }
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
    if((!feed && !bannerGpu) || !lastLogoScene || !feedHeight || !width || !height)return;
    const feedKey=`${lastBackgroundPaint}:${lastMainPaint}:${width}:${height}:${feedHeight}`;
    if(feedKey===lastFeedPaint)return;
    lastFeedPaint=feedKey;
    if (bannerGpu) {
      const scene = lastLogoScene;
      const opacity = mainLayerOpacity(frontRingLayer, scene.patternVisibility, scene.fillVisibility) / frontRingLayer.opacity;
      let painted = false;
      try {
        painted = bannerGpu.draw(scene,layers,ringPaintOrder,mainLayerOpacity,opacity,
          {marks:rain,surfaceHeight});
      } catch { /* The same scene remains available through Canvas. */ }
      if (painted) return;
      fallbackBannerToCanvas();
    }
    feed.clearRect(0,0,width,feedHeight);
    drawRain(feed,width,feedHeight);
    drawLogoLayers(feed,lastLogoScene,width,feedHeight);
  }
  let pausedAt = null, pausedDuration = 0;
  function render(time = performance.now()) {
    raf = 0;
    if (document.hidden) return;
    time -= pausedDuration;
    const controlledScroll=frameDrivers.size>0;
    // Explicit menu navigation remains available during a partial return.
    if (controlledScroll && startScrollReturn) releaseStartScrollToNavigation();
    for(const driver of [...frameDrivers])driver(time);
    captureNativeStartScroll();
    syncSurfacePosition(scrollPosition());
    const geometryDirty = layoutDirty || viewportDirty;
    // Do not force layout after the viewport-following canvas transform write.
    const width = geometryDirty || !lastWidth ? root.clientWidth : lastWidth;
    const height = geometryDirty || !lastHeight ? innerHeight : lastHeight;
    const resetMotion = !lastWidth;
    if (geometryDirty) {
      measure(width, height);
      layoutDirty = viewportDirty = false;
      lastWidth = width;
      lastHeight = height;
    }
    const state = field(width, height, Math.max(0, scrollPosition()));
    const easedProgress = easeLogoProgress(state.motionProgress, time, resetMotion || controlledScroll);
    updateScrollRotations(easedProgress,time,resetMotion,state.scroll);
    updateIdleRotation(time,state.scroll);
    advanceRain(time,width,height,state.scroll);
    paintCanvas(state, easedProgress, time, resetMotion);
    paintBannerFeed(width, height);
    if (startScrollReturn?.progress === 1) finishStartScrollReturn(time);
    syncScrollInterception();
    const subscriberState = `${width}:${height}:${state.scroll}:${state.progress}:${state.motionProgress}`;
    if (geometryDirty || subscriberState !== lastSubscriberState) {
      subscribers.forEach(item => item.paint?.(state));
      lastSubscriberState = subscriberState;
    }
    if (startScrollReturn || (!reduced.matches && (state.scroll <= .5 || heroSpeed > 0)) || handoffActive || frameDrivers.size || logoAnimating || visualLogoMoving || scrollRotationPending || (!reduced.matches && rainScrollOrigin === null && rain.length && sprites.length)) schedule();
  }
  image.addEventListener('load', () => {
    const prepared = [...new Set([8, 16, 32, 64, 128, 256, 384, 512, 768, Math.min(1536, image.naturalWidth || 922)])].sort((a, b) => a - b).map(width => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.round(width * 1368 / 922);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    });
    Promise.all(prepared.map(immutableSprite)).then(items => { sprites = items; invalidate(); });
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
  const editingScrollTarget = target => target?.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || '');
  function onWheel(event) {
    if (event.ctrlKey || editingScrollTarget(event.target)) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    consumeStartScroll(event.deltaY * unit, event);
  }
  window.addEventListener('touchstart', event => {
    touchScrollY = event.touches.length === 1 ? event.touches[0].clientY : null;
    touchScrollConsumed = false;
  }, {passive: true, capture: true});
  function onTouchMove(event) {
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
  }
  let scrollInterceptionEnabled = false;
  function syncScrollInterception() {
    const enabled = !reduced.matches && !document.hidden && !frameDrivers.size &&
      (touchScrollConsumed || startScrollReturn || (scrollPosition() <= .5 &&
        (idleMode === 'running' || idleMode === 'settling')));
    if (!!enabled === scrollInterceptionEnabled) return;
    scrollInterceptionEnabled = !!enabled;
    if (enabled) {
      window.addEventListener('wheel', onWheel, {passive: false, capture: true});
      window.addEventListener('touchmove', onTouchMove, {passive: false, capture: true});
    } else {
      window.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('touchmove', onTouchMove, true);
    }
  }
  for (const type of ['touchend', 'touchcancel']) window.addEventListener(type, () => {
    touchScrollY = null; touchScrollConsumed = false;
    syncScrollInterception();
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
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pausedAt = performance.now();
    else if (pausedAt !== null) {
      pausedDuration += performance.now()-pausedAt;
      pausedAt = null;
    }
    // Resume the same animation phase; hidden wall-clock time is not motion.
    lastRainTime=lastLogoTime=idleLastTime=visualLogoTime=scrollRotationFrameTime=undefined;
    schedule();
  });
  reduced.addEventListener('change', invalidate);
  document.fonts?.ready.then(invalidate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => {
      if (scrollHeight() !== pageHeight) invalidate();
    });
    observer.observe(document.querySelector('.site-shell'));
  }
  loadRingSource();
  schedule();
})();
