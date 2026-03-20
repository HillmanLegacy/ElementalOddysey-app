import { useState, useRef } from "react";
import { Menu, ArrowLeft, ShoppingBag, Hammer, Beer, X, MessageSquare, Crosshair, Target } from "lucide-react";
import GameMenuPanel from "@/components/GameMenuPanel";
import ShopScreen from "@/components/ShopScreen";
import BattleTransition from "@/components/BattleTransition";
import { playSfx } from "@/lib/sfx";
import type { PlayerCharacter, ShopItem, BountyData } from "@shared/schema";
import { BOUNTY_POOLS, HUNT_POOLS, REGION_TALK_LINES } from "@/lib/gameData";
import villageBg from "@assets/forest_region_village_1774010989526.jpg";
import blacksmithBg from "@assets/village_blacksmith_1774017365247.jpg";
import tavernBg from "@assets/village_tavern_1774017365247.jpg";
import tradeBg from "@assets/village_trade_shop_1774017365248.jpg";
import blacksmithSprite from "@assets/BLACKSMITH_1774022241288.png";
import alchemistSprite from "@assets/ALCHEMIST_1774022241288.png";
import nicolasSprite from "@assets/Nicolas_Fernal_spritesheet_1774029304284.png";

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

type TavernTab = "rest" | "talk" | "bounty" | "hunt";

interface VillageScreenProps {
  player: PlayerCharacter;
  regionTheme: string;
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
  onSetBounty: (bounty: BountyData) => void;
  onCollectBounty: () => void;
  onCollectHunt: (huntId: string, lootItemId: string, required: number, goldReward: number) => void;
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
  player, regionTheme, onLeave, onBuy, onSell, onRest,
  onEquip, onUnequip, onUseItem, onSave, onExitToMenu,
  textSpeed, musicVolume, sfxVolume,
  onTextSpeedChange, onMusicVolumeChange, onSfxVolumeChange,
  onSetBounty, onCollectBounty, onCollectHunt,
}: VillageScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [restedMsg, setRestedMsg] = useState(false);
  const [tavernTab, setTavernTab] = useState<TavernTab>("rest");
  const [talkLineIdx, setTalkLineIdx] = useState(0);
  const [bountyCollected, setBountyCollected] = useState(false);
  const [huntCollected, setHuntCollected] = useState<Set<string>>(new Set());
  const [transitionIn, setTransitionIn] = useState(false);
  const [transitionOut, setTransitionOut] = useState(false);
  const transitionTargetRef = useRef<Panel | "close" | null>(null);

  const openPanel = (p: Panel) => {
    transitionTargetRef.current = p;
    setTransitionIn(true);
  };
  const closePanel = () => {
    transitionTargetRef.current = "close";
    setTransitionIn(true);
  };

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
        @keyframes nicolasIdleAnim {
          to { background-position-x: -3456px; }
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
              style={{ position: "fixed", right: "calc(6% + 200px)", bottom: -75, zIndex: 40, width: 576, height: 576, overflow: "hidden", imageRendering: "pixelated" }}
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
        <>
        <div
          style={{
            position: "fixed", right: "calc(6% + 135px)", bottom: 115, zIndex: 40,
            width: 576, height: 576,
            backgroundImage: `url(${nicolasSprite})`,
            backgroundSize: "6912px 6912px",
            backgroundRepeat: "no-repeat",
            backgroundPositionY: "0px",
            backgroundPositionX: "0px",
            imageRendering: "pixelated",
            animation: "nicolasIdleAnim 1s steps(6) infinite",
          }}
        />
        <div className="absolute inset-0 z-[50] flex items-center justify-center" style={{ paddingTop: "60px", paddingBottom: "60px" }}>
          <div
            className="relative w-[310px] overflow-hidden"
            style={{
              background: "linear-gradient(180deg,#0a080899 0%,#151010aa 100%)",
              border: `3px solid ${ac}`,
              boxShadow: `0 0 20px ${ac}40, 0 0 60px ${ac}15`,
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ac}08 3px, ${ac}08 4px)`, pointerEvents: "none" }} />

            {/* Header */}
            <div className="relative px-4 pt-3 pb-2 flex items-center justify-between" style={{ background: "#0d0b0b99", borderBottom: `3px solid ${ac}` }}>
              <div className="flex items-center gap-2">
                <Beer className="w-4 h-4" style={{ color: ac }} />
                <span style={{ fontSize: "9px", color: ac, letterSpacing: "2px" }}>THE BRAMBLE INN</span>
              </div>
              <button className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110" style={{ border: `1px solid ${ac}50`, background: "transparent" }} onClick={closePanel}>
                <X className="w-3 h-3" style={{ color: ac }} />
              </button>
            </div>

            {/* Tab bar */}
            <div className="relative flex" style={{ borderBottom: `2px solid ${ac}30` }}>
              {([
                { id: "rest",   label: "REST",   Icon: Beer },
                { id: "talk",   label: "TALK",   Icon: MessageSquare },
                { id: "bounty", label: "BOUNTY", Icon: Crosshair },
                { id: "hunt",   label: "HUNT",   Icon: Target },
              ] as { id: TavernTab; label: string; Icon: typeof Beer }[]).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-all"
                  style={{
                    background: tavernTab === id ? `${ac}20` : "transparent",
                    borderBottom: tavernTab === id ? `2px solid ${ac}` : "2px solid transparent",
                    color: tavernTab === id ? ac : `${ac}60`,
                    fontSize: "6px",
                    letterSpacing: "0.5px",
                  }}
                  onClick={() => { playSfx("menuSelect"); setTavernTab(id); }}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="relative px-4 py-3" style={{ minHeight: "140px" }}>

              {/* REST */}
              {tavernTab === "rest" && (
                <div className="space-y-3">
                  <p style={{ fontSize: "7px", color: "#c8c0a8", letterSpacing: "1px", lineHeight: "1.8", textAlign: "center" }}>
                    "Rest your bones, traveller.<br />The forest keeps no schedules."
                  </p>
                  {restedMsg ? (
                    <div className="text-center py-2" style={{ fontSize: "8px", color: "#6ee7b7", letterSpacing: "1px" }}>✓ RESTED &amp; REFRESHED</div>
                  ) : (
                    <button
                      data-testid="button-tavern-rest"
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                      style={{ background: "#0d0b0bf0", border: `1px solid ${ac}30`, fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${ac}25`; (e.currentTarget as HTMLElement).style.borderColor = `${ac}80`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#0d0b0bf0"; (e.currentTarget as HTMLElement).style.borderColor = `${ac}30`; }}
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
              )}

              {/* TALK */}
              {tavernTab === "talk" && (() => {
                const lines = REGION_TALK_LINES[regionTheme] || ["Nicolas has nothing to say."];
                const line = lines[talkLineIdx % lines.length];
                return (
                  <div className="space-y-3">
                    <div style={{ background: "#0d0b0bf0", border: `1px solid ${ac}30`, padding: "12px" }}>
                      <p style={{ fontSize: "7px", color: "#c8c0a8", letterSpacing: "1px", lineHeight: "2", fontStyle: "italic" }}>
                        "{line}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "6px", color: `${ac}50`, letterSpacing: "1px" }}>— Nicolas Fernal</span>
                      <button
                        className="px-3 py-1"
                        style={{ border: `1px solid ${ac}60`, background: "transparent", color: ac, fontSize: "7px", letterSpacing: "1px" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${ac}20`}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        onClick={() => { playSfx("menuSelect"); setTalkLineIdx(i => i + 1); }}
                      >
                        {talkLineIdx < lines.length - 1 ? "NEXT ›" : "AGAIN ›"}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* BOUNTY */}
              {tavernTab === "bounty" && (() => {
                const bounty = player.activeBounty;
                const pool = BOUNTY_POOLS[regionTheme] || [];
                if (!bounty) {
                  return (
                    <div className="space-y-3">
                      <p style={{ fontSize: "7px", color: "#c8c0a8", letterSpacing: "1px", lineHeight: "2", textAlign: "center" }}>
                        "I've got a target for you,<br />if you're up to it."
                      </p>
                      {pool.length > 0 ? (
                        <button
                          className="w-full py-2.5"
                          style={{ background: "#0d0b0bf0", border: `1px solid ${ac}50`, color: ac, fontSize: "8px", letterSpacing: "2px" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${ac}25`}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#0d0b0bf0"}
                          onClick={() => {
                            playSfx("menuSelect");
                            const def = pool[Math.floor(Math.random() * pool.length)];
                            onSetBounty({ enemyId: def.enemyId, enemyName: def.enemyName, goldReward: def.goldReward, region: 0, completed: false });
                          }}
                        >
                          NEW BOUNTY
                        </button>
                      ) : (
                        <p style={{ fontSize: "7px", color: `${ac}50`, textAlign: "center" }}>No bounties available.</p>
                      )}
                    </div>
                  );
                }
                if (!bounty.completed) {
                  return (
                    <div className="space-y-3">
                      <p style={{ fontSize: "7px", color: "#c8c0a8", letterSpacing: "1px", lineHeight: "2", textAlign: "center" }}>
                        "Don't come back empty-handed."
                      </p>
                      <div style={{ background: "#0d0b0bf0", border: `1px solid ${ac}30`, padding: "10px" }}>
                        <div style={{ fontSize: "6px", color: `${ac}80`, letterSpacing: "1px", marginBottom: "4px" }}>TARGET</div>
                        <div style={{ fontSize: "10px", color: "#e8e0d0", letterSpacing: "1px", marginBottom: "6px" }}>{bounty.enemyName}</div>
                        <div style={{ fontSize: "7px", color: "#6ee7b7", letterSpacing: "1px" }}>⬡ {bounty.goldReward} GOLD REWARD</div>
                      </div>
                      <div className="text-center py-1" style={{ fontSize: "7px", color: `${ac}60`, letterSpacing: "2px" }}>◈ IN PROGRESS ◈</div>
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    <p style={{ fontSize: "7px", color: "#c8c0a8", letterSpacing: "1px", lineHeight: "2", textAlign: "center" }}>
                      "Well done. A deal's a deal."
                    </p>
                    <div style={{ background: "#0d0b0bf0", border: `1px solid ${ac}30`, padding: "10px" }}>
                      <div style={{ fontSize: "6px", color: `${ac}80`, letterSpacing: "1px", marginBottom: "4px" }}>BOUNTY COMPLETE</div>
                      <div style={{ fontSize: "10px", color: "#e8e0d0", letterSpacing: "1px", marginBottom: "6px" }}>{bounty.enemyName}</div>
                    </div>
                    {bountyCollected ? (
                      <div className="text-center py-1" style={{ fontSize: "8px", color: "#6ee7b7", letterSpacing: "1px" }}>✓ +{bounty.goldReward} GOLD COLLECTED</div>
                    ) : (
                      <button
                        className="w-full py-2.5"
                        style={{ background: `${ac}20`, border: `2px solid ${ac}`, color: ac, fontSize: "8px", letterSpacing: "2px" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${ac}40`}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${ac}20`}
                        onClick={() => { playSfx("recover"); onCollectBounty(); setBountyCollected(true); setTimeout(() => setBountyCollected(false), 3000); }}
                      >
                        COLLECT {bounty.goldReward} GOLD
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* HUNT */}
              {tavernTab === "hunt" && (() => {
                const hunts = HUNT_POOLS[regionTheme] || [];
                if (hunts.length === 0) return <p style={{ fontSize: "7px", color: `${ac}50`, textAlign: "center", marginTop: "20px" }}>No hunts available.</p>;
                return (
                  <div className="space-y-2">
                    {hunts.map(hunt => {
                      const count = player.inventory.filter(i => i.id === hunt.lootItemId || i.id.startsWith(hunt.lootItemId + "_")).length;
                      const ready = count >= hunt.required;
                      const collected = huntCollected.has(hunt.id);
                      return (
                        <div key={hunt.id} style={{ background: "#0d0b0bf0", border: `1px solid ${ready ? ac : ac + "30"}`, padding: "8px" }}>
                          <div className="flex items-center justify-between" style={{ marginBottom: "4px" }}>
                            <div>
                              <div style={{ fontSize: "7px", color: "#e8e0d0", letterSpacing: "0.5px" }}>{hunt.lootName}</div>
                              <div style={{ fontSize: "6px", color: `${ac}60`, letterSpacing: "0.5px" }}>from {hunt.enemyName}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "7px", color: ready ? "#6ee7b7" : `${ac}80` }}>{Math.min(count, hunt.required)}/{hunt.required}</div>
                              <div style={{ fontSize: "6px", color: `${ac}60` }}>⬡ {hunt.goldReward}g</div>
                            </div>
                          </div>
                          {collected ? (
                            <div style={{ fontSize: "6px", color: "#6ee7b7", letterSpacing: "1px", textAlign: "center" }}>✓ COLLECTED</div>
                          ) : ready ? (
                            <button
                              className="w-full py-1 mt-1"
                              style={{ background: `${ac}20`, border: `1px solid ${ac}`, color: ac, fontSize: "6px", letterSpacing: "1px" }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${ac}40`}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${ac}20`}
                              onClick={() => {
                                playSfx("recover");
                                onCollectHunt(hunt.id, hunt.lootItemId, hunt.required, hunt.goldReward);
                                setHuntCollected(s => new Set([...s, hunt.id]));
                                setTimeout(() => setHuntCollected(s => { const n = new Set(s); n.delete(hunt.id); return n; }), 3000);
                              }}
                            >
                              COLLECT {hunt.goldReward} GOLD
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="relative px-4 py-2" style={{ borderTop: `1px solid ${ac}20` }}>
              <p className="text-center" style={{ fontSize: "6px", color: `${ac}50`, letterSpacing: "1px" }}>"May the canopy shield you."</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${ac}40, transparent)` }} />
          </div>
        </div>
        </>
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

      {transitionIn && (
        <BattleTransition
          direction="in"
          sfx="menuSelect"
          onComplete={() => {
            const target = transitionTargetRef.current;
            if (target === "close") {
              setActivePanel(null);
              setRestedMsg(false);
            } else {
              setActivePanel(target);
            }
            setTransitionIn(false);
            setTransitionOut(true);
          }}
        />
      )}
      {transitionOut && (
        <BattleTransition
          direction="out"
          onComplete={() => setTransitionOut(false)}
        />
      )}
    </div>
  );
}
