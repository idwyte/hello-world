import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomerConfig } from '../../types/CustomerTypes';
import { SERVICES } from '../../data/services';
import { UI, FONT, SPACING, RADIUS } from '../../constants/theme';

const EXPRESSION_EMOJI: Record<string, string> = {
  neutral:     '😐',
  happy:       '😊',
  excited:     '😃',
  impatient:   '😤',
  disappointed:'😞',
  delighted:   '😍',
  thinking:    '🤔',
};

interface Props {
  customer: CustomerConfig;
}

export const CustomerHintPanel = ({ customer }: Props) => {
  const service = SERVICES[customer.requestedServiceId];
  const patiencePct = Math.max(0, (customer.patience / customer.maxPatience) * 100);
  const patienceColor =
    patiencePct > 60 ? UI.success :
    patiencePct > 30 ? UI.warning :
    UI.danger;

  return (
    <View style={styles.panel}>
      <View style={styles.left}>
        {/* Clothing color swatch = hidden preference cue */}
        <View style={[styles.colorSwatch, { backgroundColor: customer.clothingTopColor }]} />
        <Text style={styles.expression}>
          {EXPRESSION_EMOJI[customer.expression] ?? '😐'}
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.serviceName}>{service?.name ?? 'Service'}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.patienceLabel}>Patience</Text>
        <View style={styles.patienceBg}>
          <View style={[styles.patienceFill, { width: `${patiencePct}%` as any, backgroundColor: patienceColor }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.hudBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  left:         { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  expression: { fontSize: 22 },
  center:      { flex: 1 },
  name:        { fontSize: FONT.md, fontWeight: '700', color: UI.hudText },
  serviceName: { fontSize: FONT.xs, color: 'rgba(255,240,245,0.65)' },
  right:        { width: 80 },
  patienceLabel:{ fontSize: FONT.xs, color: 'rgba(255,240,245,0.65)', marginBottom: 3 },
  patienceBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  patienceFill: {
    height: 6,
    borderRadius: RADIUS.full,
  },
});
