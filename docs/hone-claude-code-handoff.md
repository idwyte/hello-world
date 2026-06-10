# Hone — Claude Code Handoff Pack

*The bridge from the Obsidian Kinetic redesign (Figma) back to the live repo. Read this first, then the four companion docs. June 2026.*

---

## 0. What this is and what it is not

This is a **presentation-layer rebuild**. The redesign changed how Hone looks and how the assessment *thinks* — it did **not** change the backend, data model, Edge Functions, native modules, or core business logic. Those carry over untouched. Your job, Claude Code, is to:
1. Re-skin the app to the Obsidian Kinetic design system (tokens + components below).
2. Implement the **v2 multi-dimensional assessment** (replaces the old 2-test single-index).
3. Wire the **archetype routing** (down-training / foundation / strengthening) into program generation.
4. Add the motion/haptic layer.

**Do not touch without explicit instruction:** Supabase schema/migrations, the `generate-program` and `delete-account` Edge Functions' *infrastructure* (the generation *prompt/inputs* change — see §5), auth, RevenueCat wiring, the native module setup.

---

## 1. Source of truth & companion docs

| Doc | What it governs |
|---|---|
| **Figma file** `9j7Lhai90BdMe7xwK4aPbF` ("Hone — Obsidian Kinetic") | Visual system, all components, all screens |
| **DESIGN.md** (in repo / uploads) | Token values — the contract. Figma variables mirror this exactly. |
| **hone-assessment-logic-v2.md** | The five-dimension + relaxation-screen assessment model, profile vector, routing |
| **hone-down-training-track.md** | The safety-critical archetype: content, rules, referral spine |
| **hone-assessment-copy-deck.md** | Final on-screen copy for every assessment + preview screen |
| **hone-motion-haptic-spec.md** | Motion tokens, haptics table, signature animations |

If Figma and a doc ever disagree, the **doc wins for logic/copy**, **Figma wins for layout/visuals**.

---

## 2. Design tokens → code

The Figma file has three variable collections that mirror DESIGN.md 1:1. Generate the theme from DESIGN.md (it's the canonical source; Figma was built from it):

- **Color** — 47 tokens, single "Obsidian" mode. Names match DESIGN.md keys exactly (`surface-container-high`, `on-primary-container`, `primary-container` = Electric Lime `#c3f400`, `secondary-container` = Cyan Pulse `#00eefc`, etc.). Each Figma var carries `var(--token)` web syntax for direct mapping to NativeWind/Tailwind config.
- **Spacing** — `base 4 · gutter 12 · container-padding 20 · stack-sm 8 · stack-md 16 · stack-lg 24`.
- **Radius** — `sm 2 · default 4 · md 6 · lg 8 · xl 12 · full 9999`. **Note:** the mocks use `xl` (12) on buttons/cards, *not* the 4px the DESIGN.md prose mentions — follow the mocks/variables (12).
- **Type** — Archivo Narrow (display/headlines/body) + JetBrains Mono (labels). 8 styles: `display 48 · headline-lg 32 · headline-md 24 · body-lg 18 · body-md 16 · label-caps 12 (mono, +10% tracking) · metric-lg 40 · label-button 18 SemiBold`. Metrics render **upright, not italic** (DESIGN.md prose says italic; the YAML and every mock are upright — upright wins).

Build the theme as a small reviewable tokens file, not inline magic numbers.

## 3. Component inventory (Figma → RN components)

Eight components exist in Figma, all variable-bound. Map each to your existing RN component or create:

| Figma component | Variants | Notes |
|---|---|---|
| Button [4] | Primary/Ghost × Default/Disabled | 342×56, radius 12. `Label` text prop. Primary = lime fill / near-black text; Ghost = cyan border/text |
| Card | — | Glass: `surface-container-low` @85% + 1px 10%-white inner border. `Label`+`Value` props (the stat-card pattern) |
| Input [3] | Default/Focused/Error | Mono caps label above; border → cyan on focus, coral on error |
| Chip [3] | Active/Complete/Muted | Pill; status badges |
| Screen Header [2] | Back/Close | 390 wide, title = label-button weight |
| Tab Bar [4] | active per tab | Home/Program/Streaks/Settings. Active = lime + glow |
| Phase Ring | — | The hero. Donut + glowing lime arc. `Time`+`Caption` props. In code: takes `progress 0–1`, `mode 'performance'|'breathing'`, `glow bool` |
| Price Card [6] | Annual/Monthly/Lifetime × Selected/Default | Set-level `Badge` bool for BEST VALUE. **Covers both pricing experiment arms** |

## 4. Screen inventory & build order

28 screens in Figma `📱 Screens` page, now in canonical numbered order. Build in this dependency sequence:

**Phase A — Foundations & daily loop (highest value; retention lives here)**
1. Theme/tokens + the 8 components.
2. `10 · Home` — includes **ambient measurement** (Hone Index + trend, streak, weekly bars). The index visible here is the brand promise kept daily.
3. `11 · Active Session` — Phase Ring hero, glow = live, phase dots, pause/skip.
4. `12 · RPE Capture` — 1–10 effort, big number.
5. `13 · Session Complete` — success + **post-session Index-impact card** (ambient measurement).

**Phase B — Onboarding funnel**
6. `01 Welcome` → `02 Sign-in` (Apple/Google + magic link; deferred auth).
7. `03 Assessment Intro` ⚠ **needs copy update to v2** ("a few quick measurements", not "2 tests" — corrected copy is in the copy deck).
8. `04–09 Assessment` — the **v2 six-step**: Strength · Stamina · Repetitions · Speed · Control · **Release**. This replaces the old 2-test flow. The Release screen (`09`) is safety-critical — see §5.
9. `10 Assess · Age (context)` — lifestyle context.
10. `11 AI Consent` → `12 Generating` → `13 Plan Preview (AI)`.

**Phase C — Branch coverage & previews**
11. `Plan Preview (Bars)` and `(Radar)` — **A/B variants** of the five-axis profile. Recommendation: ship **Bars** as default (most legible at phone size); keep Radar for the retest before/after. Wire as a remote-config/experiment flag.
12. `Plan Preview (No-AI / Rule-based)` — the **decline-path** preview. Must be reachable; honest copy, non-punitive.
13. `Plan Preview (Down-Training)` + `Referral Interstitial` — the archetype branch (see §5).

**Phase D — System states (already designed)**
14. `Check Email · Can't Feel It · Error · Empty` — wire to real triggers.

**Still to design (not blocking Phase A–B):** program drill-ins (day/exercise detail, session review, education), settings sub-pages (legal viewer, reminders, edit profile, delete account, restore purchase), paywall assembled from Price Card, pause sheet, streak-freeze. All derivable from existing components.

## 5. The assessment logic change (the substantive backend touch)

This is the one place generation logic changes. Detail in `hone-assessment-logic-v2.md`; essentials:

- The assessment now produces a **profile vector**, not a single index:
  `{ archetype, strength_oxford, endurance_seconds, rep_ceiling, fast_count, fiber_bias, coordination, relaxation, context }`.
- **`generate-program` input changes** from a scalar to this object. The model prompt must: select archetype track → weight toward fiber deficit → compute dosing from raw values → apply safety rails.
- **Archetype routing runs BEFORE dosing** and is mostly deterministic (guardrails), so it works on the **rule-based path too** — meaning a user who declines AI still gets safe routing. The decline path and the safety path share code.
- **Down-training is safety-critical** (`hone-down-training-track.md`): if the Release screen flags possible hypertonicity or "symptoms worse after Kegels", route to down-training, **never prescribe strengthening**, keep professional referral visible. The relaxation foundation + referral must **not** be paywalled.
- Model: existing `generate-program` uses `claude-haiku-4-5`, gated server-side by `profiles.ai_consent_at`. Keep the consent gate; the new consent screen (`11`) feeds it.

## 6. Motion & haptics

Per `hone-motion-haptic-spec.md`: **Reanimated 3** + **expo-haptics**. Signature items: Phase Ring arc sweep + glow intensify + complete-pulse; the breathing-ring (down-training) inhale-expand/exhale-contract at the slowest tempo with haptics suppressed; value count-ups + profile draw-in on measurement reveals; `impactMedium` on each registered contraction. Honour `useReducedMotion()`; haptics are a setting (default on).

## 7. Known residuals / decisions still open
1. `03 Assessment Intro` copy still says "2 tests" — update from copy deck (flagged in Figma layer name).
2. Radar vs. Bars — recommend Bars default; final call open.
3. Sensitive life-stage context (postpartum/menopause/post-surgical) deferred out of funnel to first program setup — not yet designed.
4. Pricing experiment (Variant A subscription-only vs. Variant B +£49.99 lifetime) — RevenueCat Experiment, decide on realised revenue/install at 60 days. Price Card supports both.
5. Sound design — deferred post-launch.

## 8. After the rebuild: the ship checklist resumes
The redesign was a detour from the 13-item launch checklist. On rebuild completion, resume at **Task 3: legal copy sign-off** (blocker), then production icons/splash, then the platform-specific store/FCM/OAuth/RevenueCat items. Bundle id `com.honeapp.mobile`; Supabase ref `plfbqeuynswlqfzgvzeu`.

---

### Kickoff prompt for Claude Code (paste at repo root)
> Read DESIGN.md and the four hone-*.md docs in /docs (or wherever placed). We're doing a presentation-layer rebuild to the "Obsidian Kinetic" design system plus a v2 multi-dimensional assessment — backend, Supabase, Edge Functions, auth and RevenueCat stay intact. Start with Phase A from the handoff pack: generate the theme/tokens from DESIGN.md, build the 8 components, then rebuild Home (with ambient Hone Index), Active Session, RPE, and Session Complete. Show me the tokens file and the Button + Phase Ring components first for review before proceeding. Reference the Figma file 9j7Lhai90BdMe7xwK4aPbF for layout via the Figma MCP if available.
