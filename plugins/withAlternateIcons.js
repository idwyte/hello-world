const { withInfoPlist } = require('expo/config-plugins');

/**
 * Registers alternate iOS app icons. The icon images must be in the iOS
 * bundle root (not in the asset catalog) for `setAlternateIconName` to
 * find them. After `expo prebuild`, copy the PNGs into `ios/<AppName>/`
 * manually OR add an asset-copy mod here — this plugin only writes the
 * Info.plist entries; the asset files are a separate deliverable in the
 * Asset production stage.
 *
 * For each variant `<key>`, the bundle must contain:
 *   AppIcon-<key>@2x.png  (120×120 — iPhone)
 *   AppIcon-<key>@3x.png  (180×180 — iPhone Plus / Pro Max)
 * iPad sizes are optional unless `supportsTablet=true` in app.config.ts.
 *
 * Icon variants Hone ships:
 *   - default — Inset-H violet (primary, set via the standard `icon` field)
 *   - focus   — timer-ring glyph
 *   - posture — silhouette
 *   - health  — heart
 *
 * On Android, alternate icons require manifest activity-alias entries —
 * Android support is deferred to v1.2 per plan §"Out of scope for v1.1".
 *
 * Apply by adding `'./plugins/withAlternateIcons'` to the `plugins` array
 * in `app.config.ts`. The runtime icon swap is driven by
 * `app/(app)/settings/app-icon.tsx` calling `setAlternateAppIcon(variant)`
 * which passes the dictionary key (e.g. "focus") to
 * `UIApplication.setAlternateIconName:completionHandler:`.
 */
const ICON_VARIANTS = ['focus', 'posture', 'health'];

const withAlternateIcons = (config) => {
  return withInfoPlist(config, (c) => {
    const plist = c.modResults;

    plist.CFBundleIcons = plist.CFBundleIcons ?? {};
    const alt = plist.CFBundleIcons.CFBundleAlternateIcons ?? {};
    for (const variant of ICON_VARIANTS) {
      if (alt[variant]) continue;
      alt[variant] = {
        CFBundleIconFiles: [`AppIcon-${variant}`],
        UIPrerenderedIcon: false,
      };
    }
    plist.CFBundleIcons.CFBundleAlternateIcons = alt;

    return c;
  });
};

module.exports = withAlternateIcons;
