# Elemental Odyssey - Turn-Based RPG

## Overview
A browser-based turn-based RPG with a board-style overworld, character selection from 3 starter characters, turn-based combat, leveling/perks, inventory/equipment, save/load functionality, and a party system where defeating bosses unlocks new party members.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS with shadcn/ui components
- **Backend**: Express.js with PostgreSQL (Drizzle ORM)
- **Game State**: Managed via React hooks (useGameState) on the frontend
- **Save System**: Backend API for persistent game saves

## Key Files
- `shared/schema.ts` - All data models: GameSave, PlayerCharacter, Enemy, BattleState, PartyMember, etc.
- `client/src/lib/gameData.ts` - Game constants, enemy pools, regions, perks, damage calculations, STARTER_CHARACTERS, party character definitions
- `client/src/lib/gameState.ts` - Game state hook with all game logic (battle, leveling, inventory, party, region progression)
- `client/src/components/` - All game screens: MainMenu, CharacterCreation, Overworld, BattleScreen, LevelUpScreen, PerkSelectScreen, ShopScreen, InventoryScreen, CharacterUnlockScreen
- `client/src/components/ParticleCanvas.tsx` - Canvas-based particle effects system
- `server/routes.ts` - CRUD API for game saves
- `server/storage.ts` - Database storage layer
- `server/db.ts` - PostgreSQL connection

## Game Flow
1. Main Menu → New Game / Continue / Options
2. Character Selection → Choose 1 of 3 starters (Knight/Fire, Samurai/Wind, Basken/Lightning) → Name → Energy Color → Energy Shape → Confirm
3. Overworld → Board-style node map with battle/shop/rest/boss nodes
4. Battle → Turn-based combat with Attack/Defend/Magic/Item actions + party auto-attacks
5. Boss Victory → Track boss defeats per region (need 3 clears to advance)
6. First area boss defeat → Unlock 2 remaining starter characters as party members (name each)
7. Level Up → Allocate stats + choose perk
8. Shop → Buy items/equipment

## Starter Character System
- 3 starter characters defined in STARTER_CHARACTERS (gameData.ts):
  - Knight (Fire): high HP/ATK/DEF, spriteId "knight"
  - Samurai (Wind): balanced with high AGI, spriteId "samurai"
  - Basken (Lightning): balanced with good LUCK/AGI, spriteId "basken"
- Player picks one at character creation, gets their element, stats, and sprite
- `starterCharacterId` on PlayerCharacter tracks which starter was chosen
- `spriteId` on PlayerCharacter determines overworld/battle sprite appearance

## Region Boss Progression
- Each region boss must be defeated 3 times before the next region unlocks
- `regionBossDefeats: Record<string, number>` tracks defeats per region (key = region index as string)
- After each boss defeat (if < 3): region nodes reset, enemies scale up by tier (1 + tier * 0.4)
- After 3rd defeat: next region unlocks, player moves to new region
- `isRegionUnlocked(regionId, regionBossDefeats)` checks if a region is accessible
- `getRegionTier(regionId, regionBossDefeats)` returns current scaling tier (0, 1, or 2)
- Region travel: prev/next arrows allow visiting any unlocked region
- Bottom bar shows 3 dots indicating boss clear progress per region

## Party Unlock System
- First time defeating Region 0 boss: both unchosen starter characters are queued for unlock
- `pendingUnlocks: PartyMemberDef[]` holds the queue of characters to unlock
- `pendingUnlock: PartyMemberDef | null` holds the current character being named
- Each unlock shows CharacterUnlockScreen where player names the new party member
- After naming, the next queued character is shown until all are processed

## Party System
- Party members auto-attack during "partyTurn" phase (no player input needed)
- Party members target the lowest HP enemy
- Enemies randomly target player or alive party members
- Party member stats scale with player level (1 + (level-1) * 0.15 multiplier)
- PartyMember type: id, name, className, element, level, stats, spriteId
- BattlePartyMember: extends with currentHp, defending for battle tracking
- PARTY_CHARACTERS in gameData.ts defines all 5 recruitable characters
- Turn flow: playerTurn → partyTurn → enemyTurn → playerTurn

## Party Sprite Assets
- Knight (Fire): 86x49 frames (2-row sheets), idle(4f top-row only), attack(7f top-row only), run(6f top-row only), hurt(2f top-row only)
  - NOTE: Knight sheets pack different animations per row; only top row is used for each animation type
- Ranger (Wind): 64x48 frames, idle(6f), attack(6f), run(6f), hurt(6f)
- Basken (Lightning): 56x56 frames, idle(5f), attack(8f), run(6f), hurt(3f)
- Knight2D (Light): 84x84 frames, idle(8f), attack(4f, uses knight2d-attack-1.png), run(8f), hurt(3f)
- AxeWarrior (Earth): 94x91 frames, idle(6f), attack(8f), run(6f), hurt(3f)
- Samurai (Wind): 96x96 frames, idle(10f), attack(10f), run(8f), hurt(3f)
- SpriteAnimator auto-detects multi-row sheets (calculates cols from image.naturalWidth / frameWidth)
- All sprite sheets stored as separate per-animation PNGs in client/src/assets/images/
- PARTY_SPRITE_MAP in BattleScreen.tsx maps spriteId to imported sprite sheets
- OVERWORLD_SPRITES in Overworld.tsx maps spriteId to overworld idle/run sprites

## Battle Animation System
- Event-driven animation queue (not setTimeout-based)
- Attack flow: idle → runToEnemy → attacking (sprite plays) → runBack → idle → partyTurn → enemyTurn
- Hurt animation plays when receiving damage from enemies
- Phase "animating" gates all input during animation sequences
- `onSetAnimating()` transitions to animating phase, `onFinishPlayerTurn()` transitions to partyTurn/enemyTurn
- Party turn uses schedulePartyTimer with cancellation refs for safe timer cleanup
- Party member hurt animations triggered via partyHurtIndex state

## Enemy Turn System
- Split into `enemyAttack(enemyIndex)` (single enemy damage) and `enemyTurnEnd()` (buffs/phase transition)
- enemyAttack returns { dodged: boolean, target: { type: "player" | "party", index: number } }
- Enemies randomly target player or alive party members
- BattleScreen sequences all alive enemies with `animateEnemyAttack` callback for per-enemy animations
- Each enemy gets its own attack animation + damage application before the next enemy starts
- 1-second delay after all enemies finish before `enemyTurnEnd` applies buffs and transitions to playerTurn
- Tidal Heal (water_regen perk) only heals if player HP > 0 after all attacks - defeat check happens first
- Phase guards prevent stale timer callbacks from modifying state after battle ends

## Animated Enemy Sprites
- Fire Demon (regular): SpriteAnimator with idle(4f 81x71), attack(8f 81x71), hurt(4f 81x71), death(7f 81x71). flipX=false (faces left)
- Dragon Lord (boss): SpriteAnimator with idle(4f 74x74), walk(8f 74x74), attack(16f 90x70), hurt(5f 130x130), death(36f 160x160). flipX=true (faces left)
- Dragon Lord has two attack patterns:
  - Close-range (60%): walk toward player → melee attack → walk back using bossOffset state + CSS transitions
  - Dark magic (40%): attack animation → dark purple explosion on player (CSS gradient animations)
- Fire explosion on player uses sfx-fire-burst.png (96x96, 9 frames) for demon attacks
- Frost Lizard (Ice regular): SpriteAnimator with idle(6f 148x96), attack(5f 148x96), hurt(2f 148x96). flipX=true (faces left)
  - Frost breath projectile: CSS radial gradient orb reusing fireballFly keyframe, icy blue glow
  - Frost hit overlay: blue radial gradient flash on player area, fades via fadeIn animation
- Jotem (Ice boss): SpriteAnimator with idle(6f 128x128), walk(8f 128x128), attack(10f 128x128), slash(10f 128x128), hurt(5f 128x128), death(12f 128x128). flipX=true (mirrored to face left)
  - Three attack patterns:
    - Ice magic (30%): attack animation → frost breath projectile → frost hit overlay on player
    - Sword slash (30%): slash animation with green energy arc VFX, fast ranged slash at 14fps
    - Close-range melee (40%): walk toward player → melee attack → walk back using bossOffset state
  - Uses shared bossOffset system with Dragon Lord for walk animations
- isAnimatedEnemyCheck helper centralizes animated enemy detection (Fire demons, Dragon Lord, Frost Lizard, Jotem)
- Timer cleanup via scheduleTimer/clearEnemyTurnTimers pattern prevents memory leaks

## Fujin's Slice (Wind Special)
- Cinematic wind magic spell exclusive to Wind element characters
- Animation: "fujinSlice" AnimPhase - camera zooms in (scale 1.45x) centered between player and target
- Iaijutsu dash animation: fujinDashPhase state tracks "windup" → "dash" → "strike" → "fadeout" → "return"
  - windup: attack anim plays but pauses at frame 3 (pre-swing) via SpriteAnimator pauseAtFrame prop
  - dash: player sprite slides rapidly through enemy position (translateX 450px)
  - strike: attack anim resumes from frame 3 (startFrame prop), 8 smear slash overlays appear on target
  - fadeout: player fades out at far position
  - return: player snaps back to original position and fades in
- 8 staggered smear VFX overlays (smear-h1/h2/h3.png 5-frame, smear-v1/v2/v3.png 6-frame) at random rotations
- Green vignette overlay during the cinematic for atmosphere
- Uses `startFujinSliceRef` pattern to handle hook ordering (defined after scheduleTimer)
- SpriteAnimator supports `startFrame` and `pauseAtFrame` props for frame-level control
- Spell: 14 MP cost, 2.0x damage multiplier, single target, Wind element

## Spell/Magic System
- Element-locked: characters only learn spells matching their element
- Spells defined in `gameData.ts` SPELLS array with Spell interface in schema
- Spell interface includes optional `animation` field for cinematic spell animations
- `getPlayerSpells(player)` returns available spells based on element and level
- Default spell: Speed Up (+5 AGI for 2 turns) available to all
- Element-specific damage spells unlocked by element choice
- Heal, Power Up, Iron Wall unlocked at levels 3, 5, 7
- Buffs tracked in `BattleState.buffs[]` with turn countdown
- `castSpell(spell, targetIndex?)` handles damage/buff/heal spell types

## Weapon Element System
- `InventoryItem` has optional `element` field (string, matching region themes: Fire/Ice/Shadow/Earth)
- Shop weapons have element matching their region theme
- Physical attack element: equipped weapon element || player element
- Magic attack element: always player element
- Elemental effectiveness: Fire>Ice, Ice>Earth, Earth>Fire, Shadow neutral (1.3x/0.8x/1.0x multipliers)
- `calculateDamage()` accepts optional `attackElement` and `defenderElement` params
- `getElementMultiplier()` returns multiplier + label ("Super effective!" / "Not very effective...")
- Battle log shows elemental effectiveness messages

## Inventory System
- Items tab: consumables only, with "Use" button for overworld healing (HP/MP)
- Equipment tab: shows equipped gear + unequipped equipable items from inventory with "Equip" button
- `useItemOverworld()` in gameState handles consumable use outside of battle
- Stats tab: character overview with all stats
- Perks tab: acquired perks list

## Overworld Menu
- Hamburger menu button (top-right) opens slide-out sidebar panel
- Contains: Inventory, Save Game menu items
- Replaces old separate inventory/save buttons

## Stat Allocation
- Automatic base stat growth per level: +5 MaxHP, +3 MaxMP, +1 ATK/DEF/AGI/INT/LUCK
- Per stat point spent: HP +10, MP +5, ATK/DEF/AGI/INT/LUCK +2
- 2 stat points per level-up + 1 perk selection

## Regions
- Ember Plains (Fire), Frozen Depths (Ice), Shadow Forest (Shadow), Crystal Desert (Earth)
- Each requires 3 boss clears to unlock the next

## Sound Effects System
- `client/src/lib/sfx.ts` - Audio engine with pooled HTMLAudio playback and volume control
- 25 MP3 files in `client/src/assets/audio/` converted from WAV sword combat pack
- SFX categories: swordSwing(3), hitMetal(2), hitCombo(2), block(2), stabRing(2), magicRing(3), whoosh(2), gruntAttack(4), gruntHurt(4), stabWhoosh(2)
- `playSfx(name, volumeScale?)` picks random variant from group, uses audio pool (max 3 per source)
- `setSfxVolume(percent)` synced from game settings via App.tsx useEffect
- Battle SFX triggers: player sword swing + grunt on attack, metal hit on impact, block on defend, magic ring on spell cast, whoosh + combo on Fujin dash, stabWhoosh + hit on enemy attacks, grunt on player hurt

## Database
- `game_saves` table stores serialized player data as JSONB

## Mobile Landscape Scaling
- `useViewportScale` hook in App.tsx detects mobile landscape (landscape orientation + viewport height <= 500px)
- When active, renders game at fixed 1024x640 design resolution with CSS `transform: scale()` to fit proportionally
- `.game-scale-container` CSS class in index.css overrides `h-screen` to `100%` so screens fill the design container
- Desktop and portrait orientations are unaffected (scale = 1, no wrapper)

## Running
- `npm run dev` starts Express backend + Vite frontend on port 5000
