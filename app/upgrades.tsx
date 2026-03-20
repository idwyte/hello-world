import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { UPGRADES } from '../data/upgrades';
import { UI, SPACING, FONT, RADIUS } from '../constants/theme';
import { soundManager } from '../hooks/useSound';

export default function UpgradesScreen() {
  const { money, reputation, purchasedUpgradeIds, purchaseUpgrade, spendMoney, stations,
    unlockService, addStation, upgradeStation } = useGameStore();

  const handleBuy = (upgradeId: string, cost: number, effect: { type: string; value?: string | number }) => {
    if (!spendMoney(cost)) return;
    purchaseUpgrade(upgradeId);
    soundManager.play('upgrade_purchased');

    if (effect.type === 'unlock_nail_art') {
      unlockService('nail_art');
    } else if (effect.type === 'add_station') {
      addStation();
    } else if (effect.type === 'upgrade_chair') {
      // Upgrade the first station not already at the target tier
      const targetTier = typeof effect.value === 'number' ? effect.value : 2;
      const target = stations.find((st) => st.tier < targetTier);
      if (target) upgradeStation(target.id, targetTier);
    }
  };

  const categoryLabels: Record<string, string> = {
    station: 'Stations',
    service: 'Services',
    decor:   'Decor',
    staff:   'Staff',
  };

  const grouped = UPGRADES.reduce<Record<string, typeof UPGRADES>>((acc, u) => {
    if (!acc[u.category]) acc[u.category] = [];
    acc[u.category].push(u);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Upgrades</Text>
        <Text style={styles.balance}>💰 ${money} available</Text>

        {Object.entries(grouped).map(([category, items]) => (
          <View key={category}>
            <Text style={styles.sectionLabel}>{categoryLabels[category] ?? category}</Text>
            {items.map((upgrade) => {
              const isPurchased = purchasedUpgradeIds.includes(upgrade.id);
              const isLocked    = upgrade.requiresReputation !== undefined && reputation < upgrade.requiresReputation;
              const canAfford   = money >= upgrade.cost;

              return (
                <View key={upgrade.id} style={[styles.card, isPurchased && styles.cardPurchased]}>
                  <View style={styles.cardRow}>
                    <Text style={styles.upgradeName}>{upgrade.name}</Text>
                    <Text style={styles.upgradeCost}>
                      {upgrade.cost === 0 ? 'Free' : `$${upgrade.cost}`}
                    </Text>
                  </View>
                  <Text style={styles.upgradeDesc}>{upgrade.description}</Text>

                  {isLocked ? (
                    <Text style={styles.lockedText}>
                      🔒 Requires Rep {upgrade.requiresReputation} (you have {reputation})
                    </Text>
                  ) : isPurchased ? (
                    <Text style={styles.purchasedText}>✓ Purchased</Text>
                  ) : (
                    <TouchableOpacity
                      style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                      onPress={() => canAfford && handleBuy(upgrade.id, upgrade.cost, upgrade.effect)}
                      disabled={!canAfford}
                    >
                      <Text style={styles.buyBtnText}>
                        {canAfford ? 'Buy' : `Need $${upgrade.cost - money} more`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#FAF3E0' },
  content:        { padding: SPACING.md, paddingBottom: SPACING.xxl },
  heading:        { fontSize: FONT.xxl, fontWeight: '700', color: UI.textPrimary, marginBottom: SPACING.xs },
  balance:        { fontSize: FONT.md, color: UI.textSecondary, marginBottom: SPACING.lg },
  sectionLabel: {
    fontSize: FONT.sm,
    fontWeight: '600',
    color: UI.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: UI.panelBorder,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardPurchased: { opacity: 0.6 },
  cardRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  upgradeName:   { fontSize: FONT.md, fontWeight: '600', color: UI.textPrimary },
  upgradeCost:   { fontSize: FONT.md, fontWeight: '700', color: UI.gold },
  upgradeDesc:   { fontSize: FONT.sm, color: UI.textSecondary, marginBottom: SPACING.sm },
  lockedText:    { fontSize: FONT.xs, color: UI.danger },
  purchasedText: { fontSize: FONT.xs, color: UI.success, fontWeight: '600' },
  buyBtn: {
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  buyBtnDisabled: { backgroundColor: UI.btnDisabled },
  buyBtnText:    { color: UI.btnText, fontWeight: '600', fontSize: FONT.sm },
});
