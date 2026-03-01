import { useState, type ReactNode } from "react";
import { ArrowLeft, Sword, Shield, Gem, Zap, BookOpen, Star } from "lucide-react";
import { PERKS, ELEMENT_COLORS, getPlayerSpells, getPartyMemberSpells } from "@/lib/gameData";
import type { PlayerCharacter, PartyMember, InventoryItem } from "@shared/schema";

interface StatusScreenProps {
  player: PlayerCharacter;
  onClose: () => void;
}

const STAT_LABELS: Record<string, string> = {
  hp: "HP", maxHp: "MAX HP", mp: "MP", maxMp: "MAX MP",
  atk: "ATK", def: "DEF", agi: "AGI", int: "INT", luck: "LUCK",
};

const DISPLAY_STATS = ["maxHp", "maxMp", "atk", "def", "agi", "int", "luck"] as const;

function getEquipBonus(item: InventoryItem | null): string {
  if (!item || !item.effect) return "";
  const { type, stat, amount } = item.effect;
  if (type === "equip" && stat && amount) return `+${amount} ${STAT_LABELS[stat] ?? stat}`;
  return "";
}

export default function StatusScreen({ player, onClose }: StatusScreenProps) {
  const ac = ELEMENT_COLORS[player.element] ?? "#c9a44a";

  const allChars: Array<{ name: string; element: string; isPlayer: boolean; index: number }> = [
    { name: player.name, element: player.element, isPlayer: true, index: -1 },
    ...player.party.map((m, i) => ({ name: m.name, element: m.element, isPlayer: false, index: i })),
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);

  const selected = allChars[selectedIdx];
  const char: PlayerCharacter | PartyMember = selected.isPlayer ? player : player.party[selected.index];
  const charColor = ELEMENT_COLORS[char.element] ?? "#c9a44a";

  const spells = selected.isPlayer
    ? getPlayerSpells(player)
    : (() => {
        const m = player.party[selected.index];
        return getPartyMemberSpells(m.element, m.level, m.learnedSpells ?? []);
      })();

  const perkIds: string[] = selected.isPlayer
    ? (player.perks ?? [])
    : (player.party[selected.index].perks ?? []);
  const activePerks = perkIds.map(id => PERKS.find(p => p.id === id)).filter(Boolean) as typeof PERKS;

  const equip = selected.isPlayer ? player.equipment : { weapon: null, armor: null, accessory: null };

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
        fontFamily: "'Press Start 2P', cursive",
        imageRendering: "pixelated",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${ac}`, background: "#0d0b0bf0" }}
      >
        <button
          className="flex items-center gap-2 transition-all hover:opacity-80"
          onClick={onClose}
          data-testid="button-status-back"
        >
          <ArrowLeft className="w-3 h-3" style={{ color: ac }} />
          <span style={{ fontSize: "8px", color: ac, letterSpacing: "2px" }}>BACK</span>
        </button>
        <span style={{ fontSize: "9px", color: ac, letterSpacing: "2px" }}>STATUS</span>
        <div style={{ width: 48 }} />
      </div>

      <div
        className="flex flex-shrink-0 overflow-x-auto"
        style={{ borderBottom: `1px solid ${ac}30`, background: "#0a0808" }}
      >
        {allChars.map((c, i) => {
          const cc = ELEMENT_COLORS[c.element] ?? "#c9a44a";
          const isActive = i === selectedIdx;
          return (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              data-testid={`button-status-tab-${i}`}
              className="flex-shrink-0 px-4 py-2.5 transition-all"
              style={{
                borderBottom: isActive ? `2px solid ${cc}` : "2px solid transparent",
                background: isActive ? `${cc}18` : "transparent",
              }}
            >
              <div style={{ fontSize: "7px", color: isActive ? cc : "#887878", letterSpacing: "1px", whiteSpace: "nowrap" }}>
                {c.name.toUpperCase()}
              </div>
              <div style={{ fontSize: "6px", color: isActive ? `${cc}99` : "#554444", marginTop: "2px", letterSpacing: "1px" }}>
                {c.element.toUpperCase()}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

        <div
          className="px-3 py-2 flex items-center justify-between"
          style={{ border: `1px solid ${charColor}40`, background: `${charColor}10` }}
        >
          <div>
            <div style={{ fontSize: "10px", color: charColor, letterSpacing: "2px" }}>{char.name.toUpperCase()}</div>
            <div style={{ fontSize: "7px", color: `${charColor}80`, marginTop: "3px", letterSpacing: "1px" }}>
              LV {char.level} — {char.element.toUpperCase()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "7px", color: "#a08080", letterSpacing: "1px" }}>XP</div>
            <div style={{ fontSize: "8px", color: "#d0c0b0" }}>{char.xp} / {char.xpToNext}</div>
          </div>
        </div>

        <Section label="STATS" icon={<Star className="w-3 h-3" />} color={charColor}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {DISPLAY_STATS.map(stat => (
              <div key={stat} className="flex items-center justify-between">
                <span style={{ fontSize: "7px", color: "#887878", letterSpacing: "1px" }}>{STAT_LABELS[stat]}</span>
                <span style={{ fontSize: "8px", color: "#e8e0d0" }}>{char.stats[stat]}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section label="EQUIPMENT" icon={<Sword className="w-3 h-3" />} color={charColor}>
          {selected.isPlayer ? (
            <div className="space-y-2">
              {(["weapon", "armor", "accessory"] as const).map(slot => {
                const item = equip[slot];
                const bonus = getEquipBonus(item);
                return (
                  <div key={slot} className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {slot === "weapon" && <Sword className="w-2.5 h-2.5 opacity-50" style={{ color: charColor }} />}
                      {slot === "armor" && <Shield className="w-2.5 h-2.5 opacity-50" style={{ color: charColor }} />}
                      {slot === "accessory" && <Gem className="w-2.5 h-2.5 opacity-50" style={{ color: charColor }} />}
                      <span style={{ fontSize: "6px", color: "#665555", letterSpacing: "1px" }}>{slot.toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: "7px", color: item ? "#e8e0d0" : "#443333" }}>
                        {item ? item.name : "—"}
                      </div>
                      {bonus && (
                        <div style={{ fontSize: "6px", color: charColor, marginTop: "2px" }}>{bonus}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: "7px", color: "#554444", letterSpacing: "1px" }}>No gear equipped</div>
          )}
        </Section>

        <Section label="MAGIC" icon={<Zap className="w-3 h-3" />} color={charColor}>
          {spells.length === 0 ? (
            <div style={{ fontSize: "7px", color: "#554444", letterSpacing: "1px" }}>No spells learned</div>
          ) : (
            <div className="space-y-2">
              {spells.map(spell => (
                <div key={spell.id} className="flex items-start justify-between gap-2">
                  <div>
                    <div style={{ fontSize: "7px", color: "#e8e0d0", letterSpacing: "1px" }}>{spell.name}</div>
                    <div style={{ fontSize: "6px", color: "#665555", marginTop: "2px", letterSpacing: "0.5px" }}>{spell.description}</div>
                  </div>
                  <div
                    className="flex-shrink-0 px-1.5 py-0.5"
                    style={{ border: `1px solid #60a5fa50`, background: "#0a0f2080", fontSize: "6px", color: "#60a5fa", letterSpacing: "1px" }}
                  >
                    {spell.mpCost}MP
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section label="PERKS" icon={<BookOpen className="w-3 h-3" />} color={charColor}>
          {activePerks.length === 0 ? (
            <div style={{ fontSize: "7px", color: "#554444", letterSpacing: "1px" }}>No perks active</div>
          ) : (
            <div className="space-y-2">
              {activePerks.map(perk => (
                <div key={perk.id} className="flex items-start gap-2">
                  <div
                    className="flex-shrink-0 w-1 mt-1"
                    style={{ height: "6px", background: ELEMENT_COLORS[perk.element] ?? charColor }}
                  />
                  <div>
                    <div style={{ fontSize: "7px", color: "#e8e0d0", letterSpacing: "1px" }}>{perk.name}</div>
                    <div style={{ fontSize: "6px", color: "#665555", marginTop: "2px", letterSpacing: "0.5px" }}>{perk.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}

function Section({ label, icon, color, children }: { label: string; icon: ReactNode; color: string; children: ReactNode }) {
  return (
    <div style={{ border: `1px solid ${color}25`, background: "#0d0a0af0" }}>
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: `1px solid ${color}20`, background: `${color}08` }}
      >
        <span style={{ color: `${color}99` }}>{icon}</span>
        <span style={{ fontSize: "7px", color: `${color}cc`, letterSpacing: "2px" }}>{label}</span>
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  );
}
