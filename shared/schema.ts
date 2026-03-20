import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const gameSaves = pgTable("game_saves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slotName: text("slot_name").notNull(),
  playerData: jsonb("player_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGameSaveSchema = createInsertSchema(gameSaves).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;
export type GameSave = typeof gameSaves.$inferSelect;

export const EnergyColors = ["Red", "Blue", "Green", "Yellow", "Purple", "White", "Black", "Cyan", "Orange", "Pink"] as const;
export const EnergyShapes = ["Orb", "Flame", "Crystal", "Lightning", "Shadow", "Leaf", "Wave"] as const;
export const Elements = ["Fire", "Water", "Wind", "Earth", "Lightning", "Shadow", "Light", "Ice"] as const;

export type EnergyColor = typeof EnergyColors[number];
export type EnergyShape = typeof EnergyShapes[number];
export type Element = typeof Elements[number];

export interface PlayerStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  agi: number;
  int: number;
  luck: number;
  mp: number;
  maxMp: number;
}

export interface PlayerCharacter {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  energyColor: EnergyColor;
  energyShape: EnergyShape;
  element: Element;
  stats: PlayerStats;
  gold: number;
  inventory: InventoryItem[];
  equipment: Equipment;
  perks: string[];
  currentRegion: number;
  currentNode: number;
  clearedNodes: number[];
  party: PartyMember[];
  benchedParty: PartyMember[];
  defeatedBosses: number[];
  spriteId: string;
  starterCharacterId: string;
  colorVariant?: string;
  colorGroups?: Record<string, string>;
  regionBossDefeats: Record<string, number>;
  learnedSpells?: string[];
  merchantBattlesSinceRestock: number;
  merchantLastRegion: number;
  merchantLastTier: number;
  merchantSavedStock: ShopItem[] | null;
  villageIntroSeen?: boolean;
  activeBounty?: BountyData | null;
  activeHunts?: HuntData[];
}

export interface BountyData {
  enemyId: string;
  enemyName: string;
  goldReward: number;
  region: number;
  completed: boolean;
}

export interface HuntData {
  id: string;
  region: number;
  enemyName: string;
  lootItemId: string;
  lootName: string;
  required: number;
  goldReward: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: "consumable" | "weapon" | "armor" | "accessory" | "loot";
  description: string;
  effect: ItemEffect;
  icon: string;
  value: number;
  element?: Element;
}

export interface ItemEffect {
  stat?: keyof PlayerStats;
  amount?: number;
  duration?: number;
  type: "heal" | "buff" | "damage" | "equip";
  // Secondary flat stat bonus (e.g. Demon's Blade +ATK AND +AGI)
  stat2?: keyof PlayerStats;
  amount2?: number;
  // Percentage-based stat bonuses — resolved to flat at equip time
  percentStat?: keyof PlayerStats;
  percentAmount?: number;
  percentStat2?: keyof PlayerStats;
  percentAmount2?: number;
  // Special passive accessory effects
  special?: string;
  specialValue?: number;
}

export interface Equipment {
  weapon: InventoryItem | null;
  armor: InventoryItem | null;
  accessory: InventoryItem | null;
}

export interface Enemy {
  id: string;
  name: string;
  element: Element;
  level: number;
  levelRange?: [number, number];
  stats: PlayerStats;
  xpReward: number;
  goldReward: number;
  isBoss: boolean;
  sprite: string;
}

export interface OverworldNode {
  id: number;
  type: "passage" | "shop" | "event" | "boss" | "rest" | "shaman" | "hut" | "village";
  name: string;
  x: number;
  y: number;
  connections: number[];
  region: number;
  enemyIds?: string[];
  cleared: boolean;
}

export interface Region {
  id: number;
  name: string;
  theme: Element;
  nodes: OverworldNode[];
  unlocked: boolean;
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  element: Element;
  tier: number;
  requiredLevel: number;
  effect: {
    stat?: keyof PlayerStats;
    amount?: number;
    percentStat?: keyof PlayerStats;
    percentAmount?: number;
    special?: string;
  };
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  type: "damage" | "buff" | "heal";
  element?: Element;
  targetType: "enemy" | "self" | "allEnemies";
  animation?: string;
  effect: {
    stat?: keyof PlayerStats;
    amount?: number;
    duration?: number;
    damageMultiplier?: number;
  };
}

export interface Buff {
  name: string;
  stat: keyof PlayerStats;
  amount: number;
  turnsRemaining: number;
  targetType: "player" | "party";
  targetIndex: number;
}

export interface PartyMemberDef {
  id: string;
  name: string;
  className: string;
  element: Element;
  baseStats: PlayerStats;
  spriteId: string;
}

export interface PartyMember {
  id: string;
  name: string;
  className: string;
  element: Element;
  level: number;
  stats: PlayerStats;
  spriteId: string;
  xp: number;
  xpToNext: number;
  learnedSpells?: string[];
  perks?: string[];
}

export interface BattlePartyMember {
  id: string;
  name: string;
  element: Element;
  level: number;
  stats: PlayerStats;
  currentHp: number;
  currentMp: number;
  defending: boolean;
  spriteId: string;
  learnedSpells: string[];
  xp: number;
  xpToNext: number;
  perks: string[];
}

export interface TurnQueueEntry {
  type: "player" | "party" | "enemy";
  index: number;
  agi: number;
}

export interface BattleState {
  phase: "start" | "playerTurn" | "animating" | "partyTurn" | "enemyTurn" | "victory" | "defeat";
  enemies: (Enemy & { currentHp: number })[];
  playerHp: number;
  playerMp: number;
  turnOrder: string[];
  currentTurn: number;
  log: string[];
  selectedAction: string | null;
  selectedTarget: number | null;
  animation: string | null;
  defending: boolean;
  buffs: Buff[];
  turnCount: number;
  party: BattlePartyMember[];
  activePartyIndex: number;
  turnQueue: TurnQueueEntry[];
  turnQueueIndex: number;
  isSideScrollBattle?: boolean;
  lastElementLabel?: string;
  lastItemUsed?: { stat: "hp" | "mp"; amount: number; targetType: "player" | "party"; targetIndex: number };
  lastDamageEvent?: { id: number; amount: number; targetType: "enemy" | "player" | "party"; targetIndex: number; isCrit: boolean; element?: string; label?: string; isHeal?: boolean; isBlocked?: boolean };
  lastDamageEvents?: Array<{ id: number; amount: number; targetType: string; targetIndex: number; isCrit: boolean; element?: string; label?: string; isHeal?: boolean; isBlocked?: boolean }>;
  gridPositions?: {
    player: number;
    party: number[];
    enemies: number[];
  };
  lootDrops?: InventoryItem[];
}

export interface ShopItem extends InventoryItem {
  price: number;
  stock: number;
}

export interface PendingLevelUp {
  characterType: "player" | "party";
  characterIndex: number;
  characterName: string;
  characterSpriteId: string;
  characterElement: Element;
  statsToAllocate: number;
  perksToChoose: number;
  newLevel: number;
  newSpells?: string[];
}

export interface GameState {
  screen: "menu" | "intro" | "creation" | "overworld" | "hut" | "village" | "battle" | "shop" | "levelUp" | "inventory" | "perkSelect" | "partyUnlock" | "shaman";
  player: PlayerCharacter | null;
  battle: BattleState | null;
  currentShop: ShopItem[] | null;
  pendingLevelUp: PendingLevelUp | null;
  pendingLevelUpQueue: PendingLevelUp[];
  pendingUnlocks: PartyMemberDef[];
  pendingUnlock: PartyMemberDef | null;
  textSpeed: "slow" | "medium" | "fast";
  musicVolume: number;
  sfxVolume: number;
  showDamageNumbers: boolean;
  devInvincible?: boolean;
}
