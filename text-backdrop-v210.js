(() => {
  'use strict';
  const engine = window.EightEightEffects;
  if (!engine || !(CSS.supports('backdrop-filter', 'blur(.8px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(.8px)'))) return;
  const padding = 3;
  const contourWidth = .8;
  const cache = new WeakMap();
  const owners = [...document.querySelectorAll('.gold-text-light')].filter(owner =>
    !owner.parentElement?.closest('.gold-text-light') && owner.textContent.trim());

  function scaleFor(element) {
    let x = 1, y = 1;
    for (let node = element; node; node = node.parentElement) {
      const transform = getComputedStyle(node).transform;
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrixReadOnly(transform);
        x *= Math.hypot(matrix.a, matrix.b);
        y *= Math.hypot(matrix.c, matrix.d);
      }
    }
    return {x: x || 1, y: y || 1};
  }
  function canvasFor(width, height, ratio) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * ratio);
    canvas.height = Math.ceil(height * ratio);
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.textBaseline = 'alphabetic';
    context.fillStyle = context.strokeStyle = '#fff';
    context.lineWidth = contourWidth * 2;
    context.lineJoin = 'round';
    return {canvas, context};
  }
  function maskFor(owner, box, scale, width, height, ratio) {
    const core = canvasFor(width, height, ratio);
    const outline = canvasFor(width, height, ratio);
    const range = document.createRange();
    const walker = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim() || node.parentElement.closest('[aria-hidden="true"]')) continue;
      const style = getComputedStyle(node.parentElement);
      const font = style.font || `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      for (const ctx of [core.context, outline.context]) {
        ctx.font = font;
        ctx.direction = style.direction;
        ctx.fontKerning = 'normal';
      }
      const metrics = core.context.measureText('Hg');
      const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      const ascent = Number.isFinite(fontHeight) && fontHeight > 0
        ? metrics.fontBoundingBoxAscent / fontHeight : .8;
      let offset = 0;
      for (const character of node.textContent) {
        range.setStart(node, offset);
        offset += character.length;
        range.setEnd(node, offset);
        if (!character.trim()) continue;
        const rect = range.getBoundingClientRect();
        if (!(rect.width > 0 && rect.height > 0)) continue;
        const glyph = style.textTransform === 'uppercase' ? character.toUpperCase()
          : style.textTransform === 'lowercase' ? character.toLowerCase() : character;
        const x = padding + (rect.left - box.left) / scale.x;
        const baseline = padding + (rect.top - box.top + rect.height * ascent) / scale.y;
        // Character positions come from the existing DOM. No wrapping, text
        // replacement, spacing, opacity or foreground filter is introduced.
        outline.context.strokeText(glyph, x, baseline);
        core.context.fillText(glyph, x, baseline);
      }
    }
    range.detach?.();
    // Keep only the 0.8px OUTER glyph band. The mask is alpha data; its white
    // pixels are never painted as a visible white edge or background colour.
    outline.context.globalCompositeOperation = 'destination-out';
    outline.context.setTransform(1, 0, 0, 1, 0, 0);
    outline.context.drawImage(core.canvas, 0, 0);
    return `url("${outline.canvas.toDataURL('image/png')}")`;
  }
  function measure() {
    const ratio = Math.min(3, Math.max(1, devicePixelRatio || 1));
    const pending = [];
    for (const owner of owners) {
      const box = owner.getBoundingClientRect();
      if (!(box.width > 0 && box.height > 0)) continue;
      const style = getComputedStyle(owner);
      if (style.visibility === 'hidden') continue;
      const scale = scaleFor(owner);
      const width = box.width / scale.x + padding * 2;
      const height = box.height / scale.y + padding * 2;
      const key = [width.toFixed(3), height.toFixed(3), ratio, style.font,
        style.letterSpacing, style.lineHeight, style.textTransform, owner.textContent].join('|');
      const previous = cache.get(owner);
      if (previous?.key === key) continue;
      pending.push({owner, width, height, position: style.position, previous, key,
        mask: maskFor(owner, box, scale, width, height, ratio)});
    }
    // Rasterize only after layout/font changes. Animated backgrounds are blurred
    // live by the browser compositor, without rebuilding masks during scrolling.
    for (const {owner, width, height, position, previous, key, mask} of pending) {
      const layer = previous?.layer || document.createElement('span');
      if (!previous) {
        layer.className = 'text-backdrop-outline';
        layer.setAttribute('aria-hidden', 'true');
        if (position === 'static') owner.style.position = 'relative';
        owner.prepend(layer);
      }
      layer.style.width = `${width}px`;
      layer.style.height = `${height}px`;
      layer.style.maskImage = layer.style.webkitMaskImage = mask;
      cache.set(owner, {key, layer});
    }
  }
  engine.subscribe({measure});
  document.fonts?.ready.then(engine.invalidate);
})();
