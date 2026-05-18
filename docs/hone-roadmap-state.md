# Hone — Deployment Roadmap State

**Last updated:** 2026-05-17
**Current stage:** Phase 1.5 — Brand Identity (Figma only)
**Next action:** Batch 1 of the v1-launch screen sweep is complete (7 screens, 24–30). Batch 2 — competitor-gap polish (end-of-session review · reverse-Kegel intro · education · RPE slider · coachmark overlay). Batch 3 — Phase 2/3 forward-looking (reminder time wheel · streak-freeze · anonymous/guest · biometric lock · app icon picker · Live Activity widget).

**Figma file:** [Hone — Design System v1](https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/Hone-%E2%80%94-Design-System-v1)
**File key:** `qgY3Qcf7gP7w5V5A6uQTL4`
**Pages:** Foundations `0:1` · Brand `2:2` · Components `2:3` · Iconography `58:2` · Screens `2:4` · Photography `2:5`
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
  - [x] Components page: 12 new primitives shipped (Button, Input, Toggle, ListRow, Sheet, Modal, Toast, EmptyState, ErrorState, TimePicker, Slider, RatingPrompt) · then 2 nav primitives extracted during screen building (tabBar, screenHeader); deferred to Phase 2/3 — CoachmarkOverlay, BiometricLockScreen, LiveActivityCard, IconPickerTile
    - [x] Button — `button` set, 4 variants × 3 states = 12 (primary/secondary/ghost/destructive × default/pressed/disabled); destructive uses existing `feedback/danger` token (no Foundations changes needed — alias was already in place); padding 16 / 32, radius 12, 56 px tall
    - [x] Input — `input` set, 5 state variants (default/focused/filled/error/disabled); label above + field + conditional error helper; field 52 px tall, radius 12; focused gets 2 px accent stroke + caret, filled gets 2 px success stroke (valid signal), error gets 2 px danger stroke + helper
    - [x] Toggle — `toggle` set, 3 state variants (off/on/disabled); iOS-style 51 × 31 track + 27 px white thumb with subtle drop shadow
    - [x] ListRow — `listRow` set, 5 trailing-slot variants (chevron/value/value-chevron/toggle/none); 360 × 56 (toggle row 63 to fit control); destructive title via `trailing=none`; composed 4-row "Settings group" example included
    - [x] Sheet — `sheet` set, 3 size variants (compact 280 / medium 480 / full 720); 390 wide, top-corner-rounded 24, grabber + title + subtitle + body slot + bottom CTA; usage cards show sheet over a dimmed (45% black) scrim
    - [x] Modal — `modal` set, 3 kind variants (info / confirm / destructive); 320 × 196, radius 20, title + body + actions row (1 button for info, 50/50 split for confirm + destructive)
    - [x] Toast — `toast` set, 3 kind variants (success / info / error); 342 × 68, surface/sunken bg + 24 px shadow, 24 px round icon + title + description
    - [x] EmptyState — `emptyState` set, 2 kind variants (with-action 320 × 292 / no-action 320 × 218); abstract 120 px illustration (3 concentric circles, dashed outer ring) + title + body + optional CTA
    - [x] ErrorState — `errorState` set, 2 kind variants (retry 320 × 292 / dismiss-only 320 × 218); same scaffolding as EmptyState but inner disc is feedback/danger with a white cross
    - [x] TimePicker — `timePicker` set, 2 state variants (closed 360 × 56 / open 360 × 298); closed is a settings row with accent value, open is a 3-column wheel (hour / minute / AM-PM) with a centered selection strip and fading neighbour values
    - [x] Slider — `slider` set, 2 kind variants (continuous 45 % / discrete RPE 7/10), both 320 × 56; 6 px track with accent fill + 24 px white thumb (2 px accent border, drop shadow); discrete overlays 10 tick marks
    - [x] RatingPrompt — `ratingPrompt` set, 3 value variants (0 / 3 / 5) at 320 × {190, 170, 308}; 5 × 36 px vector stars (accent fill when on, muted stroke when off); 4+ stars unlocks accent "Rate on App Store" CTA + "Maybe later" link — completes 12/12 new primitives
  - [x] Iconography decision — **A (Lucide-restyled)** chosen. Implementation via `lucide-react-native` (MIT). Stroke 2 px, round caps + joins, brand/ink. Tab-bar + session icons may be redrawn in Hone's house style as a v1.1 polish pass once telemetry shows the 6–8 most-viewed icons.
  - [x] Screens page: 16 existing routes mocked at new fidelity
    - [x] 01 · welcome — 390 × 844 splash with Inset-H monogram, "Hone" wordmark, USP tagline, primary "Get started" CTA, secondary sign-in, deferred-guest link; notes column documents structure, components, copy decisions, and flow
    - [x] 02 · sign-in — back chevron + title + Apple/Google OAuth (white bg, black label, colored glyph placeholder) + "or" divider + focused email Input + Send-magic-link CTA + terms footer
    - [x] 03 · assessment — back chevron + ProgressDots (1/3) + Skip · instanced `questionCard` (state=selected, Q1 goal) · Continue CTA at bottom
    - [x] 04 · index-test — cancel × + "Test 2 of 3" · "Endurance hold" title · 260 × 260 `pacerRing` instance (progress=50) with "15.0 OF 30 SECONDS" timer inside · oversized 68 px Release CTA for held-muscle ergonomics
    - [x] 05 · generating — 260 × 260 `pacerRing` (progress=75) loading visual with 3-dot pulse inside · "Building your program" headline · 3-stage checklist (done / active / pending) reflecting scoreIndex → recommendLevel → buildProgram pipeline
    - [x] 06 · plan-preview — composite hero card (62 / 100 + Intermediate pill + adaptive context line) · Week 1 header (5 min · daily) · 4 day cards (M / T / W / T-rest) + "more days" hint · Start training CTA
    - [x] 07 · paywall — close × · 64 px Inset-H monogram · "Unlock Hone" + "One payment. Everything included." · 4 success-checked features · $4.79 one-time price card (accentSoft border) · Continue CTA · Restore / Terms / Privacy footer
    - [x] 08 · home — Today tab · `screenHeader` instance (kind=greeting) · pill streak chip via trailing slot · hero session card (kicker / title / 3-bullet exercise list / Start CTA with play glyph) · 2-up stat cards (This week, Latest index) · `tabBar` instance (active=today)
    - [x] 09 · program — Plan tab · `screenHeader` (kind=large-title, "Plan", back chev hidden) · 4 week sections (current / upcoming / 2 locked) · day cells with 5 states (done / today / rest / upcoming / locked) and completion chip per week · `tabBar` (active=plan)
    - [x] 10 · progress — Progress tab · `screenHeader` (kind=title, "Progress" + Retest pill) · Index card (composite 62 + Intermediate pill + +7 success delta + `indexTrendChart` instance state=full) · Streak card (12 days + `streakHeatmap` instance state=active + best=15) · `tabBar` (active=progress) — 4 library instances, 0 inlined visuals
    - [x] 11 · settings — Settings tab · `screenHeader` (kind=large-title, "Settings", back hidden) · 5 grouped lists (Account / Training / Subscription / About / destructive) · custom "Lifetime · Purchased Feb 14, 2026" row with success badge · `tabBar` (active=settings). Rows inlined at exact 358 px (vs listRow component's 360) — TODO: resize listRow primitive to 358 to unify
    - [x] 12 · index-retest — modal sheet from y=70 with scrim + dimmed bg hint · 24 px top corners · grabber + close × · "Retest your index" headline · 3 step cards (Reaction / Endurance / Rapid with time chips) · "Last test: 8 days ago" hint · I'm ready CTA · returns a new measurement that invalidates the `['index','history']` cache
    - [x] 13 · session/active — immersive mode (no tabBar) · cancel × + "Day 3 · Coordination" muted center · `phaseLabel` instance (hold) + 260 px `pacerRing` (progress=50) with 112 / 120 "3 SECONDS" timer inside · meta row SET 2/3 · REP 5/10 · TIME 2:14 · 72 px round Pause CTA + muted "End session" link
    - [x] 14 · session/complete — celebration · 96 px success-check badge with 120 px ring halo · "Nice work, Jamie" + day subhead · 3-up stats (DURATION 5:12 · REPS 30 · STREAK +1 in green) · `ratingPrompt` instance (value=0) · Done CTA
    - [x] 15 · session/stealth — Phase 3 preview · disguised ambient-player chrome · concentric-ring decoy art · generic track + show name · scrubber bar · prev / play-pause / next transport · output-device pill · small "STEALTH" pill in nav · "Tap and hold to exit Stealth" hint
    - [x] 16 · sign-up — back chev + "Get started" · 3 success-checked value props (personalised program / measured Index / Stealth Mode) · Apple / Google OAuth (relabeled "Sign up") · or divider · default email Input · Continue CTA · "Already have an account? Sign in" link
  - [ ] Screens page: 12 already-roadmapped Phase 2/3 screens mocked
  - [ ] Screens page: 14 competitor-gap screens mocked — 6 of 14 built (legal viewer, error state, HealthKit connect, restore-purchase, maintenance, voice picker); deferred: education, end-of-session review, coachmarks, onboarding bail-out, reverse-Kegel intro, challenge cycle, RPE slider, contextual rating prompt
    - [x] 17 · legal viewer — generic detail-header sub-page · "Last updated" line + 4 numbered sections (Acceptance · Account · Purchases · Medical disclaimer) · parameterised route serves Terms / Privacy / Licenses
    - [x] 18 · error state — detail-header "Couldn\'t load program" + `errorState` instance (kind=retry) + "Contact support" muted text · escalation pattern for data-load failures
    - [x] 19 · healthkit connect — close-X with Skip · 96 px heart glyph in surface card · "Connect to Apple Health" + 3 success-checked value props · Connect CTA + privacy note · iOS-only, deferred on Android until Phase 4
    - [x] 20 · restore purchase — 3 sub-states side-by-side: looking (3-dot accent loader on accentSoft disc) · restored (success badge + Continue) · not-found (?-glyph + Try different Apple ID + Contact support)
    - [x] 21 · maintenance — 120 px medal hero with halo · 8-week complete celebration · before/after stats (50 → 78 in green) · 3 next-up cards with the RECOMMENDED maintenance option getting an accent stroke
    - [x] 22 · voice picker — 4 voice cards (Calm = default selected · Firm · Whisper · Silent/haptics-only) · per-card play preview · accent stroke + check on selection · Stealth Mode pairing hint
    - [x] 23 · onboarding bail-out — resume screen for mid-funnel drop-offs · "Welcome back, Jamie" + 5-step vertical timeline (3 done success-green / 1 current accent / 1 upcoming muted) · connecting line acts as a progress bar · Resume primary CTA routes to first incomplete step + Start over (destructive-confirm)
    - [x] 24 · day detail — detail header "Day 3" · accent kicker + "Coordination" 30/38 + meta chips (5 min · 3 exercises · 30 reps) · 3-exercise list with accent-soft badges · Start session CTA
    - [x] 25 · exercise detail — detail header "Quick flicks" · 7-dot tempo visualisation card + "1s ON · 1s OFF" label + description · HOW IT WORKS 3 numbered steps · TIPS 3 bullets · Practice solo · 1 min CTA
    - [x] 26 · reminders — detail header · 3 grouped lists (Enabled toggle, Schedule with time + 7 day chips + cadence, Tone with sound + vibration) · accent-soft preview pill "Next reminder: Tomorrow at 8:30 AM"
    - [x] 27 · edit profile — custom nav (back / centred Profile / Save pill) · 96 px avatar with initials JP + pencil edit badge · 4 fields (Name focused, Email locked, Goal + Birthday value-chevrons) · muted Sign out
    - [x] 28 · check email — back chev · 96 px envelope tile with notification ping · "Check your email" + inline-bolded email address · Open Mail CTA · 30 s resend cooldown + Use different email link
    - [x] 29 · delete account — detail header · 72 px danger badge + halo + exclamation · WHAT\'S DELETED bullet card (4 danger × items) · purchase-preservation reassurance · type-to-confirm Input showing DELETE with danger stroke · 50/50 Cancel/Delete forever buttons
    - [x] 30 · session pause — bg hint of ring + dimmed HOLD phase label · 55 % scrim · 440 px sheet with grabber · PAUSED kicker + 64/72 elapsed 2:14 · 3-stat row (SET 2/3 · REP 5/10 · PHASE Hold) · oversized Resume CTA + muted End session link
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
