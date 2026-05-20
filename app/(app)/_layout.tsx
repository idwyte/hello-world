import { Tabs } from 'expo-router';
import {
  CalendarDays,
  Home,
  LineChart,
  Settings,
} from 'lucide-react-native';
import { View } from 'react-native';

import { semantic } from '@/lib/theme';

// Figma `81:35` / `92:230` / `94:299` — h-50, no labels, 4 flex-1 cells with
// a 40×32 active-state pill behind the icon. Active = accent bg + ink icon;
// inactive = transparent bg + muted icon.
function tabIcon(
  Icon: React.ComponentType<{ color?: string; size?: number }>,
) {
  function TabBarIcon({ focused }: { focused: boolean }) {
    const iconColor = focused ? semantic.textPrimary : semantic.textMuted;
    return (
      <View
        className={`w-10 h-8 rounded-[10px] items-center justify-center ${focused ? 'bg-interactive-primary' : ''}`}
      >
        <Icon color={iconColor} size={20} />
      </View>
    );
  }
  return TabBarIcon;
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: semantic.surfaceRaised,
          borderTopColor: semantic.borderDefault,
          borderTopWidth: 1,
          height: 50,
          paddingTop: 9,
          paddingBottom: 9,
          paddingHorizontal: 4,
        },
        sceneStyle: { backgroundColor: semantic.surfaceCanvas },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: tabIcon(Home),
          tabBarAccessibilityLabel: 'Today',
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          tabBarIcon: tabIcon(CalendarDays),
          tabBarAccessibilityLabel: 'Plan',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: tabIcon(LineChart),
          tabBarAccessibilityLabel: 'Progress',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: tabIcon(Settings),
          tabBarAccessibilityLabel: 'Settings',
        }}
      />
      {/* Hidden routes — reachable via router.push but not part of tab bar. */}
      <Tabs.Screen name="session" options={{ href: null }} />
      <Tabs.Screen name="index-retest" options={{ href: null }} />
    </Tabs>
  );
}
