const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;
uniform float t;
uniform vec2 m;
uniform float f;

float h(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float n(vec2 p){
  vec2 i = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), u.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for (int k = 0; k < 4; k++) {
    v += a * n(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 curtain(vec2 uv, float x, float mx, float i, vec3 c, float w){
  float s = 1.0 + i * 0.35;
  float pull = exp(-pow((x - mx) * 1.8, 2.0)) * (m.y - 0.5) * 0.16;
  float base = 0.7 + i * 0.065;
  float curve = base
    + 0.06 * sin(x * (1.3 + i * 0.5) + t * 0.07 * s + i * 2.1)
    + 0.16 * (fbm(vec2(x * 1.4 + i * 3.1, t * 0.04 * s)) - 0.5)
    + 0.018 * sin(x * (5.0 + i) - t * 0.23 * s)
    + pull
    + (m.x - 0.5) * 0.05 * x
    + (1.0 - f) * 0.12;
  float d = uv.y - curve;
  float edge = smoothstep(-0.018, 0.002, d);
  float tail = exp(-max(d, 0.0) * (6.5 + i * 2.5));
  float lip = exp(-abs(d) * 60.0) * 0.9;
  vec2 rp = vec2(x * 13.0 + i * 7.0 + t * 0.05, d * 0.9 - t * 0.12);
  float r1 = (n(rp) * 0.67 + n(rp * 1.9 + 3.7) * 0.33);
  float rays = 0.12 + 1.5 * r1 * r1;
  float fold = 0.35 + 0.65 * smoothstep(0.3, 0.75, fbm(vec2(x * 1.9 - t * 0.035 * s, i * 4.0 + t * 0.01)));
  float env = smoothstep(1.3, 0.1, abs(x - 0.14 * sin(t * 0.025 + i * 1.7)));
  return c * (edge * tail * rays + lip * rays) * fold * env * w;
}

void main(){
  vec2 uv = gl_FragCoord.xy / r;
  float ar = r.x / r.y;
  float x = (uv.x - 0.5) * ar;
  float mx = (m.x - 0.5) * ar;
  vec3 col = vec3(0.0);
  col += curtain(uv, x, mx, 0.0, vec3(0.0, 0.78, 1.0), 0.8);
  col += curtain(uv, x, mx, 1.0, vec3(0.23, 0.36, 1.0), 0.95);
  col += curtain(uv, x, mx, 2.0, vec3(0.1, 0.2, 0.62), 1.1);
  vec2 q = vec2((uv.x - m.x) * ar, uv.y - m.y);
  col *= 1.0 + 0.35 * exp(-dot(q, q) * 6.0);
  vec2 c0 = vec2(x / 0.95, (uv.y - 0.52) / 0.13);
  col *= 1.0 - 0.6 * exp(-dot(c0, c0));
  col *= smoothstep(0.3, 0.6, uv.y) * smoothstep(1.0, 0.88, uv.y);
  col = (1.0 - exp(-col * 0.95)) * f * 0.9;
  col += (h(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0;
  col = max(col, 0.0);
  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
}
`;

type Ctx = WebGLRenderingContext;

function shader(gl: Ctx, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function boot(hero: HTMLElement, aurora: HTMLElement): void {
  const canvas = document.createElement('canvas');
  canvas.className = 'aurora-gl';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return;
  }
  const parallel = gl.getExtension('KHR_parallel_shader_compile') as {
    COMPLETION_STATUS_KHR: number;
  } | null;
  const vs = shader(gl, gl.VERTEX_SHADER, VERT);
  const fs = shader(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  const wait = () => {
    if (parallel && !gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) {
      setTimeout(wait, 50);
      return;
    }
    setTimeout(() => run(hero, aurora, canvas, gl, prog), 0);
  };
  setTimeout(wait, 0);
}

function run(
  hero: HTMLElement,
  aurora: HTMLElement,
  canvas: HTMLCanvasElement,
  gl: Ctx,
  prog: WebGLProgram,
): void {
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(prog, 'r');
  const uT = gl.getUniformLocation(prog, 't');
  const uM = gl.getUniformLocation(prog, 'm');
  const uF = gl.getUniformLocation(prog, 'f');

  aurora.after(canvas);

  const fine = matchMedia('(pointer: fine)').matches;
  const cap = fine ? 760 : 420;
  let quality = 1;
  const size = () => {
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    if (!w || !hgt) return;
    const k = Math.min(1, cap / w) * quality;
    canvas.width = Math.max(1, Math.round(w * k));
    canvas.height = Math.max(1, Math.round(hgt * k));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uR, canvas.width, canvas.height);
  };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(canvas);

  const target = { x: 0.5, y: 0.62 };
  const cur = { x: 0.5, y: 0.62 };
  let lastInput = -1e9;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const rect = canvas.getBoundingClientRect();
    target.x = Math.min(1.1, Math.max(-0.1, (e.clientX - rect.left) / rect.width));
    target.y = Math.min(0.95, Math.max(0.3, 1 - (e.clientY - rect.top) / rect.height));
    lastInput = performance.now();
  };
  if (fine) addEventListener('pointermove', onMove, { passive: true });

  let raf = 0;
  let inView = true;
  let running = false;
  let t0 = 0;
  let prev = 0;
  let frames = 0;
  let slow = 0;
  let bad = 0;
  let dead = false;

  const teardown = () => {
    dead = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    removeEventListener('pointermove', onMove);
    document.removeEventListener('visibilitychange', sync);
    aurora.classList.remove('gl');
    canvas.remove();
  };

  const frame = (now: number) => {
    if (!t0) t0 = now;
    const dt = prev ? now - prev : 16;
    prev = now;
    frames++;
    if (frames > 3 && frames <= 24 && dt > 50 && ++bad >= 6) {
      teardown();
      return;
    }
    if (frames > 30 && frames < 150) {
      slow = slow * 0.9 + (dt > 34 ? 0.1 : 0);
      if (slow > 0.5) {
        slow = 0;
        quality *= 0.65;
        if (quality < 0.4) {
          teardown();
          return;
        }
        size();
      }
    }
    const t = (now - t0) / 1000;
    if (now - lastInput > 4000) {
      target.x = 0.5 + 0.22 * Math.sin(t * 0.09);
      target.y = 0.62 + 0.08 * Math.sin(t * 0.13 + 1.3);
    }
    const ease = fine ? 0.035 : 0.02;
    cur.x += (target.x - cur.x) * ease;
    cur.y += (target.y - cur.y) * ease;
    const p = Math.min(1, t / 2.6);
    gl.uniform1f(uT, t % 1000);
    gl.uniform2f(uM, cur.x, cur.y);
    gl.uniform1f(uF, 1 - (1 - p) ** 4);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (frames === 2) aurora.classList.add('gl');
    raf = requestAnimationFrame(frame);
  };

  const sync = () => {
    const want = inView && document.visibilityState === 'visible' && !dead;
    if (want && !running) {
      running = true;
      prev = 0;
      raf = requestAnimationFrame(frame);
    } else if (!want && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };

  const io = new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting);
    sync();
  });
  io.observe(hero);
  document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    teardown();
  });
  sync();
}

export function initAuroraGL(reduced: boolean): void {
  if (reduced) return;
  const hero = document.querySelector<HTMLElement>('.hero');
  const aurora = hero?.querySelector<HTMLElement>('.aurora');
  if (!hero || !aurora || !('IntersectionObserver' in window) || !('ResizeObserver' in window))
    return;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return;
  const start = () => boot(hero, aurora);
  const idle = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2000 });
    else setTimeout(start, 600);
  };
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
}
