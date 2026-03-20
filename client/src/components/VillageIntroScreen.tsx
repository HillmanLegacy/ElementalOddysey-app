import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import villageBg from "@assets/forest_region_village_1774010989526.jpg";

const ac = "#c9a44a";

const LEAF_COLORS = ["#5aaa2a", "#7bc840", "#a8d858", "#c4d040", "#8fc050", "#b8c028"];
const LEAF_STROKE = ["#3a7a1a", "#4a9828", "#6a9828", "#8a9020", "#5a8030", "#7a9010"];
const LEAVES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  top: 3 + ((i * 67 + 13) % 82),
  size: 9 + ((i * 11 + 3) % 8),
  color: LEAF_COLORS[(i * 3 + 1) % LEAF_COLORS.length],
  stroke: LEAF_STROKE[(i * 5 + 2) % LEAF_STROKE.length],
  duration: 9 + ((i * 37 + 7) % 10),
  delay: -((i * 2.3 + 1.1) % 18),
  flipX: i % 3 === 1 ? -1 : 1,
  variant: i % 2 === 0 ? "A" : "B",
}));

const DIALOGUE: { speaker: string; text: string; color: string }[] = [
  { speaker: "Mira",   text: "Something stirs in the deep forest... The animals haven't gone near the old grove in days.", color: "#c8d8a0" },
  { speaker: "Gareth", text: "Aye. Three hunters ventured in at dawn yesterday. None have returned.", color: "#d0c090" },
  { speaker: "Mira",   text: "Whatever it is, it's spreading. The trees look wrong. Twisted, almost.", color: "#c8d8a0" },
  { speaker: "Gareth", text: "We need someone brave enough — or daft enough — to find out what's happening.", color: "#d0c090" },
  { speaker: "Mira",   text: "There is the Wind Shaman. Lania. They say she can witness any distant event through her magic.", color: "#c8d8a0" },
  { speaker: "Gareth", text: "If anyone knows what lurks out there, it would be her. But the path is not safe.", color: "#d0c090" },
  { speaker: "Mira",   text: "Someone will seek her out. Someone always does...", color: "#c8d8a0" },
];

const CHAR_MS     = 38;
const FADE_IN_MS  = 1500;
const LINE_HOLD   = 5300;
const FIRST_LINE  = FADE_IN_MS + 500;

const LAST_LINE_T      = FIRST_LINE + (DIALOGUE.length - 1) * LINE_HOLD;
const LAST_LINE_CHARS  = DIALOGUE[DIALOGUE.length - 1].text.length;
const LAST_TYPING_MS   = LAST_LINE_CHARS * CHAR_MS;
const FADE_OUT_AT      = LAST_LINE_T + LAST_TYPING_MS + 1500;
const PAN_MS           = FADE_OUT_AT;
const COMPLETE_AT      = FADE_OUT_AT + 950;

interface Props { onComplete: () => void; }

export default function VillageIntroScreen({ onComplete }: Props) {
  const [bgPosY, setBgPosY]           = useState(0);
  const [panActive, setPanActive]     = useState(false);
  const [blackOpacity, setBlackOpacity] = useState(1);
  const [lineIdx, setLineIdx]         = useState(0);
  const [lineVisible, setLineVisible] = useState(false);
  const [typedChars, setTypedChars]   = useState(0);
  const timers   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const typerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const done     = useRef(false);

  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };

  const stopTyper = () => {
    if (typerRef.current) { clearInterval(typerRef.current); typerRef.current = null; }
  };

  const startTyper = (text: string) => {
    stopTyper();
    setTypedChars(0);
    let count = 0;
    typerRef.current = setInterval(() => {
      count++;
      setTypedChars(count);
      if (count >= text.length) stopTyper();
    }, CHAR_MS);
  };

  const finish = useCallback((skip = false) => {
    if (done.current) return;
    done.current = true;
    timers.current.forEach(clearTimeout);
    stopTyper();
    setLineVisible(false);
    setBlackOpacity(1);
    setTimeout(onComplete, skip ? 800 : 100);
  }, [onComplete]);

  useEffect(() => {
    schedule(() => setBlackOpacity(0), 50);
    schedule(() => { setPanActive(true); setBgPosY(100); }, 80);

    schedule(() => { setLineVisible(true); startTyper(DIALOGUE[0].text); }, FIRST_LINE);

    for (let i = 1; i < DIALOGUE.length; i++) {
      const t = FIRST_LINE + i * LINE_HOLD;
      schedule(() => {
        setLineVisible(false);
        stopTyper();
        schedule(() => {
          setLineIdx(i);
          setTypedChars(0);
          setLineVisible(true);
          startTyper(DIALOGUE[i].text);
        }, 350);
      }, t);
    }

    schedule(() => { setLineVisible(false); setBlackOpacity(1); }, FADE_OUT_AT);
    schedule(() => finish(false), COMPLETE_AT);

    return () => { timers.current.forEach(clearTimeout); stopTyper(); };
  }, []);

  const line = DIALOGUE[lineIdx];
  const displayText = line.text.slice(0, typedChars);
  const isTyping = typedChars < line.text.length;

  return (
    <div
      className="fixed inset-0 z-[300] overflow-hidden select-none"
      style={{ cursor: "default" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${villageBg})`,
          backgroundSize: "120% 120%",
          backgroundPosition: `50% ${bgPosY}%`,
          transition: panActive ? `background-position ${PAN_MS}ms linear` : "none",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.6) 100%)" }}
      />

      {LEAVES.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute pointer-events-none"
          style={{
            top: `${leaf.top}%`,
            left: 0,
            zIndex: 3,
            animation: `leafDrift${leaf.variant} ${leaf.duration}s linear ${leaf.delay}s infinite`,
          }}
        >
          <svg
            width={leaf.size * 1.6}
            height={leaf.size}
            viewBox="0 0 16 9"
            style={{ transform: `scaleX(${leaf.flipX})` }}
          >
            <ellipse cx="7.5" cy="4.5" rx="7" ry="3.8" fill={leaf.color} opacity="0.84" />
            <path d="M1,4.5 Q7.5,1.2 15,4.5" stroke={leaf.stroke} strokeWidth="0.8" fill="none" opacity="0.65" />
            <path d="M7.5,1 L7.5,8" stroke={leaf.stroke} strokeWidth="0.5" fill="none" opacity="0.4" />
          </svg>
        </div>
      ))}

      {/* Tavern-style full-width bottom dialogue bar */}
      <div
        className="absolute left-0 right-0 bottom-0 flex"
        style={{
          height: "155px",
          background: "linear-gradient(180deg, #0a0808f4 0%, #0d0b0bfa 100%)",
          borderTop: `2px solid ${ac}`,
          boxShadow: `0 -4px 30px #000000a0`,
          fontFamily: "'Press Start 2P', cursive",
          pointerEvents: "none",
          opacity: lineVisible ? 1 : 0,
          transition: "opacity 0.35s ease",
          zIndex: 5,
        }}
      >
        {/* Speaker column */}
        <div
          className="flex flex-col justify-start flex-shrink-0"
          style={{ width: "130px", borderRight: `1px solid ${ac}25`, padding: "14px 14px" }}
        >
          <div className="flex items-center gap-1.5" style={{ marginBottom: "6px" }}>
            <MessageSquare style={{ width: "12px", height: "12px", flexShrink: 0, color: ac }} />
            <span style={{ fontSize: "6px", color: ac, letterSpacing: "1.5px", lineHeight: "1.6" }}>
              {line.speaker.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Text column */}
        <div style={{ flex: 1, overflow: "hidden", padding: "14px 20px", position: "relative" }}>
          <p style={{ fontSize: "10px", color: line.color, letterSpacing: "1px", lineHeight: "2.4", whiteSpace: "pre-line", margin: 0 }}>
            "{displayText}<span style={{ opacity: isTyping ? 1 : 0 }}>▌</span>"
          </p>
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
        @keyframes leafDriftA {
          0%   { transform: translateX(-30px) translateY(0px) rotate(0deg);   opacity: 0; }
          7%   { opacity: 0.82; }
          25%  { transform: translateX(270px) translateY(-24px) rotate(88deg); }
          50%  { transform: translateX(540px) translateY(16px)  rotate(178deg); }
          75%  { transform: translateX(810px) translateY(-14px) rotate(265deg); }
          93%  { opacity: 0.72; }
          100% { transform: translateX(1110px) translateY(6px)  rotate(345deg); opacity: 0; }
        }
        @keyframes leafDriftB {
          0%   { transform: translateX(-30px) translateY(0px) rotate(0deg);    opacity: 0; }
          7%   { opacity: 0.78; }
          25%  { transform: translateX(260px) translateY(22px)  rotate(-82deg); }
          50%  { transform: translateX(530px) translateY(-20px) rotate(-168deg); }
          75%  { transform: translateX(800px) translateY(12px)  rotate(-252deg); }
          93%  { opacity: 0.68; }
          100% { transform: translateX(1110px) translateY(-8px) rotate(-330deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
