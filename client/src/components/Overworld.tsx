import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ParticleCanvas from "./ParticleCanvas";
import SpriteAnimator from "./SpriteAnimator";
import type { PlayerCharacter, OverworldNode } from "@shared/schema";
import { REGIONS, ELEMENT_COLORS, COLOR_MAP } from "@/lib/gameData";
import { Swords, ShoppingBag, Tent, Star, Crown, Heart, Droplets, Gem, Backpack, Save, ChevronLeft, ChevronRight, Check, Flag, Flame, Menu, X, Users, Sparkles, Home, Shield, Package, Moon, Lock } from "lucide-react";
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
  onNodeSelect: (nodeId: number) => void;
  onShopOpen: (nodeId: number) => void;
  onRest: (nodeId: number) => void;
  onShamanVisit: (nodeId: number) => void;
  onInventory: () => void;
  onPartyManage: () => void;
  onSave: () => void;
  onRegionChange: (regionId: number) => void;
}

export default function Overworld({ player, onNodeSelect, onShopOpen, onRest, onShamanVisit, onInventory, onPartyManage, onSave, onRegionChange }: OverworldProps) {
  const tier = getRegionTier(player.currentRegion, player.regionBossDefeats || {});
  const region = getRegionForTier(player.currentRegion, tier);
  const theme = REGION_THEMES[region.theme] || REGION_THEMES.Fire;
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hutMenuOpen, setHutMenuOpen] = useState(false);
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

  useEffect(() => {
    if (prevRegionRef.current !== player.currentRegion) {
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
      return;
    }

    if (prevNodeRef.current !== player.currentNode) {
      const targetNode = region.nodes.find(n => n.id === player.currentNode);
      if (targetNode) {
        moveCharacterTo(getNodePosition(targetNode), () => {});
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
    return isAdjacentToCurrentNode(node);
  };

  const handleNodeClick = (node: OverworldNode) => {
    if (!canAccessNode(node) || isMoving) return;

    if (node.id === player.currentNode) {
      triggerNodeAction(node);
      return;
    }

    const targetPos = getNodePosition(node);
    setFacingRight(targetPos.x > charPos.x);

    moveCharacterTo(targetPos, () => {
      if (node.type === "hut") {
        setHutMenuOpen(true);
      } else {
        triggerNodeAction(node);
      }
    });
  };

  const triggerNodeAction = (node: OverworldNode) => {
    if (node.type === "hut") {
      setHutMenuOpen(true);
    } else if (node.type === "battle" || node.type === "boss") {
      onNodeSelect(node.id);
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
    <div className="relative w-full h-screen overflow-hidden" data-testid="overworld-screen">
      {bgImage ? (
        <div className="absolute inset-0" style={{ filter: "contrast(1.15) saturate(1.2)" }}>
          <img src={bgImage} alt="" className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }} />
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 30% 60%, rgba(255, 80, 20, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 40%, rgba(255, 120, 40, 0.06) 0%, transparent 50%)",
          }} />
        </div>
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

      <ParticleCanvas colors={regionColors} count={isFireRegion ? 40 : 30} speed={isFireRegion ? 0.4 : 0.3} style="ambient" />

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

            return (
              <g key={`edge-${i}`}>
                <path d={pathD} fill="none" stroke={theme.pathBorder} strokeWidth="3" strokeLinecap="round" filter="url(#pathShadow)" />
                <path d={pathD} fill="none" stroke={theme.pathColor} strokeWidth="1.8" strokeLinecap="round" filter="url(#pathGlow)" />
                <path d={pathD} fill="none" stroke={`${theme.pathColor}50`} strokeWidth="0.5" strokeLinecap="round" strokeDasharray="1.5,3" />
              </g>
            );
          })}
        </svg>
      </div>

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
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-transform duration-200 ${accessible && !isMoving ? "cursor-pointer" : "cursor-not-allowed"}`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              zIndex: Math.floor(node.y) + 20,
              transform: `translate(-50%, -50%) ${isHovered && accessible ? "scale(1.15)" : "scale(1)"}`,
            }}
            onClick={() => handleNodeClick(node)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            disabled={!accessible || isMoving}
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
                <div className="w-10 h-12 relative">
                  <div className="absolute bottom-0 w-10 h-9 rounded-md" style={{
                    backgroundColor: "#5a3a20",
                    border: "2px solid #8b6b4a",
                    boxShadow: isHovered && accessible ? `0 0 15px rgba(139, 107, 74, 0.5)` : "0 2px 6px rgba(0,0,0,0.3)",
                  }}>
                    <div className="flex items-center justify-center h-full">
                      <ShoppingBag className="w-4 h-4 text-yellow-300" />
                    </div>
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-4 rounded-sm" style={{
                    background: `linear-gradient(135deg, ${elemColor}cc, ${elemColor}88)`,
                    borderRadius: "2px 2px 0 0",
                  }} />
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

      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-2 p-2 px-3 bg-black/50 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: COLOR_MAP[player.energyColor] + "30", border: `1.5px solid ${COLOR_MAP[player.energyColor]}60` }}
            >
              <span className="text-[10px] font-bold" style={{ color: COLOR_MAP[player.energyColor] }}>{player.level}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-none" data-testid="text-player-name">{player.name}</p>
              <p className="text-[9px] text-white/40">Lv.{player.level} {player.element}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-[10px] text-red-300" data-testid="text-hp">{player.stats.hp}/{player.stats.maxHp}</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] text-blue-300" data-testid="text-mp">{player.stats.mp}/{player.stats.maxMp}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gem className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] text-yellow-300" data-testid="text-gold">{player.gold}g</span>
            </div>
          </div>
        </div>

        <Button size="icon" variant="ghost" className="text-white/60" onClick={() => setMenuOpen(true)} data-testid="button-menu">
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {menuOpen && (
        <div className="absolute inset-0 z-[200]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute top-0 right-0 h-full w-56 bg-black/85 backdrop-blur-md border-l border-white/10 flex flex-col"
            style={{ fontFamily: "'Cinzel', serif" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="text-xs font-semibold tracking-wider text-amber-200/80">MENU</span>
              <Button size="icon" variant="ghost" className="text-white/50" onClick={() => setMenuOpen(false)} data-testid="button-close-menu">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 p-3 space-y-1.5">
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm text-amber-100/80 transition-colors"
                style={{ background: "rgba(140,100,30,0.15)" }}
                onClick={() => { setMenuOpen(false); onInventory(); }}
                data-testid="button-menu-inventory"
              >
                <Backpack className="w-4 h-4 text-amber-400/60" />
                <span className="tracking-wide">Inventory</span>
              </button>
              {player.party.length > 0 && (
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm text-amber-100/80 transition-colors"
                  style={{ background: "rgba(140,100,30,0.15)" }}
                  onClick={() => { setMenuOpen(false); onPartyManage(); }}
                  data-testid="button-menu-party"
                >
                  <Users className="w-4 h-4 text-amber-400/60" />
                  <span className="tracking-wide">Party</span>
                </button>
              )}
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm text-amber-100/80 transition-colors"
                style={{ background: "rgba(140,100,30,0.15)" }}
                onClick={() => { setMenuOpen(false); onSave(); }}
                data-testid="button-menu-save"
              >
                <Save className="w-4 h-4 text-amber-400/60" />
                <span className="tracking-wide">Save Game</span>
              </button>
            </div>
            <div className="p-3 border-t border-white/10">
              <div className="text-[9px] text-white/20 text-center tracking-wider">Elemental Odyssey</div>
            </div>
          </div>
        </div>
      )}

      {hutMenuOpen && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center" onClick={() => setHutMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-72 bg-gradient-to-b from-amber-950/95 to-stone-950/95 backdrop-blur-md rounded-xl border border-amber-700/40 overflow-hidden"
            style={{ fontFamily: "'Cinzel', serif", boxShadow: "0 0 40px rgba(180, 140, 50, 0.15), 0 8px 32px rgba(0,0,0,0.5)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 pt-4 pb-3 border-b border-amber-700/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold tracking-wider text-amber-200">THE HUT</span>
              </div>
              <Button size="icon" variant="ghost" className="text-amber-400/60 h-7 w-7" onClick={() => setHutMenuOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 space-y-2">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-all hover:brightness-125"
                style={{ background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))", border: "1px solid rgba(34, 197, 94, 0.25)" }}
                onClick={() => {
                  setHutMenuOpen(false);
                  const hutNode = region.nodes.find(n => n.type === "hut");
                  if (hutNode) onRest(hutNode.id);
                }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(34, 197, 94, 0.2)" }}>
                  <Moon className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <span className="tracking-wide text-green-300 font-medium">Rest</span>
                  <p className="text-[10px] text-green-400/50 mt-0.5">Restore HP & MP</p>
                </div>
              </button>

              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-all hover:brightness-125"
                style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05))", border: "1px solid rgba(168, 85, 247, 0.25)" }}
                onClick={() => { setHutMenuOpen(false); onInventory(); }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(168, 85, 247, 0.2)" }}>
                  <Package className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <span className="tracking-wide text-purple-300 font-medium">Items & Equipment</span>
                  <p className="text-[10px] text-purple-400/50 mt-0.5">Use items, equip gear</p>
                </div>
              </button>

              {player.party.length > 0 && (
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-all hover:brightness-125"
                  style={{ background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))", border: "1px solid rgba(59, 130, 246, 0.25)" }}
                  onClick={() => { setHutMenuOpen(false); onPartyManage(); }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.2)" }}>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="tracking-wide text-blue-300 font-medium">Party</span>
                    <p className="text-[10px] text-blue-400/50 mt-0.5">Manage party members</p>
                  </div>
                </button>
              )}

              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-all hover:brightness-125"
                style={{ background: "linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(250, 204, 21, 0.05))", border: "1px solid rgba(250, 204, 21, 0.25)" }}
                onClick={() => { setHutMenuOpen(false); onSave(); }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(250, 204, 21, 0.2)" }}>
                  <Save className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <span className="tracking-wide text-yellow-300 font-medium">Save Game</span>
                  <p className="text-[10px] text-yellow-400/50 mt-0.5">Save your progress</p>
                </div>
              </button>
            </div>

            <div className="px-5 py-2 border-t border-amber-700/20">
              <p className="text-[9px] text-amber-400/30 text-center tracking-wider">A safe haven for weary travelers</p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/50 backdrop-blur-sm border-t border-white/5">
        <div className="flex items-center justify-between px-3 py-1.5">
          <Button size="icon" variant="ghost"
            disabled={player.currentRegion <= 0}
            onClick={() => {
              const prevRegion = player.currentRegion - 1;
              if (prevRegion >= 0) onRegionChange(prevRegion);
            }}
            className="text-white/50 disabled:opacity-20 h-7 w-7"
            data-testid="button-prev-region"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center flex-1">
            <h2 className="text-sm font-semibold tracking-wide" style={{ color: ELEMENT_COLORS[region.theme] }} data-testid="text-region-name">
              {region.name}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              {(() => {
                const defeats = getRegionTier(player.currentRegion, player.regionBossDefeats || {});
                const dots = [];
                for (let i = 0; i < 3; i++) {
                  dots.push(
                    <div key={i} className={`w-2 h-2 rounded-full ${i < defeats ? "bg-green-400" : "bg-white/20"}`} />
                  );
                }
                return (
                  <>
                    <span className="text-[9px] text-white/40 mr-1">Clear</span>
                    {dots}
                  </>
                );
              })()}
            </div>
          </div>

          <Button size="icon" variant="ghost"
            disabled={!isRegionUnlocked(player.currentRegion + 1, player.regionBossDefeats || {})}
            onClick={() => onRegionChange(player.currentRegion + 1)}
            className="text-white/50 disabled:opacity-20 h-7 w-7"
            data-testid="button-next-region"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {hoveredNode !== null && (() => {
        const node = region.nodes.find(n => n.id === hoveredNode);
        if (!node || !canAccessNode(node)) return null;
        return (
          <div className="absolute z-40 pointer-events-none" style={{
            left: `${node.x}%`,
            top: `${node.y - 12}%`,
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
