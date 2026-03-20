import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ParticleCanvas from "./ParticleCanvas";
import lavaRegionBg from "@assets/lava_stage_region_background_1773416952733.jpg";
import forestRegionBg from "@assets/Forest_Region_Scene_Background_upscayl_2x_digital-art-4x_1773707314050.png";
import SpriteAnimator from "./SpriteAnimator";
import BattleTransition from "./BattleTransition";
import type { PlayerCharacter, OverworldNode } from "@shared/schema";
import { REGIONS, ELEMENT_COLORS, COLOR_MAP } from "@/lib/gameData";
import { useColorMap } from "@/hooks/useColorMap";
import { playSfx } from "@/lib/sfx";
import { ShoppingBag, Tent, Star, Crown, Heart, Droplets, Coins, ChevronLeft, ChevronRight, Check, Flame, X, Sparkles, Home, Shield, Package, Menu, Zap } from "lucide-react";
import GameMenuPanel from "@/components/GameMenuPanel";
import { isRegionUnlocked, getRegionTier, getRegionForTier } from "@/lib/gameData";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import samuraiRun from "@/assets/images/samurai-run.png";
import slknightIdle from "@/assets/images/slknight-idle.png";
import slknightRun from "@/assets/images/slknight-run.png";
import baskenIdle from "@/assets/images/basken-idle.png";
import baskenRun from "@/assets/images/basken-run.png";
import hutOverworldIcon from "@/assets/hut_overworld_icon.png";
import bossBattleOverworldIcon from "@/assets/boss_battle_overworld_icon.png";

const OVERWORLD_SPRITES: Record<string, {
  idle: { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number; fps: number };
  run: { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number; fps: number };
  scale: number;
}> = {
  samurai: {
    idle: { sheet: samuraiIdle, frameWidth: 96, frameHeight: 96, totalFrames: 10, fps: 8 },
    run: { sheet: samuraiRun, frameWidth: 96, frameHeight: 96, totalFrames: 8, fps: 14 },
    scale: 2,
  },
  knight: {
    idle: { sheet: slknightIdle, frameWidth: 128, frameHeight: 64, totalFrames: 8, fps: 8 },
    run: { sheet: slknightRun, frameWidth: 128, frameHeight: 64, totalFrames: 8, fps: 14 },
    scale: 2,
  },
  basken: {
    idle: { sheet: baskenIdle, frameWidth: 56, frameHeight: 56, totalFrames: 5, fps: 8 },
    run: { sheet: baskenRun, frameWidth: 56, frameHeight: 56, totalFrames: 6, fps: 14 },
    scale: 3,
  },
};

const NODE_ICONS: Record<string, any> = {
  passage: null,
  shop: ShoppingBag,
  rest: Tent,
  event: Star,
  boss: Crown,
  shaman: Sparkles,
  hut: Home,
};

const WIND_EDGE_NAMES: Record<string, string> = {
  "0-1":  "Old Forest Road",
  "1-2":  "Whisperroot Trail",
  "1-3":  "Verdant Trail",
  "3-4":  "Mossy Descent",
  "3-5":  "Amber Road",
  "5-6":  "Grove Ascent",
  "5-7":  "Pilgrim's Way",
  "7-8":  "Glade Path",
  "7-9":  "Thunder Road",
  "9-10": "Windcrest Trail",
  "9-11": "Merchant's Steps",
  "9-12": "Dragon's Ascent",
};

const REGION_PARTICLES: Record<string, string[]> = {
  Fire: ["#ef4444", "#f97316", "#fbbf24", "#dc2626"],
  Ice: ["#67e8f9", "#3b82f6", "#93c5fd", "#e0f2fe"],
  Shadow: ["#7c3aed", "#6b21a8", "#4c1d95", "#ddd6fe"],
  Earth: ["#a16207", "#ca8a04", "#d97706", "#92400e"],
};

interface RegionThemeConfig {
  sky: string[];
  terrain: string;
  pathColor: string;
  pathBorder: string;
  grassColors: string[];
  treeColors: string[];
  mountainColor: string;
  fogColor: string;
  waterColor?: string;
  ambientLight: string;
}

const REGION_THEMES: Record<string, RegionThemeConfig> = {
  Fire: {
    sky: ["#1a0508", "#3d0a10", "#6b1a1a", "#c2451a", "#f09030"],
    terrain: "#2a1508",
    pathColor: "#8b6b4a",
    pathBorder: "#5a3a20",
    grassColors: ["#4a3a10", "#6b4a15", "#8b6b30"],
    treeColors: ["#3a1a0a", "#5a2a10", "#7a3a15"],
    mountainColor: "#4a2a15",
    fogColor: "rgba(200, 80, 30, 0.08)",
    ambientLight: "rgba(255, 100, 30, 0.06)",
  },
  Ice: {
    sky: ["#050a1a", "#0a1535", "#102050", "#2040a0", "#60a0e0"],
    terrain: "#1a2540",
    pathColor: "#8090b0",
    pathBorder: "#506080",
    grassColors: ["#304060", "#405070", "#506888"],
    treeColors: ["#203040", "#304858", "#405868"],
    mountainColor: "#3a5070",
    fogColor: "rgba(100, 180, 255, 0.08)",
    waterColor: "#2050a0",
    ambientLight: "rgba(100, 180, 255, 0.06)",
  },
  Shadow: {
    sky: ["#08050a", "#150a20", "#2a1040", "#401860", "#6030a0"],
    terrain: "#150a20",
    pathColor: "#6a5080",
    pathBorder: "#3a2050",
    grassColors: ["#1a1030", "#2a1848", "#3a2058"],
    treeColors: ["#100820", "#1a1030", "#251840"],
    mountainColor: "#201040",
    fogColor: "rgba(120, 60, 200, 0.08)",
    ambientLight: "rgba(150, 80, 255, 0.06)",
  },
  Earth: {
    sky: ["#0a0800", "#1a1508", "#302810", "#605020", "#a08040"],
    terrain: "#2a2010",
    pathColor: "#b0903a",
    pathBorder: "#705820",
    grassColors: ["#4a5020", "#607030", "#708040"],
    treeColors: ["#2a3010", "#3a4018", "#4a5020"],
    mountainColor: "#504020",
    fogColor: "rgba(180, 140, 60, 0.08)",
    ambientLight: "rgba(200, 160, 80, 0.06)",
  },
};

function getNodePosition(node: OverworldNode): { x: number; y: number } {
  return { x: node.x, y: node.y };
}

function lerpPosition(from: { x: number; y: number }, to: { x: number; y: number }, t: number) {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

interface OverworldProps {
  player: PlayerCharacter;
  onMoveToNode: (nodeId: number) => void;
  onNodeSelect: (nodeId: number, charPos?: { x: number; y: number }) => void;
  onShopOpen: (nodeId: number) => void;
  onRest: (nodeId: number) => void;
  onShamanVisit: (nodeId: number) => void;
  onHutEnter: () => void;
  onVillageEnter: () => void;
  onRegionChange: (regionId: number) => void;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: "weapon" | "armor" | "accessory") => void;
  onUseItem: (itemId: string, targetPartyIndex?: number) => void;
  onArrowClick?: (fromNodeId: number, toNode: OverworldNode) => void;
  onSave: (slotNumber: number) => void;
  onExitToMenu: () => void;
  textSpeed: "slow" | "medium" | "fast";
  musicVolume: number;
  sfxVolume: number;
  onTextSpeedChange: (speed: "slow" | "medium" | "fast") => void;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
  devInvincible?: boolean;
  onDevSetLevel?: (level: number) => void;
  onDevUnlockSpells?: () => void;
  onDevToggleInvincibility?: () => void;
  onDevTeleportBoss?: () => void;
}

export default function Overworld({ player, onMoveToNode, onNodeSelect, onShopOpen, onRest, onShamanVisit, onHutEnter, onVillageEnter, onRegionChange, onEquip, onUnequip, onUseItem, onArrowClick, onSave, onExitToMenu, textSpeed, musicVolume, sfxVolume, onTextSpeedChange, onMusicVolumeChange, onSfxVolumeChange, devInvincible, onDevSetLevel, onDevUnlockSpells, onDevToggleInvincibility, onDevTeleportBoss }: OverworldProps) {
  const _owSpriteConfig = OVERWORLD_SPRITES[player.spriteId || "samurai"] || OVERWORLD_SPRITES.samurai;
  const playerColorMap = useColorMap(_owSpriteConfig.idle.sheet, _owSpriteConfig.idle.frameWidth, _owSpriteConfig.idle.frameHeight, player.colorGroups);
  const tier = getRegionTier(player.currentRegion, player.regionBossDefeats || {});
  const region = getRegionForTier(player.currentRegion, tier);
  const theme = REGION_THEMES[region.theme] || REGION_THEMES.Fire;
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [charPos, setCharPos] = useState<{ x: number; y: number }>(() => {
    const currentNode = region.nodes.find(n => n.id === player.currentNode);
    return currentNode ? getNodePosition(currentNode) : { x: 8, y: 82 };
  });
  const [isMoving, setIsMoving] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [devLevelInput, setDevLevelInput] = useState<number>(player.level);
  const animFrameRef = useRef<number>(0);
  const moveCallbackRef = useRef<(() => void) | null>(null);
  const charPosRef = useRef(charPos);

  useEffect(() => { charPosRef.current = charPos; }, [charPos]);

  useEffect(() => { setDevLevelInput(player.level); }, [player.level]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d" || e.key === "D") {
        if ((e.target as HTMLElement).tagName === "INPUT") return;
        setDevMenuOpen(prev => !prev);
      }
      if (e.key === "Escape") setDevMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const prevRegionRef = useRef(player.currentRegion);
  const prevNodeRef = useRef(player.currentNode);

  const moveCharacterTo = useCallback((target: { x: number; y: number }, onArrive: () => void) => {
    cancelAnimationFrame(animFrameRef.current);
    const start = { ...charPosRef.current };
    setIsMoving(true);
    setFacingRight(target.x > start.x);
    moveCallbackRef.current = onArrive;

    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const pos = lerpPosition(start, target, eased);
      setCharPos(pos);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsMoving(false);
        setCharPos(target);
        moveCallbackRef.current?.();
        moveCallbackRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const menuFadeOut = useRef(false);

  useEffect(() => {
    if (prevRegionRef.current !== player.currentRegion) {
      menuFadeOut.current = true;
      setTimeout(() => {
        cancelAnimationFrame(animFrameRef.current);
        setIsMoving(false);
        setFacingRight(true);
        moveCallbackRef.current = null;
        const newTier = getRegionTier(player.currentRegion, player.regionBossDefeats || {});
        const newRegion = getRegionForTier(player.currentRegion, newTier);
        const firstNode = newRegion.nodes[0];
        const pos = getNodePosition(firstNode);
        setCharPos(pos);
        prevRegionRef.current = player.currentRegion;
        prevNodeRef.current = player.currentNode;
        setTimeout(() => {
          menuFadeOut.current = false;
        }, 800);
      }, 800);
      return;
    }

    if (prevNodeRef.current !== player.currentNode) {
      const targetNode = region.nodes.find(n => n.id === player.currentNode);
      if (targetNode) {
        const targetPos = getNodePosition(targetNode);
        const cur = charPosRef.current;
        const dist = Math.abs(cur.x - targetPos.x) + Math.abs(cur.y - targetPos.y);
        if (dist > 1) {
          moveCharacterTo(targetPos, () => {});
        } else {
          setCharPos(targetPos);
        }
      }
      prevNodeRef.current = player.currentNode;
    }
  }, [player.currentNode, player.currentRegion, moveCharacterTo, region.nodes]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const isAdjacentToCurrentNode = (node: OverworldNode): boolean => {
    const currentNodeData = region.nodes.find(n => n.id === player.currentNode);
    if (!currentNodeData) return false;
    return currentNodeData.connections.includes(node.id);
  };

  const canAccessNode = (node: OverworldNode): boolean => {
    if (node.id === player.currentNode) return true;
    const currentNodeData = region.nodes.find(n => n.id === player.currentNode);
    if (!currentNodeData) {
      return node.id === region.nodes[0].id;
    }
    if (!isAdjacentToCurrentNode(node)) return false;
    if (
      currentNodeData.type === "boss" &&
      !player.clearedNodes.includes(currentNodeData.id)
    ) {
      const targetCleared = player.clearedNodes.includes(node.id);
      const targetIsSafe = node.type === "hut" || node.type === "village" || node.type === "shop" || node.type === "rest" || node.type === "shaman" || node.type === "passage";
      if (!targetCleared && !targetIsSafe) return false;
    }
    return true;
  };

  const handleNodeClick = (node: OverworldNode) => {
    if (isMoving) return;
    if (node.id === player.currentNode) {
      triggerNodeAction(node);
    }
  };

  const handleArrowClick = (targetNode: OverworldNode) => {
    if (isMoving) return;
    if (onArrowClick) {
      onArrowClick(player.currentNode, targetNode);
      return;
    }
    const targetPos = getNodePosition(targetNode);
    setFacingRight(targetPos.x > charPos.x);
    moveCharacterTo(targetPos, () => {
      onMoveToNode(targetNode.id);
    });
  };

  const triggerNodeAction = (node: OverworldNode) => {
    if (node.type === "hut") {
      onHutEnter();
    } else if (node.type === "village") {
      onVillageEnter();
    } else if (node.type === "boss") {
      onNodeSelect(node.id, charPos);
    } else if (node.type === "shop") {
      onShopOpen(node.id);
    } else if (node.type === "rest") {
      onRest(node.id);
    } else if (node.type === "shaman") {
      onShamanVisit(node.id);
    } else if (node.type === "event") {
      onRest(node.id);
    }
  };

  const regionColors = REGION_PARTICLES[region.theme] || REGION_PARTICLES.Fire;

  const edges = useMemo(() => {
    const edgeSet = new Set<string>();
    const result: { from: OverworldNode; to: OverworldNode }[] = [];
    for (const node of region.nodes) {
      for (const connId of node.connections) {
        const key = [Math.min(node.id, connId), Math.max(node.id, connId)].join("-");
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          const toNode = region.nodes.find(n => n.id === connId);
          if (toNode) {
            result.push({ from: node, to: toNode });
          }
        }
      }
    }
    return result;
  }, [region.nodes]);

  const sortedNodes = useMemo(() => [...region.nodes].sort((a, b) => a.y - b.y), [region.nodes]);

  const CAMERA_ZOOM = 1.4;
  const cameraTransform = useMemo(() => {
    const z = CAMERA_ZOOM;
    const rawTx = 50 - charPos.x * z;
    const rawTy = 50 - charPos.y * z;
    const minOffset = -(z - 1) * 100;
    const tx = Math.max(minOffset, Math.min(0, rawTx));
    const ty = Math.max(minOffset, Math.min(0, rawTy));
    return `translate(${tx}%, ${ty}%) scale(${z})`;
  }, [charPos.x, charPos.y]);

  const isFireRegion = region.theme === "Fire";
  const isWindRegion = region.theme === "Wind";
  const elemColor = ELEMENT_COLORS[region.theme];

  return (
    <div className="relative w-full h-full overflow-hidden" data-testid="overworld-screen">
      <style>{`
        @keyframes bgCloudDrift {
          0%   { transform: translateX(115%); }
          100% { transform: translateX(-115%); }
        }
        @keyframes bgMtnDrift {
          0%, 100% { transform: translateX(0px); }
          50%       { transform: translateX(-6px); }
        }
        @keyframes bgAmbientPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1.3; }
        }
        @keyframes bgFirePulse {
          0%, 100% { opacity: 0.08; }
          50%       { opacity: 0.18; }
        }
      `}</style>
      {isFireRegion && (
        <div className="absolute inset-0" style={{
          backgroundImage: `url(${lavaRegionBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          imageRendering: "pixelated",
          zIndex: 0,
        }}>
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 50% 90%, rgba(255,80,0,0.35) 0%, transparent 70%)",
            animation: "bgFirePulse 3s ease-in-out infinite",
            pointerEvents: "none",
          }} />
        </div>
      )}
      {isWindRegion && (
        <div className="absolute inset-0" style={{
          backgroundImage: `url(${forestRegionBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          zIndex: 0,
        }} />
      )}
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: "0 0",
          transform: cameraTransform,
          transition: "transform 0.4s ease-out",
          willChange: "transform",
        }}
      >
      {!isFireRegion && !isWindRegion && (
        <div className="absolute inset-0" style={{ filter: "contrast(1.15) saturate(1.2)" }}>
          <div className="absolute inset-0" style={{
            background: `linear-gradient(180deg, ${theme.sky[0]} 0%, ${theme.sky[1]} 15%, ${theme.sky[2]} 30%, ${theme.sky[3]} 55%, ${theme.sky[4]} 80%)`,
          }} />
          {[
            { top: "6%",  w: 120, h: 28, delay: "0s",    dur: "80s",  opacity: 0.07 },
            { top: "11%", w: 90,  h: 20, delay: "-28s",  dur: "65s",  opacity: 0.05 },
            { top: "4%",  w: 160, h: 32, delay: "-50s",  dur: "100s", opacity: 0.06 },
            { top: "9%",  w: 70,  h: 16, delay: "-15s",  dur: "55s",  opacity: 0.04 },
          ].map((c, i) => (
            <div key={`cloud-${i}`} className="absolute pointer-events-none" style={{
              top: c.top, left: 0, right: 0,
              overflow: "hidden",
              height: c.h,
            }}>
              <div style={{
                position: "absolute",
                width: c.w,
                height: c.h,
                background: "white",
                borderRadius: "50%",
                opacity: c.opacity,
                filter: "blur(8px)",
                animation: `bgCloudDrift ${c.dur} linear ${c.delay} infinite`,
              }} />
            </div>
          ))}
          <div className="absolute inset-0" style={{ top: "15%", animation: "bgMtnDrift 28s ease-in-out infinite" }}>
            <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none" style={{ shapeRendering: "crispEdges" }}>
              <path d={`M0 20 Q10 12 25 16 Q40 8 55 14 Q70 6 85 12 Q95 9 100 15 L100 60 L0 60 Z`}
                fill={theme.mountainColor} opacity="0.6" />
              <path d={`M0 28 Q15 20 30 24 Q50 16 65 22 Q80 14 100 20 L100 60 L0 60 Z`}
                fill={theme.mountainColor} opacity="0.8" />
            </svg>
          </div>
          <div className="absolute inset-0" style={{ top: "35%" }}>
            <div className="w-full h-full" style={{
              background: `linear-gradient(180deg, ${theme.terrain}00 0%, ${theme.terrain} 20%, ${theme.grassColors[0]} 50%, ${theme.grassColors[1]} 80%, ${theme.grassColors[2]} 100%)`,
            }} />
          </div>
          {[...Array(18)].map((_, i) => {
            const x = (i * 6 + (i % 3) * 2) % 100;
            const y = 38 + (i % 5) * 10 + Math.sin(i * 1.3) * 4;
            const size = 2.5 + (i % 3) * 1.2;
            const colorIdx = i % theme.treeColors.length;
            return (
              <div key={`tree-${i}`} className="absolute" style={{
                left: `${x}%`, top: `${y}%`,
                width: 0, height: 0,
                borderLeft: `${size * 3}px solid transparent`,
                borderRight: `${size * 3}px solid transparent`,
                borderBottom: `${size * 8}px solid ${theme.treeColors[colorIdx]}`,
                opacity: 0.6 + (i % 3) * 0.15,
                transform: "translateX(-50%)",
                zIndex: Math.floor(y),
              }} />
            );
          })}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `${theme.fogColor}`,
            mixBlendMode: "screen",
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse at 80% 20%, ${theme.ambientLight} 0%, transparent 60%)`,
            animation: "bgAmbientPulse 6s ease-in-out infinite",
          }} />
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        backgroundSize: "4px 4px",
        zIndex: 1,
      }} />

      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 1px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0.04) 2px)",
        zIndex: 1,
      }} />

      {!isWindRegion && (
        <ParticleCanvas
          colors={regionColors}
          count={region.theme === "Fire" ? 40 : region.theme === "Ice" ? 25 : region.theme === "Shadow" ? 30 : 25}
          speed={region.theme === "Fire" ? 0.5 : region.theme === "Ice" ? 0.2 : region.theme === "Shadow" ? 0.3 : 0.25}
          style={region.theme === "Fire" ? "rain" : region.theme === "Ice" ? "ambient" : region.theme === "Shadow" ? "swirl" : "ambient"}
        />
      )}

      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="pathShadow">
              <feDropShadow dx="0" dy="0.3" stdDeviation="0.3" floodColor="rgba(0,0,0,0.5)" />
            </filter>
            <filter id="pathGlow">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feFlood floodColor={`${elemColor}30`} result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {edges.map((edge, i) => {
            const dx = edge.to.x - edge.from.x;
            const dy = edge.to.y - edge.from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / dist * 2;
            const perpY = dx / dist * 2;
            const mx = (edge.from.x + edge.to.x) / 2 + perpX * ((i % 3 === 0) ? 1 : (i % 3 === 1) ? -0.5 : 0.3);
            const my = (edge.from.y + edge.to.y) / 2 + perpY * ((i % 3 === 0) ? 1 : (i % 3 === 1) ? -0.5 : 0.3);

            const pathD = `M ${edge.from.x} ${edge.from.y} Q ${mx} ${my} ${edge.to.x} ${edge.to.y}`;

            const fireStyle = isFireRegion;
            return (
              <g key={`edge-${i}`}>
                <path d={pathD} fill="none" stroke={theme.pathBorder} strokeWidth={fireStyle ? "1.5" : "3"} strokeLinecap="round" filter="url(#pathShadow)" opacity={fireStyle ? 0.3 : 1} />
                <path d={pathD} fill="none" stroke={theme.pathColor} strokeWidth={fireStyle ? "0.8" : "1.8"} strokeLinecap="round" filter="url(#pathGlow)" opacity={fireStyle ? 0.4 : 1} />
                {!fireStyle && <path d={pathD} fill="none" stroke={`${theme.pathColor}50`} strokeWidth="0.5" strokeLinecap="round" strokeDasharray="1.5,3" />}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Path name labels — Forest/Wind region only */}
      {isWindRegion && edges.map((edge, i) => {
        const edgeKey = [Math.min(edge.from.id, edge.to.id), Math.max(edge.from.id, edge.to.id)].join("-");
        const label = WIND_EDGE_NAMES[edgeKey];
        if (!label) return null;

        const dx = edge.to.x - edge.from.x;
        const dy = edge.to.y - edge.from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / dist * 2;
        const perpY = dx / dist * 2;
        const cx = (edge.from.x + edge.to.x) / 2 + perpX * ((i % 3 === 0) ? 1 : (i % 3 === 1) ? -0.5 : 0.3);
        const cy = (edge.from.y + edge.to.y) / 2 + perpY * ((i % 3 === 0) ? 1 : (i % 3 === 1) ? -0.5 : 0.3);
        const bx = 0.25 * edge.from.x + 0.5 * cx + 0.25 * edge.to.x;
        const by = 0.25 * edge.from.y + 0.5 * cy + 0.25 * edge.to.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const flippedAngle = Math.abs(angle) > 90 ? angle + 180 : angle;

        return (
          <div
            key={`label-${edgeKey}`}
            className="absolute pointer-events-none"
            style={{
              left: `${bx}%`,
              top: `${by}%`,
              transform: `translate(-50%, -50%) rotate(${flippedAngle}deg)`,
              zIndex: 15,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "5px",
              color: "rgba(210, 195, 155, 0.75)",
              letterSpacing: "0.5px",
              textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)",
              display: "block",
            }}>
              {label}
            </span>
          </div>
        );
      })}

      {menuFadeOut.current && (
        <div className="absolute inset-0 z-[500] pointer-events-none">
          <BattleTransition direction="in" elementColor={elemColor} onComplete={() => {}} />
        </div>
      )}
      {!menuFadeOut.current && prevRegionRef.current !== player.currentRegion && (
        <div className="absolute inset-0 z-[500] pointer-events-none">
          <BattleTransition direction="out" elementColor={elemColor} onComplete={() => {}} />
        </div>
      )}

      {sortedNodes.map(node => {
        const Icon = NODE_ICONS[node.type] || Star;
        const isCleared = player.clearedNodes.includes(node.id);
        const accessible = canAccessNode(node);
        const isHovered = hoveredNode === node.id;
        const isCurrent = node.id === player.currentNode;
        const isBoss = node.type === "boss";
        const isHut = node.type === "hut";
        const isVillage = node.type === "village";

        const markerSize = isBoss ? "w-11 h-11" : (isHut || isVillage) ? "w-10 h-10" : "w-9 h-9";
        const iconSize = isBoss ? "w-5 h-5" : "w-4 h-4";

        const bgColor = (isHut || isVillage)
          ? "rgba(180, 140, 60, 0.35)"
          : isCleared
            ? "rgba(34, 197, 94, 0.25)"
            : accessible
              ? isBoss ? "rgba(250, 204, 21, 0.25)" : `${elemColor}30`
              : "rgba(55, 65, 81, 0.25)";

        const borderColor = (isHut || isVillage)
          ? "rgba(220, 180, 80, 0.8)"
          : isCleared
            ? "rgba(34, 197, 94, 0.7)"
            : accessible
              ? isBoss ? "rgba(250, 204, 21, 0.7)" : `${elemColor}90`
              : "rgba(55, 65, 81, 0.5)";

        const iconColor = (isHut || isVillage)
          ? "#dca840"
          : isCleared
            ? "#22c55e"
            : accessible
              ? isBoss ? "#facc15" : elemColor
              : "#374151";

        return (
          <button
            key={node.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-transform duration-200 ${isCurrent && !isMoving ? "cursor-pointer" : "cursor-default"}`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              zIndex: Math.floor(node.y) + 20,
              transform: `translate(-50%, -50%) ${isHovered && isCurrent ? "scale(1.15)" : "scale(1)"}`,
              pointerEvents: (node.type === "passage") ? "none" : (isCurrent ? "auto" : "none"),
            }}
            onClick={() => { if (node.type === "passage") return; playSfx('menuSelect'); handleNodeClick(node); }}
            onMouseEnter={() => { if (node.type === "passage") return; setHoveredNode(node.id); }}
            onMouseLeave={() => setHoveredNode(null)}
            disabled={!isCurrent || isMoving}
            data-testid={`button-node-${node.id}`}
          >
            {node.type === "boss" ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-2 h-10 mx-auto rounded-sm" style={{ backgroundColor: "#5a3a20", boxShadow: "1px 0 0 #3a2010" }} />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm"
                      style={{
                        backgroundColor: accessible ? "rgba(250, 204, 21, 0.25)" : "rgba(55, 65, 81, 0.25)",
                        border: `2px solid ${accessible ? "rgba(250, 204, 21, 0.7)" : "rgba(55, 65, 81, 0.5)"}`,
                        boxShadow: isHovered && accessible
                          ? "0 0 25px rgba(250, 204, 21, 0.5), 0 4px 12px rgba(0,0,0,0.4)"
                          : "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      <img src={bossBattleOverworldIcon} alt="Boss" style={{ width: 38, height: 38, imageRendering: "pixelated", objectFit: "contain", opacity: accessible ? 1 : 0.4 }} />
                    </div>
                    {accessible && !isCleared && (
                      <Flame className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-400 animate-pulse" />
                    )}
                  </div>
                </div>
                {isCleared && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center" style={{ boxShadow: "0 0 6px rgba(34, 197, 94, 0.5)" }}>
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            ) : node.type === "hut" ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className={`${markerSize} flex items-center justify-center backdrop-blur-sm`}
                    style={{
                      borderRadius: "10px",
                      backgroundColor: "rgba(0,0,0,0.15)",
                      border: `3px solid rgba(220,180,80,0.95)`,
                      boxShadow: isHovered || isCurrent
                        ? `0 0 20px rgba(220, 180, 80, 0.6), inset 0 0 8px rgba(220,180,80,0.1), 0 4px 12px rgba(0,0,0,0.4)`
                        : `0 2px 8px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <img src={hutOverworldIcon} alt="Hut" style={{ width: 34, height: 34, imageRendering: "pixelated", objectFit: "contain" }} />
                  </div>
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(220, 180, 80, 0.9)", boxShadow: "0 0 8px rgba(220, 180, 80, 0.6)" }}>
                      <Star className="w-2.5 h-2.5 text-yellow-900" fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>
            ) : isVillage ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className={`${markerSize} flex items-center justify-center backdrop-blur-sm`}
                    style={{
                      borderRadius: "10px",
                      backgroundColor: "rgba(0,0,0,0.15)",
                      border: `3px solid rgba(220,180,80,0.95)`,
                      boxShadow: isHovered || isCurrent
                        ? `0 0 22px rgba(220, 180, 80, 0.65), inset 0 0 8px rgba(220,180,80,0.1), 0 4px 12px rgba(0,0,0,0.4)`
                        : `0 2px 8px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <div style={{ fontSize: "18px", lineHeight: 1 }}>🏘️</div>
                    </div>
                  </div>
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(220, 180, 80, 0.9)", boxShadow: "0 0 8px rgba(220, 180, 80, 0.6)" }}>
                      <Star className="w-2.5 h-2.5 text-yellow-900" fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="mt-1 px-1.5 py-0.5 text-center" style={{
                  fontSize: "5px",
                  letterSpacing: "0.5px",
                  color: "rgba(220,180,80,0.95)",
                  background: "rgba(0,0,0,0.55)",
                  border: "1px solid rgba(220,180,80,0.4)",
                  whiteSpace: "nowrap",
                  maxWidth: "80px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {node.name.toUpperCase()}
                </div>
              </div>
            ) : node.type === "passage" ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className={`${markerSize} flex items-center justify-center backdrop-blur-sm`}
                    style={{
                      borderRadius: "10px",
                      backgroundColor: "rgba(0,0,0,0.15)",
                      border: `3px solid ${accessible ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)"}`,
                      boxShadow: isHovered && accessible
                        ? "0 0 20px rgba(255,255,255,0.5), inset 0 0 8px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.4)"
                        : "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>
              </div>
            ) : node.type === "shop" ? (
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{
                  backgroundColor: "#5a3a20",
                  border: "2px solid #8b6b4a",
                  boxShadow: isHovered && accessible ? `0 0 15px rgba(139, 107, 74, 0.5)` : "0 2px 6px rgba(0,0,0,0.3)",
                }}>
                  <ShoppingBag className="w-4 h-4 text-yellow-300" />
                </div>
              </div>
            ) : node.type === "rest" ? (
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  border: "2px solid rgba(34, 197, 94, 0.5)",
                  boxShadow: isHovered && accessible ? "0 0 15px rgba(34, 197, 94, 0.4)" : "0 2px 6px rgba(0,0,0,0.3)",
                }}>
                  <Tent className="w-4 h-4 text-green-400" />
                </div>
                <div className="absolute -bottom-1 w-6 h-1 rounded-full bg-green-400/20" />
              </div>
            ) : node.type === "shaman" ? (
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                  backgroundColor: "rgba(168, 85, 247, 0.2)",
                  border: "2px solid rgba(168, 85, 247, 0.5)",
                  boxShadow: isHovered && accessible ? "0 0 15px rgba(168, 85, 247, 0.5)" : "0 2px 6px rgba(0,0,0,0.3)",
                }}>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="absolute -bottom-1 w-6 h-1 rounded-full bg-purple-400/20" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className={`${markerSize} rounded-lg flex items-center justify-center`} style={{
                  backgroundColor: bgColor,
                  border: `2px solid ${borderColor}`,
                  boxShadow: isHovered && accessible ? `0 0 15px ${borderColor}` : "0 2px 6px rgba(0,0,0,0.3)",
                }}>
                  <Icon className={iconSize} style={{ color: iconColor }} />
                </div>
              </div>
            )}

            {node.type !== "passage" && (
              <span className={`block text-[8px] mt-1 font-medium tracking-wide transition-opacity duration-200 whitespace-nowrap ${isHovered && accessible ? "opacity-100" : "opacity-0"}`}
                style={{ color: iconColor, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                {node.name}
              </span>
            )}
          </button>
        );
      })}

      {!isMoving && (() => {
        const currentNode = region.nodes.find(n => n.id === player.currentNode);
        if (!currentNode) return null;
        return currentNode.connections.map(connId => {
          const targetNode = region.nodes.find(n => n.id === connId);
          if (!targetNode || !canAccessNode(targetNode)) return null;
          const dx = targetNode.x - currentNode.x;
          const dy = targetNode.y - currentNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ndx = dx / dist;
          const ndy = dy / dist;
          const arrowDist = ndy < -0.3 ? 9 : 6.5;
          const arrowX = charPos.x + ndx * arrowDist;
          const arrowY = charPos.y + ndy * arrowDist;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <button
              key={`arrow-${connId}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center cursor-pointer group hover:scale-125 transition-transform duration-150"
              style={{
                left: `${arrowX}%`,
                top: `${arrowY}%`,
                zIndex: 999,
              }}
              onClick={() => { playSfx('menuSelect'); handleArrowClick(targetNode); }}
              data-testid={`arrow-to-node-${connId}`}
            >
              <svg
                width="20"
                height="16"
                viewBox="0 0 20 16"
                fill="none"
                className="transition-all duration-150 [filter:drop-shadow(0_0_3px_rgba(255,255,255,0.6))] group-hover:[filter:drop-shadow(0_0_10px_rgba(251,191,36,1))_drop-shadow(0_0_4px_rgba(245,158,11,1))]"
                style={{ transform: `rotate(${angle}deg)`, animation: "pulse 2s ease-in-out infinite" }}
              >
                <polygon
                  points="16,8 0,0 0,16"
                  className="fill-white group-hover:fill-yellow-400 transition-colors duration-150"
                  strokeWidth="0"
                />
              </svg>
            </button>
          );
        });
      })()}

      {(() => {
        const spriteConfig = OVERWORLD_SPRITES[player.spriteId || "samurai"] || OVERWORLD_SPRITES.samurai;
        const activeSprite = isMoving ? spriteConfig.run : spriteConfig.idle;
        return (
          <div
            className="absolute transition-none pointer-events-none"
            style={{
              left: `${charPos.x}%`,
              top: `${charPos.y}%`,
              transform: "translate(-50%, -85%)",
              zIndex: Math.floor(charPos.y) + 50,
            }}
            data-testid="img-overworld-character"
          >
            <div className="relative">
              <SpriteAnimator
                spriteSheet={activeSprite.sheet}
                frameWidth={activeSprite.frameWidth}
                frameHeight={activeSprite.frameHeight}
                totalFrames={activeSprite.totalFrames}
                fps={activeSprite.fps}
                scale={spriteConfig.scale}
                loop={true}
                flipX={!facingRight}
                preloadSheets={[spriteConfig.idle.sheet, spriteConfig.run.sheet]}
                colorMap={playerColorMap}
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full blur-sm"
                style={{ backgroundColor: COLOR_MAP[player.energyColor] + "40" }}
              />
            </div>
          </div>
        );
      })()}
      </div>

      {!menuOpen && (
        <button
          className="absolute top-3 left-3 z-[200] flex items-center justify-center w-10 h-10 transition-all hover:scale-110 active:scale-95"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
            border: `3px solid #c9a44a`,
            boxShadow: `0 0 15px #c9a44a40, 0 0 40px #c9a44a15`,
            imageRendering: "pixelated" as any,
          }}
          onClick={() => { playSfx('menuSelect'); setMenuOpen(true); }}
          data-testid="button-overworld-menu"
        >
          <Menu className="w-5 h-5" style={{ color: "#c9a44a" }} />
        </button>
      )}

      {menuOpen && (
          <GameMenuPanel
            player={player}
            onClose={() => { setMenuOpen(false); }}
            onEquip={onEquip}
            onUnequip={onUnequip}
            onUseItem={onUseItem}
            onSave={onSave}
            onExitToMenu={onExitToMenu}
            textSpeed={textSpeed}
            musicVolume={musicVolume}
            sfxVolume={sfxVolume}
            onTextSpeedChange={onTextSpeedChange}
            onMusicVolumeChange={onMusicVolumeChange}
            onSfxVolumeChange={onSfxVolumeChange}
            regionName={region.name}
            regionTheme={region.theme}
            tier={tier}
          />
        )}

      {hoveredNode !== null && (() => {
        const node = region.nodes.find(n => n.id === hoveredNode);
        if (!node || !canAccessNode(node)) return null;
        const z = CAMERA_ZOOM;
        const rawTx = 50 - charPos.x * z;
        const rawTy = 50 - charPos.y * z;
        const minOff = -(z - 1) * 100;
        const camTx = Math.max(minOff, Math.min(0, rawTx));
        const camTy = Math.max(minOff, Math.min(0, rawTy));
        const screenX = node.x * z + camTx;
        const screenY = (node.y - 8) * z + camTy;
        return (
          <div className="absolute z-40 pointer-events-none" style={{
            left: `${screenX}%`,
            top: `${screenY}%`,
            transform: "translateX(-50%)",
          }}>
            <Card className="px-2.5 py-1.5 bg-black/80 border-white/10 backdrop-blur-sm" style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.5)" }}>
              <p className="text-[11px] font-semibold text-white whitespace-nowrap">{node.name}</p>
              <p className="text-[9px] capitalize whitespace-nowrap" style={{ color: ELEMENT_COLORS[region.theme] + "aa" }}>
                {node.type === "hut" ? "Base Camp" : node.type === "passage" ? "Area" : node.type}{player.clearedNodes.includes(node.id) ? " - Cleared" : ""}
              </p>
            </Card>
          </div>
        );
      })()}

      {devMenuOpen && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.72)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDevMenuOpen(false); }}
        >
          <div
            className="rounded-xl border border-yellow-400/40 shadow-2xl p-6 flex flex-col gap-4"
            style={{ background: "#0f0f1a", minWidth: 320, maxWidth: 380 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-yellow-400 font-bold text-base tracking-widest uppercase" style={{ fontFamily: "monospace", letterSpacing: "0.15em" }}>
                ⚙ Developer Menu
              </span>
              <button
                data-testid="dev-menu-close"
                onClick={() => setDevMenuOpen(false)}
                className="text-white/40 hover:text-white text-lg leading-none px-1"
              >✕</button>
            </div>

            <div className="border-t border-white/10 pt-3 flex flex-col gap-1">
              <span className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Player Level</span>
              <div className="flex items-center gap-2">
                <button
                  data-testid="dev-level-minus"
                  onClick={() => setDevLevelInput(v => Math.max(1, v - 1))}
                  className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center"
                >−</button>
                <input
                  data-testid="dev-level-input"
                  type="number"
                  min={1}
                  max={30}
                  value={devLevelInput}
                  onChange={e => setDevLevelInput(Math.max(1, Math.min(30, Number(e.target.value))))}
                  className="flex-1 text-center bg-black/40 border border-white/20 rounded text-white text-sm py-1 outline-none focus:border-yellow-400/60"
                  style={{ fontFamily: "monospace" }}
                />
                <button
                  data-testid="dev-level-plus"
                  onClick={() => setDevLevelInput(v => Math.min(30, v + 1))}
                  className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center"
                >+</button>
                <button
                  data-testid="dev-level-set"
                  onClick={() => { onDevSetLevel?.(devLevelInput); }}
                  className="px-3 py-1 rounded text-xs font-bold text-black"
                  style={{ background: "#facc15" }}
                >SET</button>
              </div>
              <span className="text-white/30 text-[9px] mt-0.5">Current: Lv {player.level}</span>
            </div>

            <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
              <button
                data-testid="dev-unlock-spells"
                onClick={() => { onDevUnlockSpells?.(); }}
                className="w-full py-2 rounded-lg text-sm font-bold text-black"
                style={{ background: "#818cf8" }}
              >
                Unlock All Magic
              </button>

              <button
                data-testid="dev-invincibility"
                onClick={() => { onDevToggleInvincibility?.(); }}
                className="w-full py-2 rounded-lg text-sm font-bold border"
                style={devInvincible
                  ? { background: "#22c55e", color: "#000", borderColor: "#16a34a" }
                  : { background: "transparent", color: "#22c55e", borderColor: "#22c55e80" }}
              >
                {devInvincible ? "✓ Invincibility ON" : "Invincibility OFF"}
              </button>

              <button
                data-testid="dev-teleport-boss"
                onClick={() => { onDevTeleportBoss?.(); setDevMenuOpen(false); }}
                className="w-full py-2 rounded-lg text-sm font-bold text-black"
                style={{ background: "#f87171" }}
              >
                Teleport to Boss
              </button>
            </div>

            <p className="text-white/20 text-[9px] text-center mt-1" style={{ fontFamily: "monospace" }}>Press D to toggle • ESC to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
