import { useEffect, useRef } from "react";

interface AuroraBackgroundProps {
  className?: string;
  variant?: "violet" | "warm";
}

const AuroraBackground = ({ className = "", variant = "violet" }: AuroraBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio > 1 ? 1.5 : 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio > 1 ? 1.5 : 1);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMove);

    const colors = variant === "violet"
      ? [
          [124, 58, 237, 0.08],   // violet
          [219, 39, 119, 0.06],   // pink
          [196, 181, 253, 0.05],  // lavender
        ]
      : [
          [217, 168, 67, 0.06],   // gold
          [219, 39, 119, 0.05],   // pink
          [124, 58, 237, 0.04],   // violet
        ];

    const blobs = colors.map((c, i) => ({
      x: 0.3 + i * 0.2,
      y: 0.3 + i * 0.15,
      r: 0.35 + i * 0.05,
      vx: (0.0003 + i * 0.0001) * (i % 2 === 0 ? 1 : -1),
      vy: (0.0002 + i * 0.0001) * (i % 2 === 0 ? -1 : 1),
      color: c,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      blobs.forEach((b) => {
        b.x += b.vx + (mx - 0.5) * 0.0005;
        b.y += b.vy + (my - 0.5) * 0.0005;

        if (b.x < 0 || b.x > 1) b.vx *= -1;
        if (b.y < 0 || b.y > 1) b.vy *= -1;

        const gradient = ctx.createRadialGradient(
          b.x * w, b.y * h, 0,
          b.x * w, b.y * h, b.r * Math.max(w, h)
        );
        const [r, g, bl, a] = b.color;
        gradient.addColorStop(0, `rgba(${r},${g},${bl},${a})`);
        gradient.addColorStop(1, `rgba(${r},${g},${bl},0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 1 }}
    />
  );
};

export default AuroraBackground;
