import { useRef, useEffect } from "react";

export interface UnitInfo {
  x: number;
  y: number;
  alive: boolean;
  element: string;
}

export interface BattleEffectsLayerProps {
  regionTheme?: string;
  playerElement: string;
  playerPos: { x: number; y: number };
  attackTargetPos: { x: number; y: number } | null;
  animPhase: string;
  enemyInfos: UnitInfo[];
  partyInfos: UnitInfo[];
  playerAlive: boolean;
  playerHpPct: number;
}

const ELEM_RGB: Record<string, [number, number, number]> = {
  Fire:      [255,  80,   0],
  Wind:      [ 60, 220, 100],
  Lightning: [140, 180, 255],
  Water:     [ 30, 140, 255],
  Earth:     [160, 120,  40],
  Dark:      [160,  40, 255],
  Light:     [255, 240, 100],
  Neutral:   [180, 180, 200],
};

const REGION_GRADE: Record<string, string> = {
  Fire:      "rgba(200,60,0,0.07)",
  Wind:      "rgba(40,160,80,0.05)",
  Lightning: "rgba(80,120,200,0.05)",
  Water:     "rgba(0,80,200,0.06)",
  Earth:     "rgba(100,70,20,0.05)",
};

const easeIn  = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp    = (a: number, b: number, t: number) => a + (b - a) * t;
const rgba    = (r: number, g: number, b: number, a: number) =>
  `rgba(${r},${g},${b},${a.toFixed(3)})`;

export default function BattleEffectsLayer({
  regionTheme,
  playerElement,
  playerPos,
  attackTargetPos,
  animPhase,
  enemyInfos,
  partyInfos,
  playerAlive,
  playerHpPct,
}: BattleEffectsLayerProps) {
  const lightingRef   = useRef<HTMLDivElement>(null);
  const screenGlowRef = useRef<HTMLDivElement>(null);
  const lavaBloomRef  = useRef<HTMLDivElement>(null);
  const trailRef      = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const t0          = useRef<number>(performance.now());

  const phaseStartRef    = useRef<number>(0);
  const prevPhaseRef     = useRef<string>("");
  const idlePosRef       = useRef({ x: playerPos.x, y: playerPos.y });

  const playerPosRef     = useRef(playerPos);
  const attackTargetRef  = useRef(attackTargetPos);
  const animPhaseRef     = useRef(animPhase);
  const enemyInfosRef    = useRef(enemyInfos);
  const partyInfosRef    = useRef(partyInfos);
  const playerAliveRef   = useRef(playerAlive);
  const playerHpPctRef   = useRef(playerHpPct);
  const regionRef        = useRef(regionTheme);
  const playerElemRef    = useRef(playerElement);

  playerPosRef.current    = playerPos;
  attackTargetRef.current = attackTargetPos;
  animPhaseRef.current    = animPhase;
  enemyInfosRef.current   = enemyInfos;
  partyInfosRef.current   = partyInfos;
  playerAliveRef.current  = playerAlive;
  playerHpPctRef.current  = playerHpPct;
  regionRef.current       = regionTheme;
  playerElemRef.current   = playerElement;

  if (animPhase !== prevPhaseRef.current) {
    if (animPhase === "runToEnemy" || animPhase === "runBack") {
      phaseStartRef.current = performance.now();
    }
    if (animPhase === "idle") {
      idlePosRef.current = { x: playerPos.x, y: playerPos.y };
    }
    prevPhaseRef.current = animPhase;
  }

  useEffect(() => {
    t0.current = performance.now();

    const tick = (now: number) => {
      const t  = (now - t0.current) / 1000;
      const flicker = 0.84 + 0.10 * Math.sin(t * 5.1) + 0.06 * Math.sin(t * 13.7);

      const phase = animPhaseRef.current;
      const isMoving = phase === "runToEnemy" || phase === "runBack";
      const moveDur = 350;
      const moveRaw = Math.min(1, Math.max(0, (now - phaseStartRef.current) / moveDur));
      const moveEase = phase === "runToEnemy" ? easeIn(moveRaw) : easeOut(moveRaw);




      const screenGlowDiv = screenGlowRef.current;
      if (screenGlowDiv) {
        const region = regionRef.current;
        if (region === "Wind") {
          screenGlowDiv.style.boxShadow = "none";
        } else {
          const rgb    = ELEM_RGB[region ?? ""] ?? ELEM_RGB.Neutral;
          const pulse  = 0.18 + 0.07 * Math.sin(t * 1.8) * flicker;
          screenGlowDiv.style.boxShadow = `inset 0 0 140px 50px rgba(${rgb.join(",")},${pulse.toFixed(3)})`;
        }
      }

      const lavaBloomDiv = lavaBloomRef.current;
      if (lavaBloomDiv) {
        if (regionRef.current === "Fire") {
          const rgb   = ELEM_RGB.Fire;
          const pulse = 0.30 + 0.10 * Math.sin(t * 2.2) * flicker;
          const pulse2 = 0.18 + 0.07 * Math.sin(t * 3.1 + 1.2) * flicker;
          lavaBloomDiv.style.background = [
            `radial-gradient(ellipse 100% 70% at 50% 55%, rgba(${rgb.join(",")},${pulse.toFixed(3)}) 0%, rgba(${rgb.join(",")},${(pulse * 0.35).toFixed(3)}) 45%, transparent 75%)`,
            `radial-gradient(ellipse 60% 40% at 30% 70%, rgba(255,120,20,${pulse2.toFixed(3)}) 0%, transparent 60%)`,
            `radial-gradient(ellipse 50% 35% at 70% 65%, rgba(255,60,0,${(pulse2 * 0.8).toFixed(3)}) 0%, transparent 55%)`,
          ].join(", ");
        } else {
          lavaBloomDiv.style.background = "transparent";
        }
      }

      const canvas = trailRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const dpr      = window.devicePixelRatio || 1;
        const cw       = canvas.offsetWidth;
        const ch       = canvas.offsetHeight;

        if (cw > 0 && ch > 0) {
          const tw = Math.round(cw * dpr);
          const th = Math.round(ch * dpr);
          if (canvas.width !== tw || canvas.height !== th) {
            canvas.width  = tw;
            canvas.height = th;
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }

          if (ctx) {
            ctx.clearRect(0, 0, cw, ch);

            if (isMoving && attackTargetRef.current) {
              const dur  = 350;
              const raw  = (now - phaseStartRef.current) / dur;
              const tA   = Math.min(1, Math.max(0, raw));
              const ease = phase === "runToEnemy" ? easeIn(tA) : easeOut(tA);

              const target = attackTargetRef.current!;
              const idle   = idlePosRef.current;

              const sx = phase === "runToEnemy" ? idle.x   : target.x;
              const sy = phase === "runToEnemy" ? idle.y   : target.y;
              const ex = phase === "runToEnemy" ? target.x : idle.x;
              const ey = phase === "runToEnemy" ? target.y : idle.y;

              const rgb = ELEM_RGB[playerElemRef.current] ?? ELEM_RGB.Neutral;

              for (let g = 1; g <= 4; g++) {
                const delay = g * 0.14;
                const gt    = Math.max(0, ease - delay);
                const gx    = lerp(sx, ex, gt) / 100 * cw;
                const gy    = ch - (lerp(sy, ey, gt) / 100 * ch);
                const alpha = (0.30 / g) * (1 - ease * 0.45);
                const blur  = 4 + g * 3;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.filter = `blur(${blur}px)`;
                const grad = ctx.createRadialGradient(gx, gy - 14, 0, gx, gy - 14, 20);
                grad.addColorStop(0, rgba(...rgb, 1));
                grad.addColorStop(1, rgba(...rgb, 0));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(gx, gy - 14, 12, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const gradeColor = REGION_GRADE[regionTheme ?? ""] ?? "rgba(15,8,35,0.03)";
  const isFire = regionTheme === "Fire";

  return (
    <>
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", overflow: "hidden", pointerEvents: "none" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="sfx-glow-fire" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="7"  floodColor="#ff5500" floodOpacity="0.95" />
            <feDropShadow dx="0" dy="0" stdDeviation="3"  floodColor="#ffbb00" floodOpacity="0.55" />
          </filter>
          <filter id="sfx-glow-wind" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="6"  floodColor="#44ff88" floodOpacity="0.85" />
            <feDropShadow dx="0" dy="0" stdDeviation="2"  floodColor="#aaffcc" floodOpacity="0.40" />
          </filter>
          <filter id="sfx-glow-lightning" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="6"  floodColor="#88aaff" floodOpacity="0.90" />
            <feDropShadow dx="0" dy="0" stdDeviation="2"  floodColor="#ddeeff" floodOpacity="0.50" />
          </filter>
          <filter id="sfx-glow-dark" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="7"  floodColor="#bb22ff" floodOpacity="0.90" />
          </filter>
          <filter id="sfx-glow-water" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="6"  floodColor="#2288ff" floodOpacity="0.85" />
          </filter>
          {isFire && (
            <filter id="heat-shimmer" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.012 0.035"
                numOctaves="2"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  values="0.012 0.035;0.016 0.048;0.012 0.035"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
        </defs>
      </svg>

      <div
        style={{
          position: "absolute", inset: 0,
          background: gradeColor,
          zIndex: 1,
          pointerEvents: "none",
          mixBlendMode: "color",
        }}
      />


      <canvas
        ref={trailRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          zIndex: 9,
          pointerEvents: "none",
        }}
      />

      <div
        ref={lightingRef}
        style={{
          position: "absolute", inset: 0,
          zIndex: 22,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />


      <div
        ref={lavaBloomRef}
        style={{
          position: "absolute", inset: 0,
          zIndex: 23,
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      <div
        ref={screenGlowRef}
        style={{
          position: "absolute", inset: 0,
          zIndex: 24,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
