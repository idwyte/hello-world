import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Station, ActiveService } from '../types/GameStateTypes';
import { useGameStore } from '../store/gameStore';
import { UI, SPACING, FONT, RADIUS } from '../constants/theme';
import { SERVICES } from '../data/services';

interface Props {
  station: Station;
}

export const StationSlot = ({ station }: Props) => {
  const { activeCustomers, staff, activeService, setActiveService, setServicePhase } = useGameStore();

  const customer = activeCustomers.find((c) => c.stationId === station.id);
  const assignedStaff = staff.find((m) => m.assignedStationId === station.id);
  const service = customer ? SERVICES[customer.requestedServiceId] : null;

  const tierLabel = ['Basic', 'Comfort', 'VIP'][station.tier - 1];

  const canDIY = !!customer && !assignedStaff && !activeService;

  const handleDIY = () => {
    if (!customer) return;
    const newService: ActiveService = {
      customerId: customer.id,
      stationId: station.id,
      selectedShape: null,
      selectedColor: null,
      nailArtDesignId: null,
      satisfactionScore: 0,
      isPlayerControlled: true,
    };
    setActiveService(newService);
    setServicePhase('shape_selection');
    router.push('/service');
  };

  return (
    <View style={[styles.slot, customer && styles.slotActive]}>
      <Text style={styles.slotTitle}>
        {station.id.replace('_', ' ').toUpperCase()}
      </Text>
      <Text style={styles.tier}>{tierLabel} Chair</Text>

      {customer ? (
        <>
          <View style={styles.customerPlaceholder}>
            <Text style={styles.customerEmoji}>💅</Text>
          </View>
          <Text style={styles.customerName}>{customer.name}</Text>
          {service && <Text style={styles.serviceName}>{service.name}</Text>}
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${station.serviceProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(station.serviceProgress)}%</Text>

          {canDIY && (
            <TouchableOpacity style={styles.diyBtn} onPress={handleDIY} activeOpacity={0.8}>
              <Text style={styles.diyBtnText}>Do It Yourself 💅</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.emptySlot}>
          <Text style={styles.emptyText}>Empty</Text>
          <Text style={styles.tapHint}>Tap a customer to assign</Text>
        </View>
      )}

      {assignedStaff && (
        <Text style={styles.staffBadge}>👩 {assignedStaff.name}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    minWidth: 140,
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: UI.panelBorder,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  slotActive: {
    borderColor: UI.btnActive,
    borderWidth: 2,
  },
  slotTitle: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: UI.textSecondary,
    letterSpacing: 0.5,
  },
  tier: {
    fontSize: FONT.xs,
    color: UI.textMuted,
    marginBottom: SPACING.xs,
  },
  customerPlaceholder: {
    width: 48,
    height: 64,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F0D5D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  customerEmoji: { fontSize: 28 },
  customerName:  { fontSize: FONT.sm, fontWeight: '600', color: UI.textPrimary },
  serviceName:   { fontSize: FONT.xs, color: UI.textSecondary, marginBottom: SPACING.xs },
  progressBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0D4CC',
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
  },
  progressFill: {
    height: 6,
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.full,
  },
  progressText: { fontSize: FONT.xs, color: UI.textMuted, marginTop: 2 },
  emptySlot:    { alignItems: 'center', paddingVertical: SPACING.md },
  emptyText:    { fontSize: FONT.sm, color: UI.textMuted },
  tapHint:      { fontSize: FONT.xs, color: UI.textMuted, textAlign: 'center', marginTop: SPACING.xs },
  staffBadge:   { fontSize: FONT.xs, color: UI.textSecondary, marginTop: SPACING.xs },
  diyBtn: {
    marginTop: SPACING.sm,
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  diyBtnText: { fontSize: FONT.xs, fontWeight: '700', color: UI.btnText },
});
