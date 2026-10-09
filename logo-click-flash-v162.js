(() => {
  'use strict';
  const hero=document.querySelector('.hero-wallpaper-logo');
  const home=document.querySelector('.topbar .wordmark');
  if(!hero || !home)return;
  const NS='http://www.w3.org/2000/svg';
  let previous=-1, serial=0, current;
  const svgNode=(name,attrs)=>{
    const node=document.createElementNS(NS,name);
    Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,String(value)));
    return node;
  };
  function flash() {
    current?.remove();
    const box=hero.getBoundingClientRect(),style=getComputedStyle(hero);
    if(!box.width || !box.height)return;
    let direction=Math.floor(Math.random()*7);
    if(direction>=previous)direction++;
    if(previous<0)direction=Math.floor(Math.random()*8);
    previous=direction;
    const angle=direction*Math.PI/4;
    const prefix=`flash-${++serial}-`;
    const screen=document.createElement('div');
    screen.className='logo-click-flash';screen.setAttribute('aria-hidden','true');
    screen.style.setProperty('--flash-angle',`${direction*45}deg`);
    const copy=hero.cloneNode(true);
    copy.removeAttribute('class');copy.removeAttribute('tabindex');copy.removeAttribute('role');
    copy.setAttribute('aria-hidden','true');
    copy.querySelectorAll('[id]').forEach(node=>node.id=prefix+node.id);
    copy.querySelectorAll('*').forEach(node=>{
      for(const attr of [...node.attributes]){
        if(attr.value.includes('url(#'))node.setAttribute(attr.name,attr.value.replace(/url\(#([^)]*)\)/g,(_,id)=>`url(#${prefix}${id})`));
      }
    });
    Object.assign(copy.style,{
      position:'absolute',left:`${box.left+box.width/2}px`,top:`${box.top+box.height/2}px`,
      width:`${hero.clientWidth}px`,height:`${hero.clientHeight}px`,
      transform:`translate(-50%,-50%) rotate(${style.getPropertyValue('--hero-idle-angle').trim() || '0rad'})`,rotate:'none',
      transformOrigin:'50% 50%',transformBox:'border-box',overflow:'visible',pointerEvents:'none'
    });
    copy.style.setProperty('--hero-border-width',style.getPropertyValue('--hero-border-width') || '1.5px');
    const defs=copy.querySelector('defs');
    const gradient=svgNode('linearGradient',{
      id:prefix+'reflection',x1:.5-Math.cos(angle)/2,y1:.5-Math.sin(angle)/2,
      x2:.5+Math.cos(angle)/2,y2:.5+Math.sin(angle)/2
    });
    for(const [offset,opacity] of [[0,0],[.2,0],[.29,.98],[.34,0],[.53,0],[.6,1],[.65,0],[.82,.8],[.88,0],[1,0]]){
      gradient.append(svgNode('stop',{offset,'stop-color':'#fffef6','stop-opacity':opacity}));
    }
    defs.append(gradient);
    const material=copy.querySelector(':scope > g[mask]');
    if(material){
      const reflection=material.cloneNode(true);
      reflection.querySelectorAll('rect').forEach(node=>node.setAttribute('fill',`url(#${prefix}reflection)`));
      copy.append(reflection);
    }
    const rim=copy.querySelector('.hero-paper-border');
    if(rim){
      const shine=rim.cloneNode(true);shine.setAttribute('stroke',`url(#${prefix}reflection)`);
      shine.style.strokeWidth=style.getPropertyValue('--hero-border-width') || '1.5px';
      copy.append(shine);
    }
    screen.append(copy);document.body.append(screen);current=screen;
    // A single, click-triggered 80ms flash; no timer loop or persistent light.
    const animation=screen.animate([{opacity:1},{opacity:1},{opacity:0}],{
      duration:80,fill:'forwards',easing:'linear'
    });
    animation.onfinish=()=>{screen.remove();if(current===screen)current=undefined;};
  }
  window.addEventListener('eight-eight-home-flash',flash);
  hero.removeAttribute('aria-hidden');hero.setAttribute('focusable','true');
  hero.setAttribute('role','button');hero.setAttribute('tabindex','0');
  hero.setAttribute('aria-label','Back to top');
  hero.style.pointerEvents='auto';hero.style.cursor='pointer';
  hero.addEventListener('click',()=>home.click());
  hero.addEventListener('keydown',event=>{
    if(event.key==='Enter' || event.key===' '){event.preventDefault();home.click();}
  });
})();
