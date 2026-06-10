// Obsidian Kinetic: 11 · Active Session (handoff §4 Phase A).
// PhaseRing hero (glow = live), phase word + countdown inside the ring,
// exercise progress dots, SET/REP/TIME meta row, lime pause disc, muted
// End link. Pause sheet is "still to design" in Figma (handoff §4) so it
// reuses the same token styling in-place.
//
// All engine + persistence logic is unchanged from the pre-redesign
// player: session-engine runner, 50ms tick, Supabase logging, RPE
// routing with the inserted session id.
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pause } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, PhaseRing } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { EXERCISES, getExercise } from '@/lib/exercises';
import { play, patternForPhase } from '@/lib/haptics';
import { color, overlay, radius, spacing, type } from '@/lib/obsidian/tokens';
import {
  type SessionState,
  type SessionRunner,
  buildTimeline,
  createSessionRunner,
} from '@/lib/session-engine';
import { fetchTodayProgramDay, logCompletedSession } from '@/lib/sessions';
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

// Work phases carry the lime; release is cyan ("system feedback");
// prep/rest stay muted. Used for the phase caption above the ring.
function phaseColor(kind: PhaseKind): string {
  switch (kind) {
    case 'squeeze':
    case 'hold':
      return color.primaryContainer;
    case 'release':
      return color.secondaryContainer;
    default:
      return color.onSurfaceVariant;
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

  function handleEnd() {
    // Double-confirm: the affordance is small + muted but the action is
    // destructive (this session's progress won't be saved).
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
          .then((id) => {
            sessionIdRef.current = id;
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
    // Pass session stats as router params: player → RPE → complete. The
    // RPE screen attaches the effort rating to the just-logged session row.
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
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.containerPadding,
          }}
        >
          <Text style={{ ...type.headlineLg, color: color.primaryContainer }}>
            Session complete
          </Text>
          <Text
            style={{
              ...type.bodyMd,
              color: color.onSurfaceVariant,
              marginTop: spacing.stackSm,
              textAlign: 'center',
            }}
          >
            Nice. Consistency is the whole game.
          </Text>
          <Button
            label="Continue"
            onPress={() =>
              router.replace({
                pathname: '/session/rpe',
                params: {
                  sessionId: sessionIdRef.current ?? '',
                  durationS: durationS.toString(),
                  reps: totalReps.toString(),
                  dayNumber: todayMeta?.dayNumber?.toString() ?? '',
                  weekNumber: todayMeta?.weekNumber?.toString() ?? '',
                },
              })
            }
            style={{ marginTop: spacing.stackLg, alignSelf: 'stretch' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const phaseProgress =
    state.phase.durationMs > 0
      ? Math.min(1, state.phaseElapsedMs / state.phase.durationMs)
      : 1;

  const currentExercise = day.exercises[state.phase.exerciseIndex];
  const dayNumber = todayDayQuery.data?.dayNumber;
  const countdownS = Math.ceil(
    (state.phase.durationMs - state.phaseElapsedMs) / 1000,
  );
  const elapsedLabel = formatElapsed(Math.floor(state.totalElapsedMs / 1000));
  const headerLabel = currentExercise
    ? dayNumber
      ? `DAY ${dayNumber} · ${currentExercise.name}`
      : currentExercise.name
    : dayNumber
      ? `DAY ${dayNumber}`
      : '';
  const setLabel = currentExercise
    ? `${state.phase.setIndex + 1}/${currentExercise.sets}`
    : '—';
  const repLabel = currentExercise
    ? `${state.phase.repIndex + 1}/${currentExercise.reps}`
    : '—';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.containerPadding,
          paddingVertical: spacing.stackLg,
        }}
      >
        {/* Context header */}
        <View style={{ alignItems: 'center', minHeight: 24 }}>
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            {headerLabel}
          </Text>
        </View>

        {/* Hero: phase word above the ring, ring carries countdown +
            SECONDS caption. Glow only while live (motion spec §4). */}
        <View
          style={{ alignItems: 'center' }}
          accessibilityLabel={`${phaseAnnouncement(state.phase.kind)}, ${countdownS} seconds remaining`}
          accessibilityLiveRegion="polite"
        >
          <Text
            style={{
              ...type.headlineMd,
              color: phaseColor(state.phase.kind),
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            {phaseAnnouncement(state.phase.kind)}
          </Text>
          <View style={{ marginTop: spacing.stackLg }}>
            <PhaseRing
              progress={phaseProgress}
              glow={!isPaused}
              time={String(countdownS)}
              caption="seconds"
              durationMs={state.phase.durationMs}
            />
          </View>
          {/* Exercise progress dots — done dim-lime · current lime ·
              upcoming outline */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.stackSm,
              marginTop: spacing.stackLg,
            }}
          >
            {day.exercises.map((ex, i) => {
              const dotColor =
                i < state.phase.exerciseIndex
                  ? color.primaryFixedDim
                  : i === state.phase.exerciseIndex
                    ? color.primaryContainer
                    : color.outlineVariant;
              return (
                <View
                  key={`${ex.slug}-${i}`}
                  style={{
                    width: i === state.phase.exerciseIndex ? 20 : 6,
                    height: 6,
                    borderRadius: radius.full,
                    backgroundColor: dotColor,
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* Bottom: meta row · lime pause disc · End link */}
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.stackLg,
            }}
          >
            <StatCol kicker="SET" value={setLabel} />
            <DividerDot />
            <StatCol kicker="REP" value={repLabel} />
            <DividerDot />
            <StatCol kicker="TIME" value={elapsedLabel} />
          </View>

          <Pressable
            onPress={handlePause}
            accessibilityRole="button"
            accessibilityLabel="Pause session"
            hitSlop={8}
            style={({ pressed }) => ({
              marginTop: spacing.stackLg + spacing.stackSm,
              width: 72,
              height: 72,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: color.primaryContainer,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Pause
              size={28}
              color={color.onPrimaryFixed}
              fill={color.onPrimaryFixed}
            />
          </Pressable>

          <Pressable
            onPress={handleEnd}
            accessibilityRole="button"
            accessibilityLabel="End session"
            hitSlop={8}
            style={({ pressed }) => ({
              marginTop: spacing.stackMd,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
              End session
            </Text>
          </Pressable>
        </View>
      </View>

      {isPaused ? (
        <PauseOverlay
          state={state}
          exercise={currentExercise}
          onResume={handleResume}
          onEnd={handleEnd}
        />
      ) : null}
    </SafeAreaView>
  );
}

// Pause sheet — modal overlay on /session/player (keeps runner state
// alive; a separate route would lose it on mount). Obsidian Kinetic
// restyle of the v1.2 sheet; the dedicated Figma pause sheet is still
// to design (handoff §4) so this is the token-faithful interim.
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
  const setLabel = exercise
    ? `${state.phase.setIndex + 1}/${exercise.sets}`
    : '—';
  const repLabel = exercise
    ? `${state.phase.repIndex + 1}/${exercise.reps}`
    : '—';
  const phaseLabel = shortPhaseLabel(state.phase.kind);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: overlay.scrim,
      }}
      accessibilityViewIsModal
    >
      <View
        style={{
          width: '100%',
          paddingHorizontal: spacing.containerPadding,
          paddingBottom: 28,
          paddingTop: spacing.gutter,
          backgroundColor: color.surfaceContainerLow,
          borderTopLeftRadius: spacing.stackLg,
          borderTopRightRadius: spacing.stackLg,
        }}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 36,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: color.outline,
            opacity: 0.5,
          }}
        />

        <View style={{ alignItems: 'center', marginTop: spacing.stackMd }}>
          <Text style={{ ...type.labelCaps, color: color.primaryContainer }}>
            Paused
          </Text>
          <Text
            style={{
              ...type.display,
              fontSize: 64,
              lineHeight: 72,
              color: color.onSurface,
              marginTop: 6,
            }}
          >
            {elapsedLabel}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.stackMd + 4,
            gap: spacing.stackLg,
          }}
        >
          <StatCol kicker="SET" value={setLabel} />
          <DividerDot />
          <StatCol kicker="REP" value={repLabel} />
          <DividerDot />
          <StatCol kicker="PHASE" value={phaseLabel} />
        </View>

        <View style={{ marginTop: spacing.stackLg + spacing.stackSm }}>
          <Button label="Resume" onPress={onResume} />
          <Pressable
            onPress={onEnd}
            accessibilityRole="button"
            accessibilityLabel="End session"
            style={({ pressed }) => ({
              height: 28,
              marginTop: spacing.gutter,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                ...type.bodyMd,
                fontSize: 14,
                lineHeight: 20,
                color: color.onSurfaceVariant,
              }}
            >
              End session
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function StatCol({ kicker, value }: { kicker: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
        {kicker}
      </Text>
      <Text
        style={{
          ...type.metricLg,
          fontSize: 22,
          lineHeight: 28,
          color: color.onSurface,
        }}
      >
        {value}
      </Text>
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
        backgroundColor: color.outline,
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
