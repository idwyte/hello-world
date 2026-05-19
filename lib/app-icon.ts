import { NativeModules, Platform } from 'react-native';

/**
 * Bridge to iOS's `UIApplication.setAlternateIconName:completionHandler:` via
 * the built-in `RCTAlternateIconName` module exposed by React Native. Calling
 * `null` reverts to the primary icon.
 *
 * Variants must match the keys registered by `plugins/withAlternateIcons.ts`
 * — currently `'focus' | 'posture' | 'health' | null` (null = default).
 */

export type AppIconVariant = 'default' | 'focus' | 'posture' | 'health';

type AltIconNativeModule = {
  setAlternateIconName: (
    name: string | null,
    callback?: (err: Error | null) => void,
  ) => void;
};

export async function setAlternateAppIcon(
  variant: AppIconVariant,
): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  const native = (
    NativeModules as Record<string, AltIconNativeModule | undefined>
  ).RCTAlternateIconName;
  if (!native?.setAlternateIconName) return false;
  // iOS naming: pass the variant name (matching plist) or null for default.
  const name = variant === 'default' ? null : `AppIcon-${variant}`;
  return new Promise((resolve) => {
    try {
      native.setAlternateIconName(name, (err) => {
        resolve(!err);
      });
    } catch {
      resolve(false);
    }
  });
}
