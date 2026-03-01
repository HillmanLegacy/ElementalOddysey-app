import { playSfx } from "@/lib/sfx";
import type { SfxName } from "@/lib/sfx";

const SOUNDS: { name: SfxName; label: string }[] = [
  { name: "swordSwing", label: "Sword Swing" },
  { name: "mifuneSlice", label: "Mifune Slice (original)" },
  { name: "windSlash", label: "Wind Slash (samurai basic)" },
  { name: "hitMetal", label: "Hit Metal" },
  { name: "hitCombo", label: "Hit Combo" },
  { name: "block", label: "Block" },
  { name: "stabRing", label: "Stab Ring (spell hit)" },
  { name: "magicRing", label: "Magic Ring (spell cast)" },
  { name: "whoosh", label: "Whoosh" },
  { name: "gruntAttack", label: "Grunt Attack" },
  { name: "gruntHurt", label: "Grunt Hurt" },
  { name: "stabWhoosh", label: "Stab Whoosh" },
  { name: "fireballLaunch", label: "Fireball Launch" },
  { name: "explosion", label: "Explosion" },
  { name: "effectiveHit", label: "Super Effective" },

  { name: "potionHeal", label: "Potion Heal" },
  { name: "potionMana", label: "Potion Mana" },
  { name: "eruptionFirecharge", label: "Eruption Firecharge" },
  { name: "eruptionFlamelash", label: "Eruption Flamelash" },
  { name: "eruptionDownwardSlash", label: "Eruption Downward Slash" },
  { name: "eruptionCleave", label: "Eruption Cleave (explosion)" },
  { name: "incinerationCleave", label: "Incineration Cleave (flames)" },
  { name: "incinerationBladeSwings", label: "Incineration Blade Swings" },
  { name: "menuSelect", label: "Menu Select" },
  { name: "fireDemonDeath", label: "Fire Demon Death" },
  { name: "fireballImpact", label: "Fireball Impact" },
  { name: "fireballWhoosh", label: "Fireball Whoosh" },
  { name: "battleTransition", label: "Battle Transition" },
  { name: "saveGame", label: "Save Game" },
  { name: "recover", label: "Recover / Rest" },
  { name: "damage", label: "Damage (player hit)" },
  { name: "windBladeStart", label: "Wind Blade Start" },
];

export default function SfxTestPage() {
  return (
    <div style={{ background: "#111", minHeight: "100vh", padding: "32px", fontFamily: "monospace", color: "#fff" }}>
      <h1 style={{ color: "#f59e0b", marginBottom: "8px", fontSize: "20px" }}>Sound Test</h1>
      <p style={{ color: "#888", marginBottom: "24px", fontSize: "13px" }}>
        Click any button to play the sound. Some groups play a random variant each time.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
        {SOUNDS.map(({ name, label }) => (
          <button
            key={name}
            onClick={() => playSfx(name)}
            style={{
              background: "#1e1e1e",
              border: "1px solid #444",
              borderRadius: "6px",
              color: "#f0f0f0",
              padding: "10px 16px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "13px",
              transition: "background 0.1s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#2a2a2a")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1e1e1e")}
          >
            <span style={{ color: "#f59e0b", display: "block", marginBottom: "2px", fontSize: "11px" }}>{name}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
