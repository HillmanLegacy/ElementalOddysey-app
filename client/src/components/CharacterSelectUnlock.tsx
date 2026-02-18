import { Button } from "@/components/ui/button";
import SpriteAnimator from "./SpriteAnimator";
import ParticleCanvas from "./ParticleCanvas";
import { ELEMENT_COLORS } from "@/lib/gameData";
import type { PartyMemberDef } from "@shared/schema";
import { Sparkles } from "lucide-react";

import knightIdle from "@/assets/images/knight-idle-4f.png";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import baskenIdle from "@/assets/images/basken-idle.png";

const UNLOCK_SPRITES: Record<string, { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number }> = {
  knight: { sheet: knightIdle, frameWidth: 86, frameHeight: 49, totalFrames: 4 },
  samurai: { sheet: samuraiIdle, frameWidth: 96, frameHeight: 96, totalFrames: 10 },
  basken: { sheet: baskenIdle, frameWidth: 56, frameHeight: 56, totalFrames: 5 },
};

interface CharacterSelectUnlockProps {
  characters: PartyMemberDef[];
  playerLevel: number;
  onSelect: (character: PartyMemberDef) => void;
}

export default function CharacterSelectUnlock({ characters, playerLevel, onSelect }: CharacterSelectUnlockProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <ParticleCanvas
        colors={["#a855f7", "#ffffff"]}
        count={40}
        speed={0.6}
        style="swirl"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-6 animate-[fadeIn_0.5s_ease-out]">
          <p className="text-sm uppercase tracking-widest text-purple-400/60 mb-1">Choose Your Ally</p>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ textShadow: "0 0 30px rgba(168,85,247,0.4)" }}>
            A New Companion Awaits
          </h1>
          <p className="text-sm text-purple-300/50">Select one character to join your party</p>
        </div>

        <div className="flex gap-6 mb-4">
          {characters.map((char, i) => {
            const spriteData = UNLOCK_SPRITES[char.spriteId];
            const elementColor = ELEMENT_COLORS[char.element];
            const memberLevel = Math.max(1, playerLevel - 2);
            const scale = 1 + (memberLevel - 1) * 0.15;
            const scaledAtk = Math.floor(char.baseStats.atk * scale);
            const scaledDef = Math.floor(char.baseStats.def * scale);
            const scaledHp = Math.floor(char.baseStats.maxHp * scale);

            return (
              <Button
                key={char.id}
                variant="ghost"
                className="flex flex-col items-center p-4 rounded-xl border border-purple-500/20 bg-[#12122a]/80 backdrop-blur-sm hover:border-purple-400/50 hover:bg-purple-900/30 transition-all duration-300 h-auto animate-[fadeIn_0.5s_ease-out]"
                style={{ animationDelay: `${i * 0.15}s` }}
                onClick={() => onSelect(char)}
              >
                <div className="relative mb-2">
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-20"
                    style={{ backgroundColor: elementColor }}
                  />
                  {spriteData && (
                    <SpriteAnimator
                      spriteSheet={spriteData.sheet}
                      frameWidth={spriteData.frameWidth}
                      frameHeight={spriteData.frameHeight}
                      totalFrames={spriteData.totalFrames}
                      fps={8}
                      scale={3}
                      loop
                    />
                  )}
                </div>

                <p className="text-sm font-bold text-white mb-0.5">{char.className}</p>
                <p className="text-xs mb-2" style={{ color: elementColor }}>{char.element}</p>

                <div className="text-[10px] text-purple-300/60 space-y-0.5">
                  <p>HP {scaledHp} &middot; ATK {scaledAtk} &middot; DEF {scaledDef}</p>
                </div>

                <div className="mt-2 flex items-center gap-1 text-xs text-purple-300/40">
                  <Sparkles className="w-3 h-3" /> Select
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
