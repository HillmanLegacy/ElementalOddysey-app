import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PlayerCharacter, ShopItem } from "@shared/schema";
import { Gem, ShoppingBag, Heart, Droplets, Swords, Shield, Sparkles, ArrowLeft } from "lucide-react";

const ITEM_ICONS: Record<string, any> = {
  heart: Heart,
  droplets: Droplets,
  sword: Swords,
  shield: Shield,
  gem: Sparkles,
};

interface ShopScreenProps {
  player: PlayerCharacter;
  items: ShopItem[];
  onBuy: (item: ShopItem) => void;
  onBack: () => void;
}

export default function ShopScreen({ player, items, onBuy, onBack }: ShopScreenProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between p-3 bg-black/40 backdrop-blur-sm border-b border-purple-500/10">
          <Button variant="ghost" onClick={onBack} className="text-purple-400" data-testid="button-shop-back">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-1">
            <ShoppingBag className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-purple-200">Shop</span>
          </div>
          <div className="flex items-center gap-1">
            <Gem className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300" data-testid="text-shop-gold">{player.gold}g</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.map(item => {
            const Icon = ITEM_ICONS[item.icon] || Sparkles;
            const canAfford = player.gold >= item.price;
            return (
              <Card
                key={item.id}
                className="p-4 bg-[#12122a]/90 border-purple-500/10 backdrop-blur-sm"
                data-testid={`card-shop-item-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-purple-300/60">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400 capitalize">{item.type}</span>
                      <span className="text-[10px] text-purple-400/50">Merchant Stock: {item.stock}</span>
                      <span className="text-[10px] text-green-400/50">Inventory: {player.inventory.filter(i => i.name === item.name).length}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => onBuy(item)}
                    className={canAfford ? "bg-yellow-600/80 text-white hover:bg-yellow-500/80" : "bg-gray-700/40 text-gray-500"}
                    data-testid={`button-buy-${item.id}`}
                  >
                    <Gem className="w-3 h-3 mr-1" />
                    {item.price}g
                  </Button>
                </div>
              </Card>
            );
          })}
          {items.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-purple-500/30 mx-auto mb-3" />
              <p className="text-sm text-purple-400/50">Shop is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
