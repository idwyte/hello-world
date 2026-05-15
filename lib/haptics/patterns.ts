import type { PhaseKind } from '../types';

export type HapticPattern =
  | 'squeezeStart'
  | 'hold'
  | 'release'
  | 'rest'
  | 'sessionStart'
  | 'sessionEnd'
  | 'reconnect';

export function patternForPhase(kind: PhaseKind): HapticPattern | null {
  switch (kind) {
    case 'squeeze':
      return 'squeezeStart';
    case 'hold':
      return 'hold';
    case 'release':
      return 'release';
    case 'rest':
    case 'prep':
      return null;
    case 'done':
      return 'sessionEnd';
  }
}
