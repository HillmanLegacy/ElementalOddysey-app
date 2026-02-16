import { type User, type InsertUser, type GameSave, type InsertGameSave, users, gameSaves } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSaves(): Promise<GameSave[]>;
  getSave(id: string): Promise<GameSave | undefined>;
  createSave(save: InsertGameSave): Promise<GameSave>;
  upsertSave(save: InsertGameSave): Promise<GameSave>;
  deleteSave(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getSaves(): Promise<GameSave[]> {
    return db.select().from(gameSaves).orderBy(desc(gameSaves.updatedAt));
  }

  async getSave(id: string): Promise<GameSave | undefined> {
    const [save] = await db.select().from(gameSaves).where(eq(gameSaves.id, id));
    return save;
  }

  async createSave(save: InsertGameSave): Promise<GameSave> {
    const [result] = await db.insert(gameSaves).values(save).returning();
    return result;
  }

  async upsertSave(save: InsertGameSave): Promise<GameSave> {
    const existing = await db.select().from(gameSaves).where(eq(gameSaves.slotName, save.slotName));
    if (existing.length > 0) {
      const [result] = await db
        .update(gameSaves)
        .set({ playerData: save.playerData, updatedAt: new Date() })
        .where(eq(gameSaves.id, existing[0].id))
        .returning();
      return result;
    }
    return this.createSave(save);
  }

  async deleteSave(id: string): Promise<void> {
    await db.delete(gameSaves).where(eq(gameSaves.id, id));
  }
}

export const storage = new DatabaseStorage();
