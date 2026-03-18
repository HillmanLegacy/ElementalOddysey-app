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

const SCENE_DURATION = 12500;
const FADE_DURATION  = 1000;
const LINE_DELAY     = 2000;
const LINE_INTERVAL  = 2500;

interface Props {
  onComplete: () => void;
}

export default function ForestIntroScreen({ onComplete }: Props) {
  const [sceneIdx, setSceneIdx]       = useState(0);
  const [sceneOpacity, setSceneOpacity] = useState(0);
  const [linesMask, setLinesMask]     = useState([false, false, false, false]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
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
    let offset = 0;

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      t.push(id);
    };

    for (let s = 0; s < 3; s++) {
      const base = offset;

      schedule(() => {
        setSceneIdx(s);
        setLinesMask([false, false, false, false]);
        setSceneOpacity(1);
      }, base);

      for (let l = 0; l < 4; l++) {
        const lineTime = base + LINE_DELAY + l * LINE_INTERVAL;
        const lineIndex = l;
        schedule(() => {
          setLinesMask(prev => {
            const next = [...prev];
            next[lineIndex] = true;
            return next;
          });
        }, lineTime);
      }

      const fadeStart = base + SCENE_DURATION - FADE_DURATION;
      schedule(() => setSceneOpacity(0), fadeStart);

      offset += SCENE_DURATION;
    }

    schedule(() => {
      if (!completedRef.current) finish();
    }, offset + 400);

    return () => t.forEach(clearTimeout);
  }, []);

  const panDuration = `${SCENE_DURATION}ms`;

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden select-none">
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

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col items-center gap-3 pb-14 px-8"
        style={{ opacity: sceneOpacity, transition: `opacity ${FADE_DURATION}ms ease` }}
      >
        {STANZAS[sceneIdx].map((line, i) => (
          <p
            key={`${sceneIdx}-${i}`}
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "clamp(9px, 1.4vw, 14px)",
              color: "#e8f5e9",
              textShadow: "0 2px 12px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.8)",
              letterSpacing: "0.04em",
              lineHeight: 2,
              opacity: linesMask[i] ? 1 : 0,
              animation: linesMask[i] ? "introLineFadeIn 0.9s ease forwards" : "none",
              margin: 0,
              textAlign: "center",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      <button
        onClick={finish}
        data-testid="button-intro-skip"
        className="absolute top-5 right-6 text-white/60 hover:text-white/90 transition-colors"
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: 9,
          letterSpacing: "0.12em",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 10px",
        }}
      >
        SKIP ▶
      </button>

      <div
        className="absolute top-5 left-6 text-white/35"
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: 8,
          letterSpacing: "0.2em",
        }}
      >
        ELEMENTAL
      </div>
    </div>
  );
}
