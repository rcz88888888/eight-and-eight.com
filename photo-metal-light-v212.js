(() => {
  'use strict';
  const engine = window.EightEightEffects;
  if (!engine) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.topbar');
  const clamp = value => Math.max(0, Math.min(1, value));

  // Eighteen sampled positions of ONE sun, always above/outside the photograph.
  // Interpolate its direction, not photographic frames or separate light images.
  const sunPath = Array.from({length: 18}, (_, index) => {
    const progress = index / 17;
    return [-3.8 + 7.6 * progress, 1.65 + .15 * Math.sin(progress * Math.PI), 3.2];
  });
  const light = new Float32Array(3);
  function lightAt(progress) {
    const step = clamp(progress) * (sunPath.length - 1);
    const index = Math.min(sunPath.length - 2, Math.floor(step));
    const fraction = step - index;
    for (let axis = 0; axis < 3; axis++) {
      light[axis] = sunPath[index][axis] * (1 - fraction) + sunPath[index + 1][axis] * fraction;
    }
    const length = Math.hypot(...light);
    for (let axis = 0; axis < 3; axis++) light[axis] /= length;
    return light;
  }

  const vertex = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * .5 + .5;
      gl_Position = vec4(aPosition, 0., 1.);
    }
  `;
  const fragment = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uPhoto;
    uniform sampler2D uNormals;
    uniform vec2 uTexel;
    uniform vec3 uLight;
    uniform float uRoughness;
    uniform float uStrength;

    float luminance(vec3 color) {
      return dot(color, vec3(.2126, .7152, .0722));
    }
    float geometry(float cosine, float k) {
      return cosine / (cosine * (1. - k) + k);
    }
    void main() {
      vec3 photo = texture2D(uPhoto, vUv).rgb;
      vec3 packedNormal = texture2D(uNormals, vUv).rgb;
      // Black in the normal texture marks sand, background and open cavities.
      float metal = smoothstep(.10, .38, packedNormal.b);
      vec3 normal = normalize(mix(vec3(0., 0., 1.), packedNormal * 2. - 1., metal));

      // Fine photographed scratches modulate the surface rather than a screen overlay.
      float dx = luminance(texture2D(uPhoto, vUv + vec2(uTexel.x, 0.)).rgb)
               - luminance(texture2D(uPhoto, vUv - vec2(uTexel.x, 0.)).rgb);
      float dy = luminance(texture2D(uPhoto, vUv + vec2(0., uTexel.y)).rgb)
               - luminance(texture2D(uPhoto, vUv - vec2(0., uTexel.y)).rgb);
      normal = normalize(normal + vec3(clamp(-dx, -.06, .06), clamp(-dy, -.06, .06), 0.) * metal);

      vec3 view = normalize(vec3((vec2(.5) - vUv) * vec2(.75, .50), 1.));
      vec3 halfway = normalize(view + uLight);
      float ndl = max(dot(normal, uLight), 0.);
      float ndv = max(dot(normal, view), .035);
      float ndh = max(dot(normal, halfway), 0.);
      float vdh = max(dot(view, halfway), 0.);

      // GGX specular: the same single sun illuminates every local metal normal.
      float roughness = clamp(uRoughness + (1. - luminance(photo)) * .045, .18, .46);
      float alpha = roughness * roughness;
      float alpha2 = alpha * alpha;
      float denominator = ndh * ndh * (alpha2 - 1.) + 1.;
      float distribution = alpha2 / max(3.14159265 * denominator * denominator, .0001);
      float k = (roughness + 1.) * (roughness + 1.) / 8.;
      float visibility = geometry(ndl, k) * geometry(ndv, k);
      vec3 tint = clamp(photo / max(luminance(photo), .12), vec3(.24), vec3(1.2));
      vec3 f0 = clamp(mix(vec3(.78), tint * .72, .65), vec3(.28), vec3(.98));
      vec3 fresnel = f0 + (1. - f0) * pow(1. - vdh, 5.);
      vec3 specular = distribution * visibility * fresnel / max(4. * ndv, .035);

      vec3 linearPhoto = pow(photo, vec3(2.2));
      float groundLight = .86 + .18 * max(dot(normalize(vec3(.08, .7, .7)), uLight), 0.);
      float metalLight = .58 + .58 * ndl + .12 * pow(ndl, 4.);
      vec3 color = linearPhoto * mix(groundLight, metalLight, metal);
      color += metal * uStrength * specular * vec3(1., .91, .75) * .72;
      // Gentle highlight rolloff, retaining the photograph's metal colour and detail.
      color /= 1. + max(color - vec3(.75), vec3(0.)) * .35;
      gl_FragColor = vec4(pow(clamp(color, 0., 1.), vec3(1. / 2.2)), 1.);
    }
  `;

  function renderer(canvas, photo, normals, roughness, strength) {
    const gl = canvas.getContext('webgl', {
      alpha: false, antialias: false, depth: false, stencil: false,
      preserveDrawingBuffer: false, powerPreference: 'low-power'
    });
    if (!gl) throw new Error('Photo lighting unavailable');
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error('Photo shader unavailable');
      }
      return shader;
    };
    const program = gl.createProgram();
    const shaders = [compile(gl.VERTEX_SHADER, vertex), compile(gl.FRAGMENT_SHADER, fragment)];
    for (const shader of shaders) gl.attachShader(program, shader);
    gl.linkProgram(program);
    for (const shader of shaders) gl.deleteShader(shader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Photo lighting unavailable');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const textures = [photo, normals].map((image, index) => {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      return texture;
    });
    gl.uniform1i(gl.getUniformLocation(program, 'uPhoto'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uNormals'), 1);
    gl.uniform2f(gl.getUniformLocation(program, 'uTexel'), 1 / photo.naturalWidth, 1 / photo.naturalHeight);
    gl.uniform1f(gl.getUniformLocation(program, 'uRoughness'), roughness);
    gl.uniform1f(gl.getUniformLocation(program, 'uStrength'), strength);
    const lightLocation = gl.getUniformLocation(program, 'uLight');
    return {
      draw(direction) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform3fv(lightLocation, direction);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose() {
        textures.forEach(texture => gl.deleteTexture(texture));
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
    };
  }

  let headerHeight = 0;
  let lastState = {scroll: window.scrollY, height: innerHeight};
  const items = [...document.querySelectorAll('figure[data-metal-normals]')].map(figure => {
    const base = figure.querySelector('img');
    if (!base) return null;
    const frame = document.createElement('div');
    frame.className = 'photo-scroll-light';
    base.replaceWith(frame);
    base.classList.add('photo-light-base');
    frame.append(base);
    const canvas = document.createElement('canvas');
    canvas.className = 'photo-metal-reflections';
    canvas.setAttribute('aria-hidden', 'true');
    frame.append(canvas);
    const item = {figure, frame, base, canvas, normal: null, renderer: null,
      top: Infinity, height: 0, started: false, ready: false, progress: NaN};
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      item.ready = false;
      frame.removeAttribute('data-light-ready');
    });
    canvas.addEventListener('webglcontextrestored', () => setup(item));
    return item;
  }).filter(Boolean);

  const decoded = image => {
    if (typeof image.decode === 'function') return image.decode();
    if (image.complete && image.naturalWidth) return Promise.resolve();
    return new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, {once: true});
      image.addEventListener('error', reject, {once: true});
    });
  };
  function setup(item) {
    try {
      item.renderer = renderer(item.canvas, item.base, item.normal,
        Number(item.figure.dataset.metalRoughness) || .28,
        Number(item.figure.dataset.metalStrength) || 1);
      item.ready = true;
      item.progress = NaN;
      paint(lastState);
      engine.invalidate();
    } catch {
      item.ready = false;
      item.frame.removeAttribute('data-light-ready');
    }
  }
  async function start(item) {
    if (item.started || reduced.matches) return;
    item.started = true;
    item.normal = new Image();
    item.normal.decoding = 'async';
    item.normal.src = item.figure.dataset.metalNormals;
    try {
      await Promise.all([decoded(item.base), decoded(item.normal)]);
      setup(item);
    } catch {
      // The same sun-free photograph remains visible when relighting is unavailable.
      item.frame.removeAttribute('data-light-ready');
    }
  }
  function measure() {
    headerHeight = header?.getBoundingClientRect().height || 0;
    for (const item of items) {
      const box = item.frame.getBoundingClientRect();
      item.top = box.top + window.scrollY;
      item.height = box.height;
      const width = Math.min(1536, Math.max(1, Math.round(box.width * Math.min(devicePixelRatio || 1, 1.5))));
      const height = Math.max(1, Math.round(width * (item.base.height / item.base.width || 2 / 3)));
      if (item.canvas.width !== width || item.canvas.height !== height) {
        item.canvas.width = width;
        item.canvas.height = height;
        item.progress = NaN;
      }
    }
    paint({scroll: window.scrollY, height: innerHeight});
  }
  function paint(state) {
    lastState = state;
    for (const item of items) {
      if (!(item.height > 0)) continue;
      const top = item.top - state.scroll;
      const visible = top < state.height && top + item.height > headerHeight;
      if (visible && !item.started) start(item);
      if (reduced.matches) {
        item.frame.removeAttribute('data-light-ready');
        item.progress = NaN;
        continue;
      }
      if (!visible || !item.ready) continue;
      const span = Math.max(1, state.height - headerHeight + item.height);
      const progress = clamp((state.scroll + state.height - item.top) / span);
      if (progress === item.progress) continue;
      item.renderer.draw(lightAt(progress));
      item.frame.setAttribute('data-light-ready', '');
      item.progress = progress;
    }
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const item = items.find(item => item.figure === entry.target);
        if (item) {
          start(item);
          if (item.started) observer.unobserve(item.figure);
        }
      }
    }, {rootMargin: '900px 0px'});
    for (const item of items) observer.observe(item.figure);
  }
  engine.subscribe({measure, paint});
  reduced.addEventListener('change', () => { paint(lastState); engine.invalidate(); });
})();
