import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PacerRing } from '@/components/session/PacerRing';
import { PhaseLabel, colorForPhase } from '@/components/session/PhaseLabel';
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
import type { PhaseKind, ProgramDay } from '@/lib/types';
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
  const runnerRef = useRef<SessionRunner | null>(null);
  const timelineRef = useRef<ReturnType<typeof buildTimeline>>([]);
  const startedAtRef = useRef<number>(0);

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
            onPress={() => router.replace('/session/complete')}
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
            onPress={() => router.replace('/home')}
            className="py-3 px-4 active:opacity-60"
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="End session"
          >
            <Text className="text-muted">End</Text>
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
    </SafeAreaView>
  );
}
