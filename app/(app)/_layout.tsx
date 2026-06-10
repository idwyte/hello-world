// Obsidian Kinetic tab bar (Figma 18:2): 84px tall, 24px icons + JetBrains
// Mono caps labels underneath, lime when active. Glow is NOT used on the
// tab bar in this system — lime + caps label carries the active state.
import { Tabs } from 'expo-router';
import { CalendarDays, Flame, Home, Settings } from 'lucide-react-native';

import {
  obsidianTabBarStyle,
  obsidianTabIcon,
  obsidianTabLabel,
} from '@/components/obsidian';
import { color } from '@/lib/obsidian/tokens';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: obsidianTabBarStyle,
        // Reanimated label component takes over the rendering of the
        // text label — but expo-router still needs labels enabled.
        tabBarShowLabel: true,
        sceneStyle: { backgroundColor: color.background },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: obsidianTabIcon(Home),
          tabBarLabel: obsidianTabLabel('HOME'),
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          tabBarIcon: obsidianTabIcon(CalendarDays),
          tabBarLabel: obsidianTabLabel('PROGRAM'),
          tabBarAccessibilityLabel: 'Program',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: obsidianTabIcon(Flame),
          tabBarLabel: obsidianTabLabel('STREAKS'),
          tabBarAccessibilityLabel: 'Streaks',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: obsidianTabIcon(Settings),
          tabBarLabel: obsidianTabLabel('SETTINGS'),
          tabBarAccessibilityLabel: 'Settings',
        }}
      />
      {/* Hidden routes — reachable via router.push but not part of tab bar.
          expo-router auto-registers every top-level (app)/* file/folder, so
          each non-tab destination needs an explicit href: null. */}
      {/* Session is immersive — hide the tab bar so the user's focus stays
          on the ring and they can't navigate away mid-set. */}
      <Tabs.Screen
        name="session"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen name="index-retest" options={{ href: null }} />
      <Tabs.Screen name="error" options={{ href: null }} />
      <Tabs.Screen name="maintenance" options={{ href: null }} />
      <Tabs.Screen name="legal" options={{ href: null }} />
      <Tabs.Screen name="education" options={{ href: null }} />
      <Tabs.Screen name="coachmark" options={{ href: null }} />
    </Tabs>
  );
}
