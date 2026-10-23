(() => {
  'use strict';
  const engine = window.EightEightEffects;
  if (!engine) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.topbar');
  const clamp = value => Math.max(0, Math.min(1, value));
  let headerHeight = 0;
  let lastState = {scroll: window.scrollY, height: innerHeight};

  const items = [...document.querySelectorAll('figure[data-scroll-video]')].map(figure => {
    const poster = figure.querySelector('img');
    if (!poster) return null;
    const frame = document.createElement('div');
    frame.className = 'photo-scroll-video';
    poster.replaceWith(frame);
    poster.classList.add('photo-video-poster');
    frame.append(poster);
    const video = document.createElement('video');
    video.className = 'photo-motion-film';
    video.muted = video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    video.loop = false;
    video.preload = 'none';
    video.disablePictureInPicture = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.poster = poster.currentSrc || poster.src;
    frame.append(video);
    const item = {figure, frame, video, top: Infinity, height: 0,
      fps: Number(figure.dataset.videoFps) || 24, lastFrame: 95,
      started: false, metadata: false, failed: false, active: false, progress: 0};
    video.addEventListener('loadedmetadata', () => {
      if (!(Number.isFinite(video.duration) && video.duration > 0)) return;
      item.metadata = true;
      item.lastFrame = Math.max(0, Math.round(video.duration * item.fps) - 1);
      seek(item);
    });
    video.addEventListener('loadeddata', () => seek(item));
    video.addEventListener('seeked', () => {
      // A decoded frame is ready. Coalesce fast scrolls to the latest requested frame.
      if (!reduced.matches && video.readyState >= 2) frame.setAttribute('data-video-ready', '');
      seek(item);
    });
    video.addEventListener('error', () => {
      item.failed = true;
      frame.removeAttribute('data-video-ready');
    });
    return item;
  }).filter(Boolean);

  function seek(item) {
    const video = item.video;
    // Wait for a decoded frame before seeking, rather than seeking during
    // metadata-only initialization (important for Safari's media pipeline).
    if (!item.metadata || video.readyState < 2 || item.failed || !item.active || reduced.matches || video.seeking) return;
    // First and last frames coincide with entry at the lower viewport edge and
    // exit behind the banner. Scroll speed determines the effective movie speed.
    const frame = Math.round(clamp(item.progress) * item.lastFrame);
    const time = frame / item.fps;
    if (Math.abs(video.currentTime - time) < .45 / item.fps) {
      if (video.readyState >= 2) item.frame.setAttribute('data-video-ready', '');
      return;
    }
    try { video.currentTime = time; }
    catch { item.frame.removeAttribute('data-video-ready'); }
  }
  function start(item) {
    if (item.started || reduced.matches) return;
    item.started = true;
    item.video.preload = 'auto';
    item.video.src = item.figure.dataset.scrollVideo;
    item.video.load();
  }
  function measure() {
    headerHeight = header?.getBoundingClientRect().height || 0;
    for (const item of items) {
      const box = item.frame.getBoundingClientRect();
      item.top = box.top + window.scrollY;
      item.height = box.height;
    }
    paint({scroll: window.scrollY, height: innerHeight});
  }
  function paint(state) {
    lastState = state;
    for (const item of items) {
      if (!(item.height > 0)) continue;
      const top = item.top - state.scroll;
      item.active = top < state.height && top + item.height > headerHeight;
      const span = Math.max(1, state.height - headerHeight + item.height);
      item.progress = clamp((state.scroll + state.height - item.top) / span);
      if (reduced.matches) {
        item.frame.removeAttribute('data-video-ready');
        continue;
      }
      if (item.active) {
        start(item);
        seek(item);
      }
    }
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const item = items.find(item => item.figure === entry.target);
        if (item) {
          start(item);
          if (item.started) observer.unobserve(item.figure);
        }
      }
    }, {rootMargin: '900px 0px'});
    for (const item of items) observer.observe(item.figure);
  }
  engine.subscribe({measure, paint});
  reduced.addEventListener('change', () => { paint(lastState); engine.invalidate(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) paint(lastState);
    for (const item of items) item.video.pause();
  });
})();
