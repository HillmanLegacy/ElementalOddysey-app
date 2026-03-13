import { useState, useEffect, useRef, useCallback } from "react";
import SpriteAnimator from "./SpriteAnimator";
import type { PlayerCharacter } from "@shared/schema";
import { playSfx } from "@/lib/sfx";
import lavaBgImg from "@assets/Lava_Stage_Side_Scroll_Background_upscayl_3x_digital-art-4x_1773372864153.png";

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
import demonFireballSheet from "@/assets/images/demon-fireball.png";
import sfxFireBurst from "@/assets/images/sfx-fire-burst.png";
import demonKinIdleSheet from "@/assets/images/demonkin-idle.png";
import dragonLordIdleSheet from "@/assets/images/dragonlord-idle.png";

// Fireball projectile sprite (single 48×32 frame, scaled 2×)
const FB_FRAME_W  = 48;
const FB_FRAME_H  = 32;
const FB_FRAMES   = 1;
const FB_FPS      = 8;
const FB_SCALE    = 2.0; // rendered: 96 × 64 px — matches battle screen

// Fireball explosion VFX (sfx-fire-burst: 9 frames of 96×96, fps=18, scale=3 → 288×288 px)
const EXP_FRAME   = 96;
const EXP_FRAMES  = 9;
const EXP_FPS     = 18;
const EXP_SCALE   = 3;
const EXP_DELAY_MS = 580; // ms to show explosion before triggering battle

const STAGE_WIDTH = 5000;
const VIEWPORT_H = 640;
const GROUND_Y = 510;        // visual: orange line, rocks, enemies
const PHYS_GROUND_Y = 534;   // physics: player stands 24px lower so feet appear at orange line
const PATROL_SPEED = 85;     // px/s for fire demon patrol
const PATROL_RANGE = 170;    // px each way from spawn

const SIGHT_RANGE    = 440;  // px — player detection radius (horizontal)
const FIRE_AIM_DELAY = 0.55; // s  — demon freezes and aims before firing
const FIRE_COOLDOWN  = 1.7;  // s  — pause between shots / before resuming patrol
const FIREBALL_SPEED = 800;  // px/s — matches battle 0.5s ease-in travel over ~400px
const FIREBALL_R     = 22;   // px — hitbox radius (ball head, not full flame trail)

const MAX_SPEED      = 480;
const GROUND_ACCEL   = 2200;
const AIR_ACCEL      = 1100;
const GROUND_FRICTION = 2400;
const AIR_DRAG       = 80;
const GRAVITY        = 1500;
const GRAVITY_HOLD   = 700;
const JUMP_VELOCITY  = -490;
const COYOTE_TIME    = 0.10;
const JUMP_BUFFER    = 0.12;
const STAGE_END_X       = 4650;
const CAMERA_LEAD       = 340;
const LEFT_EXIT_TRIGGER = 80;   // player x threshold to fire left exit

const CHAR_SPRITES: Record<string, {
  idle: string; run: string;
  iW: number; iH: number;
  idleF: number; runF: number;
  scale: number;
  stepFrames?: number[];
}> = {
  samurai:    { idle: samuraiIdle,    run: samuraiRun,    iW: 96,  iH: 96,  idleF: 10, runF: 16, scale: 2,   stepFrames: [3, 6, 15] },
  knight:     { idle: knightIdle,     run: knightRun,     iW: 86,  iH: 49,  idleF: 4,  runF: 6,  scale: 2.8 },
  basken:     { idle: baskenIdle,     run: baskenRun,     iW: 56,  iH: 56,  idleF: 5,  runF: 6,  scale: 2.8 },
  ranger:     { idle: rangerIdle,     run: rangerRun,     iW: 64,  iH: 48,  idleF: 6,  runF: 6,  scale: 2.8 },
  knight2d:   { idle: knight2dIdle,   run: knight2dRun,   iW: 84,  iH: 84,  idleF: 8,  runF: 8,  scale: 2   },
  axewarrior: { idle: axewarriorIdle, run: axewarriorRun, iW: 94,  iH: 91,  idleF: 6,  runF: 6,  scale: 2   },
};

type DemonMode = "patrol" | "aiming" | "cooldown";
interface DemonState { mode: DemonMode; timer: number; }
interface Fireball { id: number; x: number; y: number; vx: number; enemyIdx: number; }

type EnemyType = "fireDemon" | "demonKin" | "dragonLord";

const ENEMY_SPRITES_SS: Record<EnemyType, {
  sheet: string; iW: number; iH: number; frames: number; scale: number; fps: number; groundOffset: number;
}> = {
  fireDemon:  { sheet: demonIdleSheet,      iW: 81,  iH: 71,  frames: 4, scale: 2.0, fps: 8, groundOffset: 0  },
  demonKin:   { sheet: demonKinIdleSheet,   iW: 128, iH: 128, frames: 6, scale: 1.3, fps: 8, groundOffset: 24 },
  dragonLord: { sheet: dragonLordIdleSheet, iW: 74,  iH: 74,  frames: 4, scale: 2.6, fps: 8, groundOffset: 0  },
};

interface StageEnemy {
  x: number;
  type: EnemyType;
  enemyId: string;
}

const LAVA_STAGES: Record<string, { enemies: StageEnemy[] }> = {
  "0-1":  { enemies: [{ x: 900,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1800, type: "fireDemon", enemyId: "slime_fire" }, { x: 3100, type: "fireDemon", enemyId: "slime_fire" }, { x: 4000, type: "fireDemon", enemyId: "slime_fire" }] },
  "1-2":  { enemies: [{ x: 800,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1700, type: "fireDemon", enemyId: "slime_fire" }, { x: 2800, type: "fireDemon", enemyId: "slime_fire" }, { x: 3800, type: "fireDemon", enemyId: "slime_fire" }] },
  "1-3":  { enemies: [{ x: 700,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1600, type: "fireDemon", enemyId: "slime_fire" }, { x: 2500, type: "fireDemon", enemyId: "slime_fire" }, { x: 3500, type: "fireDemon", enemyId: "slime_fire" }] },
  "3-4":  { enemies: [{ x: 800,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1700, type: "fireDemon", enemyId: "slime_fire" }, { x: 2800, type: "fireDemon", enemyId: "slime_fire" }, { x: 3600, type: "fireDemon", enemyId: "slime_fire" }] },
  "3-5":  { enemies: [{ x: 700,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1500, type: "fireDemon", enemyId: "slime_fire" }, { x: 2500, type: "fireDemon", enemyId: "slime_fire" }, { x: 3600, type: "fireDemon", enemyId: "slime_fire" }] },
  "5-6":  { enemies: [{ x: 700,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1400, type: "fireDemon", enemyId: "slime_fire" }, { x: 2400, type: "fireDemon", enemyId: "slime_fire" }, { x: 3300, type: "fireDemon", enemyId: "slime_fire" }] },
  "5-7":  { enemies: [{ x: 700,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1500, type: "fireDemon", enemyId: "slime_fire" }, { x: 2400, type: "fireDemon", enemyId: "slime_fire" }, { x: 3400, type: "fireDemon", enemyId: "slime_fire" }] },
  "7-8":  { enemies: [{ x: 700,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1500, type: "fireDemon", enemyId: "slime_fire" }, { x: 2500, type: "fireDemon", enemyId: "slime_fire" }, { x: 3500, type: "fireDemon", enemyId: "slime_fire" }] },
  "7-9":  { enemies: [{ x: 700,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1600, type: "fireDemon", enemyId: "slime_fire" }, { x: 2600, type: "fireDemon", enemyId: "slime_fire" }, { x: 3600, type: "fireDemon", enemyId: "slime_fire" }] },
  "9-11": { enemies: [{ x: 600,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1400, type: "fireDemon", enemyId: "slime_fire" }, { x: 2200, type: "fireDemon", enemyId: "slime_fire" }, { x: 3000, type: "fireDemon", enemyId: "slime_fire" }, { x: 3900, type: "fireDemon", enemyId: "slime_fire" }] },
  "9-12": { enemies: [{ x: 700,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1500, type: "fireDemon", enemyId: "slime_fire" }, { x: 2500, type: "fireDemon", enemyId: "slime_fire" }, { x: 3500, type: "fireDemon", enemyId: "slime_fire" }] },
  "9-13": { enemies: [{ x: 600,  type: "fireDemon", enemyId: "slime_fire" }, { x: 1300, type: "fireDemon", enemyId: "slime_fire" }, { x: 2000, type: "fireDemon", enemyId: "slime_fire" }, { x: 2800, type: "fireDemon", enemyId: "slime_fire" }, { x: 3700, type: "dragonLord", enemyId: "dragon_lord" }] },
};

function rand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateRocks(stageWidth: number) {
  const rng = rand(42);
  const rocks: Array<{ x: number; w: number; h: number; dark: boolean }> = [];
  let x = 400;
  while (x < stageWidth - 300) {
    const w = 50 + Math.floor(rng() * 100);
    const h = 35 + Math.floor(rng() * 70);
    const dark = rng() > 0.5;
    rocks.push({ x, w, h, dark });
    x += w + 200 + Math.floor(rng() * 300);
  }
  return rocks;
}

function drawLavaBg(ctx: CanvasRenderingContext2D, width: number, height: number, groundY: number) {
  // Sky area (above groundY) is intentionally left transparent so the
  // CSS background image shows through. Only draw mountains + glow on top.
  ctx.clearRect(0, 0, width, groundY);

  const rng1 = rand(7);
  ctx.fillStyle = "rgba(8,2,6,0.72)";
  for (let i = 0; i < 18; i++) {
    const mx = (i * (width / 14)) + rng1() * 80 - 40;
    const mh = 55 + rng1() * 50;
    ctx.beginPath();
    ctx.moveTo(mx - 110, groundY - 8);
    ctx.lineTo(mx, groundY - 8 - mh);
    ctx.lineTo(mx + 110, groundY - 8);
    ctx.fill();
  }

  const rng2 = rand(13);
  ctx.fillStyle = "rgba(4,1,4,0.82)";
  for (let i = 0; i < 13; i++) {
    const mx = (i * (width / 10)) + 60 + rng2() * 60 - 30;
    const mh = 90 + rng2() * 80;
    const wb = 130 + rng2() * 60;
    ctx.beginPath();
    ctx.moveTo(mx - wb, groundY - 5);
    ctx.lineTo(mx - 15, groundY - 5 - mh);
    ctx.lineTo(mx, groundY - 5 - mh - 18);
    ctx.lineTo(mx + 15, groundY - 5 - mh);
    ctx.lineTo(mx + wb, groundY - 5);
    ctx.fill();
  }

  // Lava glow bloom just above the ground line
  const glowGrad = ctx.createLinearGradient(0, groundY - 80, 0, groundY);
  glowGrad.addColorStop(0, "rgba(255,80,0,0)");
  glowGrad.addColorStop(1, "rgba(255,110,0,0.22)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, groundY - 80, width, 80);

  // Ground fill (below groundY)
  ctx.fillStyle = "#1a0606";
  ctx.fillRect(0, groundY, width, height - groundY);

  const lavaGrad = ctx.createLinearGradient(0, groundY, 0, height);
  lavaGrad.addColorStop(0, "#6b1c04");
  lavaGrad.addColorStop(0.3, "#8b2c08");
  lavaGrad.addColorStop(0.7, "#c04a10");
  lavaGrad.addColorStop(1, "#ff7a20");
  ctx.fillStyle = lavaGrad;
  ctx.fillRect(0, groundY, width, height - groundY);
}

interface SideScrollStageProps {
  player: PlayerCharacter;
  fromNodeId: number;
  toNodeId: number;
  stageName: string;
  defeatedEnemyIndices: number[];
  initialPlayerX?: number;
  shopVisited?: boolean;
  onEnemyContact: (enemyIndex: number, enemyId: string, playerX: number) => void;
  onFireballContact: (enemyIndex: number, enemyId: string, playerX: number) => void;
  onComplete: () => void;
  onExit: () => void;
}

export default function SideScrollStage({
  player,
  fromNodeId,
  toNodeId,
  stageName,
  defeatedEnemyIndices,
  initialPlayerX = 150,
  shopVisited = false,
  onEnemyContact,
  onFireballContact,
  onComplete,
  onExit,
}: SideScrollStageProps) {
  const stageKey = [Math.min(fromNodeId, toNodeId), Math.max(fromNodeId, toNodeId)].join("-");
  const stageData = LAVA_STAGES[stageKey] ?? { enemies: [] };

  // Resolve enemy types once at mount: before shop = 100% fireDemon; after shop = 80/20 split.
  const resolvedEnemiesRef = useRef(
    stageData.enemies.map(e => {
      if (e.type === "dragonLord") return e;
      if (!shopVisited) return { ...e, type: "fireDemon" as EnemyType, enemyId: "slime_fire" };
      return Math.random() < 0.2
        ? { ...e, type: "demonKin" as EnemyType, enemyId: "demon_kin" }
        : { ...e, type: "fireDemon" as EnemyType, enemyId: "slime_fire" };
    })
  );
  const resolvedEnemies = resolvedEnemiesRef.current;

  const charSprite = CHAR_SPRITES[player.spriteId] ?? CHAR_SPRITES.samurai;
  const playerW = Math.round(charSprite.iW * charSprite.scale);
  const playerH = Math.round(charSprite.iH * charSprite.scale);
  const startY = PHYS_GROUND_Y - playerH;
  const clampedStartX = Math.max(0, Math.min(STAGE_WIDTH - playerW, initialPlayerX));

  const physRef = useRef({
    x: clampedStartX, y: startY, vx: 0, vy: 0, onGround: true,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
  });
  const keysRef = useRef({ left: false, right: false, jumpPressed: false, jumpHeld: false });
  const facingRightRef = useRef(true);
  const stageCompleteRef = useRef(false);
  const battlePendingRef = useRef(false);
  const contactCooldown = useRef<Set<number>>(new Set());

  const onEnemyContactRef = useRef(onEnemyContact);
  const onFireballContactRef = useRef(onFireballContact);
  const onCompleteRef = useRef(onComplete);
  const onExitRef = useRef(onExit);
  useEffect(() => { onEnemyContactRef.current = onEnemyContact; }, [onEnemyContact]);
  useEffect(() => { onFireballContactRef.current = onFireballContact; }, [onFireballContact]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onExitRef.current = onExit; }, [onExit]);

  const defeatedRef = useRef(defeatedEnemyIndices);
  useEffect(() => {
    defeatedRef.current = defeatedEnemyIndices;
    resolvedEnemies.forEach((_, idx) => {
      if (!defeatedEnemyIndices.includes(idx)) {
        contactCooldown.current.delete(idx);
      }
    });
  }, [defeatedEnemyIndices, resolvedEnemies]);

  // Per-enemy patrol state: live x position + movement direction (-1 = left, 1 = right)
  const enemyPatrolRef = useRef(
    resolvedEnemies.map(e => ({ x: e.x, dir: -1 as 1 | -1, startX: e.x }))
  );

  // Fire demon AI state machine
  const demonStateRef = useRef<DemonState[]>(
    resolvedEnemies.map(() => ({ mode: "patrol" as DemonMode, timer: 0 }))
  );

  // Active fireballs
  const fireballsRef = useRef<Fireball[]>([]);
  const nextFbId = useRef(0);
  const [fireballs, setFireballs] = useState<Fireball[]>([]);

  // Fireball hit explosions (separate from game loop so they render while loop is frozen)
  const nextExpId = useRef(0);
  const [explosions, setExplosions] = useState<{ id: number; x: number; y: number }[]>([]);

  const [renderX, setRenderX] = useState(clampedStartX);
  const [renderY, setRenderY] = useState(startY);
  const [cameraX, setCameraX] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const footstepTimerRef = useRef(0);
  const playerFrameIdxRef = useRef(0);
  const playerFrameAccRef = useRef(0);
  const [facingRight, setFacingRight] = useState(true);
  const [enemyRenderPositions, setEnemyRenderPositions] = useState(resolvedEnemies.map(e => e.x));
  const [enemyFacingLeft, setEnemyFacingLeft] = useState(resolvedEnemies.map(() => true));
  const [battleFreezing, setBattleFreezing] = useState(false);

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const rocks = useRef(generateRocks(STAGE_WIDTH));

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawLavaBg(ctx, STAGE_WIDTH, VIEWPORT_H, GROUND_Y);
  }, []);

  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (stageCompleteRef.current) return;
    battlePendingRef.current = false;   // reset on every effect run (covers post-battle resume)
    fireballsRef.current = [];          // clear any stale projectiles
    setFireballs([]);
    setExplosions([]);
    demonStateRef.current.forEach(ds => { ds.mode = "patrol"; ds.timer = 0; });
    lastTimeRef.current = null;

    const loop = (ts: number) => {
      if (battlePendingRef.current) return;   // freeze while transition plays

      const dt = lastTimeRef.current !== null
        ? Math.min((ts - lastTimeRef.current) / 1000, 0.05)
        : 0.016;
      lastTimeRef.current = ts;

      const p = physRef.current;
      const keys = keysRef.current;

      // --- Coyote time: count down when just left the ground ---
      const wasOnGround = p.onGround;
      if (p.onGround) {
        p.coyoteTimer = COYOTE_TIME;
      } else {
        p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
      }

      // --- Jump buffer: count down from when jump was pressed ---
      if (keys.jumpPressed) {
        p.jumpBufferTimer = JUMP_BUFFER;
        keys.jumpPressed = false;
      } else {
        p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
      }

      // --- Horizontal movement: smooth acceleration ---
      const accel = p.onGround ? GROUND_ACCEL : AIR_ACCEL;
      const friction = p.onGround ? GROUND_FRICTION : AIR_DRAG;

      let moving = false;
      if (keys.left && !keys.right) {
        p.vx = Math.max(p.vx - accel * dt, -MAX_SPEED);
        moving = true;
        facingRightRef.current = false;
      } else if (keys.right && !keys.left) {
        p.vx = Math.min(p.vx + accel * dt, MAX_SPEED);
        moving = true;
        facingRightRef.current = true;
      } else {
        // Decelerate toward zero
        if (p.vx > 0) p.vx = Math.max(0, p.vx - friction * dt);
        else if (p.vx < 0) p.vx = Math.min(0, p.vx + friction * dt);
      }

      // --- Jump: coyote + buffer ---
      const canJump = p.coyoteTimer > 0;
      if (p.jumpBufferTimer > 0 && canJump) {
        p.vy = JUMP_VELOCITY;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
      }

      // --- Variable gravity: lower when holding jump and rising ---
      const grav = (keys.jumpHeld && p.vy < 0) ? GRAVITY_HOLD : GRAVITY;
      p.vy = Math.min(p.vy + grav * dt, 1100);

      // --- Integrate ---
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Horizontal clamp
      p.x = Math.max(0, Math.min(STAGE_WIDTH - playerW, p.x));

      // Ground collision
      if (p.y >= PHYS_GROUND_Y - playerH) {
        p.y = PHYS_GROUND_Y - playerH;
        p.vy = 0;
        p.onGround = true;
      } else {
        p.onGround = false;
      }

      // --- Footstep sound ---
      if (p.onGround && Math.abs(p.vx) > 30) {
        if (charSprite.stepFrames) {
          // Frame-synced mode: advance a shadow frame counter at 14fps and fire on exact frames
          playerFrameAccRef.current += dt;
          const frameDur = 1 / 14;
          while (playerFrameAccRef.current >= frameDur) {
            playerFrameAccRef.current -= frameDur;
            const prev = playerFrameIdxRef.current;
            playerFrameIdxRef.current = (prev + 1) % charSprite.runF;
            if (charSprite.stepFrames.includes(playerFrameIdxRef.current)) {
              playSfx("footstep", 0.35);
            }
          }
        } else {
          // Timer-based fallback for characters without frame data
          footstepTimerRef.current -= dt;
          if (footstepTimerRef.current <= 0) {
            const speedRatio = Math.min(Math.abs(p.vx) / MAX_SPEED, 1);
            playSfx("footstep", 0.25 + speedRatio * 0.10);
            footstepTimerRef.current = 0.21 + (1 - speedRatio) * 0.18;
          }
        }
      } else {
        // Reset both counters so animation re-sync is clean on next run
        playerFrameIdxRef.current = 0;
        playerFrameAccRef.current = 0;
        footstepTimerRef.current = 0.05;
      }

      // --- Left exit portal check ---
      if (p.x <= LEFT_EXIT_TRIGGER && !stageCompleteRef.current) {
        stageCompleteRef.current = true;
        setBattleFreezing(true);
        cancelAnimationFrame(rafRef.current);
        onExitRef.current();
        return;
      }

      // --- Stage end (right portal) ---
      if (p.x + playerW * 0.6 >= STAGE_END_X && !stageCompleteRef.current) {
        stageCompleteRef.current = true;
        setBattleFreezing(true);
        cancelAnimationFrame(rafRef.current);
        onCompleteRef.current();
        return;
      }

      // --- Enemy patrol + AI update ---
      const defeated = defeatedRef.current;
      const newEnemyX: number[] = [];
      const newEnemyFL: boolean[] = [];
      const pCxAI = p.x + playerW * 0.5; // player center x for AI checks

      resolvedEnemies.forEach((enemy, idx) => {
        const ep = enemyPatrolRef.current[idx];
        const ds = demonStateRef.current[idx];

        if (enemy.type === "fireDemon" && !defeated.includes(idx)) {
          const es = ENEMY_SPRITES_SS.fireDemon;
          const eW = Math.round(es.iW * es.scale);
          const eH = Math.round(es.iH * es.scale);
          const eCx = ep.x + eW * 0.5;
          const dist = Math.abs(pCxAI - eCx);
          const inSight = dist < SIGHT_RANGE;
          // face toward player
          const faceDir: 1 | -1 = pCxAI < eCx ? -1 : 1;

          if (ds.mode === "patrol") {
            if (inSight) {
              ds.mode = "aiming";
              ds.timer = FIRE_AIM_DELAY;
              ep.dir = faceDir;
              playSfx("fireDemonDeath", 0.65);
            } else {
              ep.x += ep.dir * PATROL_SPEED * dt;
              if (ep.x >= ep.startX + PATROL_RANGE) { ep.x = ep.startX + PATROL_RANGE; ep.dir = -1; }
              else if (ep.x <= ep.startX - PATROL_RANGE) { ep.x = ep.startX - PATROL_RANGE; ep.dir = 1; }
            }
          } else if (ds.mode === "aiming") {
            ep.dir = faceDir;
            ds.timer -= dt;
            if (ds.timer <= 0) {
              // Spawn from the demon's "hand" side — front edge, ~47% up from feet
              // (matches battle: enemyCenterOffset = (192/640)*35 ≈ 35% of sprite height)
              const fireX = faceDir === -1
                ? ep.x + eW * 0.15          // facing left → left edge
                : ep.x + eW * 0.85;         // facing right → right edge
              const fireY = GROUND_Y - eH * 0.47;
              fireballsRef.current.push({
                id: nextFbId.current++,
                x: fireX,
                y: fireY,
                vx: faceDir * FIREBALL_SPEED,
                enemyIdx: idx,
              });
              playSfx("fireballWhoosh", 0.8);
              ds.mode = "cooldown";
              ds.timer = FIRE_COOLDOWN;
            }
          } else {
            // cooldown — stand still, face player, count down
            ep.dir = faceDir;
            ds.timer -= dt;
            if (ds.timer <= 0) {
              ds.mode = inSight ? "aiming" : "patrol";
              ds.timer = inSight ? FIRE_AIM_DELAY : 0;
            }
          }
        }

        newEnemyX.push(ep.x);
        newEnemyFL.push(ep.dir === -1);
      });

      // --- Enemy collision ---
      // Use tight hitboxes: 36% of sprite width, 55% of sprite height, centered on the visible body.
      const pCx = p.x + playerW * 0.50;
      const pCy = p.y + playerH * 0.48;
      const pHW = playerW * 0.18;
      const pHH = playerH * 0.28;

      resolvedEnemies.forEach((enemy, idx) => {
        if (defeated.includes(idx)) return;
        if (contactCooldown.current.has(idx)) return;

        const es = ENEMY_SPRITES_SS[enemy.type];
        const eW = Math.round(es.iW * es.scale);
        const eH = Math.round(es.iH * es.scale);
        const eCx = enemyPatrolRef.current[idx].x + eW * 0.50;
        // Use PHYS_GROUND_Y so the enemy hitbox aligns with the player's physics ground.
        const eCy = (PHYS_GROUND_Y - eH) + eH * 0.45;
        const eHW = eW * 0.20;
        const eHH = eH * 0.26;

        if (Math.abs(pCx - eCx) < (pHW + eHW) && Math.abs(pCy - eCy) < (pHH + eHH)) {
          contactCooldown.current.add(idx);
          battlePendingRef.current = true;
          setBattleFreezing(true);
          cancelAnimationFrame(rafRef.current);
          onEnemyContactRef.current(idx, enemy.enemyId, p.x);
          return;
        }
      });

      // Guard: melee contact may have set battlePendingRef inside the forEach
      if (battlePendingRef.current) return;

      // --- Fireball physics + player collision ---
      {
        const activeFbs: Fireball[] = [];
        let hitFb: Fireball | null = null;
        for (const fb of fireballsRef.current) {
          fb.x += fb.vx * dt;
          if (fb.x < -300 || fb.x > STAGE_WIDTH + 300) continue; // off-stage, discard
          if (!hitFb) {
            const dx = Math.abs(fb.x - pCx);
            const dy = Math.abs(fb.y - pCy);
            if (dx < FIREBALL_R + pHW && dy < FIREBALL_R + pHH) {
              hitFb = fb;
              continue; // remove from active list
            }
          }
          activeFbs.push(fb);
        }
        fireballsRef.current = activeFbs;

        if (hitFb) {
          const hitEnemy = resolvedEnemies[hitFb.enemyIdx];
          contactCooldown.current.add(hitFb.enemyIdx);
          battlePendingRef.current = true;
          setBattleFreezing(true);
          cancelAnimationFrame(rafRef.current);
          // Show explosion at impact point, then trigger battle after animation plays
          playSfx("fireballImpact", 0.8);
          const expId = nextExpId.current++;
          setFireballs([]);
          setExplosions(prev => [...prev, { id: expId, x: hitFb!.x, y: hitFb!.y }]);
          const capturedPlayerX = p.x;
          const capturedEnemyIdx = hitFb.enemyIdx;
          const capturedEnemyId = hitEnemy?.enemyId ?? "";
          setTimeout(() => {
            setExplosions(prev => prev.filter(e => e.id !== expId));
            onFireballContactRef.current(capturedEnemyIdx, capturedEnemyId, capturedPlayerX);
          }, EXP_DELAY_MS);
          return;
        }
      }

      // --- Camera ---
      const targetCamX = p.x - CAMERA_LEAD;
      const newCamX = Math.max(0, Math.min(STAGE_WIDTH - 1024, targetCamX));

      setRenderX(p.x);
      setRenderY(p.y);
      setCameraX(newCamX);
      setIsRunning(p.onGround && Math.abs(p.vx) > 20);
      setIsJumping(!p.onGround);
      setFacingRight(facingRightRef.current);
      setEnemyRenderPositions(newEnemyX);
      setEnemyFacingLeft(newEnemyFL);
      setFireballs([...fireballsRef.current]);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [stageData, playerH, playerW, defeatedEnemyIndices]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (stageCompleteRef.current) return;
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          keysRef.current.left = true;
          e.preventDefault();
          break;
        case "ArrowRight":
        case "KeyD":
          keysRef.current.right = true;
          e.preventDefault();
          break;
        case "Space":
        case "ArrowUp":
        case "KeyW":
          keysRef.current.jumpPressed = true;
          keysRef.current.jumpHeld = true;
          e.preventDefault();
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowLeft": case "KeyA": keysRef.current.left = false; break;
        case "ArrowRight": case "KeyD": keysRef.current.right = false; break;
        case "Space": case "ArrowUp": case "KeyW": keysRef.current.jumpHeld = false; break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);


  const progressPercent = Math.min(100, Math.round((renderX / STAGE_END_X) * 100));

  // Jump: freeze on first frame of run sheet (totalFrames=1 = naturally frozen).
  // Ground: run or idle based on velocity.
  const spriteSrc    = (isJumping || isRunning) ? charSprite.run : charSprite.idle;
  const spriteFrames = isJumping ? 1 : (isRunning ? charSprite.runF : charSprite.idleF);
  const spriteFps    = isRunning ? 14 : 8;

  const touchBtn = useCallback((active: boolean): React.CSSProperties => ({
    width: 56,
    height: 56,
    background: active ? "rgba(201,164,74,0.35)" : "rgba(0,0,0,0.5)",
    border: `2px solid ${active ? "rgba(201,164,74,0.7)" : "rgba(255,255,255,0.2)"}`,
    borderRadius: 8,
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
  }), []);

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ width: "100%", height: "100%", background: "#060108" }}
      data-testid="side-scroll-stage"
    >
      {/* Parallax lava landscape background — covers sky area above ground line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: STAGE_WIDTH,
          height: GROUND_Y,
          transform: `translateX(${-(cameraX * 0.35)}px)`,
          backgroundImage: `url(${lavaBgImg})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left top",
          imageRendering: "pixelated",
          willChange: "transform",
          pointerEvents: "none",
        }}
      />

      <canvas
        ref={bgCanvasRef}
        width={STAGE_WIDTH}
        height={VIEWPORT_H}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translateX(${-(cameraX * 0.35)}px)`,
          imageRendering: "pixelated",
          willChange: "transform",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: STAGE_WIDTH,
          height: VIEWPORT_H,
          transform: `translateX(${-cameraX}px)`,
          willChange: "transform",
        }}
      >
        <div style={{
          position: "absolute",
          left: 0,
          top: GROUND_Y,
          width: STAGE_WIDTH,
          height: VIEWPORT_H - GROUND_Y,
          background: "linear-gradient(180deg, #3a1505 0%, #6b2810 25%, #a04018 60%, #d06020 100%)",
        }} />

        <div style={{
          position: "absolute",
          left: 0,
          top: GROUND_Y - 3,
          width: STAGE_WIDTH,
          height: 3,
          background: "linear-gradient(90deg, #ff5500, #ffaa00, #ff5500, #ff8800, #ff4400)",
          boxShadow: "0 0 18px rgba(255,100,0,0.95), 0 0 40px rgba(255,50,0,0.5)",
        }} />

        {rocks.current.map((rock, i) => (
          <div key={i} style={{
            position: "absolute",
            left: rock.x,
            top: GROUND_Y - rock.h,
            width: rock.w,
            height: rock.h,
            background: rock.dark
              ? "linear-gradient(160deg, #100404 0%, #200808 50%, #2a1208 100%)"
              : "linear-gradient(160deg, #1a0808 0%, #2a1010 50%, #3a1808 100%)",
            clipPath: "polygon(8% 100%, 0% 60%, 15% 20%, 35% 0%, 60% 5%, 85% 15%, 100% 55%, 95% 100%)",
          }} />
        ))}

        {resolvedEnemies.map((enemy, idx) => {
          if (defeatedEnemyIndices.includes(idx)) return null;
          const es = ENEMY_SPRITES_SS[enemy.type];
          const eW = Math.round(es.iW * es.scale);
          const eH = Math.round(es.iH * es.scale);
          const liveX = enemyRenderPositions[idx] ?? enemy.x;
          const facingLeft = enemyFacingLeft[idx] ?? true;
          return (
            <div
              key={idx}
              data-testid={`side-scroll-enemy-${idx}`}
              style={{
                position: "absolute",
                left: liveX,
                top: GROUND_Y - eH + es.groundOffset,
                width: eW,
                height: eH,
                filter: "drop-shadow(0 4px 14px rgba(255,50,0,0.6))",
              }}
            >
              <SpriteAnimator
                spriteSheet={es.sheet}
                frameWidth={es.iW}
                frameHeight={es.iH}
                totalFrames={es.frames}
                fps={es.fps}
                scale={es.scale}
                loop={true}
                flipX={!facingLeft}
                paused={battleFreezing}
                anchor="top-left"
              />
            </div>
          );
        })}

        {fireballs.map(fb => (
          <div
            key={fb.id}
            style={{
              position: "absolute",
              left: fb.x - (FB_FRAME_W * FB_SCALE) / 2,
              top: fb.y - (FB_FRAME_H * FB_SCALE) / 2,
              pointerEvents: "none",
              zIndex: 6,
              filter: "drop-shadow(0 0 6px rgba(255,120,0,0.9))",
            }}
          >
            <SpriteAnimator
              spriteSheet={demonFireballSheet}
              frameWidth={FB_FRAME_W}
              frameHeight={FB_FRAME_H}
              totalFrames={FB_FRAMES}
              fps={FB_FPS}
              scale={FB_SCALE}
              loop={true}
              flipX={fb.vx > 0}
              paused={battleFreezing}
              anchor="top-left"
            />
          </div>
        ))}

        {explosions.map(exp => (
          <div
            key={exp.id}
            style={{
              position: "absolute",
              left: exp.x - (EXP_FRAME * EXP_SCALE) / 2,
              top: exp.y - (EXP_FRAME * EXP_SCALE) / 2,
              pointerEvents: "none",
              zIndex: 8,
              filter: "drop-shadow(0 0 12px rgba(255,120,20,0.8)) drop-shadow(0 0 24px rgba(255,60,0,0.5))",
            }}
          >
            <SpriteAnimator
              spriteSheet={sfxFireBurst}
              frameWidth={EXP_FRAME}
              frameHeight={EXP_FRAME}
              totalFrames={EXP_FRAMES}
              fps={EXP_FPS}
              scale={EXP_SCALE}
              loop={false}
              anchor="top-left"
            />
          </div>
        ))}

        <div
          data-testid="side-scroll-player"
          style={{
            position: "absolute",
            left: renderX,
            top: renderY,
            width: playerW,
            height: playerH,
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.8))",
          }}
        >
          <SpriteAnimator
            spriteSheet={spriteSrc}
            frameWidth={charSprite.iW}
            frameHeight={charSprite.iH}
            totalFrames={spriteFrames}
            fps={spriteFps}
            scale={charSprite.scale}
            loop={true}
            flipX={!facingRight}
            paused={battleFreezing}
            anchor="top-left"
          />
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "10px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        pointerEvents: "none",
        zIndex: 10,
      }}>
        <div style={{
          background: "rgba(0,0,0,0.75)",
          border: "2px solid #c9a44a",
          borderRadius: 4,
          padding: "6px 12px",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8,
          color: "#c9a44a",
          letterSpacing: 1,
          lineHeight: "1.6",
        }}>
          <div style={{ color: "#666", fontSize: 6, marginBottom: 2 }}>DESTINATION</div>
          {stageName.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#666", letterSpacing: 1 }}>PROGRESS</div>
          <div style={{
            width: 180,
            height: 10,
            background: "rgba(0,0,0,0.7)",
            border: "1px solid #444",
            borderRadius: 3,
            overflow: "hidden",
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #c9a44a, #f0d060, #c9a44a)",
              transition: "width 0.08s",
              boxShadow: "0 0 6px rgba(201,164,74,0.7)",
            }} />
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#c9a44a" }}>{progressPercent}%</div>
        </div>

      </div>

      <div style={{
        position: "absolute",
        bottom: 8,
        right: 10,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 6,
        color: "rgba(255,255,255,0.25)",
        pointerEvents: "none",
        zIndex: 10,
        textAlign: "right",
        lineHeight: "2",
      }}>
        ←→ MOVE&nbsp;&nbsp;SPACE JUMP
      </div>

      <div style={{
        position: "absolute",
        bottom: 10,
        left: 10,
        right: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        zIndex: 20,
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", gap: 8, pointerEvents: "auto" }}>
          <button
            data-testid="button-move-left"
            onPointerDown={() => { keysRef.current.left = true; }}
            onPointerUp={() => { keysRef.current.left = false; }}
            onPointerLeave={() => { keysRef.current.left = false; }}
            style={touchBtn(false)}
          >◀</button>
          <button
            data-testid="button-move-right"
            onPointerDown={() => { keysRef.current.right = true; }}
            onPointerUp={() => { keysRef.current.right = false; }}
            onPointerLeave={() => { keysRef.current.right = false; }}
            style={touchBtn(false)}
          >▶</button>
        </div>
        <button
          data-testid="button-jump"
          onPointerDown={() => { keysRef.current.jumpPressed = true; keysRef.current.jumpHeld = true; }}
          onPointerUp={() => { keysRef.current.jumpHeld = false; }}
          onPointerLeave={() => { keysRef.current.jumpHeld = false; }}
          style={{
            ...touchBtn(false),
            background: "rgba(201,164,74,0.25)",
            borderColor: "rgba(201,164,74,0.5)",
          }}
        >▲</button>
      </div>

    </div>
  );
}
