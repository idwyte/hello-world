// Shared pulse + max-hold measurement stages. Used by both the onboarding
// /index-test screen (Figma 04+05 · 199:387, 199:415) and the
// /(app)/index-retest screen (Figma 12 · 98:279). The two screens differ
// only in their outer chrome (modal header vs back-nav header) and in
// what happens after the measurements land — the stage UI itself is
// identical.
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Body, Button, SectionLabel } from '@/components/ui';
import { PacerRing } from '@/components/session/PacerRing';
import { semantic } from '@/lib/theme';

export const PULSE_WINDOW_S = 30;
export const HOLD_CAP_S = 120;

export function formatTimer(s: number): string {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

// === Stage 1 · pulse ===

export function PulseIdle({
  remainingS,
  onPrimary,
}: {
  remainingS: number;
  onPrimary: () => void;
}) {
  return (
    <View className="flex-1 px-6 pb-8">
      <SectionLabel tracking="wide" className="text-center">
        QUICK PULSE
      </SectionLabel>
      <View className="flex-1 items-center justify-center -mt-4">
        <View className="items-center">
          <PacerRing
            progress={1}
            color={semantic.borderDefault}
            size={260}
            strokeWidth={6}
          />
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 56, lineHeight: 60 }}
            >
              {formatTimer(remainingS)}
            </Body>
            <Body
              weight="medium"
              color="muted"
              className="mt-1"
              style={{ fontSize: 12, lineHeight: 16, letterSpacing: 1.4 }}
            >
              SECONDS
            </Body>
          </View>
        </View>
        <Body
          weight="medium"
          color="primary"
          className="text-center mt-8"
          style={{ fontSize: 16, lineHeight: 24 }}
        >
          Squeeze and release as fast as you can.
        </Body>
        <Body color="muted" size="sm" className="text-center mt-2 px-4">
          Tap Start when ready. Count happens automatically — just go.
        </Body>
      </View>
      <Button
        label="Start"
        variant="primary"
        size="lg"
        radius="cta"
        onPress={onPrimary}
      />
    </View>
  );
}

export function PulseRunner({
  windowS,
  onComplete,
}: {
  windowS: number;
  onComplete: () => void;
}) {
  const [remainingMs, setRemainingMs] = useState(windowS * 1000);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, windowS * 1000 - elapsed);
      setRemainingMs(remaining);
      if (remaining <= 0) {
        clearInterval(tick);
        onComplete();
      }
    }, 100);
    return () => clearInterval(tick);
  }, [windowS, onComplete]);

  const remainingS = Math.ceil(remainingMs / 1000);
  const progress = remainingMs / (windowS * 1000);

  return (
    <View className="flex-1 px-6 pb-8">
      <SectionLabel tracking="wide" className="text-center">
        QUICK PULSE
      </SectionLabel>
      <View className="flex-1 items-center justify-center -mt-4">
        <View className="items-center">
          <PacerRing
            progress={progress}
            color={semantic.interactivePrimary}
            size={260}
            strokeWidth={6}
          />
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 56, lineHeight: 60 }}
            >
              {formatTimer(remainingS)}
            </Body>
            <Body
              weight="medium"
              color="muted"
              className="mt-1"
              style={{ fontSize: 12, lineHeight: 16, letterSpacing: 1.4 }}
            >
              SECONDS
            </Body>
          </View>
        </View>
        <Body
          weight="medium"
          color="primary"
          className="text-center mt-8"
          style={{ fontSize: 16, lineHeight: 24 }}
        >
          Pulse now — squeeze and release.
        </Body>
      </View>
      <Button
        label="Stop early"
        variant="secondary"
        size="lg"
        radius="cta"
        onPress={onComplete}
      />
    </View>
  );
}

export function PulseReview({ onSubmit }: { onSubmit: (n: number) => void }) {
  const [count, setCount] = useState(30);
  return (
    <View className="flex-1 px-6 pb-8">
      <SectionLabel tracking="wide" className="text-center">
        QUICK PULSE
      </SectionLabel>
      <View className="flex-1 items-center justify-center">
        <Body
          weight="semibold"
          color="primary"
          className="text-center"
          style={{ fontSize: 22, lineHeight: 28 }}
        >
          How many pulses did you complete?
        </Body>
        <Body color="muted" size="sm" className="text-center mt-2 px-4">
          Estimate is fine — you don&rsquo;t need to be exact.
        </Body>
        <View className="flex-row items-center mt-10 gap-6">
          <Stepper
            sign="-"
            onPress={() => setCount((c) => Math.max(0, c - 1))}
          />
          <Body
            weight="semibold"
            color="primary"
            style={{
              fontSize: 64,
              lineHeight: 72,
              minWidth: 120,
              textAlign: 'center',
            }}
          >
            {count}
          </Body>
          <Stepper
            sign="+"
            onPress={() => setCount((c) => Math.min(200, c + 1))}
          />
        </View>
      </View>
      <Button
        label="Submit"
        variant="primary"
        size="lg"
        radius="cta"
        onPress={() => onSubmit(count)}
      />
    </View>
  );
}

function Stepper({ sign, onPress }: { sign: '+' | '-'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={sign === '+' ? 'Increase' : 'Decrease'}
      hitSlop={12}
      className="w-14 h-14 rounded-full bg-surface-raised items-center justify-center active:opacity-70"
      style={{
        borderWidth: 1,
        borderColor: semantic.borderDefault,
      }}
    >
      <Body
        weight="semibold"
        color="primary"
        style={{ fontSize: 28, lineHeight: 28 }}
      >
        {sign}
      </Body>
    </Pressable>
  );
}

// === Stage 2 · hold ===

export function HoldIdle({
  elapsedS,
  onPrimary,
}: {
  elapsedS: number;
  onPrimary: () => void;
}) {
  return (
    <View className="flex-1 px-6 pb-8">
      <SectionLabel tracking="wide" className="text-center">
        MAX HOLD
      </SectionLabel>
      <View className="flex-1 items-center justify-center -mt-4">
        <View className="items-center">
          <PacerRing
            progress={0}
            color={semantic.interactivePrimary}
            size={260}
            strokeWidth={6}
          />
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 56, lineHeight: 60 }}
            >
              {formatTimer(elapsedS)}
            </Body>
            <Body
              weight="medium"
              color="muted"
              className="mt-1"
              style={{ fontSize: 12, lineHeight: 16, letterSpacing: 1.4 }}
            >
              HOLDING
            </Body>
          </View>
        </View>
        <Body
          weight="medium"
          color="primary"
          className="text-center mt-8"
          style={{ fontSize: 16, lineHeight: 24 }}
        >
          Hold for as long as you can.
        </Body>
        <Body color="muted" size="sm" className="text-center mt-2 px-4">
          Tap Start, squeeze, and hold. Tap Stop when you can&rsquo;t hold any
          longer.
        </Body>
      </View>
      <Button
        label="Start"
        variant="primary"
        size="lg"
        radius="cta"
        onPress={onPrimary}
      />
    </View>
  );
}

export function HoldRunner({
  capS,
  onComplete,
}: {
  capS: number;
  onComplete: (elapsedS: number) => void;
}) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      const e = Math.min(capS * 1000, Date.now() - startRef.current);
      setElapsedMs(e);
      if (e >= capS * 1000) {
        clearInterval(tick);
        onComplete(capS);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [capS, onComplete]);

  const elapsedS = Math.floor(elapsedMs / 1000);
  const progress = Math.min(1, elapsedMs / (capS * 1000));

  return (
    <View className="flex-1 px-6 pb-8">
      <SectionLabel tracking="wide" className="text-center">
        MAX HOLD
      </SectionLabel>
      <View className="flex-1 items-center justify-center -mt-4">
        <View className="items-center">
          <PacerRing
            progress={progress}
            color={semantic.interactivePrimary}
            size={260}
            strokeWidth={6}
          />
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <Body
              weight="semibold"
              color="primary"
              style={{ fontSize: 56, lineHeight: 60 }}
            >
              {formatTimer(elapsedS)}
            </Body>
            <Body
              weight="medium"
              color="muted"
              className="mt-1"
              style={{ fontSize: 12, lineHeight: 16, letterSpacing: 1.4 }}
            >
              HOLDING
            </Body>
          </View>
        </View>
        <Body
          weight="medium"
          color="primary"
          className="text-center mt-8"
          style={{ fontSize: 16, lineHeight: 24 }}
        >
          Keep holding…
        </Body>
      </View>
      <Button
        label="Stop"
        variant="primary"
        size="lg"
        radius="cta"
        onPress={() => onComplete(Math.floor(elapsedMs / 1000))}
      />
    </View>
  );
}
