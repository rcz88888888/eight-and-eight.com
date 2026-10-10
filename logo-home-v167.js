(() => {
  const hero=document.querySelector('.hero-wallpaper-logo');
  const home=document.querySelector('.topbar .wordmark');
  if(!hero || !home)return;
  hero.removeAttribute('aria-hidden');hero.setAttribute('focusable','true');
  hero.setAttribute('role','button');hero.setAttribute('tabindex','0');
  hero.setAttribute('aria-label','Back to top');
  hero.style.pointerEvents='auto';hero.style.cursor='pointer';
  hero.addEventListener('click',()=>home.click());
  hero.addEventListener('keydown',event=>{
    if(event.key==='Enter' || event.key===' '){event.preventDefault();home.click();}
  });
})();
