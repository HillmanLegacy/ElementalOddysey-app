import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ParticleCanvas from "./ParticleCanvas";
import type { PlayerCharacter, PlayerStats } from "@shared/schema";
import { COLOR_MAP } from "@/lib/gameData";
import { Star, Heart, Droplets, Swords, Shield, Zap, Brain, Clover } from "lucide-react";

const STAT_CONFIG: { key: keyof PlayerStats; label: string; icon: any; color: string }[] = [
  { key: "maxHp", label: "HP", icon: Heart, color: "#ef4444" },
  { key: "maxMp", label: "MP", icon: Droplets, color: "#3b82f6" },
  { key: "atk", label: "ATK", icon: Swords, color: "#f97316" },
  { key: "def", label: "DEF", icon: Shield, color: "#22c55e" },
  { key: "agi", label: "AGI", icon: Zap, color: "#eab308" },
  { key: "int", label: "INT", icon: Brain, color: "#a855f7" },
  { key: "luck", label: "LUCK", icon: Clover, color: "#ec4899" },
];

interface LevelUpScreenProps {
  player: PlayerCharacter;
  statsRemaining: number;
  onAllocate: (stat: keyof PlayerStats) => void;
}

export default function LevelUpScreen({ player, statsRemaining, onAllocate }: LevelUpScreenProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <ParticleCanvas
        colors={["#fbbf24", "#f59e0b", "#eab308", COLOR_MAP[player.energyColor]]}
        count={80}
        speed={1.5}
        style="burst"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-6 animate-[fadeIn_0.5s_ease-out]">
          <Star className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
          <h1 className="text-4xl font-bold text-yellow-300" data-testid="text-level-up">Level Up!</h1>
          <p className="text-lg text-purple-300/70 mt-1">Level {player.level}</p>
          <p className="text-sm text-yellow-400/60 mt-2">
            Choose {statsRemaining} stat{statsRemaining > 1 ? "s" : ""} to increase
          </p>
        </div>

        <Card className="w-full max-w-md p-4 bg-[#12122a]/90 border-yellow-500/15 backdrop-blur-sm">
          <div className="space-y-2">
            {STAT_CONFIG.map(({ key, label, icon: Icon, color }) => {
              const value = player.stats[key];
              const increase = key === "maxHp" ? "+10" : key === "maxMp" ? "+5" : "+2";
              return (
                <Button
                  key={key}
                  variant="ghost"
                  className="w-full flex items-center justify-between h-auto py-3 hover:bg-white/5"
                  onClick={() => onAllocate(key)}
                  data-testid={`button-allocate-${key}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" style={{ color }} />
                    <span className="text-sm font-medium text-purple-200">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-purple-300/70">{value}</span>
                    <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">{increase}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
