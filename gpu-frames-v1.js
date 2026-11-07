(() => {
  'use strict';

  // One transparent drawing surface, using the existing canvas and scene order.
  // Ring geometry lives in small vertex buffers rather than large image quads.
  const vertex = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_center;
    uniform vec2 u_size;
    uniform float u_angle;
    varying mediump vec2 v_uv;
    void main() {
      vec2 p = (a_position - .5) * u_size;
      float c = cos(u_angle), s = sin(u_angle);
      p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + u_center;
      gl_Position = vec4(p.x / u_resolution.x * 2. - 1., 1. - p.y / u_resolution.y * 2., 0., 1.);
      v_uv = a_position;
    }`;
  const fragment = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float u_opacity;
    varying mediump vec2 v_uv;
    void main() { gl_FragColor = texture2D(u_image, v_uv) * u_opacity; }`;
  const pointVertex = `
    attribute vec4 a_point;
    attribute float a_row;
    uniform vec2 u_resolution;
    uniform vec2 u_center;
    uniform float u_diameter;
    uniform float u_ratio;
    uniform vec2 u_row_rotation[4];
    varying mediump float v_radius;
    varying mediump float v_size;
    varying mediump float v_opacity;
    void main() {
      vec2 rotation = u_row_rotation[int(a_row)];
      float c = rotation.x, s = rotation.y;
      vec2 p = vec2(c * a_point.x - s * a_point.y, s * a_point.x + c * a_point.y);
      p = p * u_diameter + u_center;
      gl_Position = vec4(p.x / u_resolution.x * 2. - 1., 1. - p.y / u_resolution.y * 2., 0., 1.);
      v_radius = a_point.z * u_diameter * u_ratio;
      v_size = max(1., ceil(v_radius * 2. + 2.));
      gl_PointSize = v_size;
      v_opacity = a_point.w;
    }`;
  const pointFragment = `
    precision mediump float;
    uniform float u_opacity;
    varying mediump float v_radius;
    varying mediump float v_size;
    varying mediump float v_opacity;
    void main() {
      vec2 p = (gl_PointCoord - .5) * v_size;
      float edge = clamp(v_radius + .5 - length(p), 0., 1.);
      float alpha = edge * v_opacity * u_opacity;
      gl_FragColor = vec4(vec3(194.,181.,148.) / 255. * alpha, alpha);
    }`;

  function create(original, onLost) {
    if (!original) return null;
    const canvas = original.cloneNode(false);
    let gl;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true, premultipliedAlpha: true, antialias: false,
        depth: false, stencil: false, preserveDrawingBuffer: false,
        powerPreference: 'high-performance'
      });
    } catch { return null; }
    if (!gl) return null;
    const programs = [], buffers = [], textures = new Map();
    const pointBuffers = new WeakMap();
    const rowRotations = new Float32Array(8);
    let width = 1, height = 1, ratio = 1, checkDraw = true;
    function compile(type, code) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, code); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(error);
      }
      return shader;
    }
    function program(vs, fs, attributes, uniforms) {
      const v = compile(gl.VERTEX_SHADER, vs), f = compile(gl.FRAGMENT_SHADER, fs);
      const handle = gl.createProgram();
      gl.attachShader(handle, v); gl.attachShader(handle, f); gl.linkProgram(handle);
      gl.deleteShader(v); gl.deleteShader(f);
      if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(handle); gl.deleteProgram(handle); throw new Error(error);
      }
      programs.push(handle);
      const result = {handle};
      for (const name of attributes) result[name] = gl.getAttribLocation(handle, name);
      for (const name of uniforms) result[name] = gl.getUniformLocation(handle, name);
      return result;
    }
    function buffer(data) {
      const handle = gl.createBuffer(); buffers.push(handle);
      gl.bindBuffer(gl.ARRAY_BUFFER, handle);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return handle;
    }
    let images, points, quad;
    try {
      images = program(vertex, fragment, ['a_position'],
        ['u_resolution','u_center','u_size','u_angle','u_image','u_opacity']);
      points = program(pointVertex, pointFragment, ['a_point','a_row'],
        ['u_resolution','u_center','u_diameter','u_ratio','u_row_rotation','u_opacity']);
      quad = buffer(new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]));
    } catch {
      for (const handle of programs) gl.deleteProgram(handle);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return null;
    }
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.clearColor(0,0,0,0);
    function texture(image) {
      let handle = textures.get(image);
      if (handle) return handle;
      handle = gl.createTexture(); textures.set(image, handle);
      gl.bindTexture(gl.TEXTURE_2D, handle);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      return handle;
    }
    function ringBuffer(group) {
      let cached = pointBuffers.get(group);
      if (cached) return cached;
      const values = [];
      for (const {unitPoints,radius,dot,opacity,index} of group.rows) {
        for (const [unitX, unitY] of unitPoints) {
          values.push(unitX * radius, unitY * radius, dot, opacity, index);
        }
      }
      cached = {handle: buffer(new Float32Array(values)), count: values.length / 5};
      pointBuffers.set(group, cached);
      return cached;
    }
    function drawRings(groups, scene, opacity) {
      gl.useProgram(points.handle);
      gl.uniform2f(points.u_resolution, width, height);
      gl.uniform2f(points.u_center, scene.centerX, scene.centerY);
      gl.uniform1f(points.u_diameter, scene.ringDiameter);
      gl.uniform1f(points.u_ratio, ratio);
      gl.uniform1f(points.u_opacity, opacity);
      const x=scene.centerX,y=scene.centerY;
      const nearX=Math.max(0,-x,x-width),nearY=Math.max(0,-y,y-height);
      const farX=Math.max(Math.abs(x),Math.abs(width-x));
      const farY=Math.max(Math.abs(y),Math.abs(height-y));
      const nearest=nearX*nearX+nearY*nearY, farthest=farX*farX+farY*farY;
      for (const group of groups) {
        const inner=group.innerRadius*scene.ringDiameter,outer=group.outerRadius*scene.ringDiameter;
        if(nearest>(outer+1)**2 || farthest<Math.max(0,inner-1)**2)continue;
        const cached = ringBuffer(group);
        gl.bindBuffer(gl.ARRAY_BUFFER, cached.handle);
        gl.enableVertexAttribArray(points.a_point);
        gl.enableVertexAttribArray(points.a_row);
        gl.vertexAttribPointer(points.a_point, 4, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(points.a_row, 1, gl.FLOAT, false, 20, 16);
        // One rotation per row and group. The point shader only applies it.
        const angles = group.source.ringRowAngles;
        for (let index = 0; index < angles.length; index++) {
          const angle = angles[index];
          rowRotations[index * 2] = Math.cos(angle);
          rowRotations[index * 2 + 1] = Math.sin(angle);
        }
        gl.uniform2fv(points.u_row_rotation, rowRotations);
        gl.drawArrays(gl.POINTS, 0, cached.count);
      }
      gl.disableVertexAttribArray(points.a_point);
      gl.disableVertexAttribArray(points.a_row);
    }
    function drawImage(image, sizeX, sizeY, opacity) {
      if (!image || opacity <= 0) return;
      gl.bindTexture(gl.TEXTURE_2D, texture(image));
      gl.uniform2f(images.u_size, sizeX, sizeY);
      gl.uniform1f(images.u_opacity, opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    const lost = event => { event.preventDefault(); requestAnimationFrame(onLost); };
    canvas.addEventListener('webglcontextlost', lost);
    canvas.dataset.renderer = 'webgl';
    original.replaceWith(canvas);
    return {
      canvas,
      resize(nextWidth, nextHeight, nextRatio) {
        width = nextWidth; height = nextHeight; ratio = nextRatio;
        const w = Math.round(width * ratio), h = Math.round(height * ratio);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w; canvas.height = h;
          gl.viewport(0,0,w,h); checkDraw = true;
        }
      },
      retainSprites(items) {
        const retained = new Set(items);
        for (const [image, handle] of textures) if (!retained.has(image)) {
          gl.deleteTexture(handle); textures.delete(image);
        }
      },
      draw(scene, layers, rings, opacityFor, ringOpacity, rain) {
        if (gl.isContextLost()) return false;
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (rain) {
          gl.useProgram(images.handle);
          gl.bindBuffer(gl.ARRAY_BUFFER, quad);
          gl.enableVertexAttribArray(images.a_position);
          gl.vertexAttribPointer(images.a_position,2,gl.FLOAT,false,8,0);
          gl.uniform2f(images.u_resolution,width,height);
          gl.uniform1i(images.u_image,0);gl.uniform1f(images.u_angle,0);
          for(const mark of rain.marks){
            const top=-mark.height+mark.progress*(rain.surfaceHeight+mark.height);
            if(top+mark.height<0 || top>height || mark.x+mark.width<0 || mark.x>width || !mark.sprite)continue;
            gl.uniform2f(images.u_center,mark.x+mark.width/2,top+mark.height/2);
            drawImage(mark.sprite,mark.width,mark.height,mark.opacity);
          }
          gl.disableVertexAttribArray(images.a_position);
        }
        drawRings(rings, scene, ringOpacity);
        gl.useProgram(images.handle);
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.enableVertexAttribArray(images.a_position);
        gl.vertexAttribPointer(images.a_position, 2, gl.FLOAT, false, 8, 0);
        gl.uniform2f(images.u_resolution, width, height);
        gl.uniform2f(images.u_center, scene.centerX, scene.centerY);
        gl.uniform1i(images.u_image, 0);
        for (const layer of layers) {
          const opacity = opacityFor(layer, scene.patternVisibility, scene.fillVisibility);
          const w = scene.w * layer.scale, h = scene.h * layer.scale;
          gl.uniform1f(images.u_angle, layer.scrollAngle + layer.idleAngle);
          drawImage(layer.sprite, w, h, opacity * scene.patternVisibility);
          drawImage(layer.solidSprite, w, h, opacity * scene.fillVisibility);
          drawImage(layer.borderSprite, w, h, opacity);
        }
        gl.disableVertexAttribArray(images.a_position);
        if (checkDraw) { checkDraw = false; return gl.getError() === gl.NO_ERROR; }
        return true;
      },
      dispose() {
        canvas.removeEventListener('webglcontextlost', lost);
        for (const handle of textures.values()) gl.deleteTexture(handle);
        for (const handle of buffers) gl.deleteBuffer(handle);
        for (const handle of programs) gl.deleteProgram(handle);
        textures.clear();
        if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  }
  window.EightEightGpu = {create};
})();
