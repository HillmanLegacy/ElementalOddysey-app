import { useEffect, useRef, useCallback } from "react";

interface BattleTransitionProps {
  originX: number;
  originY: number;
  elementColor: string;
  onComplete: () => void;
}

interface Shard {
  x: number;
  y: number;
  size: number;
  angle: number;
  speed: number;
  rotSpeed: number;
  rot: number;
  opacity: number;
  color: string;
}

interface Fracture {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  speed: number;
  width: number;
  branches: { endX: number; endY: number; progress: number }[];
}

const DURATION = 2800;

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

export default function BattleTransition({ originX, originY, elementColor, onComplete }: BattleTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const shardsRef = useRef<Shard[]>([]);
  const fracturesRef = useRef<Fracture[]>([]);
  const completedRef = useRef(false);

  const initParticles = useCallback((w: number, h: number, cx: number, cy: number) => {
    const rgb = hexToRgb(elementColor);
    const shards: Shard[] = [];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 120;
      shards.push({
        x: cx + Math.cos(angle) * dist * 0.3,
        y: cy + Math.sin(angle) * dist * 0.3,
        size: 3 + Math.random() * 12,
        angle,
        speed: 80 + Math.random() * 200,
        rotSpeed: (Math.random() - 0.5) * 8,
        rot: Math.random() * Math.PI * 2,
        opacity: 0.7 + Math.random() * 0.3,
        color: `rgba(${rgb.r + Math.random() * 40}, ${rgb.g + Math.random() * 40}, ${rgb.b + Math.random() * 40}, 1)`,
      });
    }
    shardsRef.current = shards;

    const fractures: Fracture[] = [];
    for (let i = 0; i < 12; i++) {
      const fAngle = Math.random() * Math.PI * 2;
      const fLen = 100 + Math.random() * Math.max(w, h) * 0.5;
      const fx = cx + Math.cos(fAngle) * fLen;
      const fy = cy + Math.sin(fAngle) * fLen;
      const branches: { endX: number; endY: number; progress: number }[] = [];
      const branchCount = 1 + Math.floor(Math.random() * 3);
      for (let b = 0; b < branchCount; b++) {
        const bMid = 0.3 + Math.random() * 0.5;
        const bAngle = fAngle + (Math.random() - 0.5) * 1.2;
        const bLen = 30 + Math.random() * 80;
        branches.push({
          endX: (cx + Math.cos(fAngle) * fLen * bMid) + Math.cos(bAngle) * bLen,
          endY: (cy + Math.sin(fAngle) * fLen * bMid) + Math.sin(bAngle) * bLen,
          progress: 0,
        });
      }
      fractures.push({
        startX: cx,
        startY: cy,
        endX: fx,
        endY: fy,
        progress: 0,
        speed: 1.5 + Math.random() * 2,
        width: 1 + Math.random() * 2,
        branches,
      });
    }
    fracturesRef.current = fractures;
  }, [elementColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    const cx = originX * w / 100;
    const cy = originY * h / 100;

    initParticles(w, h, cx, cy);
    startTimeRef.current = performance.now();

    const rgb = hexToRgb(elementColor);
    const maxRadius = Math.sqrt(w * w + h * h);

    let animId: number;

    const draw = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      ctx.clearRect(0, 0, w, h);

      if (t < 0.12) {
        const pt = t / 0.12;
        const pulseR = pt * 60;
        const pulseAlpha = 0.9 * (1 - pt * 0.3);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
        grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${pulseAlpha})`);
        grad.addColorStop(0.5, `rgba(255, 255, 255, ${pulseAlpha * 0.6})`);
        grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.fill();
      }

      if (t >= 0.08 && t < 0.45) {
        const rt = (t - 0.08) / 0.37;
        const rippleR = rt * maxRadius * 0.6;
        const rippleWidth = 4 + rt * 8;
        const rippleAlpha = 0.8 * (1 - rt);

        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rippleAlpha})`;
        ctx.lineWidth = rippleWidth;
        ctx.beginPath();
        ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
        ctx.stroke();

        if (rt > 0.3) {
          const r2 = (rt - 0.3) / 0.7 * maxRadius * 0.5;
          const a2 = 0.5 * (1 - (rt - 0.3) / 0.7);
          ctx.strokeStyle = `rgba(255, 255, 255, ${a2 * 0.4})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (t >= 0.1 && t < 0.65) {
        const dt = Math.min((t - 0.1) / 0.35, 1);
        const vignette = ctx.createRadialGradient(cx, cy, maxRadius * 0.15 * (1 - dt * 0.5), cx, cy, maxRadius * (0.5 + dt * 0.5));
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(0.6, `rgba(0,0,0,${dt * 0.7})`);
        vignette.addColorStop(1, `rgba(0,0,0,${dt * 0.95})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);

        const glowR = 40 + dt * 80;
        const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.3 * dt})`);
        glowGrad.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 * dt})`);
        glowGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      if (t >= 0.15 && t < 0.6) {
        const ft = (t - 0.15) / 0.45;
        ctx.save();
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
        ctx.shadowBlur = 6;
        fracturesRef.current.forEach(f => {
          f.progress = Math.min(f.progress + 0.035 * f.speed, 1);
          const prog = f.progress;

          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.6 + Math.random() * 0.3) * (1 - ft * 0.5)})`;
          ctx.lineWidth = f.width;
          ctx.beginPath();
          ctx.moveTo(f.startX, f.startY);
          ctx.lineTo(
            f.startX + (f.endX - f.startX) * prog,
            f.startY + (f.endY - f.startY) * prog,
          );
          ctx.stroke();

          f.branches.forEach(b => {
            b.progress = Math.min(b.progress + 0.025 * f.speed, prog * 0.8);
            if (b.progress > 0) {
              const bsx = f.startX + (f.endX - f.startX) * 0.4;
              const bsy = f.startY + (f.endY - f.startY) * 0.4;
              ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.4 * (1 - ft * 0.5)})`;
              ctx.lineWidth = f.width * 0.6;
              ctx.beginPath();
              ctx.moveTo(bsx, bsy);
              ctx.lineTo(
                bsx + (b.endX - bsx) * b.progress,
                bsy + (b.endY - bsy) * b.progress,
              );
              ctx.stroke();
            }
          });
        });
        ctx.restore();
      }

      if (t >= 0.35 && t < 0.65) {
        const et = (t - 0.35) / 0.3;
        const expandR = 40 + et * maxRadius * 0.4;
        const expandGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, expandR);
        expandGrad.addColorStop(0, `rgba(255, 255, 255, ${0.4 * (1 - et)})`);
        expandGrad.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.3 * (1 - et)})`);
        expandGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = expandGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, expandR, 0, Math.PI * 2);
        ctx.fill();

        if (et > 0.3) {
          const warpT = (et - 0.3) / 0.7;
          ctx.fillStyle = `rgba(0,0,0,${warpT * 0.5})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      if (t >= 0.4 && t < 0.75) {
        const st = (t - 0.4) / 0.35;
        const dt2 = elapsed / 1000;
        shardsRef.current.forEach(shard => {
          const moveDist = st * shard.speed;
          const sx = shard.x + Math.cos(shard.angle) * moveDist;
          const sy = shard.y + Math.sin(shard.angle) * moveDist;
          shard.rot += shard.rotSpeed * 0.016;
          const alpha = shard.opacity * (1 - st);

          if (alpha <= 0) return;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(shard.rot);
          ctx.globalAlpha = alpha;

          ctx.shadowColor = shard.color;
          ctx.shadowBlur = 8;

          ctx.beginPath();
          const s = shard.size;
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.6, s * 0.3);
          ctx.lineTo(-s * 0.4, s * 0.5);
          ctx.closePath();
          ctx.fillStyle = shard.color;
          ctx.fill();

          ctx.globalAlpha = 1;
          ctx.restore();
        });
      }

      if (t >= 0.6 && t < 0.8) {
        const ft2 = (t - 0.6) / 0.2;
        const flashAlpha = ft2 < 0.5 ? ft2 * 2 : 1;
        const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * ft2);
        flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        flashGrad.addColorStop(0.3, `rgba(${rgb.r + 50}, ${rgb.g + 50}, ${rgb.b + 50}, ${flashAlpha * 0.9})`);
        flashGrad.addColorStop(0.7, `rgba(255, 255, 255, ${flashAlpha * 0.6})`);
        flashGrad.addColorStop(1, `rgba(255, 255, 255, ${flashAlpha * 0.3})`);
        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, w, h);
      }

      if (t >= 0.75 && t < 0.85) {
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(0, 0, w, h);
      }

      if (t >= 0.85) {
        const dt3 = (t - 0.85) / 0.15;
        const whiteAlpha = 1 - dt3;
        ctx.fillStyle = `rgba(0,0,0,1)`;
        ctx.fillRect(0, 0, w, h);

        if (whiteAlpha > 0) {
          ctx.fillStyle = `rgba(255,255,255,${whiteAlpha})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      if (t < 1) {
        animId = requestAnimationFrame(draw);
      } else {
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, w, h);
        if (!completedRef.current) {
          completedRef.current = true;
          setTimeout(onComplete, 100);
        }
      }
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [originX, originY, elementColor, onComplete, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 999, pointerEvents: "all" }}
    />
  );
}
