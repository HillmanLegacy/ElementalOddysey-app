import { useState, useEffect } from "react";
import ParticleCanvas from "./ParticleCanvas";
import { ELEMENT_COLORS, STARTER_CHARACTERS } from "@/lib/gameData";
import { ArrowLeft, ArrowRight, Sparkles, Check, RefreshCw } from "lucide-react";
import SpriteAnimator from "./SpriteAnimator";
import { analyzeSpriteGroups, buildColorMap, COLOR_OPTIONS, type DetectedGroup } from "@/lib/colorUtils";

import slknightIdle from "@/assets/images/slknight-idle.png";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import baskenIdle from "@/assets/images/basken-idle.png";

const STARTER_SPRITES: Record<string, { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number; displayScale: number }> = {
  knight:  { sheet: slknightIdle, frameWidth: 128, frameHeight: 64, totalFrames: 8, displayScale: 1.2 },
  samurai: { sheet: samuraiIdle,  frameWidth: 96,  frameHeight: 96, totalFrames: 10, displayScale: 0.9 },
  basken:  { sheet: baskenIdle,   frameWidth: 56,  frameHeight: 56, totalFrames: 5,  displayScale: 1.5 },
  rogue:   { sheet: baskenIdle,   frameWidth: 56,  frameHeight: 56, totalFrames: 5,  displayScale: 1.5 },
};

const STARTER_DESCRIPTIONS: Record<string, string> = {
  knight_fire: "A stalwart fire knight with high HP and ATK. Excels at close combat with devastating fire magic.",
  samurai_wind: "A swift wind samurai with high AGI and balanced stats. Masters wind techniques and blade arts.",
  basken_lightning: "A versatile lightning rogue with good luck and speed. Wields thunder magic in battle.",
};

import { playSfx } from "@/lib/sfx";
import type { EnergyColor, EnergyShape } from "@shared/schema";

interface CharacterCreationProps {
  onComplete: (starterCharId: string, name: string, color: EnergyColor, shape: EnergyShape, colorVariant: string, colorGroups: Record<string, string>) => void;
  onBack: () => void;
}

const ac = "#c9a44a";
const ACCENT = ac;
const panelBg = "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)";
const scanlineOverlay = `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ac}08 3px, ${ac}08 4px)`;
const fontFamily = "'Press Start 2P', cursive";

export default function CharacterCreation({ onComplete, onBack }: CharacterCreationProps) {
  const [step, setStep] = useState(0);
  const [selectedStarter, setSelectedStarter] = useState<string>("samurai_wind");
  const [name, setName] = useState("");
  const [colorGroups, setColorGroups] = useState<Record<string, string>>({});
  const [detectedGroups, setDetectedGroups] = useState<DetectedGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const steps = ["Character", "Color", "Name", "Confirm"];

  const starterDef = STARTER_CHARACTERS.find(c => c.id === selectedStarter)!;
  const spriteData = STARTER_SPRITES[starterDef.spriteId];

  useEffect(() => {
    if (step !== 1) return;
    setGroupsLoading(true);
    setDetectedGroups([]);
    analyzeSpriteGroups(spriteData.sheet, spriteData.frameWidth, spriteData.frameHeight).then(groups => {
      setDetectedGroups(groups);
      setActiveGroupId(groups[0]?.id ?? null);
      setGroupsLoading(false);
    });
  }, [step, selectedStarter]);

  const colorMap = detectedGroups.length > 0 ? buildColorMap(detectedGroups, colorGroups) : {};

  const statBar = (label: string, value: number, max: number, color: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily, fontSize: 7, color: `${ac}99`, width: 40, textAlign: "right" }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: "rgba(0,0,0,0.5)", overflow: "hidden", border: `1px solid ${color}40` }}>
        <div style={{ height: "100%", width: `${(value / max) * 100}%`, backgroundColor: color, transition: "all 0.5s" }} />
      </div>
      <span style={{ fontFamily, fontSize: 7, color: `${ac}cc`, width: 24 }}>{value}</span>
    </div>
  );

  const spritePreview = (scale: number, extraStyle: React.CSSProperties = {}) => (
    <div style={{ position: "relative", imageRendering: "pixelated" as any, ...extraStyle }}>
      <SpriteAnimator
        spriteSheet={spriteData.sheet}
        frameWidth={spriteData.frameWidth}
        frameHeight={spriteData.frameHeight}
        totalFrames={spriteData.totalFrames}
        fps={8}
        scale={scale}
        loop={true}
        colorMap={colorMap}
      />
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
                const sprite = STARTER_SPRITES[starter.spriteId];
                const isSelected = selectedStarter === starter.id;
                return (
                  <button
                    key={starter.id}
                    onClick={() => { playSfx("menuSelect"); setSelectedStarter(starter.id); setColorGroups({}); }}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      padding: 10,
                      border: isSelected ? `2px solid ${ac}` : `2px solid ${ac}28`,
                      background: isSelected ? "#0d0b0bf0" : "#0a080890",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      transform: isSelected ? "scale(1.04)" : "scale(1)",
                      fontFamily,
                      borderRadius: 0,
                      imageRendering: "pixelated" as any,
                      boxShadow: isSelected ? `0 0 14px ${ac}40, inset 0 0 16px ${ac}0c` : "none",
                    }}
                  >
                    <div style={{ width: 90, height: 90, position: "relative", imageRendering: "pixelated" as any, flexShrink: 0 }}>
                      <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)" }}>
                        <SpriteAnimator
                          spriteSheet={sprite.sheet}
                          frameWidth={sprite.frameWidth}
                          frameHeight={sprite.frameHeight}
                          totalFrames={sprite.totalFrames}
                          fps={8}
                          scale={sprite.displayScale}
                          loop={true}
                        />
                      </div>
                    </div>
                    <span style={{ fontFamily, fontSize: 8, fontWeight: "bold", color: "white" }}>{starter.className}</span>
                    {isSelected && <Check style={{ position: "absolute", top: 4, right: 4, width: 12, height: 12, color: "rgba(255,255,255,0.8)" }} />}
                  </button>
                );
              })}
            </div>
            <p style={{ fontFamily, fontSize: 7, textAlign: "center", color: `${ac}99`, marginTop: 8, lineHeight: "1.6" }}>
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

      case 1: {
        const activeGroup = detectedGroups.find(g => g.id === activeGroupId);
        const activePick = activeGroupId ? (colorGroups[activeGroupId] ?? "default") : "default";

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.3s ease-out" }}>
            <h3 style={{ fontFamily, fontSize: 11, color: ACCENT, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Customize Colors</h3>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                width: Math.round(spriteData.frameWidth * spriteData.displayScale * 1.4),
                height: Math.round(spriteData.frameHeight * spriteData.displayScale * 1.4),
                border: `2px solid ${ac}40`,
                background: "#0a080890",
                position: "relative",
                imageRendering: "pixelated" as any,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 4,
              }}>
                {groupsLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                    <RefreshCw style={{ width: 20, height: 20, color: ac, animation: "spin 1s linear infinite" }} />
                  </div>
                ) : (
                  spritePreview(spriteData.displayScale * 1.4)
                )}
              </div>
            </div>

            {groupsLoading ? (
              <p style={{ fontFamily, fontSize: 7, color: `${ac}80`, textAlign: "center" }}>Analyzing palette...</p>
            ) : detectedGroups.length === 0 ? (
              <p style={{ fontFamily, fontSize: 7, color: `${ac}80`, textAlign: "center" }}>No color groups detected</p>
            ) : (
              <>
                <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                  {detectedGroups.map(group => {
                    const pick = colorGroups[group.id];
                    const dotColor = pick && pick !== "default"
                      ? pick
                      : group.baseColor;
                    const isActive = activeGroupId === group.id;
                    return (
                      <button
                        key={group.id}
                        onClick={() => { playSfx("menuSelect"); setActiveGroupId(group.id); }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 9px",
                          fontFamily,
                          fontSize: 7,
                          color: isActive ? "#0a0808" : ac,
                          background: isActive ? ac : "transparent",
                          border: `2px solid ${isActive ? ac : `${ac}40`}`,
                          cursor: "pointer",
                          borderRadius: 0,
                          transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span style={{
                          width: 10, height: 10,
                          borderRadius: "50%",
                          background: dotColor,
                          border: `1px solid rgba(255,255,255,0.3)`,
                          flexShrink: 0,
                          display: "inline-block",
                        }} />
                        {group.label}
                      </button>
                    );
                  })}
                </div>

                {activeGroup && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily, fontSize: 7, color: `${ac}99` }}>
                        {activeGroup.label} color:
                      </span>
                      <span style={{ fontFamily, fontSize: 7, color: ac }}>
                        {COLOR_OPTIONS.find(o => o.hex === activePick || (activePick === "default" && o.id === "default"))?.name ?? activePick}
                      </span>
                    </div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(10, 1fr)",
                      gap: 5,
                      maxHeight: 130,
                      overflowY: "auto",
                      padding: "4px 2px",
                    }}>
                      {COLOR_OPTIONS.map(opt => {
                        const isSelected = activePick === opt.hex || (activePick === "default" && opt.id === "default");
                        return (
                          <button
                            key={opt.id}
                            title={opt.name}
                            onClick={() => {
                              playSfx("menuSelect");
                              if (!activeGroupId) return;
                              setColorGroups(prev => ({
                                ...prev,
                                [activeGroupId]: opt.hex,
                              }));
                            }}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: opt.hex === "default" ? `conic-gradient(${ac} 0deg 90deg, #222 90deg 180deg, ${ac} 180deg 270deg, #222 270deg 360deg)` : opt.hex,
                              border: isSelected ? `2px solid ${ac}` : "2px solid rgba(255,255,255,0.12)",
                              cursor: "pointer",
                              transform: isSelected ? "scale(1.25)" : "scale(1)",
                              transition: "all 0.12s",
                              boxShadow: isSelected ? `0 0 6px ${opt.hex === "default" ? ac : opt.hex}` : "none",
                              flexShrink: 0,
                            }}
                          />
                        );
                      })}
                    </div>

                    {activePick !== "default" && (
                      <button
                        onClick={() => {
                          if (!activeGroupId) return;
                          setColorGroups(prev => {
                            const next = { ...prev };
                            delete next[activeGroupId];
                            return next;
                          });
                        }}
                        style={{
                          fontFamily,
                          fontSize: 7,
                          color: `${ac}80`,
                          background: "transparent",
                          border: `1px solid ${ac}30`,
                          padding: "4px 8px",
                          cursor: "pointer",
                          alignSelf: "flex-end",
                          borderRadius: 0,
                        }}
                      >
                        Reset {activeGroup.label}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      }

      case 2:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease-out" }}>
            <h3 style={{ fontFamily, fontSize: 11, color: ACCENT, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Name Your {starterDef.className}</h3>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <div style={{ position: "relative", imageRendering: "pixelated" as any, width: Math.round(spriteData.frameWidth * spriteData.displayScale), height: Math.round(spriteData.frameHeight * spriteData.displayScale) }}>
                <SpriteAnimator
                  spriteSheet={spriteData.sheet}
                  frameWidth={spriteData.frameWidth}
                  frameHeight={spriteData.frameHeight}
                  totalFrames={spriteData.totalFrames}
                  fps={8}
                  scale={spriteData.displayScale}
                  loop={true}
                  colorMap={colorMap}
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
                border: `2px solid ${ac}60`,
                color: `${ac}cc`,
                padding: "12px 16px",
                outline: "none",
                borderRadius: 0,
                width: "100%",
                boxSizing: "border-box" as any,
              }}
            />
          </div>
        );

      case 3: {
        const displayName = name.trim() || starterDef.name;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease-out" }}>
            <h3 style={{ fontFamily, fontSize: 11, color: ACCENT, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Confirm Your Hero</h3>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 110, height: 110,
                position: "relative",
                backgroundColor: `${ac}10`,
                boxShadow: `0 0 30px ${ac}40, 0 0 60px ${ac}18`,
                border: `3px solid ${ac}`,
                imageRendering: "pixelated" as any,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 4,
              }}>
                <SpriteAnimator
                  spriteSheet={spriteData.sheet}
                  frameWidth={spriteData.frameWidth}
                  frameHeight={spriteData.frameHeight}
                  totalFrames={spriteData.totalFrames}
                  fps={8}
                  scale={spriteData.displayScale}
                  loop={true}
                  colorMap={colorMap}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily, fontSize: 12, fontWeight: "bold", color: "white" }} data-testid="text-confirm-name">{displayName}</p>
                <p style={{ fontFamily, fontSize: 8, color: ac, marginTop: 4 }}>{starterDef.className}</p>
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
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#0a0808" }}>
      <ParticleCanvas
        colors={[ac, "#d4882a"]}
        count={30}
        speed={0.4}
      />

      <div style={{ position: "absolute", inset: 0, background: scanlineOverlay, pointerEvents: "none", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8, height: 8,
                  transition: "all 0.3s",
                  backgroundColor: i <= step ? ACCENT : `${ac}20`,
                  border: i <= step ? `1px solid ${ACCENT}` : `1px solid ${ac}30`,
                  transform: i <= step ? "scale(1.1)" : "scale(1)",
                }}
              />
              {i < steps.length - 1 && (
                <div style={{ width: 24, height: 1, backgroundColor: i < step ? `${ac}80` : `${ac}20` }} />
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
            border: `3px solid ${ac}`,
            maxHeight: "80vh",
            overflowY: "auto",
            position: "relative",
            boxShadow: `0 0 20px ${ac}40, 0 0 60px ${ac}15, inset 0 0 30px rgba(0,0,0,0.5)`,
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: scanlineOverlay, pointerEvents: "none", zIndex: 1 }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            {renderStep()}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
              <button
                onClick={() => { playSfx("menuSelect"); step === 0 ? onBack() : setStep(step - 1); }}
                data-testid="button-creation-back"
                style={{
                  fontFamily, fontSize: 8, color: ACCENT,
                  background: "transparent", border: `2px solid ${ACCENT}40`,
                  padding: "8px 16px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                  transition: "all 0.2s", borderRadius: 0,
                }}
                onMouseEnter={e => { (e.currentTarget.style.borderColor = ACCENT); (e.currentTarget.style.background = "rgba(201,164,74,0.1)"); }}
                onMouseLeave={e => { (e.currentTarget.style.borderColor = `${ACCENT}40`); (e.currentTarget.style.background = "transparent"); }}
              >
                <ArrowLeft style={{ width: 12, height: 12 }} />
                {step === 0 ? "Menu" : "Back"}
              </button>

              {step < 3 ? (
                <button
                  onClick={() => { playSfx("menuSelect"); setStep(step + 1); }}
                  data-testid="button-creation-next"
                  style={{
                    fontFamily, fontSize: 8, color: "#0a0808",
                    background: `linear-gradient(180deg, ${ac}e0, ${ac}a0)`,
                    border: `2px solid ${ac}`, padding: "8px 20px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    transition: "all 0.2s", borderRadius: 0,
                  }}
                  onMouseEnter={e => { (e.currentTarget.style.background = `linear-gradient(180deg, ${ac}, ${ac}d0)`); }}
                  onMouseLeave={e => { (e.currentTarget.style.background = `linear-gradient(180deg, ${ac}e0, ${ac}a0)`); }}
                >
                  Next
                  <ArrowRight style={{ width: 12, height: 12 }} />
                </button>
              ) : (
                <button
                  onClick={() => { playSfx("menuSelect"); onComplete(selectedStarter, name.trim() || starterDef.name, "Purple", "Orb", "default", colorGroups); }}
                  data-testid="button-begin-adventure"
                  style={{
                    fontFamily, fontSize: 8, color: "#0a0808",
                    background: `linear-gradient(180deg, ${ac}e0, ${ac}a0)`,
                    border: `2px solid ${ac}`, padding: "8px 20px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    transition: "all 0.2s", borderRadius: 0,
                    boxShadow: `0 0 20px ${ac}50`,
                  }}
                  onMouseEnter={e => { (e.currentTarget.style.background = `linear-gradient(180deg, ${ac}, ${ac}d0)`); }}
                  onMouseLeave={e => { (e.currentTarget.style.background = `linear-gradient(180deg, ${ac}e0, ${ac}a0)`); }}
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
