import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ParticleCanvas from "./ParticleCanvas";
import SpriteAnimator from "./SpriteAnimator";
import { ELEMENT_COLORS, PARTY_SPRITE_DATA } from "@/lib/gameData";
import type { PartyMemberDef } from "@shared/schema";
import { Sparkles, HelpCircle } from "lucide-react";

interface PartyChoiceScreenProps {
  choices: [PartyMemberDef, PartyMemberDef];
  playerLevel: number;
  ownedIds: string[];
  onSelect: (charDef: PartyMemberDef) => void;
}

export default function PartyChoiceScreen({ choices, playerLevel, ownedIds, onSelect }: PartyChoiceScreenProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <ParticleCanvas
        colors={["#a855f7", "#6366f1"]}
        count={40}
        speed={0.4}
        style="swirl"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-8 animate-[fadeIn_0.5s_ease-out]">
          <p className="text-sm uppercase tracking-widest text-purple-400/60 mb-2">Victory!</p>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}>
            Choose Your New Ally
          </h1>
          <p className="text-sm text-purple-300/60">Select a warrior to join your party</p>
        </div>

        <div className="flex gap-8 mb-8">
          {choices.map((charDef, idx) => {
            const spriteData = PARTY_SPRITE_DATA[charDef.spriteId];
            const isOwned = ownedIds.includes(charDef.id);
            const isHovered = hoveredIndex === idx;
            const isSelected = selectedIndex === idx;
            const elementColor = ELEMENT_COLORS[charDef.element];
            const scale = 1 + (playerLevel - 1) * 0.15;

            return (
              <button
                key={charDef.id}
                onClick={() => !isOwned && setSelectedIndex(idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                disabled={isOwned}
                className={`relative flex flex-col items-center transition-all duration-300 ${
                  isOwned ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <Card className={`p-6 bg-[#12122a]/90 border-purple-500/15 backdrop-blur-sm transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-purple-400 scale-105 bg-purple-900/30"
                    : isHovered && !isOwned
                      ? "ring-1 ring-purple-500/50 scale-102 bg-purple-900/20"
                      : ""
                }`}>
                  <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    {spriteData && (
                      <div className={`transition-all duration-500 ${
                        isSelected || isHovered ? "" : "brightness-0"
                      }`} style={{
                        filter: isSelected || isHovered ? "none" : "brightness(0) contrast(0.5)",
                      }}>
                        <SpriteAnimator
                          spriteSheet={new URL(`../assets/images/${spriteData.idle.sheet}`, import.meta.url).href}
                          frameWidth={spriteData.idle.frameWidth}
                          frameHeight={spriteData.idle.frameHeight}
                          totalFrames={spriteData.idle.totalFrames}
                          fps={8}
                          scale={3}
                          loop
                        />
                      </div>
                    )}
                    {!isSelected && !isHovered && !isOwned && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <HelpCircle className="w-12 h-12 text-purple-500/30" />
                      </div>
                    )}
                  </div>

                  <div className="text-center min-w-[120px]">
                    {(isSelected || isHovered) ? (
                      <>
                        <p className="text-lg font-bold text-white">{charDef.className}</p>
                        <p className="text-xs mt-1" style={{ color: elementColor }}>{charDef.element}</p>
                        <div className="mt-2 space-y-1 text-[10px]">
                          <div className="flex justify-between text-purple-300/70">
                            <span>HP</span><span className="text-white">{Math.floor(charDef.baseStats.maxHp * scale)}</span>
                          </div>
                          <div className="flex justify-between text-purple-300/70">
                            <span>ATK</span><span className="text-white">{Math.floor(charDef.baseStats.atk * scale)}</span>
                          </div>
                          <div className="flex justify-between text-purple-300/70">
                            <span>DEF</span><span className="text-white">{Math.floor(charDef.baseStats.def * scale)}</span>
                          </div>
                          <div className="flex justify-between text-purple-300/70">
                            <span>AGI</span><span className="text-white">{Math.floor(charDef.baseStats.agi * scale)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-purple-500/40">???</p>
                        <p className="text-xs text-purple-500/30 mt-1">{isOwned ? "Already in party" : "Select to reveal"}</p>
                      </>
                    )}
                  </div>
                </Card>
              </button>
            );
          })}
        </div>

        <Button
          onClick={() => selectedIndex !== null && onSelect(choices[selectedIndex])}
          disabled={selectedIndex === null}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed px-8 py-3"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Recruit This Ally
        </Button>
      </div>
    </div>
  );
}
