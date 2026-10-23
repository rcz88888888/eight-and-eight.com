(() => {
  'use strict';
  const engine = window.EightEightEffects;
  if (!engine) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const groups = new Map();
  const text = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent.trim() || node.parentElement.closest(
      'script,style,noscript,template,svg,textarea,input,select,[contenteditable],.wordmark,.menu-toggle,[aria-hidden="true"]'
    )) continue;
    text.push(node);
  }
  const ownerFor = element => {
    const semantic = element.closest('h1,h2,h3,h4,h5,h6,p,li,a,button,label,blockquote,figcaption,dt,dd,th,td');
    if (semantic) return semantic;
    while (element.parentElement && getComputedStyle(element).display === 'inline') element = element.parentElement;
    return element;
  };
  for (const node of text) {
    const owner = ownerFor(node.parentElement);
    if (!groups.has(owner)) groups.set(owner, {owner, words: [], top: 0, height: 0, active: false, spread: ''});
    const group = groups.get(owner);
    const fragment = document.createDocumentFragment();
    for (const token of node.textContent.split(/(\s+)/)) {
      if (!token) continue;
      if (/^\s+$/.test(token)) fragment.append(document.createTextNode(token));
      else {
        const word = document.createElement('span');
        word.className = 'scroll-text-word';
        word.textContent = token;
        group.words.push(word);
        fragment.append(word);
      }
    }
    node.replaceWith(fragment);
  }
  const clamp = value => Math.max(0, Math.min(1, value));
  function measure() {
    // Only visual offsets change. Natural line wrapping, panel heights and
    // navigation destinations retain their original document geometry.
    for (const group of groups.values()) group.owner.style.setProperty('--text-line-spread', '0px');
    const measured = [...groups.values()].map(group => {
      const box = group.owner.getBoundingClientRect();
      return {group, box, rects: group.words.map(word => word.getBoundingClientRect())};
    });
    for (const {group, box, rects} of measured) {
      group.top = box.top + window.scrollY;
      group.height = box.height;
      group.active = box.width > 0 && box.height > 0;
      group.spread = '';
      let line = -1, lastTop = -Infinity;
      const indices = rects.map(rect => {
        if (Math.abs(rect.top - lastTop) > 2) { line++; lastTop = rect.top; }
        return line;
      });
      group.words.forEach((word, index) => word.style.setProperty('--text-line-index', indices[index] - line / 2));
    }
    paint({scroll: window.scrollY, height: innerHeight});
  }
  function paint({scroll, height}) {
    for (const group of groups.values()) {
      if (!group.active) continue;
      const center = group.top - scroll + group.height / 2;
      // Enter from the bottom with 8px extra line spacing. At the middle,
      // every line reaches its original position without moving the page.
      const progress = clamp((height - center) / Math.max(1, height / 2));
      const spread = reduced.matches ? '0px' : `${(8 * (1 - progress)).toFixed(3)}px`;
      if (spread !== group.spread) {
        group.owner.style.setProperty('--text-line-spread', spread);
        group.spread = spread;
      }
    }
  }
  engine.subscribe({measure, paint});
  reduced.addEventListener('change', engine.invalidate);
  document.fonts?.ready.then(engine.invalidate);
})();
