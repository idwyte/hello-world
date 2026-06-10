# Hone — Motion & Haptic Spec

*The "Kinetic" half of Obsidian Kinetic. What moves, what glows, what taps back. One brand, expressed with restraint — including in down-training, where motion (not a separate theme) carries the calm. Pairs with DESIGN.md. June 2026.*

> **Governing principle.** Obsidian is the stillness; Kinetic is the life inside it. Motion in Hone is *functional feedback*, never decoration — every animation answers "did my body just do something, and is it working?" On a training app used eyes-half-closed mid-exercise, motion and haptics are the primary feedback channel, not a flourish. When in doubt, less and slower.

---

## 1. Motion tokens (the vocabulary)

Three durations, two easings. Everything composes from these — don't invent one-offs.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-instant` | 100ms | ease-out | State flips: selection, tab change, button press |
| `motion-base` | 250ms | ease-in-out | The default. Transitions, reveals, value changes |
| `motion-slow` | 600ms | ease-in-out | Emphasis moments: phase changes, success, the breathing cycle base |
| `ease-out` | cubic-bezier(0.2, 0, 0, 1) | — | Things arriving / responding to touch |
| `ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | — | Things moving between two states |

**Reduced-motion:** every animation below has a non-motion fallback (opacity or instant state). Respect the OS "Reduce Motion" flag — health app, older skew, non-negotiable. Glow intensity changes survive reduced-motion (they're not movement); positional/scale animations collapse to fades.

---

## 2. Haptics (the tactile layer)

DESIGN.md asks for haptics on every primary action. Specified precisely so it reinforces rather than annoys — over-haptic feels cheap, the opposite of premium.

| Event | Haptic (iOS / RN equiv) | Why |
|---|---|---|
| Primary button press | `impactLight` | Confirms the critical-path tap |
| Selection (option, chip, band) | `selectionClick` | The "tick" of a choice landing |
| Contraction registered (quick-flick test) | `impactMedium` | The body did a rep — the core tactile moment of the whole app |
| Phase change (e.g. HOLD → REST) | `impactMedium` | Eyes may be closed; the hand must know |
| Session/phase complete | `notificationSuccess` | Earned closure |
| Hypertonic/pain flag acknowledged, referral | *none* | Deliberately silent — gravity, not gamification |
| Error / invalid | `notificationWarning` | Sparingly |

**Down-training exception:** the release/breathing work uses **only `selectionClick` at most**, never `impactMedium`. Punchy haptics contradict "let go." The calm is carried here, not in a different palette.

---

## 3. Signature moments (where Kinetic earns its name)

### 3.1 The Phase Ring (session timer) — the hero animation
The lime progress arc sweeps as time elapses, `ease-in-out`, with the `glow/primary` intensifying slightly as it nears completion (glow opacity 30%→45% over the final 3s). On phase complete: one `motion-slow` pulse — the ring scales 1.0→1.04→1.0 — paired with `impactMedium`. This is the app's heartbeat; it should feel *alive*, like a rev.

### 3.2 The breathing screen (down-training) — the anti-hero animation
The deliberate counterweight. A soft cyan-tinted ring that **expands on inhale (4s), holds (2s), contracts on exhale (6s)** — the clinically-correct longer exhale, rendered as motion. `motion-slow`-and-beyond, the slowest thing in the app. No glow pulse, no haptic punch — just a single faint `selectionClick` at the top of each inhale if haptics are on. Same Phase Ring component, same obsidian surface, *opposite tempo*. This is how "unified brand" still feels right for someone in pain: the system didn't change, the pace did.

### 3.3 Value reveals (measurement) — making the promise visible
When a measured result appears (hold time, profile axes, index), it **counts up** from 0 to value over `motion-base`, and the profile polygon/bars **draw in** rather than appearing. Tiny, but it's the brand promise as motion: *you are watching yourself be measured.* Reused on the retest before/after — the old polygon morphs to the new one over `motion-slow`, the single most important "look what changed" beat in the product.

### 3.4 Quick-flick counter — tactile rep feedback
Each registered flick: the count flips (`motion-instant`), the tap target pulses lime, `impactMedium`. Rhythm you can feel without looking — the test becomes a game you play by feel.

### 3.5 Transitions between screens
Funnel steps slide `motion-base` horizontally (forward = in from right). Session phases cross-fade, not slide (you're in one place, time is passing). Modals/sheets rise with the `blur/overlay` backdrop fading in — keeps context grounded per DESIGN.md.

---

## 4. Glow as a state, not a style
Glow is *information*: it means "live / active / now." Rules:
- Only the **single most active** element glows at a time. Two glowing things = no focal point.
- Active session ring glows; paused ring does **not** (glow off = a visible, felt "stopped").
- Active tab icon carries a faint glow; inactive don't.
- Never glow a disabled or destructive control.

---

## 5. What does NOT move
Stating the negative space so the build stays disciplined:
- Body copy never animates in word-by-word or letter-by-letter.
- No parallax, no decorative background motion, no looping ambient particles.
- Stat values that aren't *newly measured* don't re-count on every view — only on first reveal / on change.
- The referral interstitial and any pain/safety copy are **completely static** — stillness signals seriousness.

---

## 6. Build handoff notes (for Claude Code / RN)
- Library: **React Native Reanimated 3** + **expo-haptics**. Reanimated for the ring arc, breathing cycle, count-ups, polygon draw; haptics map 1:1 to the table above.
- The Phase Ring already exists as a Figma component with Time/Caption props — in code it takes `progress` (0–1), `mode` ('performance' | 'breathing'), and `glow` (bool) and drives all timing internally.
- Honour `useReducedMotion()`; fall back per §1.
- Haptics are a **setting** (default on) — some users train in contexts where buzzing is unwelcome; respect it, and never haptic in silent contexts you can detect.

## Open decision
- **Sound?** Spec is currently silent (no audio). For session phase-changes, an optional subtle tone (off by default) could help eyes-closed training — but it's scope. Flagging, not building. Recommend deferring to post-launch.
