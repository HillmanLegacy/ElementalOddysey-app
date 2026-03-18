import { useState, useEffect, useCallback, useRef } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { useGameState } from "@/lib/gameState";
import { getRegionForTier, getRegionTier, ELEMENT_COLORS } from "@/lib/gameData";
import MainMenu from "@/components/MainMenu";
import CharacterCreation from "@/components/CharacterCreation";
import ForestIntroScreen from "@/components/ForestIntroScreen";
import Overworld from "@/components/Overworld";
import BattleScreen from "@/components/BattleScreen";
import LevelUpScreen from "@/components/LevelUpScreen";
import PerkSelectScreen from "@/components/PerkSelectScreen";
import ShopScreen from "@/components/ShopScreen";
import InventoryScreen from "@/components/InventoryScreen";
import CharacterUnlockScreen from "@/components/CharacterUnlockScreen";
import CharacterSelectUnlock from "@/components/CharacterSelectUnlock";
import PartyManagementScreen from "@/components/PartyManagementScreen";
import StatusScreen from "@/components/StatusScreen";
import ShamanScreen from "@/components/ShamanScreen";
import SfxTestPage from "@/components/SfxTestPage";
import BattleTransition from "@/components/BattleTransition";
import { getSaves, upsertSave, type LocalSave } from "@/lib/localSaves";
import { useToast } from "@/hooks/use-toast";
import { setSfxVolume } from "@/lib/sfx";
import { playAmbient, stopAmbient, playMusic, stopMusic, stopAll, setMusicVolume, fadeOutMusic, killMusic, stopJingle } from "@/lib/music";
import { playSfx } from "@/lib/sfx";
import { X, Home, Moon, Package, Users, Save, Sparkles, ArrowLeft, LogOut, Heart, Droplets, BarChart2 } from "lucide-react";
import { groupConsumables } from "@/lib/utils";
import type { PlayerCharacter } from "@shared/schema";
import hutBackground from "@assets/Hut_Background_1771782069190.jpg";
import SideScrollStage, { SSEnemySnapshot, SSDemonSnapshot } from "@/components/SideScrollStage";
import ClimbingStage, { ClimbEnemySnapshot } from "@/components/ClimbingStage";

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
    state, setState, setScreen, createCharacter, completeIntro, updatePlayer,
    startBattle, startBattleCustom, playerAttack, castSpell, playerDefend, useItem, useItemOverworld,
    partyMemberAttack, partyMemberDefend, partyMemberCastSpell, partyMemberUseItem, advancePartyTurn, finishPartyTurn,
    enemyAttack, enemyTurnEnd, endBattle, fleeBattle, allocateStat, selectPerk, openShop,
    buyItem, rollLoot, sellItem, equipItem, unequipItem, restAtNode, loadGame, setAnimating, finishPlayerTurn, repositionUnit,
    confirmUnlock,
    changeRegion,
    spawnEnemy,
    openShaman, learnShamanSpell,
    applyFireballDamage,
  } = useGameState();

  const { toast } = useToast();

  // Black overlay that fades out when transitioning from intro → overworld
  const [overworldReveal, setOverworldReveal] = useState<"off" | "black" | "fading">("off");
  const handleIntroComplete = useCallback(() => {
    setOverworldReveal("black");   // instant black (covers the swap)
    completeIntro();               // switch screen to overworld
    setTimeout(() => setOverworldReveal("fading"), 50);   // start 1.5s fade-out
    setTimeout(() => setOverworldReveal("off"),    1600);  // remove when done
  }, [completeIntro]);

  useEffect(() => {
    setSfxVolume(state.sfxVolume);
  }, [state.sfxVolume]);

  useEffect(() => {
    setMusicVolume(state.musicVolume);
  }, [state.musicVolume]);

  useEffect(() => {
    if (state.screen === "hut" && state.player) {
      const hutRegion = getRegionForTier(state.player.currentRegion, getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {}));
      playAmbient("hut");
      if (!battleTransition && !battleEntryReveal && hutRegion.theme === "Fire") {
        playMusic("lava_region_music");
      } else if (hutRegion.theme !== "Fire") {
        stopMusic();
      }
    } else if (state.screen === "overworld" && state.player) {
      const region = getRegionForTier(state.player.currentRegion, getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {}));
      if (region.theme === "Fire") {
        playAmbient("lava_region");
        if (!postBattleReveal && !battleTransition) {
          playMusic("lava_region_music");
        }
      } else if (region.theme === "Wind") {
        stopAmbient();
        if (!postBattleReveal && !battleTransition) {
          playMusic("forest_region");
        }
      } else {
        stopAmbient();
        stopMusic();
      }
    } else if (state.screen === "battle" && state.player) {
      stopAmbient();
      fadeOutMusic(400);
    } else if (state.screen === "menu") {
      stopAmbient();
      playMusic("main_menu");
    } else if (state.screen !== "intro") {
      stopAll();
    }
  }, [state.screen, state.player?.currentRegion]);

  const [saves, setSaves] = useState<LocalSave[]>(() => getSaves());

  const refreshSaves = useCallback(() => setSaves(getSaves()), []);

  const hasSave = saves.length > 0;

  const [showSaveScreen, setShowSaveScreen] = useState(false);
  const [saveConfirmSlot, setSaveConfirmSlot] = useState<number | null>(null);
  const [saveSuccessSlot, setSaveSuccessSlot] = useState<number | null>(null);
  const [showPartyManagement, setShowPartyManagement] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showHutInventory, setShowHutInventory] = useState(false);
  const [hutInventoryTab, setHutInventoryTab] = useState<"items" | "gear">("items");
  const [hutTargetingItemId, setHutTargetingItemId] = useState<string | null>(null);
  const [hutTransitionIn, setHutTransitionIn] = useState(false);
  const [hutTransitionOut, setHutTransitionOut] = useState(false);
  const [exitToMenuTransition, setExitToMenuTransition] = useState(false);

  useEffect(() => {
    const handleOpenOptions = () => { setShowOptions(true); };
    window.addEventListener('open-options', handleOpenOptions);
    return () => window.removeEventListener('open-options', handleOpenOptions);
  }, []);
  const [battleTransition, setBattleTransition] = useState<{ nodeId: number; elementColor: string } | null>(null);
  const [battleExitTransition, setBattleExitTransition] = useState<{ victory: boolean; fled?: boolean } | null>(null);
  const [postBattleReveal, setPostBattleReveal] = useState(false);
  const [battleEntryReveal, setBattleEntryReveal] = useState(false);
  const [transitionElementColor, setTransitionElementColor] = useState<string | undefined>(undefined);

  const [sideScrollCtx, setSideScrollCtx] = useState<{
    fromNodeId: number;
    toNodeId: number;
    toNodeName: string;
    defeatedEnemyIndices: number[];
    savedPlayerX: number;
    savedPlayerY?: number;
    reversed: boolean;
    isClimbing: boolean;
    fleeEnemyIndex: number | null;
    savedEnemyPatrol?: SSEnemySnapshot[] | ClimbEnemySnapshot[];
    savedDemonStates?: SSDemonSnapshot[];
  } | null>(null);
  const [sideScrollBattleTransition, setSideScrollBattleTransition] = useState<{
    enemyIndex: number;
    enemyId: string;
  } | null>(null);
  const [sideScrollCompleteTransition, setSideScrollCompleteTransition] = useState(false);
  const [sideScrollExitTransition, setSideScrollExitTransition] = useState(false);
  const [sideScrollEnterReveal, setSideScrollEnterReveal] = useState(false);
  const [sideScrollCompleteReveal, setSideScrollCompleteReveal] = useState(false);
  const [sideScrollExitReveal, setSideScrollExitReveal] = useState(false);
  const [sideScrollEnterPending, setSideScrollEnterPending] = useState<{
    fromNodeId: number;
    toNodeId: number;
    toNodeName: string;
    defeatedEnemyIndices: number[];
    savedPlayerX: number;
    savedPlayerY?: number;
    reversed: boolean;
    isClimbing: boolean;
    fleeEnemyIndex: number | null;
  } | null>(null);
  const sideScrollBattleActiveRef = useRef(false);
  const lastContactedEnemyIdxRef = useRef<number | null>(null);
  const lastContactedEnemyColorVariantRef = useRef<number | undefined>(undefined);
  const [menuFadeOut, setMenuFadeOut] = useState<{ save: any } | null>(null);
  const [menuFadeIn, setMenuFadeIn] = useState(false);
  const [menuReveal, setMenuReveal] = useState(false);
  const [levelUpExitFade, setLevelUpExitFade] = useState(false);
  const [overworldFromLevelUp, setOverworldFromLevelUp] = useState(false);
  const pendingLevelUpActionRef = useRef<(() => void) | null>(null);

  const handleSaveToSlot = (slotNumber: number) => {
    if (!state.player) return;
    try {
      upsertSave(`Slot ${slotNumber}`, state.player, {
        textSpeed: state.textSpeed,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
        showDamageNumbers: state.showDamageNumbers,
      });
      refreshSaves();
      setSaveConfirmSlot(null);
      setSaveSuccessSlot(slotNumber);
      playSfx('saveGame');
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

  const handleAllocateStat = (stat: Parameters<typeof allocateStat>[0]) => {
    const lu = state.pendingLevelUp;
    const goesToOverworld = lu && lu.statsToAllocate === 1 && lu.perksToChoose === 0 && state.pendingLevelUpQueue.length === 0 && !state.pendingUnlock && state.pendingUnlocks.length === 0;
    if (goesToOverworld) {
      pendingLevelUpActionRef.current = () => allocateStat(stat);
      setLevelUpExitFade(true);
    } else {
      allocateStat(stat);
    }
  };

  const handleSelectPerk = (perkId: string) => {
    const goesToOverworld = state.pendingLevelUpQueue.length === 0 && !state.pendingUnlock && state.pendingUnlocks.length === 0;
    if (goesToOverworld) {
      pendingLevelUpActionRef.current = () => selectPerk(perkId);
      setLevelUpExitFade(true);
    } else {
      selectPerk(perkId);
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
                sfx="battleTransition"
                sfxPlaybackRate={2.0}
                onComplete={() => {
                  const save = menuFadeOut.save;
                  setMenuFadeOut(null);
                  setMenuFadeIn(true);
                  loadGame(save.playerData as PlayerCharacter, save.options);
                }}
              />
            )}
            {menuReveal && (
              <BattleTransition
                direction="out"
                onComplete={() => setMenuReveal(false)}
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

      case "intro":
        return <ForestIntroScreen onComplete={handleIntroComplete} />;

      case "overworld":
        if (!state.player) return null;
        if (sideScrollCtx) {
          const ssPlayer = state.player;
          const regionTheme = (() => { const r = getRegionForTier(state.player!.currentRegion, getRegionTier(state.player!.currentRegion, state.player!.regionBossDefeats || {})); return r.theme; })();
          const sharedEnemyContact = (enemyIndex: number, enemyId: string, playerX: number, colorVariant?: number, playerY?: number, patrol?: SSEnemySnapshot[] | ClimbEnemySnapshot[], demonStates?: SSDemonSnapshot[]) => {
            if (sideScrollBattleActiveRef.current) return;
            lastContactedEnemyIdxRef.current = enemyIndex;
            lastContactedEnemyColorVariantRef.current = colorVariant;
            sideScrollBattleActiveRef.current = true;
            setSideScrollCtx(ctx => ctx ? { ...ctx, savedPlayerX: playerX, savedPlayerY: playerY, savedEnemyPatrol: patrol, savedDemonStates: demonStates } : null);
            setTransitionElementColor("#ef4444");
            fadeOutMusic(600);
            setSideScrollBattleTransition({ enemyIndex, enemyId });
          };
          const sharedComplete = () => { if (regionTheme !== "Wind") fadeOutMusic(700); setSideScrollCompleteTransition(true); };
          const sharedExit = () => { if (regionTheme !== "Wind") fadeOutMusic(700); setSideScrollExitTransition(true); };
          return (
            <>
              {sideScrollCtx.isClimbing ? (
                <ClimbingStage
                  player={ssPlayer}
                  fromNodeId={sideScrollCtx.fromNodeId}
                  toNodeId={sideScrollCtx.toNodeId}
                  defeatedEnemyIndices={sideScrollCtx.defeatedEnemyIndices}
                  fleeEnemyIndex={sideScrollCtx.fleeEnemyIndex}
                  savedPlayerY={sideScrollCtx.savedPlayerY}
                  regionTheme={regionTheme}
                  savedEnemyPatrol={sideScrollCtx.savedEnemyPatrol as ClimbEnemySnapshot[] | undefined}
                  onEnemyContact={(idx, eid, px, cv, py, patrol) => sharedEnemyContact(idx, eid, px, cv, py, patrol)}
                  onComplete={sharedComplete}
                  onExit={sharedExit}
                />
              ) : (
                <SideScrollStage
                  player={ssPlayer}
                  fromNodeId={sideScrollCtx.fromNodeId}
                  toNodeId={sideScrollCtx.toNodeId}
                  stageName={sideScrollCtx.toNodeName}
                  defeatedEnemyIndices={sideScrollCtx.defeatedEnemyIndices}
                  fleeEnemyIndex={sideScrollCtx.fleeEnemyIndex}
                  initialPlayerX={sideScrollCtx.savedPlayerX}
                  shopVisited={state.player?.clearedNodes.includes(4) ?? false}
                  reversed={sideScrollCtx.reversed}
                  regionTheme={regionTheme}
                  savedEnemyPatrol={sideScrollCtx.savedEnemyPatrol as SSEnemySnapshot[] | undefined}
                  savedDemonStates={sideScrollCtx.savedDemonStates}
                  onEnemyContact={(idx, eid, px, patrol, demonStates) => sharedEnemyContact(idx, eid, px, undefined, undefined, patrol, demonStates)}
                  onFireballContact={(enemyIndex, enemyId, playerX, patrol, demonStates) => {
                    if (sideScrollBattleActiveRef.current) return;
                    applyFireballDamage(10);
                    lastContactedEnemyIdxRef.current = enemyIndex;
                    sideScrollBattleActiveRef.current = true;
                    setSideScrollCtx(ctx => ctx ? { ...ctx, savedPlayerX: playerX, savedEnemyPatrol: patrol, savedDemonStates: demonStates } : null);
                    setTransitionElementColor("#ef4444");
                    fadeOutMusic(600);
                    setSideScrollBattleTransition({ enemyIndex, enemyId });
                  }}
                  onComplete={sharedComplete}
                  onExit={sharedExit}
                />
              )}
              {sideScrollBattleTransition && (
                <BattleTransition
                  direction="in"
                  elementColor="#ef4444"
                  sfx="battleTransition"
                  sfxPlaybackRate={2.0}
                  onComplete={() => {
                    const { enemyId } = sideScrollBattleTransition;
                    setSideScrollBattleTransition(null);
                    setBattleEntryReveal(true);
                    let battleEnemies: string[];
                    const roll = Math.random();
                    if (enemyId === "harpy_wind") {
                      // 50% single, 35% two, 15% three harpies
                      if (roll < 0.15)      battleEnemies = ["harpy_wind", "harpy_wind", "harpy_wind"];
                      else if (roll < 0.50) battleEnemies = ["harpy_wind", "harpy_wind"];
                      else                  battleEnemies = ["harpy_wind"];
                    } else if (enemyId === "minotaur_wind") {
                      // 60% minotaur + harpy, 25% solo minotaur, 15% two minotaurs
                      if (roll < 0.15)      battleEnemies = ["minotaur_wind", "minotaur_wind"];
                      else if (roll < 0.40) battleEnemies = ["minotaur_wind"];
                      else                  battleEnemies = ["minotaur_wind", "harpy_wind"];
                    } else if (enemyId === "cyclops_wind") {
                      // 75% solo cyclops, 25% cyclops + harpy
                      if (roll < 0.25) battleEnemies = ["cyclops_wind", "harpy_wind"];
                      else             battleEnemies = ["cyclops_wind"];
                    } else {
                      battleEnemies = [enemyId];
                    }
                    startBattleCustom(battleEnemies);
                  }}
                />
              )}
              {postBattleReveal && (
                <BattleTransition
                  direction="out"
                  elementColor={transitionElementColor}
                  onComplete={() => {
                    setPostBattleReveal(false);
                    if (ssPlayer) {
                      if (sideScrollCtx) {
                        if (regionTheme === "Wind") {
                          playMusic("forest_region");
                        } else {
                          playMusic("lava_region_battle");
                        }
                      } else {
                        const region = getRegionForTier(ssPlayer.currentRegion, getRegionTier(ssPlayer.currentRegion, ssPlayer.regionBossDefeats || {}));
                        if (region.theme === "Fire") {
                          playAmbient("lava_region");
                          playMusic("lava_region_music");
                        } else if (region.theme === "Wind") {
                          stopAmbient();
                          playMusic("forest_region");
                        } else {
                          stopAmbient();
                          stopMusic();
                        }
                      }
                    }
                  }}
                />
              )}
              {sideScrollCompleteTransition && (
                <BattleTransition
                  direction="in"
                  elementColor="#c9a44a"
                  onComplete={() => {
                    setSideScrollCompleteTransition(false);
                    const toNodeId = sideScrollCtx?.toNodeId;
                    setSideScrollCtx(null);
                    setSideScrollCompleteReveal(true);
                    if (toNodeId !== undefined && ssPlayer) {
                      const curRegion = getRegionForTier(ssPlayer.currentRegion, getRegionTier(ssPlayer.currentRegion, ssPlayer.regionBossDefeats || {}));
                      if (curRegion.nodes.some(n => n.id === toNodeId)) {
                        updatePlayer({ currentNode: toNodeId });
                      }
                    }
                    const region = getRegionForTier(ssPlayer.currentRegion, getRegionTier(ssPlayer.currentRegion, ssPlayer.regionBossDefeats || {}));
                    if (region.theme === "Fire") {
                      playAmbient("lava_region");
                      playMusic("lava_region_music");
                    } else if (region.theme === "Wind") {
                      stopAmbient();
                      playMusic("forest_region");
                    } else {
                      stopAmbient();
                      stopMusic();
                    }
                  }}
                />
              )}
              {sideScrollExitTransition && (
                <BattleTransition
                  direction="in"
                  elementColor="#6688ff"
                  onComplete={() => {
                    setSideScrollExitTransition(false);
                    setSideScrollCtx(null);
                    setSideScrollExitReveal(true);
                    const region = getRegionForTier(ssPlayer.currentRegion, getRegionTier(ssPlayer.currentRegion, ssPlayer.regionBossDefeats || {}));
                    if (region.theme === "Fire") {
                      playAmbient("lava_region");
                      playMusic("lava_region_music");
                    } else if (region.theme === "Wind") {
                      stopAmbient();
                      playMusic("forest_region");
                    } else {
                      stopAmbient();
                      stopMusic();
                    }
                  }}
                />
              )}
              {sideScrollEnterReveal && (
                <BattleTransition
                  direction="out"
                  elementColor="#c9a44a"
                  onComplete={() => setSideScrollEnterReveal(false)}
                />
              )}
            </>
          );
        }
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
                fadeOutMusic(700);
                setBattleTransition({ nodeId, elementColor: ec });
              }}
              onShopOpen={(nodeId: number) => {
                updatePlayer({ clearedNodes: state.player!.clearedNodes.includes(nodeId) ? state.player!.clearedNodes : [...state.player!.clearedNodes, nodeId] });
                openShop();
              }}
              onRest={() => {
                restAtNode();
                playSfx('recover');
                toast({ title: "Rested", description: "HP and MP fully restored!" });
              }}
              onShamanVisit={openShaman}
              onHutEnter={() => setHutTransitionIn(true)}
              onRegionChange={changeRegion}
              onEquip={equipItem}
              onUnequip={unequipItem}
              onUseItem={useItemOverworld}
              onArrowClick={(fromNodeId, toNode) => {
                if (!state.player) return;
                const t = getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {});
                const r = getRegionForTier(state.player.currentRegion, t);
                const fromNode = r.nodes.find(n => n.id === fromNodeId);
                const reversed = fromNode ? fromNode.x > toNode.x : false;
                const isClimbing = fromNode ? toNode.y < fromNode.y : false;
                stopAmbient();
                fadeOutMusic(400);
                setSideScrollEnterPending({
                  fromNodeId,
                  toNodeId: toNode.id,
                  toNodeName: toNode.name,
                  defeatedEnemyIndices: [],
                  savedPlayerX: reversed ? 4300 : 150,
                  reversed,
                  isClimbing,
                  fleeEnemyIndex: null,
                });
              }}
              onSave={handleSaveToSlot}
              onStatus={() => setShowStatus(true)}
              onOptions={() => setShowOptions(true)}
              onExitToMenu={() => setExitToMenuTransition(true)}
            />
            {hutTransitionIn && (
              <BattleTransition
                direction="in"
                onComplete={() => {
                  setHutTransitionIn(false);
                  setHutTransitionOut(true);
                  setScreen("hut");
                }}
              />
            )}
            {sideScrollEnterPending && (
              <BattleTransition
                direction="in"
                elementColor="#c9a44a"
                sfx="battleTransition"
                sfxPlaybackRate={2.0}
                onComplete={() => {
                  const pending = sideScrollEnterPending;
                  setSideScrollEnterPending(null);
                  setSideScrollCtx(pending);
                  setSideScrollEnterReveal(true);
                  const enterRegion = state.player ? getRegionForTier(state.player.currentRegion, getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {})) : null;
                  if (enterRegion?.theme === "Wind") {
                    playMusic("forest_region");
                  } else {
                    playMusic("lava_region_battle");
                  }
                }}
              />
            )}
            {battleTransition && (
              <BattleTransition
                direction="in"
                elementColor={battleTransition.elementColor}
                sfx="battleTransition"
                sfxPlaybackRate={2.0}
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
                onComplete={() => {
                  setPostBattleReveal(false);
                  if (state.player) {
                    const region = getRegionForTier(state.player.currentRegion, getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {}));
                    if (region.theme === "Fire") {
                      playAmbient("lava_region");
                      playMusic("lava_region_music");
                    } else if (region.theme === "Wind") {
                      stopAmbient();
                      playMusic("forest_region");
                    } else {
                      stopAmbient();
                      stopMusic();
                    }
                  }
                }}
              />
            )}
            {sideScrollCompleteReveal && (
              <BattleTransition
                direction="out"
                elementColor="#c9a44a"
                onComplete={() => setSideScrollCompleteReveal(false)}
              />
            )}
            {sideScrollExitReveal && (
              <BattleTransition
                direction="out"
                elementColor="#6688ff"
                onComplete={() => setSideScrollExitReveal(false)}
              />
            )}
            {hutTransitionOut && (
              <BattleTransition
                direction="out"
                onComplete={() => setHutTransitionOut(false)}
              />
            )}
            {overworldFromLevelUp && (
              <BattleTransition
                direction="out"
                onComplete={() => setOverworldFromLevelUp(false)}
              />
            )}
          </>
        );

      case "hut":
        if (!state.player) return null;
        return (() => {
          const ac = "#c9a44a";
          const tier = getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {});
          const region = getRegionForTier(state.player.currentRegion, tier);
          const regionNames: Record<string, string> = { Wind: "Verdant Lodge", Fire: "Ember Hearth", Ice: "Frost Lodge", Shadow: "Shadow Refuge", Earth: "Stone Haven" };
          const flavorText: Record<string, string> = { Wind: "Rest among the whispering trees", Fire: "Warmth against the inferno", Ice: "Shelter from the frost", Shadow: "Light in the darkness", Earth: "Rooted and restored" };
          const hutName = regionNames[region.theme] || "The Hut";
          const hutFlavor = flavorText[region.theme] || "A safe haven";

          const leaveHut = () => {
            setHutTransitionIn(true);
          };

          const menuItems = [
            { label: "REST", desc: "Restore HP & MP", icon: Moon, action: () => { restAtNode(); playSfx('recover'); toast({ title: "Rested", description: "HP and MP fully restored!" }); } },
            { label: "ITEMS", desc: "Use items, equip gear", icon: Package, action: () => { setShowHutInventory(true); setHutInventoryTab("items"); setHutTargetingItemId(null); } },
            ...(state.player!.party.length > 0 ? [{ label: "PARTY", desc: "Manage party members", icon: Users, action: () => { setShowPartyManagement(true); } }] : []),
            { label: "SAVE", desc: "Save your progress", icon: Save, action: () => { setShowSaveScreen(true); } },
            { label: "LEAVE", desc: "Return to overworld", icon: ArrowLeft, action: leaveHut },
          ];

          return (
            <>
              <div className="absolute inset-0" style={{ background: "#000" }}>
                <img
                  src={hutBackground}
                  alt="Hut interior"
                  className="w-full h-full object-cover"
                  style={{ imageRendering: "pixelated", opacity: 0.85 }}
                />
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)" }} />
              </div>

              <div className="absolute inset-0 z-[100] flex items-center justify-center">
                <div
                  className="relative w-[280px] overflow-hidden"
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    imageRendering: "pixelated",
                    background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
                    border: `3px solid ${ac}`,
                    boxShadow: `0 0 20px ${ac}40, 0 0 60px ${ac}15, inset 0 0 30px rgba(0,0,0,0.5)`,
                  }}
                >
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ac}08 3px, ${ac}08 4px)`,
                    pointerEvents: "none",
                  }} />

                  <div className="relative px-4 pt-3 pb-2 flex items-center justify-between" style={{ background: "#0d0b0bf0", borderBottom: `3px solid ${ac}` }}>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" style={{ color: ac }} />
                      <span style={{ fontSize: "10px", color: ac, letterSpacing: "2px" }}>{hutName.toUpperCase()}</span>
                    </div>
                    <button
                      className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110"
                      style={{ border: `1px solid ${ac}50`, background: "transparent" }}
                      onClick={() => { playSfx('menuSelect'); leaveHut(); }}
                    >
                      <X className="w-3 h-3" style={{ color: ac }} />
                    </button>
                  </div>

                  <div className="relative px-3 py-3 space-y-1.5">
                    {menuItems.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group"
                          style={{
                            background: "#0d0b0bf0",
                            border: `1px solid ${ac}30`,
                            animation: `fadeIn 0.2s ease-out ${i * 0.05}s both`,
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = `${ac}25`;
                            (e.currentTarget as HTMLElement).style.borderColor = `${ac}80`;
                            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${ac}30, inset 0 0 8px ${ac}10`;
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "#0d0b0bf0";
                            (e.currentTarget as HTMLElement).style.borderColor = `${ac}30`;
                            (e.currentTarget as HTMLElement).style.boxShadow = "none";
                          }}
                          onClick={() => { playSfx('menuSelect'); item.action(); }}
                        >
                          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ border: `1px solid ${ac}40`, background: "#0a080840" }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: ac }} />
                          </div>
                          <div className="flex flex-col">
                            <span style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>{item.label}</span>
                            <span style={{ fontSize: "7px", color: `${ac}60`, marginTop: "2px" }}>{item.desc}</span>
                          </div>
                          <svg className="w-3 h-3 ml-auto opacity-40 group-hover:opacity-80 transition-opacity" viewBox="0 0 12 12" style={{ color: ac }}>
                            <path d="M4 2 L8 6 L4 10" fill="none" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative px-4 py-2" style={{ borderTop: `1px solid ${ac}20` }}>
                    <p className="text-center" style={{ fontSize: "6px", color: `${ac}50`, letterSpacing: "1px" }}>{hutFlavor}</p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${ac}40, transparent)` }} />
                </div>
              </div>

              {showStatus && state.player && (
                <div className="absolute inset-0 z-[300]">
                  <StatusScreen
                    player={state.player}
                    onClose={() => setShowStatus(false)}
                  />
                </div>
              )}

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

              {showHutInventory && state.player && (() => {
                const hac = "#c9a44a";
                const consumables = state.player.inventory.filter(i => i.type === "consumable");
                const equipables = state.player.inventory.filter(i => i.type === "weapon" || i.type === "armor" || i.type === "accessory");
                return (
                  <div className="absolute inset-0 z-[300] flex items-center justify-center" style={{ background: "radial-gradient(ellipse at center, #c9a44a15 0%, rgba(0,0,0,0.85) 70%)" }}>
                    <div className="w-80 overflow-hidden relative" style={{
                      background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
                      border: `3px solid ${hac}`,
                      boxShadow: `0 0 20px ${hac}40, 0 0 60px ${hac}15, inset 0 0 30px rgba(0,0,0,0.5)`,
                      fontFamily: "'Press Start 2P', cursive",
                      imageRendering: "pixelated" as any,
                      maxHeight: "500px",
                    }}>
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${hac}08 3px, ${hac}08 4px)`,
                        pointerEvents: "none",
                      }} />
                      <div className="relative flex items-center justify-between" style={{ padding: "8px 12px", background: "#0d0b0bf0", borderBottom: `3px solid ${hac}` }}>
                        <h3 style={{ fontSize: "10px", color: hac, letterSpacing: "2px" }}>INVENTORY</h3>
                        <button
                          onClick={() => { playSfx('menuSelect'); setShowHutInventory(false); setHutTargetingItemId(null); }}
                          className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110"
                          style={{ border: `1px solid ${hac}50`, background: "transparent" }}
                        >
                          <X className="w-3 h-3" style={{ color: hac }} />
                        </button>
                      </div>

                      <div className="relative flex gap-0 px-3 pt-2">
                        {(["items", "gear"] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => { playSfx('menuSelect'); setHutInventoryTab(tab); setHutTargetingItemId(null); }}
                            style={{
                              fontFamily: "'Press Start 2P', cursive",
                              fontSize: "7px",
                              padding: "6px 12px",
                              border: `1px solid ${hac}`,
                              borderBottom: hutInventoryTab === tab ? "none" : `1px solid ${hac}`,
                              background: hutInventoryTab === tab ? hac : "transparent",
                              color: hutInventoryTab === tab ? "#0a0808" : `${hac}80`,
                              cursor: "pointer",
                            }}
                          >
                            {tab === "items" ? "ITEMS" : "GEAR"}
                          </button>
                        ))}
                      </div>

                      <div className="relative" style={{ padding: "8px 12px", maxHeight: "350px", overflowY: "auto" }}>
                        {hutInventoryTab === "items" && (
                          <div className="space-y-1.5">
                            {consumables.length === 0 ? (
                              <div style={{ textAlign: "center", padding: "24px 0" }}>
                                <p style={{ fontSize: "8px", color: `${hac}50` }}>No consumable items</p>
                              </div>
                            ) : (
                              groupConsumables(consumables).map(({ item, count, ids }) => {
                                const pl = state.player!;
                                const canUseOnPlayer = item.effect.type === "heal" && (
                                  (item.effect.stat === "hp" && pl.stats.hp < pl.stats.maxHp) ||
                                  (item.effect.stat === "mp" && pl.stats.mp < pl.stats.maxMp)
                                );
                                const canUseOnAny = canUseOnPlayer || pl.party.some(m =>
                                  item.effect.type === "heal" && (
                                    (item.effect.stat === "hp" && m.stats.hp < m.stats.maxHp) ||
                                    (item.effect.stat === "mp" && m.stats.mp < m.stats.maxMp)
                                  )
                                );
                                const isTargeting = hutTargetingItemId === item.name;
                                return (
                                  <div key={item.name} style={{ padding: "8px", background: "#0d0b0bf0", border: `1px solid ${hac}30` }}>
                                    <div className="flex items-center justify-between gap-2">
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: "8px", color: "#e8e0d0" }}>
                                          {item.name} <span style={{ color: `${hac}cc` }}>x{count}</span>
                                        </p>
                                        <p style={{ fontSize: "7px", color: `${hac}60`, marginTop: "2px" }}>{item.description}</p>
                                      </div>
                                      <button
                                        onClick={() => {
                                          playSfx('menuSelect');
                                          if (pl.party.length > 0) {
                                            setHutTargetingItemId(isTargeting ? null : item.name);
                                          } else {
                                            useItemOverworld(ids[0]);
                                          }
                                        }}
                                        disabled={!canUseOnAny}
                                        style={{
                                          fontFamily: "'Press Start 2P', cursive",
                                          fontSize: "7px",
                                          padding: "4px 8px",
                                          border: `1px solid ${isTargeting ? "#e8c030" : hac}60`,
                                          background: isTargeting ? "#e8c03020" : "transparent",
                                          color: isTargeting ? "#e8c030" : hac,
                                          cursor: canUseOnAny ? "pointer" : "default",
                                          opacity: canUseOnAny ? 1 : 0.4,
                                        }}
                                      >
                                        {isTargeting ? "CANCEL" : "USE"}
                                      </button>
                                    </div>
                                    {isTargeting && (
                                      <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: `1px solid ${hac}20` }}>
                                        <p style={{ fontSize: "7px", color: `${hac}50`, marginBottom: "4px" }}>Select target:</p>
                                        <button
                                          disabled={!canUseOnPlayer}
                                          onClick={() => { playSfx('menuSelect'); useItemOverworld(ids[0]); setHutTargetingItemId(null); }}
                                          style={{
                                            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "4px 8px", background: "#0a080820", border: `1px solid ${hac}15`,
                                            cursor: canUseOnPlayer ? "pointer" : "default", opacity: canUseOnPlayer ? 1 : 0.3,
                                            marginBottom: "3px", fontFamily: "'Press Start 2P', cursive",
                                          }}
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <span style={{ fontSize: "7px", color: hac }}>{pl.name}</span>
                                            <span style={{ fontSize: "6px", color: `${hac}50` }}>(You)</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            {item.effect.stat === "hp" && (
                                              <div className="flex items-center gap-1">
                                                <Heart style={{ width: 10, height: 10, color: "#ef4444" }} />
                                                <span style={{ fontSize: "7px", color: pl.stats.hp < pl.stats.maxHp ? "#fca5a5" : "#86efac" }}>
                                                  {pl.stats.hp}/{pl.stats.maxHp}
                                                </span>
                                              </div>
                                            )}
                                            {item.effect.stat === "mp" && (
                                              <div className="flex items-center gap-1">
                                                <Droplets style={{ width: 10, height: 10, color: "#60a5fa" }} />
                                                <span style={{ fontSize: "7px", color: pl.stats.mp < pl.stats.maxMp ? "#93c5fd" : "#86efac" }}>
                                                  {pl.stats.mp}/{pl.stats.maxMp}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </button>
                                        {pl.party.map((member, idx) => {
                                          const canUseOnMember = item.effect.type === "heal" && (
                                            (item.effect.stat === "hp" && member.stats.hp < member.stats.maxHp) ||
                                            (item.effect.stat === "mp" && member.stats.mp < member.stats.maxMp)
                                          );
                                          return (
                                            <button
                                              key={member.id}
                                              disabled={!canUseOnMember}
                                              onClick={() => { playSfx('menuSelect'); useItemOverworld(ids[0], idx); setHutTargetingItemId(null); }}
                                              style={{
                                                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: "4px 8px", background: "#0a080820", border: `1px solid ${hac}15`,
                                                cursor: canUseOnMember ? "pointer" : "default", opacity: canUseOnMember ? 1 : 0.3,
                                                marginBottom: "3px", fontFamily: "'Press Start 2P', cursive",
                                              }}
                                            >
                                              <span style={{ fontSize: "7px", color: "#e8e0d0" }}>{member.name}</span>
                                              <div className="flex items-center gap-1.5">
                                                {item.effect.stat === "hp" && (
                                                  <div className="flex items-center gap-1">
                                                    <Heart style={{ width: 10, height: 10, color: "#ef4444" }} />
                                                    <span style={{ fontSize: "7px", color: member.stats.hp < member.stats.maxHp ? "#fca5a5" : "#86efac" }}>
                                                      {member.stats.hp}/{member.stats.maxHp}
                                                    </span>
                                                  </div>
                                                )}
                                                {item.effect.stat === "mp" && (
                                                  <div className="flex items-center gap-1">
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

                        {hutInventoryTab === "gear" && (
                          <div className="space-y-1.5">
                            <p style={{ fontSize: "7px", color: `${hac}60`, textTransform: "uppercase", letterSpacing: "1px", padding: "0 4px" }}>Equipped</p>
                            {(["weapon", "armor", "accessory"] as const).map(slot => {
                              const item = state.player!.equipment[slot];
                              return (
                                <div key={slot} style={{ padding: "8px", background: "#0d0b0bf0", border: `1px solid ${hac}30` }}>
                                  <p style={{ fontSize: "7px", color: `${hac}60`, textTransform: "uppercase", letterSpacing: "1px" }}>{slot}</p>
                                  {item ? (
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: "8px", color: "#e8e0d0" }}>{item.name}</p>
                                        <p style={{ fontSize: "7px", color: `${hac}60`, marginTop: "2px" }}>{item.description}</p>
                                      </div>
                                      <button
                                        onClick={() => { playSfx('menuSelect'); unequipItem(slot); }}
                                        style={{
                                          fontFamily: "'Press Start 2P', cursive", fontSize: "7px", padding: "4px 8px",
                                          border: `1px solid ${hac}60`, background: "transparent", color: hac, cursor: "pointer",
                                        }}
                                      >
                                        UNEQUIP
                                      </button>
                                    </div>
                                  ) : (
                                    <p style={{ fontSize: "8px", color: `${hac}40`, fontStyle: "italic", marginTop: "2px" }}>Empty</p>
                                  )}
                                </div>
                              );
                            })}
                            {equipables.length > 0 && (
                              <>
                                <div style={{ borderTop: `1px solid ${hac}20`, marginTop: "4px", paddingTop: "6px" }}>
                                  <p style={{ fontSize: "7px", color: `${hac}60`, textTransform: "uppercase", letterSpacing: "1px", padding: "0 4px" }}>Unequipped</p>
                                </div>
                                {equipables.map(item => (
                                  <div key={item.id} style={{ padding: "8px", background: "#0d0b0bf0", border: `1px solid ${hac}30` }}>
                                    <div className="flex items-center justify-between gap-2">
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="flex items-center gap-1.5">
                                          <p style={{ fontSize: "8px", color: "#e8e0d0" }}>{item.name}</p>
                                          <span style={{ fontSize: "6px", padding: "1px 4px", border: `1px solid ${hac}30`, color: `${hac}80`, textTransform: "capitalize" }}>{item.type}</span>
                                        </div>
                                        <p style={{ fontSize: "7px", color: `${hac}60`, marginTop: "2px" }}>{item.description}</p>
                                      </div>
                                      <button
                                        onClick={() => { playSfx('menuSelect'); equipItem(item.id); }}
                                        style={{
                                          fontFamily: "'Press Start 2P', cursive", fontSize: "7px", padding: "4px 8px",
                                          border: `1px solid ${hac}60`, background: "transparent", color: hac, cursor: "pointer",
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
                      <div className="relative h-1" style={{ background: `linear-gradient(90deg, transparent, ${hac}40, transparent)` }} />
                    </div>
                  </div>
                );
              })()}

              {showOptions && (
                <div className="absolute inset-0 z-[400] flex items-center justify-center" style={{ background: "radial-gradient(ellipse at center, #c9a44a15 0%, rgba(0,0,0,0.85) 70%)" }}>
                  <div className="w-80 overflow-hidden relative" style={{
                    background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
                    border: `3px solid #c9a44a`,
                    boxShadow: `0 0 20px #c9a44a40, 0 0 60px #c9a44a15, inset 0 0 30px rgba(0,0,0,0.5)`,
                    fontFamily: "'Press Start 2P', cursive",
                    imageRendering: "pixelated" as any,
                  }}>
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, #c9a44a08 3px, #c9a44a08 4px)",
                      pointerEvents: "none",
                    }} />
                    <div className="relative flex items-center justify-between" style={{ padding: "8px 12px", background: "#0d0b0bf0", borderBottom: "3px solid #c9a44a" }}>
                      <h3 style={{ fontSize: "10px", color: "#c9a44a", letterSpacing: "2px" }}>OPTIONS</h3>
                      <button
                        onClick={() => { playSfx('menuSelect'); setShowOptions(false); }}
                        className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110"
                        style={{ border: "1px solid #c9a44a50", background: "transparent" }}
                      >
                        <X className="w-3 h-3" style={{ color: "#c9a44a" }} />
                      </button>
                    </div>
                    <div className="relative space-y-6" style={{ padding: "16px 12px" }}>
                      <div>
                        <label style={{ fontSize: "7px", color: "#c9a44a60", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>TEXT SPEED</label>
                        <div className="flex gap-2">
                          {(["slow", "medium", "fast"] as const).map(sp => (
                            <button
                              key={sp}
                              className="flex-1 py-2 text-[7px]"
                              style={{
                                fontFamily: "'Press Start 2P', cursive",
                                border: state.textSpeed === sp ? `2px solid #c9a44a` : `1px solid #c9a44a30`,
                                background: state.textSpeed === sp ? `#c9a44a25` : "#0d0b0bf0",
                                color: state.textSpeed === sp ? "#c9a44a" : "#c9a44a60",
                              }}
                              onClick={() => { playSfx('menuSelect'); setState(s => ({ ...s, textSpeed: sp })); }}
                            >
                              {sp.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: "7px", color: "#c9a44a60", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>MUSIC: {state.musicVolume}%</label>
                        <Slider
                          value={[state.musicVolume]}
                          max={100} step={1}
                          onValueChange={([v]: number[]) => setState(s => ({ ...s, musicVolume: v }))}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "7px", color: "#c9a44a60", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>SFX: {state.sfxVolume}%</label>
                        <Slider
                          value={[state.sfxVolume]}
                          max={100} step={1}
                          onValueChange={([v]: number[]) => setState(s => ({ ...s, sfxVolume: v }))}
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, transparent, #c9a44a40, transparent)" }} />
                  </div>
                </div>
              )}

              {showSaveScreen && state.player && (() => {
                const sac = "#c9a44a";
                const getSlotSave = (slotNum: number) => {
                  if (!saves) return null;
                  return saves.find(s => s.slotName === `Slot ${slotNum}`) || null;
                };
                return (
                  <div className="absolute inset-0 z-[300] flex items-center justify-center"
                    style={{ fontFamily: "'Press Start 2P', cursive", imageRendering: "pixelated" }}
                  >
                    <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${sac}15 0%, rgba(0,0,0,0.85) 70%)` }} />
                    <div className="absolute inset-0 pointer-events-none" style={{
                      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${sac}08 3px, ${sac}08 4px)`,
                    }} />
                    <div className="relative w-[340px] overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
                        border: `3px solid ${sac}`,
                        boxShadow: `0 0 20px ${sac}40, 0 0 60px ${sac}15, inset 0 0 30px rgba(0,0,0,0.5)`,
                      }}
                    >
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${sac}08 3px, ${sac}08 4px)`,
                        pointerEvents: "none",
                      }} />
                      <div className="relative px-4 pt-3 pb-2 flex items-center justify-between" style={{ background: "#0d0b0bf0", borderBottom: `3px solid ${sac}` }}>
                        <span style={{ fontSize: "10px", color: sac, letterSpacing: "2px" }}>SAVE GAME</span>
                        <button
                          className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110"
                          style={{ border: `1px solid ${sac}50`, background: "transparent" }}
                          onClick={() => { playSfx('menuSelect'); setShowSaveScreen(false); setSaveConfirmSlot(null); setSaveSuccessSlot(null); }}
                        >
                          <span style={{ fontSize: "8px", color: sac }}>✕</span>
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
                                background: isSuccess ? `${sac}25` : "#0d0b0bf0",
                                border: `1px solid ${isSuccess ? sac : `${sac}30`}`,
                                boxShadow: isSuccess ? `0 0 12px ${sac}30` : "none",
                              }}
                              onMouseEnter={e => {
                                if (!isSuccess) {
                                  (e.currentTarget as HTMLElement).style.background = `${sac}25`;
                                  (e.currentTarget as HTMLElement).style.borderColor = `${sac}80`;
                                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${sac}30, inset 0 0 8px ${sac}10`;
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isSuccess) {
                                  (e.currentTarget as HTMLElement).style.background = "#0d0b0bf0";
                                  (e.currentTarget as HTMLElement).style.borderColor = `${sac}30`;
                                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                }
                              }}
                              onClick={() => { if (!isSuccess) { playSfx('menuSelect'); setSaveConfirmSlot(slotNum); } }}
                            >
                              {isSuccess ? (
                                <div className="flex items-center gap-2">
                                  <span style={{ fontSize: "9px", color: sac }}>✓ SAVED!</span>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>SLOT {slotNum}</span>
                                    {slotSave && (
                                      <span style={{ fontSize: "6px", color: `${sac}60` }}>
                                        {new Date(slotSave.updatedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  {slotSave ? (
                                    <div style={{ marginTop: "4px" }}>
                                      <span style={{ fontSize: "7px", color: `${sac}60` }}>
                                        {(slotSave.playerData as any).name} · Lv.{(slotSave.playerData as any).level} · {(slotSave.playerData as any).element}
                                      </span>
                                    </div>
                                  ) : (
                                    <div style={{ marginTop: "4px" }}>
                                      <span style={{ fontSize: "7px", color: `${sac}40` }}>EMPTY SLOT</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <div className="relative px-4 py-2" style={{ borderTop: `1px solid ${sac}20` }}>
                        <button
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 transition-all"
                          style={{ border: `1px solid ${sac}30`, background: "#0d0b0bf0" }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = `${sac}25`;
                            (e.currentTarget as HTMLElement).style.borderColor = `${sac}80`;
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "#0d0b0bf0";
                            (e.currentTarget as HTMLElement).style.borderColor = `${sac}30`;
                          }}
                          onClick={() => { playSfx('menuSelect'); setShowSaveScreen(false); setSaveConfirmSlot(null); setSaveSuccessSlot(null); }}
                        >
                          <span style={{ fontSize: "8px", color: sac, letterSpacing: "1px" }}>← BACK</span>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${sac}40, transparent)` }} />
                    </div>
                    {saveConfirmSlot !== null && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
                        <div className="absolute inset-0 bg-black/60" onClick={() => setSaveConfirmSlot(null)} />
                        <div className="relative w-[260px] overflow-hidden"
                          style={{
                            background: "linear-gradient(180deg, #0a0808f8 0%, #151010fc 100%)",
                            border: `3px solid ${sac}`,
                            boxShadow: `0 0 30px ${sac}50, 0 0 80px ${sac}20, inset 0 0 30px rgba(0,0,0,0.5)`,
                          }}
                        >
                          <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${sac}08 3px, ${sac}08 4px)`,
                            pointerEvents: "none",
                          }} />
                          <div className="relative px-4 py-4 text-center">
                            <p style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px", lineHeight: "1.8" }}>
                              Save to Slot {saveConfirmSlot}?
                            </p>
                            {getSlotSave(saveConfirmSlot) && (
                              <p style={{ fontSize: "7px", color: `${sac}60`, marginTop: "6px" }}>
                                This will overwrite existing data
                              </p>
                            )}
                          </div>
                          <div className="relative px-3 pb-3 flex gap-2">
                            <button
                              className="flex-1 px-3 py-2 transition-all text-center"
                              style={{ border: `1px solid ${sac}`, background: `${sac}20` }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = `${sac}40`;
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${sac}40`;
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = `${sac}20`;
                                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                              }}
                              onClick={() => { playSfx('menuSelect'); handleSaveToSlot(saveConfirmSlot); }}
                            >
                              <span style={{ fontSize: "8px", color: sac, letterSpacing: "1px" }}>CONFIRM</span>
                            </button>
                            <button
                              className="flex-1 px-3 py-2 transition-all text-center"
                              style={{ border: `1px solid ${sac}30`, background: "#0d0b0bf0" }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = `${sac}15`;
                                (e.currentTarget as HTMLElement).style.borderColor = `${sac}60`;
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = "#0d0b0bf0";
                                (e.currentTarget as HTMLElement).style.borderColor = `${sac}30`;
                              }}
                              onClick={() => { playSfx('menuSelect'); setSaveConfirmSlot(null); }}
                            >
                              <span style={{ fontSize: "8px", color: `${sac}60`, letterSpacing: "1px" }}>CANCEL</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {hutTransitionIn && (
                <BattleTransition
                  direction="in"
                  onComplete={() => {
                    setHutTransitionIn(false);
                    setHutTransitionOut(true);
                    setScreen("overworld");
                  }}
                />
              )}
              {hutTransitionOut && (
                <BattleTransition
                  direction="out"
                  onComplete={() => setHutTransitionOut(false)}
                />
              )}
              {exitToMenuTransition && (
                <BattleTransition
                  direction="in"
                  onComplete={() => {
                    setExitToMenuTransition(false);
                    stopAll();
                    setMenuReveal(true);
                    setScreen("menu");
                  }}
                />
              )}
            </>
          );
        })();

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
              enemyColorVariant={lastContactedEnemyColorVariantRef.current}
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
              onEndBattle={(victory: boolean) => {
                stopJingle();
                if (!victory) {
                  fadeOutMusic(700);
                }
                setBattleExitTransition({ victory });
              }}
              onFlee={() => {
                stopJingle();
                setBattleExitTransition({ victory: false, fled: true });
              }}
              onRollLoot={rollLoot}
              onSetAnimating={setAnimating}
              onFinishPlayerTurn={finishPlayerTurn}
              onRepositionUnit={repositionUnit}
              onSpawnEnemy={spawnEnemy}
              regionTier={battleTier}
            />
            {battleEntryReveal && (
              <BattleTransition
                direction="out"
                elementColor={transitionElementColor}
                onComplete={() => {
                  setBattleEntryReveal(false);
                  killMusic();
                  playMusic("lava_region_battle");
                }}
              />
            )}
            {battleExitTransition && (
              <BattleTransition
                direction="in"
                elementColor={transitionElementColor}
                sfx="battleTransition"
                sfxPlaybackRate={2.0}
                onComplete={() => {
                  const v = battleExitTransition.victory;
                  const fled = battleExitTransition.fled;
                  setBattleExitTransition(null);
                  setPostBattleReveal(true);
                  if (fled) {
                    fleeBattle();
                  } else {
                    endBattle(v);
                  }
                  if (sideScrollBattleActiveRef.current) {
                    const enemyIdx = lastContactedEnemyIdxRef.current;
                    if (enemyIdx !== null) {
                      setSideScrollCtx(ctx => ctx ? {
                        ...ctx,
                        defeatedEnemyIndices: [...ctx.defeatedEnemyIndices, enemyIdx],
                        fleeEnemyIndex: fled ? enemyIdx : null,
                      } : null);
                    }
                    lastContactedEnemyIdxRef.current = null;
                    sideScrollBattleActiveRef.current = false;
                  }
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
              onAllocate={handleAllocateStat}
            />
            {postBattleReveal && (
              <BattleTransition
                direction="out"
                elementColor={transitionElementColor}
                onComplete={() => {
                  setPostBattleReveal(false);
                }}
              />
            )}
            {levelUpExitFade && (
              <BattleTransition
                direction="in"
                onComplete={() => {
                  setLevelUpExitFade(false);
                  setOverworldFromLevelUp(true);
                  pendingLevelUpActionRef.current?.();
                  pendingLevelUpActionRef.current = null;
                }}
              />
            )}
          </>
        );

      case "perkSelect":
        if (!state.player || !state.pendingLevelUp) return null;
        return (
          <>
            <PerkSelectScreen
              player={state.player}
              pendingLevelUp={state.pendingLevelUp}
              onSelect={handleSelectPerk}
            />
            {levelUpExitFade && (
              <BattleTransition
                direction="in"
                onComplete={() => {
                  setLevelUpExitFade(false);
                  setOverworldFromLevelUp(true);
                  pendingLevelUpActionRef.current?.();
                  pendingLevelUpActionRef.current = null;
                }}
              />
            )}
          </>
        );

      case "shop":
        if (!state.player || !state.currentShop) return null;
        return (
          <ShopScreen
            player={state.player}
            items={state.currentShop}
            onBuy={buyItem}
            onSell={sellItem}
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
            onBack={() => setScreen("hut")}
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
        {overworldReveal !== "off" && (
          <div
            className="fixed inset-0 bg-black pointer-events-none"
            style={{
              zIndex: 500,
              opacity: overworldReveal === "black" ? 1 : 0,
              transition: overworldReveal === "fading" ? "opacity 1500ms ease" : "none",
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      {renderScreen()}
      {overworldReveal !== "off" && (
        <div
          className="fixed inset-0 bg-black pointer-events-none"
          style={{
            zIndex: 500,
            opacity: overworldReveal === "black" ? 1 : 0,
            transition: overworldReveal === "fading" ? "opacity 1500ms ease" : "none",
          }}
        />
      )}
    </div>
  );
}

function App() {
  if (window.location.pathname === "/sfx-test") {
    return <SfxTestPage />;
  }
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
