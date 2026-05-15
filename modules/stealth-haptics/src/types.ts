export type StealthPattern =
  | 'squeezeStart'
  | 'hold'
  | 'release'
  | 'rest'
  | 'sessionStart'
  | 'sessionEnd'
  | 'reconnect';

export type ScheduleHandle = string;

export type AudioRoute = 'bluetooth' | 'wired' | 'speaker' | 'silent' | 'unknown';
