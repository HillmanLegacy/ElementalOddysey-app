import { useState, useCallback, useRef } from "react";
import type { GameState, PlayerCharacter, BattleState, ShopItem, Element, Spell, Buff } from "@shared/schema";
import { createNewPlayer, xpForLevel, calculateDamage, checkDodge, initBattle, getEnemiesForNode, getShopItems, REGIONS, PERKS } from "./gameData";
import type { EnergyColor, EnergyShape } from "@shared/schema";

const INITIAL_STATE: GameState = {
  screen: "menu",
  player: null,
  battle: null,
  currentShop: null,
  pendingLevelUp: null,
  textSpeed: "medium",
  musicVolume: 70,
  sfxVolume: 80,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const setScreen = useCallback((screen: GameState["screen"]) => {
    setState(s => ({ ...s, screen }));
  }, []);

  const createCharacter = useCallback((name: string, color: EnergyColor, shape: EnergyShape, element: Element) => {
    const player = createNewPlayer(name, color, shape, element);
    setState(s => ({ ...s, player, screen: "overworld" }));
  }, []);

  const updatePlayer = useCallback((updates: Partial<PlayerCharacter>) => {
    setState(s => {
      if (!s.player) return s;
      return { ...s, player: { ...s.player, ...updates } };
    });
  }, []);

  const startBattle = useCallback((nodeId: number) => {
    setState(s => {
      if (!s.player) return s;
      const region = REGIONS[s.player.currentRegion];
      const node = region.nodes.find(n => n.id === nodeId);
      if (!node || (node.type !== "battle" && node.type !== "boss")) return s;

      const enemies = getEnemiesForNode(node, region);
      const battle = initBattle(enemies);
      battle.playerHp = s.player.stats.hp;
      battle.playerMp = s.player.stats.mp;
      battle.phase = "playerTurn";

      return { ...s, battle, screen: "battle", player: { ...s.player, currentNode: nodeId } };
    });
  }, []);

  const playerAttack = useCallback((targetIndex: number) => {
    setState(s => {
      if (!s.battle || !s.player || s.battle.phase !== "animating") return s;

      const battle = { ...s.battle, enemies: s.battle.enemies.map(e => ({ ...e })) };
      const target = battle.enemies[targetIndex];
      if (!target || target.currentHp <= 0) return s;

      const buffedStats = getBuffedStats(s.player.stats, battle.buffs);

      const dodged = checkDodge(target.stats);
      if (dodged) {
        battle.log = [...battle.log, `${target.name} dodged the attack!`];
        battle.animation = "dodge";
      } else {
        const weaponElement = s.player.equipment.weapon?.element || s.player.element;
        const { damage, isCrit, elementLabel } = calculateDamage(buffedStats, target.stats, false, weaponElement, target.element);
        target.currentHp = Math.max(0, target.currentHp - damage);
        battle.animation = isCrit ? "critical" : "attack";
        battle.log = [...battle.log, `You deal ${damage}${isCrit ? " CRITICAL" : ""} damage to ${target.name}!${elementLabel ? ` ${elementLabel}` : ""}`];

        if (s.player.perks.includes("shadow_lifesteal")) {
          const heal = Math.floor(damage * 0.1);
          battle.playerHp = Math.min(s.player.stats.maxHp, battle.playerHp + heal);
          battle.log = [...battle.log, `Soul Drain heals ${heal} HP!`];
        }
      }

      const allDead = battle.enemies.every(e => e.currentHp <= 0);
      if (allDead) {
        battle.phase = "victory";
        battle.animation = "victory";
      }

      return { ...s, battle };
    });
  }, []);

  const finishPlayerTurn = useCallback(() => {
    setState(s => {
      if (!s.battle || !s.player) return s;
      const battle = { ...s.battle };

      if (battle.phase === "victory" || battle.phase === "defeat") return s;

      battle.phase = "enemyTurn";
      return { ...s, battle };
    });
  }, []);

  const castSpell = useCallback((spell: Spell, targetIndex?: number) => {
    setState(s => {
      if (!s.battle || !s.player || s.battle.phase !== "animating") return s;
      if (s.battle.playerMp < spell.mpCost) {
        return { ...s, battle: { ...s.battle, log: [...s.battle.log, "Not enough MP!"], phase: "playerTurn" } };
      }

      const battle = { ...s.battle, enemies: s.battle.enemies.map(e => ({ ...e })), buffs: [...s.battle.buffs] };
      battle.playerMp -= spell.mpCost;
      battle.animation = "magic";

      if (spell.type === "buff" && spell.effect.stat && spell.effect.amount && spell.effect.duration) {
        battle.buffs.push({
          name: spell.name,
          stat: spell.effect.stat,
          amount: spell.effect.amount,
          turnsRemaining: spell.effect.duration,
        });
        battle.log = [...battle.log, `${spell.name}! +${spell.effect.amount} ${spell.effect.stat.toUpperCase()} for ${spell.effect.duration} turns!`];
      } else if (spell.type === "heal" && spell.effect.stat === "hp" && spell.effect.amount) {
        battle.playerHp = Math.min(s.player.stats.maxHp, battle.playerHp + spell.effect.amount);
        battle.log = [...battle.log, `${spell.name}! Restored ${spell.effect.amount} HP!`];
      } else if (spell.type === "damage") {
        const buffedStats = getBuffedStats(s.player.stats, battle.buffs);
        const hasAoe = spell.targetType === "allEnemies" || (s.player.perks.includes("fire_aoe") && s.player.element === "Fire");
        const targets = hasAoe ? battle.enemies.filter(e => e.currentHp > 0) : (targetIndex !== undefined ? [battle.enemies[targetIndex]] : []);

        for (const target of targets) {
          if (!target || target.currentHp <= 0) continue;
          const { damage, isCrit, elementLabel } = calculateDamage(buffedStats, target.stats, true, s.player.element, target.element);
          const mult = spell.effect.damageMultiplier || 1;
          const boosted = Math.floor(damage * mult);
          target.currentHp = Math.max(0, target.currentHp - boosted);
          battle.log = [...battle.log, `${spell.name} deals ${boosted}${isCrit ? " CRIT" : ""} to ${target.name}!${elementLabel ? ` ${elementLabel}` : ""}`];
        }

        if (spell.id === "holy_light") {
          battle.playerHp = Math.min(s.player.stats.maxHp, battle.playerHp + 15);
          battle.log = [...battle.log, `Holy Light heals 15 HP!`];
        }
      }

      const allDead = battle.enemies.every(e => e.currentHp <= 0);
      if (allDead) {
        battle.phase = "victory";
      }

      return { ...s, battle };
    });
  }, []);

  const playerDefend = useCallback(() => {
    setState(s => {
      if (!s.battle || s.battle.phase !== "animating") return s;
      const battle = { ...s.battle };
      battle.defending = true;
      battle.log = [...battle.log, "You raise your guard!"];
      battle.animation = "defend";
      return { ...s, battle };
    });
  }, []);

  const setAnimating = useCallback(() => {
    setState(s => {
      if (!s.battle) return s;
      return { ...s, battle: { ...s.battle, phase: "animating" } };
    });
  }, []);

  const useItem = useCallback((itemId: string) => {
    setState(s => {
      if (!s.battle || !s.player || s.battle.phase !== "playerTurn") return s;
      const itemIndex = s.player.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return s;

      const item = s.player.inventory[itemIndex];
      const battle = { ...s.battle };
      const newInventory = [...s.player.inventory];
      newInventory.splice(itemIndex, 1);

      if (item.effect.type === "heal") {
        if (item.effect.stat === "hp") {
          battle.playerHp = Math.min(s.player.stats.maxHp, battle.playerHp + (item.effect.amount || 0));
          battle.log = [...battle.log, `Used ${item.name}! Healed ${item.effect.amount} HP.`];
        } else if (item.effect.stat === "mp") {
          battle.playerMp = Math.min(s.player.stats.maxMp, battle.playerMp + (item.effect.amount || 0));
          battle.log = [...battle.log, `Used ${item.name}! Restored ${item.effect.amount} MP.`];
        }
      }

      battle.phase = "enemyTurn";
      battle.animation = "item";
      return { ...s, battle, player: { ...s.player, inventory: newInventory } };
    });
  }, []);

  const useItemOverworld = useCallback((itemId: string) => {
    setState(s => {
      if (!s.player || s.screen !== "inventory") return s;
      const itemIndex = s.player.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return s;
      const item = s.player.inventory[itemIndex];
      if (item.type !== "consumable") return s;

      const newStats = { ...s.player.stats };
      const newInventory = [...s.player.inventory];
      newInventory.splice(itemIndex, 1);

      if (item.effect.type === "heal") {
        if (item.effect.stat === "hp") {
          newStats.hp = Math.min(newStats.maxHp, newStats.hp + (item.effect.amount || 0));
        } else if (item.effect.stat === "mp") {
          newStats.mp = Math.min(newStats.maxMp, newStats.mp + (item.effect.amount || 0));
        }
      }

      return { ...s, player: { ...s.player, stats: newStats, inventory: newInventory } };
    });
  }, []);

  const lastEnemyDodgedRef = useRef(false);

  const enemyAttack = useCallback((enemyIndex: number) => {
    lastEnemyDodgedRef.current = false;
    setState(s => {
      if (!s.battle || !s.player || s.battle.phase !== "enemyTurn") return s;

      const battle = { ...s.battle, enemies: s.battle.enemies.map(e => ({ ...e })) };
      const buffedStats = getBuffedStats(s.player.stats, battle.buffs);
      let hp = battle.playerHp;

      const enemy = battle.enemies[enemyIndex];
      if (!enemy || enemy.currentHp <= 0) return s;

      const dodged = checkDodge(buffedStats);
      if (dodged) {
        battle.log = [...battle.log, `You dodged ${enemy.name}'s attack!`];
        lastEnemyDodgedRef.current = true;
      } else {
        const { damage, isCrit, elementLabel } = calculateDamage(enemy.stats, buffedStats, Math.random() > 0.5, enemy.element, s.player?.element);
        const actualDamage = battle.defending ? Math.floor(damage * 0.5) : damage;
        hp = Math.max(0, hp - actualDamage);
        battle.log = [...battle.log, `${enemy.name} deals ${actualDamage}${battle.defending ? " (blocked)" : ""}${isCrit ? " CRIT" : ""} damage!${elementLabel ? ` ${elementLabel}` : ""}`];
        battle.animation = "enemyAttack";
      }

      battle.playerHp = hp;
      return { ...s, battle };
    });
    return lastEnemyDodgedRef.current;
  }, []);

  const enemyTurnEnd = useCallback(() => {
    setState(s => {
      if (!s.battle || !s.player || (s.battle.phase !== "enemyTurn" && s.battle.phase !== "animating")) return s;

      const battle = { ...s.battle, buffs: [...s.battle.buffs] };
      let hp = battle.playerHp;

      if (hp <= 0) {
        battle.phase = "defeat";
        battle.animation = "defeat";
        battle.defending = false;
        battle.turnCount++;
        return { ...s, battle };
      }

      if (s.player.perks.includes("water_regen")) {
        hp = Math.min(s.player.stats.maxHp, hp + 5);
        battle.log = [...battle.log, "Tidal Heal restores 5 HP!"];
      }

      battle.buffs = battle.buffs
        .map(b => ({ ...b, turnsRemaining: b.turnsRemaining - 1 }))
        .filter(b => {
          if (b.turnsRemaining <= 0) {
            battle.log = [...battle.log, `${b.name} wore off.`];
            return false;
          }
          return true;
        });

      battle.playerHp = hp;
      battle.defending = false;
      battle.turnCount++;
      battle.phase = "playerTurn";

      return { ...s, battle };
    });
  }, []);

  const endBattle = useCallback((victory: boolean) => {
    setState(s => {
      if (!s.player || !s.battle) return s;

      if (!victory) {
        return { ...s, screen: "overworld", battle: null, player: { ...s.player, stats: { ...s.player.stats, hp: s.player.stats.maxHp, mp: s.player.stats.maxMp } } };
      }

      const totalXp = s.battle.enemies.reduce((sum, e) => sum + e.xpReward, 0);
      const totalGold = s.battle.enemies.reduce((sum, e) => sum + e.goldReward, 0);
      let newXp = s.player.xp + totalXp;
      let newLevel = s.player.level;
      let xpToNext = s.player.xpToNext;
      let pendingLevelUp = null;

      const baseStats = { ...s.player.stats };
      while (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel++;
        xpToNext = xpForLevel(newLevel);
        pendingLevelUp = { statsToAllocate: 2, perksToChoose: 1 };
        baseStats.maxHp += 5;
        baseStats.hp = baseStats.maxHp;
        baseStats.maxMp += 3;
        baseStats.mp = baseStats.maxMp;
        baseStats.atk += 1;
        baseStats.def += 1;
        baseStats.agi += 1;
        baseStats.int += 1;
        baseStats.luck += 1;
      }

      const newCleared = [...s.player.clearedNodes];
      if (!newCleared.includes(s.player.currentNode)) {
        newCleared.push(s.player.currentNode);
      }

      const isBossNode = REGIONS[s.player.currentRegion].nodes.find(n => n.id === s.player!.currentNode)?.type === "boss";
      let currentRegion = s.player.currentRegion;
      if (isBossNode && currentRegion < REGIONS.length - 1) {
        currentRegion++;
      }

      const updatedPlayer: PlayerCharacter = {
        ...s.player,
        xp: newXp,
        xpToNext,
        level: newLevel,
        gold: s.player.gold + totalGold,
        clearedNodes: newCleared,
        currentRegion,
        stats: {
          ...baseStats,
          hp: Math.min(baseStats.maxHp, s.battle.playerHp),
          mp: Math.min(baseStats.maxMp, s.battle.playerMp),
        },
      };

      return {
        ...s,
        player: updatedPlayer,
        battle: null,
        screen: pendingLevelUp ? "levelUp" : "overworld",
        pendingLevelUp,
      };
    });
  }, []);

  const allocateStat = useCallback((stat: keyof import("@shared/schema").PlayerStats) => {
    setState(s => {
      if (!s.player || !s.pendingLevelUp || s.pendingLevelUp.statsToAllocate <= 0) return s;

      const newStats = { ...s.player.stats };
      if (stat === "hp" || stat === "maxHp") {
        newStats.maxHp += 10;
        newStats.hp = newStats.maxHp;
      } else if (stat === "mp" || stat === "maxMp") {
        newStats.maxMp += 5;
        newStats.mp = newStats.maxMp;
      } else {
        (newStats as any)[stat] = ((newStats as any)[stat] as number) + 2;
      }

      const remaining = s.pendingLevelUp!.statsToAllocate - 1;
      const pendingLevelUp = remaining > 0 ? { ...s.pendingLevelUp!, statsToAllocate: remaining } : (s.pendingLevelUp!.perksToChoose > 0 ? { statsToAllocate: 0, perksToChoose: s.pendingLevelUp!.perksToChoose } : null);

      return {
        ...s,
        player: { ...s.player, stats: newStats },
        pendingLevelUp,
        screen: pendingLevelUp ? (pendingLevelUp.statsToAllocate === 0 ? "perkSelect" : "levelUp") : "overworld",
      };
    });
  }, []);

  const selectPerk = useCallback((perkId: string) => {
    setState(s => {
      if (!s.player || !s.pendingLevelUp) return s;

      const perk = PERKS.find(p => p.id === perkId);
      if (!perk) return s;

      const newPerks = [...s.player.perks, perkId];
      const newStats = { ...s.player.stats };
      if (perk.effect.stat && perk.effect.amount) {
        (newStats as any)[perk.effect.stat] += perk.effect.amount;
        if (perk.effect.stat === "maxHp") newStats.hp = newStats.maxHp;
        if (perk.effect.stat === "maxMp") newStats.mp = newStats.maxMp;
      }

      return {
        ...s,
        player: { ...s.player, perks: newPerks, stats: newStats },
        pendingLevelUp: null,
        screen: "overworld",
      };
    });
  }, []);

  const openShop = useCallback(() => {
    setState(s => {
      if (!s.player) return s;
      const region = REGIONS[s.player.currentRegion];
      const items = getShopItems(region);
      return { ...s, currentShop: items, screen: "shop" };
    });
  }, []);

  const buyItem = useCallback((shopItem: ShopItem) => {
    setState(s => {
      if (!s.player || !s.currentShop) return s;
      if (s.player.gold < shopItem.price) return s;

      const newInventory = [...s.player.inventory, { ...shopItem, id: `${shopItem.id}_${Date.now()}` }];
      const newShop = s.currentShop!.map(si =>
        si.id === shopItem.id ? { ...si, stock: si.stock - 1 } : si
      ).filter(si => si.stock > 0);

      return {
        ...s,
        player: { ...s.player, gold: s.player.gold - shopItem.price, inventory: newInventory },
        currentShop: newShop,
      };
    });
  }, []);

  const equipItem = useCallback((itemId: string) => {
    setState(s => {
      if (!s.player) return s;
      const itemIndex = s.player.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return s;

      const item = s.player.inventory[itemIndex];
      if (item.type !== "weapon" && item.type !== "armor" && item.type !== "accessory") return s;

      const slot = item.type as "weapon" | "armor" | "accessory";
      const currentEquipped = s.player.equipment[slot];
      const newInventory = [...s.player.inventory];
      newInventory.splice(itemIndex, 1);
      if (currentEquipped) newInventory.push(currentEquipped);

      const newStats = { ...s.player.stats };
      if (currentEquipped?.effect.stat && currentEquipped.effect.amount) {
        (newStats as any)[currentEquipped.effect.stat] -= currentEquipped.effect.amount;
      }
      if (item.effect.stat && item.effect.amount) {
        (newStats as any)[item.effect.stat] += item.effect.amount;
      }

      return {
        ...s,
        player: {
          ...s.player,
          inventory: newInventory,
          equipment: { ...s.player.equipment, [slot]: item },
          stats: newStats,
        },
      };
    });
  }, []);

  const restAtNode = useCallback(() => {
    setState(s => {
      if (!s.player) return s;
      return {
        ...s,
        player: {
          ...s.player,
          stats: { ...s.player.stats, hp: s.player.stats.maxHp, mp: s.player.stats.maxMp },
          clearedNodes: s.player.clearedNodes.includes(s.player.currentNode)
            ? s.player.clearedNodes
            : [...s.player.clearedNodes, s.player.currentNode],
        },
      };
    });
  }, []);

  const loadGame = useCallback((playerData: PlayerCharacter) => {
    setState(s => ({ ...s, player: playerData, screen: "overworld" }));
  }, []);

  return {
    state,
    setState,
    setScreen,
    createCharacter,
    updatePlayer,
    startBattle,
    playerAttack,
    castSpell,
    playerDefend,
    useItem,
    useItemOverworld,
    enemyAttack,
    enemyTurnEnd,
    endBattle,
    allocateStat,
    selectPerk,
    openShop,
    buyItem,
    equipItem,
    restAtNode,
    loadGame,
    setAnimating,
    finishPlayerTurn,
  };
}

function getBuffedStats(base: import("@shared/schema").PlayerStats, buffs: Buff[]): import("@shared/schema").PlayerStats {
  const result = { ...base };
  for (const buff of buffs) {
    (result as any)[buff.stat] += buff.amount;
  }
  return result;
}
