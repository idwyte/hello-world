import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { useOwnerStore } from '../store/ownerStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { HUD } from '../components/HUD';
import { ShopFloorScene } from '../components/ShopFloorScene';
import { UI, SPACING, FONT, RADIUS } from '../constants/theme';

export default function ShopFloorScreen() {
  useGameLoop();

  const { hydrated, isOnboarded } = useOwnerStore();
  const {
    day,
    vipUnlocked, dismissVipUnlock,
    showDayEndModal, setShowDayEndModal, dayEarningsSnapshot,
  } = useGameStore();

  if (!hydrated) return null;
  if (!isOnboarded) return <Redirect href="/onboarding/name" />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HUD />
      <ShopFloorScene />

      {/* VIP unlock toast */}
      <Modal visible={vipUnlocked} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>VIP Clients Unlocked! 💎</Text>
            <Text style={styles.modalBody}>
              Your reputation hit 50!{'\n'}
              VIP clients tip big — but expect perfection.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={dismissVipUnlock}>
              <Text style={styles.modalBtnText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* End-of-day modal */}
      <Modal visible={showDayEndModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Day {day - 1} Complete! 💅</Text>
            <Text style={styles.modalBody}>
              Earnings: ${dayEarningsSnapshot.toFixed(0)}
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setShowDayEndModal(false)}
            >
              <Text style={styles.modalBtnText}>Start Day {day}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.hudBg,
    flexDirection: 'column',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24,16,58,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '65%',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: UI.btnActive,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: FONT.xl,
    fontWeight: '700',
    color: UI.textPrimary,
    letterSpacing: 0.3,
  },
  modalBody: {
    fontSize: FONT.md,
    color: UI.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBtn: {
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    shadowColor: UI.btnActive,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: FONT.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
