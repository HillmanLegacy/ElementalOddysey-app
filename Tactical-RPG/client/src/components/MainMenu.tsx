import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import type { GameState } from "@shared/schema";
import { Swords, Play, Settings, FolderOpen, ArrowLeft } from "lucide-react";

interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  hasSave: boolean;
  textSpeed: GameState["textSpeed"];
  musicVolume: number;
  sfxVolume: number;
  onSettingsChange: (settings: Partial<Pick<GameState, "textSpeed" | "musicVolume" | "sfxVolume">>) => void;
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

export default function MainMenu({ onNewGame, onContinue, hasSave, textSpeed, musicVolume, sfxVolume, onSettingsChange }: MainMenuProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 300);
    const t2 = setTimeout(() => setButtonsVisible(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <MedievalBackground />

      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)" }} />

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 px-4">
        <div className={`text-center mb-2 transition-all duration-[2000ms] ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="relative inline-block">
            <Swords className="w-8 h-8 mx-auto mb-3" style={{ color: "#c9a44a", filter: "drop-shadow(0 0 8px rgba(201,164,74,0.5))" }} />
            <h1
              className="text-5xl md:text-7xl font-bold tracking-wider"
              style={{
                fontFamily: "'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif",
                color: "#d4a843",
                textShadow: "0 0 20px rgba(212,168,67,0.3), 0 2px 4px rgba(0,0,0,0.8), 0 0 60px rgba(180,130,40,0.15)",
                letterSpacing: "0.08em",
              }}
              data-testid="text-game-title"
            >
              ELEMENTAL
            </h1>
            <h2
              className="text-2xl md:text-4xl tracking-[0.4em] mt-1"
              style={{
                fontFamily: "'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif",
                color: "#a08030",
                textShadow: "0 0 15px rgba(160,128,48,0.2), 0 1px 3px rgba(0,0,0,0.7)",
                fontWeight: 300,
              }}
            >
              ODYSSEY
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-700/40" />
              <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#8a7040" }}>
                A Medieval Fantasy
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-700/40" />
            </div>
          </div>
        </div>

        <div className={`transition-all duration-[1500ms] ${buttonsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {!showOptions ? (
            <div className="flex flex-col gap-3 w-64">
              <Button
                onClick={onNewGame}
                className="w-full h-12 text-base border"
                style={{
                  background: "linear-gradient(180deg, rgba(140,100,30,0.6) 0%, rgba(100,70,15,0.8) 100%)",
                  borderColor: "rgba(180,140,50,0.3)",
                  color: "#e8d5a0",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.1em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
                data-testid="button-new-game"
              >
                <Play className="w-4 h-4 mr-2" />
                New Game
              </Button>
              {hasSave && (
                <Button
                  onClick={onContinue}
                  variant="outline"
                  className="w-full h-12 text-base"
                  style={{
                    borderColor: "rgba(160,130,60,0.25)",
                    color: "#c0a060",
                    background: "rgba(60,40,15,0.4)",
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: "0.1em",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                  data-testid="button-continue"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              )}
              <Button
                onClick={() => setShowOptions(true)}
                variant="ghost"
                className="w-full h-10 text-sm"
                style={{
                  color: "rgba(160,130,70,0.6)",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.1em",
                }}
                data-testid="button-options"
              >
                <Settings className="w-4 h-4 mr-2" />
                Options
              </Button>
            </div>
          ) : (
            <Card className="w-80 p-5 border backdrop-blur-md" style={{ background: "rgba(15,10,5,0.85)", borderColor: "rgba(140,110,50,0.2)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold" style={{ color: "#c0a050", fontFamily: "'Cinzel', serif" }} data-testid="text-options-title">Options</h3>
                <Button size="icon" variant="ghost" onClick={() => setShowOptions(false)} className="text-amber-700/60 h-8 w-8" data-testid="button-back-menu">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs mb-2 block" style={{ color: "#8a7040" }}>Text Speed</label>
                  <div className="flex gap-2">
                    {(["slow", "medium", "fast"] as const).map(sp => (
                      <Button
                        key={sp}
                        size="sm"
                        className={`flex-1 text-xs ${textSpeed === sp ? "" : ""}`}
                        style={textSpeed === sp
                          ? { background: "rgba(140,100,30,0.6)", color: "#e8d5a0", borderColor: "rgba(180,140,50,0.3)", border: "1px solid" }
                          : { background: "transparent", color: "#8a7040", borderColor: "rgba(100,80,30,0.2)", border: "1px solid" }
                        }
                        onClick={() => onSettingsChange({ textSpeed: sp })}
                        data-testid={`button-speed-${sp}`}
                      >
                        {sp.charAt(0).toUpperCase() + sp.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs mb-2 block" style={{ color: "#8a7040" }}>Music Volume: {musicVolume}%</label>
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
                  <label className="text-xs mb-2 block" style={{ color: "#8a7040" }}>SFX Volume: {sfxVolume}%</label>
                  <Slider
                    value={[sfxVolume]}
                    onValueChange={([v]) => onSettingsChange({ sfxVolume: v })}
                    max={100}
                    step={5}
                    className="w-full"
                    data-testid="slider-sfx"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        <p className="absolute bottom-4 text-[10px] tracking-[0.3em]" style={{ color: "rgba(120,100,60,0.3)", fontFamily: "'Cinzel', serif" }}>
          Elemental Odyssey
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
