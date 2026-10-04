(() => {
  'use strict';
  let fallbackStarted=false;
  function startFallback(){if(fallbackStarted)return;fallbackStarted=true;
(() => {
  'use strict';
  const engine = window.EightEightEffects;
  const root = document.documentElement;
  const logo = document.querySelector('.hero-wallpaper-logo');
  const gradient = logo?.querySelector('#random-metal-light');
  if (!engine || !logo || !gradient) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Read geometry only during the existing layout pass. Never move content or scroll.
  const nodes = [...document.querySelectorAll('.gold-light-target, .topbar, .wallpaper-end, .site-nav, .site-nav a')].filter(node => !node.closest('.wordmark, .menu-toggle'));
  let surfaces = [], logoBox, width = innerWidth, height = innerHeight;
  let scroll = engine.scrollPosition(), raf = 0, lastFrame = -Infinity, elapsed = 0, previousTime;
  const between = (a, b) => a + Math.random() * (b - a);
  const choose = () => ({x: between(-.15, 1.15), y: between(-.15, 1.15),
    opacity: between(.12, .86), rx: between(.22, .65), ry: between(.25, .9)});
  let from = choose(), to = choose(), duration = between(4000, 14000);
  const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);
  const interpolate = (a, b, t) => a + (b - a) * t;
  const property = (element, key, value) => element.style.setProperty(key, value);
  function draw() {
    const t = smooth(Math.min(1, elapsed / duration));
    const light = Object.fromEntries(Object.keys(from).map(key => [key, interpolate(from[key], to[key], t)]));
    const opening = .88 * Math.max(0, 1 - Math.max(0, scroll) / 88);
    property(root, '--opening-light-opacity', opening.toFixed(4));
    property(root, '--random-metal-opacity', light.opacity.toFixed(4));
    const x = light.x * width, y = light.y * height;
    const rx = light.rx * width, ry = light.ry * height;
    for (const item of surfaces) {
      const top = item.top - (item.fixed ? 0 : scroll);
      if (top > height + ry || top + item.height < -ry) continue;
      property(item.node, '--metal-x', `${(x - item.left).toFixed(2)}px`);
      property(item.node, '--metal-y', `${(y - top).toFixed(2)}px`);
      property(item.node, '--metal-rx', `${rx.toFixed(2)}px`);
      property(item.node, '--metal-ry', `${ry.toFixed(2)}px`);
      property(item.node, '--opening-x', `${(width * .5 - item.left).toFixed(2)}px`);
      property(item.node, '--opening-y', `${(height * .82 - top).toFixed(2)}px`);
      property(item.node, '--opening-rx', `${width * .75}px`);
      property(item.node, '--opening-ry', `${height * .42}px`);
    }
    if (logoBox?.scale > 0) {
      const lx = (x - logoBox.left) / logoBox.scale;
      const ly = (y - logoBox.top + scroll) / logoBox.scale;
      gradient.setAttribute('gradientTransform', `translate(${lx.toFixed(2)} ${ly.toFixed(2)}) scale(${(rx / logoBox.scale).toFixed(2)} ${(ry / logoBox.scale).toFixed(2)})`);
    }
  }
  engine.subscribe({measure() {
    width = innerWidth; height = innerHeight; scroll = engine.scrollPosition();
    surfaces = nodes.map(node => {
      const box = node.getBoundingClientRect();
      const fixed = node.matches('.topbar, .site-nav') || !!node.closest('.topbar, .site-nav');
      return {node, fixed, left: box.left, top: box.top + (fixed ? 0 : scroll), height: box.height};
    });
    const box = logo.getBoundingClientRect();
    const scale = Math.min(box.width / 922, box.height / 1368);
    logoBox = {scale, left: box.left + (box.width - 922 * scale) / 2,
      top: box.top + scroll + (box.height - 1368 * scale) / 2};
  }, paint(state) { scroll = state.scroll; draw(); }});
  function tick(time) {
    raf = 0;
    if (document.hidden || reduced.matches) { previousTime = undefined; return; }
    if (time - lastFrame >= 1000 / 30) {
      if (previousTime !== undefined) elapsed += Math.min(100, time - previousTime);
      previousTime = time; lastFrame = time;
      if (elapsed >= duration) { from = to; to = choose(); elapsed = 0; duration = between(4000, 14000); }
      draw();
    }
    raf = requestAnimationFrame(tick);
  }
  function resume() {
    previousTime = undefined;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (!document.hidden && !reduced.matches) raf = requestAnimationFrame(tick);
    engine.schedule();
  }
  document.addEventListener('visibilitychange', resume);
  reduced.addEventListener('change', resume);
  resume();
})();

  }
  const engine = window.EightEightEffects;
  const root = document.documentElement;
  const shell = document.querySelector('.site-shell');
  const header = document.querySelector('.topbar');
  const nav = document.querySelector('.site-nav');
  const logo = document.querySelector('.hero-wallpaper-logo');
  const heading = document.querySelector('#about h1, #about h2, [data-display-id="about"] h1');
  if (!engine || !shell || !header || !logo) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'metal-material-plane'; canvas.setAttribute('aria-hidden', 'true');
  // The material plane contains only contour/pattern pixels, never glyphs or company images.
  const gl = canvas.getContext('webgl', {alpha: true, premultipliedAlpha: false,
    antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true});
  if (!gl) {startFallback();return;} // Native gold/CSS surfaces remain as a complete fallback.
  const vertex = `attribute vec2 position; varying vec2 uv;
    void main(){uv=vec2(position.x*.5+.5,.5-position.y*.5);gl_Position=vec4(position,0.,1.);}`;
  const fragment = `precision highp float;
varying vec2 uv;
uniform sampler2D surfaceMask;
uniform vec2 resolution;
uniform vec4 logoBox;
uniform vec4 openingField;
uniform float opening;
uniform vec4 light;
uniform vec2 spread;
uniform float lightAngle;
const float PI=3.14159265359;
vec3 toLinear(vec3 c){return pow(c,vec3(2.2));}
vec3 toSRGB(vec3 c){return pow(max(c,vec3(0.0)),vec3(1.0/2.2));}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 ggx(vec3 n, vec3 l, vec3 f0, float rough){
 vec3 v=vec3(0.,0.,1.);vec3 h=normalize(l+v);
 float nl=max(dot(n,l),0.001),nv=max(n.z,0.001),nh=max(dot(n,h),0.);
 float a=rough*rough,a2=a*a;
 float d=a2/(PI*pow(nh*nh*(a2-1.)+1.,2.));
 float k=pow(rough+1.,2.)/8.;
 float g=(nl/(nl*(1.-k)+k))*(nv/(nv*(1.-k)+k));
 vec3 f=f0+(1.-f0)*pow(1.-max(dot(v,h),0.),5.);
 return f*d*g/(4.*nv)*.3;
}
void main(){
 vec4 mask=texture2D(surfaceMask,uv);
 if(mask.a<.003){gl_FragColor=vec4(0.);return;}
 vec2 p=uv*resolution;
 vec3 base=toLinear(vec3(215.,193.,147.)/255.);
 float ellipse=length((p-openingField.xy)/openingField.zw);
 float start=opening*(1.-smoothstep(.70,1.0,ellipse));
 // The entire opening logo receives light, while its reflection still has shape.
 start=max(start,opening*mask.g*.56);
 vec2 delta=p-light.xy;
 float ca=cos(lightAngle),sa=sin(lightAngle);
 vec2 rotated=vec2(ca*delta.x+sa*delta.y,-sa*delta.x+ca*delta.y);
 float moving=light.z*(1.-smoothstep(.18,1.,length(rotated/spread)));
 float strength=max(start,moving);
 vec2 texel=1./resolution;
 float dx=texture2D(surfaceMask,uv+vec2(texel.x,0.)).a-texture2D(surfaceMask,uv-vec2(texel.x,0.)).a;
 float dy=texture2D(surfaceMask,uv+vec2(0.,texel.y)).a-texture2D(surfaceMask,uv-vec2(0.,texel.y)).a;
 vec2 local=(p-logoBox.xy)/max(logoBox.zw,vec2(1.));
 // Slightly crowned sheet and raised ornament edges, with subpixel metal grain.
 vec2 crown=vec2(sin(local.x*PI*2.4+local.y*PI*1.6),cos(local.y*PI*2.1-local.x*PI))*.38*mask.g;
 float grain=(hash(floor(p*2.))-0.5)*.004;
 vec3 normal=normalize(vec3(crown-vec2(dx,dy)*.48+vec2(grain,grain*.35),1.));
 float rough=.27+hash(floor(p*3.))*.01;
 vec3 l0=normalize(vec3((openingField.xy-p)/max(resolution.x,resolution.y)*.42,1.));
 vec3 l1=normalize(vec3((light.xy-p)/max(resolution.x,resolution.y)*.65,light.w));
 vec3 spec=ggx(normal,l0,base,rough)*start+ggx(normal,l1,base,rough)*moving;
 // Broad reflected studio window and a fine warm specular shoulder.
 float reflected=dot(normal,normalize(vec3(-.32,.12,1.)));
 float windowLight=exp(-pow((reflected-.973)/.016,2.));
 float fine=exp(-pow((reflected-.994)/.0045,2.));
 vec3 ambient=base*(.59+.30*max(dot(normal,l0),0.));
 ambient+=base*windowLight*.48+vec3(.22,.20,.15)*fine*.65;
 vec3 lit=mix(base,ambient,strength)+spec*1.8;
 // Soft shoulder avoids clipping white; unlit material remains the exact base gold.
 vec3 excess=max(lit-base,vec3(0.));
 vec3 result=min(lit,base)+excess/(vec3(1.)+excess*.80);
 gl_FragColor=vec4(toSRGB(result),mask.a);
}
`;
  function shader(type, source) {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
    return s;
  }
  const vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) {startFallback();return;}
  const program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs);
  gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {startFallback();return;}
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniform = Object.fromEntries(['surfaceMask','resolution','logoBox','openingField','opening','light','spread','lightAngle'].map(key=>[key,gl.getUniformLocation(program,key)]));
  const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
  for (const [name,value] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],
      [gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D,name,value);
  gl.uniform1i(uniform.surfaceMask,0);
  const mask = document.createElement('canvas'), ctx = mask.getContext('2d');
  const hero = document.createElement('canvas'), heroCtx = hero.getContext('2d');
  const headerCanvas = document.createElement('canvas'), headerCtx = headerCanvas.getContext('2d');
  headerCanvas.className='metal-banner-material'; headerCanvas.setAttribute('aria-hidden','true');
  const navCanvas = document.createElement('canvas'), navCtx = navCanvas.getContext('2d');
  navCanvas.className='metal-nav-material'; navCanvas.setAttribute('aria-hidden','true');
  if (!ctx || !heroCtx || !headerCtx || !navCtx) {startFallback();return;}
  shell.appendChild(canvas); header.appendChild(headerCanvas); nav?.prepend(navCanvas);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const source=new Image(); source.decoding='async'; source.src='wallpaper-ornament-mask-v45.png';
  let blueTile, greenTile, frames=[], banners=[], logoBox, headBox, navBox;
  let width=innerWidth,height=innerHeight,ratio=1,scroll=engine.scrollPosition(),field;
  let raf=0,lastTime,elapsed=0,lastDraw=-Infinity,dirty=true,ready=false,contextLost=false;
  const between=(a,b)=>a+Math.random()*(b-a);
  const choose=()=>({x:between(-.1,1.1),y:between(-.1,1.1),strength:between(.12,.86),
    rx:between(.22,.62),ry:between(.3,.85),angle:between(-Math.PI,Math.PI),z:between(.8,1.8)});
  let from=choose(),to=choose(),duration=between(5000,16000);
  const smooth=t=>t*t*t*(t*(t*6-15)+10);
  function tint(color) {
    const c=document.createElement('canvas');c.width=source.width;c.height=source.height;
    const x=c.getContext('2d');x.drawImage(source,0,0);x.globalCompositeOperation='source-in';
    x.fillStyle=color;x.fillRect(0,0,c.width,c.height);return c;
  }
  function tilePattern(context, image, tile, x, y) {
    const pattern=context.createPattern(image,'repeat');
    pattern.setTransform(new DOMMatrix().translate(x,y).scale(tile/image.width));return pattern;
  }
  const shape=new Path2D();
  logo.querySelectorAll('#hero-paper-shape path').forEach(p=>shape.addPath(new Path2D(p.getAttribute('d'))));
  logo.querySelectorAll('#hero-paper-shape ellipse').forEach(e=>{
    const cx=+e.getAttribute('cx'),cy=+e.getAttribute('cy'),rx=+e.getAttribute('rx'),ry=+e.getAttribute('ry');
    const rotation=parseFloat((e.getAttribute('transform')||'').match(/rotate\(\s*([-\d.]+)/)?.[1]||0)*Math.PI/180;
    shape.moveTo(cx+Math.cos(rotation)*rx,cy+Math.sin(rotation)*rx);
    shape.ellipse(cx,cy,rx,ry,rotation,0,Math.PI*2);shape.closePath();
  });
  function cacheHero() {
    if(!greenTile || !logoBox?.scale) return;
    hero.width=Math.max(1,Math.ceil(logoBox.width*ratio));hero.height=Math.max(1,Math.ceil(logoBox.height*ratio));
    const scale=logoBox.scale;heroCtx.setTransform(ratio*scale,0,0,ratio*scale,0,0);
    heroCtx.fillStyle='rgba(0,255,0,.58)';heroCtx.fill(shape,'evenodd');
    heroCtx.save();heroCtx.clip(shape,'evenodd');
    const pattern=logo.querySelector('#hero-paper-pattern');const tile=+pattern.getAttribute('width');
    heroCtx.fillStyle=tilePattern(heroCtx,greenTile,tile,+pattern.getAttribute('x'),0);
    heroCtx.fillRect(0,0,922,1368);
    heroCtx.restore();heroCtx.strokeStyle='#00ff00';
    heroCtx.lineWidth=logoBox.border/scale;heroCtx.lineJoin='round';heroCtx.stroke(shape);
  }
  function rounded(path,x,y,w,h,radii) {
    if(w<=0 || h<=0) return;
    const [a,b,c,d]=radii.map(r=>Math.max(0,Math.min(r,w/2,h/2)));
    path.moveTo(x+a,y);path.lineTo(x+w-b,y);path.quadraticCurveTo(x+w,y,x+w,y+b);
    path.lineTo(x+w,y+h-c);path.quadraticCurveTo(x+w,y+h,x+w-c,y+h);
    path.lineTo(x+d,y+h);path.quadraticCurveTo(x,y+h,x,y+h-d);
    path.lineTo(x,y+a);path.quadraticCurveTo(x,y,x+a,y);path.closePath();
  }
  function drawFrame(item) {
    const y=item.top-(item.fixed?0:scroll);
    if(y>height+2 || y+item.height<-2) return;
    const [t,r,b,l]=item.edges,path=new Path2D();
    rounded(path,item.left,y,item.width,item.height,item.radii);
    rounded(path,item.left+l,y+t,item.width-l-r,item.height-t-b,
      item.radii.map((v,i)=>Math.max(0,v-([Math.max(t,l),Math.max(t,r),Math.max(b,r),Math.max(b,l)][i]))));
    ctx.fillStyle='#ff0000';ctx.fill(path,'evenodd');
  }
  function buildMask() {
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,mask.width,mask.height);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    for(const item of frames) drawFrame(item);
    if(logoBox && logoBox.top-scroll<height && logoBox.top-scroll+logoBox.height>headBox.height){
      ctx.save();ctx.beginPath();ctx.rect(0,headBox.height,width,height);ctx.clip();
      ctx.drawImage(hero,logoBox.left,logoBox.top-scroll,logoBox.width,logoBox.height);ctx.restore();
    }
    for(const banner of banners){
      const y=banner.top-(banner.fixed?0:scroll);if(y>height || y+banner.height<0) continue;
      ctx.fillStyle=tilePattern(ctx,blueTile,banner.tile,(width-banner.tile)/2,y+banner.offset);
      ctx.fillRect(banner.left,y,banner.width,banner.height);
    }
    // Header/menu rules remain full width, with exactly the native border thickness.
    ctx.fillStyle='#ff0000';
    if(headBox.border>0)ctx.fillRect(headBox.left,headBox.height-headBox.border,headBox.width,headBox.border);
    if(navBox?.visible)ctx.fillRect(navBox.left,navBox.top+navBox.height-navBox.border,navBox.width,navBox.border);
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,mask);dirty=false;
  }
  function copyReceiver(target,context,box) {
    if(!box?.visible && target===navCanvas){target.style.display='none';return;}
    target.style.display='block';const w=Math.ceil(box.width*ratio),h=Math.ceil(box.height*ratio);
    if(target.width!==w)target.width=w;if(target.height!==h)target.height=h;
    target.style.width=`${box.width}px`;target.style.height=`${box.height}px`;
    context.clearRect(0,0,w,h);context.drawImage(canvas,box.left*ratio,box.top*ratio,
      box.width*ratio,box.height*ratio,0,0,w,h);
  }
  function draw() {
    if(!blueTile || !field || !logoBox || contextLost) return;
    if(dirty)buildMask();
    const t=smooth(Math.min(1,elapsed/duration)),state={};
    for(const key of Object.keys(from))state[key]=from[key]+(to[key]-from[key])*t;
    const opening=.88*Math.max(0,1-Math.max(0,scroll)/88);
    gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);
    gl.uniform2f(uniform.resolution,width,height);
    gl.uniform4f(uniform.logoBox,logoBox.left,logoBox.top-scroll,logoBox.width,logoBox.height);
    gl.uniform4f(uniform.openingField,field.x,field.y,field.rx,field.ry);
    gl.uniform1f(uniform.opening,opening);
    gl.uniform4f(uniform.light,state.x*width,state.y*height,state.strength,state.z);
    gl.uniform2f(uniform.spread,state.rx*width,state.ry*height);
    gl.uniform1f(uniform.lightAngle,state.angle);gl.drawArrays(gl.TRIANGLES,0,6);
    copyReceiver(headerCanvas,headerCtx,headBox);if(nav)copyReceiver(navCanvas,navCtx,navBox);
    if(!ready){root.classList.add('metal-material-ready');ready=true;}
  }
  engine.subscribe({measure() {
    width=innerWidth;height=innerHeight;scroll=engine.scrollPosition();ratio=Math.min(devicePixelRatio||1,1.5);
    const w=Math.ceil(width*ratio),h=Math.ceil(height*ratio);
    if(canvas.width!==w || canvas.height!==h){canvas.width=mask.width=w;canvas.height=mask.height=h;}
    canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
    const nodes=[...document.querySelectorAll('.gold-frame-light')];
    frames=nodes.filter(node=>!node.matches('.topbar, .site-nav')).map(node=>{
      const box=node.getBoundingClientRect(),style=getComputedStyle(node);
      return{left:box.left,top:box.top+scroll,width:box.width,height:box.height,fixed:false,
        edges:['Top','Right','Bottom','Left'].map(e=>parseFloat(style[`border${e}Width`])||0),
        radii:['TopLeft','TopRight','BottomRight','BottomLeft'].map(e=>parseFloat(style[`border${e}Radius`])||0)};
    });
    const hb=header.getBoundingClientRect(),hs=getComputedStyle(header);
    headBox={left:hb.left,top:0,width:hb.width,height:hb.height,border:parseFloat(hs.borderBottomWidth)||0};
    const nb=nav?.getBoundingClientRect();const expanded=header.classList.contains('menu-expanded');
    navBox=nb?{left:nb.left,top:nb.top,width:nb.width,height:nb.height,visible:expanded&&nb.height>0,
      border:matchMedia('(orientation: landscape)').matches ? .8 : 1.5}:{visible:false};
    const headerPattern=getComputedStyle(header,'::before');
    const tile=parseFloat(headerPattern.maskSize||headerPattern.webkitMaskSize)||260;
    const offset=parseFloat((headerPattern.maskPosition||headerPattern.webkitMaskPosition||'center -70px').split(' ').pop())||-70;
    banners=[{left:hb.left,top:0,width:hb.width,height:hb.height+(navBox.visible?navBox.height:0),fixed:true,tile,offset}];
    const bottom=document.querySelector('.wallpaper-end');if(bottom){
      const bb=bottom.getBoundingClientRect(),bs=getComputedStyle(bottom,'::before');
      const bt=parseFloat(bs.maskSize||bs.webkitMaskSize)||tile;
      banners.push({left:bb.left,top:bb.top+scroll,width:bb.width,height:bb.height,fixed:false,tile:bt,offset:(bb.height-bt)/2});
    }
    const lb=logo.getBoundingClientRect(),scale=Math.min(lb.width/922,lb.height/1368);
    logoBox={left:lb.left+(lb.width-922*scale)/2,top:lb.top+scroll+(lb.height-1368*scale)/2,
      width:922*scale,height:1368*scale,scale,border:parseFloat(hs.borderBottomWidth)||(matchMedia('(orientation: landscape)').matches ? .8 : 1.5)};
    const last=heading?.getBoundingClientRect();
    const bottomY=last?last.bottom+scroll+12:logoBox.top+logoBox.height+hb.height*2.4;
    // Traced envelope: banner upper arc through the complete logo to the first heading.
    field={x:width*.5,y:bottomY*.46,rx:width*.72,ry:bottomY*.54};
    canvas.style.clipPath=`inset(${hb.height+(navBox.visible?navBox.height:0)}px 0 0)`;
    cacheHero();dirty=true;
  },paint(state){if(scroll!==state.scroll){scroll=state.scroll;dirty=true;}draw();}});
  function tick(time){
    raf=0;if(document.hidden || reduced.matches || contextLost){lastTime=undefined;return;}
    if(time-lastDraw>=1000/30){
      if(lastTime!==undefined)elapsed+=Math.min(100,time-lastTime);lastTime=time;lastDraw=time;
      if(elapsed>=duration){from=to;to=choose();elapsed=0;duration=between(5000,16000);}draw();
    }
    raf=requestAnimationFrame(tick);
  }
  function resume(){lastTime=undefined;if(raf)cancelAnimationFrame(raf);raf=0;
    if(!document.hidden&&!reduced.matches&&!contextLost)raf=requestAnimationFrame(tick);engine.schedule();}
  source.addEventListener('load',()=>{blueTile=tint('#0000ff');greenTile=tint('#00ff00');engine.invalidate();resume();},{once:true});
  source.addEventListener('error',()=>{if(raf)cancelAnimationFrame(raf);startFallback();},{once:true});
  document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();contextLost=true;ready=false;root.classList.remove('metal-material-ready');
    if(raf)cancelAnimationFrame(raf);raf=0;startFallback();
  });
  // A lost context leaves the native CSS material visible; no page reload or scroll reset.
})();
