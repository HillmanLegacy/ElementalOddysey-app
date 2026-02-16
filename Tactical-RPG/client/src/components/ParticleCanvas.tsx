import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  shape: "circle" | "spark" | "trail";
}

interface ParticleCanvasProps {
  colors?: string[];
  count?: number;
  speed?: number;
  className?: string;
  style?: "ambient" | "burst" | "swirl" | "rain";
}

export default function ParticleCanvas({
  colors = ["#a855f7", "#3b82f6", "#ef4444", "#22c55e", "#eab308"],
  count = 60,
  speed = 1,
  className = "",
  style = "ambient",
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const createParticle = useCallback(
    (w: number, h: number): Particle => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shapes: Particle["shape"][] = ["circle", "spark", "trail"];

      if (style === "swirl") {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.min(w, h) * 0.3;
        return {
          x: w / 2 + Math.cos(angle) * radius,
          y: h / 2 + Math.sin(angle) * radius,
          vx: Math.cos(angle + Math.PI / 2) * speed * 0.5,
          vy: Math.sin(angle + Math.PI / 2) * speed * 0.5,
          life: 0,
          maxLife: 120 + Math.random() * 200,
          size: 1 + Math.random() * 3,
          color,
          alpha: 0.3 + Math.random() * 0.7,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        };
      }

      if (style === "rain") {
        return {
          x: Math.random() * w,
          y: -10,
          vx: (Math.random() - 0.5) * speed * 0.3,
          vy: 1 + Math.random() * speed * 2,
          life: 0,
          maxLife: h / (1 + Math.random() * speed),
          size: 1 + Math.random() * 2,
          color,
          alpha: 0.4 + Math.random() * 0.6,
          shape: "trail",
        };
      }

      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed * 0.5,
        vy: (Math.random() - 0.5) * speed * 0.5 - 0.3,
        life: 0,
        maxLife: 150 + Math.random() * 250,
        size: 1 + Math.random() * 3,
        color,
        alpha: 0.2 + Math.random() * 0.6,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      };
    },
    [colors, speed, style]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas.offsetWidth, canvas.offsetHeight)
    );

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        const fadeIn = Math.min(1, p.life / 20);
        const fadeOut = Math.max(0, 1 - (lifeRatio - 0.7) / 0.3);
        const currentAlpha = p.alpha * fadeIn * (lifeRatio > 0.7 ? fadeOut : 1);

        if (p.life >= p.maxLife || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          particlesRef.current[i] = createParticle(w, h);
          continue;
        }

        ctx.globalAlpha = currentAlpha;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          grad.addColorStop(0, p.color + "66");
          grad.addColorStop(1, p.color + "00");
          ctx.fillStyle = grad;
          ctx.fill();
        } else if (p.shape === "spark") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size, p.y);
          ctx.lineTo(p.x + p.size, p.y);
          ctx.moveTo(p.x, p.y - p.size);
          ctx.lineTo(p.x, p.y + p.size);
          ctx.stroke();
        } else {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
