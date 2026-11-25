# Risk of Bonk

A 360° third-person roguelike for the browser, in the spirit of *Risk of Rain 2* crossed with *Megabonk*.
Pure JavaScript + Three.js (vendored, no build step, no install).

Play with **mouse & keyboard**, a **controller** (any standard gamepad) or **touch** (virtual joystick) on phones.

## Running it

Browsers block ES modules from `file://`, so serve the folder with any static server:

```bash
# from the repo root, pick one:
python3 -m http.server 8000
npx serve .
```

Then open <http://localhost:8000>.

**On your phone:** either open `http://<your-PC-LAN-IP>:8000` on the same Wi-Fi, or host it on
GitHub Pages: the included workflow (`.github/workflows/pages.yml`) deploys automatically once you set
**Settings → Pages → Source: GitHub Actions**. Add it to your home screen for fullscreen play.

## Controls

| Action | Mouse & Keyboard | Controller | Touch |
|---|---|---|---|
| Move / Look | WASD / Mouse (click to lock) | Left / Right stick | Left joystick / drag right side |
| Primary attack | **automatic** (auto-aims at the nearest enemy; hold Left Click to fire at the crosshair) | automatic | automatic |
| Ability 1 | Right click / Q | LT | ⚡ button |
| Ability 2 | Shift | RB | button |
| Ultimate | R | Y / LB | gold button |
| Jump (multi-jump) | Space | A | ⤒ |
| Interact | E / F | X | ✋ (appears when near) |
| Items & stats | Hold Tab | View/Back | 🎒 |
| Pause | Esc / P | Start | ⏸ |
| Full map | M or click the minimap | – | tap the minimap |
| Pick level-up | 1 / 2 / 3 or click | D-pad + A | tap |

## How a run works

- **Difficulty:** grows ×1.055 per minute and ×1.3 per cleared stage. On top of that, enemies scale with **you**:
  their health follows your damage per second (your build's expected DPS and what you actually dealt recently),
  their damage follows how much you can take (max HP, armor, shield). More enemies spawn, faster and in bigger groups.
- **Collision:** rocks, pillars, ruin walls, arches and caves have real heights — you can jump over low things and stand on
  rocks, pillars and wall tops; gaps in broken walls are open and nothing blocks you high up in the air.
- **Elites:** rare, bigger (1.5×) and much tougher versions of normal enemies with an affix (Blazing, Glacial, Overloading,
  Vampiric) and a rune floating above their head. About 2.5% of spawns at the start, slowly rising to 12% (more in overtime).
  They give 4× coins/XP, have a **5% chance to drop a random item** (rarity rolled like a small chest, legendary rarest,
  luck helps) and a **1% chance to drop a free chest** of a random tier (doesn't raise chest prices).
- **Stage clock (10 minutes):** a steady stream of enemies that grows every minute, **HUGE waves at 3:00 and 6:00** (for one full minute big groups pour in from all sides, much faster than normal), a **Champion mini-boss at 5:00 and 8:00** (giant, tanky version of the stage's toughest enemy; drops an item). After **10:00 comes OVERTIME**: Overtime Reapers — Megabonk-style ghosts that spawn all around you and fly straight at you (through terrain and walls) — plus elite groups. Their strength grows exponentially in three phases: doubling every 30 s for the first minute (×4), then every 12 s until 3:00 (×4096), then every 4 s; waves come every 2.5 s → 1 s → 0.35 s and the ghosts get faster each phase. Only an absurdly strong build survives long — find the portal and leave.
- **Maps:** 520 × 520 m (4× the old area) with terraced plateaus and cliffs (you can't walk up cliffs, so use ramps or jump), caves you walk through (the roof fades when you're inside), and ruins. The Scorched Dunes stay mostly flat.
- **Chests (15-20 per stage):** normal, large (better odds, ~13%), epic (only epic items, ~4%) and legendary (only legendary items, ~1%, with a light beacon). The price starts at 10 coins and rises with every chest you open in the run (10, 13, 16 … 28 after 5, 55 after 10, 140 after 20). Large/epic/legendary cost 2×/4×/8×. Chests are wooden treasure chests with a rounded lid, pixel-art planks, riveted metal bands and a lock (iron on normal, gold on large, silver + a floating gem on epic, gold + gem on legendary) and glow softly on the ground in their rarity colour like dropped items (the GodotLootVFX ring and flare; epic/legendary add a pillar, sparkles and a sky beam). The glow fades when a chest is opened.
- **Shrines:** Healing (1-2, heals 50% HP), Combat (1-3, summons challengers and pays out an item), Mountain/Boss (1-3, doubles → quadruples → octuples the portal boss, each boss drops loot), Wisdom (2-5, random XP based on your level).
- **Moai statues (3-7):** pick 1 of 3 random items, or take a **Devil's Trademark** (a special currency, shown next to your coins; its use comes later).
- **Bunny hopping:** jump again right as you land (or press jump just before touching down) to keep your momentum and gain +12% speed per perfect hop, up to +90%. Stop hopping and it decays.
- **Magnet statues (0-3):** activate one and every coin and XP orb on the whole map flies to you for 20 seconds.
- **Power-ups (rare enemy drops, elites ×8, bosses always):** **Magnet** — 15 s of pulling all gold and XP from the entire map;
  **Time Warp** — 15 s of slow motion for enemies, their shots and their attacks (35% speed). The stage clock, spawns, you and your
  burns/poisons keep running at full speed. Active power-ups show as chips with a countdown under the objective.
- **Minimap:** top right, rotates with your camera and shows the portal, all chests by tier, shrines, Moai, jump pads and caves (no enemies). Click it or press **M** for the full map.

- **Stages:** Verdant Meadows → Scorched Dunes → Frostfang Peaks → Fungal Hollow → Molten Caldera → Void Sanctum → **Celestial Throne** (final). Each stage has its own terrain, palette, hazards (water / toxic sludge / lava / void / starlight) and enemy roster.
- **Final boss:** on the Celestial Throne the *Apex Sovereign* descends after a few seconds. Its health and damage are re-scaled to your current power (DPS estimate × ~110 s, heavy hits ≈ 12% of your effective HP), it enrages at 50% and enters a *Final Form* at 25%. Beat it and you can **end the run** (victory) or **continue the run** into a harder loop for as long as you survive.
- **Leaderboard** (main menu): a **🌍 Global** tab with every player's best run (see *Online leaderboard* below) and a **This device** tab with the 25 best runs on this device, both filterable by survivor. A run is recorded when it ends
  (death, victory, or abandoning it after at least 20 s). **Runs are ranked by kills** — the more enemies you kill, the
  higher you place. Ties are broken by a score (1000 per stage cleared + 5000 for beating the final boss + kills + 20 per
  level + 15 per minute). A kill counter sits under your coins during a run, and the game-over screen tells you when you made the board.
- **Saving runs:** your run is checkpointed at every stage start, every 15 s and on *Save & Quit* (pause menu). *Continue Run* on the title screen picks it up again (the current stage gets a fresh map; character, level, items, tomes, weapon levels, coins and timer are kept). Dying, abandoning or ending the run clears the save.
- **Enemy limit:** up to 400 living enemies (220 on Low quality, +150/+80 in overtime). Only enemies within 90 m count
  towards the spawn targets, and enemies stuck more than 85 m away for 5 s are pulled back to a spawn point near you
  (bosses and mini-bosses stay put), so enemies stuck somewhere on the map can never stop the spawns.
- **Coins & chests:** enemies always drop XP, but **coins only about a quarter of the time** (elites, mini-bosses and bosses always drop them). A good stage 1 earns roughly enough for 12-15 chests, so you can't open everything without the Tome of Greed or gold items. Opening a chest freezes the game and spins a CS:GO-style item roulette that lands on your prize (skip with E / Space / A / tap).
  - Small chest: Common 70% · Rare 23% · Epic 6% · Legendary 1%
  - Large chest: Common 15% · Rare 55% · Epic 24% · Legendary 6%
  - Boss drop: Rare 55% · Epic 33% · Legendary 12%
  - *Luck* shifts the odds toward higher rarities.
- **Level-ups:** Megabonk-style. Pick 1 of 3 cards. Each level-up randomly offers **only tomes**, **only weapons**, or **a mix of both**.
  Every card is rolled at a rarity (Common ×1, Rare ×1.6, Epic ×2.4, Legendary ×4) that scales how much it gives; luck improves the odds.
  - **Tomes** — pick up to **4 different tomes** per run; each levels up to **Lv 99** (every pick is +1 level). The 16 tomes:
    Power (damage), Precision (crit chance; above 100% turns into crit damage), Evasion (dodge, diminishing returns — approaches but never reaches 100%), Defense (armor),
    Greed (gold), Multishot (extra primary projectiles; fractions are a chance for one more), Fury (attack speed), the Skies (jumps),
    Fortune (luck: chests, Moai, items and tome/weapon roll rarity), Wisdom (XP), Blood (life steal), the Aegis (shield),
    the Giant (size), Attraction (pickup range), Vitality (max HP) and Agility (move speed; counts half past +100%).
    **No stat has a hard cap:** crit above 100% becomes crit damage (also per weapon), multishot past 16 shots and
    Orbiting Blades / Frost Shards past their visual limit turn the extra count into damage, and life steal, jumps,
    size, luck and projectiles grow without limit. Common roll per pick: +8% damage, +3.5% crit, +5% evasion, +5 armor,
    +10% gold, +0.15 projectiles, +6.5% attack speed, +0.2 jumps, +0.07 luck, +8% XP, +0.6% life steal, +4% shield,
    +5% size, +0.6 m pickup range, +8% max HP, +4% move speed (rare ×1.6, epic ×2.4, legendary ×4).
  - **Weapons** — you carry up to **4 weapons**. Slot 1 is always your survivor's **main weapon** (their primary attack,
    e.g. Kestrel's bow); the other **3 slots** are filled by picking new weapons from level-ups. Every weapon fires on its own
    and levels up to **Lv 50** (a pick improves one stat: damage, fire rate, size, crit chance or projectiles; every 10th
    level adds +10% damage). Abilities (Ability 1 / 2 / Ultimate) don't level. The 12 pick-up weapons:
    Orbiting Blades, Burning Aura, Thunder Staff, Fire Staff, Frost Shards, Throwing Axe, Earth Spikes, Poison Flask,
    Prism Laser, Dragon Breath, Void Orb and Revolver (`js/data/weapons.js`).
  - The weapon bar (gold) and tome bar (blue) sit above the ability buttons; *Tab* (or the bag button) lists everything.
  - Tome data and weapon level stats live in `js/data/tomes.js`, the weapons themselves in `js/data/weapons.js`.
- **Portal & boss:** find the portal (marker on screen), interact to summon the stage boss. Stand in the ring to charge the portal, kill the boss, then enter the portal.
- **Scaling (Megabonk-style):** difficulty = `1.045^minutes × 1.25^stagesCleared`. Enemy HP, damage, spawn rate, coin/XP drops and chest prices all scale off it. Your build only nudges enemies a little (HP × `(DPS/150)^0.35`, damage × `(effective HP/250)^0.35`), so a good build really feels strong: a decent stage-1 build kills the portal boss in ~25 s and a mini-boss in ~15 s. The first 5 minutes of a run hit softer (45% → 100% enemy damage) and start with fewer enemies. **Overtime keeps the old brutal curve** (`1.055^min × 1.3^stages`, HP following your DPS^0.75, damage your HP^0.7) on top of its exponential phases. Elites (Blazing, Glacial, Overloading, Vampiric) show up as it rises.

## Online leaderboard

On the first start the game asks for a **username** (3–16 characters, unique, case-insensitive); you can change it any
time from the title screen ("Playing as …") or the leaderboard. Every finished run is sent to the global board, which
shows **each player's best run, ranked by kills**. Runs finished offline are queued in the save and uploaded on the
next start; the game-over screen shows your global rank.

GitHub Pages can't store data, so the board lives in a free **Supabase** project (PostgreSQL). One-time setup (~5 min):

1. Create a free account and a new project at <https://supabase.com> (any name/region; note the database password somewhere).
2. In the project open **SQL Editor → New query**, paste the whole of [`supabase/leaderboard.sql`](supabase/leaderboard.sql) and press **Run**.
3. Open **Project Settings → Data API** and copy the **Project URL**, then **Project Settings → API Keys** and copy the
   **public** key (`anon` / `publishable` — *never* the `service_role` / secret key).
4. Put both into [`js/config/online.js`](js/config/online.js) (`url` and `key`), commit and push. Done.

Without that config the game works as before (local board only; the Global tab says it isn't set up).

**Security:** the public key can't read or change the tables directly (row level security, no policies). It can only
call four database functions: register a name, rename yourself, submit a run, read the board. Each player gets a
secret token (stored in their browser) so nobody can post under someone else's name. There is no limit on kills
or kills per second; the database only rejects broken values (negative numbers etc.) and throttles spam (one run per 15 s per player,
30 new names per minute). Like any browser game without a server-side simulation, a determined cheater could still
fake a *plausible* run; you can delete runs or players any time in Supabase → **Table Editor** (`runs`, `players`).
Free Supabase projects pause after a week without any traffic — resume it in the dashboard if that happens.

## Look & feel

- **Graphics:** procedurally generated textures (unique skins for every enemy and boss, detail textures for every stage's ground), PBR materials, ACES tone mapping, gradient sky with a sun, smooth terrain with colour variation, wind-swaying grass and trees, animated water and glowing lava, bloom on glowing parts, soft contact shadows. *Graphics quality* in Settings switches phones to a lighter renderer (no bloom, Lambert shading).
- **Physics & juice:** enemies and bosses have rigged limbs with walk cycles, arm swings, wing flaps, tail sways and attack poses; slimes squash on landing and wobble like jelly, enemies flinch and squish when hit, waddle while walking, and flyers bank into turns. Dead enemies get flung, tumble and bounce. Debris, coins and items bounce on the terrain. The player squashes and stretches, leans into movement and gets a FOV kick on dashes. Chest lids spring open, big hits briefly freeze the game (hit-stop), and the camera pulls in when trees block the view.

## Music

Tracks live in `assets/music/` and are streamed (they start instantly, even large files). All lists are in `js/core/music.js`:

| When | Folder | List |
|---|---|---|
| Title & character select | `assets/music/main-menu/` | `MENU_TRACKS` |
| Stages 1–6 (random, never the same twice in a row) | `assets/music/` | `STAGE_TRACKS` |
| A portal boss is summoned (random, never the same twice in a row) | `assets/music/bosses/` | `BOSS_TRACKS` |
| Final stage / Apex Sovereign | `assets/music/final/` | `FINAL_TRACKS` |

When every portal boss is dead, the stage song fades back in where it left off. Browsers only allow sound after the first click/tap/key,
so the menu song starts on your first input. Music volume has its own slider in Settings and is quieter while paused.

To add a track: upload it to the right folder and add its path to the matching list in `js/core/music.js`.

## Character models

Every survivor except Rook uses a 3D model from the uploaded packs. The raw uploads stay in `assets/models/`;
the game loads optimised copies from `assets/models/game/` (converted with Blender: textures ≤512 px, heavy meshes reduced,
only the needed animations kept). A model is downloaded when you pick that survivor, not at start-up.

| Survivor | Model | Animation |
|---|---|---|
| Vanguard | Cop | procedural (arm/leg swing) |
| Bonker | Sandbound Marauder (bloody club) | idle / run / attack clips |
| Pyra | Witch | procedural |
| Glacia | Living Snowman (by Asgart) | idle / walk / attack clips |
| Kestrel | Hooded Fox (by Heytibo) | idle / run / jump / fall / attack / land clips (sword swapped for a bow) |
| Tinker | Goblin | toy-style waddle & hop |
| Kaze | Cat-human | idle / run clips |
| Morrow | Skeleton | procedural |
| Bulwark | Heavy radiation suit (Radiation Workers PSX pack) | idle / run / jump clips |
| Nyx | PS1 horror killer (machete) | toy-style |
| Sol | Dead Oath Hunter (PSX bounty hunter) | idle / run / attack clips |
| Rook | built-in block model | — |
| Vex | Light hazmat suit (Radiation Workers PSX pack) | idle / run / jump clips |
| Echo | Vald (suit & sunglasses) | toy-style |
| Grizzle | Dog | idle (tail wag) / run / bark clips |
| Spark | Angry baby boy | procedural |
| Mimic | PSX BagMan — "Sackhead Killer" by **Aredius (Daniel Arias)** | idle / run / attack clips |

- Costumes recolour the models (Rival = opposite colours, Arctic = white, Inferno = red, Shadow = purple, Golden = gold + crown).
- *Maurice* is not used: it's a Maya-only file and its licence allows educational / non-commercial use only.
- Check each pack's licence before publishing the game; the BagMan licence asks for the credit above.
- To change who gets which model, edit `CHAR_MODELS` in `js/game/charmodels.js`.
- The website only publishes the files the game needs (see `.github/workflows/pages.yml`); the raw packs stay in the repo.

## Sound effects

35 sound effects picked from the uploaded **400 Sounds Pack** and **96 Extra SFX** (raw packs in `assets/music/Sound effects/`)
were trimmed, levelled and converted to small MP3s in `assets/sfx/` (~400 KB in total). Shots, sword swings, hits, crits,
explosions, coins, XP pops, item pickups, weapon upgrades, legendary fanfare, level-up, chest, hurt, dash, jump, freeze,
boss sting, portal, roulette ticks, UI clicks, achievement chime and the death jingle all use them; a few sounds without a
fitting sample (laser, zap) keep the built-in synth. Several hits/swings have variants and a slight random pitch so they
don't repeat. Which file plays for which sound is the `SAMPLES` table in `js/core/audio.js`.

## Weapon sprites, spell runes and loot glow

- **Weapon sprites** (`fantasy_weapons_pack1_noglow.png` / `fantasy_epicweapons_pack1_nobg.png`, cut into
  `assets/textures/weapons/`): the 12 pick-up weapons (glowing "epic" versions), several survivors' main weapons
  (Bonker's club, Kestrel's bow, Kaze's gauntlet, Nyx's dagger, Sol's hammer & shield, Grizzle's spear, Rook's crossbow)
  and 20 weapon-type items (Godslayer Blade, Reaper's Edge, Aegis, …). The Revolver is now a *Repeater Crossbow*.
- **Spell runes** (*Spells effect of separation and decoration 4*, 54 animations copied to `assets/textures/glyphs/`):
  animated rune pillars rise around you on level-up (gold) and when you use your Ultimate (your survivor's colour),
  a red ring marks every boss spawn, each shrine has a floating rune in its colour (hidden once used), and four runes
  stand around the portal: pink while idle, gold while charging, green when ready. (`js/game/glyphs.js`)
- **Loot glow** (*GodotLootVFX* by BinbunVFX): its Godot shaders (glow tube, ground flare, glow core, star particles)
  are ported to three.js in `js/game/lootfx.js`. Every item lying on the ground shows its pixel icon floating in a
  rarity-coloured glow: common = 1 ring/pillar, rare = 2 rings + 2 pillars, epic = + floating sparkles,
  legendary = gold with twice the sparkles. Non-common items also keep a tall beam so you can spot them from afar.

## Icons

All item, ability, upgrade, achievement, minimap and menu icons are 16×16 pixel art from the **Raven Fantasy icon pack**
(`assets/textures/raven-fantasy/faN.png`), scaled up crisply. Every one of the 209 items has its own icon; achievements get an
icon from what they track (kills, bosses, chests, stages…). The mapping lives in `js/data/icons.js` — change a number there to
swap an icon (the numbers are the file names).

## 3D models (asset packs)

Trees, pines, dead and twisted trees, rocks, bushes, flowers, ferns, clover, mushrooms and pebbles come from the
**Stylized Nature MegaKit by Quaternius** (CC0, `assets/packs/stylized-nature/`).
The game loads optimised copies from `assets/packs/stylized-nature/web/` (38 models, textures downscaled to 512px, ~13 MB total)
while the loading screen is shown; the original upload stays untouched next to it.

- Every stage maps its own models: Meadows gets broadleaf trees, rocks, bushes, flowers, ferns and pebbles; Dunes gets bleached dead trees and desert-textured rocks; Peaks gets pines; Hollow gets giant shelf mushrooms and twisted trees; Caldera gets charred dead trees and dark rocks; Void and the Throne get tinted twisted trees and flowers.
- Models are drawn with GPU instancing and bucketed into map sections: trees and rocks in sections beyond the fog, and small ground cover more than ~55 m away, aren't drawn at all. Phones use fewer variants and about half as many models.
- If a model fails to load, the stage falls back to the built-in procedural decoration.
- Which models a stage uses lives in the `decor` lists in `js/data/stages.js` (`models: [...]`); the loading and material set-up is in `js/game/assets.js`.

### Boss models

| Stage | Boss (id kept for saves) | Source | How it's made |
|---|---|---|---|
| 1 Meadows | **Blackhorn** of the Shattered Peaks (`stone_colossus`) | `assets/models/Enemies/Blackhorn…` (FBX) | converted to `assets/models/game/blackhorn.glb`, 6 clips |
| 2 Dunes | **Cragmaw**, the Crystal-Clawed (`scorpion_king`) | `TopDown_RockBoss_EBrosAssets` (2D sheets) | voxel 3D, idle/walk/stomp/swipe |
| 3 Peaks | **Ravenhide**, the Frostfang Werewolf (`frost_titan`) | `RAVENHIDE – Retro PSX Werewolf` (GLB) | `assets/models/game/ravenhide.glb`, 12 clips incl. death |
| 4 Hollow | **King Slime**, Monarch of the Hollow (`spore_mother`) | `KingSlime-CamacebraGames` (2D frames) | voxel 3D, idle/move/attack |
| 5 Caldera | **Gorehorn**, Butcher of the Caldera (`inferno_drake`) | `boss_demon_slime_FREE_v1.0` (2D sheet) | voxel 3D, idle/walk/cleave/hit/death |

Attacks are synced to the animations: **leap slam** (Blackhorn, Ravenhide, King Slime jump onto where you stand,
red circle = landing; the King Slime splashes on landing), **swipe** (new: a wide claw/cleaver hit in front, red circle
— Cragmaw, Ravenhide, Gorehorn), **horn/quadruped charge**, **stomp**, and roars for rock rain, shockwaves and summons.
Models with a death animation (Ravenhide, Gorehorn, Pumpkin, Cloud, Spirit) play it instead of the tumble.
Animated models load in the background when a stage starts; if one isn't ready when the enemy spawns, it shows the
old procedural model for a moment and swaps in the real one as soon as it has loaded.

**Boss health bar:** the *Pixel Health Bar* art (`assets/textures/ui/bossbar_*.png`), drawn at exactly 3× so the pixels
stay crisp; the red fill is clipped to the remaining health, a pale trail shows recent damage, plus the percentage.

### Sprite enemies (2D → 3D voxels)

`js/game/voxelsprites.js` turns pixel-art sprites into real 3D models at load time: every opaque pixel becomes a voxel
column whose thickness grows towards the middle of the shape (so they come out rounded, not flat), equal neighbours are
merged into larger faces, and every animation frame becomes its own small mesh that the game flips through like a
flipbook (on top of the usual squash, lean and bob). Sprite models turn mostly towards the camera, keep a bit of their
real heading so their depth shows, and mirror when they walk the other way. Only the used files are shipped
(`assets/sprites/`); the original uploads stay in `assets/models/Enemies` and `assets/models/Normal enemies`.

New normal enemies:

| Enemy | Art | Type | Stages |
|---|---|---|---|
| Pumpkin Creeper | Free Fantasy Enemy Pack 1 – Pumpkin (idle/walk/vine attack/death) | melee | Meadows, Hollow |
| Storm Cloud | Free Fantasy Enemy Pack 1 – CloudMonster (lightning attack, death) | flying ranged | Meadows, Peaks |
| Cursed Spirit | Free Fantasy Enemy Pack 1 – CursedSpirit (fireball attack, death; burns) | ranged | Caldera, Void, Throne |
| Bone Warrior / Frost Skeleton / Shadow Skeleton | Monsters Pack – Skeleton (3 colours) | melee (frost slows) | Dunes / Peaks / Void + Throne |
| Reef / Cave / Ice Lurker | Monsters Pack – Fish (3 colours) | swooping flyer (ice slows) | Meadows / Hollow / Peaks |

Credits: *King Slime* by Camacebra Games (CC BY 3.0, itch.io/camacebra); *Rock Boss* by EBros Assets; *Demon Slime* boss
(FREE v1.0); *Free Fantasy Enemy Pack 1*; *Monsters Pack [FREE]*; *RAVENHIDE – Retro PSX Werewolf*; *Pixel Health Bar* —
see each pack's original page for its licence.

## Survivors (17)

The survivor select screen shows one survivor at a time: an animated 3D preview (it shows off its attack every few seconds, drag to rotate), base stats, the passive, auto-attack and all three abilities with cooldowns and keys, its character level and its costumes. Switch with the ‹ › arrows, A/D or the arrow keys, the D-pad, a swipe, or the portrait strip at the top. Q/E or D-pad up/down cycles costumes.

**Character levels & costumes:** every survivor levels up on its own from the XP you collect while playing them. Levels are purely cosmetic: reaching **level 3 / 6 / 10 / 15 / 20** completes an achievement that unlocks that survivor's **Rival / Arctic / Inferno / Shadow / Golden** costume (5 per survivor, 85 in total). Each costume has its own palette and a signature flair (frost crystals, flames, shadow aura, crown).


| | Passive | Ability 1 | Ability 2 | Ultimate | Unlock |
|---|---|---|---|---|---|
| **Vanguard** (gunner) | Crits cut cooldowns | Piercing Rail 4s | Tactical Roll 5s | Bullet Storm 40s | Starter |
| **Bonker** (brute) | Rage stacks when hit | Ground Pound 6s | War Cry 12s | MEGA BONK 45s | Starter |
| **Pyra** (fire mage) | Everything ignites | Flame Wave 5s | Blink 6s | Meteor Shower 50s | Defeat 150 enemies |
| **Kestrel** (ranger) | Bonus damage at range, triple jump | Arrow Fan 4s | Disengage 6s | Arrow Rain 40s | Clear a stage |
| **Tinker** (engineer) | Deployables inherit items | Deploy Turret 10s ×2 | Shock Mine 8s | Orbital Strike 60s | Hold 12 items in a run |
| **Glacia** (frost) | Chill → Freeze, frozen take +40% | Frost Nova 7s | Glacial Armor 12s | Blizzard 45s | Reach stage 3 |
| **Kaze** (monk) | Every 3rd hit empowered | Rising Dragon 4s | Gale Dash 5s | Hundred Fists 40s | Survive 15 min |
| **Morrow** (necromancer) | Kills raise skeletons | Bone Spikes 6s | Life Drain 8s | Army of the Dead 60s | Defeat 1500 enemies |
| **Bulwark** (heavy) | Minigun spin-up, knockback immune | Rocket Barrage 7s | Fortify 12s | Tactical Nuke 70s | Defeat 4 bosses |
| **Nyx** (assassin) | +20% crit, executes low-HP enemies | Shadow Strike 5s | Smoke Bomb 9s | Death Lotus 45s | Reach stage 6 |
| **Sol** (sun paladin) | Burning holy aura, kills inside heal | Shield Bash 5s | Consecrate 10s | Solar Flare 50s | Defeat 3,000 enemies |
| **Rook** (marksman) | Standing still: +40% dmg, +20% crit | Concussion Grenade 6s | Grapple Hook 7s | Execution Round 45s | Reach level 25 in a run |
| **Vex** (plague doctor) | Hits apply stacking poison | Miasma 7s | Purge 9s | Pandemic 50s | Defeat 250 poisoned enemies |
| **Echo** (chronomancer) | 20% chance abilities are free | Stasis Field 8s | Rewind 10s | Time Stop 60s | Defeat the Apex Sovereign |
| **Grizzle** (beast tamer) | Permanent wolf companion | Sic 'Em 5s | Feral Roar 10s | Stampede 50s | Defeat 50 elites |
| **Spark** (storm caller) | Every 5th hit chains lightning | Ball Lightning 6s | Static Dash 6s | Thunderstorm 45s | Clear 20 stages |
| **Mimic** (gambler) | Luck, coins and cheaper chests | Double or Nothing 6s | Lucky Dodge 8s | Jackpot 60s | Open 60 chests |

## Items

**209 stacking items: 67 Common, 67 Rare, 45 Epic, 30 Legendary.** Power matches rarity: Commons are small stat bumps or tiny procs, Rares add procs/conditional bonuses, Epics add periodic effects and allies, Legendaries change how you play (revives, smites, meteors, permanent skeleton armies, extra ability charges…). Item effects include on-hit procs, on-kill effects, periodic pulses, conditional stats ("while standing still", "below 35% HP"…), damage modifiers, on-ability-use triggers, landing shockwaves, blocks and death saves. **178 of 209 start locked** and are unlocked through achievements. Browse them in the **Logbook**.

## Achievements & the "can't brick your save" guarantee

**404 achievements**: lifetime milestones, single-run feats, per-stage, per-boss, per-enemy and per-survivor goals. 278 of them unlock something: 15 survivors, 178 items and 85 costumes. Unlocks pop up as an animated card showing what you did and what you got. The Logbook has search and filters.

- Unlocks are never stored directly. The save only records **completed achievements** and **lifetime counters**, and the unlocked characters/items are derived from those every time. A save can't end up in a state that disagrees with itself.
- Every character unlock is achievable with the two starters. Character-mastery achievements only need that character, which is always unlocked earlier in the chain.
- On every boot, `validateUnlockGraph()` (in `js/core/save.js`) simulates progression from a blank save. Any achievement it finds unreachable is auto-granted, so a future data edit can't lock content forever either.
- Every rarity always has default (non-locked) items, and rolls fall back to a lower rarity if a pool is ever empty.
- Progress is cumulative across runs, so dying never loses achievement progress.

## Code layout

```
index.html          UI shell, HUD, touch controls
css/style.css       all styling (desktop + phone layouts)
vendor/             three.js r170 (MIT)
js/main.js          boot + main loop
js/core/            input (kb/mouse/gamepad/touch), audio (procedural SFX), save/achievements, utils
js/data/            characters, items, enemies & bosses, stages, achievements, tomes & weapon levels
js/game/            world gen, player, enemies & AI, combat, director, pickups, minions, fx, models
js/ui/ui.js         menus, character select, logbook, settings, HUD
```

Tip: `__G` and `__Game` are exposed on `window` for poking at the game from the dev console.
