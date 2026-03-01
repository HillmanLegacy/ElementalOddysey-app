import { useRef, useEffect } from "react";
import lavaBattleBg from "@assets/Lava_Stage_Battle_Screen_upscayl_2x_upscayl-standard-4x_1772324871274.png";

export default function LavaBattleBg() {
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(performance.now());

  useEffect(() => {
    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000;

      if (farRef.current) {
        const dx = Math.sin(t * 0.18) * 6;
        const dy = Math.cos(t * 0.13) * 3;
        farRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
      }

      if (midRef.current) {
        const dx = Math.sin(t * 0.27 + 1.2) * 10;
        const dy = Math.cos(t * 0.19 + 0.8) * 4;
        midRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
        midRef.current.style.opacity = String(0.55 + 0.12 * Math.sin(t * 0.6));
      }

      if (nearRef.current) {
        const dx = Math.sin(t * 0.41 + 2.1) * 14;
        nearRef.current.style.transform = `translateX(${dx}px)`;
        nearRef.current.style.opacity = String(0.35 + 0.12 * Math.sin(t * 0.9 + 0.5));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div
        ref={farRef}
        style={{
          position: "absolute",
          inset: "-4px",
          willChange: "transform",
        }}
      >
        <img
          src={lavaBattleBg}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            imageRendering: "auto",
            display: "block",
            filter: "url(#heat-shimmer)",
          }}
        />
      </div>

      <div
        ref={midRef}
        style={{
          position: "absolute",
          inset: "-6px",
          willChange: "transform, opacity",
          background: "radial-gradient(ellipse 70% 50% at 35% 70%, rgba(255,60,0,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 75% 60%, rgba(255,120,0,0.12) 0%, transparent 55%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <div
        ref={nearRef}
        style={{
          position: "absolute",
          inset: "-8px",
          willChange: "transform, opacity",
          background: "radial-gradient(ellipse 40% 30% at 55% 80%, rgba(255,40,0,0.14) 0%, transparent 60%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(255,80,20,0.06) 0%, rgba(0,0,0,0.12) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
