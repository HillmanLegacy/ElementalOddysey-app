import { useState } from "react";
import SpriteAnimator from "./SpriteAnimator";
import { ELEMENT_COLORS, PARTY_SPRITE_DATA, getPartyMemberSpells, PERKS } from "@/lib/gameData";
import type { PlayerCharacter, Spell } from "@shared/schema";
import { Heart, Droplets, Swords, Shield, Zap, Brain, Clover, Sparkles, Crown } from "lucide-react";
import { playSfx } from "@/lib/sfx";

import samuraiIdle from "@/assets/images/samurai-idle.png";
import slknightIdle from "@/assets/images/slknight-idle.png";
import baskenIdle from "@/assets/images/basken-idle.png";

const IDLE_SHEETS: Record<string, string> = {
  samurai: samuraiIdle,
  knight: slknightIdle,
  basken: baskenIdle,
};

interface PartyManagementScreenProps {
  player: PlayerCharacter;
  onRemoveMember: (memberId: string) => void;
  onAddMember: (memberId: string) => void;
  onClose: () => void;
}

const ACCENT = "#c9a44a";

const STAT_ICONS = [
  { key: "maxHp", label: "HP", icon: Heart, color: "#ef4444" },
  { key: "maxMp", label: "MP", icon: Droplets, color: "#60a5fa" },
  { key: "atk", label: "ATK", icon: Swords, color: "#fb923c" },
  { key: "def", label: "DEF", icon: Shield, color: "#22d3ee" },
  { key: "int", label: "INT", icon: Brain, color: "#a855f7" },
  { key: "agi", label: "AGI", icon: Zap, color: "#facc15" },
  { key: "luck", label: "LCK", icon: Clover, color: "#4ade80" },
];

interface DisplayMember {
  id: string;
  name: string;
  element: string;
  level: number;
  stats: any;
  spriteId: string;
  className?: string;
  isPlayer: boolean;
  isBenched: boolean;
  learnedSpells?: string[];
  perks?: string[];
}

export default function PartyManagementScreen({ player, onRemoveMember, onAddMember, onClose }: PartyManagementScreenProps) {
  const playerAsMember: DisplayMember = {
    id: "__player__",
    name: player.name,
    element: player.element,
    level: player.level,
    stats: player.stats,
    spriteId: player.spriteId,
    isPlayer: true,
    isBenched: false,
    learnedSpells: player.learnedSpells || [],
    perks: player.perks || [],
  };

  const activeMembers: DisplayMember[] = player.party.map(pm => ({
    id: pm.id,
    name: pm.name,
    element: pm.element,
    level: pm.level,
    stats: pm.stats,
    spriteId: pm.spriteId,
    className: pm.className,
    isPlayer: false,
    isBenched: false,
    learnedSpells: pm.learnedSpells || [],
    perks: pm.perks || [],
  }));

  const benchedMembers: DisplayMember[] = (player.benchedParty || []).map(pm => ({
    id: pm.id,
    name: pm.name,
    element: pm.element,
    level: pm.level,
    stats: pm.stats,
    spriteId: pm.spriteId,
    className: pm.className,
    isPlayer: false,
    isBenched: true,
    learnedSpells: pm.learnedSpells || [],
    perks: pm.perks || [],
  }));

  const allMembers = [playerAsMember, ...activeMembers, ...benchedMembers];

  const [selectedId, setSelectedId] = useState<string>("__player__");
  const selectedMember = allMembers.find(m => m.id === selectedId) || allMembers[0];

  const getSpriteSheet = (spriteId: string) => IDLE_SHEETS[spriteId] || samuraiIdle;
  const getSpriteInfo = (spriteId: string) => PARTY_SPRITE_DATA[spriteId]?.idle || { frameWidth: 96, frameHeight: 96, totalFrames: 10 };

  const getSpells = (member: DisplayMember): Spell[] => {
    if (member.isPlayer) {
      return getPartyMemberSpells(member.element as any, member.level, member.learnedSpells || []);
    }
    return getPartyMemberSpells(member.element as any, member.level || 1, member.learnedSpells || []);
  };

  const renderMemberButton = (member: DisplayMember) => {
    const spriteInfo = getSpriteInfo(member.spriteId);
    const isSelected = selectedId === member.id;
    return (
      <button
        key={member.id}
        onClick={() => { playSfx('menuSelect'); setSelectedId(member.id); }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 8px",
          textAlign: "left" as const,
          background: isSelected ? `${ACCENT}20` : "transparent",
          borderLeft: isSelected ? `2px solid ${ACCENT}` : "2px solid transparent",
          borderBottom: `1px solid ${ACCENT}10`,
          borderTop: "none",
          borderRight: "none",
          cursor: "pointer",
          opacity: member.isBenched ? 0.5 : 1,
          fontFamily: "'Press Start 2P', cursive",
        }}
      >
        <div style={{ width: 32, height: 32, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
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
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <span style={{ fontSize: "7px", color: "#e8e0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.name}</span>
            {member.isPlayer && <Crown style={{ width: 10, height: 10, color: ACCENT, flexShrink: 0 }} />}
          </div>
          <div style={{ fontSize: "6px", color: ELEMENT_COLORS[member.element as keyof typeof ELEMENT_COLORS] }}>{member.element}</div>
        </div>
      </button>
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
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

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", zIndex: 2 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 12px",
            borderBottom: `3px solid ${ACCENT}`,
            background: "#0d0b0bf0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => { playSfx('menuSelect'); onClose(); }}
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "8px",
                color: ACCENT,
                background: "transparent",
                border: `1px solid ${ACCENT}50`,
                padding: "4px 8px",
                cursor: "pointer",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ←
            </button>
            <span style={{ fontSize: "10px", color: ACCENT }}>PARTY</span>
          </div>
          <span style={{ fontSize: "7px", color: `${ACCENT}60` }}>
            {1 + activeMembers.length} Active{benchedMembers.length > 0 ? ` · ${benchedMembers.length} Benched` : ""}
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ width: 140, borderRight: `1px solid ${ACCENT}20`, overflowY: "auto", background: "#0a080840" }}>
            {renderMemberButton(playerAsMember)}
            {activeMembers.map(m => renderMemberButton(m))}

            {benchedMembers.length > 0 && (
              <>
                <div style={{ padding: "4px 8px", background: "#0a080860", borderBottom: `1px solid ${ACCENT}10` }}>
                  <span style={{ fontSize: "6px", letterSpacing: "1px", color: `${ACCENT}40`, textTransform: "uppercase" }}>Benched</span>
                </div>
                {benchedMembers.map(m => renderMemberButton(m))}
              </>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {selectedMember ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#0a080860",
                      border: `1px solid ${ACCENT}30`,
                      overflow: "hidden",
                    }}
                  >
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "9px", color: ACCENT }}>{selectedMember.name}</span>
                      {selectedMember.isPlayer && (
                        <span style={{ fontSize: "6px", padding: "1px 4px", background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>LEADER</span>
                      )}
                      {selectedMember.isBenched && (
                        <span style={{ fontSize: "6px", padding: "1px 4px", background: "#55555520", color: "#888", border: "1px solid #55555530" }}>BENCHED</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                      <span style={{ fontSize: "7px", color: ELEMENT_COLORS[selectedMember.element as keyof typeof ELEMENT_COLORS] }}>
                        {selectedMember.element}
                      </span>
                      <span style={{ fontSize: "7px", color: `${ACCENT}50` }}>Lv.{selectedMember.level}</span>
                      {selectedMember.className && <span style={{ fontSize: "7px", color: `${ACCENT}50` }}>{selectedMember.className}</span>}
                    </div>
                    {!selectedMember.isPlayer && (
                      <div style={{ marginTop: "6px" }}>
                        {selectedMember.isBenched ? (
                          <button
                            onClick={() => { playSfx('menuSelect'); onAddMember(selectedMember.id); setSelectedId(selectedMember.id); }}
                            style={{
                              fontFamily: "'Press Start 2P', cursive",
                              fontSize: "7px",
                              padding: "4px 8px",
                              border: "1px solid #4ade8060",
                              background: "#4ade8010",
                              color: "#4ade80",
                              cursor: "pointer",
                            }}
                          >
                            + ADD TO PARTY
                          </button>
                        ) : (
                          <button
                            onClick={() => { playSfx('menuSelect'); onRemoveMember(selectedMember.id); setSelectedId("__player__"); }}
                            style={{
                              fontFamily: "'Press Start 2P', cursive",
                              fontSize: "7px",
                              padding: "4px 8px",
                              border: "1px solid #ef444460",
                              background: "#ef444410",
                              color: "#fca5a5",
                              cursor: "pointer",
                            }}
                          >
                            − BENCH
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
                      <Heart style={{ width: 12, height: 12, color: "#ef4444" }} />
                      <div style={{ flex: 1, height: 6, background: "#0a080880", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "#ef4444", width: `${(selectedMember.stats.hp / selectedMember.stats.maxHp) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: "7px", color: "#fca5a5cc" }}>{selectedMember.stats.hp}/{selectedMember.stats.maxHp}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Droplets style={{ width: 12, height: 12, color: "#60a5fa" }} />
                      <div style={{ flex: 1, height: 6, background: "#0a080880", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "#60a5fa", width: `${(selectedMember.stats.mp / selectedMember.stats.maxMp) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: "7px", color: "#93c5fdcc" }}>{selectedMember.stats.mp}/{selectedMember.stats.maxMp}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#0a080860", border: `1px solid ${ACCENT}20`, padding: "8px" }}>
                  <h3 style={{ fontSize: "7px", letterSpacing: "1px", color: `${ACCENT}90`, marginBottom: "6px" }}>STATS</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                    {STAT_ICONS.map(({ key, label, icon: Icon, color }) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Icon style={{ width: 10, height: 10, color, flexShrink: 0 }} />
                        <span style={{ fontSize: "7px", color: `${ACCENT}60`, width: 24 }}>{label}</span>
                        <span style={{ fontSize: "8px", color: "#e8e0d0" }}>
                          {selectedMember.stats[key as keyof typeof selectedMember.stats]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "#0a080860", border: `1px solid ${ACCENT}20`, padding: "8px" }}>
                  <h3 style={{ fontSize: "7px", letterSpacing: "1px", color: `${ACCENT}90`, marginBottom: "6px" }}>SPELLS</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {getSpells(selectedMember).map(spell => (
                      <div key={spell.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "3px 6px", background: "#0a080840" }}>
                        <Sparkles style={{ width: 10, height: 10, flexShrink: 0, color: ELEMENT_COLORS[spell.element as keyof typeof ELEMENT_COLORS || selectedMember.element as keyof typeof ELEMENT_COLORS] }} />
                        <span style={{ fontSize: "7px", color: "#e8e0d0", flex: 1 }}>{spell.name}</span>
                        <span style={{ fontSize: "6px", color: "#93c5fd80" }}>{spell.mpCost}MP</span>
                      </div>
                    ))}
                    {getSpells(selectedMember).length === 0 && (
                      <span style={{ fontSize: "7px", color: `${ACCENT}30` }}>No spells available</span>
                    )}
                  </div>
                </div>

                {selectedMember.perks && selectedMember.perks.length > 0 && (
                  <div style={{ background: "#0a080860", border: `1px solid ${ACCENT}20`, padding: "8px" }}>
                    <h3 style={{ fontSize: "7px", letterSpacing: "1px", color: `${ACCENT}90`, marginBottom: "6px" }}>PERKS</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {selectedMember.perks.map(perkId => {
                        const perk = PERKS.find(p => p.id === perkId);
                        if (!perk) return null;
                        return (
                          <div key={perkId} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "3px 6px", background: "#0a080840" }}>
                            <Sparkles style={{ width: 10, height: 10, flexShrink: 0, color: ELEMENT_COLORS[perk.element as keyof typeof ELEMENT_COLORS] }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: "7px", color: "#e8e0d0", display: "block" }}>{perk.name}</span>
                              <span style={{ fontSize: "6px", color: `${ACCENT}50`, display: "block" }}>{perk.description}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <p style={{ fontSize: "7px", color: `${ACCENT}40`, textAlign: "center" }}>
                  Select a party member to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
