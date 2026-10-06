(() => {
  'use strict';
  const engine=window.EightEightEffects;
  const logo=document.querySelector('.hero-wallpaper-logo');
  const mask=document.querySelector('.banner-content-mask');
  if(!engine || !logo || !mask)return;
  let projection,top=0;
  engine.subscribe({measure(){
    const box=logo.getBoundingClientRect();top=box.top+engine.scrollPosition();
    const copy=logo.cloneNode(true);
    copy.setAttribute('class','banner-startlogo-projection');
    copy.setAttribute('aria-hidden','true');
    for(const node of [copy,...copy.querySelectorAll('*')])for(const attr of [...node.attributes]){
      if(attr.name==='id')node.setAttribute('id','banner-copy-'+attr.value);
      else if(attr.value.includes('url(#'))node.setAttribute(attr.name,attr.value.replace(/url\(#/g,'url(#banner-copy-'));
    }
    copy.style.cssText=`position:absolute;left:${box.left}px;top:0;width:${box.width}px;height:${box.height}px;pointer-events:none;overflow:hidden;--hero-border-width:${getComputedStyle(logo).getPropertyValue('--hero-border-width')};`;
    projection?.remove();mask.append(copy);projection=copy;
  },paint(state){
    if(projection)projection.style.transform=`translate3d(0,${(top-state.scroll).toFixed(2)}px,0)`;
  }});
})();
