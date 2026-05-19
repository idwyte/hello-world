# Hone — Deployment Roadmap State

**Last updated:** 2026-05-19 (overnight build — Phase 2 shipped)
**Current stage:** Phase 2 — Habit-stacking · code complete on `claude/app-clone-with-usp-9qV0N`. Migration 0004, freeze logic, reminders screen, 3 native modules (app-intents, focus-filter, calendar-gaps), config plugin all built and tested. Awaiting code-review sign-off and a Mac-side `expo prebuild` / dev-client build for real-device QA.
**Next session pick-up (in order):**
1. **Review the overnight build** — read the 5 commits between `e5fefbc` and `HEAD` (b343075, 49866bf, 694e383, 50f90f0, 4ebddc4). Code-review findings from the autonomous run are captured in the commit at HEAD if any required follow-up; otherwise the build is ready for hardware verification.
2. **Outstanding Phase 1.5 housekeeping** — Photography prompt rework + Brand-book PDF export (deferred during the build; non-blocking for Phase 2 deployment but should close before App Store submission).
3. **Phase 3 — Stealth productized** — if Phase 3 was also kicked off in the same overnight run, look for additional commits beyond `4ebddc4`. Otherwise Phase 3 is the next code milestone (Live Activity, anonymous-first sign-in, biometric lock, alternate app icons).

**Figma file:** [Hone — Design System v1](https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/Hone-%E2%80%94-Design-System-v1)
**File key:** `qgY3Qcf7gP7w5V5A6uQTL4`
**Pages:** Foundations `0:1` · Brand `2:2` · Components `2:3` · Iconography `58:2` · Screens `2:4` · Photography `2:5`
**Foundations root frame:** `4:2` (1600×3837)

> This file is the source of truth for "where are we right now" in the Hone v1.1 → launch journey. The `@hone-coach` subagent reads it at the start of every invocation and writes it after each verified step. Read freely; let the coach write.

---

## Phase 1.5 tally · at a glance

| deliverable | status |
|---|---|
| Foundations — 21 colour tokens · 10 spacing · 6 radius · 4 motion · 10 text styles · 4 elevation effects | ✅ |
| Brand — Inset H monogram · wordmark · 8-card lockup set · 4 alternate app icons | ✅ |
| Iconography — A (Lucide-restyled) chosen; bespoke deferred to v1.1 polish | ✅ |
| Components — 7 originals mirrored from code (ProgressDots, PhaseLabel, PacerRing, IndexTrendChart, StreakHeatmap, QuestionCard, ErrorBoundary) | ✅ |
| Components — 12 new primitives + 2 nav primitives (tabBar, screenHeader) | ✅ |
| Screens — 16 main routes | ✅ |
| Screens — 14 of 14 competitor-gap screens built | ✅ |
| Screens — 7 v1-launch sub-pages built (24 – 30: Batch 1 of v1 sweep) | ✅ |
| Screens — 6 of 6 Batch 3 forward-looking screens (36 – 41) | ✅ |
| Brand-page alt icons refreshed to match the App icon picker (large + 80 px strip) | ✅ |
| Pricing locked in — `hone_lifetime` non-consumable at **$8.99** | ✅ |
| Photography page — mission · 12-tile mood board · 4 rules · 4 do/don\'t pairs · 4 Midjourney prompts · handoff card | ✅ |
| Brand book PDF export | ⬜ |

**By the numbers:** **6 Figma pages** · 22 components / ~80 variants · 41 screens mocked · 12 icons drawn · 30 photography slots specified for asset production · only **1 deliverable** (Brand-book PDF) remains for Phase 1.5 completion.

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
    - [x] 07 · paywall — close × · 64 px Inset-H monogram · "Unlock Hone" + "One payment. Everything included." · 4 success-checked features · $8.99 one-time price card (accentSoft border) · Continue CTA · Restore / Terms / Privacy footer
    - [x] 08 · home — Today tab · `screenHeader` instance (kind=greeting) · pill streak chip via trailing slot · hero session card (kicker / title / 3-bullet exercise list / Start CTA with play glyph) · 2-up stat cards (This week, Latest index) · `tabBar` instance (active=today)
    - [x] 09 · program — Plan tab · `screenHeader` (kind=large-title, "Plan", back chev hidden) · 4 week sections (current / upcoming / 2 locked) · day cells with 5 states (done / today / rest / upcoming / locked) and completion chip per week · `tabBar` (active=plan)
    - [x] 10 · progress — Progress tab · `screenHeader` (kind=title, "Progress" + Retest pill) · Index card (composite 62 + Intermediate pill + +7 success delta + `indexTrendChart` instance state=full) · Streak card (12 days + `streakHeatmap` instance state=active + best=15) · `tabBar` (active=progress) — 4 library instances, 0 inlined visuals
    - [x] 11 · settings — Settings tab · `screenHeader` (kind=large-title, "Settings", back hidden) · 5 grouped lists (Account / Training / Subscription / About / destructive) · custom "Lifetime · Purchased Feb 14, 2026" row with success badge · `tabBar` (active=settings). Rows inlined at exact 358 px (vs listRow component's 360) — TODO: resize listRow primitive to 358 to unify
    - [x] 12 · index-retest — modal sheet from y=70 with scrim + dimmed bg hint · 24 px top corners · grabber + close × · "Retest your index" headline · 3 step cards (Reaction / Endurance / Rapid with time chips) · "Last test: 8 days ago" hint · I'm ready CTA · returns a new measurement that invalidates the `['index','history']` cache
    - [x] 13 · session/active — immersive mode (no tabBar) · cancel × + "Day 3 · Coordination" muted center · `phaseLabel` instance (hold) + 260 px `pacerRing` (progress=50) with 112 / 120 "3 SECONDS" timer inside · meta row SET 2/3 · REP 5/10 · TIME 2:14 · 72 px round Pause CTA + muted "End session" link
    - [x] 14 · session/complete — celebration · 96 px success-check badge with 120 px ring halo · "Nice work, Jamie" + day subhead · 3-up stats (DURATION 5:12 · REPS 30 · STREAK +1 in green) · `ratingPrompt` instance (value=0) · Done CTA
    - [x] 15 · session/stealth — Phase 3 preview · disguised ambient-player chrome · concentric-ring decoy art · generic track + show name · scrubber bar · prev / play-pause / next transport · output-device pill · small "STEALTH" pill in nav · "Tap and hold to exit Stealth" hint
    - [x] 16 · sign-up — back chev + "Get started" · 3 success-checked value props (personalised program / measured Index / Stealth Mode) · Apple / Google OAuth (relabeled "Sign up") · or divider · default email Input · Continue CTA · "Already have an account? Sign in" link
  - [x] Screens page: 14 competitor-gap screens — **14 of 14 built**
    - [x] 17 · legal viewer — generic detail-header sub-page · "Last updated" line + 4 numbered sections (Acceptance · Account · Purchases · Medical disclaimer) · parameterised route serves Terms / Privacy / Licenses
    - [x] 18 · error state — detail-header "Couldn\'t load program" + `errorState` instance (kind=retry) + "Contact support" muted text · escalation pattern for data-load failures
    - [x] 19 · healthkit connect — close-X with Skip · 96 px heart glyph in surface card · "Connect to Apple Health" + 3 success-checked value props · Connect CTA + privacy note · iOS-only, deferred on Android until Phase 4
    - [x] 20 · restore purchase — 3 sub-states side-by-side: looking (3-dot accent loader on accentSoft disc) · restored (success badge + Continue) · not-found (?-glyph + Try different Apple ID + Contact support)
    - [x] 21 · maintenance — 120 px medal hero with halo · 8-week complete celebration · before/after stats (50 → 78 in green) · 3 next-up cards with the RECOMMENDED maintenance option getting an accent stroke
    - [x] 22 · voice picker — 4 voice cards (Calm = default selected · Firm · Whisper · Silent/haptics-only) · per-card play preview · accent stroke + check on selection · Stealth Mode pairing hint
    - [x] 23 · onboarding bail-out — resume screen for mid-funnel drop-offs · "Welcome back, Jamie" + 5-step vertical timeline (3 done success-green / 1 current accent / 1 upcoming muted) · connecting line acts as a progress bar · Resume primary CTA routes to first incomplete step + Start over (destructive-confirm)
    - [x] 31 · session review — detail header "Day 3 review" · success-green completion kicker + summary banner with meta pills · PER EXERCISE list with checked badges and per-set status dots · accent-soft retest nudge card · Back to today CTA + muted Repeat session secondary
    - [x] 32 · reverse-Kegel intro — detail header "New exercise" · hero card with NEW IN YOUR PROGRAM accent kicker + Reverse Kegel title + inverse 7-dot tempo + RELEASE · EXPAND label · WHY IT MATTERS body · HOW TO DO IT 3 steps (warning folded into step 3) · I get it · let\'s try CTA
    - [x] 33 · education — detail header "Pelvic floor 101" · accent kicker "EDUCATION · 3 MIN READ" + 26 / 32 article title · 2 article sections with 17 / 24 heading + 14 / 22 body · accent-soft "1 in 4" key-fact callout between them · Got it · keep training CTA · parameterised shell for the whole education catalog
    - [x] 34 · RPE slider — faint success halo + 55 % scrim + 460 px sheet · EFFORT CHECK accent kicker · "How hard was that?" + 96 / 104 big "7" with "/10" suffix · 326 px discrete slider at 70 % with 10 ticks · Easy / All-out anchor labels · Submit + Skip CTAs
    - [x] 35 · coachmark overlay — home-screen context behind · 75 % scrim drawn as 4 surrounding rectangles cutting a spotlight around the streak chip · 2 px accent ring on the target · tooltip card with up-pointing pointer aligned to chip centre · 3-dot step indicator (current widened to 20 × 6 pill) + Skip tour link · in-card accent Next CTA
  - [x] Screens page: 7 v1-launch sub-pages (Batch 1 of v1-launch screen sweep — referenced by the 16 main routes but not yet mocked at the time)
    - [x] 24 · day detail — detail header "Day 3" · accent kicker + "Coordination" 30/38 + meta chips (5 min · 3 exercises · 30 reps) · 3-exercise list with accent-soft badges · Start session CTA
    - [x] 25 · exercise detail — detail header "Quick flicks" · 7-dot tempo visualisation card + "1s ON · 1s OFF" label + description · HOW IT WORKS 3 numbered steps · TIPS 3 bullets · Practice solo · 1 min CTA
    - [x] 26 · reminders — detail header · 3 grouped lists (Enabled toggle, Schedule with time + 7 day chips + cadence, Tone with sound + vibration) · accent-soft preview pill "Next reminder: Tomorrow at 8:30 AM"
    - [x] 27 · edit profile — custom nav (back / centred Profile / Save pill) · 96 px avatar with initials JP + pencil edit badge · 4 fields (Name focused, Email locked, Goal + Birthday value-chevrons) · muted Sign out
    - [x] 28 · check email — back chev · 96 px envelope tile with notification ping · "Check your email" + inline-bolded email address · Open Mail CTA · 30 s resend cooldown + Use different email link
    - [x] 29 · delete account — detail header · 72 px danger badge + halo + exclamation · WHAT\'S DELETED bullet card (4 danger × items) · purchase-preservation reassurance · type-to-confirm Input showing DELETE with danger stroke · 50/50 Cancel/Delete forever buttons
    - [x] 30 · session pause — bg hint of ring + dimmed HOLD phase label · 55 % scrim · 440 px sheet with grabber · PAUSED kicker + 64/72 elapsed 2:14 · 3-stat row (SET 2/3 · REP 5/10 · PHASE Hold) · oversized Resume CTA + muted End session link
  - [x] Screens page: 6 of 6 Batch 3 forward-looking screens built
    - [x] 36 · reminder time wheel — dimmed reminders row hint, 55 % scrim, 472 px sheet, Cancel / Reminder time / Done iOS row, instanced `timePicker.state=open` wheel, 4 quick-preset chips (7 AM · 8:30 AM selected · Noon · Evening)
    - [x] 37 · streak-freeze — 540 px sheet with 72 px accent-soft pause-icon badge, 22 / 30 title + 14 / 20 muted subtitle, 2-up stat cards (FREEZES LEFT 2 of 3 accent · CURRENT STREAK 12 days), missed-day row with surface2 day badge, Use freeze accent CTA + Maybe later (all content normalised to 322 × x=34 inside the sheet)
    - [x] 38 · anonymous sign-up — back chev · 96 px surface2 hero with masked-silhouette glyph · "Train without an account" title · 3 success-checked explainer rows · trade-off info card · Start training accent CTA + accent "I\'ll sign up instead" text link
    - [x] 39 · biometric lock — centred hero: 48 px Inset-H monogram + 120 px Face-ID glyph (4 accent corner brackets + muted eyes + smile curve) · "Hone is locked" + tap hint · "Use passcode" accent text + muted Sign out near the bottom
    - [x] 40 · app icon picker — detail header · 2 × 2 grid of 4 alternate icons (Default H selected with check badge · Focus ring · Posture figure · Health heart) · accent-soft iOS-notification info card · Apply CTA · Brand-page alt icons refreshed to match
    - [x] 41 · Live Activity widget — lock-screen mockup (Dynamic Island pill + "9:41" big time) with full-width 360 × 116 Live Activity banner (Inset-H + Hone / Hold · 3 s / Set 2 of 3 · Rep 5 of 10 + 52 px mini-ring at 42 %) plus Dynamic Island MINIMAL / COMPACT / EXPANDED variants at Apple-documented sizes
  - [x] Photography page structure — header + 4-sentence mission · 12-tile hybrid mood board (60 % abstract, 40 % lifestyle, captioned placeholders) · 4 numbered composition rules (rule body copy constrained to 300 px so it wraps to 3 lines) · 4 Do/Don\'t split-pair cards · 4 Midjourney prompt templates (Hero portrait · Lifestyle context · Abstract cover art · Discreet environment) with `--ar` + `--style raw` flags, prompt boxes 1392 wide and text wrapping at 1360 in JetBrains Mono Regular · handoff card spec\'ing ~30 base images in 5 categories
  - [ ] Photography prompt rework — "Lifestyle context" reads plain; candidate replacements drafted (see session-close notes); may add a "social" slot bringing prompt count 4 → 5
  - [ ] Brand book frame in the Brand page exported as PDF
- [x] **Phase 2 — Habit-stacking** *(code complete; pending real-device QA on Mac)*
  - [x] Migration `0004_streak_freezes.sql` written (freezes 0–2, last_freeze_earned_at, recompute_streak rewrite for +2 gap bridge / +7 day earn)
  - [ ] Migration 0004 applied to staging Supabase (blocked on D1 service configuration)
  - [x] `modules/app-intents/` Swift impl + 4 AppIntent types (StartSessionIntent, Start3MinDiscreetIntent, MarkTodayCompleteIntent, ShowStreakIntent) + AppShortcutsProvider + PrivacyInfo.xcprivacy (CA92.1)
  - [x] `modules/focus-filter/` Swift INFocusStatusCenter wrapper + JS subscribe handle
  - [x] `modules/calendar-gaps/` EventKit free-time detector with iOS 17 fullAccess support
  - [x] `plugins/withAppIntents.ts` config plugin adds NSUserActivityTypes (additive), NSFocusStatusUsageDescription, NSCalendarsUsageDescription; wired into app.config.ts
  - [x] `lib/streak.ts` client-side freeze logic + `stores/session.ts` delegates
  - [x] `app/(app)/settings/reminders.tsx` toggle + 4 time presets + permission/error surface
  - [x] `app/(app)/settings/index.tsx` Reminders row + live hint formatter
  - [x] `lib/notifications.ts` scheduleDailyReminder(hhmm) + cancelDailyReminder() with calendar trigger
  - [x] `lib/exercises.ts` quick_discreet preset + QUICK_DISCREET_PRESET ProgramDay
  - [x] `app/(app)/session/today.tsx` ?preset=quick_discreet deep-link + Focus-mode auto-promote of the Stealth card
  - [x] `lib/intents.ts`, `lib/focus.ts`, `lib/calendar-gaps.ts` lazy-load wrappers mirroring `lib/haptics/native.ts`
  - [x] `app/_layout.tsx` registers AppIntents on cold start (web/Expo Go safe)
  - [x] `stores/settings.ts` extended with reminderEnabled, reminderTime, biometricLocked, appIconVariant (additive — no STORAGE_KEY bump)
  - [x] `lib/sessions.ts:fetchStreak` surfaces freezes + lastFreezeEarnedAt
  - [x] 64/64 jest tests passing (+12 new: 7 freeze cases in streak.test.ts, 5 in notifications.test.ts)
  - [x] typecheck + lint clean
  - [x] `.gitignore` fix: scoped `/ios/` `/android/` to root so module-local native sources are tracked (was a pre-existing blocker — stealth-haptics ios/android were also untracked)
  - [ ] Acceptance criteria 1: Siri "Hone quick discreet" launches a 3-min stealth session from a locked phone (real-device test on Mac)
  - [ ] Acceptance criteria 2: 19:00 reminder fires next day with brand-neutral text (real-device test on Mac)
  - [ ] Acceptance criteria 3: 7 days clean → freezes=1; skip day 8 → streak preserved; skip day 9 → resets (Supabase staging test)
  - [ ] Acceptance criteria 4: iOS Focus mode auto-promotes Stealth card (real-device test on Mac)
  - [ ] Acceptance criteria 5: Calendar permission granted → findNextGap returns a real interval (real-device test on Mac)
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
  - [ ] RevenueCat: project, `hone_lifetime` non-consumable at $8.99 created in App Store Connect + Play, entitlement `pro` attached, offering `default` configured
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

- Photography page — "Lifestyle context" Midjourney prompt currently reads plain. Needs swap (see session-close notes); rest of the page is solid.
- ListRow primitive width — rows on the Settings screen were inlined at 358 px while the `listRow` component is 360 px. Either shrink the primitive to 358 or accept the inline pattern in grouped lists. Tracked for the post-Phase-3 design-system handoff sweep.

---

## Blockers

_External dependencies not yet resolved — added by `@hone-coach` when prerequisite credentials, services, or assets are missing._

(empty)

---

## Notes

- Plan source of truth: `/root/.claude/plans/i-want-to-build-stateless-turtle.md`
- Project context: `/home/user/hello-world/CLAUDE.md`
- Phase 1.5 deliverable: a single Figma file with 6 pages (Foundations, Brand, Iconography, Components, Screens, Photography). No code changes in this phase.
- Monetization: one-off purchase $8.99 (`hone_lifetime` non-consumable). No subscriptions, no trial.

---

## Session-close notes · 2026-05-18

**What shipped today**
- Photography page final polish: rule-card body copy reflowed to 3 lines at 300 px (was overflowing on a single 700 px line); Midjourney prompt boxes resized to 1392 wide with text wrapping at 1360 in JetBrains Mono Regular (were stuck at 52 px wide with text overflowing to 2581).
- Phase 1.5 closed all the way out except the Photography prompt rework and the Brand-book PDF export.

**Where we stopped**
- The current "Lifestyle context" prompt on the Photography page reads plain. We riffed on two replacement angles — social (café, dinner, walk-with-friend) and active (chopping wood, morning mobility, dawn run) — then locked back to the page's own rules to filter. Final candidates below.
- No prompt swap was committed; the page is in its shipped state, the rework happens tomorrow.

**Tomorrow — first move**
1. Pick one or two candidate prompts from the list below.
2. Open the Photography page (file key `qgY3Qcf7gP7w5V5A6uQTL4`, page id `2:5`) and swap the chosen prompt(s) into the "Lifestyle context" slot via `use_figma`. If adding a fifth prompt, extend the prompt-templates frame to add a "Social context" or "Active context" slot before the handoff card.
3. Then build the Brand-book PDF export frame on the Brand page (consolidates mark / wordmark / lockups / alt icons / colour tokens / type spec / motion + photography rules into a 1–2 page exportable frame).
4. Phase 1.5 ships → move to Phase 2 (code: Habit-stacking).

### Candidate prompts (drafted, not yet committed)

All pass the page's rules: side lighting only · anonymous framing · muted everyday clothing (wool, dark cotton, knitwear — no athletic gear) · calm domestic spaces · lived-in not staged.

**Active angle (recommended primary: C — chopping wood):**

A. *Pre-dawn forest run* — `documentary photograph of a figure mid-stride on a misty forest path at dawn, shot from behind, breath visible in cold air, dark merino base layer and dark wool beanie (no visible logos, no athletic branding), low golden side-light filtering through trees from camera left, deep shadows, anonymous framing, cinematic film still, --ar 4:5 --style raw`

B. *Cold-water swim emerge* — `photograph of a man emerging from a cold open-water swim at dawn, wet shoulders catching low side-light from a single horizon, dark muted swim trunks (no logos), deep navy water, anonymous framing with face turned away and eyes in shadow, lived-in towel draped on a rock nearby, cinematic film still, --ar 4:5 --style raw`

C. *Chopping wood outside a cabin* — `photograph of a man chopping wood outside a cabin at dawn, shot from behind and to the side, dark wool jumper with rolled sleeves, hands visible on an axe handle, low golden side-light from the horizon camera-right, breath visible in cold air, deep shadows, lived-in worn boots, no logos, no text, --ar 4:5 --style raw`

D. *Cycle commute, dusk* — `documentary photograph of a man riding a steel-framed city bicycle along an empty cobbled street at dusk, shot from behind, dark wool overcoat and trousers (no athletic gear), single shop window providing warm side light to one side, deep shadows, anonymous framing, lived-in canvas pannier bag, no logos, --ar 4:5 --style raw`

E. *Empty hotel pool, single lap* — `overhead photograph of a man swimming a single lap in an empty hotel pool at dawn, single tall window casting warm side light across the water, deep shadows below the surface, anonymous framing with head down, no athletic branding, calm composition, lived-in towel folded on a chair at the pool edge, no logos, --ar 4:5 --style raw`

F. *Morning mobility by a window* — `photograph of a man performing a slow morning stretch in a dim bedroom at dawn, shot from behind, single tall window providing soft side light from camera left, deep shadows on the opposite wall, dark wool sleep shirt and loose dark cotton trousers, anonymous framing with head bowed, lived-in unmade bed in soft focus, no logos, --ar 4:5 --style raw`

**Social angle (recommended primary: A — café):**

A. *Café table with a friend* — `photograph of two men in dark wool sweaters at a wooden café table by a tall window, hands cradling mugs, anonymous framing with faces cut at the chin and eyes in shadow, warm side light from the window camera-left, deep shadows, wrinkled newspaper and a half-finished pastry on the table, shallow depth of field, no logos, no text, --ar 4:5 --style raw`

B. *Long-table dinner, candlelight* — `overhead photograph of a long wooden dinner table at night, multiple hands reaching for wine glasses and shared plates, single side-positioned candle as the only light source, deep shadows falling across the table, neutral dark knitwear at the frame edges, wrinkled linen napkins, lived-in, no faces, no logos, --ar 4:5 --style raw`

C. *Friends walking, back of shot* — `documentary-style photograph of two figures in dark wool coats walking down a quiet cobbled street at dusk, shot from behind, hands in pockets, soft side light from a shop window glowing warmly to one side, deep shadows, lived-in worn shoes, no faces, no logos, --ar 4:5 --style raw`

D. *Vinyl listen at home* — `photograph of two men sitting in a dim living room listening to a vinyl record, both shot from behind in mismatched armchairs, single warm lamp as the side light source, dark wool jumpers, low warm light pooling on the rug, a half-finished glass of wine on a side table, lived-in not staged, no faces, no logos, --ar 4:5 --style raw`

E. *Reading nook with a friend* — `photograph of two men reading at opposite ends of a worn linen sofa, single window providing side light from camera left, deep shadows, dark muted knitwear, books open across laps, hands visible, faces cut by framing, lived-in cushions, no logos, no text, --ar 4:5 --style raw`

F. *Sunday kitchen, cooking together* — `photograph of two men cooking together in a quiet kitchen at dawn, side light from a small window, hands working with vegetables on a wooden board, anonymous framing cut at the shoulders, muted dark linen aprons over wool jumpers, steam rising from a pot, lived-in, no logos, no text, --ar 4:5 --style raw`

**Suggested final composition:** keep Hero portrait + Abstract cover art + Discreet environment as-is, replace plain Lifestyle with **C — chopping wood** (active, rule-perfect, masculine-ritual), and optionally add **Social A — café** as a fifth slot so the mood board covers solo public · solo private · solo active · two-together private without overlap.
