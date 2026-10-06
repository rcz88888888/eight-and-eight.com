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
  const beams=[];
  function element(tag,attributes) {
    const node=document.createElementNS(ns,tag);
    for(const [key,value] of Object.entries(attributes))node.setAttribute(key,value);
    return node;
  }
  // Six vertical highlights: upper curl, upper right, left dots,
  // right dots, lower left curl and lower right curl (reference photo).
  const halves=[
    [[405,255,170,300],[185,615,180,330],[345,1050,170,340]],
    [[680,345,170,330],[755,710,175,330],[575,1080,175,310]]
  ];
  halves.forEach((positions,side)=>{
    const layer=element('g',{'class':`start-reflection-layer start-reflection-${side?'right':'left'}`});
    layer.style.opacity='var(--opening-alpha,0)';
    positions.forEach(([x,y,rx,ry],index)=>{
      const id=`start-reflection-${side}-${index}`;
      const gradient=element('radialGradient',{id,gradientUnits:'userSpaceOnUse',cx:0,cy:0,r:1});
      for(const [offset,opacity] of [[0,1],[.12,1],[.3,.85],[.6,.38],[.82,.1],[1,0]])
        gradient.append(element('stop',{offset,'stop-color':'#fffdf3','stop-opacity':opacity}));
      defs.append(gradient);
      const clipped=element('g',{mask:'url(#hero-paper-shape)'});
      const rect=element('rect',{width:922,height:1368,fill:`url(#${id})`,mask:source?.getAttribute('mask') || 'none'});
      clipped.append(rect);layer.append(clipped);
      if(border){
        const rim=border.cloneNode(true);
        rim.setAttribute('class','start-reflection-rim');
        rim.setAttribute('stroke',`url(#${id})`);layer.append(rim);
      }
      beams.push({id,gradient,x,y,rx,ry,side});
    });
    logo.append(layer);
  });
  let reveal=1;
  engine.subscribe({measure(){
    const box=logo.getBoundingClientRect(),head=header.getBoundingClientRect();
    reveal=Math.max(1,box.bottom+engine.scrollPosition()-head.bottom);
  },paint(state){
    const visible=Math.max(0,Math.min(1,1-state.scroll/reveal));
    const progress=visible*visible*(3-2*visible);
    // Opposite entrances, at rest in the marked locations at scroll zero.
    // Only gradients move: ornament masks and contours never shift.
    const distance=1100*(1-progress);
    for(const beam of beams){
      const transform=`translate(${(beam.x+(beam.side?distance:-distance)).toFixed(2)} ${beam.y}) scale(${beam.rx} ${beam.ry})`;
      for(const gradient of [beam.gradient,document.getElementById('banner-copy-'+beam.id)])
        if(gradient && gradient.getAttribute('gradientTransform')!==transform)
          gradient.setAttribute('gradientTransform',transform);
    }
  }});
})();
