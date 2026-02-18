import { useState, useCallback, useRef } from "react";
import type { GameState, PlayerCharacter, BattleState, ShopItem, Element, Spell, Buff, PartyMemberDef, PartyMember, BattlePartyMember, PendingLevelUp } from "@shared/schema";
import { createNewPlayer, xpForLevel, calculateDamage, checkDodge, initBattle, getEnemiesForNode, getShopItems, REGIONS, PERKS, PARTY_CHARACTERS, STARTER_CHARACTERS, getRegionTier, buildTurnQueue, getNewSpellsAtLevel } from "./gameData";
import type { EnergyColor, EnergyShape } from "@shared/schema";

const INITIAL_STATE: GameState = {
  screen: "menu",
  player: null,
  battle: null,
  currentShop: null,
  pendingLevelUp: null,
  pendingLevelUpQueue: [],
  pendingUnlocks: [],
  pendingUnlock: null,
  textSpeed: "medium",
  musicVolume: 70,
  sfxVolume: 80,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const setScreen = useCallback((screen: GameState["screen"]) => {
    setState(s => ({ ...s, screen }));
  }, []);

  const createCharacter = useCallback((starterCharId: string, name: string, color: EnergyColor, shape: EnergyShape) => {
    const starterDef = STARTER_CHARACTERS.find(c => c.id === starterCharId);
    if (!starterDef) return;
    const player = createNewPlayer(starterDef, name, color, shape);
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

      const tier = getRegionTier(s.player.currentRegion, s.player.regionBossDefeats || {});
      const enemies = getEnemiesForNode(node, region, tier);
      const battle = initBattle(enemies);
      battle.playerHp = s.player.stats.hp;
      battle.playerMp = s.player.stats.mp;
      battle.phase = "playerTurn";

      battle.party = s.player.party.map(pm => ({
        id: pm.id,
        name: pm.name,
        element: pm.element,
        level: pm.level,
        stats: { ...pm.stats },
        currentHp: pm.stats.hp,
        currentMp: pm.stats.mp,
        defending: false,
        spriteId: pm.spriteId,
        learnedSpells: pm.learnedSpells || [],
      }));

      const queue = buildTurnQueue(s.player.stats.agi || 10, battle.party, battle.enemies);
      battle.turnQueue = queue;
      battle.turnQueueIndex = 0;
      if (queue.length > 0) {
        const first = queue[0];
        if (first.type === "player") battle.phase = "playerTurn";
        else if (first.type === "party") {
          battle.phase = "partyTurn";
          battle.activePartyIndex = first.index;
        } else {
          battle.phase = "enemyTurn";
        }
      }

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
        battle.lastElementLabel = undefined;
      } else {
        const weaponElement = s.player.equipment.weapon?.element;
        const critMod = s.player.perks.includes("lightning_crit") ? 0.10 : 0;
        const { damage, isCrit, elementLabel } = calculateDamage(buffedStats, target.stats, false, weaponElement, target.element, 1.0, critMod);
        target.currentHp = Math.max(0, target.currentHp - damage);
        battle.animation = isCrit ? "critical" : "attack";
        battle.lastElementLabel = elementLabel || undefined;
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

  const advanceTurnQueue = useCallback((battle: BattleState, player: PlayerCharacter): BattleState => {
    if (battle.phase === "victory" || battle.phase === "defeat") return battle;

    let nextIdx = battle.turnQueueIndex + 1;

    while (nextIdx < battle.turnQueue.length) {
      const entry = battle.turnQueue[nextIdx];
      if (entry.type === "player" && battle.playerHp > 0) break;
      if (entry.type === "party" && battle.party[entry.index]?.currentHp > 0) break;
      if (entry.type === "enemy" && battle.enemies[entry.index]?.currentHp > 0) break;
      nextIdx++;
    }

    if (nextIdx >= battle.turnQueue.length) {
      const queue = buildTurnQueue(player.stats.agi || 10, battle.party, battle.enemies);
      battle.turnQueue = queue;
      battle.turnQueueIndex = 0;
      battle.turnCount++;

      battle.defending = false;
      battle.party = battle.party.map(p => ({ ...p, defending: false }));

      if (player.perks.includes("water_regen") && battle.playerHp > 0) {
        battle.playerHp = Math.min(player.stats.maxHp, battle.playerHp + 5);
        battle.log = [...battle.log, "Tidal Heal restores 5 HP!"];
      }

      battle.buffs = battle.buffs
        .map(b => ({ ...b, turnsRemaining: b.turnsRemaining - 1 }))
        .filter(b => b.turnsRemaining > 0);

      let startIdx = 0;
      while (startIdx < queue.length) {
        const entry = queue[startIdx];
        if (entry.type === "player" && battle.playerHp > 0) break;
        if (entry.type === "party" && battle.party[entry.index]?.currentHp > 0) break;
        if (entry.type === "enemy" && battle.enemies[entry.index]?.currentHp > 0) break;
        startIdx++;
      }
      battle.turnQueueIndex = startIdx;
      nextIdx = startIdx;
    } else {
      battle.turnQueueIndex = nextIdx;
    }

    if (nextIdx < battle.turnQueue.length) {
      const entry = battle.turnQueue[nextIdx];
      if (entry.type === "player") {
        battle.phase = "playerTurn";
      } else if (entry.type === "party") {
        battle.phase = "partyTurn";
        battle.activePartyIndex = entry.index;
      } else {
        battle.phase = "enemyTurn";
      }
    }

    return battle;
  }, []);

  const finishPlayerTurn = useCallback(() => {
    setState(s => {
      if (!s.battle || !s.player) return s;
      const battle = { ...s.battle };
      if (battle.phase === "victory" || battle.phase === "defeat") return s;
      return { ...s, battle: advanceTurnQueue(battle, s.player) };
    });
  }, [advanceTurnQueue]);

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

        let lastLabel = "";
        for (const target of targets) {
          if (!target || target.currentHp <= 0) continue;
          const skillMult = spell.effect.damageMultiplier || 1;
          const critMod = s.player.perks.includes("lightning_crit") ? 0.10 : 0;
          const { damage, isCrit, elementLabel } = calculateDamage(buffedStats, target.stats, true, s.player.element, target.element, skillMult, critMod);
          target.currentHp = Math.max(0, target.currentHp - damage);
          battle.log = [...battle.log, `${spell.name} deals ${damage}${isCrit ? " CRIT" : ""} to ${target.name}!${elementLabel ? ` ${elementLabel}` : ""}`];
          if (elementLabel) lastLabel = elementLabel;
        }
        battle.lastElementLabel = lastLabel || undefined;

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
      if (!s.battle || s.battle.phase !== "animating" || !s.player) return s;
      const battle = { ...s.battle };
      battle.defending = true;
      const mpRestore = Math.floor(s.player.stats.maxMp * 0.1);
      battle.playerMp = Math.min(s.player.stats.maxMp, battle.playerMp + mpRestore);
      battle.log = [...battle.log, `You raise your guard! Restored ${mpRestore} MP.`];
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
        const stat = (item.effect.stat === "hp" || item.effect.stat === "mp") ? item.effect.stat : "hp";
        if (stat === "hp") {
          battle.playerHp = Math.min(s.player.stats.maxHp, battle.playerHp + (item.effect.amount || 0));
          battle.log = [...battle.log, `Used ${item.name}! Healed ${item.effect.amount} HP.`];
        } else {
          battle.playerMp = Math.min(s.player.stats.maxMp, battle.playerMp + (item.effect.amount || 0));
          battle.log = [...battle.log, `Used ${item.name}! Restored ${item.effect.amount} MP.`];
        }
        battle.lastItemUsed = { stat, amount: item.effect.amount || 0, targetType: "player", targetIndex: -1 };
      }

      battle.phase = "enemyTurn";
      battle.animation = "item";
      return { ...s, battle, player: { ...s.player, inventory: newInventory } };
    });
  }, []);

  const useItemOverworld = useCallback((itemId: string, targetPartyIndex?: number) => {
    setState(s => {
      if (!s.player || s.screen !== "inventory") return s;
      const itemIndex = s.player.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return s;
      const item = s.player.inventory[itemIndex];
      if (item.type !== "consumable") return s;

      const newInventory = [...s.player.inventory];
      newInventory.splice(itemIndex, 1);

      if (targetPartyIndex !== undefined && targetPartyIndex >= 0 && s.player.party[targetPartyIndex]) {
        const newParty = s.player.party.map((m, idx) => {
          if (idx !== targetPartyIndex) return m;
          const newMemberStats = { ...m.stats };
          if (item.effect.type === "heal") {
            if (item.effect.stat === "hp") {
              newMemberStats.hp = Math.min(newMemberStats.maxHp, newMemberStats.hp + (item.effect.amount || 0));
            } else if (item.effect.stat === "mp") {
              newMemberStats.mp = Math.min(newMemberStats.maxMp, newMemberStats.mp + (item.effect.amount || 0));
            }
          }
          return { ...m, stats: newMemberStats };
        });
        return { ...s, player: { ...s.player, party: newParty, inventory: newInventory } };
      }

      const newStats = { ...s.player.stats };
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

  const partyMemberAttack = useCallback((partyIndex: number, targetIndex: number) => {
    setState(s => {
      if (!s.battle || !s.player || s.battle.phase !== "partyTurn") return s;

      const battle = { ...s.battle, enemies: s.battle.enemies.map(e => ({ ...e })), party: s.battle.party.map(p => ({ ...p })) };
      const member = battle.party[partyIndex];
      if (!member || member.currentHp <= 0) return s;

      const target = battle.enemies[targetIndex];
      if (!target || target.currentHp <= 0) return s;

      const dodged = checkDodge(target.stats);
      if (dodged) {
        battle.log = [...battle.log, `${target.name} dodged ${member.name}'s attack!`];
        battle.lastElementLabel = undefined;
      } else {
        const { damage, isCrit, elementLabel } = calculateDamage(member.stats, target.stats, false, undefined, target.element);
        target.currentHp = Math.max(0, target.currentHp - damage);
        battle.lastElementLabel = elementLabel || undefined;
        battle.log = [...battle.log, `${member.name} deals ${damage}${isCrit ? " CRIT" : ""} damage to ${target.name}!${elementLabel ? ` ${elementLabel}` : ""}`];
      }

      const allDead = battle.enemies.every(e => e.currentHp <= 0);
      if (allDead) {
        battle.phase = "victory";
        battle.animation = "victory";
      }

      return { ...s, battle };
    });
  }, []);

  const partyMemberDefend = useCallback((partyIndex: number) => {
    setState(s => {
      if (!s.battle || s.battle.phase !== "partyTurn") return s;
      const battle = { ...s.battle, party: s.battle.party.map(p => ({ ...p })) };
      const member = battle.party[partyIndex];
      if (!member || member.currentHp <= 0) return s;
      member.defending = true;
      battle.log = [...battle.log, `${member.name} is defending!`];
      return { ...s, battle };
    });
  }, []);

  const partyMemberCastSpell = useCallback((partyIndex: number, spell: Spell, targetIndex?: number) => {
    setState(s => {
      if (!s.battle || !s.player || s.battle.phase !== "partyTurn") return s;
      const battle = { ...s.battle, enemies: s.battle.enemies.map(e => ({ ...e })), party: s.battle.party.map(p => ({ ...p })) };
      const member = battle.party[partyIndex];
      if (!member || member.currentHp <= 0) return s;

      if (member.currentMp < spell.mpCost) {
        battle.log = [...battle.log, `${member.name} doesn't have enough MP!`];
        return { ...s, battle };
      }
      member.currentMp -= spell.mpCost;

      if (spell.type === "damage") {
        let lastLabel = "";
        if (spell.targetType === "allEnemies") {
          battle.enemies.forEach(e => {
            if (e.currentHp <= 0) return;
            const { damage, isCrit, elementLabel } = calculateDamage(member.stats, e.stats, true, spell.element || member.element, e.element, spell.effect.damageMultiplier);
            e.currentHp = Math.max(0, e.currentHp - damage);
            battle.log = [...battle.log, `${member.name}'s ${spell.name} deals ${damage}${isCrit ? " CRIT" : ""} to ${e.name}!${elementLabel ? ` ${elementLabel}` : ""}`];
            if (elementLabel) lastLabel = elementLabel;
          });
        } else if (targetIndex !== undefined) {
          const target = battle.enemies[targetIndex];
          if (target && target.currentHp > 0) {
            const { damage, isCrit, elementLabel } = calculateDamage(member.stats, target.stats, true, spell.element || member.element, target.element, spell.effect.damageMultiplier);
            target.currentHp = Math.max(0, target.currentHp - damage);
            battle.log = [...battle.log, `${member.name}'s ${spell.name} deals ${damage}${isCrit ? " CRIT" : ""} to ${target.name}!${elementLabel ? ` ${elementLabel}` : ""}`];
            if (elementLabel) lastLabel = elementLabel;
          }
        }
        battle.lastElementLabel = lastLabel || undefined;
      } else if (spell.type === "heal") {
        const amount = spell.effect.amount || 0;
        member.currentHp = Math.min(member.stats.maxHp, member.currentHp + amount);
        battle.log = [...battle.log, `${member.name} heals for ${amount} HP!`];
      } else if (spell.type === "buff") {
        battle.buffs = [...battle.buffs, {
          name: spell.name,
          stat: spell.effect.stat || "atk",
          amount: spell.effect.amount || 0,
          turnsRemaining: spell.effect.duration || 2,
        }];
        battle.log = [...battle.log, `${member.name} casts ${spell.name}!`];
      }

      const allDead = battle.enemies.every(e => e.currentHp <= 0);
      if (allDead) {
        battle.phase = "victory";
        battle.animation = "victory";
      }

      return { ...s, battle };
    });
  }, []);

  const partyMemberUseItem = useCallback((partyIndex: number, itemId: string) => {
    setState(s => {
      if (!s.battle || !s.player || s.battle.phase !== "partyTurn") return s;
      const battle = { ...s.battle, party: s.battle.party.map(p => ({ ...p })) };
      const member = battle.party[partyIndex];
      if (!member || member.currentHp <= 0) return s;

      const itemIndex = s.player.inventory.findIndex(i => i.id === itemId && i.type === "consumable");
      if (itemIndex === -1) return s;
      const item = s.player.inventory[itemIndex];

      const newInventory = [...s.player.inventory];
      newInventory.splice(itemIndex, 1);

      if (item.effect.type === "heal") {
        const stat = (item.effect.stat === "hp" || item.effect.stat === "mp") ? item.effect.stat : "hp";
        if (stat === "hp") {
          const heal = item.effect.amount || 0;
          if (member.currentHp <= 0) {
            battle.log = [...battle.log, `${member.name} is unconscious!`];
            return { ...s, battle };
          }
          member.currentHp = Math.min(member.stats.maxHp, member.currentHp + heal);
          battle.log = [...battle.log, `${member.name} uses ${item.name}, restores ${heal} HP!`];
        } else {
          battle.playerMp = Math.min(s.player.stats.maxMp, battle.playerMp + (item.effect.amount || 0));
          battle.log = [...battle.log, `${member.name} uses ${item.name}, restores ${item.effect.amount} MP!`];
        }
        battle.lastItemUsed = { stat, amount: item.effect.amount || 0, targetType: "party", targetIndex: partyIndex };
      }

      return { ...s, battle, player: { ...s.player, inventory: newInventory } };
    });
  }, []);

  const advancePartyTurn = useCallback(() => {
    setState(s => {
      if (!s.battle || !s.player || s.battle.phase !== "partyTurn") return s;
      const battle = { ...s.battle };
      if (battle.phase === "victory" || battle.phase === "defeat") return s;
      return { ...s, battle: advanceTurnQueue(battle, s.player) };
    });
  }, [advanceTurnQueue]);

  const finishPartyTurn = useCallback(() => {
    setState(s => {
      if (!s.battle || !s.player || s.battle.phase !== "partyTurn") return s;
      const battle = { ...s.battle };
      if (battle.phase === "victory" || battle.phase === "defeat") return s;
      return { ...s, battle: advanceTurnQueue(battle, s.player) };
    });
  }, [advanceTurnQueue]);

  const lastEnemyDodgedRef = useRef(false);
  const lastEnemyTargetRef = useRef<{ type: "player" | "party"; index: number }>({ type: "player", index: -1 });

  const enemyAttack = useCallback((enemyIndex: number, preSelectedTarget?: { type: "player" | "party"; index: number }) => {
    lastEnemyDodgedRef.current = false;
    lastEnemyTargetRef.current = { type: "player", index: -1 };
    setState(s => {
      if (!s.battle || !s.player || s.battle.phase !== "enemyTurn") return s;

      const battle = { ...s.battle, enemies: s.battle.enemies.map(e => ({ ...e })), party: s.battle.party.map(p => ({ ...p })) };
      const buffedStats = getBuffedStats(s.player.stats, battle.buffs);

      const enemy = battle.enemies[enemyIndex];
      if (!enemy || enemy.currentHp <= 0) return s;

      let chosenTarget: { type: "player" | "party"; index: number };
      if (preSelectedTarget) {
        chosenTarget = preSelectedTarget;
      } else {
        const aliveParty = battle.party.filter(p => p.currentHp > 0);
        const totalTargets = 1 + aliveParty.length;
        const targetRoll = Math.floor(Math.random() * totalTargets);
        if (targetRoll === 0 || aliveParty.length === 0) {
          chosenTarget = { type: "player", index: -1 };
        } else {
          const partyTarget = aliveParty[targetRoll - 1];
          const partyIdx = battle.party.findIndex(p => p.id === partyTarget.id);
          chosenTarget = { type: "party", index: partyIdx };
        }
      }

      if (chosenTarget.type === "player") {
        lastEnemyTargetRef.current = { type: "player", index: -1 };
        const dodged = checkDodge(buffedStats);
        if (dodged) {
          battle.log = [...battle.log, `You dodged ${enemy.name}'s attack!`];
          lastEnemyDodgedRef.current = true;
        } else {
          const { damage, isCrit, elementLabel } = calculateDamage(enemy.stats, buffedStats, Math.random() > 0.5, enemy.element, s.player?.element);
          const actualDamage = battle.defending ? Math.floor(damage * 0.5) : damage;
          battle.playerHp = Math.max(0, battle.playerHp - actualDamage);
          battle.log = [...battle.log, `${enemy.name} deals ${actualDamage}${battle.defending ? " (blocked)" : ""}${isCrit ? " CRIT" : ""} damage!${elementLabel ? ` ${elementLabel}` : ""}`];
          battle.animation = "enemyAttack";
        }
      } else {
        const partyIdx = chosenTarget.index;
        const partyTarget = battle.party[partyIdx];
        lastEnemyTargetRef.current = { type: "party", index: partyIdx };

        if (!partyTarget || partyTarget.currentHp <= 0) {
          lastEnemyTargetRef.current = { type: "player", index: -1 };
          const dodged = checkDodge(buffedStats);
          if (dodged) {
            battle.log = [...battle.log, `You dodged ${enemy.name}'s attack!`];
            lastEnemyDodgedRef.current = true;
          } else {
            const { damage, isCrit, elementLabel } = calculateDamage(enemy.stats, buffedStats, Math.random() > 0.5, enemy.element, s.player?.element);
            const actualDamage = battle.defending ? Math.floor(damage * 0.5) : damage;
            battle.playerHp = Math.max(0, battle.playerHp - actualDamage);
            battle.log = [...battle.log, `${enemy.name} deals ${actualDamage}${battle.defending ? " (blocked)" : ""}${isCrit ? " CRIT" : ""} damage!${elementLabel ? ` ${elementLabel}` : ""}`];
            battle.animation = "enemyAttack";
          }
        } else {
          const dodged = checkDodge(partyTarget.stats);
          if (dodged) {
            battle.log = [...battle.log, `${partyTarget.name} dodged ${enemy.name}'s attack!`];
            lastEnemyDodgedRef.current = true;
          } else {
            const { damage, isCrit, elementLabel } = calculateDamage(enemy.stats, partyTarget.stats, Math.random() > 0.5, enemy.element, partyTarget.element);
            const actualDamage = partyTarget.defending ? Math.floor(damage * 0.5) : damage;
            battle.party[partyIdx].currentHp = Math.max(0, battle.party[partyIdx].currentHp - actualDamage);
            battle.log = [...battle.log, `${enemy.name} deals ${actualDamage}${isCrit ? " CRIT" : ""} to ${partyTarget.name}!${elementLabel ? ` ${elementLabel}` : ""}`];
            battle.animation = "enemyAttack";
          }
        }
      }

      return { ...s, battle };
    });
    return { dodged: lastEnemyDodgedRef.current, target: lastEnemyTargetRef.current };
  }, []);

  const enemyTurnEnd = useCallback(() => {
    setState(s => {
      if (!s.battle || !s.player || (s.battle.phase !== "enemyTurn" && s.battle.phase !== "animating")) return s;

      const battle = { ...s.battle, buffs: [...s.battle.buffs], party: s.battle.party.map(p => ({ ...p })) };

      if (battle.playerHp <= 0) {
        battle.phase = "defeat";
        battle.animation = "defeat";
        battle.defending = false;
        battle.turnCount++;
        return { ...s, battle };
      }

      return { ...s, battle: advanceTurnQueue(battle, s.player) };
    });
  }, [advanceTurnQueue]);

  const endBattle = useCallback((victory: boolean) => {
    setState(s => {
      if (!s.player || !s.battle) return s;

      if (!victory) {
        return {
          ...s,
          screen: "overworld",
          battle: null,
          player: {
            ...s.player,
            stats: { ...s.player.stats, hp: s.player.stats.maxHp, mp: s.player.stats.maxMp },
            party: s.player.party.map(m => ({ ...m, stats: { ...m.stats, hp: m.stats.maxHp, mp: m.stats.maxMp } })),
          },
        };
      }

      const totalXp = s.battle.enemies.reduce((sum, e) => sum + e.xpReward, 0);
      const totalGold = s.battle.enemies.reduce((sum, e) => sum + e.goldReward, 0);
      const levelUpQueue: PendingLevelUp[] = [];

      let newXp = s.player.xp + totalXp;
      let newLevel = s.player.level;
      let xpToNext = s.player.xpToNext;

      const baseStats = { ...s.player.stats };
      while (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel++;
        xpToNext = xpForLevel(newLevel);
        baseStats.maxHp += 5;
        baseStats.hp = baseStats.maxHp;
        baseStats.maxMp += 3;
        baseStats.mp = baseStats.maxMp;
        baseStats.atk += 1;
        baseStats.def += 1;
        baseStats.agi += 1;
        baseStats.int += 1;
        baseStats.luck += 1;
        const playerNewSpells = getNewSpellsAtLevel(s.player.element, newLevel);
        levelUpQueue.push({
          characterType: "player",
          characterIndex: 0,
          characterName: s.player.name,
          characterSpriteId: s.player.spriteId,
          characterElement: s.player.element,
          newSpells: playerNewSpells.map(sp => sp.id),
          statsToAllocate: 2,
          perksToChoose: 1,
          newLevel,
        });
      }

      const newCleared = [...s.player.clearedNodes];
      if (!newCleared.includes(s.player.currentNode)) {
        newCleared.push(s.player.currentNode);
      }

      const isBossNode = REGIONS[s.player.currentRegion].nodes.find(n => n.id === s.player!.currentNode)?.type === "boss";
      const regionBossDefeats = { ...(s.player.regionBossDefeats || {}) };
      let currentRegion = s.player.currentRegion;
      let finalCleared = newCleared;
      let currentNode = s.player.currentNode;
      let pendingUnlocks: PartyMemberDef[] = [];
      let pendingUnlock: PartyMemberDef | null = null;

      if (isBossNode) {
        const regionKey = String(s.player.currentRegion);
        const prevDefeats = regionBossDefeats[regionKey] || 0;
        regionBossDefeats[regionKey] = prevDefeats + 1;
        const newDefeats = regionBossDefeats[regionKey];

        if (s.player.currentRegion === 0) {
          const alreadyInParty = new Set(s.player.party.map(p => p.id));
          const unchosen = STARTER_CHARACTERS.filter(c => c.id !== s.player!.starterCharacterId && !alreadyInParty.has(c.id));
          if (unchosen.length > 0) {
            if (unchosen.length === 1) {
              pendingUnlocks = [unchosen[0]];
              pendingUnlock = unchosen[0];
            } else {
              pendingUnlocks = unchosen;
              pendingUnlock = null;
            }
          }
        }

        if (newDefeats >= 3) {
          if (currentRegion < REGIONS.length - 1) {
            currentRegion++;
          }
          const newRegion = REGIONS[currentRegion];
          currentNode = newRegion.nodes[0].id;
          finalCleared = newCleared.filter(nId => {
            const inNewRegion = newRegion.nodes.some(n => n.id === nId);
            return !inNewRegion;
          });
        } else {
          const thisRegion = REGIONS[s.player.currentRegion];
          currentNode = thisRegion.nodes[0].id;
          const regionNodeIds = thisRegion.nodes.map(n => n.id);
          finalCleared = newCleared.filter(nId => !regionNodeIds.includes(nId));
        }
      }

      const syncedParty = s.player.party.map((pm, partyIndex) => {
        const bpm = s.battle!.party.find(bp => bp.id === pm.id);
        const isAlive = bpm ? bpm.currentHp > 0 : pm.stats.hp > 0;

        let memberXp = (pm.xp || 0) + (isAlive ? totalXp : 0);
        let memberLevel = pm.level;
        let memberXpToNext = pm.xpToNext || xpForLevel(pm.level);
        const memberStats = { ...pm.stats };

        if (bpm) {
          memberStats.hp = Math.max(0, Math.min(memberStats.maxHp, bpm.currentHp));
          memberStats.mp = Math.max(0, Math.min(memberStats.maxMp, bpm.currentMp));
        }

        while (memberXp >= memberXpToNext && isAlive) {
          memberXp -= memberXpToNext;
          memberLevel++;
          memberXpToNext = xpForLevel(memberLevel);
          memberStats.maxHp += 4;
          memberStats.hp = memberStats.maxHp;
          memberStats.maxMp += 2;
          memberStats.mp = memberStats.maxMp;
          memberStats.atk += 1;
          memberStats.def += 1;
          memberStats.agi += 1;
          memberStats.int += 1;
          memberStats.luck += 1;
          const memberNewSpells = getNewSpellsAtLevel(pm.element, memberLevel);
          levelUpQueue.push({
            characterType: "party",
            characterIndex: partyIndex,
            characterName: pm.name,
            characterSpriteId: pm.spriteId,
            characterElement: pm.element,
            newSpells: memberNewSpells.map(sp => sp.id),
            statsToAllocate: 2,
            perksToChoose: 1,
            newLevel: memberLevel,
          });
        }

        return {
          ...pm,
          xp: memberXp,
          xpToNext: memberXpToNext,
          level: memberLevel,
          stats: memberStats,
          learnedSpells: pm.learnedSpells || [],
        };
      });

      const pendingLevelUp: PendingLevelUp | null = levelUpQueue.length > 0 ? levelUpQueue[0] : null;
      const pendingLevelUpQueue = levelUpQueue.slice(1);

      const updatedPlayer: PlayerCharacter = {
        ...s.player,
        xp: newXp,
        xpToNext,
        level: newLevel,
        gold: s.player.gold + totalGold,
        clearedNodes: finalCleared,
        currentRegion,
        currentNode,
        regionBossDefeats,
        party: syncedParty,
        stats: {
          ...baseStats,
          hp: Math.min(baseStats.maxHp, s.battle.playerHp),
          mp: Math.min(baseStats.maxMp, s.battle.playerMp),
        },
      };

      const nextScreen = pendingUnlock
        ? "partyUnlock"
        : (pendingLevelUp ? "levelUp" : "overworld");

      return {
        ...s,
        player: updatedPlayer,
        battle: null,
        screen: nextScreen,
        pendingLevelUp,
        pendingLevelUpQueue,
        pendingUnlocks,
        pendingUnlock,
      };
    });
  }, []);

  const allocateStat = useCallback((stat: keyof import("@shared/schema").PlayerStats) => {
    setState(s => {
      if (!s.player || !s.pendingLevelUp || s.pendingLevelUp.statsToAllocate <= 0) return s;

      const isParty = s.pendingLevelUp.characterType === "party";
      const targetStats = isParty
        ? { ...s.player.party[s.pendingLevelUp.characterIndex].stats }
        : { ...s.player.stats };

      if (stat === "hp" || stat === "maxHp") {
        targetStats.maxHp += 10;
        targetStats.hp = targetStats.maxHp;
      } else if (stat === "mp" || stat === "maxMp") {
        targetStats.maxMp += 5;
        targetStats.mp = targetStats.maxMp;
      } else {
        (targetStats as any)[stat] = ((targetStats as any)[stat] as number) + 2;
      }

      const remaining = s.pendingLevelUp!.statsToAllocate - 1;
      let pendingLevelUp: PendingLevelUp | null;
      let pendingLevelUpQueue = [...s.pendingLevelUpQueue];
      let nextScreen: GameState["screen"];

      if (remaining > 0) {
        pendingLevelUp = { ...s.pendingLevelUp!, statsToAllocate: remaining };
        nextScreen = "levelUp";
      } else if (s.pendingLevelUp!.perksToChoose > 0) {
        pendingLevelUp = { ...s.pendingLevelUp!, statsToAllocate: 0 };
        nextScreen = "perkSelect";
      } else if (pendingLevelUpQueue.length > 0) {
        pendingLevelUp = pendingLevelUpQueue[0];
        pendingLevelUpQueue = pendingLevelUpQueue.slice(1);
        nextScreen = "levelUp";
      } else {
        pendingLevelUp = null;
        nextScreen = "overworld";
      }

      let updatedPlayer;
      const grantSpells = remaining <= 0 && s.pendingLevelUp!.newSpells && s.pendingLevelUp!.newSpells.length > 0;
      if (isParty) {
        const newParty = s.player.party.map((m, idx) => {
          if (idx !== s.pendingLevelUp!.characterIndex) return m;
          const updated = { ...m, stats: targetStats };
          if (grantSpells) {
            const existing = new Set(m.learnedSpells || []);
            const combined = [...(m.learnedSpells || [])];
            for (const spId of s.pendingLevelUp!.newSpells!) {
              if (!existing.has(spId)) combined.push(spId);
            }
            updated.learnedSpells = combined;
          }
          return updated;
        });
        updatedPlayer = { ...s.player, party: newParty };
      } else {
        updatedPlayer = { ...s.player, stats: targetStats };
        if (grantSpells) {
          const existing = new Set(updatedPlayer.learnedSpells || []);
          const combined = [...(updatedPlayer.learnedSpells || [])];
          for (const spId of s.pendingLevelUp!.newSpells!) {
            if (!existing.has(spId)) combined.push(spId);
          }
          updatedPlayer.learnedSpells = combined;
        }
      }

      return {
        ...s,
        player: updatedPlayer,
        pendingLevelUp,
        pendingLevelUpQueue,
        screen: nextScreen,
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

      let pendingLevelUp: PendingLevelUp | null = null;
      let pendingLevelUpQueue = [...s.pendingLevelUpQueue];
      let nextScreen: GameState["screen"] = "overworld";

      if (pendingLevelUpQueue.length > 0) {
        pendingLevelUp = pendingLevelUpQueue[0];
        pendingLevelUpQueue = pendingLevelUpQueue.slice(1);
        nextScreen = "levelUp";
      }

      return {
        ...s,
        player: { ...s.player, perks: newPerks, stats: newStats },
        pendingLevelUp,
        pendingLevelUpQueue,
        screen: nextScreen,
      };
    });
  }, []);

  const openShaman = useCallback((nodeId: number) => {
    setState(s => {
      if (!s.player) return s;
      const region = REGIONS[s.player.currentRegion];
      const node = region.nodes.find(n => n.id === nodeId);
      if (!node) return s;
      return { ...s, player: { ...s.player, currentNode: nodeId }, screen: "shaman" };
    });
  }, []);

  const learnShamanSpell = useCallback((characterType: "player" | "party", characterIndex: number, spellId: string) => {
    setState(s => {
      if (!s.player || s.player.gold < 50) return s;
      let updatedPlayer = { ...s.player, gold: s.player.gold - 50 };

      if (characterType === "player") {
        const existing = new Set(updatedPlayer.learnedSpells || []);
        if (existing.has(spellId)) return s;
        updatedPlayer.learnedSpells = [...(updatedPlayer.learnedSpells || []), spellId];
      } else {
        const newParty = updatedPlayer.party.map((m, idx) => {
          if (idx !== characterIndex) return m;
          const existing = new Set(m.learnedSpells || []);
          if (existing.has(spellId)) return m;
          return { ...m, learnedSpells: [...(m.learnedSpells || []), spellId] };
        });
        updatedPlayer.party = newParty;
      }

      return { ...s, player: updatedPlayer };
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
          party: s.player.party.map(m => ({
            ...m,
            stats: { ...m.stats, hp: m.stats.maxHp, mp: m.stats.maxMp },
          })),
          clearedNodes: s.player.clearedNodes.includes(s.player.currentNode)
            ? s.player.clearedNodes
            : [...s.player.clearedNodes, s.player.currentNode],
        },
      };
    });
  }, []);

  const loadGame = useCallback((playerData: PlayerCharacter) => {
    const normalizedPlayer = {
      ...playerData,
      party: (playerData.party || []).map(pm => ({
        ...pm,
        xp: pm.xp || 0,
        xpToNext: pm.xpToNext || xpForLevel(pm.level),
        learnedSpells: pm.learnedSpells || [],
      })),
      defeatedBosses: playerData.defeatedBosses || [],
      spriteId: playerData.spriteId || "samurai",
      starterCharacterId: playerData.starterCharacterId || "samurai_wind",
      regionBossDefeats: playerData.regionBossDefeats || {},
      learnedSpells: playerData.learnedSpells || [],
    };
    setState(s => ({ ...s, player: normalizedPlayer, screen: "overworld" }));
  }, []);

  const confirmUnlock = useCallback((customName: string) => {
    setState(s => {
      if (!s.player || !s.pendingUnlock) return s;

      const def = s.pendingUnlock;
      const scale = 1 + (s.player.level - 1) * 0.15;
      const newMember: PartyMember = {
        id: def.id,
        name: customName.trim() || def.name,
        className: def.className,
        element: def.element,
        level: s.player.level,
        stats: {
          hp: Math.floor(def.baseStats.hp * scale),
          maxHp: Math.floor(def.baseStats.maxHp * scale),
          mp: Math.floor(def.baseStats.mp * scale),
          maxMp: Math.floor(def.baseStats.maxMp * scale),
          atk: Math.floor(def.baseStats.atk * scale),
          def: Math.floor(def.baseStats.def * scale),
          agi: Math.floor(def.baseStats.agi * scale),
          int: Math.floor(def.baseStats.int * scale),
          luck: Math.floor(def.baseStats.luck * scale),
        },
        spriteId: def.spriteId,
        xp: 0,
        xpToNext: xpForLevel(s.player.level),
        learnedSpells: [],
      };

      const newParty = [...s.player.party, newMember];
      const nextScreen = s.pendingLevelUp ? "levelUp" : "overworld";

      return {
        ...s,
        player: { ...s.player, party: newParty },
        pendingUnlock: null,
        pendingUnlocks: [],
        screen: nextScreen,
      };
    });
  }, []);

  const changeRegion = useCallback((regionId: number) => {
    setState(s => {
      if (!s.player) return s;
      const targetRegion = REGIONS[regionId];
      if (!targetRegion) return s;
      const firstNode = targetRegion.nodes[0];
      return {
        ...s,
        player: {
          ...s.player,
          currentRegion: regionId,
          currentNode: firstNode.id,
        },
      };
    });
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
    partyMemberAttack,
    partyMemberDefend,
    partyMemberCastSpell,
    partyMemberUseItem,
    advancePartyTurn,
    finishPartyTurn,
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
    confirmUnlock,
    changeRegion,
    openShaman,
    learnShamanSpell,
  };
}

function getBuffedStats(base: import("@shared/schema").PlayerStats, buffs: Buff[]): import("@shared/schema").PlayerStats {
  const result = { ...base };
  for (const buff of buffs) {
    (result as any)[buff.stat] += buff.amount;
  }
  return result;
}
