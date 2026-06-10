# Hone — Down-Training Track Spec

*The safety-critical archetype. For users whose relaxation screen flags a possible non-relaxing (hypertonic) pelvic floor — for whom strengthening Kegels are contraindicated and can worsen symptoms. Pairs with Assessment Logic v2. June 2026.*

> **Non-negotiable framing.** This track exists because, clinically, the wrong answer here causes harm. A hypertonic pelvic floor needs to learn to *release*, not contract; strengthening exercises can exacerbate pain, urinary urgency, painful sex, and constipation. Hone is a wellness tool, not a diagnostic device — so the goal of this track is **not to treat**, but to (a) stop the user doing the wrong thing, (b) give safe, well-established relaxation work, and (c) route them to a professional. Every screen in this track reinforces those three.

---

## Why this track is mandatory, not optional

The single most important clinical fact, repeated across every source: **for an overactive/hypertonic pelvic floor, Kegels are not recommended and can make things worse.** An overactive floor can even be *caused* by overdoing Kegels. If Hone's only output is strengthening, then for this user segment the product is actively counter-therapeutic. The relaxation screen + this track are what make Hone safe to ship to a general audience who self-select in without a clinician filtering them first.

A second, softer finding that shapes the product: relaxation/down-training is **beneficial even for non-hypertonic users** — flexibility matters as much as strength in any muscle, and a healthy regimen includes both. That means the down-training *content* isn't dead weight serving a small segment; elements of it (especially diaphragmatic breathing) belong in the mainstream strengthening track too, as the warm-up/foundation. Build it once, use it in two places.

---

## Entry: how a user lands here

From Assessment Logic v2, archetype routing runs **before** any dosing:

```
Relaxation screen flags → possible_hypertonic   (any of:)
  - cannot fully release / "let go" after a hold
  - pain during or after contraction
  - urinary urgency without infection
  - chronic constipation / incomplete emptying
  - reports symptoms get WORSE after doing Kegels
        ↓
  → DOWN-TRAINING archetype
```

Design principles for the gate:
- **Conservative by default.** Any single strong flag (especially pain, or symptoms worsening with Kegels) is enough to route here. False positive (a fine user gets gentle breathing work for a couple of weeks) is cheap; false negative (a pained floor told to strengthen) is harmful. Asymmetric cost → bias toward routing in.
- **No alarm.** The handoff copy must not read as a diagnosis or scare. "Based on your answers, we're starting you somewhere different" — calm, normal, reframed as *correct* personalisation, not as something being wrong with them.

---

## What the track actually prescribes

Established, non-insertive, self-administered relaxation work only. Nothing here requires a device or a clinician to be safe. Four content pillars, all well-supported in the literature:

### 1. Diaphragmatic ("pelvic floor") breathing — the spine of the track
The core exercise. On inhale, the diaphragm descends and the pelvic floor lengthens/drops; on exhale it returns — the two work like a piston. This down-trains a tight floor *without any contraction*.
- **Protocol:** lying, knees bent, one hand on chest (stays still), one on lower ribs/belly (rises). Inhale into belly + low back, feel the pelvic floor expand/lengthen away from the body; slow full exhale.
- **Dose:** 5–10 minutes daily. (Sources converge on this, and note many people feel reduced pain within ~2–3 weeks — useful for setting honest expectations and a check-in point.)
- **Common faults to coach:** shoulders rising = chest breathing (cue: shoulders stay down); belly held tight = not letting the breath in.

### 2. Reverse Kegels (gentle lengthening) — added after breathing is established
The deliberate *lengthening*/bearing-down-gently counterpart to a contraction — taught only once diaphragmatic breathing is reliable, so the user can feel the difference between release and strain. Never forceful.

### 3. Relaxation stretches — releasing the surrounding sling
Hip/pelvis openers that reduce demand on an overactive floor, paired with the breath. From the literature: **happy baby, hip-flexor stretch, hip external-rotator stretch (figure-4)**. Cue is "stretch to tension, not pain"; hold for ~6 slow breaths, inhale into the low-back ribs, long exhale, pause 3–6s, then ease a little deeper. Pain is always the stop signal.

### 4. Functional "drop" cues — applying release to real life
Small habits that interrupt the all-day clench: **"blow before you go"** (2–3 deep breaths before the bathroom to relax the floor for complete emptying); exhale-on-exertion instead of breath-holding; periodic posture/jaw/shoulder check-ins (tension travels).

---

## Program shape (8-week phase, mirrors the strengthening cadence)

So the two archetypes feel like the same product, the down-training phase uses the same weekly structure and the same 8-week retest rhythm — just different content and a different success definition.

| Weeks | Focus | Content |
|---|---|---|
| 1–2 | **Release foundation** | Diaphragmatic breathing daily, 5–10 min. Nothing else. Goal: feel the floor lengthen on inhale. |
| 3–4 | **Add lengthening** | Breathing + reverse Kegels once breath is reliable. Introduce 1–2 stretches. |
| 5–6 | **Integrate** | Breathing + reverse Kegels + full stretch set + functional drop cues in daily life. |
| 7–8 | **Consolidate + re-screen** | Maintain; **re-run the relaxation screen** at week 8. |

**Crucial difference from strengthening: NO progressive overload.** The strengthening track adds load weekly; this track does *not* push harder — pushing is the opposite of the point. Progression here is *quality of release* and *symptom reduction*, not duration or reps.

### Exit / transition logic at week-8 re-screen
```
IF relaxation screen now clears (releases fully, no pain, symptoms eased):
    → graduate to FOUNDATION track (awareness/coordination), THEN strengthening
      — gently, with relaxation work retained as warm-up
IF partially improved but flags remain:
    → repeat down-training phase, reinforce professional referral
IF no improvement OR worse:
    → do NOT progress; strong, direct prompt to see a pelvic floor physical
      therapist; offer to surface that recommendation prominently
```

The user is never trapped and never force-progressed. The only paths are: improve → graduate, or not → escalate to a human professional.

---

## The professional-referral spine (runs through the whole track)

This is the part that keeps Hone honest and on the right side of the wellness/medical line. Every source converges on "if unsure, or if symptoms persist, see a pelvic floor physical therapist." So:
- **At entry:** a clear, non-alarming note that these symptoms are common and that a pelvic floor PT is the gold standard if they want a definitive assessment — Hone is giving safe starting work in the meantime.
- **Persistently visible:** a standing "talk to a professional" affordance in the track (not buried).
- **At week-8 if not improved:** escalates from optional to a direct recommendation.
- **Always, on any pain that increases:** stop, and refer.

This is also the regulatory firewall: Hone never claims to treat hypertonic dysfunction; it provides general relaxation education and consistently points to clinical care.

---

## What the generator receives & must enforce

The archetype is set before dosing, so the generator's contract for this branch is mostly **prohibitions**:

```json
{
  "archetype": "down_training",
  "rules": {
    "no_strengthening_kegels": true,
    "no_progressive_overload": true,
    "no_breath_holding_or_valsalva": true,
    "content_pool": ["diaphragmatic_breathing","reverse_kegels","relaxation_stretches","functional_drop_cues"],
    "progression_axis": "release_quality_and_symptom_change",  // NOT duration/reps
    "professional_referral": "persistent",
    "pain_response": "halt_and_refer"
  }
}
```

The system prompt instruction, in plain terms: *this user must not be given strengthening contractions or progressive load; build an 8-week release-focused phase from the relaxation content pool; never increase difficulty as the success lever; keep professional referral visible and escalate it if the week-8 re-screen doesn't clear; on any reported pain increase, stop and refer.*

---

## Skeptical-engineer flags

1. **We cannot diagnose hypertonicity from a self-test — and must not imply we have.** The screen infers *possible* non-relaxation from symptom self-report. Copy must say "we're starting you with relaxation work" not "you have a hypertonic pelvic floor." The track is framed as safe, beneficial-to-everyone foundation work that also happens to be the right call if the floor is tight — which is *true*, and sidesteps false diagnosis.
2. **Down-training content partially overlaps the strengthening warm-up.** Don't fork the content library; tag exercises (breathing/stretch/release vs. contract/load) and let both archetypes draw from the shared pool with different rules. Less to build, less to drift.
3. **Symptom-worsening is the strongest signal and the cheapest to collect** — "do Kegels make it worse?" is one question and is decisive in the literature. Make sure that question is in the relaxation screen and weighted heavily in routing.
4. **Expectation-setting is a retention risk here.** Relaxation results are slower and subtler than "I held longer." Set the ~2–3 week expectation honestly up front, and make the week-8 re-screen the visible proof — symptom change, not performance numbers.
5. **This track must never gate behind the paywall in a way that traps a symptomatic user.** Whatever the pricing experiment does, the safety content + referral must be reachable. Cleanest: the relaxation foundation and the "see a professional" prompt are not premium-locked.

---

## Build implications

- **Assessment:** the relaxation screen (decision 1: full routing) must include the symptom flags above — crucially the "worse after Kegels?" question — and route conservatively.
- **Onboarding/Plan Preview:** needs a calm down-training variant of the plan-preview, not the strengthening one (different copy: release-focused, symptom-not-score framing, referral note). Buildable from existing components.
- **New screen type:** a persistent "see a professional" affordance/sheet — small, reusable, also useful elsewhere.
- **Content library:** tag for archetype eligibility; author the four relaxation pillars once.
- **Generator:** enforce the prohibition contract above; this is mostly guardrails, which the budget-fixed/rule path can do deterministically even without the AI call — meaning the *safe* path works for a user who declines AI consent, too.

## Open decisions for you
1. **Men's vs. women's stretch cueing.** Hone's audience skews men's-niche (per the Dr. Kegel pricing precedent). The breathing + reverse-Kegel + functional cues are gender-neutral; the specific stretches (happy baby, figure-4) are too, but some source language is women's-health framed. Want the content authored gender-neutral, or two cue variants?
2. **How visible is the referral at entry** — a full interstitial the user taps through, or a persistent banner inside the track? Interstitial is safer/clearer; banner is lower-friction. Given the stakes I lean interstitial at entry + banner thereafter.
3. **Does the relaxation foundation stay free** even under the lifetime/subscription experiment (my rec: yes, safety content shouldn't be paywalled)? Confirm and I'll note it for the RevenueCat setup.
