import { useState, useEffect } from "react";
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
        <div className="absolute inset-0">
          <img src={mainMenuBg} alt="" className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }} />
        </div>
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
                onClick={() => { playSfx('menuSelect'); setShowLoadScreen(false); }}
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

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.5) 100%)",
      }} />

      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.4)",
      }} />

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 px-4">
        <div className="text-center mb-2">
          <div className="relative inline-block">
            <div
              className="transition-all duration-[1200ms] ease-out"
              style={{
                opacity: swordVisible ? 1 : 0,
                transform: swordVisible ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.5)",
              }}
            >
              <Swords className="w-8 h-8 mx-auto mb-3" style={{ color: ACCENT, filter: `drop-shadow(0 0 8px ${ACCENT}80)` }} />
            </div>

            <h1
              className="text-3xl md:text-5xl font-bold tracking-wider transition-all duration-[1500ms] ease-out"
              style={{
                fontFamily: PIXEL_FONT,
                color: "#d4a843",
                textShadow: `0 0 20px rgba(212,168,67,0.4), 0 2px 4px rgba(0,0,0,0.9), 0 0 60px rgba(180,130,40,0.2)`,
                letterSpacing: "0.12em",
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? "translateY(0) scale(1)" : "translateY(15px) scale(0.95)",
              }}
              data-testid="text-game-title"
            >
              ELEMENTAL
            </h1>

            <h2
              className="text-xl md:text-2xl tracking-[0.4em] mt-1 transition-all duration-[1200ms] ease-out"
              style={{
                fontFamily: PIXEL_FONT,
                color: "#a08030",
                textShadow: "0 0 15px rgba(160,128,48,0.3), 0 1px 3px rgba(0,0,0,0.8)",
                fontWeight: 400,
                opacity: subtitleVisible ? 1 : 0,
                transform: subtitleVisible ? "translateY(0)" : "translateY(10px)",
              }}
            >
              ODYSSEY
            </h2>

            <div
              className="flex items-center justify-center gap-3 mt-3 transition-all duration-[1000ms] ease-out"
              style={{
                opacity: taglineVisible ? 1 : 0,
                transform: taglineVisible ? "translateY(0)" : "translateY(8px)",
              }}
            >
              <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}60)` }} />
              <p style={{ fontSize: "7px", letterSpacing: "0.2em", color: "#8a7040", fontFamily: PIXEL_FONT, textTransform: "uppercase" }}>
                A Medieval Fantasy
              </p>
              <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${ACCENT}60)` }} />
            </div>
          </div>
        </div>

        <div
          className="transition-all duration-[1500ms] ease-out"
          style={{
            opacity: buttonsVisible ? 1 : 0,
            transform: buttonsVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {!showOptions ? (
            <div className="flex flex-col gap-3 w-64">
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
                  style={{ ...menuButtonStyle, borderColor: `${ACCENT}80`, color: `${ACCENT}cc` }}
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
                  style={{ ...menuButtonStyle, borderColor: `${ACCENT}60`, color: `${ACCENT}aa` }}
                  onMouseEnter={menuButtonHover}
                  onMouseLeave={menuButtonLeave}
                  onClick={() => { playSfx('menuSelect'); setShowLoadScreen(true); }}
                  data-testid="button-load-game"
                >
                  LOAD GAME
                </button>
              )}
              <button
                style={{ ...menuButtonStyle, borderColor: `${ACCENT}40`, color: `${ACCENT}80`, fontSize: "11px" }}
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
            }}>
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ACCENT}06 3px, ${ACCENT}06 4px)`,
              }} />

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

        <p
          className="absolute bottom-4 transition-all duration-[1000ms]"
          style={{
            fontSize: "6px",
            letterSpacing: "0.3em",
            color: `${ACCENT}30`,
            fontFamily: PIXEL_FONT,
            opacity: buttonsVisible ? 1 : 0,
          }}
        >
          ELEMENTAL ODYSSEY
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
}
