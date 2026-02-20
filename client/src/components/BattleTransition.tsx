import { useEffect, useRef } from "react";

interface BattleTransitionProps {
  onComplete: () => void;
  direction?: "in" | "out";
}

const DURATION = 800;
const PIXEL_SIZE = 16;

export default function BattleTransition({ onComplete, direction = "in" }: BattleTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);
  const orderRef = useRef<number[]>([]);

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

    startTimeRef.current = performance.now();
    let animId: number;

    const draw = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / DURATION, 1);

      if (direction === "in") {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#000";
        const count = Math.floor(t * total);
        for (let i = 0; i < count; i++) {
          const idx = orderRef.current[i];
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);
        ctx.clearRect(0, 0, 0, 0);
        const count = Math.floor(t * total);
        for (let i = 0; i < count; i++) {
          const idx = orderRef.current[i];
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          ctx.clearRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
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
          setTimeout(onComplete, 50);
        }
      }
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [onComplete, direction]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 999, pointerEvents: "all" }}
    />
  );
}
