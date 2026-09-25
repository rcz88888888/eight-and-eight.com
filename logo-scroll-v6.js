const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuToggle?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open') ?? false;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
document.querySelectorAll('.site-nav a').forEach(link => link.addEventListener('click', () => {
  nav?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open navigation');
}));
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const backdrop = document.querySelector('.background-layers');
const svgNS = 'http://www.w3.org/2000/svg';
const visibleMarks = backdrop?.querySelector('.visible-marks');
const markPool = [];
const mainLogo = document.querySelector('.parallax-logo');
const portraitLayout = window.matchMedia("(orientation: portrait)");
const LOGO_VISIBILITY = 0.2206456; // v13: previous 0.315208 multiplied by 0.70 (30% less visible).
const MAIN_LOGO_TURNS = 8;
const LAYER_SPEED_RATIO = 0.72;
const SOURCE_WIDTH = 922;
const SOURCE_HEIGHT = 1368;
const logoImage = new Image();
let logoReady = false;
let droplets = [];
let frame = 0;
let pageHeight = 0;

// One seeded position, scale, depth and parallax speed for each of the 8,888 logos.
const mulberry32 = seed => () => {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
// The eight image elements already exist in HTML. Image loading, canvas or
// JavaScript failures must never remove the main logo.
const mainLayers = [...document.querySelectorAll('.main-logo-layer')];
mainLayers.forEach(layer => {
  layer.dataset.speed = String(LAYER_SPEED_RATIO ** Number(layer.dataset.depth));
});

const buildRain = () => {
  if (!backdrop || !visibleMarks || !mainLogo) return;
  const LOGO_COUNT = portraitLayout.matches ? 4444 : 8888;
  const rand = mulberry32(88888888);
  pageHeight = Math.max(document.documentElement.scrollHeight, innerHeight);
  // Match the displayed image (object-fit: contain), not only its container.
  const mainWidth = Math.min(mainLogo.clientWidth,
    mainLogo.clientHeight * SOURCE_WIDTH / SOURCE_HEIGHT) * 1.15;
  droplets = Array.from({ length: LOGO_COUNT }, (_, index) => {
    // A skewed spread makes numerous small marks and occasional large ones.
    const fraction = index === 0 ? 0 : index === LOGO_COUNT - 1 ? 1 : rand() ** 2.6;
    const width = mainWidth * (0.008 + 0.872 * fraction);
    return {
      x: rand() * (innerWidth + mainWidth) - mainWidth / 2,
      y: rand() * (pageHeight + innerHeight) - innerHeight / 2,
      width,
      height: width * SOURCE_HEIGHT / SOURCE_WIDTH,
      opacity: (0.08 + rand() * 0.24) * LOGO_VISIBILITY,
      speed: 0.16 + rand() * 0.56,
    };
  });
  backdrop.dataset.logoCount = String(droplets.length);
  backdrop.dataset.minSizeRatio = '0.008';
  backdrop.dataset.maxSizeRatio = '0.88';
  requestUpdate();
};

const update = () => {
  frame = 0;
  const scroll = window.scrollY;
  const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, scroll / range));
  // All layers cross at the viewport centre at exactly half the scroll range.
  // A shared travel curve preserves the 28% speed reduction between neighbours.
  const travelRange = Math.min(innerHeight, mainLogo?.clientHeight || innerHeight);
  const logoTravel = (0.5 - progress) * travelRange;
  // Preserve the gentle start/end while completing eight full clockwise turns.
  const rotation = (0.5 - 0.5 * Math.cos(Math.PI * progress)) * 360 * MAIN_LOGO_TURNS;
  for (const layer of mainLayers) {
    const speed = parseFloat(layer.dataset.speed);
    layer.style.setProperty('--layer-shift', `${(logoTravel * speed).toFixed(2)}px`);
    layer.style.setProperty('--layer-rotation', `${rotation.toFixed(2)}deg`);
  }
  if (!backdrop || !visibleMarks || !logoReady) return;
  backdrop.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
  backdrop.style.width = `${innerWidth}px`;
  backdrop.style.height = `${innerHeight}px`;
  let visibleCount = 0;
  for (const mark of droplets) {
    const y = mark.y - scroll * (1 - mark.speed);
    const x = mark.x - mark.width / 2;
    if (y + mark.height < 0 || y > innerHeight || x + mark.width < 0 || x > innerWidth) continue;
    let node = markPool[visibleCount];
    if (!node) {
      node = document.createElementNS(svgNS, 'use');
      node.setAttribute('href', '#background-logo-source');
      visibleMarks.appendChild(node);
      markPool.push(node);
    }
    node.setAttribute('transform', `translate(${x} ${y}) scale(${mark.width / SOURCE_WIDTH} ${mark.height / SOURCE_HEIGHT})`);
    node.setAttribute('opacity', String(mark.opacity));
    node.removeAttribute('display');
    visibleCount++;
  }
  // Reuse visible nodes; never accumulate old painted frames while zooming.
  for (let i = visibleCount; i < markPool.length; i++) markPool[i].setAttribute('display', 'none');
  backdrop.dataset.visibleLogos = String(visibleCount);
  document.documentElement.classList.toggle('logo-rain-ready', true);
};
const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };

// All functions and state are now initialized, including the cached-image path.
buildRain();
const revealLogo = () => { logoReady = true; requestUpdate(); };
logoImage.addEventListener('load', revealLogo, { once: true });
logoImage.src = 'eight-and-eight-logo-dark-v18.png';
if (logoImage.complete && logoImage.naturalWidth) revealLogo();
requestUpdate();
window.addEventListener('load', buildRain, { once: true });
window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', buildRain, { passive: true });
portraitLayout.addEventListener('change', buildRain);
if ('ResizeObserver' in window) {
  const layoutObserver = new ResizeObserver(() => {
    if (pageHeight !== Math.max(document.documentElement.scrollHeight, innerHeight)) buildRain();
  });
  layoutObserver.observe(document.querySelector('.site-shell'));
}

// Pinch zoom does not consistently dispatch window.resize on iOS Safari.
window.visualViewport?.addEventListener('resize', requestUpdate, { passive: true });
window.visualViewport?.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('pageshow', buildRain, { passive: true });
