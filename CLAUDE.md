# Hone — Pelvic Floor Training App

**Status:** v1.1 Phase 1 (Pelvic Floor Index) shipped  
**Branch:** `claude/app-clone-with-usp-9qV0N`  
**Last updated:** 2026-05-17

---

## Project Overview

**Hone** is a React Native + Expo pelvic floor training app that guides users through 8-week personalized programs, with real-time biofeedback and a measured weekly retest system.

**Stack:**
- React Native + Expo (iOS/Android/web)
- Supabase (PostgreSQL, auth, RLS)
- TypeScript, Zustand (state), React Query (async)
- Jest (unit tests), ESLint (lint), TailwindCSS (via NativeWind)

**USP:** Pelvic Floor Index (measured, 3-test composite) replaces survey-derived assessments. Weekly retests feed adaptive program generation and visible trend tracking.

---

## Architecture

### Core Modules

| File | Purpose |
|------|---------|
| `lib/pelvic-floor-index.ts` | `scoreIndex(input) → composite (0–100)` + `levelFromComposite(c) → Level` |
| `lib/program.ts` | `recommendLevel(index)`, `buildProgram(level, dailyMinutes, goal, indexHistory)` with retest-adaptive bias |
| `lib/assessment-questions.ts` | 3-question quiz (goal, dailyMinutes, trainingEnvironment) |
| `lib/persistence.ts` | `saveAssessmentAndProgram()`, `saveIndexRetest()`, `markOnboarded()` |
| `lib/sessions.ts` | `fetchIndexHistory()`, `fetchStreak()`, `logCompletedSession()` |
| `stores/onboarding.ts` | Zustand store: `draft` (answers), `index` (PelvicFloorIndex), `generated` (Level+Program) |
| `app/(onboarding)/index-test.tsx` | 3-stage measurement screen (reaction tap, endurance hold, rapid-rep) |
| `app/(app)/index-retest.tsx` | Weekly retest entry from progress tab |
| `components/charts/IndexTrendChart.tsx` | SVG sparkline: composite + level, up to 12 measurements |

### Data Flow

```
Onboarding:
  welcome → assessment (3 Qs) → index-test (measure) → generating → plan-preview → (app)

Weekly Retest:
  progress tab (Retest button) → index-retest → invalidate cache → update IndexTrendChart

Program Generation:
  Index composite → recommendLevel() → buildProgram(level, mins, goal, [prior indices])
    ↓ (retest-adaptive bias: >10pt swing → reorder exercises or downshift level)
  ProgramDay[] → persist to Supabase
```

### Database Schema

**New table (0003_pelvic_floor_index.sql):**
```sql
pelvic_floor_assessments (
  id, user_id, reaction_ms, endurance_s, rapid_reps_10s,
  composite, level, created_at
)
```

Existing tables (assessments, programs, program_days, sessions, streaks) unchanged.

---

## Phase 1: Pelvic Floor Index (✅ shipped)

### What Changed

**Before:** 10-question survey → estimated level → static 8-week program  
**Now:** 3 measured tests → composite score → adaptive program + weekly trend

### Why

- **Accuracy:** Real data (reaction ms, endurance s, reps) beats self-report (age band, prior experience, etc.)
- **Engagement:** Weekly retests show progress; trend charts motivate continuation
- **Adaptation:** Program can adjust based on real performance trajectory, not guess
- **Privacy:** Slim the onboarding to 3 preference questions only

### The Index (lib/pelvic-floor-index.ts)

**Inputs:**
- `reactionMs` — average of 5 tap-to-cue deltas (best 250ms, worst 1200ms)
- `enduranceS` — single hold duration, capped at 30s (best 30s, worst 2s)
- `rapidReps10s` — 10s tap counter (best 18, worst 4)

**Scoring:**
```
norm_reaction = (reaction_best_ms - reaction) / (best - worst)  // inverted: fast is good
norm_endurance = (endurance - worst) / (best - worst)
norm_rapid     = (rapid_reps - worst) / (best - worst)

composite = (0.35 * norm_r + 0.40 * norm_e + 0.25 * norm_p) * 100
level = composite < 40 ? 'beginner' : < 70 ? 'intermediate' : 'advanced'
```

**Weights:** 35% reaction, 40% endurance, 25% rapid-reps (endurance prioritized per Bø & Sherburn 2005)

### Onboarding Flow (Phase 1)

1. **assessment.tsx** — 3 Qs (goal, dailyMinutes, trainingEnvironment) in ~3 slides
2. **index-test.tsx** — measure (intro + 3 tests) in ~2 min
   - Reaction: 5 cues, measure tap-to-green time
   - Endurance: press & hold, release when tired, cap at 30s
   - Rapid: 10s countdown, tap counter
3. **generating.tsx** — `scoreIndex()` → `recommendLevel()` → `buildProgram()` → persist → navigate
4. **plan-preview.tsx** — show week 1, cta to app

### Program Adaptation (lib/program.ts)

`buildProgram(level, dailyMinutes, goal, indexHistory = [])`

**Trend bias:**
- If latest composite > prior by >10pts: reorder exercise pool to front-load endurance work
- If latest composite < prior by >10pts: downshift level (advanced → intermediate) to prevent plateau

Example:
```js
// User was intermediate (composite 50), retested at 65 (+15)
const program = buildProgram('intermediate', 5, 'general', [{composite:50}, {composite:65}])
// Result: long_holds + endurance_ladder front the pool
```

### Testing (52/52 jest passing)

**New test suite: `__tests__/pelvic-floor-index.test.ts`**
- Composite range (0–100) and clamping
- Monotonicity (faster reaction ≥ same composite, never worse)
- Level boundaries (40, 70)
- Determinism across 100 random samples

**Updated suites:**
- `program.test.ts` — `recommendLevel(index)` + `buildProgram()` with history bias
- `persistence.test.ts` — `saveAssessmentAndProgram(answers, index, level, program)` + `saveIndexRetest(index)`

**Deleted:**
- `__tests__/assessment-questions.test.ts` — 10-question survey is gone

---

## Phase 2: Habit-Stacking (Planned)

**Goal:** Convert one-time users to recurring (daily streak + habit bundling)

**UX/UI work:**
- Reminder time picker (settings)
- Streak-freeze button + visual (when you miss a day)
- Native permission prompts (iOS)

**Backend work:**
- iOS App Intents (background notifications)
- Streak-freeze logic (let users pause without losing streak)
- Notification scheduling service

**Files affected:**
- `app/(app)/settings.tsx` — reminder picker, freeze button
- `lib/notifications.ts` — new, handle native scheduling
- `supabase/migrations/0004_streak_freeze.sql` — new table or profiles.freeze_until column

---

## Phase 3: Stealth Productized (Planned)

**Goal:** Make Stealth Mode premium, add anonymous sign-up, Live Activity lock-screen widget

**UX/UI work:**
- Live Activity widget (lock screen visualization)
- App icon picker (settings, swap between stock iOS icons)
- Anonymous sign-up flow (tap email later)

**Backend work:**
- Anonymous auth (anonymous_id in profiles, link to email later)
- Live Activity state updates (from session service)

**Files affected:**
- `app/(app)/settings.tsx` — icon picker UI
- `app/(onboarding)/welcome.tsx` — "Continue as guest" option
- iOS native code (Expo plugin for Live Activity)

---

## File Structure Notes

### Onboarding (`app/(onboarding)/`)
- `welcome.tsx` — splash, auth/guest entry
- `assessment.tsx` — 3-question quiz
- `index-test.tsx` — measurement runner (self-contained, no navigation until done)
- `generating.tsx` — compute level + program, persist, navigate
- `plan-preview.tsx` — show week 1 exercises, paywall, "Start training"
- `paywall.tsx` — RevenueCat integration for Stealth premium

### App (`app/(app)/`)
- `home.tsx` — "Today" tab: today's exercises + live session
- `program.tsx` — "Plan" tab: calendar of days, click to preview
- `progress.tsx` — "Progress" tab: streak cards + heatmap + **IndexTrendChart + Retest button**
- `settings.tsx` — "Settings" tab: reminders, Stealth toggle, premium, sign-out
- `index-retest.tsx` — hidden tab (routed via deep link from progress), retest modal

### Components
- `components/assessment/` — ProgressDots, QuestionCard (for quiz)
- `components/charts/` — StreakHeatmap, **IndexTrendChart**
- `components/session/` — exercise UI, phase runner

### Lib
- `types.ts` — Level, Goal, Phase, SessionMode, AssessmentAnswers (3 fields)
- `assessment-questions.ts` — QUESTIONS array + isAssessmentComplete()
- **`pelvic-floor-index.ts`** — scoreIndex, levelFromComposite, weights/bands
- `program.ts` — recommendLevel, buildProgram, pickExercisesFor, applyTrendBias
- `persistence.ts` — saveAssessmentAndProgram, saveIndexRetest, markOnboarded
- `sessions.ts` — **fetchIndexHistory**, fetchStreak, fetchRecentSessions, logCompletedSession
- `exercises.ts` — exercise catalog (short_holds, long_holds, quick_flicks, etc.)
- `session-engine.ts` — buildTimeline, createSessionRunner (phase sequencing)
- `env.ts` — hasSupabaseConfig, env var checks
- `supabase.ts` — getSupabase() singleton

### Tests
```
__tests__/
  pelvic-floor-index.test.ts    # 15 tests: composite, levels, monotonicity, clamping
  program.test.ts                # 11 tests: recommendLevel, buildProgram, trend bias
  persistence.test.ts            # 6 tests: save flow, index retest, onboarded flag
  sessions.test.ts               # (existing)
  session-engine.test.ts         # (existing)
  streak.test.ts                 # (existing)
  revenuecat.test.ts             # (existing)
```

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **3-question quiz** | Index measures what survey estimated. Fewer fields = faster onboarding, simpler schema. |
| **Weighted composite** | 40% endurance (strength marker), 35% reaction (control), 25% reps (stamina) based on literature. |
| **Retest-adaptive bias** | >10pt swing triggers exercise reordering or level shift. Prevents plateau, honors improvement. |
| **SVG sparkline** | react-native-svg avoids canvas, keeps bundle small, preserves native look. |
| **IndexTrendChart on /progress** | Trend is the primary engagement driver. Weekly retest → visible progress → habit formation. |
| **No Phase kind** | Measurement tests are standalone (no `'measure'` PhaseKind). Simpler than extending session-engine. |
| **Persist raw inputs** | Store reaction_ms, endurance_s, rapid_reps_10s verbatim; recompute composite on retrieval if weights change. |

---

## Running the App

```bash
# Install
npm install

# Dev server (pick platform)
npm start                    # prompt
npm run ios
npm run android
npm run web

# Testing
npm test                     # jest (52/52 passing)
npm run test:watch
npm run typecheck            # tsc --noEmit
npm run lint                 # eslint

# One-time setup (Supabase migrations)
# Apply 0001, 0002, 0003 in order to a Supabase project
# Set env vars (see lib/env.ts for required keys)
```

---

## What's Next

### Immediate (Phase 2)
- [ ] Habit-stacking: reminders + streak freeze (Q2 2026)
- [ ] Telemetry: capture Index measurements at scale, refine norm bands

### Mid-term (Phase 3)
- [ ] Stealth premium: Live Activity + icon picker (Q3 2026)
- [ ] Anonymous auth + email linking (Q3 2026)

### Longer-term
- [ ] Seasonal programs (postpartum, peri-menopausal, etc.)
- [ ] Family sharing (sync between devices)
- [ ] Coach onboarding (professional pelvic-floor PT mode)

---

## Context for Claude

**When working on this codebase:**
1. All tests must pass (`npm test` → 52/52)
2. TypeScript must emit cleanly (`npm run typecheck`)
3. ESLint must pass zero-warning (`npm run lint`)
4. New features on `claude/app-clone-with-usp-9qV0N` branch; commit with `https://claude.ai/code/session_...` footer
5. If modifying `lib/pelvic-floor-index.ts`, update norm bands based on telemetry; always maintain monotonicity in scoring
6. If touching onboarding flow, test end-to-end: assessment → index-test → generating → plan-preview
7. For retest/trend features, invalidate `['index', 'history']` React Query cache after persist
8. Schema changes go in `supabase/migrations/NNNN_*.sql` with RLS policies

**Quick reference:**
- Index composite formula: `(0.35*reaction_norm + 0.40*endurance_norm + 0.25*rapid_norm) * 100`
- Level thresholds: <40 beginner, <70 intermediate, ≥70 advanced
- Retest bias trigger: ±10pt composite swing
- Quiz: 3 fields only (goal, dailyMinutes, trainingEnvironment)
- Progress tab: streak cards + heatmap + IndexTrendChart + retest button
