import { useState, useEffect, useCallback } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGameState } from "@/lib/gameState";
import { getRegionForTier, getRegionTier } from "@/lib/gameData";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { setSfxVolume } from "@/lib/sfx";
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
    buyItem, equipItem, restAtNode, loadGame, setAnimating, finishPlayerTurn,
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

  const handleSave = async () => {
    if (!state.player) return;
    try {
      await apiRequest("POST", "/api/saves", {
        slotName: state.player.name,
        playerData: state.player,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
      toast({ title: "Game Saved", description: "Your progress has been saved." });
    } catch {
      toast({ title: "Save Failed", description: "Could not save game.", variant: "destructive" });
    }
  };

  const [showPartyManagement, setShowPartyManagement] = useState(false);

  const handleContinue = () => {
    if (saves && saves.length > 0) {
      const latestSave = saves[0];
      loadGame(latestSave.playerData as PlayerCharacter);
    }
  };

  const renderScreen = () => {
    switch (state.screen) {
      case "menu":
        return (
          <MainMenu
            onNewGame={() => setScreen("creation")}
            onContinue={handleContinue}
            hasSave={hasSave}
            textSpeed={state.textSpeed}
            musicVolume={state.musicVolume}
            sfxVolume={state.sfxVolume}
            showDamageNumbers={state.showDamageNumbers}
            onSettingsChange={(settings) => setState(s => ({ ...s, ...settings }))}
          />
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
              onNodeSelect={startBattle}
              onShopOpen={(nodeId: number) => {
                updatePlayer({ currentNode: nodeId, clearedNodes: state.player!.clearedNodes.includes(nodeId) ? state.player!.clearedNodes : [...state.player!.clearedNodes, nodeId] });
                openShop();
              }}
              onRest={(nodeId: number) => {
                updatePlayer({ currentNode: nodeId });
                restAtNode();
                toast({ title: "Rested", description: "HP and MP fully restored!" });
              }}
              onShamanVisit={openShaman}
              onInventory={() => setScreen("inventory")}
              onPartyManage={() => setShowPartyManagement(true)}
              onSave={handleSave}
              onRegionChange={changeRegion}
            />
            {showPartyManagement && state.player && (
              <div className="absolute inset-0 z-50">
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
          </>
        );

      case "battle":
        if (!state.player || !state.battle) return null;
        const battleTier = getRegionTier(state.player.currentRegion, state.player.regionBossDefeats || {});
        const battleRegion = getRegionForTier(state.player.currentRegion, battleTier);
        return (
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
            onEndBattle={endBattle}
            onSetAnimating={setAnimating}
            onFinishPlayerTurn={finishPlayerTurn}
          />
        );

      case "levelUp":
        if (!state.player || !state.pendingLevelUp) return null;
        return (
          <LevelUpScreen
            player={state.player}
            pendingLevelUp={state.pendingLevelUp}
            statsRemaining={state.pendingLevelUp.statsToAllocate}
            onAllocate={allocateStat}
          />
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
