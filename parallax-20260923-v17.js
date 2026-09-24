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
const context = canvas?.getContext('2d', { alpha: false });
const mainLogo = document.querySelector('.parallax-logo');
const LOGO_COUNT = 8888;
const SOURCE_WIDTH = 922;
const SOURCE_HEIGHT = 1368;
const logoImage = new Image();
logoImage.src = 'Eight&Eight-logo.png';
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
  ctx.drawImage(logoImage, 0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = brandColor();
  ctx.fillRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
  tintedLogo = target;
  requestUpdate();
};
logoImage.addEventListener('load', tintLogo);
if (logoImage.complete) tintLogo();

// Eight coincident logos at the top: full strength in front, then seven
// successive layers, each 8% less visible, 0.8% larger and 8% slower.
for (let depth = 7; depth >= 0; depth -= 1) {
  const layer = document.createElement('span');
  layer.className = 'main-logo-layer';
  layer.style.setProperty('--depth-size', String(1 + depth * 0.008));
  layer.style.opacity = String(1 - depth * 0.08);
  layer.dataset.speed = String(0.92 ** depth);
  mainLogo?.appendChild(layer);
}
const mainLayers = [...(mainLogo?.children || [])];

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
  const mainWidth = mainLogo.getBoundingClientRect().width * 1.15;
  droplets = Array.from({ length: LOGO_COUNT }, (_, index) => {
    // A skewed spread makes numerous small marks and occasional large ones.
    const fraction = index === 0 ? 0 : index === LOGO_COUNT - 1 ? 1 : rand() ** 2.6;
    const width = mainWidth * (0.008 + 0.872 * fraction);
    return {
      x: rand() * (innerWidth + mainWidth) - mainWidth / 2,
      y: rand() * (pageHeight + innerHeight) - innerHeight / 2,
      width,
      height: width * SOURCE_HEIGHT / SOURCE_WIDTH,
      opacity: 0.012 + rand() * 0.032,
      speed: 0.16 + rand() * 0.56,
    };
  });
  requestUpdate();
};

const getLogoExitTravel = () => {
  if (!mainLogo) return 0;
  const styles = getComputedStyle(mainLogo);
  const top = parseFloat(styles.top) || 0;
  const boxWidth = mainLogo.offsetWidth;
  const boxHeight = mainLogo.offsetHeight;
  const visibleContentBottom = 1223;
  const scale = Math.min(boxWidth / SOURCE_WIDTH, boxHeight / SOURCE_HEIGHT);
  const centeredOffsetY = (boxHeight - SOURCE_HEIGHT * scale) / 2;
  const visibleBottom = centeredOffsetY + visibleContentBottom * scale;
  return top + boxHeight / 2 + (visibleBottom - boxHeight / 2) * 1.15 + 1;
};

const update = () => {
  frame = 0;
  const scroll = window.scrollY;
  const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, scroll / range));
  const logoTravel = -(progress ** 6) * getLogoExitTravel();
  const rotation = (0.5 - 0.5 * Math.cos(Math.PI * progress)) * 360;
  for (const layer of mainLayers) {
    const speed = parseFloat(layer.dataset.speed);
    layer.style.setProperty('--layer-shift', `${(logoTravel * speed).toFixed(2)}px`);
    layer.style.setProperty('--layer-rotation', `${rotation.toFixed(2)}deg`);
  }
  if (!context) return;
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--pearl-white').trim() || '#fbf8f3';
  context.fillRect(0, 0, innerWidth, innerHeight);
  if (!tintedLogo) return;
  for (const mark of droplets) {
    const y = mark.y - scroll * (1 - mark.speed);
    if (y + mark.height < 0 || y > innerHeight) continue;
    context.globalAlpha = mark.opacity;
    context.drawImage(tintedLogo, mark.x - mark.width / 2, y, mark.width, mark.height);
  }
  context.globalAlpha = 1;
};
const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
buildRain();
window.addEventListener('load', buildRain, { once: true });
window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', buildRain, { passive: true });
