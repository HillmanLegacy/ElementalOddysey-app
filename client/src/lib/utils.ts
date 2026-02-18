import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InventoryItem } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface GroupedItem {
  item: InventoryItem;
  count: number;
  ids: string[];
}

export function groupConsumables(items: InventoryItem[]): GroupedItem[] {
  const groups = new Map<string, GroupedItem>();
  for (const item of items) {
    const key = item.name;
    const existing = groups.get(key);
    if (existing) {
      existing.count++;
      existing.ids.push(item.id);
    } else {
      groups.set(key, { item, count: 1, ids: [item.id] });
    }
  }
  return Array.from(groups.values());
}
