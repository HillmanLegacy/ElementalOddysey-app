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
  const lightingRef = useRef<HTMLDivElement>(null);
  const bloomRef    = useRef<HTMLDivElement>(null);
  const trailRef    = useRef<HTMLCanvasElement>(null);
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

      let animPlayerX = playerPosRef.current.x;
      let animPlayerY = playerPosRef.current.y;
      if (isMoving && attackTargetRef.current) {
        const idle   = idlePosRef.current;
        const target = attackTargetRef.current;
        const sx = phase === "runToEnemy" ? idle.x   : target.x;
        const sy = phase === "runToEnemy" ? idle.y   : target.y;
        const ex = phase === "runToEnemy" ? target.x : idle.x;
        const ey = phase === "runToEnemy" ? target.y : idle.y;
        animPlayerX = lerp(sx, ex, moveEase);
        animPlayerY = lerp(sy, ey, moveEase);
      }

      const ALLY_Y_LIFT  = 14;
      const ENEMY_Y_LIFT = 18;

      const allUnits: (UnitInfo & { isAlly: boolean })[] = [];
      if (playerAliveRef.current) {
        allUnits.push({ x: animPlayerX, y: animPlayerY, alive: true, element: playerElemRef.current, isAlly: true });
      }
      partyInfosRef.current.forEach(p => { if (p.alive) allUnits.push({ ...p, isAlly: true }); });
      enemyInfosRef.current.forEach(e => { if (e.alive) allUnits.push({ ...e, isAlly: false }); });

      const lightDiv = lightingRef.current;
      const bloomDiv = bloomRef.current;

      if (lightDiv) {
        const darkR = regionRef.current === "Fire" ? [12, 4, 28] : [6, 4, 18];
        const darkA = 0.25;

        const stops = allUnits.map((u, i) => {
          const lift  = u.isAlly ? ALLY_Y_LIFT : ENEMY_Y_LIFT;
          const base  = 22 + (i === 0 ? 5 : 0);
          const pulse = 1 + 0.055 * Math.sin(t * 3.2 + i * 1.9) * flicker;
          const r     = Math.max(8, base * pulse);
          const cx    = u.x;
          const cy    = 100 - (u.y + lift);
          return `radial-gradient(circle ${r}vw at ${cx}% ${cy}%, transparent 0%, transparent 50%, rgba(${darkR.join(",")},${(darkA * 0.18).toFixed(3)}) 72%, rgba(${darkR.join(",")},${darkA.toFixed(3)}) 100%)`;
        });
        stops.push(`rgba(${darkR.join(",")},${darkA.toFixed(3)})`);
        lightDiv.style.background = stops.join(", ");
      }

      if (bloomDiv) {
        const glows = allUnits.map((u, i) => {
          const lift  = u.isAlly ? ALLY_Y_LIFT : ENEMY_Y_LIFT;
          const rgb   = ELEM_RGB[u.element] ?? ELEM_RGB.Neutral;
          const pulse = 0.22 + 0.08 * Math.sin(t * 3.9 + i * 1.5) * flicker;
          const r     = 16 + (i === 0 ? 4 : 0);
          const cx    = u.x;
          const cy    = 100 - (u.y + lift);
          return `radial-gradient(circle ${r}vw at ${cx}% ${cy}%, ${rgba(...rgb, pulse * 0.65)} 0%, ${rgba(...rgb, pulse * 0.22)} 45%, transparent 75%)`;
        });
        bloomDiv.style.background = glows.length ? glows.join(", ") : "transparent";
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

      {isFire && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "-5%",
              width: "110%",
              height: "20%",
              background: "linear-gradient(to top, rgba(180,40,0,0.20) 0%, rgba(100,20,0,0.08) 55%, transparent 100%)",
              animation: "groundFogDrift 5.5s ease-in-out infinite alternate",
              filter: "blur(8px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "-8%",
              width: "116%",
              height: "11%",
              background: "linear-gradient(to top, rgba(220,55,0,0.14) 0%, transparent 100%)",
              animation: "groundFogDrift 7.5s ease-in-out infinite alternate-reverse",
              filter: "blur(5px)",
            }}
          />
        </div>
      )}

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
        ref={bloomRef}
        style={{
          position: "absolute", inset: 0,
          zIndex: 23,
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
