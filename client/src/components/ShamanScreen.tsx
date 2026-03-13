import { useState } from "react";
import type { PlayerCharacter } from "@shared/schema";
import { SHAMAN_SPELLS, SPELLS, ELEMENT_COLORS } from "@/lib/gameData";
import { Sparkles, Check } from "lucide-react";
import { playSfx } from "@/lib/sfx";

interface ShamanScreenProps {
  player: PlayerCharacter;
  onLearnSpell: (characterType: "player" | "party", characterIndex: number, spellId: string) => void;
  onBack: () => void;
}

const SPELL_COST = 50;
const ACCENT = "#c9a44a";

export default function ShamanScreen({ player, onLearnSpell, onBack }: ShamanScreenProps) {
  const [selectedChar, setSelectedChar] = useState<{ type: "player" | "party"; index: number } | null>(null);
  const [learnedMessage, setLearnedMessage] = useState<string | null>(null);

  const characters: { type: "player" | "party"; index: number; name: string; spriteId: string; element: string; learnedSpells: string[] }[] = [
    {
      type: "player",
      index: 0,
      name: player.name,
      spriteId: player.spriteId,
      element: player.element,
      learnedSpells: player.learnedSpells || [],
    },
    ...player.party.map((pm, i) => ({
      type: "party" as const,
      index: i,
      name: pm.name,
      spriteId: pm.spriteId,
      element: pm.element,
      learnedSpells: pm.learnedSpells || [],
    })),
  ];

  const getAvailableSpells = (spriteId: string, alreadyLearned: string[]) => {
    const shamanSpells = SHAMAN_SPELLS[spriteId] || [];
    return shamanSpells
      .filter(spellId => !alreadyLearned.includes(spellId))
      .map(spellId => SPELLS.find(s => s.id === spellId))
      .filter(Boolean);
  };

  const selectedCharData = selectedChar
    ? characters.find(c => c.type === selectedChar.type && c.index === selectedChar.index)
    : null;

  const availableSpells = selectedCharData
    ? getAvailableSpells(selectedCharData.spriteId, selectedCharData.learnedSpells)
    : [];

  const handleLearn = (spellId: string) => {
    if (!selectedChar || player.gold < SPELL_COST) return;
    const spell = SPELLS.find(s => s.id === spellId);
    onLearnSpell(selectedChar.type, selectedChar.index, spellId);
    setLearnedMessage(`${selectedCharData?.name} learned ${spell?.name}!`);
    setTimeout(() => setLearnedMessage(null), 2000);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
        border: `3px solid ${ACCENT}`,
        boxShadow: `0 0 20px ${ACCENT}40, 0 0 60px ${ACCENT}15, inset 0 0 30px rgba(0,0,0,0.5)`,
        fontFamily: "'Press Start 2P', cursive",
        imageRendering: "pixelated" as any,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, #c9a44a08 3px, #c9a44a08 4px)`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100%", padding: "0 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            margin: "0 -16px",
            background: "#0d0b0bf0",
            borderBottom: `3px solid ${ACCENT}`,
          }}
        >
          <button
            onClick={() => { playSfx('menuSelect'); onBack(); }}
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "8px",
              color: ACCENT,
              background: "transparent",
              border: `1px solid ${ACCENT}50`,
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            ← BACK
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles style={{ width: 14, height: 14, color: ACCENT }} />
            <span style={{ fontSize: "10px", color: ACCENT }}>SHAMAN'S LAIR</span>
            <Sparkles style={{ width: 14, height: 14, color: ACCENT }} />
          </div>
          <div style={{ width: 60 }} />
        </div>

        <p style={{ fontSize: "7px", color: `${ACCENT}80`, margin: "8px 0", textAlign: "center" }}>
          The ancient shaman teaches spells for {SPELL_COST} gold each.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginBottom: "8px" }}>
          <span style={{ fontSize: "8px", color: "#e8c030" }}>💰 Gold: {player.gold}</span>
        </div>

        {learnedMessage && (
          <div
            style={{
              margin: "0 0 8px",
              padding: "6px 12px",
              border: `2px solid #4ade80`,
              background: "#4ade8020",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Check style={{ width: 12, height: 12, color: "#4ade80" }} />
              <span style={{ fontSize: "8px", color: "#4ade80" }}>{learnedMessage}</span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", flex: 1, overflow: "hidden" }}>
          <div style={{ width: "33%", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
            <h2 style={{ fontSize: "7px", letterSpacing: "1px", color: `${ACCENT}90`, marginBottom: "4px" }}>
              SELECT CHARACTER
            </h2>
            {characters.map(char => {
              const isSelected = selectedChar?.type === char.type && selectedChar?.index === char.index;
              const spellsAvailable = getAvailableSpells(char.spriteId, char.learnedSpells).length;
              return (
                <button
                  key={`${char.type}-${char.index}`}
                  onClick={() => { playSfx('menuSelect'); setSelectedChar({ type: char.type, index: char.index }); }}
                  style={{
                    width: "100%",
                    textAlign: "left" as const,
                    padding: "6px 8px",
                    border: `2px solid ${isSelected ? ACCENT : `${ACCENT}30`}`,
                    background: isSelected ? `${ACCENT}20` : "#0a080840",
                    cursor: "pointer",
                    fontFamily: "'Press Start 2P', cursive",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "8px", color: "#e8e0d0" }}>{char.name}</span>
                      <span style={{ fontSize: "6px", color: `${ACCENT}60`, marginLeft: "6px" }}>
                        {char.type === "player" ? "Hero" : "Ally"}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "6px",
                        padding: "1px 4px",
                        border: `1px solid ${(ELEMENT_COLORS[char.element as keyof typeof ELEMENT_COLORS] || ACCENT) + "40"}`,
                        color: ELEMENT_COLORS[char.element as keyof typeof ELEMENT_COLORS] || ACCENT,
                      }}
                    >
                      {char.element}
                    </span>
                  </div>
                  {spellsAvailable > 0 ? (
                    <span style={{ fontSize: "6px", color: `${ACCENT}70` }}>{spellsAvailable} spell{spellsAvailable > 1 ? "s" : ""} available</span>
                  ) : (
                    <span style={{ fontSize: "6px", color: `${ACCENT}30` }}>All spells learned</span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            <h2 style={{ fontSize: "7px", letterSpacing: "1px", color: `${ACCENT}90`, marginBottom: "6px" }}>
              AVAILABLE SPELLS
            </h2>

            {!selectedChar && (
              <p style={{ fontSize: "7px", color: `${ACCENT}40`, marginTop: "32px", textAlign: "center" }}>Select a character to view available spells</p>
            )}

            {selectedChar && availableSpells.length === 0 && (
              <div style={{ marginTop: "32px", textAlign: "center" }}>
                <p style={{ fontSize: "7px", color: `${ACCENT}40` }}>No new spells available for this character.</p>
              </div>
            )}

            {selectedChar && availableSpells.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {availableSpells.map(spell => spell && (
                  <div
                    key={spell.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px",
                      border: `1px solid ${ACCENT}30`,
                      background: "#0a080860",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
                      <Sparkles
                        style={{
                          width: 12,
                          height: 12,
                          flexShrink: 0,
                          color: ELEMENT_COLORS[spell.element as keyof typeof ELEMENT_COLORS || selectedCharData?.element as keyof typeof ELEMENT_COLORS],
                        }}
                      />
                      <div>
                        <p style={{ fontSize: "8px", color: "#e8e0d0" }}>{spell.name}</p>
                        <p style={{ fontSize: "6px", color: `${ACCENT}60`, marginTop: "1px" }}>{spell.description}</p>
                        <p style={{ fontSize: "6px", color: "#93c5fd80", marginTop: "1px" }}>{spell.mpCost} MP</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { playSfx('menuSelect'); handleLearn(spell.id); }}
                      disabled={player.gold < SPELL_COST}
                      style={{
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: "7px",
                        padding: "4px 10px",
                        border: `1px solid ${player.gold >= SPELL_COST ? "#e8c030" : "#555"}`,
                        background: player.gold >= SPELL_COST ? "#e8c03020" : "transparent",
                        color: player.gold >= SPELL_COST ? "#e8c030" : "#555",
                        cursor: player.gold >= SPELL_COST ? "pointer" : "default",
                        opacity: player.gold >= SPELL_COST ? 1 : 0.5,
                      }}
                    >
                      {SPELL_COST}g
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
