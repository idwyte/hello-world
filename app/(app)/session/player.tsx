// Obsidian Kinetic: 11 · Active Session — Figma node 57:225.
//
// Structure (top → bottom):
//   - ScreenHeader (close × + centered title "Day N · {programName}")
//   - PHASE n OF N · KIND lime caps kicker
//   - HUGE phase verb headline (56px Bold uppercase, e.g. "HOLD")
//   - PhaseRing — countdown + contextual caption inside ("HOLD —
//     KEEP BREATHING")
//   - Phase progress dots
//   - Flex spacer
//   - Full-width lime Pause button
//   - "Skip phase" ghost text
//
// "Phases" in Figma maps to `day.exercises` length: the program day has
// N exercises, each treated as a phase block. The engine's inner
// squeeze/hold/release kinds become the contextual caption and big verb.
//
// Engine wiring unchanged: session-engine runner, 50ms tick, supabase
// log on complete, sessionIdRef → /session/rpe.
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, PhaseRing } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { EXERCISES, getExercise } from '@/lib/exercises';
import { play, patternForPhase } from '@/lib/haptics';
import { color, motion, radius, spacing, type } from '@/lib/obsidian/tokens';
import {
  type SessionState,
  type SessionRunner,
  buildTimeline,
  createSessionRunner,
} from '@/lib/session-engine';
import { fetchTodayProgramDay, logCompletedSession } from '@/lib/sessions';
import type { PhaseKind, ProgramDay } from '@/lib/types';
import { useSessionStore } from '@/stores/session';

function fallbackDay(): ProgramDay {
  const short = getExercise('short_holds');
  const quick = getExercise('quick_flicks');
  return {
    dayIndex: 0,
    exercises: [short, quick],
    targetDurationS: 240,
  };
}

// Big headline word: CONTRACT / HOLD / RELEASE / REST / READY.
// Down-training days contain only release-pool content. They get the
// breathing ring (anti-hero animation, motion spec §3.2) and the
// haptic exception: no impactMedium punches, the ring's own faint
// selectionClick at the top of each inhale is the only feedback.
const RELEASE_POOL = ['reverse_kegels', 'deep_squat_breath'];
function isReleaseDay(day: ProgramDay): boolean {
  return (
    day.exercises.length > 0 &&
    day.exercises.every((ex) => RELEASE_POOL.includes(ex.slug))
  );
}

function phaseVerb(kind: PhaseKind): string {
  switch (kind) {
    case 'prep':
      return 'READY';
    case 'squeeze':
      return 'CONTRACT';
    case 'hold':
      return 'HOLD';
    case 'release':
      return 'RELEASE';
    case 'rest':
      return 'REST';
    case 'done':
      return 'DONE';
  }
}

// Contextual caption shown INSIDE the ring under the countdown. Plain
// English, mono caps — matches Figma "HOLD — KEEP BREATHING".
function phaseRingCaption(kind: PhaseKind): string {
  switch (kind) {
    case 'prep':
      return 'GET READY';
    case 'squeeze':
      return 'CONTRACT — FIRM AND LIFT';
    case 'hold':
      return 'HOLD — KEEP BREATHING';
    case 'release':
      return 'RELEASE — LET IT GO';
    case 'rest':
      return 'REST — RECOVER';
    case 'done':
      return 'DONE';
  }
}

// VoiceOver announcement (full sentence, no caps tracking).
function phaseAnnouncement(kind: PhaseKind): string {
  switch (kind) {
    case 'prep':
      return 'Get ready';
    case 'squeeze':
      return 'Contract';
    case 'hold':
      return 'Hold';
    case 'release':
      return 'Release';
    case 'rest':
      return 'Rest';
    case 'done':
      return 'Session complete';
  }
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Player() {
  const router = useRouter();
  const logSession = useSessionStore((s) => s.logSession);
  const queryClient = useQueryClient();
  const [tick, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const runnerRef = useRef<SessionRunner | null>(null);
  const timelineRef = useRef<ReturnType<typeof buildTimeline>>([]);
  const startedAtRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);

  function handlePause() {
    runnerRef.current?.pause();
    setIsPaused(true);
    AccessibilityInfo.announceForAccessibility('Paused');
  }

  function handleResume() {
    runnerRef.current?.resume();
    setIsPaused(false);
    AccessibilityInfo.announceForAccessibility('Resumed');
  }

  function handleSkipPhase() {
    runnerRef.current?.skip();
    setTick((t) => t + 1);
  }

  function handleClose() {
    Alert.alert(
      'End this session?',
      "Your progress for this day won't be saved.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End session',
          style: 'destructive',
          onPress: () => {
            runnerRef.current?.stop();
            router.replace('/home');
          },
        },
      ],
    );
  }

  const todayDayQuery = useQuery({
    queryKey: ['program-day', 'today'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchTodayProgramDay,
  });

  const { day, programDayId } = useMemo<{
    day: ProgramDay;
    programDayId: string | null;
  }>(() => {
    const today = todayDayQuery.data;
    if (!today) return { day: fallbackDay(), programDayId: null };
    const exercises = today.exercises
      .map((slug) => EXERCISES[slug])
      .filter((e): e is NonNullable<typeof e> => Boolean(e));
    if (exercises.length === 0)
      return { day: fallbackDay(), programDayId: today.programDayId };
    return {
      day: {
        dayIndex: 0,
        exercises,
        targetDurationS: today.targetDurationS,
      },
      programDayId: today.programDayId,
    };
  }, [todayDayQuery.data]);

  useEffect(() => {
    const timeline = buildTimeline(day);
    timelineRef.current = timeline;
    const repsPlanned = day.exercises.reduce(
      (acc, ex) => acc + ex.sets * ex.reps,
      0,
    );
    startedAtRef.current = Date.now();

    const runner = createSessionRunner(timeline, {
      onPhaseStart: (phase) => {
        // Down-training exception (motion spec §2): punchy haptics
        // contradict "let go" — release days stay silent here.
        const pattern = isReleaseDay(day) ? null : patternForPhase(phase.kind);
        if (pattern) void play(pattern);
        AccessibilityInfo.announceForAccessibility(
          phaseAnnouncement(phase.kind),
        );
        setTick((t) => t + 1);
      },
      onPhaseEnd: () => setTick((t) => t + 1),
      onComplete: () => {
        const endedAt = Date.now();
        logSession({
          id: `s_${startedAtRef.current}`,
          startedAt: startedAtRef.current,
          endedAt,
          mode: 'normal',
          repsPlanned,
          repsCompleted: repsPlanned,
          completed: true,
        });
        void logCompletedSession({
          programDayId,
          startedAt: new Date(startedAtRef.current),
          endedAt: new Date(endedAt),
          mode: 'normal',
          repsPlanned,
          repsCompleted: repsPlanned,
        })
          .then((id) => {
            sessionIdRef.current = id;
            void queryClient.invalidateQueries({ queryKey: ['streak'] });
            void queryClient.invalidateQueries({ queryKey: ['sessions'] });
          })
          .catch(() => {});
        setTick((t) => t + 1);
      },
      onAbort: () => setTick((t) => t + 1),
    });

    runnerRef.current = runner;
    runner.start();
    void play('sessionStart');

    const id = setInterval(() => {
      runner.tick(Date.now());
      setTick((t) => t + 1);
    }, 50);

    return () => {
      clearInterval(id);
      runner.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, programDayId]);

  const releaseDay = isReleaseDay(day);
  const reducedMotion = useReducedMotion();
  const state: SessionState | null = runnerRef.current?.getState() ?? null;
  void tick;

  if (!state) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: color.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
          Loading…
        </Text>
      </SafeAreaView>
    );
  }

  if (state.status === 'done') {
    const durationS = Math.max(
      0,
      Math.floor((Date.now() - startedAtRef.current) / 1000),
    );
    const totalReps = day.exercises.reduce(
      (acc, ex) => acc + ex.sets * ex.reps,
      0,
    );
    const todayMeta = todayDayQuery.data;
    // Auto-forward to RPE — no intermediate confirm needed in the
    // Obsidian Kinetic flow (Figma 12 acts as that confirmation).
    setTimeout(() => {
      router.replace({
        pathname: '/session/rpe',
        params: {
          sessionId: sessionIdRef.current ?? '',
          durationS: durationS.toString(),
          reps: totalReps.toString(),
          dayNumber: todayMeta?.dayNumber?.toString() ?? '',
          weekNumber: todayMeta?.weekNumber?.toString() ?? '',
        },
      });
    }, 0);
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: color.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
          Finishing…
        </Text>
      </SafeAreaView>
    );
  }

  const phase = state.phase;
  const phaseCountdownMs = Math.max(0, phase.durationMs - state.phaseElapsedMs);
  const phaseProgress =
    phase.durationMs > 0
      ? Math.min(1, state.phaseElapsedMs / phase.durationMs)
      : 1;

  const programName =
    day.exercises
      .map((ex) => ex.name)
      .slice(0, 2)
      .join(' + ') || 'Session';
  const dayNumber = todayDayQuery.data?.dayNumber ?? 1;

  // "Phases" unit = exercises in the day. The current "phase number" is
  // the exercise index + 1.
  const phaseNumber = phase.exerciseIndex + 1;
  const totalPhases = day.exercises.length;
  const verb = phaseVerb(phase.kind);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: spacing.containerPadding,
          paddingBottom: spacing.stackLg + spacing.stackMd,
        }}
      >
        {/* Header — × close, centered title */}
        <View
          style={{
            height: 56,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            onPress={handleClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="End session"
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={24} color={color.onSurface} />
          </Pressable>
          <Text
            style={{
              ...type.labelButton,
              color: color.onSurface,
              flex: 1,
              textAlign: 'center',
            }}
          >
            Day {dayNumber} · {programName}
          </Text>
          <View style={{ width: 44, height: 44 }} />
        </View>

        <View style={{ height: spacing.stackLg }} />

        {/* PHASE n OF N · KIND */}
        <Text
          style={{ ...type.labelCaps, color: color.primaryFixedDim }}
          accessibilityLiveRegion="polite"
        >
          PHASE {phaseNumber} OF {totalPhases} · {verb}
        </Text>

        <View style={{ height: spacing.stackSm }} />

        {/* Huge verb headline — cross-fades on phase change (spec §3.5:
            session phases cross-fade, you're in one place, time passes) */}
        <Animated.View
          key={`verb-${state.phaseIndex}`}
          entering={reducedMotion ? undefined : FadeIn.duration(motion.base)}
        >
          <Text
            style={{
              ...type.headlineLg,
              fontSize: 56,
              lineHeight: 52,
              letterSpacing: -1.12,
              color: releaseDay ? color.secondaryContainer : color.onSurface,
              textTransform: 'uppercase',
            }}
          >
            {releaseDay ? 'BREATHE' : verb}
          </Text>
        </Animated.View>

        <View style={{ height: spacing.stackLg + spacing.stackMd }} />

        {/* Ring — breathing mode on release days (4s in · 2s hold ·
            6s out, no glow pulse) */}
        <PhaseRing
          progress={phaseProgress}
          mode={releaseDay ? 'breathing' : 'performance'}
          glow={!isPaused && !releaseDay}
          time={formatCountdown(phaseCountdownMs)}
          caption={
            releaseDay
              ? 'BREATHE WITH THE RING'
              : phaseRingCaption(phase.kind)
          }
          size={280}
          strokeWidth={6}
          durationMs={phase.durationMs}
        />

        <View style={{ height: spacing.stackLg }} />

        {/* Phase dots */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {day.exercises.map((ex, i) => {
            const isDone = i < phase.exerciseIndex;
            const isCurrent = i === phase.exerciseIndex;
            return (
              <View
                key={`${ex.slug}-${i}`}
                style={{
                  width: isCurrent ? 12 : 8,
                  height: 8,
                  borderRadius: radius.full,
                  backgroundColor:
                    isDone || isCurrent
                      ? color.primaryContainer
                      : color.surfaceContainerHigh,
                  opacity: isDone ? 0.55 : 1,
                }}
              />
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        {/* Pause + Skip phase — uses the shared Button so the press
            feedback (scale to 0.98 + primaryPress haptic) matches the
            rest of the system instead of a custom opacity dim. */}
        <Button
          label={isPaused ? 'Resume' : 'Pause'}
          onPress={isPaused ? handleResume : handlePause}
          accessibilityLabel={isPaused ? 'Resume session' : 'Pause session'}
          style={{ width: '100%' }}
        />

        <Pressable
          onPress={handleSkipPhase}
          accessibilityRole="button"
          accessibilityLabel="Skip phase"
          hitSlop={8}
          style={({ pressed }) => ({
            marginTop: spacing.gutter,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            style={{ ...type.labelButton, color: color.onSurfaceVariant }}
          >
            Skip phase
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
