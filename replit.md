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
-   **Overworld & Progression**: A node-based map with branching paths and distinct node types (hut, battle, shop, rest, shaman, boss). Navigation uses directional arrows. Defeating a region boss three times unlocks new party members and progresses to the next region.
    -   **Movement Blocking**: Uncleared battle/boss nodes block forward progression, requiring players to clear them or retreat to safe/cleared nodes.
    -   **Defeat Mechanic**: Defeat returns the player to the current region's hut.
    -   **Hut Menu**: Provides access to Rest, Items, Party, and Save options with region-specific theming.
-   **Overworld Camera System**: A zoomed (1.8x) camera follows the player, with fixed UI overlays. Smooth panning is achieved with CSS transitions.
-   **Tier-Based Map Variants**: Each region has 3 distinct map layouts that change with progression, offering fresh exploration.
-   **Party System**: Defeating region bosses unlocks new party members from a pool. A bench system allows managing active and benched party members.
-   **Combat System**: AGI-based turn order. Party members have independent MP pools and access to a full combat menu (Attack/Defend/Magic/Item).
-   **Per-Character XP & Leveling**: Individual XP gain and level-up processing for each character, including stat allocation and perk selection.
-   **Inventory & Equipment**: Consumables are grouped by name, usable in the overworld with party member targeting.
-   **Merchant Stock System**: Shop stock persists between visits, replenishes after 5 battles, and resets upon region/tier progression.
-   **Spell/Magic System**: Level-based spell unlocks unique to each element. Additional spells can be learned from the Shaman's Lair.
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
-   **Animation System**:
    -   **Battle Transition**: Pixel-dissolve fade to black for seamless transitions between overworld and battle.
    -   **Battle Animations**: Event-driven queue manages character actions (attack, run, hurt).
    -   **Animated Enemy Sprites**: Detailed idle, attack, hurt, and death animations for key enemies.
    -   **Special VFX**: Cinematic spell animations with camera zooms, sprite transformations, and staggered visual effects.
    -   **Enemy Death Animation**: Features a pixel-dissolve effect triggered after a death animation or a delay for non-animated enemies.
-   **Sound System**: An audio engine manages pooled HTMLAudio playback for sound effects with volume control and pitched variations for specific effects.

## External Dependencies
-   **React**: Frontend UI library.
-   **Vite**: Frontend build tool.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **shadcn/ui**: React component library.
-   **Express.js**: Backend web framework.
-   **PostgreSQL**: Relational database.
-   **Drizzle ORM**: TypeScript ORM for PostgreSQL.