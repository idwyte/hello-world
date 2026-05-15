import type { PhaseKind } from '../types';
import { shouldPlayAudioCue } from './routing';

export type CueStyle = 'tone' | 'whisper' | 'none';

/**
 * Audio cues that play through AirPods / wired headphones only (never the
 * device speaker). `playCue` is gated by `shouldPlayAudioCue` and by the
 * user's `bluetoothOnly` setting.
 *
 * The actual `.m4a` files are produced via ElevenLabs and placed in
 * `assets/audio/cues/<style>_<kind>.m4a`. The `assetFor` helper returns
 * the bundled require() handle once they exist; until then it returns
 * `null` and the cue is silently skipped. See `assets/audio/README.md`.
 */

// TODO(elevenlabs-assets): replace the `null`s with require() calls
// per assets/audio/README.md once the .m4a files are bundled.
const ASSETS: Record<CueStyle, Record<'squeeze' | 'hold' | 'release', number | null>> = {
  none: { squeeze: null, hold: null, release: null },
  tone: {
    squeeze: null, // require('../../assets/audio/cues/tone_squeeze.m4a')
    hold: null, // require('../../assets/audio/cues/tone_hold.m4a')
    release: null, // require('../../assets/audio/cues/tone_release.m4a')
  },
  whisper: {
    squeeze: null, // require('../../assets/audio/cues/whisper_squeeze.m4a')
    hold: null, // require('../../assets/audio/cues/whisper_hold.m4a')
    release: null, // require('../../assets/audio/cues/whisper_release.m4a')
  },
};

type PlayableKind = 'squeeze' | 'hold' | 'release';

function isPlayable(kind: PhaseKind): kind is PlayableKind {
  return kind === 'squeeze' || kind === 'hold' || kind === 'release';
}

function assetFor(style: CueStyle, kind: PhaseKind): number | null {
  if (!isPlayable(kind)) return null;
  return ASSETS[style][kind];
}

type PlayerHandle = { play: () => void; seekTo: (sec: number) => void; release: () => void } | null;

const cache = new Map<string, PlayerHandle>();
let playerFactory: ((source: number) => PlayerHandle) | null = null;

async function loadFactory(): Promise<((source: number) => PlayerHandle) | null> {
  if (playerFactory) return playerFactory;
  try {
    const mod = await import('expo-audio');
    // expo-audio exposes `createAudioPlayer(source)` returning an object with
    // `.play()`, `.seekTo(seconds)`, `.release()`. The hook variant
    // (`useAudioPlayer`) is for components; we need an imperative handle
    // because cues fire from a session-engine callback.
    const create = (mod as { createAudioPlayer?: (s: number) => PlayerHandle })
      .createAudioPlayer;
    if (!create) return null;
    playerFactory = create;
    return playerFactory;
  } catch {
    return null;
  }
}

export async function preloadCues(style: CueStyle): Promise<void> {
  if (style === 'none') return;
  const factory = await loadFactory();
  if (!factory) return;
  for (const kind of ['squeeze', 'hold', 'release'] as const) {
    const source = ASSETS[style][kind];
    if (!source) continue;
    const key = `${style}:${kind}`;
    if (cache.has(key)) continue;
    try {
      cache.set(key, factory(source));
    } catch {
      cache.set(key, null);
    }
  }
}

export async function playCue(
  style: CueStyle,
  kind: PhaseKind,
  options: { bluetoothOnly?: boolean } = {},
): Promise<void> {
  if (style === 'none') return;
  if (!isPlayable(kind)) return;
  const source = ASSETS[style][kind];
  if (!source) return; // asset not yet bundled — no-op
  if (!(await shouldPlayAudioCue(options))) return;
  const handle = cache.get(`${style}:${kind}`);
  if (!handle) return;
  try {
    handle.seekTo(0);
    handle.play();
  } catch {
    // Best-effort; missing/stalled clips are non-fatal.
  }
}

export async function unloadCues(): Promise<void> {
  for (const handle of cache.values()) {
    try {
      handle?.release();
    } catch {
      // ignore
    }
  }
  cache.clear();
}

// Test/utility hook so the persistence test can assert behavior without
// touching expo-audio.
export function _isCueAssetBundled(style: CueStyle, kind: PlayableKind): boolean {
  return ASSETS[style][kind] !== null;
}

export { assetFor as _assetFor };
