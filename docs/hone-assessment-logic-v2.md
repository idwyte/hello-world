# Hone — Assessment Logic v2

*Deepening the baseline from a 2-test battery to a multi-dimensional profile, so the AI generator can produce genuinely ranged programs. Grounded in the clinical PERFECT scheme and pelvic-floor fiber physiology. June 2026.*

> **Standing disclaimer (must surface in-app):** This is a self-guided wellness assessment, not a clinical diagnosis. Clinical PERFECT scoring is done by a physiotherapist via palpation; Hone approximates its *dimensions* through self-report and timed self-tests. Frame outputs as training inputs, never medical findings. Anyone with pain, prolapse symptoms, incontinence that worries them, or post-partum complications is directed to a professional.

---

## Why the current test is too shallow

Today: two timed tests (quick pulse count, max hold) → a single index → effectively three intensity tiers. The problem isn't the tests, it's the **dimensionality**. Two numbers that both basically measure "strength" can only scale *one* axis (harder/easier). A program engine fed one axis can only output one shape of plan at different volumes. To produce genuinely *different* plans — not louder/quieter versions of the same plan — the assessment has to measure axes that are clinically independent and that imply *different training*, not just *more* training.

The clinical gold standard already defines those axes.

---

## The clinical basis (what real assessment measures)

**PERFECT scheme** (Laycock & Jerwood, the standard for PFM digital assessment) measures five things, and they are demonstrably independent — inter-examiner reliability is high on each separately:
- **P**ower — strength of a maximal contraction
- **E**ndurance — how long a contraction is held (slow-twitch / Type I capacity)
- **R**epetitions — how many endurance holds can be repeated before fatigue
- **F**ast contractions — number of quick max flicks (fast-twitch / Type II capacity)
- **ECT** — every contraction timed (rigour, not a separate score)

**Fiber physiology** explains *why* these matter for program design: the levator ani is ~**67% slow-twitch (Type I)** — tonic support, endurance, trained by long holds — and ~**33% fast-twitch (Type II)** — recruited on cough/sneeze/lift, trained by quick flicks ("The Knack"). A person can be strong on one and weak on the other, and **they need different training**. That asymmetry is the thing the current single-index throws away.

**The critical missing axis: RELAXATION.** Clinically, a pelvic floor that can't *release* (non-relaxing / hypertonic) is a real and common dysfunction — it presents as pelvic pain, urgency, constipation — and for these people **more Kegels make it worse**; they need *down-training* (reverse Kegels, relaxation), not strengthening. Hone's education content already references reverse-Kegels, but the assessment doesn't screen for who needs them. This is the single highest-value addition: it's not a harder version of the existing plan, it's a *categorically different* plan, and getting it wrong is actively harmful.

---

## The v2 assessment: five measured dimensions + a safety screen

Each maps to a PERFECT/physiology construct and to a *distinct* training lever.

| # | Dimension | What the user does (self-test) | Captured value | Clinical basis | Training lever it sets |
|---|---|---|---|---|---|
| 1 | **Strength / Power** | One maximal contraction, self-rate lift intensity (0–5, modified Oxford-style anchored with plain descriptions) | 0–5 ordinal | PERFECT "P" / Oxford grade | Baseline load; whether to start with awareness vs. loaded work |
| 2 | **Endurance** | Hold one contraction as long as able; timer | seconds (cap ~12s) | PERFECT "E", Type I | Hold duration prescribed in the plan |
| 3 | **Repetitions** | How many ~(their endurance-length) holds before quality drops, with rest | count | PERFECT "R" | Sets × reps volume; fatigue ceiling |
| 4 | **Fast contractions** | Max quick flicks in 15s (full contract+release each) | count | PERFECT "F", Type II | Quick-flick / "Knack" dosing |
| 5 | **Coordination / Control** | Guided: contract *without* breath-hold, glute or abdominal bracing; self-report what moved | clean / compensating flags | "wrong muscle" recruitment is a known failure mode | Whether to insert breath/isolation foundation work before loading |
| S | **Relaxation / Down-train screen** | After a hold, can you fully let go and feel it lengthen? + 3 symptom flags (pain with contraction, urgency, incomplete release) | release-ok / possible-hypertonic | Non-relaxing PFM | **Routes to a down-training track** instead of strengthening |

**Plus context already collected:** age, training frequency, goals, and (gated, optional, sensitive) life-stage flags — post-partum, peri/menopause, prostate/post-surgical — which set safety rails and contraindications, not difficulty.

Six short steps. Still completable in ~4–5 minutes because each is a single focused action.

---

## How this produces *ranged* plans (the actual point)

Instead of one index → intensity tier, you get a **profile vector** that selects a program *archetype* first, then tunes it. Same engine, but now the output space is genuinely multi-dimensional.

### Step 1 — Archetype routing (the branch the single-index can't make)

```
IF relaxation-screen flags possible-hypertonic OR pain-on-contraction:
    → DOWN-TRAINING archetype (reverse Kegels, diaphragmatic breathing,
      relaxation; NO progressive strengthening until symptoms settle;
      hard prompt to see a professional)
ELIF coordination flags compensation OR strength == 0:
    → FOUNDATION archetype (awareness, isolation, breath-coordination
      before any load)
ELSE:
    → STRENGTHENING archetype (proceed to fiber-balance tuning)
```

That one branch is the difference between a safe product and one that tells a hypertonic user to do 50 Kegels a day. It's also impossible to make with the current two strength-tests.

### Step 2 — Within strengthening, tune by the fast/slow balance

The endurance/reps scores vs. the fast-contraction score reveal a **fiber-bias**, and the plan rebalances toward the deficit (specificity principle):

```
slow_score  = f(endurance_secs, reps)         # Type I capacity
fast_score  = f(fast_count)                    # Type II capacity

IF slow_score low & fast_score ok   → ENDURANCE-WEIGHTED plan (longer holds, more reps)
IF fast_score low & slow_score ok   → POWER/REACTIVITY-WEIGHTED plan (quick flicks, Knack, cough-timing)
IF both low                         → BALANCED build, conservative volume
IF both high                        → ADVANCED maintenance + functional/load integration
```

### Step 3 — Dose from the raw numbers (overload + reversibility)

The actual prescription is computed, not bucketed:
- **Hold duration** = endurance result (start at their max, progress weekly).
- **Reps × sets** = from rep ceiling, leaving headroom.
- **Quick-flick volume** = from fast-contraction count.
- **Progression rate** = scaled by age + training frequency.
- **8-week retest** re-measures all five → the next phase is rebuilt from the new vector (the forced-retest mechanic now has *five* axes to show movement on, not one — much stronger "look what changed" moment, and a better renewal hook).

### Step 4 — Safety rails from context flags
Post-partum → no breath-holding/Valsalva, gentler ramp. Pain anywhere → never auto-progress; re-route to down-training and surface the professional prompt. These gate the plan regardless of scores.

---

## What the AI generator receives (the spec change)

Replace the single `index` input with a structured profile:

```json
{
  "archetype": "strengthening | foundation | down_training",
  "strength_oxford": 0-5,
  "endurance_seconds": 0-12,
  "rep_ceiling": 0-10,
  "fast_count": 0-30,
  "fiber_bias": "slow_deficit | fast_deficit | balanced | advanced",
  "coordination": "clean | compensating",
  "relaxation": "ok | possible_hypertonic",
  "context": { "age_band": "...", "train_freq": "...", "flags": ["postpartum"] }
}
```

The generator's system prompt then says, in effect: *select the archetype track; within it, weight the program toward the fiber deficit; compute holds/reps/flicks from the raw values; apply context safety rails; never prescribe strengthening when archetype is down_training.* This is what unlocks "in-depth and ranged" — the same Claude/rule-based generator now has a vector that genuinely forks the output, not a scalar that only scales it.

---

## Skeptical-engineer flags (read before building)

1. **Self-assessment is noisier than palpation.** The clinical scores come from a physio's finger; we're inferring from self-report and timers. *Mitigation:* present results as ranges/bands with honest confidence language, never false precision ("Endurance: ~6s, developing" not "Endurance score: 6.0"). The retest trend matters more than any single absolute.
2. **The relaxation screen is the highest-stakes and hardest-to-self-measure axis** — yet it's the one that prevents harm. *Mitigation:* lean conservative — if *any* hypertonic/pain flag fires, route to down-training + professional prompt rather than risk telling a pained pelvic floor to strengthen. False-positive (sending a fine user to gentler work) is cheap; false-negative is harmful.
3. **More steps = more drop-off.** Six measured dimensions risks abandonment vs. today's two. *Mitigation:* each step is one action; show progress; let the heavier context/sensitive questions be skippable (skipping just makes the plan more conservative). Validate completion rate against the current flow.
4. **Scope/regulatory creep.** The more this looks like clinical assessment, the closer it drifts to "medical device" framing. *Mitigation:* wellness-tool language throughout, the standing disclaimer, and the professional-referral prompts are non-negotiable — they're also the honest position.
5. **Don't over-fit the dosing formulas to invented constants.** The exact f() mappings (what endurance-seconds → hold-prescription) should be set against the actual exercise library and sanity-checked, not hard-coded from a guess. Build them as a small, reviewable table, not magic numbers buried in the generator prompt.

---

## Net effect on the product

- **Onboarding screens:** the Assessment Intro changes from "2 tests" to "a few quick measurements"; the two test screens become five measured steps + a relaxation/symptom screen + the existing context questions. The Phase Ring and band-grid components already built cover all of these — no new components, just more instances.
- **Plan Preview** gets richer and more credible: it can show a small five-axis profile (the obsidian/lime radar or bars) instead of one index number — which is a stronger visual proof of "training that actually measures," and reinforces the USP we built the whole funnel around.
- **The generator** finally has inputs worth the word "personalised" — which is also what makes the AI-consent value proposition real rather than cosmetic.
- **The 8-week retest** becomes a multi-axis before/after, the strongest version of the renewal moment.

## Open decisions for you
1. **How hard to lean on the relaxation/down-training branch in v1** — full archetype routing (my recommendation, it's the safety-critical bit), or ship strengthening + foundation first and fast-follow down-training? I'd argue the screen at minimum must ship even if the full down-training *track* is lean, because skipping it risks harm.
2. **Five-axis profile visual on Plan Preview** — radar vs. five bars. Radar is more "instrument cluster" (on-brand) but harder to read at small sizes; bars are clearer. Worth a quick design test.
3. **Where the sensitive context flags live** — inside the funnel (higher completion, more friction) or deferred to first program setup. Privacy-sensitive, so worth deciding deliberately.
