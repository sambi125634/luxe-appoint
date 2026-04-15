import { useRef, useEffect, useCallback } from "react";

interface VoiceWavesProps {
  speaking: boolean;
  active: boolean;
  connecting?: boolean;
}

/**
 * Canvas-based concentric wave animation.
 * Gentle idle pulse → energetic ripples when agent speaks.
 */
const VoiceWaves = ({ speaking, active, connecting }: VoiceWavesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speakingRef = useRef(speaking);
  const activeRef = useRef(active);
  const connectingRef = useRef(connecting);

  speakingRef.current = speaking;
  activeRef.current = active;
  connectingRef.current = connecting;

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
    const isSpeaking = speakingRef.current;
    const isActive = activeRef.current;
    const isConnecting = connectingRef.current;

    ctx.clearRect(0, 0, W, H);

    // Draw multiple wave rings
    const waveCount = 5;
    const baseRadius = 60;
    const maxRadius = Math.min(cx, cy) - 10;

    for (let i = 0; i < waveCount; i++) {
      const progress = i / waveCount;
      const radius = baseRadius + (maxRadius - baseRadius) * progress;

      // Amplitude depends on state
      let amplitude: number;
      let speed: number;
      let alpha: number;

      if (isConnecting) {
        amplitude = 3 + i * 1.5;
        speed = 2.5;
        alpha = 0.25 - progress * 0.15;
      } else if (isActive && isSpeaking) {
        amplitude = 8 + i * 4;
        speed = 3 + i * 0.3;
        alpha = 0.4 - progress * 0.25;
      } else if (isActive) {
        amplitude = 3 + i * 2;
        speed = 1.5;
        alpha = 0.2 - progress * 0.12;
      } else {
        amplitude = 2 + i * 1;
        speed = 0.8;
        alpha = 0.12 - progress * 0.08;
      }

      const points = 120;
      ctx.beginPath();

      for (let j = 0; j <= points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const freqMod = isSpeaking ? 6 + i * 2 : 4 + i;
        const wave =
          Math.sin(angle * freqMod + now * speed) * amplitude * 0.6 +
          Math.sin(angle * (freqMod + 3) - now * speed * 0.7) * amplitude * 0.4;
        const r = radius + wave;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();

      // Purple → mauve gradient for each ring
      const purpleR = 107, purpleG = 63, purpleB = 160;
      const mauveR = 155, mauveG = 107, mauveB = 138;
      const mixR = Math.round(purpleR + (mauveR - purpleR) * progress);
      const mixG = Math.round(purpleG + (mauveG - purpleG) * progress);
      const mixB = Math.round(purpleB + (mauveB - purpleB) * progress);

      ctx.strokeStyle = `rgba(${mixR},${mixG},${mixB},${alpha})`;
      ctx.lineWidth = isSpeaking ? 2 : 1.5;
      ctx.stroke();

      // Subtle fill on inner rings
      if (i < 2) {
        ctx.fillStyle = `rgba(${mixR},${mixG},${mixB},${alpha * 0.08})`;
        ctx.fill();
      }
    }

    // Center glow
    const glowAlpha = isSpeaking ? 0.25 : isActive ? 0.15 : 0.08;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
    grad.addColorStop(0, `rgba(107,63,160,${glowAlpha})`);
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
