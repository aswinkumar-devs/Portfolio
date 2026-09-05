import { useEffect, useRef } from "react";

/**
 * WebGL curl-noise particle ribbon background.
 * Multiple glowing neon-blue strands weave around each other and trail the cursor,
 * fading gracefully behind it. Fixed, non-interactive, painted behind all content.
 */

const VERT = `
attribute vec2 aPos;
attribute float aAlpha;
attribute float aWidth;
uniform vec2 uRes;
varying float vAlpha;
void main() {
  vAlpha = aAlpha;
  vec2 clip = (aPos / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform vec3 uColor;
uniform float uBoost;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(uColor * uBoost * vAlpha, vAlpha);
}
`;

type P = { x: number; y: number };

const STRANDS = 8;
const SEGMENTS = 90;

// Related neon-blue family: teal → cyan → azure → indigo
const STRAND_COLORS: [number, number, number][] = [
  [0.0, 0.95, 0.85],
  [0.0, 0.90, 1.0],
  [0.15, 0.75, 1.0],
  [0.30, 0.60, 1.0],
  [0.0, 1.0, 0.72],
  [0.10, 0.85, 1.0],
  [0.22, 0.68, 1.0],
  [0.40, 0.52, 1.0],
];

const FluidCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    if (!gl) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const aPos = gl.getAttribLocation(prog, "aPos");
    const aAlpha = gl.getAttribLocation(prog, "aAlpha");
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uColor = gl.getUniformLocation(prog, "uColor");
    const uBoost = gl.getUniformLocation(prog, "uBoost");

    const posBuf = gl.createBuffer();
    const alphaBuf = gl.createBuffer();

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const pointer: P = { x: w / 2, y: h / 2 };
    const target: P = { x: w / 2, y: h / 2 };
    let lastMove = 0;
    let pointerInside = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      lastMove = performance.now();
      pointerInside = true;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      target.x = t.clientX;
      target.y = t.clientY;
      lastMove = performance.now();
      pointerInside = true;
    };
    const onLeave = () => {
      pointerInside = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mouseout", (e: MouseEvent) => {
      if (!e.relatedTarget) onLeave();
    });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", resize);

    // strand histories
    const strands: P[][] = Array.from({ length: STRANDS }, () =>
      Array.from({ length: SEGMENTS }, () => ({ x: pointer.x, y: pointer.y }))
    );
    const heads: P[] = Array.from({ length: STRANDS }, () => ({ x: pointer.x, y: pointer.y }));

    // curl-ish noise from summed sines (cheap + smooth)
    const curl = (x: number, y: number, t: number, seed: number) => {
      const s = seed * 13.37;
      const nx =
        Math.sin(y * 0.0055 + t * 0.9 + s) +
        0.5 * Math.sin(y * 0.013 - t * 1.4 + s * 1.7) +
        0.35 * Math.cos(x * 0.008 + t * 0.6 + s * 2.3);
      const ny =
        Math.cos(x * 0.0055 - t * 1.1 + s) +
        0.5 * Math.cos(x * 0.012 + t * 1.3 + s * 1.9) +
        0.35 * Math.sin(y * 0.009 - t * 0.7 + s * 2.9);
      return { x: nx, y: ny };
    };

    const vertsPerStrand = SEGMENTS * 2;
    const total = STRANDS * vertsPerStrand;
    const posArr = new Float32Array(total * 2);
    const alphaArr = new Float32Array(total);

    let t = 0;
    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      t += 0.016;

      const idle = !pointerInside;
      // 20% fewer strands while the cursor is on screen
      const active = idle ? STRANDS : Math.max(1, Math.round(STRANDS * 0.8));

      let goalX = target.x;
      let goalY = target.y;
      if (idle) {
        // Larger lemniscate of Gerono so idle ribbons sweep a longer path
        const a = Math.min(w, h) * 0.45;
        const k = t * 1.05;
        const d = 1 + Math.sin(k) * Math.sin(k);
        goalX = w / 2 + (a * 2.0 * Math.cos(k)) / d;
        goalY = h / 2 + (a * 1.4 * Math.sin(k) * Math.cos(k)) / d;
      }

      const lerp = idle ? 0.045 : 0.14;
      pointer.x += (goalX - pointer.x) * lerp;
      pointer.y += (goalY - pointer.y) * lerp;

      let v = 0;
      for (let s = 0; s < active; s++) {
        const head = heads[s];
        const c = curl(head.x, head.y, t, s + 1);
        const spread = idle ? 16 : 11;
        const tx = pointer.x + c.x * spread;
        const ty = pointer.y + c.y * spread;
        const ease = 0.09 + s * 0.005;
        head.x += (tx - head.x) * ease;
        head.y += (ty - head.y) * ease;

        const hist = strands[s];
        hist.pop();
        hist.unshift({ x: head.x, y: head.y });

        for (let i = 0; i < SEGMENTS; i++) {
          const p = hist[i];
          const n = hist[Math.min(i + 1, SEGMENTS - 1)];
          let dx = n.x - p.x;
          let dy = n.y - p.y;
          const len = Math.hypot(dx, dy) || 1;
          dx /= len;
          dy /= len;
          const life = 1 - i / SEGMENTS;
          // Wider ribbons when actively moving; longer, brighter tail in idle
          const width = (2.2 + 7.2 * life * life) * (idle ? 1.0 : 1.5) * (1 - s * 0.03);
          const nxp = -dy * width;
          const nyp = dx * width;
          const a = Math.pow(life, idle ? 1.35 : 1.7) * (idle ? 0.75 : 0.6);

          posArr[v * 2] = (p.x + nxp) * dpr;
          posArr[v * 2 + 1] = (p.y + nyp) * dpr;
          alphaArr[v] = a;
          v++;
          posArr[v * 2] = (p.x - nxp) * dpr;
          posArr[v * 2 + 1] = (p.y - nyp) * dpr;
          alphaArr[v] = a;
          v++;
        }
      }


      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE); // additive bloom

      gl.uniform2f(uRes, canvas.width, canvas.height);

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, posArr, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuf);
      gl.bufferData(gl.ARRAY_BUFFER, alphaArr, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aAlpha);
      gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, 0, 0);

      // two passes: soft wide bloom + bright core
      for (let pass = 0; pass < 2; pass++) {
        gl.uniform1f(uBoost, pass === 0 ? 0.30 : 1.0);
        for (let s = 0; s < active; s++) {
          const c = STRAND_COLORS[s % STRAND_COLORS.length];
          gl.uniform3f(uColor, c[0], c[1], c[2]);
          gl.drawArrays(gl.TRIANGLE_STRIP, s * vertsPerStrand, vertsPerStrand);
        }
      }
    };

    if (!reduceMotion) raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -10,
        pointerEvents: "none",
      }}
    />
  );
};

export default FluidCursor;
