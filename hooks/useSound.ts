import { useEffect } from 'react';
import { Audio } from 'expo-av';

export type SoundId =
  | 'customer_arrive'
  | 'cash_register'
  | 'service_complete'
  | 'customer_leave'
  | 'level_up'
  | 'nail_file'
  | 'polish_stroke'
  | 'uv_lamp'
  | 'nail_art_stamp'
  | 'patience_warning'
  | 'tip_earned'
  | 'upgrade_purchased'
  | 'button_tap'
  | 'salon_ambience'
  | 'day_end';

// Singleton sound object cache — loaded once, reused across all calls
const _sounds: Partial<Record<SoundId, Audio.Sound>> = {};
let _loaded = false;

const SOUND_FILES: Record<SoundId, any> = {
  customer_arrive:   require('../assets/sounds/customer_arrive.mp3'),
  cash_register:     require('../assets/sounds/cash_register.mp3'),
  service_complete:  require('../assets/sounds/service_complete.mp3'),
  customer_leave:    require('../assets/sounds/customer_leave.mp3'),
  level_up:          require('../assets/sounds/level_up.mp3'),
  nail_file:         require('../assets/sounds/nail_file.mp3'),
  polish_stroke:     require('../assets/sounds/polish_stroke.mp3'),
  uv_lamp:           require('../assets/sounds/uv_lamp.mp3'),
  nail_art_stamp:    require('../assets/sounds/nail_art_stamp.mp3'),
  patience_warning:  require('../assets/sounds/patience_warning.mp3'),
  tip_earned:        require('../assets/sounds/tip_earned.mp3'),
  upgrade_purchased: require('../assets/sounds/upgrade_purchased.mp3'),
  button_tap:        require('../assets/sounds/button_tap.mp3'),
  salon_ambience:    require('../assets/sounds/salon_ambience.mp3'),
  day_end:           require('../assets/sounds/day_end.mp3'),
};

/**
 * Module-level sound manager — importable from engines and stores (non-React code).
 * Call soundManager.play(id) from anywhere; silently no-ops if not yet loaded.
 */
export const soundManager = {
  async load() {
    if (_loaded) return;
    _loaded = true;
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    await Promise.all(
      (Object.keys(SOUND_FILES) as SoundId[]).map(async (id) => {
        try {
          const { sound } = await Audio.Sound.createAsync(SOUND_FILES[id]);
          _sounds[id] = sound;
        } catch {
          // Missing or invalid file — silent stub, no crash
        }
      })
    );
  },

  async play(id: SoundId) {
    const sound = _sounds[id];
    if (!sound) return;
    try {
      await sound.replayAsync();
    } catch {
      // Ignore playback errors (e.g. placeholder file)
    }
  },

  async playLoop(id: SoundId) {
    const sound = _sounds[id];
    if (!sound) return;
    try {
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    } catch {}
  },

  async stop(id: SoundId) {
    const sound = _sounds[id];
    if (!sound) return;
    try {
      await sound.stopAsync();
    } catch {}
  },

  async unload() {
    await Promise.all(
      Object.values(_sounds).map((s) => s?.unloadAsync().catch(() => {}))
    );
  },
};

/**
 * useSound — call once at the app root to preload all sounds.
 * Returns soundManager so components can call play() directly.
 */
export const useSound = () => {
  useEffect(() => {
    soundManager.load();
    return () => {
      soundManager.unload();
    };
  }, []);
  return soundManager;
};
