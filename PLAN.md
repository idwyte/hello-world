# Nail Shop Simulator — Implementation Plan

## Context
Building a mobile nail shop simulator game from scratch in an empty repo. Inspired by zoo/train simulators (business management depth) and GTA/Sims (character personality, world feel). The player owns and runs a nail salon — hiring staff, serving customers, upgrading the shop, and building reputation.

Platform: React Native + Expo | UI style: Tycoon dashboard/HUD
Character visuals: SVG-based layered components via `react-native-svg` — programmatic color fills, no separate assets per skin tone

---

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Expo (managed workflow) | Fast setup, no native config needed |
| Navigation | Expo Router (file-based) | Modern, built-in to Expo SDK 50+ |
| State | Zustand | Lightweight, no boilerplate, easy game state |
| Persistence | AsyncStorage | Save/load game state locally |
| UI | React Native core + StyleSheet | Avoid heavy UI lib; custom tycoon feel |
| Timers | `setInterval` via game loop hook | Tick-based simulation |
| Sound | `expo-av` | Audio playback for sound effects |
| Character art | `react-native-svg` | SVG layers with programmatic fills = zero extra assets per color variant |
| Character animation | `react-native-reanimated` v3 | GPU-driven animations, runs on UI thread |

---

## Folder Structure

```
hello-world/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout + tab navigator
│   ├── index.tsx               # Shop Floor (main view)
│   ├── staff.tsx               # Staff management
│   ├── upgrades.tsx            # Shop upgrades & decor
│   └── stats.tsx               # Reputation, earnings history
├── components/
│   ├── CustomerCard.tsx        # Customer in queue / at station
│   ├── StationSlot.tsx         # Nail station with staff + customer
│   ├── StaffCard.tsx           # Staff hire/info card
│   ├── ServiceMenu.tsx         # Bottom sheet: pick nail service
│   ├── HUD.tsx                 # Top bar: money, reputation, time
│   └── UpgradeItem.tsx         # Single upgrade row
├── store/
│   └── gameStore.ts            # Zustand store — all game state
├── engine/
│   ├── customerEngine.ts       # Arrival logic, patience timers
│   ├── serviceEngine.ts        # Service duration, revenue calc
│   └── reputationEngine.ts     # Rep gain/loss rules
├── data/
│   ├── services.ts             # Service catalog (basic manicure, gel, etc.)
│   ├── upgrades.ts             # Upgrade catalog with costs
│   └── staffNames.ts           # Random staff name pool
├── hooks/
│   ├── useGameLoop.ts          # setInterval tick (1s), drives simulation
│   ├── useSaveLoad.ts          # AsyncStorage persist/hydrate
│   └── useSound.ts             # Preload + play sound effects via expo-av
├── constants/
│   └── theme.ts                # Colors, fonts, spacing
├── assets/
│   ├── sounds/
│   │   ├── customer_arrive.mp3     # Chime when customer enters queue
│   │   ├── service_complete.mp3    # Success sound when service finishes
│   │   ├── cash_register.mp3       # Payment collected
│   │   ├── customer_leave.mp3      # Negative sound when customer walks out
│   │   └── level_up.mp3            # Shop level / rep milestone
│   └── (icons, splash - Expo defaults)
├── app.json                    # Expo config
├── package.json
└── tsconfig.json
```

---

## Game State Schema (Zustand)

```ts
interface GameState {
  // Economy
  money: number;
  reputation: number;         // 0–100, gates VIP customers
  level: number;              // Shop level (1–10)
  shopName: string;

  // Stations
  stations: Station[];        // starts with 2, upgradeable to 8

  // Staff
  staff: StaffMember[];

  // Customer queue
  waitingCustomers: Customer[];

  // Unlocks
  unlockedServices: ServiceId[];
  purchasedUpgrades: UpgradeId[];
  ownedColors: ColorId[];

  // Game clock
  gameTick: number;           // increments every real second
  totalEarnings: number;
}

interface Station {
  id: string;
  tier: 1 | 2 | 3;           // basic chair → massage chair → VIP booth
  assignedStaffId: string | null;
  activeCustomerId: string | null;
  serviceProgress: number;    // 0–100
}

interface StaffMember {
  id: string;
  name: string;
  skillLevel: number;         // 1–5, affects speed + quality
  mood: number;               // 0–100, drops without breaks/pay
  assignedStationId: string | null;
  wage: number;               // paid per game-day
}

interface Customer {
  id: string;
  name: string;
  type: 'regular' | 'vip' | 'difficult';
  requestedServiceId: ServiceId;
  patience: number;           // counts down; leaves if hits 0
  tip: number;                // bonus if served fast + well
  stationId: string | null;
}
```

---

## Core Simulation (Tick-based)

Every real-time second = 1 game tick. A game "day" = 240 ticks (4 real minutes).

**Each tick:**
1. Decrement `patience` for all waiting customers → remove if 0, lose rep
2. Increment `serviceProgress` on occupied stations (rate = staff skill × station tier)
3. When `serviceProgress` hits 100 → complete service, add revenue + tip, free station
4. Roll customer arrival (probability increases with reputation/level)
5. At end of game-day: deduct staff wages, reset day counters

---

## Owner Character Creation

A multi-step onboarding flow that runs once on first launch. Every choice has a visible gameplay effect shown inline — nothing is purely cosmetic.

### Onboarding Steps (sequential screens)

| Step | Screen Section | What Player Configures |
|---|---|---|
| 1 | Identity | Name, pronouns, age range |
| 2 | Appearance | Skin tone, hair type/length/color, eye shape/color, accessories |
| 3 | Your Nails | Nail length, shape, aesthetic preference |
| 4 | Skincare | Routine depth, skin type, philosophy, signature product |
| 5 | Personal Style | Fashion vibe, color palette, accessory style |
| 6 | Personality | Pick 3 traits from 10 options |
| 7 | Hobbies | Pick 1–3 from 14 options |
| 8 | Your Story | Pick 1 origin backstory |
| 9 | Your Shop | Shop name (free text) + shop aesthetic/vibe |
| 10 | Preview | Full avatar summary + "Open Your Shop" CTA |

---

### Owner Profile Schema

```ts
interface OwnerProfile {
  // Identity
  name: string;
  pronouns: 'she/her' | 'he/him' | 'they/them' | string; // custom allowed
  ageRange: '20s' | '30s' | '40s' | '50s+';

  // Appearance
  skinTone: number;           // index 0–11 (inclusive spectrum)
  hairType: 'straight' | 'wavy' | 'curly' | 'coily' | 'locs' | 'braids' | 'natural_afro' | 'shaved';
  hairLength: 'bald' | 'short' | 'medium' | 'long';
  hairColor: string;          // hex — full color picker + preset swatches
  eyeShape: 'almond' | 'round' | 'monolid' | 'hooded' | 'upturned' | 'downturned';
  eyeColor: string;           // hex
  accessories: AccessoryId[]; // glasses, studs, hoops, chains, nose ring, etc.
  bodyType: 'slim' | 'average' | 'curvy' | 'plus' | 'muscular' | 'petite';

  // Nails
  nailLength: 'bitten' | 'short' | 'medium' | 'long' | 'extra_long';
  nailShape: 'square' | 'round' | 'oval' | 'almond' | 'coffin' | 'stiletto' | 'ballerina' | 'flare';
  nailAesthetic: 'clean_nude' | 'bold_color' | 'nail_art' | 'french_tip' | 'dark_edgy' | 'natural';

  // Skincare
  skincareRoutine: 'none' | 'minimal' | 'basic_3step' | 'full_routine' | 'obsessed_10step';
  skinType: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  skinConcern: 'hyperpigmentation' | 'anti_aging' | 'acne' | 'hydration' | 'glow' | 'redness';
  skincarePhilosophy: 'natural_clean' | 'science_backed' | 'luxury' | 'drugstore_dupe';
  signatureProduct: 'vitamin_c' | 'retinol' | 'spf' | 'hyaluronic_acid' | 'aha_bha' | 'niacinamide';

  // Fashion
  personalStyle: 'streetwear' | 'business_casual' | 'glam_baddie' | 'cottagecore_boho' | 'minimalist' | 'eclectic_alt';
  colorPalette: 'warm_neutrals' | 'cool_tones' | 'bright_bold' | 'black_white' | 'earth_tones' | 'pastel';
  accessoryVibe: 'gold' | 'silver' | 'pearls' | 'stacked_rings' | 'no_accessories' | 'mixed_metals';

  // Personality — pick exactly 3
  traits: PersonalityTraitId[];

  // Hobbies — pick 1–3
  hobbies: HobbyId[];

  // Origin — pick 1
  backstory: BackstoryId;

  // Shop identity
  shopName: string;
  shopVibe: 'modern_minimalist' | 'glam_gold' | 'kawaii_cute' | 'edgy_alt' | 'warm_cozy' | 'clinical_pro';
}
```

---

### Personality Traits (pick 3 of 10)

Each trait shows its gameplay effect before the player selects it.

| ID | Trait | Gameplay Effect |
|---|---|---|
| `perfectionist` | Perfectionist | +20% tip on completed services; service takes 10% longer |
| `people_pleaser` | People Pleaser | Staff morale decays 25% slower; can't skip difficult customers |
| `boss_energy` | Boss Energy | Staff work 15% faster when assigned; starting morale +10 |
| `chatterbox` | Chatterbox | Customer patience +30%; small rep gain on every interaction |
| `introvert` | Introvert | Shop "quiet hours" buff: first 60 ticks of day earn +10% |
| `trendsetter` | Trendsetter | New services unlock 1 level earlier |
| `hustler` | Hustler | First 2 completed services each day earn +$10 bonus |
| `nurturer` | Nurturer | Hired staff start with +5 skill; morale never drops below 20 |
| `analytical` | Analytical | Customer patience bar always fully visible (default is partial) |
| `creative` | Creative | Nail art services earn 25% more; unlocks exclusive nail art options |

---

### Hobbies (pick 1–3 of 14)

| ID | Hobby | Gameplay Effect |
|---|---|---|
| `fitness` | Fitness / Gym | Attracts athlete clients; unlocks "Express Nails" (fast service) |
| `cooking` | Cooking / Foodie | Staff morale event: "homemade snacks" = +15 mood |
| `reading` | Reading / Book Club | Unlocks "Reading Corner" waiting area (customer patience +20%) |
| `travel` | Travel | Attracts influencer + tourist clients |
| `music` | Music | Unlocks shop playlist ambiance = all customer patience +10% |
| `gaming` | Gaming | Unlocks "Gamer Girl Nails" nail art style; attracts gaming clients |
| `fashion` | Fashion / Styling | Attracts fashion influencer VIPs earlier |
| `skincare_beauty` | Skincare & Beauty | Unlocks facial add-on service 1 level earlier |
| `social_media` | Content Creation | Unlocks "Social Media Marketing" upgrade (passive rep gain) |
| `wellness` | Spirituality / Wellness | Unlocks crystal healing decor + wellness nail art; calmer difficult clients |
| `sports_watching` | Sports Fan | Weekend "game day" event: extra customers, themed nails |
| `gardening` | Gardening / Nature | Unlocks botanical nail art style; nature-themed decor |
| `art_painting` | Art & Painting | Nail art quality +15%; unlocks exclusive hand-painted nail designs |
| `dancing` | Dancing | Unlocks late-night pop-up event (bonus earning day) |

---

### Skincare Routine — Gameplay Effects

| Routine | Effect |
|---|---|
| None | No bonus |
| Minimal | +5% base tip (well-presented owner) |
| Basic 3-step | Unlocks "skin prep" add-on at rep 20 |
| Full Routine | Unlocks facial massage add-on at rep 30 (not 40) |
| 10-step Obsessed | Unlocks full spa services at rep 40 + "skincare display" decor |

---

### Origin Backstory (pick 1 of 4)

| ID | Story | Starting Bonus |
|---|---|---|
| `grandmother` | "I learned from my grandmother" | All services start at quality tier 2; $400 starting cash |
| `corporate_escape` | "I left my 9-to-5 for my passion" | $800 starting cash; no staff experience (staff start mood 60) |
| `self_taught` | "I've been doing nails since I was a teenager" | 1 staff member pre-hired; $300 starting cash |
| `community` | "I opened this shop for my community" | Reputation starts at 15 (not 0); $250 starting cash |

---

### Shop Aesthetic Vibes

| ID | Name | Visual Style | Starting Decor |
|---|---|---|---|
| `modern_minimalist` | Modern Minimalist | White, black, warm grey | Clean station, monstera plant |
| `glam_gold` | Glam & Gold | Black, gold, pink | Gold-rimmed mirrors, velvet chairs |
| `kawaii_cute` | Kawaii / Cute | Pastel pink, lavender, white | Plush seats, fairy lights |
| `edgy_alt` | Edgy / Alt | Dark purple, black, silver | Industrial shelves, neon sign |
| `warm_cozy` | Warm & Cozy | Terracotta, beige, sage | Wooden furniture, candles |
| `clinical_pro` | Clinical / Pro | White, teal, chrome | Medical-grade station, minimal decor |

---

### New Files for Character Creation

```
app/
└── onboarding/
    ├── index.tsx               # Welcome screen
    ├── identity.tsx            # Step 1: Name, pronouns, age
    ├── appearance.tsx          # Step 2: Skin, hair, eyes, body
    ├── nails.tsx               # Step 3: Nail preferences
    ├── skincare.tsx            # Step 4: Routine + philosophy
    ├── style.tsx               # Step 5: Fashion vibe
    ├── personality.tsx         # Step 6: Pick 3 traits
    ├── hobbies.tsx             # Step 7: Pick 1–3 hobbies
    ├── backstory.tsx           # Step 8: Origin story
    ├── shop-setup.tsx          # Step 9: Shop name + vibe
    └── preview.tsx             # Step 10: Avatar summary + confirm

components/character/
    ├── AvatarPreview.tsx       # Live avatar that updates as player builds
    ├── SkinToneGrid.tsx        # 12-tone skin selector
    ├── ColorSwatch.tsx         # Hair/eye color picker with presets
    ├── OptionGrid.tsx          # Reusable: grid of image/icon options
    ├── TraitChip.tsx           # Selectable chip showing name + effect
    └── StepProgress.tsx        # Progress bar across all 10 steps

data/
└── characterOptions.ts         # All options, labels, effects in one file

engine/
└── traitEngine.ts              # Reads owner traits/hobbies, modifies sim params

store/
└── ownerStore.ts               # Owner profile state (separate from game store)
```

---

## Wireframes & Interaction Loops

### Onboarding — Step Progress (persistent across all steps)

```
┌─────────────────────────────────────────┐
│  ●●●○○○○○○○  Step 3 of 10              │
│  < Back                                 │
└─────────────────────────────────────────┘
```

---

### Step 1 — Identity

```
┌─────────────────────────────────────────┐
│         Who are you?                    │
│                                         │
│  Your name                              │
│  ┌─────────────────────────────────┐    │
│  │ e.g. Jade                       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Pronouns                               │
│  [ she/her ]  [ he/him ]  [ they/them ] │
│  [ ✏️ Custom ]                           │
│                                         │
│  Age Range                              │
│  [ 20s ]  [ 30s ]  [ 40s ]  [ 50s+ ]   │
│                                         │
│         [ Continue → ]                  │
└─────────────────────────────────────────┘
```

**Interaction loop:**
- Name: free text input, keyboard shows on tap
- Pronouns: single-select chips, tap to select (highlighted)
- Age: single-select chips
- Continue disabled until name + pronouns + age all selected

---

### Step 2 — Appearance

```
┌─────────────────────────────────────────┐
│         Build your look                 │
│                                         │
│    ┌───────┐                            │
│    │ AVATAR│  ← updates live            │
│    │ HEAD  │                            │
│    └───────┘                            │
│                                         │
│  Skin Tone                              │
│  ○ ○ ○ ● ○ ○ ○ ○ ○ ○ ○ ○  (12 tones)  │
│                                         │
│  Hair Type                              │
│  [ Straight ][ Wavy ][ Curly ][ Coily ] │
│  [ Locs ][ Braids ][ Natural ][ Shaved ]│
│                                         │
│  Hair Length   Hair Color               │
│  [Short][Med]  🎨 ■■■■■ picker          │
│  [Long]        + 8 preset swatches      │
│                                         │
│  Eye Shape                              │
│  [ Almond ][ Round ][ Monolid ]         │
│  [ Hooded ][ Upturned ][ Downturned ]   │
│                                         │
│  Eye Color  🎨 ■■■■■ picker             │
│                                         │
│  Accessories (multi-select)             │
│  □ Glasses  □ Studs  □ Hoops            │
│  □ Chain    □ Nose ring  □ Stacked rings│
│                                         │
│  Body Type                              │
│  [ Slim ][ Average ][ Curvy ]           │
│  [ Plus ][ Muscular ][ Petite ]         │
│                                         │
│         [ Continue → ]                  │
└─────────────────────────────────────────┘
```

**Interaction loop:**
- Skin tone: tap any of 12 circles → avatar updates immediately
- Hair type/length: single-select grid → avatar updates
- Hair color: tap swatch OR tap color picker (native color wheel)
- Eye shape: single-select → avatar updates
- Accessories: multi-select checkboxes → avatar updates
- Body type: single-select → avatar updates
- Avatar preview is sticky at top, user can scroll down for options

---

### Step 3 — Your Nails

```
┌─────────────────────────────────────────┐
│     What do YOUR nails look like?       │
│                                         │
│    ┌─────────────────────────┐          │
│    │  [nail hand illustration] │         │
│    └─────────────────────────┘          │
│                                         │
│  Nail Length                            │
│  [ Bitten ][ Short ][ Medium ]          │
│  [ Long ][ Extra Long ]                 │
│                                         │
│  Nail Shape                             │
│  [ Square ][ Round ][ Oval ]            │
│  [ Almond ][ Coffin ][ Stiletto ]       │
│  [ Ballerina ][ Flare ]                 │
│                                         │
│  Your Nail Aesthetic                    │
│  ┌──────────┐ ┌──────────┐             │
│  │ Clean/   │ │  Bold    │             │
│  │  Nude    │ │  Color   │             │
│  └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐             │
│  │ Nail Art │ │  French  │             │
│  └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐             │
│  │Dark/Edgy │ │ Natural  │             │
│  └──────────┘ └──────────┘             │
│                                         │
│         [ Continue → ]                  │
└─────────────────────────────────────────┘
```

**Interaction loop:**
- All single-select within each category
- Nail illustration updates to show selected length + shape
- Aesthetic shown as 2-column cards with a small preview swatch

---

### Step 4 — Skincare

```
┌─────────────────────────────────────────┐
│     Tell us about your skin             │
│                                         │
│  Your Routine                           │
│                         Effect preview: │
│  ○ None                                 │
│  ○ Minimal (cleanser + moisturizer)  ──→│ +5% tip boost
│  ○ Basic 3-step                      ──→│ Unlocks skin prep add-on
│  ○ Full Routine (6+ steps)           ──→│ Facial add-on unlocks sooner
│  ● 10-step Obsessed                  ──→│ Full spa services + decor
│                                         │
│  Skin Type                              │
│  [ Oily ][ Dry ][ Combo ]              │
│  [ Sensitive ][ Normal ]               │
│                                         │
│  Biggest Concern                        │
│  [ Hyperpigmentation ][ Anti-aging ]   │
│  [ Acne ][ Hydration ][ Glow ][ Redness]│
│                                         │
│  Your Philosophy                        │
│  [ Natural/Clean ][ Science-backed ]   │
│  [ Luxury ][ Drugstore Dupe ]          │
│                                         │
│  Signature Product                      │
│  [ Vitamin C ][ Retinol ][ SPF ]       │
│  [ Hyaluronic Acid ][ AHA/BHA ]        │
│  [ Niacinamide ]                       │
│                                         │
│         [ Continue → ]                  │
└─────────────────────────────────────────┘
```

**Interaction loop:**
- Routine is radio buttons; selecting each shows the gameplay effect inline to the right (visible before confirming)
- Skin type, concern, philosophy, product: single-select chips
- These are flavor + minor unlocks; player can see exactly what they're getting

---

### Step 5 — Personal Style

```
┌─────────────────────────────────────────┐
│      How do you show up?                │
│                                         │
│  Personal Style                         │
│  ┌──────────┐ ┌──────────┐             │
│  │Streetwear│ │ Business │             │
│  │          │ │ Casual   │             │
│  └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐             │
│  │  Glam /  │ │Cottagecore│            │
│  │  Baddie  │ │  / Boho  │            │
│  └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐             │
│  │Minimalist│ │ Eclectic │             │
│  │          │ │  / Alt   │             │
│  └──────────┘ └──────────┘             │
│                                         │
│  Signature Color Palette                │
│  ■ Warm Neutrals   ■ Cool Tones        │
│  ■ Bright & Bold   ■ Black & White     │
│  ■ Earth Tones     ■ Pastel            │
│                                         │
│  Accessory Vibe                         │
│  [ Gold ][ Silver ][ Pearls ]          │
│  [ Stacked Rings ][ None ][ Mixed ]    │
│                                         │
│         [ Continue → ]                  │
└─────────────────────────────────────────┘
```

**Interaction loop:**
- Style: 2-column card grid, single-select
- Color palette: colored square chips, single-select
- Selection updates avatar outfit/color on the progress preview at top of screen

---

### Step 6 — Personality Traits

```
┌─────────────────────────────────────────┐
│   Pick 3 traits that describe you       │
│   2 selected · 1 more to go             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✓  Perfectionist                │   │
│  │    +20% tips · services 10% slower│  │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │    People Pleaser               │   │
│  │    Staff morale decays slower   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ✓  Boss Energy                  │   │
│  │    Staff 15% faster · morale +10│   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │    Chatterbox                   │   │
│  │    Customer patience +30%       │   │
│  └─────────────────────────────────┘   │
│  ... (scroll for all 10)               │
│                                         │
│  [ Continue → ]  (enabled at 3 picks)  │
└─────────────────────────────────────────┘
```

**Interaction loop:**
- Scrollable list of 10 trait cards
- Each card shows: name + exact gameplay effect
- Tap to select (fills checkbox + highlights card)
- Counter at top: "X selected · Y more to go"
- After 3 selected: 4th tap is blocked (card shows "Deselect one first")
- Continue button activates only at exactly 3

---

### Step 7 — Hobbies

```
┌─────────────────────────────────────────┐
│   What do you do for fun? (pick 1–3)   │
│   1 selected                            │
│                                         │
│  🏋️ Fitness / Gym                        │
│     Attracts athlete clients            │
│     Unlocks Express Nails service  [✓]  │
│                                         │
│  📚 Reading / Book Club                  │
│     Unlocks Reading Corner upgrade      │
│     Customer patience +20%        [ ]  │
│                                         │
│  🎵 Music                                │
│     Shop playlist = patience +10%  [ ]  │
│                                         │
│  🎮 Gaming                               │
│     Gamer Girl Nails style unlock  [ ]  │
│                                         │
│  ✈️ Travel                               │
│     Attracts influencer clients    [ ]  │
│                                         │
│  🌿 Gardening                            │
│     Botanical nail art + decor     [ ]  │
│                                         │
│  ... (scroll, 14 total)                 │
│                                         │
│         [ Continue → ]                  │
└─────────────────────────────────────────┘
```

**Interaction loop:**
- List of 14 hobby rows with emoji, name, effect
- Toggle checkboxes; up to 3 can be checked
- 4th tap blocked with a brief shake animation on the row
- Continue enabled at 1+ selections

---

### Step 8 — Your Story

```
┌─────────────────────────────────────────┐
│   What brought you here?                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ "I learned from my grandmother" │   │
│  │                                 │   │
│  │ Services start at quality tier 2│   │
│  │ Starting cash: $400             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ "I left my 9-to-5 for this"     │   │
│  │                                 │   │
│  │ Starting cash: $800             │   │
│  │ Staff start at lower mood       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ "I've done nails since my teens"│   │
│  │                                 │   │
│  │ 1 staff member pre-hired        │   │
│  │ Starting cash: $300             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ "I opened this for my community"│   │
│  │                                 │   │
│  │ Reputation starts at 15         │   │
│  │ Starting cash: $250             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ Continue → ]  (enabled at 1 pick)   │
└─────────────────────────────────────────┘
```

**Interaction loop:**
- 4 large cards, single-select
- Selected card gets highlighted border
- Trade-offs are visible — player makes a real strategic choice

---

### Step 9 — Your Shop

```
┌─────────────────────────────────────────┐
│   Name your shop                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ e.g. Jade's Nail Studio         │   │
│  └─────────────────────────────────┘   │
│                                         │
│   Choose your vibe                      │
│                                         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  Modern      │  │  Glam &      │    │
│  │  Minimalist  │  │  Gold        │    │
│  │  ▓▓▓░░░      │  │  ▓▓▓▓▓▓     │    │
│  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  Kawaii /    │  │  Edgy / Alt  │    │
│  │  Cute        │  │              │    │
│  │  🌸🌸🌸      │  │  ✦ neon ✦   │    │
│  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  Warm &      │  │ Clinical /   │    │
│  │  Cozy        │  │  Pro         │    │
│  │  🕯️ 🌿        │  │  ⬜ clean    │    │
│  └──────────────┘  └──────────────┘    │
│                                         │
│  [ Continue → ]                         │
└─────────────────────────────────────────┘
```

**Interaction loop:**
- Shop name: free text input
- Vibe: 2-column card grid, single-select
- Selecting a vibe shows a color palette preview strip below the cards
- Continue needs both name (non-empty) + vibe selected

---

### Step 10 — Preview & Confirm

```
┌─────────────────────────────────────────┐
│     Meet your shop owner ✨             │
│                                         │
│         ┌───────────┐                   │
│         │           │                   │
│         │  FULL     │                   │
│         │  AVATAR   │                   │
│         │           │                   │
│         └───────────┘                   │
│         Jade · she/her · 30s            │
│                                         │
│  🏠  Jade's Nail Studio                 │
│  ✨  Warm & Cozy vibe                   │
│  💰  Starting with $400                 │
│  ⭐  Reputation: 0  (or 15 from story)  │
│                                         │
│  Traits: Perfectionist, Boss Energy,    │
│          Creative                       │
│                                         │
│  Hobbies: Gaming, Fashion               │
│                                         │
│  Story: "I learned from my grandmother" │
│                                         │
│  [ ← Edit ]    [ Open Your Shop 💅 ]    │
└─────────────────────────────────────────┘
```

**Interaction loop:**
- Read-only summary of all choices
- "Edit" → goes back to Step 1 (state preserved, player can jump to any step)
- "Open Your Shop" → saves owner profile to store → navigates to main game

---

### Main Game — Shop Floor (Tab 1)

```
┌─────────────────────────────────────────┐
│  💰 $427   ⭐ Rep: 12   📅 Day 3  ⏱ 2:14│
│─────────────────────────────────────────│
│  Jade's Nail Studio         [ Day End ] │
│                                         │
│  ┌─────────┐  ┌─────────┐              │
│  │STATION 1│  │STATION 2│              │
│  │ 👩 Mia  │  │  empty  │              │
│  │ 💅 Priya│  │  + Tap  │              │
│  │ ████░░  │  │  to seat│              │
│  │  68%    │  │         │              │
│  └─────────┘  └─────────┘              │
│                                         │
│  Waiting Queue                          │
│  ┌──────────────────────────────────┐  │
│  │👤 Aaliyah  Basic Mani  ⏳████░░░ │  │
│  │👤 Soph     Gel Nails   ⏳██████░ │  │
│  └──────────────────────────────────┘  │
│  (tap a customer to assign to station) │
│─────────────────────────────────────────│
│  [🏠 Shop] [👥 Staff] [🛍 Upgrades] [📊]│
└─────────────────────────────────────────┘
```

**Interaction loop:**
- **Customer arrives** → appears in Waiting Queue with patience bar draining in real-time
- **Tap customer in queue** → opens Service Confirm sheet (shows service, price, duration)
  - Sheet: [Assign to Station 1] [Assign to Station 2] [Cancel]
- **Assign to station** → customer moves to station card, service progress bar begins filling
- **Station completes** → brief flash + cash_register.mp3 → money increments in HUD
- **Patience bar empties** → customer disappears with customer_leave.mp3 → rep drops → small "😤 left" toast
- **Day End button** → triggered automatically at tick 240; summary modal (earnings, rep change, wages deducted)

---

### Staff Tab (Tab 2)

```
┌─────────────────────────────────────────┐
│  👥 Staff                               │
│─────────────────────────────────────────│
│  ┌──────────────────────────────────┐  │
│  │  Mia Chen                        │  │
│  │  Skill ★★★☆☆   Mood 😊 78%      │  │
│  │  Assigned: Station 1             │  │
│  │  Wage: $40/day                   │  │
│  │  [ Move Station ]  [ Give Break ] │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  + Hire New Staff Member         │  │
│  │  (2 slots used · 3 max)          │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Hire Pool  (refresh daily)             │
│  ┌──────────────────────────────────┐  │
│  │  Kemi O.  ★★☆☆☆  Wage: $30/day  │  │
│  │  [ Hire — $0 upfront ]           │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Priya S. ★★★★☆  Wage: $55/day  │  │
│  │  [ Hire — $0 upfront ]           │  │
│  └──────────────────────────────────┘  │
│─────────────────────────────────────────│
│  [🏠 Shop] [👥 Staff] [🛍 Upgrades] [📊]│
└─────────────────────────────────────────┘
```

**Interaction loop:**
- Tap staff card → expands to show full details + actions
- "Move Station" → opens station picker modal (only unoccupied stations shown)
- "Give Break" → costs 30 ticks; removes staff from station; mood +20
- "Hire" → deducts first-day wage; staff added to roster; hire pool refreshes next day
- Mood bar turns red below 30% → staff works 30% slower as warning

---

### Upgrades Tab (Tab 3)

```
┌─────────────────────────────────────────┐
│  🛍 Upgrades                            │
│  💰 $427 available                      │
│─────────────────────────────────────────│
│  Stations                               │
│  ┌──────────────────────────────────┐  │
│  │  + Add Station          $500     │  │
│  │  Adds 1 nail station slot        │  │
│  │  (have 2 of 8 max)               │  │
│  │             [ Buy ]              │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Upgrade Chair → Tier 2  $300    │  │
│  │  +20% service speed at Station 1 │  │
│  │             [ Buy ]              │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Services                               │
│  ┌──────────────────────────────────┐  │
│  │  Nail Art Kit           $200     │  │
│  │  Unlocks Nail Art service        │  │
│  │             [ Buy ]              │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  🔒 VIP Booth          $1000     │  │
│  │  Requires Rep 50                 │  │
│  │  [ Locked — Rep 12/50 ]          │  │
│  └──────────────────────────────────┘  │
│─────────────────────────────────────────│
│  [🏠 Shop] [👥 Staff] [🛍 Upgrades] [📊]│
└─────────────────────────────────────────┘
```

**Interaction loop:**
- Upgrades player can afford: "Buy" button active
- Upgrades too expensive: button shows "$X needed" in red
- Locked upgrades (rep-gated): shows lock icon + "Rep X/50"
- Hobby-unlocked upgrades have a 🌟 "Your hobby unlocked this early" label
- Tap "Buy" → confirm modal → deduct money → item disappears from list → effect applied immediately

---

### Stats Tab (Tab 4)

```
┌─────────────────────────────────────────┐
│  📊 Stats                               │
│─────────────────────────────────────────│
│  Reputation                             │
│  ████████░░░░░░░░░░░  12 / 100          │
│  Next milestone: 25 → Unlock gel nails  │
│                                         │
│  Today (Day 3)                          │
│  Earned:    $127                        │
│  Spent:     $80 (wages)                 │
│  Net:        $47                        │
│  Customers served: 4                    │
│  Walked out:       1                    │
│                                         │
│  All-time                               │
│  Total earned:   $427                   │
│  Customers:       12                    │
│  Best day:        $180 (Day 2)          │
│                                         │
│  Earnings History (bar chart)           │
│  ▄ ▇ ▂                                 │
│  D1 D2 D3                               │
│                                         │
│  Owner Profile                          │
│  [ View / Edit Character → ]           │
│                                         │
│─────────────────────────────────────────│
│  [🏠 Shop] [👥 Staff] [🛍 Upgrades] [📊]│
└─────────────────────────────────────────┘
```

**Interaction loop:**
- Reputation bar animates when rep changes (triggered by store subscription)
- "View / Edit Character" → navigates back to onboarding preview screen (read mode, with edit option)
- Bar chart uses simple React Native View bars (no chart library needed for MVP)
- Reputation milestone labels update as player progresses

---

## Navigation (4 Tabs)

| Tab | Screen | Purpose |
|---|---|---|
| Shop Floor | `index.tsx` | Main play view — station grid, waiting queue, assign customers |
| Staff | `staff.tsx` | Hire/fire/assign staff, view morale |
| Upgrades | `upgrades.tsx` | Buy new stations, colors, decor, unlock services |
| Stats | `stats.tsx` | Reputation bar, daily earnings chart, achievements |

---

## Service Catalog (MVP)

| ID | Name | Duration (ticks) | Base Price |
|---|---|---|---|
| basic_manicure | Basic Manicure | 20 | $15 |
| gel_nails | Gel Nails | 35 | $35 |
| nail_art | Nail Art | 45 | $50 |
| pedicure | Pedicure | 30 | $25 |
| full_set | Full Set Acrylics | 60 | $65 |

VIP services unlock at reputation 50+.

---

## Upgrade Catalog (MVP)

| ID | Name | Cost | Effect |
|---|---|---|---|
| extra_station | Add Station | $500 | +1 station slot |
| better_chair | Upgrade Chair (tier 2) | $300 | +20% service speed |
| nail_art_tools | Nail Art Kit | $200 | Unlock nail_art service |
| vip_booth | VIP Booth | $1000 | Unlock VIP customers |
| hire_slot | Hire Extra Staff | $0 | Unlocks 3rd staff slot |

---

## MVP Scope (v1 — what gets built now)

**In:**
- Full Expo project scaffold with TypeScript
- Zustand store with all state
- Game loop (tick engine), 240-tick (4 min) day
- Shop Floor screen: station grid, customer queue, assign/serve flow
- Staff screen: view staff, assign to stations, see mood
- Upgrades screen: buy from catalog
- Stats screen: reputation + money display
- Save/load via AsyncStorage
- HUD (money, rep, level always visible)
- Sound effects via `expo-av` (5 key events)
- **Interactive nail service mini-game** — swipe-to-file + drag-to-polish + UV lamp tap; player-completed earns 20% tip bonus vs staff auto-complete
- **Nail art design system** — stamp tool (pre-drawn designs), gem placement (drag + snap), freehand line tool; unlocked via upgrade catalog; `nailAesthetic` trait pre-unlocks matching styles
- **Review board** — visible on-screen above waiting area; 3 most recent customer speech bubbles (auto-generated from satisfaction score); fades after 3 in-game days; drives urgency to improve
- **Day 1 tutorial** — scripted first customer "Maya" (max patience, guaranteed big tip); guided tooltips for each mechanic in sequence; player completes one full service including nail art before tutorial ends

**Out (future):**
- Screen transition animations
- Multiplayer / leaderboards
- App Store deployment config
- Push notifications
- Offline progression (post-MVP)

---

---

## Visual Development & Character Design

### Art Direction

**Style:** Soft illustrated characters — clean outlines, flat fills with subtle shading, rounded shapes. Think Stardew Valley's warmth but in a mobile-native vector style. This suits SVG perfectly and scales across all screen densities without blur.

**Color palette zones:**

*Skin tones (12 values, each used as direct SVG fill):*
```
Tone 01: #FDDBB4   Tone 05: #C68642   Tone 09: #5C3317
Tone 02: #F5C89A   Tone 06: #B5714A   Tone 10: #4A2010
Tone 03: #EBB882   Tone 07: #9B6040   Tone 11: #3D1A0A
Tone 04: #D4956A   Tone 08: #7A4A2A   Tone 12: #2A0F05
```

*Salon environment:*
- Walls: Dusty rose `#E8C4C4`, Cream `#FAF3E0`
- Furniture: Warm walnut `#8B6332`, White gloss `#F5F5F0`
- Accents: Sage `#A8C5A0`, Lavender `#C4A8C5`

*UI chrome:*
- Panel bg: `#FFF0F5` with `#E8B4C0` border
- Primary text: `#3D2B1F` (warm dark brown)
- CTA button: `#E8748A` active / `#F0A0B0` disabled

---

### Character Architecture: SVG Layer System (React Native)

Each character — owner, customer, staff — is a React Native `View` with absolutely-positioned SVG layers stacked in depth order. The SVG `fill` prop is set programmatically; no separate assets needed per color variant.

**Layer stack (bottom → top):**

```
0. BODY_BASE        — torso/arms/legs silhouette (fill = skin tone)
1. CLOTHING_BOTTOM  — skirt/pants (fill = clothing color)
2. CLOTHING_TOP     — shirt/blouse (fill = clothing color)
3. FACE_BASE        — face oval (fill = skin tone, same as body)
4. FACE_FEATURES    — eyes, brows, nose, mouth (fixed SVG paths)
5. HAIR_BACK        — hair falling behind face (fill = hair color)
6. HAIR_FRONT       — bangs/framing hair over face (fill = hair color)
7. ACCESSORIES      — glasses, earrings, hat (conditional render)
8. NAILS            — fingernail color overlay (fill = selected polish)
```

**Implementation pattern (reference, not to create yet):**

```tsx
// components/character/CharacterAvatar.tsx
const CharacterAvatar = ({ config }: { config: CharacterConfig }) => (
  <View style={{ width: 80, height: 120 }}>
    <BodyBase fill={SKIN_TONES[config.skinTone]} style={StyleSheet.absoluteFill} />
    <ClothingBottom fill={config.clothingBottomColor} style={StyleSheet.absoluteFill} />
    <ClothingTop fill={config.clothingTopColor} style={StyleSheet.absoluteFill} />
    <FaceBase fill={SKIN_TONES[config.skinTone]} style={StyleSheet.absoluteFill} />
    <FaceFeatures expression={config.expression} style={StyleSheet.absoluteFill} />
    <HairBack fill={config.hairColor} style={StyleSheet.absoluteFill} />
    <HairFront hairStyle={config.hairStyle} fill={config.hairColor} style={StyleSheet.absoluteFill} />
    {config.accessories.map(acc => <Accessory key={acc} type={acc} style={StyleSheet.absoluteFill} />)}
    <Nails fill={config.nailColor} style={StyleSheet.absoluteFill} />
  </View>
)
```

Each SVG component (e.g. `BodyBase`) is a single `.tsx` file that uses `react-native-svg` primitives (`<Svg>`, `<Path>`, `<G>`). The `fill` prop propagates into the SVG paths via React props.

---

### Character Variation System

**Customer variation axes and coverage:**

| Axis | Options | Implementation |
|---|---|---|
| Skin tone | 12 | SVG fill prop (zero extra art) |
| Hair style | 8 | Separate `HairFront`/`HairBack` SVG component per style |
| Hair color | 10 | SVG fill prop |
| Clothing top | 12 | Separate `ClothingTop` SVG per style |
| Clothing bottom | 10 | Separate `ClothingBottom` SVG per style |
| Clothing color | 8 per piece | SVG fill prop |
| Accessories | 6 optional | Conditional rendered SVG components |
| Body archetype | 4 | Separate `BodyBase` SVG per archetype |

Thousands of visually distinct customers from ~52 SVG component files.

**Hidden preference system (drives reactions):**
Each generated customer has a `preferredNailShape` and `preferredColorFamily` (set at spawn time, never shown directly). The player learns to read visual cues:
- Customer's clothing color hints at their preferred nail color family
- Customer's existing nail length hints at preferred nail shape

---

### Customer Expression System

`FaceFeatures` is a single SVG component that swaps internal path data based on an `expression` prop — no separate files per expression:

```
neutral | happy | excited | impatient | disappointed | delighted | thinking
```

7 expression variants × 4 body archetypes = 28 small SVG `<G>` definitions, all in one file as named exports, selected by prop at render time.

---

### Animation States (react-native-reanimated v3)

**Customer animations:**

| State | Implementation |
|---|---|
| `WALK_IN` | `translateX` shared value, spring from offscreen left to waiting zone |
| `IDLE_WAITING` | `translateY` loop ±2px, 2s period (subtle breathing) |
| `WALK_TO_SEAT` | `translateX` + `translateY` spring to nail station coords |
| `REACTION_HAPPY` | `scale` spring 1→1.15→1, expression swap, heart particles |
| `REACTION_UNHAPPY` | `rotate` ±3deg swing, expression swap, screen shake (camera) |
| `WALK_OUT` | `translateX` spring off right edge, then unmount |
| `TIP_FLOAT` | Absolute `Text` node, `translateY` from 0 → -40, `opacity` 1→0 |

**Nail technician animations:**

| State | Implementation |
|---|---|
| `IDLE_STANDING` | Same `translateY` breathing loop |
| `WORKING_POLISH` | `rotate` arm layer ±15deg, loop during service progress fill |
| `WORKING_FILE` | `translateX` arm layer ±8px, faster loop |
| `GREETING` | `rotate` wave hand, triggered on customer arrival |

**Particle effects (custom, no library):**
- Heart float: absolutely-positioned `Text` "💗" with `translateY` + `opacity` animations
- Coin shower: 5-8 `Text` "🪙" nodes with randomized `translateX` curves
- Sparkle burst: `View` with radial `scale` + `opacity` from center point

All animations use `withSpring` or `withTiming` from `react-native-reanimated`. No Animated API — Reanimated runs on the UI thread.

---

### Owner Avatar (Character Creation)

The `AvatarPreview` component in the onboarding flow uses the same `CharacterAvatar` layer system. As the player makes selections on each step, the corresponding prop updates and the SVG layer re-renders immediately:

- Step 2 (Appearance) → `skinTone`, `hairStyle`, `hairColor` props update live
- Step 3 (Nails) → `nailColor`, nail shape indicator on hand SVG
- Step 5 (Style) → `clothingTopColor`, `clothingBottomColor`

The preview is sticky at the top of each onboarding screen (above the scroll area) so the player always sees the character updating.

---

### Shop Environment (React Native)

The salon interior is a **static illustration** — a single SVG or high-res PNG background composited in `ShopScene`. Dynamic elements (customers, staff, stations) are React Native Views absolutely positioned over it.

**Shop zones match the existing wireframe layout:**
- Zone A (left): Entrance, waiting chairs
- Zone B (center-left): Nail stations
- Zone C (right): Display/reception

**Environmental art assets needed:**
- `ShopBackground.svg` — complete salon room illustration (walls, floor, fixed furniture)
- `ShopOverlayFront.svg` — elements that appear in front of characters (desk edge, table front)
- Per-vibe color variant: the 6 `shopVibe` options change the background's fill palette via SVG props (same structure, 6 color palettes)

**Decorative upgrades:** purchasable upgrades add overlay `Image` or SVG components at fixed absolute coordinates (plant in corner, wall art, fairy lights). No layout engine needed — coordinates are hardcoded per upgrade item in `data/upgrades.ts`.

---

### Asset Organization (Visual)

```
assets/
├── characters/
│   ├── layers/
│   │   ├── body/
│   │   │   ├── BodyBaseA.tsx       (archetype A — SVG component)
│   │   │   ├── BodyBaseB.tsx
│   │   │   ├── BodyBaseC.tsx
│   │   │   └── BodyBaseD.tsx
│   │   ├── hair/
│   │   │   ├── HairStyle01.tsx     (back + front exported from same file)
│   │   │   ├── HairStyle02.tsx
│   │   │   └── ... (8 styles)
│   │   ├── clothing/
│   │   │   ├── ClothingTop01.tsx   (12 tops)
│   │   │   ├── ClothingBottom01.tsx (10 bottoms)
│   │   │   └── ...
│   │   ├── FaceFeatures.tsx        (all 7 expressions as named exports)
│   │   └── Accessories.tsx         (all 6 accessory types as named exports)
│   ├── CharacterAvatar.tsx         (composes all layers)
│   └── characterIndex.ts           (maps style IDs to component refs)
├── environment/
│   ├── ShopBackground.tsx          (main salon SVG, accepts palette props)
│   ├── ShopOverlayFront.tsx        (foreground layer)
│   └── decorations/
│       ├── PlantCorner.tsx
│       ├── WallArt.tsx
│       └── FairyLights.tsx
├── ui/
│   ├── NailShapeIcons.tsx          (5 shape SVG icons)
│   ├── PolishBottle.tsx            (fill-tintable bottle SVG)
│   └── TipJar.tsx                  (3 fill-state SVG)
└── sounds/                         (unchanged from existing plan)
```

**Naming convention:** `PascalCase.tsx` for SVG components, `camelCase.ts` for data/config files.

**Color constants** in `constants/theme.ts`:
```ts
export const SKIN_TONES: Record<SkinToneId, string> = {
  tone01: '#FDDBB4', tone02: '#F5C89A', /* ... */ tone12: '#2A0F05'
}
export const HAIR_COLORS = { black: '#1A1A1A', warmBrown: '#8B4513', /* ... */ }
export const SALON_PALETTE = { wallRose: '#E8C4C4', floor: '#F0D5D5', /* ... */ }
```

---

### Visual Development Phases

**Phase 0 (foundation):** Install `react-native-svg` + `react-native-reanimated`. Create `CharacterAvatar.tsx` shell with placeholder gray rectangles for each layer. Confirm layering renders correctly in Expo Go.

**Phase 1 (owner avatar):** Draw/create SVGs for all owner customization options (body archetypes A-D, 8 hair styles, 4 clothing sets, all accessories). Wire into AvatarPreview in onboarding. Owner avatar visible in Stats tab.

**Phase 2 (customer characters):** Add customer config generation in `CustomerSpawner.ts`. Render customers in waiting queue and at stations using `CharacterAvatar`. Add expression swaps on reaction.

**Phase 3 (animations):** Add Reanimated animations — walk-in, idle breathing, reaction bounce/slump, tip float text. Polish timing with spring configs.

**Phase 4 (shop environment):** Create `ShopBackground.tsx` with 6 vibe palettes. Add decoration overlays. Implement foreground layer (`ShopOverlayFront`) so characters appear behind desk.

**Phase 5 (nail color system):** Wire selected nail color into customer's `NAILS` layer fill after service completion. Add polish bottle graphic in service panel that updates color in real-time.

---

---

## AI-First Visual Development Workflow

The layered SVG component architecture is uniquely well-suited for AI-generated assets because each layer is independent — you never need a "consistent full character" generation. You generate body separately from hair separately from clothing, and the code assembles them.

### Recommended Toolchain

| Tool | Role | Cost |
|---|---|---|
| **Recraft.ai** | Generate SVG illustrations directly — flat vector style, transparent bg, exports actual SVG code | Free tier + $12/mo |
| **Midjourney v6** | High-quality character concept art for style reference and approval | $10/mo |
| **ComfyUI + IP-Adapter** | Generate character layer variations that are visually consistent (same style, different hair/clothing) | Free (self-hosted) |
| **Vectorizer.ai** | PNG → clean SVG for any asset that can't be generated as SVG natively | $10/mo or pay-per |
| **Figma + FigmaAI** | UI components, HUD panels, service panel design, color palette management | Free tier |
| **Claude (code gen)** | Convert SVG files → React Native SVG components, generate layer system code, animation code | Already using |

### Phase-by-Phase AI Workflow

**Step 1 — Lock the style (1–2 days)**

Generate 20–30 character concepts in Midjourney/Recraft using this style prompt template:
```
flat vector illustration, soft rounded shapes, clean black outlines 2px,
warm pastel color palette, nail salon theme, [character description],
transparent background, mobile game character, no gradients
```

Pick one result as the "style anchor." Every subsequent generation references this image as style guide. Once style is locked, document the exact Midjourney or Recraft parameters so every team member/AI session produces consistent output.

**Step 2 — Generate character layers independently (3–5 days)**

For each layer type, generate in isolation against a transparent background:

```
Body base prompt:
"flat vector body silhouette, neutral gray fill,
no face/hair/clothing detail, standing pose,
front-facing, mobile game character sheet style"
→ generates the body outline/shape

Hair prompt:
"flat vector hair style [wavy/locs/braids], brown fill,
no face or body visible, same style as [anchor image],
transparent background"
→ generates hair layers

Clothing prompt:
"flat vector blouse/skirt, solid color fill, same linework
style as [anchor], transparent background, no model visible"
→ generates clothing
```

**Why this works:** The layers don't need to be generated together — the SVG component system handles z-ordering and sizing. Each layer just needs consistent dimensions (e.g. 200×300px viewBox) so they stack correctly when absolutely positioned.

**Step 3 — SVG conversion + cleanup (per asset, 15–30 min)**

Recraft.ai generates native SVG. For Midjourney-generated PNGs:
1. Upload to Vectorizer.ai → auto-traces to clean SVG paths
2. Open in Figma or Inkscape → split fill areas into named layers
3. Replace color values with prop placeholders (the AI outputs hex values like `#C68642`; replace with `{props.fill}` in the React component)

**Step 4 — Component generation via Claude (per asset, 5 min)**

Paste the cleaned SVG code into Claude with this prompt:
```
Convert this SVG into a React Native component using react-native-svg.
The main fill color should be controlled by a `fill` prop (default: '#808080').
The component should accept `style` and `width`/`height` props.
Name it [ComponentName].
```

Claude outputs a production-ready `.tsx` file. This step turns each SVG asset into a usable layer component in minutes.

**Step 5 — Environment/background (1–2 days)**

The salon background is a full illustration, not layered. Use Midjourney for this:
```
"cozy nail salon interior, top-down isometric view,
flat vector illustration style, dusty rose walls,
wooden furniture, nail stations, waiting chairs,
soft lighting, no people, [shop vibe: kawaii/modern/etc]"
```

Generate all 6 shop vibes from the same base prompt, swapping the vibe descriptor. Export as SVG via Recraft or high-res PNG. The shop background doesn't need programmatic color changes — each vibe is its own asset file (6 files total, one per `shopVibe` value).

**Step 6 — UI elements (Figma AI, 1 day)**

Use Figma AI to generate:
- HUD bar layout → export as SVG components
- Polish bottle illustration → export as SVG with maskable fill area
- Nail shape icons (5 shapes) → clean vector icons
- Button frame (9-sliceable) → SVG with named regions

Figma AI drafts, then refine manually. These are simpler shapes than characters and take less iteration.

### AI Pitfalls to Avoid

- **Inconsistent line weights:** Different AI sessions produce different stroke widths. Fix this: specify `stroke-width: 2px` explicitly in every prompt, and do a final pass in Figma to normalize.
- **Too many path nodes:** AI-generated SVGs can have thousands of nodes. Run through Inkscape's "Simplify Path" (Ctrl+L) before converting to React Native components. High node counts tank performance on mobile.
- **Perspective drift:** Character layers generated in separate sessions can have slightly different perspective angles (one slightly 3/4 view, one full-front). Always include `front-facing, flat 2D perspective` in every prompt.
- **Face/expression generation:** AI struggles to generate consistent face expressions that swap cleanly. For the 7 expression variants in `FaceFeatures.tsx`, use Recraft.ai with SVG mode — it produces clean, simple vector paths that are easy to manually adjust. Or: generate neutral face in AI, then manually draw the 7 expressions in Figma (they're simple shapes — brows, mouth curves — and take 30 min total).

### Total Estimated AI Asset Time

| Asset type | Count | Time per asset | Total |
|---|---|---|---|
| Body archetypes | 4 | 45 min | 3 hrs |
| Hair styles | 8 (×2 layers) | 30 min | 8 hrs |
| Clothing tops | 12 | 20 min | 4 hrs |
| Clothing bottoms | 10 | 20 min | 3.5 hrs |
| Face expressions | 7 | 15 min | 1.5 hrs |
| Accessories | 6 | 20 min | 2 hrs |
| Shop backgrounds | 6 | 45 min | 4.5 hrs |
| UI elements | ~15 | 20 min | 5 hrs |
| **Total** | | | **~31 hrs** |

Without AI: the same asset set would take a solo artist 200+ hours. This is the force multiplier that makes a solo-build viable.

---

## Critical Files to Create

**Core simulation:**
1. `package.json` — Expo + Zustand + AsyncStorage + react-native-svg + react-native-reanimated deps
2. `app.json` — Expo app config
3. `tsconfig.json` — TypeScript config
4. `store/gameStore.ts` — Central game state
5. `engine/customerEngine.ts` — Arrival + patience logic + hidden preference assignment
6. `engine/serviceEngine.ts` — Progress + revenue + satisfaction score
7. `engine/tutorialEngine.ts` — Day 1 scripted flow: Maya customer, step-by-step tooltip gate
8. `hooks/useGameLoop.ts` — Tick driver

**Screens:**
9. `app/_layout.tsx` — Tab navigation
10. `app/onboarding/` — All 10 onboarding steps (existing plan)
11. `app/index.tsx` — Shop Floor screen (stations, waiting queue, review board overlay)
12. `app/staff.tsx` — Staff screen
13. `app/upgrades.tsx` — Upgrades screen
14. `app/stats.tsx` — Stats screen

**Service mini-game (new):**
15. `app/service/index.tsx` — Full-screen service view (entered when player starts a service manually)
16. `components/service/FilingStep.tsx` — Swipe gesture zone; `PanGestureHandler` + Reanimated; nail edge SVG smooths on valid stroke
17. `components/service/PolishStep.tsx` — Drag brush across nail canvas; `react-native-canvas` or SVG path drawing; fill % tracked per nail
18. `components/service/FinishStep.tsx` — UV lamp tap (gel) or top coat swipe; flash + shine layer on nail SVG
19. `components/service/NailCanvas.tsx` — The 5-nail hand view used across all service steps; accepts `fillPercent` + `nailColor` + `shineLayer` props

**Nail art system (new):**
20. `components/nailart/NailArtPanel.tsx` — Bottom sheet that slides up after color step; contains stamp/gem/freehand tabs
21. `components/nailart/StampTool.tsx` — Grid of available designs; tap to apply to selected nail
22. `components/nailart/GemTool.tsx` — Draggable gem types; snap-to-nail-surface logic
23. `components/nailart/FreehandTool.tsx` — Single-color SVG path drawing on nail canvas
24. `data/nailArtDesigns.ts` — Catalog of all stamp designs (name, SVG path data, unlock requirement, collection)

**Review board (new):**
25. `components/ReviewBoard.tsx` — Absolute-positioned overlay in Shop Floor; renders up to 3 speech bubble reviews
26. `engine/reviewEngine.ts` — Generates review text from satisfaction score; maps score ranges to templates; manages 3-day expiry

**Character system:**
27. `assets/characters/CharacterAvatar.tsx` — Composes all SVG layers
28. `assets/characters/layers/` — All body/hair/clothing/face SVG components
29. `components/character/AvatarPreview.tsx` — Live-updating preview used in onboarding
30. `engine/customerSpawner.ts` — Generates random `CustomerConfig` with visual + hidden preference fields

**Supporting:**
31. `store/ownerStore.ts` — Owner profile state (separate from game store)
32. `constants/theme.ts` — All color constants including skin tone palette
33. `data/services.ts` — Service catalog
34. `data/upgrades.ts` — Upgrade catalog (includes nail art unlock items)
35. `engine/traitEngine.ts` — Reads owner traits/hobbies, modifies simulation parameters

---

---

## Competitive Landscape

### What exists (and where they fall short)

| App | Core mechanic | Tycoon depth | Character depth | Gap |
|---|---|---|---|---|
| Nail Salon (Bravestars, 2025) | Paint/file/decorate mini-game | None | None | No management layer |
| Nail Salon 3D | ASMR clip/scrape/polish | Basic salon builder | None | No character identity |
| Acrylic Nails! | ASMR nail art missions | Coin/level loop | None | No staff/business sim |
| Beauty Tycoon (Hair Salon) | Hair + nails + makeup | Shallow staff hire | None | No owner identity |
| Nail Salon Tycoon (Roblox) | Idle tycoon | Automation focus | None | No craftsmanship feel |
| Hello Kitty Nail Salon | Decorate with stickers | None | IP-driven only | Licensed IP dependency |

**The clear gap:** No game combines (1) deep owner identity + character customization, (2) real tycoon management depth, AND (3) an interactive nail service moment. Every competitor has one of these three. We can own all three.

**Recurring player complaints across competitors:**
- Ads every 30–60 seconds (major friction)
- Gameplay doesn't match ad creatives (trust damage)
- Content exhausted within days (no long-term loop)
- No sense of "this is MY salon" (low emotional investment)

**What ASMR-focused games do well that we should borrow:**
- Satisfying haptic feedback on each interaction (file, clip, polish stroke)
- Sound design tied to gestures (brush sound, UV lamp hum)
- Exaggerated before/after reveal moment

---

## Missing Features & Experiences

The following are not in the current plan but are necessary for a competitive product:

### 1. Interactive Nail Service Mini-Game

**The gap:** Our plan has a passive progress bar for services. Every competitor has an interactive moment — this is where players spend most of their time and where ASMR satisfaction lives.

**What to add:** When a customer is seated, tapping "Start Service" enters a focused mini-game view:

```
SHAPE STEP:   Player swipes a file tool back and forth across nail
              → registered as valid swipe in a target arc zone
              → satisfying file sound + visual nail edge smooths

COLOR STEP:   Player drags a polish brush across each nail
              → brush leaves color trail, must cover full nail surface
              → each nail "fills up" with a progress indicator

FINISH STEP:  Quick UV lamp tap (for gel) or top coat swipe
              → brief flash effect + nails gain shine layer
```

Each step takes 10–20 real seconds. Staff skill level widens the acceptable input zone (lower skill = tighter tolerance = easier to make mistakes). The mini-game can be skipped by assigning to staff (they auto-complete), but player-completed services earn a 20% tip bonus.

This is the emotionally satisfying core loop that drives retention and social sharing.

### 2. Nail Art Design System

**The gap:** Current plan only has color selection. Competitors with nail art have significantly higher session lengths.

**What to add:** An optional 4th step in the service panel:
- Stamp tool: tap to apply a pre-drawn design (floral, geometric, abstract) over the polish
- Gem placement: drag rhinestones/gems onto nail surface (snap to position)
- Freehand draw: simple 1-color line tool for advanced players

Nail art unlocks via the upgrade catalog. Player's personal `nailAesthetic` trait (from onboarding) determines which art styles are pre-unlocked.

### 3. Review Board

**The gap:** Reputation score is abstract. Players need to feel the social consequence of their work.

**What to add:** A visible board in the shop environment (above the waiting area) showing 3 most recent customer reviews as speech bubbles:
- "Perfect almond shape! 💅⭐⭐⭐⭐⭐" (happy customer)
- "Waited too long... 😤⭐⭐" (impatient walkout)

Reviews fade out after 3 days. This is a strong visual motivation loop — bad reviews visible on the shop floor create urgency to improve.

### 4. Seasonal Events & Collections

**The gap:** No long-term content loop. Competitors exhaust content within days.

**What to add:** In-game season calendar:
- Valentine's Day: heart/rose nail art, pink/red collections, VIP "date night" customers
- Summer: beach/tropical designs, neon collections
- Halloween: dark/spooky designs, skeleton nail art
- Holiday: glitter/gold collections, gift-wrapped tip animations

Each season runs 2 weeks real-time. Seasonal collections are time-limited — creates FOMO-driven engagement spikes and gives marketing calendar pegs.

### 5. Tutorial / Day 1 Hook

**The gap:** Plan goes straight from onboarding into gameplay. New players will churn without guidance.

**What to add:** A scripted first customer — "Maya" — who walks the player through every mechanic. She's friendly, has max patience, and leaves a guaranteed big tip. Her dialogue introduces the systems one at a time. By the end of Day 1, the player has completed one full service (including nail art), earned their first tip, and received their first review board post.

### 6. Offline Progression

**The gap:** Idle mechanics are completely absent. Competitors use this for daily retention loops.

**What to add:** When the app is closed, staff auto-work at 50% efficiency. When player returns, a "You were away for 3 hours — here's what happened" summary shows earnings, customers served, and any negative events (customer walked out). Capped at 8 hours of offline earnings to prevent runaway progression.

### 7. Social Sharing

**The gap:** No viral loop.

**What to add:** After completing a nail art design, a "Share your creation" button generates a stylized screenshot — the customer's hand with the finished nails, the shop name watermark, and the nail color/art name. Standard iOS/Android share sheet. TikTok and Instagram are primary targets for this UGC loop.

---

## Monetization Plan

**Model: Free to download, cosmetic IAP, no pay-to-win, no ads.**

Rationale: The target audience (women 18–35) has strong negative response to intrusive ads (confirmed by App Store reviews across competitors). A clean, premium-feeling experience with optional cosmetic purchases earns more LTV than ad-saturated competitors.

### Revenue Streams

**1. Seasonal Pass — $2.99/season (primary revenue)**
- 2 new nail art collections (16 colors + 8 designs)
- 1 exclusive shop decoration theme
- 1 exclusive customer type (e.g. Valentine's VIP)
- Technician outfit for that season
- Does NOT affect gameplay balance — purely cosmetic + content

**2. Cosmetic Packs — $0.99–$2.99 each**
- "Glam Pack": 8 premium nail colors + 4 gem designs + gold tip jar skin
- "Kawaii Pack": pastel collection + sticker nail art set + plush chairs decor
- "Dark Academia Pack": moody colors + gothic nail art + leather furniture
- Sold individually, no bundle pressure

**3. Starter Pack — $0.99 (one-time, shown at end of Day 1)**
- $300 in-game cash boost
- 1 exclusive nail color collection (never sold separately)
- 1 premium shop decoration
- Shown only once after tutorial completes — contextual, not annoying

**4. Remove Ads Equivalent — "VIP Nails" subscription, $1.99/month**
- Early access to seasonal collections (1 week before free release)
- 2x tip income on Fridays and Saturdays (in-game "weekend rush")
- Exclusive subscriber-only nail art design (monthly drop)
- Frame on Review Board posts ("VIP Salon")

**What's always free:**
- All gameplay mechanics
- All staff management features
- All tycoon progression
- Core nail color collections (30+ colors)
- Base nail art tools

**Pricing benchmarks:** Competitors charge $4.99/week subscription (per App Store data). Our $2.99/season is dramatically lower friction and positions us as fair-play.

---

## Go-to-Market Plan

### Target Audience
Primary: Women 18–32, casual-to-mid-core mobile gamers, nail enthusiasts
Secondary: Women 33–45 who enjoy tycoon/management games (Stardew Valley, Restaurant Story demographic)
Not targeting: Hardcore gamers, male audience primarily

### Pre-Launch (6–8 weeks before release)

**TikTok first:** Nail content is one of TikTok's largest organic categories. Strategy:
- Create a dev TikTok account — "building a nail salon game" behind-the-scenes content
- POV videos: "POV: you're the owner of your own nail salon 💅" using real gameplay
- "What your nail shape says about you" trend format — works naturally as gameplay content
- Target: 3-5 videos/week, 6 weeks before launch

**Instagram/Pinterest:** Visual assets — nail art screenshots, shop decoration reveals, character customization previews. Pin "nail salon game aesthetic" boards.

**Soft launch:** Canada + Australia + New Zealand, 4 weeks before global launch. These markets have high mobile spend and similar demographics to US. Use this window to tune monetization conversion rates and fix Day 1 churn.

**ASO keywords:** "nail salon game", "nail tycoon", "nail art game", "nail shop simulator", "salon management game", "beauty tycoon"

**App icon A/B test:** Test (a) illustrated nail with sparkle vs (b) character avatar at station vs (c) colorful nail polish bottles

### Launch Week

- Press: Pitch to mobile gaming blogs (TouchArcade, Pocket Gamer) AND beauty/lifestyle press (Refinery29, Cosmopolitan's gaming coverage). The dual-audience angle (nail enthusiasts + gamers) is rare and pitchable.
- Reddit: Post in r/iosgaming, r/androidgaming, r/nailart — show gameplay video
- Discord: Partner with nail art Discord communities for beta feedback
- "Opening Day" in-game event: first 7 days, all players get a free cosmetic pack (drives Day 1 retention + word of mouth)

### Post-Launch Retention Loop

- Seasonal events every 8 weeks (content marketing pegs)
- Monthly "Customer of the Month" — special customer with unique design challenge
- In-game review board + social sharing creates natural UGC
- Push notification strategy: "Your salon opens in 2 hours!" (morning), "3 customers waiting! 💅" (evening)

### Key Metrics to Track

| Metric | Target (Day 30) |
|---|---|
| Day 1 retention | > 40% |
| Day 7 retention | > 20% |
| Day 30 retention | > 8% |
| ARPU (30-day) | > $0.80 |
| Starter pack conversion | > 15% of Day 1 completers |
| Season pass conversion | > 5% of active players |

---

## Verification

1. `npx expo start` — app launches in Expo Go on device/simulator
2. Shop Floor shows 2 stations, a waiting queue area, and HUD with $500 starting money
3. Wait ~5 seconds — a customer appears in the queue
4. Tap customer → assign to empty station → service progress bar fills
5. Service completes → money increases, customer leaves
6. Navigate to Staff tab → assign staff to station → service speeds up
7. Navigate to Upgrades → buy "Add Station" → 3rd station appears on Shop Floor
8. Navigate to Stats → reputation bar and earnings shown
9. Kill app, reopen → game state restored from AsyncStorage
