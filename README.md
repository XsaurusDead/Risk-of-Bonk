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
| Primary attack | Left click (hold) | RT | Big button (auto-fire on by default) |
| Ability 1 | Right click / Q | LT | ⚡ button |
| Ability 2 | Shift | RB | button |
| Ultimate | R | Y / LB | gold button |
| Jump (multi-jump) | Space | A | ⤒ |
| Interact | E / F | X | ✋ (appears when near) |
| Items & stats | Hold Tab | View/Back | 🎒 |
| Pause | Esc / P | Start | ⏸ |
| Pick level-up | 1 / 2 / 3 or click | D-pad + A | tap |

## How a run works

- **Stages:** Verdant Meadows → Scorched Dunes → Frostfang Peaks → Fungal Hollow → Molten Caldera → Void Sanctum, then it loops forever (harder each loop). Each stage has its own terrain, palette, hazards (water / toxic sludge / lava / void) and enemy roster.
- **Coins & chests:** enemies drop coins and XP. Chests are scattered randomly around the map; large chests cost more but roll better.
  - Small chest: Common 70% · Rare 23% · Epic 6% · Legendary 1%
  - Large chest: Common 15% · Rare 55% · Epic 24% · Legendary 6%
  - Boss drop: Rare 55% · Epic 33% · Legendary 12%
  - *Luck* shifts the odds toward higher rarities.
- **Level-ups:** Megabonk-style. Pick 1 of 3 upgrades, each rolled at its own rarity (bigger values at higher rarity).
- **Portal & boss:** find the portal (marker on screen), interact to summon the stage boss. Stand in the ring to charge the portal, kill the boss, then enter the portal.
- **Scaling:** difficulty = `1.085^minutes × 1.22^stagesCleared`. Enemy HP, damage, spawn credits, coin/XP drops and chest prices all scale off it, so everything grows exponentially. Elites (Blazing, Glacial, Overloading, Vampiric) show up as it rises.

## Survivors

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

## Items

48 stacking items: 16 Common, 13 Rare, 10 Epic, 9 Legendary. Power matches rarity: Commons are small stat bumps, Legendaries change how you play (revive, black holes, orbital lasers, glide wings…). 16 of them are locked behind achievements. See the in-game **Logbook**.

## Achievements & the "can't brick your save" guarantee

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
