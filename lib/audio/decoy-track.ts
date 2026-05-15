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
let serviceRegistered = false;

type TrackPlayerModule = {
  setupPlayer: (opts?: object) => Promise<void>;
  add: (tracks: unknown) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  reset: () => Promise<void>;
  registerPlaybackService: (factory: () => () => Promise<void>) => void;
  updateOptions: (o: object) => Promise<void>;
  IOSCategory?: Record<string, string>;
  IOSCategoryOptions?: Record<string, string>;
  AppKilledPlaybackBehavior?: Record<string, string>;
};

async function loadModule(): Promise<TrackPlayerModule | null> {
  try {
    const mod = await import('react-native-track-player');
    return mod.default as unknown as TrackPlayerModule;
  } catch {
    return null;
  }
}

/**
 * RNTP requires a registered playback service before `play()` resolves on a
 * real device. The factory returns an event handler that processes
 * remote-control events (play/pause/skip). We don't expose remote controls,
 * so the handler is a no-op. Registration must happen exactly once at app
 * boot — guarded by `serviceRegistered`.
 */
function ensureServiceRegistered(TP: TrackPlayerModule) {
  if (serviceRegistered) return;
  TP.registerPlaybackService(() => async () => {
    // Intentionally empty.
  });
  serviceRegistered = true;
}

export async function startDecoy(
  config: Partial<DecoyConfig> = {},
): Promise<boolean> {
  if (started) return true;
  const TP = await loadModule();
  if (!TP) return false;
  const final: DecoyConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    ensureServiceRegistered(TP);
    await TP.setupPlayer({
      // Explicit iOS audio session category + Bluetooth options — matches
      // plan §6 spec. Falls back to string literals when the enum object
      // isn't yet exposed on older RNTP builds.
      iosCategory: TP.IOSCategory?.Playback ?? 'playback',
      iosCategoryOptions: [
        TP.IOSCategoryOptions?.AllowBluetooth ?? 'allowBluetooth',
        TP.IOSCategoryOptions?.AllowBluetoothA2DP ?? 'allowBluetoothA2DP',
      ],
    });
    await TP.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          TP.AppKilledPlaybackBehavior?.StopPlaybackAndRemoveNotification ??
          'stop-playback-and-remove-notification',
      },
    });
    await TP.reset();
    await TP.add({
      id: 'focus-session-loop',
      // TODO(M5-assets): require('../../assets/audio/focus-session.m4a')
      //   Until the real ambient track ships this is a placeholder URL;
      //   failure is handled by the catch and the session continues with
      //   haptics only.
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
