import { Tabs } from 'expo-router';
import { CalendarDays, LineChart, Settings, Sparkles } from 'lucide-react-native';

import { Body } from '@/components/ui';
import { semantic } from '@/lib/theme';

type IconProps = { color: string; size: number };

function tabIcon(
  Icon: React.ComponentType<{ color?: string; size?: number }>,
) {
  // Stable component reference; React Navigation re-renders on focus change.
  function TabBarIcon({ color, size }: IconProps) {
    return <Icon color={color} size={size} />;
  }
  return TabBarIcon;
}

function tabLabel(text: string) {
  function TabBarLabel({ focused }: { focused: boolean }) {
    return (
      <Body
        size="xs"
        weight={focused ? 'semibold' : 'medium'}
        color={focused ? 'primary' : 'muted'}
      >
        {text}
      </Body>
    );
  }
  return TabBarLabel;
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: semantic.interactivePrimary,
        tabBarInactiveTintColor: semantic.textMuted,
        tabBarStyle: {
          backgroundColor: semantic.surfaceRaised,
          borderTopColor: semantic.borderDefault,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
        sceneStyle: { backgroundColor: semantic.surfaceCanvas },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: tabIcon(Sparkles),
          tabBarLabel: tabLabel('Today'),
          tabBarAccessibilityLabel: 'Today',
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          tabBarIcon: tabIcon(CalendarDays),
          tabBarLabel: tabLabel('Plan'),
          tabBarAccessibilityLabel: 'Plan',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: tabIcon(LineChart),
          tabBarLabel: tabLabel('Progress'),
          tabBarAccessibilityLabel: 'Progress',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: tabIcon(Settings),
          tabBarLabel: tabLabel('Settings'),
          tabBarAccessibilityLabel: 'Settings',
        }}
      />
      {/*
        Routes below are reachable via direct navigation (router.push or deep
        link) but must NOT appear in the tab bar. expo-router auto-registers
        every file under (app)/, so each non-tab route needs an explicit
        `href: null` slot.
      */}
      <Tabs.Screen name="session" options={{ href: null }} />
      <Tabs.Screen name="index-retest" options={{ href: null }} />
    </Tabs>
  );
}
