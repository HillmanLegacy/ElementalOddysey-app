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

const SCENES   = [scene1, scene2, scene3];
const PAN_ANIM = ["introPanLR", "introPanRL", "introPanLR"];

// Scene-transition crossfade: 1500ms out + 1500ms in = 3 seconds total
const FADE_DURATION = 1500;

// Lines arrive slowly so readers can follow comfortably
const LINE_START    = 3500;  // first line appears 3.5 s after scene starts
const LINE_INTERVAL = 4500;  // each subsequent line 4.5 s later

// Last line lands at: LINE_START + 3 * LINE_INTERVAL = 3500 + 13500 = 17000ms
// Give 3 s of reading time after the last line, then start fade-out
const FADE_OUT_AT = 17000 + 3000; // 20000ms into scene
const SCENE_SLOT  = FADE_OUT_AT + FADE_DURATION; // 21500ms per scene

interface Props {
  onComplete: () => void;
}

export default function ForestIntroScreen({ onComplete }: Props) {
  const [sceneIdx, setSceneIdx]         = useState(0);
  const [sceneOpacity, setSceneOpacity] = useState(0);
  const [linesMask, setLinesMask]       = useState([false, false, false, false]);
  // Overlay that fades to black when Skip is pressed
  const [finalFade, setFinalFade]       = useState(false);
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completedRef = useRef(false);

  // skipMode=true  → fade to black over FADE_DURATION, then call onComplete
  // skipMode=false → screen already black (end of last scene); call onComplete immediately
  const finish = (skipMode: boolean) => {
    if (completedRef.current) return;
    completedRef.current = true;
    timersRef.current.forEach(clearTimeout);
    if (skipMode) {
      setFinalFade(true);
      setTimeout(() => onComplete(), FADE_DURATION);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    playMusic("forest_region");

    const t = timersRef.current;
    const schedule = (fn: () => void, delay: number) => {
      t.push(setTimeout(fn, delay));
    };

    for (let s = 0; s < 3; s++) {
      const base = s * SCENE_SLOT;

      // 1) Swap scene while opacity is 0 — new div mounts at opacity:0
      schedule(() => {
        setSceneIdx(s);
        setLinesMask([false, false, false, false]);
      }, base);

      // 2) 50ms later: animate opacity 0→1 (FADE_DURATION ms fade-in)
      schedule(() => setSceneOpacity(1), base + 50);

      // 3) Lines appear one by one in the visible window
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

      // 4) Fade-out starts FADE_DURATION before the slot ends
      schedule(() => setSceneOpacity(0), base + FADE_OUT_AT);
    }

    // After the last scene's fade-out completes, the screen is already black
    schedule(() => {
      finish(false);
    }, 3 * SCENE_SLOT + 200);

    return () => t.forEach(clearTimeout);
  }, []);

  const panDuration = `${SCENE_SLOT + FADE_DURATION}ms`;

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden select-none">

      {/* Scene background — remounts per scene via key, pans during the slot */}
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

      {/* Radial vignette — aids readability without obscuring scenes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Poem text — vertically and horizontally centered */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-10"
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
              lineHeight: 2.4,
              opacity: linesMask[i] ? 1 : 0,
              animation: linesMask[i] ? "introLineFadeIn 1.2s ease forwards" : "none",
              margin: 0,
              textAlign: "center",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Skip-to-black overlay — fades in when SKIP is pressed */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{
          opacity: finalFade ? 1 : 0,
          transition: finalFade ? `opacity ${FADE_DURATION}ms ease` : "none",
        }}
      />

      {/* Skip button */}
      <button
        onClick={() => finish(true)}
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
          zIndex: 10,
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
          zIndex: 10,
        }}
      >
        ELEMENTAL
      </div>
    </div>
  );
}
