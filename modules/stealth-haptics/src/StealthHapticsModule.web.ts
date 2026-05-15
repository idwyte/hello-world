import type { AudioRoute, ScheduleHandle, StealthPattern } from './types';

// Web stub: no haptics, no Core Haptics, no Bluetooth introspection.
// Methods resolve without effect so calling code doesn't need to branch on Platform.OS.
const StealthHapticsModule = {
  async prepareEngine() {},
  async playPattern(_p: StealthPattern, _intensity: number) {},
  async schedulePattern(
    _p: StealthPattern,
    _atMs: number,
    _intensity: number,
  ): Promise<ScheduleHandle> {
    return 'noop';
  },
  async cancelScheduled(_handle: ScheduleHandle) {},
  async cancelAll() {},
  async currentAudioRoute(): Promise<AudioRoute> {
    return 'unknown';
  },
  async isBluetoothAudioConnected() {
    return false;
  },
};

export default StealthHapticsModule;
