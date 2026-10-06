(() => {
  'use strict';
  const engine=window.EightEightEffects,root=document.documentElement;
  const logo=document.querySelector('.hero-wallpaper-logo'),header=document.querySelector('.topbar');
  if(!engine || !logo || !header)return;
  const ns='http://www.w3.org/2000/svg';
  const sheen=document.createElementNS(ns,'linearGradient');
  sheen.id='opening-surface-reflection';
  sheen.setAttribute('x1','0%');sheen.setAttribute('y1','0%');
  sheen.setAttribute('x2','100%');sheen.setAttribute('y2','0%');
  for(const [offset,tone] of [[0,'base'],[.2,'base'],[.29,'soft'],[.32,'peak'],[.34,'soft'],[.38,'base'],[.46,'soft'],[.48,'peak'],[.495,'peak'],[.515,'shade'],[.54,'base'],[.64,'soft'],[.68,'peak'],[.71,'soft'],[.79,'base'],[1,'base']]) {
    const stop=document.createElementNS(ns,'stop');stop.setAttribute('offset',offset);
    stop.setAttribute('stop-color',`var(--reflection-${tone})`);sheen.append(stop);
  }
  logo.querySelector('defs').append(sheen);
  for(const surface of logo.querySelectorAll('g[mask="url(#hero-paper-shape)"] > rect'))
    surface.setAttribute('fill','url(#opening-surface-reflection)');
  logo.querySelector('.hero-paper-border')?.setAttribute('stroke','url(#opening-surface-reflection)');
  const circular=[];
  function circleGradient(id,stops) {
    const g=document.createElementNS(ns,'radialGradient');g.id=id;
    g.setAttribute('gradientUnits','userSpaceOnUse');g.setAttribute('cx',0);g.setAttribute('cy',0);g.setAttribute('r',1);
    for(const [offset,opacity] of stops) {
      const stop=document.createElementNS(ns,'stop');stop.setAttribute('offset',offset);
      stop.setAttribute('stop-color','#fffbe8');stop.setAttribute('stop-opacity',opacity);g.append(stop);
    }
    logo.querySelector('defs').append(g);return g;
  }
  const outer=circleGradient('opening-circle-outer',[[0,.6],[.25,.6],[.5,.38],[.75,.12],[1,0]]);
  const core=circleGradient('opening-circle-core',[[0,.95],[.6,.95],[.8,.5],[1,0]]);
  const source=logo.querySelector('g[mask="url(#hero-paper-shape)"] > rect');
  const group=document.createElementNS(ns,'g');group.setAttribute('mask','url(#hero-paper-shape)');
  group.style.opacity='var(--opening-alpha,0)';
  for(const gradient of [outer,core]) {
    const rect=document.createElementNS(ns,'rect');rect.setAttribute('width',922);rect.setAttribute('height',1368);
    rect.setAttribute('fill',`url(#${gradient.id})`);group.append(rect);circular.push(rect);
  }
  logo.append(group);
  const rim=logo.querySelector('.hero-paper-border')?.cloneNode(true);
  if(rim){rim.setAttribute('class','hero-circle-rim');rim.setAttribute('stroke','url(#opening-circle-outer)');rim.style.opacity='var(--opening-alpha,0)';logo.append(rim);}
  let circleX=0,circleY=0,circleRx=0,circleRy=0;
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
    circleX=x+root.clientWidth*.02;circleY=y-box.height*.04;
    circleRx=root.clientWidth*.44;circleRy=box.height*.64;
    property('--circle-rx',circleRx.toFixed(2)+'px');property('--circle-ry',circleRy.toFixed(2)+'px');
    property('--circle-core-rx',(root.clientWidth*.23).toFixed(2)+'px');property('--circle-core-ry',(box.height*.16).toFixed(2)+'px');
    const scale=Math.min(box.width/922,box.height/1368);
    if(scale>0) {
      const left=box.left+(box.width-922*scale)/2,top=box.top+scroll+(box.height-1368*scale)/2;
      const origin=`translate(${(circleX-left)/scale} ${(circleY-top)/scale})`;
      outer.setAttribute('gradientTransform',`${origin} scale(${circleRx/scale} ${circleRy/scale})`);
      core.setAttribute('gradientTransform',`${origin} scale(${root.clientWidth*.23/scale} ${box.height*.16/scale})`);
    }
    for(const rect of circular)rect.setAttribute('mask',source?.getAttribute('mask') || 'none');

    property('--opening-rx',rx.toFixed(2)+'px');property('--opening-ry',ry.toFixed(2)+'px');
    property('--opening-width',root.clientWidth+'px');property('--opening-height',innerHeight+'px');
    property('--opening-banner-offset',(-h.left).toFixed(2)+'px');
    property('--reflection-width',(rx*2).toFixed(2)+'px');property('--reflection-height',(ry*2).toFixed(2)+'px');
    for(const frame of document.querySelectorAll('.gold-frame-light:not(.topbar)')) {
      const f=frame.getBoundingClientRect();
      frame.style.setProperty('--circle-local-x',(circleX-f.left).toFixed(2)+'px');
      frame.style.setProperty('--circle-local-y',(circleY-f.top-scroll).toFixed(2)+'px');
      frame.style.setProperty('--reflection-offset-x',(x-rx-f.left).toFixed(2)+'px');
      frame.style.setProperty('--reflection-offset-y',(y-ry-f.top-scroll).toFixed(2)+'px');
      frame.style.setProperty('--opening-edge-x',(x-f.left).toFixed(2)+'px');
      frame.style.setProperty('--opening-edge-y',(y-f.top-scroll).toFixed(2)+'px');
    }
  },paint(state){
    const visible=Math.min(1,Math.max(0,1-(state.lightScroll ?? state.scroll)/reveal));
    // Light starts as soon as the opening artwork re-enters, then grows to 58%.
    const alpha=.58*Math.pow(visible,.8);
    property('--opening-alpha',alpha.toFixed(5));
    property('--reflection-base',colour(peak,0));
    property('--reflection-soft',colour(peak,alpha*.55));
    property('--reflection-peak',colour(peak,alpha));
    property('--reflection-shade',colour(shade,alpha*.18));
    // Below the opening artwork every light is off. Skip invisible
    // position/style work while the logo rain and native scrolling continue.
    if(alpha===0)return;
    property('--circle-x',circleX.toFixed(2)+'px');property('--circle-y',(circleY-state.scroll).toFixed(2)+'px');
    header.style.setProperty('--circle-local-x',(circleX-headerLeft).toFixed(2)+'px');
    header.style.setProperty('--circle-local-y',(circleY-state.scroll).toFixed(2)+'px');
    property('--opening-x',x.toFixed(2)+'px');property('--opening-y',(y-state.scroll).toFixed(2)+'px');
    header.style.setProperty('--reflection-offset-x',(x-rx-headerLeft).toFixed(2)+'px');
    header.style.setProperty('--reflection-offset-y',(y-ry-state.scroll).toFixed(2)+'px');
    header.style.setProperty('--opening-edge-x',(x-headerLeft).toFixed(2)+'px');
    header.style.setProperty('--opening-edge-y',(y-state.scroll).toFixed(2)+'px');
  }});
})();
