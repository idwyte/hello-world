import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { playCue, preloadCues, unloadCues } from '@/lib/audio/cues';
import { startDecoy, stopDecoy } from '@/lib/audio/decoy-track';
import { currentAudioRoute, type AudioRouteKind } from '@/lib/audio/routing';
import { hasSupabaseConfig } from '@/lib/env';
import { EXERCISES, getExercise } from '@/lib/exercises';
import {
  cancelAllHaptics,
  enableNativeHaptics,
  play,
  patternForPhase,
  setHapticsIntensity,
} from '@/lib/haptics';
import {
  type SessionRunner,
  type SessionState,
  buildTimeline,
  createSessionRunner,
} from '@/lib/session-engine';
import { fetchTodayProgramDay, logCompletedSession } from '@/lib/sessions';
import type { ProgramDay } from '@/lib/types';
import { useSessionStore } from '@/stores/session';
import { useSettingsStore } from '@/stores/settings';

function fallbackDay(): ProgramDay {
  const short = getExercise('short_holds');
  const quick = getExercise('quick_flicks');
  return {
    dayIndex: 0,
    exercises: [short, quick],
    targetDurationS: 240,
  };
}

function fmt(n: number): string {
  const v = Math.max(0, n);
  return v < 10 ? `0${v}` : `${v}`;
}

export default function StealthSession() {
  const router = useRouter();
  const logSession = useSessionStore((s) => s.logSession);
  const queryClient = useQueryClient();
  const settings = useSettingsStore((s) => s.settings);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const hydrated = useSettingsStore((s) => s.hydrated);

  const [tick, setTick] = useState(0);
  const [route, setRoute] = useState<AudioRouteKind>('unknown');
  const runnerRef = useRef<SessionRunner | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrate, hydrated]);

  const todayDayQuery = useQuery({
    queryKey: ['program-day', 'today'],
    enabled: hasSupabaseConfig(),
    queryFn: fetchTodayProgramDay,
  });

  const { day, programDayId } = useMemo<{
    day: ProgramDay;
    programDayId: string | null;
  }>(() => {
    const t = todayDayQuery.data;
    if (!t) return { day: fallbackDay(), programDayId: null };
    const exercises = t.exercises
      .map((slug) => EXERCISES[slug])
      .filter((e): e is NonNullable<typeof e> => Boolean(e));
    if (exercises.length === 0)
      return { day: fallbackDay(), programDayId: t.programDayId };
    return {
      day: { dayIndex: 0, exercises, targetDurationS: t.targetDurationS },
      programDayId: t.programDayId,
    };
  }, [todayDayQuery.data]);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    const timeline = buildTimeline(day);
    const repsPlanned = day.exercises.reduce(
      (a, e) => a + e.sets * e.reps,
      0,
    );
    startedAtRef.current = Date.now();
    setHapticsIntensity(settings.hapticIntensity);

    (async () => {
      await enableNativeHaptics();
      const decoyStarted = await startDecoy({ cover: settings.decoyCover });
      if (!decoyStarted) {
        AccessibilityInfo.announceForAccessibility(
          'Lockscreen audio not available. Keep the screen on for the best result.',
        );
      }
      await preloadCues(settings.cueStyle);
      const r = await currentAudioRoute();
      if (!cancelled) setRoute(r);
    })();

    const runner = createSessionRunner(timeline, {
      onPhaseStart: (phase) => {
        const pattern = patternForPhase(phase.kind);
        if (pattern) {
          void play(pattern, settings.hapticIntensity);
          if (phase.kind !== 'rest' && phase.kind !== 'prep') {
            void playCue(settings.cueStyle, phase.kind);
          }
        }
        setTick((t) => t + 1);
      },
      onPhaseEnd: () => setTick((t) => t + 1),
      onComplete: () => {
        const endedAt = Date.now();
        logSession({
          id: `s_${startedAtRef.current}`,
          startedAt: startedAtRef.current,
          endedAt,
          mode: 'stealth',
          repsPlanned,
          repsCompleted: repsPlanned,
          completed: true,
        });
        void logCompletedSession({
          programDayId,
          startedAt: new Date(startedAtRef.current),
          endedAt: new Date(endedAt),
          mode: 'stealth',
          repsPlanned,
          repsCompleted: repsPlanned,
        })
          .then(() => {
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
    void play('sessionStart', settings.hapticIntensity);

    const id = setInterval(() => {
      runner.tick(Date.now());
      setTick((t) => t + 1);
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(id);
      runner.stop();
      void stopDecoy();
      void cancelAllHaptics();
      void unloadCues();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, programDayId, hydrated]);

  function handleExit() {
    Alert.alert('End session?', 'You can resume training tomorrow.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: () => router.replace('/home'),
      },
    ]);
  }

  // Hidden 4-finger long-press to exit (numberOfPointers on the v2 API)
  const exitGesture = useMemo(
    () =>
      Gesture.LongPress()
        .numberOfPointers(4)
        .minDuration(800)
        .onStart(() => {
          handleExit();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const state: SessionState | null = runnerRef.current?.getState() ?? null;
  void tick;

  if (!hydrated || !state) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <Text className="text-muted">Loading…</Text>
      </SafeAreaView>
    );
  }

  if (state.status === 'done') {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-success text-2xl font-semibold">
            Focus Session complete
          </Text>
          <Pressable
            onPress={() => router.replace('/home')}
            className="bg-accent rounded-xl mt-8 py-4 px-8 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Back to home"
          >
            <Text className="text-ink font-semibold">Back to home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const progress = state.totalElapsedMs / Math.max(1, state.totalDurationMs);
  const elapsedM = Math.floor(state.totalElapsedMs / 60000);
  const elapsedS = Math.floor((state.totalElapsedMs % 60000) / 1000);
  const remainingMs = Math.max(0, state.totalDurationMs - state.totalElapsedMs);
  const remM = Math.floor(remainingMs / 60000);
  const remS = Math.floor((remainingMs % 60000) / 1000);

  return (
    <GestureDetector gesture={exitGesture}>
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 px-6 pt-6 pb-10">
          <View className="flex-1 items-center justify-center">
            <View
              className="w-64 h-64 rounded-2xl"
              style={{
                backgroundColor:
                  settings.decoyCover === 'gradient_blue'
                    ? '#1E3A5F'
                    : settings.decoyCover === 'paper_grain'
                      ? '#3F3A2F'
                      : '#3A2A6E',
              }}
              accessibilityLabel="Focus Session album art"
            />
            <Text
              className="text-ink text-xl font-semibold mt-8"
              accessibilityRole="header"
            >
              Focus Session — Episode 12
            </Text>
            <Text className="text-muted text-sm mt-1">Mindful Audio</Text>

            <View className="w-full mt-8">
              <View className="h-1 rounded-full bg-border overflow-hidden">
                <View
                  className="h-1 bg-ink"
                  style={{ width: `${Math.min(100, progress * 100)}%` }}
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-muted text-xs">
                  {fmt(elapsedM)}:{fmt(elapsedS)}
                </Text>
                <Text className="text-muted text-xs">
                  -{fmt(remM)}:{fmt(remS)}
                </Text>
              </View>
            </View>
          </View>

          {route === 'speaker' || route === 'silent' ? (
            <View className="bg-surface border border-border rounded-xl p-3 mb-3">
              <Text className="text-muted text-xs">
                Connect AirPods or headphones for audio cues. Haptics still
                work without them.
              </Text>
            </View>
          ) : null}

          <Text className="text-muted text-[10px] text-center">
            Four-finger long press to end early
          </Text>
        </View>
      </SafeAreaView>
    </GestureDetector>
  );
}
