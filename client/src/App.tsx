import { useState, useEffect, useCallback } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { useGameState } from "@/lib/gameState";
import { getRegionForTier, getRegionTier, ELEMENT_COLORS } from "@/lib/gameData";
import MainMenu from "@/components/MainMenu";
import CharacterCreation from "@/components/CharacterCreation";
import Overworld from "@/components/Overworld";
import BattleScreen from "@/components/BattleScreen";
import LevelUpScreen from "@/components/LevelUpScreen";
import PerkSelectScreen from "@/components/PerkSelectScreen";
import ShopScreen from "@/components/ShopScreen";
import InventoryScreen from "@/components/InventoryScreen";
import CharacterUnlockScreen from "@/components/CharacterUnlockScreen";
import CharacterSelectUnlock from "@/components/CharacterSelectUnlock";
import PartyManagementScreen from "@/components/PartyManagementScreen";
import ShamanScreen from "@/components/ShamanScreen";
import BattleTransition from "@/components/BattleTransition";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { setSfxVolume } from "@/lib/sfx";
import { X } from "lucide-react";
import type { PlayerCharacter } from "@shared/schema";

const DESIGN_WIDTH = 1024;
const DESIGN_HEIGHT = 640;
const MOBILE_LANDSCAPE_MAX_HEIGHT = 500;

function useViewportScale() {
  const [info, setInfo] = useState<{ scale: number; isMobileLandscape: boolean; vw: number; vh: number }>({
    scale: 1, isMobileLandscape: false, vw: window.innerWidth, vh: window.innerHeight,
  });

  const calculate = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isLandscape = vw > vh;
    const isMobileLandscape = isLandscape && vh <= MOBILE_LANDSCAPE_MAX_HEIGHT;

    if (isMobileLandscape) {
      const scaleX = vw / DESIGN_WIDTH;
      const scaleY = vh / DESIGN_HEIGHT;
      const scale = Math.min(scaleX, scaleY);
      setInfo({ scale, isMobileLandscape: true, vw, vh });
    } else {
      setInfo({ scale: 1, isMobileLandscape: false, vw, vh });
    }
  }, []);

  useEffect(() => {
    calculate();
    window.addEventListener("resize", calculate);
    window.addEventListener("orientationchange", calculate);
    return () => {
      window.removeEventListener("resize", calculate);
      window.removeEventListener("orientationchange", calculate);
    };
  }, [calculate]);

  return info;
}

function Game() {
  const {
    state, setState, setScreen, createCharacter, updatePlayer,
    startBattle, playerAttack, castSpell, playerDefend, useItem, useItemOverworld,
    partyMemberAttack, partyMemberDefend, partyMemberCastSpell, partyMemberUseItem, advancePartyTurn, finishPartyTurn,
    enemyAttack, enemyTurnEnd, endBattle, allocateStat, selectPerk, openShop,
    buyItem, equipItem, unequipItem, restAtNode, loadGame, setAnimating, finishPlayerTurn, repositionUnit,
    confirmUnlock,
    changeRegion,
    openShaman, learnShamanSpell,
  } = useGameState();

  const { toast } = useToast();

  useEffect(() => {
    setSfxVolume(state.sfxVolume);
  }, [state.sfxVolume]);

  const { data: saves } = useQuery<{ id: string; slotName: string; playerData: PlayerCharacter; updatedAt: string }[]>({
    queryKey: ["/api/saves"],
  });

  const hasSave = (saves && saves.length > 0) || false;

  const [showSaveScreen, setShowSaveScreen] = useState(false);
  const [saveConfirmSlot, setSaveConfirmSlot] = useState<number | null>(null);
  const [saveSuccessSlot, setSaveSuccessSlot] = useState<number | null>(null);
  const [showPartyManagement, setShowPartyManagement] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const handleOpenOptions = () => setShowOptions(true);
    window.addEventListener('open-options', handleOpenOptions);
    return () => window.removeEventListener('open-options', handleOpenOptions);
  }, []);
  const [battleTransition, setBattleTransition] = useState<{ nodeId: number; elementColor: string } | null>(null);
  const [battleExitTransition, setBattleExitTransition] = useState<{ victory: boolean } | null>(null);
  const [postBattleReveal, setPostBattleReveal] = useState(false);
  const [battleEntryReveal, setBattleEntryReveal] = useState(false);
  const [transitionElementColor, setTransitionElementColor] = useState<string | undefined>(undefined);
  const [menuFadeOut, setMenuFadeOut] = useState<{ save: any } | null>(null);
  const [menuFadeIn, setMenuFadeIn] = useState(false);

  const handleSaveToSlot = async (slotNumber: number) => {
    if (!state.player) return;
    try {
      await apiRequest("POST", "/api/saves", {
        slotName: `Slot ${slotNumber}`,
        playerData: state.player,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
      setSaveConfirmSlot(null);
      setSaveSuccessSlot(slotNumber);
      setTimeout(() => setSaveSuccessSlot(null), 2000);
    } catch {
      toast({ title: "Save Failed", description: "Could not save game.", variant: "destructive" });
    }
  };

  const handleLoadSlot = (save: any) => {
    setMenuFadeOut({ save });
  };

  const handleContinue = () => {
    if (saves && saves.length > 0) {
      const sorted = [...saves].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setMenuFadeOut({ save: sorted[0] });
    }
  };

  const renderScreen = () => {
    switch (state.screen) {
      case "menu":
        return (
          <>
            <MainMenu
              onNewGame={() => setScreen("creation")}
              onContinue={handleContinue}
              onLoadGame={handleLoadSlot}
              hasSave={hasSave}
              saves={saves || []}
              textSpeed={state.textSpeed}
              musicVolume={state.musicVolume}
              sfxVolume={state.sfxVolume}
              showDamageNumbers={state.showDamageNumbers}
              onSettingsChange={(settings) => setState(s => ({ ...s, ...settings }))}
            />
            {menuFadeOut && (
              <BattleTransition
                direction="in"
                onComplete={() => {
                  const save = menuFadeOut.save;
                  setMenuFadeOut(null);
                  setMenuFadeIn(true);
                  loadGame(save.playerData as PlayerCharacter);
                }}
              />
            )}
          </>
        );

      case "creation":
        return (
          <CharacterCreation
            onComplete={createCharacter}
            onBack={() => setScreen("menu")}
          />
        );

      case "overworld":
        if (!state.player) return null;
        return (
          <>
            <Overworld
              player={state.player}
              onMoveToNode={(nodeId: number) => {
                updatePlayer({ currentNode: nodeId });
              }}
              onNodeSelect={(nodeId: number, pos?: { x: number; y: number }) => {
                if (!state.player) return;
                const t = getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {});
                const r = getRegionForTier(state.player.currentRegion, t);
                const ec = ELEMENT_COLORS[r.theme] || "#c9a44a";
                setTransitionElementColor(ec);
                setBattleTransition({ nodeId, elementColor: ec });
              }}
              onShopOpen={(nodeId: number) => {
                updatePlayer({ clearedNodes: state.player!.clearedNodes.includes(nodeId) ? state.player!.clearedNodes : [...state.player!.clearedNodes, nodeId] });
                openShop();
              }}
              onRest={() => {
                restAtNode();
                toast({ title: "Rested", description: "HP and MP fully restored!" });
              }}
              onShamanVisit={openShaman}
              onInventory={() => setScreen("inventory")}
              onPartyManage={() => setShowPartyManagement(true)}
              onSaveOpen={() => setShowSaveScreen(true)}
              onRegionChange={changeRegion}
            />
            {showPartyManagement && state.player && (
              <div className="absolute inset-0 z-[300]">
                <PartyManagementScreen
                  player={state.player}
                  onRemoveMember={(memberId) => {
                    const member = state.player!.party.find(m => m.id === memberId);
                    if (!member) return;
                    updatePlayer({
                      party: state.player!.party.filter(m => m.id !== memberId),
                      benchedParty: [...(state.player!.benchedParty || []), member],
                    });
                  }}
                  onAddMember={(memberId) => {
                    const member = (state.player!.benchedParty || []).find(m => m.id === memberId);
                    if (!member) return;
                    updatePlayer({
                      party: [...state.player!.party, member],
                      benchedParty: (state.player!.benchedParty || []).filter(m => m.id !== memberId),
                    });
                  }}
                  onClose={() => setShowPartyManagement(false)}
                />
              </div>
            )}
            {showOptions && (
              <div className="absolute inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="w-80 p-5 overflow-hidden relative" style={{
                  background: "rgba(8,8,12,0.95)",
                  border: `3px solid ${ELEMENT_COLORS[getRegionForTier(state.player.currentRegion, getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {})).theme]}`,
                  boxShadow: `0 0 30px rgba(0,0,0,0.5)`,
                  fontFamily: "'Press Start 2P', cursive"
                }}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 style={{ fontSize: "10px", color: "#c9a44a", letterSpacing: "2px" }}>OPTIONS</h3>
                    <button 
                      onClick={() => setShowOptions(false)}
                      className="w-8 h-8 flex items-center justify-center border border-[#c9a44a]50 bg-black/40"
                    >
                      <X className="w-4 h-4 text-[#c9a44a]" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label style={{ fontSize: "7px", color: "#c9a44a80", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>TEXT SPEED</label>
                      <div className="flex gap-2">
                        {(["slow", "medium", "fast"] as const).map(sp => (
                          <button
                            key={sp}
                            className="flex-1 py-2 text-[7px]"
                            style={{
                              border: state.textSpeed === sp ? `2px solid #c9a44a` : `1px solid #c9a44a30`,
                              background: state.textSpeed === sp ? `#c9a44a25` : "transparent",
                              color: state.textSpeed === sp ? "#c9a44a" : "#c9a44a60",
                            }}
                            onClick={() => setState(s => ({ ...s, textSpeed: sp }))}
                          >
                            {sp.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "7px", color: "#c9a44a80", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>MUSIC: {state.musicVolume}%</label>
                      <Slider
                        value={[state.musicVolume]}
                        max={100} step={1}
                        onValueChange={([v]: number[]) => setState(s => ({ ...s, musicVolume: v }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "7px", color: "#c9a44a80", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>SFX: {state.sfxVolume}%</label>
                      <Slider
                        value={[state.sfxVolume]}
                        max={100} step={1}
                        onValueChange={([v]: number[]) => setState(s => ({ ...s, sfxVolume: v }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showSaveScreen && state.player && (() => {
              const saveTier = getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {});
              const saveReg = getRegionForTier(state.player.currentRegion, saveTier);
              const ec = ELEMENT_COLORS[saveReg.theme];
              const skyColors: Record<string, string[]> = {
                Fire: ["#1a0508", "#3d0a10"], Ice: ["#050a1a", "#0a1535"],
                Shadow: ["#08050a", "#150a20"], Earth: ["#0a0800", "#1a1508"],
              };
              const sky = skyColors[saveReg.theme] || skyColors.Fire;

              const getSlotSave = (slotNum: number) => {
                if (!saves) return null;
                return saves.find(s => s.slotName === `Slot ${slotNum}`) || null;
              };

              return (
                <div className="absolute inset-0 z-[300] flex items-center justify-center"
                  style={{ fontFamily: "'Press Start 2P', cursive", imageRendering: "pixelated" }}
                >
                  <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${ec}15 0%, rgba(0,0,0,0.85) 70%)` }} />
                  <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ec}08 3px, ${ec}08 4px)`,
                  }} />

                  <div className="relative w-[340px] overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, ${sky[0]}f0 0%, ${sky[1]}f5 100%)`,
                      border: `3px solid ${ec}`,
                      boxShadow: `0 0 20px ${ec}40, 0 0 60px ${ec}15, inset 0 0 30px rgba(0,0,0,0.5)`,
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ec}08 3px, ${ec}08 4px)`,
                      pointerEvents: "none",
                    }} />

                    <div className="relative px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: `2px solid ${ec}60` }}>
                      <span style={{ fontSize: "10px", color: ec, letterSpacing: "2px" }}>SAVE GAME</span>
                      <button
                        className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110"
                        style={{ border: `1px solid ${ec}50`, background: "rgba(0,0,0,0.4)" }}
                        onClick={() => { setShowSaveScreen(false); setSaveConfirmSlot(null); setSaveSuccessSlot(null); }}
                      >
                        <span style={{ fontSize: "8px", color: ec }}>✕</span>
                      </button>
                    </div>

                    <div className="relative px-3 py-3 space-y-2">
                      {[1, 2, 3].map(slotNum => {
                        const slotSave = getSlotSave(slotNum);
                        const isSuccess = saveSuccessSlot === slotNum;
                        return (
                          <button
                            key={slotNum}
                            className="w-full text-left px-3 py-3 transition-all"
                            style={{
                              background: isSuccess ? `${ec}25` : "rgba(0,0,0,0.3)",
                              border: `1px solid ${isSuccess ? ec : `${ec}30`}`,
                              boxShadow: isSuccess ? `0 0 12px ${ec}30` : "none",
                            }}
                            onMouseEnter={e => {
                              if (!isSuccess) {
                                (e.currentTarget as HTMLElement).style.background = `${ec}25`;
                                (e.currentTarget as HTMLElement).style.borderColor = `${ec}80`;
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${ec}30, inset 0 0 8px ${ec}10`;
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isSuccess) {
                                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.3)";
                                (e.currentTarget as HTMLElement).style.borderColor = `${ec}30`;
                                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                              }
                            }}
                            onClick={() => { if (!isSuccess) setSaveConfirmSlot(slotNum); }}
                          >
                            {isSuccess ? (
                              <div className="flex items-center gap-2">
                                <span style={{ fontSize: "9px", color: ec }}>✓ SAVED!</span>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between">
                                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.9)", letterSpacing: "1px" }}>SLOT {slotNum}</span>
                                  {slotSave && (
                                    <span style={{ fontSize: "6px", color: `${ec}60` }}>
                                      {new Date(slotSave.updatedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                {slotSave ? (
                                  <div style={{ marginTop: "4px" }}>
                                    <span style={{ fontSize: "7px", color: `${ec}80` }}>
                                      {(slotSave.playerData as any).name} · Lv.{(slotSave.playerData as any).level} · {(slotSave.playerData as any).element}
                                    </span>
                                  </div>
                                ) : (
                                  <div style={{ marginTop: "4px" }}>
                                    <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.3)" }}>EMPTY SLOT</span>
                                  </div>
                                )}
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative px-4 py-2" style={{ borderTop: `1px solid ${ec}20` }}>
                      <button
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 transition-all"
                        style={{ border: `1px solid ${ec}30`, background: "rgba(0,0,0,0.3)" }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = `${ec}25`;
                          (e.currentTarget as HTMLElement).style.borderColor = `${ec}80`;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.3)";
                          (e.currentTarget as HTMLElement).style.borderColor = `${ec}30`;
                        }}
                        onClick={() => { setShowSaveScreen(false); setSaveConfirmSlot(null); setSaveSuccessSlot(null); }}
                      >
                        <span style={{ fontSize: "8px", color: ec, letterSpacing: "1px" }}>BACK</span>
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${ec}40, transparent)` }} />
                  </div>

                  {saveConfirmSlot !== null && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
                      <div className="absolute inset-0 bg-black/60" onClick={() => setSaveConfirmSlot(null)} />
                      <div className="relative w-[260px] overflow-hidden"
                        style={{
                          background: `linear-gradient(180deg, ${sky[0]}f8 0%, ${sky[1]}fc 100%)`,
                          border: `3px solid ${ec}`,
                          boxShadow: `0 0 30px ${ec}50, 0 0 80px ${ec}20, inset 0 0 30px rgba(0,0,0,0.5)`,
                        }}
                      >
                        <div style={{
                          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ec}08 3px, ${ec}08 4px)`,
                          pointerEvents: "none",
                        }} />

                        <div className="relative px-4 py-4 text-center">
                          <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.9)", letterSpacing: "1px", lineHeight: "1.8" }}>
                            Save to Slot {saveConfirmSlot}?
                          </p>
                          {getSlotSave(saveConfirmSlot) && (
                            <p style={{ fontSize: "7px", color: `${ec}70`, marginTop: "6px" }}>
                              This will overwrite existing data
                            </p>
                          )}
                        </div>

                        <div className="relative px-3 pb-3 flex gap-2">
                          <button
                            className="flex-1 px-3 py-2 transition-all text-center"
                            style={{ border: `1px solid ${ec}`, background: `${ec}20` }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = `${ec}40`;
                              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${ec}40`;
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = `${ec}20`;
                              (e.currentTarget as HTMLElement).style.boxShadow = "none";
                            }}
                            onClick={() => handleSaveToSlot(saveConfirmSlot)}
                          >
                            <span style={{ fontSize: "8px", color: ec, letterSpacing: "1px" }}>CONFIRM</span>
                          </button>
                          <button
                            className="flex-1 px-3 py-2 transition-all text-center"
                            style={{ border: `1px solid ${ec}30`, background: "rgba(0,0,0,0.3)" }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = `${ec}15`;
                              (e.currentTarget as HTMLElement).style.borderColor = `${ec}60`;
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.3)";
                              (e.currentTarget as HTMLElement).style.borderColor = `${ec}30`;
                            }}
                            onClick={() => setSaveConfirmSlot(null)}
                          >
                            <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.6)", letterSpacing: "1px" }}>CANCEL</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            {battleTransition && (
              <BattleTransition
                direction="in"
                elementColor={battleTransition.elementColor}
                onComplete={() => {
                  const nodeId = battleTransition.nodeId;
                  setBattleTransition(null);
                  setBattleEntryReveal(true);
                  startBattle(nodeId);
                }}
              />
            )}
            {menuFadeIn && (
              <BattleTransition
                direction="out"
                onComplete={() => setMenuFadeIn(false)}
              />
            )}
            {postBattleReveal && (
              <BattleTransition
                direction="out"
                elementColor={transitionElementColor}
                onComplete={() => setPostBattleReveal(false)}
              />
            )}
          </>
        );

      case "battle":
        if (!state.player || !state.battle) return null;
        const battleTier = getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {});
        const battleRegion = getRegionForTier(state.player.currentRegion, battleTier);
        return (
          <>
            <BattleScreen
              player={state.player}
              battle={state.battle}
              showDamageNumbers={state.showDamageNumbers}
              regionTheme={battleRegion.theme}
              onAttack={playerAttack}
              onCastSpell={castSpell}
              onDefend={playerDefend}
              onUseItem={useItem}
              onPartyMemberAttack={partyMemberAttack}
              onPartyMemberDefend={partyMemberDefend}
              onPartyMemberCastSpell={partyMemberCastSpell}
              onPartyMemberUseItem={partyMemberUseItem}
              onAdvancePartyTurn={advancePartyTurn}
              onFinishPartyTurn={finishPartyTurn}
              onEnemyAttack={enemyAttack}
              onEnemyTurnEnd={enemyTurnEnd}
              onEndBattle={(victory: boolean) => setBattleExitTransition({ victory })}
              onSetAnimating={setAnimating}
              onFinishPlayerTurn={finishPlayerTurn}
              onRepositionUnit={repositionUnit}
            />
            {battleEntryReveal && (
              <BattleTransition
                direction="out"
                elementColor={transitionElementColor}
                onComplete={() => setBattleEntryReveal(false)}
              />
            )}
            {battleExitTransition && (
              <BattleTransition
                direction="in"
                elementColor={transitionElementColor}
                onComplete={() => {
                  const v = battleExitTransition.victory;
                  setBattleExitTransition(null);
                  setPostBattleReveal(true);
                  endBattle(v);
                }}
              />
            )}
          </>
        );

      case "levelUp":
        if (!state.player || !state.pendingLevelUp) return null;
        return (
          <>
            <LevelUpScreen
              player={state.player}
              pendingLevelUp={state.pendingLevelUp}
              statsRemaining={state.pendingLevelUp.statsToAllocate}
              onAllocate={allocateStat}
            />
            {postBattleReveal && (
              <BattleTransition
                direction="out"
                elementColor={transitionElementColor}
                onComplete={() => setPostBattleReveal(false)}
              />
            )}
          </>
        );

      case "perkSelect":
        if (!state.player || !state.pendingLevelUp) return null;
        return (
          <PerkSelectScreen
            player={state.player}
            pendingLevelUp={state.pendingLevelUp}
            onSelect={selectPerk}
          />
        );

      case "shop":
        if (!state.player || !state.currentShop) return null;
        return (
          <ShopScreen
            player={state.player}
            items={state.currentShop}
            onBuy={buyItem}
            onBack={() => setScreen("overworld")}
          />
        );

      case "inventory":
        if (!state.player) return null;
        return (
          <InventoryScreen
            player={state.player}
            onEquip={equipItem}
            onUnequip={unequipItem}
            onUseItem={useItemOverworld}
            onBack={() => setScreen("overworld")}
          />
        );

      case "shaman":
        if (!state.player) return null;
        return (
          <ShamanScreen
            player={state.player}
            onLearnSpell={learnShamanSpell}
            onBack={() => setScreen("overworld")}
          />
        );

      case "partyUnlock":
        if (!state.player) return null;
        if (state.pendingUnlock) {
          return (
            <CharacterUnlockScreen
              character={state.pendingUnlock}
              playerLevel={state.player.level}
              onConfirm={confirmUnlock}
            />
          );
        }
        if (state.pendingUnlocks && state.pendingUnlocks.length > 0) {
          return (
            <CharacterSelectUnlock
              characters={state.pendingUnlocks}
              playerLevel={state.player.level}
              onSelect={(charDef) => {
                setState(s => ({
                  ...s,
                  pendingUnlock: charDef,
                }));
              }}
            />
          );
        }
        return null;

      default:
        return null;
    }
  };

  const { scale, isMobileLandscape, vw, vh } = useViewportScale();

  if (isMobileLandscape) {
    const offsetX = (vw - DESIGN_WIDTH * scale) / 2;
    const offsetY = (vh - DESIGN_HEIGHT * scale) / 2;
    return (
      <div className="fixed inset-0 overflow-hidden bg-[#0a0a1a]">
        <div
          className="game-scale-container"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            left: offsetX,
            top: offsetY,
          }}
        >
          {renderScreen()}
        </div>
      </div>
    );
  }

  return <div className="w-full h-screen overflow-hidden">{renderScreen()}</div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Game />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
