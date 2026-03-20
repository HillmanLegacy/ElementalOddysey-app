import { useState } from "react";
import type { PlayerCharacter } from "@shared/schema";
import { SHAMAN_SPELLS, SPELLS, ELEMENT_COLORS } from "@/lib/gameData";
import { Sparkles, Check } from "lucide-react";
import { playSfx } from "@/lib/sfx";
import shamanBg from "@assets/wind_shaman_lair_upscayl_2x_digital-art-4x_1774044471817.png";

interface ShamanScreenProps {
  player: PlayerCharacter;
  onLearnSpell: (characterType: "player" | "party", characterIndex: number, spellId: string) => void;
  onBack: () => void;
}

const SPELL_COST = 50;
const ACCENT = "#c9a44a";
const PANEL_BG = "rgba(8,6,14,0.93)";
const BORDER = `2px solid ${ACCENT}`;

const SHAMAN_TALK_LINES = [
  "The wind does not shout. It whispers, and those who listen grow strong.",
  "These trees are older than memory. They have seen ten thousand storms... and bent for none.",
  "Magic is not learned — it is remembered. Your blood already knows.",
  "The harpies do not hate you. They simply do not understand why you are not afraid.",
  "Every element is a door. You only lack the key.",
];

type View = "menu" | "magic" | "talk";

export default function ShamanScreen({ player, onLearnSpell, onBack }: ShamanScreenProps) {
  const [view, setView] = useState<View>("menu");
  const [talkLine] = useState(() => SHAMAN_TALK_LINES[Math.floor(Math.random() * SHAMAN_TALK_LINES.length)]);
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
    setTimeout(() => setLearnedMessage(null), 2200);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        fontFamily: "'Press Start 2P', cursive",
        imageRendering: "pixelated" as any,
      }}
    >
      <img
        src={shamanBg}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          imageRendering: "pixelated" as any,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.55) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {view === "menu" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: PANEL_BG,
              border: `3px solid ${ACCENT}`,
              boxShadow: `0 0 32px ${ACCENT}60, 0 0 80px rgba(80,160,220,0.18)`,
              padding: "28px 36px 24px",
              minWidth: 220,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Sparkles style={{ width: 14, height: 14, color: "#7dd3fc" }} />
              <span style={{ fontSize: 9, color: ACCENT, letterSpacing: "2px" }}>WIND SHAMAN</span>
              <Sparkles style={{ width: 14, height: 14, color: "#7dd3fc" }} />
            </div>

            {(["Study Magic", "Talk", "Leave"] as const).map(label => (
              <button
                key={label}
                onClick={() => {
                  playSfx("menuSelect");
                  if (label === "Study Magic") setView("magic");
                  else if (label === "Talk") setView("talk");
                  else onBack();
                }}
                style={{
                  width: "100%",
                  padding: "10px 24px",
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: 9,
                  color: label === "Leave" ? "#e8e0d0" : ACCENT,
                  background: "transparent",
                  border: `1px solid ${label === "Leave" ? "#e8e0d030" : ACCENT + "50"}`,
                  cursor: "pointer",
                  letterSpacing: "1px",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${ACCENT}18`)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "talk" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 40,
          }}
        >
          <div
            style={{
              background: PANEL_BG,
              border: `3px solid ${ACCENT}`,
              boxShadow: `0 0 24px ${ACCENT}50`,
              padding: "18px 24px 16px",
              maxWidth: 560,
              width: "88%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 8, color: "#7dd3fc", letterSpacing: "1px" }}>WIND SHAMAN</span>
            </div>
            <p style={{ fontSize: 8, color: "#e8e0d0", lineHeight: "1.8", marginBottom: 16 }}>
              {talkLine}
            </p>
            <button
              onClick={() => { playSfx("menuSelect"); setView("menu"); }}
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: 8,
                color: ACCENT,
                background: "transparent",
                border: `1px solid ${ACCENT}50`,
                padding: "6px 14px",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {view === "magic" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            background: "rgba(4,3,10,0.88)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              background: "rgba(8,6,14,0.95)",
              borderBottom: BORDER,
            }}
          >
            <button
              onClick={() => { playSfx("menuSelect"); setView("menu"); setSelectedChar(null); setLearnedMessage(null); }}
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: 8,
                color: ACCENT,
                background: "transparent",
                border: `1px solid ${ACCENT}50`,
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles style={{ width: 13, height: 13, color: "#7dd3fc" }} />
              <span style={{ fontSize: 9, color: ACCENT }}>STUDY MAGIC</span>
              <Sparkles style={{ width: 13, height: 13, color: "#7dd3fc" }} />
            </div>
            <span style={{ fontSize: 8, color: "#e8c030" }}>💰 {player.gold}g</span>
          </div>

          <p style={{ fontSize: 7, color: `${ACCENT}80`, margin: "8px 16px 4px", textAlign: "center" }}>
            Spells cost {SPELL_COST} gold each.
          </p>

          {learnedMessage && (
            <div
              style={{
                margin: "0 16px 6px",
                padding: "6px 10px",
                border: "2px solid #4ade80",
                background: "#4ade8018",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Check style={{ width: 11, height: 11, color: "#4ade80", flexShrink: 0 }} />
              <span style={{ fontSize: 7, color: "#4ade80" }}>{learnedMessage}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flex: 1, overflow: "hidden", padding: "0 16px 14px" }}>
            <div style={{ width: "34%", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
              <h2 style={{ fontSize: 7, color: `${ACCENT}90`, marginBottom: 4, letterSpacing: "1px" }}>CHARACTER</h2>
              {characters.map(char => {
                const isSelected = selectedChar?.type === char.type && selectedChar?.index === char.index;
                const avail = getAvailableSpells(char.spriteId, char.learnedSpells).length;
                return (
                  <button
                    key={`${char.type}-${char.index}`}
                    onClick={() => { playSfx("menuSelect"); setSelectedChar({ type: char.type, index: char.index }); }}
                    style={{
                      width: "100%",
                      textAlign: "left" as const,
                      padding: "6px 8px",
                      border: `2px solid ${isSelected ? ACCENT : `${ACCENT}25`}`,
                      background: isSelected ? `${ACCENT}1a` : "rgba(8,6,14,0.5)",
                      cursor: "pointer",
                      fontFamily: "'Press Start 2P', cursive",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 7, color: "#e8e0d0" }}>{char.name}</span>
                      <span style={{ fontSize: 6, color: ELEMENT_COLORS[char.element as keyof typeof ELEMENT_COLORS] || ACCENT }}>
                        {char.element}
                      </span>
                    </div>
                    <span style={{ fontSize: 6, color: avail > 0 ? `${ACCENT}80` : `${ACCENT}30` }}>
                      {avail > 0 ? `${avail} spell${avail > 1 ? "s" : ""} available` : "All learned"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              <h2 style={{ fontSize: 7, color: `${ACCENT}90`, marginBottom: 6, letterSpacing: "1px" }}>AVAILABLE SPELLS</h2>

              {!selectedChar && (
                <p style={{ fontSize: 7, color: `${ACCENT}35`, marginTop: 28, textAlign: "center" }}>
                  Select a character
                </p>
              )}
              {selectedChar && availableSpells.length === 0 && (
                <p style={{ fontSize: 7, color: `${ACCENT}35`, marginTop: 28, textAlign: "center" }}>
                  No new spells available.
                </p>
              )}
              {selectedChar && availableSpells.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {availableSpells.map(spell => spell && (
                    <div
                      key={spell.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 8px",
                        border: `1px solid ${ACCENT}25`,
                        background: "rgba(8,6,14,0.6)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                        <Sparkles
                          style={{
                            width: 11, height: 11, flexShrink: 0,
                            color: ELEMENT_COLORS[spell.element as keyof typeof ELEMENT_COLORS] || ACCENT,
                          }}
                        />
                        <div>
                          <p style={{ fontSize: 8, color: "#e8e0d0" }}>{spell.name}</p>
                          <p style={{ fontSize: 6, color: `${ACCENT}60`, marginTop: 1 }}>{spell.description}</p>
                          <p style={{ fontSize: 6, color: "#93c5fd80", marginTop: 1 }}>{spell.mpCost} MP</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { playSfx("menuSelect"); handleLearn(spell.id); }}
                        disabled={player.gold < SPELL_COST}
                        style={{
                          fontFamily: "'Press Start 2P', cursive",
                          fontSize: 7,
                          padding: "4px 10px",
                          border: `1px solid ${player.gold >= SPELL_COST ? "#e8c030" : "#444"}`,
                          background: player.gold >= SPELL_COST ? "#e8c03018" : "transparent",
                          color: player.gold >= SPELL_COST ? "#e8c030" : "#444",
                          cursor: player.gold >= SPELL_COST ? "pointer" : "default",
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
      )}
    </div>
  );
}
