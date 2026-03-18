import { useState, useEffect, useRef } from "react";
import { playMusic } from "@/lib/music";
import scene1 from "@assets/Forest_Region_Scene_1773808346904.jpg";
import scene2 from "@assets/Forest_Region_Scene2_1773808346904.jpg";
import scene3 from "@assets/Forest_Region_Scene3_1773808346905.jpg";

const STANZAS = [
  [
    "For all of my life, I've knelt down to pray,",
    "Yet eight Cataclysms are headed this way.",
    "No magic nor might may sway what's in store,",
    "The Endbringer calls, and none may ignore.",
  ],
  [
    "Villages burn, and kingdoms will fall,",
    "Forests will twist and cover it all.",
    "Rivers will rage and the skies will roar,",
    "As the world reels beneath their war.",
  ],
  [
    "Heroes may rise, yet few shall remain,",
    "And sorrow shall wash like a merciless rain.",
    "Mark well these words, for the time draws near,",
    "When darkness shall reign and all tremble in fear.",
  ],
];

const SCENES = [scene1, scene2, scene3];
const PAN_ANIM = ["introPanLR", "introPanRL", "introPanLR"];

// Each fade direction is 1500ms  →  full transition (out + in) = 3000ms
const FADE_DURATION  = 1500;
// Scene slot: how long before the next scene starts its swap
// Fade-out begins at SCENE_SLOT - FADE_DURATION, and completes exactly when the slot ends
const SCENE_SLOT     = 13000;
const FADE_OUT_AT    = SCENE_SLOT - FADE_DURATION; // 11500ms into scene
// Lines appear after the fade-in settles
const LINE_START     = 2400;
const LINE_INTERVAL  = 2400;

interface Props {
  onComplete: () => void;
}

export default function ForestIntroScreen({ onComplete }: Props) {
  const [sceneIdx, setSceneIdx]           = useState(0);
  const [sceneOpacity, setSceneOpacity]   = useState(0);
  const [linesMask, setLinesMask]         = useState([false, false, false, false]);
  const timersRef   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completedRef = useRef(false);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    timersRef.current.forEach(clearTimeout);
    onComplete();
  };

  useEffect(() => {
    playMusic("forest_region");

    const t = timersRef.current;

    const schedule = (fn: () => void, delay: number) => {
      t.push(setTimeout(fn, delay));
    };

    for (let s = 0; s < 3; s++) {
      const base = s * SCENE_SLOT;

      // 1) Swap scene while opacity is still 0 → new div mounts at opacity:0
      schedule(() => {
        setSceneIdx(s);
        setLinesMask([false, false, false, false]);
      }, base);

      // 2) 50ms later: push opacity to 1 → CSS transition animates 0→1 over FADE_DURATION
      schedule(() => setSceneOpacity(1), base + 50);

      // 3) Lines appear one by one inside the visible window
      for (let l = 0; l < 4; l++) {
        const lineIndex = l;
        schedule(() => {
          setLinesMask(prev => {
            const next = [...prev];
            next[lineIndex] = true;
            return next;
          });
        }, base + LINE_START + l * LINE_INTERVAL);
      }

      // 4) Begin fade-out exactly FADE_DURATION before the next slot
      schedule(() => setSceneOpacity(0), base + FADE_OUT_AT);
    }

    // After the last scene's fade-out completes, call onComplete
    schedule(() => {
      if (!completedRef.current) finish();
    }, 3 * SCENE_SLOT + 200);

    return () => t.forEach(clearTimeout);
  }, []);

  const panDuration = `${SCENE_SLOT + FADE_DURATION}ms`;

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden select-none">

      {/* Scene background with pan animation — remounts per scene via key */}
      <div
        key={sceneIdx}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${SCENES[sceneIdx]})`,
          backgroundSize: "cover",
          animation: `${PAN_ANIM[sceneIdx]} ${panDuration} linear forwards`,
          opacity: sceneOpacity,
          transition: `opacity ${FADE_DURATION}ms ease`,
        }}
      />

      {/* Subtle vignette overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.52) 100%)",
        }}
      />

      {/* Poem text — vertically and horizontally centered */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-10"
        style={{
          opacity: sceneOpacity,
          transition: `opacity ${FADE_DURATION}ms ease`,
          pointerEvents: "none",
        }}
      >
        {STANZAS[sceneIdx].map((line, i) => (
          <p
            key={`${sceneIdx}-${i}`}
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "clamp(9px, 1.35vw, 13px)",
              color: "#edf7ee",
              textShadow:
                "0 2px 14px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)",
              letterSpacing: "0.05em",
              lineHeight: 2.2,
              opacity: linesMask[i] ? 1 : 0,
              animation: linesMask[i] ? "introLineFadeIn 1s ease forwards" : "none",
              margin: 0,
              textAlign: "center",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Skip button */}
      <button
        onClick={finish}
        data-testid="button-intro-skip"
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          fontFamily: "'Press Start 2P', cursive",
          fontSize: 9,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.5)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 10px",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
      >
        SKIP ▶
      </button>

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 24,
          fontFamily: "'Press Start 2P', cursive",
          fontSize: 8,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.28)",
        }}
      >
        ELEMENTAL
      </div>
    </div>
  );
}
