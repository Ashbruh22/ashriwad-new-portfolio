'use client';

// Vendored WebGL "neural vortex" cursor-reactive shader background.
// Adapted for this codebase:
//   • 'use client' + full TypeScript (refs/params were untyped in the source
//     snippet); the touch listener is now named so it can actually be removed
//     in cleanup (the original passed an inline arrow to addEventListener and
//     never held a reference to remove it).
//   • wired to the site's mounted + reduced-motion + aria-hidden gating,
//     matching DotBackground.tsx/FlowField.tsx — the reduced-motion e2e check
//     (canvas count must drop to 0) needs a full unmount, not a CSS hide.
//   • the demo's placeholder hero copy/`<style jsx>` block was NOT ported —
//     this file is the background layer only; Hero.tsx composes it with the
//     site's real name/role/tagline/CTAs. A second <h1> here would also have
//     broken e2e/a11y.spec.ts's "exactly one h1" assertion.
//   • resizeCanvas sizes to the parent element (the Hero section) instead of
//     the whole window — this canvas is section-scoped, not a page-level
//     fixed layer like FlowField.
//   • pointer-events-none so the canvas never blocks the hero CTAs it sits under.
//   • WebGL context-loss recovery + a visibility-based render pause (see the
//     block near the bottom of the effect) — added after a real bug report:
//     on mobile, scrolling this canvas out of view and back left the
//     animation stuttering/frozen until a full page reload. Mobile browsers
//     can silently reclaim a WebGL context from an off-screen canvas to save
//     memory/power; without a `webglcontextlost`/`webglcontextrestored`
//     handler, the render loop just keeps calling into a dead context
//     forever (nothing throws — it silently stops actually drawing).
//     Pausing the loop while off-screen (mirroring DotBackground.tsx's own
//     IntersectionObserver-on-#hero pattern) both saves GPU/battery and
//     makes the browser less likely to reclaim the context in the first
//     place; the context-loss handler is the actual fix for if it happens
//     anyway.
import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';

const vsSource = `
  precision mediump float;
  attribute vec2 a_position;
  varying vec2 vUv;
  void main() {
    vUv = .5 * (a_position + 1.);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_ratio;
  uniform vec2 u_pointer_position;
  uniform float u_scroll_progress;

  vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
  }

  float neuro_shape(vec2 uv, float t, float p) {
    vec2 sine_acc = vec2(0.);
    vec2 res = vec2(0.);
    float scale = 8.;
    for (int j = 0; j < 15; j++) {
      uv = rotate(uv, 1.);
      sine_acc = rotate(sine_acc, 1.);
      vec2 layer = uv * scale + float(j) + sine_acc - t;
      sine_acc += sin(layer) + 2.4 * p;
      res += (.5 + .5 * cos(layer)) / scale;
      scale *= (1.2);
    }
    return res.x + res.y;
  }

  void main() {
    vec2 uv = .5 * vUv;
    uv.x *= u_ratio;
    vec2 pointer = vUv - u_pointer_position;
    pointer.x *= u_ratio;
    float p = clamp(length(pointer), 0., 1.);
    p = .5 * pow(1. - p, 2.);
    float t = .001 * u_time;
    vec3 color = vec3(0.);
    float noise = neuro_shape(uv, t, p);
    noise = 1.2 * pow(noise, 3.);
    noise += pow(noise, 10.);
    noise = max(.0, noise - .5);
    noise *= (1. - length(vUv - .5));
    color = vec3(0.5, 0.15, 0.65);
    color = mix(color, vec3(0.02, 0.7, 0.9), 0.32 + 0.16 * sin(2.0 * u_scroll_progress + 1.2));
    color += vec3(0.15, 0.0, 0.6) * sin(2.0 * u_scroll_progress + 1.5);
    color = color * noise;
    gl_FragColor = vec4(color, noise);
  }
`;

function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function NeuralVortexBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, tX: 0, tY: 0 });
  const animationRef = useRef<number | null>(null);
  const { isReducedMotion } = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!mounted || isReducedMotion) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    // `let`, not `const` — (re)assigned by `setup()` below, which runs again
    // on `webglcontextrestored`. `render`/`resizeCanvas` close over these by
    // reference, so they always see whatever `setup()` most recently built.
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uRatio: WebGLUniformLocation | null = null;
    let uPointerPosition: WebGLUniformLocation | null = null;
    let uScrollProgress: WebGLUniformLocation | null = null;
    let isVisible = true;

    const resizeCanvas = () => {
      if (!gl) return;
      const parent = canvasEl.parentElement;
      const w = parent?.clientWidth ?? window.innerWidth;
      const h = parent?.clientHeight ?? window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasEl.width = w * dpr;
      canvasEl.height = h * dpr;
      gl.viewport(0, 0, canvasEl.width, canvasEl.height);
      gl.uniform1f(uRatio, canvasEl.width / canvasEl.height);
    };

    const render = () => {
      if (!gl || !program) return;
      const currentTime = performance.now();

      pointer.current.x += (pointer.current.tX - pointer.current.x) * 0.2;
      pointer.current.y += (pointer.current.tY - pointer.current.y) * 0.2;

      gl.uniform1f(uTime, currentTime);
      gl.uniform2f(
        uPointerPosition,
        pointer.current.x / window.innerWidth,
        1 - pointer.current.y / window.innerHeight,
      );
      gl.uniform1f(uScrollProgress, window.pageYOffset / (2 * window.innerHeight));

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    };

    const stopRender = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const startRender = () => {
      stopRender();
      animationRef.current = requestAnimationFrame(render);
    };

    // Full pipeline (re)build — runs on mount, and again on
    // `webglcontextrestored`: a restored context has none of its previous
    // shaders/program/buffers, they all need recompiling from scratch
    // against the (same, now-live-again) context object.
    const setup = () => {
      gl = (canvasEl.getContext('webgl') ?? canvasEl.getContext('experimental-webgl')) as
        | WebGLRenderingContext
        | null;
      if (!gl) {
        console.error('WebGL not supported');
        return;
      }

      vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
      fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
      if (!vertexShader || !fragmentShader) return;

      program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
      }
      gl.useProgram(program);

      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      uTime = gl.getUniformLocation(program, 'u_time');
      uRatio = gl.getUniformLocation(program, 'u_ratio');
      uPointerPosition = gl.getUniformLocation(program, 'u_pointer_position');
      uScrollProgress = gl.getUniformLocation(program, 'u_scroll_progress');

      resizeCanvas();
      if (isVisible) startRender();
    };

    // `preventDefault()` here is required by the WebGL spec — without it,
    // the browser treats the context as permanently gone and never fires
    // `webglcontextrestored` at all.
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      stopRender();
    };
    const handleContextRestored = () => {
      setup();
    };
    canvasEl.addEventListener('webglcontextlost', handleContextLost, false);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored, false);

    // Pause/resume purely based on whether the canvas is actually on
    // screen — same `{ threshold: 0 }` IntersectionObserver pattern
    // DotBackground.tsx already uses for its own Hero-visibility check.
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startRender();
        else stopRender();
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(canvasEl);

    setup();
    window.addEventListener('resize', resizeCanvas);

    const handlePointerMove = (e: MouseEvent) => {
      pointer.current.tX = e.clientX;
      pointer.current.tY = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        pointer.current.tX = e.touches[0].clientX;
        pointer.current.tY = e.touches[0].clientY;
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
      canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);
      visibilityObserver.disconnect();
      stopRender();
      if (gl) {
        if (program) gl.deleteProgram(program);
        if (vertexShader) gl.deleteShader(vertexShader);
        if (fragmentShader) gl.deleteShader(fragmentShader);
      }
    };
  }, [mounted, isReducedMotion]);

  if (!mounted || isReducedMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full opacity-90" />
    </div>
  );
}
