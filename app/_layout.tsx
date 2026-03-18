import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useSaveLoad } from '../hooks/useSaveLoad';
import { UI } from '../constants/theme';

export default function RootLayout() {
  useSaveLoad();

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: UI.hudBg,
            borderTopColor: UI.panelBorder,
          },
          tabBarActiveTintColor: UI.btnActive,
          tabBarInactiveTintColor: UI.textMuted,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Shop', tabBarLabel: 'Shop' }}
        />
        <Tabs.Screen
          name="staff"
          options={{ title: 'Staff', tabBarLabel: 'Staff' }}
        />
        <Tabs.Screen
          name="upgrades"
          options={{ title: 'Upgrades', tabBarLabel: 'Upgrades' }}
        />
        <Tabs.Screen
          name="stats"
          options={{ title: 'Stats', tabBarLabel: 'Stats' }}
        />
        {/* Onboarding group — hidden from tab bar, tab bar hidden while inside */}
        <Tabs.Screen
          name="onboarding"
          options={{
            tabBarButton: () => null,
            tabBarStyle: { display: 'none' },
            headerShown: false,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
