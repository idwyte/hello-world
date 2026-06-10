// Obsidian Kinetic — Tab Bar pieces.
// Figma: Tab Bar [4] — Home / Program / Streaks / Settings; active tab =
// lime icon + faint glow (glow is a state: only the active tab carries
// it, per motion spec §4). Consumed by app/(app)/_layout.tsx's
// <Tabs screenOptions>.
import { View } from 'react-native';

import { color, glow } from '@/lib/obsidian/tokens';

/**
 * Wraps a lucide icon into a tabBarIcon render fn. Active = lime with a
 * faint lime disc ("glow"); inactive = muted, no glow.
 */
export function obsidianTabIcon(
  Icon: React.ComponentType<{ color?: string; size?: number }>,
) {
  function TabBarIcon({ focused }: { focused: boolean }) {
    return (
      <View
        style={{
          width: 44,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {focused && (
          <View
            style={{
              position: 'absolute',
              width: 36,
              height: 28,
              borderRadius: 14,
              backgroundColor: glow.primary,
              opacity: 0.16,
            }}
          />
        )}
        <Icon
          color={focused ? color.primaryContainer : color.onSurfaceVariant}
          size={20}
        />
      </View>
    );
  }
  return TabBarIcon;
}

/** Tabs screenOptions.tabBarStyle for the obsidian system. */
export const obsidianTabBarStyle = {
  backgroundColor: color.surfaceContainerLowest,
  borderTopColor: color.outlineVariant,
  borderTopWidth: 1,
  height: 56,
  paddingTop: 10,
  paddingBottom: 10,
} as const;
