import Constants from 'expo-constants';

type Extra = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  revenuecatIosKey: string;
  revenuecatAndroidKey: string;
  googleWebClientId: string;
  googleIosClientId: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

export const env = {
  supabaseUrl: extra.supabaseUrl ?? '',
  supabaseAnonKey: extra.supabaseAnonKey ?? '',
  revenuecatIosKey: extra.revenuecatIosKey ?? '',
  revenuecatAndroidKey: extra.revenuecatAndroidKey ?? '',
  googleWebClientId: extra.googleWebClientId ?? '',
  googleIosClientId: extra.googleIosClientId ?? '',
};

export function hasSupabaseConfig(): boolean {
  return env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;
}

export function hasGoogleConfig(): boolean {
  return env.googleWebClientId.length > 0;
}
