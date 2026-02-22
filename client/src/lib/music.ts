import hutTheme from "@assets/Hut_1771785430844.mp3";
import lavaRegion from "@assets/Lava_Region_1771785430844.mp3";
import gameOverBgm from "@assets/Game_Over_BGM_1771786937036.mp3";
import lavaRegionMusic from "@assets/Lava_Region_Music_1771787079908.mp3";

export type AmbientTrack = "hut" | "lava_region" | "game_over" | null;
export type MusicTrack = "lava_region_music" | null;

const AMBIENT_TRACKS: Record<string, string> = {
  hut: hutTheme,
  lava_region: lavaRegion,
  game_over: gameOverBgm,
};

const MUSIC_TRACKS: Record<string, string> = {
  lava_region_music: lavaRegionMusic,
};

const FADE_DURATION = 800;
const FADE_STEP = 30;

interface AudioLayer {
  element: HTMLAudioElement | null;
  currentTrack: string | null;
  fadeInterval: ReturnType<typeof setInterval> | null;
}

const ambientLayer: AudioLayer = { element: null, currentTrack: null, fadeInterval: null };
const musicLayer: AudioLayer = { element: null, currentTrack: null, fadeInterval: null };

let musicVolume = 0.5;

function clearLayerFade(layer: AudioLayer) {
  if (layer.fadeInterval) {
    clearInterval(layer.fadeInterval);
    layer.fadeInterval = null;
  }
}

function fadeOutLayer(layer: AudioLayer, onDone: () => void) {
  if (!layer.element || layer.element.paused) {
    onDone();
    return;
  }

  clearLayerFade(layer);
  const startVol = layer.element.volume;
  const steps = Math.ceil(FADE_DURATION / FADE_STEP);
  let step = 0;

  layer.fadeInterval = setInterval(() => {
    step++;
    if (!layer.element) {
      clearLayerFade(layer);
      onDone();
      return;
    }
    const progress = step / steps;
    layer.element.volume = Math.max(0, startVol * (1 - progress));

    if (step >= steps) {
      clearLayerFade(layer);
      layer.element.pause();
      layer.element.currentTime = 0;
      onDone();
    }
  }, FADE_STEP);
}

function fadeInLayer(layer: AudioLayer, targetVol: number) {
  if (!layer.element) return;
  clearLayerFade(layer);
  layer.element.volume = 0;
  layer.element.play().catch(() => {});

  const steps = Math.ceil(FADE_DURATION / FADE_STEP);
  let step = 0;

  layer.fadeInterval = setInterval(() => {
    step++;
    if (!layer.element) {
      clearLayerFade(layer);
      return;
    }
    const progress = step / steps;
    layer.element.volume = Math.min(targetVol, targetVol * progress);

    if (step >= steps) {
      clearLayerFade(layer);
    }
  }, FADE_STEP);
}

function startLayerTrack(layer: AudioLayer, src: string, track: string, volume: number) {
  if (layer.element) {
    layer.element.pause();
    layer.element.src = "";
  }

  layer.element = new Audio(src);
  layer.element.loop = true;
  layer.element.volume = 0;
  layer.currentTrack = track;
  fadeInLayer(layer, volume);
}

function stopLayer(layer: AudioLayer) {
  if (layer.element && !layer.element.paused) {
    fadeOutLayer(layer, () => {
      layer.currentTrack = null;
      if (layer.element) {
        layer.element.src = "";
        layer.element = null;
      }
    });
  } else {
    clearLayerFade(layer);
    layer.currentTrack = null;
    if (layer.element) {
      layer.element.pause();
      layer.element.src = "";
      layer.element = null;
    }
  }
}

export function playAmbient(track: AmbientTrack) {
  if (track === ambientLayer.currentTrack && ambientLayer.element && !ambientLayer.element.paused) return;

  if (!track) {
    stopAmbient();
    return;
  }

  const src = AMBIENT_TRACKS[track];
  if (!src) return;

  if (ambientLayer.currentTrack && ambientLayer.element && !ambientLayer.element.paused) {
    fadeOutLayer(ambientLayer, () => {
      startLayerTrack(ambientLayer, src, track, musicVolume);
    });
  } else {
    startLayerTrack(ambientLayer, src, track, musicVolume);
  }
}

export function stopAmbient() {
  stopLayer(ambientLayer);
}

export function playMusic(track: MusicTrack) {
  if (track === musicLayer.currentTrack && musicLayer.element && !musicLayer.element.paused) return;

  if (!track) {
    stopMusic();
    return;
  }

  const src = MUSIC_TRACKS[track];
  if (!src) return;

  if (musicLayer.currentTrack && musicLayer.element && !musicLayer.element.paused) {
    fadeOutLayer(musicLayer, () => {
      startLayerTrack(musicLayer, src, track, musicVolume);
    });
  } else {
    startLayerTrack(musicLayer, src, track, musicVolume);
  }
}

export function stopMusic() {
  stopLayer(musicLayer);
}

export function stopAll() {
  stopAmbient();
  stopMusic();
}

export function setMusicVolume(percent: number) {
  musicVolume = Math.max(0, Math.min(1, percent / 100));
  if (ambientLayer.element && !ambientLayer.element.paused && !ambientLayer.fadeInterval) {
    ambientLayer.element.volume = musicVolume;
  }
  if (musicLayer.element && !musicLayer.element.paused && !musicLayer.fadeInterval) {
    musicLayer.element.volume = musicVolume;
  }
}
