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

const SFX_GROUPS = {
  swordSwing: [swordSwing1, swordSwing2, swordSwing3],
  mifuneSlice: [mifuneSwordSlice],
  windSlash: [mifuneSwordSlice],
  hitMetal: [hitMetal1, hitMetal2],
  hitCombo: [hitCombo1, hitCombo2],
  block: [block1, block2],
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
  potionHeal: [drinkSlurp, potionHeal],
  potionMana: [drinkSlurp, potionMana],
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

export function playSfx(name: SfxName, volumeScale = 1.0): void {
  if (globalVolume <= 0) return;
  const group = SFX_GROUPS[name];
  const src = pickRandom(group);
  const el = getPooled(src);
  el.volume = Math.min(1, globalVolume * volumeScale);
  el.play().catch(() => {});
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
