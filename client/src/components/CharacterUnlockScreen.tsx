import { useState } from "react";
import SpriteAnimator from "./SpriteAnimator";
import ParticleCanvas from "./ParticleCanvas";
import { ELEMENT_COLORS } from "@/lib/gameData";
import type { PartyMemberDef } from "@shared/schema";
import { Sparkles, Swords, Shield, Zap, Heart } from "lucide-react";
import { playSfx } from "@/lib/sfx";

import slknightIdle from "@/assets/images/slknight-idle.png";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import baskenIdle from "@/assets/images/basken-idle.png";

const UNLOCK_SPRITES: Record<string, { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number }> = {
  knight: { sheet: slknightIdle, frameWidth: 128, frameHeight: 64, totalFrames: 8 },
  samurai: { sheet: samuraiIdle, frameWidth: 96, frameHeight: 96, totalFrames: 10 },
  basken: { sheet: baskenIdle, frameWidth: 56, frameHeight: 56, totalFrames: 5 },
};

interface CharacterUnlockScreenProps {
  character: PartyMemberDef;
  playerLevel: number;
  onConfirm: (name: string) => void;
}

export default function CharacterUnlockScreen({ character, playerLevel, onConfirm }: CharacterUnlockScreenProps) {
  const [customName, setCustomName] = useState("");
  const spriteData = UNLOCK_SPRITES[character.spriteId];
  const elementColor = ELEMENT_COLORS[character.element];

  const memberLevel = Math.max(1, playerLevel - 2);
  const scale = 1 + (memberLevel - 1) * 0.15;
  const scaledStats = {
    hp: Math.floor(character.baseStats.maxHp * scale),
    atk: Math.floor(character.baseStats.atk * scale),
    def: Math.floor(character.baseStats.def * scale),
    agi: Math.floor(character.baseStats.agi * scale),
    int: Math.floor(character.baseStats.int * scale),
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "linear-gradient(to bottom, #0a0a1a, #1a0a2e, #0a0a1a)" }}>
      <ParticleCanvas
        colors={[elementColor, "#ffffff"]}
        count={60}
        speed={0.8}
        style="swirl"
      />

      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent, rgba(0,0,0,0.2))" }} />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-4" style={{ animation: "fadeIn 0.5s ease-out", fontFamily: "'Press Start 2P', cursive" }}>
          <p style={{ fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(168,85,247,0.6)", marginBottom: "4px" }}>New Ally Joins!</p>
          <h1 style={{ fontSize: "12px", color: "#fff", marginBottom: "4px", textShadow: `0 0 30px ${elementColor}60`, fontFamily: "'Press Start 2P', cursive" }}>
            {character.className}
          </h1>
          <p style={{ fontSize: "9px", color: elementColor, fontFamily: "'Press Start 2P', cursive" }}>
            {character.element}
          </p>
        </div>

        <div className="mb-6" style={{ animation: "fadeIn 0.8s ease-out" }}>
          {spriteData && (
            <div className="relative">
              <div
                className="absolute inset-0 opacity-30"
                style={{ backgroundColor: elementColor, imageRendering: "pixelated" }}
              />
              <SpriteAnimator
                spriteSheet={spriteData.sheet}
                frameWidth={spriteData.frameWidth}
                frameHeight={spriteData.frameHeight}
                totalFrames={spriteData.totalFrames}
                fps={8}
                scale={4}
                loop
              />
            </div>
          )}
        </div>

        <div
          className="w-full max-w-sm p-5"
          style={{
            background: "linear-gradient(to bottom, rgba(18,18,42,0.95), rgba(10,10,30,0.95))",
            border: `3px solid ${elementColor}`,
            borderRadius: 0,
            backdropFilter: "blur(4px)",
            animation: "fadeIn 1s ease-out",
          }}
        >
          <div className="mb-4">
            <label style={{ fontSize: "7px", color: "rgba(168,85,247,0.6)", display: "block", marginBottom: "6px", textAlign: "center", fontFamily: "'Press Start 2P', cursive" }}>Name Your New Ally</label>
            <input
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder={character.name}
              maxLength={20}
              style={{
                width: "100%",
                textAlign: "center",
                fontSize: "9px",
                fontFamily: "'Press Start 2P', cursive",
                background: "rgba(0,0,0,0.4)",
                border: `2px solid ${elementColor}`,
                borderRadius: 0,
                color: "#e2d5f0",
                padding: "10px 8px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span style={{ fontSize: "7px", color: "rgba(168,85,247,0.7)", fontFamily: "'Press Start 2P', cursive" }}>HP</span>
              <span style={{ fontSize: "7px", color: "#fff", fontWeight: 600, marginLeft: "auto", fontFamily: "'Press Start 2P', cursive" }}>{scaledStats.hp}</span>
            </div>
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-orange-400" />
              <span style={{ fontSize: "7px", color: "rgba(168,85,247,0.7)", fontFamily: "'Press Start 2P', cursive" }}>ATK</span>
              <span style={{ fontSize: "7px", color: "#fff", fontWeight: 600, marginLeft: "auto", fontFamily: "'Press Start 2P', cursive" }}>{scaledStats.atk}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span style={{ fontSize: "7px", color: "rgba(168,85,247,0.7)", fontFamily: "'Press Start 2P', cursive" }}>DEF</span>
              <span style={{ fontSize: "7px", color: "#fff", fontWeight: 600, marginLeft: "auto", fontFamily: "'Press Start 2P', cursive" }}>{scaledStats.def}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span style={{ fontSize: "7px", color: "rgba(168,85,247,0.7)", fontFamily: "'Press Start 2P', cursive" }}>AGI</span>
              <span style={{ fontSize: "7px", color: "#fff", fontWeight: 600, marginLeft: "auto", fontFamily: "'Press Start 2P', cursive" }}>{scaledStats.agi}</span>
            </div>
          </div>

          <p style={{ fontSize: "7px", color: "rgba(168,85,247,0.5)", textAlign: "center", marginBottom: "16px", fontFamily: "'Press Start 2P', cursive" }}>
            Joins at Level {Math.max(1, playerLevel - 2)} &middot; Player-controlled in battle
          </p>

          <button
            onClick={() => { playSfx('menuSelect'); onConfirm(customName.trim() || character.name); }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 16px",
              background: "linear-gradient(to bottom, rgba(30,20,50,0.9), rgba(15,10,30,0.9))",
              border: `2px solid ${elementColor}`,
              borderRadius: 0,
              color: elementColor,
              fontSize: "9px",
              fontFamily: "'Press Start 2P', cursive",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textShadow: `0 0 8px ${elementColor}60`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(to bottom, ${elementColor}30, ${elementColor}15)`;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 12px ${elementColor}40, inset 0 0 12px ${elementColor}15`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(to bottom, rgba(30,20,50,0.9), rgba(15,10,30,0.9))";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            <Sparkles className="w-4 h-4" />
            Welcome to the Party!
          </button>
        </div>
      </div>
    </div>
  );
}
