import type { PlayerCharacter, ShopItem } from "@shared/schema";
import { Heart, Droplets, Swords, Shield, Sparkles } from "lucide-react";
import { playSfx } from "@/lib/sfx";

const ITEM_ICONS: Record<string, any> = {
  heart: Heart,
  droplets: Droplets,
  sword: Swords,
  shield: Shield,
  gem: Sparkles,
};

interface ShopScreenProps {
  player: PlayerCharacter;
  items: ShopItem[];
  onBuy: (item: ShopItem) => void;
  onBack: () => void;
}

const ACCENT = "#c9a44a";

export default function ShopScreen({ player, items, onBuy, onBack }: ShopScreenProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
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

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {items.map(item => {
            const Icon = ITEM_ICONS[item.icon] || Sparkles;
            const canAfford = player.gold >= item.price;
            return (
              <div
                key={item.id}
                data-testid={`card-shop-item-${item.id}`}
                style={{
                  padding: "8px",
                  background: "#0d0b0bf0",
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
        </div>
      </div>
    </div>
  );
}
