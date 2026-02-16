import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ParticleCanvas from "./ParticleCanvas";
import { EnergyColors, EnergyShapes, Elements } from "@shared/schema";
import type { EnergyColor, EnergyShape, Element, PlayerStats } from "@shared/schema";
import { COLOR_MAP, ELEMENT_COLORS, ELEMENT_STAT_MODS, createDefaultStats, applyElementMods } from "@/lib/gameData";
import { ArrowLeft, ArrowRight, Sparkles, Flame, Droplets, Wind, Mountain, Zap, Moon, Sun, Snowflake, CircleDot, Triangle, Diamond, CloudLightning, Ghost, Leaf, Waves, Check } from "lucide-react";

const SHAPE_ICONS: Record<string, any> = {
  Orb: CircleDot,
  Flame: Flame,
  Crystal: Diamond,
  Lightning: CloudLightning,
  Shadow: Ghost,
  Leaf: Leaf,
  Wave: Waves,
};

const ELEMENT_ICONS: Record<Element, any> = {
  Fire: Flame,
  Water: Droplets,
  Wind: Wind,
  Earth: Mountain,
  Lightning: Zap,
  Shadow: Moon,
  Light: Sun,
  Ice: Snowflake,
};

interface CharacterCreationProps {
  onComplete: (name: string, color: EnergyColor, shape: EnergyShape, element: Element) => void;
  onBack: () => void;
}

export default function CharacterCreation({ onComplete, onBack }: CharacterCreationProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<EnergyColor>("Purple");
  const [selectedShape, setSelectedShape] = useState<EnergyShape>("Orb");
  const [selectedElement, setSelectedElement] = useState<Element>("Fire");

  const steps = ["Name", "Energy Color", "Energy Shape", "Element", "Confirm"];

  const previewStats = applyElementMods(createDefaultStats(), selectedElement);

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
            <h3 className="text-xl text-purple-300 font-semibold text-center">Name Your Hero</h3>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter name..."
              className="text-center text-lg bg-black/30 border-purple-500/30 text-purple-100 placeholder:text-purple-500/40 h-12"
              maxLength={20}
              data-testid="input-player-name"
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-xl text-purple-300 font-semibold text-center">Choose Energy Color</h3>
            <div className="grid grid-cols-5 gap-2">
              {EnergyColors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`relative flex flex-col items-center gap-1 p-3 rounded-md transition-all duration-200 ${
                    selectedColor === color
                      ? "ring-2 ring-white/50 bg-white/10 scale-105"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                  data-testid={`button-color-${color.toLowerCase()}`}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{
                      backgroundColor: COLOR_MAP[color],
                      boxShadow: selectedColor === color ? `0 0 20px ${COLOR_MAP[color]}80` : "none",
                    }}
                  />
                  <span className="text-[10px] text-purple-300/70">{color}</span>
                  {selectedColor === color && (
                    <Check className="absolute top-1 right-1 w-3 h-3 text-white/80" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-xl text-purple-300 font-semibold text-center">Choose Energy Shape</h3>
            <div className="grid grid-cols-4 gap-2">
              {EnergyShapes.map(shape => {
                const Icon = SHAPE_ICONS[shape] || CircleDot;
                return (
                  <button
                    key={shape}
                    onClick={() => setSelectedShape(shape)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-md transition-all duration-200 ${
                      selectedShape === shape
                        ? "ring-2 ring-white/50 bg-white/10 scale-105"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                    data-testid={`button-shape-${shape.toLowerCase()}`}
                  >
                    <Icon className="w-8 h-8" style={{ color: COLOR_MAP[selectedColor] }} />
                    <span className="text-xs text-purple-300/70">{shape}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-xl text-purple-300 font-semibold text-center">Choose Element</h3>
            <div className="grid grid-cols-4 gap-2">
              {Elements.map(el => {
                const Icon = ELEMENT_ICONS[el];
                return (
                  <button
                    key={el}
                    onClick={() => setSelectedElement(el)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-md transition-all duration-200 ${
                      selectedElement === el
                        ? "ring-2 ring-white/50 bg-white/10 scale-105"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                    data-testid={`button-element-${el.toLowerCase()}`}
                  >
                    <Icon className="w-7 h-7" style={{ color: ELEMENT_COLORS[el] }} />
                    <span className="text-xs text-purple-300/70">{el}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 p-3 rounded-md bg-black/30 space-y-1">
              <p className="text-xs text-purple-400/60 mb-2">Element Modifiers:</p>
              {Object.entries(ELEMENT_STAT_MODS[selectedElement]).map(([stat, val]) => (
                <span
                  key={stat}
                  className={`inline-block mr-2 text-xs px-2 py-0.5 rounded ${
                    (val as number) > 0 ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
                  }`}
                >
                  {stat.toUpperCase()} {(val as number) > 0 ? "+" : ""}{val as number}
                </span>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-xl text-purple-300 font-semibold text-center">Confirm Your Hero</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse"
                  style={{
                    backgroundColor: COLOR_MAP[selectedColor] + "20",
                    boxShadow: `0 0 40px ${COLOR_MAP[selectedColor]}40, 0 0 80px ${COLOR_MAP[selectedColor]}20`,
                    border: `2px solid ${COLOR_MAP[selectedColor]}60`,
                  }}
                >
                  {(() => {
                    const Icon = SHAPE_ICONS[selectedShape] || CircleDot;
                    return <Icon className="w-12 h-12" style={{ color: COLOR_MAP[selectedColor] }} />;
                  })()}
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white" data-testid="text-confirm-name">{name || "Hero"}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {(() => {
                    const ElIcon = ELEMENT_ICONS[selectedElement];
                    return <ElIcon className="w-4 h-4" style={{ color: ELEMENT_COLORS[selectedElement] }} />;
                  })()}
                  <span className="text-sm" style={{ color: ELEMENT_COLORS[selectedElement] }}>{selectedElement}</span>
                  <span className="text-purple-500/40">|</span>
                  <span className="text-sm text-purple-300/70">{selectedColor} {selectedShape}</span>
                </div>
              </div>
              <div className="w-full space-y-1.5 mt-2">
                {statBar("HP", previewStats.maxHp, 150, "#ef4444")}
                {statBar("MP", previewStats.maxMp, 80, "#3b82f6")}
                {statBar("ATK", previewStats.atk, 20, "#f97316")}
                {statBar("DEF", previewStats.def, 20, "#22c55e")}
                {statBar("AGI", previewStats.agi, 20, "#eab308")}
                {statBar("INT", previewStats.int, 20, "#a855f7")}
                {statBar("LCK", previewStats.luck, 15, "#ec4899")}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      <ParticleCanvas
        colors={[COLOR_MAP[selectedColor], ELEMENT_COLORS[selectedElement]]}
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

        <Card className="w-full max-w-md p-6 bg-[#12122a]/90 border-purple-500/15 backdrop-blur-sm">
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

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && name.trim().length === 0}
                className="bg-purple-600/80 text-white hover:bg-purple-500/80 border border-purple-400/20"
                data-testid="button-creation-next"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => onComplete(name.trim() || "Hero", selectedColor, selectedShape, selectedElement)}
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
