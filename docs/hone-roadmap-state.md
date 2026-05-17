# Hone — Deployment Roadmap State

**Last updated:** 2026-05-17
**Current stage:** Phase 1.5 — Brand Identity (Figma only)
**Next action:** Components page — Sheet (bottom-sheet container; compact / medium / full).

**Figma file:** [Hone — Design System v1](https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/Hone-%E2%80%94-Design-System-v1)
**File key:** `qgY3Qcf7gP7w5V5A6uQTL4`
**Pages:** Foundations `0:1` · Brand `2:2` · Components `2:3` · Screens `2:4` · Photography `2:5`
**Foundations root frame:** `4:2` (1600×3837)

> This file is the source of truth for "where are we right now" in the Hone v1.1 → launch journey. The `@hone-coach` subagent reads it at the start of every invocation and writes it after each verified step. Read freely; let the coach write.

---

## Sequence

- [x] **Phase 1 — Pelvic Floor Index** *(PR #2, commit `0ee461a`)*
- [ ] **Phase 1.5 — Brand Identity (Figma only, ~3 weeks)**
  - [x] Create the Figma file (file key `qgY3Qcf7gP7w5V5A6uQTL4`, user created manually)
  - [x] Set up 5 pages (Foundations, Brand, Components, Screens, Photography)
  - [x] Foundations page: 21 color vars (10 brand + 11 semantic aliases), 10 spacing, 6 radius, 4 duration + 3 easing, 10 Inter text styles, 4 elevation effect styles
  - [x] Foundations page: visual display frames (brand swatches, alias swatches, type spec, spacing ruler, radius ruler, elevation, motion table — 1600×3837 overview)
  - [x] Brand page: 6 Monogram H exploration variants laid out (Solid block / Condensed / Stencil / Chunky / Outlined / Inset)
  - [x] Brand page: **Inset** picked; wordmark + 8-card lockup set built (mark-only, wordmark-only, horizontal, vertical, on-light, app icon @ 1024, home-screen mock, wordmark scale stack)
  - [x] Brand page: 4 alternate app icons (Default H / Focus ring / Posture figure / Health heart) + 80px home-screen comparison strip
  - [ ] PNG + SVG exports of mark, wordmark, full lockup, and 5 app-icon variants (asset production task; deferred to Asset production stage)
  - [x] Components page: 7 existing components mirrored from code (`components/`)
    - [x] ProgressDots — atomic `dot` component set with past/current/future variants, 3 usage examples, spec card
    - [x] PhaseLabel — `phaseLabel` set with 6 variants (prep/squeeze/hold/release/rest/done), color-coded via semantic aliases, session-sequence strip, spec table
    - [x] PacerRing — `pacerRing` set with 5 progress variants (0/25/50/75/100), 4 phase-color examples (Squeeze/Hold/Release/Rest), round line caps
    - [x] IndexTrendChart — `indexTrendChart` set with 4 state variants (empty/single/short/full); sparkline drawn as line segments + dots, dashed midline @ composite=50
    - [x] StreakHeatmap — `streakHeatmap` set, 4 density variants (empty/sparse/active/heavy), 12 × 7 grid of 14 px cells with 4 px gaps, Less→More legend
    - [x] QuestionCard — `questionCard` set, 3 state variants (default/selected/with-help) with numbered circle badges; selected state inverts the row to interactive/primary and the badge to interactive/primary-pressed
    - [x] ErrorBoundary — single `errorBoundary` component, 390 × 800 full-screen fallback; overridable `message` text layer; centered title + message + "Try again" CTA
  - [ ] Components page: 12+ new primitives (Button, Input, Toggle, ListRow, Sheet, Modal, Toast, EmptyState, ErrorState, TimePicker, Slider, RatingPrompt, CoachmarkOverlay, BiometricLockScreen, LiveActivityCard, IconPickerTile)
    - [x] Button — `button` set, 4 variants × 3 states = 12 (primary/secondary/ghost/destructive × default/pressed/disabled); destructive uses existing `feedback/danger` token (no Foundations changes needed — alias was already in place); padding 16 / 32, radius 12, 56 px tall
    - [x] Input — `input` set, 5 state variants (default/focused/filled/error/disabled); label above + field + conditional error helper; field 52 px tall, radius 12; focused gets 2 px accent stroke + caret, filled gets 2 px success stroke (valid signal), error gets 2 px danger stroke + helper
    - [x] Toggle — `toggle` set, 3 state variants (off/on/disabled); iOS-style 51 × 31 track + 27 px white thumb with subtle drop shadow
    - [x] ListRow — `listRow` set, 5 trailing-slot variants (chevron/value/value-chevron/toggle/none); 360 × 56 (toggle row 63 to fit control); destructive title via `trailing=none`; composed 4-row "Settings group" example included
  - [ ] Iconography decision: Lucide-restyled vs bespoke 24px line set
  - [ ] Screens page: 16 existing routes mocked at new fidelity
  - [ ] Screens page: 12 already-roadmapped Phase 2/3 screens mocked
  - [ ] Screens page: 14 competitor-gap screens mocked (education, end-of-session, coachmarks, legal viewers, empty/error, onboarding bail-out, voice picker, HealthKit connect, reverse-Kegel intro, maintenance, challenge cycle, RPE slider, rating prompt, restore-purchase)
  - [ ] Photography page: hybrid abstract + lifestyle mood board, composition rules, do/don't pairs, ≥4 Midjourney prompt templates
  - [ ] Brand book frame in the Brand page exported as PDF
- [ ] **Phase 2 — Habit-stacking (~1.5 weeks)**
  - [ ] Migration `0004_streak_freezes.sql` applied to staging
  - [ ] `modules/app-intents/` Swift implementation + 4 AppIntent types
  - [ ] `modules/focus-filter/` Swift INFocusStatusCenter listener
  - [ ] `modules/calendar-gaps/` EventKit free-time detector
  - [ ] `plugins/withAppIntents.ts` config plugin
  - [ ] `lib/streak.ts` client-side freeze logic
  - [ ] `app/(app)/settings/reminders.tsx` UI
  - [ ] `lib/notifications.ts` schedule/cancel reminder
  - [ ] `lib/exercises.ts` `quick_discreet` preset
  - [ ] `app/(app)/session/today.tsx` `?preset=` deep-link handling
  - [ ] Acceptance criteria pass (5 items in plan §Phase 2)
- [ ] **Phase 3 — Stealth productized (~3 weeks)**
  - [ ] `modules/live-activity/` Swift ActivityKit wrapper
  - [ ] `ios/HoneLiveActivity/` widget extension target
  - [ ] `plugins/withLiveActivity.ts` config plugin
  - [ ] Live Activity wiring in `lib/audio/decoy-track.ts` + `app/(app)/session/stealth.tsx`
  - [ ] `MPMediaItemArtwork` Now Playing wiring in stealth-haptics module
  - [ ] Anonymous-first sign-in in `lib/auth.ts` + `app/(auth)/sign-in.tsx`
  - [ ] `lib/biometric-gate.tsx` + `app/(app)/settings/security.tsx`
  - [ ] Alternate app icons via `expo-alternate-app-icons` or `plugins/withAlternateIcons.ts`
  - [ ] `app/(app)/settings/app-icon.tsx`
  - [ ] Acceptance criteria pass (5 items in plan §Phase 3)
- [ ] **Asset production**
  - [ ] ElevenLabs — decoy ambient loop `assets/audio/focus-session.m4a`
  - [ ] ElevenLabs — 6 cue clips `assets/audio/cues/<style>_<phase>.m4a`
  - [ ] Midjourney — 3 decoy cover art `assets/audio/covers/<key>.png`
  - [ ] Midjourney — app icon set `assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`
  - [ ] Midjourney — hero/lifestyle imagery for marketing + in-app surfaces
  - [ ] Asset-dependent code edits (plan §C, items 1–5)
- [ ] **Service configuration**
  - [ ] Supabase: project, env vars, migrations 0001–0004 applied, auth providers configured, `delete-account` Edge Function deployed, RLS tests passing
  - [ ] RevenueCat: project, `hone_lifetime` non-consumable at $4.79 created in App Store Connect + Play, entitlement `pro` attached, offering `default` configured
  - [ ] Apple Developer: enrolled, App ID with Sign in with Apple, App Store Connect record with privacy questionnaire
  - [ ] Google OAuth: web client + iOS client, Supabase Google provider configured
  - [ ] Play Console: app record, internal testing track, mirrored product
- [ ] **Build pipeline**
  - [ ] `eas init`, EAS project ID created
  - [ ] `ascAppId` filled in `eas.json`
  - [ ] All `EXPO_PUBLIC_*` secrets set via `eas secret:create`
  - [ ] Apple App-Specific Password + Google service account JSON set
  - [ ] `npx expo prebuild --clean` succeeds
  - [ ] Dev-client iOS build succeeds + installed on real iPhone
  - [ ] Dev-client Android build succeeds + installed on real Pixel
  - [ ] Smoke tests pass (plan §E3)
- [ ] **TestFlight / Play internal**
  - [ ] Production iOS build via EAS
  - [ ] Production Android build via EAS
  - [ ] `eas submit --platform ios` succeeds
  - [ ] `eas submit --platform android` succeeds
  - [ ] 5 internal testers verify happy path on TestFlight
- [ ] **App Store / Play submission**
  - [ ] iOS submitted for review
  - [ ] Android submitted for review
  - [ ] Review feedback addressed (loop until approved)
- [ ] **Launch**
  - [ ] iOS public release
  - [ ] Android public release
  - [ ] Sentry / PostHog ingestion live (deferred per Pending Actions §F)
  - [ ] Support inbox / response template in place

---

## Known debt

_Skipped steps or deferred polish — added by `@hone-coach` when the user explicitly skips a step._

(empty)

---

## Blockers

_External dependencies not yet resolved — added by `@hone-coach` when prerequisite credentials, services, or assets are missing._

(empty)

---

## Notes

- Plan source of truth: `/root/.claude/plans/i-want-to-build-stateless-turtle.md`
- Project context: `/home/user/hello-world/CLAUDE.md`
- Phase 1.5 deliverable: a single Figma file with 5 pages (Foundations, Brand, Components, Screens, Photography). No code changes in this phase.
- Monetization: one-off purchase $4.79 (`hone_lifetime` non-consumable). No subscriptions, no trial.
