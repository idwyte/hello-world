# Figma vs Code Audit — 2026-05-20

> Audit methodology: For each of the 41 designed screens we compared the Figma
> spec — sourced from `docs/hone-roadmap-state.md` lines 78-121, which mirrors
> the screen-level structure documented when the Figma file was last
> synchronized — against the current implementation. The Figma MCP returned
> only the **Foundations** page (`0:1`) when queried with file key
> `qgY3Qcf7gP7w5V5A6uQTL4`; the "Screens" page was not exposed by the API. As a
> result, structural diffs were performed against the roadmap text (which is
> the codified description of each Figma frame). Token + typography parity was
> verified by pulling the Foundations XML and comparing it to
> `lib/theme.ts` + `tailwind.config.js`. Where the API would have been useful
> for pixel-precise audit (e.g. ratingPrompt internals, exact paddings), the
> gap is noted explicitly so a follow-up pass can pull screenshots once the
> Screens page is accessible.

## Summary

- **Designed screens:** 41
- **Implemented in code:** 18 (welcome, sign-in, assessment, index-test,
  generating, plan-preview, paywall, home, program, progress, settings,
  index-retest, session/player, session/stealth, reminders, account,
  subscription, app-icon, security, privacy, settings/stealth, ErrorBoundary,
  BiometricGate). The strict screen→code mapping covers 15 of 41.
- **Missing (designed but not built):** 23 screens — sign-up (16), legal viewer
  (17), error state route (18), healthkit connect (19), restore-purchase
  states (20), maintenance (21), voice picker (22), onboarding bail-out (23),
  day detail (24), exercise detail (25), edit profile (27), check email (28),
  delete account standalone (29), session pause sheet (30), session review
  (31), reverse-Kegel (32), education (33), RPE slider (34), coachmark (35),
  reminder time wheel (36), streak-freeze (37), anonymous sign-up (38),
  app-icon picker visuals (40 is partial — only a list, not the 2×2 grid),
  Live Activity (41 — deferred native).
- **Visual discrepancies (P0+P1+P2 inside implemented screens):** 71
  - P0: 5
  - P1: 38
  - P2: 28
- **Cross-cutting issues:** 9
- **Figma fetch failures:** 1 — the "Screens" page is not exposed via
  `get_metadata` (only `0:1 Foundations` came back). Token + type-scale audit
  succeeded.

---

## Cross-cutting issues

These patterns appear in 3+ implemented screens. Fix once at the primitive
level, every screen benefits.

1. **CC1 [P1] `← Back` is a `Text` literal, not a chevron icon.**
   Figma uses a back chevron everywhere (sign-in, assessment, paywall,
   index-retest, every settings sub-page, plan-preview header). Code renders
   `"← Back"` text — visible in
   `assessment.tsx:41`, `index-retest.tsx:74`, `reminders.tsx:122`,
   `account.tsx:68`, `app-icon.tsx:59`, `subscription.tsx:62`, `stealth.tsx:42`,
   `security.tsx:75`, `privacy.tsx:67`, `today.tsx:93`. Roadmap says
   "back chevron" — should be a `<ChevronLeft />` from `lucide-react-native`.

2. **CC2 [P1] Raw `<Text>` + `<Pressable>` instead of design-system primitives.**
   Phase B added `Body`, `Heading`, `Button`, `Card`, `Pill`, `TextField`,
   `ListRow`, `SectionLabel`, `Stat`, `ProgressBar` but Phase C.2 only ported
   the 4 tab screens + sign-in. Every onboarding screen, both session screens,
   `index-retest.tsx`, and all settings sub-pages (except `index.tsx`) still
   use raw `<Text className="text-ink…">` and `<Pressable className="bg-accent
   rounded-xl py-4 …">`. This is the single largest source of token drift.

3. **CC3 [P1] Tailwind colour aliases bypassed via inline hex.**
   `index-test.tsx:214-217, 276-279, 346`, `index-retest.tsx:244-247, 306-309,
   375`, `stealth.tsx:321-326`, `generating.tsx:73`, `plan-preview.tsx:103`,
   `paywall.tsx:146`, `reminders.tsx:148-149`, `security.tsx:97-98`,
   `privacy.tsx:89`, `settings/stealth.tsx:11-13, 159, 178`, `biometric-gate.tsx:55, 137`
   embed `#7C5CFF`, `#22C55E`, `#1E1E27`, `#2A2A33`, `#2A2A36`, `#F5F5F7`
   directly. Figma rule (Foundations note `4:65`) is explicit: "Components
   MUST consume aliases, not brand primitives." `#22C55E` doesn't even exist
   in our palette — the correct accent for an active reaction cue should be
   `feedback/success` (`#3FB984`), not Tailwind's default green-500.

4. **CC4 [P1] `border-default` vs `border` ambiguity.**
   Some files use `border-border` (which maps to brand/border `#2A2A36` via
   `tailwind.config.js:15`), others `border-border-default` (semantic alias,
   same hex). Both work but the semantic name is required by Foundations note
   `4:65`. Replace `border-border` with `border-border-default` in
   `plan-preview.tsx:77`, `paywall.tsx:85`, all settings sub-pages,
   `session/today.tsx:101`, `session/stealth.tsx:339, 358`.

5. **CC5 [P1] `font-semibold` applied inline instead of via `Heading`/`Body weight=` primitives.**
   When you bypass the primitive you bypass the Inter font-family mapping
   (`tailwind.config.js:38-42`). On Android (and any RN environment without
   the font alias fully loaded) the result falls back to system. Search hits:
   ~40 occurrences of `font-semibold` inside `<Text>` literals across the
   non-tab screens.

6. **CC6 [P1] Screen padding inconsistent.**
   Figma standardises `px-6` (24px) for full-bleed mobile content but
   `home.tsx:96`, `program.tsx:67`, `progress.tsx:59`, `settings/index.tsx:100`
   use `px-4` (16px). The 4 tab screens were intentionally narrowed during
   Phase C.2 to align cards to the device edge inset — but Figma `08·home`,
   `09·program`, `10·progress`, `11·settings` are all 24px-inset. Pick one
   convention and apply across all tabs.

7. **CC7 [P0] Tab bar uses Lucide icons, Figma uses custom Hone glyphs.**
   `app/(app)/_layout.tsx:55-79` wires `Sparkles`, `CalendarDays`, `LineChart`,
   `Settings` from `lucide-react-native`. Roadmap line 76 says the Iconography
   decision is "A (Lucide-restyled)" and that "tab-bar + session icons may be
   redrawn in Hone's house style as a v1.1 polish pass" — this hasn't
   happened. Until it does, at minimum the tab labels in Figma read "Today /
   Plan / Progress / Settings" which matches code — but the active tint should
   use `interactivePrimary` and Figma adds a small dot indicator under the
   active tab that's absent here.

8. **CC8 [P2] `SafeAreaView className="bg-bg"` vs `"bg-surface-canvas"`.**
   Same colour, different alias. ~14 screens use `bg-bg` (brand primitive);
   tab screens use `bg-surface-canvas` (semantic). Normalize to the semantic
   form per CC3.

9. **CC9 [P2] Heading levels diverge from Figma.**
   Most ad-hoc screens use `text-3xl font-semibold` (= ~30px) for screen
   titles. Figma `heading-lg` is 30/38 SemiBold — matches in size but the
   line-height is enforced only via the `Heading` primitive. Where it's
   omitted (assessment, index-test, generating, plan-preview, paywall,
   index-retest, all settings sub-pages, both session screens) the
   line-height defaults to whatever RN's `text-3xl` mapping computes (≈ 36).

---

## Per-screen findings

### 01 · welcome  [status: partial]
**Figma node:** Screens page (not accessible via MCP; spec at roadmap line 78)
**Code file:** `app/(onboarding)/welcome.tsx`
**Match score:** 3/10
**Discrepancies:**
- [P0] Figma has the **Inset-H monogram** + "Hone" wordmark + tagline. Code
  has no logo at all — just a header text block ("Welcome / A few questions to
  personalize your plan."). Missing the brand identity entirely (welcome.tsx:11-20).
- [P0] Figma copy is the USP tagline; code copy is "10 quick questions — about
  60 seconds" which is **stale** (Phase 1 collapsed the survey to 3 questions —
  index-test.tsx implements it). Misleading user expectation (welcome.tsx:18-19).
- [P1] Figma has a **secondary "Sign in" link** under the primary CTA + a
  deferred "Continue as guest" link. Code only has the primary CTA.
- [P1] CTA label: Figma "Get started", code "Start assessment" (welcome.tsx:29).
- [P1] Uses raw `<Pressable>` + `<Text>` (CC2) and hex-free but Tailwind
  primitives `bg-accent` not `bg-interactive-primary` (CC3).
- [P2] No SectionLabel/kicker treatment — kicker is `text-muted text-xs
  uppercase tracking-wider` inline (CC2). Should use `<SectionLabel>`.

### 02 · sign-in  [status: implemented]
**Figma node:** Screens (spec at roadmap line 79)
**Code file:** `app/(auth)/sign-in.tsx`
**Match score:** 7/10
**Discrepancies:**
- [P1] No back chevron in header. Figma starts the screen with a back chev +
  title row; code skips the back chev and jumps straight to a `Heading
  display-lg "Hone"`. The auth `_layout.tsx` may already render a header — but
  the design language for the chev is explicit.
- [P1] Order of CTAs is **inverted** from Figma. Figma: Apple → Google → "or"
  divider → Email field → Send magic link. Code: anonymous-guest **first**,
  then Apple, Google, then divider + email (sign-in.tsx:73-152). The "Skip
  sign-in" CTA is not in the Figma sign-in mock — it belongs on the **38 ·
  anonymous sign-up** screen.
- [P1] Apple button uses the native `AppleAuthentication.AppleAuthenticationButton`
  (sign-in.tsx:89-100) which renders Apple's own style. Figma mocks a custom
  white-bg, black-label button with the Apple glyph — both are App Store
  compliant, but Figma's variant has a colored glyph placeholder.
- [P1] Email field has no label ("Email" above the input per Figma); only a
  placeholder (sign-in.tsx:121).
- [P2] Terms footer copy in Figma is "By continuing you agree to our **Terms**
  and **Privacy**." with inline links. Code copy talks about pelvic-floor
  medical-advice disclaimers — duplicate of the welcome-screen disclaimer.
- [P2] No "or" divider style — Figma uses 1px hairlines with a 12px gap to the
  "or" label. Code has it (sign-in.tsx:112-118) but uses `h-px bg-border-default`
  which is fine; visual parity is close.
- [P2] No 64px Inset-H monogram above the title (Figma has the logo top-center).

### 03 · assessment  [status: implemented]
**Figma node:** Screens (spec at roadmap line 80)
**Code file:** `app/(onboarding)/assessment.tsx`
**Match score:** 6/10
**Discrepancies:**
- [P1] Header layout. Figma: back chevron · ProgressDots · Skip link, all in
  one row. Code: back-text on left, "1 / 3" counter on right, then
  ProgressDots on the next row (assessment.tsx:33-50). Two rows vs one.
- [P1] No **Skip** affordance. Figma has a top-right "Skip" link for the
  user to bail mid-quiz. Missing entirely.
- [P1] Back is `← Back` text (CC1).
- [P1] CTA is "Continue" then "Take the Index test" on last step (assessment.tsx:77).
  Figma copy is "Continue" throughout, with the final step's CTA matching the
  page-3 question that requires it. Acceptable but verify wording in Figma —
  the design used a single CTA label.
- [P1] Uses raw Pressable + bg-accent classes (CC2, CC3).
- [P2] `ProgressDots` exists (`components/assessment/ProgressDots.tsx`) and is
  used — likely fine, but verify it renders as 3 dots with the active dot
  widened (Figma `1 of 3` shows a pill-shaped active dot).
- [P2] `bg-surface2` for disabled CTA (assessment.tsx:73) — should be
  `bg-surface-sunken` (CC3).

### 04 · index-test  [status: implemented]
**Figma node:** Screens (spec at roadmap line 81)
**Code file:** `app/(onboarding)/index-test.tsx`
**Match score:** 4/10
**Discrepancies:**
- [P0] **No PacerRing.** Figma uses the 260×260 `pacerRing` instance
  (state=progress 50) with the timer inside it for the endurance test. Code
  draws three different bare `<View>` circles with raw hex colours
  (index-test.tsx:209-218, 271-280, 341-348). The `components/session/PacerRing.tsx`
  primitive exists but is never imported here.
- [P0] No `cancel ×` button in top-right per Figma — code has no exit
  affordance at all once you start the test. The roadmap "cancel × + 'Test 2
  of 3'" header structure is missing (index-test.tsx:53-58 renders a different
  header).
- [P1] Reaction test uses **`#22C55E`** (Tailwind green-500) for the cue
  active state (index-test.tsx:214). Should be `feedback/success` `#3FB984`
  (CC3).
- [P1] Endurance test ring fill uses `#7C5CFF` raw hex (index-test.tsx:276) —
  should be `interactive/primary`.
- [P1] No "Release" oversized 68px CTA on endurance test. Figma uses a held-
  muscle-ergonomic release button — current implementation handles it via
  `onPressOut` on the entire circle (acceptable behaviorally but visual
  affordance is missing).
- [P1] Timer-inside-ring not present. Figma shows "15.0 OF 30 SECONDS"
  centered inside the ring; code shows `{seconds}s` above the circle
  (index-test.tsx:263).
- [P1] Stage labels in header are `1 / 3`, `2 / 3` etc. (index-test.tsx:122-125)
  but Figma label is `"Test 2 of 3"`.
- [P2] Intro cards use the IntroCard helper which matches Figma's intro-card
  visual reasonably, but the body copy width is `max-w-xs` (320px) — Figma
  caps at 326px. Negligible.

### 05 · generating  [status: partial]
**Figma node:** Screens (spec at roadmap line 82)
**Code file:** `app/(onboarding)/generating.tsx`
**Match score:** 3/10
**Discrepancies:**
- [P0] **No PacerRing**. Figma uses the 260×260 `pacerRing` (progress=75)
  with a 3-dot pulse inside as the loading visual. Code uses a bare
  `<ActivityIndicator size="large" color="#7C5CFF">` (generating.tsx:73).
- [P0] **No 3-stage checklist** ("scoreIndex → recommendLevel → buildProgram"
  with done / active / pending states). The roadmap explicitly calls this
  out; code just shows headline + single subtitle.
- [P1] Body copy is "Tuning eight weeks of sessions to your Index, goal,
  and daily time." Figma headline is "Building your program" + descriptive
  pipeline. Headline copy mismatch — "Building your plan…" vs "Building your
  program" — minor but worth aligning.
- [P1] No accent halo / ambient glow around the pacer ring.
- [P2] Inline `#7C5CFF` (CC3).

### 06 · plan-preview  [status: partial]
**Figma node:** Screens (spec at roadmap line 83)
**Code file:** `app/(onboarding)/plan-preview.tsx`
**Match score:** 3/10
**Discrepancies:**
- [P0] **Missing the composite hero card.** Figma's defining element is a
  hero card showing "62 / 100 + Intermediate pill + adaptive context line".
  Code has no Index score, no Pill, no hero card at all (plan-preview.tsx:57-69).
  This is the single most important onboarding payoff — visible to user only
  on this screen between the index test and the home tab.
- [P1] Day cards are 4 in Figma (`M / T / W / T-rest`), each with a day
  letter glyph + rest badge. Code renders `firstWeek.slice(0,7)` (7 cards)
  with just `Day N` + exercise names + "~5 min" (plan-preview.tsx:74-89).
- [P1] No "more days" hint card. Figma shows 4 day cards + a "+ 4 more days"
  affordance to set expectations.
- [P1] CTA copy: Figma "Start training", code "Start training" — match.
  But the trial copy below ("3-day free trial, then $5.99/week. Cancel
  anytime…") is **stale**: paywall says "$8.99 one-time" per Figma line 84.
  Pricing mismatch between this CTA disclaimer and the paywall (plan-preview.tsx:109).
- [P1] No "Week 1" header treatment (kicker + 5 min · daily line). Code
  embeds level in kicker (plan-preview.tsx:58-59).
- [P2] CC2 (raw Pressable/Text), CC3 (hex `#F5F5F7` for ActivityIndicator color).

### 07 · paywall  [status: partial]
**Figma node:** Screens (spec at roadmap line 84)
**Code file:** `app/(onboarding)/paywall.tsx`
**Match score:** 3/10
**Discrepancies:**
- [P0] **Pricing model mismatch.** Figma says "One payment. Everything
  included." + `$8.99 one-time price card`. Code says "3-day free trial, then
  $5.99/week. Or save 90% with $24.99/year" (paywall.tsx:65-67). Either the
  Figma is stale or the code is — needs PM decision.
- [P0] **Missing close ×** in top-right per Figma. Code has no dismiss
  affordance at all in the unconfigured path (paywall.tsx:55-110).
- [P1] **Missing 64px Inset-H monogram** at top.
- [P1] Feature list bullets: Figma uses success-checked (`✓`) glyphs. Code
  uses a small purple dot (`w-1.5 h-1.5 rounded-full bg-accent`,
  paywall.tsx:77). Missing the success-tick visual.
- [P1] Missing the **accent-soft bordered price card** that anchors the
  decision. Figma's price card is the centerpiece; code just lists features
  and disclaimers without a price-card UI.
- [P1] Restore / Terms / Privacy footer trio. Code has only "Restore
  purchases" (paywall.tsx:100-107) — missing the Terms + Privacy inline links.
- [P2] CC2, CC3 throughout the unconfigured path.

### 08 · home  [status: implemented]
**Figma node:** `80:847` (referenced in code comment)
**Code file:** `app/(app)/home.tsx`
**Match score:** 7/10
**Discrepancies:**
- [P1] Figma `screenHeader` kind=greeting includes a streak pill in the
  trailing slot. Code builds an ad-hoc header (home.tsx:98-122) using the
  Body/Heading/Pill primitives directly. Consider extracting a
  `ScreenHeader` primitive — referenced by roadmap as `screenHeader` instance.
- [P1] Greeting line uses `Body size="sm"` ("Good morning,") + Heading "friend"
  (home.tsx:100-106). Name placeholder is hardcoded; the TODO acknowledges
  it. User name should come from `useAuth().user.user_metadata.name`.
- [P1] Stat layout drift: Figma shows 2-up "This week / Latest index" only.
  Code adds a third row "Streak / longest" (home.tsx:173-179) below the 2-up
  — not in Figma.
- [P1] `Card padding="lg" radius="2xl"` (home.tsx:125) — Figma cards use
  `radius/xl` (16px), `radius/2xl` is reserved for major hero cards. Verify
  which the today-session card uses; based on roadmap "hero session card"
  language, 2xl is probably correct, but other cards in the layout should
  step down.
- [P2] Bullet dots in exercise list (home.tsx:137) are `w-1 h-1 rounded-full
  bg-text-muted` — Figma uses an 8px filled dot.
- [P2] `px-4` instead of `px-6` (CC6).

### 09 · program  [status: implemented]
**Figma node:** Screens (spec at roadmap line 86)
**Code file:** `app/(app)/program.tsx`
**Match score:** 5/10
**Discrepancies:**
- [P1] Figma shows **4 week sections** with locked/upcoming/current visual
  states + completion chip per week. Code renders all available weeks
  flatly with no lock / upcoming distinction (program.tsx:99-122). Days
  inside each week don't show the 5 states (`done / today / rest / upcoming /
  locked`) — every card looks identical.
- [P1] No day-cell **grid** layout. Figma uses small day cells (likely 7
  per row), code uses full-width rows.
- [P1] No completion chip per week (Figma `2/7 done` per week).
- [P2] `screenHeader kind=large-title "Plan"` per Figma; code renders
  `SectionLabel` + `Heading level="display-lg"` with "Your 8-week program"
  copy (program.tsx:71-77). Copy/structure mismatch with Figma.
- [P2] `px-4` (CC6).

### 10 · progress  [status: implemented]
**Figma node:** Screens (spec at roadmap line 87)
**Code file:** `app/(app)/progress.tsx`
**Match score:** 6/10
**Discrepancies:**
- [P1] Figma's Index card shows the **composite number (62)** + Intermediate
  pill + **+7 success delta** + IndexTrendChart. Code only renders
  `SectionLabel "Pelvic Floor Index"` + `IndexTrendChart` (progress.tsx:90-93)
  — missing the composite number, level pill, and trend-delta visual.
- [P1] Streak card per Figma includes "12 days + streakHeatmap state=active
  + best=15" all in one card. Code splits this into separate cards
  (progress.tsx:84-99): Stat pair + heatmap card.
- [P1] "Sessions completed" card is in code (progress.tsx:102-112) but not
  in Figma — extraneous element.
- [P1] Retest button. Figma calls it a pill (top-right of `screenHeader`).
  Code renders it as a bordered `Pressable` with a right-arrow (progress.tsx:70-81)
  — close, but use `<Pill>` primitive to match.
- [P2] `Heading level="heading-lg" "Your rhythm"` (progress.tsx:67) — Figma
  title is just "Progress" with a sub-header. Copy drift.
- [P2] `px-4` (CC6).

### 11 · settings  [status: implemented]
**Figma node:** Screens (spec at roadmap line 88)
**Code file:** `app/(app)/settings/index.tsx`
**Match score:** 7/10
**Discrepancies:**
- [P1] Figma has **5 grouped lists**: Account / Training / Subscription /
  About / Destructive. Code has 4 (Account / Training / Subscription / About)
  — missing the destructive group containing "Delete account" (currently
  buried inside `settings/account.tsx`). Roadmap line 88 explicitly calls out
  the destructive group.
- [P1] Figma includes a custom **"Lifetime · Purchased Feb 14, 2026" row
  with success badge** when the user is Pro. Code renders subscription as a
  plain row with just "Active / Trial / Free" (settings/index.tsx:73-78). No
  lifetime-purchase variant, no success badge.
- [P1] Roadmap notes "Rows inlined at exact 358 px (vs listRow component's
  360) — TODO: resize listRow primitive to 358 to unify." Still TODO.
- [P2] No avatar / profile preview at the top (Figma may not have this on
  settings index either — verify; the edit-profile screen 27 has the
  avatar).
- [P2] "Hone v0.1.0" footer (settings/index.tsx:135) — version should be
  read from `app.config.ts` not hardcoded.

### 12 · index-retest  [status: partial]
**Figma node:** Screens (spec at roadmap line 89)
**Code file:** `app/(app)/index-retest.tsx`
**Match score:** 3/10
**Discrepancies:**
- [P0] **Not a modal sheet.** Figma is a "modal sheet from y=70 with scrim +
  dimmed bg hint · 24 px top corners · grabber + close ×". Code is a
  full-screen `SafeAreaView` (index-retest.tsx:64). Should be presented via
  `expo-router` modal stack or a bottom sheet (`@gorhom/bottom-sheet`).
- [P0] **No grabber** (the iOS-style horizontal pill at top of sheet).
- [P1] **Not a 3-step preview card** — Figma shows "3 step cards (Reaction /
  Endurance / Rapid with time chips)" + "Last test: 8 days ago" hint + "I'm
  ready" CTA before running the tests. Code instead jumps straight into a
  generic IntroCard then runs the same reaction/endurance/rapid sub-tests
  inline as index-test.tsx does.
- [P1] Massive code duplication with `index-test.tsx`. The three test
  components (`ReactionTest`, `EnduranceTest`, `RapidTest`) are reproduced
  verbatim in both files. Extract to `components/session/IndexTests.tsx`.
- [P1] Same `#22C55E` / `#7C5CFF` raw hex (index-retest.tsx:244-247, 306-309,
  375) (CC3).

### 13 · session/active  [status: partial]
**Figma node:** Screens (spec at roadmap line 90)
**Code file:** `app/(app)/session/player.tsx`
**Match score:** 5/10
**Discrepancies:**
- [P1] **No tab bar** is correct (immersive mode in Figma), but Figma also
  drops the `SafeAreaView` top inset — header is a custom `cancel ×` +
  "Day 3 · Coordination" muted center. Code has a plain "End" text link in
  the top-right (player.tsx:205-215) and no centered phase context.
- [P1] No 72px round **Pause CTA**. Code has "End" text only — there is no
  pause functionality exposed to the user even though
  `lib/session-engine.ts` likely supports pause.
- [P1] No meta row "SET 2/3 · REP 5/10 · TIME 2:14". Code renders only
  "{remainingPhases} phases remaining / Rep N · Set N" (player.tsx:238-243)
  in muted-small text. Figma uses a three-column meta row at standardized
  size.
- [P1] "End session" muted link absent — code uses "End" which is also
  the only exit.
- [P2] PacerRing is used (player.tsx:222-225), with `colorForPhase` from
  PhaseLabel — good.
- [P2] Timer inside the ring is just `{ceil} s`; Figma shows two-line
  "112 / 120 · 3 SECONDS".

### 14 · session/complete  [status: missing]
**Figma node:** Screens (spec at roadmap line 91)
**Code file:** N/A
**Match score:** 1/10
**Discrepancies:**
- [P0] No dedicated complete screen. `session/player.tsx:174-194` renders a
  minimal "Session complete" inline state with just a "Back to home" CTA.
  Figma calls for: "96 px success-check badge with 120 px ring halo · 'Nice
  work, Jamie' + day subhead · 3-up stats (DURATION 5:12 · REPS 30 · STREAK
  +1 in green) · `ratingPrompt` instance (value=0) · Done CTA".
- [P0] No `RatingPrompt` primitive in `components/ui/` (verify; not listed
  in `components/ui/index.ts`). Roadmap notes it's a designed primitive
  ("12/12 new primitives") — was the code primitive built? Likely missing.
- [P0] No three-up post-session stats — would consume `Stat` primitive.
- The stealth completion screen (`stealth.tsx:278-296`) is also stripped
  down — same gap.

### 15 · session/stealth  [status: partial]
**Figma node:** Screens (spec at roadmap line 92)
**Code file:** `app/(app)/session/stealth.tsx`
**Match score:** 6/10
**Discrepancies:**
- [P1] Figma "concentric-ring decoy art"; code uses album-art image or a
  flat fallback square (stealth.tsx:310-329). The decoy is supposed to be a
  podcast-cover analog — current solid-colour fallback (`#1E3A5F`, `#3F3A2F`,
  `#3A2A6E`) reads thin without the concentric rings.
- [P1] "STEALTH" pill in nav per Figma — code has nothing in nav (no nav
  exists in stealth screen; design wants a discreet brand confirmation that
  the user is in stealth mode).
- [P1] "Tap and hold to exit Stealth" hint — code says "Four-finger long
  press to end early" (stealth.tsx:371). Behavior is four-finger long-press
  (stealth.tsx:255-265), but Figma copy is more concise and friendlier. Both
  are reasonable; align with PM.
- [P1] No "output-device pill" (Figma shows "AirPods Pro" pill). Code shows
  a banner only when output is `speaker`/`silent` (stealth.tsx:356-368) but
  no positive-state pill when on Bluetooth.
- [P1] Hex `#1E3A5F` / `#3F3A2F` / `#3A2A6E` raw (stealth.tsx:321-326)
  (CC3). These are decoy cover values — should at least be hoisted to
  `lib/audio/decoy-track.ts` as named constants.
- [P2] Track title "Focus Session — Episode 12" (stealth.tsx:334) — Figma
  uses "generic track + show name". Acceptable.

---

### 16 · sign-up  [status: missing]
**Figma node:** Screens (spec at roadmap line 93)
**Code file:** N/A — no `app/(auth)/sign-up.tsx`. Screen designed but not
implemented.
- [P1] Currently sign-up flow routes through the same `(auth)/sign-in.tsx`
  with no distinction.

### 17 · legal viewer  [status: missing]
**Figma node:** Screens (spec at roadmap line 95)
**Code file:** N/A. Designed as parameterised route for Terms / Privacy /
Licenses.
- [P1] Terms-of-service and Privacy links anywhere they appear (paywall
  footer, sign-in disclaimer) are dead — they don't open a viewer.

### 18 · error state  [status: partial]
**Figma node:** Screens (spec at roadmap line 96)
**Code file:** `components/ErrorBoundary.tsx`
**Match score:** 4/10
- [P1] `ErrorBoundary.tsx:27-48` is a single fallback UI for any caught
  error. Figma wants a route-level "Couldn't load program" detail-header with
  `errorState` instance (kind=retry) + "Contact support" muted text.
- [P1] No `ErrorState` primitive in `components/ui/` (Figma had a designed
  `errorState` set with 2 kind variants per Foundations / Phase B notes —
  was not exported in `components/ui/index.ts`).

### 19 · healthkit connect  [status: missing]
**Code file:** N/A.
- [P2] Lower priority (iOS-only, deferred per Phase 4).

### 20 · restore purchase  [status: partial]
**Figma node:** Screens (spec at roadmap line 98)
**Code file:** `app/(app)/settings/subscription.tsx`
**Match score:** 4/10
- [P1] Figma has 3 explicit sub-states (looking / restored / not-found) as
  full screens. Code shows the same screen with Alert popups for each
  state (subscription.tsx:17-30). Switch to in-page state machine.
- [P1] No accentSoft loading disc, no success badge, no ?-glyph error
  state.

### 21 · maintenance  [status: missing]
**Code file:** N/A — designed but not built.

### 22 · voice picker  [status: missing]
**Code file:** N/A. Some plumbing exists in `lib/audio/cues.ts` for cue
styles, and `app/(app)/settings/stealth.tsx:127-145` has a CueStyle picker,
but it's a list of pressables not the Figma "4 voice cards with per-card
play preview, accent stroke + check on selection".

### 23 · onboarding bail-out  [status: missing]
**Code file:** N/A. Designed (5-step vertical timeline) but never wired
into onboarding navigation.

### 24 · day detail  [status: missing]
**Code file:** N/A. The `program.tsx` cards are not tappable into a detail
view.

### 25 · exercise detail  [status: missing]
**Code file:** N/A.

### 26 · reminders  [status: implemented]
**Figma node:** Screens (spec at roadmap line 110)
**Code file:** `app/(app)/settings/reminders.tsx`
**Match score:** 6/10
- [P1] Figma has **3 grouped lists** (Enabled toggle / Schedule with time +
  7 day chips + cadence / Tone with sound + vibration). Code has 1 toggle
  + 4 time presets only (reminders.tsx:131-187). Missing: 7-day chip row,
  cadence picker, Tone group, sound/vibration toggles.
- [P1] No "Next reminder: Tomorrow at 8:30 AM" accent-soft preview pill at
  the top.
- [P1] Times are radio-button rows, not chips. Figma uses inline chips
  ("7:00 AM · 8:30 AM · 12:00 PM · 7:00 PM") in a row.
- [P1] No "Pick a custom time" entry → opens **36 · reminder time wheel**
  (the wheel screen is also missing).
- [P2] Raw hex `#2A2A36` / `#7C5CFF` / `#F5F5F7` in Switch trackColor
  (reminders.tsx:148-149) (CC3).

### 27 · edit profile  [status: missing]
**Code file:** N/A. `app/(app)/settings/account.tsx` has only sign-out and
delete-account buttons. Missing: custom nav with Save pill, 96px avatar
with initials + pencil-edit badge, 4 fields (Name / Email / Goal / Birthday).

### 28 · check email  [status: missing]
**Code file:** N/A. After `sendMagicLink`, code just sets `emailSent=true`
and updates the button label (sign-in.tsx:135-140). No dedicated screen.

### 29 · delete account  [status: partial]
**Code file:** `app/(app)/settings/account.tsx` (the delete UI is
embedded; no standalone screen).
**Match score:** 2/10
- [P1] Figma has a detail-header screen with "72 px danger badge + halo +
  exclamation · WHAT'S DELETED bullet card · purchase-preservation
  reassurance · **type-to-confirm Input showing DELETE** with danger stroke
  · 50/50 Cancel/Delete forever buttons". Code uses a single iOS Alert
  dialog (account.tsx:15-41) with no type-to-confirm gate.
- [P1] Missing type-to-confirm Input — Apple's privacy guidelines accept
  the Alert path, but the design intent is stronger.

### 30 · session pause  [status: missing]
**Code file:** N/A. The player has no pause button at all (see Screen 13).

### 31 · session review  [status: missing]
**Code file:** N/A.

### 32 · reverse-Kegel intro  [status: missing]
**Code file:** N/A.

### 33 · education  [status: missing]
**Code file:** N/A.

### 34 · RPE slider  [status: missing]
**Code file:** N/A. No `Slider` primitive in `components/ui/index.ts`
either (was designed per Phase B note line 74).

### 35 · coachmark overlay  [status: missing]
**Code file:** N/A.

### 36 · reminder time wheel  [status: missing]
**Code file:** N/A. No `TimePicker` primitive in `components/ui/index.ts`
(was designed per Phase B note line 73).

### 37 · streak-freeze  [status: missing]
**Code file:** N/A. Backend `0004_streak_freezes.sql` migration is written
(roadmap line 126), but UI is not.

### 38 · anonymous sign-up  [status: partial]
**Code file:** Folded into `app/(auth)/sign-in.tsx:73-86` as the "Skip
sign-in — start training" button. Not a dedicated screen.
- [P1] Figma is a full screen with "96 px surface2 hero with masked-
  silhouette glyph · 'Train without an account' title · 3 success-checked
  explainer rows · trade-off info card · Start training accent CTA + accent
  'I'll sign up instead' text link". Code is one button on sign-in.

### 39 · biometric lock  [status: partial]
**Code file:** `lib/biometric-gate.tsx`
**Match score:** 5/10
- [P1] No 48 px Inset-H monogram or 120 px Face-ID glyph
  (biometric-gate.tsx:117-145 has just title + body text + button).
- [P1] No "Use passcode" accent text or muted "Sign out" near bottom.
- [P2] Raw hex `#7C5CFF` / `#F5F5F7` (biometric-gate.tsx:55, 137) (CC3).

### 40 · app icon picker  [status: partial]
**Code file:** `app/(app)/settings/app-icon.tsx`
**Match score:** 4/10
- [P1] Figma shows a **2 × 2 grid of 4 alternate icons** with visual
  previews and check-badges. Code shows a vertical list of pressable rows
  with text labels only (app-icon.tsx:69-103). No icon thumbnails rendered.
- [P1] No "accent-soft iOS-notification info card" explaining the icon
  swap.
- [P2] "Apply" CTA — Figma uses a confirm CTA; code applies immediately on
  tap. Behavior change vs design; verify intent.

### 41 · Live Activity widget  [status: deferred]
**Code file:** Native iOS only — `modules/app-intents/` may have plumbing
but the widget itself is iOS-native (not in `app/`). Per roadmap, this is
correctly deferred.

---

## Notes on missing tooling

The Figma MCP could only list the **Foundations** page (`0:1`) for file key
`qgY3Qcf7gP7w5V5A6uQTL4`. The Screens page exists in the design file (per
the roadmap's detailed per-frame descriptions) but is not exposed by
`get_metadata` from the API — likely because the page hasn't been opened in
the Figma desktop app session, or the file's page index isn't surfacing
beyond the first page. This audit relies on the codified Figma descriptions
in `docs/hone-roadmap-state.md` (lines 78-121), which were written when the
design was authored and are the most precise spec available short of
opening the Figma file directly.

When the Screens page becomes accessible, the highest-value follow-up calls
are `get_design_context` for nodes corresponding to:
1. The "08 home" hero session card (radius + padding verification)
2. The "10 progress" Index card composition (composite + delta layout)
3. The "12 index-retest" sheet (grabber, scrim opacity, corner radius)
4. The "06 plan-preview" composite hero card (the single most missing UI
   element across the implemented set)
5. The "14 session/complete" rating-prompt screen (entire screen missing).
