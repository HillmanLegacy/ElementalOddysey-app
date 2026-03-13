import type { PlayerCharacter } from "@shared/schema";

const STORAGE_KEY = "elemental_odyssey_saves";

export interface LocalSave {
  id: string;
  slotName: string;
  playerData: PlayerCharacter;
  updatedAt: string;
}

function loadAll(): LocalSave[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalSave[];
  } catch {
    return [];
  }
}

function saveAll(saves: LocalSave[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

export function getSaves(): LocalSave[] {
  return loadAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function upsertSave(slotName: string, playerData: PlayerCharacter): LocalSave {
  const saves = loadAll();
  const existing = saves.find((s) => s.slotName === slotName);
  const now = new Date().toISOString();

  if (existing) {
    existing.playerData = playerData;
    existing.updatedAt = now;
    saveAll(saves);
    return existing;
  }

  const newSave: LocalSave = {
    id: `${slotName}-${Date.now()}`,
    slotName,
    playerData,
    updatedAt: now,
  };
  saves.push(newSave);
  saveAll(saves);
  return newSave;
}

export function deleteSave(slotName: string): void {
  const saves = loadAll().filter((s) => s.slotName !== slotName);
  saveAll(saves);
}
