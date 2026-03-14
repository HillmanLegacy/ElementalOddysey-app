export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    default: h = ((r - g) / d + 4) / 6; break;
  }
  return [h * 360, s, l];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) {
    const v = Math.round(Math.max(0, Math.min(1, l)) * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(Math.max(0, Math.min(255, hue2rgb(p, q, h + 1 / 3) * 255))),
    Math.round(Math.max(0, Math.min(255, hue2rgb(p, q, h) * 255))),
    Math.round(Math.max(0, Math.min(255, hue2rgb(p, q, h - 1 / 3) * 255))),
  ];
}

export interface DetectedGroup {
  id: string;
  label: string;
  colors: string[];
  baseColor: string;
  avgY: number;
}

const groupCache = new Map<string, DetectedGroup[]>();

function isNeutral(r: number, g: number, b: number): boolean {
  const [, s, l] = rgbToHsl(r, g, b);
  return s < 0.1 || l < 0.08 || l > 0.92;
}

function hueDist(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export async function analyzeSpriteGroups(
  spriteSheet: string,
  frameWidth: number,
  frameHeight: number
): Promise<DetectedGroup[]> {
  const cacheKey = `${spriteSheet}:${frameWidth}:${frameHeight}`;
  if (groupCache.has(cacheKey)) return groupCache.get(cacheKey)!;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const oc = document.createElement("canvas");
      oc.width = frameWidth;
      oc.height = frameHeight;
      const ctx = oc.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
      const { data } = ctx.getImageData(0, 0, frameWidth, frameHeight);

      const colorPixels = new Map<string, { count: number; totalY: number }>();

      for (let y = 0; y < frameHeight; y++) {
        for (let x = 0; x < frameWidth; x++) {
          const i = (y * frameWidth + x) * 4;
          const a = data[i + 3];
          if (a < 20) continue;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (isNeutral(r, g, b)) continue;
          const hex = rgbToHex(r, g, b);
          const prev = colorPixels.get(hex) ?? { count: 0, totalY: 0 };
          colorPixels.set(hex, { count: prev.count + 1, totalY: prev.totalY + y });
        }
      }

      if (colorPixels.size === 0) {
        const result: DetectedGroup[] = [];
        groupCache.set(cacheKey, result);
        resolve(result);
        return;
      }

      const colors = Array.from(colorPixels.entries()).filter(([, v]) => v.count >= 2);

      const clusters: { hue: number; colors: string[]; totalCount: number; totalY: number }[] = [];

      for (const [hex, { count, totalY }] of colors) {
        const [r, g, b] = hexToRgb(hex);
        const [h] = rgbToHsl(r, g, b);
        let placed = false;
        for (const cluster of clusters) {
          if (hueDist(cluster.hue, h) < 28) {
            cluster.colors.push(hex);
            cluster.totalCount += count;
            cluster.totalY += totalY;
            const newHue = (cluster.hue * (cluster.totalCount - count) + h * count) / cluster.totalCount;
            cluster.hue = ((newHue % 360) + 360) % 360;
            placed = true;
            break;
          }
        }
        if (!placed) {
          clusters.push({ hue: h, colors: [hex], totalCount: count, totalY });
        }
      }

      clusters.sort((a, b) => b.totalCount - a.totalCount);

      const top = clusters.slice(0, 5).filter(c => c.colors.length >= 1);

      const GROUP_NAMES_BY_Y = ["Hair", "Clothing", "Shoes", "Detail", "Accent"];

      const labeled = top.map((cluster) => {
        const avgY = cluster.totalY / cluster.totalCount;
        const sorted = [...cluster.colors].sort((a, b) => {
          const [ra, ga, ba] = hexToRgb(a);
          const [rb, gb, bb] = hexToRgb(b);
          const ca = colorPixels.get(a)!.count;
          const cb = colorPixels.get(b)!.count;
          return cb - ca;
        });
        return { cluster, avgY, sorted };
      });

      labeled.sort((a, b) => a.avgY - b.avgY);

      const groups: DetectedGroup[] = labeled.map((entry, idx) => {
        const baseColor = entry.sorted[0];
        return {
          id: `group${idx}`,
          label: GROUP_NAMES_BY_Y[idx] ?? `Group ${idx + 1}`,
          colors: entry.sorted,
          baseColor,
          avgY: entry.avgY,
        };
      });

      groupCache.set(cacheKey, groups);
      resolve(groups);
    };
    img.onerror = () => {
      groupCache.set(cacheKey, []);
      resolve([]);
    };
    img.src = spriteSheet;
  });
}

export function buildColorMap(
  groups: DetectedGroup[],
  picks: Record<string, string>
): Record<string, string> {
  const map: Record<string, string> = {};

  for (const group of groups) {
    const replacement = picks[group.id];
    if (!replacement || replacement === "default") continue;

    const [br, bg, bb] = hexToRgb(group.baseColor);
    const [baseH, baseS, baseL] = rgbToHsl(br, bg, bb);
    const [rr, rg, rb] = hexToRgb(replacement);
    const [newH, newS, newL] = rgbToHsl(rr, rg, rb);

    for (const origHex of group.colors) {
      const [or, og, ob] = hexToRgb(origHex);
      const [, origS, origL] = rgbToHsl(or, og, ob);

      const lDelta = origL - baseL;
      const sDelta = origS - baseS;

      const finalL = Math.max(0, Math.min(1, newL + lDelta));
      const finalS = Math.max(0, Math.min(1, newS + sDelta * 0.6));

      const [nr, ng, nb] = hslToRgb(newH, finalS, finalL);
      map[origHex] = rgbToHex(nr, ng, nb);
    }
  }

  return map;
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { id: "default",       name: "Default",      hex: "default" },
  { id: "black",         name: "Black",         hex: "#111111" },
  { id: "charcoal",      name: "Charcoal",      hex: "#2d2d2d" },
  { id: "dark_gray",     name: "Dark Gray",     hex: "#4a4a4a" },
  { id: "gray",          name: "Gray",          hex: "#808080" },
  { id: "silver",        name: "Silver",        hex: "#b0b0b0" },
  { id: "white",         name: "White",         hex: "#f0f0f0" },
  { id: "ivory",         name: "Ivory",         hex: "#e8dcc8" },
  { id: "cream",         name: "Cream",         hex: "#d4b896" },
  { id: "tan",           name: "Tan",           hex: "#c4956a" },
  { id: "brown",         name: "Brown",         hex: "#7a4a28" },
  { id: "dark_brown",    name: "Dark Brown",    hex: "#4a2810" },
  { id: "auburn",        name: "Auburn",        hex: "#8b3a1a" },
  { id: "chestnut",      name: "Chestnut",      hex: "#954535" },
  { id: "red",           name: "Red",           hex: "#cc2222" },
  { id: "crimson",       name: "Crimson",       hex: "#a80000" },
  { id: "scarlet",       name: "Scarlet",       hex: "#e83030" },
  { id: "coral",         name: "Coral",         hex: "#e06050" },
  { id: "orange",        name: "Orange",        hex: "#d06020" },
  { id: "amber",         name: "Amber",         hex: "#c88010" },
  { id: "gold",          name: "Gold",          hex: "#d4a020" },
  { id: "yellow",        name: "Yellow",        hex: "#d4c030" },
  { id: "lime",          name: "Lime",          hex: "#70b020" },
  { id: "green",         name: "Green",         hex: "#2a8c3a" },
  { id: "forest",        name: "Forest",        hex: "#1a5c28" },
  { id: "teal",          name: "Teal",          hex: "#1a8070" },
  { id: "cyan",          name: "Cyan",          hex: "#2090a0" },
  { id: "sky",           name: "Sky",           hex: "#4090d0" },
  { id: "blue",          name: "Blue",          hex: "#2050b0" },
  { id: "navy",          name: "Navy",          hex: "#102060" },
  { id: "cobalt",        name: "Cobalt",        hex: "#2040a0" },
  { id: "indigo",        name: "Indigo",        hex: "#402890" },
  { id: "violet",        name: "Violet",        hex: "#6020a0" },
  { id: "purple",        name: "Purple",        hex: "#802090" },
  { id: "magenta",       name: "Magenta",       hex: "#a02080" },
  { id: "pink",          name: "Pink",          hex: "#d04080" },
  { id: "rose",          name: "Rose",          hex: "#e06090" },
  { id: "blush",         name: "Blush",         hex: "#e09090" },
];
