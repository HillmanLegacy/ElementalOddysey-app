import hutTheme from "@assets/Hut_1771785430844.mp3";
import lavaRegion from "@assets/Lava_Region_1771785430844.mp3";

export type MusicTrack = "hut" | "lava_region" | null;

const TRACKS: Record<string, string> = {
  hut: hutTheme,
  lava_region: lavaRegion,
};

let currentTrack: MusicTrack = null;
let audioElement: HTMLAudioElement | null = null;
let musicVolume = 0.5;
let fadeInterval: ReturnType<typeof setInterval> | null = null;

const FADE_DURATION = 800;
const FADE_STEP = 30;

function clearFade() {
  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }
}

function fadeOut(onDone: () => void) {
  if (!audioElement || audioElement.paused) {
    onDone();
    return;
  }

  clearFade();
  const startVol = audioElement.volume;
  const steps = Math.ceil(FADE_DURATION / FADE_STEP);
  let step = 0;

  fadeInterval = setInterval(() => {
    step++;
    if (!audioElement) {
      clearFade();
      onDone();
      return;
    }
    const progress = step / steps;
    audioElement.volume = Math.max(0, startVol * (1 - progress));

    if (step >= steps) {
      clearFade();
      audioElement.pause();
      audioElement.currentTime = 0;
      onDone();
    }
  }, FADE_STEP);
}

function fadeIn() {
  if (!audioElement) return;
  clearFade();
  const targetVol = musicVolume;
  audioElement.volume = 0;
  audioElement.play().catch(() => {});

  const steps = Math.ceil(FADE_DURATION / FADE_STEP);
  let step = 0;

  fadeInterval = setInterval(() => {
    step++;
    if (!audioElement) {
      clearFade();
      return;
    }
    const progress = step / steps;
    audioElement.volume = Math.min(targetVol, targetVol * progress);

    if (step >= steps) {
      clearFade();
    }
  }, FADE_STEP);
}

export function playMusic(track: MusicTrack) {
  if (track === currentTrack && audioElement && !audioElement.paused) return;

  if (!track) {
    stopMusic();
    return;
  }

  const src = TRACKS[track];
  if (!src) return;

  if (currentTrack && audioElement && !audioElement.paused) {
    fadeOut(() => {
      startTrack(src, track);
    });
  } else {
    startTrack(src, track);
  }
}

function startTrack(src: string, track: MusicTrack) {
  if (audioElement) {
    audioElement.pause();
    audioElement.src = "";
  }

  audioElement = new Audio(src);
  audioElement.loop = true;
  audioElement.volume = 0;
  currentTrack = track;
  fadeIn();
}

export function stopMusic() {
  if (audioElement && !audioElement.paused) {
    fadeOut(() => {
      currentTrack = null;
      if (audioElement) {
        audioElement.src = "";
        audioElement = null;
      }
    });
  } else {
    clearFade();
    currentTrack = null;
    if (audioElement) {
      audioElement.pause();
      audioElement.src = "";
      audioElement = null;
    }
  }
}

export function setMusicVolume(percent: number) {
  musicVolume = Math.max(0, Math.min(1, percent / 100));
  if (audioElement && !audioElement.paused && !fadeInterval) {
    audioElement.volume = musicVolume;
  }
}

export function getCurrentTrack(): MusicTrack {
  return currentTrack;
}
