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

const canvas = document.querySelector('.background-layers');
const context = canvas?.getContext('2d');
const mainLogo = document.querySelector('.parallax-logo');
const LOGO_COUNT = 8888;
const LOGO_VISIBILITY = 0.3844; // Previous 0.62, reduced by another 38%.
const MAIN_LOGO_TURNS = 8;
const LAYER_SPEED_RATIO = 0.72;
const SOURCE_WIDTH = 922;
const SOURCE_HEIGHT = 1368;
const logoImage = new Image();
let tintedLogo;
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
const brandColor = () => getComputedStyle(document.querySelector('.wordmark-text')).color;
const tintLogo = () => {
  if (!logoImage.complete || !logoImage.naturalWidth) return;
  const target = document.createElement('canvas');
  target.width = SOURCE_WIDTH;
  target.height = SOURCE_HEIGHT;
  const ctx = target.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(logoImage, 0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = brandColor();
  ctx.fillRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
  tintedLogo = target;
  requestUpdate();
};
// The eight image elements already exist in HTML. Image loading, canvas or
// JavaScript failures must never remove the main logo.
const mainLayers = [...document.querySelectorAll('.main-logo-layer')];
mainLayers.forEach(layer => {
  layer.dataset.speed = String(LAYER_SPEED_RATIO ** Number(layer.dataset.depth));
});

const buildRain = () => {
  if (!canvas || !context || !mainLogo) return;
  const rand = mulberry32(88888888);
  pageHeight = Math.max(document.documentElement.scrollHeight, innerHeight);
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
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
  canvas.dataset.logoCount = String(droplets.length);
  canvas.dataset.minSizeRatio = '0.008';
  canvas.dataset.maxSizeRatio = '0.88';
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
  if (!context) return;
  context.clearRect(0, 0, innerWidth, innerHeight);
  if (!tintedLogo) return;
  let visibleCount = 0;
  for (const mark of droplets) {
    const y = mark.y - scroll * (1 - mark.speed);
    if (y + mark.height < 0 || y > innerHeight) continue;
    context.globalAlpha = mark.opacity;
    context.drawImage(tintedLogo, mark.x - mark.width / 2, y, mark.width, mark.height);
    visibleCount += 1;
  }
  context.globalAlpha = 1;
  canvas.dataset.visibleLogos = String(visibleCount);
  document.documentElement.classList.toggle('logo-rain-ready', visibleCount > 0);
};
const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };

// All functions and state are now initialized, including the cached-image path.
buildRain();
logoImage.addEventListener('load', tintLogo, { once: true });
logoImage.src = 'Eight&Eight-logo.png';
if (logoImage.complete && logoImage.naturalWidth) tintLogo();
requestUpdate();
window.addEventListener('load', buildRain, { once: true });
window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', buildRain, { passive: true });
if ('ResizeObserver' in window) {
  const layoutObserver = new ResizeObserver(() => {
    if (pageHeight !== Math.max(document.documentElement.scrollHeight, innerHeight)) buildRain();
  });
  layoutObserver.observe(document.querySelector('.site-shell'));
}
