# Elemental Odyssey - Turn-Based RPG

## Overview
Elemental Odyssey is a browser-based turn-based RPG. Players navigate a board-style overworld, engage in turn-based combat, and develop their characters through leveling and perks. The game features character selection, an inventory system, equipment management, and a party system where defeating bosses unlocks new party members. The core purpose is to provide an engaging and persistent RPG experience in a web browser, focusing on strategic combat and character progression.

## User Preferences
No explicit user preferences were provided.

## System Architecture
The application uses a **React + Vite + Tailwind CSS** frontend with **shadcn/ui** components for a modern UI/UX. The backend is built with **Express.js** and uses **PostgreSQL** with **Drizzle ORM** for data persistence.

**Core Game Mechanics & Features:**
-   **Game State Management**: Handled on the frontend via React hooks (`useGameState`), encompassing battle logic, leveling, inventory, party management, and region progression.
-   **Persistent Saves**: A backend API facilitates saving and loading game progress.
-   **Character System**: Players select from three starter characters (Knight/Fire, Samurai/Wind, Basken/Lightning), each with unique elements, stats, and sprites. The `starterCharacterId` tracks the initial choice, and `spriteId` manages visual appearance.
-   **Overworld & Progression**: A board-style node map features battle, shop, rest, and boss nodes. Region progression requires defeating each boss three times, with enemy scaling occurring after each defeat until the next region unlocks.
-   **Party System**: Defeating the first region boss unlocks the remaining starter characters as party members. Party members auto-attack, scale with the player's level, and enemies can target them.
-   **Combat System**: Turn-based combat with player actions (Attack, Defend, Magic, Item) and a dedicated "partyTurn" phase for party member auto-attacks.
-   **Leveling & Perks**: Players allocate stat points and select perks upon leveling up.
-   **Inventory & Equipment**: Separate tabs for consumables (usable in overworld for healing) and equipable items.
-   **Spell/Magic System**: Element-locked spells defined in `gameData.ts`, with optional cinematic animations. Spells have MP costs and element-specific effects. Buffs are tracked with turn countdowns.
-   **Weapon Element System**: Weapons can have elemental properties (Fire, Ice, Shadow, Earth) that influence physical attack damage based on elemental effectiveness multipliers (e.g., Fire > Ice).
-   **UI/UX**:
    -   Responsive design with mobile landscape scaling using `useViewportScale` hook, transforming the game to fit fixed 1024x640 resolution.
    -   A hamburger menu provides access to inventory and save options.
-   **Animation System**:
    -   **Battle Animations**: Event-driven animation queue manages player and enemy actions (e.g., attack, run, hurt).
    -   **Animated Enemy Sprites**: Specific enemies (Fire Demon, Dragon Lord, Frost Lizard, Jotem) feature detailed sprite animations for idle, attack, hurt, and death states, some with multiple attack patterns (e.g., Dragon Lord's close-range vs. dark magic attacks).
    -   **Special VFX**: Cinematic spell animations like "Fujin's Slice" (Wind Special) involve camera zooms, sprite transformations, and staggered visual effects. Wind VFX utilize sprite sheets for slashes and a vortex texture for broader effects.
-   **Sound System**: An audio engine (`sfx.ts`) manages pooled HTMLAudio playback for various in-game sound effects (sword swings, hits, magic, grunts) with volume control.

## External Dependencies
-   **React**: Frontend UI library.
-   **Vite**: Fast frontend build tool.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **shadcn/ui**: Component library for React.
-   **Express.js**: Backend web framework.
-   **PostgreSQL**: Relational database for persistent storage.
-   **Drizzle ORM**: TypeScript ORM for PostgreSQL.