# Cross-cutting primitive spec (from Figma 08/09/10/11)

Authoritative source: live Figma reads of screens 08·home (`72:88`), 09·program (`91:258`), 10·progress (`92:245`), 11·settings (`94:314`) on 2026-05-20.

## ScreenHeader — 3 variants

| Variant | Used on | Figma node | Layout |
|---|---|---|---|
| `greeting` | home | `80:847` | h-56, items-end, px-16 py-6, left: greeting + name, right: streak chip |
| `large-title` | program, settings | `84:877` | h-80 flex-col, top row h-44 trailing slot, bottom row h-36 28/36 title |
| `title` | progress | `80:854` | h-56, items-center, justify-between, 28/36 title + trailing pill (Retest) |

Title text: **28px / 36 line-height, Semi Bold, ink**.

## Card radii — off-scale literals used across screens

Foundations defines `radius/lg=12, xl=16, 2xl=24, full`. Screens use intermediate values for visual emphasis:

| Use case | Radius | Examples |
|---|---|---|
| Dense group / week card | **14** | Settings group container, Plan week card |
| Standard card | **16** (`xl` token) | Stat card, Index card, Streak card |
| Hero card | **20** | Home's today-session card |
| Phone frame mock | 44 / 52 | mockup chrome only — ignore |
| Pills | 999 (full) | all pills |
| Day cell | 10 | Plan day grid |

**Primitive change:** Card must accept arbitrary radius via className passthrough (current `radius="xl"` is fixed to 16). Recommend keeping the named scale but accepting `className="rounded-[Npx]"` overrides for off-scale screens.

## Card layouts (all w-358, bg surface, no border in app)

| Variant | Padding | Gap | Radius | Examples |
|---|---|---|---|---|
| Hero | 24 | 20 | 20 | home today-session |
| Standard | 20 | 16 | 16 | Progress index/streak cards |
| Compact | 16 | 12 | 14 | Plan week cards |
| Stat | 16 | 4 | 16 | home stat cards (w-173 fixed, NOT flex-1) |
| Group list shell | 0 | 0 | 14 | Settings grouped lists |

## Pill — needs full primitive

| Variant | bg | text | px / py | use |
|---|---|---|---|---|
| streakChip | surface + border | 13/18 SB ink | 12/14 / 8 | home header right |
| completionChip | surface2 | 12/16 SB ink | 10 / 4 | Plan "3/7" |
| levelPill | accent | 12/16 SB ink | 12 / 6 | Progress "Intermediate" |
| ctaPill | accent | 13/18 SB ink | 14 / 8 | Progress "Retest" |
| deltaChip | surface2 | 13/18 SB success | 10 / 12 / 6 | Progress "+7" |

**Recommendation:** keep `Pill` with `tone` (surface/surface2/accent/accentSoft) and `size` (xs/sm/md). Drop the current "neutral/accent" tone names — Figma uses surface/surface2/accent distinctly.

## ListRow (settings rows) — `94:229`

- Width: 358
- Padding: `px-[20px] py-[16px]`
- Label: 16/24 Regular ink (or `text-feedback-danger` for destructive Sign out)
- Trailing: optional value text 16/24 muted, gap-10, then chevron 7×14 OR toggle 51×31 OR nothing
- **Separator: 1 px `bg-border-default` line _between rows only_, w-358** — current code likely uses ml-4 inset; Figma is full-width

**Important Settings finding (note `94:330`):**
> The `listRow` component is 360 wide; settings content area is 358 (390 − 16 px padding × 2). Inlining the rows with exact 358 width avoids 2 px overflow and keeps the separator rectangles flush.

So `ListRow` primitive width should be **358 px**, matching the settings 16-px outer padding. My current code uses `Card padding="none"` then wraps `ListRow` inside — that's correct architecture, just verify the row width.

## SectionLabel tracking

| Use | Tracking | Figma examples |
|---|---|---|
| Group label (outside card) | `tracking-[1.2px]` | `ACCOUNT`, `TRAINING` (settings) |
| In-card kicker | `tracking-[1.4px]` | `TODAY · DAY 3` (home), `PELVIC FLOOR INDEX` (progress) |

Both are 11px Medium muted, leading-14.

## Tab bar — `81:35` / `92:230` / `94:299` (consistent across all 4 tabs)

- **Height: 50 px** (current code: 64 — WRONG)
- bg: surface, border-t border default
- Padding: `px-[4px] py-[9px]`
- 4 flex-1 cells
- Each cell: 32×40 inner frame (the active-state pill shape)
- **Active state: accent BG pill behind icon** — currently we render icon with active tint color only. Need to add the rounded accent pill.
- **NO labels** — current code has `tabBarLabel`. Drop it.
- Inactive: muted icon, transparent pill BG

## Icons

- Streak chip uses **water-drop / tear-drop** vector glyph (not lucide Flame). Closest lucide equivalent: `Droplet` (h-14 w-12 in Figma → render at size={14} flex 12×14)
- Delta chip uses an **up-triangle** for positive delta — lucide `TriangleUp` or `MoveUp` / `ChevronUp` rotated
- Tab bar icons: lucide `Home`, `CalendarDays`, `LineChart`, `Settings` — current code uses `Sparkles` for Today; need to switch to `Home` per Figma

## Status bar / home indicator

Figma mockups draw both. **Don't render in code** — SafeAreaView + system StatusBar handle this on real devices.

## Cross-screen layout constants

- Screen content padding x: **16** (uniform across all 4 tabs)
- Status bar height: 50 (Figma mock) → system handles
- ScreenHeader top: 60 (= status bar 50 + 10 gap)
- Content under header starts at: 132 (after greeting header) or 156 (after large-title)
- Tab bar at: top 762 = bottom-50

## What this means for the code right now

**Primitives to update before any screen reskin:**
1. `Card` — accept arbitrary radius via className; reduce default radius to `xl=16` (no change needed there)
2. `Pill` — replace tone API with surface/surface2/accent/accentSoft; add size xs/sm/md with correct paddings
3. `Stat` — fixed `w-[173px]` default; remove flex-1; bg surface no border, p-16, rounded-16
4. `ListRow` — verify width is 358 (or accept width prop); ensure full-width separator above each row except first
5. `SectionLabel` — accept `tracking="group" | "kicker"` prop
6. **Tab bar in `app/(app)/_layout.tsx`** — h-50, NO labels, custom active-state component with accent pill
7. **`Home` lucide icon** swap for Today (was `Sparkles`)
8. **`Droplet` lucide icon** swap for streak chip (was `Flame`)
9. New `ScreenHeader` primitive accepting `kind="greeting" | "large-title" | "title"` to encode the 3 variants once
