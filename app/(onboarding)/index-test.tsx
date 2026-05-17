import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { scoreIndex } from '@/lib/pelvic-floor-index';
import { useOnboardingStore } from '@/stores/onboarding';

type Stage = 'intro-reaction' | 'reaction' | 'intro-endurance' | 'endurance' | 'intro-rapid' | 'rapid' | 'done';

const REACTION_CUE_COUNT = 5;
const REACTION_MIN_DELAY_MS = 1500;
const REACTION_MAX_DELAY_MS = 4000;
const ENDURANCE_CAP_MS = 30_000;
const RAPID_WINDOW_MS = 10_000;

export default function IndexTest() {
  const router = useRouter();
  const setIndex = useOnboardingStore((s) => s.setIndex);

  const [stage, setStage] = useState<Stage>('intro-reaction');
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [enduranceS, setEnduranceS] = useState<number | null>(null);
  const [rapidReps, setRapidReps] = useState<number | null>(null);

  const finish = useCallback(
    (r: number, e: number, p: number) => {
      const idx = scoreIndex({
        reactionMs: r,
        enduranceS: e,
        rapidReps10s: p,
      });
      setIndex(idx);
      router.replace('/generating');
    },
    [router, setIndex],
  );

  useEffect(() => {
    if (
      stage === 'done' &&
      reactionMs !== null &&
      enduranceS !== null &&
      rapidReps !== null
    ) {
      finish(reactionMs, enduranceS, rapidReps);
    }
  }, [stage, reactionMs, enduranceS, rapidReps, finish]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-4 pb-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-muted text-xs uppercase tracking-wider">
            Pelvic Floor Index
          </Text>
          <Text className="text-muted text-xs">{stageLabel(stage)}</Text>
        </View>

        {stage === 'intro-reaction' && (
          <IntroCard
            title="Test 1 of 3 · Reaction"
            body="When the circle turns green, contract immediately. Five cues will appear at random intervals."
            cta="Start"
            onStart={() => setStage('reaction')}
          />
        )}
        {stage === 'reaction' && (
          <ReactionTest
            onDone={(ms) => {
              setReactionMs(ms);
              setStage('intro-endurance');
            }}
          />
        )}

        {stage === 'intro-endurance' && (
          <IntroCard
            title="Test 2 of 3 · Endurance"
            body="Press and hold the circle while you hold a single contraction. Release the circle the moment you can't hold the contraction any longer."
            cta="Start"
            onStart={() => setStage('endurance')}
          />
        )}
        {stage === 'endurance' && (
          <EnduranceTest
            onDone={(s) => {
              setEnduranceS(s);
              setStage('intro-rapid');
            }}
          />
        )}

        {stage === 'intro-rapid' && (
          <IntroCard
            title="Test 3 of 3 · Rapid reps"
            body="In ten seconds, tap as many quick contractions as you can. Each tap counts as one rep."
            cta="Start"
            onStart={() => setStage('rapid')}
          />
        )}
        {stage === 'rapid' && (
          <RapidTest
            onDone={(count) => {
              setRapidReps(count);
              setStage('done');
            }}
          />
        )}

        {stage === 'done' && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-ink text-lg">Computing your Index…</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function stageLabel(s: Stage): string {
  if (s.startsWith('intro-reaction') || s === 'reaction') return '1 / 3';
  if (s.startsWith('intro-endurance') || s === 'endurance') return '2 / 3';
  if (s.startsWith('intro-rapid') || s === 'rapid') return '3 / 3';
  return '';
}

function IntroCard({
  title,
  body,
  cta,
  onStart,
}: {
  title: string;
  body: string;
  cta: string;
  onStart: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-ink text-2xl font-semibold text-center">{title}</Text>
      <Text className="text-muted text-center leading-6 mt-4 max-w-xs">
        {body}
      </Text>
      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel={cta}
        className="bg-accent rounded-xl py-4 px-12 mt-10 active:opacity-80"
      >
        <Text className="text-ink font-semibold">{cta}</Text>
      </Pressable>
    </View>
  );
}

function ReactionTest({ onDone }: { onDone: (ms: number) => void }) {
  const [isCueActive, setIsCueActive] = useState(false);
  const [cueIndex, setCueIndex] = useState(0);
  const cueShownAtRef = useRef<number>(0);
  const samplesRef = useRef<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNextCue = useCallback(() => {
    const delay =
      REACTION_MIN_DELAY_MS +
      Math.random() * (REACTION_MAX_DELAY_MS - REACTION_MIN_DELAY_MS);
    timeoutRef.current = setTimeout(() => {
      cueShownAtRef.current = Date.now();
      setIsCueActive(true);
    }, delay);
  }, []);

  useEffect(() => {
    if (cueIndex < REACTION_CUE_COUNT) {
      scheduleNextCue();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [cueIndex, scheduleNextCue]);

  function onTap() {
    if (!isCueActive) return;
    const ms = Date.now() - cueShownAtRef.current;
    samplesRef.current.push(ms);
    setIsCueActive(false);
    const nextIndex = cueIndex + 1;
    if (nextIndex >= REACTION_CUE_COUNT) {
      const avg =
        samplesRef.current.reduce((a, b) => a + b, 0) / samplesRef.current.length;
      onDone(avg);
      return;
    }
    setCueIndex(nextIndex);
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-muted text-sm">
        Cue {Math.min(cueIndex + 1, REACTION_CUE_COUNT)} of {REACTION_CUE_COUNT}
      </Text>
      <Pressable
        onPress={onTap}
        accessibilityRole="button"
        accessibilityLabel="Tap when the circle turns green"
        className="mt-6 active:opacity-80"
      >
        <View
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: isCueActive ? '#22C55E' : '#1E1E27',
            borderWidth: 2,
            borderColor: isCueActive ? '#22C55E' : '#2A2A33',
          }}
        />
      </Pressable>
      <Text className="text-muted text-xs mt-6 text-center max-w-xs">
        Wait for green, then tap as fast as you can.
      </Text>
    </View>
  );
}

function EnduranceTest({ onDone }: { onDone: (s: number) => void }) {
  const [pressedAt, setPressedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const capRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pressedAt === null) return;
    const id = setInterval(() => {
      const next = Date.now() - pressedAt;
      setElapsedMs(Math.min(next, ENDURANCE_CAP_MS));
    }, 100);
    capRef.current = setTimeout(() => {
      onDone(ENDURANCE_CAP_MS / 1000);
    }, ENDURANCE_CAP_MS);
    return () => {
      clearInterval(id);
      if (capRef.current) clearTimeout(capRef.current);
    };
  }, [pressedAt, onDone]);

  function handlePressIn() {
    if (pressedAt !== null) return;
    setPressedAt(Date.now());
  }

  function handlePressOut() {
    if (pressedAt === null) return;
    if (capRef.current) clearTimeout(capRef.current);
    const totalMs = Math.min(Date.now() - pressedAt, ENDURANCE_CAP_MS);
    onDone(totalMs / 1000);
  }

  const seconds = (elapsedMs / 1000).toFixed(1);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-ink text-4xl font-semibold">{seconds}s</Text>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Press and hold while you contract; release when you can't hold any longer"
        className="mt-8 active:opacity-90"
      >
        <View
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: pressedAt !== null ? '#7C5CFF' : '#1E1E27',
            borderWidth: 2,
            borderColor: pressedAt !== null ? '#7C5CFF' : '#2A2A33',
          }}
        />
      </Pressable>
      <Text className="text-muted text-xs mt-6 text-center max-w-xs">
        Press and hold. Release when you can't hold the contraction any longer.
      </Text>
    </View>
  );
}

function RapidTest({ onDone }: { onDone: (count: number) => void }) {
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);
  const [remainingMs, setRemainingMs] = useState(RAPID_WINDOW_MS);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!started) return;
    startedAtRef.current = Date.now();
    const tick = setInterval(() => {
      const remaining = RAPID_WINDOW_MS - (Date.now() - startedAtRef.current);
      if (remaining <= 0) {
        clearInterval(tick);
        setRemainingMs(0);
        // Use a callback so we read the latest count
        setCount((c) => {
          onDone(c);
          return c;
        });
      } else {
        setRemainingMs(remaining);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [started, onDone]);

  if (!started) {
    return (
      <IntroCard
        title="Ready?"
        body="Tap the circle as many times as you can in ten seconds."
        cta="Begin"
        onStart={() => setStarted(true)}
      />
    );
  }

  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-muted text-sm">{seconds}s left</Text>
      <Text className="text-ink text-5xl font-semibold mt-2">{count}</Text>
      <Pressable
        onPress={() => {
          if (remainingMs <= 0) return;
          setCount((c) => c + 1);
        }}
        accessibilityRole="button"
        accessibilityLabel="Tap to count a contraction"
        className="mt-8 active:opacity-80"
      >
        <View
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: '#7C5CFF',
          }}
        />
      </Pressable>
      <Text className="text-muted text-xs mt-6 text-center max-w-xs">
        Tap as fast as you can.
      </Text>
    </View>
  );
}
