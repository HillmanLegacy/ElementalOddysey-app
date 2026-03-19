import swordSwing1 from "@/assets/audio/sword-swing-1.mp3";
import swordSwing2 from "@/assets/audio/sword-swing-2.mp3";
import swordSwing3 from "@/assets/audio/sword-swing-3.mp3";
import hitMetal1 from "@/assets/audio/hit-metal-1.mp3";
import hitMetal2 from "@/assets/audio/hit-metal-2.mp3";
import hitCombo1 from "@/assets/audio/hit-combo-1.mp3";
import hitCombo2 from "@/assets/audio/hit-combo-2.mp3";
import block1 from "@/assets/audio/block-1.mp3";
import block2 from "@/assets/audio/block-2.mp3";
import stabRing1 from "@/assets/audio/stab-ring-1.mp3";
import stabRing2 from "@/assets/audio/stab-ring-2.mp3";
import magicRing1 from "@/assets/audio/magic-ring-1.mp3";
import magicRing2 from "@/assets/audio/magic-ring-2.mp3";
import magicRing3 from "@/assets/audio/magic-ring-3.mp3";
import whoosh1 from "@/assets/audio/whoosh-1.mp3";
import whoosh2 from "@/assets/audio/whoosh-2.mp3";
import gruntAttack1 from "@/assets/audio/grunt-attack-1.mp3";
import gruntAttack2 from "@/assets/audio/grunt-attack-2.mp3";
import gruntAttack3 from "@/assets/audio/grunt-attack-3.mp3";
import gruntAttack4 from "@/assets/audio/grunt-attack-4.mp3";
import gruntHurt1 from "@/assets/audio/grunt-hurt-1.mp3";
import gruntHurt2 from "@/assets/audio/grunt-hurt-2.mp3";
import gruntHurt3 from "@/assets/audio/grunt-hurt-3.mp3";
import gruntHurt4 from "@/assets/audio/grunt-hurt-4.mp3";
import stabWhoosh1 from "@/assets/audio/stab-whoosh-1.mp3";
import stabWhoosh2 from "@/assets/audio/stab-whoosh-2.mp3";
import fireballLaunch from "@/assets/audio/fire-demon-fireball.wav";
import explosionMedium from "@/assets/audio/explosion-medium.wav";
import effectiveChime from "@/assets/audio/effective-chime.wav";

import potionHeal from "@/assets/audio/potion-heal.wav";
import potionMana from "@/assets/audio/potion-mana.wav";
import drinkSlurp from "@/assets/audio/drink-slurp.wav";
import mifuneSwordSlice from "@/assets/audio/mifune-sword-slice.wav";
import mifuneSlice1 from "@assets/mifune_slice_1_1771803157515.mp3";
import mifuneSlice2 from "@assets/mifune_slice_2_1771803157515.mp3";
import mifuneSlice3 from "@assets/mifune_slice_3_1771803157515.mp3";
import mifuneSwordSlice2 from "@assets/mifune_sword_slice_1771803157516.mp3";
import eruptionBuildup from "@assets/Eruption_Cleave_Buildup_Animation_SFX_1773945014497.wav";
import eruptionFirecharge from "@assets/Eruption_Cleave_firecharge_1773945037824.wav";
import eruptionCleave from "@assets/Eruption_Cleave_explosion_1771800952507.mp3";
import eruptionFlamelash from "@assets/Eruption_Cleave_flamelash_sfx_1773945076347.wav";
import eruptionDownwardSlash from "@assets/eruption_cleave_downward_slash_sfx_1771794785560.mp3";
import incinerationCleave from "@assets/incineration_slash_flame_swings_1771801484016.mp3";
import incinerationBladeSwings from "@assets/incineration_slash_blade_swings_1771793878417.mp3";
import blockingSound from "@assets/blocking_sound_1771793599518.mp3";
import menuSelect from "@assets/menu_select_1771792929044.mp3";
import fireDemonDeath from "@assets/death_sfx_fire_demon_1771795321952.mp3";
import fireballImpact from "@assets/fireball_impact_fire_demon_1771795321952.mp3";
import fireballWhoosh from "@assets/fireball_whoosh_fire_demon_1771795321953.mp3";
import battleTransitionEffect from "@assets/battle_screen_transition_effect_1771797007586.mp3";
import saveGameSound from "@assets/save_game_sfx_1771797899621.mp3";
import healthPotionSfx from "@assets/health_potion_sfx_1771797980404.mp3";
import recoverSfx from "@assets/recover_sfx_1771798298190.mp3";
import damageSfx from "@assets/damage_sfx_1771801964292.mp3";
import windBladeSfx from "@assets/wind_blade_sfx_1771803396136.mp3";
import footstepDirt from "@assets/Dirt_Run_2_1773422304757.wav";
import ytrielFireLaunchSfx from "@assets/EM_FIRE_LAUNCH_01_1773546217261.wav";

const SFX_GROUPS = {
  swordSwing: [swordSwing1, swordSwing2, swordSwing3],
  mifuneSlice: [mifuneSwordSlice],
  windSlash: [mifuneSlice1, mifuneSlice2, mifuneSlice3, mifuneSwordSlice2],
  hitMetal: [hitMetal1, hitMetal2],
  hitCombo: [hitCombo1, hitCombo2],
  block: [blockingSound],
  stabRing: [stabRing1, stabRing2],
  magicRing: [magicRing1, magicRing2, magicRing3],
  whoosh: [whoosh1, whoosh2],
  gruntAttack: [gruntAttack1, gruntAttack2, gruntAttack3, gruntAttack4],
  gruntHurt: [gruntHurt1, gruntHurt2, gruntHurt3, gruntHurt4],
  stabWhoosh: [stabWhoosh1, stabWhoosh2],
  fireballLaunch: [fireballLaunch],
  explosion: [explosionMedium],
  effectiveHit: [effectiveChime],

  potionHeal: [healthPotionSfx],
  potionMana: [healthPotionSfx],
  eruptionBuildup: [eruptionBuildup],
  eruptionFirecharge: [eruptionFirecharge],
  eruptionCleave: [eruptionCleave],
  eruptionFlamelash: [eruptionFlamelash],
  eruptionDownwardSlash: [eruptionDownwardSlash],
  incinerationCleave: [incinerationCleave],
  incinerationBladeSwings: [incinerationBladeSwings],
  menuSelect: [menuSelect],
  fireDemonDeath: [fireDemonDeath],
  fireballImpact: [fireballImpact],
  fireballWhoosh: [fireballWhoosh],
  battleTransition: [battleTransitionEffect],
  saveGame: [saveGameSound],
  recover: [recoverSfx],
  damage: [damageSfx],
  windBladeStart: [windBladeSfx],
  footstep: [footstepDirt],
  ytrielFireLaunch: [ytrielFireLaunchSfx],
} as const;

export type SfxName = keyof typeof SFX_GROUPS;

const POOL_SIZE = 6;
const audioPool = new Map<string, HTMLAudioElement[]>();

let globalVolume = 0.8;

function getPooled(src: string): HTMLAudioElement {
  let pool = audioPool.get(src);
  if (!pool) {
    pool = [];
    audioPool.set(src, pool);
  }

  for (const el of pool) {
    if (el.paused || el.ended) {
      el.currentTime = 0;
      el.volume = globalVolume;
      return el;
    }
  }

  if (pool.length < POOL_SIZE) {
    const el = new Audio(src);
    el.volume = globalVolume;
    pool.push(el);
    return el;
  }

  const el = pool[0];
  el.currentTime = 0;
  el.volume = globalVolume;
  return el;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function playSfx(name: SfxName, volumeScale = 1.0): HTMLAudioElement | null {
  if (globalVolume <= 0) return null;
  const group = SFX_GROUPS[name];
  const src = pickRandom(group);
  const el = getPooled(src);
  el.volume = Math.min(1, globalVolume * volumeScale);
  el.play().catch(() => {});
  return el;
}

export function stopSfx(el: HTMLAudioElement | null): void {
  if (!el) return;
  el.pause();
  el.currentTime = 0;
}

export function fadeSfxOut(el: HTMLAudioElement | null, durationMs: number): void {
  if (!el) return;
  const startVol = el.volume;
  const steps = 30;
  const stepMs = durationMs / steps;
  let step = 0;
  const id = setInterval(() => {
    step++;
    el.volume = Math.max(0, startVol * (1 - step / steps));
    if (step >= steps) {
      clearInterval(id);
      el.pause();
      el.currentTime = 0;
    }
  }, stepMs);
}

export function fadeSfxIn(el: HTMLAudioElement | null, targetVolScale: number, durationMs: number): void {
  if (!el) return;
  const targetVol = Math.min(1, globalVolume * targetVolScale);
  const steps = 30;
  const stepMs = durationMs / steps;
  let step = 0;
  const id = setInterval(() => {
    step++;
    el.volume = Math.min(targetVol, targetVol * (step / steps));
    if (step >= steps) clearInterval(id);
  }, stepMs);
}

export function playSfxPitched(name: SfxName, pitchMin = 0.8, pitchMax = 1.3, volumeScale = 1.0): void {
  if (globalVolume <= 0) return;
  const group = SFX_GROUPS[name];
  const src = pickRandom(group);
  const el = getPooled(src);
  el.volume = Math.min(1, globalVolume * volumeScale);
  el.playbackRate = pitchMin + Math.random() * (pitchMax - pitchMin);
  el.play().catch(() => {});
}

export function setSfxVolume(percent: number): void {
  globalVolume = Math.max(0, Math.min(1, percent / 100));
}

export function getSfxVolume(): number {
  return Math.round(globalVolume * 100);
}
