import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { useOwnerStore } from '../store/ownerStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { HUD } from '../components/HUD';
import { StationSlot } from '../components/StationSlot';
import { CustomerCard } from '../components/CustomerCard';
import { ReviewBoard } from '../components/ReviewBoard';
import { TutorialTooltip } from '../components/TutorialTooltip';
import { UI, SPACING, FONT, RADIUS } from '../constants/theme';

export default function ShopFloorScreen() {
  useGameLoop();

  const { hydrated, isOnboarded } = useOwnerStore();

  // Wait for AsyncStorage load before deciding; redirect to onboarding if new player
  if (!hydrated) return null;
  if (!isOnboarded) return <Redirect href="/onboarding/name" />;

  const { stations, waitingCustomers, isDayActive, startDay, reviews, tutorialComplete } =
    useGameStore();
  const { profile } = useOwnerStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HUD />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shop name */}
        <Text style={styles.shopName}>{profile?.shopName ?? 'Your Salon'}</Text>

        {/* Review board */}
        {reviews.length > 0 && <ReviewBoard reviews={reviews} />}

        {/* Tutorial tooltip */}
        {!tutorialComplete && <TutorialTooltip />}

        {/* Nail stations */}
        <Text style={styles.sectionLabel}>Nail Stations</Text>
        <View style={styles.stationsRow}>
          {stations.map((station) => (
            <StationSlot key={station.id} station={station} />
          ))}
        </View>

        {/* Waiting queue */}
        <Text style={styles.sectionLabel}>
          Waiting Queue ({waitingCustomers.length})
        </Text>
        {waitingCustomers.length === 0 ? (
          <Text style={styles.emptyText}>No customers waiting yet...</Text>
        ) : (
          waitingCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))
        )}

        {/* Start/end day */}
        {!isDayActive && (
          <TouchableOpacity style={styles.openBtn} onPress={startDay}>
            <Text style={styles.openBtnText}>Open Shop 💅</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF3E0' },
  content:   { padding: SPACING.md, paddingBottom: SPACING.xxl },
  shopName: {
    fontSize: FONT.xl,
    fontWeight: '700',
    color: UI.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT.sm,
    fontWeight: '600',
    color: UI.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  stationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT.md,
    color: UI.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  openBtn: {
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  openBtnText: {
    color: UI.btnText,
    fontSize: FONT.lg,
    fontWeight: '700',
  },
});
