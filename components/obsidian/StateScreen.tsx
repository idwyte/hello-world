// Obsidian Kinetic — shared system-state layout (Figma 50:185 Check
// Email · 50:204 Can't Feel It · 50:220 Error · 50:238 Empty).
// Centered: optional 64px icon → mono kicker → 32/36 headline →
// 18/26 muted body → bottom CTA pair. Completely static by design.
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/components/obsidian';
import { color, spacing, type } from '@/lib/obsidian/tokens';

type Props = {
  /** Header chrome; omit onBack to hide the leading icon slot. */
  headerVariant?: 'back' | 'close';
  onBack?: () => void;
  icon?: ReactNode;
  kicker: string;
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  ghostLabel?: string;
  onGhost?: () => void;
};

export function StateScreen({
  headerVariant = 'back',
  onBack,
  icon,
  kicker,
  title,
  body,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  ghostLabel,
  onGhost,
}: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      {onBack ? (
        <ScreenHeader variant={headerVariant} onPress={onBack} />
      ) : (
        <View style={{ height: 56 }} />
      )}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: 32,
          paddingVertical: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackMd,
        }}
      >
        <View style={{ flex: 1 }} />
        {icon}
        <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
          {kicker}
        </Text>
        <Text
          style={{
            ...type.headlineLg,
            color: color.onSurface,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            ...type.bodyLg,
            color: color.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          {body}
        </Text>
        <View style={{ flex: 1 }} />
        <Button
          label={primaryLabel}
          disabled={primaryDisabled}
          onPress={onPrimary}
          style={{ width: '100%' }}
        />
        {ghostLabel && onGhost ? (
          <Button
            label={ghostLabel}
            variant="ghost"
            onPress={onGhost}
            style={{ width: '100%' }}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
