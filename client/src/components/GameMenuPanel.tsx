import { useState } from "react";
import { Heart, Droplets, Zap, X, Save, Coins, Sword, Shield, Gem, BookOpen, Star } from "lucide-react";
import type { PlayerCharacter } from "@shared/schema";
import { ELEMENT_COLORS, PERKS, getPlayerSpells, getPartyMemberSpells } from "@/lib/gameData";
import { getSaves, type LocalSave } from "@/lib/localSaves";
import { groupConsumables } from "@/lib/utils";
import { playSfx } from "@/lib/sfx";

type MenuTab = "party" | "items" | "gear" | "status" | "options" | "save";

interface GameMenuPanelProps {
  player: PlayerCharacter;
  onClose: () => void;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: "weapon" | "armor" | "accessory") => void;
  onUseItem: (itemId: string, targetPartyIndex?: number) => void;
  onSave: (slotNumber: number) => void;
  onExitToMenu?: () => void;
  textSpeed: "slow" | "medium" | "fast";
  musicVolume: number;
  sfxVolume: number;
  onTextSpeedChange: (speed: "slow" | "medium" | "fast") => void;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
  regionName?: string;
  regionTheme?: string;
  tier?: number;
  initialTab?: MenuTab;
}

const STAT_LABELS: Record<string, string> = {
  hp: "HP", maxHp: "MAX HP", mp: "MP", maxMp: "MAX MP",
  atk: "ATK", def: "DEF", agi: "AGI", int: "INT", luck: "LUCK",
};
const DISPLAY_STATS = ["maxHp", "maxMp", "atk", "def", "agi", "int", "luck"] as const;

function StatSection({ label, icon, color, children }: { label: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${color}25`, background: "#0d0a0af0" }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${color}20`, background: `${color}08` }}>
        <span style={{ color: `${color}99` }}>{icon}</span>
        <span style={{ fontSize: "7px", color: `${color}cc`, letterSpacing: "2px" }}>{label}</span>
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  );
}

export default function GameMenuPanel({
  player, onClose, onEquip, onUnequip, onUseItem, onSave, onExitToMenu,
  textSpeed, musicVolume, sfxVolume, onTextSpeedChange, onMusicVolumeChange, onSfxVolumeChange,
  regionName, regionTheme, tier, initialTab = "party",
}: GameMenuPanelProps) {
  const [menuTab, setMenuTab] = useState<MenuTab>(initialTab);
  const [saves, setSaves] = useState<LocalSave[]>(() => getSaves());
  const [saveSuccessSlot, setSaveSuccessSlot] = useState<number | null>(null);
  const [targetingItemId, setTargetingItemId] = useState<string | null>(null);
  const [statusCharIdx, setStatusCharIdx] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);

  const accentColor = regionTheme ? (ELEMENT_COLORS[regionTheme] || "#c9a44a") : "#c9a44a";

  const tabs: { id: MenuTab; label: string }[] = [
    { id: "party", label: "PARTY" },
    { id: "items", label: "ITEMS" },
    { id: "gear", label: "GEAR" },
    { id: "status", label: "STATUS" },
    { id: "options", label: "OPTIONS" },
    { id: "save", label: "SAVE" },
  ];

  const allChars = [
    { name: player.name, element: player.element, isPlayer: true, index: -1 },
    ...player.party.map((m, i) => ({ name: m.name, element: m.element, isPlayer: false, index: i })),
  ];
  const selectedChar = allChars[statusCharIdx];
  const char = selectedChar.isPlayer ? player : player.party[selectedChar.index];
  const charColor = ELEMENT_COLORS[char.element] ?? "#c9a44a";
  const spells = selectedChar.isPlayer
    ? getPlayerSpells(player)
    : getPartyMemberSpells(player.party[selectedChar.index].element, player.party[selectedChar.index].level, player.party[selectedChar.index].learnedSpells ?? []);
  const perkIds: string[] = selectedChar.isPlayer ? (player.perks ?? []) : (player.party[selectedChar.index].perks ?? []);
  const activePerks = perkIds.map(id => PERKS.find(p => p.id === id)).filter(Boolean) as typeof PERKS;
  const equip = selectedChar.isPlayer ? player.equipment : { weapon: null, armor: null, accessory: null };

  return (
    <div className="absolute top-3 left-3 z-[200]" style={{ fontFamily: "'Press Start 2P', cursive", imageRendering: "pixelated" as any }}>
      <div className="relative overflow-hidden" style={{
        width: "480px",
        background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
        border: `3px solid #c9a44a`,
        boxShadow: `0 0 20px #c9a44a40, 0 0 60px #c9a44a15, inset 0 0 30px rgba(0,0,0,0.5)`,
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, #c9a44a08 3px, #c9a44a08 4px)`, pointerEvents: "none" }} />

        {/* Header */}
        <div className="relative px-4 pt-3 pb-2 flex items-center justify-between" style={{ background: "#0d0b0bf0", borderBottom: `3px solid #c9a44a` }}>
          <div className="flex items-center gap-2">
            {regionName && (
              <>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4" style={{ color: "#fbbf24" }} />
                  <span style={{ fontSize: "10px", color: "#fbbf24", letterSpacing: "1px" }}>{player.gold}</span>
                </div>
                <span style={{ fontSize: "10px", color: "#c9a44a60" }}>|</span>
                <span style={{ fontSize: "10px", color: accentColor, letterSpacing: "1px" }}>{regionName}</span>
                {tier !== undefined && (
                  <div className="flex items-center gap-0.5 ml-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < tier ? "#4ade80" : "#ffffff20" }} />
                    ))}
                  </div>
                )}
              </>
            )}
            {!regionName && (
              <span style={{ fontSize: "10px", color: "#c9a44a", letterSpacing: "1px" }}>MENU</span>
            )}
          </div>
          <button
            className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110"
            style={{ border: `1px solid #c9a44a50`, background: "transparent" }}
            onClick={() => { playSfx("menuSelect"); onClose(); }}
            data-testid="button-close-menu"
          >
            <X className="w-3 h-3" style={{ color: "#c9a44a" }} />
          </button>
        </div>

        {/* Body */}
        <div className="relative flex" style={{ minHeight: "360px", maxHeight: "520px" }}>
          {/* Sidebar tabs */}
          <div className="flex flex-col flex-shrink-0" style={{ width: "88px", borderRight: `2px solid #c9a44a30`, background: "#09070780" }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { playSfx("menuSelect"); setMenuTab(tab.id); setTargetingItemId(null); if (tab.id === "save") setSaves(getSaves()); }}
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "7px",
                  padding: "10px 8px",
                  textAlign: "left",
                  borderBottom: `1px solid #c9a44a20`,
                  borderRight: menuTab === tab.id ? `3px solid #c9a44a` : "3px solid transparent",
                  background: menuTab === tab.id ? "#c9a44a18" : "transparent",
                  color: menuTab === tab.id ? "#c9a44a" : "#c9a44a60",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  width: "100%",
                }}
                data-testid={`tab-menu-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}

            {onExitToMenu && (
              <>
                <div style={{ borderTop: `1px solid #c9a44a25`, margin: "6px 10px" }} />
                <button
                  onClick={() => { playSfx("menuSelect"); setConfirmExit(true); }}
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "7px",
                    padding: "10px 8px",
                    textAlign: "left",
                    borderBottom: `1px solid #c9a44a20`,
                    borderRight: confirmExit ? "3px solid #ef4444" : "3px solid transparent",
                    background: confirmExit ? "#ef444412" : "transparent",
                    color: "#ef444480",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    width: "100%",
                  }}
                  data-testid="tab-menu-exit"
                >
                  EXIT
                </button>
              </>
            )}
          </div>

          {/* Content pane */}
          <div className="relative flex-1 overflow-y-auto px-4 py-3" style={{ maxHeight: "520px" }}>

            {/* PARTY TAB */}
            {menuTab === "party" && (
              <div className="space-y-2">
                {[
                  { name: player.name, stats: player.stats, level: player.level, element: player.element, xp: player.xp, xpToNext: player.xpToNext },
                  ...player.party.map(m => ({ name: m.name, stats: m.stats, level: m.level, element: m.element, xp: m.xp || 0, xpToNext: m.xpToNext || 100 }))
                ].map((member, idx) => (
                  <div key={idx} style={{ padding: "8px 10px", background: "#0d0b0bf0", border: `1px solid #c9a44a30` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>{member.name}</span>
                        <span style={{ fontSize: "8px", color: "#c9a44a60" }}>Lv.{member.level}</span>
                      </div>
                      <span style={{ fontSize: "8px", color: ELEMENT_COLORS[member.element] || "#c9a44a" }}>{member.element}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-3 h-3 text-red-500 flex-shrink-0" />
                        <div className="flex-1 h-2.5 relative" style={{ background: "#1a0808", border: "1px solid #ef444440" }}>
                          <div className="absolute inset-0" style={{ width: `${(member.stats.hp / member.stats.maxHp) * 100}%`, background: "linear-gradient(90deg, #dc2626, #ef4444)", transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontSize: "7px", color: "#fca5a5", minWidth: "48px", textAlign: "right" }}>{member.stats.hp}/{member.stats.maxHp}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 h-2.5 relative" style={{ background: "#080818", border: "1px solid #3b82f640" }}>
                          <div className="absolute inset-0" style={{ width: `${(member.stats.mp / member.stats.maxMp) * 100}%`, background: "linear-gradient(90deg, #2563eb, #3b82f6)", transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontSize: "7px", color: "#93c5fd", minWidth: "48px", textAlign: "right" }}>{member.stats.mp}/{member.stats.maxMp}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                        <div className="flex-1 h-2.5 relative" style={{ background: "#181808", border: "1px solid #eab30840" }}>
                          <div className="absolute inset-0" style={{ width: `${(member.xp / member.xpToNext) * 100}%`, background: "linear-gradient(90deg, #ca8a04, #eab308)", transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontSize: "7px", color: "#fde68a", minWidth: "48px", textAlign: "right" }}>{member.xp}/{member.xpToNext}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ITEMS TAB */}
            {menuTab === "items" && (() => {
              const consumables = player.inventory.filter(i => i.type === "consumable");
              return (
                <div className="space-y-1.5">
                  {consumables.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <p style={{ fontSize: "9px", color: "#c9a44a50" }}>No consumable items</p>
                    </div>
                  ) : (
                    groupConsumables(consumables).map(({ item, count, ids }) => {
                      const canUseOnPlayer = item.effect.type === "heal" && (
                        (item.effect.stat === "hp" && player.stats.hp < player.stats.maxHp) ||
                        (item.effect.stat === "mp" && player.stats.mp < player.stats.maxMp)
                      );
                      const canUseOnAny = canUseOnPlayer || player.party.some(m =>
                        item.effect.type === "heal" && (
                          (item.effect.stat === "hp" && m.stats.hp < m.stats.maxHp) ||
                          (item.effect.stat === "mp" && m.stats.mp < m.stats.maxMp)
                        )
                      );
                      const isTargeting = targetingItemId === item.name;
                      return (
                        <div key={item.name} style={{ padding: "8px 10px", background: "#0d0b0bf0", border: `1px solid #c9a44a30` }}>
                          <div className="flex items-center justify-between gap-2">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>
                                {item.name} <span style={{ color: "#c9a44acc" }}>x{count}</span>
                              </p>
                              <p style={{ fontSize: "7px", color: "#c9a44a60", marginTop: "2px" }}>{item.description}</p>
                            </div>
                            <button
                              onClick={() => {
                                playSfx("menuSelect");
                                if (player.party.length > 0) {
                                  setTargetingItemId(isTargeting ? null : item.name);
                                } else {
                                  onUseItem(ids[0]);
                                }
                              }}
                              disabled={!canUseOnAny}
                              style={{
                                fontFamily: "'Press Start 2P', cursive",
                                fontSize: "8px",
                                padding: "4px 8px",
                                border: `1px solid ${isTargeting ? "#e8c030" : "#c9a44a"}60`,
                                background: isTargeting ? "#e8c03020" : "transparent",
                                color: isTargeting ? "#e8c030" : "#c9a44a",
                                cursor: canUseOnAny ? "pointer" : "default",
                                opacity: canUseOnAny ? 1 : 0.4,
                              }}
                            >
                              {isTargeting ? "CANCEL" : "USE"}
                            </button>
                          </div>
                          {isTargeting && (
                            <div style={{ marginTop: "4px", paddingTop: "4px", borderTop: `1px solid #c9a44a20` }}>
                              <p style={{ fontSize: "7px", color: "#c9a44a50", marginBottom: "3px" }}>Select target:</p>
                              <button
                                disabled={!canUseOnPlayer}
                                onClick={() => { playSfx("menuSelect"); onUseItem(ids[0]); setTargetingItemId(null); }}
                                style={{
                                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                  padding: "3px 6px", background: "#0a080820", border: `1px solid #c9a44a15`,
                                  cursor: canUseOnPlayer ? "pointer" : "default", opacity: canUseOnPlayer ? 1 : 0.3,
                                  marginBottom: "2px", fontFamily: "'Press Start 2P', cursive",
                                }}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span style={{ fontSize: "7px", color: "#c9a44a" }}>{player.name}</span>
                                  <span style={{ fontSize: "6px", color: "#c9a44a50" }}>(You)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {item.effect.stat === "hp" && (
                                    <div className="flex items-center gap-1">
                                      <Heart style={{ width: 8, height: 8, color: "#ef4444" }} />
                                      <span style={{ fontSize: "6px", color: player.stats.hp < player.stats.maxHp ? "#fca5a5" : "#86efac" }}>{player.stats.hp}/{player.stats.maxHp}</span>
                                    </div>
                                  )}
                                  {item.effect.stat === "mp" && (
                                    <div className="flex items-center gap-1">
                                      <Droplets style={{ width: 8, height: 8, color: "#60a5fa" }} />
                                      <span style={{ fontSize: "6px", color: player.stats.mp < player.stats.maxMp ? "#93c5fd" : "#86efac" }}>{player.stats.mp}/{player.stats.maxMp}</span>
                                    </div>
                                  )}
                                </div>
                              </button>
                              {player.party.map((member, idx) => {
                                const canUseOnMember = item.effect.type === "heal" && (
                                  (item.effect.stat === "hp" && member.stats.hp < member.stats.maxHp) ||
                                  (item.effect.stat === "mp" && member.stats.mp < member.stats.maxMp)
                                );
                                return (
                                  <button
                                    key={member.id}
                                    disabled={!canUseOnMember}
                                    onClick={() => { playSfx("menuSelect"); onUseItem(ids[0], idx); setTargetingItemId(null); }}
                                    style={{
                                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                      padding: "3px 6px", background: "#0a080820", border: `1px solid #c9a44a15`,
                                      cursor: canUseOnMember ? "pointer" : "default", opacity: canUseOnMember ? 1 : 0.3,
                                      marginBottom: "2px", fontFamily: "'Press Start 2P', cursive",
                                    }}
                                  >
                                    <span style={{ fontSize: "7px", color: "#e8e0d0" }}>{member.name}</span>
                                    <div className="flex items-center gap-1.5">
                                      {item.effect.stat === "hp" && (
                                        <div className="flex items-center gap-1">
                                          <Heart style={{ width: 8, height: 8, color: "#ef4444" }} />
                                          <span style={{ fontSize: "6px", color: member.stats.hp < member.stats.maxHp ? "#fca5a5" : "#86efac" }}>{member.stats.hp}/{member.stats.maxHp}</span>
                                        </div>
                                      )}
                                      {item.effect.stat === "mp" && (
                                        <div className="flex items-center gap-1">
                                          <Droplets style={{ width: 8, height: 8, color: "#60a5fa" }} />
                                          <span style={{ fontSize: "6px", color: member.stats.mp < member.stats.maxMp ? "#93c5fd" : "#86efac" }}>{member.stats.mp}/{member.stats.maxMp}</span>
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })()}

            {/* GEAR TAB */}
            {menuTab === "gear" && (() => {
              const equipables = player.inventory.filter(i => i.type === "weapon" || i.type === "armor" || i.type === "accessory");
              return (
                <div className="space-y-1.5">
                  <p style={{ fontSize: "8px", color: "#c9a44a60", textTransform: "uppercase", letterSpacing: "1px" }}>Equipped</p>
                  {(["weapon", "armor", "accessory"] as const).map(slot => {
                    const item = player.equipment[slot];
                    return (
                      <div key={slot} style={{ padding: "8px 10px", background: "#0d0b0bf0", border: `1px solid #c9a44a30` }}>
                        <p style={{ fontSize: "7px", color: "#c9a44a60", textTransform: "uppercase", letterSpacing: "1px" }}>{slot}</p>
                        {item ? (
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>{item.name}</p>
                              <p style={{ fontSize: "7px", color: "#c9a44a60", marginTop: "2px" }}>{item.description}</p>
                            </div>
                            <button
                              onClick={() => { playSfx("menuSelect"); onUnequip(slot); }}
                              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "7px", padding: "4px 8px", border: `1px solid #c9a44a60`, background: "transparent", color: "#c9a44a", cursor: "pointer" }}
                            >UNEQUIP</button>
                          </div>
                        ) : (
                          <p style={{ fontSize: "8px", color: "#c9a44a40", fontStyle: "italic", marginTop: "2px" }}>Empty</p>
                        )}
                      </div>
                    );
                  })}
                  {equipables.length > 0 && (
                    <>
                      <div style={{ borderTop: `1px solid #c9a44a20`, marginTop: "6px", paddingTop: "6px" }}>
                        <p style={{ fontSize: "8px", color: "#c9a44a60", textTransform: "uppercase", letterSpacing: "1px" }}>Unequipped</p>
                      </div>
                      {equipables.map(item => (
                        <div key={item.id} style={{ padding: "8px 10px", background: "#0d0b0bf0", border: `1px solid #c9a44a30` }}>
                          <div className="flex items-center justify-between gap-2">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="flex items-center gap-1.5">
                                <p style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>{item.name}</p>
                                <span style={{ fontSize: "6px", padding: "1px 4px", border: `1px solid #c9a44a30`, color: "#c9a44a80", textTransform: "capitalize" }}>{item.type}</span>
                              </div>
                              <p style={{ fontSize: "7px", color: "#c9a44a60", marginTop: "2px" }}>{item.description}</p>
                            </div>
                            <button
                              onClick={() => { playSfx("menuSelect"); onEquip(item.id); }}
                              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "7px", padding: "4px 8px", border: `1px solid #c9a44a60`, background: "transparent", color: "#c9a44a", cursor: "pointer" }}
                            >EQUIP</button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })()}

            {/* STATUS TAB */}
            {menuTab === "status" && (
              <div>
                {/* Character selector */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {allChars.map((c, i) => {
                    const cc = ELEMENT_COLORS[c.element] ?? "#c9a44a";
                    const isActive = i === statusCharIdx;
                    return (
                      <button
                        key={i}
                        onClick={() => { playSfx("menuSelect"); setStatusCharIdx(i); }}
                        style={{
                          fontFamily: "'Press Start 2P', cursive",
                          fontSize: "7px",
                          padding: "4px 8px",
                          border: isActive ? `2px solid ${cc}` : `1px solid #c9a44a30`,
                          background: isActive ? `${cc}20` : "transparent",
                          color: isActive ? cc : "#c9a44a60",
                          cursor: "pointer",
                          letterSpacing: "1px",
                        }}
                      >{c.name.toUpperCase()}</button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {/* Name / level / xp */}
                  <div className="px-3 py-2 flex items-center justify-between" style={{ border: `1px solid ${charColor}40`, background: `${charColor}10` }}>
                    <div>
                      <div style={{ fontSize: "10px", color: charColor, letterSpacing: "2px" }}>{char.name.toUpperCase()}</div>
                      <div style={{ fontSize: "7px", color: `${charColor}80`, marginTop: "3px", letterSpacing: "1px" }}>LV {char.level} — {char.element.toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "7px", color: "#a08080", letterSpacing: "1px" }}>XP</div>
                      <div style={{ fontSize: "8px", color: "#d0c0b0" }}>{char.xp} / {char.xpToNext}</div>
                    </div>
                  </div>

                  <StatSection label="STATS" icon={<Star className="w-3 h-3" />} color={charColor}>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                      {DISPLAY_STATS.map(stat => (
                        <div key={stat} className="flex items-center justify-between">
                          <span style={{ fontSize: "7px", color: "#887878", letterSpacing: "1px" }}>{STAT_LABELS[stat]}</span>
                          <span style={{ fontSize: "8px", color: "#e8e0d0" }}>{char.stats[stat]}</span>
                        </div>
                      ))}
                    </div>
                  </StatSection>

                  <StatSection label="EQUIPMENT" icon={<Sword className="w-3 h-3" />} color={charColor}>
                    {selectedChar.isPlayer ? (
                      <div className="space-y-2">
                        {(["weapon", "armor", "accessory"] as const).map(slot => {
                          const item = equip[slot];
                          return (
                            <div key={slot} className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {slot === "weapon" && <Sword className="w-2.5 h-2.5 opacity-50" style={{ color: charColor }} />}
                                {slot === "armor" && <Shield className="w-2.5 h-2.5 opacity-50" style={{ color: charColor }} />}
                                {slot === "accessory" && <Gem className="w-2.5 h-2.5 opacity-50" style={{ color: charColor }} />}
                                <span style={{ fontSize: "6px", color: "#665555", letterSpacing: "1px" }}>{slot.toUpperCase()}</span>
                              </div>
                              <div style={{ fontSize: "7px", color: item ? "#e8e0d0" : "#443333" }}>{item ? item.name : "—"}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: "7px", color: "#554444", letterSpacing: "1px" }}>No gear equipped</div>
                    )}
                  </StatSection>

                  <StatSection label="MAGIC" icon={<Zap className="w-3 h-3" />} color={charColor}>
                    {spells.length === 0 ? (
                      <div style={{ fontSize: "7px", color: "#554444", letterSpacing: "1px" }}>No spells learned</div>
                    ) : (
                      <div className="space-y-2">
                        {spells.map(spell => (
                          <div key={spell.id} className="flex items-start justify-between gap-2">
                            <div>
                              <div style={{ fontSize: "7px", color: "#e8e0d0", letterSpacing: "1px" }}>{spell.name}</div>
                              <div style={{ fontSize: "6px", color: "#665555", marginTop: "2px" }}>{spell.description}</div>
                            </div>
                            <div style={{ flexShrink: 0, padding: "1px 6px", border: `1px solid #60a5fa50`, background: "#0a0f2080", fontSize: "6px", color: "#60a5fa", letterSpacing: "1px" }}>{spell.mpCost}MP</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </StatSection>

                  <StatSection label="PERKS" icon={<BookOpen className="w-3 h-3" />} color={charColor}>
                    {activePerks.length === 0 ? (
                      <div style={{ fontSize: "7px", color: "#554444", letterSpacing: "1px" }}>No perks active</div>
                    ) : (
                      <div className="space-y-2">
                        {activePerks.map(perk => (
                          <div key={perk.id} className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-1 mt-1" style={{ height: "6px", background: ELEMENT_COLORS[perk.element] ?? charColor }} />
                            <div>
                              <div style={{ fontSize: "7px", color: "#e8e0d0", letterSpacing: "1px" }}>{perk.name}</div>
                              <div style={{ fontSize: "6px", color: "#665555", marginTop: "2px" }}>{perk.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </StatSection>
                </div>
              </div>
            )}

            {/* OPTIONS TAB */}
            {menuTab === "options" && (
              <div className="space-y-6" style={{ padding: "4px 0" }}>
                <div>
                  <label style={{ fontSize: "7px", color: "#c9a44a60", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>TEXT SPEED</label>
                  <div className="flex gap-2">
                    {(["slow", "medium", "fast"] as const).map(sp => (
                      <button key={sp} className="flex-1 py-2 text-[7px]"
                        style={{
                          fontFamily: "'Press Start 2P', cursive",
                          border: textSpeed === sp ? `2px solid #c9a44a` : `1px solid #c9a44a30`,
                          background: textSpeed === sp ? `#c9a44a25` : "#0d0b0bf0",
                          color: textSpeed === sp ? "#c9a44a" : "#c9a44a60",
                          cursor: "pointer",
                        }}
                        onClick={() => { playSfx("menuSelect"); onTextSpeedChange(sp); }}
                      >{sp.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "7px", color: "#c9a44a60", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>MUSIC: {musicVolume}%</label>
                  <input type="range" min={0} max={100} value={musicVolume}
                    onChange={e => onMusicVolumeChange(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#c9a44a" }} />
                </div>
                <div>
                  <label style={{ fontSize: "7px", color: "#c9a44a60", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>SFX: {sfxVolume}%</label>
                  <input type="range" min={0} max={100} value={sfxVolume}
                    onChange={e => onSfxVolumeChange(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#c9a44a" }} />
                </div>
              </div>
            )}

            {/* SAVE TAB */}
            {menuTab === "save" && (
              <div className="space-y-2">
                <p style={{ fontSize: "8px", color: "#c9a44a60", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Save to slot</p>
                {[1, 2, 3].map(slot => {
                  const existing = saves.find(s => s.slotName === `Slot ${slot}`);
                  const isSuccess = saveSuccessSlot === slot;
                  return (
                    <div key={slot} style={{ padding: "10px 10px", background: "#0d0b0bf0", border: `1px solid ${isSuccess ? "#4ade80" : "#c9a44a30"}`, transition: "border-color 0.3s" }}>
                      <div className="flex items-center justify-between gap-2">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex items-center gap-2">
                            <Save className="w-3 h-3" style={{ color: isSuccess ? "#4ade80" : "#c9a44a80" }} />
                            <span style={{ fontSize: "9px", color: isSuccess ? "#4ade80" : "#e8e0d0", letterSpacing: "1px" }}>{isSuccess ? "SAVED!" : `Slot ${slot}`}</span>
                          </div>
                          {existing && !isSuccess && (
                            <p style={{ fontSize: "7px", color: "#c9a44a60", marginTop: "3px" }}>Lv.{existing.playerData.level} {existing.playerData.name} · {new Date(existing.updatedAt).toLocaleDateString()}</p>
                          )}
                          {!existing && !isSuccess && (
                            <p style={{ fontSize: "7px", color: "#c9a44a30", marginTop: "3px", fontStyle: "italic" }}>Empty</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            playSfx("menuSelect");
                            onSave(slot);
                            setSaves(getSaves());
                            setSaveSuccessSlot(slot);
                            setTimeout(() => setSaveSuccessSlot(null), 2000);
                          }}
                          style={{
                            fontFamily: "'Press Start 2P', cursive", fontSize: "7px", padding: "5px 10px",
                            border: `1px solid ${isSuccess ? "#4ade8060" : "#c9a44a60"}`,
                            background: isSuccess ? "#4ade8015" : "transparent",
                            color: isSuccess ? "#4ade80" : "#c9a44a",
                            cursor: "pointer",
                          }}
                          data-testid={`button-save-slot-${slot}`}
                        >{existing ? "OVERWRITE" : "SAVE"}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Exit confirmation overlay */}
        {confirmExit && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ background: "rgba(8,5,5,0.92)", backdropFilter: "blur(1px)" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, #ef444408 3px, #ef444408 4px)`, pointerEvents: "none" }} />
            <div className="relative flex flex-col items-center gap-6" style={{ padding: "32px 24px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "#ef4444", letterSpacing: "2px", marginBottom: "10px" }}>EXIT TO MENU?</p>
                <p style={{ fontSize: "7px", color: "#c9a44a60", letterSpacing: "1px" }}>Unsaved progress will be lost.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => { playSfx("menuSelect"); onExitToMenu!(); }}
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "8px",
                    padding: "10px 20px",
                    border: "2px solid #ef4444",
                    background: "#ef444420",
                    color: "#ef4444",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                  data-testid="button-confirm-exit-yes"
                >YES</button>
                <button
                  onClick={() => { playSfx("menuSelect"); setConfirmExit(false); }}
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "8px",
                    padding: "10px 20px",
                    border: "2px solid #c9a44a",
                    background: "#c9a44a20",
                    color: "#c9a44a",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                  data-testid="button-confirm-exit-no"
                >NO</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
