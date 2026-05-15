import type { PhaseKind } from '../types';
import { shouldPlayAudioCue } from './routing';

export type CueStyle = 'tone' | 'whisper' | 'none';

/**
 * Optional AirPods-only audio cues. M4 ships the routing + gating; the
 * actual audio assets (short tones and whispered cues) land in M5 alongside
 * the decoy podcast loop. Until then this is a no-op that respects the
 * Bluetooth-only gate so the integration shape is locked in.
 */

let prepared = false;

export async function preloadCues(style: CueStyle): Promise<void> {
  if (style === 'none') return;
  // TODO(M5-assets): load Audio.Sound objects from assets/audio/cues/<style>_<kind>.m4a
  prepared = true;
}

export async function playCue(
  _style: CueStyle,
  _kind: PhaseKind,
  options: { bluetoothOnly?: boolean } = {},
): Promise<void> {
  if (!prepared) return;
  if (!(await shouldPlayAudioCue(options))) return;
  // TODO(M5-assets): sound.setPositionAsync(0); sound.playAsync()
}

export async function unloadCues(): Promise<void> {
  prepared = false;
}
