import { useState } from "react";
import { Button } from "@/components/ui/button";
import SpriteAnimator from "./SpriteAnimator";
import ParticleCanvas from "./ParticleCanvas";
import { ELEMENT_COLORS, PARTY_SPRITE_DATA, getPartyMemberSpells } from "@/lib/gameData";
import type { PlayerCharacter, PartyMember } from "@shared/schema";
import { Heart, Droplets, Swords, Shield, Zap, Brain, Clover, ArrowLeft, UserMinus, Sparkles } from "lucide-react";

import samuraiIdle from "@/assets/images/samurai-idle.png";
import knightIdle from "@/assets/images/knight-idle-4f.png";
import baskenIdle from "@/assets/images/basken-idle.png";

const IDLE_SHEETS: Record<string, string> = {
  samurai: samuraiIdle,
  knight: knightIdle,
  basken: baskenIdle,
};

interface PartyManagementScreenProps {
  player: PlayerCharacter;
  onRemoveMember: (memberId: string) => void;
  onClose: () => void;
}

const STAT_ICONS = [
  { key: "maxHp", label: "HP", icon: Heart, color: "text-red-400" },
  { key: "maxMp", label: "MP", icon: Droplets, color: "text-blue-400" },
  { key: "atk", label: "ATK", icon: Swords, color: "text-orange-400" },
  { key: "def", label: "DEF", icon: Shield, color: "text-cyan-400" },
  { key: "int", label: "INT", icon: Brain, color: "text-purple-400" },
  { key: "agi", label: "AGI", icon: Zap, color: "text-yellow-400" },
  { key: "luck", label: "LCK", icon: Clover, color: "text-green-400" },
];

export default function PartyManagementScreen({ player, onRemoveMember, onClose }: PartyManagementScreenProps) {
  const [selectedMember, setSelectedMember] = useState<PartyMember | null>(player.party[0] || null);

  const activeParty = player.party;

  const getSpriteSheet = (spriteId: string) => IDLE_SHEETS[spriteId] || samuraiIdle;
  const getSpriteInfo = (spriteId: string) => PARTY_SPRITE_DATA[spriteId]?.idle || { frameWidth: 96, frameHeight: 96, totalFrames: 10 };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#12082a] to-[#0a0a1a]">
      <ParticleCanvas colors={["#a855f7", "#6366f1", "#818cf8"]} count={30} speed={0.3} style="swirl" />

      <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "'Cinzel', serif" }}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-purple-500/20 bg-black/30">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="text-purple-300/60 h-7 w-7" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-sm font-bold tracking-wider text-amber-200/90">PARTY</h1>
          </div>
          <span className="text-[10px] text-purple-300/40">{activeParty.length}/3 Members</span>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[140px] border-r border-purple-500/10 overflow-y-auto bg-black/20">
            {activeParty.length === 0 && (
              <div className="p-3 text-center text-[10px] text-purple-300/30">
                No party members yet. Defeat bosses to unlock allies!
              </div>
            )}
            {activeParty.map(member => {
              const spriteInfo = getSpriteInfo(member.spriteId);
              const isSelected = selectedMember?.id === member.id;
              return (
                <button
                  key={member.id}
                  className={`w-full flex items-center gap-2 px-2 py-2 text-left transition-colors border-b border-purple-500/5 ${isSelected ? "bg-purple-500/15 border-l-2 border-l-amber-400/60" : "hover:bg-purple-500/5"}`}
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <SpriteAnimator
                      spriteSheet={getSpriteSheet(member.spriteId)}
                      frameWidth={spriteInfo.frameWidth}
                      frameHeight={spriteInfo.frameHeight}
                      totalFrames={spriteInfo.totalFrames}
                      fps={6}
                      scale={0.5}
                      loop
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold text-purple-100 truncate">{member.name}</div>
                    <div className="text-[8px]" style={{ color: ELEMENT_COLORS[member.element] }}>{member.element}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {selectedMember ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 flex items-center justify-center bg-black/30 rounded-lg border border-purple-500/15 overflow-hidden">
                    <SpriteAnimator
                      spriteSheet={getSpriteSheet(selectedMember.spriteId)}
                      frameWidth={getSpriteInfo(selectedMember.spriteId).frameWidth}
                      frameHeight={getSpriteInfo(selectedMember.spriteId).frameHeight}
                      totalFrames={getSpriteInfo(selectedMember.spriteId).totalFrames}
                      fps={8}
                      scale={1}
                      loop
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-amber-200/90 tracking-wide">{selectedMember.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold" style={{ color: ELEMENT_COLORS[selectedMember.element] }}>
                        {selectedMember.element}
                      </span>
                      <span className="text-[9px] text-purple-300/40">Lv.{selectedMember.level}</span>
                      <span className="text-[9px] text-purple-300/40">{selectedMember.className}</span>
                    </div>
                    <div className="mt-1.5 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[10px] text-red-300/70 hover:text-red-300 hover:bg-red-500/10 h-6 px-2"
                        onClick={() => {
                          onRemoveMember(selectedMember.id);
                          const remaining = activeParty.filter(m => m.id !== selectedMember.id);
                          setSelectedMember(remaining[0] || null);
                        }}
                      >
                        <UserMinus className="w-3 h-3 mr-1" /> Remove from Party
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Heart className="w-3 h-3 text-red-400" />
                      <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${(selectedMember.stats.hp / selectedMember.stats.maxHp) * 100}%` }} />
                      </div>
                      <span className="text-[9px] text-red-300/80">{selectedMember.stats.hp}/{selectedMember.stats.maxHp}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-400" />
                      <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(selectedMember.stats.mp / selectedMember.stats.maxMp) * 100}%` }} />
                      </div>
                      <span className="text-[9px] text-blue-300/80">{selectedMember.stats.mp}/{selectedMember.stats.maxMp}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg border border-purple-500/10 p-2.5">
                  <h3 className="text-[9px] tracking-wider text-amber-200/60 mb-2">STATS</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {STAT_ICONS.map(({ key, label, icon: Icon, color }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <Icon className={`w-3 h-3 ${color} flex-shrink-0`} />
                        <span className="text-[9px] text-purple-300/50 w-6">{label}</span>
                        <span className="text-[10px] text-purple-100 font-semibold">
                          {selectedMember.stats[key as keyof typeof selectedMember.stats]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg border border-purple-500/10 p-2.5">
                  <h3 className="text-[9px] tracking-wider text-amber-200/60 mb-2">SPELLS</h3>
                  <div className="space-y-1">
                    {getPartyMemberSpells(selectedMember.element).map(spell => (
                      <div key={spell.id} className="flex items-center gap-2 px-1.5 py-1 rounded bg-black/20">
                        <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: ELEMENT_COLORS[spell.element || selectedMember.element] }} />
                        <span className="text-[10px] text-purple-100 flex-1">{spell.name}</span>
                        <span className="text-[8px] text-blue-300/60">{spell.mpCost}MP</span>
                      </div>
                    ))}
                    {getPartyMemberSpells(selectedMember.element).length === 0 && (
                      <span className="text-[9px] text-purple-300/30">No spells available</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-[10px] text-purple-300/30 text-center">
                  {activeParty.length === 0 ? "Defeat region bosses to unlock party members!" : "Select a party member to view details"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
