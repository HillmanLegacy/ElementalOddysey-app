import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ParticleCanvas from "./ParticleCanvas";
import type { PlayerCharacter, PendingLevelUp } from "@shared/schema";
import { PERKS, ELEMENT_COLORS, COLOR_MAP } from "@/lib/gameData";
import { Sparkles } from "lucide-react";

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

  const availablePerks = PERKS.filter(
    p => p.element === characterElement && !existingPerks.includes(p.id)
  ).slice(0, 6);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <ParticleCanvas
        colors={[ELEMENT_COLORS[characterElement], "#a855f7", "#6366f1"]}
        count={50}
        speed={0.8}
        style="swirl"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-6">
          <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-purple-300" data-testid="text-choose-perk">Choose a Perk</h1>
          <p className="text-sm text-purple-400/60 mt-1">
            Select a new ability for <span className="text-amber-200/80">{characterName}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
          {availablePerks.map(perk => (
            <Card
              key={perk.id}
              className="p-4 bg-[#12122a]/90 border-purple-500/15 backdrop-blur-sm cursor-pointer hover:border-purple-400/30 transition-all hover:scale-[1.02]"
              onClick={() => onSelect(perk.id)}
              data-testid={`card-perk-${perk.id}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: ELEMENT_COLORS[perk.element] + "20",
                    border: `1px solid ${ELEMENT_COLORS[perk.element]}40`,
                  }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: ELEMENT_COLORS[perk.element] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{perk.name}</p>
                  <p className="text-xs text-purple-300/60 mt-0.5">{perk.description}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: ELEMENT_COLORS[perk.element] + "20",
                        color: ELEMENT_COLORS[perk.element],
                      }}
                    >
                      {perk.element}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {availablePerks.length === 0 && (
            <div className="col-span-2 text-center py-8">
              <p className="text-sm text-purple-400/50">No more perks available for {characterElement}</p>
              <Button
                variant="outline"
                className="mt-4 text-purple-300 border-purple-500/20"
                onClick={() => onSelect("")}
              >
                Skip
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
