import { Text, View } from 'react-native';

import { semantic } from '@/lib/theme';
import type { PhaseKind } from '@/lib/types';

const labels: Record<PhaseKind, string> = {
  prep: 'Get ready',
  squeeze: 'Squeeze',
  hold: 'Hold',
  release: 'Release',
  rest: 'Rest',
  done: 'Done',
};

// Phase → semantic-token mapping. Resolved from `lib/theme.ts` so any
// design-system tweak propagates here automatically.
const colors: Record<PhaseKind, string> = {
  prep: semantic.textMuted,
  squeeze: semantic.interactivePrimary,
  hold: semantic.feedbackSuccess,
  release: semantic.interactivePrimaryPressed,
  rest: semantic.textMuted,
  done: semantic.feedbackSuccess,
};

export function PhaseLabel({ kind }: { kind: PhaseKind }) {
  return (
    <View className="items-center">
      <Text
        style={{ color: colors[kind] }}
        className="font-semibold text-display-lg"
      >
        {labels[kind]}
      </Text>
    </View>
  );
}

export function colorForPhase(kind: PhaseKind): string {
  return colors[kind];
}
