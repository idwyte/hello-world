// Obsidian Kinetic — value reveal (motion spec §3.3).
// Newly-measured numbers count up from 0 over motion-base. "You are
// watching yourself be measured." Values that aren't newly measured
// must NOT re-count (spec §5) — only mount triggers the reveal.
// Reduced motion: renders the final value immediately.
import { useEffect, useRef, useState } from 'react';
import { Text, type TextStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { motion } from '@/lib/obsidian/tokens';

type Props = {
  value: number;
  /** Renders the in-flight number, e.g. (n) => `${n}%`. */
  format?: (n: number) => string;
  durationMs?: number;
  style?: TextStyle | TextStyle[];
};

export function CountUp({
  value,
  format = (n) => String(n),
  durationMs = motion.base,
  style,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    startRef.current = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - (startRef.current ?? 0)) / durationMs);
      // ease-out so the final digits settle rather than snap
      const eased = 1 - (1 - t) * (1 - t);
      setDisplay(Math.round(value * eased));
      if (t >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
    // Only re-run when the measured value itself changes.
  }, [value, durationMs, reducedMotion]);

  return <Text style={style}>{format(display)}</Text>;
}
