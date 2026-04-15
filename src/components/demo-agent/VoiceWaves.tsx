import { useRef, useEffect, useCallback } from "react";

type AgentState = "idle" | "listening" | "processing" | "speaking";

interface VoiceWavesProps {
  agentState: AgentState;
}

/* Color profiles per state */
interface ColorProfile {
  inner: [number, number, number];
  outer: [number, number, number];
  glow: [number, number, number];
  glowAlpha: number;
  waveCount: number;
  baseAmplitude: number;
  amplitudeGrowth: number;
  speed: number;
  lineWidth: number;
  freq: number;
  fillAlpha: number;
}

const PROFILES: Record<AgentState, ColorProfile> = {
  idle: {
    inner: [107, 63, 160],
    outer: [155, 107, 138],
    glow: [61, 32, 102],
    glowAlpha: 0.08,
    waveCount: 4,
    baseAmplitude: 2,
    amplitudeGrowth: 1,
    speed: 0.8,
    lineWidth: 1.2,
    freq: 4,
    fillAlpha: 0.05,
  },
  listening: {
    inner: [155, 107, 138],   // #9B6B8A mauve
    outer: [184, 125, 94],    // #B87D5E bronze
    glow: [155, 107, 138],
    glowAlpha: 0.18,
    waveCount: 4,
    baseAmplitude: 3,
    amplitudeGrowth: 1.5,
    speed: 1.2,
    lineWidth: 1.5,
    freq: 3,
    fillAlpha: 0.06,
  },
  processing: {
    inner: [107, 63, 160],    // #6B3FA0
    outer: [61, 32, 102],     // #3D2066
    glow: [107, 63, 160],
    glowAlpha: 0.25,
    waveCount: 6,
    baseAmplitude: 4,
    amplitudeGrowth: 2,
    speed: 3.5,
    lineWidth: 1.4,
    freq: 7,
    fillAlpha: 0.04,
  },
  speaking: {
    inner: [61, 32, 102],     // #3D2066
    outer: [16, 185, 129],    // #10B981
    glow: [107, 63, 160],
    glowAlpha: 0.3,
    waveCount: 5,
    baseAmplitude: 8,
    amplitudeGrowth: 4,
    speed: 3,
    lineWidth: 2.5,
    freq: 6,
    fillAlpha: 0.08,
  },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/**
 * Canvas-based concentric wave animation with 3 distinct visual states.
 */
const VoiceWaves = ({ agentState }: VoiceWavesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(agentState);
  stateRef.current = agentState;

  // Smooth interpolation state
  const currentRef = useRef({
    inner: [...PROFILES.idle.inner] as [number, number, number],
    outer: [...PROFILES.idle.outer] as [number, number, number],
    glow: [...PROFILES.idle.glow] as [number, number, number],
    glowAlpha: PROFILES.idle.glowAlpha,
    baseAmplitude: PROFILES.idle.baseAmplitude,
    amplitudeGrowth: PROFILES.idle.amplitudeGrowth,
    speed: PROFILES.idle.speed,
    lineWidth: PROFILES.idle.lineWidth,
    freq: PROFILES.idle.freq,
    fillAlpha: PROFILES.idle.fillAlpha,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H / 2;
    const now = performance.now() / 1000;
    const state = stateRef.current;
    const target = PROFILES[state];
    const cur = currentRef.current;

    // Smooth lerp towards target (≈60fps → t=0.06 per frame)
    const t = 0.06;
    cur.inner = lerpColor(cur.inner, target.inner, t);
    cur.outer = lerpColor(cur.outer, target.outer, t);
    cur.glow = lerpColor(cur.glow, target.glow, t);
    cur.glowAlpha = lerp(cur.glowAlpha, target.glowAlpha, t);
    cur.baseAmplitude = lerp(cur.baseAmplitude, target.baseAmplitude, t);
    cur.amplitudeGrowth = lerp(cur.amplitudeGrowth, target.amplitudeGrowth, t);
    cur.speed = lerp(cur.speed, target.speed, t);
    cur.lineWidth = lerp(cur.lineWidth, target.lineWidth, t);
    cur.freq = lerp(cur.freq, target.freq, t);
    cur.fillAlpha = lerp(cur.fillAlpha, target.fillAlpha, t);

    ctx.clearRect(0, 0, W, H);

    const waveCount = target.waveCount;
    const baseRadius = 58;
    const maxRadius = Math.min(cx, cy) - 8;

    for (let i = 0; i < waveCount; i++) {
      const progress = i / waveCount;
      const radius = baseRadius + (maxRadius - baseRadius) * progress;

      const amplitude = cur.baseAmplitude + i * cur.amplitudeGrowth;
      const speed = cur.speed + (state === "speaking" ? i * 0.3 : 0);

      // Alpha: inner waves more visible
      const alpha = Math.max(0.04, (state === "speaking" ? 0.45 : 0.3) - progress * 0.22);

      // Processing shimmer: every 3rd wave brighter
      const shimmer = state === "processing" && i % 3 === 0 ? 1.4 : 1;

      const points = 128;
      ctx.beginPath();

      for (let j = 0; j <= points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const f = cur.freq + i;

        // 3 harmonics for organic shape
        const h1 = Math.sin(angle * f + now * speed) * amplitude * 0.55;
        const h2 = Math.sin(angle * (f + 3) - now * speed * 0.7) * amplitude * 0.3;
        const h3 = Math.sin(angle * (f * 2 + 1) + now * speed * 0.4) * amplitude * 0.15;

        // Processing: add rotation offset
        const rotationOffset = state === "processing" ? now * 0.5 : 0;
        const r = radius + h1 + h2 + h3;
        const x = cx + Math.cos(angle + rotationOffset) * r;
        const y = cy + Math.sin(angle + rotationOffset) * r;

        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();

      // Color mix: inner → outer based on progress
      // Speaking: add emerald on outer rings
      let color: [number, number, number];
      if (state === "speaking" && progress > 0.5) {
        const mauveMiddle: [number, number, number] = [155, 107, 138];
        const emeraldOuter: [number, number, number] = [16, 185, 129];
        const outerT = (progress - 0.5) * 2;
        color = lerpColor(mauveMiddle, emeraldOuter, outerT);
      } else {
        color = lerpColor(cur.inner, cur.outer, progress);
      }

      const [r, g, b] = color;
      ctx.strokeStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha * shimmer})`;
      ctx.lineWidth = cur.lineWidth;
      ctx.stroke();

      // Fill inner rings
      if (i < 2) {
        ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${cur.fillAlpha})`;
        ctx.fill();
      }
    }

    // Center glow
    const [gr, gg, gb] = cur.glow;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
    grad.addColorStop(0, `rgba(${Math.round(gr)},${Math.round(gg)},${Math.round(gb)},${cur.glowAlpha})`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }, []);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: 280, height: 280 }}
    />
  );
};

export default VoiceWaves;
