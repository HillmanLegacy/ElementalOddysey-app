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
import notEffective from "@/assets/audio/not-effective.wav";
import potionHeal from "@/assets/audio/potion-heal.wav";
import potionMana from "@/assets/audio/potion-mana.wav";
import drinkSlurp from "@/assets/audio/drink-slurp.wav";
import mifuneSwordSlice from "@/assets/audio/mifune-sword-slice.wav";
import eruptionFirecharge from "@assets/Eruption_Cleave_firecharge_1771634677180.wav";
import eruptionCleave from "@assets/Eruption_Cleave_explosion_1771793599518.mp3";
import eruptionFlamelash from "@assets/Eruption_Cleave_flamelash_sfx_1771793599519.wav";
import eruptionDownwardSlash from "@assets/eruption_cleave_downward_slash_sfx_1771794785560.mp3";
import incinerationCleave from "@assets/Incineration_Cleave_1771658647621.wav";
import incinerationBladeSwings from "@assets/incineration_slash_blade_swings_1771793878417.mp3";
import blockingSound from "@assets/blocking_sound_1771793599518.mp3";
import menuSelect from "@assets/menu_select_1771792929044.mp3";
import fireDemonDeath from "@assets/death_sfx_fire_demon_1771795321952.mp3";
import fireballImpact from "@assets/fireball_impact_fire_demon_1771795321952.mp3";
import fireballWhoosh from "@assets/fireball_whoosh_fire_demon_1771795321953.mp3";
import battleTransitionEffect from "@assets/battle_screen_transition_effect_1771797007586.mp3";
import saveGameSound from "@assets/save_game_sfx_1771797899621.mp3";
import healthPotionSfx from "@assets/health_potion_sfx_1771797980404.mp3";

const SFX_GROUPS = {
  swordSwing: [swordSwing1, swordSwing2, swordSwing3],
  mifuneSlice: [mifuneSwordSlice],
  windSlash: [mifuneSwordSlice],
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
  notEffectiveHit: [notEffective],
  potionHeal: [healthPotionSfx],
  potionMana: [healthPotionSfx],
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
} as const;

export type SfxName = keyof typeof SFX_GROUPS;

const POOL_SIZE = 3;
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
