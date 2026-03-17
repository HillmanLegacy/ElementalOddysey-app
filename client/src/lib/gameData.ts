import type { Enemy, Region, OverworldNode, Perk, ShopItem, PlayerStats, PlayerCharacter, Element, EnergyColor, EnergyShape, BattleState, Spell, PartyMemberDef, TurnQueueEntry, BattlePartyMember } from "@shared/schema";

export const COLOR_MAP: Record<string, string> = {
  Red: "#ef4444",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Yellow: "#eab308",
  Purple: "#a855f7",
  White: "#f8fafc",
  Black: "#1e1b4b",
  Cyan: "#06b6d4",
  Orange: "#f97316",
  Pink: "#ec4899",
};

export const ELEMENT_COLORS: Record<Element, string> = {
  Fire: "#ef4444",
  Water: "#3b82f6",
  Wind: "#a3e635",
  Earth: "#a16207",
  Lightning: "#facc15",
  Shadow: "#6b21a8",
  Light: "#fde68a",
  Ice: "#67e8f9",
};

export const STARTER_CHARACTERS: PartyMemberDef[] = [
  {
    id: "knight_fire",
    name: "Knight",
    className: "Knight",
    element: "Fire",
    baseStats: { hp: 85, maxHp: 85, mp: 30, maxMp: 30, atk: 14, def: 12, agi: 6, int: 5, luck: 4 },
    spriteId: "knight",
  },
  {
    id: "samurai_wind",
    name: "Samurai",
    className: "Samurai",
    element: "Wind",
    baseStats: { hp: 70, maxHp: 70, mp: 40, maxMp: 40, atk: 12, def: 8, agi: 12, int: 8, luck: 5 },
    spriteId: "samurai",
  },
  {
    id: "basken_lightning",
    name: "Rogue",
    className: "Rogue",
    element: "Lightning",
    baseStats: { hp: 75, maxHp: 75, mp: 35, maxMp: 35, atk: 12, def: 10, agi: 9, int: 8, luck: 6 },
    spriteId: "basken",
  },
];

export const PARTY_CHARACTERS: PartyMemberDef[] = [
  {
    id: "knight_fire",
    name: "Ignis",
    className: "Knight",
    element: "Fire",
    baseStats: { hp: 85, maxHp: 85, mp: 30, maxMp: 30, atk: 14, def: 12, agi: 6, int: 5, luck: 4 },
    spriteId: "knight",
  },
  {
    id: "ranger_wind",
    name: "Sylph",
    className: "Ranger",
    element: "Wind",
    baseStats: { hp: 60, maxHp: 60, mp: 40, maxMp: 40, atk: 10, def: 6, agi: 14, int: 10, luck: 7 },
    spriteId: "ranger",
  },
  {
    id: "basken_lightning",
    name: "Rogue",
    className: "Rogue",
    element: "Lightning",
    baseStats: { hp: 75, maxHp: 75, mp: 35, maxMp: 35, atk: 12, def: 10, agi: 9, int: 8, luck: 6 },
    spriteId: "basken",
  },
  {
    id: "knight2d_light",
    name: "Lumen",
    className: "Paladin",
    element: "Light",
    baseStats: { hp: 80, maxHp: 80, mp: 45, maxMp: 45, atk: 11, def: 11, agi: 7, int: 12, luck: 5 },
    spriteId: "knight2d",
  },
  {
    id: "axewarrior_earth",
    name: "Terra",
    className: "Axe Warrior",
    element: "Earth",
    baseStats: { hp: 95, maxHp: 95, mp: 25, maxMp: 25, atk: 15, def: 13, agi: 5, int: 4, luck: 5 },
    spriteId: "axewarrior",
  },
];

export interface PartySpriteData {
  idle: { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number };
  attack: { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number };
  run: { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number };
  hurt: { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number };
}

export const PARTY_SPRITE_DATA: Record<string, PartySpriteData> = {
  samurai: {
    idle: { sheet: "samurai-idle.png", frameWidth: 96, frameHeight: 96, totalFrames: 10 },
    attack: { sheet: "samurai-attack.png", frameWidth: 96, frameHeight: 96, totalFrames: 12 },
    run: { sheet: "samurai-run.png", frameWidth: 96, frameHeight: 96, totalFrames: 8 },
    hurt: { sheet: "samurai-hurt.png", frameWidth: 96, frameHeight: 96, totalFrames: 3 },
  },
  knight: {
    idle: { sheet: "knight-idle-4f.png", frameWidth: 86, frameHeight: 49, totalFrames: 7 },
    attack: { sheet: "knight-attack.png", frameWidth: 86, frameHeight: 49, totalFrames: 7 },
    run: { sheet: "knight-run.png", frameWidth: 86, frameHeight: 49, totalFrames: 6 },
    walk: { sheet: "knight-walk.png", frameWidth: 86, frameHeight: 49, totalFrames: 4 },
    hurt: { sheet: "knight-hurt.png", frameWidth: 86, frameHeight: 49, totalFrames: 2 },
  },
  ranger: {
    idle: { sheet: "ranger-idle.png", frameWidth: 64, frameHeight: 48, totalFrames: 6 },
    attack: { sheet: "ranger-attack.png", frameWidth: 64, frameHeight: 48, totalFrames: 6 },
    run: { sheet: "ranger-run.png", frameWidth: 64, frameHeight: 48, totalFrames: 6 },
    hurt: { sheet: "ranger-hurt.png", frameWidth: 64, frameHeight: 48, totalFrames: 6 },
  },
  basken: {
    idle: { sheet: "basken-idle.png", frameWidth: 56, frameHeight: 56, totalFrames: 5 },
    attack: { sheet: "basken-attack.png", frameWidth: 56, frameHeight: 56, totalFrames: 8 },
    run: { sheet: "basken-run.png", frameWidth: 56, frameHeight: 56, totalFrames: 6 },
    hurt: { sheet: "basken-hurt.png", frameWidth: 56, frameHeight: 56, totalFrames: 3 },
  },
  knight2d: {
    idle: { sheet: "knight2d-idle.png", frameWidth: 84, frameHeight: 84, totalFrames: 8 },
    attack: { sheet: "knight2d-attack-1.png", frameWidth: 84, frameHeight: 84, totalFrames: 4 },
    run: { sheet: "knight2d-run.png", frameWidth: 84, frameHeight: 84, totalFrames: 8 },
    hurt: { sheet: "knight2d-hurt.png", frameWidth: 84, frameHeight: 84, totalFrames: 3 },
  },
  axewarrior: {
    idle: { sheet: "axewarrior-idle.png", frameWidth: 94, frameHeight: 91, totalFrames: 6 },
    attack: { sheet: "axewarrior-attack.png", frameWidth: 94, frameHeight: 91, totalFrames: 8 },
    run: { sheet: "axewarrior-run.png", frameWidth: 94, frameHeight: 91, totalFrames: 6 },
    hurt: { sheet: "axewarrior-hurt.png", frameWidth: 94, frameHeight: 91, totalFrames: 3 },
  },
};

export function getPartyMemberForLevel(def: PartyMemberDef, level: number): PartyMemberDef & { scaledStats: PlayerStats } {
  const scale = 1 + (level - 1) * 0.15;
  return {
    ...def,
    scaledStats: {
      hp: Math.floor(def.baseStats.hp * scale),
      maxHp: Math.floor(def.baseStats.maxHp * scale),
      mp: Math.floor(def.baseStats.mp * scale),
      maxMp: Math.floor(def.baseStats.maxMp * scale),
      atk: Math.floor(def.baseStats.atk * scale),
      def: Math.floor(def.baseStats.def * scale),
      agi: Math.floor(def.baseStats.agi * scale),
      int: Math.floor(def.baseStats.int * scale),
      luck: Math.floor(def.baseStats.luck * scale),
    },
  };
}

export const COLOR_VARIANTS: { id: string; name: string; swatch: string; filter: string }[] = [
  { id: "default",  name: "Default",  swatch: "#9ca3af", filter: "" },
  { id: "crimson",  name: "Crimson",  swatch: "#dc2626", filter: "sepia(1) hue-rotate(322deg) saturate(3) brightness(0.95)" },
  { id: "azure",    name: "Azure",    swatch: "#3b82f6", filter: "sepia(1) hue-rotate(182deg) saturate(3) brightness(1.0)" },
  { id: "emerald",  name: "Emerald",  swatch: "#22c55e", filter: "sepia(1) hue-rotate(102deg) saturate(3) brightness(1.0)" },
  { id: "violet",   name: "Violet",   swatch: "#a855f7", filter: "sepia(1) hue-rotate(232deg) saturate(3) brightness(0.9)" },
  { id: "amber",    name: "Amber",    swatch: "#f59e0b", filter: "sepia(1) hue-rotate(10deg) saturate(4) brightness(1.1)" },
  { id: "rose",     name: "Rose",     swatch: "#f43f5e", filter: "sepia(1) hue-rotate(292deg) saturate(3) brightness(1.0)" },
  { id: "obsidian", name: "Obsidian", swatch: "#6b7280", filter: "grayscale(1) brightness(0.65) contrast(1.1)" },
];

export function createNewPlayer(starterDef: PartyMemberDef, name: string, color: EnergyColor, shape: EnergyShape, colorVariant: string = "default", colorGroups: Record<string, string> = {}): PlayerCharacter {
  return {
    name,
    level: 1,
    xp: 0,
    xpToNext: 100,
    energyColor: color,
    energyShape: shape,
    element: starterDef.element,
    stats: { ...starterDef.baseStats },
    gold: 50,
    inventory: [
      { id: "potion1", name: "Health Potion", type: "consumable", description: "Restores 30 HP", effect: { type: "heal", stat: "hp", amount: 30 }, icon: "heart", value: 15 },
      { id: "potion2", name: "Mana Potion", type: "consumable", description: "Restores 20 MP", effect: { type: "heal", stat: "mp", amount: 20 }, icon: "droplets", value: 15 },
    ],
    equipment: { weapon: null, armor: null, accessory: null },
    perks: [],
    currentRegion: 0,
    currentNode: 0,
    clearedNodes: [],
    party: [],
    benchedParty: [],
    defeatedBosses: [],
    spriteId: starterDef.spriteId,
    starterCharacterId: starterDef.id,
    colorVariant,
    colorGroups,
    regionBossDefeats: {},
    merchantBattlesSinceRestock: 0,
    merchantLastRegion: 0,
    merchantLastTier: 0,
    merchantSavedStock: null,
  };
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export const ENEMY_POOL: Omit<Enemy, "stats">[] = [
  { id: "slime_fire", name: "Fire Demon", element: "Fire", level: 1, xpReward: 18, goldReward: 8, isBoss: false, sprite: "flame" },
  { id: "demon_kin", name: "Demon Kin", element: "Fire", level: 2, xpReward: 24, goldReward: 11, isBoss: false, sprite: "flame" },
  { id: "slime_water", name: "Aqua Slime", element: "Water", level: 1, xpReward: 15, goldReward: 7, isBoss: false, sprite: "droplets" },
  { id: "wolf_wind", name: "Storm Wolf", element: "Wind", level: 1, xpReward: 20, goldReward: 9, isBoss: false, sprite: "wind" },
  { id: "minotaur_wind", name: "Minotaur", element: "Wind", level: 2, xpReward: 26, goldReward: 12, isBoss: false, sprite: "wind" },
  { id: "cyclops_wind", name: "Cyclops", element: "Wind", level: 2, xpReward: 28, goldReward: 13, isBoss: false, sprite: "wind" },
  { id: "harpy_wind", name: "Harpy", element: "Wind", level: 1, xpReward: 22, goldReward: 10, isBoss: false, sprite: "wind" },
  { id: "golem_earth", name: "Stone Golem", element: "Earth", level: 2, xpReward: 28, goldReward: 12, isBoss: false, sprite: "mountain" },
  { id: "wisp_light", name: "Light Wisp", element: "Light", level: 1, xpReward: 16, goldReward: 7, isBoss: false, sprite: "sun" },
  { id: "shade", name: "Dark Shade", element: "Shadow", level: 2, xpReward: 25, goldReward: 11, isBoss: false, sprite: "ghost" },
  { id: "spark_bug", name: "Spark Bug", element: "Lightning", level: 1, xpReward: 18, goldReward: 8, isBoss: false, sprite: "zap" },
  { id: "frost_lizard", name: "Frost Lizard", element: "Ice", level: 1, xpReward: 19, goldReward: 8, isBoss: false, sprite: "snowflake" },
  { id: "resk", name: "Resk The Forest Dragon", element: "Wind", level: 3, xpReward: 100, goldReward: 40, isBoss: true, sprite: "wind" },
  { id: "dragon_lord", name: "Crown Of Cinder - Ytriel", element: "Fire", level: 4, xpReward: 120, goldReward: 50, isBoss: true, sprite: "flame" },
  { id: "jotem", name: "Jotem", element: "Ice", level: 4, xpReward: 120, goldReward: 50, isBoss: true, sprite: "snowflake" },
  { id: "kraken", name: "Deep Kraken", element: "Water", level: 5, xpReward: 150, goldReward: 60, isBoss: true, sprite: "droplets" },
  { id: "shadow_lord", name: "Shadow Lord", element: "Shadow", level: 6, xpReward: 200, goldReward: 80, isBoss: true, sprite: "ghost" },
  { id: "crystal_titan", name: "Crystal Titan", element: "Earth", level: 7, xpReward: 250, goldReward: 100, isBoss: true, sprite: "diamond" },
];

// Per-enemy stat multipliers relative to the generic non-boss formula.
// hp/atk/def/agi/int each multiply their respective formula output.
const ENEMY_STAT_PROFILES: Record<string, { hp: number; atk: number; def: number; agi: number; int: number }> = {
  // Minotaur — high ATK, moderate DEF/AGI, low INT
  minotaur_wind: { hp: 1.15, atk: 1.55, def: 1.05, agi: 0.85, int: 0.50 },
  // Cyclops — high ATK/DEF/HP, very low AGI (hard to dodge), low INT
  cyclops_wind:  { hp: 1.65, atk: 1.40, def: 1.55, agi: 0.30, int: 0.45 },
  // Harpy — low HP/DEF, moderate ATK, high AGI (very agile/hard to hit), low INT
  harpy_wind:    { hp: 0.70, atk: 0.85, def: 0.55, agi: 1.70, int: 0.50 },
};

export function generateEnemyStats(base: Omit<Enemy, "stats">, scaleFactor: number, levelBonus: number = 0): Enemy {
  const lv = base.level * scaleFactor + levelBonus;
  const vary = base.isBoss ? () => 1.0 : () => 0.9 + Math.random() * 0.2;

  if (base.isBoss) {
    const hp = Math.floor((50 + lv * 25) * vary());
    return {
      ...base,
      level: Math.floor(lv),
      stats: {
        hp,
        maxHp: hp,
        atk: Math.floor((8 + lv * 3) * vary()),
        def: Math.floor((5 + lv * 2) * vary()),
        agi: Math.floor((4 + lv * 1.5) * vary()),
        int: Math.floor((7 + lv * 2.5) * vary()),
        luck: Math.floor((3 + lv) * vary()),
        mp: Math.floor((30 + lv * 10) * vary()),
        maxMp: Math.floor((30 + lv * 10) * vary()),
      },
    };
  }

  const profile = ENEMY_STAT_PROFILES[base.id];
  const p = profile ?? { hp: 1, atk: 1, def: 1, agi: 1, int: 1 };

  const hp = Math.floor((18 + lv * 10) * p.hp * vary());
  return {
    ...base,
    level: Math.floor(lv),
    stats: {
      hp,
      maxHp: hp,
      atk: Math.floor((5 + lv * 2.5) * p.atk * vary()),
      def: Math.floor((3 + lv * 1.5) * p.def * vary()),
      agi: Math.floor((4 + lv * 1.5) * p.agi * vary()),
      int: Math.floor((4 + lv * 2) * p.int * vary()),
      luck: Math.floor((2 + lv) * vary()),
      mp: Math.floor((15 + lv * 5) * vary()),
      maxMp: Math.floor((15 + lv * 5) * vary()),
    },
  };
}

export function generateDemonKinSpawn(refLevel: number): Enemy & { currentHp: number } {
  const base = ENEMY_POOL.find(e => e.id === "demon_kin")!;
  const lv = Math.max(refLevel + 2, 7);
  const vary = () => 0.9 + Math.random() * 0.2;
  const hp = Math.floor((30 + lv * 14) * vary());
  return {
    ...base,
    level: lv,
    xpReward: Math.floor(base.xpReward * 2.5),
    goldReward: Math.floor(base.goldReward * 2.5),
    currentHp: hp,
    stats: {
      hp,
      maxHp: hp,
      atk: Math.floor((10 + lv * 3.5) * vary()),
      def: Math.floor((5 + lv * 2) * vary()),
      agi: Math.floor((10 + lv * 3) * vary()),
      int: Math.floor((5 + lv * 2) * vary()),
      luck: Math.floor((5 + lv * 1.5) * vary()),
      mp: Math.floor((20 + lv * 7) * vary()),
      maxMp: Math.floor((20 + lv * 7) * vary()),
    },
  };
}

export function getEnemiesForNode(node: OverworldNode, region: Region, tier: number = 0): Enemy[] {
  const regionElement = region.theme;
  const baseScale = 1 + region.id * 0.5;

  const bossPool = ENEMY_POOL.filter(e => e.isBoss);
  const lesserPool = ENEMY_POOL.filter(e => !e.isBoss);
  const preferredLesser = lesserPool.filter(e => e.element === regionElement);
  const selectedLesser = preferredLesser.length > 0 ? preferredLesser : lesserPool;
  const preferredBoss = bossPool.filter(e => e.element === regionElement);
  const selectedBoss = preferredBoss.length > 0 ? preferredBoss : bossPool;

  const enemies: Enemy[] = [];

  if (node.type !== "boss" && regionElement === "Fire") {
    const fireDemonBase = ENEMY_POOL.find(e => e.id === "slime_fire")!;
    let count: number;
    if (tier >= 2) {
      count = 2 + Math.floor(Math.random() * 2);
    } else if (tier >= 1) {
      count = 1 + Math.floor(Math.random() * 3);
    } else {
      count = 1 + Math.floor(Math.random() * 2);
    }
    const fireEnemies: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      const enemyLevelBonus = tier * (1 + Math.floor(Math.random() * 2));
      const enemy = generateEnemyStats(fireDemonBase, baseScale, enemyLevelBonus);
      enemy.xpReward = Math.floor(enemy.xpReward * (1 + tier * 0.25));
      enemy.goldReward = Math.floor(enemy.goldReward * (1 + tier * 0.25));
      fireEnemies.push(enemy);
    }
    return fireEnemies;
  }

  if (node.type === "boss") {
    const bossBase = selectedBoss[Math.floor(Math.random() * selectedBoss.length)];
    const bossLevelBonus = tier;
    const boss = generateEnemyStats(bossBase, baseScale, bossLevelBonus);
    boss.xpReward = Math.floor(boss.xpReward * (1 + tier * 0.25));
    boss.goldReward = Math.floor(boss.goldReward * (1 + tier * 0.25));
    enemies.push(boss);

    const lesserCount = tier >= 2 ? 2 : tier >= 1 ? 1 : 0;
    for (let i = 0; i < lesserCount; i++) {
      const base = selectedLesser[Math.floor(Math.random() * selectedLesser.length)];
      const enemyLevelBonus = tier * (1 + Math.floor(Math.random() * 2));
      const enemy = generateEnemyStats(base, baseScale, enemyLevelBonus);
      enemy.xpReward = Math.floor(enemy.xpReward * (1 + tier * 0.25));
      enemy.goldReward = Math.floor(enemy.goldReward * (1 + tier * 0.25));
      enemies.push(enemy);
    }
  } else {
    let count: number;
    if (tier >= 2) {
      count = 2 + Math.floor(Math.random() * 2);
    } else if (tier >= 1) {
      count = 1 + Math.floor(Math.random() * 3);
    } else {
      count = 1 + Math.floor(Math.random() * 2);
    }

    for (let i = 0; i < count; i++) {
      const base = selectedLesser[Math.floor(Math.random() * selectedLesser.length)];
      const enemyLevelBonus = tier * (1 + Math.floor(Math.random() * 2));
      const enemy = generateEnemyStats(base, baseScale, enemyLevelBonus);
      enemy.xpReward = Math.floor(enemy.xpReward * (1 + tier * 0.25));
      enemy.goldReward = Math.floor(enemy.goldReward * (1 + tier * 0.25));
      enemies.push(enemy);
    }
  }

  return enemies;
}

export const REGIONS: Region[] = [
  {
    id: 0,
    name: "Verdant Fields",
    theme: "Wind",
    unlocked: true,
    nodes: [
      { id: 0,   type: "hut",     name: "Ranger's Post",       x: 5,  y: 50, connections: [1],          region: 0, cleared: false },
      { id: 1,   type: "passage", name: "Mossy Trail",          x: 17, y: 50, connections: [0, 2, 3],    region: 0, cleared: false },
      { id: 2,   type: "shaman",  name: "Wind Shaman's Grove",  x: 17, y: 25, connections: [1],          region: 0, cleared: false },
      { id: 3,   type: "passage", name: "Breeze Path",          x: 31, y: 50, connections: [1, 4, 5],    region: 0, cleared: false },
      { id: 4,   type: "passage", name: "Hollow Thicket",       x: 31, y: 75, connections: [3],          region: 0, cleared: false },
      { id: 5,   type: "shop",    name: "Wanderer's Bazaar",    x: 46, y: 50, connections: [3, 6, 7],    region: 0, cleared: false },
      { id: 6,   type: "passage", name: "Windswept Glen",       x: 46, y: 25, connections: [5],          region: 0, cleared: false },
      { id: 7,   type: "rest",    name: "Whispering Spring",    x: 60, y: 50, connections: [5, 8, 9],    region: 0, cleared: false },
      { id: 8,   type: "passage", name: "Rustling Glade",       x: 60, y: 75, connections: [7],          region: 0, cleared: false },
      { id: 9,   type: "passage", name: "Storm Pass",           x: 74, y: 50, connections: [7, 10, 11, 12], region: 0, cleared: false },
      { id: 10,  type: "passage", name: "Gale Ridge",           x: 74, y: 25, connections: [9],          region: 0, cleared: false },
      { id: 11,  type: "shop",    name: "Thornwood Market",     x: 74, y: 75, connections: [9],          region: 0, cleared: false },
      { id: 12,  type: "boss",    name: "Storm Lord's Peak",    x: 90, y: 50, connections: [9],          region: 0, cleared: false },
    ],
  },
  {
    id: 1,
    name: "Ember Plains",
    theme: "Fire",
    unlocked: false,
    nodes: [
      { id: 100, type: "hut",     name: "Ember Hut",           x: 5,  y: 50, connections: [101],               region: 1, cleared: false },
      { id: 101, type: "passage", name: "Scorched Path",        x: 17, y: 50, connections: [100, 102, 103],     region: 1, cleared: false },
      { id: 102, type: "shaman",  name: "Fire Shaman's Hut",   x: 17, y: 25, connections: [101],               region: 1, cleared: false },
      { id: 103, type: "passage", name: "Cinder Trail",         x: 31, y: 50, connections: [101, 104, 105],     region: 1, cleared: false },
      { id: 104, type: "passage", name: "Ash Hollow",           x: 31, y: 75, connections: [103],               region: 1, cleared: false },
      { id: 105, type: "shop",    name: "Merchant Camp",        x: 46, y: 50, connections: [103, 106, 107],     region: 1, cleared: false },
      { id: 106, type: "passage", name: "Flame Ridge",          x: 46, y: 25, connections: [105],               region: 1, cleared: false },
      { id: 107, type: "rest",    name: "Hot Spring",           x: 60, y: 50, connections: [105, 108, 109],     region: 1, cleared: false },
      { id: 108, type: "passage", name: "Lava Flow",            x: 60, y: 75, connections: [107],               region: 1, cleared: false },
      { id: 109, type: "passage", name: "Inferno Gorge",        x: 74, y: 50, connections: [107, 110, 111, 112], region: 1, cleared: false },
      { id: 110, type: "passage", name: "Magma Cavern",         x: 74, y: 25, connections: [109],               region: 1, cleared: false },
      { id: 111, type: "shop",    name: "Smolder Market",       x: 74, y: 75, connections: [109],               region: 1, cleared: false },
      { id: 112, type: "boss",    name: "Dragon Lord's Sanctum",x: 90, y: 50, connections: [109],               region: 1, cleared: false },
    ],
  },
  {
    id: 2,
    name: "Frozen Depths",
    theme: "Ice",
    unlocked: false,
    nodes: [
      { id: 200, type: "hut",     name: "Frost Hut",           x: 10, y: 80, connections: [201, 202],          region: 2, cleared: false },
      { id: 201, type: "passage", name: "Frost Gate",           x: 20, y: 65, connections: [200, 203, 204],     region: 2, cleared: false },
      { id: 202, type: "passage", name: "Icicle Path",          x: 12, y: 55, connections: [200, 205],          region: 2, cleared: false },
      { id: 203, type: "passage", name: "Glacier Pass",         x: 32, y: 75, connections: [201, 206],          region: 2, cleared: false },
      { id: 204, type: "shop",    name: "Ice Merchant",         x: 30, y: 52, connections: [201, 205, 207],     region: 2, cleared: false },
      { id: 205, type: "passage", name: "Frozen Falls",         x: 24, y: 38, connections: [202, 204, 208],     region: 2, cleared: false },
      { id: 206, type: "passage", name: "Blizzard Peak",        x: 45, y: 68, connections: [203, 209],          region: 2, cleared: false },
      { id: 207, type: "passage", name: "Crystal Cavern",       x: 44, y: 45, connections: [204, 209, 210],     region: 2, cleared: false },
      { id: 208, type: "shaman",  name: "Frost Shaman",         x: 35, y: 22, connections: [205, 210],          region: 2, cleared: false },
      { id: 209, type: "rest",    name: "Warm Cavern",          x: 58, y: 58, connections: [206, 207, 211],     region: 2, cleared: false },
      { id: 210, type: "passage", name: "Permafrost Depths",    x: 52, y: 32, connections: [207, 208, 212],     region: 2, cleared: false },
      { id: 211, type: "passage", name: "Avalanche Ridge",      x: 70, y: 52, connections: [209, 212, 213],     region: 2, cleared: false },
      { id: 212, type: "passage", name: "Ice Throne Path",      x: 68, y: 35, connections: [210, 211, 213],     region: 2, cleared: false },
      { id: 213, type: "boss",    name: "Jotem's Lair",         x: 84, y: 42, connections: [211, 212],          region: 2, cleared: false },
    ],
  },
  {
    id: 3,
    name: "Shadow Forest",
    theme: "Shadow",
    unlocked: false,
    nodes: [
      { id: 300, type: "hut",     name: "Shadow Hut",          x: 10, y: 78, connections: [301, 302],          region: 3, cleared: false },
      { id: 301, type: "passage", name: "Dark Entrance",        x: 20, y: 62, connections: [300, 303, 304],     region: 3, cleared: false },
      { id: 302, type: "passage", name: "Twilight Trail",       x: 15, y: 48, connections: [300, 305],          region: 3, cleared: false },
      { id: 303, type: "passage", name: "Mist Trail",           x: 34, y: 72, connections: [301, 306],          region: 3, cleared: false },
      { id: 304, type: "shop",    name: "Shade Dealer",         x: 32, y: 50, connections: [301, 305, 307],     region: 3, cleared: false },
      { id: 305, type: "passage", name: "Phantom Woods",        x: 25, y: 35, connections: [302, 304, 308],     region: 3, cleared: false },
      { id: 306, type: "passage", name: "Cursed Bog",           x: 48, y: 66, connections: [303, 309],          region: 3, cleared: false },
      { id: 307, type: "passage", name: "Specter Hollow",       x: 46, y: 42, connections: [304, 309, 310],     region: 3, cleared: false },
      { id: 308, type: "shaman",  name: "Shadow Shaman",        x: 36, y: 20, connections: [305, 310],          region: 3, cleared: false },
      { id: 309, type: "rest",    name: "Moonlit Glade",        x: 60, y: 56, connections: [306, 307, 311],     region: 3, cleared: false },
      { id: 310, type: "passage", name: "Void Corridor",        x: 54, y: 30, connections: [307, 308, 312],     region: 3, cleared: false },
      { id: 311, type: "passage", name: "Nightmare Fen",        x: 72, y: 50, connections: [309, 312, 313],     region: 3, cleared: false },
      { id: 312, type: "passage", name: "Abyssal Gate",         x: 70, y: 32, connections: [310, 311, 313],     region: 3, cleared: false },
      { id: 313, type: "boss",    name: "Shadow Lord's Throne", x: 86, y: 40, connections: [311, 312],          region: 3, cleared: false },
    ],
  },
  {
    id: 4,
    name: "Crystal Desert",
    theme: "Earth",
    unlocked: false,
    nodes: [
      { id: 400, type: "hut",     name: "Desert Hut",          x: 10, y: 76, connections: [401, 402],          region: 4, cleared: false },
      { id: 401, type: "passage", name: "Sand Gate",            x: 22, y: 62, connections: [400, 403, 404],     region: 4, cleared: false },
      { id: 402, type: "passage", name: "Dust Trail",           x: 16, y: 48, connections: [400, 405],          region: 4, cleared: false },
      { id: 403, type: "passage", name: "Dune Path",            x: 36, y: 74, connections: [401, 406],          region: 4, cleared: false },
      { id: 404, type: "shop",    name: "Oasis Market",         x: 34, y: 48, connections: [401, 405, 407],     region: 4, cleared: false },
      { id: 405, type: "passage", name: "Sandstorm Gulch",      x: 26, y: 34, connections: [402, 404, 408],     region: 4, cleared: false },
      { id: 406, type: "passage", name: "Crystal Wastes",       x: 50, y: 68, connections: [403, 409],          region: 4, cleared: false },
      { id: 407, type: "passage", name: "Mirage Ruins",         x: 48, y: 42, connections: [404, 409, 410],     region: 4, cleared: false },
      { id: 408, type: "shaman",  name: "Earth Shaman",         x: 38, y: 20, connections: [405, 410],          region: 4, cleared: false },
      { id: 409, type: "rest",    name: "Desert Oasis",         x: 62, y: 58, connections: [406, 407, 411],     region: 4, cleared: false },
      { id: 410, type: "passage", name: "Titan's Canyon",       x: 56, y: 30, connections: [407, 408, 412],     region: 4, cleared: false },
      { id: 411, type: "passage", name: "Quartz Valley",        x: 74, y: 52, connections: [409, 412, 413],     region: 4, cleared: false },
      { id: 412, type: "passage", name: "Obsidian Gate",        x: 72, y: 34, connections: [410, 411, 413],     region: 4, cleared: false },
      { id: 413, type: "boss",    name: "Crystal Titan's Keep", x: 88, y: 42, connections: [411, 412],          region: 4, cleared: false },
    ],
  },
];

export const REGION_TIER_VARIANTS: Record<number, Record<number, Region>> = {};

export function getRegionForTier(regionId: number, tier: number): Region {
  if (tier > 0 && REGION_TIER_VARIANTS[regionId]?.[tier]) {
    return REGION_TIER_VARIANTS[regionId][tier];
  }
  return REGIONS[regionId];
}

export function isRegionUnlocked(regionId: number, regionBossDefeats: Record<string, number>): boolean {
  if (regionId === 0) return true;
  return (regionBossDefeats[String(regionId - 1)] || 0) >= 1;
}

export function getRegionTier(regionId: number, regionBossDefeats: Record<string, number>): number {
  return regionBossDefeats[String(regionId)] || 0;
}

export const PERKS: Perk[] = [
  { id: "fire_atk", name: "Flames Of The Burning Heart", description: "Increase ATK by 10%", element: "Fire", tier: 1, requiredLevel: 1, effect: { percentStat: "atk", percentAmount: 10 } },
  { id: "fire_dodge", name: "Ember Feint", description: "Increase dodge chance by 10%", element: "Fire", tier: 1, requiredLevel: 4, effect: { special: "dodge", percentAmount: 10 } },
  { id: "fire_elemental_attack", name: "Heat Charge", description: "Adds fire element to basic attack", element: "Fire", tier: 2, requiredLevel: 6, effect: { special: "elemental_basic_attack" } },
  { id: "fire_damage_reduction", name: "Blazing Aura", description: "Decrease incoming non-magic damage by 5%", element: "Fire", tier: 2, requiredLevel: 10, effect: { special: "phys_damage_reduction", percentAmount: 5 } },

  { id: "wind_agi", name: "Calm Of The Storm", description: "Increase AGI by 10%", element: "Wind", tier: 1, requiredLevel: 1, effect: { percentStat: "agi", percentAmount: 10 } },
  { id: "wind_atk", name: "Fujin's Bravery", description: "Increase ATK by 10%", element: "Wind", tier: 1, requiredLevel: 4, effect: { percentStat: "atk", percentAmount: 10 } },
  { id: "wind_elemental_attack", name: "Clinging Hurricane", description: "Adds wind element to basic attack", element: "Wind", tier: 2, requiredLevel: 6, effect: { special: "elemental_basic_attack" } },
  { id: "wind_dodge", name: "Wind Step", description: "Increase dodge chance by 5%", element: "Wind", tier: 2, requiredLevel: 10, effect: { special: "dodge", percentAmount: 5 } },

  { id: "lightning_crit", name: "Thunder Strike", description: "+10% crit", element: "Lightning", tier: 1, requiredLevel: 1, effect: { special: "crit" } },
  { id: "lightning_chain", name: "Chain Lightning", description: "Attacks chain to nearby", element: "Lightning", tier: 2, requiredLevel: 4, effect: { special: "chain" } },
  { id: "water_regen", name: "Tidal Heal", description: "Regen 5 HP per turn", element: "Water", tier: 1, requiredLevel: 1, effect: { special: "regen" } },
  { id: "water_int", name: "Deep Wisdom", description: "+5 INT", element: "Water", tier: 1, requiredLevel: 1, effect: { stat: "int", amount: 5 } },
  { id: "water_debuff", name: "Frost Touch", description: "Spells slow enemies", element: "Water", tier: 2, requiredLevel: 4, effect: { special: "slow" } },
  { id: "earth_def", name: "Stone Skin", description: "+5 DEF", element: "Earth", tier: 1, requiredLevel: 1, effect: { stat: "def", amount: 5 } },
  { id: "earth_hp", name: "Mountain Heart", description: "+20 HP", element: "Earth", tier: 1, requiredLevel: 1, effect: { stat: "maxHp", amount: 20 } },
  { id: "shadow_lifesteal", name: "Soul Drain", description: "Steal 10% damage as HP", element: "Shadow", tier: 1, requiredLevel: 1, effect: { special: "lifesteal" } },
  { id: "shadow_dodge", name: "Fade", description: "+10% dodge", element: "Shadow", tier: 1, requiredLevel: 1, effect: { special: "dodge", percentAmount: 10 } },
  { id: "light_heal", name: "Divine Light", description: "Heal spell +50% power", element: "Light", tier: 1, requiredLevel: 1, effect: { special: "heal_boost" } },
  { id: "light_amp", name: "Radiance", description: "+5 INT, +3 LUCK", element: "Light", tier: 1, requiredLevel: 1, effect: { stat: "int", amount: 5 } },
  { id: "ice_freeze", name: "Deep Freeze", description: "10% chance to freeze", element: "Ice", tier: 1, requiredLevel: 1, effect: { special: "freeze" } },
  { id: "ice_aoe", name: "Blizzard", description: "Ice spells slow all enemies", element: "Ice", tier: 2, requiredLevel: 4, effect: { special: "aoe_slow" } },
];

export const SPELLS: Spell[] = [
  { id: "speed_up", name: "Speed Up", description: "+5 AGI for 2 turns", mpCost: 8, type: "buff", targetType: "self", effect: { stat: "agi", amount: 5, duration: 2 } },
  { id: "fire_bolt", name: "Incineration Slash", description: "Blazing slash engulfing one enemy in flames", mpCost: 10, type: "damage", element: "Fire", targetType: "enemy", animation: "incinerationSlash", effect: { damageMultiplier: 0.8 } },
  { id: "eruption_cleave", name: "Eruption Cleave", description: "A devastating flame-charged cleave ending in a massive explosion", mpCost: 18, type: "damage", element: "Fire", targetType: "enemy", animation: "eruptionCleave", effect: { damageMultiplier: 1.5 } },
  { id: "ice_lance", name: "Ice Lance", description: "Ice damage to one enemy", mpCost: 10, type: "damage", element: "Ice", targetType: "enemy", effect: { damageMultiplier: 1.8 } },
  { id: "thunder", name: "Thunder", description: "Lightning damage to one enemy", mpCost: 12, type: "damage", element: "Lightning", targetType: "enemy", animation: "thunderBolt", effect: { damageMultiplier: 0.75 } },
  { id: "shadow_strike", name: "Shadow Strike", description: "Shadow damage to one enemy", mpCost: 10, type: "damage", element: "Shadow", targetType: "enemy", effect: { damageMultiplier: 1.8 } },
  { id: "wind_blade", name: "Wind Blade", description: "Sharp wind slash on one enemy", mpCost: 10, type: "damage", element: "Wind", targetType: "enemy", animation: "windBlade", effect: { damageMultiplier: 0.75 } },
  { id: "gale_slash", name: "Gale Slash", description: "Wind blades slash all enemies", mpCost: 15, type: "damage", element: "Wind", targetType: "allEnemies", animation: "galeSlash", effect: { damageMultiplier: 0.75 } },
  { id: "tempest", name: "Tempest", description: "Devastating wind vortex on all enemies", mpCost: 22, type: "damage", element: "Wind", targetType: "allEnemies", animation: "tempest", effect: { damageMultiplier: 1.8 } },
  { id: "fujin_slice", name: "Fujin's Slice", description: "Wind blade barrage on one enemy", mpCost: 14, type: "damage", element: "Wind", targetType: "enemy", animation: "fujinSlice", effect: { damageMultiplier: 1.5 } },
  { id: "earth_quake", name: "Earthquake", description: "Earth damage to all enemies", mpCost: 15, type: "damage", element: "Earth", targetType: "allEnemies", effect: { damageMultiplier: 1.2 } },
  { id: "holy_light", name: "Holy Light", description: "Light damage + heal 15 HP", mpCost: 14, type: "damage", element: "Light", targetType: "enemy", effect: { damageMultiplier: 1.5 } },
  { id: "aqua_wave", name: "Aqua Wave", description: "Water damage to all enemies", mpCost: 15, type: "damage", element: "Water", targetType: "allEnemies", effect: { damageMultiplier: 1.2 } },
  { id: "heal", name: "Heal", description: "Restore 40 HP", mpCost: 12, type: "heal", targetType: "self", effect: { stat: "hp", amount: 40 } },
  { id: "power_up", name: "Power Up", description: "+5 ATK for 2 turns", mpCost: 10, type: "buff", targetType: "self", effect: { stat: "atk", amount: 5, duration: 2 } },
  { id: "iron_wall", name: "Iron Wall", description: "+5 DEF for 2 turns", mpCost: 10, type: "buff", targetType: "self", effect: { stat: "def", amount: 5, duration: 2 } },
];

export interface SpellUnlock {
  spellId: string;
  level: number;
}

export const ELEMENT_SPELL_UNLOCKS: Record<Element, SpellUnlock[]> = {
  Fire: [
    { spellId: "fire_bolt", level: 1 },
    { spellId: "eruption_cleave", level: 4 },
    { spellId: "power_up", level: 4 },
  ],
  Water: [
    { spellId: "aqua_wave", level: 1 },
    { spellId: "iron_wall", level: 4 },
  ],
  Wind: [
    { spellId: "wind_blade", level: 1 },
    { spellId: "gale_slash", level: 3 },
    { spellId: "fujin_slice", level: 5 },
    { spellId: "tempest", level: 7 },
  ],
  Earth: [
    { spellId: "earth_quake", level: 1 },
    { spellId: "iron_wall", level: 3 },
  ],
  Lightning: [
    { spellId: "thunder", level: 1 },
    { spellId: "speed_up", level: 3 },
  ],
  Shadow: [
    { spellId: "shadow_strike", level: 1 },
    { spellId: "speed_up", level: 4 },
  ],
  Light: [
    { spellId: "holy_light", level: 1 },
    { spellId: "heal", level: 3 },
  ],
  Ice: [
    { spellId: "ice_lance", level: 1 },
    { spellId: "iron_wall", level: 4 },
  ],
};

export const SHAMAN_SPELLS: Record<string, string[]> = {
  knight: ["heal", "iron_wall"],
  samurai: ["heal", "speed_up"],
  basken: ["heal", "power_up"],
  knight2d: ["power_up", "speed_up"],
  axewarrior: ["heal", "iron_wall"],
  ranger: ["heal", "speed_up"],
};

export function getSpellsForLevel(element: Element, level: number): Spell[] {
  const unlocks = ELEMENT_SPELL_UNLOCKS[element] || [];
  const spells: Spell[] = [];
  for (const unlock of unlocks) {
    if (level >= unlock.level) {
      const spell = SPELLS.find(s => s.id === unlock.spellId);
      if (spell) spells.push(spell);
    }
  }
  return spells;
}

export function getNewSpellsAtLevel(element: Element, level: number): Spell[] {
  const unlocks = ELEMENT_SPELL_UNLOCKS[element] || [];
  const spells: Spell[] = [];
  for (const unlock of unlocks) {
    if (unlock.level === level) {
      const spell = SPELLS.find(s => s.id === unlock.spellId);
      if (spell) spells.push(spell);
    }
  }
  return spells;
}

export function getPlayerSpells(player: PlayerCharacter): Spell[] {
  const spells = getSpellsForLevel(player.element, player.level);
  const learnedIds = new Set(spells.map(s => s.id));

  const speedUp = SPELLS.find(s => s.id === "speed_up");
  if (speedUp && !learnedIds.has("speed_up")) {
    spells.push(speedUp);
    learnedIds.add("speed_up");
  }

  if (player.learnedSpells) {
    for (const spellId of player.learnedSpells) {
      if (!learnedIds.has(spellId)) {
        const spell = SPELLS.find(s => s.id === spellId);
        if (spell) {
          spells.push(spell);
          learnedIds.add(spellId);
        }
      }
    }
  }

  return spells;
}

export function getPartyMemberSpells(element: Element, level: number = 1, learnedSpells: string[] = []): Spell[] {
  const spells = getSpellsForLevel(element, level);
  const learnedIds = new Set(spells.map(s => s.id));

  for (const spellId of learnedSpells) {
    if (!learnedIds.has(spellId)) {
      const spell = SPELLS.find(s => s.id === spellId);
      if (spell) {
        spells.push(spell);
        learnedIds.add(spellId);
      }
    }
  }

  return spells;
}

export function getShopItems(region: Region): ShopItem[] {
  const tier = region.id + 1;
  return [
    { id: `hp_pot_${tier}`, name: "Health Potion", type: "consumable", description: `Restores ${20 + tier * 10} HP`, effect: { type: "heal", stat: "hp", amount: 20 + tier * 10 }, icon: "heart", value: 10 + tier * 5, price: 15 + tier * 5, stock: 5 },
    { id: `mp_pot_${tier}`, name: "Mana Potion", type: "consumable", description: `Restores ${15 + tier * 5} MP`, effect: { type: "heal", stat: "mp", amount: 15 + tier * 5 }, icon: "droplets", value: 10 + tier * 5, price: 12 + tier * 5, stock: 5 },
    { id: `sword_${tier}`, name: `${region.name} Blade`, type: "weapon", description: `+${3 + tier * 2} ATK (${region.theme})`, effect: { type: "equip", stat: "atk", amount: 3 + tier * 2 }, icon: "sword", value: 30 + tier * 15, price: 50 + tier * 20, stock: 1, element: region.theme },
    { id: `armor_${tier}`, name: `${region.name} Mail`, type: "armor", description: `+${2 + tier * 2} DEF`, effect: { type: "equip", stat: "def", amount: 2 + tier * 2 }, icon: "shield", value: 25 + tier * 12, price: 45 + tier * 18, stock: 1 },
    { id: `ring_${tier}`, name: `${region.name} Ring`, type: "accessory", description: `+${1 + tier} LUCK`, effect: { type: "equip", stat: "luck", amount: 1 + tier }, icon: "gem", value: 20 + tier * 10, price: 40 + tier * 15, stock: 1 },
  ];
}

export const BASE_CRIT_CHANCE = 0.05;
export const BASE_CRIT_DAMAGE = 2.0;
export const RNG_MIN = 0.90;
export const RNG_MAX = 1.10;
export const MIN_DAMAGE = 1;
export const ELEMENT_ADVANTAGE = 1.3;
export const ELEMENT_NEUTRAL = 1.0;
export const ELEMENT_DISADVANTAGE = 0.7;

const ELEMENT_EFFECTIVENESS: Record<string, Record<string, number>> = {
  Fire: { Ice: ELEMENT_ADVANTAGE, Shadow: ELEMENT_NEUTRAL, Earth: ELEMENT_DISADVANTAGE, Fire: ELEMENT_DISADVANTAGE },
  Ice: { Fire: ELEMENT_DISADVANTAGE, Shadow: ELEMENT_NEUTRAL, Earth: ELEMENT_ADVANTAGE, Ice: ELEMENT_DISADVANTAGE },
  Shadow: { Fire: ELEMENT_NEUTRAL, Ice: ELEMENT_NEUTRAL, Earth: ELEMENT_NEUTRAL, Shadow: ELEMENT_DISADVANTAGE },
  Earth: { Fire: ELEMENT_ADVANTAGE, Ice: ELEMENT_DISADVANTAGE, Shadow: ELEMENT_NEUTRAL, Earth: ELEMENT_DISADVANTAGE },
};

export function getElementMultiplier(attackElement?: string, defenderElement?: string): { multiplier: number; label: string } {
  if (!attackElement || !defenderElement) return { multiplier: ELEMENT_NEUTRAL, label: "" };
  const mult = ELEMENT_EFFECTIVENESS[attackElement]?.[defenderElement] ?? ELEMENT_NEUTRAL;
  if (mult > ELEMENT_NEUTRAL) return { multiplier: mult, label: "Super effective!" };
  if (mult < ELEMENT_NEUTRAL) return { multiplier: mult, label: "Not very effective..." };
  return { multiplier: ELEMENT_NEUTRAL, label: "" };
}

export function calculateDamage(
  attacker: PlayerStats,
  defender: PlayerStats,
  isMagic: boolean,
  attackElement?: string,
  defenderElement?: string,
  skillMultiplier: number = 1.0,
  critChanceModifier: number = 0,
  critDamageModifier: number = 0,
): { damage: number; isCrit: boolean; elementLabel: string } {
  const offense = isMagic ? attacker.int * 2.5 : attacker.atk;
  const defense = isMagic ? Math.floor(defender.def * 0.4) : defender.def;
  const { multiplier: elementMultiplier, label: elementLabel } = getElementMultiplier(attackElement, defenderElement);

  const baseDamage = offense * skillMultiplier;
  const elementAdjusted = baseDamage * elementMultiplier;

  let damage = Math.max(elementAdjusted - defense, MIN_DAMAGE);
  const finalCritChance = BASE_CRIT_CHANCE + critChanceModifier;
  const isCrit = Math.random() < finalCritChance;
  if (isCrit) {
    damage = damage * (BASE_CRIT_DAMAGE + critDamageModifier);
  }
  const variance = RNG_MIN + Math.random() * (RNG_MAX - RNG_MIN);
  damage = Math.round(damage * variance);
  damage = Math.max(damage, MIN_DAMAGE);
  return { damage, isCrit, elementLabel };
}

export function checkDodge(defender: PlayerStats, perks?: string[]): boolean {
  let dodgeChance = Math.min(0.25, defender.agi * 0.015);
  if (perks) {
    for (const perkId of perks) {
      const perk = PERKS.find(p => p.id === perkId);
      if (perk && perk.effect.special === "dodge" && perk.effect.percentAmount) {
        dodgeChance += perk.effect.percentAmount / 100;
      }
    }
  }
  return Math.random() < dodgeChance;
}

export function buildTurnQueue(
  playerAgi: number,
  party: BattlePartyMember[],
  enemies: (Enemy & { currentHp: number })[]
): TurnQueueEntry[] {
  const entries: TurnQueueEntry[] = [];
  entries.push({ type: "player", index: 0, agi: playerAgi });
  party.forEach((p, i) => {
    if (p.currentHp > 0) {
      entries.push({ type: "party", index: i, agi: p.stats.agi || 10 });
    }
  });
  enemies.forEach((e, i) => {
    if (e.currentHp > 0) {
      entries.push({ type: "enemy", index: i, agi: e.stats.agi || 10 });
    }
  });
  entries.sort((a, b) => b.agi - a.agi);
  return entries;
}

export function initBattle(enemies: Enemy[]): BattleState {
  return {
    phase: "start",
    enemies: enemies.map(e => ({ ...e, currentHp: e.stats.hp })),
    playerHp: 0,
    playerMp: 0,
    turnOrder: [],
    currentTurn: 0,
    log: ["Battle begins!"],
    selectedAction: null,
    selectedTarget: null,
    animation: null,
    defending: false,
    buffs: [],
    turnCount: 0,
    party: [],
    activePartyIndex: 0,
    turnQueue: [],
    turnQueueIndex: 0,
    gridPositions: {
      player: 0,
      party: [],
      enemies: enemies.map((_, i) => i % 3),
    },
  };
}
