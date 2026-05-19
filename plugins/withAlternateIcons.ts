import { type ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

/**
 * Registers alternate iOS app icons. The icon images themselves live under
 * `assets/icons/<variant>/` and are bundled into the iOS asset catalog
 * by `expo prebuild`. On Android, alternate icons require manifest
 * activity-alias entries — Android support is deferred to v1.2 per plan
 * §"Out of scope for v1.1".
 *
 * Icon variants Hone ships:
 *   - default — Inset-H violet (primary)
 *   - focus   — timer-ring glyph
 *   - posture — silhouette
 *   - health  — heart
 *
 * Apply by adding `'./plugins/withAlternateIcons'` to the `plugins` array
 * in `app.config.ts`. The runtime icon swap is driven by
 * `app/(app)/settings/app-icon.tsx` calling
 * `setAlternateAppIcon(variant)` which talks to UIApplication directly.
 */
const ICON_VARIANTS = ['focus', 'posture', 'health'] as const;

type IconEntry = {
  CFBundleIconFiles: string[];
  UIPrerenderedIcon: boolean;
};

const withAlternateIcons: ConfigPlugin = (config) => {
  return withInfoPlist(config, (c) => {
    type Plist = Record<string, unknown> & {
      CFBundleIcons?: { CFBundleAlternateIcons?: Record<string, IconEntry> };
      'CFBundleIcons~ipad'?: { CFBundleAlternateIcons?: Record<string, IconEntry> };
    };
    const plist = c.modResults as Plist;

    plist.CFBundleIcons = plist.CFBundleIcons ?? {};
    const alt: Record<string, IconEntry> =
      plist.CFBundleIcons.CFBundleAlternateIcons ?? {};
    for (const variant of ICON_VARIANTS) {
      if (alt[variant]) continue;
      alt[variant] = {
        // Icon-file basenames; the matching PNGs (1x/2x/3x) are dropped
        // into the asset catalog during prebuild.
        CFBundleIconFiles: [`AppIcon-${variant}`],
        UIPrerenderedIcon: false,
      };
    }
    plist.CFBundleIcons.CFBundleAlternateIcons = alt;

    return c;
  });
};

export default withAlternateIcons;
