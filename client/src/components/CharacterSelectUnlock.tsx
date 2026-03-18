import SpriteAnimator from "./SpriteAnimator";
import ParticleCanvas from "./ParticleCanvas";
import type { PartyMemberDef } from "@shared/schema";
import { playSfx } from "@/lib/sfx";

import slknightIdle from "@/assets/images/slknight-idle.png";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import baskenIdle from "@/assets/images/basken-idle.png";

const ac = "#c9a44a";

const PREVIEW_W = 180;
const PREVIEW_H = 160;

const UNLOCK_SPRITES: Record<string, {
  sheet: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  displayScale: number;
}> = {
  knight:  { sheet: slknightIdle, frameWidth: 128, frameHeight: 64, totalFrames: 8, displayScale: 1.5 },
  samurai: { sheet: samuraiIdle, frameWidth: 96, frameHeight: 96, totalFrames: 10, displayScale: 1.5 },
  basken:  { sheet: baskenIdle,  frameWidth: 56, frameHeight: 56, totalFrames: 5,  displayScale: 2.5 },
};

interface CharacterSelectUnlockProps {
  characters: PartyMemberDef[];
  playerLevel: number;
  onSelect: (character: PartyMemberDef) => void;
}

export default function CharacterSelectUnlock({ characters, playerLevel, onSelect }: CharacterSelectUnlockProps) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0808 0%, #151010 100%)" }}
    >
      <ParticleCanvas
        colors={[ac, "#ff8c00", "#ffffff"]}
        count={28}
        speed={0.4}
        style="swirl"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ac}06 3px, ${ac}06 4px)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-8 animate-[fadeIn_0.5s_ease-out]">
          <p
            className="text-[9px] uppercase tracking-widest mb-2"
            style={{ fontFamily: "'Press Start 2P', cursive", color: `${ac}70` }}
          >
            Choose Your Ally
          </p>
          <h1
            className="text-xl font-bold mb-2"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              color: ac,
              textShadow: `0 0 24px ${ac}60, 0 0 60px ${ac}20`,
            }}
          >
            New Companion
          </h1>
          <p
            className="text-[8px]"
            style={{ fontFamily: "'Press Start 2P', cursive", color: `${ac}40` }}
          >
            Select one character to join your party
          </p>
        </div>

        <div className="flex gap-5 mb-6">
          {characters.map((char, i) => {
            const spriteData = UNLOCK_SPRITES[char.spriteId];
            const memberLevel = Math.max(1, playerLevel - 2);
            const statScale = 1 + (memberLevel - 1) * 0.15;
            const scaledAtk = Math.floor(char.baseStats.atk * statScale);
            const scaledDef = Math.floor(char.baseStats.def * statScale);
            const scaledHp = Math.floor(char.baseStats.maxHp * statScale);

            return (
              <button
                key={char.id}
                className="flex flex-col items-center border-0 transition-all duration-200 cursor-pointer overflow-hidden animate-[fadeIn_0.5s_ease-out]"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  background: "#0d0b0bf0",
                  border: `2px solid ${ac}28`,
                  borderRadius: 0,
                  fontFamily: "'Press Start 2P', cursive",
                  imageRendering: "pixelated" as const,
                  width: PREVIEW_W,
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ac;
                  e.currentTarget.style.boxShadow = `0 0 18px ${ac}28, inset 0 0 12px ${ac}08`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${ac}28`;
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => { playSfx("menuSelect"); onSelect(char); }}
              >
                <div
                  style={{
                    width: "100%",
                    height: PREVIEW_H,
                    background: `linear-gradient(180deg, #0a080890 0%, ${ac}0c 100%)`,
                    borderBottom: `1px solid ${ac}20`,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 6,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 90,
                      height: 28,
                      background: `radial-gradient(ellipse, ${ac}22 0%, transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />
                  {spriteData && (
                    <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)" }}>
                      <SpriteAnimator
                        spriteSheet={spriteData.sheet}
                        frameWidth={spriteData.frameWidth}
                        frameHeight={spriteData.frameHeight}
                        totalFrames={spriteData.totalFrames}
                        fps={8}
                        scale={spriteData.displayScale}
                        loop
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center pt-3 pb-3 px-3 w-full">
                  <p
                    className="text-[10px] font-bold mb-3"
                    style={{ color: ac, letterSpacing: "0.05em" }}
                  >
                    {char.name}
                  </p>

                  <div
                    className="text-[8px] space-y-1 w-full"
                    style={{ color: `${ac}65` }}
                  >
                    <div className="flex justify-between">
                      <span>HP</span><span>{scaledHp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ATK</span><span>{scaledAtk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DEF</span><span>{scaledDef}</span>
                    </div>
                  </div>

                  <div
                    className="mt-3 w-full text-center text-[8px] py-1.5"
                    style={{
                      background: `${ac}12`,
                      border: `1px solid ${ac}30`,
                      color: `${ac}80`,
                    }}
                  >
                    SELECT
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
