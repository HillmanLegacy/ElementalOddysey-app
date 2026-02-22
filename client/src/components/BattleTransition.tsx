import { useEffect, useRef } from "react";

interface BattleTransitionProps {
  onComplete: () => void;
  direction?: "in" | "out";
  elementColor?: string;
}

const DURATION = 800;
const PIXEL_SIZE = 16;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  shape: "spark" | "ember" | "crystal" | "wisp";
}

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

function createParticles(w: number, h: number, color: string, count: number): Particle[] {
  const rgb = hexToRgb(color);
  const particles: Particle[] = [];
  const shapes: Particle["shape"][] = ["spark", "ember", "crystal", "wisp"];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 120;
    const variation = Math.floor(Math.random() * 60) - 30;
    const r2 = Math.min(255, Math.max(0, rgb.r + variation));
    const g2 = Math.min(255, Math.max(0, rgb.g + variation));
    const b2 = Math.min(255, Math.max(0, rgb.b + variation));

    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      size: 2 + Math.random() * 5,
      life: 0.2 + Math.random() * 0.8,
      maxLife: 0.2 + Math.random() * 0.8,
      color: `rgb(${r2}, ${g2}, ${b2})`,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    });
  }
  return particles;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, alpha: number) {
  const a = alpha * (p.life / p.maxLife);
  if (a <= 0) return;

  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(p.x, p.y);

  switch (p.shape) {
    case "spark":
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fillRect(-p.size / 2, -1, p.size, 2);
      ctx.fillRect(-1, -p.size / 2, 2, p.size);
      break;

    case "ember":
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "crystal":
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.6, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      break;

    case "wisp":
      ctx.strokeStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-p.size, p.size * 0.5);
      ctx.quadraticCurveTo(0, -p.size, p.size, p.size * 0.5);
      ctx.stroke();
      break;
  }

  ctx.restore();
}

export default function BattleTransition({ onComplete, direction = "in", elementColor }: BattleTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);
  const orderRef = useRef<number[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    const cols = Math.ceil(w / PIXEL_SIZE);
    const rows = Math.ceil(h / PIXEL_SIZE);
    const total = cols * rows;

    const indices = Array.from({ length: total }, (_, i) => i);
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    orderRef.current = indices;

    if (elementColor) {
      particlesRef.current = createParticles(w, h, elementColor, 80);
    }

    completedRef.current = false;
    startTimeRef.current = performance.now();
    let lastTime = startTimeRef.current;
    let animId: number;

    const draw = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const t = Math.min(elapsed / DURATION, 1);

      if (direction === "in") {
        ctx.clearRect(0, 0, w, h);

        if (elementColor && t < 0.85) {
          const particleAlpha = t < 0.5 ? t * 2 : Math.max(0, 1 - (t - 0.5) * 3);
          const rgb = hexToRgb(elementColor);

          if (t > 0.1 && t < 0.6) {
            const glowT = (t - 0.1) / 0.5;
            const glowAlpha = glowT < 0.5 ? glowT * 0.15 : 0.15 * (1 - (glowT - 0.5) * 2);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowAlpha})`;
            ctx.fillRect(0, 0, w, h);
          }

          particlesRef.current.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 15 * dt;
            p.life -= dt;

            if (p.life <= 0) {
              p.x = Math.random() * w;
              p.y = Math.random() * h;
              p.life = p.maxLife;
              p.vy = -30 - Math.random() * 60;
              p.vx = (Math.random() - 0.5) * 80;
            }

            drawParticle(ctx, p, particleAlpha);
          });
        }

        ctx.fillStyle = elementColor
          ? `rgba(0, 0, 0, 1)`
          : "#000";
        const count = Math.floor(t * total);
        for (let i = 0; i < count; i++) {
          const idx = orderRef.current[i];
          const col = idx % cols;
          const row = Math.floor(idx / cols);

          if (elementColor && i > count * 0.7) {
            const rgb = hexToRgb(elementColor);
            const edgeFade = (i - count * 0.7) / (count * 0.3);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.3 * (1 - edgeFade)})`;
            ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
          }

          ctx.fillStyle = "#000";
          ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);

        const count = Math.floor(t * total);
        for (let i = 0; i < count; i++) {
          const idx = orderRef.current[i];
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          ctx.clearRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }

        if (elementColor && t > 0.15) {
          const particleAlpha = t < 0.6 ? (t - 0.15) * 2.2 : Math.max(0, 1 - (t - 0.6) * 2.5);
          const rgb = hexToRgb(elementColor);

          if (t > 0.2 && t < 0.7) {
            const glowT = (t - 0.2) / 0.5;
            const glowAlpha = glowT < 0.5 ? glowT * 0.12 : 0.12 * (1 - (glowT - 0.5) * 2);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowAlpha})`;
            ctx.fillRect(0, 0, w, h);
          }

          particlesRef.current.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 15 * dt;
            p.life -= dt;

            if (p.life <= 0) {
              p.x = Math.random() * w;
              p.y = Math.random() * h;
              p.life = p.maxLife;
              p.vy = -30 - Math.random() * 60;
              p.vx = (Math.random() - 0.5) * 80;
            }

            drawParticle(ctx, p, particleAlpha);
          });
        }
      }

      if (t < 1) {
        animId = requestAnimationFrame(draw);
      } else {
        if (direction === "in") {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, w, h);
        } else {
          ctx.clearRect(0, 0, w, h);
        }
        if (!completedRef.current) {
          completedRef.current = true;
          setTimeout(() => onCompleteRef.current(), 50);
        }
      }
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [direction, elementColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 999, pointerEvents: "all" }}
    />
  );
}
