import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        color: focused ? '#F5F5F7' : '#8A8A95',
        fontSize: 11,
        fontWeight: focused ? '600' : '400',
      }}
    >
      {label}
    </Text>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#0B0B0F',
          borderTopColor: '#2A2A36',
          height: 64,
          paddingTop: 8,
        },
        sceneStyle: { backgroundColor: '#0B0B0F' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Today" focused={focused} />,
          tabBarAccessibilityLabel: 'Today',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Progress" focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Progress',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Settings" focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Settings',
        }}
      />
      <Tabs.Screen name="session" options={{ href: null }} />
    </Tabs>
  );
}
