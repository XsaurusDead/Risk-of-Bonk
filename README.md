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

- **Stage clock (10 minutes):** a steady stream of enemies that grows every minute, **HUGE waves at 3:00 and 6:00**, a **Champion mini-boss at 5:00 and 8:00** (giant, tanky version of the stage's toughest enemy; drops an item). After **10:00 comes OVERTIME**: Overtime Reapers and elite waves that get ×1.35 stronger every 30 seconds. They will kill you quickly, so find the portal and leave.
- **Maps:** 520 × 520 m (4× the old area) with terraced plateaus and cliffs (you can't walk up cliffs, so use ramps or jump), caves you walk through (the roof fades when you're inside), ruins, and floating islands reachable by jump pads. The Scorched Dunes stay mostly flat.
- **Chests (15-20 per stage):** normal, large (better odds, ~13%), epic (only epic items, ~4%) and legendary (only legendary items, ~1%, with a light beacon). The price starts at 10 coins and rises with every chest you open in the run (10, 13, 16 … 28 after 5, 55 after 10, 140 after 20). Large/epic/legendary cost 2×/4×/8×.
- **Shrines:** Healing (1-2, heals 50% HP), Combat (1-3, summons challengers and pays out an item), Mountain/Boss (1-3, doubles → quadruples → octuples the portal boss, each boss drops loot), Wisdom (2-5, random XP based on your level).
- **Moai statues (3-7):** pick 1 of 3 random items, or take a **Devil's Trademark** (a special currency, shown next to your coins; its use comes later).
- **Bunny hopping:** jump again right as you land (or press jump just before touching down) to keep your momentum and gain +12% speed per perfect hop, up to +90%. Stop hopping and it decays.
- **Minimap:** top right, rotates with your camera and shows the portal, all chests by tier, shrines, Moai, jump pads and caves (no enemies). Click it or press **M** for the full map.

- **Stages:** Verdant Meadows → Scorched Dunes → Frostfang Peaks → Fungal Hollow → Molten Caldera → Void Sanctum → **Celestial Throne** (final). Each stage has its own terrain, palette, hazards (water / toxic sludge / lava / void / starlight) and enemy roster.
- **Final boss:** on the Celestial Throne the *Apex Sovereign* descends after a few seconds. Its health and damage are re-scaled to your current power (DPS estimate × ~110 s, heavy hits ≈ 12% of your effective HP), it enrages at 50% and enters a *Final Form* at 25%. Beat it and you can **end the run** (victory) or **continue the run** into a harder loop for as long as you survive.
- **Saving runs:** your run is checkpointed at every stage start, every 15 s and on *Save & Quit* (pause menu). *Continue Run* on the title screen picks it up again (the current stage gets a fresh map; character, level, items, upgrades, coins and timer are kept). Dying, abandoning or ending the run clears the save.
- **Coins & chests:** enemies drop coins and XP. Opening a chest freezes the game and spins a CS:GO-style item roulette that lands on your prize (skip with E / Space / A / tap).
  - Small chest: Common 70% · Rare 23% · Epic 6% · Legendary 1%
  - Large chest: Common 15% · Rare 55% · Epic 24% · Legendary 6%
  - Boss drop: Rare 55% · Epic 33% · Legendary 12%
  - *Luck* shifts the odds toward higher rarities.
- **Level-ups:** Megabonk-style. Pick 1 of 3 upgrades, each rolled at its own rarity (bigger values at higher rarity).
- **Portal & boss:** find the portal (marker on screen), interact to summon the stage boss. Stand in the ring to charge the portal, kill the boss, then enter the portal.
- **Scaling:** difficulty = `1.035^minutes × 1.2^stagesCleared`. Enemy HP, damage, spawn credits, coin/XP drops and chest prices all scale off it, so everything grows exponentially. Elites (Blazing, Glacial, Overloading, Vampiric) show up as it rises.

## Look & feel

- **Graphics:** procedurally generated textures (unique skins for every enemy and boss, detail textures for every stage's ground), PBR materials, ACES tone mapping, gradient sky with a sun, smooth terrain with colour variation, wind-swaying grass and trees, animated water and glowing lava, bloom on glowing parts, soft contact shadows. *Graphics quality* in Settings switches phones to a lighter renderer (no bloom, Lambert shading).
- **Physics & juice:** enemies and bosses have rigged limbs with walk cycles, arm swings, wing flaps, tail sways and attack poses; slimes squash on landing and wobble like jelly, enemies flinch and squish when hit, waddle while walking, and flyers bank into turns. Dead enemies get flung, tumble and bounce. Debris, coins and items bounce on the terrain. The player squashes and stretches, leans into movement and gets a FOV kick on dashes. Chest lids spring open, big hits briefly freeze the game (hit-stop), and the camera pulls in when trees block the view.

## Music

Tracks live in `assets/music/` and are streamed (they start instantly, even large files).
Stages 1–6 pick a random track from `STAGE_TRACKS` in `js/core/music.js` every time a stage starts (never the same one twice in a row) and crossfade into it.
The final stage uses `FINAL_TRACKS` (empty for now, so the music fades out there). Music volume has its own slider in Settings and is quieter while paused.

To add a track: upload it to `assets/music/` and add its path to the list in `js/core/music.js`.

## 3D models (asset packs)

Trees, pines, dead and twisted trees, rocks, bushes, flowers, ferns, clover, mushrooms and pebbles come from the
**Stylized Nature MegaKit by Quaternius** (CC0, `assets/packs/stylized-nature/`).
The game loads optimised copies from `assets/packs/stylized-nature/web/` (38 models, textures downscaled to 512px, ~13 MB total)
while the loading screen is shown; the original upload stays untouched next to it.

- Every stage maps its own models: Meadows gets broadleaf trees, rocks, bushes, flowers, ferns and pebbles; Dunes gets bleached dead trees and desert-textured rocks; Peaks gets pines; Hollow gets giant shelf mushrooms and twisted trees; Caldera gets charred dead trees and dark rocks; Void and the Throne get tinted twisted trees and flowers.
- Models are drawn with GPU instancing and bucketed into map sections: trees and rocks in sections beyond the fog, and small ground cover more than ~55 m away, aren't drawn at all. Phones use fewer variants and about half as many models.
- If a model fails to load, the stage falls back to the built-in procedural decoration.
- Which models a stage uses lives in the `decor` lists in `js/data/stages.js` (`models: [...]`); the loading and material set-up is in `js/game/assets.js`.

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
js/data/            characters, items, enemies & bosses, stages, achievements, level-up upgrades
js/game/            world gen, player, enemies & AI, combat, director, pickups, minions, fx, models
js/ui/ui.js         menus, character select, logbook, settings, HUD
```

Tip: `__G` and `__Game` are exposed on `window` for poking at the game from the dev console.
