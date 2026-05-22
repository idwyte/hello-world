import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Play } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PacerRing } from '@/components/session/PacerRing';
import { PhaseLabel, colorForPhase } from '@/components/session/PhaseLabel';
import { Body, Button } from '@/components/ui';
import { hasSupabaseConfig } from '@/lib/env';
import { EXERCISES, getExercise } from '@/lib/exercises';
import { play, patternForPhase } from '@/lib/haptics';
import {
  type SessionState,
  type SessionRunner,
  buildTimeline,
  createSessionRunner,
} from '@/lib/session-engine';
import { fetchTodayProgramDay, logCompletedSession } from '@/lib/sessions';
import { semantic } from '@/lib/theme';
import type { ExerciseTemplate, PhaseKind, ProgramDay } from '@/lib/types';
import { useSessionStore } from '@/stores/session';

// Hardcoded program day for the dev-without-backend M1 path. When Supabase
// is configured the day comes from the user's active program (M3+ flow
// reads program_days from Supabase in the pre-session screen).
function fallbackDay(): ProgramDay {
  const short = getExercise('short_holds');
  const quick = getExercise('quick_flicks');
  return {
    dayIndex: 0,
    exercises: [short, quick],
    targetDurationS: 240,
  };
}

function phaseAnnouncement(kind: PhaseKind): string {
  switch (kind) {
    case 'prep':
      return 'Get ready';
    case 'squeeze':
      return 'Squeeze';
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

export default function Player() {
  const router = useRouter();
  const logSession = useSessionStore((s) => s.logSession);
  const queryClient = useQueryClient();
  const [tick, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const runnerRef = useRef<SessionRunner | null>(null);
  const timelineRef = useRef<ReturnType<typeof buildTimeline>>([]);
  const startedAtRef = useRef<number>(0);

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

  function handleEnd() {
    // Per Figma 30 spec: double-confirm because the End-session affordance
    // is small + muted but the action is destructive (this session's
    // progress won't be saved). Default to Cancel.
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

  // Fetch today's program day. If the query is still loading we start a
  // session against the fallback (M1 demo) day; the player blocks navigation
  // until the timeline is built so this is effectively synchronous from the
  // user's POV.
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
        const pattern = patternForPhase(phase.kind);
        if (pattern) void play(pattern);
        AccessibilityInfo.announceForAccessibility(phaseAnnouncement(phase.kind));
        setTick((t) => t + 1);
      },
      onPhaseEnd: () => {
        setTick((t) => t + 1);
      },
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
          .then(() => {
            void queryClient.invalidateQueries({ queryKey: ['streak'] });
            void queryClient.invalidateQueries({ queryKey: ['sessions'] });
          })
          .catch(() => {
            // Don't block the success screen on a sync failure.
          });
        setTick((t) => t + 1);
      },
      onAbort: () => {
        setTick((t) => t + 1);
      },
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

  const state: SessionState | null = runnerRef.current?.getState() ?? null;
  const total = timelineRef.current.length;
  const remainingPhases = state ? Math.max(0, total - state.phaseIndex - 1) : 0;

  void tick;

  if (!state) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <Text className="text-ink">Loading…</Text>
      </SafeAreaView>
    );
  }

  if (state.status === 'done') {
    // Pass session stats as router params to the celebration screen so it
    // can render DURATION / REPS / DAY · WEEK without re-querying.
    const durationS = Math.max(
      0,
      Math.floor((Date.now() - startedAtRef.current) / 1000),
    );
    const totalReps = day.exercises.reduce(
      (acc, ex) => acc + ex.sets * ex.reps,
      0,
    );
    const todayMeta = todayDayQuery.data;
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-success text-3xl font-semibold">
            Session complete
          </Text>
          <Text className="text-muted mt-2 text-center">
            Nice. Consistency is the whole game.
          </Text>
          {/* Route through /session/complete (Figma 14) for the celebration
              + rating + Done flow before returning to home. */}
          <Pressable
            onPress={() =>
              router.replace({
                pathname: '/session/complete',
                params: {
                  durationS: durationS.toString(),
                  reps: totalReps.toString(),
                  dayNumber: todayMeta?.dayNumber?.toString() ?? '',
                  weekNumber: todayMeta?.weekNumber?.toString() ?? '',
                },
              })
            }
            className="bg-accent rounded-xl mt-8 py-4 px-8 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text className="text-ink font-semibold">Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const phaseProgress =
    state.phase.durationMs > 0
      ? Math.min(1, state.phaseElapsedMs / state.phase.durationMs)
      : 1;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-between px-6 py-8">
        <View className="self-end">
          <Pressable
            onPress={handlePause}
            className="py-3 px-4 active:opacity-60"
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Pause session"
          >
            <Text className="text-muted">Pause</Text>
          </Pressable>
        </View>

        <View
          className="items-center"
          accessibilityLabel={`${phaseAnnouncement(state.phase.kind)}, ${Math.ceil((state.phase.durationMs - state.phaseElapsedMs) / 1000)} seconds remaining`}
          accessibilityLiveRegion="polite"
        >
          <PacerRing
            progress={phaseProgress}
            color={colorForPhase(state.phase.kind)}
          />
          <View className="absolute inset-0 items-center justify-center">
            <PhaseLabel kind={state.phase.kind} />
            <Text className="text-muted text-sm mt-3">
              {Math.ceil(
                (state.phase.durationMs - state.phaseElapsedMs) / 1000,
              )}
              s
            </Text>
          </View>
        </View>

        <View className="items-center">
          <Text className="text-muted text-sm">
            {remainingPhases} phases remaining
          </Text>
          <Text className="text-muted text-xs mt-1">
            Rep {state.phase.repIndex + 1} · Set {state.phase.setIndex + 1}
          </Text>
        </View>
      </View>

      {isPaused ? (
        <PauseOverlay
          state={state}
          exercise={day.exercises[state.phase.exerciseIndex]}
          onResume={handleResume}
          onEnd={handleEnd}
        />
      ) : null}
    </SafeAreaView>
  );
}

// Pause sheet (Figma 30 · node 114:336) — modal overlay on /session/player.
// Replaces the dead /session/pause route, which lost runner state on mount.
// Layout cross-referenced against the live Figma node 2026-05-22:
// 55% black scrim, sheet pinned to bottom with 24 px top corners and
// bg-page fill, 36×5 grabber at 50% opacity, accent PAUSED kicker (11 px
// medium, tracking 2 px) → 6 px gap → 64/72 elapsed timer → 20 px gap →
// stats row with 4 px ellipse dividers → flex spacer → 60 px Resume CTA
// with play glyph → 12 px gap → muted "End session" text link.
function PauseOverlay({
  state,
  exercise,
  onResume,
  onEnd,
}: {
  state: SessionState;
  exercise: ExerciseTemplate | undefined;
  onResume: () => void;
  onEnd: () => void;
}) {
  // totalElapsedMs is pause-aware in the engine — freezes at the moment
  // of pause via the `pausedAt - sessionStartedAt - totalPausedMs` branch.
  const elapsedS = Math.max(0, Math.floor(state.totalElapsedMs / 1000));
  const elapsedLabel = formatElapsed(elapsedS);
  // Stats show current/total per Figma ("2 / 3"). prep/rest phases
  // pre-empt exercise activity so we fall back to "—" when no exercise
  // is meaningful (timeline guards exerciseIndex within bounds otherwise).
  const setLabel = exercise ? `${state.phase.setIndex + 1} / ${exercise.sets}` : '—';
  const repLabel = exercise ? `${state.phase.repIndex + 1} / ${exercise.reps}` : '—';
  const phaseLabel = shortPhaseLabel(state.phase.kind);

  return (
    <View
      className="absolute inset-0 items-center justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      accessibilityViewIsModal
    >
      <View
        className="w-full px-6 pb-7"
        style={{
          paddingTop: 12,
          backgroundColor: semantic.surfaceCanvas,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <View
          className="self-center"
          style={{
            width: 36,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: semantic.textMuted,
            opacity: 0.5,
          }}
        />

        <View className="items-center" style={{ marginTop: 16 }}>
          <Text
            style={{
              fontFamily: 'Inter',
              fontWeight: '500',
              fontSize: 11,
              lineHeight: 14,
              letterSpacing: 2,
              color: semantic.interactivePrimary,
            }}
          >
            PAUSED
          </Text>
          <Body
            weight="semibold"
            color="primary"
            style={{ fontSize: 64, lineHeight: 72, marginTop: 6 }}
          >
            {elapsedLabel}
          </Body>
        </View>

        <View
          className="flex-row items-center justify-center"
          style={{ marginTop: 20, gap: 24 }}
        >
          <StatCol kicker="SET" value={setLabel} />
          <DividerDot />
          <StatCol kicker="REP" value={repLabel} />
          <DividerDot />
          <StatCol kicker="PHASE" value={phaseLabel} />
        </View>

        <View style={{ marginTop: 32 }}>
          <Button
            label="Resume"
            variant="primary"
            size="lg"
            radius="cta"
            leadingIcon={
              <Play size={14} color={semantic.textPrimary} fill={semantic.textPrimary} />
            }
            onPress={onResume}
          />
          <Pressable
            onPress={onEnd}
            accessibilityRole="button"
            accessibilityLabel="End session"
            className="active:opacity-60"
            style={{
              height: 28,
              marginTop: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Body
              color="muted"
              weight="medium"
              style={{ fontSize: 14, lineHeight: 20 }}
            >
              End session
            </Body>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function StatCol({ kicker, value }: { kicker: string; value: string }) {
  return (
    <View className="items-center" style={{ gap: 4 }}>
      <Text
        style={{
          fontFamily: 'Inter',
          fontWeight: '500',
          fontSize: 10,
          lineHeight: 14,
          letterSpacing: 1.2,
          color: semantic.textMuted,
        }}
      >
        {kicker}
      </Text>
      <Body
        weight="semibold"
        color="primary"
        style={{ fontSize: 22, lineHeight: 28 }}
      >
        {value}
      </Body>
    </View>
  );
}

function DividerDot() {
  return (
    <View
      style={{
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: semantic.textMuted,
        opacity: 0.5,
      }}
    />
  );
}

function shortPhaseLabel(kind: PhaseKind): string {
  switch (kind) {
    case 'prep':
      return 'Prep';
    case 'squeeze':
      return 'Squeeze';
    case 'hold':
      return 'Hold';
    case 'release':
      return 'Release';
    case 'rest':
      return 'Rest';
    case 'done':
      return 'Done';
  }
}

function formatElapsed(totalS: number): string {
  const m = Math.floor(totalS / 60);
  const s = totalS % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
