# Hone — Assessment v2 Copy Deck

*Exact on-screen copy for review before the Figma build. Pairs with Assessment Logic v2 and the Down-Training Track spec. Every string here is final-intent — red-pen freely, especially the safety-critical screens (flagged ⚠). June 2026.*

**Conventions:** `LABEL CAPS` = JetBrains Mono label. **Title** = headline. Body = plain. `[Button]` = primary CTA. `[ghost]` = secondary. Voice: plain, calm, British spelling, no hype, no clinical jargon thrown at the user, never alarming.

---

## Assessment Intro (replaces the "2 tests" screen)

`A FEW QUICK MEASUREMENTS · ~4 MIN`
**Let's find your baseline**

Pelvic floor training works best when it's built from where you actually are. We'll take a few quick measurements — strength, stamina, speed, control — and check how your muscles relax, not just contract.

Nothing here is a test you can pass or fail. It's the starting point we build your whole programme from, and you'll remeasure every 8 weeks to see what's changed.

`[Begin]`
`[ghost: How these work]`

> Note: "relax, not just contract" plants the relaxation axis early, so the relaxation screen later doesn't come from nowhere.

---

## Step 1 — Strength

`STEP 1 OF 6 · STRENGTH`
**How strong is one squeeze?**

Tighten your pelvic floor muscles — the same as stopping the flow of urine, or holding in wind — as firmly as you can. Lift up and in. Then let go.

How did that feel?

- I couldn't really feel anything happen
- A flicker, but weak
- A clear squeeze, light
- A solid squeeze with a definite lift
- A strong, full lift

`[Continue]`

> 5-point self-rating, plain-language anchored to a modified Oxford grade. No numbers shown to the user.

---

## Step 2 — Endurance

`STEP 2 OF 6 · STAMINA`
**How long can you hold?**

Squeeze and lift, then hold it steady. Keep breathing normally. When you feel the squeeze start to fade or slip, release — and we'll log the time.

Don't force past a strong fade. We just want your honest hold.

`[Start hold]` → live timer (Phase Ring), `[Release]` stops it
Result state: **You held for ~8 seconds.** That's your starting hold. `[Continue]`

> Cap display at ~12s. "~" everywhere — honest imprecision.

---

## Step 3 — Repetitions

`STEP 3 OF 6 · REPEAT`
**How many good holds in a row?**

Now repeat that hold — squeeze, lift, hold a few seconds, fully release — and count only the ones that feel as strong as the first. Stop when the quality drops, not when you're exhausted.

How many solid holds did you manage?

[ number stepper, 0–10+ ]

`[Continue]`

> "Quality not exhaustion" mirrors the clinical rep-ceiling and keeps it safe.

---

## Step 4 — Fast contractions

`STEP 4 OF 6 · SPEED`
**Quick squeezes**

These work the fast muscles — the ones that catch a cough or a sneeze. Squeeze and release as quickly and crisply as you can, fully letting go each time. We'll count for 15 seconds.

`[Start]` → 15s timer, user taps a big target per clean flick, live count
Result: **You managed ~12 quick squeezes.** `[Continue]`

> Tap-per-flick gives a real count without a device. Caption ties to function (cough/sneeze) so it feels relevant.

---

## Step 5 — Coordination ⚠

`STEP 5 OF 6 · CONTROL`
**Check your technique**

This one's about *how* you squeeze, not how hard. Do one more gentle squeeze and notice your body.

Tick anything that happened:

- [ ] I held my breath
- [ ] My tummy tightened or pulled in hard
- [ ] My buttocks or thighs clenched
- [ ] I bore down / pushed *out* instead of lifting up
- [ ] None of these — just a clean lift

`[Continue]`

> Multi-select. Any of the top four → coordination flag → foundation work inserted. "Bore down instead of lifting" also feeds the relaxation signal. ⚠ because wrong-muscle recruitment is the known failure mode; wording must make each option recognisable without shaming.

---

## Step 6 — Relaxation screen ⚠⚠ (highest stakes)

`STEP 6 OF 6 · RELEASE`
**Letting go is half the job**

Healthy pelvic floor muscles need to *release* as well as squeeze. This last step checks that — it's how we make sure your programme is the right kind for you.

After a squeeze, can you fully relax and feel everything settle and soften back down?

- Yes, it lets go easily
- Sort of — it's slow or partial
- No, it stays tight / I can't really feel it release

Then, separately:

**Do any of these sound familiar?** (tick any)
- [ ] Aching, pain or discomfort in the pelvic area
- [ ] Pain during or after sex
- [ ] Needing to rush to the loo / urgency
- [ ] Trouble fully emptying, or constipation
- [ ] **My symptoms feel worse after doing squeezes or Kegels**

`[Continue]`

> ⚠⚠ The bolded last flag is the most decisive in the literature — weight it heavily in routing. Any strong flag here routes to down-training. Copy stays calm and normalising; it must never read as "you have a condition." Single-select for the release question, multi-select for symptoms.

---

## Generating

**Building your programme**
`READING YOUR PROFILE` (cycles → `MATCHING YOUR PHASE` → `SETTING YOUR DOSES`)

Calibrating strength, stamina, speed and control to what you just measured.

> Down-training route swaps caption set to `READING YOUR PROFILE → SHAPING YOUR RELEASE WORK`.

---

## Plan Preview — STRENGTHENING variant

`BUILT FROM YOUR BASELINE`
**Foundation Phase**

Here's where you're starting and what we'll build. Everything below comes from your own measurements — it'll adjust as you go, and you'll remeasure in 8 weeks.

[ five-axis profile — RADAR or BARS, both built for the test ]
Axes: STRENGTH · STAMINA · REPEAT · SPEED · CONTROL

`8 WEEKS` `5 / WEEK` `10 MIN`

`WEEK 8` **Your first retest** — all five measures again, and your next phase is built from the result.

`[Start training]`

> The profile is the USP made visible: five axes, not one number. Radar vs. bars is the live A/B.

---

## Plan Preview — DOWN-TRAINING variant ⚠

`A DIFFERENT STARTING POINT`
**Release & Restore**

Based on your answers, we're starting you somewhere different — with work that helps your pelvic floor *release*, not just contract. For a tight or overactive pelvic floor, that's the right first step, and pushing into strengthening too early can make things worse.

This is gentle, proven work: breathing, relaxation and lengthening. No forcing, no "harder each week" — we're looking for ease, not effort.

`WHAT THIS PHASE IS`
- Daily pelvic-floor breathing, 5–10 minutes
- Gentle lengthening and relaxation work
- Simple habits for everyday tension

`8 WEEKS` `DAILY` `~10 MIN`

`WEEK 8` **We'll recheck** — and if things have eased, we'll move you on gently.

`[Start release work]`
`[ghost: Talk to a professional]`

> ⚠ Calm, reframed as *correct personalisation*, never as something wrong. No performance numbers — symptom/ease framing only. No progressive-overload language anywhere.

---

## Professional-referral interstitial ⚠ (down-training entry)

Shown once on entry to the down-training track, full screen, tap-through.

**First — one honest thing**

What you told us is common, and it's nothing to worry about on its own. But the people who assess this properly are pelvic floor physiotherapists, and if your symptoms are bothering you, seeing one is the best step you can take.

Hone will give you safe, gentle work to start with in the meantime — but we're not a substitute for a professional, and we'll never push you to strengthen through pain.

`[I understand — continue]`
`[ghost: How to find a pelvic floor PT]`

> After this, a persistent but quiet "Talk to a professional" affordance lives in the track. Escalates to a direct recommendation at week 8 if the re-screen doesn't clear.

---

## Standing micro-copy (reused)

- **Pain stop-rule (any test):** "Stop if anything hurts. Pain isn't something to push through here." 
- **Skip (deferred sensitive context):** "You can skip this — we'll just start a little more gently."
- **Disclaimer footer (assessment + previews):** "This is a guided wellness assessment, not a medical diagnosis."

---

## What's NOT in this deck (deferred, per your call)
Sensitive life-stage questions (post-partum, peri/menopause, prostate/post-surgical) — moved out of the funnel to first programme setup. They set safety rails, not difficulty, so the assessment runs without them and plans start slightly more conservative until they're answered.

## Review asks
- The two ⚠⚠ screens (5 and 6) and the down-training preview + interstitial are where your eye matters most — wording there is load-bearing for safety and tone.
- Confirm the strengthening profile axis labels (STRENGTH · STAMINA · REPEAT · SPEED · CONTROL) — short enough for radar points, plain enough for users.
- Flag anything that reads too clinical or too soft.
