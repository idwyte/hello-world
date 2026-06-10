// Obsidian Kinetic — the v2 six-step assessment battery, shared by
// onboarding (/index-test) and the 8-week retest (/index-retest).
// Figma nodes 34:62 · 35:72 · 34:91 · 35:91 · 35:110 · 36:95 + the
// st · Can't Feel It interstitial (50:204).
// Copy: docs/hone-assessment-copy-deck.md. Logic: lib/assessment-v2.ts.
import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  PhaseRing,
  ScreenHeader,
  StateScreen,
} from '@/components/obsidian';
import {
  FAST_WINDOW_S,
  HOLD_CAP_S,
  type AssessmentV2Answers,
  type CoordinationFlag,
  type ReleaseAnswer,
  type SymptomFlag,
} from '@/lib/assessment-v2';
import { fireHaptic } from '@/lib/obsidian/haptics';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';

const STRENGTH_OPTIONS = [
  "I couldn't really feel anything",
  'A flicker, but weak',
  'A clear squeeze, light',
  'A solid squeeze with a definite lift',
  'A strong, full lift',
];

const COORDINATION_OPTIONS: Array<{
  flag: CoordinationFlag | null;
  label: string;
}> = [
  { flag: 'breath_hold', label: 'I held my breath' },
  { flag: 'abdominal_brace', label: 'My tummy tightened or pulled in hard' },
  { flag: 'glute_clench', label: 'My buttocks or thighs clenched' },
  {
    flag: 'bearing_down',
    label: 'I bore down / pushed out instead of lifting',
  },
  { flag: null, label: 'None of these — just a clean lift' },
];

const RELEASE_OPTIONS: Array<{ value: ReleaseAnswer; label: string }> = [
  { value: 'easy', label: 'Yes, it lets go easily' },
  { value: 'partial', label: 'Sort of — slow or partial' },
  { value: 'tight', label: "No, it stays tight / can't feel it release" },
];

const SYMPTOM_OPTIONS: Array<{
  flag: SymptomFlag;
  label: string;
  emphasis?: boolean;
}> = [
  { flag: 'pelvic_pain', label: 'Aching or pain in the pelvic area' },
  { flag: 'pain_with_sex', label: 'Pain during or after sex' },
  { flag: 'urgency', label: 'Urgency — needing to rush to the loo' },
  { flag: 'incomplete_emptying', label: 'Trouble emptying, or constipation' },
  // The decisive flag in the literature — visually emphasised (cyan) in
  // Figma 36:129 and weighted decisively in routing.
  {
    flag: 'worse_after_kegels',
    label: 'Symptoms feel worse after Kegels',
    emphasis: true,
  },
];

const PAIN_STOP_RULE =
  "Stop if anything hurts. Pain isn't something to push through here.";

function formatMmSs(totalS: number): string {
  const m = Math.floor(totalS / 60);
  const s = Math.floor(totalS % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function AssessmentBatteryV2({
  onFinish,
  onExit,
}: {
  onFinish: (answers: AssessmentV2Answers) => void;
  /** Called when Back is pressed on step 1. */
  onExit: () => void;
}) {
  const [step, setStep] = useState(1);

  // Step state lives here so Back can restore it.
  const [strength, setStrength] = useState<number | null>(null);
  const [holdSeconds, setHoldSeconds] = useState<number | null>(null);
  const [reps, setReps] = useState(5);
  const [fastCount, setFastCount] = useState<number | null>(null);
  const [coordination, setCoordination] = useState<CoordinationFlag[]>([]);
  const [coordinationNone, setCoordinationNone] = useState(false);
  const [release, setRelease] = useState<ReleaseAnswer | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomFlag[]>([]);
  // "Can't Feel It" interstitial (Figma 50:204): shown when the user
  // picks "couldn't feel anything" — normalising, never alarming.
  const [showCantFeel, setShowCantFeel] = useState(false);

  function goBack() {
    if (step === 1) {
      onExit();
      return;
    }
    setStep((s) => s - 1);
  }

  function finish() {
    if (
      strength === null ||
      holdSeconds === null ||
      fastCount === null ||
      release === null
    ) {
      return;
    }
    onFinish({
      strengthOxford: strength,
      enduranceSeconds: holdSeconds,
      repCeiling: reps,
      fastCount,
      coordinationFlags: coordinationNone ? [] : coordination,
      release,
      symptomFlags: symptoms,
    });
  }

  if (showCantFeel) {
    return (
      <StateScreen
        onBack={() => setShowCantFeel(false)}
        kicker="STEP 1 · STRENGTH"
        title="That's completely normal"
        body="Lots of people can't feel much at first — it doesn't mean it isn't working. We'll start you with awareness and breathing, and you'll build the connection over a couple of weeks."
        primaryLabel="Start with the basics"
        onPrimary={() => {
          // strength stays 0 → the foundation archetype routes them to
          // awareness/isolation work automatically.
          setShowCantFeel(false);
          setStep(2);
        }}
        ghostLabel="Try the squeeze again"
        onGhost={() => {
          setStrength(null);
          setShowCantFeel(false);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader variant="back" title="Assessment" onPress={goBack} />
      {step === 1 && (
        <StrengthStep
          value={strength}
          onSelect={(v) => {
            void fireHaptic('selection');
            setStrength(v);
          }}
          onContinue={() =>
            strength === 0 ? setShowCantFeel(true) : setStep(2)
          }
        />
      )}
      {step === 2 && (
        <StaminaStep
          onDone={(s) => {
            setHoldSeconds(s);
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <RepsStep
          value={reps}
          onChange={(v) => {
            void fireHaptic('selection');
            setReps(v);
          }}
          onContinue={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <SpeedStep
          onDone={(n) => {
            setFastCount(n);
            setStep(5);
          }}
        />
      )}
      {step === 5 && (
        <ControlStep
          flags={coordination}
          none={coordinationNone}
          onToggle={(f) => {
            void fireHaptic('selection');
            setCoordinationNone(false);
            setCoordination((prev) =>
              prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
            );
          }}
          onNone={() => {
            void fireHaptic('selection');
            setCoordinationNone(true);
            setCoordination([]);
          }}
          onContinue={() => setStep(6)}
        />
      )}
      {step === 6 && (
        <ReleaseStep
          release={release}
          symptoms={symptoms}
          onRelease={(v) => {
            void fireHaptic('selection');
            setRelease(v);
          }}
          onToggleSymptom={(f) => {
            // Deliberately NO haptic on symptom flags — gravity, not
            // gamification (motion spec §2).
            setSymptoms((prev) =>
              prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
            );
          }}
          onContinue={finish}
        />
      )}
    </SafeAreaView>
  );
}

// — Shared chrome —

function StepShell({
  kicker,
  kickerColor = color.onSurfaceVariant,
  title,
  body,
  children,
  cta,
  ctaDisabled,
  onCta,
  centered = false,
}: {
  kicker: string;
  kickerColor?: string;
  title: string;
  body: string;
  children: React.ReactNode;
  cta: string;
  ctaDisabled?: boolean;
  onCta: () => void;
  centered?: boolean;
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: spacing.containerPadding,
        paddingTop: spacing.containerPadding,
        paddingBottom: spacing.stackLg + spacing.stackMd,
        gap: spacing.gutter,
        alignItems: centered ? 'center' : 'stretch',
      }}
    >
      <Text style={{ ...type.labelCaps, color: kickerColor }}>{kicker}</Text>
      <Text
        style={{
          ...type.headlineLg,
          color: color.onSurface,
          textAlign: centered ? 'center' : 'left',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          ...type.bodyMd,
          color: color.onSurfaceVariant,
          textAlign: centered ? 'center' : 'left',
        }}
      >
        {body}
      </Text>
      {children}
      <Button
        label={cta}
        disabled={ctaDisabled}
        onPress={onCta}
        style={{ width: '100%' }}
      />
    </ScrollView>
  );
}

function OptionRow({
  label,
  selected,
  onPress,
  control,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  control: 'radio' | 'checkbox';
}) {
  const accent = color.primaryContainer;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={control === 'radio' ? 'radio' : 'checkbox'}
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={label}
      style={{
        backgroundColor: color.surfaceContainerLow,
        borderColor: selected ? accent : glass.border,
        borderWidth: selected ? 2 : 1,
        borderRadius: radius.xl,
        padding: spacing.stackMd,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.gutter,
      }}
    >
      <Text
        style={{
          ...(selected ? type.labelButton : type.bodyLg),
          flex: 1,
          color: selected ? color.primaryFixedDim : color.onSurface,
        }}
      >
        {label}
      </Text>
      {control === 'radio' ? (
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: radius.full,
            borderWidth: selected ? 0 : 1.5,
            borderColor: color.outline,
            backgroundColor: selected ? accent : 'transparent',
          }}
        />
      ) : (
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: radius.default,
            borderWidth: selected ? 0 : 1.5,
            borderColor: color.outline,
            backgroundColor: selected ? accent : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected ? (
            <Check size={14} color={color.onPrimaryFixed} strokeWidth={3} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

// — Step 1 · Strength —

function StrengthStep({
  value,
  onSelect,
  onContinue,
}: {
  value: number | null;
  onSelect: (v: number) => void;
  onContinue: () => void;
}) {
  return (
    <StepShell
      kicker="STEP 1 OF 6 · STRENGTH"
      title="How strong is one squeeze?"
      body="Tighten your pelvic floor — like stopping the flow of urine, or holding in wind — as firmly as you can. Lift up and in, then let go. How did that feel?"
      cta="Continue"
      ctaDisabled={value === null}
      onCta={onContinue}
    >
      <View style={{ gap: 10, paddingTop: spacing.stackSm, flex: 1 }}>
        {STRENGTH_OPTIONS.map((label, i) => (
          <OptionRow
            key={label}
            label={label}
            selected={value === i}
            onPress={() => onSelect(i)}
            control="radio"
          />
        ))}
      </View>
    </StepShell>
  );
}

// — Step 2 · Stamina (timed hold) —

function StaminaStep({ onDone }: { onDone: (seconds: number) => void }) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'result'>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (phase !== 'running') return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      const e = Date.now() - startRef.current;
      setElapsedMs(e);
      if (e >= HOLD_CAP_S * 1000) {
        clearInterval(id);
        setPhase('result');
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  const seconds = Math.min(HOLD_CAP_S, Math.round(elapsedMs / 1000));

  if (phase === 'result') {
    return (
      <StepShell
        kicker="STEP 2 OF 6 · STAMINA"
        kickerColor={color.secondaryContainer}
        title={`You held for ~${seconds} seconds.`}
        body="That's your starting hold. It'll grow — and you'll see it move at every retest."
        cta="Continue"
        onCta={() => onDone(seconds)}
        centered
      >
        <View style={{ flex: 1 }} />
      </StepShell>
    );
  }

  return (
    <StepShell
      kicker="STEP 2 OF 6 · STAMINA"
      kickerColor={color.secondaryContainer}
      title="How long can you hold?"
      body={`Squeeze and lift, then hold steady. Keep breathing. When it starts to fade, release — don't force past a strong fade. ${PAIN_STOP_RULE}`}
      cta={phase === 'idle' ? 'Start hold' : 'Release'}
      onCta={() => {
        if (phase === 'idle') {
          setElapsedMs(0);
          setPhase('running');
        } else {
          setPhase('result');
        }
      }}
      centered
    >
      <View style={{ flex: 1 }} />
      <PhaseRing
        progress={phase === 'running' ? elapsedMs / (HOLD_CAP_S * 1000) : 0}
        glow={phase === 'running'}
        time={formatMmSs(elapsedMs / 1000)}
        caption="HOLD TIME"
        size={280}
        strokeWidth={6}
        durationMs={HOLD_CAP_S * 1000}
      />
      <View style={{ flex: 1 }} />
    </StepShell>
  );
}

// — Step 3 · Repetitions (stepper) —

function RepsStep({
  value,
  onChange,
  onContinue,
}: {
  value: number;
  onChange: (v: number) => void;
  onContinue: () => void;
}) {
  return (
    <StepShell
      kicker="STEP 3 OF 6 · REPEAT"
      title="How many good holds in a row?"
      body="Repeat that hold — squeeze, lift, hold a few seconds, fully release — and count only the ones as strong as the first. Stop when quality drops, not when you're exhausted."
      cta="Continue"
      onCta={onContinue}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.stackLg,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing.stackLg,
          flex: 1,
        }}
      >
        <Pressable
          onPress={() => onChange(Math.max(0, value - 1))}
          accessibilityRole="button"
          accessibilityLabel="Decrease"
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.full,
            backgroundColor: color.surfaceContainerHigh,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...type.headlineLg, color: color.onSurface }}>–</Text>
        </Pressable>
        <Text
          style={{
            ...type.display,
            color: color.primaryFixedDim,
            minWidth: 72,
            textAlign: 'center',
          }}
        >
          {value}
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(10, value + 1))}
          accessibilityRole="button"
          accessibilityLabel="Increase"
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.full,
            backgroundColor: color.surfaceContainerHigh,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...type.headlineLg, color: color.onSurface }}>+</Text>
        </Pressable>
      </View>
    </StepShell>
  );
}

// — Step 4 · Speed (15 s tap counter) —

function SpeedStep({ onDone }: { onDone: (count: number) => void }) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'result'>('idle');
  const [remainingMs, setRemainingMs] = useState(FAST_WINDOW_S * 1000);
  const [count, setCount] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (phase !== 'running') return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      const remaining = FAST_WINDOW_S * 1000 - (Date.now() - startRef.current);
      setRemainingMs(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(id);
        setPhase('result');
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  if (phase === 'result') {
    return (
      <StepShell
        kicker="STEP 4 OF 6 · SPEED"
        kickerColor={color.secondaryContainer}
        title={`You managed ~${count} quick squeezes.`}
        body="That's your fast-twitch baseline — the muscles that catch a cough or a sneeze."
        cta="Continue"
        onCta={() => onDone(count)}
        centered
      >
        <View style={{ flex: 1 }} />
      </StepShell>
    );
  }

  return (
    <StepShell
      kicker="STEP 4 OF 6 · SPEED"
      kickerColor={color.secondaryContainer}
      title="Quick squeezes"
      body={`These work the fast muscles that catch a cough or sneeze. Squeeze and release as crisply as you can, fully letting go each time. ${FAST_WINDOW_S} seconds. ${PAIN_STOP_RULE}`}
      cta={phase === 'idle' ? 'Start' : 'Stop early'}
      onCta={() => {
        if (phase === 'idle') {
          setCount(0);
          setRemainingMs(FAST_WINDOW_S * 1000);
          setPhase('running');
        } else {
          setPhase('result');
        }
      }}
      centered
    >
      <View style={{ flex: 1 }} />
      <Pressable
        disabled={phase !== 'running'}
        onPress={() => {
          // The core tactile moment of the whole app (motion spec §2):
          // each registered contraction = impactMedium.
          void fireHaptic('contractionRegistered');
          setCount((c) => c + 1);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Tap each squeeze. Count ${count}`}
      >
        <PhaseRing
          progress={
            phase === 'running' ? 1 - remainingMs / (FAST_WINDOW_S * 1000) : 0
          }
          glow={phase === 'running'}
          time={formatMmSs(remainingMs / 1000)}
          caption={`TAP EACH SQUEEZE · ${count}`}
          size={280}
          strokeWidth={6}
          durationMs={FAST_WINDOW_S * 1000}
        />
      </Pressable>
      <View style={{ flex: 1 }} />
    </StepShell>
  );
}

// — Step 5 · Control (multi-select with exclusive "none") —

function ControlStep({
  flags,
  none,
  onToggle,
  onNone,
  onContinue,
}: {
  flags: CoordinationFlag[];
  none: boolean;
  onToggle: (f: CoordinationFlag) => void;
  onNone: () => void;
  onContinue: () => void;
}) {
  const answered = none || flags.length > 0;
  return (
    <StepShell
      kicker="STEP 5 OF 6 · CONTROL"
      title="Check your technique"
      body="This is about how you squeeze, not how hard. Do one more gentle squeeze and notice your body. Tick anything that happened."
      cta="Continue"
      ctaDisabled={!answered}
      onCta={onContinue}
    >
      <View style={{ gap: 10, paddingTop: spacing.stackSm, flex: 1 }}>
        {COORDINATION_OPTIONS.map((opt) => (
          <OptionRow
            key={opt.label}
            label={opt.label}
            selected={opt.flag === null ? none : flags.includes(opt.flag)}
            onPress={() => (opt.flag === null ? onNone() : onToggle(opt.flag))}
            control="checkbox"
          />
        ))}
      </View>
    </StepShell>
  );
}

// — Step 6 · Release (safety-critical) —

function ReleaseStep({
  release,
  symptoms,
  onRelease,
  onToggleSymptom,
  onContinue,
}: {
  release: ReleaseAnswer | null;
  symptoms: SymptomFlag[];
  onRelease: (v: ReleaseAnswer) => void;
  onToggleSymptom: (f: SymptomFlag) => void;
  onContinue: () => void;
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: spacing.containerPadding,
        paddingTop: spacing.containerPadding,
        paddingBottom: spacing.stackLg + spacing.stackMd,
        gap: spacing.gutter,
      }}
    >
      <Text style={{ ...type.labelCaps, color: color.secondaryContainer }}>
        STEP 6 OF 6 · RELEASE
      </Text>
      <Text style={{ ...type.headlineLg, color: color.onSurface }}>
        Letting go is half the job
      </Text>
      <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
        Healthy pelvic floor muscles release as well as squeeze. After a
        squeeze, can you fully relax and feel everything settle back down?
      </Text>
      <View style={{ gap: spacing.stackSm, paddingTop: 4 }}>
        {RELEASE_OPTIONS.map((opt) => (
          <OptionRow
            key={opt.value}
            label={opt.label}
            selected={release === opt.value}
            onPress={() => onRelease(opt.value)}
            control="radio"
          />
        ))}
      </View>
      <Text style={{ ...type.headlineMd, color: color.onSurface }}>
        Do any of these sound familiar?
      </Text>
      <View style={{ gap: spacing.stackSm }}>
        {SYMPTOM_OPTIONS.map((opt) => {
          const selected = symptoms.includes(opt.flag);
          const accent = opt.emphasis
            ? color.secondaryContainer
            : color.primaryContainer;
          return (
            <Pressable
              key={opt.flag}
              onPress={() => onToggleSymptom(opt.flag)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={opt.label}
              style={{
                backgroundColor: color.surfaceContainerLow,
                borderColor: selected ? accent : glass.border,
                borderWidth: selected ? 2 : 1,
                borderRadius: radius.xl,
                paddingHorizontal: spacing.stackMd,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.gutter,
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: radius.default,
                  borderWidth: selected ? 0 : 1.5,
                  borderColor: color.outline,
                  backgroundColor: selected ? accent : 'transparent',
                }}
              />
              <Text
                style={{
                  ...type.bodyMd,
                  fontSize: 15,
                  flex: 1,
                  color:
                    selected && opt.emphasis
                      ? color.secondaryContainer
                      : color.onSurface,
                  fontFamily:
                    selected && opt.emphasis
                      ? type.labelButton.fontFamily
                      : type.bodyMd.fontFamily,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Button
        label="See my plan"
        disabled={release === null}
        onPress={onContinue}
        style={{ width: '100%', marginTop: spacing.stackSm }}
      />
    </ScrollView>
  );
}
