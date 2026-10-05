(() => {
  'use strict';
  const engine=window.EightEightEffects,root=document.documentElement;
  const logo=document.querySelector('.hero-wallpaper-logo'),header=document.querySelector('.topbar');
  if(!engine || !logo) return;
  let centerX=0,centerY=0,rx=0,ry=0,revealScroll=1;
  const cached=new Map();
  function property(name,value){if(cached.get(name)===value)return;cached.set(name,value);root.style.setProperty(name,value);}
  engine.subscribe({measure(){
    const box=logo.getBoundingClientRect(),scroll=engine.scrollPosition();
    const headerHeight=header?.getBoundingClientRect().height || 0;
    centerX=box.left+box.width/2;centerY=box.top+scroll+box.height/2;
    rx=Math.max(root.clientWidth*.86,box.width*.92);ry=box.height*.95;
    revealScroll=Math.max(1,box.bottom+scroll-headerHeight);
  },paint(state){
    const t=Math.min(1,Math.max(0,1-state.scroll/revealScroll));
    const amount=t*t*(3-2*t);
    property('--start-light-alpha',(.48*amount).toFixed(5));
    property('--start-light-x',centerX.toFixed(2)+'px');
    property('--start-light-y',(centerY-state.scroll).toFixed(2)+'px');
    property('--start-light-rx',rx.toFixed(2)+'px');
    property('--start-light-ry',ry.toFixed(2)+'px');
  }});
})();
