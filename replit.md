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
-   **Overworld & Progression**: A board-style node map features battle, shop, rest, shaman, and boss nodes. Region progression requires defeating each boss three times, with enemy scaling occurring after each defeat until the next region unlocks.
-   **Party System**: Defeating region bosses unlocks new party members one at a time. First boss defeat with 2+ unchosen starters shows a selection screen (CharacterSelectUnlock), subsequent defeats auto-unlock the remaining character. Party members have individual MP pools tracked via `BattlePartyMember.currentMp`. Party management screen accessible from overworld hamburger menu shows stats, spells, and allows removing members.
-   **Combat System**: AGI-based turn queue determines combat order each round (`buildTurnQueue` sorts all combatants by AGI). All party members have full menu access (Attack/Defend/Magic/Item) with element-specific spells via `getPartyMemberSpells`. Party member MP is tracked independently from player MP. Victory screen shows with 1.2s delay after final kill for smooth transition.
-   **Per-Character XP & Leveling**: Each character (player + party members) gains XP independently. Level-up queue (`PendingLevelUp`) processes multiple characters sequentially through stat allocation and perk selection. Medieval-themed level-up screen shows character sprite, name, element badge, and new spell notifications.
-   **Inventory & Equipment**: Separate tabs for consumables (usable in overworld for healing with party member targeting) and equipable items.
-   **Spell/Magic System**: Level-based spell unlocks defined via `ELEMENT_SPELL_UNLOCKS` in `gameData.ts`. Each element has spells that unlock at specific levels. Characters can also learn additional spells from the Shaman's Lair (costs gold). `SHAMAN_SPELLS` maps spriteId to learnable spells. Player and party members track `learnedSpells` arrays for shaman-taught spells. Spells have MP costs and element-specific effects with optional cinematic animations. Buffs are tracked with turn countdowns.
-   **Weapon Element System**: Weapons can have elemental properties (Fire, Ice, Shadow, Earth) that influence physical attack damage based on elemental effectiveness multipliers (e.g., Fire > Ice).
-   **UI/UX**:
    -   Responsive design with mobile landscape scaling using `useViewportScale` hook, transforming the game to fit fixed 1024x640 resolution.
    -   A hamburger menu provides access to inventory and save options.
-   **Animation System**:
    -   **Battle Animations**: Event-driven animation queue manages player and enemy actions (e.g., attack, run, hurt).
    -   **Animated Enemy Sprites**: Specific enemies (Fire Demon, Dragon Lord, Frost Lizard, Jotem) feature detailed sprite animations for idle, attack, hurt, and death states, some with multiple attack patterns (e.g., Dragon Lord's close-range vs. dark magic attacks).
    -   **Special VFX**: Cinematic spell animations like "Fujin's Slice" (Wind Special) involve camera zooms, sprite transformations, and staggered visual effects. Tempest spell uses camera zoom (scale 1.3 to enemy area), per-enemy tornado VFX with conic gradients, and ambient particles. Wind VFX utilize sprite sheets for slashes.
-   **Sound System**: An audio engine (`sfx.ts`) manages pooled HTMLAudio playback for various in-game sound effects (sword swings, hits, magic, grunts) with volume control.

## External Dependencies
-   **React**: Frontend UI library.
-   **Vite**: Fast frontend build tool.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **shadcn/ui**: Component library for React.
-   **Express.js**: Backend web framework.
-   **PostgreSQL**: Relational database for persistent storage.
-   **Drizzle ORM**: TypeScript ORM for PostgreSQL.

## Damage & Balance System
- **Damage Formula (ratio-based)**: `baseDamage = (offense²) / (offense + defense) * skillMultiplier`
  - Physical: offense = ATK, defense = DEF
  - Magical: offense = INT, defense = INT
  - Element multipliers applied after base calculation (1.3x advantage, 0.7x disadvantage)
  - Crits: 5% base chance, 2x damage multiplier; variance ±10%
- **Enemy Tiers**:
  - Lesser enemies (level 1-2): HP = 18+lv*10, ATK = 5+lv*2.5, DEF = 3+lv*1.5
  - Bosses (level 4-7): HP = 50+lv*25, ATK = 8+lv*3, DEF = 5+lv*2
  - Region scaling: baseScale = 1 + regionId * 0.5, tierScale = 1 + tier * 0.25
- **Balance targets**: Lesser enemies die in 3-4 hits, bosses require strategy/leveling, player never deals less than MIN_DAMAGE (1)

## Battle Position System
- All battle positions use percentage-based coordinates (left%, bottom%) relative to the battle container
- PLAYER_POS = { x: 12, y: 18 } - fixed player idle position
- PARTY_POSITIONS = [{ x: 4, y: 12 }, { x: 12, y: 10 }, { x: 20, y: 12 }] - fixed party member slots (absolute positioned)
- ENEMY_POSITIONS = [{ x: 58, y: 42 }, { x: 72, y: 36 }, { x: 65, y: 52 }, { x: 80, y: 48 }] - fixed enemy slots with z-scale
- getPlayerPosition() computes dynamic player position based on animPhase and target enemy index
- Run-to-enemy: player/party moves to target.x - 8%, target.y (stops slightly left of the targeted enemy)
- Boss melee: boss walks to target.x + 8%, target.y (stops slightly right of the targeted character) using left/bottom transitions via bossOffset
- Fujin dash: player moves to target.x + 12%, target.y (passes through enemy)
- Movement uses CSS left/bottom transitions (not transform-based), fires onTransitionEnd on "left" property
- runBackHandled ref prevents double-firing; fallback timer (500ms) ensures phase advances if transition doesn't fire