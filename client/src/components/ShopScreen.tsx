import { useState } from "react";
import type { PlayerCharacter, ShopItem, InventoryItem } from "@shared/schema";
import { Heart, Droplets, Swords, Shield, Sparkles, Feather, Axe, Eye, Flame, Package } from "lucide-react";
import { playSfx } from "@/lib/sfx";

const ITEM_ICONS: Record<string, any> = {
  heart: Heart,
  droplets: Droplets,
  sword: Swords,
  shield: Shield,
  gem: Sparkles,
  feather: Feather,
  axe: Axe,
  eye: Eye,
  flame: Flame,
  horn: Swords,
  claw: Swords,
};

interface ShopScreenProps {
  player: PlayerCharacter;
  items: ShopItem[];
  onBuy: (item: ShopItem) => void;
  onSell?: (itemId: string) => void;
  onBack: () => void;
}

const ACCENT = "#c9a44a";

export default function ShopScreen({ player, items, onBuy, onSell, onBack }: ShopScreenProps) {
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  const sellableItems = player.inventory.filter(item => item.value > 0 && item.type !== "weapon" && item.type !== "armor" && item.type !== "accessory");

  const equippedIds = new Set([
    player.equipment.weapon?.id,
    player.equipment.armor?.id,
    player.equipment.accessory?.id,
  ].filter(Boolean));

  const trueySellable = sellableItems.filter(i => !equippedIds.has(i.id));

  const groupedSell: { item: InventoryItem; count: number; ids: string[] }[] = [];
  for (const item of trueySellable) {
    const existing = groupedSell.find(g => g.item.name === item.name);
    if (existing) {
      existing.count++;
      existing.ids.push(item.id);
    } else {
      groupedSell.push({ item, count: 1, ids: [item.id] });
    }
  }

  const rarityColor = (value: number) => {
    if (value >= 150) return "#c084fc";
    if (value >= 80) return "#60a5fa";
    if (value >= 40) return "#4ade80";
    return `${ACCENT}cc`;
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "linear-gradient(180deg, #0a080899 0%, #151010aa 100%)",
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

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "#0d0b0b99",
            borderBottom: `3px solid ${ACCENT}`,
          }}
        >
          <button
            onClick={() => { playSfx('menuSelect'); onBack(); }}
            data-testid="button-shop-back"
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
          <span style={{ fontSize: "10px", color: ACCENT }}>SHOP</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "8px", color: "#e8c030" }} data-testid="text-shop-gold">💰 {player.gold}g</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `2px solid ${ACCENT}40` }}>
          {(["buy", "sell"] as const).map(t => (
            <button
              key={t}
              onClick={() => { playSfx('menuSelect'); setTab(t); }}
              data-testid={`tab-shop-${t}`}
              style={{
                flex: 1,
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "8px",
                padding: "6px 0",
                cursor: "pointer",
                background: tab === t ? `${ACCENT}18` : "transparent",
                color: tab === t ? ACCENT : `${ACCENT}50`,
                border: "none",
                borderBottom: tab === t ? `2px solid ${ACCENT}` : "2px solid transparent",
                letterSpacing: "1px",
              }}
            >
              {t === "buy" ? "BUY" : `SELL${trueySellable.length > 0 ? ` (${trueySellable.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {tab === "buy" && (
            <>
              {items.map(item => {
                const Icon = ITEM_ICONS[item.icon] || Sparkles;
                const canAfford = player.gold >= item.price;
                return (
                  <div
                    key={item.id}
                    data-testid={`card-shop-item-${item.id}`}
                    style={{
                      padding: "8px",
                      background: "#0d0b0b99",
                      border: `1px solid ${ACCENT}30`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `1px solid ${ACCENT}30`,
                          background: "#0a080840",
                          flexShrink: 0,
                        }}
                      >
                        <Icon style={{ width: 16, height: 16, color: ACCENT }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "8px", color: "#e8e0d0" }}>{item.name}</p>
                        <p style={{ fontSize: "7px", color: `${ACCENT}60`, marginTop: "2px" }}>{item.description}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                          <span style={{ fontSize: "6px", padding: "1px 4px", border: `1px solid ${ACCENT}30`, color: `${ACCENT}80`, textTransform: "capitalize" }}>{item.type}</span>
                          <span style={{ fontSize: "6px", color: `${ACCENT}50` }}>Stock: {item.stock}</span>
                          <span style={{ fontSize: "6px", color: "#86efac80" }}>Inv: {player.inventory.filter(i => i.name === item.name).length}</span>
                        </div>
                      </div>
                      <button
                        disabled={!canAfford}
                        onClick={() => { playSfx('menuSelect'); onBuy(item); }}
                        data-testid={`button-buy-${item.id}`}
                        style={{
                          fontFamily: "'Press Start 2P', cursive",
                          fontSize: "7px",
                          padding: "4px 10px",
                          border: `1px solid ${canAfford ? "#e8c030" : "#555"}`,
                          background: canAfford ? "#e8c03020" : "transparent",
                          color: canAfford ? "#e8c030" : "#555",
                          cursor: canAfford ? "pointer" : "default",
                          opacity: canAfford ? 1 : 0.5,
                        }}
                      >
                        {item.price}g
                      </button>
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <p style={{ fontSize: "8px", color: `${ACCENT}50` }}>Shop is empty</p>
                </div>
              )}
            </>
          )}

          {tab === "sell" && (
            <>
              {groupedSell.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <Package style={{ width: 32, height: 32, color: `${ACCENT}30` }} />
                  <p style={{ fontSize: "7px", color: `${ACCENT}40` }}>No sellable items</p>
                </div>
              )}
              {groupedSell.map(({ item, count, ids }) => {
                const Icon = ITEM_ICONS[item.icon] || Sparkles;
                const rc = rarityColor(item.value);
                return (
                  <div
                    key={item.id}
                    data-testid={`card-sell-item-${item.id}`}
                    style={{
                      padding: "8px",
                      background: "#0d0b0b99",
                      border: `1px solid ${rc}20`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `1px solid ${rc}30`,
                          background: "#0a080840",
                          flexShrink: 0,
                          position: "relative",
                        }}
                      >
                        <Icon style={{ width: 16, height: 16, color: rc }} />
                        {count > 1 && (
                          <span style={{
                            position: "absolute", bottom: -1, right: -1,
                            fontSize: "6px", background: "#1a1a1a",
                            color: ACCENT, padding: "1px 3px",
                            border: `1px solid ${ACCENT}40`,
                          }}>×{count}</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "8px", color: "#e8e0d0" }}>{item.name}</p>
                        <p style={{ fontSize: "7px", color: `${rc}60`, marginTop: "2px" }}>{item.description}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                          <span style={{ fontSize: "6px", padding: "1px 4px", border: `1px solid ${rc}30`, color: `${rc}80`, textTransform: "capitalize" }}>{item.type}</span>
                          {count > 1 && <span style={{ fontSize: "6px", color: `${ACCENT}50` }}>Have: {count}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => { playSfx('menuSelect'); onSell?.(ids[0]); }}
                        data-testid={`button-sell-${item.id}`}
                        style={{
                          fontFamily: "'Press Start 2P', cursive",
                          fontSize: "7px",
                          padding: "4px 8px",
                          border: `1px solid ${rc}60`,
                          background: `${rc}15`,
                          color: rc,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        +{item.value}g
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
