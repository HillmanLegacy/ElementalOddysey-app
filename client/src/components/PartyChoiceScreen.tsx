import { useState } from "react";
import ParticleCanvas from "./ParticleCanvas";
import SpriteAnimator from "./SpriteAnimator";
import { ELEMENT_COLORS, PARTY_SPRITE_DATA } from "@/lib/gameData";
import type { PartyMemberDef } from "@shared/schema";
import { Sparkles, HelpCircle } from "lucide-react";
import { playSfx } from "@/lib/sfx";

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
    <div className="relative w-full h-screen overflow-hidden" style={{ background: "linear-gradient(to bottom, #0a0a1a, #1a0a2e, #0a0a1a)" }}>
      <ParticleCanvas
        colors={["#a855f7", "#6366f1"]}
        count={40}
        speed={0.4}
        style="swirl"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-8 animate-[fadeIn_0.5s_ease-out]">
          <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "10px", letterSpacing: "0.1em", color: "rgba(168,85,247,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>Victory!</p>
          <h1 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "20px", color: "#fff", marginBottom: "8px", textShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}>
            Choose Your New Ally
          </h1>
          <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: "rgba(196,148,255,0.6)" }}>Select a warrior to join your party</p>
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
                onClick={() => { if (!isOwned) { playSfx('menuSelect'); setSelectedIndex(idx); } }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                disabled={isOwned}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "all 0.3s",
                  opacity: isOwned ? 0.4 : 1,
                  cursor: isOwned ? "not-allowed" : "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                  borderRadius: 0,
                }}
              >
                <div style={{
                  padding: "24px",
                  background: "rgba(15,10,30,0.9)",
                  border: isSelected
                    ? "2px solid rgba(192,132,252,0.9)"
                    : isHovered && !isOwned
                      ? "2px solid rgba(168,85,247,0.5)"
                      : "2px solid rgba(168,85,247,0.15)",
                  borderRadius: 0,
                  backdropFilter: "blur(4px)",
                  transition: "all 0.3s",
                  transform: isSelected ? "scale(1.05)" : isHovered && !isOwned ? "scale(1.02)" : "scale(1)",
                  boxShadow: isSelected
                    ? "0 0 20px rgba(168,85,247,0.3)"
                    : isHovered && !isOwned
                      ? "0 0 10px rgba(168,85,247,0.15)"
                      : "none",
                  imageRendering: "pixelated" as const,
                }}>
                  <div style={{ position: "relative", width: "128px", height: "128px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    {spriteData && (
                      <div style={{
                        transition: "all 0.5s",
                        filter: isSelected || isHovered ? "none" : "brightness(0) contrast(0.5)",
                        imageRendering: "pixelated" as const,
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
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <HelpCircle style={{ width: "48px", height: "48px", color: "rgba(168,85,247,0.3)" }} />
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "center", minWidth: "120px", fontFamily: "'Press Start 2P', cursive" }}>
                    {(isSelected || isHovered) ? (
                      <>
                        <p style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", fontFamily: "'Press Start 2P', cursive" }}>{charDef.className}</p>
                        <p style={{ fontSize: "8px", marginTop: "4px", color: elementColor, fontFamily: "'Press Start 2P', cursive" }}>{charDef.element}</p>
                        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "7px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(196,148,255,0.7)" }}>
                            <span>HP</span><span style={{ color: "#fff" }}>{Math.floor(charDef.baseStats.maxHp * scale)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(196,148,255,0.7)" }}>
                            <span>ATK</span><span style={{ color: "#fff" }}>{Math.floor(charDef.baseStats.atk * scale)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(196,148,255,0.7)" }}>
                            <span>DEF</span><span style={{ color: "#fff" }}>{Math.floor(charDef.baseStats.def * scale)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(196,148,255,0.7)" }}>
                            <span>AGI</span><span style={{ color: "#fff" }}>{Math.floor(charDef.baseStats.agi * scale)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: "12px", fontWeight: "bold", color: "rgba(168,85,247,0.4)", fontFamily: "'Press Start 2P', cursive" }}>???</p>
                        <p style={{ fontSize: "8px", color: "rgba(168,85,247,0.3)", marginTop: "4px", fontFamily: "'Press Start 2P', cursive" }}>{isOwned ? "Already in party" : "Select to reveal"}</p>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => { if (selectedIndex !== null) { playSfx('menuSelect'); onSelect(choices[selectedIndex]); } }}
          disabled={selectedIndex === null}
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "10px",
            background: "rgba(15,10,30,0.9)",
            border: "2px solid rgba(168,85,247,0.6)",
            borderRadius: 0,
            color: "#fff",
            padding: "12px 32px",
            cursor: selectedIndex === null ? "not-allowed" : "pointer",
            opacity: selectedIndex === null ? 0.4 : 1,
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            imageRendering: "pixelated" as const,
          }}
        >
          <Sparkles style={{ width: "16px", height: "16px" }} />
          Recruit This Ally
        </button>
      </div>
    </div>
  );
}
