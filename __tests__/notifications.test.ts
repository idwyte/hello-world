jest.mock(
  'react-native',
  () => ({ Platform: { OS: 'web' } }),
  { virtual: true },
);

import { Platform } from 'react-native';

import {
  _notificationsInternals,
  cancelDailyReminder,
  scheduleDailyReminder,
} from '@/lib/notifications';

describe('parseHHmm', () => {
  const { parseHHmm } = _notificationsInternals;

  it('accepts canonical 24h strings', () => {
    expect(parseHHmm('00:00')).toEqual({ hour: 0, minute: 0 });
    expect(parseHHmm('09:30')).toEqual({ hour: 9, minute: 30 });
    expect(parseHHmm('19:00')).toEqual({ hour: 19, minute: 0 });
    expect(parseHHmm('23:59')).toEqual({ hour: 23, minute: 59 });
  });

  it('accepts single-digit hour', () => {
    expect(parseHHmm('7:30')).toEqual({ hour: 7, minute: 30 });
  });

  it('rejects malformed input', () => {
    expect(parseHHmm('')).toBeNull();
    expect(parseHHmm('7:5')).toBeNull(); // minutes must be 2 digits
    expect(parseHHmm('24:00')).toBeNull(); // hour out of range
    expect(parseHHmm('19:60')).toBeNull(); // minute out of range
    expect(parseHHmm('7:30pm')).toBeNull(); // no AM/PM accepted
    expect(parseHHmm('abc')).toBeNull();
  });
});

describe('scheduleDailyReminder / cancelDailyReminder on web', () => {
  it('schedule returns false on web (notifications unsupported)', async () => {
    expect(Platform.OS).toBe('web');
    await expect(scheduleDailyReminder('07:30')).resolves.toBe(false);
    await expect(cancelDailyReminder()).resolves.toBeUndefined();
  });

  it('schedule returns false for malformed times', async () => {
    await expect(scheduleDailyReminder('not-a-time')).resolves.toBe(false);
    await expect(scheduleDailyReminder('25:00')).resolves.toBe(false);
  });
});
