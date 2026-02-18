import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PlayerCharacter } from "@shared/schema";
import {
  ArrowLeft, Backpack, Heart, Droplets,
  Crown, FlaskConical,
} from "lucide-react";

interface InventoryScreenProps {
  player: PlayerCharacter;
  onEquip: (itemId: string) => void;
  onUseItem: (itemId: string, targetPartyIndex?: number) => void;
  onBack: () => void;
}

export default function InventoryScreen({ player, onEquip, onUseItem, onBack }: InventoryScreenProps) {
  const consumables = player.inventory.filter(i => i.type === "consumable");
  const equipables = player.inventory.filter(i => i.type === "weapon" || i.type === "armor" || i.type === "accessory");
  const [targetingItemId, setTargetingItemId] = useState<string | null>(null);

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
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="w-full bg-black/30 border border-purple-500/10 mb-4">
              <TabsTrigger value="items" className="flex-1 text-xs" data-testid="tab-items">
                <FlaskConical className="w-3 h-3 mr-1" />Items
              </TabsTrigger>
              <TabsTrigger value="equipment" className="flex-1 text-xs" data-testid="tab-equipment">
                <Crown className="w-3 h-3 mr-1" />Gear
              </TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <div className="space-y-2">
                {consumables.length === 0 ? (
                  <div className="text-center py-8">
                    <FlaskConical className="w-10 h-10 text-purple-500/30 mx-auto mb-2" />
                    <p className="text-sm text-purple-400/50">No consumable items</p>
                  </div>
                ) : (
                  consumables.map(item => {
                    const canUseOnPlayer = item.effect.type === "heal" && (
                      (item.effect.stat === "hp" && player.stats.hp < player.stats.maxHp) ||
                      (item.effect.stat === "mp" && player.stats.mp < player.stats.maxMp)
                    );
                    const canUseOnAny = canUseOnPlayer || player.party.some(m =>
                      item.effect.type === "heal" && (
                        (item.effect.stat === "hp" && m.stats.hp < m.stats.maxHp) ||
                        (item.effect.stat === "mp" && m.stats.mp < m.stats.maxMp)
                      )
                    );
                    const isTargeting = targetingItemId === item.id;
                    return (
                      <Card key={item.id} className="p-3 bg-[#12122a]/90 border-purple-500/10" data-testid={`card-item-${item.id}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            <p className="text-xs text-purple-300/60">{item.description}</p>
                          </div>
                          {player.party.length > 0 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className={`text-xs ${isTargeting ? "border-yellow-500/40 text-yellow-300" : "border-green-500/20 text-green-300"}`}
                              onClick={() => setTargetingItemId(isTargeting ? null : item.id)}
                              disabled={!canUseOnAny}
                              data-testid={`button-use-${item.id}`}
                            >
                              {isTargeting ? "Cancel" : "Use"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-green-500/20 text-green-300"
                              onClick={() => onUseItem(item.id)}
                              disabled={!canUseOnPlayer}
                              data-testid={`button-use-${item.id}`}
                            >
                              Use
                            </Button>
                          )}
                        </div>
                        {isTargeting && (
                          <div className="mt-2 pt-2 border-t border-purple-500/10 space-y-1">
                            <p className="text-[10px] text-purple-300/40 mb-1">Select target:</p>
                            <button
                              className="w-full flex items-center justify-between px-2 py-1.5 rounded bg-black/30 hover:bg-purple-500/10 transition-colors"
                              disabled={!canUseOnPlayer}
                              onClick={() => { onUseItem(item.id); setTargetingItemId(null); }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-amber-200">{player.name}</span>
                                <span className="text-[8px] text-purple-300/40">(You)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.effect.stat === "hp" && (
                                  <div className="flex items-center gap-1">
                                    <Heart className="w-2.5 h-2.5 text-red-400" />
                                    <span className={`text-[9px] ${player.stats.hp < player.stats.maxHp ? "text-red-300" : "text-green-300"}`}>
                                      {player.stats.hp}/{player.stats.maxHp}
                                    </span>
                                  </div>
                                )}
                                {item.effect.stat === "mp" && (
                                  <div className="flex items-center gap-1">
                                    <Droplets className="w-2.5 h-2.5 text-blue-400" />
                                    <span className={`text-[9px] ${player.stats.mp < player.stats.maxMp ? "text-blue-300" : "text-green-300"}`}>
                                      {player.stats.mp}/{player.stats.maxMp}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </button>
                            {player.party.map((member, idx) => {
                              const canUseOnMember = item.effect.type === "heal" && (
                                (item.effect.stat === "hp" && member.stats.hp < member.stats.maxHp) ||
                                (item.effect.stat === "mp" && member.stats.mp < member.stats.maxMp)
                              );
                              return (
                                <button
                                  key={member.id}
                                  className="w-full flex items-center justify-between px-2 py-1.5 rounded bg-black/30 hover:bg-purple-500/10 transition-colors disabled:opacity-30"
                                  disabled={!canUseOnMember}
                                  onClick={() => { onUseItem(item.id, idx); setTargetingItemId(null); }}
                                >
                                  <span className="text-[10px] font-semibold text-purple-200">{member.name}</span>
                                  <div className="flex items-center gap-2">
                                    {item.effect.stat === "hp" && (
                                      <div className="flex items-center gap-1">
                                        <Heart className="w-2.5 h-2.5 text-red-400" />
                                        <span className={`text-[9px] ${member.stats.hp < member.stats.maxHp ? "text-red-300" : "text-green-300"}`}>
                                          {member.stats.hp}/{member.stats.maxHp}
                                        </span>
                                      </div>
                                    )}
                                    {item.effect.stat === "mp" && (
                                      <div className="flex items-center gap-1">
                                        <Droplets className="w-2.5 h-2.5 text-blue-400" />
                                        <span className={`text-[9px] ${member.stats.mp < member.stats.maxMp ? "text-blue-300" : "text-green-300"}`}>
                                          {member.stats.mp}/{member.stats.maxMp}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
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

          </Tabs>
        </div>
      </div>
    </div>
  );
}
