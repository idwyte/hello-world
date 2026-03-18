# Nail Shop Simulator

A mobile tycoon game built with **Expo 52 + React Native + TypeScript**.
Player owns and runs a nail salon — hiring staff, serving customers, upgrading the shop.

## Branch
`claude/nail-shop-simulator-YKHFS`

## Tech Stack
| Concern | Choice |
|---|---|
| Framework | Expo 52 (managed workflow) |
| Navigation | Expo Router 4 (file-based, tabs) |
| State | Zustand 5 |
| Persistence | AsyncStorage |
| Character art | react-native-svg (layered, programmatic fills) |
| Animation | react-native-reanimated v3 |
| Audio | expo-av |

## Running the app
```bash
npm install --legacy-peer-deps
npx expo start
```
Then scan QR with Expo Go on your phone, or press `i` for iOS sim / `a` for Android.

## Project Structure
```
app/              # Expo Router screens
  _layout.tsx     # Tab navigator root
  index.tsx       # Shop Floor (main game view)
  staff.tsx       # Staff management
  upgrades.tsx    # Shop upgrades & decor
  stats.tsx       # Reputation, earnings, owner info
  onboarding/     # TODO: 10-step character creation flow
  service/        # TODO: Service mini-game screens
components/       # UI components
  HUD.tsx         # Money / rep / day bar
  StationSlot.tsx # Nail station tile
  CustomerCard.tsx# Customer in queue (tap to seat)
  ReviewBoard.tsx # 3 recent reviews
  TutorialTooltip.tsx # Tutorial step overlay
assets/characters/
  CharacterAvatar.tsx  # Layered SVG placeholder character
  layers/README.md     # Art pipeline docs (Recraft → Claude → SVG)
constants/
  theme.ts        # SKIN_TONES, HAIR_COLOR_PRESETS, UI, FONT, SPACING, RADIUS
data/
  nailColors.ts   # 48 colors across 6 collections
  services.ts     # 5 services with unlock thresholds
  upgrades.ts     # 8 upgrades
  nailArtDesigns.ts # 13 nail art designs (stamp/gem/freehand)
  staffNames.ts   # Name pools for staff + customers
engine/
  customerSpawner.ts  # Procedural customer generation
  customerEngine.ts   # Patience tick, arrival probability
  serviceEngine.ts    # Progress ticking, satisfaction scoring
  tutorialEngine.ts   # 10-step tutorial state machine
  reviewEngine.ts     # Post review + rep change
  traitEngine.ts      # Owner trait modifiers + backstory bonuses
hooks/
  useGameLoop.ts   # setInterval tick driver (1s), day end
  useSaveLoad.ts   # AsyncStorage save/load on mount + subscribe
store/
  gameStore.ts    # Full game state (Zustand)
  ownerStore.ts   # Owner profile + onboarding flag
types/
  NailTypes.ts
  CustomerTypes.ts
  GameStateTypes.ts
  OwnerTypes.ts
```

## What's Done
- [x] Full project scaffold (package.json, app.json, babel, metro, tsconfig)
- [x] All TypeScript types
- [x] Zustand stores (game + owner)
- [x] Full engine layer (spawn, patience, service, review, tutorial, traits)
- [x] useGameLoop + useSaveLoad hooks
- [x] 4 main screens wired to stores
- [x] Core UI components
- [x] Placeholder CharacterAvatar SVG system (48 × 64 px, skin + hair + clothing fills)
- [x] Nail color catalog (48 colors / 6 collections)
- [x] Upgrades, services, nail art catalogs

## What's TODO Next
1. **Onboarding flow** (`app/onboarding/`) — 10 wizard steps:
   - `name.tsx` → `pronouns.tsx` → `appearance.tsx` → `nails.tsx`
   - `skincare.tsx` → `fashion.tsx` → `traits.tsx` → `hobbies.tsx`
   - `backstory.tsx` → `shop.tsx`
   - Each step reads/writes `ownerStore.updateProfile()`
   - Final step calls `ownerStore.setProfile()` → navigates to `index`

2. **Service mini-game** (`app/service/`) — player-controlled station:
   - `ShapeSelector.tsx` — horizontal scroll of NailShape options
   - `ColorPicker.tsx` — collection tabs + color swatches
   - `NailArtPanel.tsx` — tool picker (stamp/gem/freehand) + apply button
   - Wire satisfaction scoring (`serviceEngine.calculateSatisfaction`)
   - Post review on complete (`reviewEngine.postReview`)

3. **AI character art pass** — replace `CharacterAvatar.tsx` placeholder shapes:
   - Generate in Recraft.ai (front-facing, flat 2D, transparent bg)
   - Vectorize in Vectorizer.ai if needed
   - Paste SVG + ask Claude: "Convert to react-native-svg with a `fill` prop"
   - Drop into `assets/characters/layers/` and import in `CharacterAvatar.tsx`

4. **Staff mood system** — decay mood per tick, break restores mood, low mood = speed penalty

5. **VIP unlock flow** — after rep 50, VIP customers spawn with higher tip but pickier preferences

## Key Design Decisions
- **Hidden preferences**: customers' `preferredNailShape` / `preferredColorFamily` are not shown directly — player learns to read outfit/vibe cues
- **Color families map to clothing**: `customerSpawner.deriveColorFamily(clothingTopColor)` seeds the preference
- **Owner traits affect gameplay**: see `engine/traitEngine.ts` — `computeModifiers(traits)` returns multipliers; **not yet wired into stores** — wire in `serviceEngine` and `customerEngine` as a next step
- **Satisfaction scoring** is in `serviceEngine.calculateSatisfaction` — shape match = +30, color family match = +15
- **Tutorial customer "Maya"** spawns at tick 5 with `patience: 999` and `tip: 20`
- Character art is **48 × 64 px SVG canvas** (`viewBox="0 0 48 64"`)
