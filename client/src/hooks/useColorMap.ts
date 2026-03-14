import { useEffect, useState } from "react";
import { analyzeSpriteGroups, buildColorMap, type DetectedGroup } from "@/lib/colorUtils";

const groupsCache = new Map<string, DetectedGroup[]>();

export function useColorMap(
  spriteSheet: string,
  frameWidth: number,
  frameHeight: number,
  colorGroups: Record<string, string> | undefined
): Record<string, string> {
  const [groups, setGroups] = useState<DetectedGroup[]>(() => {
    const key = `${spriteSheet}:${frameWidth}:${frameHeight}`;
    return groupsCache.get(key) ?? [];
  });

  useEffect(() => {
    let cancelled = false;
    analyzeSpriteGroups(spriteSheet, frameWidth, frameHeight).then(g => {
      if (!cancelled) {
        const key = `${spriteSheet}:${frameWidth}:${frameHeight}`;
        groupsCache.set(key, g);
        setGroups(g);
      }
    });
    return () => { cancelled = true; };
  }, [spriteSheet, frameWidth, frameHeight]);

  if (!colorGroups || Object.keys(colorGroups).length === 0 || groups.length === 0) {
    return {};
  }

  return buildColorMap(groups, colorGroups);
}
