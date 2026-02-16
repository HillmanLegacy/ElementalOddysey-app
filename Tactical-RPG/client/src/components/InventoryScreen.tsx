import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import type { PlayerCharacter, PlayerStats } from "@shared/schema";
import { ELEMENT_COLORS, COLOR_MAP, PERKS } from "@/lib/gameData";
import {
  ArrowLeft, Backpack, Heart, Droplets, Swords, Shield, Zap, Brain, Clover,
  Sparkles, Package, User, Crown, FlaskConical,
} from "lucide-react";

const STAT_LIST: { key: keyof PlayerStats; label: string; icon: any; color: string }[] = [
  { key: "hp", label: "HP", icon: Heart, color: "#ef4444" },
  { key: "mp", label: "MP", icon: Droplets, color: "#3b82f6" },
  { key: "atk", label: "ATK", icon: Swords, color: "#f97316" },
  { key: "def", label: "DEF", icon: Shield, color: "#22c55e" },
  { key: "agi", label: "AGI", icon: Zap, color: "#eab308" },
  { key: "int", label: "INT", icon: Brain, color: "#a855f7" },
  { key: "luck", label: "LUCK", icon: Clover, color: "#ec4899" },
];

interface InventoryScreenProps {
  player: PlayerCharacter;
  onEquip: (itemId: string) => void;
  onUseItem: (itemId: string) => void;
  onBack: () => void;
}

export default function InventoryScreen({ player, onEquip, onUseItem, onBack }: InventoryScreenProps) {
  const consumables = player.inventory.filter(i => i.type === "consumable");
  const equipables = player.inventory.filter(i => i.type === "weapon" || i.type === "armor" || i.type === "accessory");

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between p-3 bg-black/40 backdrop-blur-sm border-b border-purple-500/10">
          <Button variant="ghost" onClick={onBack} className="text-purple-400" data-testid="button-inventory-back">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-1">
            <Backpack className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-200">Inventory</span>
          </div>
          <div className="w-16" />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="w-full bg-black/30 border border-purple-500/10 mb-4">
              <TabsTrigger value="stats" className="flex-1 text-xs" data-testid="tab-stats">
                <User className="w-3 h-3 mr-1" />Stats
              </TabsTrigger>
              <TabsTrigger value="items" className="flex-1 text-xs" data-testid="tab-items">
                <FlaskConical className="w-3 h-3 mr-1" />Items
              </TabsTrigger>
              <TabsTrigger value="equipment" className="flex-1 text-xs" data-testid="tab-equipment">
                <Crown className="w-3 h-3 mr-1" />Gear
              </TabsTrigger>
              <TabsTrigger value="perks" className="flex-1 text-xs" data-testid="tab-perks">
                <Sparkles className="w-3 h-3 mr-1" />Perks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats">
              <Card className="p-4 bg-[#12122a]/90 border-purple-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: COLOR_MAP[player.energyColor] + "20",
                      border: `2px solid ${COLOR_MAP[player.energyColor]}50`,
                    }}
                  >
                    <span className="text-lg font-bold" style={{ color: COLOR_MAP[player.energyColor] }}>
                      {player.level}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white" data-testid="text-inv-name">{player.name}</p>
                    <p className="text-xs text-purple-400/60">
                      Lv.{player.level} | {player.element} | {player.energyColor} {player.energyShape}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {STAT_LIST.map(({ key, label, icon: Icon, color }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                      <span className="text-xs text-purple-300/70 w-10">{label}</span>
                      <Progress
                        value={(player.stats[key] / (key === "hp" || key === "maxHp" ? player.stats.maxHp : key === "mp" || key === "maxMp" ? player.stats.maxMp : 30)) * 100}
                        className="h-2 flex-1 bg-black/30"
                      />
                      <span className="text-xs text-purple-200 w-8 text-right">
                        {key === "hp" ? `${player.stats.hp}/${player.stats.maxHp}` : key === "mp" ? `${player.stats.mp}/${player.stats.maxMp}` : player.stats[key]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-purple-500/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-400/60">XP: {player.xp}/{player.xpToNext}</span>
                    <span className="text-yellow-400/60">Gold: {player.gold}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="items">
              <div className="space-y-2">
                {consumables.length === 0 ? (
                  <div className="text-center py-8">
                    <FlaskConical className="w-10 h-10 text-purple-500/30 mx-auto mb-2" />
                    <p className="text-sm text-purple-400/50">No consumable items</p>
                  </div>
                ) : (
                  consumables.map(item => {
                    const canUse = item.effect.type === "heal" && (
                      (item.effect.stat === "hp" && player.stats.hp < player.stats.maxHp) ||
                      (item.effect.stat === "mp" && player.stats.mp < player.stats.maxMp)
                    );
                    return (
                      <Card key={item.id} className="p-3 bg-[#12122a]/90 border-purple-500/10" data-testid={`card-item-${item.id}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            <p className="text-xs text-purple-300/60">{item.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-green-500/20 text-green-300"
                            onClick={() => onUseItem(item.id)}
                            disabled={!canUse}
                            data-testid={`button-use-${item.id}`}
                          >
                            Use
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="equipment">
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-[10px] text-purple-400/50 uppercase tracking-wider px-1">Equipped</p>
                  {(["weapon", "armor", "accessory"] as const).map(slot => {
                    const item = player.equipment[slot];
                    return (
                      <Card key={slot} className="p-3 bg-[#12122a]/90 border-purple-500/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-purple-400/50 uppercase tracking-wider">{slot}</p>
                            {item ? (
                              <>
                                <p className="text-sm font-medium text-white">{item.name}</p>
                                <p className="text-xs text-purple-300/60">{item.description}</p>
                              </>
                            ) : (
                              <p className="text-sm text-purple-500/40 italic">Empty</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {equipables.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-purple-400/50 uppercase tracking-wider px-1 pt-2 border-t border-purple-500/10">Unequipped</p>
                    {equipables.map(item => (
                      <Card key={item.id} className="p-3 bg-[#12122a]/90 border-purple-500/10" data-testid={`card-equip-item-${item.id}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white">{item.name}</p>
                              <Badge variant="outline" className="text-[8px] px-1 border-purple-500/20 text-purple-400/60 no-default-active-elevate">{item.type}</Badge>
                            </div>
                            <p className="text-xs text-purple-300/60">{item.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-purple-500/20 text-purple-300"
                            onClick={() => onEquip(item.id)}
                            data-testid={`button-equip-${item.id}`}
                          >
                            Equip
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="perks">
              <div className="space-y-2">
                {player.perks.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-10 h-10 text-purple-500/30 mx-auto mb-2" />
                    <p className="text-sm text-purple-400/50">No perks yet</p>
                  </div>
                ) : (
                  player.perks.map(perkId => {
                    const perk = PERKS.find(p => p.id === perkId);
                    if (!perk) return null;
                    return (
                      <Card key={perkId} className="p-3 bg-[#12122a]/90 border-purple-500/10">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: ELEMENT_COLORS[perk.element] + "20",
                              border: `1px solid ${ELEMENT_COLORS[perk.element]}30`,
                            }}
                          >
                            <Sparkles className="w-4 h-4" style={{ color: ELEMENT_COLORS[perk.element] }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{perk.name}</p>
                            <p className="text-xs text-purple-300/60">{perk.description}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
