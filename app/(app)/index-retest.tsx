import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { scoreIndex, type PelvicFloorIndex } from '@/lib/pelvic-floor-index';
import { saveIndexRetest } from '@/lib/persistence';

type Stage =
  | 'intro'
  | 'reaction'
  | 'intro-endurance'
  | 'endurance'
  | 'intro-rapid'
  | 'rapid'
  | 'saving'
  | 'done';

const REACTION_CUE_COUNT = 5;
const REACTION_MIN_DELAY_MS = 1500;
const REACTION_MAX_DELAY_MS = 4000;
const ENDURANCE_CAP_MS = 30_000;
const RAPID_WINDOW_MS = 10_000;

export default function IndexRetest() {
  const router = useRouter();
  const qc = useQueryClient();

  const [stage, setStage] = useState<Stage>('intro');
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [enduranceS, setEnduranceS] = useState<number | null>(null);
  const [rapidReps, setRapidReps] = useState<number | null>(null);
  const [result, setResult] = useState<PelvicFloorIndex | null>(null);

  useEffect(() => {
    if (
      stage === 'saving' &&
      reactionMs !== null &&
      enduranceS !== null &&
      rapidReps !== null
    ) {
      const idx = scoreIndex({
        reactionMs,
        enduranceS,
        rapidReps10s: rapidReps,
      });
      (async () => {
        try {
          await saveIndexRetest(idx);
          await qc.invalidateQueries({ queryKey: ['index', 'history'] });
          setResult(idx);
          setStage('done');
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Save failed.';
          Alert.alert('Save failed', msg);
          setStage('intro');
        }
      })();
    }
  }, [stage, reactionMs, enduranceS, rapidReps, qc]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-4 pb-6">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="py-3 px-3 -ml-3 active:opacity-60"
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Text className="text-muted">← Back</Text>
          </Pressable>
          <Text className="text-muted text-xs uppercase tracking-wider">
            Retest
          </Text>
        </View>

        {stage === 'intro' && (
          <IntroCard
            title="Retest your Index"
            body="Three short tests in about a minute. Take it once a week to see your trend."
            cta="Begin Test 1 of 3"
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
            body="Press and hold the circle while you hold a single contraction. Release the moment you can't hold any longer."
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
            body="Tap as many quick contractions as you can in ten seconds."
            cta="Start"
            onStart={() => setStage('rapid')}
          />
        )}
        {stage === 'rapid' && (
          <RapidTest
            onDone={(count) => {
              setRapidReps(count);
              setStage('saving');
            }}
          />
        )}
        {stage === 'saving' && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-ink text-lg">Saving your result…</Text>
          </View>
        )}
        {stage === 'done' && result && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted text-xs uppercase tracking-wider">
              New composite
            </Text>
            <Text className="text-ink text-6xl font-semibold mt-2">
              {result.composite.toFixed(0)}
            </Text>
            <Text className="text-muted text-sm mt-1">{result.level}</Text>
            <Pressable
              onPress={() => router.replace('/progress')}
              className="bg-accent rounded-xl py-4 px-12 mt-10 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="See your trend"
            >
              <Text className="text-ink font-semibold">See your trend</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
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
        Press and hold. Release when you can't hold any longer.
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
