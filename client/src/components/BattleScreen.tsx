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

const ENEMY_SPRITE_DATA: Record<string, { frameWidth: number; frameHeight: number; idleFrames: number; attackFrames: number; hurtFrames: number; deathFrames?: number; walkFrames?: number; scale?: number }> = {
  dragon_lord: { frameWidth: 160, frameHeight: 160, idleFrames: 4, attackFrames: 16, hurtFrames: 5, deathFrames: 36, walkFrames: 8, scale: 2.8 },
  frost_lizard: { frameWidth: 148, frameHeight: 96, idleFrames: 6, attackFrames: 5, hurtFrames: 2, scale: 1.5 },
  jotem: { frameWidth: 128, frameHeight: 128, idleFrames: 6, attackFrames: 10, hurtFrames: 5, deathFrames: 12, walkFrames: 8, scale: 2.5 },
};

const ENEMY_POSITIONS = [
  { x: 62, y: 46, z: 0.95 },
  { x: 74, y: 40, z: 0.85 },
  { x: 68, y: 54, z: 1.0 },
];

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
  const [partyHurtIndex, setPartyHurtIndex] = useState<number | null>(null);
  const [partyAction, setPartyAction] = useState<"menu" | "selectTarget" | "selectMagicTarget" | "showSpells" | "showItems">("menu");
  const [partySelectedSpell, setPartySelectedSpell] = useState<Spell | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<{ type: "enemy" | "party" | "player"; index: number } | null>(null);

  const renderTargetHighlight = (type: "enemy" | "party" | "player", index: number) => {
    if (!hoveredTarget || hoveredTarget.type !== type || hoveredTarget.index !== index) return null;
    return (
      <div className="absolute inset-[-15px] pointer-events-none animate-pulse" style={{
        border: "3px dashed #fbbf24",
        boxShadow: "0 0 15px #fbbf24, inset 0 0 15px #fbbf24",
        zIndex: 10,
        imageRendering: "pixelated"
      }} />
    );
  };

  const isDragonLord = (e: any) => e.type === "dragon_lord" || e.id === "dragon_lord" || e.name === "Dragon Lord";
  const isJotem = (e: any) => e.type === "jotem" || e.id === "jotem" || e.name === "Jotem";
  const isFrostLizard = (e: any) => e.type === "frost_lizard" || e.id === "frost_lizard" || e.name === "Frost Lizard";

  const getEnemySpriteData = (enemy: any) => {
    if (isDragonLord(enemy)) return ENEMY_SPRITE_DATA.dragon_lord;
    if (isFrostLizard(enemy)) return ENEMY_SPRITE_DATA.frost_lizard;
    if (isJotem(enemy)) return ENEMY_SPRITE_DATA.jotem;
    return { frameWidth: 128, frameHeight: 128, idleFrames: 1, attackFrames: 1, hurtFrames: 1, scale: 3 };
  };

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
    onCastSpell(spell);
    setSelectedSpell(null);
    setShowSpells(false);
  }, [onSetAnimating, onCastSpell]);

  const handleDefend = useCallback(() => {
    setSelectedAction(null);
    onDefend();
    onSetAnimating();
    setAnimPhase("defending");
    setTimeout(() => {
      setAnimPhase("idle");
      onFinishPlayerTurn();
    }, 800);
  }, [onDefend, onSetAnimating, onFinishPlayerTurn]);

  const handleSpellSelect = (spell: Spell) => {
    if (spell.targetType === "none" || spell.targetType === "self") {
      handleSelfSpell(spell);
    } else {
      setSelectedSpell(spell);
      setSelectedAction("magic");
      setShowSpells(false);
    }
  };

  const handleEnemyClick = (idx: number) => {
    if (battle.phase === "playerTurn") {
      if (selectedAction === "attack") {
        handleAttackTarget(idx);
      } else if (selectedAction === "magic" && selectedSpell) {
        handleSpellTarget(idx);
      }
    } else if (battle.phase === "partyTurn") {
      if (partyAction === "selectTarget") {
        setPartyTargetIdx(idx);
        setPartyAnimPhase("runToEnemy");
        setPartyAction("menu");
      } else if (partyAction === "selectMagicTarget" && partySelectedSpell) {
        onPartyMemberCastSpell(battle.activePartyIndex, partySelectedSpell, idx);
        setPartyAction("menu");
        playSfx("magicRing");
        setTimeout(() => onAdvancePartyTurn(), 600);
      }
    }
  };

  const onPixelDissolveComplete = (idx: number) => {
    setPixelDissolving(prev => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
  };

  const onEnemyDeathAnimDone = (idx: number) => {
    setEnemyAnimStates(prev => ({ ...prev, [idx]: "idle" }));
    setDeathAnimPending(prev => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
    setPixelDissolving(prev => new Set([...prev, idx]));
  };

  useEffect(() => {
    if (battle.phase === "playerTurn" || battle.phase === "partyTurn") {
      clearEnemyTurnTimers();
    }
  }, [battle.phase, clearEnemyTurnTimers]);

  const partyRunBackHandled = useRef(false);

  const getEnemySprite = (type: string) => ENEMY_SPRITES[type] || ENEMY_SPRITES.slime_fire;

  const isInputBlocked = animPhase !== "idle" || partyAnimPhase !== "idle" || battle.phase === "animating";
  const tc = elementColor;
  const turnLabel = battle.phase === "playerTurn" ? "Player Turn" : battle.phase === "partyTurn" ? "Party Turn" : "Enemy Turn";

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950" style={{ fontFamily: "'Press Start 2P', cursive" }}>
      <ParticleCanvas />
      {regionTheme === "volcanic" && <LavaBattleBg />}

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        <div className="flex-1 relative">
          <div
            className={`absolute flex flex-col items-center transition-all duration-500 ${battle.playerHp <= 0 ? 'opacity-30' : ''}`}
            style={{
              left: `${PLAYER_POS.x}%`,
              bottom: `${PLAYER_POS.y}%`,
              transform: "translateX(-50%)",
              zIndex: animPhase === "runToEnemy" || animPhase === "attacking" || animPhase === "runBack" ? 50 : 20,
              filter: dodgeBlur && dodgeBlur.type === "player" ? "blur(3px) opacity(0.6)" : "none",
              transition: animPhase === "runToEnemy"
                ? "left 0.35s ease-in, bottom 0.35s ease-in, filter 0.2s ease"
                : "left 0.35s ease-out, bottom 0.35s ease-out, filter 0.2s ease",
            }}
            onTransitionEnd={(e) => {
              if (e.propertyName !== "left") return;
              if (animPhase === "runToEnemy") {
                setAnimPhase("attacking");
                playSfx("swordSwing");
                if (pendingTargetIdx !== null) {
                  onAttack(pendingTargetIdx);
                }
                setTimeout(() => setAnimPhase("runBack"), 400);
              } else if (animPhase === "runBack") {
                setAnimPhase("idle");
                setPendingTargetIdx(null);
                onFinishPlayerTurn();
              }
            }}
          >
            <SpriteAnimator
              spriteSheet={
                animPhase === "runToEnemy" || animPhase === "runBack" ? (PARTY_SPRITE_MAP[player.spriteId]?.run || samuraiRun)
                : animPhase === "attacking" ? (PARTY_SPRITE_MAP[player.spriteId]?.attack || samuraiAttack)
                : animPhase === "hurt" ? (PARTY_SPRITE_MAP[player.spriteId]?.hurt || samuraiHurt)
                : (PARTY_SPRITE_MAP[player.spriteId]?.idle || samuraiIdle)
              }
              frameWidth={PARTY_SPRITE_MAP[player.spriteId]?.frameWidth || 96}
              frameHeight={PARTY_SPRITE_MAP[player.spriteId]?.frameHeight || 96}
              totalFrames={
                animPhase === "runToEnemy" || animPhase === "runBack" ? (PARTY_SPRITE_MAP[player.spriteId]?.runFrames || 8)
                : animPhase === "attacking" ? (PARTY_SPRITE_MAP[player.spriteId]?.attackFrames || 7)
                : animPhase === "hurt" ? (PARTY_SPRITE_MAP[player.spriteId]?.hurtFrames || 4)
                : (PARTY_SPRITE_MAP[player.spriteId]?.idleFrames || 10)
              }
              fps={animPhase === "attacking" ? 14 : (animPhase === "runToEnemy" || animPhase === "runBack" ? 14 : 8)}
              scale={PARTY_SPRITE_MAP[player.spriteId]?.scale || 3.5}
              loop={animPhase !== "attacking" && animPhase !== "hurt"}
            />
          </div>

          {battle.party.map((member, idx) => {
            const pos = PARTY_POSITIONS[idx % PARTY_POSITIONS.length];
            const isActiveParty = battle.phase === "partyTurn" && battle.activePartyIndex === idx;
            const isDead = member.currentHp <= 0;
            const isRunning = partyAnimIndex === idx && (partyAnimPhase === "runToEnemy" || partyAnimPhase === "runBack");
            const isAttacking = partyAnimIndex === idx && partyAnimPhase === "attacking";
            const isHurt = partyHurtIndex === idx;
            const posX = isRunning || isAttacking ? (partyTargetIdx !== null ? ENEMY_POSITIONS[partyTargetIdx % ENEMY_POSITIONS.length].x - 10 : pos.x) : pos.x;
            const posY = isRunning || isAttacking ? (partyTargetIdx !== null ? ENEMY_POSITIONS[partyTargetIdx % ENEMY_POSITIONS.length].y : pos.y) : pos.y;
            const spriteInfo = PARTY_SPRITE_MAP[member.spriteId] || PARTY_SPRITE_MAP.samurai;
            const spriteSheet = isRunning && spriteInfo.run ? spriteInfo.run : isHurt ? spriteInfo.hurt : isAttacking ? spriteInfo.attack : spriteInfo.idle;
            const spriteFrames = isRunning && spriteInfo.runFrames ? spriteInfo.runFrames : isHurt ? spriteInfo.hurtFrames : isAttacking ? spriteInfo.attackFrames : spriteInfo.idleFrames;

            return (
              <div
                key={member.id}
                className={`absolute flex flex-col items-center ${isDead ? 'opacity-30' : ''}`}
                style={{
                  zIndex: (partyAnimPhase === "runToEnemy" || partyAnimPhase === "attacking" || partyAnimPhase === "runBack") && isActiveParty ? 55 : 20,
                  left: `${posX}%`,
                  bottom: `${posY}%`,
                  transform: "translateX(-50%)",
                  filter: dodgeBlur && dodgeBlur.type === "party" && dodgeBlur.index === idx ? "blur(3px) opacity(0.6)" : "none",
                  transition: isRunning ? "left 0.35s ease-in, bottom 0.35s ease-in, filter 0.2s ease" : "left 0.35s ease-out, bottom 0.35s ease-out, filter 0.2s ease",
                }}
                onTransitionEnd={(e) => {
                  if (e.propertyName !== "left") return;
                  if (!isActiveParty) return;
                  if (partyAnimPhase === "runToEnemy") {
                    setPartyAnimPhase("attacking");
                    playSfx("swordSwing");
                    if (partyTargetIdx !== null) onPartyMemberAttack(battle.activePartyIndex, partyTargetIdx);
                    scheduleTimer(() => {
                      partyRunBackHandled.current = false;
                      setPartyAnimPhase("runBack");
                      scheduleTimer(() => {
                        if (!partyRunBackHandled.current) {
                          partyRunBackHandled.current = true;
                          setPartyAnimPhase("idle");
                          setPartyTargetIdx(null);
                          scheduleTimer(() => {
                            if (battle.enemies.every(e => e.currentHp <= 0)) return;
                            onAdvancePartyTurn();
                          }, 600);
                        }
                      }, 500);
                    }, 400);
                  } else if (partyAnimPhase === "runBack" && !partyRunBackHandled.current) {
                    partyRunBackHandled.current = true;
                    setPartyAnimPhase("idle");
                    setPartyTargetIdx(null);
                    scheduleTimer(() => {
                      if (battle.enemies.every(e => e.currentHp <= 0)) return;
                      onAdvancePartyTurn();
                    }, 600);
                  }
                }}
              >
                <SpriteAnimator
                  spriteSheet={spriteSheet}
                  frameWidth={spriteInfo.frameWidth}
                  frameHeight={spriteInfo.frameHeight}
                  totalFrames={spriteFrames}
                  fps={isAttacking ? 14 : isRunning ? 14 : 8}
                  scale={spriteInfo.scale || 3.5}
                  loop={!isAttacking && !isHurt}
                />
              </div>
            );
          })}

          <div className="absolute z-20 pointer-events-none" style={{ left: "8px", top: "6px", width: "auto", maxWidth: "420px" }}>
            <div className="flex flex-col gap-1">
              {[
                { name: player.name, level: player.level, hp: battle.playerHp, maxHp: player.stats.maxHp, mp: battle.playerMp, maxMp: player.stats.maxMp, element: player.element, isPlayer: true, isDead: battle.playerHp <= 0, isActive: battle.phase === "playerTurn", buffs: battle.buffs, xp: player.xp, xpToNext: player.xpToNext },
                ...battle.party.map((member, idx) => ({ name: member.name, level: member.level || 1, hp: member.currentHp, maxHp: member.stats.maxHp, mp: member.currentMp, maxMp: member.stats.maxMp, element: member.element, isPlayer: false, isDead: member.currentHp <= 0, isActive: battle.phase === "partyTurn" && battle.activePartyIndex === idx, buffs: [] as typeof battle.buffs, xp: member.xp || 0, xpToNext: member.xpToNext || 100 })),
              ].map((char, i) => {
                const charHpPct = Math.max(0, (char.hp / char.maxHp) * 100);
                const charMpPct = Math.max(0, (char.mp / char.maxMp) * 100);
                const charXpPct = char.xpToNext > 0 ? Math.min(100, (char.xp / char.xpToNext) * 100) : 0;
                const charLowHp = charHpPct <= 25;
                const elColor = ELEMENT_COLORS[char.element];
                const isAnimating = animPhase !== "idle" || partyAnimPhase !== "idle" || battle.phase === "animating" || battle.phase === "enemyTurn";
                const charOpacity = char.isDead ? 0.3 : isAnimating ? 0.35 : 1;
                return (
                  <div key={i} className="relative" style={{ width: "230px", opacity: charOpacity, transition: "opacity 0.4s ease" }}>
                    <div className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(15,10,30,0.9) 0%, rgba(10,5,25,0.95) 100%)", border: `2px solid ${char.isActive ? elColor + "60" : elColor + "25"}`, boxShadow: char.isActive ? `0 0 12px ${elColor}30, inset 0 1px 0 rgba(255,255,255,0.05)` : "inset 0 1px 0 rgba(255,255,255,0.03)", imageRendering: "pixelated" }}>
                      <div className="px-2.5 py-1.5" style={{ borderBottom: `1px solid ${elColor}15` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 flex-shrink-0" style={{ background: elColor, boxShadow: char.isActive ? `0 0 4px ${elColor}` : `0 0 2px ${elColor}60` }} />
                            <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: char.isActive ? "#f0eaff" : "#b8b0c8", textShadow: char.isActive ? `0 0 6px ${elColor}40` : "none", letterSpacing: "0.05em", imageRendering: "pixelated" }}>{char.name}</span>
                          </div>
                          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: (battle.phase === "victory" && showVictoryUI && char.isPlayer && xpBarLevelUp) ? "#fde047" : `${elColor}80`, imageRendering: "pixelated" }}>
                            Lv{(battle.phase === "victory" && showVictoryUI && char.isPlayer) ? xpBarLevel : char.level}{(battle.phase === "victory" && showVictoryUI && char.isPlayer && xpBarLevelUp) ? "+" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="px-2.5 py-1.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "7px", color: charLowHp ? "#fca5a5" : "#6b8a6b", width: "18px", imageRendering: "pixelated" }}>HP</span>
                          <div className="flex-1 h-2.5 overflow-hidden relative" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <div className={`h-full transition-all duration-500 ease-out ${charLowHp ? "animate-pulse" : ""}`} style={{ width: `${charHpPct}%`, background: charLowHp ? "#ef4444" : charHpPct > 50 ? "#22c55e" : "#eab308", boxShadow: charLowHp ? "0 0 4px rgba(239,68,68,0.6)" : charHpPct > 50 ? "0 0 2px rgba(34,197,94,0.4)" : "0 0 2px rgba(234,179,8,0.4)", imageRendering: "pixelated" }} />
                          </div>
                          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "7px", color: charLowHp ? "#fca5a5" : "#a8a0b8", minWidth: "50px", textAlign: "right", imageRendering: "pixelated" }}>{char.hp}/{char.maxHp}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "7px", color: "#5b7db5", width: "18px", imageRendering: "pixelated" }}>MP</span>
                          <div className="flex-1 h-2 overflow-hidden relative" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="h-full transition-all duration-500 ease-out" style={{ width: `${charMpPct}%`, background: "#3b82f6", boxShadow: "0 0 2px rgba(59,130,246,0.4)", imageRendering: "pixelated" }} />
                          </div>
                          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "7px", color: "#7ca0c4", minWidth: "50px", textAlign: "right", imageRendering: "pixelated" }}>{char.mp}/{char.maxMp}</span>
                        </div>
                      </div>
                      {char.isActive && <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 0%, ${elColor} 20%, ${elColor} 80%, transparent 100%)`, boxShadow: `0 0 4px ${elColor}80` }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {battle.enemies.map((enemy, idx) => {
            const isDead = enemy.currentHp <= 0;
            const enemyHpPct = (enemy.currentHp / enemy.stats.hp) * 100;
            const isTargetable = !isDead && (
              (!isInputBlocked && (selectedAction === "attack" || (selectedAction === "magic" && selectedSpell?.targetType === "enemy"))) ||
              (battle.phase === "partyTurn" && (partyAction === "selectTarget" || partyAction === "selectMagicTarget"))
            );
            const isHit = enemyHitIdx === idx;
            const spriteImg = getEnemySprite(enemy.id);
            const isBoss = enemy.isBoss;
            const pos = ENEMY_POSITIONS[idx % ENEMY_POSITIONS.length];
            const isBossMoving = (isDragonLord(enemy) || isJotem(enemy)) && bossOffset !== null;
            const bossLeft = isBossMoving ? pos.x + bossOffset.x : pos.x;
            const bossBottom = isBossMoving ? pos.y + bossOffset.y : pos.y;
            const spriteData = getEnemySpriteData(enemy);
            const frameW = spriteData.frameWidth;
            const frameH = spriteData.frameHeight;
            const scale = spriteData.scale || 3;

            return (
              <div
                key={idx}
                className="absolute"
                style={{
                  left: `${bossLeft}%`,
                  bottom: `${bossBottom}%`,
                  transform: "translateX(-50%)",
                  zIndex: Math.floor(pos.y),
                  transition: isBossMoving ? "left 0.5s ease, bottom 0.5s ease" : "none",
                }}
              >
                <div className={`${isDead ? "pointer-events-none" : ""} ${isHit ? "animate-[enemyHit_0.4s_ease-out]" : ""}`} style={{ transform: `scale(${pos.z})` }}>
                  <div className="flex flex-col items-center">
                    <div className={`relative ${isDead ? "" : "animate-[idleBob_2.8s_ease-in-out_infinite]"}`} style={{ width: frameW * scale, height: frameH * scale, pointerEvents: "auto" }}>
                      {isTargetable && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                          <Target className="w-8 h-8 text-yellow-400 animate-bounce drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                        </div>
                      )}
                      {renderTargetHighlight("enemy", idx)}
                      <div className="absolute inset-0 pointer-events-none" style={{ border: isTargetable ? "2px solid rgba(253,224,71,0.5)" : "none", borderRadius: "8px" }} />
                      <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={1000} pixelSize={6}>
                        <div className="w-full h-full flex items-end justify-center overflow-visible" style={{ filter: `drop-shadow(0 4px 16px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(255,60,0,0.4))` }}>
                          <SpriteAnimator
                            spriteSheet={
                              isDragonLord(enemy) ? (
                                enemyAnimStates[idx] === "death" ? dragonLordDeath : enemyAnimStates[idx] === "attack" ? dragonLordAttack : enemyAnimStates[idx] === "hurt" ? dragonLordHurt : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? dragonLordWalk : dragonLordIdle
                              ) : isJotem(enemy) ? (
                                enemyAnimStates[idx] === "death" ? jotemDeath : enemyAnimStates[idx] === "slash" ? jotemSlash : enemyAnimStates[idx] === "attack" ? jotemAttack : enemyAnimStates[idx] === "hurt" ? jotemHurt : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? jotemWalk : jotemIdle
                              ) : isFrostLizard(enemy) ? (
                                enemyAnimStates[idx] === "death" ? frostLizardHurt : enemyAnimStates[idx] === "attack" ? frostLizardAttack : enemyAnimStates[idx] === "hurt" ? frostLizardHurt : frostLizardIdle
                              ) : spriteImg
                            }
                            frameWidth={frameW}
                            frameHeight={frameH}
                            totalFrames={
                              isDragonLord(enemy) ? (enemyAnimStates[idx] === "death" ? 36 : enemyAnimStates[idx] === "attack" ? 16 : enemyAnimStates[idx] === "hurt" ? 5 : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? 8 : 8)
                              : isJotem(enemy) ? (enemyAnimStates[idx] === "death" ? 12 : enemyAnimStates[idx] === "slash" ? 10 : enemyAnimStates[idx] === "attack" ? 10 : enemyAnimStates[idx] === "hurt" ? 5 : (enemyAnimStates[idx] || "idle") === "walk" || (enemyAnimStates[idx] || "idle") === "walkBack" ? 8 : 6)
                              : isFrostLizard(enemy) ? (enemyAnimStates[idx] === "death" ? 2 : enemyAnimStates[idx] === "attack" ? 5 : enemyAnimStates[idx] === "hurt" ? 2 : 6)
                              : 1
                            }
                            fps={enemyAnimStates[idx] === "attack" ? 16 : 10}
                            scale={scale}
                            loop={enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death" && enemyAnimStates[idx] !== "slash"}
                            flipX={true}
                            onComplete={enemyAnimStates[idx] === "death" ? () => onEnemyDeathAnimDone?.(idx) : undefined}
                            style={{ cursor: isTargetable ? "pointer" : "default" }}
                            onClick={() => isTargetable && handleEnemyClick(idx)}
                          />
                        </div>
                      </PixelDissolve>
                    </div>
                    <div className="w-24 mt-1" style={{ opacity: isDead ? 0 : 1 }}>
                      <div className="h-1.5 w-full bg-black/60 border border-white/10 relative overflow-hidden">
                        <div className="h-full transition-all duration-500" style={{ width: `${enemyHpPct}%`, background: enemyHpPct > 50 ? "#22c55e" : enemyHpPct > 25 ? "#eab308" : "#ef4444" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {battle.enemies.map((enemy, idx) => {
            const isDead = enemy.currentHp <= 0;
            const pos = ENEMY_POSITIONS[idx % ENEMY_POSITIONS.length];
            return (
              <div key={`label-${idx}`} className="absolute pointer-events-none" style={{ left: `${pos.x}%`, bottom: `${pos.y + 12}%`, transform: "translateX(-50%)", zIndex: 60, opacity: isDead ? 0 : 1 }}>
                <div style={{ background: "linear-gradient(180deg, rgba(15,10,30,0.9) 0%, rgba(10,5,25,0.95) 100%)", border: `2px solid ${ELEMENT_COLORS[enemy.element]}30`, padding: "3px 8px", imageRendering: "pixelated" }}>
                  <div className="flex items-center justify-center gap-1.5" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                    <span style={{ fontSize: "8px", color: ELEMENT_COLORS[enemy.element] }}>Lv{enemy.level}</span>
                    <span style={{ fontSize: "9px", color: "#f0eaff" }}>{enemy.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 transition-all duration-300" style={{ opacity: isInputBlocked ? 0 : 1, transform: isInputBlocked ? "translateY(20px)" : "translateY(0)", pointerEvents: isInputBlocked ? "none" : "auto" }}>
          <div className="mx-2 mb-2 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(15,10,30,0.85) 0%, rgba(10,5,25,0.95) 100%)", border: `2px solid ${tc}50`, boxShadow: `0 0 20px ${tc}20, inset 0 1px 0 rgba(255,255,255,0.05)`, imageRendering: "pixelated" }}>
            <div className="px-3 py-0.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${tc}25`, background: `${tc}10` }}>
              <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: `${tc}90` }}>{turnLabel}</span>
            </div>
            <div className="px-3 py-2 flex-1 overflow-y-auto min-h-0 relative">
              {battle.phase === "playerTurn" && !showItems && !showSpells && (
                <>
                  {selectedAction === "attack" || selectedAction === "magic" ? (
                    <div className="flex flex-col gap-1">
                      <button className="flex items-center gap-2 p-2 border border-white/10 hover:bg-white/5" onClick={() => setSelectedAction(null)}>
                        <ArrowLeft className="w-3 h-3 opacity-50" />
                        <span style={{ fontSize: "9px", opacity: 0.5 }}>BACK</span>
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        {battle.enemies.map((enemy, idx) => !enemy.currentHp ? null : (
                          <button
                            key={idx}
                            className="p-2 border-2 border-amber-500/30 bg-amber-950/20 hover:bg-amber-500/20 flex items-center justify-between group"
                            onMouseEnter={() => setHoveredTarget({ type: "enemy", index: idx })}
                            onMouseLeave={() => setHoveredTarget(null)}
                            onClick={() => handleEnemyClick(idx)}
                          >
                            <span style={{ fontSize: "9px", color: "#fcd34d" }}>{enemy.name.toUpperCase()}</span>
                            <Target className="w-3 h-3 text-amber-500/40 group-hover:text-amber-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { key: "attack", label: "ATK", icon: <Swords className="w-5 h-5" />, color: "#ef4444", onClick: () => setSelectedAction("attack") },
                        { key: "defend", label: "DEF", icon: <Shield className="w-5 h-5" />, color: "#3b82f6", onClick: handleDefend },
                        { key: "magic", label: "MAG", icon: <Sparkles className="w-5 h-5" />, color: "#a855f7", onClick: () => setShowSpells(true) },
                        { key: "item", label: "ITEM", icon: <Package className="w-5 h-5" />, color: "#22c55e", onClick: () => setShowItems(true), disabled: consumables.length === 0 },
                      ].map(btn => (
                        <button key={btn.key} onClick={btn.onClick} disabled={btn.disabled} className="flex flex-col items-center gap-1.5 py-2.5 border-2 border-white/10 hover:bg-white/5 disabled:opacity-20" style={{ color: btn.color }}>
                          {btn.icon}
                          <span style={{ fontSize: "9px" }}>{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {battle.phase === "partyTurn" && (() => {
                const activeMember = battle.party[battle.activePartyIndex];
                if (!activeMember || activeMember.currentHp <= 0) return null;
                const partySpells = getPartyMemberSpells(activeMember.element, activeMember.level || 1, activeMember.learnedSpells || []);
                return (
                  <>
                    {partyAction === "selectTarget" || partyAction === "selectMagicTarget" ? (
                      <div className="flex flex-col gap-1">
                        <button className="flex items-center gap-2 p-2 border border-white/10 hover:bg-white/5" onClick={() => setPartyAction("menu")}>
                          <ArrowLeft className="w-3 h-3 opacity-50" />
                          <span style={{ fontSize: "9px", opacity: 0.5 }}>BACK</span>
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          {battle.enemies.map((enemy, idx) => !enemy.currentHp ? null : (
                            <button
                              key={idx}
                              className="p-2 border-2 border-amber-500/30 bg-amber-950/20 hover:bg-amber-500/20 flex items-center justify-between group"
                              onMouseEnter={() => setHoveredTarget({ type: "enemy", index: idx })}
                              onMouseLeave={() => setHoveredTarget(null)}
                              onClick={() => handleEnemyClick(idx)}
                            >
                              <span style={{ fontSize: "9px", color: "#fcd34d" }}>{enemy.name.toUpperCase()}</span>
                              <Target className="w-3 h-3 text-amber-500/40 group-hover:text-amber-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : partyAction === "showSpells" ? (
                      <div className="space-y-1">
                        <button className="flex items-center gap-2 p-2 border border-white/10" onClick={() => setPartyAction("menu")}>
                          <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                        <div className="grid grid-cols-2 gap-1.5">
                          {partySpells.map(spell => (
                            <button key={spell.id} className="p-2 border border-white/10 hover:bg-white/5 text-left flex justify-between items-center" onClick={() => { setPartySelectedSpell(spell); setPartyAction("selectMagicTarget"); }}>
                              <span style={{ fontSize: "8px" }}>{spell.name}</span>
                              <span style={{ fontSize: "7px", color: "#93c5fd" }}>{spell.mpCost}MP</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { key: "attack", label: "ATK", icon: <Swords className="w-5 h-5" />, color: "#ef4444", onClick: () => setPartyAction("selectTarget") },
                          { key: "defend", label: "DEF", icon: <Shield className="w-5 h-5" />, color: "#3b82f6", onClick: () => { onPartyMemberDefend(battle.activePartyIndex); onAdvancePartyTurn(); } },
                          { key: "magic", label: "MAG", icon: <Sparkles className="w-5 h-5" />, color: "#a855f7", onClick: () => setPartyAction("showSpells") },
                          { key: "item", label: "ITEM", icon: <Package className="w-5 h-5" />, color: "#22c55e", onClick: () => setPartyAction("showItems") },
                        ].map(btn => (
                          <button key={btn.key} onClick={btn.onClick} className="flex flex-col items-center gap-1.5 py-2.5 border-2 border-white/10" style={{ color: btn.color }}>
                            {btn.icon}
                            <span style={{ fontSize: "9px" }}>{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes enemyHit { 0% { filter: brightness(2); transform: translateX(5px); } 100% { filter: brightness(1); transform: translateX(0); } }
        @keyframes idleBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
}
