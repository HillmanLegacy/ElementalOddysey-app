import { useState } from "react";
import type { PlayerCharacter } from "@shared/schema";
import { Heart, Droplets } from "lucide-react";
import { groupConsumables } from "@/lib/utils";
import { playSfx } from "@/lib/sfx";

interface InventoryScreenProps {
  player: PlayerCharacter;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: "weapon" | "armor" | "accessory") => void;
  onUseItem: (itemId: string, targetPartyIndex?: number) => void;
  onBack: () => void;
}

const ACCENT = "#c9a44a";

export default function InventoryScreen({ player, onEquip, onUnequip, onUseItem, onBack }: InventoryScreenProps) {
  const consumables = player.inventory.filter(i => i.type === "consumable");
  const equipables = player.inventory.filter(i => i.type === "weapon" || i.type === "armor" || i.type === "accessory");
  const [targetingItemId, setTargetingItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"items" | "equipment">("items");

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

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "#0d0b0bf0",
            borderBottom: `3px solid ${ACCENT}`,
          }}
        >
          <button
            onClick={() => { playSfx('menuSelect'); onBack(); }}
            data-testid="button-inventory-back"
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
          <span style={{ fontSize: "10px", color: ACCENT }}>INVENTORY</span>
          <div style={{ width: "60px" }} />
        </div>

        <div style={{ display: "flex", gap: 0, padding: "8px 12px 0" }}>
          <button
            onClick={() => { playSfx('menuSelect'); setActiveTab("items"); }}
            data-testid="tab-items"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "7px",
              padding: "6px 12px",
              border: `1px solid ${ACCENT}`,
              borderBottom: activeTab === "items" ? "none" : `1px solid ${ACCENT}`,
              background: activeTab === "items" ? ACCENT : "transparent",
              color: activeTab === "items" ? "#0a0808" : `${ACCENT}80`,
              cursor: "pointer",
            }}
          >
            ITEMS
          </button>
          <button
            onClick={() => { playSfx('menuSelect'); setActiveTab("equipment"); }}
            data-testid="tab-equipment"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "7px",
              padding: "6px 12px",
              border: `1px solid ${ACCENT}`,
              borderBottom: activeTab === "equipment" ? "none" : `1px solid ${ACCENT}`,
              background: activeTab === "equipment" ? ACCENT : "transparent",
              color: activeTab === "equipment" ? "#0a0808" : `${ACCENT}80`,
              cursor: "pointer",
            }}
          >
            GEAR
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          {activeTab === "items" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {consumables.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p style={{ fontSize: "8px", color: `${ACCENT}50` }}>No consumable items</p>
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
                    <div
                      key={item.name}
                      data-testid={`card-item-${item.name}`}
                      style={{
                        padding: "8px",
                        background: "#0d0b0bf0",
                        border: `1px solid ${ACCENT}30`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "8px", color: "#e8e0d0" }}>
                            {item.name} <span style={{ color: `${ACCENT}cc` }}>x{count}</span>
                          </p>
                          <p style={{ fontSize: "7px", color: `${ACCENT}60`, marginTop: "2px" }}>{item.description}</p>
                        </div>
                        {player.party.length > 0 ? (
                          <button
                            onClick={() => { playSfx('menuSelect'); setTargetingItemId(isTargeting ? null : item.name); }}
                            disabled={!canUseOnAny}
                            data-testid={`button-use-${item.name}`}
                            style={{
                              fontFamily: "'Press Start 2P', cursive",
                              fontSize: "7px",
                              padding: "4px 8px",
                              border: `1px solid ${isTargeting ? "#e8c030" : ACCENT}60`,
                              background: isTargeting ? "#e8c03020" : "transparent",
                              color: isTargeting ? "#e8c030" : ACCENT,
                              cursor: canUseOnAny ? "pointer" : "default",
                              opacity: canUseOnAny ? 1 : 0.4,
                            }}
                          >
                            {isTargeting ? "CANCEL" : "USE"}
                          </button>
                        ) : (
                          <button
                            onClick={() => { playSfx('menuSelect'); onUseItem(ids[0]); }}
                            disabled={!canUseOnPlayer}
                            data-testid={`button-use-${item.name}`}
                            style={{
                              fontFamily: "'Press Start 2P', cursive",
                              fontSize: "7px",
                              padding: "4px 8px",
                              border: `1px solid ${ACCENT}60`,
                              background: "transparent",
                              color: ACCENT,
                              cursor: canUseOnPlayer ? "pointer" : "default",
                              opacity: canUseOnPlayer ? 1 : 0.4,
                            }}
                          >
                            USE
                          </button>
                        )}
                      </div>
                      {isTargeting && (
                        <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: `1px solid ${ACCENT}20` }}>
                          <p style={{ fontSize: "7px", color: `${ACCENT}50`, marginBottom: "4px" }}>Select target:</p>
                          <button
                            disabled={!canUseOnPlayer}
                            onClick={() => { playSfx('menuSelect'); onUseItem(ids[0]); setTargetingItemId(null); }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "4px 8px",
                              background: "#0a080820",
                              border: `1px solid ${ACCENT}15`,
                              cursor: canUseOnPlayer ? "pointer" : "default",
                              opacity: canUseOnPlayer ? 1 : 0.3,
                              marginBottom: "3px",
                              fontFamily: "'Press Start 2P', cursive",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "7px", color: ACCENT }}>{player.name}</span>
                              <span style={{ fontSize: "6px", color: `${ACCENT}50` }}>(You)</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {item.effect.stat === "hp" && (
                                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                  <Heart style={{ width: 10, height: 10, color: "#ef4444" }} />
                                  <span style={{ fontSize: "7px", color: player.stats.hp < player.stats.maxHp ? "#fca5a5" : "#86efac" }}>
                                    {player.stats.hp}/{player.stats.maxHp}
                                  </span>
                                </div>
                              )}
                              {item.effect.stat === "mp" && (
                                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                  <Droplets style={{ width: 10, height: 10, color: "#60a5fa" }} />
                                  <span style={{ fontSize: "7px", color: player.stats.mp < player.stats.maxMp ? "#93c5fd" : "#86efac" }}>
                                    {player.stats.mp}/{player.stats.maxMp}
                                  </span>
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
                                onClick={() => { playSfx('menuSelect'); onUseItem(ids[0], idx); setTargetingItemId(null); }}
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "4px 8px",
                                  background: "#0a080820",
                                  border: `1px solid ${ACCENT}15`,
                                  cursor: canUseOnMember ? "pointer" : "default",
                                  opacity: canUseOnMember ? 1 : 0.3,
                                  marginBottom: "3px",
                                  fontFamily: "'Press Start 2P', cursive",
                                }}
                              >
                                <span style={{ fontSize: "7px", color: "#e8e0d0" }}>{member.name}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  {item.effect.stat === "hp" && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                      <Heart style={{ width: 10, height: 10, color: "#ef4444" }} />
                                      <span style={{ fontSize: "7px", color: member.stats.hp < member.stats.maxHp ? "#fca5a5" : "#86efac" }}>
                                        {member.stats.hp}/{member.stats.maxHp}
                                      </span>
                                    </div>
                                  )}
                                  {item.effect.stat === "mp" && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                      <Droplets style={{ width: 10, height: 10, color: "#60a5fa" }} />
                                      <span style={{ fontSize: "7px", color: member.stats.mp < member.stats.maxMp ? "#93c5fd" : "#86efac" }}>
                                        {member.stats.mp}/{member.stats.maxMp}
                                      </span>
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
          )}

          {activeTab === "equipment" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <p style={{ fontSize: "7px", color: `${ACCENT}60`, textTransform: "uppercase", letterSpacing: "1px", padding: "0 4px" }}>Equipped</p>
              {(["weapon", "armor", "accessory"] as const).map(slot => {
                const item = player.equipment[slot];
                return (
                  <div
                    key={slot}
                    style={{
                      padding: "8px",
                      background: "#0d0b0bf0",
                      border: `1px solid ${ACCENT}30`,
                    }}
                  >
                    <p style={{ fontSize: "7px", color: `${ACCENT}60`, textTransform: "uppercase", letterSpacing: "1px" }}>{slot}</p>
                    {item ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginTop: "2px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "8px", color: "#e8e0d0" }}>{item.name}</p>
                          <p style={{ fontSize: "7px", color: `${ACCENT}60`, marginTop: "2px" }}>{item.description}</p>
                        </div>
                        <button
                          onClick={() => { playSfx('menuSelect'); onUnequip(slot); }}
                          style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "7px",
                            padding: "4px 8px",
                            border: `1px solid ${ACCENT}60`,
                            background: "transparent",
                            color: ACCENT,
                            cursor: "pointer",
                          }}
                        >
                          UNEQUIP
                        </button>
                      </div>
                    ) : (
                      <p style={{ fontSize: "8px", color: `${ACCENT}40`, fontStyle: "italic", marginTop: "2px" }}>Empty</p>
                    )}
                  </div>
                );
              })}

              {equipables.length > 0 && (
                <>
                  <div style={{ borderTop: `1px solid ${ACCENT}20`, marginTop: "4px", paddingTop: "6px" }}>
                    <p style={{ fontSize: "7px", color: `${ACCENT}60`, textTransform: "uppercase", letterSpacing: "1px", padding: "0 4px" }}>Unequipped</p>
                  </div>
                  {equipables.map(item => (
                    <div
                      key={item.id}
                      data-testid={`card-equip-item-${item.id}`}
                      style={{
                        padding: "8px",
                        background: "#0d0b0bf0",
                        border: `1px solid ${ACCENT}30`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <p style={{ fontSize: "8px", color: "#e8e0d0" }}>{item.name}</p>
                            <span style={{ fontSize: "6px", padding: "1px 4px", border: `1px solid ${ACCENT}30`, color: `${ACCENT}80`, textTransform: "capitalize" }}>{item.type}</span>
                          </div>
                          <p style={{ fontSize: "7px", color: `${ACCENT}60`, marginTop: "2px" }}>{item.description}</p>
                        </div>
                        <button
                          onClick={() => { playSfx('menuSelect'); onEquip(item.id); }}
                          data-testid={`button-equip-${item.id}`}
                          style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "7px",
                            padding: "4px 8px",
                            border: `1px solid ${ACCENT}60`,
                            background: "transparent",
                            color: ACCENT,
                            cursor: "pointer",
                          }}
                        >
                          EQUIP
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
