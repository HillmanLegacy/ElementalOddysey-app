import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ParticleCanvas from "./ParticleCanvas";
import SpriteAnimator from "./SpriteAnimator";
import type { PlayerCharacter, BattleState, Spell } from "@shared/schema";
import { ELEMENT_COLORS, getPlayerSpells } from "@/lib/gameData";
import { Swords, Shield, Sparkles, Package, Heart, Droplets, Trophy, Skull, Target, ArrowLeft, Zap } from "lucide-react";

import { playSfx } from "@/lib/sfx";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import samuraiAttack from "@/assets/images/samurai-attack.png";
import samuraiHurt from "@/assets/images/samurai-hurt.png";
import sfxFireBurst from "@/assets/images/sfx-fire-burst.png";
import smearH1 from "@/assets/images/smear-h1.png";
import smearH2 from "@/assets/images/smear-h2.png";
import smearH3 from "@/assets/images/smear-h3.png";
import smearV1 from "@/assets/images/smear-v1.png";
import smearV2 from "@/assets/images/smear-v2.png";
import smearV3 from "@/assets/images/smear-v3.png";
import demonIdle from "@/assets/images/demon-idle.png";
import demonAttack from "@/assets/images/demon-attack.png";
import demonHurt from "@/assets/images/demon-hurt.png";
import demonDeath from "@/assets/images/demon-death.png";
import demonFireball from "@/assets/images/demon-fireball.png";

import fireSlimeImg from "@/assets/images/enemy-fire-slime.png";
import aquaSlimeImg from "@/assets/images/enemy-aqua-slime.png";
import stormWolfImg from "@/assets/images/enemy-storm-wolf.png";
import stoneGolemImg from "@/assets/images/enemy-stone-golem.png";
import darkShadeImg from "@/assets/images/enemy-dark-shade.png";
import sparkBugImg from "@/assets/images/enemy-spark-bug.png";
import frostBatImg from "@/assets/images/enemy-frost-bat.png";
import frostLizardIdle from "@/assets/images/frost-lizard-idle.png";
import frostLizardAttack from "@/assets/images/frost-lizard-attack.png";
import frostLizardHurt from "@/assets/images/frost-lizard-hurt.png";
import frostLizardRun from "@/assets/images/frost-lizard-run.png";
import jotemIdle from "@/assets/images/jotem-idle.png";
import jotemWalk from "@/assets/images/jotem-walk.png";
import jotemAttack from "@/assets/images/jotem-attack.png";
import jotemHurt from "@/assets/images/jotem-hurt.png";
import jotemDeath from "@/assets/images/jotem-death.png";
import jotemSlash from "@/assets/images/jotem-slash.png";
import lightWispImg from "@/assets/images/enemy-light-wisp.png";
import deepKrakenImg from "@/assets/images/boss-deep-kraken.png";
import shadowLordImg from "@/assets/images/boss-shadow-lord.png";
import crystalTitanImg from "@/assets/images/boss-crystal-titan.png";

import dragonLordIdle from "@/assets/images/dragonlord-idle.png";
import dragonLordWalk from "@/assets/images/dragonlord-walk.png";
import dragonLordAttack from "@/assets/images/dragonlord-attack.png";
import dragonLordHurt from "@/assets/images/dragonlord-hurt.png";
import dragonLordDeath from "@/assets/images/dragonlord-death.png";

const ENEMY_SPRITES: Record<string, string> = {
  slime_fire: fireSlimeImg,
  slime_water: aquaSlimeImg,
  wolf_wind: stormWolfImg,
  golem_earth: stoneGolemImg,
  wisp_light: lightWispImg,
  shade: darkShadeImg,
  spark_bug: sparkBugImg,
  frost_bat: frostBatImg,
  frost_lizard: frostLizardIdle,
  jotem: jotemIdle,
  kraken: deepKrakenImg,
  shadow_lord: shadowLordImg,
  crystal_titan: crystalTitanImg,
};

interface BattleScreenProps {
  player: PlayerCharacter;
  battle: BattleState;
  onAttack: (targetIndex: number) => void;
  onCastSpell: (spell: Spell, targetIndex?: number) => void;
  onDefend: () => void;
  onUseItem: (itemId: string) => void;
  onEnemyAttack: (enemyIndex: number) => boolean;
  onEnemyTurnEnd: () => void;
  onEndBattle: (victory: boolean) => void;
  onSetAnimating: () => void;
  onFinishPlayerTurn: () => void;
}

type AnimPhase = "idle" | "runToEnemy" | "attacking" | "runBack" | "casting" | "hurt" | "defending" | "fujinSlice";

export default function BattleScreen({
  player, battle, onAttack, onCastSpell, onDefend, onUseItem, onEnemyAttack, onEnemyTurnEnd, onEndBattle, onSetAnimating, onFinishPlayerTurn,
}: BattleScreenProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [showSpells, setShowSpells] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [enemyHitIdx, setEnemyHitIdx] = useState<number | null>(null);
  const [playerFlash, setPlayerFlash] = useState(false);
  const [fireHitSfx, setFireHitSfx] = useState(false);
  const [enemyAnimStates, setEnemyAnimStates] = useState<Record<number, "idle" | "attack" | "hurt" | "death" | "walk" | "walkBack" | "slash">>({});
  const [fireballAnim, setFireballAnim] = useState<{ fromX: number; fromY: number; active: boolean } | null>(null);
  const [bossOffset, setBossOffset] = useState<{ x: number; y: number } | null>(null);
  const [darkMagicSfx, setDarkMagicSfx] = useState(false);
  const [frostBreathAnim, setFrostBreathAnim] = useState<{ fromX: number; fromY: number; active: boolean } | null>(null);
  const [frostHitSfx, setFrostHitSfx] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; text: string; x: number; y: number; color: string }[]>([]);
  const [pendingTargetIdx, setPendingTargetIdx] = useState<number | null>(null);
  const [fujinSliceActive, setFujinSliceActive] = useState(false);
  const [fujinSlashes, setFujinSlashes] = useState<{ id: number; x: number; y: number; rotation: number; delay: number; sheet: string; frames: number; fw: number }[]>([]);
  const [fujinZoom, setFujinZoom] = useState(false);
  const [fujinTargetIdx, setFujinTargetIdx] = useState<number | null>(null);
  const [fujinDashPhase, setFujinDashPhase] = useState<"none" | "windup" | "dash" | "strike" | "fadeout" | "return">("none");
  const fujinSlashId = useRef(0);
  const damageIdRef = useRef(0);
  const prevPhaseRef = useRef(battle.phase);
  const prevLogLenRef = useRef(battle.log.length);
  const playerSpriteRef = useRef<HTMLDivElement>(null);
  const enemyTurnTimers = useRef<number[]>([]);

  const spells = getPlayerSpells(player);
  const consumables = player.inventory.filter(i => i.type === "consumable");
  const elementColor = ELEMENT_COLORS[player.element];
  const hpPercent = (battle.playerHp / player.stats.maxHp) * 100;
  const mpPercent = (battle.playerMp / player.stats.maxMp) * 100;
  const isLowHp = hpPercent < 25;
  const latestLog = battle.log.slice(-3);

  const spawnDamageNumber = useCallback((text: string, x: number, y: number, color: string) => {
    const id = damageIdRef.current++;
    setDamageNumbers(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1200);
  }, []);

  const handleAttackTarget = useCallback((targetIdx: number) => {
    setSelectedAction(null);
    setPendingTargetIdx(targetIdx);
    onSetAnimating();
    setAnimPhase("runToEnemy");
  }, [onSetAnimating]);

  const startFujinSliceRef = useRef<((targetIdx: number, spell: Spell) => void) | null>(null);

  const handleSpellTarget = useCallback((targetIdx: number) => {
    if (!selectedSpell) return;
    if (selectedSpell.animation === "fujinSlice" && startFujinSliceRef.current) {
      startFujinSliceRef.current(targetIdx, selectedSpell);
      return;
    }
    setSelectedAction(null);
    setPendingTargetIdx(targetIdx);
    onSetAnimating();
    setAnimPhase("casting");
    playSfx("magicRing", 0.6);
    onCastSpell(selectedSpell, targetIdx);
    setSelectedSpell(null);
    setShowSpells(false);
  }, [selectedSpell, onSetAnimating, onCastSpell]);

  const handleSelfSpell = useCallback((spell: Spell) => {
    onSetAnimating();
    setAnimPhase("casting");
    playSfx("magicRing", 0.6);
    onCastSpell(spell);
    setSelectedSpell(null);
    setShowSpells(false);
    setSelectedAction(null);
  }, [onSetAnimating, onCastSpell]);

  const handleDefend = useCallback(() => {
    onSetAnimating();
    setAnimPhase("defending");
    playSfx("block");
    onDefend();
  }, [onSetAnimating, onDefend]);

  const onPlayerTransitionEnd = useCallback(() => {
    if (animPhase === "runToEnemy") {
      setAnimPhase("attacking");
      playSfx("swordSwing");
      playSfx("gruntAttack", 0.7);
      if (pendingTargetIdx !== null) {
        onAttack(pendingTargetIdx);
      }
    } else if (animPhase === "runBack") {
      setAnimPhase("idle");
      setPendingTargetIdx(null);
      if (battle.phase !== "victory" && battle.phase !== "defeat") {
        setTimeout(() => onFinishPlayerTurn(), 1000);
      }
    }
  }, [animPhase, pendingTargetIdx, onAttack, battle.phase, onFinishPlayerTurn]);

  useEffect(() => {
    if (battle.log.length <= prevLogLenRef.current) {
      prevLogLenRef.current = battle.log.length;
      return;
    }
    const newMessages = battle.log.slice(prevLogLenRef.current);
    prevLogLenRef.current = battle.log.length;

    for (const msg of newMessages) {
      const dmgMatch = msg.match(/(\d+)\s*(CRITICAL\s+|CRIT\s+)?damage/i);
      const spellDmg = msg.match(/deals\s+(\d+)\s*(CRIT\s+)?to/i);
      const matched = dmgMatch || spellDmg;

      if (matched && animPhase === "attacking" && pendingTargetIdx !== null) {
        const isCrit = !!(matched[2]);
        const tidx = pendingTargetIdx;
        setEnemyHitIdx(tidx);
        playSfx("hitMetal");
        const hitEnemy = battle.enemies[tidx];
        if (hitEnemy && isAnimatedEnemyCheck(hitEnemy)) {
          setEnemyAnimStates(prev => ({ ...prev, [tidx]: "hurt" }));
          scheduleTimer(() => {
            setEnemyAnimStates(prev => {
              const e = battle.enemies[tidx];
              return { ...prev, [tidx]: (e && e.currentHp <= 0) ? "death" : "idle" };
            });
          }, 500);
        }
        spawnDamageNumber(
          (isCrit ? "CRIT " : "") + matched[1],
          60 + tidx * 15,
          30 + tidx * 5,
          isCrit ? "#fbbf24" : "#ef4444"
        );
        if (isCrit) {
          setShakeScreen(true);
          scheduleTimer(() => setShakeScreen(false), 400);
        }
        scheduleTimer(() => setEnemyHitIdx(null), 400);
      }

      if (matched && (animPhase === "casting" || animPhase === "fujinSlice")) {
        const allEnemyTargets = battle.enemies.map((_, i) => i).filter(i => battle.enemies[i].currentHp > 0);
        const targetIdx = pendingTargetIdx ?? fujinTargetIdx ?? allEnemyTargets[0] ?? 0;
        setEnemyHitIdx(targetIdx);
        if (animPhase === "fujinSlice") {
          playSfx("hitCombo");
        } else {
          playSfx("stabRing");
        }
        const hitEnemy = battle.enemies[targetIdx];
        if (hitEnemy && isAnimatedEnemyCheck(hitEnemy)) {
          setEnemyAnimStates(prev => ({ ...prev, [targetIdx]: "hurt" }));
          scheduleTimer(() => {
            setEnemyAnimStates(prev => {
              const e = battle.enemies[targetIdx];
              return { ...prev, [targetIdx]: (e && e.currentHp <= 0) ? "death" : "idle" };
            });
          }, 500);
        }
        const dmgColor = animPhase === "fujinSlice" ? "#4ade80" : "#a855f7";
        spawnDamageNumber(
          matched[1],
          55 + targetIdx * 15,
          28 + targetIdx * 8,
          dmgColor
        );
        setShakeScreen(true);
        setTimeout(() => setShakeScreen(false), 500);
        setTimeout(() => setEnemyHitIdx(null), 400);
      }

      if (matched && battle.animation === "enemyAttack") {
        const attackingEnemy = battle.enemies.find(e => e.currentHp > 0);
        const isFire = attackingEnemy?.element === "Fire";
        if (!isFire) {
          setPlayerFlash(true);
          setTimeout(() => setPlayerFlash(false), 500);
        }
        playSfx("gruntHurt", 0.8);
        spawnDamageNumber(matched[1], 22, 35, isFire ? "#ff6b2b" : "#ef4444");
      }
    }
  }, [battle.log.length, animPhase, pendingTargetIdx, battle.enemies, battle.animation, spawnDamageNumber]);

  const onSpriteComplete = useCallback(() => {
    if (animPhase === "attacking") {
      setAnimPhase("runBack");
    } else if (animPhase === "hurt") {
      setAnimPhase("idle");
    } else if (animPhase === "casting") {
      setAnimPhase("idle");
      setPendingTargetIdx(null);
      if (battle.phase !== "victory" && battle.phase !== "defeat") {
        setTimeout(() => onFinishPlayerTurn(), 1000);
      }
    } else if (animPhase === "defending") {
      setAnimPhase("idle");
      if (battle.phase !== "victory" && battle.phase !== "defeat") {
        setTimeout(() => onFinishPlayerTurn(), 1000);
      }
    }
  }, [animPhase, battle.phase, onFinishPlayerTurn]);

  const clearEnemyTurnTimers = useCallback(() => {
    enemyTurnTimers.current.forEach(id => clearTimeout(id));
    enemyTurnTimers.current = [];
  }, []);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    enemyTurnTimers.current.push(id);
    return id;
  }, []);

  const startFujinSlice = useCallback((targetIdx: number, spell: Spell) => {
    setSelectedAction(null);
    setPendingTargetIdx(targetIdx);
    setFujinTargetIdx(targetIdx);
    onSetAnimating();
    setAnimPhase("fujinSlice");
    setFujinZoom(true);
    setFujinSliceActive(true);
    setFujinDashPhase("windup");
    playSfx("swordSwing");
    playSfx("gruntAttack", 0.7);

    const pos = ENEMY_POSITIONS[targetIdx % ENEMY_POSITIONS.length];
    const smearPool: { sheet: string; frames: number; fw: number }[] = [
      { sheet: smearH1, frames: 5, fw: 48 },
      { sheet: smearH2, frames: 5, fw: 48 },
      { sheet: smearH3, frames: 5, fw: 48 },
      { sheet: smearV1, frames: 6, fw: 48 },
      { sheet: smearV2, frames: 6, fw: 48 },
      { sheet: smearV3, frames: 6, fw: 48 },
    ];
    const slashCount = 8;
    const slashData = Array.from({ length: slashCount }, (_, i) => {
      const pick = smearPool[Math.floor(Math.random() * smearPool.length)];
      return {
        id: fujinSlashId.current++,
        x: pos.x + (Math.random() * 16 - 8),
        y: pos.y + (Math.random() * 14 - 7),
        rotation: Math.random() * 360,
        delay: i * 100,
        sheet: pick.sheet,
        frames: pick.frames,
        fw: pick.fw,
      };
    });

    scheduleTimer(() => {
      setFujinDashPhase("dash");
      playSfx("whoosh");
    }, 600);

    scheduleTimer(() => {
      setFujinDashPhase("strike");
      setFujinSlashes(slashData);
      playSfx("hitCombo");
    }, 780);

    scheduleTimer(() => {
      onCastSpell(spell, targetIdx);
    }, 900);

    scheduleTimer(() => {
      setFujinDashPhase("fadeout");
      setFujinSlashes([]);
    }, 1200);

    scheduleTimer(() => {
      setFujinDashPhase("return");
    }, 1450);

    scheduleTimer(() => {
      setFujinDashPhase("none");
      setFujinZoom(false);
    }, 1550);

    scheduleTimer(() => {
      setFujinSliceActive(false);
      setFujinTargetIdx(null);
      setAnimPhase("idle");
      setPendingTargetIdx(null);
    }, 1900);

    scheduleTimer(() => {
      onFinishPlayerTurn();
    }, 2500);

    setSelectedSpell(null);
    setShowSpells(false);
  }, [onSetAnimating, onCastSpell, onFinishPlayerTurn, battle.phase, scheduleTimer]);

  startFujinSliceRef.current = startFujinSlice;

  const isDragonLord = useCallback((enemy: { id: string; isBoss: boolean }) => enemy.id === "dragon_lord" && enemy.isBoss, []);
  const isFrostLizard = useCallback((enemy: { id: string }) => enemy.id === "frost_lizard", []);
  const isJotem = useCallback((enemy: { id: string }) => enemy.id === "jotem", []);
  const isAnimatedEnemyCheck = useCallback((enemy: { id: string; element: string; isBoss: boolean }) => {
    return (enemy.element === "Fire" && !enemy.isBoss) || isDragonLord(enemy) || isFrostLizard(enemy) || isJotem(enemy);
  }, [isDragonLord, isFrostLizard, isJotem]);

  const animateEnemyAttack = useCallback((enemyIdx: number, enemy: typeof battle.enemies[0], onDone: () => void) => {
    const pos = ENEMY_POSITIONS[enemyIdx % ENEMY_POSITIONS.length];

    if (isDragonLord(enemy)) {
      const useDarkMagic = Math.random() < 0.4;

      if (useDarkMagic) {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
        playSfx("magicRing", 0.7);

        scheduleTimer(() => {
          const dodged = onEnemyAttack(enemyIdx);
          if (!dodged) {
            setDarkMagicSfx(true);
            setShakeScreen(true);
            setAnimPhase("hurt");
            playSfx("stabRing");
            scheduleTimer(() => setShakeScreen(false), 600);
          }
        }, 900);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
          setAnimPhase("idle");
          scheduleTimer(onDone, 300);
        }, 1200);
      } else {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
        setBossOffset({ x: -(pos.x - 30), y: -(pos.y - 25) });

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
          playSfx("swordSwing");
        }, 600);

        scheduleTimer(() => {
          const dodged = onEnemyAttack(enemyIdx);
          if (!dodged) {
            setShakeScreen(true);
            setAnimPhase("hurt");
            playSfx("hitCombo");
            scheduleTimer(() => setShakeScreen(false), 500);
          }
        }, 1200);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
          setBossOffset({ x: 0, y: 0 });
        }, 1500);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
          setBossOffset(null);
          setAnimPhase("idle");
          scheduleTimer(onDone, 300);
        }, 2100);
      }
    } else if (enemy.element === "Fire" && !enemy.isBoss) {
      setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
      playSfx("stabWhoosh");

      scheduleTimer(() => {
        setFireballAnim({ fromX: pos.x, fromY: pos.y, active: true });
      }, 450);

      scheduleTimer(() => {
        setFireballAnim(null);
        const dodged = onEnemyAttack(enemyIdx);
        if (!dodged) {
          setFireHitSfx(true);
          setShakeScreen(true);
          setAnimPhase("hurt");
          playSfx("hitMetal");
          scheduleTimer(() => setShakeScreen(false), 500);
        }
      }, 950);

      scheduleTimer(() => {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
        setAnimPhase("idle");
        scheduleTimer(onDone, 300);
      }, 1100);
    } else if (isFrostLizard(enemy)) {
      setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
      playSfx("magicRing", 0.6);

      scheduleTimer(() => {
        setFrostBreathAnim({ fromX: pos.x, fromY: pos.y, active: true });
      }, 400);

      scheduleTimer(() => {
        setFrostBreathAnim(null);
        const dodged = onEnemyAttack(enemyIdx);
        if (!dodged) {
          setFrostHitSfx(true);
          setShakeScreen(true);
          setAnimPhase("hurt");
          playSfx("hitMetal");
          scheduleTimer(() => setShakeScreen(false), 500);
        }
      }, 900);

      scheduleTimer(() => {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
        setAnimPhase("idle");
        scheduleTimer(onDone, 300);
      }, 1100);
    } else if (isJotem(enemy)) {
      const attackRoll = Math.random();
      const useIceMagic = attackRoll < 0.3;
      const useSwordSlash = !useIceMagic && attackRoll < 0.6;

      if (useIceMagic) {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
        playSfx("magicRing", 0.7);

        scheduleTimer(() => {
          setFrostBreathAnim({ fromX: pos.x, fromY: pos.y, active: true });
        }, 500);

        scheduleTimer(() => {
          setFrostBreathAnim(null);
          const dodged = onEnemyAttack(enemyIdx);
          if (!dodged) {
            setFrostHitSfx(true);
            setShakeScreen(true);
            setAnimPhase("hurt");
            playSfx("stabRing");
            scheduleTimer(() => setShakeScreen(false), 600);
          }
        }, 1000);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
          setAnimPhase("idle");
          scheduleTimer(onDone, 300);
        }, 1300);
      } else if (useSwordSlash) {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "slash" }));
        playSfx("swordSwing");

        scheduleTimer(() => {
          playSfx("whoosh");
        }, 400);

        scheduleTimer(() => {
          const dodged = onEnemyAttack(enemyIdx);
          if (!dodged) {
            setShakeScreen(true);
            setAnimPhase("hurt");
            playSfx("hitCombo");
            scheduleTimer(() => setShakeScreen(false), 600);
          }
        }, 700);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
          setAnimPhase("idle");
          scheduleTimer(onDone, 300);
        }, 1100);
      } else {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
        setBossOffset({ x: -(pos.x - 30), y: -(pos.y - 25) });

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
          playSfx("swordSwing");
        }, 600);

        scheduleTimer(() => {
          const dodged = onEnemyAttack(enemyIdx);
          if (!dodged) {
            setShakeScreen(true);
            setAnimPhase("hurt");
            playSfx("hitCombo");
            scheduleTimer(() => setShakeScreen(false), 500);
          }
        }, 1200);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
          setBossOffset({ x: 0, y: 0 });
        }, 1500);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
          setBossOffset(null);
          setAnimPhase("idle");
          scheduleTimer(onDone, 300);
        }, 2100);
      }
    } else {
      playSfx("stabWhoosh");
      const dodged = onEnemyAttack(enemyIdx);
      if (!dodged) {
        setAnimPhase("hurt");
        playSfx("hitMetal", 0.6);
      }
      scheduleTimer(() => {
        setAnimPhase("idle");
        scheduleTimer(onDone, 300);
      }, 600);
    }
  }, [isDragonLord, isFrostLizard, isJotem, scheduleTimer, onEnemyAttack]);

  useEffect(() => {
    if (battle.phase === "enemyTurn" && prevPhaseRef.current !== "enemyTurn") {
      const aliveEnemyIndices = battle.enemies
        .map((e, i) => ({ enemy: e, idx: i }))
        .filter(({ enemy }) => enemy.currentHp > 0);

      if (aliveEnemyIndices.length === 0) {
        onEnemyTurnEnd();
        prevPhaseRef.current = battle.phase;
        return;
      }

      let currentSeq = 0;
      const runNextEnemy = () => {
        if (currentSeq >= aliveEnemyIndices.length || battle.playerHp <= 0) {
          scheduleTimer(() => {
            onEnemyTurnEnd();
          }, 1000);
          return;
        }
        const { enemy, idx } = aliveEnemyIndices[currentSeq];
        currentSeq++;
        animateEnemyAttack(idx, enemy, runNextEnemy);
      };

      runNextEnemy();

      prevPhaseRef.current = battle.phase;
      return;
    }
    prevPhaseRef.current = battle.phase;
  }, [battle.phase, onEnemyTurnEnd, battle.enemies, scheduleTimer, animateEnemyAttack]);

  useEffect(() => {
    return () => clearEnemyTurnTimers();
  }, [clearEnemyTurnTimers]);

  const getEnemySprite = (enemyId: string): string => {
    return ENEMY_SPRITES[enemyId] || fireSlimeImg;
  };

  const getSpriteSheet = (): { src: string; frames: number; fps: number; loop: boolean; pauseAt?: number; startAt?: number } => {
    switch (animPhase) {
      case "attacking":
        return { src: samuraiAttack, frames: 7, fps: 14, loop: false };
      case "casting":
        return { src: samuraiAttack, frames: 7, fps: 14, loop: false };
      case "fujinSlice":
        if (fujinDashPhase === "windup") {
          return { src: samuraiAttack, frames: 7, fps: 12, loop: false, pauseAt: 3 };
        }
        if (fujinDashPhase === "dash") {
          return { src: samuraiAttack, frames: 7, fps: 12, loop: false, pauseAt: 3 };
        }
        if (fujinDashPhase === "strike") {
          return { src: samuraiAttack, frames: 7, fps: 16, loop: false, startAt: 3 };
        }
        return { src: samuraiIdle, frames: 10, fps: 8, loop: true };
      case "hurt":
        return { src: samuraiHurt, frames: 4, fps: 10, loop: false };
      default:
        return { src: samuraiIdle, frames: 10, fps: 8, loop: true };
    }
  };

  const spriteConfig = getSpriteSheet();

  const getPlayerTransform = (): string => {
    switch (animPhase) {
      case "runToEnemy":
        return "translateX(320px) translateY(-50px)";
      case "attacking":
        return "translateX(320px) translateY(-50px)";
      case "runBack":
        return "translateX(0) translateY(0)";
      case "hurt":
        return "translateX(-12px)";
      case "fujinSlice": {
        if (fujinDashPhase === "dash" || fujinDashPhase === "strike") {
          return "translateX(450px) translateY(-50px)";
        }
        return "translateX(0) translateY(0)";
      }
      default:
        return "translateX(0) translateY(0)";
    }
  };

  const isInputBlocked = animPhase !== "idle" || battle.phase !== "playerTurn";

  const ENEMY_POSITIONS = [
    { x: 58, y: 42, z: 0.95 },
    { x: 72, y: 36, z: 0.85 },
    { x: 65, y: 52, z: 1.05 },
    { x: 80, y: 48, z: 0.9 },
  ];

  const handleEnemyClick = (idx: number) => {
    if (isInputBlocked) return;
    if (selectedAction === "attack") {
      handleAttackTarget(idx);
    } else if (selectedAction === "magic" && selectedSpell && selectedSpell.targetType === "enemy") {
      handleSpellTarget(idx);
    }
  };

  const handleSpellSelect = (spell: Spell) => {
    if (battle.playerMp < spell.mpCost) return;

    if (spell.targetType === "self" || spell.targetType === "allEnemies") {
      handleSelfSpell(spell);
    } else {
      setSelectedSpell(spell);
      setSelectedAction("magic");
      setShowSpells(false);
    }
  };

  const fujinZoomTarget = fujinTargetIdx !== null ? ENEMY_POSITIONS[fujinTargetIdx % ENEMY_POSITIONS.length] : null;
  const fujinOrigin = fujinZoomTarget ? `${(12 + fujinZoomTarget.x) / 2}% ${(82 + (100 - fujinZoomTarget.y)) / 2}%` : "50% 50%";

  return (
    <div className={`relative w-full h-screen overflow-hidden ${shakeScreen ? "animate-[shake_0.3s_ease-out]" : ""}`}>
      {fujinSliceActive && (
        <div className="absolute inset-0 z-[60] pointer-events-none">
          <div
            className="absolute inset-0 animate-[fujinVignette_2.5s_ease-out_forwards]"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,30,0,0.6) 100%)",
            }}
          />
          {fujinSlashes.map((slash) => (
            <div
              key={slash.id}
              className="absolute"
              style={{
                left: `${slash.x - 8}%`,
                bottom: `${slash.y - 4}%`,
                transform: `rotate(${slash.rotation}deg)`,
                zIndex: 65,
                pointerEvents: "none" as const,
              }}
            >
              <div
                className="animate-[fujinSlashAppear_0.35s_ease-out_forwards]"
                style={{
                  opacity: 0,
                  animationDelay: `${slash.delay}ms`,
                  filter: "drop-shadow(0 0 8px rgba(100,255,150,0.7)) drop-shadow(0 0 20px rgba(50,200,100,0.4))",
                }}
              >
                <SpriteAnimator
                  spriteSheet={slash.sheet}
                  frameWidth={slash.fw}
                  frameHeight={48}
                  totalFrames={slash.frames}
                  fps={18}
                  scale={3.5}
                  loop={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: fujinZoom ? "scale(1.45)" : "scale(1)",
          transformOrigin: fujinOrigin,
          transition: fujinZoom ? "transform 0.6s cubic-bezier(0.25,0.1,0.25,1)" : "transform 0.5s cubic-bezier(0.25,0.1,0.25,1)",
          filter: fujinSliceActive ? "contrast(1.1) saturate(1.15)" : "none",
        }}
      >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0520] via-[#150a30] to-[#0a0418]" />

      <div className="absolute inset-0" style={{ perspective: "800px", perspectiveOrigin: "50% 35%" }}>
        <div
          className="absolute w-[140%] left-[-20%] bottom-0"
          style={{
            height: "55%",
            transform: "rotateX(55deg)",
            transformOrigin: "bottom center",
            background: "linear-gradient(180deg, #1a0e35 0%, #120828 30%, #0d0520 60%, #080315 100%)",
            borderTop: "1px solid rgba(168, 85, 247, 0.15)",
          }}
        >
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full border-t border-purple-500/10"
                style={{ top: `${(i + 1) * 8}%` }}
              />
            ))}
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full border-l border-purple-500/8"
                style={{ left: `${(i + 1) * 6.25}%` }}
              />
            ))}
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 30% 40%, ${elementColor}10 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, #a855f710 0%, transparent 50%)`,
            }}
          />
        </div>
      </div>

      <ParticleCanvas
        colors={battle.phase === "victory" ? ["#fbbf24", "#f59e0b", "#eab308"] : [elementColor, "#a855f7", "#6b21a8"]}
        count={battle.phase === "victory" ? 120 : 20}
        speed={battle.phase === "victory" ? 1.5 : 0.3}
        style={battle.phase === "victory" ? "burst" : "ambient"}
      />

      {isLowHp && battle.phase !== "victory" && battle.phase !== "defeat" && (
        <div className="absolute inset-0 pointer-events-none animate-pulse z-5" style={{ boxShadow: "inset 0 0 80px rgba(239, 68, 68, 0.15)" }} />
      )}

      {damageNumbers.map(d => (
        <div
          key={d.id}
          className="absolute pointer-events-none z-50 animate-[dmgFloat_1.2s_ease-out_forwards] font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{ left: `${d.x}%`, top: `${d.y}%`, color: d.color, textShadow: `0 0 10px ${d.color}80` }}
        >
          {d.text}
        </div>
      ))}

      <div className="relative z-10 h-full">
        <div className="absolute inset-0 overflow-hidden">
          <div
            ref={playerSpriteRef}
            className="absolute z-20"
            style={{
              left: "12%",
              bottom: "18%",
              transform: getPlayerTransform(),
              opacity: fujinDashPhase === "fadeout" ? 0 : 1,
              transition: animPhase === "fujinSlice"
                ? fujinDashPhase === "dash"
                  ? "transform 0.18s cubic-bezier(0.1,0,0.2,1)"
                  : fujinDashPhase === "strike"
                    ? "transform 0.01s"
                    : fujinDashPhase === "fadeout"
                      ? "opacity 0.15s ease-out"
                      : fujinDashPhase === "return"
                        ? "transform 0s, opacity 0.3s ease-in"
                        : "transform 0.15s ease-out, opacity 0.3s ease-in"
                : animPhase === "runToEnemy" ? "transform 0.35s ease-in" : animPhase === "runBack" ? "transform 0.35s ease-out" : "transform 0.15s ease-out",
            }}
            onTransitionEnd={onPlayerTransitionEnd}
            data-testid="img-player-character"
          >
            {playerFlash && (
              <div className="absolute inset-0 z-30 animate-[flashDamage_0.4s_ease-out]" style={{ background: "radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)" }} />
            )}
            {fireHitSfx && (
              <div className="absolute z-30" style={{ top: "-60%", left: "-55%", width: "210%", height: "210%", pointerEvents: "none" }}>
                <SpriteAnimator
                  spriteSheet={sfxFireBurst}
                  frameWidth={96}
                  frameHeight={96}
                  totalFrames={9}
                  fps={18}
                  scale={3}
                  loop={false}
                  onComplete={() => setFireHitSfx(false)}
                  preloadSheets={[sfxFireBurst]}
                  style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
                />
              </div>
            )}
            {darkMagicSfx && (
              <div className="absolute z-30" style={{ top: "-80%", left: "-70%", width: "240%", height: "240%", pointerEvents: "none" }}>
                <div className="absolute inset-0 animate-[darkMagicExplosion_0.8s_ease-out_forwards]"
                  style={{
                    background: "radial-gradient(circle, rgba(120,0,255,0.8) 0%, rgba(80,0,180,0.5) 30%, rgba(40,0,100,0.3) 50%, transparent 70%)",
                    mixBlendMode: "screen",
                  }}
                />
                <div className="absolute inset-0 animate-[darkMagicRing_0.6s_ease-out_forwards]"
                  style={{
                    border: "3px solid rgba(160,0,255,0.7)",
                    borderRadius: "50%",
                    boxShadow: "0 0 40px rgba(120,0,255,0.6), inset 0 0 30px rgba(80,0,200,0.4), 0 0 80px rgba(160,0,255,0.3)",
                  }}
                  onAnimationEnd={() => setDarkMagicSfx(false)}
                />
                <div className="absolute inset-[20%] animate-[darkMagicCore_0.5s_ease-out_forwards]"
                  style={{
                    background: "radial-gradient(circle, rgba(255,100,255,0.9) 0%, rgba(160,0,255,0.6) 40%, transparent 70%)",
                    borderRadius: "50%",
                  }}
                />
              </div>
            )}
            {animPhase === "defending" && (
              <div
                className="absolute -inset-6 rounded-full z-30 animate-[shieldPulse_0.8s_ease-out_forwards]"
                style={{ border: "3px solid rgba(96,165,250,0.6)", boxShadow: "0 0 40px rgba(96,165,250,0.3), inset 0 0 20px rgba(96,165,250,0.1)" }}
                onAnimationEnd={onSpriteComplete}
              />
            )}
            {animPhase === "casting" && (
              <div
                className="absolute -inset-8 z-30 animate-[magicGlow_0.9s_ease-out_forwards]"
                style={{ background: `radial-gradient(circle, ${elementColor}50 0%, ${elementColor}20 40%, transparent 70%)` }}
                onAnimationEnd={onSpriteComplete}
              />
            )}
            <div className="relative">
              <SpriteAnimator
                spriteSheet={spriteConfig.src}
                frameWidth={96}
                frameHeight={96}
                totalFrames={spriteConfig.frames}
                fps={spriteConfig.fps}
                scale={3.5}
                loop={spriteConfig.loop}
                onComplete={onSpriteComplete}
                preloadSheets={[samuraiIdle, samuraiAttack, samuraiHurt]}
                startFrame={spriteConfig.startAt}
                pauseAtFrame={spriteConfig.pauseAt}
              />
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full blur-md opacity-40"
                style={{ backgroundColor: elementColor }}
              />
            </div>
          </div>

          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: "2%",
              bottom: "50%",
              width: "140px",
            }}
          >
            <div className="bg-black/70 backdrop-blur-sm rounded-md px-2 py-1.5 border border-purple-500/15">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-purple-200" data-testid="text-player-battle-name">{player.name}</span>
                <span className="text-[8px] text-purple-400/60">Lv.{player.level}</span>
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <Heart className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isLowHp ? "animate-pulse bg-red-500" : "bg-red-400"}`} style={{ width: `${hpPercent}%` }} />
                  </div>
                  <span className="text-[8px] text-red-300 min-w-[36px] text-right" data-testid="text-player-hp">{battle.playerHp}/{player.stats.maxHp}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-2.5 h-2.5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 h-1 bg-black/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${mpPercent}%` }} />
                  </div>
                  <span className="text-[8px] text-blue-300 min-w-[36px] text-right" data-testid="text-player-mp">{battle.playerMp}/{player.stats.maxMp}</span>
                </div>
              </div>
              {battle.buffs.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {battle.buffs.map((buff, i) => (
                    <span key={i} className="text-[7px] px-1 py-0.5 rounded bg-yellow-600/30 text-yellow-300 border border-yellow-500/20 leading-none">
                      {buff.name} ({buff.turnsRemaining})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {battle.enemies.map((enemy, idx) => {
            const isDead = enemy.currentHp <= 0;
            const enemyHpPct = (enemy.currentHp / enemy.stats.hp) * 100;
            const isTargetable = !isDead && !isInputBlocked && (selectedAction === "attack" || (selectedAction === "magic" && selectedSpell?.targetType === "enemy"));
            const isHit = enemyHitIdx === idx;
            const spriteImg = getEnemySprite(enemy.id);
            const isBoss = enemy.isBoss;
            const pos = ENEMY_POSITIONS[idx % ENEMY_POSITIONS.length];

            const isBossMoving = (isDragonLord(enemy) || isJotem(enemy)) && bossOffset !== null;
            const bossTranslate = isBossMoving ? `translate(${bossOffset.x}%, ${bossOffset.y}%)` : "";

            return (
              <button
                key={idx}
                className={`absolute flex flex-col items-center ${isDead ? "opacity-10 pointer-events-none" : ""} ${isTargetable ? "cursor-pointer" : "cursor-default"} ${isHit ? "animate-[enemyHit_0.4s_ease-out]" : ""}`}
                style={{
                  left: `${pos.x}%`,
                  bottom: `${pos.y}%`,
                  transform: `scale(${isDead ? 0.4 : pos.z}) ${isTargetable ? "translateY(-4px)" : ""} ${bossTranslate}`,
                  zIndex: Math.floor(pos.y),
                  transition: "transform 0.5s ease, opacity 0.3s ease",
                }}
                onClick={() => handleEnemyClick(idx)}
                disabled={isDead || !isTargetable}
                data-testid={`button-enemy-${idx}`}
              >
                {isTargetable && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
                    <Target className="w-5 h-5 text-yellow-400 animate-bounce drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                  </div>
                )}

                <div className="text-center mb-1 z-10">
                  <p className="text-[10px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" data-testid={`text-enemy-name-${idx}`}>{enemy.name}</p>
                  <p className="text-[8px] drop-shadow-lg" style={{ color: ELEMENT_COLORS[enemy.element] }}>Lv.{enemy.level}</p>
                </div>

                <div className={`relative ${isDead ? "" : "animate-[idleBob_2.8s_ease-in-out_infinite]"}`} style={{ animationDelay: `${idx * 0.5}s` }}>
                  {isTargetable && (
                    <div className="absolute -inset-3 rounded-lg border border-yellow-400/30 animate-pulse z-0" style={{ boxShadow: "0 0 15px rgba(250,204,21,0.15)" }} />
                  )}
                  {isHit && (
                    <div className="absolute inset-0 z-20 animate-[flashDamage_0.3s_ease-out]" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)" }} />
                  )}
                  {enemy.id === "dragon_lord" && enemy.isBoss ? (
                    <div
                      className="w-36 h-36 md:w-48 md:h-48"
                      style={{
                        filter: isDead
                          ? "grayscale(1) brightness(0.2)"
                          : `drop-shadow(0 4px 16px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(255,60,0,0.4))`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          (enemyAnimStates[idx] === "death" || isDead) ? dragonLordDeath
                          : enemyAnimStates[idx] === "attack" ? dragonLordAttack
                          : enemyAnimStates[idx] === "hurt" ? dragonLordHurt
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? dragonLordWalk
                          : dragonLordIdle
                        }
                        frameWidth={
                          (enemyAnimStates[idx] === "death" || isDead) ? 160
                          : enemyAnimStates[idx] === "attack" ? 90
                          : enemyAnimStates[idx] === "hurt" ? 130
                          : 74
                        }
                        frameHeight={
                          (enemyAnimStates[idx] === "death" || isDead) ? 160
                          : enemyAnimStates[idx] === "attack" ? 70
                          : enemyAnimStates[idx] === "hurt" ? 130
                          : 74
                        }
                        totalFrames={
                          (enemyAnimStates[idx] === "death" || isDead) ? 36
                          : enemyAnimStates[idx] === "attack" ? 16
                          : enemyAnimStates[idx] === "hurt" ? 5
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? 8
                          : 4
                        }
                        fps={
                          enemyAnimStates[idx] === "attack" ? 16
                          : enemyAnimStates[idx] === "death" ? 10
                          : enemyAnimStates[idx] === "hurt" ? 10
                          : 8
                        }
                        scale={3}
                        loop={!isDead && enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death"}
                        flipX={true}
                        preloadSheets={[dragonLordIdle, dragonLordWalk, dragonLordAttack, dragonLordHurt, dragonLordDeath]}
                      />
                    </div>
                  ) : isJotem(enemy) ? (
                    <div
                      className={`w-32 h-32 md:w-40 md:h-40 ${isTargetable ? "hover:brightness-125 hover:scale-105" : ""} transition-all duration-200`}
                      style={{
                        filter: isDead
                          ? "grayscale(1) brightness(0.2)"
                          : `drop-shadow(0 4px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 15px ${ELEMENT_COLORS[enemy.element]}30)`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          (enemyAnimStates[idx] === "death" || isDead) ? jotemDeath
                          : enemyAnimStates[idx] === "slash" ? jotemSlash
                          : enemyAnimStates[idx] === "attack" ? jotemAttack
                          : enemyAnimStates[idx] === "hurt" ? jotemHurt
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? jotemWalk
                          : jotemIdle
                        }
                        frameWidth={128}
                        frameHeight={128}
                        totalFrames={
                          (enemyAnimStates[idx] === "death" || isDead) ? 12
                          : enemyAnimStates[idx] === "slash" ? 10
                          : enemyAnimStates[idx] === "attack" ? 10
                          : enemyAnimStates[idx] === "hurt" ? 5
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? 8
                          : 6
                        }
                        fps={
                          enemyAnimStates[idx] === "slash" ? 14
                          : enemyAnimStates[idx] === "attack" ? 12
                          : enemyAnimStates[idx] === "death" ? 8
                          : 8
                        }
                        scale={2.5}
                        loop={!isDead && enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death" && enemyAnimStates[idx] !== "slash"}
                        flipX={true}
                        preloadSheets={[jotemIdle, jotemWalk, jotemAttack, jotemHurt, jotemDeath, jotemSlash]}
                      />
                    </div>
                  ) : enemy.element === "Fire" && !enemy.isBoss ? (
                    <div
                      className={`${isBoss ? "w-32 h-32 md:w-40 md:h-40" : "w-20 h-20 md:w-28 md:h-28"} ${isTargetable ? "hover:brightness-125 hover:scale-105" : ""} transition-all duration-200`}
                      style={{
                        filter: isDead
                          ? "grayscale(1) brightness(0.2)"
                          : `drop-shadow(0 4px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 15px ${ELEMENT_COLORS[enemy.element]}30)`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          (enemyAnimStates[idx] === "death" || isDead) ? demonDeath
                          : enemyAnimStates[idx] === "attack" ? demonAttack
                          : enemyAnimStates[idx] === "hurt" ? demonHurt
                          : demonIdle
                        }
                        frameWidth={81}
                        frameHeight={71}
                        totalFrames={
                          (enemyAnimStates[idx] === "death" || isDead) ? 7
                          : enemyAnimStates[idx] === "attack" ? 8
                          : enemyAnimStates[idx] === "hurt" ? 4
                          : 4
                        }
                        fps={
                          enemyAnimStates[idx] === "attack" ? 12
                          : enemyAnimStates[idx] === "death" ? 8
                          : 8
                        }
                        scale={isBoss ? 4 : 2.5}
                        loop={!isDead && enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death"}
                        flipX={false}
                        preloadSheets={[demonIdle, demonAttack, demonHurt, demonDeath]}
                      />
                    </div>
                  ) : isFrostLizard(enemy) ? (
                    <div
                      className={`w-20 h-20 md:w-28 md:h-28 ${isTargetable ? "hover:brightness-125 hover:scale-105" : ""} transition-all duration-200`}
                      style={{
                        filter: isDead
                          ? "grayscale(1) brightness(0.2)"
                          : `drop-shadow(0 4px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 15px ${ELEMENT_COLORS[enemy.element]}30)`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          (enemyAnimStates[idx] === "death" || isDead) ? frostLizardHurt
                          : enemyAnimStates[idx] === "attack" ? frostLizardAttack
                          : enemyAnimStates[idx] === "hurt" ? frostLizardHurt
                          : frostLizardIdle
                        }
                        frameWidth={148}
                        frameHeight={96}
                        totalFrames={
                          (enemyAnimStates[idx] === "death" || isDead) ? 2
                          : enemyAnimStates[idx] === "attack" ? 5
                          : enemyAnimStates[idx] === "hurt" ? 2
                          : 6
                        }
                        fps={
                          enemyAnimStates[idx] === "attack" ? 10
                          : enemyAnimStates[idx] === "death" ? 6
                          : 8
                        }
                        scale={1.5}
                        loop={!isDead && enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death"}
                        flipX={true}
                        preloadSheets={[frostLizardIdle, frostLizardAttack, frostLizardHurt]}
                      />
                    </div>
                  ) : (
                    <img
                      src={spriteImg}
                      alt={enemy.name}
                      className={`${isBoss ? "w-32 h-32 md:w-40 md:h-40" : "w-20 h-20 md:w-28 md:h-28"} object-contain ${isTargetable ? "hover:brightness-125 hover:scale-105" : ""} transition-all duration-200`}
                      style={{
                        filter: isDead
                          ? "grayscale(1) brightness(0.2)"
                          : `drop-shadow(0 4px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 15px ${ELEMENT_COLORS[enemy.element]}30)`,
                        imageRendering: "auto",
                      }}
                      data-testid={`img-enemy-${idx}`}
                    />
                  )}
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2 rounded-full blur-sm opacity-30"
                    style={{ backgroundColor: ELEMENT_COLORS[enemy.element] }}
                  />
                </div>

                <div className="w-full max-w-[80px] mt-1 z-10">
                  <Progress value={enemyHpPct} className="h-1.5 bg-black/60" />
                  <p className="text-[7px] text-center text-red-300/50 mt-0.5" data-testid={`text-enemy-hp-${idx}`}>{enemy.currentHp}/{enemy.stats.hp}</p>
                </div>
              </button>
            );
          })}

          {fireballAnim && fireballAnim.active && (
            <div
              className="absolute z-40"
              style={{
                left: `${fireballAnim.fromX}%`,
                bottom: `${fireballAnim.fromY}%`,
                width: 96,
                height: 64,
                ["--fb-start-x" as string]: `${fireballAnim.fromX}%`,
                ["--fb-start-y" as string]: `${fireballAnim.fromY}%`,
                animation: "fireballFly 0.5s ease-in forwards",
                filter: "drop-shadow(0 0 12px rgba(255,120,20,0.8)) drop-shadow(0 0 24px rgba(255,60,0,0.5))",
                pointerEvents: "none",
              }}
            >
              <img
                src={demonFireball}
                alt="fireball"
                style={{ width: 96, height: 64, imageRendering: "pixelated" }}
              />
            </div>
          )}

          {frostBreathAnim && frostBreathAnim.active && (
            <div
              className="absolute z-40"
              style={{
                left: `${frostBreathAnim.fromX}%`,
                bottom: `${frostBreathAnim.fromY}%`,
                width: 80,
                height: 40,
                animation: "fireballFly 0.5s ease-in forwards",
                filter: "drop-shadow(0 0 12px rgba(120,200,255,0.8)) drop-shadow(0 0 24px rgba(80,160,255,0.5))",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 40,
                  background: "radial-gradient(ellipse at center, rgba(180,230,255,0.9) 0%, rgba(100,180,255,0.6) 40%, rgba(60,130,220,0.3) 70%, transparent 100%)",
                  borderRadius: "50%",
                  animation: "pulse 0.3s ease-in-out infinite alternate",
                }}
              />
            </div>
          )}
        </div>

      </div>

        {frostHitSfx && (
          <div
            className="absolute inset-0 z-50 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 25% 70%, rgba(100,180,255,0.4) 0%, rgba(60,140,220,0.2) 30%, transparent 60%)",
              animation: "fadeIn 0.2s ease-out forwards",
            }}
            onAnimationEnd={() => setFrostHitSfx(false)}
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-4">
          <Card className="p-2 bg-black/60 border-purple-500/10 backdrop-blur-md mb-2 max-h-14 overflow-y-auto">
            {latestLog.map((msg, i) => (
              <p
                key={i}
                className={`text-[11px] leading-tight ${i === latestLog.length - 1 ? "text-purple-100" : "text-purple-400/40"}`}
                data-testid={`text-battle-log-${i}`}
              >
                {msg}
              </p>
            ))}
          </Card>

          {battle.phase === "victory" && (
            <div className="text-center py-3 animate-[fadeIn_0.5s_ease-out]">
              <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-1 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
              <h2 className="text-xl font-bold text-yellow-300 mb-1" data-testid="text-victory">Victory!</h2>
              <p className="text-xs text-purple-300/70 mb-2">
                XP: +{battle.enemies.reduce((s, e) => s + e.xpReward, 0)} | Gold: +{battle.enemies.reduce((s, e) => s + e.goldReward, 0)}
              </p>
              <Button onClick={() => onEndBattle(true)} className="bg-yellow-600/80 text-white" data-testid="button-claim-victory">
                Claim Rewards
              </Button>
            </div>
          )}

          {battle.phase === "defeat" && (
            <div className="text-center py-3 animate-[fadeIn_0.5s_ease-out]">
              <Skull className="w-10 h-10 text-red-400 mx-auto mb-1" />
              <h2 className="text-xl font-bold text-red-300 mb-1" data-testid="text-defeat">Defeated...</h2>
              <p className="text-xs text-purple-300/70 mb-2">Your journey continues...</p>
              <Button onClick={() => onEndBattle(false)} variant="outline" className="border-red-500/30 text-red-300" data-testid="button-continue-defeat">
                Return to Map
              </Button>
            </div>
          )}

          {battle.phase === "playerTurn" && !showItems && !showSpells && !isInputBlocked && (
            <div className="grid grid-cols-4 gap-2 mb-1">
              <Button
                onClick={() => {
                  setSelectedAction(selectedAction === "attack" ? null : "attack");
                  setSelectedSpell(null);
                }}
                className={`flex flex-col items-center gap-1 h-auto py-2.5 ${
                  selectedAction === "attack"
                    ? "bg-red-600/80 text-white ring-2 ring-red-400/50"
                    : "bg-red-900/30 text-red-300 border border-red-500/20"
                }`}
                data-testid="button-action-attack"
              >
                <Swords className="w-4 h-4" />
                <span className="text-[10px]">Attack</span>
              </Button>
              <Button
                onClick={handleDefend}
                className="flex flex-col items-center gap-1 h-auto py-2.5 bg-blue-900/30 text-blue-300 border border-blue-500/20"
                data-testid="button-action-defend"
              >
                <Shield className="w-4 h-4" />
                <span className="text-[10px]">Defend</span>
              </Button>
              <Button
                onClick={() => {
                  setShowSpells(true);
                  setSelectedAction(null);
                  setSelectedSpell(null);
                }}
                className="flex flex-col items-center gap-1 h-auto py-2.5 bg-purple-900/30 text-purple-300 border border-purple-500/20"
                data-testid="button-action-magic"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px]">Magic</span>
              </Button>
              <Button
                onClick={() => setShowItems(true)}
                className="flex flex-col items-center gap-1 h-auto py-2.5 bg-green-900/30 text-green-300 border border-green-500/20"
                disabled={consumables.length === 0}
                data-testid="button-action-item"
              >
                <Package className="w-4 h-4" />
                <span className="text-[10px]">Item</span>
              </Button>
            </div>
          )}

          {battle.phase === "playerTurn" && selectedAction === "attack" && !isInputBlocked && (
            <p className="text-center text-[11px] text-yellow-300/70 mb-1 animate-pulse" data-testid="text-select-target">
              Select a target to attack
            </p>
          )}

          {battle.phase === "playerTurn" && selectedAction === "magic" && selectedSpell && !isInputBlocked && (
            <p className="text-center text-[11px] text-yellow-300/70 mb-1 animate-pulse" data-testid="text-select-spell-target">
              Select a target for {selectedSpell.name}
            </p>
          )}

          {battle.phase === "playerTurn" && showSpells && !isInputBlocked && (
            <div className="space-y-1 mb-1">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <span className="text-xs text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Spells
                </span>
                <Button size="sm" variant="ghost" className="text-xs text-purple-400" onClick={() => setShowSpells(false)} data-testid="button-close-spells">
                  <ArrowLeft className="w-3 h-3 mr-1" /> Back
                </Button>
              </div>
              {spells.length === 0 ? (
                <p className="text-xs text-purple-400/50 text-center py-2">No spells learned</p>
              ) : (
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                  {spells.map(spell => {
                    const canCast = battle.playerMp >= spell.mpCost;
                    return (
                      <Button
                        key={spell.id}
                        variant="ghost"
                        className={`w-full justify-start text-xs h-auto py-1.5 px-2 ${canCast ? "text-purple-200" : "text-purple-500/40"}`}
                        onClick={() => handleSpellSelect(spell)}
                        disabled={!canCast}
                        data-testid={`button-spell-${spell.id}`}
                      >
                        <div className="flex flex-col items-start w-full">
                          <div className="flex items-center gap-1 w-full justify-between">
                            <span className="font-medium flex items-center gap-1">
                              <Zap className="w-3 h-3" style={{ color: spell.element ? ELEMENT_COLORS[spell.element] : "#a855f7" }} />
                              {spell.name}
                            </span>
                            <span className="text-[9px] text-blue-300">{spell.mpCost} MP</span>
                          </div>
                          <span className="text-[9px] text-purple-400/60">{spell.description}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {battle.phase === "playerTurn" && showItems && !isInputBlocked && (
            <div className="space-y-1 mb-1">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <span className="text-xs text-purple-300">Items</span>
                <Button size="sm" variant="ghost" className="text-xs text-purple-400" onClick={() => setShowItems(false)} data-testid="button-close-items">
                  <ArrowLeft className="w-3 h-3 mr-1" /> Back
                </Button>
              </div>
              {consumables.length === 0 ? (
                <p className="text-xs text-purple-400/50 text-center py-2">No items</p>
              ) : (
                consumables.map(item => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start text-xs text-purple-200 h-auto py-1.5"
                    onClick={() => { onUseItem(item.id); setShowItems(false); }}
                    data-testid={`button-use-item-${item.id}`}
                  >
                    <Heart className="w-3 h-3 mr-2 text-red-400" />
                    {item.name} - {item.description}
                  </Button>
                ))
              )}
            </div>
          )}

          {(battle.phase === "enemyTurn" || (battle.phase === "animating" && animPhase !== "idle")) && battle.phase !== "victory" && battle.phase !== "defeat" && (
            <div className="text-center py-2">
              <p className="text-sm text-purple-300/60 animate-pulse">
                {battle.phase === "enemyTurn" ? "Enemies attacking..." : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px) rotate(-0.5deg); }
          40% { transform: translateX(6px) rotate(0.5deg); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dmgFloat {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          50% { opacity: 1; transform: translateY(-30px) scale(1.3); }
          100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
        }
        @keyframes enemyHit {
          0% { filter: brightness(2); transform: scale(1.1) translateX(5px); }
          50% { filter: brightness(1.5); transform: scale(0.95) translateX(-3px); }
          100% { filter: brightness(1); transform: scale(1) translateX(0); }
        }
        @keyframes flashDamage {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes shieldPulse {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes magicGlow {
          0% { transform: scale(0.3); opacity: 0; }
          40% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes idleBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes darkMagicExplosion {
          0% { opacity: 0; transform: scale(0.2); }
          30% { opacity: 1; transform: scale(1); }
          60% { opacity: 0.8; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes darkMagicRing {
          0% { opacity: 0; transform: scale(0.3); }
          40% { opacity: 1; transform: scale(0.9); }
          100% { opacity: 0; transform: scale(1.4); }
        }
        @keyframes darkMagicCore {
          0% { opacity: 0; transform: scale(0); }
          30% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(0.3); }
        }
        @keyframes fujinSlashAppear {
          0% { opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; transform: scale(1.3); }
          50% { opacity: 0.9; transform: scale(1.1); }
          80% { opacity: 0.5; transform: scale(0.9); }
          100% { opacity: 0; transform: scale(0.6); }
        }
        @keyframes fujinVignette {
          0% { opacity: 0; }
          15% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
