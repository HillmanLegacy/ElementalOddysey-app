import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SpriteAnimator from "./SpriteAnimator";
import ParticleCanvas from "./ParticleCanvas";
import { ELEMENT_COLORS, PARTY_SPRITE_DATA } from "@/lib/gameData";
import type { PartyMemberDef } from "@shared/schema";
import { Sparkles, Swords, Shield, Zap, Heart } from "lucide-react";

interface CharacterUnlockScreenProps {
  character: PartyMemberDef;
  playerLevel: number;
  onConfirm: (name: string) => void;
}

export default function CharacterUnlockScreen({ character, playerLevel, onConfirm }: CharacterUnlockScreenProps) {
  const [customName, setCustomName] = useState("");
  const spriteData = PARTY_SPRITE_DATA[character.spriteId];
  const elementColor = ELEMENT_COLORS[character.element];

  const scale = 1 + (playerLevel - 1) * 0.15;
  const scaledStats = {
    hp: Math.floor(character.baseStats.maxHp * scale),
    atk: Math.floor(character.baseStats.atk * scale),
    def: Math.floor(character.baseStats.def * scale),
    agi: Math.floor(character.baseStats.agi * scale),
    int: Math.floor(character.baseStats.int * scale),
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <ParticleCanvas
        colors={[elementColor, "#ffffff"]}
        count={60}
        speed={0.8}
        style="swirl"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-4 animate-[fadeIn_0.5s_ease-out]">
          <p className="text-sm uppercase tracking-widest text-purple-400/60 mb-1">New Ally Joins!</p>
          <h1 className="text-4xl font-bold text-white mb-1" style={{ textShadow: `0 0 30px ${elementColor}60` }}>
            {character.className}
          </h1>
          <p className="text-lg" style={{ color: elementColor }}>
            {character.element}
          </p>
        </div>

        <div className="mb-6 animate-[fadeIn_0.8s_ease-out]">
          {spriteData && (
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-30"
                style={{ backgroundColor: elementColor }}
              />
              <SpriteAnimator
                spriteSheet={new URL(`../assets/images/${spriteData.idle.sheet}`, import.meta.url).href}
                frameWidth={spriteData.idle.frameWidth}
                frameHeight={spriteData.idle.frameHeight}
                totalFrames={spriteData.idle.totalFrames}
                fps={8}
                scale={4}
                loop
              />
            </div>
          )}
        </div>

        <Card className="w-full max-w-sm p-5 bg-[#12122a]/90 border-purple-500/15 backdrop-blur-sm animate-[fadeIn_1s_ease-out]">
          <div className="mb-4">
            <label className="text-xs text-purple-300/60 block mb-1.5 text-center">Name Your New Ally</label>
            <Input
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder={character.name}
              className="text-center text-lg bg-black/30 border-purple-500/30 text-purple-100 placeholder:text-purple-500/40 h-11"
              maxLength={20}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm text-purple-300/70">HP</span>
              <span className="text-sm text-white font-semibold ml-auto">{scaledStats.hp}</span>
            </div>
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-purple-300/70">ATK</span>
              <span className="text-sm text-white font-semibold ml-auto">{scaledStats.atk}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-purple-300/70">DEF</span>
              <span className="text-sm text-white font-semibold ml-auto">{scaledStats.def}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-purple-300/70">AGI</span>
              <span className="text-sm text-white font-semibold ml-auto">{scaledStats.agi}</span>
            </div>
          </div>

          <p className="text-xs text-purple-400/50 text-center mb-4">
            Joins at Level {playerLevel} &middot; Player-controlled in battle
          </p>

          <Button
            onClick={() => onConfirm(customName.trim() || character.name)}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Welcome to the Party!
          </Button>
        </Card>
      </div>
    </div>
  );
}
