import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import type { GameState } from "@shared/schema";
import { Swords, ArrowLeft } from "lucide-react";
import { playSfx } from "@/lib/sfx";
import mainMenuBg from "@assets/main_menu_background_1771799030085.jpg";

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

const ACCENT = "#c9a44a";
const PIXEL_FONT = "'Press Start 2P', cursive";

function AnimatedOverlay() {
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

    interface GrassBlade {
      x: number;
      baseY: number;
      h: number;
      w: number;
      phase: number;
      speed: number;
      color: string;
    }

    interface CloudPuff {
      x: number;
      y: number;
      w: number;
      h: number;
      speed: number;
      opacity: number;
    }

    interface Bird {
      x: number;
      y: number;
      speed: number;
      wingPhase: number;
      wingSpeed: number;
      size: number;
    }

    interface WindParticle {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
      life: number;
      maxLife: number;
    }

    const grassBlades: GrassBlade[] = [];
    const grassColors = [
      "rgba(80,140,40,0.7)", "rgba(60,120,30,0.6)", "rgba(100,160,50,0.5)",
      "rgba(40,100,20,0.6)", "rgba(120,180,60,0.4)", "rgba(70,130,35,0.65)",
    ];
    for (let i = 0; i < 200; i++) {
      grassBlades.push({
        x: Math.random(),
        baseY: 0.72 + Math.random() * 0.28,
        h: 8 + Math.random() * 18,
        w: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        color: grassColors[Math.floor(Math.random() * grassColors.length)],
      });
    }

    const clouds: CloudPuff[] = [];
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: Math.random() * 1.4 - 0.2,
        y: 0.05 + Math.random() * 0.2,
        w: 0.08 + Math.random() * 0.12,
        h: 0.015 + Math.random() * 0.02,
        speed: 0.0002 + Math.random() * 0.0004,
        opacity: 0.06 + Math.random() * 0.1,
      });
    }

    const birds: Bird[] = [];
    function spawnBird() {
      birds.push({
        x: -0.05,
        y: 0.08 + Math.random() * 0.25,
        speed: 0.0004 + Math.random() * 0.0006,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.08 + Math.random() * 0.06,
        size: 2 + Math.random() * 2,
      });
    }
    for (let i = 0; i < 3; i++) {
      const b = {
        x: 0.3 + Math.random() * 0.5,
        y: 0.08 + Math.random() * 0.2,
        speed: 0.0004 + Math.random() * 0.0006,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.08 + Math.random() * 0.06,
        size: 2 + Math.random() * 2,
      };
      birds.push(b);
    }

    const windParticles: WindParticle[] = [];

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      time++;

      ctx!.clearRect(0, 0, W, H);

      for (const cloud of clouds) {
        cloud.x += cloud.speed;
        if (cloud.x > 1.3) cloud.x = -0.2;
        const cx = cloud.x * W;
        const cy = cloud.y * H;
        const cw = cloud.w * W;
        const ch = cloud.h * H;
        ctx!.fillStyle = `rgba(255,255,255,${cloud.opacity})`;
        for (let j = 0; j < 4; j++) {
          const ox = (j - 1.5) * cw * 0.35;
          const oy = Math.sin(j * 1.5) * ch * 0.4;
          ctx!.beginPath();
          ctx!.ellipse(cx + ox, cy + oy, cw * 0.3, ch, 0, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      for (let i = birds.length - 1; i >= 0; i--) {
        const bird = birds[i];
        bird.x += bird.speed;
        bird.wingPhase += bird.wingSpeed;
        if (bird.x > 1.1) { birds.splice(i, 1); continue; }

        const bx = bird.x * W;
        const by = bird.y * H + Math.sin(time * 0.015 + bird.wingPhase) * 3;
        const wing = Math.sin(bird.wingPhase) * bird.size * 1.5;
        const s = bird.size;

        ctx!.strokeStyle = "rgba(30,30,50,0.5)";
        ctx!.lineWidth = Math.max(1, s * 0.4);
        ctx!.beginPath();
        ctx!.moveTo(bx - s * 2, by - wing);
        ctx!.quadraticCurveTo(bx - s * 0.5, by - Math.abs(wing) * 0.3, bx, by);
        ctx!.quadraticCurveTo(bx + s * 0.5, by - Math.abs(wing) * 0.3, bx + s * 2, by - wing);
        ctx!.stroke();
      }

      if (time % 180 === 0 && birds.length < 6) {
        spawnBird();
        if (Math.random() > 0.5) spawnBird();
      }

      if (time % 8 === 0 && windParticles.length < 15) {
        windParticles.push({
          x: -0.02,
          y: 0.3 + Math.random() * 0.5,
          speed: 0.003 + Math.random() * 0.004,
          length: 0.03 + Math.random() * 0.05,
          opacity: 0.04 + Math.random() * 0.08,
          life: 0,
          maxLife: 80 + Math.random() * 120,
        });
      }

      for (let i = windParticles.length - 1; i >= 0; i--) {
        const wp = windParticles[i];
        wp.x += wp.speed;
        wp.y += Math.sin(time * 0.02 + wp.x * 10) * 0.001;
        wp.life++;
        if (wp.life > wp.maxLife || wp.x > 1.1) { windParticles.splice(i, 1); continue; }

        const fadeIn = Math.min(1, wp.life / 20);
        const fadeOut = Math.max(0, 1 - (wp.life - wp.maxLife + 30) / 30);
        const alpha = wp.opacity * fadeIn * fadeOut;

        const wx = wp.x * W;
        const wy = wp.y * H;
        const wl = wp.length * W;

        ctx!.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(wx, wy);
        ctx!.lineTo(wx + wl, wy + Math.sin(wp.x * 20) * 2);
        ctx!.stroke();
      }

      const windOffset = Math.sin(time * 0.025) * 0.6 + Math.sin(time * 0.01) * 0.3;

      for (const blade of grassBlades) {
        const gx = blade.x * W;
        const gy = blade.baseY * H;
        const sway = Math.sin(time * blade.speed + blade.phase + blade.x * 8) * 4 + windOffset * 3;

        ctx!.strokeStyle = blade.color;
        ctx!.lineWidth = blade.w;
        ctx!.beginPath();
        ctx!.moveTo(gx, gy);
        ctx!.quadraticCurveTo(
          gx + sway * 0.6,
          gy - blade.h * 0.5,
          gx + sway,
          gy - blade.h
        );
        ctx!.stroke();
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }} />;
}

export default function MainMenu({ onNewGame, onContinue, onLoadGame, hasSave, saves, textSpeed, musicVolume, sfxVolume, showDamageNumbers, onSettingsChange }: MainMenuProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showLoadScreen, setShowLoadScreen] = useState(false);
  const [bgReady, setBgReady] = useState(false);
  const [swordVisible, setSwordVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setBgReady(true), 100);
    const t1 = setTimeout(() => setSwordVisible(true), 600);
    const t2 = setTimeout(() => setTitleVisible(true), 1000);
    const t3 = setTimeout(() => setSubtitleVisible(true), 1600);
    const t4 = setTimeout(() => setTaglineVisible(true), 2100);
    const t5 = setTimeout(() => setButtonsVisible(true), 2600);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  const hasSaves = saves && saves.length > 0;

  const getSlotSave = (slotNum: number) => {
    if (!saves) return null;
    return saves.find((s: any) => s.slotName === `Slot ${slotNum}`) || null;
  };

  const menuButtonStyle: React.CSSProperties = {
    fontFamily: PIXEL_FONT,
    fontSize: "10px",
    letterSpacing: "2px",
    border: `2px solid #ffd700`,
    background: "rgba(0,0,0,0.75)",
    color: "#ffe680",
    padding: "10px 20px",
    cursor: "pointer",
    textTransform: "uppercase" as const,
    borderRadius: 0,
    width: "100%",
    textAlign: "center" as const,
    transition: "all 0.15s",
    textShadow: `0 0 10px rgba(255,215,0,0.4), 0 1px 2px rgba(0,0,0,0.8)`,
    backdropFilter: "blur(6px)",
    boxShadow: `0 0 8px rgba(255,215,0,0.15)`,
  };

  const menuButtonHover = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.background = `rgba(255,215,0,0.2)`;
    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px rgba(255,215,0,0.3), inset 0 0 12px rgba(255,215,0,0.1)`;
  };
  const menuButtonLeave = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.75)";
    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 8px rgba(255,215,0,0.15)`;
  };

  if (showLoadScreen) {
    return (
      <div className="relative w-full h-screen overflow-hidden" style={{ fontFamily: PIXEL_FONT, imageRendering: "pixelated" }}>
        <div className="absolute inset-0">
          <img src={mainMenuBg} alt="" className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }} />
        </div>
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.8)" }} />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <div className="w-[340px] overflow-hidden" style={{
            background: "linear-gradient(180deg, #0a0a12f0 0%, #08080ff5 100%)",
            border: `3px solid ${ACCENT}`,
            boxShadow: `0 0 20px ${ACCENT}40, 0 0 60px ${ACCENT}15, inset 0 0 30px rgba(0,0,0,0.5)`,
          }}>
            <div className="relative px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: `2px solid ${ACCENT}60` }}>
              <span style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px" }}>LOAD GAME</span>
              <button
                className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110"
                style={{ border: `1px solid ${ACCENT}50`, background: "rgba(0,0,0,0.4)" }}
                onClick={() => { playSfx('menuSelect'); setShowLoadScreen(false); }}
              >
                <span style={{ fontSize: "8px", color: ACCENT }}>X</span>
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
                        playSfx('menuSelect');
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
                onClick={() => { playSfx('menuSelect'); setShowLoadScreen(false); }}
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
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{ opacity: bgReady ? 1 : 0 }}
      >
        <img
          src={mainMenuBg}
          alt=""
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      <AnimatedOverlay />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 25%, transparent 65%, rgba(0,0,0,0.35) 100%)",
        zIndex: 3,
      }} />

      <div className="relative flex flex-col h-full" style={{ zIndex: 10 }}>
        <div className="flex-1 flex items-center justify-center" style={{ paddingBottom: "8%" }}>
          <div className="text-center">
            <div className="relative inline-block">
              <div
                className="transition-all duration-[1200ms] ease-out"
                style={{
                  opacity: swordVisible ? 1 : 0,
                  transform: swordVisible ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.5)",
                }}
              >
                <Swords className="w-10 h-10 mx-auto mb-3" style={{ color: "#ffd700", filter: `drop-shadow(0 0 12px rgba(255,215,0,0.8)) drop-shadow(0 2px 4px rgba(0,0,0,0.9))` }} />
              </div>

              <h1
                className="text-4xl md:text-5xl font-bold tracking-wider transition-all duration-[1500ms] ease-out"
                style={{
                  fontFamily: PIXEL_FONT,
                  color: "#fff8dc",
                  textShadow: `0 0 30px rgba(255,215,0,0.6), 0 3px 0px rgba(0,0,0,1), 0 0 80px rgba(255,200,50,0.3), 2px 2px 0px rgba(0,0,0,0.8), -1px -1px 0px rgba(0,0,0,0.5), 1px -1px 0px rgba(0,0,0,0.5), -1px 1px 0px rgba(0,0,0,0.5)`,
                  letterSpacing: "0.14em",
                  opacity: titleVisible ? 1 : 0,
                  transform: titleVisible ? "translateY(0) scale(1)" : "translateY(15px) scale(0.95)",
                }}
                data-testid="text-game-title"
              >
                ELEMENTAL
              </h1>

              <h2
                className="text-xl md:text-2xl tracking-[0.5em] mt-1 transition-all duration-[1200ms] ease-out"
                style={{
                  fontFamily: PIXEL_FONT,
                  color: "#ffe680",
                  textShadow: `0 0 20px rgba(255,215,0,0.4), 0 2px 0px rgba(0,0,0,0.9), 1px 1px 0px rgba(0,0,0,0.6), -1px -1px 0px rgba(0,0,0,0.4)`,
                  fontWeight: 400,
                  opacity: subtitleVisible ? 1 : 0,
                  transform: subtitleVisible ? "translateY(0)" : "translateY(10px)",
                }}
              >
                ODYSSEY
              </h2>

              <div
                className="flex items-center justify-center gap-3 mt-4 transition-all duration-[1000ms] ease-out"
                style={{
                  opacity: taglineVisible ? 1 : 0,
                  transform: taglineVisible ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <div className="h-px w-14" style={{ background: `linear-gradient(to right, transparent, #ffd700aa)` }} />
                <p style={{
                  fontSize: "7px",
                  letterSpacing: "0.25em",
                  color: "#ffe08a",
                  fontFamily: PIXEL_FONT,
                  textTransform: "uppercase",
                  textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(255,215,0,0.2)",
                }}>
                  A Medieval Fantasy
                </p>
                <div className="h-px w-14" style={{ background: `linear-gradient(to left, transparent, #ffd700aa)` }} />
              </div>
            </div>
          </div>
        </div>

        <div
          className="pb-6 flex justify-center transition-all duration-[1500ms] ease-out"
          style={{
            opacity: buttonsVisible ? 1 : 0,
            transform: buttonsVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          {!showOptions ? (
            <div className="flex flex-col gap-2 w-56">
              <button
                style={menuButtonStyle}
                onMouseEnter={menuButtonHover}
                onMouseLeave={menuButtonLeave}
                onClick={() => { playSfx('menuSelect'); onNewGame(); }}
                data-testid="button-new-game"
              >
                NEW GAME
              </button>
              {hasSave && (
                <button
                  style={{ ...menuButtonStyle, borderColor: `#ffd700cc`, color: `#ffe680` }}
                  onMouseEnter={menuButtonHover}
                  onMouseLeave={menuButtonLeave}
                  onClick={() => { playSfx('menuSelect'); onContinue(); }}
                  data-testid="button-continue"
                >
                  CONTINUE
                </button>
              )}
              {hasSaves && (
                <button
                  style={{ ...menuButtonStyle, borderColor: `#ffd700aa`, color: `#ffe680dd` }}
                  onMouseEnter={menuButtonHover}
                  onMouseLeave={menuButtonLeave}
                  onClick={() => { playSfx('menuSelect'); setShowLoadScreen(true); }}
                  data-testid="button-load-game"
                >
                  LOAD GAME
                </button>
              )}
              <button
                style={{ ...menuButtonStyle, borderColor: `#ffd70088`, color: `#ffe680bb` }}
                onMouseEnter={menuButtonHover}
                onMouseLeave={menuButtonLeave}
                onClick={() => { playSfx('menuSelect'); setShowOptions(true); }}
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
              backdropFilter: "blur(8px)",
            }}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontSize: "10px", color: ACCENT, fontFamily: PIXEL_FONT, letterSpacing: "2px" }} data-testid="text-options-title">OPTIONS</h3>
                <button
                  className="flex items-center justify-center w-7 h-7 transition-all hover:scale-110"
                  style={{ border: `1px solid ${ACCENT}50`, background: "rgba(0,0,0,0.4)", borderRadius: 0 }}
                  onClick={() => { playSfx('menuSelect'); setShowOptions(false); }}
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
                        onClick={() => { playSfx('menuSelect'); onSettingsChange({ textSpeed: sp }); }}
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
                    onClick={() => { playSfx('menuSelect'); onSettingsChange({ showDamageNumbers: !showDamageNumbers }); }}
                    data-testid="button-damage-numbers"
                  >
                    {showDamageNumbers ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
}
