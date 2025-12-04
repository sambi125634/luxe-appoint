import { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  swayOffset: number;
  swaySpeed: number;
  color: string;
}

const PETAL_COLORS = [
  'rgba(255, 182, 193, 0.9)',  // Light pink
  'rgba(255, 192, 203, 0.85)', // Pink
  'rgba(255, 218, 233, 0.9)',  // Soft pink
  'rgba(255, 240, 245, 0.85)', // Lavender blush
  'rgba(248, 200, 220, 0.9)',  // Rose
];

export function SakuraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create petals
    const createPetal = (startFromTop = true): Petal => ({
      x: Math.random() * canvas.width,
      y: startFromTop ? -20 : Math.random() * canvas.height,
      size: Math.random() * 12 + 8,
      speedY: Math.random() * 1.5 + 0.5,
      speedX: Math.random() * 0.5 - 0.25,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 3,
      opacity: Math.random() * 0.5 + 0.5,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    });

    // Initialize petals
    const petalCount = Math.min(50, Math.floor(canvas.width / 25));
    petalsRef.current = Array.from({ length: petalCount }, () => createPetal(false));

    // Draw petal shape
    const drawPetal = (ctx: CanvasRenderingContext2D, petal: Petal) => {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate((petal.rotation * Math.PI) / 180);
      ctx.globalAlpha = petal.opacity;
      
      // Create petal gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, petal.size);
      gradient.addColorStop(0, petal.color);
      gradient.addColorStop(0.7, petal.color.replace('0.9', '0.6').replace('0.85', '0.5'));
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      
      // Draw sakura petal shape
      ctx.beginPath();
      ctx.moveTo(0, -petal.size);
      ctx.bezierCurveTo(
        petal.size * 0.8, -petal.size * 0.8,
        petal.size * 0.8, petal.size * 0.3,
        0, petal.size * 0.5
      );
      ctx.bezierCurveTo(
        -petal.size * 0.8, petal.size * 0.3,
        -petal.size * 0.8, -petal.size * 0.8,
        0, -petal.size
      );
      ctx.closePath();
      ctx.fill();
      
      // Add subtle highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(
        -petal.size * 0.2, 
        -petal.size * 0.3, 
        petal.size * 0.15, 
        petal.size * 0.25, 
        -0.3, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.restore();
    };

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      petalsRef.current.forEach((petal, index) => {
        // Apply sway motion
        const sway = Math.sin(time * petal.swaySpeed + petal.swayOffset) * 2;
        
        // Subtle mouse interaction - petals drift away from cursor
        const dx = petal.x - mouseRef.current.x;
        const dy = petal.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = dist < 150 ? (150 - dist) / 150 : 0;
        
        // Update position
        petal.x += petal.speedX + sway * 0.3 + (dx / dist || 0) * mouseInfluence * 0.5;
        petal.y += petal.speedY;
        petal.rotation += petal.rotationSpeed;

        // Reset petal when it goes off screen
        if (petal.y > canvas.height + 20 || petal.x < -50 || petal.x > canvas.width + 50) {
          petalsRef.current[index] = createPetal(true);
        }

        drawPetal(ctx, petal);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-violet-950/30" />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-rose-400/20 rounded-full blur-3xl animate-pulse" 
          style={{ animationDuration: '4s' }} 
        />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-violet-300/25 to-purple-400/15 rounded-full blur-3xl animate-pulse" 
          style={{ animationDuration: '5s', animationDelay: '1s' }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/40 to-transparent rounded-full blur-2xl" />
      </div>
      
      {/* Sakura petals canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
      />
    </>
  );
}
