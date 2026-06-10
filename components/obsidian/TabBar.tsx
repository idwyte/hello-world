// Obsidian Kinetic — Tab Bar (Figma 18:2, used in 53:207 Home).
// 84px tall, surface-container-lowest fill, 6% white hairline on top.
// Each tab: 24px icon + 12px JetBrains Mono caps label underneath.
// Active tab = primary-container lime icon + lime label (NO glow disc;
// the lime is the entire signal). Inactive = on-surface-variant muted.
import { Text, View } from 'react-native';

import { color, type } from '@/lib/obsidian/tokens';

export function obsidianTabIcon(
  Icon: React.ComponentType<{ color?: string; size?: number }>,
) {
  function TabBarIcon({ focused }: { focused: boolean }) {
    return (
      <View
        style={{
          width: 24,
          height: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          color={focused ? color.primaryContainer : color.onSurfaceVariant}
          size={24}
        />
      </View>
    );
  }
  return TabBarIcon;
}

/**
 * Wraps the tab label so we can colour-tint per active state. Pass via
 * `tabBarLabel` on the route Tabs.Screen.
 */
export function obsidianTabLabel(text: string) {
  function TabBarLabel({ focused }: { focused: boolean }) {
    return (
      <Text
        style={{
          ...type.labelCaps,
          color: focused ? color.primaryContainer : color.onSurfaceVariant,
          marginTop: 4,
        }}
      >
        {text}
      </Text>
    );
  }
  return TabBarLabel;
}

/** Tabs screenOptions.tabBarStyle for the obsidian system. */
export const obsidianTabBarStyle = {
  backgroundColor: color.surfaceContainerLowest,
  borderTopColor: 'rgba(255, 255, 255, 0.06)',
  borderTopWidth: 1,
  height: 84,
  paddingTop: 12,
  paddingBottom: 20,
  paddingHorizontal: 8,
} as const;
