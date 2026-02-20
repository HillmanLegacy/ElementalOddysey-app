import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import type { GameState } from "@shared/schema";
import { Swords, ArrowLeft } from "lucide-react";

interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  onLoadGame: (save: any) => void;
  hasSave: boolean;
  saves: any[];
  textSpeed: GameState["textSpeed"];
  musicVolume: number;
  sfxVolume: number;
  showDamageNumbers: boolean;
  onSettingsChange: (settings: Partial<Pick<GameState, "textSpeed" | "musicVolume" | "sfxVolume" | "showDamageNumbers">>) => void;
}

function MedievalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars: { x: number; y: number; s: number; b: number; sp: number }[] = [];
    for (let i = 0; i < 120; i++) {
      stars.push({ x: Math.random(), y: Math.random() * 0.5, s: 0.5 + Math.random() * 1.5, b: Math.random(), sp: 0.3 + Math.random() * 0.7 });
    }

    const clouds: { x: number; y: number; w: number; h: number; sp: number; op: number }[] = [];
    for (let i = 0; i < 8; i++) {
      clouds.push({ x: Math.random() * 1.5 - 0.25, y: 0.05 + Math.random() * 0.25, w: 0.15 + Math.random() * 0.15, h: 0.02 + Math.random() * 0.03, sp: 0.003 + Math.random() * 0.005, op: 0.04 + Math.random() * 0.08 });
    }

    const embers: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; s: number }[] = [];

    function spawnEmber() {
      embers.push({
        x: 0.1 + Math.random() * 0.3,
        y: 0.85 + Math.random() * 0.1,
        vx: (Math.random() - 0.3) * 0.0008,
        vy: -0.001 - Math.random() * 0.002,
        life: 0, maxLife: 120 + Math.random() * 180,
        s: 1 + Math.random() * 2,
      });
    }

    function drawPixelRect(x: number, y: number, w: number, h: number, color: string) {
      ctx!.fillStyle = color;
      ctx!.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
    }

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      time++;

      const skyGrad = ctx!.createLinearGradient(0, 0, 0, H * 0.6);
      skyGrad.addColorStop(0, "#05050f");
      skyGrad.addColorStop(0.3, "#0a0a20");
      skyGrad.addColorStop(0.5, "#15082a");
      skyGrad.addColorStop(0.7, "#2a1040");
      skyGrad.addColorStop(0.85, "#4a1530");
      skyGrad.addColorStop(1, "#6b2020");
      ctx!.fillStyle = skyGrad;
      ctx!.fillRect(0, 0, W, H);

      for (const star of stars) {
        const flicker = 0.4 + 0.6 * Math.sin(time * 0.03 * star.sp + star.b * 10);
        const alpha = star.b * flicker;
        ctx!.fillStyle = `rgba(255,240,220,${alpha})`;
        const px = star.x * W;
        const py = star.y * H;
        ctx!.fillRect(Math.floor(px), Math.floor(py), Math.ceil(star.s), Math.ceil(star.s));
      }

      for (const cloud of clouds) {
        cloud.x += cloud.sp * 0.001;
        if (cloud.x > 1.3) cloud.x = -0.3;
        const cx = cloud.x * W;
        const cy = cloud.y * H;
        const cw = cloud.w * W;
        const ch = cloud.h * H;
        ctx!.fillStyle = `rgba(80,50,100,${cloud.op})`;
        for (let i = 0; i < 5; i++) {
          const ox = (i - 2) * cw * 0.3;
          const oy = Math.sin(i * 1.2) * ch * 0.5;
          ctx!.beginPath();
          ctx!.ellipse(cx + ox, cy + oy, cw * 0.25, ch, 0, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      const moonX = W * 0.78;
      const moonY = H * 0.12;
      const moonR = Math.min(W, H) * 0.04;
      const moonGlow = ctx!.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 4);
      moonGlow.addColorStop(0, "rgba(255,240,200,0.15)");
      moonGlow.addColorStop(0.5, "rgba(200,180,150,0.05)");
      moonGlow.addColorStop(1, "rgba(200,180,150,0)");
      ctx!.fillStyle = moonGlow;
      ctx!.fillRect(moonX - moonR * 4, moonY - moonR * 4, moonR * 8, moonR * 8);
      ctx!.fillStyle = "rgba(255,245,220,0.9)";
      ctx!.beginPath();
      ctx!.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx!.fill();

      const mountainColors = ["#1a0a15", "#150812", "#120610"];
      for (let layer = 0; layer < 3; layer++) {
        const baseY = H * (0.45 + layer * 0.06);
        const amplitude = H * (0.08 - layer * 0.015);
        ctx!.fillStyle = mountainColors[layer];
        ctx!.beginPath();
        ctx!.moveTo(0, H);
        for (let x = 0; x <= W; x += 3) {
          const nx = x / W;
          const y = baseY - amplitude * (
            Math.sin(nx * 4 + layer * 2) * 0.6 +
            Math.sin(nx * 8 + layer * 5) * 0.3 +
            Math.sin(nx * 16 + layer) * 0.1
          );
          ctx!.lineTo(x, y);
        }
        ctx!.lineTo(W, H);
        ctx!.closePath();
        ctx!.fill();
      }

      const castleX = W * 0.15;
      const castleBase = H * 0.52;
      const px = 3;
      ctx!.fillStyle = "#0d0608";
      drawPixelRect(castleX, castleBase - px * 25, px * 8, px * 25, "#0d0608");
      drawPixelRect(castleX + px * 12, castleBase - px * 30, px * 6, px * 30, "#0d0608");
      drawPixelRect(castleX + px * 22, castleBase - px * 22, px * 8, px * 22, "#0d0608");
      drawPixelRect(castleX - px * 2, castleBase - px * 28, px * 3, px * 6, "#0d0608");
      drawPixelRect(castleX + px * 7, castleBase - px * 28, px * 3, px * 6, "#0d0608");
      drawPixelRect(castleX + px * 11, castleBase - px * 34, px * 3, px * 8, "#0d0608");
      drawPixelRect(castleX + px * 17, castleBase - px * 34, px * 3, px * 8, "#0d0608");
      drawPixelRect(castleX + px * 21, castleBase - px * 25, px * 3, px * 6, "#0d0608");
      drawPixelRect(castleX + px * 28, castleBase - px * 25, px * 3, px * 6, "#0d0608");

      const windowFlicker = 0.5 + 0.5 * Math.sin(time * 0.05);
      ctx!.fillStyle = `rgba(255,180,50,${0.3 + windowFlicker * 0.4})`;
      drawPixelRect(castleX + px * 14, castleBase - px * 20, px * 2, px * 3, ctx!.fillStyle);
      drawPixelRect(castleX + px * 3, castleBase - px * 15, px * 2, px * 2, ctx!.fillStyle);
      drawPixelRect(castleX + px * 24, castleBase - px * 14, px * 2, px * 2, ctx!.fillStyle);

      const groundGrad = ctx!.createLinearGradient(0, H * 0.6, 0, H);
      groundGrad.addColorStop(0, "#1a0e08");
      groundGrad.addColorStop(0.3, "#15120a");
      groundGrad.addColorStop(1, "#0d0a05");
      ctx!.fillStyle = groundGrad;
      ctx!.fillRect(0, H * 0.6, W, H * 0.4);

      for (let i = 0; i < 30; i++) {
        const tx = (i * 0.035 + 0.01) * W;
        const ty = H * (0.6 + Math.sin(i * 1.7) * 0.02);
        const th = 5 + Math.sin(i * 2.3 + time * 0.02) * 2;
        ctx!.fillStyle = `rgba(20,30,10,${0.3 + Math.sin(i) * 0.1})`;
        ctx!.fillRect(Math.floor(tx), Math.floor(ty - th), 2, Math.ceil(th));
        ctx!.fillRect(Math.floor(tx - 1), Math.floor(ty - th), 4, 1);
      }

      const torchPositions = [
        { x: 0.42, y: 0.62 },
        { x: 0.58, y: 0.62 },
      ];
      for (const torch of torchPositions) {
        const tx = torch.x * W;
        const ty = torch.y * H;
        drawPixelRect(tx - 1, ty, 3, 12, "#3a2a15");
        const flameFlicker = Math.sin(time * 0.1 + torch.x * 100) * 2;
        const flameGrad = ctx!.createRadialGradient(tx, ty - 4 + flameFlicker, 0, tx, ty - 4 + flameFlicker, 12);
        flameGrad.addColorStop(0, "rgba(255,200,50,0.8)");
        flameGrad.addColorStop(0.4, "rgba(255,100,20,0.4)");
        flameGrad.addColorStop(1, "rgba(255,50,0,0)");
        ctx!.fillStyle = flameGrad;
        ctx!.fillRect(tx - 12, ty - 16 + flameFlicker, 24, 24);
        drawPixelRect(tx - 1, ty - 6 + flameFlicker, 3, 4, "rgba(255,220,100,0.9)");
        drawPixelRect(tx, ty - 8 + flameFlicker, 1, 2, "rgba(255,255,200,0.7)");
      }

      if (time % 4 === 0) spawnEmber();
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.life++;
        if (e.life > e.maxLife) { embers.splice(i, 1); continue; }
        const alpha = 1 - e.life / e.maxLife;
        const px2 = e.x * W;
        const py2 = e.y * H;
        ctx!.fillStyle = `rgba(255,${150 + Math.floor(alpha * 100)},${Math.floor(alpha * 50)},${alpha * 0.8})`;
        ctx!.fillRect(Math.floor(px2), Math.floor(py2), Math.ceil(e.s), Math.ceil(e.s));
      }

      const vignetteGrad = ctx!.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.7);
      vignetteGrad.addColorStop(0, "rgba(0,0,0,0)");
      vignetteGrad.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx!.fillStyle = vignetteGrad;
      ctx!.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const ACCENT = "#c9a44a";
const PIXEL_FONT = "'Press Start 2P', cursive";

export default function MainMenu({ onNewGame, onContinue, onLoadGame, hasSave, saves, textSpeed, musicVolume, sfxVolume, showDamageNumbers, onSettingsChange }: MainMenuProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showLoadScreen, setShowLoadScreen] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 300);
    const t2 = setTimeout(() => setButtonsVisible(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const hasSaves = saves && saves.length > 0;

  const getSlotSave = (slotNum: number) => {
    if (!saves) return null;
    return saves.find((s: any) => s.slotName === `Slot ${slotNum}`) || null;
  };

  const menuButtonStyle: React.CSSProperties = {
    fontFamily: PIXEL_FONT,
    fontSize: "11px",
    letterSpacing: "2px",
    border: `2px solid ${ACCENT}`,
    background: "rgba(0,0,0,0.7)",
    color: ACCENT,
    padding: "14px 24px",
    cursor: "pointer",
    textTransform: "uppercase" as const,
    borderRadius: 0,
    width: "100%",
    textAlign: "center" as const,
    transition: "all 0.15s",
    textShadow: `0 0 8px ${ACCENT}40`,
  };

  const menuButtonHover = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.background = `${ACCENT}30`;
    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${ACCENT}40, inset 0 0 10px ${ACCENT}15`;
  };
  const menuButtonLeave = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.7)";
    (e.currentTarget as HTMLElement).style.boxShadow = "none";
  };

  if (showLoadScreen) {
    return (
      <div className="relative w-full h-screen overflow-hidden" style={{ fontFamily: PIXEL_FONT, imageRendering: "pixelated" }}>
        <MedievalBackground />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.85)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ACCENT}08 3px, ${ACCENT}08 4px)`,
        }} />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <div className="w-[340px] overflow-hidden" style={{
            background: "linear-gradient(180deg, #0a0a12f0 0%, #08080ff5 100%)",
            border: `3px solid ${ACCENT}`,
            boxShadow: `0 0 20px ${ACCENT}40, 0 0 60px ${ACCENT}15, inset 0 0 30px rgba(0,0,0,0.5)`,
          }}>
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ACCENT}08 3px, ${ACCENT}08 4px)`,
            }} />

            <div className="relative px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: `2px solid ${ACCENT}60` }}>
              <span style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px" }}>LOAD GAME</span>
              <button
                className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110"
                style={{ border: `1px solid ${ACCENT}50`, background: "rgba(0,0,0,0.4)" }}
                onClick={() => setShowLoadScreen(false)}
              >
                <span style={{ fontSize: "8px", color: ACCENT }}>✕</span>
              </button>
            </div>

            <div className="relative px-3 py-3 space-y-2">
              {[1, 2, 3].map(slotNum => {
                const slotSave = getSlotSave(slotNum);
                return (
                  <button
                    key={slotNum}
                    className="w-full text-left px-3 py-3 transition-all"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: `1px solid ${ACCENT}30`,
                      borderRadius: 0,
                      cursor: slotSave ? "pointer" : "default",
                      opacity: slotSave ? 1 : 0.5,
                    }}
                    onMouseEnter={e => {
                      if (slotSave) {
                        (e.currentTarget as HTMLElement).style.background = `${ACCENT}25`;
                        (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT}80`;
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${ACCENT}30, inset 0 0 8px ${ACCENT}10`;
                      }
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.3)";
                      (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT}30`;
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                    onClick={() => {
                      if (slotSave) {
                        onLoadGame(slotSave);
                        setShowLoadScreen(false);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.9)", letterSpacing: "1px" }}>SLOT {slotNum}</span>
                      {slotSave && (
                        <span style={{ fontSize: "6px", color: `${ACCENT}60` }}>
                          {new Date(slotSave.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {slotSave ? (
                      <div style={{ marginTop: "4px" }}>
                        <span style={{ fontSize: "7px", color: `${ACCENT}80` }}>
                          {(slotSave.playerData as any).name} · Lv.{(slotSave.playerData as any).level} · {(slotSave.playerData as any).element}
                        </span>
                      </div>
                    ) : (
                      <div style={{ marginTop: "4px" }}>
                        <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.3)" }}>EMPTY</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative px-4 py-2" style={{ borderTop: `1px solid ${ACCENT}20` }}>
              <button
                className="w-full flex items-center justify-center gap-2 px-3 py-2 transition-all"
                style={{ border: `1px solid ${ACCENT}30`, background: "rgba(0,0,0,0.3)", borderRadius: 0 }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = `${ACCENT}25`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT}80`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.3)";
                  (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT}30`;
                }}
                onClick={() => setShowLoadScreen(false)}
              >
                <span style={{ fontSize: "8px", color: ACCENT, letterSpacing: "1px" }}>BACK</span>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}40, transparent)` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ fontFamily: PIXEL_FONT }}>
      <MedievalBackground />

      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)" }} />

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 px-4">
        <div className={`text-center mb-2 transition-all duration-[2000ms] ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="relative inline-block">
            <Swords className="w-8 h-8 mx-auto mb-3" style={{ color: ACCENT, filter: `drop-shadow(0 0 8px ${ACCENT}80)` }} />
            <h1
              className="text-3xl md:text-5xl font-bold tracking-wider"
              style={{
                fontFamily: PIXEL_FONT,
                color: "#d4a843",
                textShadow: `0 0 20px rgba(212,168,67,0.3), 0 2px 4px rgba(0,0,0,0.8), 0 0 60px rgba(180,130,40,0.15)`,
                letterSpacing: "0.12em",
              }}
              data-testid="text-game-title"
            >
              ELEMENTAL
            </h1>
            <h2
              className="text-xl md:text-2xl tracking-[0.4em] mt-1"
              style={{
                fontFamily: PIXEL_FONT,
                color: "#a08030",
                textShadow: "0 0 15px rgba(160,128,48,0.2), 0 1px 3px rgba(0,0,0,0.7)",
                fontWeight: 400,
              }}
            >
              ODYSSEY
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}60)` }} />
              <p style={{ fontSize: "7px", letterSpacing: "0.2em", color: "#8a7040", fontFamily: PIXEL_FONT, textTransform: "uppercase" }}>
                A Medieval Fantasy
              </p>
              <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${ACCENT}60)` }} />
            </div>
          </div>
        </div>

        <div className={`transition-all duration-[1500ms] ${buttonsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {!showOptions ? (
            <div className="flex flex-col gap-3 w-64">
              <button
                style={menuButtonStyle}
                onMouseEnter={menuButtonHover}
                onMouseLeave={menuButtonLeave}
                onClick={onNewGame}
                data-testid="button-new-game"
              >
                NEW GAME
              </button>
              {hasSave && (
                <button
                  style={{ ...menuButtonStyle, borderColor: `${ACCENT}80`, color: `${ACCENT}cc` }}
                  onMouseEnter={menuButtonHover}
                  onMouseLeave={menuButtonLeave}
                  onClick={onContinue}
                  data-testid="button-continue"
                >
                  CONTINUE
                </button>
              )}
              {hasSaves && (
                <button
                  style={{ ...menuButtonStyle, borderColor: `${ACCENT}60`, color: `${ACCENT}aa` }}
                  onMouseEnter={menuButtonHover}
                  onMouseLeave={menuButtonLeave}
                  onClick={() => setShowLoadScreen(true)}
                  data-testid="button-load-game"
                >
                  LOAD GAME
                </button>
              )}
              <button
                style={{ ...menuButtonStyle, borderColor: `${ACCENT}40`, color: `${ACCENT}80`, fontSize: "11px" }}
                onMouseEnter={menuButtonHover}
                onMouseLeave={menuButtonLeave}
                onClick={() => setShowOptions(true)}
                data-testid="button-options"
              >
                OPTIONS
              </button>
            </div>
          ) : (
            <div className="w-80 p-5 overflow-hidden" style={{
              background: "rgba(8,8,12,0.92)",
              border: `3px solid ${ACCENT}`,
              boxShadow: `0 0 20px ${ACCENT}30, inset 0 0 20px rgba(0,0,0,0.5)`,
              borderRadius: 0,
            }}>
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ACCENT}06 3px, ${ACCENT}06 4px)`,
              }} />

              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontSize: "10px", color: ACCENT, fontFamily: PIXEL_FONT, letterSpacing: "2px" }} data-testid="text-options-title">OPTIONS</h3>
                <button
                  className="flex items-center justify-center w-7 h-7 transition-all hover:scale-110"
                  style={{ border: `1px solid ${ACCENT}50`, background: "rgba(0,0,0,0.4)", borderRadius: 0 }}
                  onClick={() => setShowOptions(false)}
                  data-testid="button-back-menu"
                >
                  <ArrowLeft className="w-3 h-3" style={{ color: ACCENT }} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label style={{ fontSize: "7px", color: `${ACCENT}80`, fontFamily: PIXEL_FONT, letterSpacing: "1px", display: "block", marginBottom: "8px" }}>TEXT SPEED</label>
                  <div className="flex gap-2">
                    {(["slow", "medium", "fast"] as const).map(sp => (
                      <button
                        key={sp}
                        className="flex-1 py-2 transition-all"
                        style={{
                          fontFamily: PIXEL_FONT,
                          fontSize: "7px",
                          letterSpacing: "1px",
                          borderRadius: 0,
                          border: textSpeed === sp ? `2px solid ${ACCENT}` : `1px solid ${ACCENT}30`,
                          background: textSpeed === sp ? `${ACCENT}25` : "transparent",
                          color: textSpeed === sp ? ACCENT : `${ACCENT}60`,
                          boxShadow: textSpeed === sp ? `0 0 8px ${ACCENT}30` : "none",
                        }}
                        onClick={() => onSettingsChange({ textSpeed: sp })}
                        data-testid={`button-speed-${sp}`}
                      >
                        {sp.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "7px", color: `${ACCENT}80`, fontFamily: PIXEL_FONT, letterSpacing: "1px", display: "block", marginBottom: "8px" }}>MUSIC: {musicVolume}%</label>
                  <Slider
                    value={[musicVolume]}
                    onValueChange={([v]) => onSettingsChange({ musicVolume: v })}
                    max={100}
                    step={5}
                    className="w-full"
                    data-testid="slider-music"
                  />
                </div>

                <div>
                  <label style={{ fontSize: "7px", color: `${ACCENT}80`, fontFamily: PIXEL_FONT, letterSpacing: "1px", display: "block", marginBottom: "8px" }}>SFX: {sfxVolume}%</label>
                  <Slider
                    value={[sfxVolume]}
                    onValueChange={([v]) => onSettingsChange({ sfxVolume: v })}
                    max={100}
                    step={5}
                    className="w-full"
                    data-testid="slider-sfx"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label style={{ fontSize: "7px", color: `${ACCENT}80`, fontFamily: PIXEL_FONT, letterSpacing: "1px" }}>DMG NUMBERS</label>
                  <button
                    className="px-3 py-1 transition-all"
                    style={{
                      fontFamily: PIXEL_FONT,
                      fontSize: "7px",
                      borderRadius: 0,
                      border: showDamageNumbers ? `2px solid ${ACCENT}` : `1px solid ${ACCENT}30`,
                      background: showDamageNumbers ? `${ACCENT}25` : "transparent",
                      color: showDamageNumbers ? ACCENT : `${ACCENT}60`,
                      boxShadow: showDamageNumbers ? `0 0 8px ${ACCENT}30` : "none",
                    }}
                    onClick={() => onSettingsChange({ showDamageNumbers: !showDamageNumbers })}
                    data-testid="button-damage-numbers"
                  >
                    {showDamageNumbers ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="absolute bottom-4" style={{ fontSize: "6px", letterSpacing: "0.3em", color: `${ACCENT}30`, fontFamily: PIXEL_FONT }}>
          ELEMENTAL ODYSSEY
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
}
