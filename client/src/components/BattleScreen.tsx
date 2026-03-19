import { useState, useEffect, useRef, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import ParticleCanvas from "./ParticleCanvas";
import SpriteAnimator from "./SpriteAnimator";
import PixelDissolve from "./PixelDissolve";
import BattleTransition from "./BattleTransition";
import type { PlayerCharacter, BattleState, Spell, BattlePartyMember } from "@shared/schema";
import { ELEMENT_COLORS, getPlayerSpells, getPartyMemberSpells, xpForLevel, generateDemonKinSpawn } from "@/lib/gameData";
import { useColorMap } from "@/hooks/useColorMap";
import { groupConsumables } from "@/lib/utils";
import LavaBattleBg from "./LavaBattleBg";
import BattleEffectsLayer from "./BattleEffectsLayer";
import { Swords, Shield, Sparkles, Package, Heart, Droplets, Trophy, Skull, Target, ArrowLeft, Zap, LogOut, Feather, Axe, Eye, Flame } from "lucide-react";

import { playSfx, playSfxPitched, stopSfx } from "@/lib/sfx";
import { playAmbient, playAmbientWithFade, stopAll, fadeMusicTo, fadeOutMusic, playJingle } from "@/lib/music";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import samuraiAttack from "@/assets/images/samurai-attack.png";
import samuraiHurt from "@/assets/images/samurai-hurt.png";
import samuraiRun from "@/assets/images/samurai-run.png";
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
import demonKinIdle from "@/assets/images/demonkin-idle.png";
import demonKinAttack from "@/assets/images/demonkin-attack.png";
import demonKinHurt from "@/assets/images/demonkin-hurt.png";
import demonKinDeath from "@/assets/images/demonkin-death.png";
import demonKinWalk from "@/assets/images/demonkin-walk.png";

import vfxFireBurst from "@/assets/images/vfx-fire-burst.png";
import vfxFirePillar from "@/assets/images/vfx-fire-pillar.png";
import forestBattleBg from "@assets/A_pixel_art_forest__upscayl_2x_digital-art-4x_1773689565858.png";
import guardSpriteSheet from "@assets/10_weaponhit_spritesheet_1771628904150.png";
import blockShieldVfx from "@assets/Spell_1-Sheet_1773896633775.png";
import firespinSheet from "@assets/7_firespin_spritesheet_1771795176253.png";
import nukeExplosionSheet from "@assets/Nuke_Explosion_1771631384679.png";
import knightEruptionSheet from "@assets/knight_1771631932532.png";
import eruptionBuildupSheet from "@assets/eruption_cleave_-_buildup_1773921740507.png";
import eruptionAuraSheet from "@assets/Eruption_Cleave_Aura_1773921754594.png";

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


import ytrielIdle from "@assets/IDLE_1773544582793.png";
import ytrielAttack from "@assets/ATTACK_1773544582792.png";
import ytrielFlying from "@assets/FLYING_1773544582793.png";
import ytrielHurt from "@assets/HURT_1773544582793.png";
import ytrielDeath from "@assets/DEATH_1773544582793.png";
import ytrielTransition from "@assets/TRANSITION_1773544582794.png";
import ytrielSlashSheet from "@assets/Fire_1773545741081.png";

import minotaurIdle from "@assets/iDLE_1773579538178.png";
import minotaurWalk from "@assets/WALK_1773579538178.png";
import minotaurAttack1 from "@assets/ATTACK1_1773579538177.png";
import minotaurAttack2 from "@assets/ATTACK2_1773579538177.png";
import minotaurHurt from "@assets/HURT_1773579538178.png";
import minotaurDeath from "@assets/DEATH_1773579538178.png";
import cyclopsIdle from "@assets/IDLE_1773579566925.png";
import cyclopsWalk from "@assets/WALK_1773579566925.png";
import cyclopsAttack1 from "@assets/ATTACK_1_1773579566924.png";
import cyclopsAttack2 from "@assets/ATTACK_2_1773579566924.png";
import cyclopsHurt from "@assets/HURT_1773579566925.png";
import cyclopsDeath from "@assets/DEATH_1773579566925.png";
import harpyIdle from "@assets/IDLE_1773579631532.png";
import harpyMove from "@assets/MOVE_1773579631533.png";
import harpyAttack from "@assets/ATTACK_1773579631531.png";
import harpyHurt from "@assets/HURT_1773579631532.png";
import harpyDeath from "@assets/DEATH_1773579631532.png";

import reskIdle from "@assets/IDLE_1773707989726.png";
import reskRun from "@assets/RUN_1773707989729.png";
import reskAttack1 from "@assets/ATTACK_1_1773707989725.png";
import reskAttack2 from "@assets/ATTACK_2_1773707989725.png";
import reskHurt from "@assets/HURT_1773707989726.png";
import reskDeath from "@assets/DEATH_1773707989725.png";

import infernoBallSheet from "@assets/dragon_lord_magic_1_1771826439516.png";
import infernoBallExplodeSheet from "@assets/dragon_lord_magic_1_part_2_1771826450239.png";
import ytrielExpD1  from "@assets/explosion-d1_1773546117139.png";
import ytrielExpD2  from "@assets/explosion-d2_1773546117139.png";
import ytrielExpD3  from "@assets/explosion-d3_1773546117139.png";
import ytrielExpD4  from "@assets/explosion-d4_1773546117139.png";
import ytrielExpD5  from "@assets/explosion-d5_1773546117140.png";
import ytrielExpD6  from "@assets/explosion-d6_1773546117140.png";
import ytrielExpD7  from "@assets/explosion-d7_1773546117140.png";
import ytrielExpD8  from "@assets/explosion-d8_1773546117141.png";
import ytrielExpD9  from "@assets/explosion-d9_1773546117141.png";
import ytrielExpD10 from "@assets/explosion-d10_1773546117141.png";
import ytrielExpD11 from "@assets/explosion-d11_1773546117142.png";
import ytrielExpD12 from "@assets/explosion-d12_1773546117142.png";

import vfxWindSlash1 from "@/assets/images/vfx-wind-slash1.png";
import vfxWindSlash2 from "@/assets/images/vfx-wind-slash2.png";
import vfxWindSlash3 from "@/assets/images/vfx-wind-slash3.png";
import vfxWindVortex from "@/assets/images/vfx-wind-vortex.png";
import windSlashAnim from "@/assets/images/wind-slash-anim.png";
import windSparkleSheet from "@/assets/images/wind-sparkle.png";
import mifuneBurstSheet from "@/assets/images/mifune-burst.png";

import slknightIdle from "@/assets/images/slknight-idle.png";
import slknightAttack from "@/assets/images/slknight-attack.png";
import slknightHurt from "@/assets/images/slknight-hurt.png";
import slknightRun from "@/assets/images/slknight-run.png";
import slknightSpecial from "@/assets/images/slknight-special.png";
import slknightIncSlash from "@assets/Attacks_1773895515346.png";
import slknightDeath from "@/assets/images/slknight-death.png";
import slknightJump from "@/assets/images/slknight-jump.png";
import slknightAirAttack from "@/assets/images/slknight-airattack.png";
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

import baskenThunderCast from "@/assets/images/basken-thunder-cast.png";
import lightningBeginningPart3 from "@/assets/images/Lightning_beginning3_part.png";
import lightningBeginningPart4 from "@/assets/images/Lightning_beginning4_part.png";
import lightningBeginningPart5 from "@/assets/images/Lightning_beginning5_part.png";
import lightningBeginning1 from "@/assets/images/Lightning_beginning1.png";
import lightningBeginning2 from "@/assets/images/Lightning_beginning2.png";
import lightningBeginning3 from "@/assets/images/Lightning_beginning3.png";
import lightningBeginning4 from "@/assets/images/Lightning_beginning4.png";
import lightningBeginning5 from "@/assets/images/Lightning_beginning5.png";
import lightningCycle1 from "@/assets/images/Lightning_cycle1.png";
import lightningCycle2 from "@/assets/images/Lightning_cycle2.png";
import lightningCycle3 from "@/assets/images/Lightning_cycle3.png";
import lightningCycle4 from "@/assets/images/Lightning_cycle4.png";
import lightningCycle5 from "@/assets/images/Lightning_cycle5.png";
import lightningCycle6 from "@/assets/images/Lightning_cycle6.png";
import lightningEnd1 from "@/assets/images/Lightning_end1.png";
import lightningEnd2 from "@/assets/images/Lightning_end2.png";
import lightningEnd3 from "@/assets/images/Lightning_end3.png";
import lightningSpot1 from "@/assets/images/Lightning_spot1.png";
import lightningSpot2 from "@/assets/images/Lightning_spot2.png";
import lightningSpot3 from "@/assets/images/Lightning_spot3.png";
import lightningSpot4 from "@/assets/images/Lightning_spot4.png";
import healingIcon from "@/assets/healing_icon.png";

const LIGHTNING_VFX_SEQUENCE = [
  { src: lightningBeginningPart3, w: 64, h: 64, isSpot: true },
  { src: lightningBeginningPart4, w: 64, h: 64, isSpot: true },
  { src: lightningBeginningPart5, w: 64, h: 64, isSpot: true },
  { src: lightningBeginning1, w: 64, h: 193, isSpot: false },
  { src: lightningBeginning2, w: 64, h: 193, isSpot: false },
  { src: lightningBeginning3, w: 64, h: 193, isSpot: false },
  { src: lightningBeginning4, w: 64, h: 193, isSpot: false },
  { src: lightningBeginning5, w: 64, h: 193, isSpot: false },
  { src: lightningCycle1, w: 64, h: 193, isSpot: false },
  { src: lightningCycle2, w: 64, h: 193, isSpot: false },
  { src: lightningCycle3, w: 64, h: 193, isSpot: false },
  { src: lightningCycle4, w: 64, h: 193, isSpot: false },
  { src: lightningCycle5, w: 64, h: 193, isSpot: false },
  { src: lightningCycle6, w: 64, h: 193, isSpot: false },
  { src: lightningEnd1, w: 64, h: 193, isSpot: false },
  { src: lightningEnd2, w: 64, h: 193, isSpot: false },
  { src: lightningEnd3, w: 64, h: 193, isSpot: false },
  { src: lightningSpot1, w: 64, h: 64, isSpot: true },
  { src: lightningSpot2, w: 64, h: 64, isSpot: true },
  { src: lightningSpot3, w: 64, h: 64, isSpot: true },
  { src: lightningSpot4, w: 64, h: 64, isSpot: true },
];

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
  samurai: { idle: samuraiIdle, attack: samuraiAttack, hurt: samuraiHurt, run: samuraiRun, frameWidth: 96, frameHeight: 96, idleFrames: 10, attackFrames: 7, hurtFrames: 3, runFrames: 8, scale: 3.5 },
  knight: { idle: slknightIdle, attack: slknightAttack, hurt: slknightHurt, run: slknightRun, walk: slknightRun, special: slknightSpecial, death: slknightDeath, frameWidth: 128, frameHeight: 64, idleFrames: 8, attackFrames: 9, hurtFrames: 4, runFrames: 8, walkFrames: 8, specialFrames: 12, deathFrames: 4, scale: 2 },
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

const HARPY_COLOR_VARIANTS: Array<Record<string, string> | null> = [
  null,
  { "#0069aa": "#a80e00", "#00396d": "#6b0900", "#657392": "#926761", "#92a1b9": "#bb948f", "#c7cfdd": "#e2cdca" },
  { "#0069aa": "#1a8c3d", "#00396d": "#0a4d1f", "#657392": "#537365", "#92a1b9": "#85b998", "#c7cfdd": "#c5ddc9" },
  { "#0069aa": "#6a00aa", "#00396d": "#3a006d", "#657392": "#6e5892", "#92a1b9": "#a490b9", "#c7cfdd": "#d3c7dd" },
  { "#0069aa": "#aa7000", "#00396d": "#6d3e00", "#657392": "#927055", "#92a1b9": "#b9a880", "#c7cfdd": "#ddd4ba" },
];

const RESK_COLOR_MAP: Record<string, string> = {
  "#131313": "#0d1a0d",
  "#1b1b1b": "#0f2010",
  "#272727": "#152815",
  "#3d3d3d": "#1a3d1a",
  "#5d5d5d": "#2a5a2a",
  "#657392": "#3d7a3d",
  "#92a1b9": "#6aaa6a",
  "#c7cfdd": "#b8ddb8",
  "#b4b4b4": "#90c890",
  "#ffffff": "#e0ffe0",
  "#e69c69": "#9ec840",
  "#f6ca9f": "#c8e870",
  "#f9e6cf": "#e0f090",
  "#c42430": "#20aa30",
  "#571c27": "#1c5720",
  "#891e2b": "#1e6920",
  "#b84818": "#188048",
  "#bf6f4a": "#4a9050",
  "#ed7614": "#20c040",
  "#ff5000": "#10dd10",
  "#ffa214": "#70e830",
  "#ffc825": "#90f040",
  "#ffeb57": "#b8ff50",
};

interface BattleScreenProps {
  player: PlayerCharacter;
  battle: BattleState;
  onAttack: (targetIndex: number) => void;
  onAttackFirstHit: (targetIndex: number) => void;
  onAttackSecondHit: () => void;
  onCastSpell: (spell: Spell, targetIndex?: number) => void;
  onDefend: () => void;
  onUseItem: (itemId: string) => void;
  onPartyMemberAttack: (partyIndex: number, targetIndex: number) => void;
  onPartyMemberDefend: (partyIndex: number) => void;
  onPartyMemberCastSpell: (partyIndex: number, spell: Spell, targetIndex?: number) => void;
  onPartyMemberUseItem: (partyIndex: number, itemId: string) => void;
  onAdvancePartyTurn: () => void;
  onFinishPartyTurn: () => void;
  onEnemyAttack: (enemyIndex: number, preSelectedTarget?: { type: "player" | "party"; index: number }, forceMagic?: boolean) => { dodged: boolean; target: { type: "player" | "party"; index: number } };
  onEnemyTurnEnd: () => void;
  onEndBattle: (victory: boolean) => void;
  onSetAnimating: () => void;
  onFinishPlayerTurn: () => void;
  onRepositionUnit: (unitType: "player" | "party", unitIndex: number, newRow: number, newCol: number) => void;
  onFlee: () => void;
  onSpawnEnemy?: (slotIndex: number, enemy: import("@shared/schema").Enemy & { currentHp: number }) => void;
  onRollLoot?: () => void;
  showDamageNumbers: boolean;
  regionTheme?: string;
  regionTier?: number;
  enemyColorVariant?: number;
}

type AnimPhase = "idle" | "runToEnemy" | "attacking" | "runBack" | "casting" | "hurt" | "defending" | "fujinSlice" | "incinerationSlash" | "eruptionCleave" | "thunderBolt";

const ALLY_SLOTS: { x: number; y: number }[] = [
  { x: 11, y: 28 },
  { x: 20, y: 28 },
  { x: 29, y: 28 },
];

const ENEMY_SLOTS: { x: number; y: number; z: number }[] = [
  { x: 57, y: 28, z: 1.0 },
  { x: 66, y: 28, z: 1.0 },
  { x: 75, y: 28, z: 1.0 },
];

const getEnemyGroundYShift = (enemy: { id: string; element: string; isBoss?: boolean }): number => {
  const isFireDemon = enemy.element === "Fire" && !enemy.isBoss && enemy.id !== "demon_kin";
  if (isFireDemon || enemy.id === "harpy_wind") return -35;
  if (enemy.id === "cyclops_wind") return 34;
  if (enemy.id === "minotaur_wind") return 20;
  if (enemy.id === "demon_kin") return 42;
  return 0;
};

const PLAYER_POS = ALLY_SLOTS[0];
const PARTY_POSITIONS = [ALLY_SLOTS[1], ALLY_SLOTS[2]];
const ENEMY_POSITIONS = ENEMY_SLOTS;

const EL_PIX: Record<string, { grid: string[]; pal: Record<string, string> }> = {
  Fire: {
    grid: [
      '...F...',
      '..FOF..',
      '.FOOFO.',
      'FOOYYOF',
      'FOYYYYF',
      '.FFOOFF',
      '..FFFF.',
      '...FF..',
    ],
    pal: { F: '#ef4444', O: '#f97316', Y: '#fbbf24' },
  },
  Ice: {
    grid: [
      '..W.W..',
      '...B...',
      'W.BBB.W',
      '.BBBBB.',
      'W.BBB.W',
      '...B...',
      '..W.W..',
    ],
    pal: { B: '#22d3ee', W: '#e0f7fa' },
  },
  Lightning: {
    grid: [
      '.YYYY..',
      '.YYY...',
      'YYYY...',
      '.YYYYY.',
      '...YYY.',
      '...YY..',
      '....Y..',
    ],
    pal: { Y: '#fbbf24', W: '#fef08a' },
  },
  Water: {
    grid: [
      '...L...',
      '..LBL..',
      '.LBBBL.',
      'LBBBBBL',
      '.LBBBL.',
      '..LBL..',
      '...L...',
    ],
    pal: { B: '#3b82f6', L: '#93c5fd' },
  },
  Wind: {
    grid: [
      '.GGG...',
      'G...G..',
      'GL.....',
      '.GGGG..',
      '.....GL',
      '....G..',
      '...GGG.',
    ],
    pal: { G: '#84cc16', L: '#d9f99d' },
  },
  Earth: {
    grid: [
      '...B...',
      '..BBB..',
      '.BDDBB.',
      'BDDDGDB',
      '.BDDBB.',
      '..BBB..',
      '...B...',
    ],
    pal: { B: '#92400e', D: '#b45309', G: '#d97706' },
  },
  Shadow: {
    grid: [
      '..PPP..',
      '.P...P.',
      'PP.....',
      'PP.DD..',
      'PP.....',
      '.P...P.',
      '..PPP..',
    ],
    pal: { P: '#7c3aed', D: '#c4b5fd' },
  },
  Light: {
    grid: [
      'W..Y..W',
      '.W.Y.W.',
      '..WYW..',
      'YYYWYYY',
      '..WYW..',
      '.W.Y.W.',
      'W..Y..W',
    ],
    pal: { Y: '#fbbf24', W: '#fef9c3' },
  },
};

function ElementPixelIcon({ element, pixelSize = 3 }: { element: string; pixelSize?: number }) {
  const spec = EL_PIX[element];
  if (!spec) return null;
  const { grid, pal } = spec;
  const cols = grid[0].length;
  const rows = grid.length;
  return (
    <svg
      width={cols * pixelSize}
      height={rows * pixelSize}
      style={{ imageRendering: 'pixelated', flexShrink: 0 }}
      shapeRendering="crispEdges"
    >
      {grid.map((row, y) =>
        row.split('').map((ch, x) =>
          ch !== '.' && pal[ch] ? (
            <rect
              key={`${x}-${y}`}
              x={x * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={pal[ch]}
            />
          ) : null
        )
      )}
    </svg>
  );
}

const YTRIEL_EXPLOSION_FRAMES = [
  ytrielExpD1, ytrielExpD2, ytrielExpD3, ytrielExpD4,
  ytrielExpD5, ytrielExpD6, ytrielExpD7, ytrielExpD8,
  ytrielExpD9, ytrielExpD10, ytrielExpD11, ytrielExpD12,
];

function YtrielExplosion({ onComplete }: { onComplete: () => void }) {
  const [frame, setFrame] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  useEffect(() => {
    if (frame >= YTRIEL_EXPLOSION_FRAMES.length - 1) { onCompleteRef.current(); return; }
    const t = setTimeout(() => setFrame(f => f + 1), Math.round(1000 / 12));
    return () => clearTimeout(t);
  }, [frame]);
  return (
    <img
      src={YTRIEL_EXPLOSION_FRAMES[frame]}
      style={{ width: 256, height: 256, imageRendering: "pixelated" as const }}
      alt=""
    />
  );
}

function AnimatedHpBar({ value, max, lowThreshold = 25, height = "2.5" }: { value: number; max: number; lowThreshold?: number; height?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const [ghostPct, setGhostPct] = useState(pct);
  const prevPctRef = useRef(pct);
  const ghostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const newPct = Math.max(0, Math.min(100, (value / max) * 100));
    const prevPct = prevPctRef.current;
    if (newPct < prevPct) {
      if (ghostTimerRef.current) clearTimeout(ghostTimerRef.current);
      ghostTimerRef.current = setTimeout(() => setGhostPct(newPct), 450);
    } else {
      if (ghostTimerRef.current) clearTimeout(ghostTimerRef.current);
      setGhostPct(newPct);
    }
    prevPctRef.current = newPct;
  }, [value, max]);

  useEffect(() => () => { if (ghostTimerRef.current) clearTimeout(ghostTimerRef.current); }, []);

  const lowHp = pct <= lowThreshold;
  const barColor = lowHp
    ? "linear-gradient(90deg, #ef4444, #ff7070)"
    : pct > 50
      ? "linear-gradient(90deg, #22c55e, #6efa9e)"
      : "linear-gradient(90deg, #f59e0b, #fde047)";
  const barShadow = lowHp
    ? "0 0 8px 2px rgba(239,68,68,1.0), inset 0 1px 0 rgba(255,255,255,0.25)"
    : pct > 50
      ? "0 0 8px 2px rgba(34,197,94,0.95), inset 0 1px 0 rgba(255,255,255,0.25)"
      : "0 0 8px 2px rgba(245,158,11,0.95), inset 0 1px 0 rgba(255,255,255,0.25)";

  return (
    <div
      className="flex-1 overflow-visible relative"
      style={{ height: `${height === "2.5" ? "10px" : "8px"}`, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.15)" }}
    >
      <div
        className="absolute h-full"
        style={{
          width: `${ghostPct}%`,
          background: "rgba(255, 210, 80, 0.38)",
          transition: "width 0.75s ease-out",
        }}
      />
      <div
        className={`absolute h-full ${lowHp ? "animate-pulse" : ""}`}
        style={{
          width: `${pct}%`,
          background: barColor,
          boxShadow: barShadow,
          imageRendering: "pixelated",
          transition: "width 0.3s ease-out",
        }}
      />
    </div>
  );
}

export default function BattleScreen({
  player, battle, showDamageNumbers, onAttack, onAttackFirstHit, onAttackSecondHit, onCastSpell, onDefend, onUseItem, onPartyMemberAttack, onPartyMemberDefend, onPartyMemberCastSpell, onPartyMemberUseItem, onAdvancePartyTurn, onFinishPartyTurn, onEnemyAttack, onEnemyTurnEnd, onEndBattle, onSetAnimating, onFinishPlayerTurn, onRepositionUnit, onFlee, regionTheme, onSpawnEnemy, onRollLoot, regionTier, enemyColorVariant,
}: BattleScreenProps) {
  const _bsPlayerSprites = PARTY_SPRITE_MAP[player.spriteId || "samurai"] || PARTY_SPRITE_MAP.samurai;
  const playerColorMap = useColorMap(_bsPlayerSprites.idle, _bsPlayerSprites.frameWidth, _bsPlayerSprites.frameHeight, player.colorGroups);

  const getPlayerGridPos = () => {
    const gp = battle.gridPositions;
    if (!gp) return ALLY_SLOTS[0];
    return ALLY_SLOTS[gp.player] || ALLY_SLOTS[0];
  };

  const getPartyGridPos = (idx: number) => {
    const gp = battle.gridPositions;
    if (!gp || gp.party[idx] === undefined) return PARTY_POSITIONS[idx % PARTY_POSITIONS.length];
    return ALLY_SLOTS[gp.party[idx]] || PARTY_POSITIONS[idx % PARTY_POSITIONS.length];
  };

  const getEnemyGridPos = (idx: number) => {
    const enemy = battle.enemies[idx];
    if (enemy?.isBoss) return ENEMY_SLOTS[0];
    const gp = battle.gridPositions;
    if (!gp || gp.enemies[idx] === undefined) return ENEMY_POSITIONS[idx % ENEMY_POSITIONS.length];
    return ENEMY_SLOTS[gp.enemies[idx]] || ENEMY_POSITIONS[idx % ENEMY_POSITIONS.length];
  };

  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [showSpells, setShowSpells] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [startReady, setStartReady] = useState(false);
  const [resultLabel, setResultLabel] = useState<string | null>(null);
  const [enemyHitIdx, setEnemyHitIdx] = useState<number | null>(null);
  const [playerFlash, setPlayerFlash] = useState(false);
  const [fireHitSfx, setFireHitSfx] = useState(false);
  const [enemyAnimStates, setEnemyAnimStates] = useState<Record<number, "idle" | "flying" | "transition" | "attack" | "hurt" | "death" | "walk" | "walkBack" | "slash" | "castInferno">>({});
  const [fireballAnim, setFireballAnim] = useState<{ fromX: number; fromY: number; toX: number; toY: number; active: boolean } | null>(null);
  const [potionVfx, setPotionVfx] = useState<{ x: number; y: number; color: string; active: boolean } | null>(null);
  const [bossOffset, setBossOffset] = useState<Record<number, { x: number; y: number } | null>>({});
  const [darkMagicSfx, setDarkMagicSfx] = useState(false);
  const [frostBreathAnim, setFrostBreathAnim] = useState<{ fromX: number; fromY: number; active: boolean } | null>(null);
  const [frostHitSfx, setFrostHitSfx] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; text: string; x: number; y: number; color: string; isBlocked?: boolean; isHeal?: boolean; element?: string; isCrit?: boolean; label?: string }[]>([]);
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
  const [repositionMode, setRepositionMode] = useState<{ unitType: "player" | "party"; unitIndex: number } | null>(null);
  const [partySelectedSpell, setPartySelectedSpell] = useState<Spell | null>(null);
  const [partyHurtIndex, setPartyHurtIndex] = useState(-1);
  const [partyGuardIndex, setPartyGuardIndex] = useState(-1);
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
  const deathSfxPlayed = useRef<Set<number>>(new Set());
  const [pixelDissolving, setPixelDissolving] = useState<Set<number>>(new Set());
  const [dissolvedEnemies, setDissolvedEnemies] = useState<Set<number>>(new Set());
  const [demonKinSpawnAnim, setDemonKinSpawnAnim] = useState<{ slotIndex: number } | null>(null);
  const [forestAttackVariant, setForestAttackVariant] = useState<Record<number, 1 | 2>>({});
  const [showVictoryUI, setShowVictoryUI] = useState(false);
  const [victoryReady, setVictoryReady] = useState(false);
  const [showDefeatUI, setShowDefeatUI] = useState(false);
  const [showDefeatOverlay, setShowDefeatOverlay] = useState(false);
  const [defeatOverlayDone, setDefeatOverlayDone] = useState(false);
  const [fleeFailed, setFleeFailed] = useState(false);
  const [xpBarPhase, setXpBarPhase] = useState<"waiting" | "animating" | "done">("waiting");
  const [xpBarPercent, setXpBarPercent] = useState(0);
  const [xpBarLevel, setXpBarLevel] = useState(player.level);
  const [xpBarLevelUp, setXpBarLevelUp] = useState(false);
  const [dragonFireVfx, setDragonFireVfx] = useState<{ type: "burst" | "pillar"; x: number; y: number } | null>(null);
  const [infernoBallAnim, setInfernoBallAnim] = useState<{
    phase: "spawn" | "travel" | "explode";
    fromX: number; fromY: number;
    toX: number; toY: number;
    enemyIdx: number;
    preTarget: { type: "player" | "party"; index: number };
    onDone: (() => void) | null;
  } | null>(null);
  const [ytrielSlashAnim, setYtrielSlashAnim] = useState<{
    phase: "spawn" | "travel" | "explode";
    fromX: number; fromY: number;
    toX: number; toY: number;
    enemyIdx: number;
    preTarget: { type: "player" | "party"; index: number };
    onDone: (() => void) | null;
  } | null>(null);
  const [fireImpactVfx, setFireImpactVfx] = useState<{ targetIdx: number; id: number; isIncSlash?: boolean }[]>([]);
  const [incinerationSlashActive, setIncinerationSlashActive] = useState(false);
  const [incinerationFrozenEnemy, setIncinerationFrozenEnemy] = useState<number | null>(null);
  const [incinerationCasterPos, setIncinerationCasterPos] = useState<{ x: number; y: number } | null>(null);
  const pendingIncinerationSlash = useRef<{ targetIdx: number; spell: Spell } | null>(null);
  const [eruptionCleaveActive, setEruptionCleaveActive] = useState(false);
  const [eruptionFlamelashActive, setEruptionFlamelashActive] = useState(false);
  const [eruptionShakeIntensity, setEruptionShakeIntensity] = useState(0);
  const [eruptionNukeActive, setEruptionNukeActive] = useState(false);
  const [eruptionNukeTargetIdx, setEruptionNukeTargetIdx] = useState<number | null>(null);
  const [eruptionFrozenEnemy, setEruptionFrozenEnemy] = useState<number | null>(null);
  const [eruptionSubPhase, setEruptionSubPhase] = useState<"idle" | "run" | "jumpRise" | "jumpHold" | "jumpFall">("idle");
  const [eruptionBuildupActive, setEruptionBuildupActive] = useState(false);
  const [eruptionAuraActive, setEruptionAuraActive] = useState(false);
  const [eruptionKnightX, setEruptionKnightX] = useState(PLAYER_POS.x);
  const [eruptionKnightY, setEruptionKnightY] = useState(PLAYER_POS.y);
  const [eruptionAirAttackRestartKey, setEruptionAirAttackRestartKey] = useState(0);
  const [eruptionAirAttackStartFrame, setEruptionAirAttackStartFrame] = useState(0);
  const pendingEruptionCleave = useRef<{ targetIdx: number; spell: Spell } | null>(null);
  const pendingPartySpellRef = useRef<{ spell: Spell; targetIdx: number; pIdx: number } | null>(null);
  const [thunderBoltActive, setThunderBoltActive] = useState(false);
  const [thunderBoltFrame, setThunderBoltFrame] = useState(0);
  const [thunderFrozenEnemy, setThunderFrozenEnemy] = useState<number | null>(null);
  const pendingThunderBolt = useRef<{ targetIdx: number; spell: any } | null>(null);
  const eruptionFirechargeAudio = useRef<HTMLAudioElement | null>(null);
  const eruptionFlamelashAudio = useRef<HTMLAudioElement | null>(null);
  const fireImpactId = useRef(0);
  const fujinSlashId = useRef(0);
  const ytrielHasFlown = useRef(false);
  const damageIdRef = useRef(0);
  const prevPhaseRef = useRef(battle.phase);
  const prevLogLenRef = useRef(battle.log.length);
  const playerSpriteRef = useRef<HTMLDivElement>(null);
  const enemyTurnTimers = useRef<number[]>([]);
  const leafBattleCanvasRef = useRef<HTMLCanvasElement>(null);
  const leafBattleRafRef = useRef<number>(0);

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
    const t = window.setTimeout(() => setStartReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (regionTheme !== "Wind") return;
    const canvas = leafBattleCanvasRef.current;
    if (!canvas) return;
    let s = 90731;
    const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
    const COLORS = ["#3a8c18", "#5aaa28", "#88cc44", "#4a9820", "#a0d840", "#c8e850"];
    const spawnLeaf = (w: number, h: number) => ({
      x: -10 as number,
      y: 30 + rng() * (h * 0.78),
      vx: 0.5 + rng() * 1.1,
      vy: -0.08 + rng() * 0.22,
      rot: rng() * Math.PI * 2,
      rotSpd: (rng() - 0.5) * 0.07,
      alpha: 0.45 + rng() * 0.45,
      size: 4 + rng() * 5,
      color: COLORS[Math.floor(rng() * COLORS.length)],
    });
    canvas.width = canvas.offsetWidth || 640;
    canvas.height = canvas.offsetHeight || 400;
    const leaves = Array.from({ length: 28 }, () => {
      const l = spawnLeaf(canvas.width, canvas.height);
      l.x = rng() * canvas.width;
      return l;
    });
    const draw = () => {
      const w = canvas.offsetWidth || canvas.width;
      const h = canvas.offsetHeight || canvas.height;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { leafBattleRafRef.current = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, w, h);
      const t = performance.now() / 1000;
      for (const lf of leaves) {
        lf.x += lf.vx + Math.sin(t * 0.4 + lf.rot) * 0.25;
        lf.y += lf.vy + Math.sin(t * 0.3 + lf.rot * 1.3) * 0.18;
        lf.rot += lf.rotSpd;
        if (lf.x > w + 20) Object.assign(lf, spawnLeaf(w, h));
        if (lf.y > h * 0.88 || lf.y < -20) { lf.y = 30 + rng() * (h * 0.78); lf.x = rng() * w; }
        ctx.save();
        ctx.translate(lf.x, lf.y);
        ctx.rotate(lf.rot);
        ctx.globalAlpha = lf.alpha;
        ctx.fillStyle = lf.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, lf.size, lf.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      leafBattleRafRef.current = requestAnimationFrame(draw);
    };
    leafBattleRafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(leafBattleRafRef.current);
  }, [regionTheme]);

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
      setVictoryReady(false);
    } else {
      setShowVictoryUI(false);
      setVictoryReady(false);
      setXpBarPhase("waiting");
      setXpBarPercent(0);
      setXpBarLevel(player.level);
      setXpBarLevelUp(false);
    }
    if (battle.phase === "defeat") {
      setShowDefeatOverlay(true);
      setShowDefeatUI(true);
      fadeOutMusic(1800);
      playAmbientWithFade("game_over", 1800);
    } else {
      setShowDefeatUI(false);
      setShowDefeatOverlay(false);
      setDefeatOverlayDone(false);
    }
  }, [battle.phase]);

  useEffect(() => {
    if (battle.phase !== "victory") return;
    const allEnemiesDead = battle.enemies.every(e => e.currentHp <= 0);
    if (!allEnemiesDead) return;
    const anyDeathPending = deathAnimPending.size > 0;
    const anyDissolving = pixelDissolving.size > 0;
    const anyNeedDeathStart = battle.enemies.some((enemy, idx) => {
      if (enemy.currentHp > 0) return false;
      if (dissolvedEnemies.has(idx)) return false;
      if (isAnimatedEnemyCheck(enemy)) {
        return enemyAnimStates[idx] !== "death" && !deathAnimPending.has(idx) && !pixelDissolving.has(idx);
      }
      return !pixelDissolving.has(idx);
    });
    if (!anyDeathPending && !anyDissolving && !anyNeedDeathStart && !demonKinSpawnAnim && !victoryReady) {
      setVictoryReady(true);
    }
  }, [battle.phase, battle.enemies, deathAnimPending, pixelDissolving, dissolvedEnemies, enemyAnimStates, demonKinSpawnAnim, victoryReady]);

  useEffect(() => {
    if (!victoryReady || battle.phase !== "victory") return;
    onRollLoot?.();
    fadeMusicTo(0.3, 600);
    playJingle("battle_victory", () => {
      fadeOutMusic(1200);
    });
    setShowVictoryUI(true);
  }, [victoryReady]);

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

  const spawnDamageNumber = useCallback((text: string, x: number, y: number, color: string, isHeal?: boolean) => {
    if (!showDamageNumbers) return;
    const id = damageIdRef.current++;
    setDamageNumbers(prev => [...prev, { id, text, x, y, color, isHeal }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1200);
  }, [showDamageNumbers]);

  const lastDmgEventIdRef = useRef(0);
  useEffect(() => {
    if (!battle.lastDamageEvent || !showDamageNumbers) return;
    const evt = battle.lastDamageEvent;
    if (evt.id <= lastDmgEventIdRef.current) return;
    lastDmgEventIdRef.current = evt.id;

    if (battle.lastDamageEvents && battle.lastDamageEvents.length > 0 && battle.lastDamageEvents.some(e => e.id === evt.id)) return;

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
    if (evt.isBlocked) {
      color = "#60a5fa";
    }
    const text = evt.isHeal ? `+${evt.amount}` : String(evt.amount);
    const label = evt.isHeal ? undefined : evt.isBlocked ? "BLOCKED!" : evt.label || undefined;
    const id = damageIdRef.current++;
    setDamageNumbers(prev => [...prev, { id, text, x: posX, y: posY, color, isBlocked: evt.isBlocked, isHeal: evt.isHeal, element: evt.element, isCrit: evt.isCrit, label }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1800);
    if (evt.label && !evt.isHeal) {
      setResultLabel(evt.label);
      setTimeout(() => setResultLabel(null), 2200);
    } else {
      setResultLabel(null);
    }
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
        if (evt.isBlocked) color = "#60a5fa";
        const text = evt.isHeal ? `+${evt.amount}` : String(evt.amount);
        const label = evt.isHeal ? undefined : evt.isBlocked ? "BLOCKED!" : evt.label || undefined;
        const id = damageIdRef.current++;
        setDamageNumbers(prev => [...prev, { id, text, x: posX, y: posY, color, isHeal: evt.isHeal, isBlocked: evt.isBlocked, element: evt.element, isCrit: evt.isCrit, label }]);
        setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1800);
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
    if (selectedSpell.animation === "eruptionCleave") {
      const spell = selectedSpell;
      setSelectedAction(null);
      setPendingTargetIdx(targetIdx);
      onSetAnimating();
      setMagicZoom(true);
      setMagicZoomTarget(targetIdx);
      setSelectedSpell(null);
      setShowSpells(false);

      const target = getEnemyGridPos(targetIdx);
      const targetX = target.x;
      const targetY = target.y - 4;
      const midX = (PLAYER_POS.x + targetX) / 2;
      const groundY = PLAYER_POS.y;
      const highY = 60;
      const runDur = 403;
      const riseDur = Math.round(4 / 12 * 1000);
      const nukeAtMs = Math.round(6 / 12 * 1000);
      const buildupFps = 8;
      const buildupFd = 1000 / buildupFps;
      const holdDur = 10 * buildupFd;
      const auraStartOffset = 4 * buildupFd;

      setEruptionCleaveActive(true);
      setEruptionFrozenEnemy(targetIdx);
      setEruptionSubPhase("run");
      setEruptionKnightX(PLAYER_POS.x);
      setEruptionKnightY(groundY);
      setEruptionAirAttackStartFrame(0);
      setAnimPhase("eruptionCleave");
      playSfx("gruntAttack", 0.7);
      scheduleTimer(() => setEruptionKnightX(midX), 16);

      scheduleTimer(() => {
        setEruptionSubPhase("jumpRise");
        setEruptionKnightX(targetX);
        setEruptionKnightY(highY);
      }, runDur);

      scheduleTimer(() => {
        setEruptionSubPhase("jumpHold");
        setEruptionBuildupActive(true);
      }, runDur + riseDur);

      scheduleTimer(() => {
        setEruptionAuraActive(true);
      }, runDur + riseDur + auraStartOffset);

      scheduleTimer(() => {
        setEruptionBuildupActive(false);
        setEruptionSubPhase("jumpFall");
        setEruptionKnightY(targetY);
        playSfx("eruptionDownwardSlash", 0.9);
      }, runDur + riseDur + holdDur);

      const nukeStart = runDur + riseDur + holdDur + nukeAtMs;
      scheduleTimer(() => {
        setEruptionAuraActive(false);
        setEruptionNukeActive(true);
        setEruptionNukeTargetIdx(targetIdx);
        setEruptionAirAttackStartFrame(4);
        setEruptionAirAttackRestartKey(k => k + 1);
        playSfx("eruptionCleave", 1.3);
        setShakeScreen(true);
        scheduleTimer(() => setShakeScreen(false), 500);
        setEnemyHitIdx(targetIdx);
        scheduleTimer(() => setEnemyHitIdx(null), 300);
        setEnemyAnimStates(prev => ({ ...prev, [targetIdx]: "hurt" }));
        scheduleTimer(() => {
          setEnemyAnimStates(prev => prev[targetIdx] === "death" ? prev : { ...prev, [targetIdx]: ytrielRestAnim(targetIdx) });
        }, 500);
      }, nukeStart);

      const nukeDuration = 11 * (1000 / 18);
      scheduleTimer(() => {
        setEruptionNukeActive(false);
        setEruptionNukeTargetIdx(null);
      }, nukeStart + nukeDuration);

      const airAttackRemainingMs = Math.round(4 / 12 * 1000);
      const totalAnimTime = nukeStart + airAttackRemainingMs + 150;
      scheduleTimer(() => {
        setEruptionCleaveActive(false);
        setEruptionSubPhase("idle");
        setEruptionAirAttackStartFrame(0);
        setEruptionBuildupActive(false);
        setEruptionAuraActive(false);
        setMagicZoom(false);
        setMagicZoomTarget(null);
        castingNeedsRunBack.current = false;
        runBackHandled.current = false;
        setAnimPhase("runBack");
        scheduleTimer(() => {
          if (!runBackHandled.current) {
            runBackHandled.current = true;
            setAnimPhase("idle");
            setPendingTargetIdx(null);
          }
        }, 600);
      }, totalAnimTime);

      scheduleTimer(() => {
        onCastSpell(spell, targetIdx);
        playSfx("magicRing", 0.4);
      }, totalAnimTime + 200);

      scheduleTimer(() => {
        setEruptionFrozenEnemy(null);
        if (battle.phase !== "victory" && battle.phase !== "defeat") {
          setTimeout(() => onFinishPlayerTurn(), 1600);
        }
      }, totalAnimTime + 800);
      return;
    }
    if (selectedSpell.animation === "thunderBolt") {
      pendingThunderBolt.current = { targetIdx, spell: selectedSpell };
      setSelectedAction(null);
      setPendingTargetIdx(targetIdx);
      onSetAnimating();
      setMagicZoom(true);
      setMagicZoomTarget(targetIdx);
      setAnimPhase("casting");
      playSfx("magicRing", 0.6);
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
  }, [selectedSpell, onSetAnimating, onCastSpell, onFinishPlayerTurn, scheduleTimer, battle.enemies, battle.phase]);

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

  const runBackHandled = useRef(false);

  const onPlayerTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.propertyName !== "left" && e.propertyName !== "bottom") return;
    if (e.propertyName === "bottom") return;
    if (animPhase === "runToEnemy") {
      if (pendingWindBlade.current) {
        const { targetIdx, spell } = pendingWindBlade.current;
        pendingWindBlade.current = null;
        castingNeedsRunBack.current = true;
        setAnimPhase("casting");
        windBladeAnimPending.current = true;
        setWindBladeFrozenEnemy(targetIdx);
        playSfx("mifuneSlice");
        playSfx("gruntAttack", 0.7);

        const attackDuration = 500;

        scheduleTimer(() => {
          windBladeAnimPending.current = false;
          setWindBladeActive(true);

          playSfx("windBladeStart");
          playSfxPitched("windSlash", 0.8, 1.2, 0.9);

          const slashCount = 7;
          const slashes = Array.from({ length: slashCount }, (_, i) => ({
            id: i,
            rotation: Math.random() * 360,
            offsetX: (Math.random() - 0.5) * 40,
            offsetY: (Math.random() - 0.5) * 40,
            scale: 0.8 + Math.random() * 0.5,
            active: false,
          }));
          setWindBladeSlashes(slashes);

          const slashInterval = 120;
          for (let i = 0; i < slashCount; i++) {
            scheduleTimer(() => {
              setWindBladeSlashes(prev => prev.map((s, si) => si === i ? { ...s, active: true } : s));
              playSfxPitched("windSlash", 0.7, 1.4, 0.7 + Math.random() * 0.3);
              const hitEnemy = battle.enemies[targetIdx];
              const hasAnim = hitEnemy && ((hitEnemy.element === "Fire" && !hitEnemy.isBoss) || hitEnemy.id === "dragon_lord" || hitEnemy.id === "frost_lizard" || hitEnemy.id === "jotem");
              if (hasAnim) {
                setEnemyAnimStates(prev => ({ ...prev, [targetIdx]: "hurt" }));
                scheduleTimer(() => {
                  setEnemyAnimStates(prev => {
                    if (prev[targetIdx] === "death") return prev;
                    return { ...prev, [targetIdx]: ytrielRestAnim(targetIdx) };
                  });
                }, 100);
              }
              setEnemyHitIdx(targetIdx);
              scheduleTimer(() => setEnemyHitIdx(null), 100);
            }, i * slashInterval);
          }

          scheduleTimer(() => {
            setWindBladeSlashes([]);
            setWindBladeActive(false);
            setMagicZoom(false);
            setMagicZoomTarget(null);
            castingNeedsRunBack.current = false;
            runBackHandled.current = false;
            setAnimPhase("runBack");
            scheduleTimer(() => {
              if (!runBackHandled.current) {
                runBackHandled.current = true;
                setAnimPhase("idle");
                setPendingTargetIdx(null);
              }
            }, 600);
          }, 1200);

          scheduleTimer(() => {
            windBladeDamageTarget.current = targetIdx;
            onCastSpell(spell, targetIdx);
          }, 1600);

          scheduleTimer(() => {
            setWindBladeFrozenEnemy(null);
            if (battle.phase !== "victory" && battle.phase !== "defeat") {
              setTimeout(() => onFinishPlayerTurn(), 1600);
            }
          }, 2200);
        }, attackDuration);
      } else if (pendingIncinerationSlash.current) {
        const { targetIdx, spell } = pendingIncinerationSlash.current;
        pendingIncinerationSlash.current = null;
        castingNeedsRunBack.current = true;
        setAnimPhase("incinerationSlash");
        setIncinerationSlashActive(true);
        setIncinerationFrozenEnemy(targetIdx);
        const isBossT = battle.enemies[targetIdx]?.isBoss;
        setIncinerationCasterPos({ x: ENEMY_SLOTS[targetIdx].x - (isBossT ? 12 : 5), y: PLAYER_POS.y });

        const frameDuration = 1000 / 12;
        const swing1Time = frameDuration * 0;
        const swing2Time = frameDuration * 6;
        const fire1Time = frameDuration * 1;
        const fire2Time = frameDuration * 7;

        scheduleTimer(() => {
          playSfx("incinerationBladeSwings", 0.8);
        }, swing1Time);

        scheduleTimer(() => {
          playSfx("incinerationBladeSwings", 0.8);
        }, swing2Time);

        scheduleTimer(() => {
          const id1 = ++fireImpactId.current;
          setFireImpactVfx(prev => [...prev, { targetIdx, id: id1, isIncSlash: true }]);
          playSfx("incinerationCleave", 1.2);
          setEnemyHitIdx(targetIdx);
          scheduleTimer(() => setEnemyHitIdx(null), 180);
          setEnemyAnimStates(prev => ({ ...prev, [targetIdx]: "hurt" }));
          scheduleTimer(() => {
            setEnemyAnimStates(prev => prev[targetIdx] === "death" ? prev : { ...prev, [targetIdx]: ytrielRestAnim(targetIdx) });
          }, 333);
        }, fire1Time);

        scheduleTimer(() => {
          const id2 = ++fireImpactId.current;
          setFireImpactVfx(prev => [...prev, { targetIdx, id: id2, isIncSlash: true }]);
          playSfx("incinerationCleave", 1.2);
          setEnemyHitIdx(targetIdx);
          scheduleTimer(() => setEnemyHitIdx(null), 180);
          setEnemyAnimStates(prev => ({ ...prev, [targetIdx]: "hurt" }));
          scheduleTimer(() => {
            setEnemyAnimStates(prev => prev[targetIdx] === "death" ? prev : { ...prev, [targetIdx]: ytrielRestAnim(targetIdx) });
          }, 333);
        }, fire2Time);

        const totalAnimTime = frameDuration * 12;

        scheduleTimer(() => {
          setIncinerationSlashActive(false);
          setIncinerationCasterPos(null);
          setFireImpactVfx([]);
          setMagicZoom(false);
          setMagicZoomTarget(null);
          castingNeedsRunBack.current = false;
          runBackHandled.current = false;
          setAnimPhase("runBack");
          scheduleTimer(() => {
            if (!runBackHandled.current) {
              runBackHandled.current = true;
              setAnimPhase("idle");
              setPendingTargetIdx(null);
            }
          }, 600);
        }, totalAnimTime + 200);

        scheduleTimer(() => {
          onCastSpell(spell, targetIdx);
          playSfx("magicRing", 0.4);
        }, totalAnimTime + 400);

        scheduleTimer(() => {
          setIncinerationFrozenEnemy(null);
          if (battle.phase !== "victory" && battle.phase !== "defeat") {
            setTimeout(() => onFinishPlayerTurn(), 1600);
          }
        }, totalAnimTime + 1000);
      } else if (pendingEruptionCleave.current) {
        const { targetIdx, spell } = pendingEruptionCleave.current;
        pendingEruptionCleave.current = null;
        castingNeedsRunBack.current = true;
        setAnimPhase("eruptionCleave");
        setEruptionCleaveActive(true);
        setEruptionFrozenEnemy(targetIdx);
        playSfx("gruntAttack", 0.7);

        const frameDuration = 1000 / 14;
        const pauseFrame1Time = frameDuration * 1;
        const pauseFrame1Duration = 200;
        const flamelashDuration = Math.ceil(61 / 38 * 1000);
        const resumeAfterFlamelash = pauseFrame1Time + pauseFrame1Duration + flamelashDuration;
        const nukeDuration = 11 * (1000 / 18);
        const nukeStartTime = resumeAfterFlamelash + Math.round(6 / 12 * 1000);
        const totalAnimTime = nukeStartTime + nukeDuration + 400;

        const flamelashStart = pauseFrame1Time + pauseFrame1Duration;
        scheduleTimer(() => {
          setEruptionFlamelashActive(true);
          eruptionFlamelashAudio.current = playSfx("eruptionFlamelash", 0.8);
          eruptionFirechargeAudio.current = playSfx("eruptionFirecharge", 0.8);
          setEruptionShakeIntensity(1);
        }, flamelashStart);
        const shakeSteps = 8;
        const stepTime = flamelashDuration / shakeSteps;
        for (let i = 1; i <= shakeSteps; i++) {
          scheduleTimer(() => {
            setEruptionShakeIntensity(Math.min(i + 1, shakeSteps));
          }, flamelashStart + stepTime * i);
        }

        scheduleTimer(() => {
          setEruptionFlamelashActive(false);
          setEruptionShakeIntensity(0);
          playSfx("eruptionDownwardSlash", 0.9);
        }, pauseFrame1Time + pauseFrame1Duration + flamelashDuration);

        scheduleTimer(() => {
          stopSfx(eruptionFirechargeAudio.current);
          eruptionFirechargeAudio.current = null;
          stopSfx(eruptionFlamelashAudio.current);
          eruptionFlamelashAudio.current = null;
          setEruptionNukeActive(true);
          setEruptionNukeTargetIdx(targetIdx);
          setEruptionAirAttackStartFrame(4);
          setEruptionAirAttackRestartKey(k => k + 1);
          playSfx("eruptionCleave", 1.3);
          setShakeScreen(true);
          scheduleTimer(() => setShakeScreen(false), 500);
          setEnemyHitIdx(targetIdx);
          scheduleTimer(() => setEnemyHitIdx(null), 300);
          setEnemyAnimStates(prev => ({ ...prev, [targetIdx]: "hurt" }));
          scheduleTimer(() => {
            setEnemyAnimStates(prev => prev[targetIdx] === "death" ? prev : { ...prev, [targetIdx]: ytrielRestAnim(targetIdx) });
          }, 500);
        }, nukeStartTime);

        scheduleTimer(() => {
          setEruptionNukeActive(false);
          setEruptionNukeTargetIdx(null);
        }, nukeStartTime + nukeDuration);

        scheduleTimer(() => {
          setEruptionCleaveActive(false);
          setEruptionAirAttackStartFrame(0);
          setMagicZoom(false);
          setMagicZoomTarget(null);
          castingNeedsRunBack.current = false;
          runBackHandled.current = false;
          setAnimPhase("runBack");
          scheduleTimer(() => {
            if (!runBackHandled.current) {
              runBackHandled.current = true;
              setAnimPhase("idle");
              setPendingTargetIdx(null);
            }
          }, 600);
        }, totalAnimTime);

        scheduleTimer(() => {
          onCastSpell(spell, targetIdx);
          playSfx("magicRing", 0.4);
        }, totalAnimTime + 200);

        scheduleTimer(() => {
          setEruptionFrozenEnemy(null);
          if (battle.phase !== "victory" && battle.phase !== "defeat") {
            setTimeout(() => onFinishPlayerTurn(), 1600);
          }
        }, totalAnimTime + 800);
      } else {
        setAnimPhase("attacking");
        const fd = 1000 / 12;
        if (player.spriteId === "knight" && pendingTargetIdx !== null) {
          const tIdx = pendingTargetIdx;
          scheduleTimer(() => {
            playSfx("swordSwing");
            playSfx("gruntAttack", 0.7);
            onAttackFirstHit(tIdx);
          }, fd * 4);
          scheduleTimer(() => {
            playSfx("swordSwing");
            playSfx("gruntAttack", 0.7);
            onAttackSecondHit();
          }, fd * 8);
        } else {
          playSfx(player.element === "Wind" ? "mifuneSlice" : "swordSwing");
          playSfx("gruntAttack", 0.7);
          if (pendingTargetIdx !== null) {
            onAttack(pendingTargetIdx);
          }
        }
      }
    } else if (animPhase === "runBack" && !runBackHandled.current) {
      runBackHandled.current = true;
      setAnimPhase("idle");
      setPendingTargetIdx(null);
      setMagicZoom(false);
      setMagicZoomTarget(null);
      if (windSparkleTarget !== null || windBladeFrozenEnemy !== null || incinerationFrozenEnemy !== null || eruptionFrozenEnemy !== null || thunderFrozenEnemy !== null) {
      } else if (battle.phase !== "victory" && battle.phase !== "defeat") {
        setTimeout(() => onFinishPlayerTurn(), 2400);
      }
    }
  }, [animPhase, pendingTargetIdx, onAttack, onAttackFirstHit, onAttackSecondHit, battle.phase, onFinishPlayerTurn, player.element, player.spriteId, scheduleTimer, onCastSpell, windSparkleTarget, windBladeFrozenEnemy, incinerationFrozenEnemy, eruptionFrozenEnemy, battle.enemies]);

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
        if (battle.lastElementLabel === "Super effective!") {
          scheduleTimer(() => playSfx("effectiveHit", 0.6), 200);
        }
        const hitEnemy = battle.enemies[tidx];
        if (hitEnemy && isAnimatedEnemyCheck(hitEnemy)) {
          setEnemyAnimStates(prev => ({ ...prev, [tidx]: "hurt" }));
          const hurtDuration = hitEnemy.currentHp <= 0 ? 250 : 500;
          scheduleTimer(() => {
            const e = battle.enemies[tidx];
            const isDying = e && e.currentHp <= 0;
            if (isDying) {
              setDeathAnimPending(prev => new Set(prev).add(tidx));
            }
            setEnemyAnimStates(prev => {
              return { ...prev, [tidx]: isDying ? "death" : ytrielRestAnim(tidx) };
            });
          }, hurtDuration);
        }
        if (isCrit) {
          setShakeScreen(true);
          scheduleTimer(() => setShakeScreen(false), 400);
        }
        scheduleTimer(() => setEnemyHitIdx(null), 400);
      }

      if (matched && partyAnimPhase === "attacking" && partyTargetIdx !== null) {
        const isCrit = !!(matched[2]);
        const tidx = partyTargetIdx;
        setEnemyHitIdx(tidx);
        playSfx("hitMetal");
        if (battle.lastElementLabel === "Super effective!") {
          scheduleTimer(() => playSfx("effectiveHit", 0.6), 200);
        }
        const hitEnemy = battle.enemies[tidx];
        if (hitEnemy && isAnimatedEnemyCheck(hitEnemy)) {
          setEnemyAnimStates(prev => ({ ...prev, [tidx]: "hurt" }));
          const hurtDuration = hitEnemy.currentHp <= 0 ? 250 : 500;
          scheduleTimer(() => {
            const e = battle.enemies[tidx];
            const isDying = e && e.currentHp <= 0;
            if (isDying) {
              setDeathAnimPending(prev => new Set(prev).add(tidx));
            }
            setEnemyAnimStates(prev => ({ ...prev, [tidx]: isDying ? "death" : ytrielRestAnim(tidx) }));
          }, hurtDuration);
        }
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
        if (battle.lastElementLabel === "Super effective!") {
          scheduleTimer(() => playSfx("effectiveHit", 0.6), 200);
        }
        const hitEnemy = battle.enemies[targetIdx];
        if (hitEnemy && isAnimatedEnemyCheck(hitEnemy)) {
          setEnemyAnimStates(prev => ({ ...prev, [targetIdx]: "hurt" }));
          const hurtDuration = hitEnemy.currentHp <= 0 ? 250 : 500;
          scheduleTimer(() => {
            const e = battle.enemies[targetIdx];
            const isDying = e && e.currentHp <= 0;
            if (isDying) {
              setDeathAnimPending(prev => new Set(prev).add(targetIdx));
            }
            setEnemyAnimStates(prev => {
              return { ...prev, [targetIdx]: isDying ? "death" : ytrielRestAnim(targetIdx) };
            });
          }, hurtDuration);
        }
        setShakeScreen(true);
        setTimeout(() => setShakeScreen(false), 500);
        setTimeout(() => setEnemyHitIdx(null), 400);
      }

      if (matched && windBladeDamageTarget.current !== null) {
        const targetIdx = windBladeDamageTarget.current;
        windBladeDamageTarget.current = null;
        setEnemyHitIdx(targetIdx);
        playSfx("stabRing");
        if (battle.lastElementLabel === "Super effective!") {
          scheduleTimer(() => playSfx("effectiveHit", 0.6), 200);
        }
        const hitEnemy = battle.enemies[targetIdx];
        if (hitEnemy && isAnimatedEnemyCheck(hitEnemy)) {
          setEnemyAnimStates(prev => ({ ...prev, [targetIdx]: "hurt" }));
          const hurtDuration = hitEnemy.currentHp <= 0 ? 250 : 500;
          scheduleTimer(() => {
            const e = battle.enemies[targetIdx];
            const isDying = e && e.currentHp <= 0;
            if (isDying) {
              setDeathAnimPending(prev => new Set(prev).add(targetIdx));
            }
            setEnemyAnimStates(prev => {
              return { ...prev, [targetIdx]: isDying ? "death" : ytrielRestAnim(targetIdx) };
            });
          }, hurtDuration);
        }
        setShakeScreen(true);
        setTimeout(() => setShakeScreen(false), 500);
        setTimeout(() => setEnemyHitIdx(null), 400);
      }

      const dodgeMatch = msg.match(/(.+?) dodged (?:the attack|.+'s attack)!/);
      if (dodgeMatch) {
        const isPlayerAttacking = (animPhase === "attacking" || animPhase === "runBack") && pendingTargetIdx !== null;
        const isPartyAttacking = partyAnimPhase === "attacking" || partyAnimPhase === "runBack";
        if (isPlayerAttacking || isPartyAttacking) {
          const targetIdx = pendingTargetIdx ?? 0;
          const enemyIdx = battle.enemies.findIndex(e => e.name === dodgeMatch[1]);
          const dodgeIdx = enemyIdx >= 0 ? enemyIdx : targetIdx;
          setDodgeBlur({ type: "enemy", index: dodgeIdx });
          scheduleTimer(() => setDodgeBlur(null), 600);
          const ep = ENEMY_SLOTS[dodgeIdx % ENEMY_SLOTS.length];
          spawnDamageNumber("DODGE", ep.x, 100 - ep.y - 15, "#aaaaaa");
        }
      }

      if (matched && battle.animation === "enemyAttack") {
        const attackingEnemy = battle.enemies.find(e => e.currentHp > 0);
        const isFire = attackingEnemy?.element === "Fire";
        if (!isFire) {
          setPlayerFlash(true);
          setTimeout(() => setPlayerFlash(false), 500);
        }
        playSfx("gruntHurt", 0.8);
        playSfx("damage", 0.9);
      }
    }
  }, [battle.log.length, animPhase, partyAnimPhase, pendingTargetIdx, partyTargetIdx, battle.enemies, battle.animation, spawnDamageNumber, battle.lastElementLabel, scheduleTimer]);

  const lastItemUsedRef = useRef<typeof battle.lastItemUsed>(undefined);
  useEffect(() => {
    if (!battle.lastItemUsed || battle.lastItemUsed === lastItemUsedRef.current) return;
    lastItemUsedRef.current = battle.lastItemUsed;
    const item = battle.lastItemUsed;
    const isHp = item.stat === "hp";
    const color = isHp ? "rgba(239,68,68,0.8)" : "rgba(96,165,250,0.8)";

    let vfxX: number, vfxY: number;
    if (item.targetType === "player" || item.targetIndex < 0) {
      vfxX = 12;
      vfxY = 18;
    } else {
      const pos = PARTY_POSITIONS[item.targetIndex % PARTY_POSITIONS.length];
      vfxX = pos.x;
      vfxY = pos.y;
    }

    playSfx(isHp ? "potionHeal" : "potionMana", 0.7);
    setPotionVfx({ x: vfxX, y: vfxY + 8, color, active: true });
    spawnDamageNumber(`+${item.amount} ${isHp ? "HP" : "MP"}`, vfxX + 2, 100 - vfxY - 10, isHp ? "#4ade80" : "#60a5fa", isHp);
    scheduleTimer(() => setPotionVfx(null), 800);
  }, [battle.lastItemUsed, scheduleTimer, spawnDamageNumber]);

  const onSpriteComplete = useCallback(() => {
    if (animPhase === "attacking") {
      runBackHandled.current = false;
      setAnimPhase("runBack");
      scheduleTimer(() => {
        if (!runBackHandled.current) {
          runBackHandled.current = true;
          setAnimPhase("idle");
          setPendingTargetIdx(null);
          if (battle.phase !== "victory" && battle.phase !== "defeat") {
            setTimeout(() => onFinishPlayerTurn(), 2400);
          }
        }
      }, 500);
    } else if (animPhase === "hurt") {
      setAnimPhase("idle");
    } else if (animPhase === "casting") {
      if (windBladeActive || windBladeAnimPending.current) {
        return;
      }
      if (pendingThunderBolt.current) {
        const { targetIdx, spell } = pendingThunderBolt.current;
        pendingThunderBolt.current = null;
        setAnimPhase("thunderBolt");
        setThunderBoltActive(true);
        setThunderFrozenEnemy(targetIdx);
        setThunderBoltFrame(0);

        const frameDuration = 80;
        const totalFrames = LIGHTNING_VFX_SEQUENCE.length;

        for (let i = 0; i < totalFrames; i++) {
          scheduleTimer(() => {
            setThunderBoltFrame(i);
          }, i * frameDuration);
        }

        const damageTime = 10 * frameDuration;
        scheduleTimer(() => {
          onCastSpell(spell, targetIdx);
          setShakeScreen(true);
          scheduleTimer(() => setShakeScreen(false), 300);
          setEnemyHitIdx(targetIdx);
          scheduleTimer(() => setEnemyHitIdx(null), 180);
          setEnemyAnimStates(prev => ({ ...prev, [targetIdx]: "hurt" }));
          scheduleTimer(() => {
            setEnemyAnimStates(prev => prev[targetIdx] === "death" ? prev : { ...prev, [targetIdx]: ytrielRestAnim(targetIdx) });
          }, 333);
        }, damageTime);

        const endTime = totalFrames * frameDuration + 200;
        scheduleTimer(() => {
          setThunderBoltActive(false);
          setThunderBoltFrame(0);
          setThunderFrozenEnemy(null);
          setMagicZoom(false);
          setMagicZoomTarget(null);
          setAnimPhase("idle");
          setPendingTargetIdx(null);
          if (battle.phase !== "victory" && battle.phase !== "defeat") {
            setTimeout(() => onFinishPlayerTurn(), 1600);
          }
        }, endTime);
        return;
      }
      setMagicZoom(false);
      setMagicZoomTarget(null);
      if (castingNeedsRunBack.current) {
        castingNeedsRunBack.current = false;
        runBackHandled.current = false;
        setAnimPhase("runBack");
        scheduleTimer(() => {
          if (!runBackHandled.current) {
            runBackHandled.current = true;
            setAnimPhase("idle");
            setPendingTargetIdx(null);
            if (battle.phase !== "victory" && battle.phase !== "defeat") {
              setTimeout(() => onFinishPlayerTurn(), 2400);
            }
          }
        }, 500);
      } else {
        setAnimPhase("idle");
        setPendingTargetIdx(null);
        if (battle.phase !== "victory" && battle.phase !== "defeat") {
          setTimeout(() => onFinishPlayerTurn(), 2400);
        }
      }
    } else if (animPhase === "defending") {
      setAnimPhase("idle");
      if (battle.phase !== "victory" && battle.phase !== "defeat") {
        setTimeout(() => onFinishPlayerTurn(), 1000);
      }
    }
  }, [animPhase, battle.phase, onFinishPlayerTurn, windBladeActive]);

  useEffect(() => {
    if (battle.phase === "victory" || battle.phase === "defeat") {
      if (windBladeActive || windBladeFrozenEnemy !== null || windSparkleTarget !== null) {
        setWindBladeActive(false);
        setWindBladeSlashes([]);
        setWindSparkleTarget(null);
        setWindBladeFrozenEnemy(null);
        windSparkleAfterRunBack.current = null;
        windBladeDamageTarget.current = null;
        windBladeAnimPending.current = false;
      }
      if (thunderBoltActive) {
        setThunderBoltActive(false);
        setThunderBoltFrame(0);
        setThunderFrozenEnemy(null);
      }
    }
  }, [battle.phase, windBladeActive, windBladeFrozenEnemy, windSparkleTarget, thunderBoltActive]);

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
  const isDemonKin = useCallback((enemy: { id: string }) => enemy.id === "demon_kin", []);
  const isMinotaur = useCallback((enemy: { id: string }) => enemy.id === "minotaur_wind", []);
  const isCyclops  = useCallback((enemy: { id: string }) => enemy.id === "cyclops_wind",  []);
  const isHarpy    = useCallback((enemy: { id: string }) => enemy.id === "harpy_wind",    []);
  const isResk     = useCallback((enemy: { id: string }) => enemy.id === "resk",           []);
  const isAnimatedEnemyCheck = useCallback((enemy: { id: string; element: string; isBoss: boolean }) => {
    return (enemy.element === "Fire" && !enemy.isBoss) || isDragonLord(enemy) || isFrostLizard(enemy) || isJotem(enemy) || isDemonKin(enemy) || isMinotaur(enemy) || isCyclops(enemy) || isHarpy(enemy) || isResk(enemy);
  }, [isDragonLord, isFrostLizard, isJotem, isDemonKin, isMinotaur, isCyclops, isHarpy, isResk]);

  const ytrielRestAnim = useCallback((idx: number): "flying" | "idle" => {
    const e = battle.enemies[idx];
    return (e && isDragonLord(e) && ytrielHasFlown.current) ? "flying" : "idle";
  }, [battle.enemies, isDragonLord]);

  const onEnemyDeathAnimDone = useCallback((idx: number) => {
    setDeathAnimPending(prev => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
    setPixelDissolving(prev => new Set(prev).add(idx));

    const dyingEnemy = battle.enemies[idx];
    const alreadyHasDemonKin = battle.enemies.some(e => e.id === "demon_kin" && e.currentHp > 0);
    const isFireDemon = dyingEnemy && dyingEnemy.element === "Fire" && !dyingEnemy.isBoss && dyingEnemy.id !== "demon_kin";
    if (
      isFireDemon &&
      (regionTier ?? 0) >= 2 &&
      !alreadyHasDemonKin &&
      Math.random() < 0.3
    ) {
      setDemonKinSpawnAnim({ slotIndex: idx });
      playSfx("fireDemonDeath", 0.8);
    }
  }, [battle.enemies, battle.gridPositions, regionTier, playSfx]);

  const onPixelDissolveComplete = useCallback((idx: number) => {
    setPixelDissolving(prev => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
    setDissolvedEnemies(prev => new Set(prev).add(idx));
  }, []);

  const handleDemonKinSpawnComplete = useCallback(() => {
    if (!demonKinSpawnAnim) return;
    const { slotIndex } = demonKinSpawnAnim;
    const refEnemy = battle.enemies.find(e => e.currentHp > 0);
    const refLevel = refEnemy?.level ?? 5;
    const newDemonKin = generateDemonKinSpawn(refLevel);
    onSpawnEnemy?.(slotIndex, newDemonKin);
    setEnemyAnimStates(prev => ({ ...prev, [slotIndex]: "idle" }));
    setDeathAnimPending(prev => { const next = new Set(prev); next.delete(slotIndex); return next; });
    setPixelDissolving(prev => { const next = new Set(prev); next.delete(slotIndex); return next; });
    setDissolvedEnemies(prev => {
      const next = new Set(prev);
      next.delete(slotIndex);
      return next;
    });
    setTimeout(() => setDemonKinSpawnAnim(null), 60);
  }, [demonKinSpawnAnim, battle.enemies, onSpawnEnemy]);

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
        }, 100));
      }
      if (enemy.currentHp <= 0 && !isAnimatedEnemyCheck(enemy) && !pixelDissolving.has(idx)) {
        timers.push(setTimeout(() => {
          setPixelDissolving(prev => new Set(prev).add(idx));
        }, 200));
      }
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [battle.enemies, isAnimatedEnemyCheck, enemyAnimStates, deathAnimPending, pixelDissolving]);

  useEffect(() => {
    battle.enemies.forEach((enemy, idx) => {
      if (enemyAnimStates[idx] === "death" && !deathSfxPlayed.current.has(idx)) {
        deathSfxPlayed.current.add(idx);
        if (enemy.element === "Fire" && !enemy.isBoss) {
          playSfx("fireDemonDeath", 1.2);
        }
      }
    });
  }, [enemyAnimStates, battle.enemies]);

  useEffect(() => {
    if (infernoBallAnim && infernoBallAnim.phase === "spawn") {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setInfernoBallAnim(prev => prev ? { ...prev, phase: "travel" } : null);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [infernoBallAnim?.phase]);

  const handleInfernoBallArrival = useCallback(() => {
    if (!infernoBallAnim || infernoBallAnim.phase !== "travel") return;
    const { enemyIdx, preTarget, onDone } = infernoBallAnim;

    setInfernoBallAnim(prev => prev ? { ...prev, phase: "explode" } : null);
    setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: ytrielRestAnim(enemyIdx) }));
    playSfx("eruptionCleave", 1.0);

    const result = onEnemyAttack(enemyIdx, preTarget);
    if (!result.dodged) {
      if (result.target.type === "party") {
        setPartyHurtIndex(result.target.index);
        scheduleTimer(() => setPartyHurtIndex(-1), 700);
      } else {
        setAnimPhase("hurt");
      }
      setShakeScreen(true);
      scheduleTimer(() => setShakeScreen(false), 600);
    } else {
      setDodgeBlur(result.target);
      scheduleTimer(() => setDodgeBlur(null), 600);
      const dodgeSlot = result.target.type === "party"
        ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
        : ALLY_SLOTS[0];
      spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
    }
  }, [infernoBallAnim, onEnemyAttack, playSfx, scheduleTimer, spawnDamageNumber]);

  const handleInfernoBallExplodeComplete = useCallback(() => {
    if (!infernoBallAnim) return;
    const { onDone } = infernoBallAnim;
    setInfernoBallAnim(null);
    setAnimPhase("idle");
    if (onDone) scheduleTimer(onDone, 300);
  }, [infernoBallAnim, scheduleTimer]);

  useEffect(() => {
    if (ytrielSlashAnim && ytrielSlashAnim.phase === "spawn") {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setYtrielSlashAnim(prev => prev ? { ...prev, phase: "travel" } : null);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [ytrielSlashAnim?.phase]);

  const handleYtrielSlashArrival = useCallback(() => {
    if (!ytrielSlashAnim || ytrielSlashAnim.phase !== "travel") return;
    const { enemyIdx, preTarget } = ytrielSlashAnim;
    setYtrielSlashAnim(prev => prev ? { ...prev, phase: "explode" } : null);
    playSfx("eruptionCleave", 1.0);
    const result = onEnemyAttack(enemyIdx, preTarget);
    if (!result.dodged) {
      if (result.target.type === "party") {
        setPartyHurtIndex(result.target.index);
        scheduleTimer(() => setPartyHurtIndex(-1), 700);
      } else {
        setAnimPhase("hurt");
      }
      setShakeScreen(true);
      scheduleTimer(() => setShakeScreen(false), 600);
    } else {
      setDodgeBlur(result.target);
      scheduleTimer(() => setDodgeBlur(null), 600);
      const dodgeSlot = result.target.type === "party"
        ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
        : ALLY_SLOTS[0];
      spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
    }
  }, [ytrielSlashAnim, onEnemyAttack, playSfx, scheduleTimer, spawnDamageNumber]);

  const handleYtrielExplosionComplete = useCallback(() => {
    if (!ytrielSlashAnim) return;
    const { onDone } = ytrielSlashAnim;
    setYtrielSlashAnim(null);
    setAnimPhase("idle");
    if (onDone) scheduleTimer(onDone, 300);
  }, [ytrielSlashAnim, scheduleTimer]);

  const animateEnemyAttack = useCallback((enemyIdx: number, enemy: typeof battle.enemies[0], onDone: () => void) => {
    const pos = ENEMY_POSITIONS[enemyIdx % ENEMY_POSITIONS.length];

    if (isDragonLord(enemy)) {
      const aliveParty = battle.party.filter(p => p.currentHp > 0);
      const totalTargets = 1 + aliveParty.length;
      const targetRoll = Math.floor(Math.random() * totalTargets);
      let preTarget: { type: "player" | "party"; index: number };
      if (targetRoll === 0 || aliveParty.length === 0) {
        preTarget = { type: "player", index: -1 };
      } else {
        const pt = aliveParty[targetRoll - 1];
        preTarget = { type: "party", index: battle.party.findIndex(p => p.id === pt.id) };
      }

      if (Math.random() < 0.3) {
        // ── Stationary projectile attack (30%) ──────────────────────────────
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
        // launch on frame 4 of the 6-frame attack anim at 12 fps ≈ 333 ms
        scheduleTimer(() => {
          playSfx("ytrielFireLaunch");
          const fromX = pos.x - 6;
          const fromY = pos.y + 22;
          const toX = preTarget.type === "party" && preTarget.index >= 0
            ? PARTY_POSITIONS[preTarget.index % PARTY_POSITIONS.length].x
            : PLAYER_POS.x;
          const toY = preTarget.type === "party" && preTarget.index >= 0
            ? PARTY_POSITIONS[preTarget.index % PARTY_POSITIONS.length].y + 12
            : PLAYER_POS.y + 12;
          setYtrielSlashAnim({ phase: "spawn", fromX, fromY, toX, toY, enemyIdx, preTarget, onDone });
        }, 333);
        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: ytrielRestAnim(enemyIdx) }));
        }, 700);
      } else {
        // ── Flyby slash attack (70%) ─────────────────────────────────────────
        let walkToX: number, walkToY: number;
        if (preTarget.type === "party" && preTarget.index >= 0) {
          const tp = PARTY_POSITIONS[preTarget.index % PARTY_POSITIONS.length];
          walkToX = tp.x + 5;
          walkToY = tp.y;
        } else {
          walkToX = PLAYER_POS.x + 5;
          walkToY = PLAYER_POS.y;
        }

        const transitionOffset = ytrielHasFlown.current ? 0 : 400;

        if (ytrielHasFlown.current) {
          // Already in flying mode — move immediately, no transition needed
          setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: -(pos.x - walkToX), y: -(pos.y - walkToY) } }));
        } else {
          // First flyby — play transition animation, then switch to flying
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "transition" }));
          scheduleTimer(() => {
            ytrielHasFlown.current = true;
            setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "flying" }));
            setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: -(pos.x - walkToX), y: -(pos.y - walkToY) } }));
          }, 400);
        }

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
          playSfx("swordSwing");
        }, 550 + transitionOffset);

        scheduleTimer(() => {
          const result = onEnemyAttack(enemyIdx, preTarget);
          if (!result.dodged) {
            setShakeScreen(true);
            if (result.target.type === "party") {
              setPartyHurtIndex(result.target.index);
              scheduleTimer(() => setPartyHurtIndex(-1), 500);
            } else {
              setAnimPhase("hurt");
            }
            playSfx("hitCombo");
            scheduleTimer(() => setShakeScreen(false), 500);
          } else {
            setDodgeBlur(result.target);
            scheduleTimer(() => setDodgeBlur(null), 600);
            const dodgeSlot = result.target.type === "party"
              ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
              : ALLY_SLOTS[0];
            spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
          }
        }, 750 + transitionOffset);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "flying" }));
          setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: 0, y: 0 } }));
        }, 1100 + transitionOffset);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: ytrielRestAnim(enemyIdx) }));
          setBossOffset(prev => ({ ...prev, [enemyIdx]: null }));
          setAnimPhase("idle");
          scheduleTimer(onDone, 300);
        }, 1700 + transitionOffset);
      }
    } else if (isDemonKin(enemy)) {
      const aliveParty = battle.party.filter(p => p.currentHp > 0);
      const totalTargets = 1 + aliveParty.length;
      const targetRoll = Math.floor(Math.random() * totalTargets);
      let preTarget: { type: "player" | "party"; index: number };
      if (targetRoll === 0 || aliveParty.length === 0) {
        preTarget = { type: "player", index: -1 };
      } else {
        const pt = aliveParty[targetRoll - 1];
        preTarget = { type: "party", index: battle.party.findIndex(p => p.id === pt.id) };
      }

      let walkToX: number, walkToY: number;
      if (preTarget.type === "party" && preTarget.index >= 0) {
        const tp = PARTY_POSITIONS[preTarget.index % PARTY_POSITIONS.length];
        walkToX = tp.x + 8;
        walkToY = tp.y;
      } else {
        walkToX = PLAYER_POS.x + 8;
        walkToY = PLAYER_POS.y;
      }

      setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
      setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: -(pos.x - walkToX), y: -(pos.y - walkToY) } }));

      scheduleTimer(() => {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
        playSfx("stabWhoosh", 0.9);
      }, 600);

      scheduleTimer(() => {
        const result = onEnemyAttack(enemyIdx, preTarget);
        if (!result.dodged) {
          setShakeScreen(true);
          if (result.target.type === "party") {
            setPartyHurtIndex(result.target.index);
            scheduleTimer(() => setPartyHurtIndex(-1), 500);
          } else {
            setAnimPhase("hurt");
          }
          playSfx("hitMetal", 0.7);
          scheduleTimer(() => setShakeScreen(false), 500);
        } else {
          setDodgeBlur(result.target);
          scheduleTimer(() => setDodgeBlur(null), 600);
          const dodgeSlot = result.target.type === "party"
            ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
            : ALLY_SLOTS[0];
          spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
        }
      }, 1200);

      scheduleTimer(() => {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
        setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: 0, y: 0 } }));
      }, 1500);

      scheduleTimer(() => {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
        setBossOffset(prev => ({ ...prev, [enemyIdx]: null }));
        setAnimPhase("idle");
        scheduleTimer(onDone, 300);
      }, 2100);
    } else if (enemy.element === "Fire" && !enemy.isBoss) {
      setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
      playSfx("fireballWhoosh", 0.8);

      const aliveParty = battle.party.filter(p => p.currentHp > 0);
      const totalTargets = 1 + aliveParty.length;
      const targetRoll = Math.floor(Math.random() * totalTargets);
      let preTarget: { type: "player" | "party"; index: number };
      if (targetRoll === 0 || aliveParty.length === 0) {
        preTarget = { type: "player", index: -1 };
      } else {
        const pt = aliveParty[targetRoll - 1];
        preTarget = { type: "party", index: battle.party.findIndex(p => p.id === pt.id) };
      }

      let targetX: number, targetY: number;
      if (preTarget.type === "party" && preTarget.index >= 0) {
        const tp = PARTY_POSITIONS[preTarget.index % PARTY_POSITIONS.length];
        const memberSpriteId = battle.party[preTarget.index]?.spriteId || "samurai";
        targetX = tp.x;
        targetY = tp.y + getSpriteCenterOffset(memberSpriteId);
      } else {
        const pCenterY = getSpriteCenterOffset(player.spriteId || "samurai");
        targetX = PLAYER_POS.x;
        targetY = PLAYER_POS.y + pCenterY;
      }

      scheduleTimer(() => {
        const enemySpriteH = 64 * 3;
        const enemyCenterOffset = (enemySpriteH / GAME_CONTAINER_HEIGHT) * 35;
        setFireballAnim({ fromX: pos.x, fromY: pos.y + enemyCenterOffset, toX: targetX, toY: targetY, active: true });
      }, 450);

      scheduleTimer(() => {
        setFireballAnim(null);
        const result = onEnemyAttack(enemyIdx, preTarget);
        if (!result.dodged) {
          playSfx("fireballImpact", 0.8);
          setShakeScreen(true);
          if (result.target.type === "party") {
            setPartyHurtIndex(result.target.index);
            scheduleTimer(() => setPartyHurtIndex(-1), 500);
          } else {
            setFireHitSfx(true);
            setAnimPhase("hurt");
          }
          scheduleTimer(() => setShakeScreen(false), 500);
        } else {
          setDodgeBlur(result.target);
          scheduleTimer(() => setDodgeBlur(null), 600);
          const dodgeSlot = result.target.type === "party"
            ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
            : ALLY_SLOTS[0];
          spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
        }
      }, 950);

      scheduleTimer(() => {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
        setAnimPhase("idle");
        scheduleTimer(onDone, 300);
      }, 1500);
    } else if (isFrostLizard(enemy)) {
      setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
      playSfx("magicRing", 0.6);

      scheduleTimer(() => {
        setFrostBreathAnim({ fromX: pos.x, fromY: pos.y, active: true });
      }, 400);

      scheduleTimer(() => {
        setFrostBreathAnim(null);
        const result = onEnemyAttack(enemyIdx);
        if (!result.dodged) {
          setShakeScreen(true);
          if (result.target.type === "party") {
            setPartyHurtIndex(result.target.index);
            scheduleTimer(() => setPartyHurtIndex(-1), 500);
          } else {
            setFrostHitSfx(true);
            setAnimPhase("hurt");
          }
          playSfx("hitMetal");
          scheduleTimer(() => setShakeScreen(false), 500);
        } else {
          setDodgeBlur(result.target);
          scheduleTimer(() => setDodgeBlur(null), 600);
          const dodgeSlot = result.target.type === "party"
            ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
            : ALLY_SLOTS[0];
          spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
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
          const result = onEnemyAttack(enemyIdx);
          if (!result.dodged) {
            setShakeScreen(true);
            if (result.target.type === "party") {
              setPartyHurtIndex(result.target.index);
              scheduleTimer(() => setPartyHurtIndex(-1), 600);
            } else {
              setFrostHitSfx(true);
              setAnimPhase("hurt");
            }
            playSfx("stabRing");
            scheduleTimer(() => setShakeScreen(false), 600);
          } else {
            setDodgeBlur(result.target);
            scheduleTimer(() => setDodgeBlur(null), 600);
            const dodgeSlot = result.target.type === "party"
              ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
              : ALLY_SLOTS[0];
            spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
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
          const result = onEnemyAttack(enemyIdx);
          if (!result.dodged) {
            setShakeScreen(true);
            if (result.target.type === "party") {
              setPartyHurtIndex(result.target.index);
              scheduleTimer(() => setPartyHurtIndex(-1), 600);
            } else {
              setAnimPhase("hurt");
            }
            playSfx("hitCombo");
            scheduleTimer(() => setShakeScreen(false), 600);
          } else {
            setDodgeBlur(result.target);
            scheduleTimer(() => setDodgeBlur(null), 600);
            const dodgeSlot = result.target.type === "party"
              ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
              : ALLY_SLOTS[0];
            spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
          }
        }, 700);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
          setAnimPhase("idle");
          scheduleTimer(onDone, 300);
        }, 1100);
      } else {
        const aliveParty = battle.party.filter(p => p.currentHp > 0);
        const totalTargets = 1 + aliveParty.length;
        const targetRoll = Math.floor(Math.random() * totalTargets);
        let preTarget: { type: "player" | "party"; index: number };
        if (targetRoll === 0 || aliveParty.length === 0) {
          preTarget = { type: "player", index: -1 };
        } else {
          const pt = aliveParty[targetRoll - 1];
          preTarget = { type: "party", index: battle.party.findIndex(p => p.id === pt.id) };
        }

        let walkToX: number, walkToY: number;
        if (preTarget.type === "party" && preTarget.index >= 0) {
          const tp = PARTY_POSITIONS[preTarget.index % PARTY_POSITIONS.length];
          walkToX = tp.x + 5;
          walkToY = tp.y;
        } else {
          walkToX = PLAYER_POS.x + 5;
          walkToY = PLAYER_POS.y;
        }

        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
        setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: -(pos.x - walkToX), y: -(pos.y - walkToY) } }));

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
          playSfx("swordSwing");
        }, 600);

        scheduleTimer(() => {
          const result = onEnemyAttack(enemyIdx, preTarget);
          if (!result.dodged) {
            setShakeScreen(true);
            if (result.target.type === "party") {
              setPartyHurtIndex(result.target.index);
              scheduleTimer(() => setPartyHurtIndex(-1), 500);
            } else {
              setAnimPhase("hurt");
            }
            playSfx("hitCombo");
            scheduleTimer(() => setShakeScreen(false), 500);
          } else {
            setDodgeBlur(result.target);
            scheduleTimer(() => setDodgeBlur(null), 600);
            const dodgeSlot = result.target.type === "party"
              ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
              : ALLY_SLOTS[0];
            spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
          }
        }, 1200);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
          setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: 0, y: 0 } }));
        }, 1500);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
          setBossOffset(prev => ({ ...prev, [enemyIdx]: null }));
          setAnimPhase("idle");
          scheduleTimer(onDone, 300);
        }, 2100);
      }
    } else if (isMinotaur(enemy) || isCyclops(enemy) || isHarpy(enemy)) {
      const useAlt = Math.random() < 0.4;
      setForestAttackVariant(prev => ({ ...prev, [enemyIdx]: useAlt ? 2 : 1 }));

      const aliveParty = battle.party.filter(p => p.currentHp > 0);
      const totalTargets = 1 + aliveParty.length;
      const targetRoll = Math.floor(Math.random() * totalTargets);
      let preTarget: { type: "player" | "party"; index: number };
      if (targetRoll === 0 || aliveParty.length === 0) {
        preTarget = { type: "player", index: -1 };
      } else {
        const pt = aliveParty[targetRoll - 1];
        preTarget = { type: "party", index: battle.party.findIndex(p => p.id === pt.id) };
      }

      let walkToX: number, walkToY: number;
      if (preTarget.type === "party" && preTarget.index >= 0) {
        const tp = PARTY_POSITIONS[preTarget.index % PARTY_POSITIONS.length];
        walkToX = tp.x + 8;
        walkToY = tp.y;
      } else {
        walkToX = PLAYER_POS.x + 8;
        walkToY = PLAYER_POS.y;
      }

      setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
      setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: -(pos.x - walkToX), y: -(pos.y - walkToY) } }));

      // Cyclops has much longer attack animations (17/23 frames vs 6-9 for minotaur/harpy)
      // so compute timing from the actual frame count to let the full animation play
      let hitTime: number, walkBackTime: number, idleTime: number;
      if (isCyclops(enemy)) {
        const attackMs = useAlt ? Math.round(23 * 1000 / 12) : Math.round(17 * 1000 / 12);
        hitTime = 650 + Math.round(attackMs * 0.52);
        walkBackTime = 650 + attackMs + 80;
        idleTime = walkBackTime + 500;
      } else {
        hitTime = 1300;
        walkBackTime = 1600;
        idleTime = 2200;
      }

      scheduleTimer(() => {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
        playSfx("stabWhoosh", 0.9);
      }, 650);

      scheduleTimer(() => {
        const result = onEnemyAttack(enemyIdx, preTarget);
        if (!result.dodged) {
          setShakeScreen(true);
          if (result.target.type === "party") {
            setPartyHurtIndex(result.target.index);
            scheduleTimer(() => setPartyHurtIndex(-1), 500);
          } else {
            setAnimPhase("hurt");
          }
          playSfx("hitMetal", 0.7);
          scheduleTimer(() => setShakeScreen(false), 500);
        } else {
          setDodgeBlur(result.target);
          scheduleTimer(() => setDodgeBlur(null), 600);
          const dodgeSlot = result.target.type === "party"
            ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
            : ALLY_SLOTS[0];
          spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
        }
      }, hitTime);

      scheduleTimer(() => {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
        setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: 0, y: 0 } }));
      }, walkBackTime);

      scheduleTimer(() => {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
        setBossOffset(prev => ({ ...prev, [enemyIdx]: null }));
        setAnimPhase("idle");
        scheduleTimer(onDone, 300);
      }, idleTime);
    } else if (isResk(enemy)) {
      const useBreath = Math.random() < 0.4;
      setForestAttackVariant(prev => ({ ...prev, [enemyIdx]: useBreath ? 2 : 1 }));

      const aliveParty = battle.party.filter(p => p.currentHp > 0);
      const totalTargets = 1 + aliveParty.length;
      const targetRoll = Math.floor(Math.random() * totalTargets);
      let preTarget: { type: "player" | "party"; index: number };
      if (targetRoll === 0 || aliveParty.length === 0) {
        preTarget = { type: "player", index: -1 };
      } else {
        const pt = aliveParty[targetRoll - 1];
        preTarget = { type: "party", index: battle.party.findIndex(p => p.id === pt.id) };
      }

      if (useBreath) {
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
        playSfx("stabWhoosh", 0.8);

        scheduleTimer(() => {
          const result = onEnemyAttack(enemyIdx, preTarget, true);
          if (!result.dodged) {
            setShakeScreen(true);
            if (result.target.type === "party") {
              setPartyHurtIndex(result.target.index);
              scheduleTimer(() => setPartyHurtIndex(-1), 500);
            } else {
              setAnimPhase("hurt");
            }
            playSfx("hitMetal", 0.7);
            scheduleTimer(() => setShakeScreen(false), 500);
          } else {
            setDodgeBlur(result.target);
            scheduleTimer(() => setDodgeBlur(null), 600);
            const dodgeSlot = result.target.type === "party"
              ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
              : ALLY_SLOTS[0];
            spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
          }
        }, 1100);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
          setAnimPhase("idle");
          scheduleTimer(onDone, 300);
        }, 1900);
      } else {
        let walkToX: number, walkToY: number;
        if (preTarget.type === "party" && preTarget.index >= 0) {
          const tp = PARTY_POSITIONS[preTarget.index % PARTY_POSITIONS.length];
          walkToX = tp.x + 5;
          walkToY = tp.y;
        } else {
          walkToX = PLAYER_POS.x + 5;
          walkToY = PLAYER_POS.y;
        }

        const reskStopX = Math.max(walkToX + 18, pos.x - 15);
        setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
        setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: -(pos.x - reskStopX), y: -(pos.y - walkToY) } }));

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "attack" }));
        }, 650);

        scheduleTimer(() => {
          playSfx("stabWhoosh", 0.9);
          const result = onEnemyAttack(enemyIdx, preTarget, false);
          if (!result.dodged) {
            setShakeScreen(true);
            if (result.target.type === "party") {
              setPartyHurtIndex(result.target.index);
              scheduleTimer(() => setPartyHurtIndex(-1), 500);
            } else {
              setAnimPhase("hurt");
            }
            playSfx("hitMetal", 0.7);
            scheduleTimer(() => setShakeScreen(false), 500);
          } else {
            setDodgeBlur(result.target);
            scheduleTimer(() => setDodgeBlur(null), 600);
            const dodgeSlot = result.target.type === "party"
              ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
              : ALLY_SLOTS[0];
            spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
          }
        }, 1317);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "walk" }));
          setBossOffset(prev => ({ ...prev, [enemyIdx]: { x: 0, y: 0 } }));
        }, 1600);

        scheduleTimer(() => {
          setEnemyAnimStates(prev => ({ ...prev, [enemyIdx]: "idle" }));
          setBossOffset(prev => ({ ...prev, [enemyIdx]: null }));
          setAnimPhase("idle");
          scheduleTimer(onDone, 300);
        }, 2200);
      }
    } else {
      playSfx("stabWhoosh");
      const result = onEnemyAttack(enemyIdx);
      if (!result.dodged) {
        if (result.target.type === "party") {
          setPartyHurtIndex(result.target.index);
          scheduleTimer(() => setPartyHurtIndex(-1), 600);
        } else {
          setAnimPhase("hurt");
        }
        playSfx("hitMetal", 0.6);
      } else {
        setDodgeBlur(result.target);
        scheduleTimer(() => setDodgeBlur(null), 600);
        const dodgeSlot = result.target.type === "party"
          ? ALLY_SLOTS[(result.target.index % PARTY_POSITIONS.length) + 1]
          : ALLY_SLOTS[0];
        spawnDamageNumber("DODGE", dodgeSlot.x, 100 - dodgeSlot.y - 16, "#aaaaaa");
      }
      scheduleTimer(() => {
        setAnimPhase("idle");
        scheduleTimer(onDone, 300);
      }, 600);
    }
  }, [isDragonLord, isFrostLizard, isJotem, isDemonKin, isMinotaur, isCyclops, isHarpy, isResk, scheduleTimer, onEnemyAttack, spawnDamageNumber]);

  useEffect(() => {
    if (battle.phase !== "partyTurn") {
      setPartyAnimIndex(-1);
      setPartyAnimPhase("idle");
      setPartyAction("menu");
      setPartyTargetIdx(null);
      setPartySelectedSpell(null);
      return;
    }

    setPartyAnimIndex(battle.activePartyIndex);
    setPartyAnimPhase("idle");
    setPartyTargetIdx(null);
    setPartyAction("menu");
    setPartySelectedSpell(null);
    pendingPartySpellRef.current = null;
  }, [battle.phase, battle.activePartyIndex]);

  const prevQueueIdxRef = useRef(-1);

  useEffect(() => {
    const isNewEnemyTurn = startReady && battle.phase === "enemyTurn" && (
      prevPhaseRef.current !== "enemyTurn" || prevQueueIdxRef.current !== battle.turnQueueIndex
    );
    if (isNewEnemyTurn) {
      prevQueueIdxRef.current = battle.turnQueueIndex;
      const currentEntry = battle.turnQueue[battle.turnQueueIndex];
      if (!currentEntry || currentEntry.type !== "enemy") {
        onEnemyTurnEnd();
        prevPhaseRef.current = battle.phase;
        return;
      }

      const enemyIdx = currentEntry.index;
      const enemy = battle.enemies[enemyIdx];
      if (!enemy || enemy.currentHp <= 0) {
        scheduleTimer(() => onEnemyTurnEnd(), 200);
        prevPhaseRef.current = battle.phase;
        return;
      }

      animateEnemyAttack(enemyIdx, enemy, () => {
        scheduleTimer(() => onEnemyTurnEnd(), 800);
      });

      prevPhaseRef.current = battle.phase;
      return;
    }
    prevPhaseRef.current = battle.phase;
  }, [startReady, battle.phase, battle.turnQueueIndex, onEnemyTurnEnd, battle.enemies, scheduleTimer, animateEnemyAttack]);

  useEffect(() => {
    return () => clearEnemyTurnTimers();
  }, [clearEnemyTurnTimers]);

  const getEnemySprite = (enemyId: string): string => {
    return ENEMY_SPRITES[enemyId] || fireSlimeImg;
  };

  const playerSprites = PARTY_SPRITE_MAP[player.spriteId || "samurai"] || PARTY_SPRITE_MAP.samurai;

  const getSpriteSheet = (): { src: string; frames: number; fps: number; loop: boolean; pauseAt?: number; startAt?: number; holdFrames?: Record<number, number>; w: number; h: number } => {
    const idle = { src: playerSprites.idle, frames: playerSprites.idleFrames, fps: 8, loop: true, w: playerSprites.frameWidth, h: playerSprites.frameHeight };
    const atk = { src: playerSprites.attack, frames: playerSprites.attackFrames, fps: 12, loop: false, w: playerSprites.frameWidth, h: playerSprites.frameHeight };
    const hurt = { src: playerSprites.hurt, frames: playerSprites.hurtFrames, fps: 10, loop: false, w: playerSprites.frameWidth, h: playerSprites.frameHeight };
    const runSheet = playerSprites.run;
    const runConfig = runSheet ? { src: runSheet, frames: playerSprites.runFrames || 6, fps: 12, loop: true, w: playerSprites.frameWidth, h: playerSprites.frameHeight } : idle;
    const walkSheet = playerSprites.walk;
    const walkConfig = walkSheet ? { src: walkSheet, frames: playerSprites.walkFrames || 4, fps: 8, loop: true, w: playerSprites.frameWidth, h: playerSprites.frameHeight } : runConfig;

    switch (animPhase) {
      case "runToEnemy":
        return runConfig;
      case "runBack":
        return walkConfig;
      case "attacking":
        return atk;
      case "casting":
        if (windBladeActive) {
          return { ...atk, fps: 14, loop: false, pauseAt: atk.frames - 1 };
        }
        return atk;
      case "incinerationSlash": {
        if (player.spriteId === "knight") {
          return { src: slknightIncSlash, frames: 40, fps: 12, loop: false, startAt: 8, pauseAt: 19, w: 128, h: 64 };
        }
        const specialSheet = playerSprites.special;
        const specialFrames = playerSprites.specialFrames || playerSprites.attackFrames;
        if (specialSheet) {
          return { src: specialSheet, frames: specialFrames, fps: 12, loop: false, pauseAt: specialFrames - 1, w: playerSprites.frameWidth, h: playerSprites.frameHeight };
        }
        return { ...atk, fps: 12, loop: false, pauseAt: atk.frames - 1 };
      }
      case "eruptionCleave": {
        if (eruptionSubPhase === "run") return runConfig;
        if (eruptionSubPhase === "jumpRise" || eruptionSubPhase === "jumpHold") {
          return { src: slknightJump, frames: 4, fps: 12, loop: false, pauseAt: 3, w: 128, h: 64 };
        }
        return { src: slknightAirAttack, frames: 8, fps: 12, loop: false, pauseAt: 7, startAt: eruptionAirAttackStartFrame, w: 128, h: 64 };
      }
      case "thunderBolt": {
        if (player.element === "Lightning") {
          return { src: baskenThunderCast, frames: 7, fps: 9, loop: false, pauseAt: 6, w: 56, h: 56 };
        }
        return atk;
      }
      case "fujinSlice":
        if (fujinDashPhase === "windup") {
          return { ...atk, fps: 10, pauseAt: Math.min(3, atk.frames - 1) };
        }
        if (fujinDashPhase === "dash") {
          return { ...atk, fps: 10, pauseAt: Math.min(3, atk.frames - 1) };
        }
        if (fujinDashPhase === "strike") {
          return { ...atk, fps: 14, startAt: Math.min(3, atk.frames - 1) };
        }
        return idle;
      case "hurt":
        return hurt;
      default:
        return idle;
    }
  };

  const spriteConfig = getSpriteSheet();

  const getPlayerPosition = (): { x: number; y: number } => {
    if (animPhase === "fujinSlice" && fujinTargetIdx !== null) {
      const target = getEnemyGridPos(fujinTargetIdx);
      if (fujinDashPhase === "dash" || fujinDashPhase === "strike" || fujinDashPhase === "fadeout") {
        return { x: target.x + 12, y: target.y - 4 };
      }
      return getPlayerGridPos();
    }
    if (animPhase === "eruptionCleave") {
      return { x: eruptionKnightX, y: eruptionKnightY };
    }
    if ((animPhase === "runToEnemy" || animPhase === "attacking" || animPhase === "incinerationSlash" || (animPhase === "casting" && castingNeedsRunBack.current)) && pendingTargetIdx !== null) {
      const target = getEnemyGridPos(pendingTargetIdx);
      const targetEnemy = battle.enemies[pendingTargetIdx];
      const isBossTarget = targetEnemy && targetEnemy.isBoss;
      return { x: target.x - (isBossTarget ? 12 : 5), y: PLAYER_POS.y };
    }
    if (animPhase === "hurt") {
      return getPlayerGridPos();
    }
    return getPlayerGridPos();
  };

  const playerPos = getPlayerPosition();

  const isInputBlocked = !startReady || animPhase !== "idle" || partyAnimPhase !== "idle" || battle.phase !== "playerTurn";

  const partyRunBackHandled = useRef(false);

  useEffect(() => {
    setPartyAction("menu");
    setPartySelectedSpell(null);
  }, [battle.activePartyIndex]);

  const handleEnemyClick = (idx: number) => {
    if (battle.phase === "partyTurn" && partyAction === "selectTarget") {
      const target = battle.enemies[idx];
      if (!target || target.currentHp <= 0) return;
      if (battle.phase === "victory" || battle.phase === "defeat") return;
      const pIdx = battle.activePartyIndex;
      const member = battle.party[pIdx];
      if (!member || member.currentHp <= 0) return;
      setPartyTargetIdx(idx);
      setPartyAnimPhase("runToEnemy");
      setPartyAction("menu");
      return;
    }
    if (battle.phase === "partyTurn" && partyAction === "selectMagicTarget" && partySelectedSpell) {
      const target = battle.enemies[idx];
      if (!target || target.currentHp <= 0) return;
      const pIdx = battle.activePartyIndex;
      const spell = partySelectedSpell;
      const anim = spell.animation;
      setPartySelectedSpell(null);
      setPartyAction("menu");

      if (anim === "thunderBolt" || anim === "thunder") {
        setMagicZoom(true);
        setMagicZoomTarget(idx);
        playSfx("magicRing", 0.6);
        setThunderBoltActive(true);
        setThunderFrozenEnemy(idx);
        setThunderBoltFrame(0);
        const frameDuration = 80;
        const totalFrames = LIGHTNING_VFX_SEQUENCE.length;
        for (let i = 0; i < totalFrames; i++) {
          scheduleTimer(() => setThunderBoltFrame(i), i * frameDuration);
        }
        const damageTime = 10 * frameDuration;
        scheduleTimer(() => {
          onPartyMemberCastSpell(pIdx, spell, idx);
          setShakeScreen(true);
          scheduleTimer(() => setShakeScreen(false), 300);
          setEnemyHitIdx(idx);
          scheduleTimer(() => setEnemyHitIdx(null), 180);
          setEnemyAnimStates(prev => ({ ...prev, [idx]: "hurt" }));
          scheduleTimer(() => {
            setEnemyAnimStates(prev => prev[idx] === "death" ? prev : { ...prev, [idx]: ytrielRestAnim(idx) });
          }, 333);
        }, damageTime);
        scheduleTimer(() => {
          setThunderBoltActive(false);
          setThunderBoltFrame(0);
          setThunderFrozenEnemy(null);
          setMagicZoom(false);
          setMagicZoomTarget(null);
          if (battle.enemies.every(e => e.currentHp <= 0)) return;
          onAdvancePartyTurn();
        }, totalFrames * frameDuration + 200);
        return;
      }

      if (anim === "fujinSlice" || anim === "windBlade" || anim === "incinerationSlash" || anim === "eruptionCleave") {
        pendingPartySpellRef.current = { spell, targetIdx: idx, pIdx };
        setPartyTargetIdx(idx);
        setPartyAnimPhase("runToEnemy");
        return;
      }

      setMagicZoom(true);
      setMagicZoomTarget(idx);
      onPartyMemberCastSpell(pIdx, spell, idx);
      playSfx("magicRing");
      setTimeout(() => {
        setMagicZoom(false);
        setMagicZoomTarget(null);
        onAdvancePartyTurn();
      }, 600);
      return;
    }
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
  const fujinOrigin = (() => {
    if (!fujinZoomTarget) return "50% 50%";
    if (fujinDashPhase === "dash" || fujinDashPhase === "strike" || fujinDashPhase === "fadeout") {
      return `${playerPos.x}% ${100 - playerPos.y}%`;
    }
    return `${(PLAYER_POS.x + fujinZoomTarget.x) / 2}% ${(100 - (PLAYER_POS.y + fujinZoomTarget.y) / 2)}%`;
  })();

  const magicZoomOrigin = (() => {
    if (battle.phase === "partyTurn" && battle.activePartyIndex >= 0) {
      const pp = PARTY_POSITIONS[battle.activePartyIndex % PARTY_POSITIONS.length];
      return `${pp.x}% ${100 - pp.y}%`;
    }
    return `${playerPos.x}% ${100 - playerPos.y}%`;
  })();

  const turnSpriteId = battle.phase === "partyTurn" && battle.activePartyIndex >= 0 && battle.activePartyIndex < player.party.length
    ? player.party[battle.activePartyIndex].spriteId
    : player.spriteId;
  const tc = SPRITE_COLORS[turnSpriteId] || "#c9a44a";
  const turnLabel = battle.phase === "partyTurn"
    ? (battle.activePartyIndex >= 0 && battle.activePartyIndex < player.party.length ? player.party[battle.activePartyIndex].name : "Party")
    : battle.phase === "defeat" ? "Defeat" : player.name;

  return (
    <div className={`relative w-full h-full overflow-hidden ${shakeScreen ? "animate-[shake_0.3s_ease-out]" : ""}`}>
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
                  filter: "drop-shadow(0 0 8px rgba(255,255,255,0.6)) drop-shadow(0 0 20px rgba(200,220,255,0.3))",
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
      {tempestVortexActive && (
        <div className="absolute inset-0 z-[55] pointer-events-none">
          <div
            className="absolute inset-0 animate-[tempestVignette_1.8s_ease-out_forwards]"
            style={{
              background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,40,0,0.6) 100%)",
            }}
          />
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${40 + Math.random() * 40}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: `rgba(${150 + Math.random() * 100}, 255, ${150 + Math.random() * 100}, ${0.4 + Math.random() * 0.4})`,
                animation: `tempestParticle ${0.6 + Math.random() * 1.2}s ease-in-out ${Math.random() * 0.5}s infinite`,
                boxShadow: `0 0 ${4 + Math.random() * 6}px rgba(100, 255, 100, 0.5)`,
              }}
            />
          ))}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: fujinZoom ? "scale(1.45)" : magicZoom ? "scale(1.45)" : tempestVortexActive ? "scale(1.3)" : "scale(1)",
          transformOrigin: fujinZoom ? fujinOrigin : magicZoom ? magicZoomOrigin : tempestVortexActive ? "70% 55%" : "50% 50%",
          transition: (fujinZoom || magicZoom) ? "transform 0.6s cubic-bezier(0.25,0.1,0.25,1)" : tempestVortexActive ? "transform 0.5s cubic-bezier(0.25,0.1,0.25,1)" : "transform 0.5s cubic-bezier(0.25,0.1,0.25,1)",
          filter: fujinSliceActive ? "contrast(1.1) saturate(1.15)" : (magicZoom || tempestVortexActive) ? "contrast(1.1) saturate(1.15)" : "saturate(1.25) contrast(1.05)",
        }}
      >
      {regionTheme === "Fire" ? (
        <LavaBattleBg />
      ) : regionTheme === "Wind" ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${forestBattleBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center bottom",
              filter: "saturate(1.2) brightness(0.85) contrast(1.05)",
              transform: "scale(1.8) translateX(-75px)",
              transformOrigin: "center bottom",
            }}
          />
          <canvas
            ref={leafBattleCanvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width: "100%", height: "100%", zIndex: 1 }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0520] via-[#150a30] to-[#0a0418]" style={{ filter: "contrast(1.12) saturate(1.15)" }} />
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
        </>
      )}

      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        backgroundSize: "4px 4px",
        zIndex: 2,
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 1px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0.04) 2px)",
        zIndex: 2,
      }} />

      {battle.phase !== "victory" && regionTheme !== "Wind" && (
        <ParticleCanvas
          colors={regionTheme === "Fire" ? ["#ef4444", "#f97316", "#fbbf24", "#dc2626"]
            : regionTheme === "Ice" ? ["#67e8f9", "#3b82f6", "#93c5fd", "#e0f2fe"]
            : regionTheme === "Shadow" ? ["#7c3aed", "#6b21a8", "#4c1d95", "#ddd6fe"]
            : regionTheme === "Earth" ? ["#a16207", "#ca8a04", "#d97706", "#92400e"]
            : [elementColor, "#a855f7", "#6b21a8"]}
          count={regionTheme === "Fire" ? 35 : 20}
          speed={regionTheme === "Fire" ? 0.5 : 0.3}
          style={regionTheme === "Fire" ? "rain" : "ambient"}
        />
      )}

      {isLowHp && battle.phase !== "victory" && battle.phase !== "defeat" && (
        <div className="absolute inset-0 pointer-events-none animate-pulse z-5" style={{ boxShadow: "inset 0 0 80px rgba(239, 68, 68, 0.15)" }} />
      )}

      <BattleEffectsLayer
        regionTheme={regionTheme}
        playerElement={player.element}
        playerPos={playerPos}
        attackTargetPos={pendingTargetIdx !== null ? (() => { const p = getEnemyGridPos(pendingTargetIdx); return { x: p.x, y: p.y }; })() : null}
        animPhase={animPhase}
        enemyInfos={battle.enemies.map((e, i) => { const p = getEnemyGridPos(i); return { x: p.x, y: p.y, alive: e.currentHp > 0, element: e.element }; })}
        partyInfos={battle.party.map((m, i) => { const p = getPartyGridPos(i); return { x: p.x, y: p.y, alive: m.currentHp > 0, element: m.element }; })}
        playerAlive={battle.playerHp > 0}
        playerHpPct={hpPercent / 100}
      />

      {damageNumbers.map(d => {
        const numColor = d.isCrit ? "#fbbf24" : d.color;
        const numSize = d.text === "DODGE" ? "26px" : d.isCrit ? "30px" : "24px";
        const labelColor = d.label === "Super effective!" ? "#fbbf24" : d.label === "BLOCKED!" ? "#60a5fa" : "#b0bec5";
        return (
          <div
            key={d.id}
            className="absolute pointer-events-none z-50 animate-[dmgFloat_1.2s_ease-out_forwards] flex flex-col items-center"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          >
            <div className="flex items-center gap-1" style={{
              fontSize: numSize,
              fontWeight: 900,
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              color: numColor,
              WebkitTextStroke: "2px rgba(0,0,0,0.9)",
              paintOrder: "stroke fill",
              textShadow: `0 0 8px ${numColor}, 0 0 16px ${numColor}80, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000`,
              letterSpacing: "1px",
            }}>
              {d.isHeal && (
                <img src={healingIcon} alt="" style={{ width: 22, height: 22, imageRendering: "pixelated", flexShrink: 0, filter: "drop-shadow(0 0 4px #22c55e)" }} />
              )}
              {!d.isHeal && d.element && (
                <ElementPixelIcon element={d.element} pixelSize={d.isCrit ? 4 : 3} />
              )}
              {d.isBlocked && (
                <Shield className="w-6 h-6 flex-shrink-0" style={{ color: d.color, filter: `drop-shadow(0 0 6px ${d.color}) drop-shadow(0 0 12px ${d.color}80)`, WebkitTextStroke: "0", stroke: d.color, strokeWidth: 2.5 }} />
              )}
              {d.isCrit && !d.isHeal && (
                <span style={{ fontSize: "13px", fontFamily: "'Press Start 2P', cursive", color: "#fbbf24", WebkitTextStroke: "1.5px #000", paintOrder: "stroke fill", textShadow: "0 0 8px #fbbf24" }}>CRIT!</span>
              )}
              {d.text}
            </div>
            {d.label && (
              <div style={{
                fontSize: "8px",
                fontFamily: "'Press Start 2P', cursive",
                color: labelColor,
                WebkitTextStroke: "1px rgba(0,0,0,0.9)",
                paintOrder: "stroke fill",
                textShadow: d.label === "Super effective!" ? "0 0 6px #fbbf24" : d.label === "BLOCKED!" ? "0 0 6px #60a5fa" : "none",
                whiteSpace: "nowrap",
                marginTop: "2px",
              }}>
                {d.label}
              </div>
            )}
          </div>
        );
      })}

      <div className="relative z-10 h-full">
        <div className="absolute inset-0 overflow-hidden">

          <div
            ref={playerSpriteRef}
            className="absolute"
            style={{
              zIndex: (animPhase === "runToEnemy" || animPhase === "attacking" || animPhase === "runBack" || animPhase === "fujinSlice" || animPhase === "casting" || animPhase === "eruptionCleave" || animPhase === "thunderBolt" || animPhase === "incinerationSlash") ? 55 : 20,
              left: `${playerPos.x}%`,
              bottom: `${playerPos.y}%`,
              transform: `translateX(-50%)`,
              animation: eruptionShakeIntensity > 0 ? `eruptionChargeShake ${Math.max(0.03, 0.12 - eruptionShakeIntensity * 0.01)}s infinite` : playerFlash ? `playerHit 0.4s ease-out` : "none",
              ["--shake-px" as string]: `${eruptionShakeIntensity * 0.6}px`,
              opacity: fujinDashPhase === "fadeout" ? 0 : 1,
              filter: dodgeBlur && dodgeBlur.type === "player" ? "blur(3px) opacity(0.6)" : "none",
              transition: animPhase === "fujinSlice"
                ? fujinDashPhase === "dash"
                  ? "left 0.18s cubic-bezier(0.1,0,0.2,1), bottom 0.18s cubic-bezier(0.1,0,0.2,1)"
                  : fujinDashPhase === "strike"
                    ? "left 0.01s, bottom 0.01s"
                    : fujinDashPhase === "fadeout"
                      ? "opacity 0.15s ease-out"
                      : fujinDashPhase === "return"
                        ? "left 0s, bottom 0s, opacity 0.3s ease-in"
                        : "left 0.15s ease-out, bottom 0.15s ease-out, opacity 0.3s ease-in"
                : animPhase === "runToEnemy"
                  ? "left 0.40s ease-in, bottom 0.40s ease-in"
                  : animPhase === "runBack"
                    ? "left 0.40s ease-out, bottom 0.40s ease-out"
                    : animPhase === "eruptionCleave"
                      ? eruptionSubPhase === "run"
                        ? "left 0.40s ease-in, bottom 0s"
                        : eruptionSubPhase === "jumpRise"
                          ? "left 0.30s ease-out, bottom 0.30s ease-out"
                          : eruptionSubPhase === "jumpFall"
                            ? "bottom 0.50s ease-in, left 0s"
                            : "none"
                      : "left 0.15s ease-out, bottom 0.15s ease-out",
            }}
            onTransitionEnd={onPlayerTransitionEnd}
            data-testid="img-player-character"
          >
            {playerFlash && (
              <div className="absolute inset-0 z-30 animate-[flashDamage_0.4s_ease-out]" style={{ background: "radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)" }} />
            )}
            {fireHitSfx && (
              <div className="absolute z-30" style={{ top: "50%", left: "50%", width: 288, height: 288, transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
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
            {eruptionFlamelashActive && (
              <div className="absolute z-40 pointer-events-none" style={{
                top: "50%",
                left: "48%",
                width: 385,
                height: 385,
                transform: "translate(-50%, -50%)",
                filter: "drop-shadow(0 0 14px rgba(255,100,0,0.9)) drop-shadow(0 0 28px rgba(255,50,0,0.5))",
              }}>
                <SpriteAnimator
                  spriteSheet={firespinSheet}
                  frameWidth={100}
                  frameHeight={100}
                  totalFrames={61}
                  fps={38}
                  scale={3.85}
                  loop={false}
                  flipX={true}
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
            {animPhase === "casting" && !windBladeActive && windBladeFrozenEnemy === null && (
              <div
                className="absolute -inset-8 z-30 animate-[magicGlow_0.9s_ease-out_forwards]"
                style={{ background: `radial-gradient(circle, ${elementColor}50 0%, ${elementColor}20 40%, transparent 70%)` }}
                onAnimationEnd={onSpriteComplete}
              />
            )}
            
            <div style={{ position: "relative", width: Math.round(playerSprites.frameWidth * (playerSprites.scale || 3.5)), height: Math.round(playerSprites.frameHeight * (playerSprites.scale || 3.5)), overflow: "visible", filter: "brightness(1.15) saturate(1.35)" }}>
              <SpriteAnimator
                key={animPhase === "eruptionCleave" && eruptionSubPhase === "jumpFall" ? `erup-fall-${eruptionAirAttackRestartKey}` : "player-main"}
                spriteSheet={spriteConfig.src}
                frameWidth={spriteConfig.w}
                frameHeight={spriteConfig.h}
                totalFrames={spriteConfig.frames}
                fps={spriteConfig.fps}
                scale={playerSprites.scale || 3.5}
                loop={spriteConfig.loop}
                onComplete={onSpriteComplete}
                preloadSheets={[playerSprites.idle, playerSprites.attack, playerSprites.hurt, ...(playerSprites.run ? [playerSprites.run] : []), ...(playerSprites.walk ? [playerSprites.walk] : []), ...(playerSprites.special ? [playerSprites.special] : []), ...(playerSprites.death ? [playerSprites.death] : [])]}
                startFrame={spriteConfig.startAt}
                pauseAtFrame={spriteConfig.pauseAt}
                holdFrames={spriteConfig.holdFrames}
                anchor="bottom-center"
                colorMap={playerColorMap}
              />
              {animPhase === "defending" && (
                <div className="absolute z-30 pointer-events-none" style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}>
                  <SpriteAnimator
                    spriteSheet={blockShieldVfx}
                    frameWidth={220}
                    frameHeight={128}
                    totalFrames={48}
                    fps={12}
                    scale={1.2}
                    loop={false}
                    startFrame={8}
                    pauseAtFrame={19}
                    onComplete={onSpriteComplete}
                  />
                </div>
              )}
            </div>
          </div>

          {incinerationCasterPos && fireImpactVfx.filter(v => v.isIncSlash).map(v => (
            <div key={v.id} className="absolute z-50 pointer-events-none" style={{
              left: `calc(${incinerationCasterPos.x}% + 32px)`,
              bottom: `calc(${incinerationCasterPos.y}% - 46px)`,
              width: 192,
              height: 192,
              filter: "drop-shadow(0 0 12px rgba(255,120,0,0.8)) drop-shadow(0 0 24px rgba(255,60,0,0.4))",
            }}>
              <SpriteAnimator
                spriteSheet={vfxFireImpact}
                frameWidth={64}
                frameHeight={64}
                totalFrames={10}
                fps={16}
                scale={3}
                loop={false}
              />
            </div>
          ))}

          {eruptionBuildupActive && (
            <div className="absolute pointer-events-none" style={{
              zIndex: 60,
              left: `${eruptionKnightX}%`,
              bottom: `${eruptionKnightY}%`,
              width: 192,
              height: 192,
              transform: "translate(-50%, 32px)",
              filter: "drop-shadow(0 0 10px rgba(255,160,0,0.9)) drop-shadow(0 0 20px rgba(255,80,0,0.6))",
            }}>
              <SpriteAnimator
                spriteSheet={eruptionBuildupSheet}
                frameWidth={64}
                frameHeight={64}
                totalFrames={10}
                fps={8}
                scale={3}
                loop={false}
              />
            </div>
          )}

          {eruptionAuraActive && (
            <div className="absolute pointer-events-none" style={{
              zIndex: 58,
              left: `${eruptionKnightX}%`,
              bottom: `${eruptionKnightY}%`,
              width: 256,
              height: 256,
              transform: "translate(-50%, 64px)",
              filter: "drop-shadow(0 0 16px rgba(255,80,0,0.9)) drop-shadow(0 0 32px rgba(255,40,0,0.5))",
            }}>
              <SpriteAnimator
                spriteSheet={eruptionAuraSheet}
                frameWidth={128}
                frameHeight={128}
                totalFrames={8}
                fps={10}
                scale={2}
                loop={true}
              />
            </div>
          )}

          {eruptionNukeActive && (
            <div className="absolute pointer-events-none" style={{
              zIndex: 300,
              left: `${eruptionKnightX}%`,
              bottom: `${eruptionKnightY}%`,
              width: 576,
              height: 576,
              transform: "translate(-50%, 30%)",
              filter: "drop-shadow(0 0 24px rgba(255,80,0,0.9)) drop-shadow(0 0 48px rgba(255,40,0,0.5))",
            }}>
              <SpriteAnimator
                spriteSheet={nukeExplosionSheet}
                frameWidth={64}
                frameHeight={64}
                totalFrames={11}
                fps={18}
                scale={9}
                loop={false}
              />
            </div>
          )}

          {battle.party.length > 0 && battle.party.map((member, idx) => {
            const spriteInfo = PARTY_SPRITE_MAP[member.spriteId];
            if (!spriteInfo) return null;
            const isActiveParty = partyAnimIndex === idx;
            const isRunning = isActiveParty && (partyAnimPhase === "runToEnemy" || partyAnimPhase === "runBack");
            const isAttacking = isActiveParty && partyAnimPhase === "attacking";
            const isHurt = partyHurtIndex === idx;
            const isDead = member.currentHp <= 0;
            const basePos = getPartyGridPos(idx);

            let posX = basePos.x;
            let posY = basePos.y;
            if (isActiveParty && partyTargetIdx !== null) {
              const tgt = ENEMY_POSITIONS[partyTargetIdx % ENEMY_POSITIONS.length];
              if (partyAnimPhase === "runToEnemy" || partyAnimPhase === "attacking") {
                const tgtEnemy = battle.enemies[partyTargetIdx];
                const isBossTgt = tgtEnemy && tgtEnemy.isBoss;
                posX = tgt.x - (isBossTgt ? 16 : 8);
                posY = tgt.y - 4;
              }
            }

            const spriteSheet = isRunning && spriteInfo.run
              ? spriteInfo.run
              : isHurt ? spriteInfo.hurt
              : isAttacking ? spriteInfo.attack
              : spriteInfo.idle;
            const spriteFrames = isRunning && spriteInfo.runFrames
              ? spriteInfo.runFrames
              : isHurt ? spriteInfo.hurtFrames
              : isAttacking ? spriteInfo.attackFrames
              : spriteInfo.idleFrames;

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
                  transition: isRunning
                    ? "left 0.35s ease-in, bottom 0.35s ease-in, filter 0.2s ease"
                    : "left 0.35s ease-out, bottom 0.35s ease-out, filter 0.2s ease",
                }}
                onTransitionEnd={(e) => {
                  if (e.propertyName !== "left") return;
                  if (!isActiveParty) return;
                  if (partyAnimPhase === "runToEnemy") {
                    const attackingMember = battle.party[battle.activePartyIndex];
                    const memberElement = attackingMember?.element;

                    const doRunBack = (delay = 400) => {
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
                      }, delay);
                    };

                    const pendingSpell = pendingPartySpellRef.current;
                    if (pendingSpell) {
                      pendingPartySpellRef.current = null;
                      setPartyAnimPhase("attacking");
                      const { spell, targetIdx: spellTarget, pIdx } = pendingSpell;
                      const anim = spell.animation;

                      if (anim === "fujinSlice" || anim === "windBlade") {
                        playSfx("mifuneSlice");
                        playSfx("gruntAttack", 0.7);
                        const slashCount = 7;
                        const slashes = Array.from({ length: slashCount }, (_, i) => ({
                          id: i, rotation: Math.random() * 360,
                          offsetX: (Math.random() - 0.5) * 40,
                          offsetY: (Math.random() - 0.5) * 40,
                          scale: 0.8 + Math.random() * 0.5, active: false,
                        }));
                        setWindBladeFrozenEnemy(spellTarget);
                        setWindBladeSlashes(slashes);
                        setWindBladeActive(true);
                        for (let i = 0; i < slashCount; i++) {
                          scheduleTimer(() => {
                            setWindBladeSlashes(prev => prev.map((s, si) => si === i ? { ...s, active: true } : s));
                            playSfxPitched("windSlash", 0.7, 1.4, 0.7 + Math.random() * 0.3);
                            setEnemyHitIdx(spellTarget);
                            scheduleTimer(() => setEnemyHitIdx(null), 100);
                          }, i * 120);
                        }
                        scheduleTimer(() => {
                          onPartyMemberCastSpell(pIdx, spell, spellTarget);
                          playSfx("magicRing", 0.4);
                        }, 400);
                        scheduleTimer(() => {
                          setWindBladeSlashes([]);
                          setWindBladeActive(false);
                          setWindBladeFrozenEnemy(null);
                          doRunBack(0);
                        }, 1200);
                        return;
                      }

                      if (anim === "incinerationSlash") {
                        setIncinerationFrozenEnemy(spellTarget);
                        const isBossT = battle.enemies[spellTarget]?.isBoss;
                        const partySlot = PARTY_POSITIONS[pIdx % PARTY_POSITIONS.length];
                        setIncinerationCasterPos({ x: ENEMY_SLOTS[spellTarget].x - (isBossT ? 16 : 8), y: partySlot.y - 4 });
                        const fd = 1000 / 12;
                        const hold = 0;
                        scheduleTimer(() => playSfx("incinerationBladeSwings", 0.8), fd);
                        scheduleTimer(() => playSfx("incinerationBladeSwings", 0.8), fd * 4 + hold);
                        [fd * 2 + hold, fd * 6 + hold * 2].forEach(t => {
                          scheduleTimer(() => {
                            const id = ++fireImpactId.current;
                            setFireImpactVfx(prev => [...prev, { targetIdx: spellTarget, id, isIncSlash: true }]);
                            playSfx("incinerationCleave", 1.2);
                            setEnemyHitIdx(spellTarget);
                            scheduleTimer(() => setEnemyHitIdx(null), 180);
                          }, t);
                        });
                        const totalAnim = fd * 11 + hold * 2;
                        scheduleTimer(() => {
                          onPartyMemberCastSpell(pIdx, spell, spellTarget);
                          playSfx("magicRing", 0.4);
                        }, totalAnim + 200);
                        scheduleTimer(() => {
                          setFireImpactVfx([]);
                          setIncinerationCasterPos(null);
                          setIncinerationFrozenEnemy(null);
                          doRunBack(0);
                        }, totalAnim + 600);
                        return;
                      }

                      if (anim === "eruptionCleave") {
                        setEruptionFrozenEnemy(spellTarget);
                        playSfx("gruntAttack", 0.7);
                        const fd = 1000 / 12;
                        const flamelashDur = Math.ceil(61 / 38 * 1000);
                        const flamelashStart = fd + 200;
                        const resumeAfter = flamelashStart + flamelashDur;
                        const nukeStart = resumeAfter + Math.round(6 / 12 * 1000);
                        const totalAnim = nukeStart + 11 * (1000 / 18) + 400;
                        scheduleTimer(() => {
                          setEruptionFlamelashActive(true);
                          eruptionFlamelashAudio.current = playSfx("eruptionFlamelash", 0.8);
                          eruptionFirechargeAudio.current = playSfx("eruptionFirecharge", 0.8);
                          setEruptionShakeIntensity(1);
                        }, flamelashStart);
                        const shakeSteps = 8;
                        for (let i = 1; i <= shakeSteps; i++) {
                          scheduleTimer(() => setEruptionShakeIntensity(Math.min(i + 1, shakeSteps)), flamelashStart + (flamelashDur / shakeSteps) * i);
                        }
                        scheduleTimer(() => {
                          setEruptionFlamelashActive(false);
                          setEruptionShakeIntensity(0);
                          playSfx("eruptionDownwardSlash", 0.9);
                        }, resumeAfter);
                        scheduleTimer(() => {
                          stopSfx(eruptionFirechargeAudio.current);
                          eruptionFirechargeAudio.current = null;
                          stopSfx(eruptionFlamelashAudio.current);
                          eruptionFlamelashAudio.current = null;
                          setEruptionNukeActive(true);
                          setEruptionNukeTargetIdx(spellTarget);
                          setEruptionAirAttackStartFrame(4);
                          setEruptionAirAttackRestartKey(k => k + 1);
                          playSfx("eruptionCleave", 1.3);
                          setShakeScreen(true);
                          scheduleTimer(() => setShakeScreen(false), 500);
                          setEnemyHitIdx(spellTarget);
                          scheduleTimer(() => setEnemyHitIdx(null), 300);
                          setEnemyAnimStates(prev => ({ ...prev, [spellTarget]: "hurt" }));
                          scheduleTimer(() => {
                            setEnemyAnimStates(prev => prev[spellTarget] === "death" ? prev : { ...prev, [spellTarget]: ytrielRestAnim(spellTarget) });
                          }, 500);
                        }, nukeStart);
                        scheduleTimer(() => {
                          onPartyMemberCastSpell(pIdx, spell, spellTarget);
                          playSfx("magicRing", 0.4);
                        }, nukeStart + 200);
                        scheduleTimer(() => {
                          setEruptionNukeActive(false);
                          setEruptionNukeTargetIdx(null);
                          setEruptionAirAttackStartFrame(0);
                          setEruptionFrozenEnemy(null);
                          doRunBack(0);
                        }, totalAnim);
                        return;
                      }

                      playSfx("magicRing", 0.6);
                      onPartyMemberCastSpell(pIdx, spell, spellTarget);
                      doRunBack(400);
                      return;
                    }

                    setPartyAnimPhase("attacking");
                    if (memberElement === "Wind") {
                      playSfx("mifuneSlice");
                      playSfx("gruntAttack", 0.7);
                      if (partyTargetIdx !== null) {
                        const tidx = partyTargetIdx;
                        const slashCount = 7;
                        const slashes = Array.from({ length: slashCount }, (_, i) => ({
                          id: i, rotation: Math.random() * 360,
                          offsetX: (Math.random() - 0.5) * 40,
                          offsetY: (Math.random() - 0.5) * 40,
                          scale: 0.8 + Math.random() * 0.5, active: false,
                        }));
                        setWindBladeFrozenEnemy(tidx);
                        setWindBladeSlashes(slashes);
                        setWindBladeActive(true);
                        for (let i = 0; i < slashCount; i++) {
                          scheduleTimer(() => {
                            setWindBladeSlashes(prev => prev.map((s, si) => si === i ? { ...s, active: true } : s));
                            playSfxPitched("windSlash", 0.7, 1.4, 0.7 + Math.random() * 0.3);
                            setEnemyHitIdx(tidx);
                            scheduleTimer(() => setEnemyHitIdx(null), 100);
                          }, i * 120);
                        }
                        scheduleTimer(() => onPartyMemberAttack(battle.activePartyIndex, tidx), 300);
                        scheduleTimer(() => {
                          setWindBladeSlashes([]);
                          setWindBladeActive(false);
                          setWindBladeFrozenEnemy(null);
                          doRunBack(0);
                        }, 1200);
                      }
                      return;
                    }

                    if (memberElement === "Fire") {
                      if (partyTargetIdx !== null) {
                        const tidx = partyTargetIdx;
                        setIncinerationFrozenEnemy(tidx);
                        const isBossT = battle.enemies[tidx]?.isBoss;
                        const partySlot = PARTY_POSITIONS[battle.activePartyIndex % PARTY_POSITIONS.length];
                        setIncinerationCasterPos({ x: ENEMY_SLOTS[tidx].x - (isBossT ? 16 : 8), y: partySlot.y - 4 });
                        const fd = 1000 / 12;
                        const hold = 0;
                        scheduleTimer(() => playSfx("incinerationBladeSwings", 0.8), fd);
                        scheduleTimer(() => playSfx("incinerationBladeSwings", 0.8), fd * 4 + hold);
                        [fd * 2, fd * 5 + hold].forEach(t => {
                          scheduleTimer(() => {
                            const id = ++fireImpactId.current;
                            setFireImpactVfx(prev => [...prev, { targetIdx: tidx, id, isIncSlash: true }]);
                            playSfx("incinerationCleave", 1.2);
                            setEnemyHitIdx(tidx);
                            scheduleTimer(() => setEnemyHitIdx(null), 180);
                          }, t);
                        });
                        const totalAnim = fd * 7 + hold * 2;
                        scheduleTimer(() => onPartyMemberAttack(battle.activePartyIndex, tidx), fd * 2);
                        scheduleTimer(() => {
                          setFireImpactVfx([]);
                          setIncinerationCasterPos(null);
                          setIncinerationFrozenEnemy(null);
                          doRunBack(0);
                        }, totalAnim + 200);
                      }
                      return;
                    }

                    playSfx("swordSwing");
                    if (partyTargetIdx !== null) {
                      onPartyMemberAttack(battle.activePartyIndex, partyTargetIdx);
                    }
                    doRunBack(400);
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
                <div style={{ position: "relative", width: Math.round(spriteInfo.frameWidth * (spriteInfo.scale || 3.5)), height: Math.round(spriteInfo.frameHeight * (spriteInfo.scale || 3.5)), overflow: "visible", filter: "brightness(1.15) saturate(1.35)" }}>
                  <SpriteAnimator
                    spriteSheet={spriteSheet}
                    frameWidth={spriteInfo.frameWidth}
                    frameHeight={spriteInfo.frameHeight}
                    totalFrames={spriteFrames}
                    fps={isAttacking ? 14 : isRunning ? 14 : 8}
                    scale={spriteInfo.scale || 3.5}
                    loop={!isAttacking && !isHurt}
                    onComplete={isAttacking || isHurt ? () => {} : undefined}
                    anchor="bottom-center"
                  />
                  {partyGuardIndex === idx && (
                    <div className="absolute z-30 pointer-events-none" style={{
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}>
                      <SpriteAnimator
                        spriteSheet={blockShieldVfx}
                        frameWidth={220}
                        frameHeight={128}
                        totalFrames={48}
                        fps={12}
                        scale={1.2}
                        loop={false}
                        startFrame={8}
                        pauseAtFrame={19}
                        onComplete={() => setPartyGuardIndex(-1)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div
            className="absolute z-[80] pointer-events-none"
            style={{
              left: "8px",
              top: "6px",
              width: "auto",
              maxWidth: "420px",
              filter: "brightness(1.25) saturate(1.5)",
            }}
          >
            <div className="flex flex-col gap-1">
              {[
                {
                  name: player.name,
                  level: player.level,
                  hp: battle.playerHp,
                  maxHp: player.stats.maxHp,
                  mp: battle.playerMp,
                  maxMp: player.stats.maxMp,
                  element: player.element,
                  isPlayer: true,
                  isDead: battle.playerHp <= 0,
                  isActive: battle.phase === "playerTurn",
                  buffs: battle.buffs.filter(b => b.targetType === "player"),
                  xp: player.xp,
                  xpToNext: player.xpToNext,
                },
                ...battle.party.map((member, idx) => ({
                  name: member.name,
                  level: member.level || 1,
                  hp: member.currentHp,
                  maxHp: member.stats.maxHp,
                  mp: member.currentMp,
                  maxMp: member.stats.maxMp,
                  element: member.element,
                  isPlayer: false,
                  isDead: member.currentHp <= 0,
                  isActive: battle.phase === "partyTurn" && battle.activePartyIndex === idx,
                  buffs: battle.buffs.filter(b => b.targetType === "party" && b.targetIndex === idx),
                  xp: member.xp || 0,
                  xpToNext: member.xpToNext || 100,
                })),
              ].map((char, i) => {
                const charHpPct = Math.max(0, (char.hp / char.maxHp) * 100);
                const charMpPct = Math.max(0, (char.mp / char.maxMp) * 100);
                const charXpPct = char.xpToNext > 0 ? Math.min(100, (char.xp / char.xpToNext) * 100) : 0;
                const charLowHp = charHpPct <= 25;
                const elColor = ELEMENT_COLORS[char.element];
                const charOpacity = char.isDead ? 0.3 : 1;
                return (
                  <div
                    key={i}
                    className="relative"
                    style={{
                      width: "230px",
                      opacity: charOpacity,
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
                        border: `2px solid ${char.isActive ? elColor + "99" : "#c9a44a50"}`,
                        boxShadow: char.isActive
                          ? `0 0 18px ${elColor}55, 0 0 8px #c9a44a20, inset 0 1px 0 rgba(255,255,255,0.08)`
                          : `0 0 6px #c9a44a20, inset 0 1px 0 rgba(255,255,255,0.05)`,
                        imageRendering: "pixelated",
                      }}
                    >
                      <div className="px-2.5 py-1.5" style={{ borderBottom: `1px solid ${elColor}35` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 flex-shrink-0"
                              style={{
                                background: elColor,
                                boxShadow: char.isActive ? `0 0 7px ${elColor}` : `0 0 4px ${elColor}`,
                              }}
                            />
                            <span
                              style={{
                                fontFamily: "'Press Start 2P', cursive",
                                fontSize: "9px",
                                color: char.isActive ? "#ffffff" : "#d0c8e8",
                                textShadow: char.isActive ? `0 0 6px ${elColor}40` : "none",
                                letterSpacing: "0.05em",
                                imageRendering: "pixelated",
                              }}
                              data-testid={char.isPlayer ? "text-player-battle-name" : undefined}
                            >
                              {char.name}
                            </span>
                          </div>
                          <span style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "8px",
                            color: (battle.phase === "victory" && showVictoryUI && char.isPlayer && xpBarLevelUp) ? "#fde047" : `${elColor}80`,
                            imageRendering: "pixelated",
                          }}>
                            Lv{(battle.phase === "victory" && showVictoryUI && char.isPlayer) ? xpBarLevel : char.level}
                            {(battle.phase === "victory" && showVictoryUI && char.isPlayer && xpBarLevelUp) ? "+" : ""}
                          </span>
                        </div>
                        {char.buffs.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {char.buffs.map((buff, bi) => (
                              <span
                                key={bi}
                                style={{
                                  fontFamily: "'Press Start 2P', cursive",
                                  fontSize: "7px",
                                  padding: "2px 4px",
                                  background: `${elColor}15`,
                                  color: elColor,
                                  border: `1px solid ${elColor}30`,
                                  imageRendering: "pixelated",
                                }}
                              >
                                {buff.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="px-2.5 py-1.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "7px",
                            color: charLowHp ? "#fca5a5" : "#86efac",
                            width: "18px",
                            imageRendering: "pixelated",
                          }}>HP</span>
                          <AnimatedHpBar value={char.hp} max={char.maxHp} lowThreshold={25} height="2.5" />
                          <span
                            style={{
                              fontFamily: "'Press Start 2P', cursive",
                              fontSize: "7px",
                              color: charLowHp ? "#fca5a5" : "#c8c0de",
                              minWidth: "50px",
                              textAlign: "right",
                              imageRendering: "pixelated",
                            }}
                            data-testid={char.isPlayer ? "text-player-hp" : undefined}
                          >
                            {char.hp}/{char.maxHp}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "7px",
                            color: "#93c5fd",
                            width: "18px",
                            imageRendering: "pixelated",
                          }}>MP</span>
                          <div
                            className="flex-1 h-2 overflow-hidden relative"
                            style={{
                              background: "rgba(0,0,0,0.4)",
                              border: "1px solid rgba(255,255,255,0.13)",
                            }}
                          >
                            <div
                              className="h-full transition-all duration-500 ease-out"
                              style={{
                                width: `${charMpPct}%`,
                                background: "#60a5fa",
                                boxShadow: "0 0 5px rgba(96,165,250,0.85)",
                                imageRendering: "pixelated",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontFamily: "'Press Start 2P', cursive",
                              fontSize: "7px",
                              color: "#93c5fd",
                              minWidth: "50px",
                              textAlign: "right",
                              imageRendering: "pixelated",
                            }}
                            data-testid={char.isPlayer ? "text-player-mp" : undefined}
                          >
                            {char.mp}/{char.maxMp}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "7px",
                            color: "#fbbf24",
                            width: "18px",
                            imageRendering: "pixelated",
                          }}>XP</span>
                          <div
                            className="flex-1 h-1.5 overflow-hidden relative"
                            style={{
                              background: "rgba(0,0,0,0.35)",
                              border: "1px solid rgba(255,255,255,0.10)",
                            }}
                          >
                            <div
                              className="h-full relative overflow-hidden"
                              style={{
                                width: `${(battle.phase === "victory" && showVictoryUI && char.isPlayer) ? xpBarPercent : charXpPct}%`,
                                background: (battle.phase === "victory" && showVictoryUI && char.isPlayer && xpBarLevelUp)
                                  ? "#fde047"
                                  : "#f59e0b",
                                boxShadow: (battle.phase === "victory" && showVictoryUI && char.isPlayer && xpBarLevelUp)
                                  ? "0 0 6px rgba(250,204,21,0.6)"
                                  : "none",
                                transition: (battle.phase === "victory" && showVictoryUI && char.isPlayer)
                                  ? (xpBarPhase === "animating" ? "width 0.7s ease-out" : "none")
                                  : "width 0.5s ease-out",
                                imageRendering: "pixelated",
                              }}
                            />
                          </div>
                          <span style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "7px",
                            color: "rgba(217,119,6,0.5)",
                            minWidth: "50px",
                            textAlign: "right",
                            imageRendering: "pixelated",
                          }}>
                            {char.xp}/{char.xpToNext}
                          </span>
                        </div>
                      </div>

                      {char.isActive && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-px"
                          style={{
                            background: `linear-gradient(90deg, transparent 0%, ${elColor} 20%, ${elColor} 80%, transparent 100%)`,
                            boxShadow: `0 0 4px ${elColor}80`,
                          }}
                        />
                      )}
                      {char.isActive && (
                        <div
                          className="absolute top-0 left-0 right-0 h-px"
                          style={{
                            background: `linear-gradient(90deg, transparent 0%, ${elColor}40 20%, ${elColor}40 80%, transparent 100%)`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="absolute z-[80]"
            style={{
              right: "8px",
              top: "6px",
              width: "auto",
              maxWidth: "420px",
              pointerEvents: "none",
              filter: "brightness(1.25) saturate(1.5)",
            }}
          >
            <div className="flex flex-col gap-1 items-end">
              {battle.enemies.map((enemy, idx) => {
                const isDead = enemy.currentHp <= 0;
                const eHpPct = Math.max(0, (enemy.currentHp / enemy.stats.hp) * 100);
                const eLowHp = eHpPct <= 25;
                const elColor = ELEMENT_COLORS[enemy.element];
                const eOpacity = isDead ? 0.3 : 1;
                const eTargetable = !isDead && (
                  (!isInputBlocked && (selectedAction === "attack" || (selectedAction === "magic" && selectedSpell?.targetType === "enemy"))) ||
                  (battle.phase === "partyTurn" && (partyAction === "selectTarget" || partyAction === "selectMagicTarget"))
                );
                return (
                  <div
                    key={`ehp-${idx}`}
                    className="relative flex items-center"
                    style={{
                      opacity: eOpacity,
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    {eTargetable && (
                      <div
                        className="flex-shrink-0 mr-1.5"
                        style={{
                          width: "12px",
                          height: "12px",
                          imageRendering: "pixelated",
                          filter: "drop-shadow(0 0 4px rgba(250,204,21,0.7))",
                          animation: "pointerBounce 0.6s ease-in-out infinite alternate",
                        }}
                      >
                        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
                          <rect x="0" y="4" width="4" height="4" fill="#fbbf24" />
                          <rect x="4" y="2" width="4" height="2" fill="#fbbf24" />
                          <rect x="4" y="8" width="4" height="2" fill="#fbbf24" />
                          <rect x="8" y="0" width="4" height="2" fill="#fbbf24" />
                          <rect x="8" y="4" width="4" height="4" fill="#fbbf24" />
                          <rect x="8" y="10" width="4" height="2" fill="#fbbf24" />
                        </svg>
                      </div>
                    )}
                    <button
                      className={`${eTargetable ? "cursor-pointer hover:brightness-125" : "cursor-default"}`}
                      style={{
                        width: "200px",
                        pointerEvents: eTargetable ? "auto" : "none",
                        transition: "filter 0.2s ease",
                      }}
                      onClick={() => eTargetable && handleEnemyClick(idx)}
                      data-testid={`button-enemy-target-${idx}`}
                    >
                    <div
                      className="relative overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, rgba(22,14,42,0.88) 0%, rgba(14,8,32,0.93) 100%)",
                        border: `2px solid ${eTargetable ? "#fbbf2490" : elColor + "50"}`,
                        boxShadow: eTargetable ? "0 0 14px rgba(251,191,36,0.45)" : `0 0 6px ${elColor}25, inset 0 1px 0 rgba(255,255,255,0.05)`,
                        imageRendering: "pixelated",
                        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                      }}
                    >
                      <div className="px-2.5 py-1.5" style={{ borderBottom: `1px solid ${elColor}35` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 flex-shrink-0"
                              style={{
                                background: elColor,
                                boxShadow: `0 0 4px ${elColor}`,
                              }}
                            />
                            <span
                              style={{
                                fontFamily: "'Press Start 2P', cursive",
                                fontSize: "9px",
                                color: "#b8b0c8",
                                letterSpacing: "0.05em",
                                imageRendering: "pixelated",
                              }}
                              data-testid={`text-enemy-name-${idx}`}
                            >
                              {enemy.name}
                            </span>
                          </div>
                          <span style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "8px",
                            color: `${elColor}80`,
                            imageRendering: "pixelated",
                          }}>
                            Lv{enemy.level}
                          </span>
                        </div>
                      </div>

                      <div className="px-2.5 py-1.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span style={{
                            fontFamily: "'Press Start 2P', cursive",
                            fontSize: "7px",
                            color: eLowHp ? "#fca5a5" : "#86efac",
                            width: "18px",
                            imageRendering: "pixelated",
                          }}>HP</span>
                          <AnimatedHpBar value={enemy.currentHp} max={enemy.stats.hp} lowThreshold={25} height="2.5" />
                          <span
                            style={{
                              fontFamily: "'Press Start 2P', cursive",
                              fontSize: "7px",
                              color: eLowHp ? "#fca5a5" : "#c8c0de",
                              minWidth: "50px",
                              textAlign: "right",
                              imageRendering: "pixelated",
                            }}
                            data-testid={`text-enemy-hp-${idx}`}
                          >
                            {enemy.currentHp}/{enemy.stats.hp}
                          </span>
                        </div>
                      </div>
                    </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {battle.enemies.map((enemy, idx) => {
            if (dissolvedEnemies.has(idx)) return null;
            const isDead = enemy.currentHp <= 0;
            const isHit = enemyHitIdx === idx;
            const spriteImg = getEnemySprite(enemy.id);
            const isBoss = enemy.isBoss;
            const pos = getEnemyGridPos(idx);
            const isSpriteTargetable = !isDead && (
              (!isInputBlocked && (selectedAction === "attack" || (selectedAction === "magic" && selectedSpell?.targetType === "enemy"))) ||
              (battle.phase === "partyTurn" && (partyAction === "selectTarget" || partyAction === "selectMagicTarget"))
            );
            const isFireDemon = enemy.element === "Fire" && !enemy.isBoss && !isDemonKin(enemy);

            const enemyBossOffset = bossOffset[idx] ?? null;
            const isBossMoving = (isDragonLord(enemy) || isJotem(enemy) || isDemonKin(enemy) || isMinotaur(enemy) || isCyclops(enemy) || isHarpy(enemy) || isResk(enemy)) && enemyBossOffset !== null;
            const bossLeft = isBossMoving ? pos.x + enemyBossOffset.x : pos.x;
            const bossBottom = isBossMoving ? pos.y + enemyBossOffset.y : pos.y;

            const groundYShift = getEnemyGroundYShift(enemy);

            return (
              <div
                key={idx}
                className="absolute"
                style={{
                  left: `${bossLeft}%`,
                  bottom: `${bossBottom}%`,
                  transform: groundYShift !== 0 ? `translateX(-50%) translateY(${groundYShift}px)` : "translateX(-50%)",
                  zIndex: isBossMoving ? 55 : Math.floor(pos.y),
                  transition: isBossMoving || (isDragonLord(enemy) || isJotem(enemy) || isDemonKin(enemy) || isMinotaur(enemy) || isCyclops(enemy) || isHarpy(enemy) || isResk(enemy)) ? "left 0.5s ease, bottom 0.5s ease" : "none",
                  cursor: isSpriteTargetable ? "pointer" : "default",
                }}
                onClick={() => isSpriteTargetable && handleEnemyClick(idx)}
              >
              <div
                className={`${isHit ? "animate-[enemyHit_0.4s_ease-out]" : ""}`}
                style={{
                  transform: `scale(${pos.z})`,
                  transition: "transform 0.5s ease, opacity 0.3s ease, filter 0.2s ease",
                  filter: dodgeBlur && dodgeBlur.type === "enemy" && dodgeBlur.index === idx ? "blur(3px) opacity(0.6)" : isSpriteTargetable ? "brightness(1.15) saturate(1.35) drop-shadow(0 0 8px rgba(251,191,36,0.5))" : "brightness(1.12) saturate(1.3)",
                }}
                data-testid={`button-enemy-${idx}`}
              >
                <div className="flex flex-col items-center">

                <div className="flex items-center justify-center gap-1.5 mb-1 invisible" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                  <span className="text-[10px]">Lv{enemy.level}</span>
                  <span className="text-xs" data-testid={`text-enemy-name-${idx}`}>{enemy.name}</span>
                </div>

                <div className={`relative ${isDead ? "" : windBladeFrozenEnemy === idx ? "" : isFireDemon ? "animate-[idleBob_2.8s_ease-in-out_infinite]" : ""}`} style={{ animationDelay: `${idx * 0.5}s`, lineHeight: 0 }}>
                  
                  

                  {windBladeSlashes.length > 0 && windBladeFrozenEnemy === idx && (
                    <div className="absolute z-30 pointer-events-none" style={{
                      top: "-80%",
                      left: "-60%",
                      width: "220%",
                      height: "260%",
                    }}>
                      {windBladeSlashes.filter(s => s.active).map((slash) => (
                        <div
                          key={slash.id}
                          className="absolute"
                          style={{
                            top: `${35 + slash.offsetY}%`,
                            left: `${35 + slash.offsetX}%`,
                            width: "50%",
                            height: "50%",
                            transform: `rotate(${slash.rotation}deg) scale(${slash.scale})`,
                            filter: "drop-shadow(0 0 12px rgba(255,255,255,0.7))",
                            animation: "windSlashFade 0.6s ease-out forwards",
                          }}
                        >
                          <SpriteAnimator
                            spriteSheet={windSlashAnim}
                            frameWidth={128}
                            frameHeight={128}
                            totalFrames={10}
                            fps={16}
                            scale={2}
                            loop={false}
                            style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {windSparkleTarget === idx && (
                    <div className="absolute z-30 pointer-events-none" style={{
                      top: "-120%",
                      left: "-100%",
                      width: "300%",
                      height: "320%",
                      filter: "drop-shadow(0 0 24px rgba(255,220,100,0.9)) drop-shadow(0 0 48px rgba(255,180,50,0.5))",
                      animation: "windSparkleGlow 1.0s ease-out forwards",
                    }}>
                      <SpriteAnimator
                        spriteSheet={mifuneBurstSheet}
                        frameWidth={96}
                        frameHeight={96}
                        totalFrames={7}
                        fps={10}
                        scale={5}
                        loop={false}
                        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
                      />
                    </div>
                  )}
                  
                  {fireImpactVfx.filter(v => v.targetIdx === idx && !v.isIncSlash).map(v => (
                    <div key={v.id} className="absolute z-50 pointer-events-none" style={{
                      top: "50%",
                      left: "50%",
                      width: 192,
                      height: 192,
                      transform: "translate(-50%, -50%)",
                      filter: "drop-shadow(0 0 12px rgba(255,120,0,0.8)) drop-shadow(0 0 24px rgba(255,60,0,0.4))",
                    }}>
                      <SpriteAnimator
                        spriteSheet={vfxFireImpact}
                        frameWidth={64}
                        frameHeight={64}
                        totalFrames={10}
                        fps={16}
                        scale={3}
                        loop={false}
                      />
                    </div>
                  ))}
                  {windSpellVfx && windSpellVfx.targets.includes(idx) && windSpellVfx.type !== "tempest" && (
                    <div className="absolute z-25 pointer-events-none" style={{
                      top: "-60%",
                      left: "-50%",
                      width: "200%",
                      height: "200%",
                      filter: "drop-shadow(0 0 10px rgba(255,255,255,0.6))",
                    }}>
                      <SpriteAnimator
                        spriteSheet={windSpellVfx.type === "windBlade" ? vfxWindSlash2 : vfxWindSlash3}
                        frameWidth={128}
                        frameHeight={128}
                        totalFrames={windSpellVfx.type === "windBlade" ? 7 : 9}
                        fps={14}
                        scale={2.5}
                        loop={false}
                        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
                      />
                    </div>
                  )}
                  {windSpellVfx && windSpellVfx.targets.includes(idx) && windSpellVfx.type === "tempest" && (
                    <div className="absolute z-25 pointer-events-none" style={{
                      top: "-150%",
                      left: "-60%",
                      width: "220%",
                      height: "300%",
                    }}>
                      <div className="absolute inset-0 animate-[tornadoSpin_0.6s_linear_infinite]" style={{
                        background: "conic-gradient(from 0deg, transparent 0%, rgba(100,255,100,0.3) 25%, transparent 50%, rgba(100,255,100,0.2) 75%, transparent 100%)",
                        borderRadius: "50%",
                        filter: "blur(2px)",
                      }} />
                      <div className="absolute inset-[10%] animate-[tornadoSpin_0.4s_linear_infinite_reverse]" style={{
                        background: "conic-gradient(from 90deg, transparent 0%, rgba(150,255,150,0.4) 30%, transparent 55%, rgba(150,255,150,0.3) 80%, transparent 100%)",
                        borderRadius: "50%",
                        filter: "blur(1px)",
                      }} />
                      <div className="absolute inset-[25%] animate-[tornadoSpin_0.3s_linear_infinite]" style={{
                        background: "conic-gradient(from 180deg, transparent 0%, rgba(200,255,200,0.5) 35%, transparent 60%, rgba(200,255,200,0.4) 85%, transparent 100%)",
                        borderRadius: "50%",
                      }} />
                      {Array.from({ length: 8 }).map((_, pi) => (
                        <div key={pi} className="absolute rounded-full" style={{
                          left: `${30 + Math.random() * 40}%`,
                          top: `${10 + Math.random() * 80}%`,
                          width: `${3 + Math.random() * 5}px`,
                          height: `${3 + Math.random() * 5}px`,
                          background: `rgba(150, 255, 150, ${0.5 + Math.random() * 0.5})`,
                          animation: `tempestParticle ${0.4 + Math.random() * 0.8}s ease-in-out ${Math.random() * 0.3}s infinite`,
                          boxShadow: "0 0 6px rgba(100,255,100,0.6)",
                        }} />
                      ))}
                    </div>
                  )}
                  {thunderBoltActive && thunderFrozenEnemy === idx && (() => {
                    const frame = LIGHTNING_VFX_SEQUENCE[thunderBoltFrame] || LIGHTNING_VFX_SEQUENCE[0];
                    const frameIdx = thunderBoltFrame;
                    const scale = 4;

                    let clipPath: string | undefined;
                    let posStyle: Record<string, string | number> = {};

                    if (frame.isSpot) {
                      posStyle = { left: "50%", bottom: "-10%", transform: "translateX(-50%)" };
                    } else {
                      posStyle = { left: "50%", bottom: "10%", transform: "translateX(-50%)" };
                      if (frameIdx >= 3 && frameIdx <= 7) {
                        const progress = (frameIdx - 3) / 4;
                        const clipBottom = Math.max(0, (1 - progress) * 70);
                        clipPath = `inset(0 0 ${clipBottom}% 0)`;
                      } else if (frameIdx >= 14 && frameIdx <= 16) {
                        const progress = (frameIdx - 14) / 2;
                        const clipTop = progress * 70;
                        clipPath = `inset(${clipTop}% 0 0 0)`;
                      }
                    }

                    return (
                      <div
                        className="absolute z-[60] pointer-events-none"
                        style={{
                          ...posStyle,
                          width: frame.w * scale,
                          height: frame.h * scale,
                          imageRendering: "pixelated" as const,
                          clipPath,
                        }}
                      >
                        <img
                          src={frame.src}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            imageRendering: "pixelated" as const,
                          }}
                        />
                      </div>
                    );
                  })()}
                  {enemy.id === "dragon_lord" && enemy.isBoss ? (
                    <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={1000} pixelSize={6}>
                    <div
                      style={{
                        position: "relative",
                        width: 450,
                        height: 420,
                        overflow: "visible",
                        filter: `drop-shadow(0 4px 16px rgba(0,0,0,0.9)) drop-shadow(0 0 24px rgba(255,50,0,0.5))`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          enemyAnimStates[idx] === "death" ? ytrielDeath
                          : enemyAnimStates[idx] === "attack" ? ytrielAttack
                          : enemyAnimStates[idx] === "flying" ? ytrielFlying
                          : enemyAnimStates[idx] === "hurt" ? ytrielHurt
                          : enemyAnimStates[idx] === "transition" ? ytrielTransition
                          : ytrielIdle
                        }
                        frameWidth={162}
                        frameHeight={148}
                        totalFrames={
                          enemyAnimStates[idx] === "death" ? 10
                          : enemyAnimStates[idx] === "attack" ? 6
                          : enemyAnimStates[idx] === "transition" ? 3
                          : enemyAnimStates[idx] === "hurt" ? 3
                          : 4
                        }
                        fps={
                          enemyAnimStates[idx] === "attack" ? 12
                          : 8
                        }
                        scale={2.6}
                        loop={
                          enemyAnimStates[idx] === "idle" ||
                          enemyAnimStates[idx] === "flying" ||
                          (!["attack","hurt","death","transition"].includes(enemyAnimStates[idx] ?? "idle"))
                        }
                        flipX={false}
                        onComplete={
                          enemyAnimStates[idx] === "death"
                            ? () => onEnemyDeathAnimDone?.(idx)
                            : undefined
                        }
                        preloadSheets={[ytrielIdle, ytrielFlying, ytrielAttack, ytrielHurt, ytrielDeath, ytrielTransition]}
                        style={{ position: "absolute", left: "14px", top: "35px" }}
                      />
                    </div>
                    </PixelDissolve>
                  ) : isJotem(enemy) ? (
                    <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={1000} pixelSize={6}>
                    <div
                      style={{
                        position: "relative",
                        width: 320,
                        height: 320,
                        overflow: "visible",
                        filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 15px ${ELEMENT_COLORS[enemy.element]}30)`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          enemyAnimStates[idx] === "death" ? jotemDeath
                          : enemyAnimStates[idx] === "slash" ? jotemSlash
                          : enemyAnimStates[idx] === "attack" ? jotemAttack
                          : enemyAnimStates[idx] === "hurt" ? jotemHurt
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? jotemWalk
                          : jotemIdle
                        }
                        frameWidth={128}
                        frameHeight={128}
                        totalFrames={
                          enemyAnimStates[idx] === "death" ? 12
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
                        loop={enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death" && enemyAnimStates[idx] !== "slash"}
                        flipX={true}
                        onComplete={
                          enemyAnimStates[idx] === "death"
                            ? () => onEnemyDeathAnimDone?.(idx)
                            : undefined
                        }
                        preloadSheets={[jotemIdle, jotemWalk, jotemAttack, jotemHurt, jotemDeath, jotemSlash]}
                        anchor="bottom-center"
                      />
                    </div>
                    </PixelDissolve>
                  ) : isDemonKin(enemy) ? (
                    <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={800} pixelSize={4}>
                    <div
                      style={{
                        position: "relative",
                        width: 320,
                        height: 320,
                        overflow: "visible",
                        filter: `drop-shadow(0 4px 14px rgba(0,0,0,0.85))`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          enemyAnimStates[idx] === "death" ? demonKinDeath
                          : enemyAnimStates[idx] === "attack" ? demonKinAttack
                          : enemyAnimStates[idx] === "hurt" ? demonKinHurt
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? demonKinWalk
                          : demonKinIdle
                        }
                        frameWidth={128}
                        frameHeight={128}
                        totalFrames={
                          enemyAnimStates[idx] === "death" ? 8
                          : enemyAnimStates[idx] === "attack" ? 12
                          : enemyAnimStates[idx] === "hurt" ? 4
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? 8
                          : 6
                        }
                        fps={
                          enemyAnimStates[idx] === "attack" ? 14
                          : enemyAnimStates[idx] === "death" ? 10
                          : enemyAnimStates[idx] === "hurt" ? 12
                          : 8
                        }
                        scale={2.5}
                        loop={enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death"}
                        flipX={true}
                        onComplete={
                          enemyAnimStates[idx] === "death"
                            ? () => onEnemyDeathAnimDone?.(idx)
                            : undefined
                        }
                        preloadSheets={[demonKinIdle, demonKinWalk, demonKinAttack, demonKinHurt, demonKinDeath]}
                        anchor="bottom-center"
                      />
                    </div>
                    </PixelDissolve>
                  ) : enemy.element === "Fire" && !enemy.isBoss ? (
                    <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={800} pixelSize={4}>
                    <div
                      style={{
                        position: "relative",
                        width: isBoss ? 324 : 203,
                        height: isBoss ? 284 : 178,
                        overflow: "visible",
                        filter: `drop-shadow(0 4px 14px rgba(0,0,0,0.85))`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          enemyAnimStates[idx] === "death" ? demonDeath
                          : enemyAnimStates[idx] === "attack" ? demonAttack
                          : enemyAnimStates[idx] === "hurt" ? demonHurt
                          : demonIdle
                        }
                        frameWidth={
                          enemyAnimStates[idx] === "death" ? 79
                          : enemyAnimStates[idx] === "hurt" ? 79
                          : 81
                        }
                        frameHeight={
                          enemyAnimStates[idx] === "death" ? 69
                          : enemyAnimStates[idx] === "hurt" ? 69
                          : 71
                        }
                        totalFrames={
                          enemyAnimStates[idx] === "death" ? 7
                          : enemyAnimStates[idx] === "attack" ? 8
                          : enemyAnimStates[idx] === "hurt" ? 4
                          : 4
                        }
                        fps={
                          enemyAnimStates[idx] === "attack" ? 12
                          : enemyAnimStates[idx] === "death" ? 8
                          : enemyAnimStates[idx] === "hurt" ? 12
                          : 8
                        }
                        scale={isBoss ? 4 : 2.5}
                        loop={enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death"}
                        flipX={false}
                        onComplete={
                          enemyAnimStates[idx] === "death"
                            ? () => onEnemyDeathAnimDone?.(idx)
                            : undefined
                        }
                        preloadSheets={[demonIdle, demonAttack, demonHurt, demonDeath]}
                        anchor="bottom-center"
                      />
                    </div>
                    </PixelDissolve>
                  ) : isFrostLizard(enemy) ? (
                    <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={800} pixelSize={4}>
                    <div
                      style={{
                        position: "relative",
                        width: 222,
                        height: 144,
                        overflow: "visible",
                        filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 15px ${ELEMENT_COLORS[enemy.element]}30)`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          enemyAnimStates[idx] === "death" ? frostLizardHurt
                          : enemyAnimStates[idx] === "attack" ? frostLizardAttack
                          : enemyAnimStates[idx] === "hurt" ? frostLizardHurt
                          : frostLizardIdle
                        }
                        frameWidth={148}
                        frameHeight={96}
                        totalFrames={
                          enemyAnimStates[idx] === "death" ? 2
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
                        loop={enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death"}
                        flipX={true}
                        onComplete={
                          enemyAnimStates[idx] === "death"
                            ? () => onEnemyDeathAnimDone?.(idx)
                            : undefined
                        }
                        preloadSheets={[frostLizardIdle, frostLizardAttack, frostLizardHurt]}
                        anchor="bottom-center"
                      />
                    </div>
                    </PixelDissolve>
                  ) : isMinotaur(enemy) ? (
                    <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={800} pixelSize={4}>
                    <div
                      style={{
                        position: "relative",
                        width: 240,
                        height: 240,
                        overflow: "visible",
                        filter: `drop-shadow(0 4px 14px rgba(0,0,0,0.85)) drop-shadow(0 0 12px rgba(120,200,80,0.25))`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          enemyAnimStates[idx] === "death" ? minotaurDeath
                          : enemyAnimStates[idx] === "attack" ? (forestAttackVariant[idx] === 2 ? minotaurAttack2 : minotaurAttack1)
                          : enemyAnimStates[idx] === "hurt" ? minotaurHurt
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? minotaurWalk
                          : minotaurIdle
                        }
                        frameWidth={128}
                        frameHeight={128}
                        totalFrames={
                          enemyAnimStates[idx] === "death" ? 6
                          : enemyAnimStates[idx] === "attack" ? (forestAttackVariant[idx] === 2 ? 7 : 6)
                          : enemyAnimStates[idx] === "hurt" ? 5
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? 8
                          : 6
                        }
                        fps={
                          enemyAnimStates[idx] === "attack" ? 12
                          : enemyAnimStates[idx] === "death" ? 9
                          : enemyAnimStates[idx] === "hurt" ? 12
                          : 8
                        }
                        scale={1.875}
                        loop={enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death"}
                        flipX={true}
                        onComplete={
                          enemyAnimStates[idx] === "death"
                            ? () => onEnemyDeathAnimDone?.(idx)
                            : undefined
                        }
                        preloadSheets={[minotaurIdle, minotaurWalk, minotaurAttack1, minotaurAttack2, minotaurHurt, minotaurDeath]}
                        anchor="bottom-center"
                      />
                    </div>
                    </PixelDissolve>
                  ) : isCyclops(enemy) ? (
                    <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={800} pixelSize={4}>
                    <div
                      style={{
                        position: "relative",
                        width: 662,
                        height: 346,
                        overflow: "visible",
                        filter: `drop-shadow(0 4px 14px rgba(0,0,0,0.85)) drop-shadow(0 0 12px rgba(120,200,80,0.25))`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          enemyAnimStates[idx] === "death" ? cyclopsDeath
                          : enemyAnimStates[idx] === "attack" ? (forestAttackVariant[idx] === 2 ? cyclopsAttack2 : cyclopsAttack1)
                          : enemyAnimStates[idx] === "hurt" ? cyclopsHurt
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? cyclopsWalk
                          : cyclopsIdle
                        }
                        frameWidth={245}
                        frameHeight={128}
                        totalFrames={
                          enemyAnimStates[idx] === "death" ? 9
                          : enemyAnimStates[idx] === "attack" ? (forestAttackVariant[idx] === 2 ? 23 : 17)
                          : enemyAnimStates[idx] === "hurt" ? 6
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? 12
                          : 14
                        }
                        fps={
                          enemyAnimStates[idx] === "attack" ? 12
                          : enemyAnimStates[idx] === "death" ? 9
                          : enemyAnimStates[idx] === "hurt" ? 12
                          : 8
                        }
                        scale={2.7}
                        loop={enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death"}
                        flipX={false}
                        onComplete={
                          enemyAnimStates[idx] === "death"
                            ? () => onEnemyDeathAnimDone?.(idx)
                            : undefined
                        }
                        preloadSheets={[cyclopsIdle, cyclopsWalk, cyclopsAttack1, cyclopsAttack2, cyclopsHurt, cyclopsDeath]}
                        anchor="bottom-center"
                      />
                    </div>
                    </PixelDissolve>
                  ) : isResk(enemy) ? (
                    <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={1000} pixelSize={5}>
                    <div
                      style={{
                        position: "relative",
                        top: 160,
                        left: -40,
                        width: 1440,
                        height: 960,
                        overflow: "visible",
                        filter: `drop-shadow(0 4px 16px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(30,160,30,0.4))`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          enemyAnimStates[idx] === "death" ? reskDeath
                          : enemyAnimStates[idx] === "attack" ? (forestAttackVariant[idx] === 2 ? reskAttack2 : reskAttack1)
                          : enemyAnimStates[idx] === "hurt" ? reskHurt
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? reskRun
                          : reskIdle
                        }
                        frameWidth={144}
                        frameHeight={96}
                        totalFrames={
                          enemyAnimStates[idx] === "death" ? 7
                          : enemyAnimStates[idx] === "attack" ? (forestAttackVariant[idx] === 2 ? 17 : 13)
                          : enemyAnimStates[idx] === "hurt" ? 4
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? 8
                          : 9
                        }
                        fps={
                          enemyAnimStates[idx] === "attack" ? 12
                          : enemyAnimStates[idx] === "death" ? 8
                          : enemyAnimStates[idx] === "hurt" ? 10
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? 6
                          : 9
                        }
                        scale={9.3}
                        loop={enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death"}
                        onComplete={
                          enemyAnimStates[idx] === "death"
                            ? () => onEnemyDeathAnimDone?.(idx)
                            : undefined
                        }
                        preloadSheets={[reskIdle, reskRun, reskAttack1, reskAttack2, reskHurt, reskDeath]}
                        anchor="bottom-center"
                        colorMap={RESK_COLOR_MAP}
                      />
                    </div>
                    </PixelDissolve>
                  ) : isHarpy(enemy) ? (
                    <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={800} pixelSize={4}>
                    <div
                      style={{
                        position: "relative",
                        width: 144,
                        height: 144,
                        overflow: "visible",
                        filter: `drop-shadow(0 4px 14px rgba(0,0,0,0.85)) drop-shadow(0 0 12px rgba(120,200,80,0.25))`,
                      }}
                      data-testid={`img-enemy-${idx}`}
                    >
                      <SpriteAnimator
                        spriteSheet={
                          enemyAnimStates[idx] === "death" ? harpyDeath
                          : enemyAnimStates[idx] === "attack" ? harpyAttack
                          : enemyAnimStates[idx] === "hurt" ? harpyHurt
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? harpyMove
                          : harpyIdle
                        }
                        frameWidth={96}
                        frameHeight={96}
                        totalFrames={
                          enemyAnimStates[idx] === "death" ? 7
                          : enemyAnimStates[idx] === "attack" ? 9
                          : enemyAnimStates[idx] === "hurt" ? 6
                          : (enemyAnimStates[idx] === "walk" || enemyAnimStates[idx] === "walkBack") ? 6
                          : 6
                        }
                        fps={
                          enemyAnimStates[idx] === "attack" ? 12
                          : enemyAnimStates[idx] === "death" ? 9
                          : enemyAnimStates[idx] === "hurt" ? 12
                          : 9
                        }
                        scale={1.5}
                        loop={enemyAnimStates[idx] !== "attack" && enemyAnimStates[idx] !== "hurt" && enemyAnimStates[idx] !== "death"}
                        flipX={false}
                        onComplete={
                          enemyAnimStates[idx] === "death"
                            ? () => onEnemyDeathAnimDone?.(idx)
                            : undefined
                        }
                        preloadSheets={[harpyIdle, harpyMove, harpyAttack, harpyHurt, harpyDeath]}
                        anchor="bottom-center"
                        colorMap={enemyColorVariant != null ? (HARPY_COLOR_VARIANTS[enemyColorVariant] ?? undefined) : undefined}
                      />
                    </div>
                    </PixelDissolve>
                  ) : (
                    <PixelDissolve active={pixelDissolving.has(idx)} onComplete={() => onPixelDissolveComplete(idx)} duration={800} pixelSize={4}>
                    <img
                      src={spriteImg}
                      alt={enemy.name}
                      className={`${isBoss ? "w-32 h-32 md:w-40 md:h-40" : "w-20 h-20 md:w-28 md:h-28"} object-contain transition-all duration-200`}
                      style={{
                        filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 15px ${ELEMENT_COLORS[enemy.element]}30)`,
                        imageRendering: "auto",
                      }}
                      data-testid={`img-enemy-${idx}`}
                    />
                    </PixelDissolve>
                  )}
                  {demonKinSpawnAnim?.slotIndex === idx && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%) translateY(60px)",
                        pointerEvents: "none",
                        zIndex: 30,
                        overflow: "visible",
                        width: 320,
                        height: 320,
                        filter: `drop-shadow(0 4px 24px rgba(255,60,0,0.8)) drop-shadow(0 0 20px rgba(255,100,0,0.6))`,
                      }}
                    >
                      <SpriteAnimator
                        spriteSheet={demonKinDeath}
                        frameWidth={128}
                        frameHeight={128}
                        totalFrames={8}
                        fps={10}
                        scale={2.5}
                        loop={false}
                        flipX={true}
                        reverse={true}
                        onComplete={handleDemonKinSpawnComplete}
                        anchor="bottom-center"
                      />
                    </div>
                  )}
                </div>

                </div>
              </div>
              </div>
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
                ["--fb-end-x" as string]: `${fireballAnim.toX}%`,
                ["--fb-end-y" as string]: `${fireballAnim.toY}%`,
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

          {dragonFireVfx && (
            <div
              className="absolute z-50"
              style={{
                left: `${dragonFireVfx.x}%`,
                bottom: `${dragonFireVfx.y + 5}%`,
                transform: "translateX(-50%)",
                pointerEvents: "none",
                filter: "drop-shadow(0 0 16px rgba(255,100,0,0.8)) drop-shadow(0 0 32px rgba(255,60,0,0.5))",
                animation: "dragonFireAppear 0.3s ease-out",
              }}
            >
              <SpriteAnimator
                spriteSheet={dragonFireVfx.type === "burst" ? vfxFireBurst : vfxFirePillar}
                frameWidth={dragonFireVfx.type === "burst" ? 128 : 192}
                frameHeight={dragonFireVfx.type === "burst" ? 128 : 128}
                totalFrames={dragonFireVfx.type === "burst" ? 7 : 12}
                fps={dragonFireVfx.type === "burst" ? 14 : 16}
                scale={dragonFireVfx.type === "burst" ? 2 : 2.5}
                loop={false}
                onComplete={() => setDragonFireVfx(null)}
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          )}

          {infernoBallAnim && (infernoBallAnim.phase === "spawn" || infernoBallAnim.phase === "travel") && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${infernoBallAnim.phase === "travel" ? infernoBallAnim.toX : infernoBallAnim.fromX}%`,
                bottom: `${infernoBallAnim.phase === "travel" ? infernoBallAnim.toY : infernoBallAnim.fromY}%`,
                transform: "translate(-50%, 50%)",
                filter: "drop-shadow(0 0 20px rgba(255,120,0,0.9)) drop-shadow(0 0 40px rgba(255,60,0,0.6))",
                transition: infernoBallAnim.phase === "travel" ? "left 0.7s ease-in, bottom 0.7s ease-in" : "none",
              }}
              onTransitionEnd={(e) => {
                if (e.propertyName === "left") {
                  handleInfernoBallArrival();
                }
              }}
            >
              <SpriteAnimator
                spriteSheet={infernoBallSheet}
                frameWidth={250}
                frameHeight={300}
                totalFrames={30}
                fps={20}
                scale={0.5}
                loop={true}
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          )}
          {infernoBallAnim && infernoBallAnim.phase === "explode" && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${infernoBallAnim.toX}%`,
                bottom: `${infernoBallAnim.toY}%`,
                transform: "translate(-50%, 50%)",
                filter: "drop-shadow(0 0 36px rgba(255,120,0,1)) drop-shadow(0 0 72px rgba(255,60,0,0.8))",
              }}
            >
              <SpriteAnimator
                spriteSheet={infernoBallExplodeSheet}
                frameWidth={64}
                frameHeight={64}
                totalFrames={10}
                fps={14}
                scale={7}
                loop={false}
                onComplete={handleInfernoBallExplodeComplete}
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          )}

          {ytrielSlashAnim && (ytrielSlashAnim.phase === "spawn" || ytrielSlashAnim.phase === "travel") && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${ytrielSlashAnim.phase === "travel" ? ytrielSlashAnim.toX : ytrielSlashAnim.fromX}%`,
                bottom: `${ytrielSlashAnim.phase === "travel" ? ytrielSlashAnim.toY : ytrielSlashAnim.fromY}%`,
                transform: "translate(-50%, 50%) scaleX(-1)",
                filter: "drop-shadow(0 0 12px rgba(255,100,0,0.9)) drop-shadow(0 0 24px rgba(255,50,0,0.6))",
                transition: ytrielSlashAnim.phase === "travel" ? "left 0.55s ease-in, bottom 0.55s ease-in" : "none",
              }}
              onTransitionEnd={(e) => {
                if (e.propertyName === "left") handleYtrielSlashArrival();
              }}
            >
              <SpriteAnimator
                spriteSheet={ytrielSlashSheet}
                frameWidth={16}
                frameHeight={28}
                totalFrames={3}
                fps={10}
                scale={4.5}
                loop={true}
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          )}
          {ytrielSlashAnim && ytrielSlashAnim.phase === "explode" && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${ytrielSlashAnim.toX}%`,
                bottom: `${ytrielSlashAnim.toY}%`,
                transform: "translate(-50%, 50%)",
                filter: "drop-shadow(0 0 32px rgba(255,100,0,1)) drop-shadow(0 0 64px rgba(200,60,0,0.8))",
              }}
            >
              <YtrielExplosion onComplete={handleYtrielExplosionComplete} />
            </div>
          )}

          {potionVfx && potionVfx.active && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${potionVfx.x}%`,
                bottom: `${potionVfx.y}%`,
                width: 60,
                height: 80,
                transform: "translateX(-50%)",
              }}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 8 + Math.random() * 6,
                    height: 8 + Math.random() * 6,
                    borderRadius: "50%",
                    background: potionVfx.color,
                    left: `${20 + Math.random() * 60}%`,
                    bottom: "0%",
                    opacity: 0.9,
                    animation: `potionBubble ${0.5 + Math.random() * 0.4}s ease-out ${i * 0.06}s forwards`,
                    boxShadow: `0 0 8px ${potionVfx.color}`,
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse at center bottom, ${potionVfx.color.replace("0.8", "0.3")} 0%, transparent 70%)`,
                  animation: "fadeIn 0.2s ease-out forwards, fadeOut 0.3s ease-in 0.5s forwards",
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

        <div
          className="absolute bottom-0 left-0 right-0 z-30 transition-all duration-300"
          style={{
            opacity: (animPhase !== "idle" || partyAnimPhase !== "idle" || battle.phase === "animating" || battle.phase === "enemyTurn" || battle.phase === "victory") && battle.phase !== "defeat" ? 0 : 1,
            transform: (animPhase !== "idle" || partyAnimPhase !== "idle" || battle.phase === "animating" || battle.phase === "enemyTurn" || battle.phase === "victory") && battle.phase !== "defeat" ? "translateY(20px)" : "translateY(0)",
            pointerEvents: (animPhase !== "idle" || partyAnimPhase !== "idle" || battle.phase === "animating" || battle.phase === "enemyTurn" || battle.phase === "victory") ? "none" : "auto",
          }}
        >
          <div
            className="mx-2 mb-2 overflow-hidden relative"
            style={{
              background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
              border: "3px solid #c9a44a",
              boxShadow: "0 0 20px #c9a44a40, 0 0 60px #c9a44a15, inset 0 0 30px rgba(0,0,0,0.5)",
              imageRendering: "pixelated",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, #c9a44a08 3px, #c9a44a08 4px)", pointerEvents: "none" }} />
            <div className="px-3 py-1 flex items-center gap-2 relative" style={{ borderBottom: "3px solid #c9a44a", background: "#0d0b0bf0" }}>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #c9a44a40, transparent)" }} />
              <span className="text-[9px] tracking-[0.2em] uppercase" style={{ fontFamily: "'Press Start 2P', cursive", color: "#c9a44a" }}>
                {turnLabel}
              </span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #c9a44a40, transparent)" }} />
            </div>

            <div className="px-3 py-2 overflow-y-auto" style={{ height: "96px" }}>

          

          {battle.phase === "playerTurn" && !showItems && !showSpells && !isInputBlocked && (
            <div className="grid grid-cols-5 gap-2 mb-1">
              {[
                { key: "attack", label: "ATK", icon: <Swords className="w-4 h-4" />, color: "#ef4444", activeColor: "#dc2626", onClick: () => { playSfx('menuSelect'); setSelectedAction(selectedAction === "attack" ? null : "attack"); setSelectedSpell(null); setRepositionMode(null); }, active: selectedAction === "attack", testId: "button-action-attack" },
                { key: "defend", label: "DEF", icon: <Shield className="w-4 h-4" />, color: "#3b82f6", activeColor: "#2563eb", onClick: () => { setRepositionMode(null); handleDefend(); }, active: false, testId: "button-action-defend" },
                { key: "magic", label: "MAG", icon: <Sparkles className="w-4 h-4" />, color: "#a855f7", activeColor: "#9333ea", onClick: () => { playSfx('menuSelect'); setShowSpells(true); setSelectedAction(null); setSelectedSpell(null); setRepositionMode(null); }, active: false, testId: "button-action-magic" },
                { key: "item", label: "ITEM", icon: <Package className="w-4 h-4" />, color: "#22c55e", activeColor: "#16a34a", onClick: () => { playSfx('menuSelect'); setShowItems(true); setRepositionMode(null); }, active: false, disabled: consumables.length === 0, testId: "button-action-item" },
                { key: "flee", label: "RUN", icon: <LogOut className="w-4 h-4" />, color: "#f59e0b", activeColor: "#d97706", onClick: () => {
                  playSfx('menuSelect');
                  setRepositionMode(null);
                  setFleeFailed(false);
                  if (Math.random() < 0.5) {
                    onFlee();
                  } else {
                    setFleeFailed(true);
                    setTimeout(() => setFleeFailed(false), 2000);
                    onFinishPlayerTurn();
                  }
                }, active: false, testId: "button-action-flee" },
              ].map(btn => (
                <button
                  key={btn.key}
                  onClick={btn.onClick}
                  disabled={btn.disabled}
                  className="flex flex-col items-center gap-1.5 py-2.5 transition-all duration-150 hover:brightness-125 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: btn.active
                      ? `linear-gradient(180deg, ${btn.activeColor}cc 0%, ${btn.activeColor}99 100%)`
                      : "linear-gradient(180deg, rgba(15,10,30,0.9) 0%, rgba(10,5,25,0.95) 100%)",
                    border: `2px solid ${btn.active ? btn.color + "90" : btn.color + "30"}`,
                    boxShadow: btn.active
                      ? `0 0 12px ${btn.color}40, inset 0 1px 0 rgba(255,255,255,0.1)`
                      : "inset 0 1px 0 rgba(255,255,255,0.03)",
                    color: btn.active ? "#fff" : btn.color,
                    imageRendering: "pixelated",
                  }}
                  data-testid={btn.testId}
                >
                  {btn.icon}
                  <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", letterSpacing: "0.05em" }}>{btn.label}</span>
                </button>
              ))}
            </div>
          )}
          {fleeFailed && (
            <p className="text-center mb-1 animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: "#f59e0b" }}>
              Couldn't escape!
            </p>
          )}

          {!fleeFailed && resultLabel && animPhase === "idle" && battle.phase === "playerTurn" && (
            <p
              className="text-center mb-1"
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "9px",
                color: resultLabel === "Super effective!" ? "#fbbf24" : "#94a3b8",
                textShadow: resultLabel === "Super effective!" ? "0 0 8px rgba(251,191,36,0.7)" : "none",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              {resultLabel}
            </p>
          )}

          {battle.phase === "playerTurn" && selectedAction === "attack" && !isInputBlocked && (
            <p className="text-center mb-1 animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: "rgba(253,224,71,0.7)" }} data-testid="text-select-target">
              Select a target
            </p>
          )}

          {battle.phase === "playerTurn" && selectedAction === "magic" && selectedSpell && !isInputBlocked && (
            <p className="text-center mb-1 animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: "rgba(253,224,71,0.7)" }} data-testid="text-select-spell-target">
              Target for {selectedSpell.name}
            </p>
          )}

          {battle.phase === "playerTurn" && showSpells && !isInputBlocked && (
            <div className="space-y-1 mb-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="flex items-center gap-1" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: "#c9a44a" }}>
                  <Sparkles className="w-3.5 h-3.5" /> Spells
                </span>
                <button className="flex items-center gap-1 px-2 py-1 transition-all hover:brightness-125" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: "#c9a44a", background: "rgba(201,164,74,0.1)", border: "1px solid rgba(201,164,74,0.3)" }} onClick={() => { playSfx('menuSelect'); setShowSpells(false); }} data-testid="button-close-spells">
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              </div>
              {spells.length === 0 ? (
                <p className="text-center py-2" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: "rgba(201,164,74,0.4)" }}>No spells learned</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                  {spells.map(spell => {
                    const canCast = battle.playerMp >= spell.mpCost;
                    return (
                      <button
                        key={spell.id}
                        className="w-full text-left py-1.5 px-2 transition-all hover:brightness-125 disabled:opacity-30"
                        style={{
                          background: canCast ? "rgba(201,164,74,0.08)" : "rgba(10,8,8,0.5)",
                          border: `1px solid ${canCast ? "rgba(201,164,74,0.3)" : "rgba(201,164,74,0.1)"}`,
                          color: canCast ? "#e8e0d0" : "rgba(201,164,74,0.3)",
                        }}
                        onClick={() => { playSfx('menuSelect'); handleSpellSelect(spell); }}
                        disabled={!canCast}
                        data-testid={`button-spell-${spell.id}`}
                      >
                        <div className="flex items-center gap-1 justify-between">
                          <span className="flex items-center gap-1" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px" }}>
                            <Zap className="w-3 h-3 flex-shrink-0" style={{ color: spell.element ? ELEMENT_COLORS[spell.element] : "#a855f7" }} />
                            {spell.name}
                          </span>
                          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "7px", color: "#93c5fd" }}>{spell.mpCost}MP</span>
                        </div>
                        <span className="block mt-0.5 text-xs" style={{ color: "rgba(168,130,247,0.45)", fontSize: "10px" }}>{spell.description}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {battle.phase === "playerTurn" && showItems && !isInputBlocked && (
            <div className="space-y-1 mb-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: "#c9a44a" }}>Items</span>
                <button className="flex items-center gap-1 px-2 py-1 transition-all hover:brightness-125" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: "#c9a44a", background: "rgba(201,164,74,0.1)", border: "1px solid rgba(201,164,74,0.3)" }} onClick={() => { playSfx('menuSelect'); setShowItems(false); }} data-testid="button-close-items">
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              </div>
              {consumables.length === 0 ? (
                <p className="text-center py-2" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: "rgba(201,164,74,0.4)" }}>No items</p>
              ) : (
                groupConsumables(consumables).map(({ item, count, ids }) => (
                  <button
                    key={item.name}
                    className="w-full flex items-center gap-2 text-left py-1.5 px-2 transition-all hover:brightness-125"
                    style={{
                      background: "rgba(34,197,94,0.06)",
                      border: "1px solid rgba(34,197,94,0.15)",
                      color: "#bbf7d0",
                    }}
                    onClick={() => { playSfx('menuSelect'); onUseItem(ids[0]); setShowItems(false); }}
                    data-testid={`button-use-item-${item.id}`}
                  >
                    <Heart className="w-3 h-3 text-red-400 flex-shrink-0" />
                    <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px" }}>{item.name} x{count}</span>
                    <span className="text-xs ml-auto" style={{ color: "rgba(134,239,172,0.5)", fontSize: "10px" }}>{item.description}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {battle.phase === "partyTurn" && battle.phase !== "victory" && battle.phase !== "defeat" && (() => {
            const activeMember = battle.party[battle.activePartyIndex];
            if (!activeMember || activeMember.currentHp <= 0) return null;
            const partySpells = getPartyMemberSpells(activeMember.element, activeMember.level || 1, activeMember.learnedSpells || []);
            const consumables = player.inventory.filter(i => i.type === "consumable");
            return (
              <div className="animate-[fadeIn_0.2s_ease-out]">
                <p className="text-center mb-1.5" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: ELEMENT_COLORS[activeMember.element] }}>
                  {activeMember.name}'s Turn
                </p>
                {partyAction === "menu" && partyAnimPhase === "idle" && (
                  <div className="grid grid-cols-5 gap-1.5 mb-1">
                    {[
                      { key: "attack", label: "ATK", icon: <Swords className="w-4 h-4" />, color: "#ef4444", onClick: () => { playSfx('menuSelect'); setPartyAction("selectTarget"); } },
                      { key: "defend", label: "DEF", icon: <Shield className="w-4 h-4" />, color: "#3b82f6", onClick: () => { setPartyGuardIndex(battle.activePartyIndex); playSfx("block"); onPartyMemberDefend(battle.activePartyIndex); setTimeout(() => onAdvancePartyTurn(), 1200); } },
                      { key: "magic", label: "MAG", icon: <Sparkles className="w-4 h-4" />, color: "#a855f7", onClick: () => { playSfx('menuSelect'); setPartyAction("showSpells"); }, disabled: partySpells.length === 0 },
                      { key: "item", label: "ITEM", icon: <Package className="w-4 h-4" />, color: "#22c55e", onClick: () => { playSfx('menuSelect'); setPartyAction("showItems"); }, disabled: consumables.length === 0 },
                      { key: "flee", label: "RUN", icon: <LogOut className="w-4 h-4" />, color: "#f59e0b", onClick: () => {
                        playSfx('menuSelect');
                        setFleeFailed(false);
                        if (Math.random() < 0.5) {
                          onFlee();
                        } else {
                          setFleeFailed(true);
                          setTimeout(() => setFleeFailed(false), 2000);
                          onAdvancePartyTurn();
                        }
                      }},
                    ].map(btn => (
                      <button
                        key={btn.key}
                        onClick={btn.onClick}
                        disabled={btn.disabled}
                        className="flex flex-col items-center gap-1 py-2 transition-all duration-150 hover:brightness-125 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                          background: `linear-gradient(180deg, ${btn.color}18 0%, ${btn.color}08 100%)`,
                          border: `2px solid ${btn.color}30`,
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                          color: btn.color,
                        }}
                      >
                        {btn.icon}
                        <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", letterSpacing: "0.05em" }}>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {partyAction === "showSpells" && (
                  <div className="space-y-1 mb-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="flex items-center gap-1" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: "#c084fc" }}>
                        <Sparkles className="w-3.5 h-3.5" /> Spells
                      </span>
                      <button className="flex items-center gap-1 px-2 py-1 transition-all hover:brightness-125" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: "#c9a44a", background: "rgba(201,164,74,0.1)", border: "1px solid rgba(201,164,74,0.3)" }} onClick={() => { playSfx('menuSelect'); setPartyAction("menu"); }}>
                        <ArrowLeft className="w-3 h-3" /> Back
                      </button>
                    </div>
                    {partySpells.length === 0 ? (
                      <p className="text-center py-2" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: "rgba(201,164,74,0.4)" }}>No spells learned</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                        {partySpells.map(spell => {
                          const canCast = activeMember.currentMp >= spell.mpCost;
                          return (
                            <button
                              key={spell.id}
                              className="w-full text-left py-1.5 px-2 transition-all hover:brightness-125 disabled:opacity-30"
                              style={{
                                background: canCast ? "rgba(201,164,74,0.08)" : "rgba(10,8,8,0.5)",
                                border: `1px solid ${canCast ? "rgba(201,164,74,0.3)" : "rgba(201,164,74,0.1)"}`,
                                color: canCast ? "#e8e0d0" : "rgba(201,164,74,0.3)",
                              }}
                              disabled={!canCast}
                              onClick={() => {
                                playSfx('menuSelect');
                                if (spell.targetType === "enemy") {
                                  setPartySelectedSpell(spell);
                                  setPartyAction("selectMagicTarget");
                                } else if (spell.targetType === "allEnemies") {
                                  playSfx("magicRing", 0.6);
                                  if (spell.animation === "galeSlash") {
                                    const aliveTargets = battle.enemies.map((_, i) => i).filter(i => battle.enemies[i].currentHp > 0);
                                    setWindSpellVfx({ type: "galeSlash", targets: aliveTargets });
                                    playSfx("whoosh");
                                    scheduleTimer(() => setWindSpellVfx(null), 800);
                                  } else if (spell.animation === "tempest") {
                                    const aliveTargets = battle.enemies.map((_, i) => i).filter(i => battle.enemies[i].currentHp > 0);
                                    setWindSpellVfx({ type: "tempest", targets: aliveTargets });
                                    setTempestVortexActive(true);
                                    playSfx("whoosh");
                                    scheduleTimer(() => { setWindSpellVfx(null); setTempestVortexActive(false); }, 2000);
                                  }
                                  onPartyMemberCastSpell(battle.activePartyIndex, spell);
                                  const delay = spell.animation === "tempest" ? 2200 : 800;
                                  setTimeout(() => onAdvancePartyTurn(), delay);
                                  setPartyAction("menu");
                                } else {
                                  onPartyMemberCastSpell(battle.activePartyIndex, spell);
                                  playSfx("magicRing");
                                  setTimeout(() => onAdvancePartyTurn(), 600);
                                  setPartyAction("menu");
                                }
                              }}
                            >
                              <div className="flex items-center gap-1 justify-between">
                                <span className="flex items-center gap-1" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px" }}>
                                  <Zap className="w-3 h-3 flex-shrink-0" style={{ color: spell.element ? ELEMENT_COLORS[spell.element] : "#a855f7" }} />
                                  {spell.name}
                                </span>
                                <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "7px", color: "#93c5fd" }}>{spell.mpCost}MP</span>
                              </div>
                              <span className="block mt-0.5" style={{ color: "rgba(168,130,247,0.45)", fontSize: "10px" }}>{spell.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {partyAction === "showItems" && (
                  <div className="space-y-1 mb-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: "#c9a44a" }}>Items</span>
                      <button className="flex items-center gap-1 px-2 py-1 transition-all hover:brightness-125" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: "#c9a44a", background: "rgba(201,164,74,0.1)", border: "1px solid rgba(201,164,74,0.3)" }} onClick={() => { playSfx('menuSelect'); setPartyAction("menu"); }}>
                        <ArrowLeft className="w-3 h-3" /> Back
                      </button>
                    </div>
                    {consumables.length === 0 ? (
                      <p className="text-center py-2" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: "rgba(201,164,74,0.4)" }}>No items</p>
                    ) : (
                      groupConsumables(consumables).map(({ item, count, ids }) => (
                        <button
                          key={item.name}
                          className="w-full flex items-center gap-2 text-left py-1.5 px-2 transition-all hover:brightness-125"
                          style={{
                            background: "rgba(34,197,94,0.06)",
                            border: "1px solid rgba(34,197,94,0.15)",
                            color: "#bbf7d0",
                          }}
                          onClick={() => {
                            playSfx('menuSelect');
                            onPartyMemberUseItem(battle.activePartyIndex, ids[0]);
                            setPartyAction("menu");
                            setTimeout(() => onAdvancePartyTurn(), 400);
                          }}
                        >
                          <Heart className="w-3 h-3 text-red-400 flex-shrink-0" />
                          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px" }}>{item.name} x{count}</span>
                          <span className="ml-auto" style={{ color: "rgba(134,239,172,0.5)", fontSize: "10px" }}>{item.description}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {(partyAction === "selectTarget" || partyAction === "selectMagicTarget") && (
                  <div className="text-center">
                    <p className="text-center mb-1 animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: "rgba(253,224,71,0.7)" }}>
                      {partyAction === "selectMagicTarget" ? `Target for ${partySelectedSpell?.name}` : "Select a target"}
                    </p>
                    <button
                      className="flex items-center gap-1 px-2 py-1 mx-auto mt-1 transition-all hover:brightness-125"
                      style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "8px", color: "#c9a44a", background: "rgba(201,164,74,0.1)", border: "1px solid rgba(201,164,74,0.3)" }}
                      onClick={() => { playSfx('menuSelect'); setPartyAction("menu"); setPartySelectedSpell(null); }}
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {(battle.phase === "enemyTurn" || (battle.phase === "animating" && animPhase !== "idle")) && battle.phase !== "victory" && battle.phase !== "defeat" && (
            <div className="text-center py-2">
              <p className="animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: "rgba(180,160,220,0.5)" }}>
                {battle.phase === "enemyTurn" ? "Enemy turn..." : ""}
              </p>
            </div>
          )}

            </div>
          </div>
        </div>
      </div>

      {battle.phase === "victory" && showVictoryUI && (() => {
        const ec = "#facc15";
        const lootDrops = battle.lootDrops ?? [];
        const LOOT_ICON_MAP: Record<string, any> = {
          heart: Heart, droplets: Droplets, sword: Swords, shield: Shield,
          gem: Sparkles, feather: Feather, axe: Axe, eye: Eye, flame: Flame,
          horn: Swords, claw: Swords,
        };
        return (
          <div className="absolute inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${ec}15 0%, rgba(0,0,0,0.75) 70%)` }} />
            <PixelDissolve active={showVictoryUI} reverse={true} duration={600} pixelSize={5}>
            <div className="flex flex-col items-center">
            <div
              className="relative w-[320px] overflow-hidden flex flex-col"
              style={{
                fontFamily: "'Press Start 2P', cursive",
                imageRendering: "pixelated",
                background: "linear-gradient(180deg, rgba(30,20,10,0.95) 0%, rgba(15,10,5,0.98) 100%)",
                border: `3px solid ${ec}`,
                boxShadow: `0 0 20px ${ec}40, 0 0 60px ${ec}15, inset 0 0 30px rgba(0,0,0,0.5)`,
              }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ec}08 3px, ${ec}08 4px)`,
                pointerEvents: "none",
              }} />

              <div className="relative px-4 pt-3 pb-2 flex items-center justify-center gap-2" style={{ borderBottom: `2px solid ${ec}60` }}>
                <Trophy className="w-4 h-4" style={{ color: ec }} />
                <span style={{ fontSize: "12px", color: ec, letterSpacing: "2px" }}>VICTORY</span>
                <Trophy className="w-4 h-4" style={{ color: ec }} />
              </div>

              <div className="relative px-4 pt-4 pb-3 flex flex-col space-y-3">
                <div className="flex items-center justify-center gap-4 text-xs" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                  <div className="flex flex-col items-center gap-1 px-3 py-2" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${ec}30` }}>
                    <span style={{ fontSize: "7px", color: `${ec}80` }}>EXP</span>
                    <span style={{ color: "#c084fc", fontSize: "11px" }}>+{battle.enemies.reduce((s, e) => s + e.xpReward, 0)}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-3 py-2" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${ec}30` }}>
                    <span style={{ fontSize: "7px", color: `${ec}80` }}>GOLD</span>
                    <span style={{ color: "#facc15", fontSize: "11px" }}>+{battle.enemies.reduce((s, e) => s + e.goldReward, 0)}</span>
                  </div>
                </div>

                {lootDrops.length > 0 && (
                  <div style={{ borderTop: `1px solid ${ec}25`, paddingTop: "8px" }}>
                    <div style={{ fontSize: "6px", color: `${ec}60`, textAlign: "center", marginBottom: "6px", letterSpacing: "1px" }}>ITEMS OBTAINED</div>
                    <div className="flex flex-col gap-1">
                      {lootDrops.map((item, idx) => {
                        const Icon = LOOT_ICON_MAP[item.icon] || Sparkles;
                        const rarityColor = item.value >= 150 ? "#c084fc" : item.value >= 80 ? "#60a5fa" : item.value >= 40 ? "#4ade80" : `${ec}cc`;
                        return (
                          <div key={idx} className="flex items-center gap-2 px-2 py-1" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${rarityColor}30` }}>
                            <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Icon style={{ width: 12, height: 12, color: rarityColor }} />
                            </div>
                            <span style={{ fontSize: "7px", color: "#e8e0d0", flex: 1 }}>{item.name}</span>
                            <span style={{ fontSize: "6px", color: `${rarityColor}80` }}>{item.value}g</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {xpBarLevelUp && (
                  <div className="text-center font-bold animate-pulse" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "10px", color: "#fbbf24" }}>
                    Level Up!
                  </div>
                )}
                {xpBarPhase === "done" && (
                  <button
                    onClick={() => { playSfx('menuSelect'); onEndBattle(true); }}
                    className="w-full flex items-center justify-center gap-3 px-3 py-2.5 text-left transition-all animate-[fadeIn_0.3s_ease-out]"
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: "9px",
                      color: "rgba(255,255,255,0.9)",
                      letterSpacing: "1px",
                      background: "rgba(0,0,0,0.3)",
                      border: `1px solid ${ec}30`,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${ec}25`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${ec}80`;
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${ec}30, inset 0 0 8px ${ec}10`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.3)";
                      (e.currentTarget as HTMLElement).style.borderColor = `${ec}30`;
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                    data-testid="button-claim-victory"
                  >
                    CLAIM REWARDS
                    <svg className="w-3 h-3 ml-auto opacity-60" viewBox="0 0 12 12" style={{ color: ec }}>
                      <path d="M4 2 L8 6 L4 10" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            </div>
            </PixelDissolve>
          </div>
        );
      })()}

      {battle.phase === "defeat" && showDefeatOverlay && !defeatOverlayDone && (
        <BattleTransition
          direction="in"
          duration={1800}
          onComplete={() => setDefeatOverlayDone(true)}
        />
      )}

      {battle.phase === "defeat" && defeatOverlayDone && (
        <div className="absolute inset-0 z-[999]" style={{ background: "#000" }} />
      )}

      {battle.phase === "defeat" && showDefeatUI && (() => {
        const ec = "#ef4444";
        return (
          <div className="absolute inset-0 z-[1001] flex items-center justify-center">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${ec}10 0%, rgba(0,0,0,0.85) 70%)` }} />
            <PixelDissolve active={showDefeatUI} reverse={true} duration={1800} pixelSize={5}>
            <div
              className="relative w-[320px] h-[220px] overflow-hidden flex flex-col"
              style={{
                fontFamily: "'Press Start 2P', cursive",
                imageRendering: "pixelated",
                background: "linear-gradient(180deg, rgba(20,5,5,0.95) 0%, rgba(10,2,2,0.98) 100%)",
                border: `3px solid ${ec}`,
                boxShadow: `0 0 20px ${ec}40, 0 0 60px ${ec}15, inset 0 0 30px rgba(0,0,0,0.5)`,
              }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ec}08 3px, ${ec}08 4px)`,
                pointerEvents: "none",
              }} />

              <div className="relative px-4 pt-3 pb-2 flex items-center justify-center gap-2" style={{ borderBottom: `2px solid ${ec}60` }}>
                <Skull className="w-4 h-4" style={{ color: ec }} />
                <span style={{ fontSize: "14px", color: ec, letterSpacing: "3px" }}>GAME OVER</span>
                <Skull className="w-4 h-4" style={{ color: ec }} />
              </div>

              <div className="relative px-4 py-4 flex-1 flex flex-col justify-center space-y-4">
                <p className="text-center" style={{ fontSize: "8px", color: `${ec}80`, lineHeight: "1.6" }}>
                  Your party has fallen...
                </p>
                <p className="text-center" style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)" }}>
                  You will return to the hut.
                </p>
                <button
                  onClick={() => {
                    playSfx('menuSelect');
                    stopAll();
                    onEndBattle(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-3 py-2.5 text-left transition-all"
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.9)",
                    letterSpacing: "1px",
                    background: "rgba(0,0,0,0.3)",
                    border: `1px solid ${ec}30`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${ec}25`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${ec}80`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${ec}30, inset 0 0 8px ${ec}10`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.3)";
                    (e.currentTarget as HTMLElement).style.borderColor = `${ec}30`;
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                  data-testid="button-continue-defeat"
                >
                  CONTINUE
                  <svg className="w-3 h-3 ml-auto opacity-60" viewBox="0 0 12 12" style={{ color: ec }}>
                    <path d="M4 2 L8 6 L4 10" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </div>
            </PixelDissolve>
          </div>
        );
      })()}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px) rotate(-0.5deg); }
          40% { transform: translateX(6px) rotate(0.5deg); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes eruptionChargeShake {
          0% { transform: translateX(-50%) translate(calc(var(--shake-px) * -1), calc(var(--shake-px) * 0.5)); }
          25% { transform: translateX(-50%) translate(var(--shake-px), calc(var(--shake-px) * -0.7)); }
          50% { transform: translateX(-50%) translate(calc(var(--shake-px) * -0.7), var(--shake-px)); }
          75% { transform: translateX(-50%) translate(var(--shake-px), calc(var(--shake-px) * 0.3)); }
          100% { transform: translateX(-50%) translate(calc(var(--shake-px) * -0.5), calc(var(--shake-px) * -1)); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dmgFloat {
          0% { opacity: 1; transform: translateY(0) scale(0.5); }
          15% { opacity: 1; transform: translateY(-10px) scale(1.2); }
          30% { opacity: 1; transform: translateY(-20px) scale(1); }
          100% { opacity: 0; transform: translateY(-55px) scale(0.9); }
        }
        @keyframes pointerBounce {
          0% { transform: translateX(0); }
          100% { transform: translateX(3px); }
        }
        @keyframes enemyHit {
          0% { filter: brightness(2); transform: scale(1.1) translateX(5px); }
          50% { filter: brightness(1.5); transform: scale(0.95) translateX(-3px); }
          100% { filter: brightness(1); transform: scale(1) translateX(0); }
        }
        @keyframes playerHit {
          0% { filter: brightness(2); transform: translateX(calc(-50% + 5px)) scale(1.1); }
          50% { filter: brightness(1.5); transform: translateX(calc(-50% - 3px)) scale(0.95); }
          100% { filter: brightness(1); transform: translateX(-50%) scale(1); }
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
        @keyframes groundFogDrift {
          0%   { transform: translateX(0%)   scaleX(1);    }
          100% { transform: translateX(3.5%) scaleX(1.04); }
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
        @keyframes tempestVignette {
          0% { opacity: 0; }
          10% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes tornadoSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes tempestParticle {
          0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          25% { transform: translate(-15px, -20px) scale(1.3); opacity: 1; }
          50% { transform: translate(10px, -35px) scale(0.8); opacity: 0.6; }
          75% { transform: translate(-5px, -50px) scale(1.1); opacity: 0.9; }
          100% { transform: translate(0, -60px) scale(0.5); opacity: 0; }
        }
        @keyframes dragonFireAppear {
          0% { opacity: 0; transform: scale(0.3); }
          40% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
