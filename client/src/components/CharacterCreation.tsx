import { useState } from "react";
import ParticleCanvas from "./ParticleCanvas";
import { COLOR_MAP, ELEMENT_COLORS, STARTER_CHARACTERS } from "@/lib/gameData";
import { ArrowLeft, ArrowRight, Sparkles, Diamond, CloudLightning, Check, Sword, Wind, Zap, Flame } from "lucide-react";
import SpriteAnimator from "./SpriteAnimator";

import knightIdle from "@/assets/images/knight-idle-4f.png";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import baskenIdle from "@/assets/images/basken-idle.png";

const STARTER_SPRITES: Record<string, { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number }> = {
  knight: { sheet: knightIdle, frameWidth: 86, frameHeight: 49, totalFrames: 4 },
  samurai: { sheet: samuraiIdle, frameWidth: 96, frameHeight: 96, totalFrames: 10 },
  basken: { sheet: baskenIdle, frameWidth: 56, frameHeight: 56, totalFrames: 5 },
};

const STARTER_ICONS: Record<string, any> = {
  knight_fire: Flame,
  samurai_wind: Wind,
  basken_lightning: Zap,
};

const STARTER_DESCRIPTIONS: Record<string, string> = {
  knight_fire: "A stalwart fire knight with high HP and ATK. Excels at close combat with devastating fire magic.",
  samurai_wind: "A swift wind samurai with high AGI and balanced stats. Masters wind techniques and blade arts.",
  basken_lightning: "A versatile lightning warrior with good luck and speed. Wields thunder magic in battle.",
};

import type { EnergyColor, EnergyShape } from "@shared/schema";

interface CharacterCreationProps {
  onComplete: (starterCharId: string, name: string, color: EnergyColor, shape: EnergyShape) => void;
  onBack: () => void;
}

const ACCENT = "#c9a44a";

const panelBg = "linear-gradient(180deg, rgba(15,10,30,0.9) 0%, rgba(10,5,25,0.95) 100%)";

const scanlineOverlay = "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)";

const fontFamily = "'Press Start 2P', cursive";

export default function CharacterCreation({ onComplete, onBack }: CharacterCreationProps) {
  const [step, setStep] = useState(0);
  const [selectedStarter, setSelectedStarter] = useState<string>("samurai_wind");
  const [name, setName] = useState("");
  const steps = ["Character", "Name", "Confirm"];

  const starterDef = STARTER_CHARACTERS.find(c => c.id === selectedStarter)!;
  const spriteData = STARTER_SPRITES[starterDef.spriteId];
  const elemColor = ELEMENT_COLORS[starterDef.element];

  const statBar = (label: string, value: number, max: number, color: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily, fontSize: 7, color: "rgba(192,168,255,0.7)", width: 40, textAlign: "right" }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: "rgba(0,0,0,0.4)", overflow: "hidden", border: `1px solid ${color}40` }}>
        <div
          style={{ height: "100%", width: `${(value / max) * 100}%`, backgroundColor: color, transition: "all 0.5s" }}
        />
      </div>
      <span style={{ fontFamily, fontSize: 7, color: "rgba(210,190,255,1)", width: 24 }}>{value}</span>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease-out" }}>
            <h3 style={{ fontFamily, fontSize: 11, color: ACCENT, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Choose Your Character</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {STARTER_CHARACTERS.map(starter => {
                const Icon = STARTER_ICONS[starter.id] || Sword;
                const sColor = ELEMENT_COLORS[starter.element];
                const sprite = STARTER_SPRITES[starter.spriteId];
                const isSelected = selectedStarter === starter.id;
                return (
                  <button
                    key={starter.id}
                    onClick={() => setSelectedStarter(starter.id)}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      padding: 10,
                      border: isSelected ? `2px solid ${sColor}` : "2px solid rgba(255,255,255,0.1)",
                      background: isSelected ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      transform: isSelected ? "scale(1.05)" : "scale(1)",
                      fontFamily,
                      borderRadius: 0,
                      imageRendering: "pixelated" as any,
                      boxShadow: isSelected ? `0 0 12px ${sColor}30, inset 0 0 20px ${sColor}10` : "none",
                    }}
                  >
                    <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", imageRendering: "pixelated" as any }}>
                      <SpriteAnimator
                        spriteSheet={sprite.sheet}
                        frameWidth={sprite.frameWidth}
                        frameHeight={sprite.frameHeight}
                        totalFrames={sprite.totalFrames}
                        fps={8}
                        scale={sprite.frameHeight > 80 ? 1.2 : 1.8}
                        loop={true}
                      />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontFamily, fontSize: 8, fontWeight: "bold", color: "white", display: "block" }}>{starter.className}</span>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 2 }}>
                        <Icon style={{ width: 10, height: 10, color: sColor }} />
                        <span style={{ fontFamily, fontSize: 7, color: sColor }}>{starter.element}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check style={{ position: "absolute", top: 4, right: 4, width: 12, height: 12, color: "rgba(255,255,255,0.8)" }} />
                    )}
                  </button>
                );
              })}
            </div>
            <p style={{ fontFamily, fontSize: 7, textAlign: "center", color: "rgba(168,132,255,0.7)", marginTop: 8, lineHeight: "1.6" }}>
              {STARTER_DESCRIPTIONS[selectedStarter]}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {statBar("HP", starterDef.baseStats.maxHp, 150, "#ef4444")}
              {statBar("MP", starterDef.baseStats.maxMp, 60, "#3b82f6")}
              {statBar("ATK", starterDef.baseStats.atk, 20, "#f97316")}
              {statBar("DEF", starterDef.baseStats.def, 20, "#22c55e")}
              {statBar("AGI", starterDef.baseStats.agi, 20, "#eab308")}
              {statBar("INT", starterDef.baseStats.int, 15, "#a855f7")}
              {statBar("LCK", starterDef.baseStats.luck, 10, "#ec4899")}
            </div>
          </div>
        );

      case 1:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease-out" }}>
            <h3 style={{ fontFamily, fontSize: 11, color: ACCENT, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Name Your {starterDef.className}</h3>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", imageRendering: "pixelated" as any }}>
                <SpriteAnimator
                  spriteSheet={spriteData.sheet}
                  frameWidth={spriteData.frameWidth}
                  frameHeight={spriteData.frameHeight}
                  totalFrames={spriteData.totalFrames}
                  fps={8}
                  scale={spriteData.frameHeight > 80 ? 1.2 : 1.8}
                  loop={true}
                />
              </div>
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`Enter name (default: ${starterDef.name})...`}
              maxLength={20}
              data-testid="input-player-name"
              style={{
                fontFamily,
                fontSize: 9,
                textAlign: "center",
                background: "rgba(0,0,0,0.4)",
                border: `2px solid ${elemColor}60`,
                color: "rgba(210,190,255,1)",
                padding: "12px 16px",
                outline: "none",
                borderRadius: 0,
                width: "100%",
                boxSizing: "border-box" as any,
              }}
            />
          </div>
        );

      case 2:
        const displayName = name.trim() || starterDef.name;
        const StarterIcon = STARTER_ICONS[selectedStarter] || Sword;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease-out" }}>
            <h3 style={{ fontFamily, fontSize: 11, color: ACCENT, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Confirm Your Hero</h3>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: elemColor + "20",
                    boxShadow: `0 0 40px ${elemColor}40, 0 0 80px ${elemColor}20`,
                    border: `3px solid ${elemColor}60`,
                    imageRendering: "pixelated" as any,
                  }}
                >
                  <SpriteAnimator
                    spriteSheet={spriteData.sheet}
                    frameWidth={spriteData.frameWidth}
                    frameHeight={spriteData.frameHeight}
                    totalFrames={spriteData.totalFrames}
                    fps={8}
                    scale={spriteData.frameHeight > 80 ? 1.2 : 1.8}
                    loop={true}
                  />
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily, fontSize: 12, fontWeight: "bold", color: "white" }} data-testid="text-confirm-name">{displayName}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
                  <StarterIcon style={{ width: 12, height: 12, color: elemColor }} />
                  <span style={{ fontFamily, fontSize: 8, color: elemColor }}>{starterDef.element} {starterDef.className}</span>
                </div>
              </div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {statBar("HP", starterDef.baseStats.maxHp, 150, "#ef4444")}
                {statBar("MP", starterDef.baseStats.maxMp, 60, "#3b82f6")}
                {statBar("ATK", starterDef.baseStats.atk, 20, "#f97316")}
                {statBar("DEF", starterDef.baseStats.def, 20, "#22c55e")}
                {statBar("AGI", starterDef.baseStats.agi, 20, "#eab308")}
                {statBar("INT", starterDef.baseStats.int, 15, "#a855f7")}
                {statBar("LCK", starterDef.baseStats.luck, 10, "#ec4899")}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <ParticleCanvas
        colors={[COLOR_MAP["Purple"], elemColor]}
        count={50}
        speed={0.6}
        style="swirl"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  transition: "all 0.3s",
                  backgroundColor: i <= step ? ACCENT : "rgba(88,40,128,0.4)",
                  border: i <= step ? `1px solid ${ACCENT}` : "1px solid rgba(88,40,128,0.3)",
                  transform: i <= step ? "scale(1.1)" : "scale(1)",
                }}
              />
              {i < steps.length - 1 && (
                <div style={{ width: 24, height: 1, backgroundColor: i < step ? `${ACCENT}80` : "rgba(88,40,128,0.3)" }} />
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 448,
            padding: 24,
            background: panelBg,
            border: `3px solid ${elemColor}50`,
            maxHeight: "80vh",
            overflowY: "auto",
            position: "relative",
            boxShadow: `0 0 30px rgba(0,0,0,0.5), inset 0 0 60px rgba(0,0,0,0.3)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: scanlineOverlay,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            {renderStep()}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
              <button
                onClick={() => (step === 0 ? onBack() : setStep(step - 1))}
                data-testid="button-creation-back"
                style={{
                  fontFamily,
                  fontSize: 8,
                  color: ACCENT,
                  background: "transparent",
                  border: `2px solid ${ACCENT}40`,
                  padding: "8px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.2s",
                  borderRadius: 0,
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = ACCENT; (e.target as HTMLElement).style.background = "rgba(201,164,74,0.1)"; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = `${ACCENT}40`; (e.target as HTMLElement).style.background = "transparent"; }}
              >
                <ArrowLeft style={{ width: 12, height: 12 }} />
                {step === 0 ? "Menu" : "Back"}
              </button>

              {step < 2 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  data-testid="button-creation-next"
                  style={{
                    fontFamily,
                    fontSize: 8,
                    color: "white",
                    background: `linear-gradient(180deg, ${elemColor}90, ${elemColor}60)`,
                    border: `2px solid ${elemColor}`,
                    padding: "8px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.2s",
                    borderRadius: 0,
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = `linear-gradient(180deg, ${elemColor}, ${elemColor}90)`; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = `linear-gradient(180deg, ${elemColor}90, ${elemColor}60)`; }}
                >
                  Next
                  <ArrowRight style={{ width: 12, height: 12 }} />
                </button>
              ) : (
                <button
                  onClick={() => onComplete(selectedStarter, name.trim() || starterDef.name, "Purple", "Orb")}
                  data-testid="button-begin-adventure"
                  style={{
                    fontFamily,
                    fontSize: 8,
                    color: "white",
                    background: `linear-gradient(180deg, ${elemColor}90, ${elemColor}60)`,
                    border: `2px solid ${elemColor}`,
                    padding: "8px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.2s",
                    borderRadius: 0,
                    boxShadow: `0 0 20px ${elemColor}30`,
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = `linear-gradient(180deg, ${elemColor}, ${elemColor}90)`; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = `linear-gradient(180deg, ${elemColor}90, ${elemColor}60)`; }}
                >
                  <Sparkles style={{ width: 12, height: 12 }} />
                  Begin Adventure
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
