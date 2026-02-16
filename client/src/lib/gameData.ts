import type { Enemy, Region, OverworldNode, Perk, ShopItem, PlayerStats, PlayerCharacter, Element, EnergyColor, EnergyShape, BattleState, Spell, PartyMemberDef } from "@shared/schema";

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

export const ELEMENT_STAT_MODS: Record<Element, Partial<PlayerStats>> = {
  Fire: { atk: 3, hp: -5, maxHp: -5 },
  Water: { int: 3, hp: 5, maxHp: 5 },
  Wind: { agi: 4, def: -2 },
  Earth: { def: 4, hp: 10, maxHp: 10, agi: -2 },
  Lightning: { agi: 3, luck: 2 },
  Shadow: { atk: 2, agi: 2, luck: 1 },
  Light: { int: 4, luck: 2 },
  Ice: { int: 2, def: 2, agi: -1 },
};

export function createDefaultStats(): PlayerStats {
  return { hp: 100, maxHp: 100, atk: 10, def: 8, agi: 8, int: 8, luck: 5, mp: 50, maxMp: 50 };
}

export function applyElementMods(stats: PlayerStats, element: Element): PlayerStats {
  const mods = ELEMENT_STAT_MODS[element];
  const result = { ...stats };
  for (const [key, val] of Object.entries(mods)) {
    (result as any)[key] = Math.max(1, (result as any)[key] + val);
  }
  return result;
}

export const PARTY_CHARACTERS: PartyMemberDef[] = [
  {
    id: "knight_fire",
    name: "Ignis",
    className: "Knight",
    element: "Fire",
    baseStats: { hp: 120, maxHp: 120, mp: 30, maxMp: 30, atk: 14, def: 12, agi: 6, int: 5, luck: 4 },
    spriteId: "knight",
  },
  {
    id: "ranger_wind",
    name: "Sylph",
    className: "Ranger",
    element: "Wind",
    baseStats: { hp: 80, maxHp: 80, mp: 40, maxMp: 40, atk: 10, def: 6, agi: 14, int: 10, luck: 7 },
    spriteId: "ranger",
  },
  {
    id: "basken_lightning",
    name: "Basken",
    className: "Warrior",
    element: "Lightning",
    baseStats: { hp: 100, maxHp: 100, mp: 35, maxMp: 35, atk: 12, def: 10, agi: 9, int: 8, luck: 6 },
    spriteId: "basken",
  },
  {
    id: "knight2d_light",
    name: "Lumen",
    className: "Paladin",
    element: "Light",
    baseStats: { hp: 110, maxHp: 110, mp: 45, maxMp: 45, atk: 11, def: 11, agi: 7, int: 12, luck: 5 },
    spriteId: "knight2d",
  },
  {
    id: "axewarrior_earth",
    name: "Terra",
    className: "Axe Warrior",
    element: "Earth",
    baseStats: { hp: 130, maxHp: 130, mp: 25, maxMp: 25, atk: 15, def: 13, agi: 5, int: 4, luck: 5 },
    spriteId: "axewarrior",
  },
];

export const BOSS_UNLOCK_MAP: Record<number, string[]> = {
  0: ["knight_fire"],
  1: ["ranger_wind"],
  2: ["basken_lightning"],
  3: ["knight2d_light", "axewarrior_earth"],
};

export interface PartySpriteData {
  idle: { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number };
  attack: { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number };
  run: { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number };
  hurt: { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number };
}

export const PARTY_SPRITE_DATA: Record<string, PartySpriteData> = {
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

export function createNewPlayer(name: string, color: EnergyColor, shape: EnergyShape, element: Element): PlayerCharacter {
  const baseStats = createDefaultStats();
  const stats = applyElementMods(baseStats, element);
  return {
    name,
    level: 1,
    xp: 0,
    xpToNext: 100,
    energyColor: color,
    energyShape: shape,
    element,
    stats,
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
  };
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

const ENEMY_POOL: Omit<Enemy, "stats">[] = [
  { id: "slime_fire", name: "Fire Demon", element: "Fire", level: 1, xpReward: 25, goldReward: 10, isBoss: false, sprite: "flame" },
  { id: "slime_water", name: "Aqua Slime", element: "Water", level: 1, xpReward: 25, goldReward: 10, isBoss: false, sprite: "droplets" },
  { id: "wolf_wind", name: "Storm Wolf", element: "Wind", level: 2, xpReward: 40, goldReward: 15, isBoss: false, sprite: "wind" },
  { id: "golem_earth", name: "Stone Golem", element: "Earth", level: 3, xpReward: 55, goldReward: 20, isBoss: false, sprite: "mountain" },
  { id: "wisp_light", name: "Light Wisp", element: "Light", level: 2, xpReward: 35, goldReward: 12, isBoss: false, sprite: "sun" },
  { id: "shade", name: "Dark Shade", element: "Shadow", level: 3, xpReward: 50, goldReward: 18, isBoss: false, sprite: "ghost" },
  { id: "spark_bug", name: "Spark Bug", element: "Lightning", level: 2, xpReward: 35, goldReward: 14, isBoss: false, sprite: "zap" },
  { id: "frost_lizard", name: "Frost Lizard", element: "Ice", level: 2, xpReward: 38, goldReward: 13, isBoss: false, sprite: "snowflake" },
  { id: "dragon_lord", name: "Dragon Lord", element: "Fire", level: 6, xpReward: 150, goldReward: 60, isBoss: true, sprite: "flame" },
  { id: "jotem", name: "Jotem", element: "Ice", level: 5, xpReward: 120, goldReward: 50, isBoss: true, sprite: "snowflake" },
  { id: "kraken", name: "Deep Kraken", element: "Water", level: 5, xpReward: 100, goldReward: 40, isBoss: true, sprite: "droplets" },
  { id: "shadow_lord", name: "Shadow Lord", element: "Shadow", level: 7, xpReward: 200, goldReward: 80, isBoss: true, sprite: "ghost" },
  { id: "crystal_titan", name: "Crystal Titan", element: "Earth", level: 8, xpReward: 250, goldReward: 100, isBoss: true, sprite: "diamond" },
];

export function generateEnemyStats(base: Omit<Enemy, "stats">, scaleFactor: number): Enemy {
  const lv = base.level * scaleFactor;
  return {
    ...base,
    stats: {
      hp: Math.floor(40 + lv * 15),
      maxHp: Math.floor(40 + lv * 15),
      atk: Math.floor(5 + lv * 3),
      def: Math.floor(3 + lv * 2),
      agi: Math.floor(4 + lv * 1.5),
      int: Math.floor(4 + lv * 1.5),
      luck: Math.floor(2 + lv),
      mp: Math.floor(20 + lv * 5),
      maxMp: Math.floor(20 + lv * 5),
    },
  };
}

export function getEnemiesForNode(node: OverworldNode, region: Region): Enemy[] {
  const regionElement = region.theme;
  const scale = 1 + region.id * 0.3;
  const pool = ENEMY_POOL.filter(e => {
    if (node.type === "boss") return e.isBoss;
    return !e.isBoss;
  });

  const preferredPool = pool.filter(e => e.element === regionElement);
  const selectedPool = preferredPool.length > 0 ? preferredPool : pool;

  const count = node.type === "boss" ? 1 : 1 + Math.floor(Math.random() * 3);
  const enemies: Enemy[] = [];
  for (let i = 0; i < count; i++) {
    const base = selectedPool[Math.floor(Math.random() * selectedPool.length)];
    enemies.push(generateEnemyStats(base, scale));
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
      { id: 0, type: "battle", name: "Scorched Path", x: 15, y: 70, connections: [1], region: 0, cleared: false },
      { id: 1, type: "battle", name: "Cinder Hollow", x: 30, y: 50, connections: [2, 3], region: 0, cleared: false },
      { id: 2, type: "shop", name: "Merchant Camp", x: 20, y: 30, connections: [4], region: 0, cleared: false },
      { id: 3, type: "battle", name: "Flame Ridge", x: 45, y: 55, connections: [4], region: 0, cleared: false },
      { id: 4, type: "rest", name: "Hot Spring", x: 50, y: 35, connections: [5], region: 0, cleared: false },
      { id: 5, type: "battle", name: "Magma Cavern", x: 65, y: 50, connections: [6], region: 0, cleared: false },
      { id: 6, type: "boss", name: "Dragon Lord's Sanctum", x: 80, y: 40, connections: [], region: 0, cleared: false },
    ],
  },
  {
    id: 1,
    name: "Frozen Depths",
    theme: "Ice",
    unlocked: false,
    nodes: [
      { id: 10, type: "battle", name: "Frost Gate", x: 15, y: 65, connections: [11], region: 1, cleared: false },
      { id: 11, type: "battle", name: "Glacier Pass", x: 30, y: 45, connections: [12, 13], region: 1, cleared: false },
      { id: 12, type: "shop", name: "Ice Merchant", x: 25, y: 25, connections: [14], region: 1, cleared: false },
      { id: 13, type: "battle", name: "Blizzard Peak", x: 50, y: 55, connections: [14], region: 1, cleared: false },
      { id: 14, type: "rest", name: "Warm Cavern", x: 55, y: 30, connections: [15], region: 1, cleared: false },
      { id: 15, type: "battle", name: "Crystal Abyss", x: 70, y: 50, connections: [16], region: 1, cleared: false },
      { id: 16, type: "boss", name: "Jotem's Lair", x: 85, y: 35, connections: [], region: 1, cleared: false },
    ],
  },
  {
    id: 2,
    name: "Shadow Forest",
    theme: "Shadow",
    unlocked: false,
    nodes: [
      { id: 20, type: "battle", name: "Dark Entrance", x: 12, y: 60, connections: [21], region: 2, cleared: false },
      { id: 21, type: "battle", name: "Mist Trail", x: 28, y: 40, connections: [22, 23], region: 2, cleared: false },
      { id: 22, type: "shop", name: "Shade Dealer", x: 22, y: 22, connections: [24], region: 2, cleared: false },
      { id: 23, type: "event", name: "Ancient Altar", x: 48, y: 50, connections: [24], region: 2, cleared: false },
      { id: 24, type: "rest", name: "Moonlit Glade", x: 55, y: 28, connections: [25], region: 2, cleared: false },
      { id: 25, type: "battle", name: "Void Corridor", x: 72, y: 45, connections: [26], region: 2, cleared: false },
      { id: 26, type: "boss", name: "Shadow Lord's Throne", x: 88, y: 32, connections: [], region: 2, cleared: false },
    ],
  },
  {
    id: 3,
    name: "Crystal Desert",
    theme: "Earth",
    unlocked: false,
    nodes: [
      { id: 30, type: "battle", name: "Sand Gate", x: 10, y: 68, connections: [31], region: 3, cleared: false },
      { id: 31, type: "battle", name: "Dune Path", x: 25, y: 48, connections: [32, 33], region: 3, cleared: false },
      { id: 32, type: "shop", name: "Oasis Market", x: 18, y: 28, connections: [34], region: 3, cleared: false },
      { id: 33, type: "battle", name: "Crystal Wastes", x: 45, y: 58, connections: [34], region: 3, cleared: false },
      { id: 34, type: "rest", name: "Desert Oasis", x: 52, y: 32, connections: [35], region: 3, cleared: false },
      { id: 35, type: "battle", name: "Titan's Canyon", x: 68, y: 48, connections: [36], region: 3, cleared: false },
      { id: 36, type: "boss", name: "Crystal Titan's Keep", x: 85, y: 38, connections: [], region: 3, cleared: false },
    ],
  },
];

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
  { id: "gale_slash", name: "Gale Slash", description: "Wind damage to all enemies", mpCost: 15, type: "damage", element: "Wind", targetType: "allEnemies", effect: { damageMultiplier: 1.2 } },
  { id: "fujin_slice", name: "Fujin's Slice", description: "Wind blade barrage on one enemy", mpCost: 14, type: "damage", element: "Wind", targetType: "enemy", animation: "fujinSlice", effect: { damageMultiplier: 2.0 } },
  { id: "earth_quake", name: "Earthquake", description: "Earth damage to all enemies", mpCost: 15, type: "damage", element: "Earth", targetType: "allEnemies", effect: { damageMultiplier: 1.2 } },
  { id: "holy_light", name: "Holy Light", description: "Light damage + heal 15 HP", mpCost: 14, type: "damage", element: "Light", targetType: "enemy", effect: { damageMultiplier: 1.5 } },
  { id: "aqua_wave", name: "Aqua Wave", description: "Water damage to all enemies", mpCost: 15, type: "damage", element: "Water", targetType: "allEnemies", effect: { damageMultiplier: 1.2 } },
  { id: "heal", name: "Heal", description: "Restore 40 HP", mpCost: 12, type: "heal", targetType: "self", effect: { stat: "hp", amount: 40 } },
  { id: "power_up", name: "Power Up", description: "+5 ATK for 2 turns", mpCost: 10, type: "buff", targetType: "self", effect: { stat: "atk", amount: 5, duration: 2 } },
  { id: "iron_wall", name: "Iron Wall", description: "+5 DEF for 2 turns", mpCost: 10, type: "buff", targetType: "self", effect: { stat: "def", amount: 5, duration: 2 } },
];

export function getPlayerSpells(player: PlayerCharacter): Spell[] {
  const spells: Spell[] = [SPELLS.find(s => s.id === "speed_up")!];

  const elementSpellMap: Record<Element, string[]> = {
    Fire: ["fire_bolt"],
    Water: ["aqua_wave"],
    Wind: ["gale_slash", "fujin_slice"],
    Earth: ["earth_quake"],
    Lightning: ["thunder"],
    Shadow: ["shadow_strike"],
    Light: ["holy_light"],
    Ice: ["ice_lance"],
  };

  const elementSpells = elementSpellMap[player.element] || [];
  for (const spellId of elementSpells) {
    const spell = SPELLS.find(s => s.id === spellId);
    if (spell) spells.push(spell);
  }

  if (player.level >= 3) {
    const healSpell = SPELLS.find(s => s.id === "heal");
    if (healSpell) spells.push(healSpell);
  }
  if (player.level >= 5) {
    const powerUp = SPELLS.find(s => s.id === "power_up");
    if (powerUp) spells.push(powerUp);
  }
  if (player.level >= 7) {
    const ironWall = SPELLS.find(s => s.id === "iron_wall");
    if (ironWall) spells.push(ironWall);
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

const ELEMENT_EFFECTIVENESS: Record<string, Record<string, number>> = {
  Fire: { Ice: 1.3, Shadow: 1.0, Earth: 0.8, Fire: 0.8 },
  Ice: { Fire: 0.8, Shadow: 1.0, Earth: 1.3, Ice: 0.8 },
  Shadow: { Fire: 1.0, Ice: 1.0, Earth: 1.0, Shadow: 0.8 },
  Earth: { Fire: 1.3, Ice: 0.8, Shadow: 1.0, Earth: 0.8 },
};

export function getElementMultiplier(attackElement?: string, defenderElement?: string): { multiplier: number; label: string } {
  if (!attackElement || !defenderElement) return { multiplier: 1.0, label: "" };
  const mult = ELEMENT_EFFECTIVENESS[attackElement]?.[defenderElement] ?? 1.0;
  if (mult > 1.0) return { multiplier: mult, label: "Super effective!" };
  if (mult < 1.0) return { multiplier: mult, label: "Not very effective..." };
  return { multiplier: 1.0, label: "" };
}

export function calculateDamage(attacker: PlayerStats, defender: PlayerStats, isMagic: boolean, attackElement?: string, defenderElement?: string): { damage: number; isCrit: boolean; elementLabel: string } {
  const stat = isMagic ? attacker.int : attacker.atk;
  const defStat = defender.def;
  const baseDamage = Math.max(1, stat * 2 - defStat);
  const variance = 0.85 + Math.random() * 0.3;
  const critChance = Math.min(0.3, attacker.luck * 0.02);
  const isCrit = Math.random() < critChance;
  const critMult = isCrit ? 1.5 : 1;
  const { multiplier, label } = getElementMultiplier(attackElement, defenderElement);
  return { damage: Math.floor(baseDamage * variance * critMult * multiplier), isCrit, elementLabel: label };
}

export function checkDodge(defender: PlayerStats): boolean {
  const dodgeChance = Math.min(0.25, defender.agi * 0.015);
  return Math.random() < dodgeChance;
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
  };
}
