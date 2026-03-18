import { useState, useEffect, useRef } from "react";
import SpriteAnimator from "./SpriteAnimator";
import type { PlayerCharacter } from "@shared/schema";
import { playSfx } from "@/lib/sfx";
import { useColorMap } from "@/hooks/useColorMap";

import samuraiIdle from "@/assets/images/samurai-idle.png";
import samuraiRun from "@/assets/images/samurai-run.png";
import knightIdle from "@/assets/images/knight-idle-4f.png";
import knightRun from "@/assets/images/knight-run.png";
import baskenIdle from "@/assets/images/basken-idle.png";
import baskenRun from "@/assets/images/basken-run.png";
import rangerIdle from "@/assets/images/ranger-idle.png";
import rangerRun from "@/assets/images/ranger-run.png";
import knight2dIdle from "@/assets/images/knight2d-idle.png";
import knight2dRun from "@/assets/images/knight2d-run.png";
import axewarriorIdle from "@/assets/images/axewarrior-idle.png";
import axewarriorRun from "@/assets/images/axewarrior-run.png";

import demonIdleSheet from "@/assets/images/demon-idle.png";
import demonKinIdleSheet from "@/assets/images/demonkin-idle.png";
import minotaurIdleSheet from "@assets/iDLE_1773579538178.png";
import minotaurWalkSheet from "@assets/WALK_1773579538178.png";
import cyclopsIdleSheet from "@assets/IDLE_1773579566925.png";
import cyclopsWalkSheet from "@assets/WALK_1773579566925.png";
import harpyIdleSheet from "@assets/IDLE_1773579631532.png";
import harpyMoveSheet from "@assets/MOVE_1773579631533.png";
import forestClimbBg from "@assets/A_pixel__upscayl_2x_digital-art-4x_1773704775371.png";

const MAX_SPEED = 480;
const GROUND_ACCEL = 2200;
const AIR_ACCEL = 1100;
const GROUND_FRICTION = 2400;
const AIR_DRAG = 80;
const GRAVITY = 1500;
const GRAVITY_HOLD = 700;
const JUMP_VELOCITY = -490;
const COYOTE_TIME = 0.10;
const JUMP_BUFFER = 0.12;

const CLIMB_H = 5200;
const VIEWPORT_H = 640;
const VIEWPORT_W_DEFAULT = 1024;
const PLAT_THICK = 16;
const GOAL_Y = 90;
const EXIT_TRIGGER_X = 80;

const CHAR_SPRITES: Record<string, {
  idle: string; run: string;
  iW: number; iH: number;
  idleF: number; runF: number;
  scale: number;
  groundOffset: number;
  // Hitbox as fractions of rendered (playerW, playerH): center offsets and half-extents
  hbXOff: number; hbYOff: number; hbHW: number; hbHH: number;
  stepFrames?: number[];
}> = {
  samurai:    { idle: samuraiIdle,    run: samuraiRun,    iW: 96,  iH: 96,  idleF: 10, runF: 16, scale: 2,   groundOffset: 30, hbXOff: 0.50, hbYOff: 0.50, hbHW: 0.19, hbHH: 0.27, stepFrames: [7, 15] },
  knight:     { idle: knightIdle,     run: knightRun,     iW: 86,  iH: 49,  idleF: 4,  runF: 6,  scale: 2.8, groundOffset: 6,  hbXOff: 0.50, hbYOff: 0.45, hbHW: 0.27, hbHH: 0.37 },
  basken:     { idle: baskenIdle,     run: baskenRun,     iW: 56,  iH: 56,  idleF: 5,  runF: 6,  scale: 2.8, groundOffset: 0,  hbXOff: 0.50, hbYOff: 0.50, hbHW: 0.23, hbHH: 0.33 },
  ranger:     { idle: rangerIdle,     run: rangerRun,     iW: 64,  iH: 48,  idleF: 6,  runF: 6,  scale: 2.8, groundOffset: 0,  hbXOff: 0.50, hbYOff: 0.48, hbHW: 0.21, hbHH: 0.37 },
  knight2d:   { idle: knight2dIdle,   run: knight2dRun,   iW: 84,  iH: 84,  idleF: 8,  runF: 8,  scale: 2,   groundOffset: 46, hbXOff: 0.50, hbYOff: 0.38, hbHW: 0.23, hbHH: 0.26 },
  axewarrior: { idle: axewarriorIdle, run: axewarriorRun, iW: 94,  iH: 91,  idleF: 6,  runF: 6,  scale: 2,   groundOffset: 0,  hbXOff: 0.50, hbYOff: 0.45, hbHW: 0.24, hbHH: 0.32 },
};

type ClimbEnemyType = "fireDemon" | "demonKin" | "minotaur" | "cyclops" | "harpy";

const CLIMB_ENEMY: Record<ClimbEnemyType, {
  sheet: string; iW: number; iH: number; frames: number; scale: number; fps: number; groundOffset: number;
  walkSheet?: string; walkFrames?: number; walkFps?: number;
  patrolSpeed: number; patrolRange: number;
  hbXOff: number; hbYOff: number; hbHW: number; hbHH: number;
}> = {
  fireDemon: { sheet: demonIdleSheet,    iW: 81,  iH: 71,  frames: 4,  scale: 2.0, fps: 8,  groundOffset: 0,   patrolSpeed: 60,  patrolRange: 80,  hbXOff: 0.50, hbYOff: 0.52, hbHW: 0.24, hbHH: 0.32 },
  demonKin:  { sheet: demonKinIdleSheet, iW: 128, iH: 128, frames: 6,  scale: 1.3, fps: 8,  groundOffset: 24,  patrolSpeed: 70,  patrolRange: 80,  hbXOff: 0.50, hbYOff: 0.52, hbHW: 0.23, hbHH: 0.34 },
  // Minotaur 128×128 scale=1.4: body x=23-93 y=38-114 (13px transparent bottom → 18px scaled)
  minotaur:  { sheet: minotaurIdleSheet, iW: 128, iH: 128, frames: 6,  scale: 1.4, fps: 8,  groundOffset: 18,  patrolSpeed: 65,  patrolRange: 90,  hbXOff: 0.45, hbYOff: 0.59, hbHW: 0.27, hbHH: 0.30, walkSheet: minotaurWalkSheet, walkFrames: 8,  walkFps: 10 },
  // Cyclops 245×128 scale=2.7: body x=87-151 y=44-113 (14px transparent bottom → 38px scaled)
  cyclops:   { sheet: cyclopsIdleSheet,  iW: 245, iH: 128, frames: 14, scale: 2.7, fps: 8,  groundOffset: 38,  patrolSpeed: 45,  patrolRange: 70,  hbXOff: 0.49, hbYOff: 0.61, hbHW: 0.13, hbHH: 0.27, walkSheet: cyclopsWalkSheet,  walkFrames: 12, walkFps: 9  },
  // Harpy 96×96 scale=1.5 → 144×144; wings are wide so body hitbox is narrower than full frame
  harpy:     { sheet: harpyIdleSheet,    iW: 96,  iH: 96,  frames: 6,  scale: 1.5, fps: 9,  groundOffset: -30, patrolSpeed: 90,  patrolRange: 100, hbXOff: 0.50, hbYOff: 0.48, hbHW: 0.22, hbHH: 0.27, walkSheet: harpyMoveSheet,   walkFrames: 6,  walkFps: 10 },
};

interface ClimbPlatform {
  x: number;
  y: number;
  w: number;
  isGoal?: boolean;
  isGround?: boolean;
}

const HARPY_COLOR_VARIANTS: Array<Record<string, string> | null> = [
  null,
  { "#0069aa": "#a80e00", "#00396d": "#6b0900", "#657392": "#926761", "#92a1b9": "#bb948f", "#c7cfdd": "#e2cdca" },
  { "#0069aa": "#1a8c3d", "#00396d": "#0a4d1f", "#657392": "#537365", "#92a1b9": "#85b998", "#c7cfdd": "#c5ddc9" },
  { "#0069aa": "#6a00aa", "#00396d": "#3a006d", "#657392": "#6e5892", "#92a1b9": "#a490b9", "#c7cfdd": "#d3c7dd" },
  { "#0069aa": "#aa7000", "#00396d": "#6d3e00", "#657392": "#927055", "#92a1b9": "#b9a880", "#c7cfdd": "#ddd4ba" },
];

interface ClimbEnemy {
  type: ClimbEnemyType;
  enemyId: string;
  platformIdx: number;
  xOffset: number;
  colorVariant?: number;
}

function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generatePlatforms(seed: number, vw: number, centerConstrained = false): ClimbPlatform[] {
  const r = rng(seed);
  const plats: ClimbPlatform[] = [];

  plats.push({ x: 0, y: CLIMB_H - PLAT_THICK, w: vw, isGround: true });

  // Max jump height (held): JUMP_VELOCITY²/(2×GRAVITY_HOLD) = 490²/1400 ≈ 171px
  // Step 80–120px → always ≤ 70% of max jump height, comfortable margin.
  // Loop runs until we're close enough to the goal that the last hop is also safe.
  const STEP_MIN = 80;
  const STEP_MAX = 120;
  let y = CLIMB_H - 170;
  let lastCenter = vw / 2;

  // Forest stages constrain platforms to within 100px of screen centre (tree trunk area)
  const screenCenterMin = centerConstrained ? vw / 2 - 100 : 0;
  const screenCenterMax = centerConstrained ? vw / 2 + 100 : vw;

  while (y > GOAL_Y + PLAT_THICK + STEP_MAX) {
    const w = 95 + r() * 125;
    const hopMax = Math.min(300, vw - w - 20);
    const rawCMin = Math.max(w / 2 + 10, lastCenter - hopMax);
    const rawCMax = Math.min(vw - w / 2 - 10, lastCenter + hopMax);
    const cMin = centerConstrained ? Math.max(rawCMin, screenCenterMin + w / 2) : rawCMin;
    const cMax = centerConstrained ? Math.min(rawCMax, screenCenterMax - w / 2) : rawCMax;
    let center = cMin + r() * Math.max(0, cMax - cMin);
    center = Math.max(w / 2 + 10, Math.min(vw - w / 2 - 10, center));
    plats.push({ x: center - w / 2, y, w });
    lastCenter = center;
    y -= STEP_MIN + r() * (STEP_MAX - STEP_MIN);
  }
  // Fill any remaining gap between the last intermediate platform and the goal
  // so the final hop is never larger than STEP_MAX.
  while (y > GOAL_Y + PLAT_THICK + 10) {
    const w = 110 + r() * 100;
    const xMin = centerConstrained ? Math.max(10, vw / 2 - 100 - w / 2) : 10;
    const xMax = centerConstrained ? Math.min(vw - w - 10, vw / 2 + 100 - w / 2) : vw - w - 10;
    const x = xMin + r() * Math.max(0, xMax - xMin);
    plats.push({ x, y, w });
    y -= STEP_MIN + r() * (STEP_MAX - STEP_MIN);
  }

  plats.push({ x: 0, y: GOAL_Y, w: vw, isGoal: true });
  return plats;
}

function generateEnemies(seed: number, plats: ClimbPlatform[], isForest: boolean, vw: number): ClimbEnemy[] {
  const r = rng(seed + 999);
  const candidates = plats.filter(p => !p.isGround && !p.isGoal);
  const count = 4 + Math.floor(r() * 3);
  const chosen = [...candidates].sort(() => r() - 0.5).slice(0, Math.min(count, candidates.length));
  const forestTypes: ClimbEnemyType[] = ["harpy"];
  const lavaTypes: ClimbEnemyType[] = ["fireDemon", "demonKin"];

  return chosen.map(plat => {
    const idx = plats.indexOf(plat);
    const types = isForest ? forestTypes : lavaTypes;
    const type = types[Math.floor(r() * types.length)];
    const es = CLIMB_ENEMY[type];
    const eW = Math.round(es.iW * es.scale);
    const maxOff = Math.max(0, plat.w - eW - 10);
    const xOffset = 5 + r() * maxOff;
    const enemyId = isForest
      ? (type === "harpy" ? "harpy_wind" : type === "cyclops" ? "cyclops_wind" : "minotaur_wind")
      : (type === "demonKin" ? "demon_kin" : "slime_fire");
    const colorVariant = type === "harpy" ? Math.floor(r() * HARPY_COLOR_VARIANTS.length) : undefined;
    return { type, enemyId, platformIdx: idx, xOffset, colorVariant };
  });
}

export type ClimbEnemySnapshot = {
  x: number; y: number; dir: 1 | -1;
  aiMode?: "wander" | "aggro";
  targetX?: number; targetY?: number; wanderTimer?: number;
};

interface ClimbingStageProps {
  player: PlayerCharacter;
  fromNodeId: number;
  toNodeId: number;
  defeatedEnemyIndices: number[];
  fleeEnemyIndex?: number | null;
  savedPlayerY?: number;
  regionTheme?: string;
  savedEnemyPatrol?: ClimbEnemySnapshot[];
  onEnemyContact: (enemyIndex: number, enemyId: string, playerX: number, colorVariant?: number, playerY?: number, patrol?: ClimbEnemySnapshot[]) => void;
  onComplete: () => void;
  onExit: () => void;
  onStatus?: () => void;
  onOptions?: () => void;
  onExitToMenu?: () => void;
}

function touchBtnStyle(round = false): React.CSSProperties {
  return {
    width: round ? 52 : 44,
    height: round ? 52 : 44,
    borderRadius: round ? "50%" : 8,
    background: "rgba(0,0,0,0.55)",
    border: "2px solid rgba(255,255,255,0.25)",
    color: "rgba(255,255,255,0.75)",
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none" as const,
    touchAction: "none" as const,
    pointerEvents: "auto" as const,
  };
}

export default function ClimbingStage({
  player,
  fromNodeId,
  toNodeId,
  defeatedEnemyIndices,
  fleeEnemyIndex = null,
  savedPlayerY,
  regionTheme = "Fire",
  savedEnemyPatrol,
  onEnemyContact,
  onComplete,
  onExit,
  onStatus,
  onOptions,
  onExitToMenu,
}: ClimbingStageProps) {
  const isForest = regionTheme === "Wind";
  const stageKey = [Math.min(fromNodeId, toNodeId), Math.max(fromNodeId, toNodeId)].join("-");

  const charSprite = CHAR_SPRITES[player.spriteId] ?? CHAR_SPRITES.samurai;
  const playerColorMap = useColorMap(charSprite.idle, charSprite.iW, charSprite.iH, player.colorGroups);
  const playerW = Math.round(charSprite.iW * charSprite.scale);
  const playerH = Math.round(charSprite.iH * charSprite.scale);
  const charGroundOffset = charSprite.groundOffset;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportWRef = useRef<number>(VIEWPORT_W_DEFAULT);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(e => {
      const w = e[0]?.contentRect.width;
      if (w) viewportWRef.current = w;
    });
    ro.observe(el);
    viewportWRef.current = el.offsetWidth || VIEWPORT_W_DEFAULT;
    return () => ro.disconnect();
  }, []);

  const stageHash = fromNodeId * 137 + toNodeId * 31;
  const platformsRef = useRef<ClimbPlatform[]>(generatePlatforms(stageHash, VIEWPORT_W_DEFAULT, isForest));
  const enemiesRef = useRef<ClimbEnemy[]>(generateEnemies(stageHash, platformsRef.current, isForest, VIEWPORT_W_DEFAULT));

  const platforms = platformsRef.current;
  const enemies = enemiesRef.current;

  const groundPlat = platforms.find(p => p.isGround)!;
  const startY = groundPlat.y - playerH + charGroundOffset;
  const startX = VIEWPORT_W_DEFAULT / 2 - playerW / 2;

  const physRef = useRef({ x: startX, y: savedPlayerY ?? startY, vx: 0, vy: 0, onGround: savedPlayerY === undefined, coyoteTimer: 0, jumpBufferTimer: 0 });
  const keysRef = useRef({ left: false, right: false, jumpPressed: false, jumpHeld: false });
  const facingRightRef = useRef(true);
  const stageCompleteRef = useRef(false);
  const battlePendingRef = useRef(false);
  const contactCooldown = useRef<Set<number>>(new Set());
  const jumpActiveRef = useRef(false);
  const footstepTimerRef = useRef(0);
  const playerFrameIdxRef = useRef(0);
  const playerFrameAccRef = useRef(0);

  const enemyPatrolRef = useRef(
    enemies.map((e, i) => {
      const plat = platforms[e.platformIdx];
      const es = CLIMB_ENEMY[e.type];
      const eH = Math.round(es.iH * es.scale);
      const worldY = plat.y - eH + es.groundOffset;
      const saved = savedEnemyPatrol?.[i];
      const base = {
        x: saved?.x ?? (plat.x + e.xOffset),
        y: saved?.y ?? worldY,
        dir: saved?.dir ?? ((Math.random() > 0.5 ? 1 : -1) as 1 | -1),
        platLeft: plat.x,
        platRight: plat.x + plat.w,
      };
      if (e.type === "harpy") {
        return {
          ...base,
          aiMode: (saved?.aiMode ?? "wander") as "wander" | "aggro",
          targetX: saved?.targetX ?? (40 + Math.random() * (VIEWPORT_W_DEFAULT - 80)),
          targetY: saved?.targetY ?? (GOAL_Y + 100 + Math.random() * (CLIMB_H - GOAL_Y - 250)),
          wanderTimer: saved?.wanderTimer ?? (1.5 + Math.random() * 2.5),
        };
      }
      return base;
    })
  );

  const lastHandledFleeRef = useRef<number | null>(null);
  const lastHandledVictoryCountRef = useRef(defeatedEnemyIndices.length);

  const initPlayerY = savedPlayerY ?? startY;
  const initCamY = Math.max(0, Math.min(initPlayerY - VIEWPORT_H * 0.5, CLIMB_H - VIEWPORT_H));

  const [renderX, setRenderX] = useState(startX);
  const [renderY, setRenderY] = useState(initPlayerY);
  const [cameraY, setCameraY] = useState(initCamY);
  const [menuOpen, setMenuOpen] = useState(false);
  const cameraYRef = useRef(initCamY);
  const [isRunning, setIsRunning] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [enemyPositions, setEnemyPositions] = useState(
    enemies.map((_, i) => ({ x: enemyPatrolRef.current[i].x, y: enemyPatrolRef.current[i].y }))
  );
  const [enemyFacingLeft, setEnemyFacingLeft] = useState(
    enemies.map((_, i) => savedEnemyPatrol?.[i] ? savedEnemyPatrol[i].dir !== 1 : false)
  );
  const [battleFreezing, setBattleFreezing] = useState(false);
  const [hiddenEnemyIndices, setHiddenEnemyIndices] = useState<number[]>([]);

  const onEnemyContactRef = useRef(onEnemyContact);
  const onCompleteRef = useRef(onComplete);
  const onExitRef = useRef(onExit);
  useEffect(() => { onEnemyContactRef.current = onEnemyContact; }, [onEnemyContact]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onExitRef.current = onExit; }, [onExit]);

  const defeatedRef = useRef(defeatedEnemyIndices);
  useEffect(() => {
    defeatedRef.current = defeatedEnemyIndices;
    enemies.forEach((_, idx) => {
      if (!defeatedEnemyIndices.includes(idx)) contactCooldown.current.delete(idx);
    });

    const newCount = defeatedEnemyIndices.length;
    const prevCount = lastHandledVictoryCountRef.current;
    if (newCount > prevCount) {
      lastHandledVictoryCountRef.current = newCount;

      if (
        fleeEnemyIndex !== null &&
        fleeEnemyIndex !== undefined &&
        fleeEnemyIndex !== lastHandledFleeRef.current &&
        fleeEnemyIndex < enemies.length
      ) {
        lastHandledFleeRef.current = fleeEnemyIndex;
        const enemy = enemies[fleeEnemyIndex];
        const enemyPlat = platforms[enemy.platformIdx];
        const lowerPlats = platforms.filter(p => p.y > enemyPlat.y);
        if (lowerPlats.length > 0) {
          const nextPlat = lowerPlats.reduce((best, p) => p.y < best.y ? p : best, lowerPlats[0]);
          physRef.current.x = Math.max(0, nextPlat.x + nextPlat.w / 2 - playerW / 2);
          physRef.current.y = nextPlat.y - playerH + charGroundOffset;
          physRef.current.vx = 0;
          physRef.current.vy = 0;
          physRef.current.onGround = true;
          jumpActiveRef.current = false;
        }
      } else {
        const playerBottom = physRef.current.y + playerH - charGroundOffset;
        const nearestPlat = platforms.reduce((best, p) =>
          Math.abs(p.y - playerBottom) < Math.abs(best.y - playerBottom) ? p : best
        );
        physRef.current.x = Math.max(nearestPlat.x, Math.min(nearestPlat.x + nearestPlat.w - playerW, nearestPlat.x + nearestPlat.w / 2 - playerW / 2));
        physRef.current.y = nearestPlat.y - playerH + charGroundOffset;
        physRef.current.vx = 0;
        physRef.current.vy = 0;
        physRef.current.onGround = true;
        jumpActiveRef.current = false;
      }
    }
  }, [defeatedEnemyIndices, fleeEnemyIndex, enemies, platforms, playerH, playerW, charGroundOffset]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.code) {
        case "ArrowLeft":  case "KeyA": keysRef.current.left = true; break;
        case "ArrowRight": case "KeyD": keysRef.current.right = true; break;
        case "Space": case "ArrowUp": case "KeyW":
          keysRef.current.jumpPressed = true;
          keysRef.current.jumpHeld = true;
          e.preventDefault();
          break;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowLeft":  case "KeyA": keysRef.current.left = false; break;
        case "ArrowRight": case "KeyD": keysRef.current.right = false; break;
        case "Space": case "ArrowUp": case "KeyW": keysRef.current.jumpHeld = false; break;
      }
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (stageCompleteRef.current) return;
    battlePendingRef.current = false;
    lastTimeRef.current = null;

    const loop = (ts: number) => {
      if (battlePendingRef.current) return;

      const dt = lastTimeRef.current !== null
        ? Math.min((ts - lastTimeRef.current) / 1000, 0.05)
        : 0.016;
      lastTimeRef.current = ts;

      const p = physRef.current;
      const keys = keysRef.current;
      const vw = viewportWRef.current;

      if (p.onGround) p.coyoteTimer = COYOTE_TIME;
      else p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);

      if (keys.jumpPressed) {
        p.jumpBufferTimer = JUMP_BUFFER;
        keys.jumpPressed = false;
      } else {
        p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
      }

      const accel = p.onGround ? GROUND_ACCEL : AIR_ACCEL;
      const friction = p.onGround ? GROUND_FRICTION : AIR_DRAG;
      if (keys.left && !keys.right) {
        p.vx = Math.max(p.vx - accel * dt, -MAX_SPEED);
        facingRightRef.current = false;
      } else if (keys.right && !keys.left) {
        p.vx = Math.min(p.vx + accel * dt, MAX_SPEED);
        facingRightRef.current = true;
      } else {
        if (p.vx > 0) p.vx = Math.max(0, p.vx - friction * dt);
        else if (p.vx < 0) p.vx = Math.min(0, p.vx + friction * dt);
      }

      if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
        p.vy = JUMP_VELOCITY;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        jumpActiveRef.current = true;
        playSfx("footstep", 0.18);
      }

      const grav = (keys.jumpHeld && p.vy < 0) ? GRAVITY_HOLD : GRAVITY;
      p.vy = Math.min(p.vy + grav * dt, 1100);

      const prevY = p.y;
      const prevBottom = prevY + playerH - charGroundOffset;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      p.x = Math.max(0, Math.min(vw - playerW, p.x));

      const newBottom = p.y + playerH - charGroundOffset;
      p.onGround = false;

      for (const plat of platforms) {
        const platTop = plat.y;
        if (p.vy >= 0 && prevBottom <= platTop + 5 && newBottom >= platTop - 5) {
          const pLeft = p.x + playerW * 0.2;
          const pRight = p.x + playerW * 0.8;
          if (pRight > plat.x + 4 && pLeft < plat.x + plat.w - 4) {
            p.y = platTop - playerH + charGroundOffset;
            p.vy = 0;
            p.onGround = true;
            jumpActiveRef.current = false;
            break;
          }
        }
      }

      if (p.onGround && Math.abs(p.vx) > 30) {
        if (charSprite.stepFrames) {
          playerFrameAccRef.current += dt;
          const frameDur = 1 / 14;
          while (playerFrameAccRef.current >= frameDur) {
            playerFrameAccRef.current -= frameDur;
            const prev = playerFrameIdxRef.current;
            playerFrameIdxRef.current = (prev + 1) % charSprite.runF;
            if (charSprite.stepFrames.includes(playerFrameIdxRef.current)) playSfx("footstep", 0.30);
          }
        } else {
          footstepTimerRef.current -= dt;
          if (footstepTimerRef.current <= 0) {
            playSfx("footstep", 0.28);
            footstepTimerRef.current = 0.22;
          }
        }
      } else {
        playerFrameIdxRef.current = 0;
        playerFrameAccRef.current = 0;
        footstepTimerRef.current = 0.05;
      }

      if (p.y > CLIMB_H + 200) {
        p.x = vw / 2 - playerW / 2;
        p.y = groundPlat.y - playerH + charGroundOffset;
        p.vx = 0; p.vy = 0;
        p.onGround = true;
        jumpActiveRef.current = false;
      }

      if (p.onGround && p.y + playerH - charGroundOffset <= GOAL_Y + PLAT_THICK + 8 && !stageCompleteRef.current) {
        stageCompleteRef.current = true;
        cancelAnimationFrame(rafRef.current);
        onCompleteRef.current();
        return;
      }

      if (p.x <= EXIT_TRIGGER_X && p.onGround && p.y + playerH - charGroundOffset >= groundPlat.y - 4 && !stageCompleteRef.current) {
        stageCompleteRef.current = true;
        cancelAnimationFrame(rafRef.current);
        onExitRef.current();
        return;
      }

      const defeated = defeatedRef.current;
      const newPos: { x: number; y: number }[] = [];
      const newFL: boolean[] = [];

      const HARPY_WANDER_SPD = 90;
      const HARPY_AGGRO_SPD  = 210;
      const HARPY_DETECT_R   = 300;
      const HARPY_LOSE_R     = 520;

      enemies.forEach((enemy, idx) => {
        const ep = enemyPatrolRef.current[idx] as typeof enemyPatrolRef.current[number] & {
          aiMode?: "wander" | "aggro";
          targetX?: number;
          targetY?: number;
          wanderTimer?: number;
        };
        const es = CLIMB_ENEMY[enemy.type];
        const eW = Math.round(es.iW * es.scale);
        const eH = Math.round(es.iH * es.scale);

        if (!defeated.includes(idx)) {
          if (enemy.type === "harpy") {
            const pCx = p.x + playerW * charSprite.hbXOff;
            const pCy = p.y + playerH * charSprite.hbYOff;
            const hCx = ep.x + eW * es.hbXOff;
            const hCy = ep.y + eH * es.hbYOff;
            const dist = Math.sqrt((pCx - hCx) ** 2 + (pCy - hCy) ** 2);

            if (ep.aiMode === "wander" && dist < HARPY_DETECT_R) {
              ep.aiMode = "aggro";
            } else if (ep.aiMode === "aggro" && dist > HARPY_LOSE_R) {
              ep.aiMode = "wander";
              ep.targetX = 30 + Math.random() * (vw - 60);
              ep.targetY = GOAL_Y + 80 + Math.random() * (CLIMB_H - GOAL_Y - 200);
              ep.wanderTimer = 2 + Math.random() * 3;
            }

            if (ep.aiMode === "aggro") {
              const dx = pCx - hCx;
              const dy = pCy - hCy;
              const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
              ep.x += (dx / d) * HARPY_AGGRO_SPD * dt;
              ep.y += (dy / d) * HARPY_AGGRO_SPD * dt;
              ep.dir = dx >= 0 ? 1 : -1;
            } else {
              ep.wanderTimer = Math.max(0, (ep.wanderTimer ?? 3) - dt);
              const tx = ep.targetX ?? vw / 2;
              const ty = ep.targetY ?? CLIMB_H / 2;
              const dx = tx - hCx;
              const dy = ty - hCy;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < 50 || ep.wanderTimer <= 0) {
                const goOffScreen = Math.random() < 0.22;
                if (goOffScreen) {
                  ep.targetX = Math.random() < 0.5 ? -eW - 60 : vw + 60;
                  ep.targetY = ep.y + eH * 0.5 + (Math.random() - 0.5) * 200;
                } else {
                  ep.targetX = 25 + Math.random() * Math.max(0, vw - 50);
                  ep.targetY = GOAL_Y + 80 + Math.random() * (CLIMB_H - GOAL_Y - 200);
                }
                ep.wanderTimer = 2 + Math.random() * 3.5;
              } else {
                ep.x += (dx / d) * HARPY_WANDER_SPD * dt;
                ep.y += (dy / d) * HARPY_WANDER_SPD * dt;
                ep.dir = dx >= 0 ? 1 : -1;
              }
            }
          } else {
            ep.x += ep.dir * es.patrolSpeed * dt;
            if (ep.x <= ep.platLeft) { ep.x = ep.platLeft; ep.dir = 1; }
            if (ep.x + eW >= ep.platRight) { ep.x = ep.platRight - eW; ep.dir = -1; }
          }
        }
        newPos.push({ x: ep.x, y: ep.y });
        newFL.push(ep.dir === -1);
      });

      const pCx = p.x + playerW * charSprite.hbXOff;
      const pCy = p.y + playerH * charSprite.hbYOff;
      const pHW = playerW * charSprite.hbHW;
      const pHH = playerH * charSprite.hbHH;

      let hit = false;
      enemies.forEach((enemy, idx) => {
        if (hit || defeated.includes(idx) || contactCooldown.current.has(idx)) return;
        const es = CLIMB_ENEMY[enemy.type];
        const eW = Math.round(es.iW * es.scale);
        const eH = Math.round(es.iH * es.scale);
        const ep = enemyPatrolRef.current[idx];
        const eCx = ep.x + eW * es.hbXOff;
        const eCy = ep.y + eH * es.hbYOff;
        const eHW = eW * es.hbHW;
        const eHH = eH * es.hbHH;
        if (Math.abs(pCx - eCx) < pHW + eHW && Math.abs(pCy - eCy) < pHH + eHH) {
          contactCooldown.current.add(idx);
          setHiddenEnemyIndices(s => s.includes(idx) ? s : [...s, idx]);
          battlePendingRef.current = true;
          setBattleFreezing(true);
          cancelAnimationFrame(rafRef.current);
          {
            const patrol = enemyPatrolRef.current.map(ep => {
              const snap: ClimbEnemySnapshot = { x: ep.x, y: ep.y, dir: ep.dir };
              if ("aiMode" in ep) { snap.aiMode = (ep as any).aiMode; snap.targetX = (ep as any).targetX; snap.targetY = (ep as any).targetY; snap.wanderTimer = (ep as any).wanderTimer; }
              return snap;
            });
            onEnemyContactRef.current(idx, enemy.enemyId, p.x, enemy.colorVariant, p.y, patrol);
          }
          hit = true;
        }
      });
      if (hit) return;

      const targetCamY = p.y - VIEWPORT_H * 0.45;
      const newCamY = Math.max(0, Math.min(CLIMB_H - VIEWPORT_H, targetCamY));
      cameraYRef.current = newCamY;

      setRenderX(p.x);
      setRenderY(p.y);
      setCameraY(newCamY);
      setIsRunning(p.onGround && Math.abs(p.vx) > 20);
      setIsJumping(jumpActiveRef.current);
      setFacingRight(facingRightRef.current);
      setEnemyPositions(newPos);
      setEnemyFacingLeft(newFL);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [defeatedEnemyIndices]);

  const spriteSrc = (isJumping || isRunning) ? charSprite.run : charSprite.idle;
  const spriteFrames = isJumping ? 1 : (isRunning ? charSprite.runF : charSprite.idleF);
  const spriteFps = isRunning ? 14 : 8;

  const toScreenY = (worldY: number) => worldY - cameraY;
  const altitudePct = Math.max(0, Math.min(100, Math.round(((CLIMB_H - renderY) / (CLIMB_H - GOAL_Y)) * 100)));

  const bgTop = isForest
    ? "#7bafc5"
    : "linear-gradient(180deg, #030000 0%, #0a0200 18%, #160402 35%, #220604 55%, #321008 100%)";

  const fogColor = isForest
    ? "rgba(10,28,8,0.80)"
    : "rgba(40,4,0,0.88)";

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: VIEWPORT_H,
        overflow: "hidden",
        background: bgTop,
        imageRendering: "pixelated",
      }}
    >
      {isForest ? (
        <>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${forestClimbBg})`,
            backgroundSize: "100% auto",
            backgroundRepeat: "no-repeat",
            backgroundPosition: `center ${(cameraY / (CLIMB_H - VIEWPORT_H)) * 100}%`,
            imageRendering: "auto",
            zIndex: 0,
          }} />
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
            background: "rgba(5,18,5,0.28)",
          }} />
        </>
      ) : (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse at 50% ${100 - altitudePct}%, rgba(255,60,0,0.10) 0%, transparent 55%)`,
        }} />
      )}

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 90,
        background: `linear-gradient(0deg, ${fogColor} 0%, transparent 100%)`,
        pointerEvents: "none", zIndex: 8,
      }} />

      {platforms.map((plat, i) => {
        const sy = toScreenY(plat.y);
        if (sy > VIEWPORT_H + 30 || sy + PLAT_THICK < -40) return null;
        return (
          <div key={i} style={{
            position: "absolute",
            left: plat.x,
            top: sy,
            width: plat.w,
            height: PLAT_THICK,
            zIndex: 5,
            borderRadius: plat.isGround ? 0 : "4px 4px 0 0",
            background: plat.isGoal
              ? (isForest
                ? "linear-gradient(90deg, #6b3420, #bf6f4a, #e8a87c, #bf6f4a, #6b3420)"
                : "linear-gradient(90deg, #92400e, #f59e0b, #fde047, #f59e0b, #92400e)")
              : plat.isGround
                ? (isForest
                  ? "linear-gradient(180deg, #5a2c18 0%, #3a1808 100%)"
                  : "linear-gradient(180deg, #5a1a08 0%, #2c0a04 100%)")
                : (isForest
                  ? "linear-gradient(180deg, #9a5838 0%, #6a3820 80%, #3d1e10 100%)"
                  : "linear-gradient(180deg, #7a2808 0%, #4a1408 80%, #2c0a04 100%)"),
            boxShadow: plat.isGoal
              ? (isForest
                ? "0 0 20px rgba(191,111,74,0.85), 0 0 50px rgba(191,111,74,0.35), inset 0 1px 0 rgba(255,220,180,0.4)"
                : "0 0 20px rgba(245,158,11,0.85), 0 0 50px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.3)")
              : plat.isGround
                ? "none"
                : (isForest
                  ? "0 3px 10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(200,120,60,0.18)"
                  : "0 3px 10px rgba(200,40,0,0.25), inset 0 1px 0 rgba(255,120,0,0.12)"),
            borderTop: plat.isGoal
              ? (isForest ? "2px solid #e8a87c" : "2px solid #fde047")
              : (isForest ? "1px solid rgba(200,120,60,0.20)" : "1px solid rgba(255,255,255,0.10)"),
          }}>
            {!plat.isGround && !plat.isGoal && Array.from({ length: Math.floor(plat.w / 22) }, (_, ti) => (
              <div key={ti} style={{
                position: "absolute", left: ti * 22 + 5, top: 3,
                width: 1, height: 7,
                background: "rgba(255,255,255,0.10)",
              }} />
            ))}
            {plat.isGoal && (
              <div style={{
                position: "absolute", top: -32, left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 9,
                color: isForest ? "#e8a87c" : "#fde047",
                textShadow: isForest ? "0 0 12px #bf6f4a, 0 0 24px #9a5838" : "0 0 12px #f59e0b, 0 0 24px #d97706",
                whiteSpace: "nowrap",
                letterSpacing: 2,
                animation: "pulse 1.4s ease-in-out infinite",
              }}>
                ★ SUMMIT ★
              </div>
            )}
            {plat.isGround && (
              <div style={{
                position: "absolute", top: -26, left: 10,
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 8,
                color: isForest ? "#e8a87c" : "#fde047",
                textShadow: isForest ? "0 0 8px #bf6f4a, 0 0 16px #9a5838" : "0 0 8px #f59e0b, 0 0 16px #d97706",
                whiteSpace: "nowrap",
                letterSpacing: 1,
                animation: "pulse 1.4s ease-in-out infinite",
              }}>
                ◄ EXIT
              </div>
            )}
          </div>
        );
      })}

      {enemies.map((enemy, idx) => {
        if (defeatedEnemyIndices.includes(idx) || hiddenEnemyIndices.includes(idx)) return null;
        const es = CLIMB_ENEMY[enemy.type];
        const eW = Math.round(es.iW * es.scale);
        const eH = Math.round(es.iH * es.scale);
        const pos = enemyPositions[idx] ?? { x: 0, y: 0 };
        const fl = enemyFacingLeft[idx] ?? false;
        const sy = toScreenY(pos.y);
        if (sy > VIEWPORT_H + 120 || sy + eH < -120) return null;
        const useWalk = !!es.walkSheet;
        const sheet = useWalk ? es.walkSheet! : es.sheet;
        const frames = useWalk ? (es.walkFrames ?? es.frames) : es.frames;
        const fps = useWalk ? (es.walkFps ?? es.fps) : es.fps;
        return (
          <div key={idx} data-testid={`climb-enemy-${idx}`} style={{
            position: "absolute",
            left: pos.x, top: sy,
            width: eW, height: eH,
            zIndex: 6,
            filter: isForest
              ? "drop-shadow(0 4px 14px rgba(30,200,80,0.5))"
              : "drop-shadow(0 4px 16px rgba(255,50,0,0.6))",
          }}>
            <SpriteAnimator
              spriteSheet={sheet}
              frameWidth={es.iW}
              frameHeight={es.iH}
              totalFrames={frames}
              fps={fps}
              scale={es.scale}
              loop={true}
              flipX={enemy.type === "minotaur" ? fl : !fl}
              paused={battleFreezing}
              anchor="top-left"
              colorMap={enemy.type === "harpy" && enemy.colorVariant != null ? (HARPY_COLOR_VARIANTS[enemy.colorVariant] ?? undefined) : undefined}
            />
          </div>
        );
      })}

      <div data-testid="img-climb-character" style={{
        position: "absolute",
        left: renderX,
        top: toScreenY(renderY),
        width: playerW,
        height: playerH,
        zIndex: 7,
      }}>
        <SpriteAnimator
          spriteSheet={spriteSrc}
          frameWidth={charSprite.iW}
          frameHeight={charSprite.iH}
          totalFrames={spriteFrames}
          fps={spriteFps}
          scale={charSprite.scale}
          loop={true}
          flipX={!facingRight}
          colorMap={playerColorMap ?? undefined}
          anchor="top-left"
        />
      </div>

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "10px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        pointerEvents: "none", zIndex: 10,
      }}>
        <div style={{
          background: "rgba(0,0,0,0.78)", border: "2px solid #c9a44a",
          borderRadius: 4, padding: "6px 12px",
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: "#c9a44a", letterSpacing: 1, lineHeight: "1.6",
        }}>
          <div style={{ color: "#555", fontSize: 6, marginBottom: 2 }}>STAGE</div>
          {stageKey.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ pointerEvents: "auto", position: "relative" }}>
            <button
              data-testid="button-stage-menu"
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: "rgba(0,0,0,0.75)",
                border: "2px solid #c9a44a",
                borderRadius: 4,
                padding: "4px 10px",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 16,
                color: "#c9a44a",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >≡</button>
            {menuOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                background: "rgba(10,8,8,0.97)",
                border: "2px solid #c9a44a",
                borderRadius: 4,
                minWidth: 150,
                overflow: "hidden",
                zIndex: 50,
              }}>
                {([
                  { label: "STATUS", action: onStatus },
                  { label: "OPTIONS", action: onOptions },
                  { label: "MAIN MENU", action: onExitToMenu, danger: true },
                ] as { label: string; action?: () => void; danger?: boolean }[]).map(({ label, action, danger }) => (
                  <button
                    key={label}
                    data-testid={`button-stage-menu-${label.toLowerCase().replace(" ", "-")}`}
                    onClick={() => { playSfx("menuSelect"); setMenuOpen(false); action?.(); }}
                    style={{
                      width: "100%",
                      display: "block",
                      padding: "10px 14px",
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 7,
                      color: danger ? "rgba(239,68,68,0.7)" : "#c9a44a",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(201,164,74,0.15)",
                      cursor: "pointer",
                      textAlign: "left",
                      letterSpacing: 1,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#1a1010";
                      e.currentTarget.style.color = danger ? "#ef4444" : "#e8d080";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = danger ? "rgba(239,68,68,0.7)" : "#c9a44a";
                    }}
                  >{label}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{
            background: "rgba(0,0,0,0.78)", border: "2px solid #555",
            borderRadius: 4, padding: "6px 10px",
            fontFamily: "'Press Start 2P', monospace",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <div style={{ fontSize: 5, color: "#555", letterSpacing: 1 }}>↑ ALTITUDE</div>
            <div style={{
              width: 12, height: 90,
              background: "rgba(0,0,0,0.5)", border: "1px solid #333",
              borderRadius: 6, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: `${altitudePct}%`,
                background: altitudePct > 70
                  ? (isForest ? "linear-gradient(0deg,#22c55e,#86efac)" : "linear-gradient(0deg,#f59e0b,#fde047)")
                  : "linear-gradient(0deg,#c9a44a,#f0d060)",
                transition: "height 0.3s",
                boxShadow: "0 0 6px rgba(201,164,74,0.7)",
              }} />
            </div>
            <div style={{ fontSize: 7, color: "#c9a44a" }}>{altitudePct}%</div>
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 8, right: 10,
        fontFamily: "'Press Start 2P', monospace", fontSize: 6,
        color: "rgba(255,255,255,0.22)", pointerEvents: "none", zIndex: 10,
        textAlign: "right", lineHeight: "2",
      }}>
        ←→ MOVE&nbsp;&nbsp;SPACE JUMP
      </div>

      <div style={{
        position: "absolute", bottom: 10, left: 10, right: 10,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        zIndex: 20, pointerEvents: "none",
      }}>
        <div style={{ display: "flex", gap: 8, pointerEvents: "auto" }}>
          <button
            data-testid="button-climb-left"
            onPointerDown={() => { keysRef.current.left = true; }}
            onPointerUp={() => { keysRef.current.left = false; }}
            onPointerLeave={() => { keysRef.current.left = false; }}
            style={touchBtnStyle()}
          >◀</button>
          <button
            data-testid="button-climb-right"
            onPointerDown={() => { keysRef.current.right = true; }}
            onPointerUp={() => { keysRef.current.right = false; }}
            onPointerLeave={() => { keysRef.current.right = false; }}
            style={touchBtnStyle()}
          >▶</button>
        </div>
        <button
          data-testid="button-climb-jump"
          onPointerDown={() => { keysRef.current.jumpPressed = true; keysRef.current.jumpHeld = true; }}
          onPointerUp={() => { keysRef.current.jumpHeld = false; }}
          onPointerLeave={() => { keysRef.current.jumpHeld = false; }}
          style={{ ...touchBtnStyle(true), pointerEvents: "auto" }}
        >▲</button>
      </div>
    </div>
  );
}
