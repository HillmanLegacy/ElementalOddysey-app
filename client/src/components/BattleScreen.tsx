import { useState, useEffect, useRef, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import ParticleCanvas from "./ParticleCanvas";
import SpriteAnimator from "./SpriteAnimator";
import PixelDissolve from "./PixelDissolve";
import type { PlayerCharacter, BattleState, Spell, BattlePartyMember } from "@shared/schema";
import { ELEMENT_COLORS, getPlayerSpells, getPartyMemberSpells, xpForLevel } from "@/lib/gameData";
import { groupConsumables } from "@/lib/utils";
import LavaBattleBg from "./LavaBattleBg";
import { Swords, Shield, Sparkles, Package, Heart, Droplets, Trophy, Skull, Target, ArrowLeft, Zap } from "lucide-react";

import { playSfx, playSfxPitched } from "@/lib/sfx";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import samuraiAttack from "@/assets/images/samurai-attack.png";
import samuraiHurt from "@/assets/images/samurai-hurt.png";
import samuraiRun from "@/assets/images/samurai-run.png";
import knightRun from "@/assets/images/knight-run.png";
import knightWalk from "@/assets/images/knight-walk.png";
import knightSpecial from "@/assets/images/knight-special.png";
import knightDeath from "@/assets/images/knight-death.png";
import vfxFireImpact from "@/assets/images/vfx-fire-impact.png";
import baskenRun from "@/assets/images/basken-run.png";
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

import vfxFireBurst from "@/assets/images/vfx-fire-burst.png";
import vfxFirePillar from "@/assets/images/vfx-fire-pillar.png";

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

import vfxWindSlash1 from "@/assets/images/vfx-wind-slash1.png";
import vfxWindSlash2 from "@/assets/images/vfx-wind-slash2.png";
import vfxWindSlash3 from "@/assets/images/vfx-wind-slash3.png";
import vfxWindVortex from "@/assets/images/vfx-wind-vortex.png";
import windSlashAnim from "@/assets/images/wind-slash-anim.png";
import windSparkleSheet from "@/assets/images/wind-sparkle.png";
import mifuneBurstSheet from "@/assets/images/mifune-burst.png";

import knightIdle from "@/assets/images/knight-idle-4f.png";
import knightAttack from "@/assets/images/knight-attack.png";
import knightHurt from "@/assets/images/knight-hurt.png";
import rangerIdle from "@/assets/images/ranger-idle.png";
import rangerAttack from "@/assets/images/ranger-attack.png";
import rangerHurt from "@/assets/images/ranger-hurt.png";
import baskenIdle from "@/assets/images/basken-idle.png";
import baskenAttack from "@/assets/images/basken-attack.png";
import baskenHurt from "@/assets/images/basken-hurt.png";
import knight2dIdle from "@/assets/images/knight2d-idle.png";
import knight2dAttack from "@/assets/images/knight2d-attack-1.png";
import knight2dHurt from "@/assets/images/knight2d-hurt.png";
import axewarriorIdle from "@/assets/images/axewarrior-idle.png";
import axewarriorAttack from "@/assets/images/axewarrior-attack.png";
import axewarriorHurt from "@/assets/images/axewarrior-hurt.png";

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
  dragon_lord: dragonLordIdle,
};

const ENEMY_ANIM_DATA: Record<string, { idle: string; attack: string; hurt: string; death: string; frameWidth: number; frameHeight: number; idleFrames: number; attackFrames: number; hurtFrames: number; deathFrames: number; scale?: number; yOffset?: number }> = {
  dragon_lord: { 
    idle: dragonLordIdle, 
    attack: dragonLordAttack, 
    hurt: dragonLordHurt, 
    death: dragonLordDeath, 
    frameWidth: 74, 
    frameHeight: 74, 
    idleFrames: 4, 
    attackFrames: 16, 
    hurtFrames: 5, 
    deathFrames: 36, 
    scale: 4.2,
    yOffset: -10
  },
  demon: { idle: demonIdle, attack: demonAttack, hurt: demonHurt, death: demonDeath, frameWidth: 96, frameHeight: 96, idleFrames: 6, attackFrames: 8, hurtFrames: 4, deathFrames: 6, scale: 3 },
  frost_lizard: { idle: frostLizardIdle, attack: frostLizardAttack, hurt: frostLizardHurt, death: frostLizardIdle, frameWidth: 64, frameHeight: 64, idleFrames: 6, attackFrames: 6, hurtFrames: 3, deathFrames: 6, scale: 2.5 },
  jotem: { idle: jotemIdle, attack: jotemAttack, hurt: jotemHurt, death: jotemDeath, frameWidth: 100, frameHeight: 100, idleFrames: 6, attackFrames: 8, hurtFrames: 3, deathFrames: 8, scale: 3 },
};

const PARTY_SPRITE_MAP: Record<string, { idle: string; attack: string; hurt: string; run?: string; walk?: string; special?: string; death?: string; frameWidth: number; frameHeight: number; idleFrames: number; attackFrames: number; hurtFrames: number; runFrames?: number; walkFrames?: number; specialFrames?: number; deathFrames?: number; scale?: number }> = {
  samurai: { idle: samuraiIdle, attack: samuraiAttack, hurt: samuraiHurt, run: samuraiRun, frameWidth: 96, frameHeight: 96, idleFrames: 10, attackFrames: 7, hurtFrames: 4, runFrames: 8, scale: 3.5 },
  knight: { idle: knightIdle, attack: knightAttack, hurt: knightHurt, run: knightRun, walk: knightWalk, special: knightSpecial, death: knightDeath, frameWidth: 86, frameHeight: 49, idleFrames: 4, attackFrames: 7, hurtFrames: 2, runFrames: 6, walkFrames: 4, specialFrames: 7, deathFrames: 7, scale: 3.5 },
  basken: { idle: baskenIdle, attack: baskenAttack, hurt: baskenHurt, run: baskenRun, frameWidth: 56, frameHeight: 56, idleFrames: 5, attackFrames: 8, hurtFrames: 3, runFrames: 6, scale: 3.5 },
  ranger: { idle: rangerIdle, attack: rangerAttack, hurt: rangerHurt, frameWidth: 64, frameHeight: 48, idleFrames: 6, attackFrames: 6, hurtFrames: 6, scale: 3.5 },
  knight2d: { idle: knight2dIdle, attack: knight2dAttack, hurt: knight2dHurt, frameWidth: 84, frameHeight: 84, idleFrames: 8, attackFrames: 4, hurtFrames: 3, scale: 3.5 },
  axewarrior: { idle: axewarriorIdle, attack: axewarriorAttack, hurt: axewarriorHurt, frameWidth: 94, frameHeight: 91, idleFrames: 6, attackFrames: 8, hurtFrames: 3, scale: 3.5 },
};

const GAME_CONTAINER_HEIGHT = 640;

function getSpriteCenterOffset(spriteId: string, fraction: number = 0.3): number {
  const sprites = PARTY_SPRITE_MAP[spriteId] || PARTY_SPRITE_MAP.samurai;
  const displayH = Math.round(sprites.frameHeight * (sprites.scale || 3.5));
  return (displayH / GAME_CONTAINER_HEIGHT) * (fraction * 100);
}

const SPRITE_COLORS: Record<string, string> = {
  samurai: "#a3e635",
  knight: "#ef4444",
  basken: "#3b82f6",
  ranger: "#2dd4bf",
  knight2d: "#fde68a",
  axewarrior: "#a16207",
};

interface BattleScreenProps {
  player: PlayerCharacter;
  battle: BattleState;
  onAttack: (targetIndex: number) => void;
  onCastSpell: (spell: Spell, targetIndex?: number) => void;
  onDefend: () => void;
  onUseItem: (itemId: string) => void;
  onPartyMemberAttack: (partyIndex: number, targetIndex: number) => void;
  onPartyMemberDefend: (partyIndex: number) => void;
  onPartyMemberCastSpell: (partyIndex: number, spell: Spell, targetIndex?: number) => void;
  onPartyMemberUseItem: (partyIndex: number, itemId: string) => void;
  onAdvancePartyTurn: () => void;
  onFinishPartyTurn: () => void;
  onEnemyAttack: (enemyIndex: number, preSelectedTarget?: { type: "player" | "party"; index: number }) => { dodged: boolean; target: { type: "player" | "party"; index: number } };
  onEnemyTurnEnd: () => void;
  onEndBattle: (victory: boolean) => void;
  onSetAnimating: () => void;
  onFinishPlayerTurn: () => void;
  showDamageNumbers: boolean;
  regionTheme?: string;
}

type AnimPhase = "idle" | "runToEnemy" | "attacking" | "runBack" | "casting" | "hurt" | "defending" | "fujinSlice" | "incinerationSlash";

const ALLY_SLOTS = [
  { x: 12, y: 18 },
  { x: 4, y: 12 },
  { x: 20, y: 12 },
];

const ENEMY_SLOTS = [
  { x: 62, y: 42, z: 0.95 },
  { x: 74, y: 36, z: 0.85 },
  { x: 68, y: 50, z: 1.0 },
];

const PLAYER_POS = ALLY_SLOTS[0];
const PARTY_POSITIONS = [ALLY_SLOTS[1], ALLY_SLOTS[2]];
const ENEMY_POSITIONS = ENEMY_SLOTS;

export default function BattleScreen({
  player, battle, showDamageNumbers, onAttack, onCastSpell, onDefend, onUseItem, onPartyMemberAttack, onPartyMemberDefend, onPartyMemberCastSpell, onPartyMemberUseItem, onAdvancePartyTurn, onFinishPartyTurn, onEnemyAttack, onEnemyTurnEnd, onEndBattle, onSetAnimating, onFinishPlayerTurn, regionTheme,
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
  const [fireballAnim, setFireballAnim] = useState<{ fromX: number; fromY: number; toX: number; toY: number; active: boolean } | null>(null);
  const [potionVfx, setPotionVfx] = useState<{ x: number; y: number; color: string; active: boolean } | null>(null);
  const [bossOffset, setBossOffset] = useState<{ x: number; y: number } | null>(null);
  const [darkMagicSfx, setDarkMagicSfx] = useState(false);
  const [frostBreathAnim, setFrostBreathAnim] = useState<{ fromX: number; fromY: number; active: boolean } | null>(null);
  const [frostHitSfx, setFrostHitSfx] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; text: string; x: number; y: number; color: string }[]>([]);
  const [pendingTargetIdx, setPendingTargetIdx] = useState<number | null>(null);
  const [fujinSliceActive, setFujinSliceActive] = useState(false);
  const [fujinSlashes, setFujinSlashes] = useState<{ id: number; x: number; y: number; rotation: number; delay: number; sheet: string; frames: number; fw: number }[]>([]);
  const [fujinZoom, setFujinZoom] = useState(false);
  const [magicZoom, setMagicZoom] = useState(false);
  const [magicZoomTarget, setMagicZoomTarget] = useState<number | null>(null);
  const [fujinTargetIdx, setFujinTargetIdx] = useState<number | null>(null);
  const [fujinDashPhase, setFujinDashPhase] = useState<"none" | "windup" | "dash" | "strike" | "fadeout" | "return">("none");
  const [partyAnimIndex, setPartyAnimIndex] = useState(-1);
  const [partyAnimPhase, setPartyAnimPhase] = useState<"idle" | "runToEnemy" | "attacking" | "runBack" | "done">("idle");
  const [partyTargetIdx, setPartyTargetIdx] = useState<number | null>(null);
  const [partyAction, setPartyAction] = useState<"menu" | "selectTarget" | "selectMagicTarget" | "showSpells" | "showItems">("menu");
  const [partySelectedSpell, setPartySelectedSpell] = useState<Spell | null>(null);
  const [partyHurtIndex, setPartyHurtIndex] = useState(-1);
  const [dodgeBlur, setDodgeBlur] = useState<{ type: "player" | "party" | "enemy"; index: number } | null>(null);
  const [windAttackVfx, setWindAttackVfx] = useState<number | null>(null);
  const [windSpellVfx, setWindSpellVfx] = useState<{ type: "windBlade" | "galeSlash" | "tempest"; targets: number[] } | null>(null);
  const [tempestVortexActive, setTempestVortexActive] = useState(false);
  const [windBladeActive, setWindBladeActive] = useState(false);
  const [windBladeSlashes, setWindBladeSlashes] = useState<{ id: number; rotation: number; offsetX: number; offsetY: number; scale: number; active: boolean }[]>([]);
  const [windSparkleTarget, setWindSparkleTarget] = useState<number | null>(null);
  const [windBladeFrozenEnemy, setWindBladeFrozenEnemy] = useState<number | null>(null);
  const windSparkleAfterRunBack = useRef<number | null>(null);
  const windBladeDamageTarget = useRef<number | null>(null);
  const [deathAnimPending, setDeathAnimPending] = useState<Set<number>>(new Set());
  const [pixelDissolving, setPixelDissolving] = useState<Set<number>>(new Set());
  const [showVictoryUI, setShowVictoryUI] = useState(false);
  const [xpBarPhase, setXpBarPhase] = useState<"waiting" | "animating" | "done">("waiting");
  const [xpBarPercent, setXpBarPercent] = useState(0);
  const [xpBarLevel, setXpBarLevel] = useState(player.level);
  const [xpBarLevelUp, setXpBarLevelUp] = useState(false);
  const [dragonFireVfx, setDragonFireVfx] = useState<{ type: "burst" | "pillar"; x: number; y: number } | null>(null);
  const [fireImpactVfx, setFireImpactVfx] = useState<{ targetIdx: number; id: number }[]>([]);
  const [incinerationSlashActive, setIncinerationSlashActive] = useState(false);
  const [incinerationFrozenEnemy, setIncinerationFrozenEnemy] = useState<number | null>(null);
  const pendingIncinerationSlash = useRef<{ targetIdx: number; spell: Spell } | null>(null);
  const fireImpactId = useRef(0);
  const fujinSlashId = useRef(0);
  const damageIdRef = useRef(0);
  const prevPhaseRef = useRef(battle.phase);
  const prevLogLenRef = useRef(battle.log.length);
  const playerSpriteRef = useRef<HTMLDivElement>(null);
  const enemyTurnTimers = useRef<number[]>([]);

  const attackTimeoutRef = useRef<number | null>(null);

  const spells = getPlayerSpells(player);
  const consumables = player.inventory.filter(i => i.type === "consumable");
  const elementColor = ELEMENT_COLORS[player.element];
  const hpPercent = (battle.playerHp / player.stats.maxHp) * 100;
  const mpPercent = (battle.playerMp / player.stats.maxMp) * 100;
  const isLowHp = hpPercent < 25;

  const clearEnemyTurnTimers = useCallback(() => {
    enemyTurnTimers.current.forEach(id => clearTimeout(id));
    enemyTurnTimers.current = [];
  }, []);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    enemyTurnTimers.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    if (battle.phase === "victory" || battle.phase === "defeat") {
      setDragonFireVfx(null);
      setDarkMagicSfx(false);
      setFireHitSfx(false);
      setFrostHitSfx(false);
      setMagicZoom(false);
      setMagicZoomTarget(null);
    }
    if (battle.phase === "victory") {
      if (deathAnimPending.size > 0) return;
      const timer = setTimeout(() => setShowVictoryUI(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setShowVictoryUI(false);
      setXpBarPhase("waiting");
      setXpBarPercent(0);
      setXpBarLevel(player.level);
      setXpBarLevelUp(false);
    }
  }, [battle.phase, deathAnimPending]);

  useEffect(() => {
    if (!showVictoryUI || battle.phase !== "victory") return;

    const totalXp = battle.enemies.reduce((s, e) => s + e.xpReward, 0);
    const startXp = player.xp;
    const startLevel = player.level;
    const startXpToNext = player.xpToNext || xpForLevel(startLevel);

    setXpBarPercent((startXp / startXpToNext) * 100);
    setXpBarLevel(startLevel);
    setXpBarLevelUp(false);

    if (totalXp === 0) {
      setXpBarPhase("done");
      return;
    }

    setXpBarPhase("animating");

    const steps: { percent: number; level: number; levelUp: boolean; delay: number; snap: boolean }[] = [];
    let remaining = totalXp;
    let curXp = startXp;
    let curLevel = startLevel;
    let curXpToNext = startXpToNext;
    let totalDelay = 300;

    while (remaining > 0) {
      const xpToFill = curXpToNext - curXp;
      if (remaining >= xpToFill) {
        steps.push({ percent: 100, level: curLevel, levelUp: true, delay: totalDelay, snap: false });
        totalDelay += 700;
        remaining -= xpToFill;
        curLevel++;
        curXpToNext = xpForLevel(curLevel);
        curXp = 0;
        steps.push({ percent: 0, level: curLevel, levelUp: false, delay: totalDelay, snap: true });
        totalDelay += 100;
      } else {
        curXp += remaining;
        steps.push({ percent: (curXp / curXpToNext) * 100, level: curLevel, levelUp: false, delay: totalDelay, snap: false });
        totalDelay += 700;
        remaining = 0;
      }
    }

    const timers: number[] = [];
    for (const step of steps) {
      timers.push(window.setTimeout(() => {
        if (step.snap) {
          setXpBarPhase("waiting");
        }
        setXpBarPercent(step.percent);
        setXpBarLevel(step.level);
        setXpBarLevelUp(step.levelUp);
        if (step.snap) {
          requestAnimationFrame(() => setXpBarPhase("animating"));
        }
      }, step.delay));
    }

    timers.push(window.setTimeout(() => {
      setXpBarPhase("done");
    }, totalDelay + 300));

    return () => timers.forEach(t => clearTimeout(t));
  }, [showVictoryUI, battle.phase]);

  const spawnDamageNumber = useCallback((text: string, x: number, y: number, color: string) => {
    if (!showDamageNumbers) return;
    const id = damageIdRef.current++;
    setDamageNumbers(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1200);
  }, [showDamageNumbers]);

  const lastDmgEventIdRef = useRef(0);
  useEffect(() => {
    if (!battle.lastDamageEvent || !showDamageNumbers) return;
    const evt = battle.lastDamageEvent;
    if (evt.id <= lastDmgEventIdRef.current) return;
    lastDmgEventIdRef.current = evt.id;

    if (battle.lastDamageEvents && battle.lastDamageEvents.length > 1 && battle.lastDamageEvents.some(e => e.id === evt.id)) return;

    let posX: number, posY: number;
    let color = "#ef4444";

    if (evt.targetType === "enemy") {
      const ep = ENEMY_SLOTS[evt.targetIndex % ENEMY_SLOTS.length];
      posX = ep.x + (Math.random() * 6 - 3);
      posY = 100 - ep.y - 15 + (Math.random() * 4 - 2);
      color = evt.isCrit ? "#fbbf24" : "#ef4444";
    } else if (evt.targetType === "player") {
      const pp = ALLY_SLOTS[0];
      const dmgOffset = getSpriteCenterOffset(player.spriteId || "samurai", 0.5) + 3;
      posX = pp.x + (Math.random() * 4 - 2);
      posY = 100 - pp.y - dmgOffset;
      color = evt.element === "Fire" ? "#ff6b2b" : "#ef4444";
    } else {
      const slotIdx = (evt.targetIndex % PARTY_POSITIONS.length) + 1;
      const pp = ALLY_SLOTS[slotIdx];
      const memberSpriteId = battle.party[evt.targetIndex]?.spriteId || "samurai";
      const dmgOffset = getSpriteCenterOffset(memberSpriteId, 0.5) + 1;
      posX = pp.x + (Math.random() * 4 - 2);
      posY = 100 - pp.y - dmgOffset;
      color = "#ef4444";
    }

    if (evt.isHeal) {
      color = "#22c55e";
    }
    const text = evt.isHeal ? `+${evt.amount}` : (evt.isCrit ? "CRIT " : "") + evt.amount;
    const id = damageIdRef.current++;
    setDamageNumbers(prev => [...prev, { id, text, x: posX, y: posY, color }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1200);
  }, [battle.lastDamageEvent, showDamageNumbers]);

  const lastDmgEventsIdRef = useRef(0);
  useEffect(() => {
    const events = battle.lastDamageEvents;
    if (!events || events.length === 0 || !showDamageNumbers) return;
    const lastEvt = events[events.length - 1];
    const batchId = lastEvt ? lastEvt.id : 0;
    if (batchId <= lastDmgEventsIdRef.current) return;
    lastDmgEventsIdRef.current = batchId;

    events.forEach((evt, idx) => {
      setTimeout(() => {
        let posX: number, posY: number;
        let color = evt.isCrit ? "#fbbf24" : "#ef4444";

        if (evt.targetType === "enemy") {
          const ep = ENEMY_SLOTS[evt.targetIndex % ENEMY_SLOTS.length];
          posX = ep.x + (Math.random() * 6 - 3);
          posY = 100 - ep.y - 15 + (Math.random() * 4 - 2);
        } else if (evt.targetType === "player") {
          const pp = ALLY_SLOTS[0];
          const dmgOff = getSpriteCenterOffset(player.spriteId || "samurai", 0.5) + 3;
          posX = pp.x + (Math.random() * 4 - 2);
          posY = 100 - pp.y - dmgOff;
        } else {
          const slotIdx = (evt.targetIndex % PARTY_POSITIONS.length) + 1;
          const pp = ALLY_SLOTS[slotIdx];
          const mSpriteId = battle.party[evt.targetIndex]?.spriteId || "samurai";
          const dmgOff = getSpriteCenterOffset(mSpriteId, 0.5) + 1;
          posX = pp.x + (Math.random() * 4 - 2);
          posY = 100 - pp.y - dmgOff;
        }

        if (evt.isHeal) color = "#22c55e";
        const text = evt.isHeal ? `+${evt.amount}` : (evt.isCrit ? "CRIT " : "") + evt.amount;
        const id = damageIdRef.current++;
        setDamageNumbers(prev => [...prev, { id, text, x: posX, y: posY, color }]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1200);
      }, idx * 50);
    });
  }, [battle.lastDamageEvents, showDamageNumbers]);

  const handleAttackTarget = useCallback((targetIdx: number) => {
    setSelectedAction(null);
    setPendingTargetIdx(targetIdx);
    onSetAnimating();
    setAnimPhase("runToEnemy");
  }, [onSetAnimating]);

  const onPlayerTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.propertyName !== "left" && e.propertyName !== "bottom") return;
    
    if (animPhase === "runToEnemy") {
      setAnimPhase("attacking");
      playSfx(player.element === "Wind" ? "mifuneSlice" : "swordSwing");
      playSfx("gruntAttack", 0.7);
    } else if (animPhase === "runBack") {
      setAnimPhase("idle");
      setPendingTargetIdx(null);
      onFinishPlayerTurn();
    }
  }, [animPhase, onFinishPlayerTurn, player.element]);

  const onSpriteComplete = useCallback(() => {
    if (animPhase === "attacking") {
      if (pendingTargetIdx !== null) {
        onAttack(pendingTargetIdx);
      }
      
      if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current);
      attackTimeoutRef.current = window.setTimeout(() => {
        setAnimPhase("runBack");
      }, 333);
    } else if (animPhase === "hurt" || animPhase === "defending" || animPhase === "casting") {
      setAnimPhase("idle");
    }
  }, [animPhase, pendingTargetIdx, onAttack]);

  const handlePartyMemberAttack = useCallback((partyIdx: number, targetIdx: number) => {
    setPartyAnimIndex(partyIdx);
    setPartyTargetIdx(targetIdx);
    setPartyAction("menu");
    onSetAnimating();
    setPartyAnimPhase("runToEnemy");
  }, [onSetAnimating]);

  const onPartySpriteComplete = useCallback((idx: number) => {
    if (partyAnimIndex === idx && partyAnimPhase === "attacking") {
      if (partyTargetIdx !== null) {
        onPartyMemberAttack(partyAnimIndex, partyTargetIdx);
      }

      if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current);
      attackTimeoutRef.current = window.setTimeout(() => {
        setPartyAnimPhase("runBack");
      }, 333);
    }
  }, [partyAnimIndex, partyAnimPhase, partyTargetIdx, onPartyMemberAttack]);

  const onPartyTransitionEnd = useCallback((e: React.TransitionEvent, idx: number) => {
    if (e.propertyName !== "left" && e.propertyName !== "bottom") return;
    if (partyAnimIndex !== idx) return;

    if (partyAnimPhase === "runToEnemy") {
      setPartyAnimPhase("attacking");
      playSfx("swordSwing");
      playSfx("gruntAttack", 0.7);
    } else if (partyAnimPhase === "runBack") {
      setPartyAnimPhase("done");
      setPartyAnimIndex(-1);
      setPartyTargetIdx(null);
      onAdvancePartyTurn();
    }
  }, [partyAnimIndex, partyAnimPhase, onAdvancePartyTurn]);

  const startFujinSliceRef = useRef<((targetIdx: number, spell: Spell) => void) | null>(null);

  const pendingWindBlade = useRef<{ targetIdx: number; spell: Spell } | null>(null);
  const windBladeAnimPending = useRef(false);
  const castingNeedsRunBack = useRef(false);

  const handleSpellTarget = useCallback((targetIdx: number) => {
    if (!selectedSpell) return;
    if (selectedSpell.animation === "fujinSlice" && startFujinSliceRef.current) {
      startFujinSliceRef.current(targetIdx, selectedSpell);
      return;
    }
    if (selectedSpell.animation === "windBlade") {
      pendingWindBlade.current = { targetIdx, spell: selectedSpell };
      setSelectedAction(null);
      setPendingTargetIdx(targetIdx);
      onSetAnimating();
      setMagicZoom(true);
      setMagicZoomTarget(targetIdx);
      setAnimPhase("runToEnemy");
      setSelectedSpell(null);
      setShowSpells(false);
      return;
    }
    if (selectedSpell.animation === "incinerationSlash") {
      pendingIncinerationSlash.current = { targetIdx, spell: selectedSpell };
      setSelectedAction(null);
      setPendingTargetIdx(targetIdx);
      onSetAnimating();
      setMagicZoom(true);
      setMagicZoomTarget(targetIdx);
      setAnimPhase("runToEnemy");
      setSelectedSpell(null);
      setShowSpells(false);
      return;
    }
    setSelectedAction(null);
    setPendingTargetIdx(targetIdx);
    onSetAnimating();
    setAnimPhase("casting");
    setMagicZoom(true);
    setMagicZoomTarget(targetIdx);
    playSfx("magicRing", 0.6);
    onCastSpell(selectedSpell, targetIdx);
    setSelectedSpell(null);
    setShowSpells(false);
  }, [selectedSpell, onSetAnimating, onCastSpell]);

  const handleSelfSpell = useCallback((spell: Spell) => {
    onSetAnimating();
    setAnimPhase("casting");
    setMagicZoom(true);
    setMagicZoomTarget(null);
    playSfx("magicRing", 0.6);
    if (spell.animation === "galeSlash") {
      const aliveTargets = battle.enemies.map((_, i) => i).filter(i => battle.enemies[i].currentHp > 0);
      setWindSpellVfx({ type: "galeSlash", targets: aliveTargets });
      playSfx("whoosh");
      scheduleTimer(() => setWindSpellVfx(null), 800);
    } else if (spell.animation === "tempest") {
      const aliveTargets = battle.enemies.map((_, i) => i).filter(i => battle.enemies[i].currentHp > 0);
      setTempestVortexActive(true);
      setWindSpellVfx({ type: "tempest", targets: aliveTargets });
      playSfx("whoosh");
      scheduleTimer(() => playSfx("swordSwing"), 300);
      scheduleTimer(() => playSfx("whoosh"), 600);
      scheduleTimer(() => {
        setWindSpellVfx(null);
        setTempestVortexActive(false);
      }, 1800);
    } else if (spell.name === "Fire Storm") {
      const aliveTargets = battle.enemies.map((_, i) => i).filter(i => battle.enemies[i].currentHp > 0);
      aliveTargets.forEach((idx) => {
        scheduleTimer(() => {
          const id = ++fireImpactId.current;
          setFireImpactVfx(prev => [...prev, { targetIdx: idx, id }]);
          scheduleTimer(() => {
            setFireImpactVfx(prev => prev.filter(v => v.id !== id));
          }, 800);
        }, idx * 150);
      });
    }
    onCastSpell(spell);
    setSelectedSpell(null);
    setShowSpells(false);
    setSelectedAction(null);
  }, [onSetAnimating, onCastSpell, battle.enemies, scheduleTimer]);

  const handleDefend = useCallback(() => {
    onSetAnimating();
    setAnimPhase("defending");
    playSfx("block");
    onDefend();
  }, [onSetAnimating, onDefend]);

  const isDragonLord = useCallback((enemy: { id: string; isBoss: boolean }) => enemy.id === "dragon_lord" && enemy.isBoss, []);
  const isFrostLizard = useCallback((enemy: { id: string }) => enemy.id === "frost_lizard", []);
  const isJotem = useCallback((enemy: { id: string }) => enemy.id === "jotem", []);
  const isAnimatedEnemyCheck = useCallback((enemy: { id: string; element: string; isBoss: boolean }) => {
    return (enemy.element === "Fire" && !enemy.isBoss) || isDragonLord(enemy) || isFrostLizard(enemy) || isJotem(enemy);
  }, [isDragonLord, isFrostLizard, isJotem]);

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
  }, [onSetAnimating, onCastSpell, onFinishPlayerTurn, scheduleTimer]);

  startFujinSliceRef.current = startFujinSlice;

  const onEnemyDeathAnimDone = useCallback((idx: number) => {
    setDeathAnimPending(prev => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
    setPixelDissolving(prev => new Set(prev).add(idx));
  }, []);

  const onPixelDissolveComplete = useCallback((idx: number) => {
    setPixelDissolving(prev => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
  }, []);

  useEffect(() => {
    if (deathAnimPending.size > 0) {
      const fallback = setTimeout(() => {
        setDeathAnimPending(new Set());
      }, 3000);
      return () => clearTimeout(fallback);
    }
  }, [deathAnimPending]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    battle.enemies.forEach((enemy, idx) => {
      if (enemy.currentHp <= 0 && isAnimatedEnemyCheck(enemy) && enemyAnimStates[idx] !== "death" && enemyAnimStates[idx] !== "hurt" && !deathAnimPending.has(idx) && !pixelDissolving.has(idx)) {
        timers.push(setTimeout(() => {
          setDeathAnimPending(prev => new Set(prev).add(idx));
          setEnemyAnimStates(prev => ({ ...prev, [idx]: "death" }));
        }, 600));
      }
      if (enemy.currentHp <= 0 && !isAnimatedEnemyCheck(enemy) && !pixelDissolving.has(idx)) {
        timers.push(setTimeout(() => {
          setPixelDissolving(prev => new Set(prev).add(idx));
        }, 500));
      }
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [battle.enemies, isAnimatedEnemyCheck, enemyAnimStates, deathAnimPending, pixelDissolving]);

  useEffect(() => {
    if (battle.log.length <= prevLogLenRef.current) {
      prevLogLenRef.current = battle.log.length;
      return;
    }
    const newMessages = battle.log.slice(prevLogLenRef.current);
    prevLogLenRef.current = battle.log.length;

    for (const msg of newMessages) {
      const matched = msg.match(/(\d+)\s*(CRITICAL\s+|CRIT\s+)?damage/i) || msg.match(/deals\s+(\d+)\s*(CRIT\s+)?to/i);

      if (matched && animPhase === "attacking" && pendingTargetIdx !== null) {
        const tidx = pendingTargetIdx;
        setEnemyHitIdx(tidx);
        playSfx("hitMetal");
        const hitEnemy = battle.enemies[tidx];
        if (hitEnemy && isAnimatedEnemyCheck(hitEnemy)) {
          setEnemyAnimStates(prev => ({ ...prev, [tidx]: "hurt" }));
          scheduleTimer(() => {
            const e = battle.enemies[tidx];
            const isDying = e && e.currentHp <= 0;
            if (isDying) setDeathAnimPending(prev => new Set(prev).add(tidx));
            setEnemyAnimStates(prev => ({ ...prev, [tidx]: isDying ? "death" : "idle" }));
          }, 500);
        }
        if (matched[2]) {
          setShakeScreen(true);
          scheduleTimer(() => setShakeScreen(false), 400);
        }
        scheduleTimer(() => setEnemyHitIdx(null), 400);
      }
    }
  }, [battle.log.length, animPhase, pendingTargetIdx, battle.enemies, isAnimatedEnemyCheck, scheduleTimer]);

  const playerPos = (animPhase === "runToEnemy" || animPhase === "attacking") && pendingTargetIdx !== null
    ? { 
        x: ENEMY_POSITIONS[pendingTargetIdx % ENEMY_POSITIONS.length].x - (battle.enemies[pendingTargetIdx]?.isBoss ? 16 : 8), 
        y: ENEMY_POSITIONS[pendingTargetIdx % ENEMY_POSITIONS.length].y
      }
    : PLAYER_POS;

  const playerSprites = PARTY_SPRITE_MAP[player.spriteId || "samurai"];
  const spriteConfig = animPhase === "runToEnemy" || animPhase === "runBack"
    ? { src: playerSprites.run || playerSprites.idle, w: playerSprites.frameWidth, h: playerSprites.frameHeight, frames: playerSprites.runFrames || playerSprites.idleFrames, fps: 14, loop: true }
    : animPhase === "attacking"
    ? { src: playerSprites.attack, w: playerSprites.frameWidth, h: playerSprites.frameHeight, frames: playerSprites.attackFrames, fps: 14, loop: false }
    : animPhase === "hurt"
    ? { src: playerSprites.hurt, w: playerSprites.frameWidth, h: playerSprites.frameHeight, frames: playerSprites.hurtFrames, fps: 8, loop: false }
    : { src: playerSprites.idle, w: playerSprites.frameWidth, h: playerSprites.frameHeight, frames: playerSprites.idleFrames, fps: 8, loop: true };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      <LavaBattleBg />
      
      {damageNumbers.map(d => (
        <div
          key={d.id}
          className="absolute z-50 pointer-events-none animate-[damageFloat_1.2s_ease-out_forwards]"
          style={{
            left: `${d.x}%`,
            bottom: `${d.y}%`,
            fontSize: d.text.includes("CRIT") ? "28px" : "24px",
            fontWeight: 900,
            color: d.color,
            WebkitTextStroke: "2px black",
          }}
        >
          {d.text}
        </div>
      ))}

      <div className="relative z-10 h-full">
        <div className="absolute inset-0 overflow-hidden">
          <div
            ref={playerSpriteRef}
            className="absolute"
            style={{
              zIndex: 50,
              left: `${playerPos.x}%`,
              bottom: `${playerPos.y}%`,
              transform: "translateX(-50%)",
              transition: (animPhase === "runToEnemy" || animPhase === "runBack") ? "left 0.35s ease-in-out, bottom 0.35s ease-in-out" : "none",
            }}
            onTransitionEnd={onPlayerTransitionEnd}
          >
            <SpriteAnimator
              key={`${player.spriteId}-${animPhase}`}
              spriteSheet={spriteConfig.src}
              frameWidth={spriteConfig.w}
              frameHeight={spriteConfig.h}
              totalFrames={spriteConfig.frames}
              fps={spriteConfig.fps}
              scale={playerSprites.scale || 3.5}
              loop={spriteConfig.loop}
              onComplete={onSpriteComplete}
            />
          </div>

          {battle.party.map((member, idx) => {
            const spriteInfo = PARTY_SPRITE_MAP[member.spriteId];
            const isActive = partyAnimIndex === idx;
            const isMoving = isActive && (partyAnimPhase === "runToEnemy" || partyAnimPhase === "runBack");
            const isAttacking = isActive && partyAnimPhase === "attacking";
            const basePos = PARTY_POSITIONS[idx % PARTY_POSITIONS.length];
            const currentPos = (isActive && (partyAnimPhase === "runToEnemy" || partyAnimPhase === "attacking") && partyTargetIdx !== null)
              ? { x: ENEMY_POSITIONS[partyTargetIdx % ENEMY_POSITIONS.length].x - 8, y: ENEMY_POSITIONS[partyTargetIdx % ENEMY_POSITIONS.length].y }
              : basePos;

            return (
              <div
                key={member.id}
                className="absolute"
                style={{
                  zIndex: isActive ? 55 : 20,
                  left: `${currentPos.x}%`,
                  bottom: `${currentPos.y}%`,
                  transform: "translateX(-50%)",
                  transition: isMoving ? "left 0.35s ease-in-out, bottom 0.35s ease-in-out" : "none",
                }}
                onTransitionEnd={(e) => onPartyTransitionEnd(e, idx)}
              >
                <SpriteAnimator
                  spriteSheet={isMoving ? spriteInfo.run || spriteInfo.idle : isAttacking ? spriteInfo.attack : spriteInfo.idle}
                  frameWidth={spriteInfo.frameWidth}
                  frameHeight={spriteInfo.frameHeight}
                  totalFrames={isMoving ? (spriteInfo.runFrames || spriteInfo.idleFrames) : isAttacking ? spriteInfo.attackFrames : spriteInfo.idleFrames}
                  fps={12}
                  scale={spriteInfo.scale || 3.5}
                  loop={!isAttacking}
                  onComplete={() => onPartySpriteComplete(idx)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
