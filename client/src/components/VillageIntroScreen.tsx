import { useState, useEffect, useRef, useCallback } from "react";
import villageBg from "@assets/forest_region_village_1774010989526.jpg";

const ac = "#c9a44a";

const DIALOGUE: { speaker: string; text: string; color: string }[] = [
  { speaker: "Mira",   text: "Something stirs in the deep forest... The animals haven't gone near the old grove in days.", color: "#c8d8a0" },
  { speaker: "Gareth", text: "Aye. Three hunters ventured in at dawn yesterday. None have returned.", color: "#d0c090" },
  { speaker: "Mira",   text: "Whatever it is, it's spreading. The trees look wrong. Twisted, almost.", color: "#c8d8a0" },
  { speaker: "Gareth", text: "We need someone brave enough — or daft enough — to find out what's happening.", color: "#d0c090" },
  { speaker: "Mira",   text: "There is the Wind Shaman. Lania. They say she can witness any distant event through her magic.", color: "#c8d8a0" },
  { speaker: "Gareth", text: "If anyone knows what lurks out there, it would be her. But the path is not safe.", color: "#d0c090" },
  { speaker: "Mira",   text: "Someone will seek her out. Someone always does...", color: "#c8d8a0" },
];

const FADE_IN_MS  = 1500;
const PAN_MS      = 11000;
const LINE_HOLD   = 2800;

const PAN_START   = FADE_IN_MS + 200;
const FIRST_LINE  = FADE_IN_MS + 600;
const ZOOM_OUT_AT = PAN_START + PAN_MS + 400;
const ZOOM_OUT_MS = 2000;
const FADE_OUT_AT = ZOOM_OUT_AT + ZOOM_OUT_MS + 300;
const COMPLETE_AT = FADE_OUT_AT + 950;

interface Props { onComplete: () => void; }

export default function VillageIntroScreen({ onComplete }: Props) {
  const [bgPhase, setBgPhase]         = useState<"init" | "pan" | "zoomOut">("init");
  const [blackOpacity, setBlackOpacity] = useState(1);
  const [lineIdx, setLineIdx]         = useState(0);
  const [lineVisible, setLineVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const done   = useRef(false);

  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  const finish = useCallback((skip = false) => {
    if (done.current) return;
    done.current = true;
    timers.current.forEach(clearTimeout);
    setLineVisible(false);
    setBlackOpacity(1);
    setTimeout(onComplete, skip ? 800 : 100);
  }, [onComplete]);

  useEffect(() => {
    schedule(() => setBlackOpacity(0), 50);
    schedule(() => setBgPhase("pan"), PAN_START);
    schedule(() => setLineVisible(true), FIRST_LINE);

    for (let i = 1; i < DIALOGUE.length; i++) {
      const t = FIRST_LINE + i * LINE_HOLD;
      schedule(() => {
        setLineVisible(false);
        schedule(() => { setLineIdx(i); setLineVisible(true); }, 320);
      }, t);
    }

    schedule(() => setBgPhase("zoomOut"), ZOOM_OUT_AT);
    schedule(() => { setLineVisible(false); setBlackOpacity(1); }, FADE_OUT_AT);
    schedule(() => finish(false), COMPLETE_AT);

    return () => timers.current.forEach(clearTimeout);
  }, []);

  const handleClick = () => {
    if (done.current) return;
    if (lineIdx < DIALOGUE.length - 1) {
      setLineVisible(false);
      const next = lineIdx + 1;
      schedule(() => { setLineIdx(next); setLineVisible(true); }, 300);
    }
  };

  const bgTransform =
    bgPhase === "init"    ? "scale(1.35) translateY(-8%)" :
    bgPhase === "pan"     ? "scale(1.35) translateY(8%)"  :
                            "scale(1.0) translateY(0%)";

  const bgTransition =
    bgPhase === "pan"     ? `transform ${PAN_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1.0)` :
    bgPhase === "zoomOut" ? `transform ${ZOOM_OUT_MS}ms ease-out` :
                            "none";

  const line = DIALOGUE[lineIdx];

  return (
    <div
      className="fixed inset-0 z-[300] overflow-hidden select-none"
      onClick={handleClick}
      style={{ cursor: "default" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${villageBg})`,
          backgroundSize: "100% 100%",
          transform: bgTransform,
          transition: bgTransition,
          transformOrigin: "center top",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.6) 100%)" }}
      />

      <div
        className="absolute"
        style={{
          bottom: 48,
          left: 40,
          right: 40,
          opacity: lineVisible ? 1 : 0,
          transform: lineVisible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "linear-gradient(180deg, #080606f8 0%, #100e0efa 100%)",
            border: `2px solid ${ac}`,
            boxShadow: `0 0 24px ${ac}50, 0 4px 40px rgba(0,0,0,0.9)`,
            padding: "14px 20px 12px",
            fontFamily: "'Press Start 2P', cursive",
            position: "relative",
            maxWidth: 640,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${ac}06 3px, ${ac}06 4px)`,
              position: "absolute", inset: 0, pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: "9px", color: ac, marginBottom: "10px", letterSpacing: "2px" }}>
              ▸ {line.speaker}
            </div>
            <div style={{ fontSize: "8px", color: line.color, lineHeight: "2.3", letterSpacing: "0.5px" }}>
              {line.text}
            </div>
            {lineIdx < DIALOGUE.length - 1 && (
              <div
                style={{
                  position: "absolute", bottom: 0, right: 0,
                  fontSize: "8px", color: `${ac}70`,
                  animation: "villageIntroPulse 1.1s ease-in-out infinite",
                }}
              >
                ▼
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{
          opacity: blackOpacity,
          transition: blackOpacity === 0
            ? `opacity ${FADE_IN_MS}ms ease`
            : `opacity 850ms ease`,
        }}
      />

      <button
        onClick={(e) => { e.stopPropagation(); finish(true); }}
        style={{
          position: "absolute", top: 18, right: 22,
          fontFamily: "'Press Start 2P', cursive", fontSize: 9,
          letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)",
          background: "none", border: "none", cursor: "pointer",
          padding: "6px 10px", zIndex: 10,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.82)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
      >
        SKIP ▶
      </button>

      <style>{`
        @keyframes villageIntroPulse {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(3px); }
        }
      `}</style>
    </div>
  );
}
