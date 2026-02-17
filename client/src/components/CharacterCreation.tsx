import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ParticleCanvas from "./ParticleCanvas";
import { COLOR_MAP, ELEMENT_COLORS, STARTER_CHARACTERS } from "@/lib/gameData";
import { ArrowLeft, ArrowRight, Sparkles, Diamond, CloudLightning, Check, Sword, Wind, Zap, Flame } from "lucide-react";
import SpriteAnimator from "./SpriteAnimator";

import knightIdle from "@/assets/images/knight-idle-4f.png";
import samuraiIdle from "@/assets/images/samurai-idle.png";
import baskenIdle from "@/assets/images/basken-idle.png";

const STARTER_SPRITES: Record<string, { sheet: string; frameWidth: number; frameHeight: number; totalFrames: number }> = {
  knight: { sheet: knightIdle, frameWidth: 86, frameHeight: 49, totalFrames: 4 },
  samurai: { sheet: samuraiIdle, frameWidth: 96, frameHeight: 96, totalFrames: 10 },
  basken: { sheet: baskenIdle, frameWidth: 56, frameHeight: 56, totalFrames: 5 },
};

const STARTER_ICONS: Record<string, any> = {
  knight_fire: Flame,
  samurai_wind: Wind,
  basken_lightning: Zap,
};

const STARTER_DESCRIPTIONS: Record<string, string> = {
  knight_fire: "A stalwart fire knight with high HP and ATK. Excels at close combat with devastating fire magic.",
  samurai_wind: "A swift wind samurai with high AGI and balanced stats. Masters wind techniques and blade arts.",
  basken_lightning: "A versatile lightning warrior with good luck and speed. Wields thunder magic in battle.",
};

import type { EnergyColor, EnergyShape } from "@shared/schema";

interface CharacterCreationProps {
  onComplete: (starterCharId: string, name: string, color: EnergyColor, shape: EnergyShape) => void;
  onBack: () => void;
}

export default function CharacterCreation({ onComplete, onBack }: CharacterCreationProps) {
  const [step, setStep] = useState(0);
  const [selectedStarter, setSelectedStarter] = useState<string>("samurai_wind");
  const [name, setName] = useState("");
  const steps = ["Character", "Name", "Confirm"];

  const starterDef = STARTER_CHARACTERS.find(c => c.id === selectedStarter)!;
  const spriteData = STARTER_SPRITES[starterDef.spriteId];
  const elemColor = ELEMENT_COLORS[starterDef.element];

  const statBar = (label: string, value: number, max: number, color: string) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-purple-300/70 w-10 text-right">{label}</span>
      <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-purple-200 w-6">{value}</span>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-xl text-purple-300 font-semibold text-center">Choose Your Character</h3>
            <div className="grid grid-cols-3 gap-3">
              {STARTER_CHARACTERS.map(starter => {
                const Icon = STARTER_ICONS[starter.id] || Sword;
                const sColor = ELEMENT_COLORS[starter.element];
                const sprite = STARTER_SPRITES[starter.spriteId];
                const isSelected = selectedStarter === starter.id;
                return (
                  <button
                    key={starter.id}
                    onClick={() => setSelectedStarter(starter.id)}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "ring-2 ring-white/50 bg-white/10 scale-105"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="w-16 h-16 flex items-center justify-center">
                      <SpriteAnimator
                        spriteSheet={sprite.sheet}
                        frameWidth={sprite.frameWidth}
                        frameHeight={sprite.frameHeight}
                        totalFrames={sprite.totalFrames}
                        fps={8}
                        scale={sprite.frameHeight > 80 ? 1.2 : 1.8}
                        loop={true}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-white block">{starter.className}</span>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <Icon className="w-3 h-3" style={{ color: sColor }} />
                        <span className="text-[10px]" style={{ color: sColor }}>{starter.element}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="absolute top-1.5 right-1.5 w-4 h-4 text-white/80" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-center text-purple-400/70 mt-2">
              {STARTER_DESCRIPTIONS[selectedStarter]}
            </p>
            <div className="space-y-1.5 mt-2">
              {statBar("HP", starterDef.baseStats.maxHp, 150, "#ef4444")}
              {statBar("MP", starterDef.baseStats.maxMp, 60, "#3b82f6")}
              {statBar("ATK", starterDef.baseStats.atk, 20, "#f97316")}
              {statBar("DEF", starterDef.baseStats.def, 20, "#22c55e")}
              {statBar("AGI", starterDef.baseStats.agi, 20, "#eab308")}
              {statBar("INT", starterDef.baseStats.int, 15, "#a855f7")}
              {statBar("LCK", starterDef.baseStats.luck, 10, "#ec4899")}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-xl text-purple-300 font-semibold text-center">Name Your {starterDef.className}</h3>
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 flex items-center justify-center">
                <SpriteAnimator
                  spriteSheet={spriteData.sheet}
                  frameWidth={spriteData.frameWidth}
                  frameHeight={spriteData.frameHeight}
                  totalFrames={spriteData.totalFrames}
                  fps={8}
                  scale={spriteData.frameHeight > 80 ? 1.2 : 1.8}
                  loop={true}
                />
              </div>
            </div>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`Enter name (default: ${starterDef.name})...`}
              className="text-center text-lg bg-black/30 border-purple-500/30 text-purple-100 placeholder:text-purple-500/40 h-12"
              maxLength={20}
              data-testid="input-player-name"
            />
          </div>
        );

      case 2:
        const displayName = name.trim() || starterDef.name;
        const StarterIcon = STARTER_ICONS[selectedStarter] || Sword;
        return (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-xl text-purple-300 font-semibold text-center">Confirm Your Hero</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: elemColor + "20",
                    boxShadow: `0 0 40px ${elemColor}40, 0 0 80px ${elemColor}20`,
                    border: `2px solid ${elemColor}60`,
                  }}
                >
                  <SpriteAnimator
                    spriteSheet={spriteData.sheet}
                    frameWidth={spriteData.frameWidth}
                    frameHeight={spriteData.frameHeight}
                    totalFrames={spriteData.totalFrames}
                    fps={8}
                    scale={spriteData.frameHeight > 80 ? 1.2 : 1.8}
                    loop={true}
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white" data-testid="text-confirm-name">{displayName}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <StarterIcon className="w-4 h-4" style={{ color: elemColor }} />
                  <span className="text-sm" style={{ color: elemColor }}>{starterDef.element} {starterDef.className}</span>
                </div>
              </div>
              <div className="w-full space-y-1.5 mt-2">
                {statBar("HP", starterDef.baseStats.maxHp, 150, "#ef4444")}
                {statBar("MP", starterDef.baseStats.maxMp, 60, "#3b82f6")}
                {statBar("ATK", starterDef.baseStats.atk, 20, "#f97316")}
                {statBar("DEF", starterDef.baseStats.def, 20, "#22c55e")}
                {statBar("AGI", starterDef.baseStats.agi, 20, "#eab308")}
                {statBar("INT", starterDef.baseStats.int, 15, "#a855f7")}
                {statBar("LCK", starterDef.baseStats.luck, 10, "#ec4899")}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <ParticleCanvas
        colors={[COLOR_MAP["Purple"], elemColor]}
        count={50}
        speed={0.6}
        style="swirl"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-purple-400 scale-110" : "bg-purple-800/40"
                }`}
              />
              {i < steps.length - 1 && (
                <div className={`w-6 h-px ${i < step ? "bg-purple-400/50" : "bg-purple-800/30"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="w-full max-w-md p-6 bg-[#12122a]/90 border-purple-500/15 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
          {renderStep()}

          <div className="flex justify-between mt-6 gap-3">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? onBack() : setStep(step - 1))}
              className="text-purple-400 hover:text-purple-300"
              data-testid="button-creation-back"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {step === 0 ? "Menu" : "Back"}
            </Button>

            {step < 2 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="bg-purple-600/80 text-white hover:bg-purple-500/80 border border-purple-400/20"
                data-testid="button-creation-next"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => onComplete(selectedStarter, name.trim() || starterDef.name, "Purple", "Orb")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500"
                data-testid="button-begin-adventure"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Begin Adventure
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
