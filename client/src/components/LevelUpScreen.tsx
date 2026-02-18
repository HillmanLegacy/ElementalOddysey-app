import { Button } from "@/components/ui/button";
import ParticleCanvas from "./ParticleCanvas";
import SpriteAnimator from "./SpriteAnimator";
import type { PlayerCharacter, PlayerStats, PendingLevelUp } from "@shared/schema";
import { ELEMENT_COLORS, PARTY_SPRITE_DATA, SPELLS } from "@/lib/gameData";
import { Star, Heart, Droplets, Swords, Shield, Zap, Brain, Clover, Sparkles } from "lucide-react";
import knightIdle from "@/assets/images/knight-idle-4f.png";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import baskenIdle from "@/assets/images/basken-idle.png";
import knight2dIdle from "@/assets/images/knight2d-idle.png";
import axewarriorIdle from "@/assets/images/axewarrior-idle.png";
import rangerIdle from "@/assets/images/ranger-idle.png";

const SPRITE_SHEETS: Record<string, string> = {
  knight: knightIdle,
  samurai: samuraiIdle,
  basken: baskenIdle,
  knight2d: knight2dIdle,
  axewarrior: axewarriorIdle,
  ranger: rangerIdle,
};

const STAT_CONFIG: { key: keyof PlayerStats; label: string; icon: any; color: string }[] = [
  { key: "maxHp", label: "HP", icon: Heart, color: "#ef4444" },
  { key: "maxMp", label: "MP", icon: Droplets, color: "#3b82f6" },
  { key: "atk", label: "ATK", icon: Swords, color: "#f97316" },
  { key: "def", label: "DEF", icon: Shield, color: "#22c55e" },
  { key: "agi", label: "AGI", icon: Zap, color: "#eab308" },
  { key: "int", label: "INT", icon: Brain, color: "#a855f7" },
  { key: "luck", label: "LUCK", icon: Clover, color: "#ec4899" },
];

interface LevelUpScreenProps {
  player: PlayerCharacter;
  pendingLevelUp: PendingLevelUp;
  statsRemaining: number;
  onAllocate: (stat: keyof PlayerStats) => void;
}

export default function LevelUpScreen({
  player,
  pendingLevelUp,
  statsRemaining,
  onAllocate,
}: LevelUpScreenProps) {
  const spriteData = PARTY_SPRITE_DATA[pendingLevelUp.characterSpriteId]?.idle;
  const spriteSheetPath = SPRITE_SHEETS[pendingLevelUp.characterSpriteId];
  const elementColor = ELEMENT_COLORS[pendingLevelUp.characterElement];
  const characterType = pendingLevelUp.characterType === "player" ? "Hero" : "Ally";
  const currentStats = pendingLevelUp.characterType === "party"
    ? player.party[pendingLevelUp.characterIndex]?.stats || player.stats
    : player.stats;
  const newSpellNames = (pendingLevelUp.newSpells || [])
    .map(id => SPELLS.find(s => s.id === id))
    .filter(Boolean);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#1a1208] via-[#2a1f0e] to-[#0f0c06]">
      <ParticleCanvas
        colors={["#ff9800", "#ffb74d", "#ffd54f", "#ffe082"]}
        count={60}
        speed={1.2}
        style="burst"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      <div className="relative z-10 flex flex-col items-center h-full px-4 py-3 overflow-y-auto">
        <div className="flex items-center gap-3 mb-2 animate-[fadeIn_0.6s_ease-out]">
          {spriteData && spriteSheetPath && (
            <div className="p-2 border-2 border-yellow-700 bg-black/40 shrink-0" style={{ boxShadow: "inset 0 0 8px rgba(0,0,0,0.8)" }}>
              <SpriteAnimator
                spriteSheet={spriteSheetPath}
                frameWidth={spriteData.frameWidth}
                frameHeight={spriteData.frameHeight}
                totalFrames={spriteData.totalFrames}
                fps={8}
                scale={2.5}
                loop={true}
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          )}

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star className="w-5 h-5 text-yellow-500" style={{ imageRendering: "pixelated" }} />
              <h1
                className="text-3xl font-bold text-yellow-300"
                style={{
                  textShadow: "2px 2px 0px rgba(0,0,0,0.8), 1px 1px 0px rgba(255,200,0,0.3)",
                  imageRendering: "pixelated",
                }}
                data-testid="text-level-up"
              >
                LEVEL UP!
              </h1>
              <Star className="w-5 h-5 text-yellow-500" style={{ imageRendering: "pixelated" }} />
            </div>

            <div
              className="inline-block px-3 py-1 mb-1 border-2 border-yellow-700 bg-yellow-950/60"
              style={{
                boxShadow: "inset 0 0 6px rgba(0,0,0,0.5), 2px 2px 0px rgba(0,0,0,0.3)",
                imageRendering: "pixelated",
              }}
            >
              <p className="text-lg font-bold text-yellow-300" style={{ imageRendering: "pixelated" }}>
                {pendingLevelUp.characterName}
              </p>
              <p className="text-xs text-yellow-200/80" style={{ imageRendering: "pixelated" }}>
                {characterType} reaches Level {pendingLevelUp.newLevel}
              </p>
            </div>

            <div
              className="inline-block px-2 py-0.5 ml-2 border-2"
              style={{
                borderColor: elementColor,
                backgroundColor: elementColor + "20",
                boxShadow: `inset 0 0 4px ${elementColor}40`,
              }}
            >
              <span
                className="text-xs font-bold"
                style={{
                  color: elementColor,
                  textShadow: `0px 0px 3px ${elementColor}80`,
                }}
              >
                {pendingLevelUp.characterElement}
              </span>
            </div>
          </div>
        </div>

        {newSpellNames.length > 0 && (
          <div
            className="mb-2 px-3 py-1.5 border-2 border-amber-500 bg-amber-900/40 animate-[fadeIn_0.8s_ease-out]"
            style={{ boxShadow: "inset 0 0 8px rgba(255,180,0,0.2), 2px 2px 0px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-300" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.8)" }}>
                New Spell{newSpellNames.length > 1 ? "s" : ""} Learned!
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex gap-2 justify-center mt-0.5">
              {newSpellNames.map(spell => spell && (
                <span
                  key={spell.id}
                  className="text-[10px] font-bold px-1.5 py-0.5 border"
                  style={{
                    color: ELEMENT_COLORS[spell.element || pendingLevelUp.characterElement],
                    borderColor: ELEMENT_COLORS[spell.element || pendingLevelUp.characterElement] + "60",
                    backgroundColor: ELEMENT_COLORS[spell.element || pendingLevelUp.characterElement] + "15",
                    textShadow: `0 0 4px ${ELEMENT_COLORS[spell.element || pendingLevelUp.characterElement]}40`,
                  }}
                >
                  {spell.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div
          className="w-full max-w-xl p-3 border-3 border-yellow-700 bg-amber-900/30"
          style={{
            boxShadow: "inset 0 0 12px rgba(0,0,0,0.8), 4px 4px 0px rgba(0,0,0,0.5)",
            imageRendering: "pixelated",
          }}
        >
          <p
            className="text-center text-yellow-200 mb-2 font-bold text-xs"
            style={{
              textShadow: "2px 2px 0px rgba(0,0,0,0.8)",
              imageRendering: "pixelated",
            }}
          >
            Allocate {statsRemaining} Stat{statsRemaining !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-4 gap-2">
            {STAT_CONFIG.map(({ key, label, icon: Icon, color }) => {
              const value = currentStats[key];
              const increase = key === "maxHp" ? "+10" : key === "maxMp" ? "+5" : "+2";
              return (
                <Button
                  key={key}
                  onClick={() => onAllocate(key)}
                  disabled={statsRemaining === 0}
                  className="flex flex-col items-center justify-center h-auto py-2 px-1.5 relative overflow-hidden border-2 border-yellow-700 bg-yellow-900/40 hover:bg-yellow-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    boxShadow: "inset 0 0 6px rgba(0,0,0,0.6), 2px 2px 0px rgba(0,0,0,0.4)",
                    imageRendering: "pixelated",
                  }}
                  data-testid={`button-allocate-${key}`}
                >
                  <Icon className="w-4 h-4 mb-0.5" style={{ color, imageRendering: "pixelated" }} />
                  <span
                    className="text-[10px] font-bold text-yellow-200"
                    style={{
                      textShadow: "1px 1px 0px rgba(0,0,0,0.8)",
                      imageRendering: "pixelated",
                    }}
                  >
                    {label}
                  </span>
                  <div className="text-[10px] text-yellow-300/70" style={{ imageRendering: "pixelated" }}>
                    {value}
                  </div>
                  <div
                    className="text-[9px] font-bold px-1 bg-green-900/60 border border-green-700 text-green-300"
                    style={{
                      boxShadow: "inset 0 0 2px rgba(0,0,0,0.4)",
                      imageRendering: "pixelated",
                    }}
                  >
                    {increase}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
