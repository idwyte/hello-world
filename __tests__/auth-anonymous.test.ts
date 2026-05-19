jest.mock(
  'react-native',
  () => ({ Platform: { OS: 'ios' } }),
  { virtual: true },
);

jest.mock(
  'expo-apple-authentication',
  () => ({ signInAsync: jest.fn() }),
  { virtual: true },
);

jest.mock('@/lib/env', () => ({
  env: {},
  hasSupabaseConfig: () => true,
  hasGoogleConfig: () => false,
}));

const signInAnon = jest.fn();
const linkIdentity = jest.fn();
jest.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: {
      signInAnonymously: signInAnon,
      linkIdentity,
    },
  }),
}));

import { linkIdentityToCurrent, signInAnonymously } from '@/lib/auth';

describe('signInAnonymously', () => {
  beforeEach(() => {
    signInAnon.mockReset();
    linkIdentity.mockReset();
  });

  it('calls Supabase signInAnonymously and resolves on success', async () => {
    signInAnon.mockResolvedValue({ error: null });
    await expect(signInAnonymously()).resolves.toBeUndefined();
    expect(signInAnon).toHaveBeenCalledTimes(1);
  });

  it('throws when Supabase returns an error', async () => {
    signInAnon.mockResolvedValue({ error: new Error('rate limited') });
    await expect(signInAnonymously()).rejects.toThrow('rate limited');
  });
});

describe('linkIdentityToCurrent', () => {
  beforeEach(() => {
    signInAnon.mockReset();
    linkIdentity.mockReset();
  });

  it('passes the provider + hone:// redirect through to Supabase', async () => {
    linkIdentity.mockResolvedValue({ error: null });
    await linkIdentityToCurrent('apple');
    expect(linkIdentity).toHaveBeenCalledWith({
      provider: 'apple',
      options: { redirectTo: 'hone://auth/callback' },
    });
  });

  it('rewrites the "already" Supabase error into friendlier copy', async () => {
    linkIdentity.mockResolvedValue({
      error: new Error('Identity is already linked to another user'),
    });
    await expect(linkIdentityToCurrent('google')).rejects.toThrow(
      /already linked to another Hone profile/,
    );
  });

  it('passes through non-already errors verbatim', async () => {
    linkIdentity.mockResolvedValue({ error: new Error('network timeout') });
    await expect(linkIdentityToCurrent('google')).rejects.toThrow(
      'network timeout',
    );
  });
});
