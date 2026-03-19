import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { StaffMember } from '../types/GameStateTypes';
import { UI, SPACING, FONT, RADIUS } from '../constants/theme';
import { randomStaffName } from '../data/staffNames';

const MAX_STAFF = 2;

const generateStaffCandidate = (): StaffMember => ({
  id: `staff_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
  name: randomStaffName(),
  skillLevel: Math.floor(Math.random() * 3) + 1,
  mood: 75 + Math.floor(Math.random() * 15),
  assignedStationId: null,
  wage: 30 + Math.floor(Math.random() * 3) * 10,
  isOnBreak: false,
  breakTicksRemaining: 0,
});

export default function StaffScreen() {
  const { staff, stations, hireStaff, updateStaff, money, spendMoney, purchasedUpgradeIds } =
    useGameStore();

  const maxStaff = purchasedUpgradeIds.includes('extra_staff_slot') ? 3 : MAX_STAFF;
  const [candidates] = React.useState(() => [generateStaffCandidate(), generateStaffCandidate()]);

  const handleHire = (candidate: StaffMember) => {
    if (staff.length >= maxStaff) return;
    hireStaff(candidate);
  };

  const handleAssign = (staffId: string, stationId: string) => {
    updateStaff(staffId, { assignedStationId: stationId });
  };

  const handleBreak = (staffId: string) => {
    updateStaff(staffId, { isOnBreak: true, breakTicksRemaining: 30 });
  };

  const moodColor = (mood: number) =>
    mood > 60 ? UI.success : mood > 30 ? UI.warning : UI.danger;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Staff</Text>

        {staff.length === 0 && (
          <Text style={styles.emptyText}>No staff hired yet. Hire someone below!</Text>
        )}

        {staff.map((member) => (
          <View key={member.id} style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={[styles.moodBadge, { color: moodColor(member.mood) }]}>
                Mood {member.mood}%
              </Text>
            </View>
            <Text style={styles.detail}>
              Skill {'★'.repeat(member.skillLevel)}{'☆'.repeat(5 - member.skillLevel)}
            </Text>
            <Text style={styles.detail}>
              Assigned: {member.assignedStationId ?? 'Unassigned'} · Wage: ${member.wage}/day
            </Text>
            <View style={styles.cardActions}>
              {stations.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  style={[styles.actionBtn, member.assignedStationId === st.id && styles.actionBtnActive]}
                  onPress={() => handleAssign(member.id, st.id)}
                >
                  <Text style={styles.actionBtnText}>{st.id.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
              {member.isOnBreak ? (
                <View style={[styles.breakBtn, { opacity: 0.6 }]}>
                  <Text style={styles.actionBtnText}>
                    On Break ({member.breakTicksRemaining}s)
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.breakBtn, member.mood >= 90 && { opacity: 0.4 }]}
                  onPress={() => member.mood < 90 && handleBreak(member.id)}
                >
                  <Text style={styles.actionBtnText}>Give Break</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {staff.length < maxStaff && (
          <>
            <Text style={styles.sectionLabel}>Hire Pool</Text>
            {candidates.map((c) => (
              <View key={c.id} style={styles.card}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.detail}>
                  Skill {'★'.repeat(c.skillLevel)}{'☆'.repeat(5 - c.skillLevel)} · ${c.wage}/day
                </Text>
                <TouchableOpacity style={styles.hireBtn} onPress={() => handleHire(c)}>
                  <Text style={styles.hireBtnText}>Hire</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <Text style={styles.slotInfo}>
          {staff.length}/{maxStaff} staff slots used
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF3E0' },
  content:   { padding: SPACING.md, paddingBottom: SPACING.xxl },
  heading:   { fontSize: FONT.xxl, fontWeight: '700', color: UI.textPrimary, marginBottom: SPACING.lg },
  emptyText: { color: UI.textMuted, fontSize: FONT.md, marginBottom: SPACING.lg },
  card: {
    backgroundColor: UI.panelBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: UI.panelBorder,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  name:      { fontSize: FONT.lg, fontWeight: '600', color: UI.textPrimary },
  moodBadge: { fontSize: FONT.sm, fontWeight: '600' },
  detail:    { fontSize: FONT.sm, color: UI.textSecondary, marginBottom: SPACING.xs },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.sm },
  actionBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: '#E0D4CC',
    borderRadius: RADIUS.sm,
  },
  actionBtnActive: { backgroundColor: UI.btnActive },
  actionBtnText:   { fontSize: FONT.xs, color: UI.textPrimary },
  breakBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: UI.warning,
    borderRadius: RADIUS.sm,
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
  hireBtn: {
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  hireBtnText: { color: UI.btnText, fontWeight: '600' },
  slotInfo: { color: UI.textMuted, fontSize: FONT.sm, textAlign: 'center', marginTop: SPACING.lg },
});
