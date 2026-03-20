import { useState } from "react";
import { Menu, ArrowLeft, ShoppingBag, Hammer, Beer, X } from "lucide-react";
import GameMenuPanel from "@/components/GameMenuPanel";
import ShopScreen from "@/components/ShopScreen";
import { playSfx } from "@/lib/sfx";
import type { PlayerCharacter, ShopItem } from "@shared/schema";
import villageBg from "@assets/forest_region_village_1774010989526.jpg";
import blacksmithBg from "@assets/village_blacksmith_1774017365247.jpg";
import tavernBg from "@assets/village_tavern_1774017365247.jpg";
import tradeBg from "@assets/village_trade_shop_1774017365248.jpg";
import blacksmithSprite from "@assets/BLACKSMITH_1774022241288.png";
import alchemistSprite from "@assets/ALCHEMIST_1774022241288.png";

const ac = "#c9a44a";

const LEAF_COLORS = ["#5aaa2a", "#7bc840", "#a8d858", "#c4d040", "#8fc050", "#b8c028"];
const LEAF_STROKE = ["#3a7a1a", "#4a9828", "#6a9828", "#8a9020", "#5a8030", "#7a9010"];
const LEAVES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  top: 3 + ((i * 67 + 13) % 82),
  size: 9 + ((i * 11 + 3) % 8),
  color: LEAF_COLORS[(i * 3 + 1) % LEAF_COLORS.length],
  stroke: LEAF_STROKE[(i * 5 + 2) % LEAF_STROKE.length],
  duration: 9 + ((i * 37 + 7) % 10),
  delay: -((i * 2.3 + 1.1) % 18),
  flipX: i % 3 === 1 ? -1 : 1,
  variant: i % 2 === 0 ? "A" : "B",
}));

const TRADE_SHOP_ITEMS: ShopItem[] = [
  { id: "tv_hp1",  name: "Forest Tonic",       type: "consumable", description: "Restores 35 HP",         effect: { type: "heal", stat: "hp", amount: 35 }, icon: "heart",    value: 12, price: 20, stock: 5 },
  { id: "tv_mp1",  name: "Dew Vial",            type: "consumable", description: "Restores 20 MP",         effect: { type: "heal", stat: "mp", amount: 20 }, icon: "droplets", value: 12, price: 18, stock: 5 },
  { id: "tv_hp2",  name: "Greater Tonic",       type: "consumable", description: "Restores 70 HP",         effect: { type: "heal", stat: "hp", amount: 70 }, icon: "heart",    value: 25, price: 40, stock: 3 },
  { id: "tv_ring", name: "Verdant Ring",         type: "accessory",  description: "+2 LUCK",                effect: { type: "equip", stat: "luck", amount: 2 }, icon: "gem",    value: 30, price: 55, stock: 1 },
  { id: "tv_acc",  name: "Wind Charm",           type: "accessory",  description: "+3 SPD",                 effect: { type: "equip", stat: "spd", amount: 3 },  icon: "gem",    value: 28, price: 50, stock: 1 },
];

const BLACKSMITH_ITEMS: ShopItem[] = [
  { id: "bk_sw1",  name: "Verdant Blade",        type: "weapon",     description: "+5 ATK (Wind)",          effect: { type: "equip", stat: "atk", amount: 5 }, icon: "sword",   value: 40, price: 70, stock: 1, element: "Wind" },
  { id: "bk_sw2",  name: "Ironwood Spear",        type: "weapon",     description: "+7 ATK",                 effect: { type: "equip", stat: "atk", amount: 7 }, icon: "sword",   value: 55, price: 90, stock: 1 },
  { id: "bk_ar1",  name: "Bark Armour",           type: "armor",      description: "+4 DEF",                 effect: { type: "equip", stat: "def", amount: 4 }, icon: "shield",  value: 35, price: 65, stock: 1 },
  { id: "bk_ar2",  name: "Thornweave Mail",       type: "armor",      description: "+6 DEF (Wind)",          effect: { type: "equip", stat: "def", amount: 6 }, icon: "shield",  value: 50, price: 85, stock: 1, element: "Wind" },
  { id: "bk_he1",  name: "Ranger's Hood",         type: "armor",      description: "+3 DEF, +1 LUCK",        effect: { type: "equip", stat: "def", amount: 3 }, icon: "shield",  value: 30, price: 58, stock: 1 },
];

type Panel = null | "shop" | "blacksmith" | "tavern";

interface VillageScreenProps {
  player: PlayerCharacter;
  onLeave: () => void;
  onBuy: (item: ShopItem) => void;
  onSell: (itemId: string) => void;
  onRest: () => void;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: "weapon" | "armor" | "accessory") => void;
  onUseItem: (itemId: string, targetIndex?: number) => void;
  onSave: (slotNumber: number) => void;
  onExitToMenu: () => void;
  textSpeed: "slow" | "medium" | "fast";
  musicVolume: number;
  sfxVolume: number;
  onTextSpeedChange: (s: "slow" | "medium" | "fast") => void;
  onMusicVolumeChange: (v: number) => void;
  onSfxVolumeChange: (v: number) => void;
}

const ARROWS: { id: Panel & string; label: string; icon: typeof ShoppingBag; left: string; top: string; labelAbove?: boolean }[] = [
  { id: "shop",       label: "Alchemist",   icon: ShoppingBag, left: "calc(79% + 20px)", top: "calc(21% + 200px)", labelAbove: true },
  { id: "blacksmith", label: "Blacksmith",  icon: Hammer,      left: "51%",              top: "calc(11% + 210px)", labelAbove: true },
  { id: "tavern",     label: "Tavern",      icon: Beer,        left: "calc(18% + 201px)", top: "calc(35% + 112px)", labelAbove: true },
];

const LOCATION_TITLES: Record<string, string> = {
  shop: "✦ ALCHEMIST ✦",
  blacksmith: "✦ BLACKSMITH ✦",
  tavern: "✦ THE BRAMBLE INN ✦",
};

const LOCATION_BG: Record<string, string> = {
  shop: tradeBg,
  blacksmith: blacksmithBg,
  tavern: tavernBg,
};

export default function VillageScreen({
  player, onLeave, onBuy, onSell, onRest,
  onEquip, onUnequip, onUseItem, onSave, onExitToMenu,
  textSpeed, musicVolume, sfxVolume,
  onTextSpeedChange, onMusicVolumeChange, onSfxVolumeChange,
}: VillageScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [restedMsg, setRestedMsg] = useState(false);

  const openPanel = (p: Panel) => { playSfx("menuSelect"); setActivePanel(p); };
  const closePanel = () => { playSfx("menuSelect"); setActivePanel(null); setRestedMsg(false); };

  const currentBg = activePanel ? LOCATION_BG[activePanel] : villageBg;
  const currentTitle = activePanel ? LOCATION_TITLES[activePanel] : "✦ THORNVEIL VILLAGE ✦";
  const isSubScreen = activePanel !== null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `url(${currentBg})`,
        backgroundSize: isSubScreen ? "100% 100%" : "120% 120%",
        backgroundPosition: isSubScreen ? "center center" : "center bottom",
        fontFamily: "'Press Start 2P', cursive",
        overflow: "hidden",
      }}
    >
      <div className="absolute inset-0" style={{ background: isSubScreen ? "rgba(0,0,0,0.30)" : "rgba(0,0,0,0.18)" }} />

      {!isSubScreen && LEAVES.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute pointer-events-none"
          style={{
            top: `${leaf.top}%`,
            left: 0,
            zIndex: 3,
            animation: `leafDrift${leaf.variant} ${leaf.duration}s linear ${leaf.delay}s infinite`,
          }}
        >
          <svg
            width={leaf.size * 1.6}
            height={leaf.size}
            viewBox="0 0 16 9"
            style={{ transform: `scaleX(${leaf.flipX})` }}
          >
            <ellipse cx="7.5" cy="4.5" rx="7" ry="3.8" fill={leaf.color} opacity="0.84" />
            <path d="M1,4.5 Q7.5,1.2 15,4.5" stroke={leaf.stroke} strokeWidth="0.8" fill="none" opacity="0.65" />
            <path d="M7.5,1 L7.5,8" stroke={leaf.stroke} strokeWidth="0.5" fill="none" opacity="0.4" />
          </svg>
        </div>
      ))}

      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5"
        style={{
          background: "linear-gradient(180deg,#0a0c08f0 0%,#131a0ff5 100%)",
          border: `2px solid ${ac}`,
          boxShadow: `0 0 18px ${ac}40`,
          letterSpacing: "3px",
          fontSize: "10px",
          color: ac,
          zIndex: 10,
          whiteSpace: "nowrap",
        }}
      >
        {currentTitle}
      </div>

      <button
        data-testid={isSubScreen ? "button-subscreen-back" : "button-village-return"}
        className="absolute flex items-center gap-2 px-3 py-2 transition-all hover:scale-105 active:scale-95"
        style={{
          bottom: 20,
          left: 16,
          zIndex: 20,
          background: "linear-gradient(180deg,#0a0808f0 0%,#151010f5 100%)",
          border: `2px solid ${ac}`,
          boxShadow: `0 0 12px ${ac}40`,
          color: ac,
          fontSize: "8px",
          letterSpacing: "1px",
        }}
        onClick={() => {
          if (isSubScreen) {
            closePanel();
          } else {
            playSfx("menuSelect");
            onLeave();
          }
        }}
      >
        <ArrowLeft className="w-3 h-3" />
        {isSubScreen ? "VILLAGE" : "OVERWORLD"}
      </button>

      {!menuOpen && (
        <button
          data-testid="button-village-menu"
          className="absolute top-3 left-3 z-[200] flex items-center justify-center w-10 h-10 transition-all hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(180deg,#0a0808f0 0%,#151010f5 100%)",
            border: `3px solid ${ac}`,
            boxShadow: `0 0 15px ${ac}40, 0 0 40px ${ac}15`,
          }}
          onClick={() => { playSfx("menuSelect"); setMenuOpen(true); }}
        >
          <Menu className="w-5 h-5" style={{ color: ac }} />
        </button>
      )}

      {!isSubScreen && ARROWS.map(({ id, label, icon: Icon, left, top }) => (
        <button
          key={id}
          data-testid={`button-village-${id}`}
          className="absolute flex flex-col items-center gap-1 group"
          style={{ left, top, transform: "translate(-50%, -100%) scale(2.1)", transformOrigin: "center bottom", zIndex: 15 }}
          onClick={() => openPanel(id)}
        >
          <div
            className="px-2 py-0.5 transition-all group-hover:scale-105"
            style={{
              background: "linear-gradient(180deg,#0a0808e0 0%,#151010e8 100%)",
              border: `1px solid ${ac}80`,
              color: ac,
              fontSize: "7px",
              letterSpacing: "1px",
              whiteSpace: "nowrap",
            }}
          >
            <Icon className="inline w-3 h-3 mr-1" style={{ color: ac }} />
            {label.toUpperCase()}
          </div>
          <svg
            width="22" height="22" viewBox="0 0 22 22"
            style={{
              filter: `drop-shadow(0 0 6px ${ac}cc)`,
              animation: "villageArrowBounce 1.1s ease-in-out infinite",
            }}
          >
            <polygon points="7,2 15,2 15,12 20,12 11,20 2,12 7,12" fill={ac} stroke="#8a6a20" strokeWidth="1" />
          </svg>
        </button>
      ))}

      <style>{`
        @keyframes villageArrowBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(5px); }
        }
        @keyframes leafDriftA {
          0%   { transform: translateX(-30px) translateY(0px) rotate(0deg);   opacity: 0; }
          7%   { opacity: 0.82; }
          25%  { transform: translateX(270px) translateY(-24px) rotate(88deg); }
          50%  { transform: translateX(540px) translateY(16px)  rotate(178deg); }
          75%  { transform: translateX(810px) translateY(-14px) rotate(265deg); }
          93%  { opacity: 0.72; }
          100% { transform: translateX(1110px) translateY(6px)  rotate(345deg); opacity: 0; }
        }
        @keyframes leafDriftB {
          0%   { transform: translateX(-30px) translateY(0px) rotate(0deg);    opacity: 0; }
          7%   { opacity: 0.78; }
          25%  { transform: translateX(260px) translateY(22px)  rotate(-82deg); }
          50%  { transform: translateX(530px) translateY(-20px) rotate(-168deg); }
          75%  { transform: translateX(800px) translateY(12px)  rotate(-252deg); }
          93%  { opacity: 0.68; }
          100% { transform: translateX(1110px) translateY(-8px) rotate(-330deg); opacity: 0; }
        }
        @keyframes npcSpriteAnim {
          to { transform: translateX(-100%); }
        }
      `}</style>

      {activePanel && activePanel !== "tavern" && (
        <>
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 50,
            }}
          >
            <div style={{ width: 460, height: 440 }}>
              <ShopScreen
                player={player}
                items={activePanel === "shop" ? TRADE_SHOP_ITEMS : BLACKSMITH_ITEMS}
                onBuy={onBuy}
                onSell={onSell}
                onBack={closePanel}
              />
            </div>
          </div>

          {activePanel === "blacksmith" && (
            <div
              style={{ position: "fixed", right: "calc(6% + 150px)", bottom: -75, zIndex: 50, width: 576, height: 576, overflow: "hidden", imageRendering: "pixelated" }}
            >
              <img
                src={blacksmithSprite}
                style={{ height: 576, width: "auto", maxWidth: "none", imageRendering: "pixelated", display: "block", animation: "npcSpriteAnim 0.875s steps(7) infinite" }}
              />
            </div>
          )}

          {activePanel === "shop" && (
            <div
              style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: -75, zIndex: 40, width: 576, height: 576, overflow: "hidden", imageRendering: "pixelated" }}
            >
              <img
                src={alchemistSprite}
                style={{ height: 576, width: "auto", maxWidth: "none", imageRendering: "pixelated", display: "block", animation: "npcSpriteAnim 1s steps(8) infinite" }}
              />
            </div>
          )}
        </>
      )}

      {activePanel === "tavern" && (
        <div className="absolute inset-0 z-[50] flex items-center justify-center" style={{ paddingTop: "60px", paddingBottom: "60px" }}>
          <div
            className="relative w-[280px] overflow-hidden"
            style={{
              background: "linear-gradient(180deg,#0a0808f0 0%,#151010f5 100%)",
              border: `3px solid ${ac}`,
              boxShadow: `0 0 20px ${ac}40, 0 0 60px ${ac}15`,
            }}
          >
            <div
              style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ac}08 3px, ${ac}08 4px)`,
                pointerEvents: "none",
              }}
            />
            <div className="relative px-4 pt-3 pb-2 flex items-center justify-between" style={{ background: "#0d0b0bf0", borderBottom: `3px solid ${ac}` }}>
              <div className="flex items-center gap-2">
                <Beer className="w-4 h-4" style={{ color: ac }} />
                <span style={{ fontSize: "9px", color: ac, letterSpacing: "2px" }}>THE BRAMBLE INN</span>
              </div>
              <button
                className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110"
                style={{ border: `1px solid ${ac}50`, background: "transparent" }}
                onClick={closePanel}
              >
                <X className="w-3 h-3" style={{ color: ac }} />
              </button>
            </div>

            <div className="relative px-4 py-4 space-y-3">
              <p style={{ fontSize: "7px", color: "#c8c0a8", letterSpacing: "1px", lineHeight: "1.8", textAlign: "center" }}>
                "Rest your bones, traveller.<br />The forest keeps no schedules."
              </p>

              {restedMsg ? (
                <div className="text-center py-2" style={{ fontSize: "8px", color: "#6ee7b7", letterSpacing: "1px" }}>
                  ✓ RESTED &amp; REFRESHED
                </div>
              ) : (
                <button
                  data-testid="button-tavern-rest"
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all"
                  style={{
                    background: "#0d0b0bf0",
                    border: `1px solid ${ac}30`,
                    fontSize: "9px",
                    color: "#e8e0d0",
                    letterSpacing: "1px",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${ac}25`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${ac}80`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "#0d0b0bf0";
                    (e.currentTarget as HTMLElement).style.borderColor = `${ac}30`;
                  }}
                  onClick={() => { playSfx("recover"); onRest(); setRestedMsg(true); }}
                >
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ border: `1px solid ${ac}40`, background: "#0a080840" }}>
                    <Beer className="w-3.5 h-3.5" style={{ color: ac }} />
                  </div>
                  <div className="flex flex-col">
                    <span style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>REST</span>
                    <span style={{ fontSize: "7px", color: `${ac}60`, marginTop: "2px" }}>Restore HP &amp; MP (free)</span>
                  </div>
                </button>
              )}
            </div>

            <div className="relative px-4 py-2" style={{ borderTop: `1px solid ${ac}20` }}>
              <p className="text-center" style={{ fontSize: "6px", color: `${ac}50`, letterSpacing: "1px" }}>
                "May the canopy shield you."
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${ac}40, transparent)` }} />
          </div>
        </div>
      )}

      {menuOpen && (
        <GameMenuPanel
          player={player}
          onClose={() => setMenuOpen(false)}
          onEquip={onEquip}
          onUnequip={onUnequip}
          onUseItem={onUseItem}
          onSave={onSave}
          onExitToMenu={onExitToMenu}
          textSpeed={textSpeed}
          musicVolume={musicVolume}
          sfxVolume={sfxVolume}
          onTextSpeedChange={onTextSpeedChange}
          onMusicVolumeChange={onMusicVolumeChange}
          onSfxVolumeChange={onSfxVolumeChange}
          regionTheme="Wind"
        />
      )}
    </div>
  );
}
