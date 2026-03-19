# Elemental Odyssey - Turn-Based RPG

## Overview
Elemental Odyssey is a browser-based turn-based RPG focused on strategic combat and character progression. Players explore a board-style overworld, engage in turn-based combat, manage an inventory, equip items, and develop characters through leveling and perks. The game features character selection, a party system where new members are unlocked by defeating bosses, and persistent save functionality. The vision is to deliver an engaging and persistent RPG experience directly in a web browser.

## User Preferences
- **EO Fade**: The pixel dissolve transition effect (PixelDissolve component) is referred to as "EO fade." Used for battle transitions, enemy death, and UI popup appearances (e.g., victory screen fade-in uses `reverse` mode).

## System Architecture
The application features a **React + Vite + Tailwind CSS** frontend using **shadcn/ui** for UI components. The backend uses **Express.js** with **PostgreSQL** and **Drizzle ORM** for data persistence.

**Core Game Mechanics & Features:**
-   **Game State Management**: Frontend-driven via React hooks, handling battle logic, leveling, inventory, party, and region progression.
-   **Persistent Saves**: A 3-slot save system accessible from the overworld hut menu, with automatic loading of the most recent save.
-   **Character System**: Three starter characters (Knight/Fire, Samurai/Wind, Basken/Lightning), each with unique elements, stats, and sprites.
-   **Side-Scrolling Platformer Stages**: Clicking an overworld arrow launches a side-scrolling stage instead of direct node movement. The player traverses a 5000px-wide platformer (themed per region) with physics (gravity, jumping), walking/running sprites, and positioned enemies. Reaching the goal portal completes the stage and moves the player to the destination node. Touching an enemy triggers a battle transition (red EO fade → battle → EO fade back to stage). Enemy positions are saved; defeated enemies don't reappear. Player position is saved across battle round-trips. The retreat option returns the player to the overworld at the previous node.
    -   **Stage Data**: `client/src/components/SideScrollStage.tsx` contains `LAVA_STAGES` (Fire region, node keys `"100-101"` etc.) and `FOREST_STAGES` (Wind region, keys `"0-1"` etc.). The `regionTheme` prop selects the correct table and draws the appropriate background (`drawLavaBg` or `drawForestBg`).
-   **Overworld & Progression**: A node-based map with branching paths and distinct node types (hut, battle, shop, rest, shaman, boss). Navigation uses directional arrows. Defeating a region boss **once** unlocks new party members and progresses to the next region. `REGION_TIER_VARIANTS` is empty — no tier cycling.
    -   **5 Regions**: Verdant Fields (Wind, IDs 0–12) → Ember Plains (Fire, IDs 100–112) → Frozen Depths (Ice, IDs 200–213) → Shadow Forest (IDs 300–313) → Crystal Desert (Earth, IDs 400–413).
    -   **Movement Blocking**: Uncleared battle/boss nodes block forward progression, requiring players to clear them or retreat to safe/cleared nodes.
    -   **Defeat Mechanic**: Defeat returns the player to the current region's hut.
    -   **Hut Screen**: Clicking the hut node triggers an EO fade transition to a dedicated hut interior screen (with a pixel-art background image). The hut menu popup appears on this screen, providing access to Rest, Items, Party, Save, Options, and Leave. Leaving the hut triggers an EO fade back to the overworld. Sub-screens (Items, Party, Save, Options) return to the hut screen on close/back. Hut name and flavor text are region-themed (e.g., "Verdant Lodge" for Wind).
-   **Overworld Camera System**: A zoomed (1.8x) camera follows the player, with fixed UI overlays. Smooth panning is achieved with CSS transitions.
-   **Party System**: Defeating region bosses unlocks new party members from a pool. A bench system allows managing active and benched party members.
-   **Combat System**: AGI-based turn order. Party members have independent MP pools and access to a full combat menu (Attack/Defend/Magic/Item).
-   **Per-Character XP & Leveling**: Individual XP gain and level-up processing for each character, including stat allocation and perk selection.
-   **Inventory & Equipment**: Consumables are grouped by name, usable in the overworld with party member targeting.
-   **Merchant Stock System**: Shop stock persists between visits, replenishes after 5 battles, and resets upon region/tier progression.
-   **Spell/Magic System**: Level-based spell unlocks unique to each element. Additional spells can be learned from the Shaman's Lair.
-   **Perk System**: Level-gated perks per element. Perks have a `requiredLevel` field; only perks at or below the character's new level appear on level-up. Effects include percentage-based stat boosts (`percentStat`/`percentAmount`), dodge bonuses, elemental basic attacks (`elemental_basic_attack` adds character element to physical attacks), and physical damage reduction (`phys_damage_reduction`). Dodge perks stack with AGI-based dodge chance via `checkDodge(stats, perks)`.
    -   **Fire Perks**: Flames Of The Burning Heart (+10% ATK, lv1), Ember Feint (+10% dodge, lv4), Heat Charge (fire element on basic attack, lv6), Blazing Aura (-5% non-magic damage, lv10).
    -   **Wind Perks**: Calm Of The Storm (+10% AGI, lv1), Fujin's Bravery (+10% ATK, lv4), Clinging Hurricane (wind element on basic attack, lv6), Wind Step (+5% dodge, lv10).
-   **Weapon Element System**: Weapons have elemental properties influencing physical attack damage based on elemental effectiveness multipliers.
-   **Damage & Balance System**:
    -   **Damage Formula**: `baseDamage = (offense²) / (offense + defense) * skillMultiplier`.
    -   **Elemental Multipliers**: 1.3x advantage, 0.7x disadvantage.
    -   **Crit Chance**: 5% base, 2x damage, ±10% variance.
    -   **Enemy Scaling**: HP, ATK, DEF scale with level; region and tier apply additional scaling.
-   **Battle Position System**: Uses percentage-based coordinates for character and enemy placement. A unified slot system manages dynamic positioning for various battle scenarios and animations.
-   **UI/UX**:
    -   **Responsive Design**: `useViewportScale` hook scales the game to fit a fixed 1024x640 resolution.
    -   **Theming**: Unified pixel-art theme with "Press Start 2P" font, amber accents, and sharp edges.
    -   **Shared Game Menu**: `GameMenuPanel` component (`client/src/components/GameMenuPanel.tsx`) provides a unified tabbed popup used across Overworld, SideScrollStage, and ClimbingStage. Tabs: PARTY, ITEMS, GEAR, STATUS (inline stats/spells/perks), OPTIONS (text speed, music/sfx volume), SAVE. Stages also show an EXIT button. STATUS and OPTIONS are inline tabs, not separate screens.
-   **Animation System**:
    -   **Battle Transition**: Pixel-dissolve fade to black for seamless transitions between overworld and battle.
    -   **Battle Animations**: Event-driven queue manages character actions (attack, run, hurt).
    -   **Knight Animations**: Full sprite sheet with idle (4f), special attack (7f), basic attack (7f), and death (7f) at 86x49px per frame.
    -   **Incineration Slash**: Fire magic spell (replaces Fire Bolt) with custom animation — player runs to enemy, plays special attack sprite, fire explosion VFX triggers on 3rd and 6th frames.
    -   **Animated Enemy Sprites**: Detailed idle, attack, hurt, and death animations for key enemies. Forest region enemies (Minotaur 128×128, Cyclops 245×128, Harpy 96×96) each have full walk-approach + dual-attack + hurt + death sprite sets. Forest enemies walk to their target, strike (60% chance attack1, 40% attack2 for Minotaur/Cyclops), then walk back and return to idle.
    -   **Special VFX**: Cinematic spell animations with camera zooms, sprite transformations, and staggered visual effects.
    -   **Enemy Death Animation**: Features a pixel-dissolve effect triggered after a death animation or a delay for non-animated enemies.
-   **Sound System**: An audio engine manages pooled HTMLAudio playback for sound effects with volume control and pitched variations for specific effects.
-   **Music System**: A dual-layer audio manager (`client/src/lib/music.ts`) with crossfade transitions (800ms, 30ms steps):
    -   **Ambient Layer** (`playAmbient`/`stopAmbient`): Screen-specific sounds — hut theme (hut screen), lava region ambiance (fire region overworld), game over BGM (defeat).
    -   **Music Layer** (`playMusic`/`stopMusic`): Continuous background music — lava region music plays uninterrupted across overworld and hut screens.
    -   `stopAll()` stops both layers. Both layers respect the shared musicVolume setting.

## External Dependencies
-   **React**: Frontend UI library.
-   **Vite**: Frontend build tool.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **shadcn/ui**: React component library.
-   **Express.js**: Backend web framework.
-   **PostgreSQL**: Relational database.
-   **Drizzle ORM**: TypeScript ORM for PostgreSQL.