import React, { useState, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { ShopBackground } from '../assets/environment/ShopBackground';
import { StationFixture } from '../assets/environment/StationFixture';
import { WaitingArea } from '../assets/environment/WaitingArea';
import { NpcSprite } from './NpcSprite';
import { ReviewBoard } from './ReviewBoard';
import { TutorialTooltip } from './TutorialTooltip';
import {
  buildLayout,
  getStationPositions,
  getWaitingSlotPosition,
  NPC_H,
  MAX_WAITING,
} from '../constants/sceneLayout';
import { UI, SALON, FONT, SPACING, RADIUS } from '../constants/theme';
import { CustomerConfig } from '../types/CustomerTypes';

export const ShopFloorScene = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const layout = buildLayout(width, height, { left: insets.left, right: insets.right });

  const {
    stations,
    waitingCustomers,
    activeCustomers,
    reviews,
    tutorialComplete,
    assignCustomerToStation,
  } = useGameStore();

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerConfig | null>(null);

  const stationPositions = getStationPositions(stations.length, layout);

  const getTarget = useCallback((customer: CustomerConfig) => {
    if (customer.stationId) {
      const idx = stations.findIndex((s) => s.id === customer.stationId);
      const pos = stationPositions[idx];
      if (pos) return { x: pos.x, y: pos.y };
    }
    return getWaitingSlotPosition(customer.waitingSlot ?? 0, layout);
  }, [stations, stationPositions, layout]);

  const handleCustomerTap = useCallback((customer: CustomerConfig) => {
    if (customer.animationState === 'IDLE_WAITING' || customer.animationState === 'WALK_IN') {
      setSelectedCustomer(customer);
    }
  }, []);

  const handleStationSelect = useCallback((stationId: string) => {
    if (!selectedCustomer) return;
    assignCustomerToStation(selectedCustomer.id, stationId);
    setSelectedCustomer(null);
  }, [selectedCustomer, assignCustomerToStation]);

  const availableStations = stations.filter((st) => !st.activeCustomerId);
  const allCustomers = [...waitingCustomers, ...activeCustomers];

  return (
    <View
      style={{
        width: layout.SCENE_W,
        height: layout.SCENE_H,
        overflow: 'hidden',
        backgroundColor: SALON.wallRose,
        marginLeft: insets.left,
      }}
    >
      {/* Layer 0: Background */}
      <ShopBackground width={layout.SCENE_W} height={layout.SCENE_H} />

      {/* Layer 1: Waiting bench */}
      <WaitingArea
        x={layout.WAITING_ZONE.x}
        y={layout.WAITING_ZONE.baseY + NPC_H}
        width={layout.WAITING_ZONE.slotSpacing * MAX_WAITING}
      />

      {/* Layer 2: Station fixtures */}
      {stationPositions.map((pos, i) => (
        <StationFixture
          key={stations[i].id}
          x={pos.fixtureX}
          y={layout.STATION_ZONE.topY - 24}
          fixtureWidth={pos.fixtureW}
          tier={stations[i].tier}
        />
      ))}

      {/* Layer 3: NPC sprites */}
      {allCustomers.map((customer) => {
        const target = getTarget(customer);
        return (
          <NpcSprite
            key={customer.id}
            customer={customer}
            targetX={target.x}
            targetY={target.y}
            onTap={() => handleCustomerTap(customer)}
          />
        );
      })}

      {/* Layer 4: Floating overlays */}
      {reviews.length > 0 && (
        <View style={styles.reviewsOverlay}>
          <ReviewBoard reviews={reviews} />
        </View>
      )}
      {!tutorialComplete && (
        <View style={styles.tutorialOverlay}>
          <TutorialTooltip />
        </View>
      )}

      {/* Station picker modal */}
      <Modal
        visible={!!selectedCustomer}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCustomer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>
              Seat {selectedCustomer?.name} at…
            </Text>
            {availableStations.length === 0 ? (
              <Text style={styles.sheetEmpty}>All stations are occupied!</Text>
            ) : (
              <FlatList
                data={availableStations}
                keyExtractor={(st) => st.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.stationBtn}
                    onPress={() => handleStationSelect(item.id)}
                  >
                    <Text style={styles.stationBtnText}>
                      Station {item.id.replace('station_', '')} — Tier {item.tier}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setSelectedCustomer(null)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewsOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    maxWidth: 220,
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 8,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetCard: {
    backgroundColor: UI.panelBg,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
    maxHeight: '60%',
    shadowColor: UI.btnActive,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  sheetTitle: {
    fontSize: FONT.lg,
    fontWeight: '700',
    color: UI.textPrimary,
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
  sheetEmpty: {
    fontSize: FONT.md,
    color: UI.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  stationBtn: {
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    shadowColor: UI.btnActive,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stationBtnText: {
    color: '#FFFFFF',
    fontSize: FONT.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    marginTop: SPACING.sm,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  cancelBtnText: {
    fontSize: FONT.md,
    color: UI.textMuted,
    fontWeight: '600',
  },
});
