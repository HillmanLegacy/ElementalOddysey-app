import ParticleCanvas from "./ParticleCanvas";
import type { PlayerCharacter, PendingLevelUp } from "@shared/schema";
import { PERKS, ELEMENT_COLORS, COLOR_MAP } from "@/lib/gameData";
import { Sparkles } from "lucide-react";
import { playSfx } from "@/lib/sfx";

interface PerkSelectScreenProps {
  player: PlayerCharacter;
  pendingLevelUp: PendingLevelUp;
  onSelect: (perkId: string) => void;
}

export default function PerkSelectScreen({ player, pendingLevelUp, onSelect }: PerkSelectScreenProps) {
  const isParty = pendingLevelUp.characterType === "party";
  const characterElement = pendingLevelUp.characterElement;
  const characterName = pendingLevelUp.characterName;

  const existingPerks = isParty
    ? (player.party[pendingLevelUp.characterIndex]?.perks || [])
    : player.perks;

  const characterLevel = pendingLevelUp.newLevel;

  const availablePerks = PERKS.filter(
    p => p.element === characterElement && !existingPerks.includes(p.id) && p.requiredLevel <= characterLevel
  ).slice(0, 6);

  const elColor = ELEMENT_COLORS[characterElement] || "#c9a44a";

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <ParticleCanvas
        colors={[ELEMENT_COLORS[characterElement], "#a855f7", "#6366f1"]}
        count={50}
        speed={0.8}
        style="swirl"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div
          style={{
            background: "rgba(15,10,30,0.9)",
            border: `2px solid ${elColor}55`,
            padding: "24px 32px",
            position: "relative",
            overflow: "hidden",
            imageRendering: "pixelated",
            maxWidth: "560px",
            width: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <Sparkles
                style={{
                  width: "28px",
                  height: "28px",
                  color: "#c9a44a",
                  margin: "0 auto 8px auto",
                  display: "block",
                  imageRendering: "pixelated",
                }}
              />
              <h1
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "11px",
                  color: "#c9a44a",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  textShadow: "0 0 8px rgba(201,164,74,0.4)",
                }}
                data-testid="text-choose-perk"
              >
                Choose a Perk
              </h1>
              <p
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "7px",
                  color: "rgba(200,180,255,0.5)",
                  marginTop: "8px",
                  lineHeight: "1.6",
                }}
              >
                Select a new ability for{" "}
                <span style={{ color: "#c9a44a" }}>{characterName}</span>
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "10px",
              }}
            >
              {availablePerks.map(perk => {
                const perkColor = ELEMENT_COLORS[perk.element] || "#c9a44a";
                return (
                  <button
                    key={perk.id}
                    onClick={() => { playSfx('menuSelect'); onSelect(perk.id); }}
                    data-testid={`card-perk-${perk.id}`}
                    style={{
                      background: "rgba(15,10,30,0.85)",
                      border: `2px solid ${perkColor}4D`,
                      padding: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                      borderRadius: "0",
                      imageRendering: "pixelated",
                      outline: "none",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = perkColor + "99";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(25,18,50,0.9)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 12px ${perkColor}22`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = perkColor + "4D";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(15,10,30,0.85)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: perkColor + "15",
                        border: `2px solid ${perkColor}33`,
                        imageRendering: "pixelated",
                      }}
                    >
                      <Sparkles style={{ width: "18px", height: "18px", color: perkColor }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: "'Press Start 2P', cursive",
                          fontSize: "8px",
                          color: "#ffffff",
                          margin: 0,
                          lineHeight: "1.5",
                        }}
                      >
                        {perk.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Press Start 2P', cursive",
                          fontSize: "7px",
                          color: "rgba(200,180,255,0.45)",
                          margin: "4px 0 0 0",
                          lineHeight: "1.6",
                        }}
                      >
                        {perk.description}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                        <span
                          style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "6px",
                            padding: "2px 6px",
                            background: perkColor + "20",
                            color: perkColor,
                            border: `1px solid ${perkColor}33`,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          {perk.element}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "6px",
                            padding: "2px 6px",
                            background: "rgba(201,164,74,0.15)",
                            color: "#c9a44a",
                            border: "1px solid rgba(201,164,74,0.25)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          LV{perk.requiredLevel}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {availablePerks.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "32px 0" }}>
                  <p
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: "7px",
                      color: "rgba(200,180,255,0.4)",
                    }}
                  >
                    No more perks available for {characterElement}
                  </p>
                  <button
                    onClick={() => { playSfx('menuSelect'); onSelect(""); }}
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: "8px",
                      marginTop: "16px",
                      padding: "8px 24px",
                      background: "rgba(15,10,30,0.85)",
                      border: "2px solid rgba(201,164,74,0.3)",
                      color: "#c9a44a",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      transition: "border-color 0.15s, background 0.15s",
                      borderRadius: "0",
                      imageRendering: "pixelated",
                      outline: "none",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,164,74,0.6)";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(25,18,50,0.9)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,164,74,0.3)";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(15,10,30,0.85)";
                    }}
                  >
                    Skip
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
