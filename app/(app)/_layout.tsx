// Obsidian Kinetic tab bar (Figma: Tab Bar [4] — Home / Program /
// Streaks / Settings). Active tab = lime icon + faint glow disc; glow
// is a state, only the active tab carries it.
import { Tabs } from 'expo-router';
import { CalendarDays, Flame, Home, Settings } from 'lucide-react-native';

import { obsidianTabBarStyle, obsidianTabIcon } from '@/components/obsidian';
import { color } from '@/lib/obsidian/tokens';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: obsidianTabBarStyle,
        sceneStyle: { backgroundColor: color.background },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: obsidianTabIcon(Home),
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          tabBarIcon: obsidianTabIcon(CalendarDays),
          tabBarAccessibilityLabel: 'Program',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: obsidianTabIcon(Flame),
          tabBarAccessibilityLabel: 'Streaks',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: obsidianTabIcon(Settings),
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
