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
    name: "Basken",
    className: "Warrior",
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
    name: "Basken",
    className: "Warrior",
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
    attack: { sheet: "samurai-attack.png", frameWidth: 96, frameHeight: 96, totalFrames: 10 },
    run: { sheet: "samurai-run.png", frameWidth: 96, frameHeight: 96, totalFrames: 8 },
    hurt: { sheet: "samurai-hurt.png", frameWidth: 96, frameHeight: 96, totalFrames: 3 },
  },
  knight: {
    idle: { sheet: "knight-idle-4f.png", frameWidth: 86, frameHeight: 98, totalFrames: 4 },
    attack: { sheet: "knight-attack.png", frameWidth: 86, frameHeight: 98, totalFrames: 7 },
    run: { sheet: "knight-run.png", frameWidth: 86, frameHeight: 98, totalFrames: 6 },
    hurt: { sheet: "knight-hurt.png", frameWidth: 86, frameHeight: 98, totalFrames: 2 },
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

export function createNewPlayer(starterDef: PartyMemberDef, name: string, color: EnergyColor, shape: EnergyShape): PlayerCharacter {
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
    defeatedBosses: [],
    spriteId: starterDef.spriteId,
    starterCharacterId: starterDef.id,
    regionBossDefeats: {},
  };
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

const ENEMY_POOL: Omit<Enemy, "stats">[] = [
  { id: "slime_fire", name: "Fire Demon", element: "Fire", level: 1, xpReward: 18, goldReward: 8, isBoss: false, sprite: "flame" },
  { id: "slime_water", name: "Aqua Slime", element: "Water", level: 1, xpReward: 15, goldReward: 7, isBoss: false, sprite: "droplets" },
  { id: "wolf_wind", name: "Storm Wolf", element: "Wind", level: 1, xpReward: 20, goldReward: 9, isBoss: false, sprite: "wind" },
  { id: "golem_earth", name: "Stone Golem", element: "Earth", level: 2, xpReward: 28, goldReward: 12, isBoss: false, sprite: "mountain" },
  { id: "wisp_light", name: "Light Wisp", element: "Light", level: 1, xpReward: 16, goldReward: 7, isBoss: false, sprite: "sun" },
  { id: "shade", name: "Dark Shade", element: "Shadow", level: 2, xpReward: 25, goldReward: 11, isBoss: false, sprite: "ghost" },
  { id: "spark_bug", name: "Spark Bug", element: "Lightning", level: 1, xpReward: 18, goldReward: 8, isBoss: false, sprite: "zap" },
  { id: "frost_lizard", name: "Frost Lizard", element: "Ice", level: 1, xpReward: 19, goldReward: 8, isBoss: false, sprite: "snowflake" },
  { id: "dragon_lord", name: "Dragon Lord", element: "Fire", level: 4, xpReward: 120, goldReward: 50, isBoss: true, sprite: "flame" },
  { id: "jotem", name: "Jotem", element: "Ice", level: 4, xpReward: 120, goldReward: 50, isBoss: true, sprite: "snowflake" },
  { id: "kraken", name: "Deep Kraken", element: "Water", level: 5, xpReward: 150, goldReward: 60, isBoss: true, sprite: "droplets" },
  { id: "shadow_lord", name: "Shadow Lord", element: "Shadow", level: 6, xpReward: 200, goldReward: 80, isBoss: true, sprite: "ghost" },
  { id: "crystal_titan", name: "Crystal Titan", element: "Earth", level: 7, xpReward: 250, goldReward: 100, isBoss: true, sprite: "diamond" },
];

export function generateEnemyStats(base: Omit<Enemy, "stats">, scaleFactor: number): Enemy {
  const lv = base.level * scaleFactor;
  const vary = base.isBoss ? () => 1.0 : () => 0.9 + Math.random() * 0.2;

  if (base.isBoss) {
    const hp = Math.floor((50 + lv * 25) * vary());
    return {
      ...base,
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

  const hp = Math.floor((18 + lv * 10) * vary());
  return {
    ...base,
    stats: {
      hp,
      maxHp: hp,
      atk: Math.floor((5 + lv * 2.5) * vary()),
      def: Math.floor((3 + lv * 1.5) * vary()),
      agi: Math.floor((4 + lv * 1.5) * vary()),
      int: Math.floor((4 + lv * 2) * vary()),
      luck: Math.floor((2 + lv) * vary()),
      mp: Math.floor((15 + lv * 5) * vary()),
      maxMp: Math.floor((15 + lv * 5) * vary()),
    },
  };
}

export function getEnemiesForNode(node: OverworldNode, region: Region, tier: number = 0): Enemy[] {
  const regionElement = region.theme;
  const baseScale = 1 + region.id * 0.5;
  const tierScale = 1 + tier * 0.25;
  const scale = baseScale * tierScale;
  const pool = ENEMY_POOL.filter(e => {
    if (node.type === "boss") return e.isBoss;
    return !e.isBoss;
  });

  const preferredPool = pool.filter(e => e.element === regionElement);
  const selectedPool = preferredPool.length > 0 ? preferredPool : pool;

  const count = node.type === "boss" ? 1 : 1 + Math.floor(Math.random() * 2);
  const enemies: Enemy[] = [];
  for (let i = 0; i < count; i++) {
    const base = selectedPool[Math.floor(Math.random() * selectedPool.length)];
    const enemy = generateEnemyStats(base, scale);
    enemy.xpReward = Math.floor(enemy.xpReward * tierScale);
    enemy.goldReward = Math.floor(enemy.goldReward * tierScale);
    enemies.push(enemy);
  }
  return enemies;
}

export const REGIONS: Region[] = [
  {
    id: 0,
    name: "Ember Plains",
    theme: "Fire",
    unlocked: true,
    nodes: [
      { id: 0, type: "hut", name: "Ember Hut", x: 8, y: 82, connections: [1, 2], region: 0, cleared: false },
      { id: 1, type: "battle", name: "Scorched Path", x: 18, y: 68, connections: [0, 3, 4], region: 0, cleared: false },
      { id: 2, type: "battle", name: "Cinder Trail", x: 14, y: 52, connections: [0, 5], region: 0, cleared: false },
      { id: 3, type: "battle", name: "Flame Ridge", x: 30, y: 78, connections: [1, 6], region: 0, cleared: false },
      { id: 4, type: "shop", name: "Merchant Camp", x: 28, y: 55, connections: [1, 5, 7], region: 0, cleared: false },
      { id: 5, type: "battle", name: "Ash Hollow", x: 22, y: 38, connections: [2, 4, 8], region: 0, cleared: false },
      { id: 6, type: "battle", name: "Lava Flow", x: 42, y: 72, connections: [3, 9], region: 0, cleared: false },
      { id: 7, type: "battle", name: "Smolder Ruins", x: 42, y: 48, connections: [4, 9, 10], region: 0, cleared: false },
      { id: 8, type: "shaman", name: "Fire Shaman's Hut", x: 32, y: 25, connections: [5, 10], region: 0, cleared: false },
      { id: 9, type: "rest", name: "Hot Spring", x: 55, y: 62, connections: [6, 7, 11], region: 0, cleared: false },
      { id: 10, type: "battle", name: "Magma Cavern", x: 50, y: 35, connections: [7, 8, 12], region: 0, cleared: false },
      { id: 11, type: "battle", name: "Inferno Gorge", x: 68, y: 55, connections: [9, 12, 13], region: 0, cleared: false },
      { id: 12, type: "battle", name: "Volcano Pass", x: 65, y: 38, connections: [10, 11, 13], region: 0, cleared: false },
      { id: 13, type: "boss", name: "Dragon Lord's Sanctum", x: 82, y: 45, connections: [11, 12], region: 0, cleared: false },
    ],
  },
  {
    id: 1,
    name: "Frozen Depths",
    theme: "Ice",
    unlocked: false,
    nodes: [
      { id: 10, type: "hut", name: "Frost Hut", x: 10, y: 80, connections: [11, 12], region: 1, cleared: false },
      { id: 11, type: "battle", name: "Frost Gate", x: 20, y: 65, connections: [10, 13, 14], region: 1, cleared: false },
      { id: 12, type: "battle", name: "Icicle Path", x: 12, y: 55, connections: [10, 15], region: 1, cleared: false },
      { id: 13, type: "battle", name: "Glacier Pass", x: 32, y: 75, connections: [11, 16], region: 1, cleared: false },
      { id: 14, type: "shop", name: "Ice Merchant", x: 30, y: 52, connections: [11, 15, 17], region: 1, cleared: false },
      { id: 15, type: "battle", name: "Frozen Falls", x: 24, y: 38, connections: [12, 14, 18], region: 1, cleared: false },
      { id: 16, type: "battle", name: "Blizzard Peak", x: 45, y: 68, connections: [13, 19], region: 1, cleared: false },
      { id: 17, type: "battle", name: "Crystal Cavern", x: 44, y: 45, connections: [14, 19, 20], region: 1, cleared: false },
      { id: 18, type: "shaman", name: "Frost Shaman", x: 35, y: 22, connections: [15, 20], region: 1, cleared: false },
      { id: 19, type: "rest", name: "Warm Cavern", x: 58, y: 58, connections: [16, 17, 21], region: 1, cleared: false },
      { id: 20, type: "battle", name: "Permafrost Depths", x: 52, y: 32, connections: [17, 18, 22], region: 1, cleared: false },
      { id: 21, type: "battle", name: "Avalanche Ridge", x: 70, y: 52, connections: [19, 22, 23], region: 1, cleared: false },
      { id: 22, type: "battle", name: "Ice Throne Path", x: 68, y: 35, connections: [20, 21, 23], region: 1, cleared: false },
      { id: 23, type: "boss", name: "Jotem's Lair", x: 84, y: 42, connections: [21, 22], region: 1, cleared: false },
    ],
  },
  {
    id: 2,
    name: "Shadow Forest",
    theme: "Shadow",
    unlocked: false,
    nodes: [
      { id: 20, type: "hut", name: "Shadow Hut", x: 10, y: 78, connections: [21, 22], region: 2, cleared: false },
      { id: 21, type: "battle", name: "Dark Entrance", x: 20, y: 62, connections: [20, 23, 24], region: 2, cleared: false },
      { id: 22, type: "battle", name: "Twilight Trail", x: 15, y: 48, connections: [20, 25], region: 2, cleared: false },
      { id: 23, type: "battle", name: "Mist Trail", x: 34, y: 72, connections: [21, 26], region: 2, cleared: false },
      { id: 24, type: "shop", name: "Shade Dealer", x: 32, y: 50, connections: [21, 25, 27], region: 2, cleared: false },
      { id: 25, type: "battle", name: "Phantom Woods", x: 25, y: 35, connections: [22, 24, 28], region: 2, cleared: false },
      { id: 26, type: "battle", name: "Cursed Bog", x: 48, y: 66, connections: [23, 29], region: 2, cleared: false },
      { id: 27, type: "battle", name: "Specter Hollow", x: 46, y: 42, connections: [24, 29, 30], region: 2, cleared: false },
      { id: 28, type: "shaman", name: "Shadow Shaman", x: 36, y: 20, connections: [25, 30], region: 2, cleared: false },
      { id: 29, type: "rest", name: "Moonlit Glade", x: 60, y: 56, connections: [26, 27, 31], region: 2, cleared: false },
      { id: 30, type: "battle", name: "Void Corridor", x: 54, y: 30, connections: [27, 28, 32], region: 2, cleared: false },
      { id: 31, type: "battle", name: "Nightmare Fen", x: 72, y: 50, connections: [29, 32, 33], region: 2, cleared: false },
      { id: 32, type: "battle", name: "Abyssal Gate", x: 70, y: 32, connections: [30, 31, 33], region: 2, cleared: false },
      { id: 33, type: "boss", name: "Shadow Lord's Throne", x: 86, y: 40, connections: [31, 32], region: 2, cleared: false },
    ],
  },
  {
    id: 3,
    name: "Crystal Desert",
    theme: "Earth",
    unlocked: false,
    nodes: [
      { id: 30, type: "hut", name: "Desert Hut", x: 10, y: 76, connections: [31, 32], region: 3, cleared: false },
      { id: 31, type: "battle", name: "Sand Gate", x: 22, y: 62, connections: [30, 33, 34], region: 3, cleared: false },
      { id: 32, type: "battle", name: "Dust Trail", x: 16, y: 48, connections: [30, 35], region: 3, cleared: false },
      { id: 33, type: "battle", name: "Dune Path", x: 36, y: 74, connections: [31, 36], region: 3, cleared: false },
      { id: 34, type: "shop", name: "Oasis Market", x: 34, y: 48, connections: [31, 35, 37], region: 3, cleared: false },
      { id: 35, type: "battle", name: "Sandstorm Gulch", x: 26, y: 34, connections: [32, 34, 38], region: 3, cleared: false },
      { id: 36, type: "battle", name: "Crystal Wastes", x: 50, y: 68, connections: [33, 39], region: 3, cleared: false },
      { id: 37, type: "battle", name: "Mirage Ruins", x: 48, y: 42, connections: [34, 39, 40], region: 3, cleared: false },
      { id: 38, type: "shaman", name: "Earth Shaman", x: 38, y: 20, connections: [35, 40], region: 3, cleared: false },
      { id: 39, type: "rest", name: "Desert Oasis", x: 62, y: 58, connections: [36, 37, 41], region: 3, cleared: false },
      { id: 40, type: "battle", name: "Titan's Canyon", x: 56, y: 30, connections: [37, 38, 42], region: 3, cleared: false },
      { id: 41, type: "battle", name: "Quartz Valley", x: 74, y: 52, connections: [39, 42, 43], region: 3, cleared: false },
      { id: 42, type: "battle", name: "Obsidian Gate", x: 72, y: 34, connections: [40, 41, 43], region: 3, cleared: false },
      { id: 43, type: "boss", name: "Crystal Titan's Keep", x: 88, y: 42, connections: [41, 42], region: 3, cleared: false },
    ],
  },
];

export function isRegionUnlocked(regionId: number, regionBossDefeats: Record<string, number>): boolean {
  if (regionId === 0) return true;
  return (regionBossDefeats[String(regionId - 1)] || 0) >= 3;
}

export function getRegionTier(regionId: number, regionBossDefeats: Record<string, number>): number {
  return regionBossDefeats[String(regionId)] || 0;
}

export const PERKS: Perk[] = [
  { id: "fire_burn", name: "Burn Chance", description: "10% chance to burn on attack", element: "Fire", tier: 1, effect: { special: "burn" } },
  { id: "fire_atk", name: "Flame Power", description: "+5 ATK", element: "Fire", tier: 1, effect: { stat: "atk", amount: 5 } },
  { id: "fire_aoe", name: "Inferno", description: "Fire spells hit all enemies", element: "Fire", tier: 2, effect: { special: "aoe_fire" } },
  { id: "water_regen", name: "Tidal Heal", description: "Regen 5 HP per turn", element: "Water", tier: 1, effect: { special: "regen" } },
  { id: "water_int", name: "Deep Wisdom", description: "+5 INT", element: "Water", tier: 1, effect: { stat: "int", amount: 5 } },
  { id: "water_debuff", name: "Frost Touch", description: "Spells slow enemies", element: "Water", tier: 2, effect: { special: "slow" } },
  { id: "wind_agi", name: "Gale Speed", description: "+5 AGI", element: "Wind", tier: 1, effect: { stat: "agi", amount: 5 } },
  { id: "wind_dodge", name: "Wind Step", description: "+15% dodge", element: "Wind", tier: 1, effect: { special: "dodge" } },
  { id: "earth_def", name: "Stone Skin", description: "+5 DEF", element: "Earth", tier: 1, effect: { stat: "def", amount: 5 } },
  { id: "earth_hp", name: "Mountain Heart", description: "+20 HP", element: "Earth", tier: 1, effect: { stat: "maxHp", amount: 20 } },
  { id: "lightning_crit", name: "Thunder Strike", description: "+10% crit", element: "Lightning", tier: 1, effect: { special: "crit" } },
  { id: "lightning_chain", name: "Chain Lightning", description: "Attacks chain to nearby", element: "Lightning", tier: 2, effect: { special: "chain" } },
  { id: "shadow_lifesteal", name: "Soul Drain", description: "Steal 10% damage as HP", element: "Shadow", tier: 1, effect: { special: "lifesteal" } },
  { id: "shadow_dodge", name: "Fade", description: "+10% dodge", element: "Shadow", tier: 1, effect: { special: "dodge" } },
  { id: "light_heal", name: "Divine Light", description: "Heal spell +50% power", element: "Light", tier: 1, effect: { special: "heal_boost" } },
  { id: "light_amp", name: "Radiance", description: "+5 INT, +3 LUCK", element: "Light", tier: 1, effect: { stat: "int", amount: 5 } },
  { id: "ice_freeze", name: "Deep Freeze", description: "10% chance to freeze", element: "Ice", tier: 1, effect: { special: "freeze" } },
  { id: "ice_aoe", name: "Blizzard", description: "Ice spells slow all enemies", element: "Ice", tier: 2, effect: { special: "aoe_slow" } },
];

export const SPELLS: Spell[] = [
  { id: "speed_up", name: "Speed Up", description: "+5 AGI for 2 turns", mpCost: 8, type: "buff", targetType: "self", effect: { stat: "agi", amount: 5, duration: 2 } },
  { id: "fire_bolt", name: "Fire Bolt", description: "Fire damage to one enemy", mpCost: 10, type: "damage", element: "Fire", targetType: "enemy", effect: { damageMultiplier: 1.8 } },
  { id: "ice_lance", name: "Ice Lance", description: "Ice damage to one enemy", mpCost: 10, type: "damage", element: "Ice", targetType: "enemy", effect: { damageMultiplier: 1.8 } },
  { id: "thunder", name: "Thunder", description: "Lightning damage to one enemy", mpCost: 12, type: "damage", element: "Lightning", targetType: "enemy", effect: { damageMultiplier: 2.0 } },
  { id: "shadow_strike", name: "Shadow Strike", description: "Shadow damage to one enemy", mpCost: 10, type: "damage", element: "Shadow", targetType: "enemy", effect: { damageMultiplier: 1.8 } },
  { id: "wind_blade", name: "Wind Blade", description: "Sharp wind slash on one enemy", mpCost: 10, type: "damage", element: "Wind", targetType: "enemy", animation: "windBlade", effect: { damageMultiplier: 1.8 } },
  { id: "gale_slash", name: "Gale Slash", description: "Wind blades slash all enemies", mpCost: 15, type: "damage", element: "Wind", targetType: "allEnemies", animation: "galeSlash", effect: { damageMultiplier: 1.3 } },
  { id: "tempest", name: "Tempest", description: "Devastating wind vortex on all enemies", mpCost: 22, type: "damage", element: "Wind", targetType: "allEnemies", animation: "tempest", effect: { damageMultiplier: 1.8 } },
  { id: "fujin_slice", name: "Fujin's Slice", description: "Wind blade barrage on one enemy", mpCost: 14, type: "damage", element: "Wind", targetType: "enemy", animation: "fujinSlice", effect: { damageMultiplier: 2.0 } },
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
  const offense = isMagic ? attacker.int : attacker.atk;
  const defense = isMagic ? defender.int : defender.def;
  const { multiplier: elementMultiplier, label: elementLabel } = getElementMultiplier(attackElement, defenderElement);

  const baseDamage = (offense * offense) / (offense + defense) * skillMultiplier;
  const elementAdjusted = baseDamage * elementMultiplier;

  let damage = Math.max(elementAdjusted, MIN_DAMAGE);
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

export function checkDodge(defender: PlayerStats): boolean {
  const dodgeChance = Math.min(0.25, defender.agi * 0.015);
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
  };
}
