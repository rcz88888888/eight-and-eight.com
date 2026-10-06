(() => {
  'use strict';
  const engine=window.EightEightEffects,root=document.documentElement;
  const logo=document.querySelector('.hero-wallpaper-logo'),header=document.querySelector('.topbar');
  const bannerMask=document.querySelector('.banner-content-mask');
  const footer=document.querySelector('.wallpaper-end');
  if(!engine || !logo) return;
  const ns='http://www.w3.org/2000/svg';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const gradient=document.createElementNS(ns,'radialGradient');
  gradient.id='hero-random-light';
  gradient.setAttribute('gradientUnits','userSpaceOnUse');
  for(const [offset,alpha] of [[0,1],[.3,.8],[.65,.25],[1,0]]) {
    const stop=document.createElementNS(ns,'stop');
    stop.setAttribute('offset',offset);stop.setAttribute('stop-color','#fffef8');
    stop.setAttribute('stop-opacity',alpha);gradient.append(stop);
  }
  logo.querySelector('defs').append(gradient);
  const glow=document.createElementNS(ns,'g');
  glow.setAttribute('mask','url(#hero-paper-shape)');
  glow.style.opacity='var(--logo-random-alpha, 0)';
  const surface=document.createElementNS(ns,'rect');
  surface.setAttribute('width',922);surface.setAttribute('height',1368);
  surface.setAttribute('fill','url(#hero-random-light)');glow.append(surface);logo.append(glow);
  let centerX=0,centerY=0,rx=0,ry=0,revealScroll=1,amount=0,scroll=0;
  let logoTop=0,projection,projectedGradient;
  let raf=0,lastFrame=0,elapsed=0,duration=8;
  const cached=new Map();
  function property(name,value){if(cached.get(name)===value)return;cached.set(name,value);root.style.setProperty(name,value);}
  // All centres and radii remain inside the previously defined opening area.
  function target(previous) {
    let next;
    do {next={x:240+Math.random()*442,y:320+Math.random()*700,r:140+Math.random()*230,strength:.25+Math.random()*.65};}
    while(previous && Math.hypot(next.x-previous.x,next.y-previous.y)<150);
    return next;
  }
  const points=[target()];
  while(points.length<4)points.push(target(points[points.length-1]));
  function paintLight(p) {
    // A cubic B-spline never stops at random control points. Its position,
    // velocity and acceleration stay continuous across every segment.
    // Positive weights keep width, opacity and position inside their bounds.
    const t=Math.min(1,Math.max(0,p)),t2=t*t,t3=t2*t;
    const weights=[(1-t)**3/6,(3*t3-6*t2+4)/6,(-3*t3+3*t2+3*t+1)/6,t3/6];
    const mix=key=>points.reduce((sum,point,i)=>sum+weights[i]*point[key],0);
    for(const g of [gradient,projectedGradient]) if(g) {
      g.setAttribute('cx',mix('x').toFixed(2));g.setAttribute('cy',mix('y').toFixed(2));
      g.setAttribute('r',mix('r').toFixed(2));
    }
    const random=.48*amount*mix('strength');
    property('--logo-random-alpha',random.toFixed(5));
    // Splitting the light budget keeps combined opacity at or below 48%.
    property('--logo-base-alpha',Math.max(0,.48*amount-random).toFixed(5));
  }
  function tick(time) {
    raf=0;if(document.hidden || reduced.matches || amount===0){lastFrame=0;return;}
    if(!lastFrame)lastFrame=time;
    const dt=Math.min(.1,(time-lastFrame)/1000);
    if(time-lastFrame>=1000/30-1) {
      elapsed+=dt;lastFrame=time;
      while(elapsed>=duration){elapsed-=duration;points.shift();points.push(target(points[points.length-1]));}
      paintLight(elapsed/duration);
    }
    raf=requestAnimationFrame(tick);
  }
  function schedule(){if(!raf && !document.hidden && !reduced.matches && amount>0)raf=requestAnimationFrame(tick);}
  function projectLogo(box) {
    if(!bannerMask)return;
    const copy=logo.cloneNode(true);
    copy.setAttribute('class','banner-startlogo-projection');copy.setAttribute('aria-hidden','true');
    for(const node of [copy,...copy.querySelectorAll('*')]) {
      for(const attr of [...node.attributes]) {
        if(attr.name==='id')node.setAttribute('id','banner-copy-'+attr.value);
        else if(attr.value.includes('url(#'))node.setAttribute(attr.name,attr.value.replace(/url\(#/g,'url(#banner-copy-'));
      }
    }
    copy.style.cssText=`position:absolute;left:${box.left}px;top:0;width:${box.width}px;height:${box.height}px;pointer-events:none;overflow:hidden;--hero-border-width:${getComputedStyle(logo).getPropertyValue('--hero-border-width')};`;
    projection?.remove();bannerMask.append(copy);projection=copy;
    projectedGradient=copy.querySelector('#banner-copy-hero-random-light');
  }
  engine.subscribe({measure(){
    const box=logo.getBoundingClientRect();scroll=engine.scrollPosition();
    const headerBox=header?.getBoundingClientRect();
    centerX=box.left+box.width/2;centerY=box.top+scroll+box.height/2;logoTop=box.top+scroll;
    rx=Math.max(root.clientWidth*.86,box.width*.92);ry=box.height*.95;
    revealScroll=Math.max(1,box.bottom+scroll-(headerBox?.height || 0));
    property('--banner-light-x',(centerX-(headerBox?.left || 0)).toFixed(2)+'px');
    property('--banner-light-y',(centerY-scroll-(headerBox?.top || 0)).toFixed(2)+'px');
    if(footer){const f=footer.getBoundingClientRect();property('--footer-light-x',(centerX-f.left).toFixed(2)+'px');property('--footer-light-y',(centerY-f.top-scroll).toFixed(2)+'px');}
    projectLogo(box);
  },paint(state){
    scroll=state.scroll;
    const t=Math.min(1,Math.max(0,1-scroll/revealScroll));amount=t*t*(3-2*t);
    property('--start-light-alpha',(.48*amount).toFixed(5));
    property('--start-light-x',centerX.toFixed(2)+'px');property('--start-light-y',(centerY-scroll).toFixed(2)+'px');
    property('--banner-light-y',(centerY-scroll).toFixed(2)+'px');
    property('--start-light-rx',rx.toFixed(2)+'px');property('--start-light-ry',ry.toFixed(2)+'px');
    if(projection)projection.style.transform=`translate3d(0,${(logoTop-scroll).toFixed(2)}px,0)`;
    paintLight(elapsed/duration);schedule();
  }});
  document.addEventListener('visibilitychange',()=>{lastFrame=0;schedule();});
  reduced.addEventListener('change',()=>{lastFrame=0;schedule();});
})();
