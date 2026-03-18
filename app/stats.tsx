import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { useOwnerStore } from '../store/ownerStore';
import { UI, SPACING, FONT, RADIUS } from '../constants/theme';

const REP_MILESTONES = [
  { rep: 10,  label: 'Unlock Pedicure' },
  { rep: 15,  label: 'Unlock Nail Art' },
  { rep: 25,  label: 'Unlock Gel Nails' },
  { rep: 40,  label: 'Unlock Full Set Acrylics' },
  { rep: 50,  label: 'Unlock VIP Customers' },
];

export default function StatsScreen() {
  const { money, reputation, day, totalEarnings, dayEarnings, staff } = useGameStore();
  const { profile } = useOwnerStore();

  const nextMilestone = REP_MILESTONES.find((m) => m.rep > reputation);
  const totalWages    = staff.reduce((sum, m) => sum + m.wage, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Stats</Text>

        {/* Reputation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reputation</Text>
          <View style={styles.repBarBg}>
            <View style={[styles.repBarFill, { width: `${reputation}%` }]} />
          </View>
          <Text style={styles.repValue}>{reputation} / 100</Text>
          {nextMilestone && (
            <Text style={styles.milestoneText}>
              Next: {nextMilestone.rep} rep → {nextMilestone.label}
            </Text>
          )}
        </View>

        {/* Today */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today (Day {day})</Text>
          <StatRow label="Earned"    value={`$${dayEarnings}`} positive />
          <StatRow label="Wages"     value={`-$${totalWages}`} />
          <StatRow label="Net"       value={`$${dayEarnings - totalWages}`} positive={dayEarnings > totalWages} />
        </View>

        {/* All-time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>All-time</Text>
          <StatRow label="Total earned" value={`$${totalEarnings}`} positive />
          <StatRow label="Current money" value={`$${money}`} positive />
          <StatRow label="Days open"    value={`${day}`} />
        </View>

        {/* Owner */}
        {profile && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Owner</Text>
            <Text style={styles.ownerName}>{profile.name}</Text>
            <Text style={styles.ownerDetail}>{profile.pronouns} · {profile.ageRange}</Text>
            <Text style={styles.ownerDetail}>Shop: {profile.shopName}</Text>
            <Text style={styles.ownerDetail}>
              Traits: {profile.traits.join(', ').replace(/_/g, ' ')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const StatRow = ({ label, value, positive }: { label: string; value: string; positive?: boolean }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, positive ? styles.positive : null]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FAF3E0' },
  content:     { padding: SPACING.md, paddingBottom: SPACING.xxl },
  heading:     { fontSize: FONT.xxl, fontWeight: '700', color: UI.textPrimary, marginBottom: SPACING.lg },
  card: {
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: UI.panelBorder,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle:   { fontSize: FONT.md, fontWeight: '700', color: UI.textPrimary, marginBottom: SPACING.sm },
  repBarBg:    { height: 12, backgroundColor: '#E0D4CC', borderRadius: RADIUS.full, marginBottom: SPACING.xs },
  repBarFill:  { height: 12, backgroundColor: UI.btnActive, borderRadius: RADIUS.full },
  repValue:    { fontSize: FONT.sm, color: UI.textSecondary, textAlign: 'right' },
  milestoneText: { fontSize: FONT.xs, color: UI.textMuted, marginTop: SPACING.xs },
  statRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  statLabel:   { fontSize: FONT.sm, color: UI.textSecondary },
  statValue:   { fontSize: FONT.sm, fontWeight: '600', color: UI.textPrimary },
  positive:    { color: UI.success },
  ownerName:   { fontSize: FONT.lg, fontWeight: '700', color: UI.textPrimary },
  ownerDetail: { fontSize: FONT.sm, color: UI.textSecondary, marginTop: SPACING.xs },
});
