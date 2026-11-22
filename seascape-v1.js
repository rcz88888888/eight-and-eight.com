(() => {
  'use strict';
  const host = document.querySelector('.seascape-background');
  const canvas = host?.querySelector('canvas');
  if (!canvas) return;
  const root = document.documentElement;
  root.classList.add('seascape-on');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl2', {
    alpha: false, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: false, preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  const fallback = host.querySelector('.seascape-fallback');
  const fallbackVideos = [...host.querySelectorAll('video')];
  const stage = document.querySelector('.logo-stage');
  let width = innerWidth;
  let height = innerHeight;
  let horizon = innerHeight * .85;
  let scroll = window.scrollY;
  let animationFrame = 0;
  let ready = false;
  let contextLost = false;
  let lastFrame = -Infinity;
  let needsFrame = true;
  let frameInterval = 1000 / 30;
  let lastActualFrame = 0;
  let elapsedFrames = 0;
  let elapsedCost = 0;
  let startTime = performance.now();

  function measure() {
    width = Math.max(1, host.clientWidth || innerWidth);
    height = Math.max(1, host.clientHeight || innerHeight);
    horizon = Math.max(height * .55,
      stage ? stage.getBoundingClientRect().bottom + window.scrollY : height * .85);
    root.style.setProperty('--seascape-horizon', `${horizon}px`);
    updateFallback();
    needsFrame = true;
    if (!gl) return;
    // Native display density, including Retina, 4K and 8K screens. Never stretch
    // a viewport-sized bitmap into a document-height canvas.
    const maximum = Math.min(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      gl.getParameter(gl.MAX_TEXTURE_SIZE), 8192);
    const density = Math.min(devicePixelRatio || 1, maximum / width, maximum / height);
    const renderWidth = Math.max(1, Math.round(width * density));
    const renderHeight = Math.max(1, Math.round(height * density));
    if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      gl.viewport(0, 0, renderWidth, renderHeight);
    }
  }

  function updateFallback() {
    if (!fallback) return;
    const seaOnly = scroll >= horizon;
    fallback.classList.toggle('sea-only', seaOnly);
    host.style.setProperty('--seascape-sky-offset', `${-scroll}px`);
    host.style.setProperty('--seascape-sea-clip', `${Math.max(0, horizon - scroll)}px`);
    host.style.setProperty('--seascape-haze-top', `${horizon - scroll - 40}px`);
  }

  function activateFallback() {
    updateFallback();
    fallbackVideos.forEach(video => {
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      if (document.hidden || reducedMotion.matches) video.pause();
      else { video.preload = 'auto'; video.play().catch(() => {}); }
    });
  }

  function onScroll() {
    scroll = window.scrollY;
    needsFrame = true;
    if (!ready || contextLost) updateFallback();
    schedule();
  }

  function schedule() {
    if (document.hidden || animationFrame || contextLost || !ready) return;
    animationFrame = requestAnimationFrame(frame);
  }

  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', () => { measure(); schedule(); }, {passive: true});
  window.visualViewport?.addEventListener('resize', () => { measure(); schedule(); }, {passive: true});
  if (stage && typeof ResizeObserver === 'function') new ResizeObserver(() => {
    measure(); schedule();
  }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (!ready || contextLost) activateFallback();
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else {
      needsFrame = true;
      schedule();
    }
  });
  reducedMotion.addEventListener?.('change', () => {
    needsFrame = true;
    if (!ready || contextLost) activateFallback();
    schedule();
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    root.classList.remove('seascape-ready');
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    updateFallback();
    activateFallback();
  });
  // Rebuild resources if Safari discards and subsequently restores this context.
  canvas.addEventListener('webglcontextrestored', () => { contextLost = false; initialize(); });

  measure();
  updateFallback();
  if (!gl) { activateFallback(); return; }

  const VERTEX = `#version 300 es
    in vec2 position;
    out vec2 v_uv;
    void main() { v_uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
  `;
  const FRAGMENT = String.raw`#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scroll;
uniform float u_horizon;
uniform sampler2D u_sky;
uniform sampler2D u_photo;
in vec2 v_uv;
out vec4 frag;
const float TAU=6.28318530718;

vec3 skySample(vec2 uv) {
    return texture(u_sky,clamp(uv,vec2(.001),vec2(.999))).rgb;
}

vec3 photographed(vec2 uv) {
    return texture(u_photo,clamp(uv,vec2(.001),vec2(.999))).rgb;
}

float waves(vec2 p,float time,out vec2 gradient) {
    float h=0.0;
    gradient=vec2(0.0);
    float frequency=.27;
    float amplitude=.29;
    for(int i=0;i<16;i++) {
        float fi=float(i);
        float angle=fi*2.39996323+0.32*sin(fi*1.72);
        vec2 direction=vec2(cos(angle),sin(angle));
        direction.y=abs(direction.y)*.7+.3;
        direction=normalize(direction);
        float harmonic=max(1.0,floor(sqrt(9.81*frequency)/(.7853981634)+.5));
        float q=dot(p,direction)*frequency-time*.7853981634*harmonic+fi*4.71;
        float s=sin(q);
        float c=cos(q);
        float shape=exp(s*.72);
        h+=amplitude*(shape-1.13);
        gradient+=direction*(amplitude*.72*shape*c*frequency);
        frequency*=1.43;
        amplitude*=.59;
    }
    return h;
}

vec3 environment(vec3 r) {
    float z=max(.22,r.z);
    vec2 uv=vec2(.5+r.x*.34/z,.97-r.y*1.9/z);
    vec3 photograph=skySample(uv);
    return pow(photograph,vec3(2.2));
}

void main(){
    float top=(1.0-v_uv.y)*u_resolution.y;
    float documentY=u_scroll+top;
    float below=(documentY-u_horizon)/u_resolution.y;
    float t=u_time;
    float phase=t*.7853981634;
    if(below<0.0) {
        vec2 uv=vec2(v_uv.x,documentY/u_horizon);
        float viewAspect=u_resolution.x/u_horizon;
        float imageAspect=1672.0/941.0;
        vec2 fit=vec2(min(1.0,viewAspect/imageAspect),min(1.0,imageAspect/viewAspect));
        uv=(uv-.5)*fit+.5;
        vec2 delta=(uv-.5)*vec2(imageAspect,1.0);
        float stillSun=smoothstep(.035,.185,length(delta));
        float localPhase=.85*sin(uv.x*3.8+uv.y*1.1)+.48*cos(uv.y*5.4-uv.x*.8);
        vec2 flow=vec2(.016*sin(phase+localPhase),.0045*cos(phase+localPhase))*1.38*stillSun;
        vec3 color=skySample((uv-.5)*.947+.5+flow);
        vec2 centered=(uv-.5)*vec2(imageAspect,1.0);
        float radius=length(centered);
        float angle=atan(centered.y,centered.x);
        float ray1=pow(.5+.5*sin(angle*25.+.30*sin(angle*9.)+.2208*sin(phase+.8)),13.);
        float ray2=pow(.5+.5*sin(angle*38.+.345*cos(phase-.9)),20.);
        float shafts=(.64*ray1+.36*ray2)*exp(-radius*2.7)*smoothstep(.035,.16,radius);
        vec3 light=pow(color,vec3(2.2));
        float white=smoothstep(.64,.96,dot(color,vec3(.2126,.7152,.0722)));
        light+=vec3(1.,.94,.80)*shafts*.06624*(1.-white*.70);
        light*=1.+.01104*sin(phase+uv.x*4.5+uv.y*2.3)*white*stillSun;
        color=pow(clamp(light,0.,1.),vec3(1./2.2));
        float haze=smoothstep(-.13,-.005,below);
        vec3 horizon=photographed(vec2(.5+(v_uv.x-.5)*min(1.0,viewAspect/3.56),.386+.108*smoothstep(-.13,0.0,below)));
        color=mix(color,horizon,haze);
        frag=vec4(color,1.0);
        return;
    }
    float aspect=u_resolution.x/u_resolution.y;
    // One horizon belongs to the opening section. Once it leaves the screen,
    // the visible sea keeps its photographic proportions instead of stretching
    // a single image over the complete document height.
    float visibleHorizon=max(0.0,(u_horizon-u_scroll)/u_resolution.y);
    float waterY=clamp((1.0-v_uv.y)-visibleHorizon,0.0,1.0);
    float nearField=smoothstep(0.0,.45,waterY);
    float horizontal=(v_uv.x-.5)*aspect;
    vec3 p=vec3(horizontal*37.0,0.0,13.0/(.045+waterY*.75));
    vec2 gradient;
    float height=waves(p.xz,t,gradient);
    vec2 photoUv=vec2(.5+(v_uv.x-.5)*min(1.0,aspect/3.56),.496+.473*waterY);
    photoUv+=vec2(gradient.x*.009,height*.016+gradient.y*.0025)*nearField;
    vec3 photograph=photographed(photoUv);
    vec3 color=pow(photograph,vec3(2.2));
    vec3 n=normalize(vec3(-gradient.x,1.0,-gradient.y));
    vec3 view=normalize(vec3(-horizontal,.23+waterY*.2,-1.3));
    vec3 light=normalize(vec3(0.0,.23,1.0));
    vec3 halfVector=normalize(view+light);
    float nh=max(.0,dot(n,halfVector));
    float a2=pow(.145,4.0);
    float denominator=nh*nh*(a2-1.0)+1.0;
    float distribution=a2/(3.14159265*denominator*denominator);
    float pathWidth=.07+.17*sqrt(waterY);
    float reflectionPath=exp(-pow((v_uv.x-.5)/pathWidth,2.0));
    float existingLight=smoothstep(.72,.99,dot(photograph,vec3(.2126,.7152,.0722)));
    float shimmer=sin(phase*5.0+p.x*.73+p.z*.57)*cos(phase*3.0-p.x*.9+p.z*.19);
    color*=1.0+.09*shimmer*existingLight*reflectionPath*nearField;
    float glint=min(distribution*.0011,.15)*reflectionPath*nearField;
    color+=vec3(1.0,.95,.84)*glint;
    color=pow(clamp(color,0.,1.),vec3(1.0/2.2));
    frag=vec4(color,1.0);
}
`;
  let program;
  let vertexArray;
  let vertexBuffer;
  let textures = [];
  let uniforms;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error('Background renderer unavailable');
    }
    return shader;
  }

  const imageCache = new Map();
  function loadImage(url) {
    if (!imageCache.has(url)) imageCache.set(url, new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    }));
    return imageCache.get(url);
  }

  async function initialize() {
    try {
      const images = await Promise.all([
        loadImage('seascape-silver-sky.png'), loadImage('seascape-silver-source.png'),
      ]);
      if (contextLost) return;
      const vertex = compile(gl.VERTEX_SHADER, VERTEX);
      const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Background unavailable');
      gl.useProgram(program);
      vertexArray = gl.createVertexArray();
      gl.bindVertexArray(vertexArray);
      vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      textures = images.map((image, unit) => {
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return texture;
      });
      uniforms = Object.fromEntries(['u_resolution','u_time','u_scroll','u_horizon','u_sky','u_photo']
        .map(name => [name, gl.getUniformLocation(program, name)]));
      gl.uniform1i(uniforms.u_sky, 0);
      gl.uniform1i(uniforms.u_photo, 1);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      ready = true;
      fallbackVideos.forEach(video => video.pause());
      needsFrame = true;
      measure();
      schedule();
    } catch (error) {
      ready = false;
      root.classList.remove('seascape-ready');
      updateFallback();
      activateFallback();
    }
  }

  function frame(now) {
    animationFrame = 0;
    if (document.hidden || !ready || contextLost) return;
    if (!needsFrame && reducedMotion.matches) return;
    if (!needsFrame && now - lastFrame < frameInterval - .5) { schedule(); return; }
    const started = performance.now();
    lastFrame = now;
    gl.useProgram(program);
    gl.bindVertexArray(vertexArray);
    textures.forEach((texture, unit) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    });
    gl.uniform2f(uniforms.u_resolution, width, height);
    gl.uniform1f(uniforms.u_time, reducedMotion.matches ? 1.4 : ((now - startTime) / 1000) % 8);
    gl.uniform1f(uniforms.u_scroll, scroll);
    gl.uniform1f(uniforms.u_horizon, horizon);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    needsFrame = false;
    root.classList.add('seascape-ready');
    // Keep full native image resolution on slower devices; reduce only the
    // cadence if necessary, while preserving the eight-second animation time.
    if (lastActualFrame) {
      elapsedCost += now - lastActualFrame;
      elapsedFrames++;
      if (elapsedFrames === 45) {
        const average = elapsedCost / elapsedFrames;
        frameInterval = average > 57 ? 1000 / 20 : 1000 / 30;
        elapsedFrames = 0;
        elapsedCost = 0;
      }
    }
    lastActualFrame = now;
    if (!reducedMotion.matches) schedule();
  }

  initialize();
})();
