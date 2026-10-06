(() => {
  'use strict';
  const engine=window.EightEightEffects,root=document.documentElement;
  const logo=document.querySelector('.hero-wallpaper-logo'),header=document.querySelector('.topbar');
  if(!engine || !logo || !header)return;
  const ns='http://www.w3.org/2000/svg';
  const sheen=document.createElementNS(ns,'linearGradient');
  sheen.id='opening-surface-reflection';
  sheen.setAttribute('x1','0%');sheen.setAttribute('y1','0%');
  sheen.setAttribute('x2','100%');sheen.setAttribute('y2','34%');
  for(const [offset,tone] of [[0,'base'],[.2,'base'],[.29,'soft'],[.32,'peak'],[.34,'soft'],[.38,'base'],[.46,'soft'],[.48,'peak'],[.495,'peak'],[.515,'shade'],[.54,'base'],[.64,'soft'],[.68,'peak'],[.71,'soft'],[.79,'base'],[1,'base']]) {
    const stop=document.createElementNS(ns,'stop');stop.setAttribute('offset',offset);
    stop.setAttribute('stop-color',`var(--reflection-${tone})`);sheen.append(stop);
  }
  logo.querySelector('defs').append(sheen);
  for(const surface of logo.querySelectorAll('g[mask="url(#hero-paper-shape)"] > rect'))
    surface.setAttribute('fill','url(#opening-surface-reflection)');
  logo.querySelector('.hero-paper-border')?.setAttribute('stroke','url(#opening-surface-reflection)');
  const base=[194,181,148],peak=[255,251,227],shade=[150,134,99];
  const colour=(target,strength)=>'rgb('+base.map((v,i)=>Math.round(v+(target[i]-v)*strength)).join(',')+')';
  let x=0,y=0,rx=0,ry=0,reveal=1,headerLeft=0;
  const cached=new Map();
  function property(name,value){if(cached.get(name)===value)return;cached.set(name,value);root.style.setProperty(name,value);}
  engine.subscribe({measure(){
    const scroll=engine.scrollPosition(),box=logo.getBoundingClientRect(),h=header.getBoundingClientRect();
    x=box.left+box.width/2;y=box.top+scroll+box.height/2;
    rx=Math.max(root.clientWidth*.86,box.width*.92);ry=box.height*.95;
    headerLeft=h.left;reveal=Math.max(1,box.bottom+scroll-h.bottom);
    property('--opening-rx',rx.toFixed(2)+'px');property('--opening-ry',ry.toFixed(2)+'px');
    property('--opening-width',root.clientWidth+'px');property('--opening-height',innerHeight+'px');
    property('--opening-banner-offset',(-h.left).toFixed(2)+'px');
    property('--reflection-width',(rx*2).toFixed(2)+'px');property('--reflection-height',(ry*2).toFixed(2)+'px');
    for(const frame of document.querySelectorAll('.gold-frame-light:not(.topbar)')) {
      const f=frame.getBoundingClientRect();
      frame.style.setProperty('--reflection-offset-x',(x-rx-f.left).toFixed(2)+'px');
      frame.style.setProperty('--reflection-offset-y',(y-ry-f.top-scroll).toFixed(2)+'px');
      frame.style.setProperty('--opening-edge-x',(x-f.left).toFixed(2)+'px');
      frame.style.setProperty('--opening-edge-y',(y-f.top-scroll).toFixed(2)+'px');
    }
  },paint(state){
    const visible=Math.min(1,Math.max(0,1-state.scroll/reveal));
    // Light starts as soon as the opening artwork re-enters, then grows to 68%.
    const alpha=.68*Math.pow(visible,.8);
    property('--opening-alpha',alpha.toFixed(5));
    property('--reflection-base',colour(peak,0));
    property('--reflection-soft',colour(peak,alpha*.55));
    property('--reflection-peak',colour(peak,alpha));
    property('--reflection-shade',colour(shade,alpha*.18));
    property('--opening-x',x.toFixed(2)+'px');property('--opening-y',(y-state.scroll).toFixed(2)+'px');
    header.style.setProperty('--reflection-offset-x',(x-rx-headerLeft).toFixed(2)+'px');
    header.style.setProperty('--reflection-offset-y',(y-ry-state.scroll).toFixed(2)+'px');
    header.style.setProperty('--opening-edge-x',(x-headerLeft).toFixed(2)+'px');
    header.style.setProperty('--opening-edge-y',(y-state.scroll).toFixed(2)+'px');
  }});
})();
