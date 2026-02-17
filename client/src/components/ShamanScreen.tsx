import { useState } from "react";
import { Button } from "@/components/ui/button";
import ParticleCanvas from "./ParticleCanvas";
import type { PlayerCharacter, PartyMember } from "@shared/schema";
import { SHAMAN_SPELLS, SPELLS, ELEMENT_COLORS } from "@/lib/gameData";
import { Sparkles, ArrowLeft, Check } from "lucide-react";

interface ShamanScreenProps {
  player: PlayerCharacter;
  onLearnSpell: (characterType: "player" | "party", characterIndex: number, spellId: string) => void;
  onBack: () => void;
}

const SPELL_COST = 50;

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
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0c0618] via-[#1a0e2e] to-[#0a0412]">
      <ParticleCanvas
        colors={["#a855f7", "#c084fc", "#7c3aed", "#e879f9"]}
        count={40}
        speed={0.8}
        style="burst"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-purple-900/10" />

      <div className="relative z-10 flex flex-col items-center h-full px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/30 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h1
              className="text-3xl font-bold text-purple-200"
              style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.8), 0 0 10px rgba(168,85,247,0.3)" }}
            >
              Shaman's Lair
            </h1>
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        <p className="text-sm text-purple-300/70 mb-4" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.8)" }}>
          The ancient shaman can teach powerful spells for {SPELL_COST} gold each.
        </p>

        <div className="text-xs text-yellow-300 mb-4 flex items-center gap-1">
          <span>Gold: {player.gold}</span>
        </div>

        {learnedMessage && (
          <div className="mb-4 px-4 py-2 border-2 border-green-500 bg-green-900/40 animate-pulse">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold text-green-300">{learnedMessage}</span>
            </div>
          </div>
        )}

        <div className="flex gap-6 w-full max-w-3xl">
          <div className="w-1/3 space-y-2">
            <h2 className="text-xs tracking-wider text-purple-400/80 mb-2" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.8)" }}>
              SELECT CHARACTER
            </h2>
            {characters.map(char => {
              const isSelected = selectedChar?.type === char.type && selectedChar?.index === char.index;
              const spellsAvailable = getAvailableSpells(char.spriteId, char.learnedSpells).length;
              return (
                <button
                  key={`${char.type}-${char.index}`}
                  onClick={() => setSelectedChar({ type: char.type, index: char.index })}
                  className={`w-full text-left px-3 py-2 border-2 transition-all ${
                    isSelected
                      ? "border-purple-400 bg-purple-800/40"
                      : "border-purple-800/30 bg-purple-900/20 hover:border-purple-600/50"
                  }`}
                  style={{ boxShadow: isSelected ? "inset 0 0 8px rgba(168,85,247,0.2)" : "none" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-purple-200">{char.name}</span>
                      <span className="text-[10px] text-purple-400/60 ml-2">
                        {char.type === "player" ? "Hero" : "Ally"}
                      </span>
                    </div>
                    <span
                      className="text-[10px] px-1.5 py-0.5 border"
                      style={{
                        color: ELEMENT_COLORS[char.element as keyof typeof ELEMENT_COLORS],
                        borderColor: ELEMENT_COLORS[char.element as keyof typeof ELEMENT_COLORS] + "40",
                      }}
                    >
                      {char.element}
                    </span>
                  </div>
                  {spellsAvailable > 0 ? (
                    <span className="text-[9px] text-purple-400/60">{spellsAvailable} spell{spellsAvailable > 1 ? "s" : ""} available</span>
                  ) : (
                    <span className="text-[9px] text-purple-400/30">All spells learned</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1">
            <h2 className="text-xs tracking-wider text-purple-400/80 mb-2" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.8)" }}>
              AVAILABLE SPELLS
            </h2>

            {!selectedChar && (
              <p className="text-sm text-purple-300/40 mt-8 text-center">Select a character to view available spells</p>
            )}

            {selectedChar && availableSpells.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-purple-300/40">No new spells available for this character.</p>
              </div>
            )}

            {selectedChar && availableSpells.length > 0 && (
              <div className="space-y-2">
                {availableSpells.map(spell => spell && (
                  <div
                    key={spell.id}
                    className="flex items-center justify-between px-3 py-2 border-2 border-purple-800/30 bg-purple-900/20"
                    style={{ boxShadow: "inset 0 0 6px rgba(0,0,0,0.4)" }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Sparkles
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: ELEMENT_COLORS[spell.element as keyof typeof ELEMENT_COLORS || selectedCharData?.element as keyof typeof ELEMENT_COLORS] }}
                      />
                      <div>
                        <p className="text-sm font-bold text-purple-200">{spell.name}</p>
                        <p className="text-[10px] text-purple-300/60">{spell.description}</p>
                        <p className="text-[9px] text-blue-300/50">{spell.mpCost} MP</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleLearn(spell.id)}
                      disabled={player.gold < SPELL_COST}
                      className="text-xs px-3 py-1 h-auto border-2 border-yellow-600 bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-300 disabled:opacity-40"
                      style={{ boxShadow: "inset 0 0 4px rgba(0,0,0,0.4)" }}
                    >
                      {SPELL_COST}g
                    </Button>
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
