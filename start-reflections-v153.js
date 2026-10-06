(() => {
  'use strict';
  const engine=window.EightEightEffects;
  const logo=document.querySelector('.hero-wallpaper-logo');
  const header=document.querySelector('.topbar');
  if(!engine || !logo || !header)return;
  const ns='http://www.w3.org/2000/svg';
  const defs=logo.querySelector('defs');
  const source=logo.querySelector('g[mask="url(#hero-paper-shape)"] > rect');
  const border=logo.querySelector('.hero-paper-border');
  function element(tag,attributes) {
    const node=document.createElementNS(ns,tag);
    for(const [key,value] of Object.entries(attributes))node.setAttribute(key,value);
    return node;
  }
  // Cache the material silhouette once. All three light planes share its
  // stationary pattern and contour; no contours move with the highlights.
  const material=element('mask',{id:'start-reflection-material',maskUnits:'userSpaceOnUse',
    x:-4,y:-4,width:930,height:1376,style:'mask-type:alpha'});
  const clipped=element('g',{mask:'url(#hero-paper-shape)'});
  clipped.append(element('rect',{width:922,height:1368,fill:'#fff',
    mask:source?.getAttribute('mask') || 'none'}));
  material.append(clipped);
  if(border) {
    const rim=border.cloneNode(true);
    rim.setAttribute('class','start-reflection-material-rim');
    rim.setAttribute('stroke','#fff');material.append(rim);
  }
  defs.append(material);
  const planes=[];
  // Two planes contain the previous three highlights each. The third
  // contains two brighter highlights at the marked left/right dot groups.
  for(const side of ['left','right','top']) {
    const layer=element('g',{'class':`start-reflection-layer start-reflection-${side}`,
      mask:'url(#start-reflection-material)'});
    layer.style.opacity=side==='top'?'calc(var(--opening-alpha,0) * 1.18)':'var(--opening-alpha,0)';
    const image=element('image',{id:`start-reflection-paint-${side}`,
      href:`start-reflections-${side}-v153.png`,width:922,height:1368});
    layer.append(image);logo.append(layer);
    planes.push({side,image,copy:null,last:'',copyLast:''});
  }
  let reveal=1,projectionsReady=false;
  engine.subscribe({measure(){
    const box=logo.getBoundingClientRect(),head=header.getBoundingClientRect();
    reveal=Math.max(1,box.bottom+engine.scrollPosition()-head.bottom);
    projectionsReady=false;
  },paint(state){
    if(!projectionsReady) {
      for(const plane of planes){
        plane.copy=document.getElementById('banner-copy-start-reflection-paint-'+plane.side);
        plane.copyLast='';
      }
      projectionsReady=planes.every(plane=>plane.copy);
    }
    const scroll=state.lightScroll ?? state.scroll;
    const visible=Math.max(0,Math.min(1,1-scroll/reveal));
    const progress=visible*visible*(3-2*visible);
    const distance=1100*(1-progress),up=1600*(1-progress);
    for(const plane of planes){
      const transform=plane.side==='top'?`translate(0 ${(-up).toFixed(2)})`:
        `translate(${(plane.side==='left'?-distance:distance).toFixed(2)} 0)`;
      if(plane.last!==transform){plane.image.setAttribute('transform',transform);plane.last=transform;}
      if(plane.copy && plane.copyLast!==transform){plane.copy.setAttribute('transform',transform);plane.copyLast=transform;}
    }
  }});
})();
