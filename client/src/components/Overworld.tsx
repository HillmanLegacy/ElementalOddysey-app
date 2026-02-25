import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ParticleCanvas from "./ParticleCanvas";
import LavaOverworldBg from "./LavaOverworldBg";
import SpriteAnimator from "./SpriteAnimator";
import BattleTransition from "./BattleTransition";
import type { PlayerCharacter, OverworldNode } from "@shared/schema";
import { REGIONS, ELEMENT_COLORS, COLOR_MAP } from "@/lib/gameData";
import { playSfx } from "@/lib/sfx";
import { Swords, ShoppingBag, Tent, Star, Crown, Heart, Droplets, Coins, ChevronLeft, ChevronRight, Check, Flag, Flame, X, Sparkles, Home, Shield, Package, Lock, Menu, Zap } from "lucide-react";
import { groupConsumables } from "@/lib/utils";
import { isRegionUnlocked, getRegionTier, getRegionForTier } from "@/lib/gameData";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import samuraiRun from "@/assets/images/samurai-run.png";
import knightIdle from "@/assets/images/knight-idle-4f.png";
import knightRun from "@/assets/images/knight-run.png";
import baskenIdle from "@/assets/images/basken-idle.png";
import baskenRun from "@/assets/images/basken-run.png";
import bgEmberPlains from "@/assets/images/bg-ember-plains.png";

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
    idle: { sheet: knightIdle, frameWidth: 86, frameHeight: 49, totalFrames: 4, fps: 8 },
    run: { sheet: knightRun, frameWidth: 86, frameHeight: 49, totalFrames: 6, fps: 14 },
    scale: 3,
  },
  basken: {
    idle: { sheet: baskenIdle, frameWidth: 56, frameHeight: 56, totalFrames: 5, fps: 8 },
    run: { sheet: baskenRun, frameWidth: 56, frameHeight: 56, totalFrames: 6, fps: 14 },
    scale: 3,
  },
};

const NODE_ICONS: Record<string, any> = {
  battle: Swords,
  shop: ShoppingBag,
  rest: Tent,
  event: Star,
  boss: Crown,
  shaman: Sparkles,
  hut: Home,
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
  onRegionChange: (regionId: number) => void;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: "weapon" | "armor" | "accessory") => void;
  onUseItem: (itemId: string, targetPartyIndex?: number) => void;
}

export default function Overworld({ player, onMoveToNode, onNodeSelect, onShopOpen, onRest, onShamanVisit, onHutEnter, onRegionChange, onEquip, onUnequip, onUseItem }: OverworldProps) {
  const tier = getRegionTier(player.currentRegion, player.regionBossDefeats || {});
  const region = getRegionForTier(player.currentRegion, tier);
  const theme = REGION_THEMES[region.theme] || REGION_THEMES.Fire;
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTab, setMenuTab] = useState<"party" | "items" | "gear">("party");
  const [targetingItemId, setTargetingItemId] = useState<string | null>(null);
  const [charPos, setCharPos] = useState<{ x: number; y: number }>(() => {
    const currentNode = region.nodes.find(n => n.id === player.currentNode);
    return currentNode ? getNodePosition(currentNode) : { x: 8, y: 82 };
  });
  const [isMoving, setIsMoving] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const animFrameRef = useRef<number>(0);
  const moveCallbackRef = useRef<(() => void) | null>(null);
  const charPosRef = useRef(charPos);

  useEffect(() => { charPosRef.current = charPos; }, [charPos]);

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

  const allBattlesCleared = useMemo(() => {
    const battleNodes = region.nodes.filter(n => n.type === "battle");
    return battleNodes.every(n => player.clearedNodes.includes(n.id));
  }, [region.nodes, player.clearedNodes]);

  const canAccessNode = (node: OverworldNode): boolean => {
    if (node.id === player.currentNode) return true;
    const currentNodeData = region.nodes.find(n => n.id === player.currentNode);
    if (!currentNodeData) {
      return node.id === region.nodes[0].id;
    }
    if (node.type === "boss" && !allBattlesCleared) return false;
    if (!isAdjacentToCurrentNode(node)) return false;
    if (
      (currentNodeData.type === "battle" || currentNodeData.type === "boss") &&
      !player.clearedNodes.includes(currentNodeData.id)
    ) {
      const targetCleared = player.clearedNodes.includes(node.id);
      const targetIsSafe = node.type === "hut" || node.type === "shop" || node.type === "rest" || node.type === "shaman";
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
    const targetPos = getNodePosition(targetNode);
    setFacingRight(targetPos.x > charPos.x);
    moveCharacterTo(targetPos, () => {
      onMoveToNode(targetNode.id);
      if (
        targetNode.type === "battle" &&
        player.clearedNodes.includes(targetNode.id) &&
        Math.random() < 0.3
      ) {
        setTimeout(() => {
          onNodeSelect(targetNode.id, targetPos);
        }, 150);
      }
    });
  };

  const triggerNodeAction = (node: OverworldNode) => {
    if (node.type === "hut") {
      onHutEnter();
    } else if (node.type === "battle" || node.type === "boss") {
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

  const REGION_BACKGROUNDS: Record<string, string | null> = {
    Fire: bgEmberPlains,
    Ice: null,
    Shadow: null,
    Earth: null,
  };

  const bgImage = REGION_BACKGROUNDS[region.theme];
  const isFireRegion = region.theme === "Fire";
  const elemColor = ELEMENT_COLORS[region.theme];

  return (
    <div className="relative w-full h-full overflow-hidden" data-testid="overworld-screen">
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: "0 0",
          transform: cameraTransform,
          transition: "transform 0.4s ease-out",
          willChange: "transform",
        }}
      >
      {isFireRegion ? (
        <LavaOverworldBg nodes={region.nodes} />
      ) : (
        <div className="absolute inset-0" style={{ filter: "contrast(1.15) saturate(1.2)" }}>
          <div className="absolute inset-0" style={{
            background: `linear-gradient(180deg, ${theme.sky[0]} 0%, ${theme.sky[1]} 15%, ${theme.sky[2]} 30%, ${theme.sky[3]} 55%, ${theme.sky[4]} 80%)`,
          }} />
          <div className="absolute inset-0" style={{ top: "15%" }}>
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

      <ParticleCanvas
        colors={regionColors}
        count={region.theme === "Fire" ? 40 : region.theme === "Ice" ? 25 : region.theme === "Shadow" ? 30 : 25}
        speed={region.theme === "Fire" ? 0.5 : region.theme === "Ice" ? 0.2 : region.theme === "Shadow" ? 0.3 : 0.25}
        style={region.theme === "Fire" ? "rain" : region.theme === "Ice" ? "ambient" : region.theme === "Shadow" ? "swirl" : "ambient"}
      />

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

        const markerSize = isBoss ? "w-11 h-11" : isHut ? "w-10 h-10" : "w-9 h-9";
        const iconSize = isBoss ? "w-5 h-5" : "w-4 h-4";

        const bgColor = isHut
          ? "rgba(180, 140, 60, 0.35)"
          : isCleared
            ? "rgba(34, 197, 94, 0.25)"
            : accessible
              ? isBoss ? "rgba(250, 204, 21, 0.25)" : `${elemColor}30`
              : "rgba(55, 65, 81, 0.25)";

        const borderColor = isHut
          ? "rgba(220, 180, 80, 0.8)"
          : isCleared
            ? "rgba(34, 197, 94, 0.7)"
            : accessible
              ? isBoss ? "rgba(250, 204, 21, 0.7)" : `${elemColor}90`
              : "rgba(55, 65, 81, 0.5)";

        const iconColor = isHut
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
              pointerEvents: isCurrent ? "auto" : "none",
            }}
            onClick={() => { playSfx('menuSelect'); handleNodeClick(node); }}
            onMouseEnter={() => setHoveredNode(node.id)}
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
                      {!allBattlesCleared && !isCleared ? (
                        <Lock className="w-5 h-5" style={{ color: "#6b7280" }} />
                      ) : (
                        <Crown className="w-6 h-6" style={{ color: accessible ? "#facc15" : "#374151" }} />
                      )}
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
                  <div className={`${markerSize} rounded-lg flex items-center justify-center backdrop-blur-sm`}
                    style={{
                      backgroundColor: bgColor,
                      border: `2.5px solid ${borderColor}`,
                      boxShadow: isHovered || isCurrent
                        ? `0 0 20px rgba(220, 180, 80, 0.5), 0 4px 12px rgba(0,0,0,0.4)`
                        : `0 2px 8px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <Home className={iconSize} style={{ color: iconColor }} />
                  </div>
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(220, 180, 80, 0.9)", boxShadow: "0 0 8px rgba(220, 180, 80, 0.6)" }}>
                      <Star className="w-2.5 h-2.5 text-yellow-900" fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>
            ) : node.type === "battle" ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-1.5 h-7 mx-auto rounded-sm" style={{ backgroundColor: "#5a3a20" }} />
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
                    <Flag className="w-5 h-5" style={{ color: isCleared ? "#22c55e" : accessible ? elemColor : "#374151" }} />
                  </div>
                  <div className={`${markerSize} rounded-lg flex items-center justify-center backdrop-blur-sm mt-0.5 transition-all duration-200`}
                    style={{
                      backgroundColor: bgColor,
                      border: `2px solid ${borderColor}`,
                      boxShadow: isHovered && accessible
                        ? `0 0 20px ${borderColor}, 0 4px 12px rgba(0,0,0,0.4)`
                        : `0 2px 8px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <Swords className={iconSize} style={{ color: iconColor }} />
                  </div>
                </div>
                {isCleared && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center" style={{ boxShadow: "0 0 6px rgba(34, 197, 94, 0.5)" }}>
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
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

            <span className={`block text-[8px] mt-1 font-medium tracking-wide transition-opacity duration-200 whitespace-nowrap ${isHovered && accessible ? "opacity-100" : "opacity-0"}`}
              style={{ color: iconColor, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
            >
              {node.name}
            </span>
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
              className="absolute transform -translate-x-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center"
              style={{
                left: `${arrowX}%`,
                top: `${arrowY}%`,
                zIndex: 80,
              }}
              onClick={() => { playSfx('menuSelect'); handleArrowClick(targetNode); }}
              data-testid={`arrow-to-node-${connId}`}
            >
              <svg
                width="20"
                height="16"
                viewBox="0 0 20 16"
                fill="none"
                style={{
                  transform: `rotate(${angle}deg)`,
                  animation: "pulse 2s ease-in-out infinite",
                  filter: `drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))`,
                }}
              >
                <polygon
                  points="16,8 0,0 0,16"
                  fill="white"
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
          onClick={() => { playSfx('menuSelect'); setMenuOpen(true); setMenuTab("party"); }}
          data-testid="button-overworld-menu"
        >
          <Menu className="w-5 h-5" style={{ color: "#c9a44a" }} />
        </button>
      )}

      {menuOpen && (
        <div className="absolute top-3 left-3 z-[200]" style={{ fontFamily: "'Press Start 2P', cursive", imageRendering: "pixelated" as any }}>
          <div
            className="relative overflow-hidden"
            style={{
              width: "280px",
              maxHeight: "580px",
              background: "linear-gradient(180deg, #0a0808f0 0%, #151010f5 100%)",
              border: `3px solid #c9a44a`,
              boxShadow: `0 0 20px #c9a44a40, 0 0 60px #c9a44a15, inset 0 0 30px rgba(0,0,0,0.5)`,
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, #c9a44a08 3px, #c9a44a08 4px)`,
              pointerEvents: "none",
            }} />

            <div className="relative px-4 pt-3 pb-2 flex items-center justify-between" style={{ background: "#0d0b0bf0", borderBottom: `3px solid #c9a44a` }}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4" style={{ color: "#fbbf24" }} />
                  <span style={{ fontSize: "10px", color: "#fbbf24", letterSpacing: "1px" }}>{player.gold}</span>
                </div>
                <span style={{ fontSize: "10px", color: "#c9a44a60" }}>|</span>
                <span style={{ fontSize: "10px", color: ELEMENT_COLORS[region.theme], letterSpacing: "1px" }}>{region.name}</span>
                <div className="flex items-center gap-0.5 ml-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < tier ? "#4ade80" : "#ffffff20" }} />
                  ))}
                </div>
              </div>
              <button
                className="flex items-center justify-center w-6 h-6 transition-all hover:scale-110"
                style={{ border: `1px solid #c9a44a50`, background: "transparent" }}
                onClick={() => { playSfx('menuSelect'); setMenuOpen(false); setTargetingItemId(null); }}
                data-testid="button-close-overworld-menu"
              >
                <X className="w-3 h-3" style={{ color: "#c9a44a" }} />
              </button>
            </div>

            <div className="relative flex gap-0 px-4 pt-2">
              {(["party", "items", "gear"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { playSfx('menuSelect'); setMenuTab(tab); setTargetingItemId(null); }}
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "8px",
                    padding: "6px 12px",
                    border: `1px solid #c9a44a`,
                    borderBottom: menuTab === tab ? "none" : `1px solid #c9a44a`,
                    background: menuTab === tab ? "#c9a44a" : "transparent",
                    color: menuTab === tab ? "#0a0808" : "#c9a44a80",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                  data-testid={`tab-overworld-${tab}`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative px-4 py-3" style={{ maxHeight: "440px", overflowY: "auto" }}>
              {menuTab === "party" && (
                <div className="space-y-2">
                  {[{ name: player.name, stats: player.stats, level: player.level, element: player.element, xp: player.xp, xpToNext: player.xpToNext },
                    ...player.party.map(m => ({ name: m.name, stats: m.stats, level: m.level, element: m.element, xp: m.xp || 0, xpToNext: m.xpToNext || 100 }))
                  ].map((member, idx) => (
                    <div key={idx} style={{ padding: "8px 10px", background: "#0d0b0bf0", border: `1px solid #c9a44a30` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>{member.name}</span>
                          <span style={{ fontSize: "8px", color: "#c9a44a60" }}>Lv.{member.level}</span>
                        </div>
                        <span style={{ fontSize: "8px", color: ELEMENT_COLORS[member.element] || "#c9a44a" }}>{member.element}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-3 h-3 text-red-500 flex-shrink-0" />
                          <div className="flex-1 h-2.5 relative" style={{ background: "#1a0808", border: "1px solid #ef444440" }}>
                            <div className="absolute inset-0" style={{ width: `${(member.stats.hp / member.stats.maxHp) * 100}%`, background: "linear-gradient(90deg, #dc2626, #ef4444)", transition: "width 0.3s" }} />
                          </div>
                          <span style={{ fontSize: "7px", color: "#fca5a5", minWidth: "48px", textAlign: "right" }}>{member.stats.hp}/{member.stats.maxHp}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Droplets className="w-3 h-3 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 h-2.5 relative" style={{ background: "#080818", border: "1px solid #3b82f640" }}>
                            <div className="absolute inset-0" style={{ width: `${(member.stats.mp / member.stats.maxMp) * 100}%`, background: "linear-gradient(90deg, #2563eb, #3b82f6)", transition: "width 0.3s" }} />
                          </div>
                          <span style={{ fontSize: "7px", color: "#93c5fd", minWidth: "48px", textAlign: "right" }}>{member.stats.mp}/{member.stats.maxMp}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                          <div className="flex-1 h-2.5 relative" style={{ background: "#181808", border: "1px solid #eab30840" }}>
                            <div className="absolute inset-0" style={{ width: `${(member.xp / member.xpToNext) * 100}%`, background: "linear-gradient(90deg, #ca8a04, #eab308)", transition: "width 0.3s" }} />
                          </div>
                          <span style={{ fontSize: "7px", color: "#fde68a", minWidth: "48px", textAlign: "right" }}>{member.xp}/{member.xpToNext}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {menuTab === "items" && (() => {
                const consumables = player.inventory.filter(i => i.type === "consumable");
                return (
                  <div className="space-y-1.5">
                    {consumables.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <p style={{ fontSize: "9px", color: "#c9a44a50" }}>No consumable items</p>
                      </div>
                    ) : (
                      groupConsumables(consumables).map(({ item, count, ids }) => {
                        const canUseOnPlayer = item.effect.type === "heal" && (
                          (item.effect.stat === "hp" && player.stats.hp < player.stats.maxHp) ||
                          (item.effect.stat === "mp" && player.stats.mp < player.stats.maxMp)
                        );
                        const canUseOnAny = canUseOnPlayer || player.party.some(m =>
                          item.effect.type === "heal" && (
                            (item.effect.stat === "hp" && m.stats.hp < m.stats.maxHp) ||
                            (item.effect.stat === "mp" && m.stats.mp < m.stats.maxMp)
                          )
                        );
                        const isTargeting = targetingItemId === item.name;
                        return (
                          <div key={item.name} style={{ padding: "8px 10px", background: "#0d0b0bf0", border: `1px solid #c9a44a30` }}>
                            <div className="flex items-center justify-between gap-2">
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>
                                  {item.name} <span style={{ color: "#c9a44acc" }}>x{count}</span>
                                </p>
                                <p style={{ fontSize: "7px", color: "#c9a44a60", marginTop: "2px" }}>{item.description}</p>
                              </div>
                              <button
                                onClick={() => {
                                  playSfx('menuSelect');
                                  if (player.party.length > 0) {
                                    setTargetingItemId(isTargeting ? null : item.name);
                                  } else {
                                    onUseItem(ids[0]);
                                  }
                                }}
                                disabled={!canUseOnAny}
                                style={{
                                  fontFamily: "'Press Start 2P', cursive",
                                  fontSize: "8px",
                                  padding: "4px 8px",
                                  border: `1px solid ${isTargeting ? "#e8c030" : "#c9a44a"}60`,
                                  background: isTargeting ? "#e8c03020" : "transparent",
                                  color: isTargeting ? "#e8c030" : "#c9a44a",
                                  cursor: canUseOnAny ? "pointer" : "default",
                                  opacity: canUseOnAny ? 1 : 0.4,
                                }}
                              >
                                {isTargeting ? "CANCEL" : "USE"}
                              </button>
                            </div>
                            {isTargeting && (
                              <div style={{ marginTop: "4px", paddingTop: "4px", borderTop: `1px solid #c9a44a20` }}>
                                <p style={{ fontSize: "7px", color: "#c9a44a50", marginBottom: "3px" }}>Select target:</p>
                                <button
                                  disabled={!canUseOnPlayer}
                                  onClick={() => { playSfx('menuSelect'); onUseItem(ids[0]); setTargetingItemId(null); }}
                                  style={{
                                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "3px 6px", background: "#0a080820", border: `1px solid #c9a44a15`,
                                    cursor: canUseOnPlayer ? "pointer" : "default", opacity: canUseOnPlayer ? 1 : 0.3,
                                    marginBottom: "2px", fontFamily: "'Press Start 2P', cursive",
                                  }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span style={{ fontSize: "7px", color: "#c9a44a" }}>{player.name}</span>
                                    <span style={{ fontSize: "6px", color: "#c9a44a50" }}>(You)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {item.effect.stat === "hp" && (
                                      <div className="flex items-center gap-1">
                                        <Heart style={{ width: 8, height: 8, color: "#ef4444" }} />
                                        <span style={{ fontSize: "6px", color: player.stats.hp < player.stats.maxHp ? "#fca5a5" : "#86efac" }}>
                                          {player.stats.hp}/{player.stats.maxHp}
                                        </span>
                                      </div>
                                    )}
                                    {item.effect.stat === "mp" && (
                                      <div className="flex items-center gap-1">
                                        <Droplets style={{ width: 8, height: 8, color: "#60a5fa" }} />
                                        <span style={{ fontSize: "6px", color: player.stats.mp < player.stats.maxMp ? "#93c5fd" : "#86efac" }}>
                                          {player.stats.mp}/{player.stats.maxMp}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </button>
                                {player.party.map((member, idx) => {
                                  const canUseOnMember = item.effect.type === "heal" && (
                                    (item.effect.stat === "hp" && member.stats.hp < member.stats.maxHp) ||
                                    (item.effect.stat === "mp" && member.stats.mp < member.stats.maxMp)
                                  );
                                  return (
                                    <button
                                      key={member.id}
                                      disabled={!canUseOnMember}
                                      onClick={() => { playSfx('menuSelect'); onUseItem(ids[0], idx); setTargetingItemId(null); }}
                                      style={{
                                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                        padding: "3px 6px", background: "#0a080820", border: `1px solid #c9a44a15`,
                                        cursor: canUseOnMember ? "pointer" : "default", opacity: canUseOnMember ? 1 : 0.3,
                                        marginBottom: "2px", fontFamily: "'Press Start 2P', cursive",
                                      }}
                                    >
                                      <span style={{ fontSize: "7px", color: "#e8e0d0" }}>{member.name}</span>
                                      <div className="flex items-center gap-1.5">
                                        {item.effect.stat === "hp" && (
                                          <div className="flex items-center gap-1">
                                            <Heart style={{ width: 8, height: 8, color: "#ef4444" }} />
                                            <span style={{ fontSize: "6px", color: member.stats.hp < member.stats.maxHp ? "#fca5a5" : "#86efac" }}>
                                              {member.stats.hp}/{member.stats.maxHp}
                                            </span>
                                          </div>
                                        )}
                                        {item.effect.stat === "mp" && (
                                          <div className="flex items-center gap-1">
                                            <Droplets style={{ width: 8, height: 8, color: "#60a5fa" }} />
                                            <span style={{ fontSize: "6px", color: member.stats.mp < member.stats.maxMp ? "#93c5fd" : "#86efac" }}>
                                              {member.stats.mp}/{member.stats.maxMp}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })()}

              {menuTab === "gear" && (() => {
                const equipables = player.inventory.filter(i => i.type === "weapon" || i.type === "armor" || i.type === "accessory");
                return (
                  <div className="space-y-1.5">
                    <p style={{ fontSize: "8px", color: "#c9a44a60", textTransform: "uppercase", letterSpacing: "1px" }}>Equipped</p>
                    {(["weapon", "armor", "accessory"] as const).map(slot => {
                      const item = player.equipment[slot];
                      return (
                        <div key={slot} style={{ padding: "8px 10px", background: "#0d0b0bf0", border: `1px solid #c9a44a30` }}>
                          <p style={{ fontSize: "7px", color: "#c9a44a60", textTransform: "uppercase", letterSpacing: "1px" }}>{slot}</p>
                          {item ? (
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>{item.name}</p>
                                <p style={{ fontSize: "7px", color: "#c9a44a60", marginTop: "2px" }}>{item.description}</p>
                              </div>
                              <button
                                onClick={() => { playSfx('menuSelect'); onUnequip(slot); }}
                                style={{
                                  fontFamily: "'Press Start 2P', cursive", fontSize: "7px", padding: "4px 8px",
                                  border: `1px solid #c9a44a60`, background: "transparent", color: "#c9a44a", cursor: "pointer",
                                }}
                              >
                                UNEQUIP
                              </button>
                            </div>
                          ) : (
                            <p style={{ fontSize: "8px", color: "#c9a44a40", fontStyle: "italic", marginTop: "2px" }}>Empty</p>
                          )}
                        </div>
                      );
                    })}
                    {equipables.length > 0 && (
                      <>
                        <div style={{ borderTop: `1px solid #c9a44a20`, marginTop: "6px", paddingTop: "6px" }}>
                          <p style={{ fontSize: "8px", color: "#c9a44a60", textTransform: "uppercase", letterSpacing: "1px" }}>Unequipped</p>
                        </div>
                        {equipables.map(item => (
                          <div key={item.id} style={{ padding: "8px 10px", background: "#0d0b0bf0", border: `1px solid #c9a44a30` }}>
                            <div className="flex items-center justify-between gap-2">
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="flex items-center gap-1.5">
                                  <p style={{ fontSize: "9px", color: "#e8e0d0", letterSpacing: "1px" }}>{item.name}</p>
                                  <span style={{ fontSize: "6px", padding: "1px 4px", border: `1px solid #c9a44a30`, color: "#c9a44a80", textTransform: "capitalize" }}>{item.type}</span>
                                </div>
                                <p style={{ fontSize: "7px", color: "#c9a44a60", marginTop: "2px" }}>{item.description}</p>
                              </div>
                              <button
                                onClick={() => { playSfx('menuSelect'); onEquip(item.id); }}
                                style={{
                                  fontFamily: "'Press Start 2P', cursive", fontSize: "7px", padding: "4px 8px",
                                  border: `1px solid #c9a44a60`, background: "transparent", color: "#c9a44a", cursor: "pointer",
                                }}
                              >
                                EQUIP
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="relative h-1" style={{ background: `linear-gradient(90deg, transparent, #c9a44a40, transparent)` }} />
          </div>
        </div>
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
                {node.type === "hut" ? "Base Camp" : node.type}{player.clearedNodes.includes(node.id) ? " - Cleared" : ""}
              </p>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
