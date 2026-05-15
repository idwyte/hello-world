/**
 * Decoy lockscreen "podcast" player.
 *
 * Stealth Mode keeps the audio session alive across screen-lock by playing
 * a low-volume ambient track via `react-native-track-player` with metadata
 * shaped like a podcast episode ("Focus Session — Episode 12"). This serves
 * two purposes:
 *
 * 1. **iOS audio background mode keep-alive.** Once we enable
 *    `UIBackgroundModes: ['audio']` (see `plugins/withStealthAudioBackground.ts`)
 *    and an audio session is playing, JS keeps running so we can fire
 *    haptics on phase boundaries.
 *
 * 2. **Lockscreen disguise.** The Now Playing card looks like a generic
 *    focus / ambient podcast — no Kegel terminology, no app branding.
 *
 * The native module is lazy-imported to keep it out of Jest/web. Callers
 * use `startDecoy()` / `stopDecoy()` — both no-op when the module is
 * unavailable.
 */

export type DecoyCover = 'minimal_violet' | 'gradient_blue' | 'paper_grain';

export type DecoyConfig = {
  cover: DecoyCover;
  title: string;
  artist: string;
};

const DEFAULT_CONFIG: DecoyConfig = {
  cover: 'minimal_violet',
  title: 'Focus Session — Episode 12',
  artist: 'Mindful Audio',
};

let started = false;

type TrackPlayerModule = {
  setupPlayer: (opts?: object) => Promise<void>;
  add: (tracks: unknown) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  reset: () => Promise<void>;
  destroy?: () => Promise<void>;
  Capability: Record<string, unknown>;
  updateOptions: (o: object) => Promise<void>;
};

async function loadModule(): Promise<TrackPlayerModule | null> {
  try {
    const mod = await import('react-native-track-player');
    return mod.default as unknown as TrackPlayerModule;
  } catch {
    return null;
  }
}

export async function startDecoy(
  config: Partial<DecoyConfig> = {},
): Promise<boolean> {
  if (started) return true;
  const TP = await loadModule();
  if (!TP) return false;
  const final: DecoyConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    await TP.setupPlayer({ waitForBuffer: true });
    await TP.updateOptions({
      // Reasonable defaults; capabilities array goes here in real RNTP setup.
      stopWithApp: true,
    });
    await TP.reset();
    await TP.add({
      id: 'focus-session-loop',
      // TODO(M5-assets): require('../../assets/audio/focus-session.m4a')
      //   Until the real ambient track ships, this just attempts a remote
      //   placeholder; failure is handled by the catch.
      url: 'https://example.com/silence.m4a',
      title: final.title,
      artist: final.artist,
      // TODO(M5-assets): artwork = require for cover variant
    });
    await TP.play();
    started = true;
    return true;
  } catch {
    return false;
  }
}

export async function stopDecoy(): Promise<void> {
  if (!started) return;
  const TP = await loadModule();
  if (!TP) return;
  try {
    await TP.pause();
    await TP.reset();
  } catch {
    // ignore
  }
  started = false;
}

export function isDecoyRunning(): boolean {
  return started;
}
