(() => {
  'use strict';
  const engine=window.EightEightEffects,root=document.documentElement;
  const logo=document.querySelector('.hero-wallpaper-logo'),header=document.querySelector('.topbar');
  if(!engine || !logo || !header)return;
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
    for(const frame of document.querySelectorAll('.gold-frame-light:not(.topbar)')) {
      const f=frame.getBoundingClientRect();
      frame.style.setProperty('--opening-edge-x',(x-f.left).toFixed(2)+'px');
      frame.style.setProperty('--opening-edge-y',(y-f.top-scroll).toFixed(2)+'px');
    }
  },paint(state){
    const visible=Math.min(1,Math.max(0,1-state.scroll/reveal));
    // Light starts as soon as the opening artwork re-enters, then grows to 48%.
    property('--opening-alpha',(.48*Math.pow(visible,.8)).toFixed(5));
    property('--opening-x',x.toFixed(2)+'px');property('--opening-y',(y-state.scroll).toFixed(2)+'px');
    header.style.setProperty('--opening-edge-x',(x-headerLeft).toFixed(2)+'px');
    header.style.setProperty('--opening-edge-y',(y-state.scroll).toFixed(2)+'px');
  }});
})();
